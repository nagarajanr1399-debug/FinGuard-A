import React from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  Zap, 
  Database, 
  Cpu, 
  FileCheck, 
  GitBranch, 
  Lock, 
  Sparkles, 
  Layers, 
  Activity, 
  BarChart3, 
  Users 
} from 'lucide-react';
import { PageView } from '../types.ts';

interface LandingViewProps {
  onNavigate: (view: PageView) => void;
  openCopilot: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, openCopilot }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-[#070b14] border border-slate-800 p-8 sm:p-12 lg:p-16">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>ExaThon India 2026 — Track 01: Money, Risk &amp; Regulation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Explainable Financial Fraud &amp; <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Risk Intelligence Platform
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate black-box AI and fragmented banking logs. FinGuard AI leverages{' '}
            <strong className="text-cyan-300 font-semibold">Exasol Personal Columnar Analytics</strong>, deterministic{' '}
            <strong className="text-violet-300 font-semibold">0-100 explainable scoring</strong>, and{' '}
            <strong className="text-cyan-300 font-semibold">Gemini 3.8 Flash evidence grounding</strong> to empower risk analysts in defending against financial crime.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white text-sm font-semibold shadow-xl shadow-cyan-500/25 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <span>Launch Risk Operations Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('performance')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold flex items-center space-x-2 transition"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Exasol Query Lab</span>
            </button>
            <button
              onClick={openCopilot}
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-sm font-semibold flex items-center space-x-2 transition avatar-glow"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Ask Gemini Copilot</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-xs font-mono text-slate-400">ANALYTICS ENGINE</div>
              <div className="text-lg font-bold text-cyan-400 font-mono">Exasol Columnar</div>
              <div className="text-[11px] text-slate-400">Sub-10ms window scans</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-xs font-mono text-slate-400">SCORING METHOD</div>
              <div className="text-lg font-bold text-violet-400 font-mono">Deterministic (0-100)</div>
              <div className="text-[11px] text-slate-400">Transparent factor waterfall</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-xs font-mono text-slate-400">COPILOT INTEGRATION</div>
              <div className="text-lg font-bold text-white font-mono">Gemini 3.8 Flash</div>
              <div className="text-[11px] text-slate-400">Zero arbitrary SQL execution</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-xs font-mono text-slate-400">REGULATORY STANDARD</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">FIU-IND &amp; AML/SAR</div>
              <div className="text-[11px] text-slate-400">Immutable audit trails</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Outcome Breakdown */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">The Compliance Dilemma &amp; FinGuard Solution</h2>
          <p className="text-sm text-slate-400">
            Why traditional anti-fraud systems fail compliance auditors, and how FinGuard AI redefines risk intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-rose-950/10 border border-rose-900/30 space-y-4">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>THE CHALLENGE IN RISK OPERATIONS</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>Data Fragmentation:</strong> Transaction ledgers, customer historical baselines, and counterparty KYC records reside in disparate silos.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>Opaque Black Boxes:</strong> Deep learning models generate a probability without explaining <em>why</em> an alert triggered, failing regulatory scrutiny.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>Analyst Fatigue:</strong> Inundated with 90%+ false positives, manual investigations average 45+ minutes per flagged case.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-cyan-950/10 border border-cyan-800/30 space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <Zap className="w-5 h-5" />
              <span>THE FINGUARD ARCHITECTURAL OUTCOME</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Exasol In-Memory Columnar Speed:</strong> Instantaneous window functions calculate 10-minute velocity and 30-day baseline deviations across millions of rows.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Transparent Factor Contribution:</strong> Every risk score breaks down into exact mathematical points (e.g. +35 pts baseline deviation, +25 pts velocity spike).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Grounded Copilot Reasoning:</strong> Gemini 3.8 Flash answers analyst queries strictly using verified database facts with built-in prompt-injection immunity.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6-Stage End-to-End Architectural Pipeline */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">System Architecture</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">End-to-End Intelligence Pipeline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Synthetic & Live Ingestion',
              desc: 'High-throughput ingestion of UPI, IMPS, RTGS, NEFT, SWIFT, and Card transactions with verified customer profiles.',
              icon: <Layers className="w-5 h-5 text-cyan-400" />,
            },
            {
              step: '02',
              title: 'Exasol Columnar Engine',
              desc: 'Relational schema execution with analytic window functions calculating rolling 10m/1h velocities and 30-day Z-scores in sub-10ms.',
              icon: <Database className="w-5 h-5 text-violet-400" />,
            },
            {
              step: '03',
              title: 'Deterministic Risk Engine',
              desc: 'Configurable non-overlapping rules (RULE-AMT-02, RULE-VEL-01, RULE-STR-04, etc.) yielding explainable 0-100 triage scores.',
              icon: <Activity className="w-5 h-5 text-emerald-400" />,
            },
            {
              step: '04',
              title: 'Entity Relationship Graph',
              desc: 'Multi-hop graph visualization linking accounts, beneficiaries, devices, and IPs to expose mule networks and smurfing rings.',
              icon: <GitBranch className="w-5 h-5 text-amber-400" />,
            },
            {
              step: '05',
              title: 'Grounded Gemini Copilot',
              desc: 'Backend-only Gemini 3.8 Flash integration binding strict database facts for evidence explanation and automated SAR drafting.',
              icon: <Cpu className="w-5 h-5 text-cyan-400" />,
            },
            {
              step: '06',
              title: 'Case Workflow & Audit Trail',
              desc: 'Role-based case dispositioning (SAR filing, account freeze, false positive clearance) with immutable audit events.',
              icon: <FileCheck className="w-5 h-5 text-violet-400" />,
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {item.icon}
                </div>
                <span className="text-2xl font-black font-mono text-slate-700">{item.step}</span>
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Launch CTA */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-white">Ready to Inspect Live Fraud Scenarios?</h3>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Explore flagged money mule rings, threshold smurfing evasion clusters, and dormant account takeovers in the active operations console.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-cyan-500/20"
          >
            Open Operations Dashboard
          </button>
          <button
            onClick={() => onNavigate('investigation')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider uppercase transition"
          >
            Direct Investigation Deep-Dive
          </button>
        </div>
      </section>
    </div>
  );
};
