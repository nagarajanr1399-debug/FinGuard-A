/**
 * FinGuard AI — Deterministic Explainable Risk Scoring Engine
 * Model Version: v2.6.1-exasol-prod
 * Track 01: Money, Risk & Regulation | ExaThon India 2026
 */

import { 
  Transaction, 
  Customer, 
  RiskScoreResult, 
  RiskFactorContribution, 
  AlertSeverity, 
  ComplianceRuleConfig 
} from './types.ts';

export const DEFAULT_RULES: ComplianceRuleConfig[] = [
  {
    rule_id: 'RULE-AMT-02',
    name: 'Historical Baseline Deviation',
    description: 'Transaction amount exceeds multiple of customer 30-day baseline mean and standard deviation.',
    category: 'BASELINE',
    enabled: true,
    weight: 35,
    threshold: 3.0, // 3x standard baseline multiplier
    unit: 'multiplier',
    severity_tier: 'HIGH',
  },
  {
    rule_id: 'RULE-VEL-01',
    name: 'High-Frequency Velocity Spike',
    description: 'Surge in transaction count within short 10-minute and 1-hour rolling observation windows.',
    category: 'VELOCITY',
    enabled: true,
    weight: 25,
    threshold: 4, // > 4 transactions in 10 minutes
    unit: 'txns / 10m',
    severity_tier: 'CRITICAL',
  },
  {
    rule_id: 'RULE-BEN-03',
    name: 'Unverified First-Time Beneficiary',
    description: 'First outbound transfer to an unverified or offshore counterparty account.',
    category: 'BENEFICIARY',
    enabled: true,
    weight: 20,
    threshold: 1, // First interaction boolean
    unit: 'flag',
    severity_tier: 'MEDIUM',
  },
  {
    rule_id: 'RULE-STR-04',
    name: 'Smurfing / Structuring Threshold Evasion',
    description: 'Amount positioned just below statutory AML reporting limits (₹50,000 / $10,000).',
    category: 'STRUCTURING',
    enabled: true,
    weight: 25,
    threshold: 45000, // Starts at 45k INR or $9k USD
    unit: 'currency_band',
    severity_tier: 'CRITICAL',
  },
  {
    rule_id: 'RULE-GEO-05',
    name: 'Impossible Geolocation Jump',
    description: 'Significant geographic distance from recent IP/device location within brief interval.',
    category: 'GEO',
    enabled: true,
    weight: 15,
    threshold: 300, // > 300 km
    unit: 'km',
    severity_tier: 'MEDIUM',
  },
  {
    rule_id: 'RULE-DOR-06',
    name: 'Dormant Account Sudden Outflow',
    description: 'Account inactive for extended period abruptly initiating high-value debit.',
    category: 'DORMANCY',
    enabled: true,
    weight: 15,
    threshold: 60, // 60 days dormancy
    unit: 'days',
    severity_tier: 'HIGH',
  },
];

export class RiskEngine {
  private rules: Map<string, ComplianceRuleConfig>;
  public readonly modelVersion = 'v2.6.1-exasol-prod';

  constructor(customRules: ComplianceRuleConfig[] = DEFAULT_RULES) {
    this.rules = new Map(customRules.map(r => [r.rule_id, { ...r }]));
  }

  public getRules(): ComplianceRuleConfig[] {
    return Array.from(this.rules.values());
  }

  public updateRule(ruleId: string, updates: Partial<ComplianceRuleConfig>): boolean {
    const existing = this.rules.get(ruleId);
    if (!existing) return false;
    this.rules.set(ruleId, { ...existing, ...updates });
    return true;
  }

