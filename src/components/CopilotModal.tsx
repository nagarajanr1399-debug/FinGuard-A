import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  FileCheck, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight 
} from 'lucide-react';
import { askCopilot } from '../api.ts';
import { CopilotResponse } from '../types.ts';

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTxnId: string | null;
  onSelectTxn: (id: string) => void;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({
  isOpen,
  onClose,
  selectedTxnId,
  onSelectTxn,
}) => {
  const [txnInput, setTxnInput] = useState(selectedTxnId || 'TXN-9004-IN');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CopilotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync if selectedTxnId prop changes
  React.useEffect(() => {
    if (selectedTxnId) {
      setTxnInput(selectedTxnId);
    }
  }, [selectedTxnId]);

  if (!isOpen) return null;

  const handleAsk = async (queryText: string) => {
    if (!txnInput.trim()) {
      setError('Please provide a valid Transaction ID.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await askCopilot(txnInput.trim(), queryText);
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Investigation query failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const promptChips = [
    'Why was this transaction flagged?',
    'Summarize evidence for FIU-IND SAR filing',
    'Identify money mule and smurfing indicators',
    'Compare velocity against customer 30-day baseline',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0c1222] border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 avatar-glow">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Gemini 3.8 Flash Investigation Copilot</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Grounded in Exasol
                </span>
              </div>
              <p className="text-xs text-slate-400">Strict evidence binding with prompt-injection defense</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Transaction Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 whitespace-nowrap">
              <Database className="w-4 h-4" />
              <span>Target Exasol Txn:</span>
            </div>
            <input
              type="text"
              value={txnInput}
              onChange={e => setTxnInput(e.target.value)}
              placeholder="e.g. TXN-9004-IN"
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex space-x-2">
              {['TXN-9004-IN', 'TXN-9005-IN', 'TXN-9011-IN'].map(sample => (
                <button
                  key={sample}
                  onClick={() => { setTxnInput(sample); onSelectTxn(sample); }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">Recommended Investigation Queries:</p>
            <div className="flex flex-wrap gap-2">
              {promptChips.map((chip, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => { setQuestion(chip); handleAsk(chip); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-200 transition flex items-center space-x-1.5 group text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
              <p className="text-sm font-mono text-cyan-400 animate-pulse">
                Extracting Exasol Columnar Evidence &amp; Running Grounded Reasoning...
              </p>
            </div>
          )}

          {/* Copilot Response Panel */}
          {response && !loading && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Query & Timing Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-slate-300 font-medium">Query: "{response.query}"</span>
                <span className="font-mono text-cyan-400">Latency: {response.latency_ms} ms</span>
              </div>

              {/* Grid: Verified Facts & Rule Attribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Verified Database Facts */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                      <Database className="w-4 h-4" />
                      <span>Verified Exasol Facts</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      IMMUTABLE
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Customer:</span>
                      <span className="text-white font-medium">{response.verified_database_facts.customer_name} ({response.verified_database_facts.customer_id})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Transaction Amount:</span>
                      <span className="text-white font-mono font-bold">₹{response.verified_database_facts.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">30-Day Mean:</span>
                      <span className="text-white font-mono">₹{response.verified_database_facts.customer_monthly_mean.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Baseline Deviation:</span>
                      <span className="text-amber-400 font-mono font-bold">{response.verified_database_facts.deviation_multiple}x higher</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">10m Window Velocity:</span>
                      <span className="text-cyan-400 font-mono font-bold">{response.verified_database_facts.velocity_10m} transactions</span>
                    </div>
                  </div>
                </div>

                {/* 2. Rule Attribution */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Deterministic Rule Attribution</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      response.rule_attribution.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      response.rule_attribution.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      SCORE: {response.rule_attribution.score}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    {response.rule_attribution.top_factors.map((factor, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                        <div className="flex justify-between text-slate-200 font-medium">
                          <span>{factor.rule_name}</span>
                          <span className="text-violet-400 font-mono">+{factor.score_added} pts</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{factor.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Compliance & SAR Determination */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-violet-950/40 border border-violet-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="w-5 h-5 text-violet-400" />
                    <h4 className="text-sm font-bold text-white">Compliance Disposition &amp; FIU-IND SAR Verdict</h4>
                  </div>
                  <button
                    onClick={() => copyToClipboard(response.grounded_narrative)}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Evidence' : 'Copy SAR Narrative'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {response.grounded_narrative}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-1.5">Mandated Next Actions:</p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {response.compliance_verdict.immediate_actions.map((act, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (question.trim()) handleAsk(question);
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask Copilot a question about this transaction's risk evidence..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition"
            >
              <span>Investigate</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
