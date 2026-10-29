"""
FinGuard AI — FastAPI Backend Application
Track 01: Money, Risk & Regulation | ExaThon India 2026
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import os
import time

from .models import (
    CustomerModel, TransactionModel, RiskScoreResponse,
    CaseCreateModel, DispositionRequest, CopilotQueryRequest
)
from .risk_engine import RiskEngine
from .exasol_db import ExasolDB

app = FastAPI(
    title="FinGuard AI — Risk & Fraud Intelligence API",
    version="2.6.0",
    description="Explainable fraud detection, Exasol columnar analytics, and grounded AI copilot"
)

# CORS Allowlist
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_engine = RiskEngine()
exasol_db = ExasolDB()

@app.on_event("startup")
def startup_event():
    exasol_db.connect()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engine_status": "ACTIVE",
        "engine_type": "High-Throughput In-Memory Columnar Engine",
        "engine_version": risk_engine.MODEL_VERSION,
        "timestamp": time.time(),
    }

@app.post("/api/risk/evaluate", response_model=RiskScoreResponse)
def evaluate_risk(payload: Dict[str, Any]):
    txn = payload.get("transaction", {})
    customer = payload.get("customer", {})
    recent_txns = payload.get("recent_transactions", [])
    
    if not txn or not customer:
        raise HTTPException(status_code=400, detail="Transaction and customer objects are required")

    result = risk_engine.evaluate(txn, customer, recent_txns)
    return result

@app.get("/api/rules")
def get_rules():
    return {"rules": risk_engine.rules, "version": risk_engine.MODEL_VERSION}
