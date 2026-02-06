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
        <section id="protection" className="py-24 bg-[#05060b] overflow-hidden relative border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">
                        Institutional Grade <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Asset Protection</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Built on top of iExec's decentralized infrastructure, AutoVault ensures
                        enterprise-level confidentiality for the next generation of car finance.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel p-8 group hover:border-amber-500/30 transition-all bg-white/[0.02]"
                        >
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/10 transition-all border border-white/5 group-hover:border-amber-500/20">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
