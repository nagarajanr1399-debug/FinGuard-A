import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  UserCheck, 
  Activity, 
  Sliders, 
  Code, 
  Bot, 
  Share2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';
import { 
  fetchTransactionDetails, 
  rescoreTransaction, 
  createCase 
} from '../api.ts';
import { PageView } from '../types.ts';

interface InvestigationViewProps {
  selectedTxnId: string | null;
  onSelectTxn: (id: string) => void;
  onNavigate: (view: PageView) => void;
  openCopilotForTxn: (id: string) => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  selectedTxnId,
  onSelectTxn,
  onNavigate,
  openCopilotForTxn,
}) => {
  const txnId = selectedTxnId || 'TXN-9004-IN';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // What-if simulator state
  const [simAmount, setSimAmount] = useState<number>(0);
  const [simIsNewBeneficiary, setSimIsNewBeneficiary] = useState<boolean>(false);
  const [simCountry, setSimCountry] = useState<string>('IND');
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  // Case creation state
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [caseNote, setCaseNote] = useState('');
  const [caseCreatedSuccess, setCaseCreatedSuccess] = useState(false);

  // SQL inspect toggle
  const [showSqlModal, setShowSqlModal] = useState(false);

  const loadDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const details = await fetchTransactionDetails(id);
      setData(details);
      setSimAmount(details.transaction.amount);
      setSimIsNewBeneficiary(details.transaction.is_new_beneficiary);
      setSimCountry(details.transaction.counterparty_country);
      setCaseTitle(`Investigation: Flagged Transfer ${details.transaction.txn_id} to ${details.transaction.counterparty_name}`);
      setSimResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails(txnId);
  }, [txnId]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await rescoreTransaction(txnId, {
        amount: simAmount,
        is_new_beneficiary: simIsNewBeneficiary,
        counterparty_country: simCountry,
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleCreateCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim()) return;
    try {
      await createCase({
        title: caseTitle,
        priority: (data?.transaction?.severity === 'CRITICAL' ? 'P1_CRITICAL' : 'P2_HIGH'),
        primaryTxnId: txnId,
        initialNote: caseNote.trim() || undefined,
      });
      setCaseCreatedSuccess(true);
      setTimeout(() => {
        setIsCaseModalOpen(false);
        setCaseCreatedSuccess(false);
        onNavigate('cases');
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
        <p className="text-sm font-mono text-cyan-400">Fetching Customer 30-Day Baselines &amp; Feature Vector...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Transaction Record Not Found</h3>
        <p className="text-xs text-rose-300">{error || 'Unable to retrieve details.'}</p>
        <button
          onClick={() => loadDetails('TXN-9004-IN')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white"
        >
          Load Default Case (TXN-9004-IN)
        </button>
      </div>
    );
  }

  const { transaction: txn, customer, alert, risk_features: feat, recent_history } = data;
  const activeScore = simResult ? simResult.final_score : (txn.risk_score || 85);
  const activeSeverity = simResult ? simResult.severity : (txn.severity || 'CRITICAL');
  const activeContributions = simResult ? simResult.factor_contributions : (alert ? alert.rule_contributions : []);

  return (
    <div className="space-y-8">
      {/* Investigation Action Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c1324] border border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold font-mono text-white">{txn.txn_id}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeSeverity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
              activeSeverity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}>
              SCORE: {activeScore} / 100 ({activeSeverity})
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Scan: {data.execution_time_ms} ms
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transferred ₹<strong>{txn.amount.toLocaleString()}</strong> to <strong>{txn.counterparty_name}</strong> ({txn.counterparty_bank}, {txn.counterparty_country})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-violet-500/20 transition"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open Case File</span>
          </button>
          <button
            onClick={() => openCopilotForTxn(txn.txn_id)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 transition avatar-glow"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-200" />
            <span>Consult Copilot</span>
          </button>
          <button
            onClick={() => {
              onSelectTxn(txn.txn_id);
              onNavigate('graph');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-violet-400" />
            <span>View Graph</span>
          </button>
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 text-xs font-mono transition"
            title="Inspect Exasol SQL Query"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customer Profile & Explainable Risk Waterfall */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Baseline Comparison Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Customer Historical Baseline Profile</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Segment: {customer?.segment || 'RETAIL'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Customer Name</span>
                <span className="text-white font-semibold">{customer?.full_name}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{customer?.customer_id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">30-Day Mean Amount</span>
                <span className="text-white font-bold font-mono">₹{customer?.avg_txn_amount.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block font-mono">&plusmn; ₹{customer?.std_dev_amount.toFixed(0)} std</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Current Multiple</span>
                <span className="text-amber-400 font-bold font-mono">
                  {feat?.baseline_deviation_ratio}x Mean
                </span>
                <span className="text-[10px] text-slate-400 block">Z-Score &ge; 3.0</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Rolling 10m Velocity</span>
                <span className="text-cyan-400 font-bold font-mono">{feat?.rolling_10m_count} Transactions</span>
                <span className="text-[10px] text-slate-400 block">{feat?.rolling_1h_count} in 1 hour</span>
              </div>
            </div>
          </div>

          {/* Explainable Risk Factors Waterfall */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-violet-400" />
                  <span>Transparent Risk Score Attribution Waterfall</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Non-overlapping deterministic points adding up to the final triage score
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">Model: v2.6.1-exasol</span>
            </div>

            <div className="space-y-3">
              {activeContributions.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  No anomalous risk factors triggered. Transaction conforms to customer historical baseline.
                </div>
              ) : (
                activeContributions.map((factor: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-white">{factor.rule_id}</span>
                          <span className="text-xs text-slate-200 font-semibold">• {factor.rule_name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                            {factor.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{factor.description}</p>
                      </div>
                      <span className="text-sm font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
                        +{factor.score_contribution} pts
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 font-mono">
                      <span>Measured: <strong className="text-white">{factor.measured_value}</strong></span>
                      <span>Threshold: <strong className="text-slate-300">{factor.threshold_applied}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Counterfactual What-If Simulator */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0e172a] border border-cyan-800/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Sliders className="w-4 h-4" />
                <span>Counterfactual What-If Simulator</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                LIVE EXPERIMENT
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Test how modifying transaction attributes alters the deterministic risk score:
            </p>

            {/* Slider 1: Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Hypothetical Amount:</span>
                <span className="text-white font-mono font-bold">₹{simAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={500}
                max={600000}
                step={500}
                value={simAmount}
                onChange={e => setSimAmount(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>₹500</span>
                <span>₹300k</span>
                <span>₹600k</span>
              </div>
            </div>

            {/* Beneficiary Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-300">First-Time Beneficiary:</span>
              <button
                onClick={() => setSimIsNewBeneficiary(!simIsNewBeneficiary)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition ${
                  simIsNewBeneficiary ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {simIsNewBeneficiary ? 'YES (NEW)' : 'NO (KNOWN)'}
              </button>
            </div>

            {/* Jurisdiction Dropdown */}
            <div className="space-y-1 text-xs">
              <span className="text-slate-400">Counterparty Jurisdiction:</span>
              <select
                value={simCountry}
                onChange={e => setSimCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="IND">India (Domestic - IND)</option>
                <option value="ARE">United Arab Emirates (ARE)</option>
                <option value="SGP">Singapore (SGP)</option>
                <option value="GBR">United Kingdom (GBR)</option>
                <option value="CHE">Switzerland (CHE)</option>
              </select>
            </div>

            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs tracking-wider uppercase transition flex items-center justify-center space-x-2"
            >
              {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              <span>Recalculate Risk Score</span>
            </button>

            {simResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/50 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Simulated Score:</span>
                  <span className="text-base font-mono font-bold text-cyan-400">
                    {simResult.final_score} / 100 ({simResult.severity})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {simResult.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case Creation Modal */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1222] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Formal Investigation Case File</h3>
            <p className="text-xs text-slate-400">
              Initiates an auditable investigation workflow with immutable timeline tracking.
            </p>

            <form onSubmit={handleCreateCaseSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Case Title</label>
                <input
                  type="text"
                  value={caseTitle}
                  onChange={e => setCaseTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Initial Analyst Notes</label>
                <textarea
                  value={caseNote}
                  onChange={e => setCaseNote(e.target.value)}
                  placeholder="Record preliminary hypothesis, linked accounts, or KYC verification flags..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              {caseCreatedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Case created successfully. Routing to Case Management...</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SQL Query Inspector Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0c1222] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Code className="w-4 h-4" />
                <span>Exasol Parameterized Query Inspector</span>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-400">
              The exact analytical SQL query executed against Exasol Columnar Database to evaluate baseline deviations:
            </p>
            <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
{`-- Exasol High-Throughput Baseline Query
SELECT 
    t.TXN_ID,
    t.AMOUNT,
    c.AVG_TXN_AMOUNT,
    c.STD_DEV_AMOUNT,
    ROUND((t.AMOUNT - c.AVG_TXN_AMOUNT) / NULLIF(c.STD_DEV_AMOUNT, 0), 2) AS Z_SCORE,
    COUNT(*) OVER (
        PARTITION BY t.CUSTOMER_ID 
        ORDER BY t.TIMESTAMP 
        RANGE BETWEEN INTERVAL '10' MINUTE PRECEDING AND CURRENT ROW
    ) AS ROLLING_10M_VELOCITY
FROM FINGUARD.TRANSACTIONS t
JOIN FINGUARD.CUSTOMERS c ON t.CUSTOMER_ID = c.CUSTOMER_ID
WHERE t.TXN_ID = '${txn.txn_id}';`}
            </pre>
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-2">
              <span>Status: EXASOL_INDEX_SEEK</span>
              <span className="text-cyan-400">Execution: {data.execution_time_ms} ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
