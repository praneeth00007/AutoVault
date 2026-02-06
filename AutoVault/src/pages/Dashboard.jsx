import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileUp, Shield, Cpu, Activity, CheckCircle2,
    AlertCircle, ArrowRight, Loader2, BarChart3,
    Lock, PieChart, TrendingUp, RotateCcw
} from 'lucide-react';
import { useDataProtector } from '../hooks/useDataProtector';
import { validateLoanData, SAMPLE_LOANS } from '../lib/loan_validation';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, PieChart as RePie, Pie
} from 'recharts';
import Papa from 'papaparse';
import CSVEditor from '../components/CSVEditor';

const Dashboard = () => {
    const { isInitialized, address, protectData, grantAccess, processData, fetchResult, checkAndStake } = useDataProtector();

    const [step, setStep] = useState('upload'); // upload, refining, validating, protecting, computing, completed
    const [rawData, setRawData] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [executionStatus, setExecutionStatus] = useState('');
    const [taskId, setTaskId] = useState(null);
    const [finalResult, setFinalResult] = useState(null);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let aggregatedLoans = [];
        let filesProcessed = 0;

        files.forEach(file => {
            const isJson = file.type === "application/json" || file.name.endsWith('.json');
            const isCsv = file.type === "text/csv" || file.name.endsWith('.csv');

            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    if (isJson) {
                        const json = JSON.parse(event.target.result);
                        const loans = Array.isArray(json) ? json : (json.loans || []);
                        aggregatedLoans = [...aggregatedLoans, ...loans];
                    } else if (isCsv) {
                        const csvText = event.target.result;
                        const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                        if (results.data && results.data.length > 0) {
                            const cleanData = results.data.map(row => ({
                                loan_id: row.loan_id || row.LoanID || `CSV_${Math.random().toString(36).substr(2, 9)}`,
                                principal_outstanding: row.principal_outstanding || row.Principal || 0,
                                interest_rate_annual: row.interest_rate_annual || row.InterestRate || 0,
                                remaining_term_months: row.remaining_term_months || row.Term || 0,
                                fico_bucket: row.fico_bucket || row.FICO || 600,
                                vehicle_type: row.vehicle_type || row.VehicleType || 'ICE',
                                payment_status: row.payment_status || row.Status || 'current',
                            }));
                            aggregatedLoans = [...aggregatedLoans, ...cleanData];
                        }
                    }
                } catch (err) {
                    console.error("Error parsing file:", file.name, err);
                }

                filesProcessed++;
                if (filesProcessed === files.length) {
                    if (aggregatedLoans.length > 0) {
                        setRawData(aggregatedLoans);
                        setStep('refining');
                    } else {
                        alert("No valid loan data found in uploaded files.");
                    }
                }
            };

            reader.readAsText(file);
        });
    };

    const handleEditorSave = (refinedData) => {
        setRawData(refinedData);
        setStep('validating');
        // Run validation logic
        setTimeout(() => {
            const result = validateLoanData(refinedData);
            setValidationResult(result);
            if (result.isValid) {
                setStep('ready');
            } else {
                // Should not happen if Editor blocks saving invalid data, but safe fallback
                alert("Data still invalid. Please check errors.");
                setStep('refining');
            }
        }, 500);
    };

    const startConfidentialAnalysis = async () => {
        if (!isInitialized) {
            setExecutionStatus('Waiting for iExec SDK to initialize...');
            return;
        }
        try {
            setStep('protecting');
            setExecutionStatus('Encrypting data with iExec DataProtector...');

            const protectedAddress = await protectData({ loans: validationResult.loans });

            setExecutionStatus('Granting access to TEE Enclave...');
            await grantAccess(protectedAddress);

            setStep('computing');
            setExecutionStatus('Checking RLC Stake...');
            try {
                await checkAndStake();
            } catch (e) {
                console.warn("Stake check failed, continuing:", e);
            }

            setExecutionStatus('Initializing Secure Enclave (Intel SGX)...');

            const { taskId } = await processData(protectedAddress, (status) => {
                setExecutionStatus(`TEE: ${status.title}...`);
            });

            setTaskId(taskId);
            setExecutionStatus('Awaiting TEE computation result...');

            const result = await fetchResult(taskId);

            // PARSE IAPP OUTPUT STRUCTURE
            // The iApp returns { "aggregated_pool_analysis": { ... }, "individual_results": [...] }
            // We prioritize the aggregated view for the dashboard.
            const analysisData = result.aggregated_pool_analysis || result;

            if (!analysisData || !analysisData.pool_summary) {
                throw new Error("Invalid TEE output format: Missing pool analysis.");
            }

            setFinalResult(analysisData);
            setStep('completed');
        } catch (err) {
            console.error(err);
            setExecutionStatus(`Error: ${err.message}`);
            setStep('ready'); // Allow retry
        }
    };

    const FICO_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

    return (
        <div className="pt-32 pb-20 px-6 container mx-auto max-w-6xl selection:bg-amber-500/20">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16"
            >
                <div>
                    <h1 className="text-3xl font-black mb-2 tracking-tight flex items-center gap-3">
                        Secure <span className="text-amber-500">Workspace</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.1em]">Automobile Asset-Backed Analytics</p>
                </div>
                <Link to="/" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRight className="rotate-180" size={14} /> Back to Overview
                </Link>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-12">
                {/* Minimal Progress Sidebar */}
                <div className="lg:col-span-1 border-r border-white/5 pr-8 space-y-1">
                    {[
                        { id: 'upload', label: 'Ingestion' },
                        { id: 'protecting', label: 'Protection' },
                        { id: 'computing', label: 'Analysis' },
                        { id: 'completed', label: 'Final Report' }
                    ].map((s, i) => {
                        const isActive = step === s.id || (step === 'refining' && s.id === 'upload') || (step === 'ready' && s.id === 'upload') || (step === 'validating' && s.id === 'upload');
                        const isDone = ['protecting', 'computing', 'completed'].indexOf(step) > ['upload', 'protecting', 'computing', 'completed'].indexOf(s.id);

                        return (
                            <div key={s.id} className="relative py-4 pl-6 group">
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full transition-all ${isActive ? 'bg-amber-500' : isDone ? 'bg-emerald-500/50' : 'bg-white/5 opacity-0 group-hover:opacity-100'}`} />
                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-amber-400' : isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                                    Step 0{i + 1}
                                </div>
                                <div className={`text-sm font-bold tracking-tight transition-colors ${isActive ? 'text-white' : isDone ? 'text-slate-400' : 'text-slate-700'}`}>
                                    {s.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Workspace Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {step === 'upload' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="border border-dashed border-white/10 rounded-2xl p-16 text-center hover:bg-white/[0.01] hover:border-amber-500/20 transition-all group flex flex-col items-center justify-center min-h-[400px]"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-amber-500/10 transition-all border border-white/5">
                                    <FileUp className="text-amber-500" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 tracking-tight">Ingest Portfolio</h2>
                                <p className="text-slate-500 max-w-sm mx-auto mb-10 text-sm leading-relaxed">
                                    Select CSV or JSON files. All analysis is confidential and occurs within Intel SGX enclaves.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <label className="cursor-pointer">
                                        <span className="btn-primary px-8 py-3 text-[10px] tracking-[0.2em] font-black uppercase">
                                            Select Files
                                        </span>
                                        <input type="file" className="hidden" accept=".json,.csv" multiple onChange={handleFileUpload} />
                                    </label>

                                    <button
                                        onClick={() => { setRawData([]); setStep('refining'); }}
                                        className="bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                    >
                                        Manual Entry
                                    </button>
                                </div>

                                <button
                                    onClick={() => { setRawData(SAMPLE_LOANS); setStep('refining'); }}
                                    className="mt-8 text-[10px] font-black uppercase tracking-widest text-amber-500/60 hover:text-amber-500 transition-colors flex items-center gap-2 group"
                                >
                                    <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                    <span>Or load sample portfolio</span>
                                </button>
                            </motion.div>
                        )}

                        {step === 'refining' && (
                            <CSVEditor
                                rawData={rawData}
                                onSave={handleEditorSave}
                                onCancel={() => setStep('upload')}
                            />
                        )}

                        {step === 'validating' && (
                            <motion.div key="validating" className="border border-white/5 bg-white/[0.02] rounded-2xl p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                                <Loader2 className="animate-spin text-amber-500 mb-8" size={48} />
                                <h2 className="text-2xl font-bold mb-2 tracking-tight">Processing Data</h2>
                                <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Verifying structure...</p>
                            </motion.div>
                        )}

                        {step === 'ready' && (
                            <motion.div key="ready" className="border border-white/5 bg-white/[0.02] rounded-2xl p-12 min-h-[400px] flex flex-col">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight mb-1">Portfolio Ready</h2>
                                        <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Logic Validation Completed</p>
                                    </div>
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                        <CheckCircle2 size={24} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Assets</div>
                                        <div className="text-2xl font-black">{validationResult?.loans.length} Loans</div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
                                        <div className="text-2xl font-black text-emerald-400">CLEAN</div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                        <Shield className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Clicking "Start Secure Analysis" will encrypt your data locally.
                                            Decryption keys are only accessible within a secure Intel SGX enclave.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-12 flex flex-col items-center gap-6">
                                    <button
                                        onClick={startConfidentialAnalysis}
                                        disabled={!isInitialized}
                                        className={`btn-primary w-full py-4 text-xs tracking-[0.2em] font-black uppercase transition-all ${!isInitialized ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]'}`}
                                    >
                                        {isInitialized ? 'Start Secure Analysis' : 'Initializing Secure Layer...'}
                                    </button>
                                    <button onClick={() => setStep('upload')} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                                        Ingest Different Portfolio
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {(step === 'protecting' || step === 'computing') && (
                            <motion.div key="executing" className="border border-white/5 bg-white/[0.02] rounded-2xl p-16 flex flex-col items-center justify-center text-center min-h-[400px]">
                                <div className="w-20 h-20 mb-10 relative">
                                    <div className="absolute inset-0 border-2 border-amber-500/10 rounded-full" />
                                    <div className="absolute inset-0 border-t-2 border-amber-500 rounded-full animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Cpu className="text-amber-500 animate-pulse" size={24} />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold mb-3 tracking-tight">Confidential Analysis Active</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Intel SGX Hardware Enclave Engaged</p>

                                <div className="w-full max-w-sm space-y-4">
                                    <div className="bg-black/50 px-6 py-4 rounded-xl border border-white/5 font-mono text-[10px] text-amber-500/70 tracking-tight overflow-hidden">
                                        {executionStatus}
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: step === 'protecting' ? "40%" : "80%" }}
                                            transition={{ duration: 1 }}
                                            className="h-full bg-amber-500 shadow-[0_0_10px_theme(colors.amber.500)]"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'completed' && finalResult && (
                            <motion.div key="completed" className="space-y-8 pb-12">
                                {/* Result Header */}
                                <div className="border border-emerald-500/20 bg-emerald-500/[0.02] p-10 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Authenticated ABS Report</div>
                                        <h2 className="text-3xl font-black tracking-tighter">POOL ANALYSIS</h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Confidential Task ID</div>
                                        <div className="font-mono text-[10px] text-slate-400">
                                            {taskId ? taskId.slice(0, 16) : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Score Summary Metrics */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Portfolio Principle', value: `$${(finalResult.pool_summary.total_principal_usd / 1000000).toFixed(2)}M` },
                                        { label: 'WAIR (Yield)', value: `${finalResult.pool_summary.weighted_avg_interest_rate}%` },
                                        { label: 'Exp. Loss (Base)', value: `${finalResult.credit_risk.base_expected_loss_pct}%` },
                                        { label: 'Exp. Loss (Stress)', value: `${finalResult.credit_risk.stress_expected_loss_pct}%` },
                                    ].map((m, i) => (
                                        <div key={i} className="border border-white/5 bg-white/[0.02] p-6 rounded-2xl hover:bg-white/[0.04] transition-colors">
                                            <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2 leading-none">{m.label}</div>
                                            <div className="text-2xl font-black text-white">{m.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Area */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="border border-white/5 bg-white/[0.02] p-8 rounded-2xl h-[360px]">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">FICO Distribution</h3>
                                        <ResponsiveContainer width="100%" height="80%">
                                            <BarChart data={Object.entries(finalResult.credit_risk.fico_distribution_count || {}).map(([name, value]) => ({ name, value }))}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                                <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(251, 191, 36, 0.03)' }}
                                                    contentStyle={{ backgroundColor: '#05060b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '10px', padding: '12px' }}
                                                />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                                    {Object.keys(finalResult.credit_risk.fico_distribution_count || {}).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={FICO_COLORS[index % FICO_COLORS.length]} fillOpacity={0.8} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="border border-white/5 bg-white/[0.02] p-8 rounded-2xl h-[360px] relative">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Tranche Recommendations</h3>
                                        <div className="absolute top-8 right-8 text-[10px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                            {finalResult.recommended_tranche_structure.rating_implied}
                                        </div>
                                        <div className="flex items-center h-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RePie>
                                                    <Pie
                                                        data={[
                                                            { name: 'Senior (A)', value: finalResult.recommended_tranche_structure.senior_class_a_pct },
                                                            { name: 'Mezzanine (B)', value: finalResult.recommended_tranche_structure.mezzanine_class_b_pct },
                                                            { name: 'Equity (C)', value: finalResult.recommended_tranche_structure.equity_class_c_pct },
                                                        ]}
                                                        cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={2} dataKey="value" stroke="none"
                                                    >
                                                        <Cell fill="#fbbf24" fillOpacity={0.8} />
                                                        <Cell fill="#3b82f6" fillOpacity={0.8} />
                                                        <Cell fill="#ef4444" fillOpacity={0.8} />
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#05060b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '10px' }}
                                                    />
                                                </RePie>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                                                <div className="text-[10px] uppercase text-slate-600 font-bold tracking-widest">Senior</div>
                                                <div className="text-3xl font-black text-white">{finalResult.recommended_tranche_structure.senior_class_a_pct}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel p-8 bg-gradient-to-r from-amber-500/5 to-transparent border-amber-500/20">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Activity className="text-amber-400" /> Cashflow & Yield Projection (12M)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold mb-2">Projected Principal</p>
                                            <p className="text-2xl font-black text-white">${finalResult.cashflow_projection.projected_annual_principal.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold mb-2">Projected Interest</p>
                                            <p className="text-2xl font-black text-white">${finalResult.cashflow_projection.projected_annual_interest.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold mb-2">Gross Yield</p>
                                            <p className="text-2xl font-black text-white">{finalResult.cashflow_projection.gross_yield_pct}%</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold mb-2">Net Excess Spread</p>
                                            <p className="text-2xl font-black text-emerald-400">+{finalResult.cashflow_projection.net_excess_spread_pct}%</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setStep('upload')} className="btn-secondary w-full">Process Another Portfolio</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
