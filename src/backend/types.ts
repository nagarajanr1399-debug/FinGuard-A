/**
 * FinGuard AI — Core Data Types
 * Track 01: Money, Risk & Regulation | ExaThon India 2026
 */

export type CustomerSegment = 'RETAIL' | 'SME' | 'CORPORATE' | 'HNI';
export type KycStatus = 'VERIFIED' | 'TIER_1' | 'PENDING_RECHECK';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';
export type PaymentChannel = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'SWIFT' | 'CARD';
export type TransactionStatus = 'NORMAL' | 'FLAGGED' | 'UNDER_INVESTIGATION' | 'CLEARED' | 'REPORTED_SAR';
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CasePriority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_INFO' | 'RESOLVED' | 'CLOSED';
export type CaseDisposition = 'CLEARED_FALSE_POSITIVE' | 'SAR_FILED' | 'ACCOUNT_FROZEN' | 'ESCALATED_LEGAL';

export interface Customer {
  customer_id: string;
  full_name: string;
  email: string;
  segment: CustomerSegment;
  kyc_status: KycStatus;
  risk_tier: RiskTier;
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
  category: 'BASELINE' | 'VELOCITY' | 'BENEFICIARY' | 'STRUCTURING' | 'GEO' | 'DORMANCY';
  score_contribution: number;
  measured_value: string | number;
  threshold_applied: string | number;
  description: string;
  evidence_summary: string;
}

export interface RiskScoreResult {
  final_score: number; // 0 to 100
  severity: AlertSeverity;
  factor_contributions: RiskFactorContribution[];
  supporting_txn_ids: string[];
  scoring_model_version: string;
  calculated_at: string;
  summary: string;
}

export interface RiskFeature {
  feature_id: string;
  txn_id: string;
  customer_id: string;
  calc_timestamp: string;
  rolling_10m_count: number;
  rolling_1h_count: number;
  rolling_24h_count: number;
  rolling_1h_volume: number;
  baseline_deviation_ratio: number;
  is_new_beneficiary_flag: boolean;
  off_hours_flag: boolean;
  geo_distance_km: number;
  dormant_days: number;
  structuring_indicator: boolean;
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
  case_id?: string;
  transaction?: Transaction;
  customer?: Customer;
}

export interface InvestigationCase {
  case_id: string;
  title: string;
  priority: CasePriority;
  status: CaseStatus;
  assigned_analyst: string;
  created_at: string;
  updated_at: string;
  primary_txn_id: string;
  related_txn_ids: string[];
  disposition?: CaseDisposition;
  disposition_notes?: string;
  sar_reference?: string;
  notes: CaseNote[];
}

export interface CaseNote {
  note_id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface AuditEvent {
  event_id: string;
  event_timestamp: string;
  actor_id: string;
  actor_role: 'ANALYST' | 'SENIOR_INVESTIGATOR' | 'COMPLIANCE_HEAD' | 'AUDITOR';
  action_type: 
    | 'VIEW_TRANSACTION'
    | 'COPILOT_QUERY'
    | 'CREATE_CASE'
    | 'UPDATE_STATUS'
    | 'UPDATE_DISPOSITION'
    | 'MODIFY_RULE_CONFIG'
    | 'RESEED_DATASET'
    | 'EXPORT_AUDIT_REPORT';
  target_entity: string;
  target_id: string;
  details: Record<string, unknown>;
  prev_state_hash?: string;
  curr_state_hash?: string;
}

export interface ComplianceRuleConfig {
  rule_id: string;
  name: string;
  description: string;
  category: 'BASELINE' | 'VELOCITY' | 'BENEFICIARY' | 'STRUCTURING' | 'GEO' | 'DORMANCY';
  enabled: boolean;
  weight: number; // max contribution points (e.g. 35)
  threshold: number; // numeric trigger parameter
  unit: string;
  severity_tier: AlertSeverity;
}

export interface BenchmarkResult {
  query_name: string;
  category: string;
  sql_preview: string;
  execution_time_ms: number;
  rows_scanned: number;
  column_indexes_used: string[];
  throughput_rows_sec: number;
  timestamp: string;
}

export interface CopilotGroundedEvidence {
  transaction: Transaction;
  customer: Customer;
  risk_features: RiskFeature;
  rule_breakdown: RiskFactorContribution[];
  recent_history: Transaction[];
  counterparty_network: {
    total_counterparties: number;
    known_counterparties: string[];
    is_counterparty_new: boolean;
  };
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
