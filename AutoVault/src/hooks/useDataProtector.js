import { useState, useEffect, useCallback } from "react";
import { useAccount, useConnectorClient } from "./useWeb3Compat";
import { BrowserProvider } from "ethers";
import JSZip from "jszip";
import { IExec, utils } from "iexec";

// iExec app address for the finalized AutoVault ABS iApp
const RESOURCE_APP_ADDRESS = "0x5748CCBf68D8Fde7cE4e83b0d328A9D9e0Ee5514";
const WORKERPOOL_ADDRESS = "0xb967057a21dc6a66a29721d96b8aa7454b7c383f";

export function useDataProtector() {
    const { address, isConnected } = useAccount();
    const { data: client } = useConnectorClient();

    const [dataProtector, setDataProtector] = useState(null);
    const [iexec, setIexec] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize the SDK
    useEffect(() => {
        const initDataProtector = async () => {
            if (!isConnected || !address || !client?.transport) {
                setIsInitialized(false);
                return;
            }

            // Strict Chain Check: Only init on Arbitrum Sepolia
            if (client?.chain?.id !== 421614) {
                console.warn("[AutoVault] SDK initialization blocked: Wrong chain detected.", client?.chain?.id);
                setIsInitialized(false);
                return;
            }

            try {
                const { IExecDataProtector } = await import("@iexec/dataprotector");

                // --- GAS FIX PROXY FOR METAMASK ---
                // This intercepts all transactions and ensures gas parameters are correctly set for Arbitrum Sepolia volatility.
                const ethersProvider = new BrowserProvider(client.transport);
                const gasFixProxy = new Proxy(client.transport, {
                    get(target, prop) {
                        if (prop === 'request') {
                            return async (args) => {
                                if (args.method === 'eth_sendTransaction') {
                                    const tx = args.params[0];
                                    try {
                                        const block = await ethersProvider.getBlock('latest');
                                        const baseFee = block?.baseFeePerGas;

                                        if (baseFee) {
                                            // Ensure maxFeePerGas >= maxPriorityFeePerGas + baseFee
                                            // Set priority fee to 0.1 gwei
                                            const priorityFee = 100000000n;
                                            // Set max fee to 2x base fee + priority fee to be extremely safe
                                            const maxFee = (baseFee * 2n) + priorityFee;

                                            tx.maxFeePerGas = "0x" + maxFee.toString(16);
                                            tx.maxPriorityFeePerGas = "0x" + priorityFee.toString(16);

                                            console.log('[GasFix] Optimization applied (EIP-1559):', {
                                                baseFee: baseFee.toString(),
                                                priorityFee: priorityFee.toString(),
                                                maxFee: maxFee.toString()
                                            });
                                        } else {
                                            const gasPrice = await ethersProvider.send('eth_gasPrice', []);
                                            tx.gasPrice = "0x" + ((BigInt(gasPrice) * 120n) / 100n).toString(16);
                                            console.log('[GasFix] Optimization applied (Legacy):', tx.gasPrice);
                                        }
                                    } catch (e) {
                                        console.warn('[GasFix] Fee optimization skipped:', e);
                                    }
                                }
                                return target.request(args);
                            };
                        }
                        // SAFE BINDING FIX: Ensure methods are bound to original target
                        const value = target[prop];
                        return typeof value === 'function' ? value.bind(target) : value;
                    }
                });

                const dp = new IExecDataProtector(gasFixProxy);
                const iexecInstance = new IExec({ ethProvider: gasFixProxy });

                setDataProtector(dp);
                setIexec(iexecInstance);
                setIsInitialized(true);
                console.log("[AutoVault] iExec SDK Initialized with Gas Fixes");
            } catch (error) {
                console.error("[AutoVault] iExec Initialization failed:", error);
                setIsInitialized(false);
            }
        };

        initDataProtector();
    }, [isConnected, address, client]);

    const protectData = useCallback(async (data, name) => {
        if (!dataProtector) throw new Error("DataProtector not initialized");
        console.log('[AutoVault] Protecting Asset Data...');

        // CRITICAL FIX: The key must be 'content' and contain no dots or special characters 
        // that trigger the "Unsupported special character in key" error in DataProtector SDK.
        const protectedData = await dataProtector.core.protectData({
            name: name || `AutoVault_Asset_${Date.now()}`,
            data: {
                content: new TextEncoder().encode(JSON.stringify(data)),
            },
        });
        console.log(`[AutoVault] Data Protected at: ${protectedData.address}`);
        return protectedData.address;
    }, [dataProtector]);

    const grantAccess = useCallback(async (protectedDataAddress) => {
        if (!dataProtector) throw new Error("DataProtector not initialized");
        console.log('[AutoVault] Granting Access to iApp...');

        const result = await dataProtector.core.grantAccess({
            protectedData: protectedDataAddress,
            authorizedApp: RESOURCE_APP_ADDRESS,
            authorizedUser: address,
            pricePerAccess: 0,
            numberOfAccess: 99,
        });
        return result.txHash || "granted";
    }, [dataProtector, address]);

    const processData = useCallback(async (protectedDataAddress, onStatusUpdate) => {
        if (!dataProtector) throw new Error("DataProtector not initialized");
        console.log('[AutoVault] Starting TEE Analysis Deal...');

        const result = await dataProtector.core.processProtectedData({
            protectedData: protectedDataAddress,
            app: RESOURCE_APP_ADDRESS,
            workerpool: WORKERPOOL_ADDRESS,
            category: 0,
            workerpoolMaxPrice: 100000000,
            appMaxPrice: 100000000,
            path: "result.json",
            onStatusUpdate: (status) => {
                if (onStatusUpdate) onStatusUpdate(status);
            }
        });
        return result;
    }, [dataProtector]);

    const fetchResult = useCallback(async (taskId) => {
        if (!dataProtector) throw new Error("DataProtector not initialized");

        const { result } = await dataProtector.core.getResultFromCompletedTask({
            taskId,
        });

        const zip = await JSZip.loadAsync(result);
        const resultJson = await zip.file('result.json')?.async('string') || await zip.file('data/result.json')?.async('string');

        if (!resultJson) throw new Error("Result file not found in enclave output");
        return JSON.parse(resultJson);
    }, [dataProtector]);

    const checkAndStake = useCallback(async (requiredNRLC = 200000000) => {
        if (!iexec) throw new Error("IExec SDK not initialized");
        if (!address) throw new Error("Wallet not connected");

        console.log('[AutoVault] Checking RLC Stake...');
        const balance = await iexec.account.checkBalance(address);
        const stake = balance.stake;

        if (new utils.BN(stake).lt(new utils.BN(requiredNRLC))) {
            const depositAmount = "500000000"; // 0.5 RLC
            const { amount, txHash } = await iexec.account.deposit(depositAmount);
            return { staked: true, balance: amount, txHash };
        }

        return { staked: false, balance: stake.toString() };
    }, [iexec, address]);

    return {
        isInitialized,
        address,
        protectData,
        grantAccess,
        processData,
        fetchResult,
        checkAndStake,
    };
}
