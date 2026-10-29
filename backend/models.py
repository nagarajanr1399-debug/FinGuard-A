"""
FinGuard AI — Pydantic Schemas & Domain Models
Track 01: Money, Risk & Regulation | ExaThon India 2026
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class CustomerModel(BaseModel):
    customer_id: str
    full_name: str
    email: str
    segment: Literal['RETAIL', 'SME', 'CORPORATE', 'HNI']
    kyc_status: Literal['VERIFIED', 'TIER_1', 'PENDING_RECHECK']
    risk_tier: Literal['LOW', 'MEDIUM', 'HIGH']
    account_created_at: str
    monthly_avg_volume: float = 0.0
    avg_txn_amount: float = 0.0
    std_dev_amount: float = 0.0
    primary_country: str = "IND"
    device_count: int = 1
    last_activity_at: Optional[str] = None

class TransactionModel(BaseModel):
    txn_id: str
    customer_id: str
    timestamp: str
    amount: float
    currency: str = "INR"
    channel: Literal['UPI', 'IMPS', 'NEFT', 'RTGS', 'SWIFT', 'CARD']
    counterparty_id: str
    counterparty_name: str
    counterparty_bank: str
    counterparty_country: str = "IND"
    is_new_beneficiary: bool = False
    ip_address: Optional[str] = None
    geo_lat: Optional[float] = None
    geo_lon: Optional[float] = None
    device_id: Optional[str] = None
    merchant_category: str = "GENERAL_TRANSFER"
    description: Optional[str] = None
    status: Literal['NORMAL', 'FLAGGED', 'UNDER_INVESTIGATION', 'CLEARED', 'REPORTED_SAR'] = 'NORMAL'
    risk_score: Optional[float] = None
    severity: Optional[Literal['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']] = None

class RiskFactorContributionModel(BaseModel):
    rule_id: str
    rule_name: str
    category: str
    score_contribution: float
    measured_value: str
    threshold_applied: str
    description: str
    evidence_summary: str

class RiskScoreResponse(BaseModel):
    final_score: float
    severity: Literal['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    factor_contributions: List[RiskFactorContributionModel]
    supporting_txn_ids: List[str]
    scoring_model_version: str
    calculated_at: str
    summary: str

class CaseCreateModel(BaseModel):
    title: str = Field(..., min_length=5, max_length=256)
    priority: Literal['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'] = 'P2_HIGH'
    primary_txn_id: str
    initial_note: Optional[str] = None

class DispositionRequest(BaseModel):
    disposition: Literal['CLEARED_FALSE_POSITIVE', 'SAR_FILED', 'ACCOUNT_FROZEN', 'ESCALATED_LEGAL']
    notes: str = Field(..., min_length=10)
    sar_reference: Optional[str] = None

class CopilotQueryRequest(BaseModel):
    txn_id: str
    question: str = Field(..., min_length=3, max_length=500)
