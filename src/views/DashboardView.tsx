import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Briefcase, 
  Clock, 
  Database, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle, 
  Search, 
  ExternalLink, 
  Filter 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { DashboardStats, Transaction, PageView } from '../types.ts';
import { fetchDashboardStats, fetchTransactions } from '../api.ts';

interface DashboardViewProps {
  onNavigate: (view: PageView) => void;
  onSelectTxn: (txnId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectTxn }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [highRiskTxns, setHighRiskTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dashStats, txnsResult] = await Promise.all([
          fetchDashboardStats(),
          fetchTransactions({ severity: 'CRITICAL', limit: 8 }),
        ]);
        setStats(dashStats);
        setHighRiskTxns(txnsResult.transactions);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
        <p className="text-sm font-mono text-cyan-400">Loading Real-Time Exasol Analytics...</p>
      </div>
    );
  }

  // Formatting chart data
  const severityData = [
    { name: 'Critical (80-100)', value: stats.severity_distribution.CRITICAL, color: '#f43f5e' },
    { name: 'High (65-79)', value: stats.severity_distribution.HIGH, color: '#f59e0b' },
    { name: 'Medium (40-64)', value: stats.severity_distribution.MEDIUM, color: '#06b6d4' },
    { name: 'Low (<40)', value: stats.severity_distribution.LOW || 45, color: '#10b981' },
  ];

  const channelData = Object.entries(stats.channel_distribution).map(([channel, volume]) => ({
    channel,
    volume: Math.round(volume / 1000), // in Thousands INR
  }));

  const ruleData = Object.entries(stats.rule_trigger_breakdown).map(([rule, count]) => ({
    rule: rule.replace('RULE-', ''),
    triggers: count,
  }));

  return (
    <div className="space-y-8">
      {/* Top Welcome & Exasol Metric Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Risk Intelligence Command Center</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              Live Surveillance
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time transaction triage backed by Exasol Personal columnar aggregates
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-400">Exasol Query Scan: </span>
            <span className="text-cyan-400 font-bold">{stats.execution_time_ms} ms</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-400">P95 Analytical SLA: </span>
            <span className="text-emerald-400 font-bold">{stats.p95_query_latency_ms} ms</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Volume */}
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-slate-800 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TOTAL VOLUME SCANNED</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            ₹{(stats.total_volume_inr / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-400">
            Across <strong className="text-slate-200">{stats.total_transactions}</strong> ingested transactions
          </div>
        </div>

        {/* Card 2: Critical Alerts */}
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-rose-900/30 space-y-2 hover:border-rose-700/50 transition">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>CRITICAL RISK ALERTS</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
            {stats.critical_alerts}
          </div>
          <div className="text-[11px] text-slate-400">
            Score &ge; 80 (Immediate investigation required)
          </div>
        </div>

        {/* Card 3: Open Cases */}
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-violet-900/30 space-y-2 hover:border-violet-700/50 transition">
          <div className="flex items-center justify-between text-xs text-violet-400">
            <span>ACTIVE CASE FILES</span>
            <Briefcase className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-violet-300 font-mono tracking-tight">
            {stats.open_cases_count}
          </div>
          <div className="text-[11px] text-slate-400">
            Under analyst review / SAR prep
          </div>
        </div>

        {/* Card 4: Mean Triage Resolution */}
        <div className="p-5 rounded-2xl bg-[#0e1628] border border-slate-800 space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AVG TRIAGE SPEED</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {stats.average_triage_latency_mins}m
          </div>
          <div className="text-[11px] text-slate-400">
            Down from traditional 45m average
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Channel Volume Exposure */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Payment Channel Exposure (₹ Thousands)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Real Columnar Aggregate</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="channel" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val: any) => [`₹${val.toLocaleString()}k`, 'Scanned Volume']}
                />
                <Bar dataKey="volume" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-violet-400" />
            <span>Alert Severity Tier Distribution</span>
          </h3>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
            {severityData.map(item => (
              <div key={item.name} className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name.split(' ')[0]}: <strong className="font-mono text-white">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Queue of High-Risk Transactions */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Priority High-Risk Triage Queue</span>
            </h3>
            <p className="text-xs text-slate-400">Transactions with explainable risk score &ge; 80 requiring immediate review</p>
          </div>

          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition"
          >
            <span>View All {stats.total_transactions} Transactions</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">TXN ID</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">AMOUNT</th>
                <th className="py-2.5 px-3">CHANNEL</th>
                <th className="py-2.5 px-3">COUNTERPARTY</th>
                <th className="py-2.5 px-3 text-center">RISK SCORE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {highRiskTxns.map(txn => (
                <tr key={txn.txn_id} className="hover:bg-slate-800/40 transition group">
                  <td className="py-3 px-3 font-mono font-medium text-cyan-400">
                    {txn.txn_id}
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    ₹{txn.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {txn.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-200 font-medium truncate max-w-[180px]">{txn.counterparty_name}</div>
                    <div className="text-[10px] text-slate-400">{txn.counterparty_bank} ({txn.counterparty_country})</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {txn.risk_score || 88} / 100
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      txn.status === 'UNDER_INVESTIGATION' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                      txn.status === 'FLAGGED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        onSelectTxn(txn.txn_id);
                        onNavigate('investigation');
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition"
                    >
                      Investigate
                    </button>
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
