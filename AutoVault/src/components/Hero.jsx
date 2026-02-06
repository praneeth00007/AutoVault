import React from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Cpu, Lock } from 'lucide-react';

const Hero = ({ onEnterDashboard, handleConnect, isConnected }) => {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
            {/* Minimal Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <span className="h-px w-8 bg-amber-500/50"></span>
                            <span className="text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase">
                                Powered by iExec Confidential Computing
                            </span>
                            <span className="h-px w-8 bg-amber-500/50"></span>
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-none text-white">
                            Automobile <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                                Asset-Backed
                            </span> <br />
                            <span className="text-slate-500">Securities.</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 font-medium leading-relaxed">
                            AutoVault transforms vehicle data into high-yield trustless securities.
                            Confidential analysis, on-chain verification, and premium liquidity.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
                            <button
                                onClick={isConnected ? onEnterDashboard : handleConnect}
                                className="btn-primary min-w-[240px] py-4 text-[10px] tracking-[0.2em] font-black uppercase shadow-[0_0_30px_-5px_theme(colors.amber.500/0.3)] hover:shadow-[0_0_50px_-10px_theme(colors.amber.500/0.5)] transition-all"
                            >
                                {isConnected ? 'Enter Dashboard' : 'Connect Wallet'}
                            </button>
                            <button className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 hover:text-white transition-colors flex items-center gap-2 group">
                                Explore Yield Pools
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Minimal Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden max-w-4xl mx-auto"
                >
                    {[
                        { label: 'Security', value: 'TEE / SCONE' },
                        { label: 'Privacy', value: 'Zero Exposition' },
                        { label: 'Verifiable', value: '100% On-Chain' },
                        { label: 'Asset Class', value: 'Auto-Loans' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#05060b] p-8 text-center hover:bg-white/[0.02] transition-colors group">
                            <div className="text-xs text-slate-500 font-bold tracking-[0.2em] uppercase mb-2 group-hover:text-amber-400 transition-colors">{stat.label}</div>
                            <div className="text-xl font-bold text-white tracking-tight">{stat.value}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Scanlines / Noise Texture for Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />
        </section>
    );
};

export default Hero;
