"""
Unit & Boundary Tests for FinGuard AI Risk Engine (unittest + pytest compatible)
"""

import unittest
from backend.risk_engine import RiskEngine

class TestRiskEngine(unittest.TestCase):
    def setUp(self):
        self.engine = RiskEngine()
        self.base_customer = {
            "customer_id": "CUST-TEST-001",
            "full_name": "Test User",
            "segment": "RETAIL",
            "avg_txn_amount": 2000.0,
            "std_dev_amount": 500.0,
        }

    def test_normal_transaction_low_score(self):
        txn = {
            "txn_id": "TXN-NORM-01",
            "amount": 2100.0,
            "currency": "INR",
            "is_new_beneficiary": False,
            "counterparty_country": "IND",
        }
        result = self.engine.evaluate(txn, self.base_customer, [])
        self.assertLess(result["final_score"], 40.0)
        self.assertEqual(result["severity"], "LOW")
        self.assertEqual(len(result["factor_contributions"]), 0)

    def test_extreme_baseline_deviation(self):
        txn = {
            "txn_id": "TXN-HIGH-01",
            "amount": 25000.0,  # > 12x mean
            "currency": "INR",
            "is_new_beneficiary": False,
            "counterparty_country": "IND",
        }
        result = self.engine.evaluate(txn, self.base_customer, [])
        self.assertGreaterEqual(result["final_score"], 35.0)
        rule_ids = [f["rule_id"] for f in result["factor_contributions"]]
        self.assertIn("RULE-AMT-02", rule_ids)

    def test_structuring_threshold_evasion(self):
        txn = {
            "txn_id": "TXN-STR-01",
            "amount": 49200.0,  # Just below ₹50,000 threshold
            "currency": "INR",
            "is_new_beneficiary": False,
            "counterparty_country": "IND",
        }
        result = self.engine.evaluate(txn, self.base_customer, [])
        rule_ids = [f["rule_id"] for f in result["factor_contributions"]]
        self.assertIn("RULE-STR-04", rule_ids)

    def test_velocity_burst(self):
        txn = {
            "txn_id": "TXN-BURST-01",
            "amount": 1500.0,
            "currency": "INR",
            "is_new_beneficiary": False,
            "counterparty_country": "IND",
        }
        recent_txns = [{"txn_id": f"TXN-PREV-{i}", "amount": 1000} for i in range(5)]
        result = self.engine.evaluate(txn, self.base_customer, recent_txns)
        rule_ids = [f["rule_id"] for f in result["factor_contributions"]]
        self.assertIn("RULE-VEL-01", rule_ids)
        self.assertEqual(len(result["supporting_txn_ids"]), 4)

    def test_score_caps_at_100(self):
        txn = {
            "txn_id": "TXN-CRIT-99",
            "amount": 49500.0,
            "currency": "INR",
            "is_new_beneficiary": True,
            "counterparty_country": "ARE",
        }
        recent_txns = [{"txn_id": f"TXN-PREV-{i}", "amount": 1000} for i in range(6)]
        result = self.engine.evaluate(txn, self.base_customer, recent_txns)
        self.assertLessEqual(result["final_score"], 100.0)
        self.assertEqual(result["severity"], "CRITICAL")

if __name__ == '__main__':
    unittest.main()
