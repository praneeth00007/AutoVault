import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, AlertCircle, X, Check, Save, Upload, Plus, Trash2, RotateCcw } from 'lucide-react';
import { validateLoanData, SAMPLE_LOANS } from '../lib/loan_validation';

const CSVEditor = ({ rawData, onSave, onCancel }) => {
    const [loans, setLoans] = useState(rawData && rawData.length > 0 ? rawData : []);
    const [filter, setFilter] = useState('all');
    const handleLoadSamples = () => {
        setLoans(SAMPLE_LOANS);
    };

    // Memoize validation state including the row-based error map
    const validationState = useMemo(() => {
        const result = validateLoanData(loans);

        // Parse row-specific errors
        const rowErrors = [];
        const rowWarnings = [];

        result.errors.forEach(e => {
            const match = e.match(/^Row (\d+):/);
            if (match) {
                const rowId = parseInt(match[1]) - 1;
                if (!rowErrors[rowId]) rowErrors[rowId] = [];
                rowErrors[rowId].push(e.replace(`Row ${match[1]}: `, ''));
            }
        });

        result.warnings.forEach(w => {
            const match = w.match(/^Row (\d+):/);
            if (match) {
                const rowId = parseInt(match[1]) - 1;
                if (!rowWarnings[rowId]) rowWarnings[rowId] = [];
                rowWarnings[rowId].push(w.replace(`Row ${match[1]}: `, ''));
            }
        });

        return { ...result, rowErrors, rowWarnings };
    }, [loans]);

    const handleCellChange = (index, field, value) => {
        const updated = [...loans];
        updated[index] = { ...updated[index], [field]: value };
        setLoans(updated);
    };

    const handleDeleteRow = (index) => {
        const updated = [...loans];
        updated.splice(index, 1);
        setLoans(updated);
    };

    const handleAddRow = () => {
        setLoans([...loans, {
            loan_id: `L_${Date.now()}`,
            origination_date: new Date().toISOString().split('T')[0],
            principal_outstanding: 0,
            interest_rate_annual: 0,
            remaining_term_months: 0,
            fico_bucket: 700,
            ltv: 75.0,
            dti: 25.0,
            vehicle_type: 'ICE',
            vehicle_age_years: 0,
            payment_status: 'current'
        }]);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#05060b] text-white p-6 selection:bg-amber-500/20"
        >
            {/* Minimal Header */}
            <div className="flex items-center justify-between mb-8 border border-white/5 bg-white/[0.02] p-6 rounded-2xl">
                <div className="flex items-center gap-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight mb-1">Data Refinement</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Portfolio Pre-Analysis Phase</p>
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-2" />

                    <div className="flex gap-3">
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${validationState.errors.length === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                            {validationState.errors.length} Critical Issues
                        </div>
                        <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            {validationState.warnings.length} Warnings
                        </div>
                        <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/5 text-slate-500">
                            {loans.length} Total Records
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button>
                    <button
                        onClick={() => onSave(loans)}
                        className={`btn-primary px-8 py-2.5 text-[10px] tracking-[0.2em] font-black uppercase ${validationState.errors.length > 0 ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                        disabled={validationState.errors.length > 0}
                    >
                        Confirm & Analyze
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 text-xs">
                    <button onClick={handleAddRow} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors uppercase font-black tracking-widest text-[9px]">
                        <Plus size={14} /> Add Record
                    </button>
                    <button onClick={handleLoadSamples} className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-500/20 transition-colors uppercase font-black tracking-widest text-[9px]">
                        <RotateCcw size={14} /> Load Samples
                    </button>
                    <button onClick={() => setLoans([])} className="bg-red-500/5 border border-red-500/10 text-red-500/50 hover:text-red-500 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors uppercase font-black tracking-widest text-[9px]">
                        <Trash2 size={14} /> Clear All
                    </button>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    {['all', 'error', 'valid'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Grid */}
            <div className="flex-1 overflow-auto bg-black/40 border border-white/10 rounded-xl relative">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-[#0c0e18] sticky top-0 z-10 shadow-lg">
                        <tr>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase">Ln</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase">Status</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase">Loan ID</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase">Orig. Date</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase">Principal ($)</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase text-right">Rate (%)</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase text-right">Term (m)</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase text-right">FICO</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase text-right">LTV (%)</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase text-right">DTI (%)</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase text-right">Age (y)</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase">Payment Status</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase">Type</th>
                            <th className="p-3 border-b border-white/10 text-slate-500 font-mono text-[9px] uppercase text-center">X</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map((row, idx) => {
                            const errors = validationState.rowErrors?.[idx] || [];
                            const warnings = validationState.rowWarnings?.[idx] || [];

                            if (filter === 'error' && errors.length === 0) return null;

                            return (
                                <tr key={idx} className={`border-b border-white/5 hover:bg-white/[0.02] ${errors.length > 0 ? 'bg-red-500/5' : ''}`}>
                                    <td className="p-3 font-mono text-slate-600">{idx + 1}</td>
                                    <td className="p-3">
                                        {errors.length > 0 ? (
                                            <div className="group relative">
                                                <AlertCircle size={16} className="text-red-500" />
                                                <div className="absolute left-6 top-0 w-64 bg-red-900/90 text-white text-xs p-2 rounded z-20 hidden group-hover:block backdrop-blur-md border border-red-500/50">
                                                    {errors.map((e, i) => <div key={i}>• {e}</div>)}
                                                </div>
                                            </div>
                                        ) : warnings.length > 0 ? (
                                            <div className="group relative">
                                                <AlertCircle size={16} className="text-amber-500" />
                                                <div className="absolute left-6 top-0 w-64 bg-amber-900/90 text-white text-xs p-2 rounded z-20 hidden group-hover:block backdrop-blur-md border border-amber-500/50">
                                                    {warnings.map((w, i) => <div key={i}>• {w}</div>)}
                                                </div>
                                            </div>
                                        ) : (
                                            <Check size={16} className="text-emerald-500/50" />
                                        )}
                                    </td>
                                    <td className="p-2">
                                        <input
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-full text-white outline-none"
                                            value={row.loan_id}
                                            onChange={(e) => handleCellChange(idx, 'loan_id', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="date"
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-full text-white outline-none font-mono text-xs"
                                            value={row.origination_date}
                                            onChange={(e) => handleCellChange(idx, 'origination_date', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-28 text-right outline-none font-mono"
                                            value={row.principal_outstanding}
                                            onChange={(e) => handleCellChange(idx, 'principal_outstanding', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-16 text-right outline-none font-mono"
                                            value={row.interest_rate_annual}
                                            onChange={(e) => handleCellChange(idx, 'interest_rate_annual', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-16 text-right outline-none font-mono"
                                            value={row.remaining_term_months}
                                            onChange={(e) => handleCellChange(idx, 'remaining_term_months', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-16 text-right outline-none font-mono"
                                            value={row.fico_bucket}
                                            onChange={(e) => handleCellChange(idx, 'fico_bucket', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-16 text-right outline-none font-mono"
                                            value={row.ltv}
                                            onChange={(e) => handleCellChange(idx, 'ltv', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-16 text-right outline-none font-mono"
                                            value={row.dti}
                                            onChange={(e) => handleCellChange(idx, 'dti', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-16 text-right outline-none font-mono"
                                            value={row.vehicle_age_years}
                                            onChange={(e) => handleCellChange(idx, 'vehicle_age_years', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 text-xs">
                                        <select
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-full outline-none text-slate-300"
                                            value={row.payment_status}
                                            onChange={(e) => handleCellChange(idx, 'payment_status', e.target.value)}
                                        >
                                            <option value="current">Current</option>
                                            <option value="30dpd">30 DPD</option>
                                            <option value="60dpd">60 DPD</option>
                                            <option value="90+dpd">90+ DPD</option>
                                            <option value="default">Default</option>
                                        </select>
                                    </td>
                                    <td className="p-2 text-xs">
                                        <select
                                            className="bg-transparent border border-transparent focus:border-amber-500/50 rounded px-2 w-full outline-none text-slate-300"
                                            value={row.vehicle_type}
                                            onChange={(e) => handleCellChange(idx, 'vehicle_type', e.target.value)}
                                        >
                                            <option value="ICE">ICE</option>
                                            <option value="EV">EV</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => handleDeleteRow(idx)} className="text-slate-600 hover:text-red-500 transition-colors p-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default CSVEditor;
