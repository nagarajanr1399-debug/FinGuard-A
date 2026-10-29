/**
 * FinGuard AI — Frontend Types
 */

export type PageView = 
  | 'landing'
  | 'dashboard'
  | 'transactions'
  | 'investigation'
  | 'graph'
  | 'rules'
  | 'cases'
  | 'copilot'
  | 'performance'
  | 'audit';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type PaymentChannel = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'SWIFT' | 'CARD';
export type TransactionStatus = 'NORMAL' | 'FLAGGED' | 'UNDER_INVESTIGATION' | 'CLEARED' | 'REPORTED_SAR';

export interface Customer {
  customer_id: string;
  full_name: string;
  email: string;
  segment: 'RETAIL' | 'SME' | 'CORPORATE' | 'HNI';
  kyc_status: 'VERIFIED' | 'TIER_1' | 'PENDING_RECHECK';
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  account_created_at: string;
  monthly_avg_volume: number;
  avg_txn_amount: number;
  std_dev_amount: number;
  primary_country: string;
  device_count: number;
  last_activity_at: string;
}

export interface Transaction {
  txn_id: string;
  customer_id: string;
  timestamp: string;
  amount: number;
  currency: string;
  channel: PaymentChannel;
  counterparty_id: string;
  counterparty_name: string;
  counterparty_bank: string;
  counterparty_country: string;
  is_new_beneficiary: boolean;
  ip_address: string;
  geo_lat: number;
  geo_lon: number;
  device_id: string;
  merchant_category: string;
  description: string;
  status: TransactionStatus;
  risk_score?: number;
  severity?: AlertSeverity;
}

export interface RiskFactorContribution {
  rule_id: string;
  rule_name: string;
  category: string;
  score_contribution: number;
  measured_value: string | number;
  threshold_applied: string | number;
  description: string;
  evidence_summary: string;
}

export interface RiskAlert {
  alert_id: string;
  txn_id: string;
  customer_id: string;
  alert_timestamp: string;
  final_risk_score: number;
  severity: AlertSeverity;
  triggered_rules: string[];
  rule_contributions: RiskFactorContribution[];
  status: 'NEW' | 'REVIEWING' | 'DISMISSED' | 'ESCALATED';
}

export interface InvestigationCase {
  case_id: string;
  title: string;
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_INFO' | 'RESOLVED' | 'CLOSED';
  assigned_analyst: string;
  created_at: string;
  updated_at: string;
  primary_txn_id: string;
  related_txn_ids: string[];
  disposition?: 'CLEARED_FALSE_POSITIVE' | 'SAR_FILED' | 'ACCOUNT_FROZEN' | 'ESCALATED_LEGAL';
  disposition_notes?: string;
  sar_reference?: string;
  notes: {
    note_id: string;
    author: string;
    timestamp: string;
    text: string;
  }[];
}

export interface ComplianceRuleConfig {
  rule_id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  weight: number;
  threshold: number;
  unit: string;
  severity_tier: AlertSeverity;
}

export interface DashboardStats {
  total_transactions: number;
  total_volume_inr: number;
  mean_transaction_size: number;
  flagged_alerts_count: number;
  critical_alerts: number;
  open_cases_count: number;
  average_triage_latency_mins: number;
  p95_query_latency_ms: number;
  severity_distribution: Record<AlertSeverity, number>;
  channel_distribution: Record<string, number>;
  rule_trigger_breakdown: Record<string, number>;
  execution_time_ms: number;
  database_mode: string;
}

export interface CopilotResponse {
  query: string;
  verified_database_facts: {
    txn_id: string;
    amount: number;
    currency: string;
    customer_id: string;
    customer_name: string;
    customer_monthly_mean: number;
    deviation_multiple: number;
    velocity_10m: number;
    is_new_beneficiary: boolean;
  };
  rule_attribution: {
    primary_driver: string;
    score: number;
    severity: AlertSeverity;
    top_factors: { rule_name: string; score_added: number; reasoning: string }[];
  };
  network_intelligence: string;
  compliance_verdict: {
    sar_recommended: boolean;
    suspicion_type: string;
    immediate_actions: string[];
  };
  grounded_narrative: string;
  timestamp: string;
  latency_ms: number;
}
