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
                        <div className="flex flex-col items-center mb-12">
                            <div className="flex items-center justify-center gap-2">
                                <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50"></span>
                                <span className="text-amber-500 text-[10px] font-black tracking-[0.3em] uppercase">
                                    Powered by Intel SGX • iExec Network
                                </span>
                                <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50"></span>
                            </div>
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-10 tracking-tighter leading-[0.9] text-white">
                            Institutional-Grade <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                                ABS Analytics
                            </span> <br />
                            <span className="text-slate-600 text-5xl md:text-6xl lg:text-7xl">inside TEE.</span>
                        </h1>

                        <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-14 font-medium leading-relaxed">
                            Transform vehicle loan portfolios into verifiable asset-backed securities.
                            <br className="hidden md:block" />
                            <span className="text-slate-500">Confidential TEE computation • Zero-knowledge guarantees • On-chain verification</span>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-28">
                            <button
                                onClick={isConnected ? onEnterDashboard : handleConnect}
                                className="btn-primary min-w-[260px] py-5 text-[10px] tracking-[0.25em] font-black uppercase shadow-[0_0_40px_-5px_theme(colors.amber.500/0.4)] hover:shadow-[0_0_60px_-10px_theme(colors.amber.500/0.6)] hover:scale-105 transition-all duration-300"
                            >
                                {isConnected ? '→ Enter Workspace' : '→ Start Analysis'}
                            </button>
                            <a
                                href="#features"
                                className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-2 group px-6 py-5"
                            >
                                Learn How It Works
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Minimal Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden max-w-5xl mx-auto"
                >
                    {[
                        { label: 'Execution', value: 'Intel SGX', highlight: true },
                        { label: 'Data Safety', value: 'Zero Exposure', highlight: false },
                        { label: 'Verification', value: 'On-Chain', highlight: false },
                        { label: 'Asset Class', value: 'Auto Loans', highlight: true },
                    ].map((stat, i) => (
                        <div key={i} className={`bg-[#05060b] p-8 text-center hover:bg-white/[0.02] transition-all group ${stat.highlight ? 'border-l border-amber-500/10' : ''}`}>
                            <div className={`text-[10px] font-black tracking-[0.25em] uppercase mb-3 transition-colors ${stat.highlight ? 'text-amber-500/80 group-hover:text-amber-400' : 'text-slate-600 group-hover:text-slate-500'}`}>{stat.label}</div>
                            <div className="text-xl font-black text-white tracking-tight">{stat.value}</div>
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
