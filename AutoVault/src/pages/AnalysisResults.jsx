import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield, Lock, CheckCircle2, TrendingUp, Activity,
    BarChart3, PieChart, Download, ArrowLeft, ExternalLink
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, PieChart as RePie, Pie
} from 'recharts';
import JSZip from 'jszip';

const AnalysisResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { finalResult, rawResult, taskId, validationResult } = location.state || {};

    if (!finalResult) {
        navigate('/dashboard');
        return null;
    }

    // Derive delinquency percentages (privacy-safe)
    const totalPrincipal = finalResult.pool_summary.total_principal_usd;
    const delinqUSD = finalResult.credit_risk.delinquency_breakdown_usd;
    const currentPct = ((delinqUSD.current / totalPrincipal) * 100).toFixed(1);
    const delinquentPct = (((delinqUSD['30dpd'] + delinqUSD['60dpd'] + delinqUSD['90+dpd']) / totalPrincipal) * 100).toFixed(1);
    const defaultPct = ((delinqUSD.default / totalPrincipal) * 100).toFixed(1);

    // FICO Gauge Band
    const avgFico = finalResult.credit_risk.weighted_avg_fico;
    const getFicoBand = (fico) => {
        if (fico >= 740) return { label: 'Super-prime', color: '#10b981', range: '740+' };
        if (fico >= 700) return { label: 'Prime', color: '#3b82f6', range: '700-739' };
        if (fico >= 660) return { label: 'Near-prime', color: '#f59e0b', range: '660-699' };
        return { label: 'Subprime', color: '#ef4444', range: '600-659' };
    };
    const ficoBand = getFicoBand(avgFico);

    const downloadAnalysisPackage = async () => {
        const zip = new JSZip();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Derive delinquency percentages
        const totalPrincipal = finalResult.pool_summary.total_principal_usd;
        const delinqUSD = finalResult.credit_risk.delinquency_breakdown_usd;
        const currentPct = parseFloat(((delinqUSD.current / totalPrincipal) * 100).toFixed(1));
        const delinquentPct = parseFloat((((delinqUSD['30dpd'] + delinqUSD['60dpd'] + delinqUSD['90+dpd']) / totalPrincipal) * 100).toFixed(1));
        const defaultPct = parseFloat(((delinqUSD.default / totalPrincipal) * 100).toFixed(1));

        // 1. pool_summary.json
        const poolSummary = {
            loan_count: finalResult.pool_summary.loan_count,
            total_principal_usd: finalResult.pool_summary.total_principal_usd,
            weighted_avg_interest_rate: finalResult.pool_summary.weighted_avg_interest_rate,
            weighted_avg_remaining_term_months: finalResult.pool_summary.weighted_avg_remaining_term_months,
            weighted_avg_life_years: finalResult.pool_summary.weighted_avg_life_years
        };
        zip.file("pool_summary.json", JSON.stringify(poolSummary, null, 2));

        // 2. risk_analysis.json
        const riskAnalysis = {
            weighted_avg_fico: finalResult.credit_risk.weighted_avg_fico,
            base_expected_loss_pct: finalResult.credit_risk.base_expected_loss_pct,
            stress_expected_loss_pct: finalResult.credit_risk.stress_expected_loss_pct,
            delinquency_health: {
                current_pct: currentPct,
                delinquent_pct: delinquentPct,
                default_pct: defaultPct
            }
        };
        zip.file("risk_analysis.json", JSON.stringify(riskAnalysis, null, 2));

        // 3. cashflow_and_tranches.json
        const cashflowAndTranches = {
            cashflow_projection: {
                projected_annual_principal: finalResult.cashflow_projection.projected_annual_principal,
                projected_annual_interest: finalResult.cashflow_projection.projected_annual_interest,
                gross_yield_pct: finalResult.cashflow_projection.gross_yield_pct
            },
            tranche_structure: {
                senior_class_a_pct: finalResult.recommended_tranche_structure.senior_class_a_pct,
                mezzanine_class_b_pct: finalResult.recommended_tranche_structure.mezzanine_class_b_pct,
                equity_class_c_pct: finalResult.recommended_tranche_structure.equity_class_c_pct,
                rating_implied: finalResult.recommended_tranche_structure.rating_implied
            }
        };
        zip.file("cashflow_and_tranches.json", JSON.stringify(cashflowAndTranches, null, 2));

        // 4. execution_proof.json
        const executionProof = {
            execution_environment: "iExec TEE",
            raw_loan_data_exposed: false,
            verifiable_task: true,
            confidence: rawResult?.confidence || "MEDIUM",
            task_id: taskId || null,
            chain: "arbitrum-sepolia"
        };
        zip.file("execution_proof.json", JSON.stringify(executionProof, null, 2));

        // Generate and Download
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_export_${timestamp}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <img
                                src="/Logo.png"
                                alt="AutoVault Logo"
                                className="h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                            />
                            <div>
                                <h1 className="text-4xl font-black tracking-tight mb-2">
                                    ABS Portfolio <span className="text-amber-500">Analysis</span>
                                </h1>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Confidential Structured Finance Report</p>
                            </div>
                        </div>
                        <button
                            onClick={downloadAnalysisPackage}
                            className="btn-primary px-8 py-3 flex items-center gap-3 group"
                        >
                            <Download size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Export Package</span>
                        </button>
                    </div>
                </motion.div>

                <div className="space-y-8">
                    {/* 1️⃣ Pool Overview — KPI Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                            <BarChart3 size={16} className="text-amber-500" />
                            Pool Overview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Loan Count', value: finalResult.pool_summary.loan_count, unit: 'Assets' },
                                { label: 'Total Principal', value: `$${(finalResult.pool_summary.total_principal_usd / 1000).toFixed(0)}K`, unit: 'USD' },
                                { label: 'WAIR (Yield)', value: `${finalResult.pool_summary.weighted_avg_interest_rate}%`, unit: 'APR' },
                                { label: 'Avg Term', value: `${finalResult.pool_summary.weighted_avg_remaining_term_months.toFixed(0)}`, unit: 'Months' }
                            ].map((kpi, i) => (
                                <div key={i} className="border border-white/5 bg-white/[0.02] p-8 rounded-2xl hover:border-amber-500/20 transition-all group">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">{kpi.label}</div>
                                    <div className="text-4xl font-black text-white mb-1">{kpi.value}</div>
                                    <div className="text-[9px] text-slate-700 uppercase tracking-wider">{kpi.unit}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 2️⃣ Credit Quality — FICO Gauge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="border border-white/5 bg-white/[0.02] rounded-2xl p-8"
                    >
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
                            <TrendingUp size={16} className="text-amber-500" />
                            Credit Quality
                        </h2>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="flex-1 text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">Weighted Avg FICO</div>
                                <div className="text-7xl font-black mb-4" style={{ color: ficoBand.color }}>{avgFico}</div>
                                <div className="inline-block px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest" style={{ backgroundColor: `${ficoBand.color}20`, color: ficoBand.color, borderColor: `${ficoBand.color}40`, borderWidth: '1px' }}>
                                    {ficoBand.label}
                                </div>
                            </div>
                            <div className="flex-1 space-y-3 w-full max-w-md">
                                {[
                                    { range: '740+', label: 'Super-prime', color: '#10b981' },
                                    { range: '700-739', label: 'Prime', color: '#3b82f6' },
                                    { range: '660-699', label: 'Near-prime', color: '#f59e0b' },
                                    { range: '600-659', label: 'Subprime', color: '#ef4444' }
                                ].map((band, i) => {
                                    const isActive = band.range === ficoBand.range;
                                    return (
                                        <div key={i} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isActive ? 'bg-white/5 border border-white/10' : 'opacity-40'}`}>
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: band.color }}></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-white">{band.label}</div>
                                                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{band.range}</div>
                                            </div>
                                            {isActive && <CheckCircle2 size={16} className="text-emerald-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* 3️⃣ Expected Loss — Stress Comparison */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="border border-white/5 bg-white/[0.02] rounded-2xl p-8"
                    >
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
                            <Activity size={16} className="text-amber-500" />
                            Expected Loss Analysis
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={[
                                { scenario: 'Base Case', loss: finalResult.credit_risk.base_expected_loss_pct },
                                { scenario: 'Stress Case', loss: finalResult.credit_risk.stress_expected_loss_pct }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="scenario" stroke="#475569" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis stroke="#475569" fontSize={12} axisLine={false} tickLine={false} label={{ value: 'Expected Loss %', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 10, fontWeight: 'bold' } }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(251, 191, 36, 0.03)' }}
                                    contentStyle={{ backgroundColor: '#05060b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px', padding: '12px' }}
                                />
                                <Bar dataKey="loss" radius={[8, 8, 0, 0]} barSize={100}>
                                    <Cell fill="#10b981" fillOpacity={0.8} />
                                    <Cell fill="#ef4444" fillOpacity={0.8} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Row: Delinquency + Cashflow */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 4️⃣ Delinquency Health — Donut Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="border border-white/5 bg-white/[0.02] rounded-2xl p-8"
                        >
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
                                <PieChart size={16} className="text-amber-500" />
                                Portfolio Health
                            </h2>
                            <div className="relative h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePie>
                                        <Pie
                                            data={[
                                                { name: 'Current', value: parseFloat(currentPct) },
                                                { name: 'Delinquent', value: parseFloat(delinquentPct) },
                                                { name: 'Default', value: parseFloat(defaultPct) }
                                            ]}
                                            cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value" stroke="none"
                                        >
                                            <Cell fill="#10b981" fillOpacity={0.8} />
                                            <Cell fill="#f59e0b" fillOpacity={0.8} />
                                            <Cell fill="#ef4444" fillOpacity={0.8} />
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => `${value}%`}
                                            contentStyle={{ backgroundColor: '#05060b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '11px' }}
                                        />
                                    </RePie>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="text-[10px] uppercase text-slate-600 font-bold tracking-widest leading-none mb-1">Current</div>
                                    <div className="text-4xl font-black text-emerald-500 leading-none">{currentPct}%</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                {[
                                    { label: 'Current', value: currentPct, color: '#10b981' },
                                    { label: 'Delinquent', value: delinquentPct, color: '#f59e0b' },
                                    { label: 'Default', value: defaultPct, color: '#ef4444' }
                                ].map((item, i) => (
                                    <div key={i} className="text-center">
                                        <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: item.color }}></div>
                                        <div className="text-xs font-bold text-white">{item.value}%</div>
                                        <div className="text-[9px] text-slate-600 uppercase tracking-wider">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* 5️⃣ Cashflow & Yield */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="border border-white/5 bg-white/[0.02] rounded-2xl p-8"
                        >
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
                                <Activity size={16} className="text-amber-500" />
                                Cashflow & Yield
                            </h2>
                            {/* Yield KPI */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-6 mb-8">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Gross Yield</div>
                                <div className="text-5xl font-black text-amber-400">{finalResult.cashflow_projection.gross_yield_pct}%</div>
                                <div className="text-[9px] text-slate-600 uppercase tracking-wider mt-1">Annual Percentage Rate</div>
                            </div>
                            {/* Cashflow Bars */}
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={[
                                    { type: 'Principal', amount: finalResult.cashflow_projection.projected_annual_principal },
                                    { type: 'Interest', amount: finalResult.cashflow_projection.projected_annual_interest }
                                ]} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis type="number" stroke="#475569" fontSize={10} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`} />
                                    <YAxis type="category" dataKey="type" stroke="#475569" fontSize={11} width={80} />
                                    <Tooltip
                                        formatter={(val) => `$${val.toLocaleString()}`}
                                        contentStyle={{ backgroundColor: '#05060b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '11px' }}
                                    />
                                    <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={30}>
                                        <Cell fill="#3b82f6" fillOpacity={0.8} />
                                        <Cell fill="#10b981" fillOpacity={0.8} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* 6️⃣ Tranche Structure — Stacked Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="border border-white/5 bg-white/[0.02] rounded-2xl p-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                                <BarChart3 size={16} className="text-amber-500" />
                                Tranche Structure
                            </h2>
                            <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                    {finalResult.recommended_tranche_structure.rating_implied}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {/* Stacked Bar */}
                            <div className="h-20 flex rounded-xl overflow-hidden">
                                <div
                                    className="flex items-center justify-center text-sm font-black text-white transition-all hover:brightness-110"
                                    style={{
                                        width: `${finalResult.recommended_tranche_structure.senior_class_a_pct}%`,
                                        backgroundColor: '#fbbf24'
                                    }}
                                >
                                    {finalResult.recommended_tranche_structure.senior_class_a_pct}%
                                </div>
                                <div
                                    className="flex items-center justify-center text-sm font-black text-white transition-all hover:brightness-110"
                                    style={{
                                        width: `${finalResult.recommended_tranche_structure.mezzanine_class_b_pct}%`,
                                        backgroundColor: '#3b82f6'
                                    }}
                                >
                                    {finalResult.recommended_tranche_structure.mezzanine_class_b_pct}%
                                </div>
                                <div
                                    className="flex items-center justify-center text-sm font-black text-white transition-all hover:brightness-110"
                                    style={{
                                        width: `${finalResult.recommended_tranche_structure.equity_class_c_pct}%`,
                                        backgroundColor: '#ef4444'
                                    }}
                                >
                                    {finalResult.recommended_tranche_structure.equity_class_c_pct}%
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { name: 'Class A (Senior)', pct: finalResult.recommended_tranche_structure.senior_class_a_pct, color: '#fbbf24', rating: finalResult.recommended_tranche_structure.rating_implied },
                                    { name: 'Class B (Mezz)', pct: finalResult.recommended_tranche_structure.mezzanine_class_b_pct, color: '#3b82f6', rating: '' },
                                    { name: 'Class C (Equity)', pct: finalResult.recommended_tranche_structure.equity_class_c_pct, color: '#ef4444', rating: 'NR' }
                                ].map((tranche, i) => (
                                    <div key={i} className="border border-white/5 bg-white/[0.01] p-4 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tranche.color }}></div>
                                            <div className="text-xs font-bold text-white">{tranche.name}</div>
                                        </div>
                                        <div className="text-2xl font-black text-white">{tranche.pct}%</div>
                                        {tranche.rating && <div className="text-[9px] text-slate-600 uppercase tracking-wider mt-1">{tranche.rating}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* 7️⃣ Privacy & Verifiability — Trust Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-2xl p-8"
                    >
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
                            <Shield size={16} className="text-emerald-500" />
                            Privacy & Verifiability
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                {[
                                    { icon: CheckCircle2, text: 'Computed inside iExec TEE', verified: true },
                                    { icon: Lock, text: 'Raw loan data never exposed', verified: true },
                                    { icon: Shield, text: 'Result verifiable on-chain', verified: true }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                        <item.icon size={20} className="text-emerald-500 shrink-0" />
                                        <span className="text-sm font-bold text-white">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Confidence Level</div>
                                    <div className="text-2xl font-black text-amber-400">{rawResult?.confidence || 'MEDIUM'}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Task ID</div>
                                    <a
                                        href={`https://explorer.iex.ec/arbitrum-sepolia-testnet/task/${taskId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-mono text-amber-400 hover:text-amber-300 transition-colors group"
                                    >
                                        <span className="truncate">{taskId?.slice(0, 20)}...</span>
                                        <ExternalLink size={14} className="shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                </div>
                                {rawResult?.individual_results?.[0]?.dataset_name && (
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Dataset ID</div>
                                        <a
                                            href={`https://explorer.iex.ec/arbitrum-sepolia-testnet/dataset/${rawResult.individual_results[0].dataset_name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm font-mono text-amber-400 hover:text-amber-300 transition-colors group"
                                        >
                                            <span className="truncate">{rawResult.individual_results[0].dataset_name.slice(0, 20)}...</span>
                                            <ExternalLink size={14} className="shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary flex-1 py-4 text-[10px] font-black uppercase tracking-widest"
                        >
                            Process Another Portfolio
                        </button>
                        <button
                            onClick={downloadAnalysisPackage}
                            className="btn-primary flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 border-emerald-500 shadow-emerald-500/20"
                        >
                            Export Audit-Ready Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResults;
