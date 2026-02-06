import React from 'react';
import { useAccount, useChainEnforcement } from '../hooks/useWeb3Compat';
import { Shield, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee';

const ChainGuard = ({ children }) => {
    const { isConnected } = useAccount();
    const { currentChain, enforceArbitrumSepolia } = useChainEnforcement();

    const isWrongChain = isConnected && currentChain?.id !== ARBITRUM_SEPOLIA_CHAIN_ID;

    if (!isConnected) return children;

    return (
        <>
            <AnimatePresence>
                {isWrongChain && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05060b]/90 backdrop-blur-md"
                    >
                        <div className="max-w-md w-full mx-6">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="glass-panel p-10 border-amber-500/20 text-center relative overflow-hidden"
                            >
                                {/* Background Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

                                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
                                    <Shield className="text-amber-500" size={32} />
                                </div>

                                <h2 className="text-2xl font-black text-white mb-4 tracking-tight">Switch Network Required</h2>
                                <p className="text-slate-400 mb-10 leading-relaxed text-sm">
                                    AutoVault operates exclusively on the <span className="text-white font-bold">Arbitrum Sepolia Testnet</span> to ensure secure TEE execution and low-cost transactions.
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={enforceArbitrumSepolia}
                                        className="btn-primary w-full py-4 flex items-center justify-center gap-3 group"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Switch to Arbitrum Sepolia</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                                        Signature Required in Wallet
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 text-center"
                            >
                                <div className="flex items-center justify-center gap-4 text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Secure Layer</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Intel SGX</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">TEE Attested</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {!isWrongChain && children}
        </>
    );
};

export default ChainGuard;