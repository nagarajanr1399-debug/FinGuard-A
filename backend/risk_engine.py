"""
FinGuard AI — Deterministic Explainable Risk Engine (Python)
Track 01: Money, Risk & Regulation | ExaThon India 2026
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import math

class RiskEngine:
    MODEL_VERSION = "v2.6.1-exasol-prod"

    def __init__(self, rules_config: Optional[List[Dict[str, Any]]] = None):
        self.rules = rules_config or [
            {
                "rule_id": "RULE-AMT-02",
                "name": "Historical Baseline Deviation",
                "enabled": True,
                "weight": 35.0,
                "threshold": 3.0,
            },
            {
                "rule_id": "RULE-VEL-01",
                "name": "High-Frequency Velocity Spike",
                "enabled": True,
                "weight": 25.0,
                "threshold": 4,
            },
            {
                "rule_id": "RULE-BEN-03",
                "name": "Unverified First-Time Beneficiary",
                "enabled": True,
                "weight": 20.0,
                "threshold": 1,
            },
            {
                "rule_id": "RULE-STR-04",
                "name": "Smurfing / Structuring Threshold Evasion",
                "enabled": True,
                "weight": 25.0,
                "threshold": 45000,
            },
        ]

    def evaluate(self, txn: Dict[str, Any], customer: Dict[str, Any], recent_txns: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        recent_txns = recent_txns or []
        contributions = []
        supporting_txn_ids = []
        total_score = 0.0

        # 1. Baseline Deviation
        avg_amt = customer.get("avg_txn_amount", 2500.0) or 2500.0
        ratio = txn.get("amount", 0.0) / max(1.0, avg_amt)
        std_dev = customer.get("std_dev_amount", avg_amt * 0.4) or (avg_amt * 0.4)
        z_score = max(0.0, (txn.get("amount", 0.0) - avg_amt) / max(1.0, std_dev))

        if ratio >= 3.0 or z_score >= 3.0:
            intensity = min(1.0, (ratio - 3.0) / 6.0)
            score_added = round(35.0 * (0.6 + 0.4 * intensity), 1)
            total_score += score_added
            contributions.append({
                "rule_id": "RULE-AMT-02",
                "rule_name": "Historical Baseline Deviation",
                "category": "BASELINE",
                "score_contribution": score_added,
                "measured_value": f"{ratio:.1f}x mean (Z={z_score:.2f})",
                "threshold_applied": ">= 3.0x mean",
                "description": f"Transaction amount of ₹{txn.get('amount'):,.2f} is {ratio:.1f}x higher than 30-day baseline.",
                "evidence_summary": f"Customer baseline mean is ₹{avg_amt:,.2f} with std-dev ₹{std_dev:,.2f}.",
            })

        # 2. Velocity
        count_10m = len(recent_txns)
        if count_10m >= 4:
            total_score += 25.0
            for t in recent_txns[:4]:
                if "txn_id" in t:
                    supporting_txn_ids.append(t["txn_id"])
            contributions.append({
                "rule_id": "RULE-VEL-01",
                "rule_name": "High-Frequency Velocity Spike",
                "category": "VELOCITY",
                "score_contribution": 25.0,
                "measured_value": f"{count_10m} txns in window",
                "threshold_applied": ">= 4 txns in 10m",
                "description": f"High burst velocity detected with {count_10m} events.",
                "evidence_summary": f"Exasol partition window identified {count_10m} rapid transfers.",
            })

        # 3. Beneficiary
        is_new = txn.get("is_new_beneficiary", False)
        is_offshore = txn.get("counterparty_country", "IND") != "IND"
        if is_new and (is_offshore or txn.get("amount", 0) > avg_amt * 2):
            score_added = 20.0 if is_offshore else 15.0
            total_score += score_added
            contributions.append({
                "rule_id": "RULE-BEN-03",
                "rule_name": "Unverified First-Time Beneficiary",
                "category": "BENEFICIARY",
                "score_contribution": score_added,
                "measured_value": f"New beneficiary ({txn.get('counterparty_bank')})",
                "threshold_applied": "Novel counterparty with high value or offshore bank",
                "description": f"First transfer to counterparty {txn.get('counterparty_name')}.",
                "evidence_summary": f"Jurisdiction: {txn.get('counterparty_country')}.",
            })

        # 4. Structuring
        amt = txn.get("amount", 0.0)
        if 45000 <= amt <= 49999:
            total_score += 25.0
            contributions.append({
                "rule_id": "RULE-STR-04",
                "rule_name": "Smurfing / Structuring Threshold Evasion",
                "category": "STRUCTURING",
                "score_contribution": 25.0,
                "measured_value": f"Amount ₹{amt:,.2f}",
                "threshold_applied": "₹45,000 - ₹49,999 band",
                "description": "Amount positioned intentionally below statutory ₹50,000 reporting threshold.",
                "evidence_summary": "Structuring indicator matched.",
            })

        final_score = min(100.0, max(0.0, total_score))
        severity = "LOW"
        if final_score >= 80: severity = "CRITICAL"
        elif final_score >= 65: severity = "HIGH"
        elif final_score >= 40: severity = "MEDIUM"

        return {
            "final_score": final_score,
            "severity": severity,
            "factor_contributions": contributions,
            "supporting_txn_ids": supporting_txn_ids,
            "scoring_model_version": self.MODEL_VERSION,
            "calculated_at": datetime.utcnow().isoformat() + "Z",
            "summary": f"Calculated risk score {final_score:.1f}/100 with {len(contributions)} triggered rules.",
        }
