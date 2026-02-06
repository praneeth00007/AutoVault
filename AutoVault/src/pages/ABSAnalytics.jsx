import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart3, Clock, Shield, ExternalLink, Trash2, FileText, TrendingUp, ArrowLeft
} from 'lucide-react';

const ABSAnalytics = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        try {
            const data = JSON.parse(localStorage.getItem('abs_analytics_history') || '[]');
            setHistory(data);
        } catch (e) {
            console.error('Failed to load history:', e);
            setHistory([]);
        }
    };

    const viewAnalysis = (record) => {
        navigate('/results', {
            state: {
                runId: record.runId,
                finalResult: record.finalResult,
                rawResult: record.rawResult,
                taskId: record.taskId,
                validationResult: record.validationResult
            }
        });
    };

    const deleteAnalysis = (runId) => {
        const updated = history.filter(r => r.runId !== runId);
        localStorage.setItem('abs_analytics_history', JSON.stringify(updated));
        setHistory(updated);
    };

    const clearAll = () => {
        if (window.confirm('Are you sure you want to delete all analysis history?')) {
            localStorage.removeItem('abs_analytics_history');
            setHistory([]);
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-[#05060b] text-white pt-24 pb-20 px-6">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-6">
                            <img
                                src="/Logo.png"
                                alt="AutoVault Logo"
                                className="h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                            />
                            <div>
                                <h1 className="text-4xl font-black tracking-tight mb-2">
                                    ABS <span className="text-amber-500">Analytics</span>
                                </h1>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Analysis History</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn-primary px-6 py-3"
                            >
                                New Analysis
                            </button>
                            {history.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="btn-secondary px-6 py-3 flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border border-white/5 bg-white/[0.02] p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 size={20} className="text-amber-500" />
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Total Analyses</div>
                            </div>
                            <div className="text-3xl font-black text-white">{history.length}</div>
                        </div>
                        <div className="border border-white/5 bg-white/[0.02] p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield size={20} className="text-emerald-500" />
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">TEE Verified</div>
                            </div>
                            <div className="text-3xl font-black text-emerald-400">{history.filter(r => r.taskId).length}</div>
                        </div>
                        <div className="border border-white/5 bg-white/[0.02] p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock size={20} className="text-blue-500" />
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Latest Run</div>
                            </div>
                            <div className="text-sm font-bold text-white truncate">
                                {history.length > 0 ? formatDate(history[0].timestamp).split(',')[0] : 'No runs yet'}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Analysis List */}
                {history.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border border-white/5 bg-white/[0.02] rounded-2xl p-20 text-center"
                    >
                        <BarChart3 size={64} className="mx-auto mb-6 text-slate-700" />
                        <h3 className="text-xl font-black text-white mb-2">No Analyses Yet</h3>
                        <p className="text-slate-500 text-sm mb-8">Start your first confidential ABS analysis to see results here.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-primary"
                        >
                            Create First Analysis
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {history.map((record, index) => (
                            <motion.div
                                key={record.runId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border border-white/5 bg-white/[0.02] rounded-2xl p-6 hover:border-amber-500/20 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                                                <FileText size={20} className="text-amber-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">Analysis #{history.length - index}</div>
                                                <div className="text-[10px] text-slate-600 font-mono">{record.runId}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Loan Count</div>
                                                <div className="text-lg font-black text-white">{record.finalResult?.pool_summary?.loan_count || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Principal</div>
                                                <div className="text-lg font-black text-white">
                                                    ${((record.finalResult?.pool_summary?.total_principal_usd || 0) / 1000).toFixed(0)}K
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Rating</div>
                                                <div className="text-sm font-black text-emerald-400">
                                                    {record.finalResult?.recommended_tranche_structure?.rating_implied || 'N/A'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Confidence</div>
                                                <div className="text-sm font-black text-amber-400">{record.confidence}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-[10px] text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {formatDate(record.timestamp)}
                                            </div>
                                            {record.taskId && (
                                                <a
                                                    href={`https://explorer.iex.ec/arbitrum-sepolia-testnet/task/${record.taskId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Shield size={12} />
                                                    Verify on iExec
                                                    <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => viewAnalysis(record)}
                                            className="btn-primary text-[10px] px-6 py-2"
                                        >
                                            View Report
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteAnalysis(record.runId);
                                            }}
                                            className="p-2 rounded-lg border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 transition-colors"
                                        >
                                            <Trash2 size={16} className="text-slate-600 hover:text-red-500 transition-colors" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ABSAnalytics;