  /**
   * Deterministic Risk Calculation
   * Evaluates each factor with non-overlapping additive scoring, capped at 100.
   */
  public evaluate(
    txn: Transaction,
    customer: Customer,
    recentCustomerTxns: Transaction[] = []
  ): RiskScoreResult {
    const contributions: RiskFactorContribution[] = [];
    const supportingTxnIds: Set<string> = new Set();
    let totalScore = 0;

    // --- Factor 1: Historical Baseline Deviation (RULE-AMT-02) ---
    const ruleAmt = this.rules.get('RULE-AMT-02');
    if (ruleAmt && ruleAmt.enabled) {
      const avg = customer.avg_txn_amount || 2500;
      const ratio = txn.amount / avg;
      const stdDev = customer.std_dev_amount || (avg * 0.4);
      const zScore = Math.max(0, (txn.amount - avg) / (stdDev || 1));

      if (ratio >= ruleAmt.threshold || zScore >= 3.0) {
        // Linear scale between threshold and 10x deviation
        const intensity = Math.min(1.0, (ratio - ruleAmt.threshold) / 6.0);
        const scoreContribution = Math.round(ruleAmt.weight * (0.6 + 0.4 * intensity));
        totalScore += scoreContribution;

        contributions.push({
          rule_id: ruleAmt.rule_id,
          rule_name: ruleAmt.name,
          category: 'BASELINE',
          score_contribution: scoreContribution,
          measured_value: `${ratio.toFixed(1)}x mean (Z=${zScore.toFixed(2)})`,
          threshold_applied: `>= ${ruleAmt.threshold}x (Avg: ₹${avg.toLocaleString()})`,
          description: `Transaction amount of ₹${txn.amount.toLocaleString()} is ${ratio.toFixed(1)}x higher than 30-day baseline.`,
          evidence_summary: `Customer baseline mean is ₹${avg.toLocaleString()} with std-dev ₹${stdDev.toFixed(0)}.`,
        });
      }
    }

    // --- Factor 2: High-Frequency Velocity Spike (RULE-VEL-01) ---
    const ruleVel = this.rules.get('RULE-VEL-01');
    if (ruleVel && ruleVel.enabled) {
      const txnTime = new Date(txn.timestamp).getTime();
      const tenMinsMs = 10 * 60 * 1000;
      const oneHourMs = 60 * 60 * 1000;

      const txnsIn10m = recentCustomerTxns.filter(t => {
        const diff = Math.abs(txnTime - new Date(t.timestamp).getTime());
        return diff <= tenMinsMs;
      });

      const txnsIn1h = recentCustomerTxns.filter(t => {
        const diff = Math.abs(txnTime - new Date(t.timestamp).getTime());
        return diff <= oneHourMs;
      });

      const count10m = txnsIn10m.length;
      if (count10m >= ruleVel.threshold || txnsIn1h.length >= 8) {
        const scoreContribution = ruleVel.weight;
        totalScore += scoreContribution;

        txnsIn10m.slice(0, 5).forEach(t => supportingTxnIds.add(t.txn_id));

        contributions.push({
          rule_id: ruleVel.rule_id,
          rule_name: ruleVel.name,
          category: 'VELOCITY',
          score_contribution: scoreContribution,
          measured_value: `${count10m} txns in 10m (${txnsIn1h.length} in 1h)`,
          threshold_applied: `>= ${ruleVel.threshold} txns / 10m`,
          description: `Rapid burst velocity detected: ${count10m} transactions initiated within 10 minutes.`,
          evidence_summary: `Observed ${count10m} events totaling ₹${txnsIn10m.reduce((s, x) => s + x.amount, 0).toLocaleString()} across 10m window.`,
        });
      }
    }

    // --- Factor 3: New / Unverified Beneficiary (RULE-BEN-03) ---
    const ruleBen = this.rules.get('RULE-BEN-03');
    if (ruleBen && ruleBen.enabled) {
      const isNew = txn.is_new_beneficiary;
      const isOffshore = txn.counterparty_country !== 'IND';
      const isHighVal = txn.amount > (customer.avg_txn_amount * 2);

      if (isNew && (isHighVal || isOffshore)) {
        const scoreContribution = isOffshore ? ruleBen.weight : Math.round(ruleBen.weight * 0.75);
        totalScore += scoreContribution;

        contributions.push({
          rule_id: ruleBen.rule_id,
          rule_name: ruleBen.name,
          category: 'BENEFICIARY',
          score_contribution: scoreContribution,
          measured_value: `New beneficiary (${txn.counterparty_bank}, ${txn.counterparty_country})`,
          threshold_applied: 'First-time recipient with elevated value or cross-border destination',
          description: `Transfer directed to novel counterparty "${txn.counterparty_name}" with no prior interaction history.`,
          evidence_summary: `Counterparty bank: ${txn.counterparty_bank}, Jurisdiction: ${txn.counterparty_country}.`,
        });
      }
    }

    // --- Factor 4: Smurfing / Structuring Indicator (RULE-STR-04) ---
    const ruleStr = this.rules.get('RULE-STR-04');
    if (ruleStr && ruleStr.enabled) {
      // In INR: regulatory cash/reporting threshold is ₹50,000. Transactions in ₹45,000–₹49,999 or repeated ₹48,000 transfers.
      // In USD: $9,000–$9,999.
      const isNearThreshold = 
        (txn.currency === 'INR' && txn.amount >= 45000 && txn.amount <= 49999) ||
        (txn.currency === 'USD' && txn.amount >= 9000 && txn.amount <= 9999);

      // Check if customer had other near-threshold transactions recently
      const clusterNearLimit = recentCustomerTxns.filter(t => 
        (t.amount >= 45000 && t.amount <= 49999) || (t.amount >= 9000 && t.amount <= 9999)
      );

      if (isNearThreshold || clusterNearLimit.length >= 2) {
        const scoreContribution = ruleStr.weight;
        totalScore += scoreContribution;

        clusterNearLimit.forEach(t => supportingTxnIds.add(t.txn_id));

        contributions.push({
          rule_id: ruleStr.rule_id,
          rule_name: ruleStr.name,
          category: 'STRUCTURING',
          score_contribution: scoreContribution,
          measured_value: `Amount ₹${txn.amount.toLocaleString()} (Threshold band: ₹45,000 - ₹49,999)`,
          threshold_applied: 'Just below ₹50,000 mandatory FIU-IND reporting threshold',
          description: `Pattern consistent with smurfing/structuring to avoid AML currency transaction reporting.`,
          evidence_summary: `Identified ${clusterNearLimit.length} transactions deliberately clustered below the reporting limit.`,
        });
      }
    }

    // --- Factor 5: Impossible Geolocation Jump (RULE-GEO-05) ---
    const ruleGeo = this.rules.get('RULE-GEO-05');
    if (ruleGeo && ruleGeo.enabled && recentCustomerTxns.length > 0) {
      const priorTxn = recentCustomerTxns[0];
      if (priorTxn && priorTxn.geo_lat && txn.geo_lat) {
        const distanceKm = haversineDistance(
          txn.geo_lat, txn.geo_lon,
          priorTxn.geo_lat, priorTxn.geo_lon
        );
        const timeDiffHours = Math.abs(
          new Date(txn.timestamp).getTime() - new Date(priorTxn.timestamp).getTime()
        ) / (1000 * 60 * 60);

        const velocityKmh = timeDiffHours > 0 ? distanceKm / timeDiffHours : distanceKm * 60;

        if (distanceKm > ruleGeo.threshold && velocityKmh > 750) { // faster than standard commercial flight turnaround
          const scoreContribution = ruleGeo.weight;
          totalScore += scoreContribution;
          supportingTxnIds.add(priorTxn.txn_id);

          contributions.push({
            rule_id: ruleGeo.rule_id,
            rule_name: ruleGeo.name,
            category: 'GEO',
            score_contribution: scoreContribution,
            measured_value: `${distanceKm.toFixed(0)} km in ${(timeDiffHours * 60).toFixed(0)} mins (${velocityKmh.toFixed(0)} km/h)`,
            threshold_applied: `> ${ruleGeo.threshold} km with impossible transit speed`,
            description: `Impossible travel velocity detected between login/payment geolocations.`,
            evidence_summary: `Prior transaction at (${priorTxn.geo_lat.toFixed(2)}, ${priorTxn.geo_lon.toFixed(2)}) jumped to (${txn.geo_lat.toFixed(2)}, ${txn.geo_lon.toFixed(2)}).`,
          });
        }
      }
    }

    // --- Factor 6: Dormant Account Reactivation (RULE-DOR-06) ---
    const ruleDor = this.rules.get('RULE-DOR-06');
    if (ruleDor && ruleDor.enabled && customer.last_activity_at) {
      const lastActivity = new Date(customer.last_activity_at).getTime();
      const currentTxnTime = new Date(txn.timestamp).getTime();
      const dormantDays = Math.max(0, (currentTxnTime - lastActivity) / (1000 * 60 * 60 * 24));

      if (dormantDays >= ruleDor.threshold && txn.amount > (customer.avg_txn_amount || 2000)) {
        const scoreContribution = ruleDor.weight;
        totalScore += scoreContribution;

        contributions.push({
          rule_id: ruleDor.rule_id,
          rule_name: ruleDor.name,
          category: 'DORMANCY',
          score_contribution: scoreContribution,
          measured_value: `${Math.round(dormantDays)} days dormant`,
          threshold_applied: `>= ${ruleDor.threshold} days dormancy + high amount`,
          description: `Account revived after ${Math.round(dormantDays)} days of zero activity with immediate high outflow.`,
          evidence_summary: `Last authenticated activity recorded on ${new Date(customer.last_activity_at).toLocaleDateString()}.`,
        });
      }
    }

    // Clamp score to [0, 100]
    const finalScore = Math.min(100, Math.max(0, totalScore));

    // Determine severity
    let severity: AlertSeverity = 'LOW';
    if (finalScore >= 80) severity = 'CRITICAL';
    else if (finalScore >= 65) severity = 'HIGH';
    else if (finalScore >= 40) severity = 'MEDIUM';

    let summary = 'Standard transaction within expected behavioral bounds.';
    if (finalScore >= 80) {
      summary = `Critical anomaly: Triggered ${contributions.length} high-severity risk indicators. Immediate analyst review required.`;
    } else if (finalScore >= 65) {
      summary = `High risk profile: Substantial divergence from customer historical baseline and velocity limits.`;
    } else if (finalScore >= 40) {
      summary = `Moderate risk: Minor baseline or beneficiary anomalies flagged for periodic surveillance.`;
    }

    return {
      final_score: finalScore,
      severity,
      factor_contributions: contributions,
      supporting_txn_ids: Array.from(supportingTxnIds),
      scoring_model_version: this.modelVersion,
      calculated_at: new Date().toISOString(),
      summary,
    };
  }
}

/**
 * Calculates great-circle distance between two coordinates in kilometers (Haversine formula)
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
