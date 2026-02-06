import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { useMemo, useEffect, useRef, useState } from 'react'

const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee' // 421614

/* -----------------------------
   Account State
-------------------------------- */
export function useAccount() {
    const [{ wallet, connecting }] = useConnectWallet()

    // React Compiler will optimize this automatically, strict dependency array kept for safety
    return useMemo(() => ({
        address: wallet?.accounts[0]?.address,
        isConnected: !!wallet,
        isConnecting: connecting,
        isDisconnected: !wallet,
    }), [wallet, connecting])
}

/* -----------------------------
   Disconnect
-------------------------------- */
export function useDisconnect() {
    const [{ wallet }, , disconnect] = useConnectWallet()

    return {
        disconnect: async () => {
            if (!wallet) return
            localStorage.removeItem('cached_wallet_label')
            await disconnect(wallet)
        },
        isSuccess: false,
        isError: false,
    }
}

/* -----------------------------
   Session Restore + Chain Enforcement
-------------------------------- */
export function useSessionRestore() {
    const [{ wallet, connecting }, connect] = useConnectWallet()
    const [{ connectedChain }, setChain] = useSetChain()

    const [isRestoring, setIsRestoring] = useState(true)
    const hasEnforcedChain = useRef(false)

    // Auto reconnect
    useEffect(() => {
        const label = localStorage.getItem('cached_wallet_label')
        if (!label || wallet) {
            setIsRestoring(false)
            return
        }

        connect({ autoSelect: { label, disableModals: true } })
            .catch(() => localStorage.removeItem('cached_wallet_label'))
            .finally(() => setIsRestoring(false))
    }, [])

    // Save wallet label
    useEffect(() => {
        if (wallet?.label) {
            localStorage.setItem('cached_wallet_label', wallet.label)
        }
    }, [wallet])

    // Enforce chain ONCE per session
    useEffect(() => {
        if (!wallet || !connectedChain || hasEnforcedChain.current) return

        if (connectedChain.id !== ARBITRUM_SEPOLIA_CHAIN_ID) {
            hasEnforcedChain.current = true
            setChain({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID })
        }
    }, [wallet, connectedChain, setChain])

    return { isRestoring: isRestoring || connecting }
}

/* -----------------------------
   Manual Chain Enforcement
-------------------------------- */
export function useChainEnforcement() {
    const [{ connectedChain }, setChain] = useSetChain()

    const enforceArbitrumSepolia = async () => {
        if (connectedChain?.id === ARBITRUM_SEPOLIA_CHAIN_ID) return
        await setChain({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID })
    }

    return { enforceArbitrumSepolia, currentChain: connectedChain }
}

/* -----------------------------
   wagmi-compatible connector client
-------------------------------- */
export function useConnectorClient() {
    const [{ wallet }] = useConnectWallet()
    const [{ connectedChain }] = useSetChain()

    return useMemo(() => ({
        data: wallet && connectedChain ? {
            account: { address: wallet.accounts[0]?.address },
            chain: { id: parseInt(connectedChain.id, 16) },
            transport: wallet.provider,
            getProvider: () => wallet.provider,
        } : undefined,
        isError: false,
        isLoading: false,
    }), [wallet, connectedChain])
}
