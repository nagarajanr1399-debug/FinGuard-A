import React, { useState } from 'react';
import { PageView } from './types.ts';
import { Navigation } from './components/Navigation.tsx';
import { CopilotModal } from './components/CopilotModal.tsx';
import { LandingView } from './views/LandingView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { TransactionsView } from './views/TransactionsView.tsx';
import { InvestigationView } from './views/InvestigationView.tsx';
import { RelationshipGraphView } from './views/RelationshipGraphView.tsx';
import { RulesView } from './views/RulesView.tsx';
import { CasesView } from './views/CasesView.tsx';
import { CopilotView } from './views/CopilotView.tsx';
import { PerformanceLabView } from './views/PerformanceLabView.tsx';
import { AuditSettingsView } from './views/AuditSettingsView.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('landing');
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>('TXN-9004-IN');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const openCopilotForTxn = (txnId: string) => {
    setSelectedTxnId(txnId);
    setIsCopilotOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Persistent Navigation */}
      <Navigation
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        openCopilot={() => setIsCopilotOpen(true)}
        selectedTxnId={selectedTxnId}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'landing' && (
          <LandingView
            onNavigate={view => setCurrentView(view)}
            openCopilot={() => setIsCopilotOpen(true)}
          />
        )}
        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={view => setCurrentView(view)}
            onSelectTxn={id => setSelectedTxnId(id)}
          />
        )}
        {currentView === 'transactions' && (
          <TransactionsView
            onNavigate={view => setCurrentView(view)}
            onSelectTxn={id => setSelectedTxnId(id)}
            openCopilotForTxn={openCopilotForTxn}
          />
        )}
        {currentView === 'investigation' && (
          <InvestigationView
            selectedTxnId={selectedTxnId}
            onSelectTxn={id => setSelectedTxnId(id)}
            onNavigate={view => setCurrentView(view)}
            openCopilotForTxn={openCopilotForTxn}
          />
        )}
        {currentView === 'graph' && (
          <RelationshipGraphView
            selectedTxnId={selectedTxnId}
            onSelectTxn={id => setSelectedTxnId(id)}
            onNavigate={view => setCurrentView(view)}
          />
        )}
        {currentView === 'rules' && <RulesView />}
        {currentView === 'cases' && (
          <CasesView
            onNavigate={view => setCurrentView(view)}
            onSelectTxn={id => setSelectedTxnId(id)}
          />
        )}
        {currentView === 'copilot' && (
          <CopilotView
            selectedTxnId={selectedTxnId}
            onSelectTxn={id => setSelectedTxnId(id)}
            onNavigate={view => setCurrentView(view)}
          />
        )}
        {currentView === 'performance' && <PerformanceLabView />}
        {currentView === 'audit' && <AuditSettingsView />}
      </main>

      {/* Floating Copilot Modal */}
      <CopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedTxnId={selectedTxnId}
        onSelectTxn={id => setSelectedTxnId(id)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">FinGuard AI</span>
            <span>—</span>
            <span>ExaThon India 2026 | Track 01: Money, Risk &amp; Regulation</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="text-cyan-400">Exasol Columnar Engine v7.1</span>
            <span>•</span>
            <span className="text-violet-400">Gemini 3.8 Flash Grounded</span>
            <span>•</span>
            <span className="text-emerald-400">FIU-IND Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
