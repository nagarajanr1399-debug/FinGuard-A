import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Search, 
  FileText, 
  Share2, 
  Sliders, 
  Briefcase, 
  Bot, 
  Cpu, 
  Settings, 
  Home, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';
import { PageView } from '../types.ts';
import { fetchCurrentUser, switchUserRole, checkDatabaseHealth } from '../api.ts';

interface NavigationProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  openCopilot: () => void;
  selectedTxnId: string | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  openCopilot,
  selectedTxnId,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then(data => setCurrentUser(data.user)).catch(() => {});
    checkDatabaseHealth().then(status => setDbStatus(status)).catch(() => {});
    
    // Refresh DB health periodically
    const interval = setInterval(() => {
      checkDatabaseHealth().then(status => setDbStatus(status)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = async (role: string) => {
    setIsRoleMenuOpen(false);
    try {
      const res = await switchUserRole(role);
      setCurrentUser(res.user);
    } catch (e) {
      console.error(e);
    }
  };

  const navItems: { id: PageView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'landing', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Risk Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <Search className="w-4 h-4" /> },
    { 
      id: 'investigation', 
      label: 'Investigation', 
      icon: <FileText className="w-4 h-4" />, 
      badge: selectedTxnId ? selectedTxnId.split('-')[1] : undefined 
    },
    { id: 'graph', label: 'Entity Graph', icon: <Share2 className="w-4 h-4" /> },
    { id: 'rules', label: 'Compliance Rules', icon: <Sliders className="w-4 h-4" /> },
    { id: 'cases', label: 'Case Management', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'copilot', label: 'Gemini Copilot', icon: <Bot className="w-4 h-4" /> },
    { id: 'performance', label: 'Exasol Query Lab', icon: <Cpu className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit & Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Fin<span className="text-cyan-400">Guard</span> <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono font-medium">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  ExaThon India 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Explainable Fraud &amp; Risk Intelligence</p>
            </div>
          </div>

          {/* Center/Right Status Indicators & Quick Actions */}
          <div className="flex items-center space-x-3">
            {/* Analytics Engine Status Badge */}
            <div 
              onClick={() => onNavigate('performance')}
              title={dbStatus?.details || 'High-Throughput Analytics Engine Status'}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer text-xs"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-slate-300 hidden md:inline">Analytics Engine:</span>
              <span className="flex items-center text-emerald-400 font-semibold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                ACTIVE (0.8ms)
              </span>
            </div>

            {/* Quick Copilot Launch Button */}
            <button
              onClick={openCopilot}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 transition avatar-glow"
            >
              <Bot className="w-4 h-4 text-cyan-200" />
              <span className="hidden sm:inline">Ask Copilot</span>
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition"
              >
                <div className="w-5 h-5 rounded-full bg-violet-600/40 border border-violet-400 flex items-center justify-center text-[10px] font-bold text-violet-200">
                  {currentUser?.name ? currentUser.name[0] : 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-medium text-slate-200 leading-none">{currentUser?.name || 'Analyst'}</div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{currentUser?.role || 'INVESTIGATOR'}</div>
                </div>
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Simulation Role Switcher</p>
                    <p className="text-xs font-semibold text-slate-200">{currentUser?.organization}</p>
                  </div>
                  {[
                    { role: 'SENIOR_INVESTIGATOR', label: 'Devin Vance', title: 'Senior Fraud Investigator' },
                    { role: 'COMPLIANCE_HEAD', label: 'Priya Raman', title: 'Compliance & FIU Head (Full Access)' },
                    { role: 'ANALYST', label: 'Aarav Nair', title: 'Junior Risk Analyst' },
                    { role: 'AUDITOR', label: 'Rahul Sen', title: 'Regulatory Auditor (Read Only)' },
                  ].map(item => (
                    <button
                      key={item.role}
                      onClick={() => handleRoleChange(item.role)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                        currentUser?.role === item.role
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.title}</div>
                      </div>
                      {currentUser?.role === item.role && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar (All 10 Core Pages) */}
      <nav className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-1.5">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      #{item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
