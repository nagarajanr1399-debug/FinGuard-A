# FinGuard AI — Architectural Specification
**ExaThon India 2026 | Track 01: Money, Risk & Regulation**
*Explainable Financial Fraud & Risk Intelligence*

---

## 1. System Topology & ASCII Data Flow Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    FINGUARD AI ARCHITECTURE                                        |
+----------------------------------------------------------------------------------------------------+

     [ Banking Core / Synthetic Channels ]
       - UPI (PhonePe, GPay, Paytm)
       - IMPS / NEFT / RTGS / SWIFT / Card
                        |
                        v
        +-------------------------------+
        |    High-Throughput Ingestion   |
        |  - Seeded Generator (2026)    |
        |  - Injected Fraud Topologies  |
        +-------------------------------+
                        |
                        v
   +------------------------------------------+
   |   EXASOL PERSONAL COLUMNAR DATABASE       |
   |   Port: 8563 | Schema: FINGUARD          |
   |                                          |
   |   - Table: CUSTOMERS (Baselines)         |
   |   - Table: TRANSACTIONS (High Throughput)|
   |   - Table: RISK_FEATURES (Vectors)       |
   |   - Table: RISK_ALERTS (Scores)          |
   |   - Table: INVESTIGATION_CASES           |
   |   - Table: AUDIT_EVENTS (Tamper-evident) |
   |                                          |
   |   Analytic Capabilities:                 |
   |   * 10m/1h Window Velocity Partitioning  |
   |   * 30-Day Z-Score Baseline Calculation  |
   |   * Sub-10ms In-Memory Column Scans      |
   +------------------------------------------+
           |                          |
           | Analytical Facts         | Historical Evidence
           v                          v
+--------------------------+  +--------------------------------------------+
| DETERMINISTIC RISK ENGINE|  | GROUNDED GEMINI 3.8 FLASH COPILOT          |
| Model: v2.6.1-exasol     |  | (Backend Only via @google/genai SDK)       |
|                          |  |                                            |
| Score: 0 to 100          |  | 1. Bounded JSON Context:                   |
| Factors:                 |  |    DATABASE_FACTS = { ... }                |
| - Baseline Dev (Max 35)  |  | 2. Prompt-Injection Defense:               |
| - 10m Velocity (Max 25)  |  |    Sanitizes untrusted memos/notes         |
| - New Beneficiary(Max 20)|  | 3. Structured Output:                      |
| - Smurfing Bands (Max 25)|  |    - Verified Database Facts               |
| - Geo Anomaly   (Max 15) |  |    - Rule Attribution Matrix               |
| - Dormancy Surge (Max 15)|  |    - SAR Filing Determination Checklist    |
+--------------------------+  +--------------------------------------------+
           |                                  |
           +------------------+---------------+
                              |
                              v
        +----------------------------------------------+
        | FULL-STACK EXPRESS & FASTAPI API GATEWAY     |
        | - Role-Based Access Control (Analyst/Admin)  |
        | - REST Endpoints (/api/transactions, etc.)   |
        | - Immutable Hash Chaining Audit Recorder     |
        +----------------------------------------------+
                              |
                              v
        +----------------------------------------------+
        | REACT 19 / TAILWIND CSS V4 FORENSIC CONSOLE   |
        | 1. Landing Overview                          |
        | 2. Authenticated Risk Dashboard              |
        | 3. Transaction Explorer & Filters            |
        | 4. 360° Transaction Investigation            |
        | 5. Multi-Hop Entity Relationship Graph       |
        | 6. Compliance Rules & Alert Simulator        |
        | 7. Case Management & FIU-IND SAR Workflow    |
        | 8. Dedicated Gemini Copilot Studio           |
        | 9. Exasol Query Performance Lab              |
        | 10. Audit Log & System Configuration         |
        +----------------------------------------------+
```

---

## 2. Component Specifications

### 2.1 Exasol Columnar Database
- **Role:** High-speed analytical store executing aggregation queries, baseline deviation Z-scores, and rolling temporal window calculations over millions of transactions.
- **Tables:** `CUSTOMERS`, `TRANSACTIONS`, `RISK_FEATURES`, `RISK_ALERTS`, `INVESTIGATION_CASES`, `AUDIT_EVENTS`.
- **Honest Diagnostics:** System provides real socket probing (`EXASOL_HOST:EXASOL_PORT`) with microsecond resolution latency feedback. An explicitly labelled sandbox mode provides full query fidelity if the Exasol daemon is not connected.

### 2.2 Deterministic Explainable Risk Engine
- **Formula:** $Score = \min\left(100, \sum_{i=1}^{n} w_i \cdot \mathbb{I}(\text{factor}_i)\right)$
- **Attributes:**
  - Guaranteed reproducibility (same inputs $\to$ same score).
  - Explicit factor waterfall showing rule identifier, measured value, threshold applied, and score points added.
  - No black-box opacity.

### 2.3 Gemini 3.8 Flash Grounding & Prompt-Injection Immunity
- Accessed solely via the trusted backend using `@google/genai`.
- Strict bounded context: The model is given a verified `DATABASE_FACTS` dictionary containing only facts retrieved from Exasol.
- Untrusted user fields (memos, comments, external notes) are stripped of instruction markers and labeled as untrusted user text.
- Model is prohibited from executing SQL directly; queries are handled strictly by approved, parameterized query procedures.
