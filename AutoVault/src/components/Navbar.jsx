import React, { useState, useEffect } from 'react';
import { Menu, X, Vault, ChevronRight } from 'lucide-react';
import { useAccount } from '../hooks/useWeb3Compat';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
// Main Landing Page Navbar - Automated Refinement Phase
const Navbar = ({ onEnterDashboard }) => {
    const { isConnected } = useAccount();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleConnect = async () => {
        if (window.onboard) {
            await window.onboard.connectWallet();
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4 bg-black/60 backdrop-blur-2xl border-b border-white/5' : 'py-8 bg-transparent'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                        <Vault className="text-black" size={22} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase gold-gradient-text">AutoVault</span>
                </Link>

                {/* Desktop Nav Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/analytics" className="text-[11px] font-black uppercase tracking-[.2em] text-slate-400 hover:text-white transition-colors">ABS Analytics</Link>

                    <div className="w-px h-5 bg-white/10 mx-2" />

                    {isConnected ? (
                        <button onClick={onEnterDashboard} className="btn-primary">
                            Workspace <ChevronRight size={14} />
                        </button>
                    ) : (
                        <button onClick={handleConnect} className="btn-primary">
                            Connect Wallet
                        </button>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col gap-6 p-8">
                            <Link to="/analytics" className="text-sm font-black uppercase tracking-widest text-slate-400" onClick={() => setMobileMenuOpen(false)}>ABS Analytics</Link>
                            <div className="h-px bg-white/5" />
                            {isConnected ? (
                                <button onClick={() => { onEnterDashboard(); setMobileMenuOpen(false); }} className="btn-primary w-full justify-center">
                                    Open Workspace
                                </button>
                            ) : (
                                <button onClick={() => { handleConnect(); setMobileMenuOpen(false); }} className="btn-primary w-full justify-center">
                                    Connect Wallet
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
