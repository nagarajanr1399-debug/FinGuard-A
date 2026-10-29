import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  FileCheck, 
  Copy, 
  Check, 
  ArrowRight, 
  Code, 
  AlertCircle 
} from 'lucide-react';
import { askCopilot } from '../api.ts';
import { CopilotResponse, PageView } from '../types.ts';

interface CopilotViewProps {
  selectedTxnId: string | null;
  onSelectTxn: (id: string) => void;
  onNavigate: (view: PageView) => void;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  selectedTxnId,
  onSelectTxn,
  onNavigate,
}) => {
  const [txnInput, setTxnInput] = useState(selectedTxnId || 'TXN-9004-IN');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CopilotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleTxns = [
    { id: 'TXN-9004-IN', desc: 'Bengaluru Mule Ring Funnel Outflow (₹1.49M to Dubai)' },
    { id: 'TXN-9005-IN', desc: 'Structuring / Smurfing Burst (₹48,500 Sub-threshold UPI)' },
    { id: 'TXN-9011-IN', desc: 'Dormant Account Takeover (₹185k Revived IMPS)' },
    { id: 'TXN-9013-IN', desc: 'Impossible Geo Jump (Mumbai -> London in 22 mins)' },
  ];

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
      setError(err.message || 'Copilot query failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 avatar-glow flex-shrink-0">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Gemini 3.8 Flash Investigation Copilot</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Evidence-Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Zero hallucination risk: Reasoning strictly grounded in Exasol facts with prompt injection defense
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          <span>Engine Model: </span>
          <strong className="text-cyan-400">gemini-3.8-flash</strong>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Chat & Evidence Briefing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Txn Selector & Presets */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <span className="text-xs font-mono text-slate-300 whitespace-nowrap">Target Transaction:</span>
              <input
                type="text"
                value={txnInput}
                onChange={e => setTxnInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleAsk(question || 'Why was this transaction flagged?')}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
              >
                Analyze
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Representative Fraud Scenarios:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleTxns.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setTxnInput(sample.id);
                      onSelectTxn(sample.id);
                      handleAsk('Why was this transaction flagged?');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col ${
                      txnInput === sample.id
                        ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold">{sample.id}</span>
                    <span className="text-[11px] text-slate-400 truncate">{sample.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-20 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
              <p className="text-xs font-mono text-cyan-400 animate-pulse">
                Consulting Gemini 3.8 Flash with Exasol Columnar Facts...
              </p>
            </div>
          )}

          {/* Copilot Response Dossier */}
          {response && !loading && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-medium text-slate-300 font-mono">
                  Grounded Evidence Response (Latency: {response.latency_ms} ms)
                </span>
                <button
                  onClick={() => copyToClipboard(response.grounded_narrative)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy SAR Briefing'}</span>
                </button>
              </div>

              {/* Narrative Content */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {response.grounded_narrative}
              </div>

              {/* Compliance Next Steps */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-violet-950/40 border border-violet-800/30 space-y-2">
                <div className="flex items-center space-x-2 text-violet-400 font-bold text-xs">
                  <FileCheck className="w-4 h-4" />
                  <span>Mandated Compliance Investigation Next Actions:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {response.compliance_verdict.immediate_actions.map((act, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Inquiry Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              if (question.trim()) handleAsk(question);
            }}
            className="flex items-center space-x-3 p-2 rounded-2xl bg-slate-900 border border-slate-800"
          >
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Type your forensic inquiry (e.g. 'Summarize evidence for FIU-IND SAR')..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-cyan-500/20"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Col: Verified Facts & Grounding Architecture */}
        <div className="space-y-6">
          {/* Grounded Architecture Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase text-cyan-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Prompt-Injection Defense</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Untrusted user strings (transaction descriptions, customer memos) are strictly sanitized and sandboxed as plain text. The Gemini model is bound only to approved Exasol JSON records.
            </p>
          </div>

          {/* Verified Database Facts Box */}
          {response && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verified Exasol Facts</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">UNALTERED</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Txn Amount:</span>
                  <span className="text-white font-mono font-bold">₹{response.verified_database_facts.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Customer Mean:</span>
                  <span className="text-white font-mono">₹{response.verified_database_facts.customer_monthly_mean.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Deviation:</span>
                  <span className="text-amber-400 font-mono font-bold">{response.verified_database_facts.deviation_multiple}x higher</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">10m Velocity:</span>
                  <span className="text-cyan-400 font-mono font-bold">{response.verified_database_facts.velocity_10m} events</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectTxn(txnInput);
                  onNavigate('investigation');
                }}
                className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                Inspect in 360° View
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
