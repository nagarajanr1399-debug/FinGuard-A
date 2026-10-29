import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle 
} from 'lucide-react';
import { ComplianceRuleConfig } from '../types.ts';
import { fetchRules, updateRuleConfig } from '../api.ts';

export const RulesView: React.FC = () => {
  const [rules, setRules] = useState<ComplianceRuleConfig[]>([]);
  const [version, setVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<ComplianceRuleConfig | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await fetchRules();
      setRules(data.rules);
      setVersion(data.version);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggle = async (rule: ComplianceRuleConfig) => {
    const updated = !rule.enabled;
    try {
      await updateRuleConfig(rule.rule_id, { enabled: updated });
      setRules(prev => prev.map(r => r.rule_id === rule.rule_id ? { ...r, enabled: updated } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setSaving(true);
    try {
      await updateRuleConfig(editingRule.rule_id, {
        threshold: editingRule.threshold,
        weight: editingRule.weight,
        enabled: editingRule.enabled,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingRule(null);
        loadRules();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">Compliance Rules &amp; Alert Engine</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {version || 'v2.6.1-exasol'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic risk detection parameters configured for statutory AML surveillance
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>Active Rules: </span>
          <strong className="text-cyan-400">{rules.filter(r => r.enabled).length} / {rules.length}</strong>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400 font-mono animate-pulse">
            Loading Compliance Engine Rules...
          </div>
        ) : (
          rules.map(rule => (
            <div
              key={rule.rule_id}
              className={`p-5 rounded-2xl border transition space-y-4 ${
                rule.enabled
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{rule.rule_id}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {rule.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{rule.name}</h3>
                </div>

                <button
                  onClick={() => handleToggle(rule)}
                  className="text-slate-400 hover:text-white transition"
                  title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-600" />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{rule.description}</p>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">WEIGHT CONTRIBUTION</span>
                  <span className="text-violet-400 font-bold">Max +{rule.weight} pts</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CURRENT THRESHOLD</span>
                  <span className="text-white font-bold">{rule.threshold} {rule.unit}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  rule.severity_tier === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                  rule.severity_tier === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {rule.severity_tier} SEVERITY
                </span>

                <button
                  onClick={() => setEditingRule({ ...rule })}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                >
                  Configure
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Rule Configuration Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1222] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Configure Rule {editingRule.rule_id}</h3>
            <p className="text-xs text-slate-400">{editingRule.name}</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Threshold ({editingRule.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  value={editingRule.threshold}
                  onChange={e => setEditingRule({ ...editingRule, threshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Score Weight Contribution (Max Points)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={editingRule.weight}
                  onChange={e => setEditingRule({ ...editingRule, weight: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rule threshold updated and logged to audit trail.</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
