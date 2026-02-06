import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Shield, Activity, LogOut, Vault, Cpu } from 'lucide-react';
import { useAccount, useDisconnect } from '../hooks/useWeb3Compat';
import { Link } from 'react-router-dom';

const Sidebar = ({ currentView, setView }) => {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'protection', label: 'Protection', icon: Shield },
        { id: 'analytics', label: 'ABS Analytics', icon: Activity },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#05060b] border-r border-white/5 flex flex-col z-20 overflow-hidden">
            {/* Logo Section */}
            <Link
                to="/"
                className="p-8 border-b border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Vault className="text-black" size={24} />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase gold-gradient-text">AutoVault</span>
            </Link>

            {/* Navigation Section */}
            <nav className="flex-1 p-6 space-y-2">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black uppercase text-[10px] tracking-[0.2em] group relative ${isActive ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`${isActive ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`} size={18} />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-indicator"
                                    className="absolute left-0 top-3 bottom-3 w-1 bg-amber-500 rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Session Section */}
            <div className="p-6 border-t border-white/5 space-y-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-amber-500">
                        <Cpu size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-400 truncate tracking-tight uppercase">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x00...000'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">SGX ACTIVE</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => disconnect()}
                    className="w-full flex items-center justify-center gap-3 text-[10px] font-black uppercase text-slate-500 py-3 hover:text-red-400 transition-colors tracking-widest"
                >
                    <LogOut size={16} /> Terminate Session
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
