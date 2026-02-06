import React from 'react';
import { motion } from 'framer-motion';
import { Database, ShieldCheck, Zap, BarChart3, PieChart, Layers } from 'lucide-react';

const Features = () => {
    const features = [
        {
            title: "Confidential Data Ingestion",
            description: "Upload sensitive vehicle loan data using iExec DataProtector. Your raw data never leaves the secure enclave.",
            icon: <Database className="text-amber-400" size={32} />
        },
        {
            title: "TEE-Powered Risk Analysis",
            description: "Automated ABS financial logic runs inside Intel SGX enclaves to compute PD, LGD, and recovery rates privately.",
            icon: <ShieldCheck className="text-amber-400" size={32} />
        },
        {
            title: "Dynamic Tranche Structuring",
            description: "Algorithmically recommend Senior, Mezzanine, and Equity tranches based on real-time stress test loss projections.",
            icon: <Layers className="text-amber-400" size={32} />
        },
        {
            title: "Cashflow Projections",
            description: "Project annual interest and principal repayments with an industry-grade amortization engine.",
            icon: <Zap className="text-amber-400" size={32} />
        },
        {
            title: "FICO-Based Distribution",
            description: "Visualize weighted average FICO scores and geographic concentrations without data leakage.",
            icon: <BarChart3 className="text-amber-400" size={32} />
        },
        {
            title: "On-Chain Yield Pools",
            description: "Tokenize verified results and offer transparent yield pools to institutional and retail investors.",
            icon: <PieChart className="text-amber-400" size={32} />
        }
    ];

    return (
        <section id="features" className="py-32 bg-[#05060b] overflow-hidden relative border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <div className="inline-block mb-6">
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-500/80 border border-amber-500/20 px-4 py-2 rounded-full bg-amber-500/5">
                            How It Works
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter">
                        End-to-End <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">ABS Workflow</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        AutoVault combines iExec's decentralized TEE infrastructure with institutional-grade
                        financial analytics to deliver confidential, verifiable asset-backed securities.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel p-10 group hover:border-amber-500/40 transition-all bg-gradient-to-br from-white/[0.03] to-transparent hover:from-amber-500/[0.05] hover:to-transparent relative overflow-hidden"
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_-5px_theme(colors.amber.500/0.3)] transition-all border border-white/5 group-hover:border-amber-500/30">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black mb-4 text-white group-hover:text-amber-50 transition-colors">{feature.title}</h3>
                                <p className="text-slate-500 group-hover:text-slate-400 leading-relaxed text-sm transition-colors">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
