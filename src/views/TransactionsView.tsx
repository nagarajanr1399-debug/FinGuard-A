import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  FileText, 
  Share2, 
  Bot, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { Transaction, PageView, AlertSeverity } from '../types.ts';
import { fetchTransactions } from '../api.ts';

interface TransactionsViewProps {
  onNavigate: (view: PageView) => void;
  onSelectTxn: (txnId: string) => void;
  openCopilotForTxn: (txnId: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onNavigate,
  onSelectTxn,
  openCopilotForTxn,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(25);
  const [executionTime, setExecutionTime] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [channel, setChannel] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const loadData = async (resetOffset = false) => {
    setLoading(true);
    const newOffset = resetOffset ? 0 : offset;
    if (resetOffset) setOffset(0);

    try {
      const res = await fetchTransactions({
        search: search.trim() || undefined,
        severity: severity !== 'ALL' ? severity : undefined,
        channel: channel !== 'ALL' ? channel : undefined,
        status: status !== 'ALL' ? status : undefined,
        limit,
        offset: newOffset,
      });
      setTransactions(res.transactions);
      setTotal(res.total);
      setExecutionTime(res.execution_time_ms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [severity, channel, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(true);
  };

  const getSeverityBadge = (sev?: AlertSeverity, score?: number) => {
    if (!sev) sev = 'LOW';
    if (sev === 'CRITICAL') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {score ?? 85} CRIT
        </span>
      );
    }
    if (sev === 'HIGH') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {score ?? 72} HIGH
        </span>
      );
    }
    if (sev === 'MEDIUM') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          {score ?? 48} MED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
        {score ?? 18} LOW
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Transaction Intelligence Explorer</h2>
          <p className="text-xs text-slate-400">
            Real-time filterable transaction database queryable via Exasol columnar indexes
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          Query Scan Time: <span className="text-cyan-400 font-bold">{executionTime} ms</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Txn ID, Customer, Counterparty, or Bank..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Severity:</span>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (&ge;80)</option>
              <option value="HIGH">High (65-79)</option>
              <option value="MEDIUM">Medium (40-64)</option>
              <option value="LOW">Low (&lt;40)</option>
            </select>
          </div>

          {/* Channel Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Channel:</span>
            <select
              value={channel}
              onChange={e => setChannel(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Channels</option>
              <option value="UPI">UPI</option>
              <option value="IMPS">IMPS</option>
              <option value="RTGS">RTGS</option>
              <option value="NEFT">NEFT</option>
              <option value="CARD">Card</option>
              <option value="SWIFT">SWIFT</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="FLAGGED">Flagged</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="NORMAL">Normal</option>
              <option value="CLEARED">Cleared</option>
              <option value="REPORTED_SAR">Reported SAR</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Table Results */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-3 px-4">TXN ID</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">AMOUNT (INR)</th>
                <th className="py-3 px-4">CHANNEL</th>
                <th className="py-3 px-4">COUNTERPARTY</th>
                <th className="py-3 px-4 text-center">RISK TIER</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">INVESTIGATION ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-mono animate-pulse">
                    Scanning Exasol Columnar Partitions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions matched the selected filter criteria.
                  </td>
                </tr>
              ) : (
                transactions.map(txn => (
                  <tr key={txn.txn_id} className="hover:bg-slate-800/40 transition group">
                    <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                      {txn.txn_id}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(txn.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      <span className="font-mono text-slate-500">
                        {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-300 font-medium">{txn.customer_id}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {txn.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium truncate max-w-[160px]">{txn.counterparty_name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {txn.counterparty_bank} • {txn.counterparty_country}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getSeverityBadge(txn.severity, txn.risk_score)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        txn.status === 'UNDER_INVESTIGATION' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                        txn.status === 'FLAGGED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        txn.status === 'REPORTED_SAR' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          title="Open 360-degree investigation"
                          onClick={() => {
                            onSelectTxn(txn.txn_id);
                            onNavigate('investigation');
                          }}
                          className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Open Entity Graph"
                          onClick={() => {
                            onSelectTxn(txn.txn_id);
                            onNavigate('graph');
                          }}
                          className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Interrogate via Gemini Copilot"
                          onClick={() => openCopilotForTxn(txn.txn_id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                        >
                          <Bot className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{transactions.length > 0 ? offset + 1 : 0}</strong> to{' '}
            <strong className="text-white">{Math.min(offset + limit, total)}</strong> of{' '}
            <strong className="text-white">{total}</strong> total transactions
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={offset === 0}
              onClick={() => {
                const nextOffset = Math.max(0, offset - limit);
                setOffset(nextOffset);
                loadData(false);
              }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={offset + limit >= total}
              onClick={() => {
                const nextOffset = offset + limit;
                setOffset(nextOffset);
                loadData(false);
              }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
