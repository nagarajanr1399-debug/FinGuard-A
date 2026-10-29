/**
 * FinGuard AI — API Client Module
 */

import { 
  DashboardStats, 
  Transaction, 
  Customer, 
  InvestigationCase, 
  ComplianceRuleConfig, 
  CopilotResponse 
} from './types.ts';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchTransactions(params: {
  search?: string;
  severity?: string;
  channel?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
}): Promise<{
  transactions: Transaction[];
  total: number;
  offset: number;
  limit: number;
  execution_time_ms: number;
}> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.severity) query.set('severity', params.severity);
  if (params.channel) query.set('channel', params.channel);
  if (params.status) query.set('status', params.status);
  if (params.minAmount !== undefined) query.set('minAmount', String(params.minAmount));
  if (params.maxAmount !== undefined) query.set('maxAmount', String(params.maxAmount));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.offset !== undefined) query.set('offset', String(params.offset));

  const res = await fetch(`/api/transactions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchTransactionDetails(txnId: string): Promise<{
  transaction: Transaction;
  customer: Customer;
  alert?: any;
  risk_features: any;
  recent_history: Transaction[];
  execution_time_ms: number;
}> {
  const res = await fetch(`/api/transactions/${txnId}`);
  if (!res.ok) throw new Error(`Failed to fetch details for transaction ${txnId}`);
  return res.json();
}

export async function fetchTransactionGraph(txnId: string): Promise<{
  nodes: any[];
  links: any[];
  summary: any;
  execution_time_ms: number;
}> {
  const res = await fetch(`/api/transactions/${txnId}/graph`);
  if (!res.ok) throw new Error(`Failed to fetch graph for transaction ${txnId}`);
  return res.json();
}

export async function rescoreTransaction(txnId: string, params: {
  amount?: number;
  is_new_beneficiary?: boolean;
  counterparty_country?: string;
}) {
  const res = await fetch(`/api/transactions/${txnId}/rescore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to rescore transaction');
  return res.json();
}

export async function fetchRules(): Promise<{ rules: ComplianceRuleConfig[]; version: string }> {
  const res = await fetch('/api/rules');
  if (!res.ok) throw new Error('Failed to fetch compliance rules');
  return res.json();
}

export async function updateRuleConfig(ruleId: string, updates: Partial<ComplianceRuleConfig>) {
  const res = await fetch(`/api/rules/${ruleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update rule ${ruleId}`);
  return res.json();
}

export async function fetchCases(): Promise<{ cases: InvestigationCase[] }> {
  const res = await fetch('/api/cases');
  if (!res.ok) throw new Error('Failed to fetch investigation cases');
  return res.json();
}

export async function createCase(payload: {
  title: string;
  priority: string;
  primaryTxnId: string;
  initialNote?: string;
}) {
  const res = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create case');
  return res.json();
}

export async function updateCaseDisposition(caseId: string, payload: {
  disposition: string;
  notes: string;
  sarReference?: string;
}) {
  const res = await fetch(`/api/cases/${caseId}/disposition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to finalize disposition');
  return res.json();
}

export async function addCaseNote(caseId: string, text: string) {
  const res = await fetch(`/api/cases/${caseId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
}

export async function askCopilot(txnId: string, question: string): Promise<CopilotResponse> {
  const res = await fetch('/api/copilot/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txnId, question }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to query Copilot');
  }
  return res.json();
}

export async function fetchBenchmarks() {
  const res = await fetch('/api/performance/benchmark');
  if (!res.ok) throw new Error('Failed to run performance benchmarks');
  return res.json();
}

export async function checkDatabaseHealth() {
  const res = await fetch('/api/db/health');
  if (!res.ok) throw new Error('Failed to check database health');
  return res.json();
}

export async function updateDatabaseConfig(config?: Record<string, any>) {
  const res = await fetch('/api/db/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config || {}),
  });
  if (!res.ok) throw new Error('Failed to update database config');
  return res.json();
}

export async function fetchAuditLogs(limit: number = 100) {
  const res = await fetch(`/api/audit?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchCurrentUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Failed to fetch auth session');
  return res.json();
}

export async function switchUserRole(role: string) {
  const res = await fetch('/api/auth/switch-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Failed to switch user role');
  return res.json();
}

export async function reseedDataset(seed: number = 2026, count: number = 250) {
  const res = await fetch('/api/seed/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, count }),
  });
  if (!res.ok) throw new Error('Failed to regenerate dataset');
  return res.json();
}
