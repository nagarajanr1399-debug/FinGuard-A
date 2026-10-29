import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  MessageSquare, 
  Send, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink 
} from 'lucide-react';
import { InvestigationCase, PageView } from '../types.ts';
import { fetchCases, addCaseNote, updateCaseDisposition } from '../api.ts';

interface CasesViewProps {
  onNavigate: (view: PageView) => void;
  onSelectTxn: (id: string) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({ onNavigate, onSelectTxn }) => {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Disposition modal
  const [showDispositionModal, setShowDispositionModal] = useState(false);
  const [dispositionChoice, setDispositionChoice] = useState<'SAR_FILED' | 'CLEARED_FALSE_POSITIVE' | 'ACCOUNT_FROZEN' | 'ESCALATED_LEGAL'>('SAR_FILED');
  const [dispositionNotes, setDispositionNotes] = useState('');
  const [sarReference, setSarReference] = useState(`FIU-IND-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await fetchCases();
      setCases(data.cases);
      if (data.cases.length > 0 && !selectedCase) {
        setSelectedCase(data.cases[0]);
      } else if (selectedCase) {
        // preserve updated selection
        const refreshed = data.cases.find(c => c.case_id === selectedCase.case_id);
        if (refreshed) setSelectedCase(refreshed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNote.trim()) return;
    setAddingNote(true);
    try {
      await addCaseNote(selectedCase.case_id, newNote.trim());
      setNewNote('');
      await loadCases();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDispositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !dispositionNotes.trim()) return;
    try {
      await updateCaseDisposition(selectedCase.case_id, {
        disposition: dispositionChoice,
        notes: dispositionNotes.trim(),
        sarReference: dispositionChoice === 'SAR_FILED' ? sarReference : undefined,
      });
      setShowDispositionModal(false);
      setDispositionNotes('');
      await loadCases();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-violet-400" />
            <span>Investigation Case Management &amp; SAR Workflow</span>
          </h2>
          <p className="text-xs text-slate-400">
            Formal supervisory case dossier with evidence links, append-only notes, and regulatory dispositioning
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
          Open Investigations: <span className="text-violet-400 font-bold">{cases.filter(c => c.status !== 'RESOLVED').length}</span>
        </div>
      </div>

      {/* Main Grid: Cases List & Active Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List Sidebar (1 Col) */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
            Active Case Dossiers ({cases.length})
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs animate-pulse">
                Loading Case Registry...
              </div>
            ) : cases.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No cases created yet. Select a transaction to open a case file.
              </div>
            ) : (
              cases.map(c => {
                const isSelected = selectedCase?.case_id === c.case_id;
                return (
                  <div
                    key={c.case_id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-violet-950/20 border-violet-500/50 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-violet-400">{c.case_id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        c.priority === 'P1_CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                        c.priority === 'P2_HIGH' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {c.priority.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{c.title}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Assigned: {c.assigned_analyst.split(' ')[0]}</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                        c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Case Workspace (2 Cols) */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-white font-mono">{selectedCase.case_id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedCase.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 mt-1">{selectedCase.title}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedCase.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => setShowDispositionModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md transition"
                    >
                      Record Disposition &amp; File SAR
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Disposition: {selectedCase.disposition}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Evidence Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Linked Primary Evidence Transaction:</span>
                  <button
                    onClick={() => {
                      onSelectTxn(selectedCase.primary_txn_id);
                      onNavigate('investigation');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
                  >
                    <span>{selectedCase.primary_txn_id}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {selectedCase.sar_reference && (
                  <div className="p-3 rounded-lg bg-violet-950/40 border border-violet-800/40 text-xs flex justify-between items-center font-mono">
                    <span className="text-violet-300">FIU-IND SAR Filing Reference:</span>
                    <strong className="text-white">{selectedCase.sar_reference}</strong>
                  </div>
                )}

                {selectedCase.disposition_notes && (
                  <div className="text-xs text-slate-300 whitespace-pre-line bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <strong className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Final Disposition Rationale:</strong>
                    {selectedCase.disposition_notes}
                  </div>
                )}
              </div>

              {/* Append-Only Timeline Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 font-mono">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Case Log &amp; Analyst Notes ({selectedCase.notes.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Immutable append-only</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedCase.notes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">{note.author}</span>
                        <span className="font-mono text-[10px]">
                          {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{note.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add an auditable investigator note to this case..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNote.trim()}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1 transition"
                  >
                    <span>Post</span>
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
              Select a case from the registry to inspect evidence and update disposition.
            </div>
          )}
        </div>
      </div>

      {/* Disposition Modal */}
      {showDispositionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1222] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Record Final Case Disposition</h3>
            <p className="text-xs text-slate-400">
              Regulatory finding will be immutably sealed in the audit log and update transaction status.
            </p>

            <form onSubmit={handleDispositionSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Disposition Verdict</label>
                <select
                  value={dispositionChoice}
                  onChange={e => setDispositionChoice(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="SAR_FILED">File Suspicious Activity Report (SAR) with FIU-IND</option>
                  <option value="ACCOUNT_FROZEN">Emergency Debit Freeze on Account</option>
                  <option value="CLEARED_FALSE_POSITIVE">Clear as Verified Legitimate (False Positive)</option>
                  <option value="ESCALATED_LEGAL">Escalate to Legal &amp; Enforcement Authorities</option>
                </select>
              </div>

              {dispositionChoice === 'SAR_FILED' && (
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1 font-mono">
                    FIU-IND SAR Filing Reference
                  </label>
                  <input
                    type="text"
                    value={sarReference}
                    onChange={e => setSarReference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-400"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Investigation Findings &amp; Rationale
                </label>
                <textarea
                  value={dispositionNotes}
                  onChange={e => setDispositionNotes(e.target.value)}
                  placeholder="Summarize evidence established from Exasol query and Copilot reasoning..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispositionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                >
                  Confirm &amp; Seal Disposition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
