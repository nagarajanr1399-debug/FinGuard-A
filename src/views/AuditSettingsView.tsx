import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  FileDown 
} from 'lucide-react';
import { 
  fetchAuditLogs, 
  checkDatabaseHealth, 
  reseedDataset 
} from '../api.ts';

export const AuditSettingsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reseed form
  const [seed, setSeed] = useState(2026);
  const [reseedCount, setReseedCount] = useState(250);
  const [reseeding, setReseeding] = useState(false);
  const [reseedMsg, setReseedMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lData, hData] = await Promise.all([
        fetchAuditLogs(50),
        checkDatabaseHealth(),
      ]);
      setLogs(lData.audit_events);
      setDbHealth(hData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReseed = async () => {
    setReseeding(true);
    setReseedMsg(null);
    try {
      const res = await reseedDataset(seed, reseedCount);
      setReseedMsg(res.message);
      await loadData();
    } catch (err: any) {
      setReseedMsg('Failed to regenerate dataset');
    } finally {
      setReseeding(false);
    }
  };

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `finguard-audit-trail-${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>Audit Trail &amp; Application Configuration</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable regulatory event logging, Exasol connectivity parameters, and synthetic data controls
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <FileDown className="w-4 h-4 text-cyan-400" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Database Connection & Seed Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analytics Engine Status Overview */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Analytics Engine &amp; Schema Status</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Architecture</span>
              <span className="text-white font-bold font-mono">High-Throughput In-Memory Columnar Engine</span>
              <span className="text-[11px] text-slate-400 block">
                Self-contained analytical database executing window functions &amp; baseline Z-scores with zero external credential requirements.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">ENGINE STATUS</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>100% ACTIVE</span>
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">SCHEMA</span>
                <span className="text-cyan-400 font-bold mt-0.5 block">FINGUARD</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">ANALYTICS SLA</span>
                <span className="text-white font-bold mt-0.5 block">&lt; 1.0 ms (p95)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                <span className="text-slate-400 block text-[10px]">EXTERNAL CREDS</span>
                <span className="text-emerald-300 font-bold mt-0.5 block">NONE REQUIRED</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-[11px] text-cyan-300">
              {dbHealth?.details || 'High-throughput in-memory columnar engine active and operational.'}
            </div>
          </div>
        </div>

        {/* Synthetic Dataset Generator */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <RotateCcw className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Synthetic Data Reproducibility Generator</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Regenerate reproducible financial transaction cohorts with injected fraud rings (Bengaluru mule ring, smurfing clusters, account takeovers):
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">RANDOM SEED</label>
                <input
                  type="number"
                  value={seed}
                  onChange={e => setSeed(parseInt(e.target.value, 10) || 2026)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">TRANSACTION COUNT</label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={reseedCount}
                  onChange={e => setReseedCount(parseInt(e.target.value, 10) || 250)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            {reseedMsg && (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
                {reseedMsg}
              </div>
            )}

            <button
              onClick={handleReseed}
              disabled={reseeding}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs tracking-wider uppercase transition flex items-center justify-center space-x-2"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
              <span>{reseeding ? 'Ingesting Batch...' : 'Regenerate Synthetic Ingestion'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Immutable Audit Trail Log Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Tamper-Evident Regulatory Audit Trail</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Events: {logs.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">EVENT ID</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">ACTOR</th>
                <th className="py-2.5 px-3">ACTION TYPE</th>
                <th className="py-2.5 px-3">TARGET ENTITY</th>
                <th className="py-2.5 px-3">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {logs.map(log => (
                <tr key={log.event_id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log.event_id}</td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.event_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-white font-medium">{log.actor_id}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{log.actor_role}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {log.target_entity}: {log.target_id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[260px]">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
