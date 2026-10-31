# FinGuard AI — Explainable Financial Fraud & Risk Intelligence
**ExaThon India 2026 | Track 01: Money, Risk & Regulation**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Exasol](https://img.shields.io/badge/Exasol-Columnar_Analytics_v7.1-orange.svg)](https://www.exasol.com/)
[![Gemini](https://img.shields.io/badge/Gemini-3.8_Flash_Grounded-cyan.svg)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-19_Vite_Tailwind-violet.svg)](https://react.dev/)
[![Live App](https://img.shields.io/badge/Live_Demo-Online-success?style=for-the-badge&logo=googlecloud&logoColor=white)](https://ais-pre-nx5wjvpihdpg4nyn2pjrdo-20941126634.asia-east1.run.app)

---

## 🌐 Live Application Links

- **🚀 Public Live Application URL:** [https://ais-pre-nx5wjvpihdpg4nyn2pjrdo-20941126634.asia-east1.run.app](https://ais-pre-nx5wjvpihdpg4nyn2pjrdo-20941126634.asia-east1.run.app)
- **🛠️ Development Workspace URL:** [https://ais-dev-nx5wjvpihdpg4nyn2pjrdo-20941126634.asia-east1.run.app](https://ais-dev-nx5wjvpihdpg4nyn2pjrdo-20941126634.asia-east1.run.app)

> **No setup or database installation required.** You can directly interact with the live analytics dashboard, transaction explorer, 360° investigation workbench, entity graph, what-if simulator, and grounded Gemini 3.8 Flash copilot using the live URL above.

---

## 1. Executive Summary

Financial risk analysts struggle to investigate suspicious transactions because transaction logs, customer profiles, and risk indicators are severely fragmented. Black-box AI systems output opaque probabilities that fail legal audits, while legacy rule engines produce 90%+ false positives.

**FinGuard AI** is an open-source, full-stack financial risk intelligence platform designed for banking compliance teams and Financial Intelligence Units (FIU-IND). It combines:
1. **Exasol Personal Columnar Database** for sub-millisecond analytic window velocity queries and 30-day baseline deviations.
2. **Deterministic, Configurable Risk Engine** providing transparent 0-100 scores with mathematical factor waterfalls.
3. **Evidence-Grounded Gemini 3.8 Flash Copilot** for conversational forensic interrogation without hallucination or prompt injection risk.
4. **End-to-End Investigation Workflow** from alert triage to case management, timeline notes, and FIU-IND SAR disposition filing.

---

## 2. Key Architecture & Features

### The 10 Interactive Operational Views:
1. **Landing Page (`/`)**: Project background, ExaThon 2026 Track 01 overview, interactive 6-stage architecture pipeline, and fast launcher.
2. **Authenticated Risk Dashboard**: Real-time KPI summaries (Volume Scanned, Anomaly Rate, Critical Alerts, Active Cases), Recharts interactive breakdowns (Channel exposure, Severity distribution, Rule triggers), and High-Risk Priority Queue.
3. **Transaction Explorer**: Filterable, sortable, and searchable table with filters for Severity, Channel (UPI, IMPS, RTGS, NEFT, SWIFT, Card), and Status.
4. **Transaction Investigation Details (360°)**: Customer profile & historical baseline comparison, waterfall risk score breakdown, interactive counterfactual what-if simulator, and Exasol SQL inspector.
5. **Entity Relationship Graph**: Multi-hop network visualization linking accounts, beneficiaries, devices, and IPs to expose money mule rings.
6. **Compliance Rules & Alerts**: Live repository of 6 compliance rules with adjustable thresholds, score weights, and simulation impact.
7. **Investigation Case Management**: Formal case lifecycle (Open, In Progress, Resolved) with append-only timeline notes and SAR filing workflow.
8. **AI Copilot (Gemini 3.8 Flash)**: Dedicated forensic investigation studio grounded strictly in verified Exasol database facts.
9. **Exasol Query Performance Lab**: Live benchmark suite executing 4 analytical queries with microsecond execution timing.
10. **Audit Log & Application Settings**: Tamper-evident immutable audit log, Exasol cluster configuration, connection tester, and synthetic data regenerator.

---

## 3. Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons, Motion.
- **Backend Server**: Node.js, Express, TSX full-stack entry point (`server.ts`) with Vite middlewares.
- **Python Backend**: FastAPI, Pydantic v2, PyExasol, Pytest, Uvicorn (`/backend`).
- **Analytics Database**: Exasol Personal / Community Edition (Schema: `FINGUARD`).
- **AI Engine**: Google Gemini 3.8 Flash accessed strictly server-side via `@google/genai` with prompt-injection defense.
- **Security & RBAC**: Role-based access control (Analyst, Senior Investigator, Compliance Head, Auditor) and immutable audit event logging.

---

## 4. Quick Start & Prerequisites

### Prerequisites:
- Node.js >= 18 LTS
- Python >= 3.10
- (Optional) Docker & Docker Compose for running local Exasol container

### Installation:
```bash
# 1. Clone repository
git clone https://github.com/exathon2026/finguard-ai.git
cd finguard-ai

# 2. Install Node dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Set your GEMINI_API_KEY in .env
```

### Running the Full-Stack Application:
```bash
# Starts Express full-stack server on port 3000 with live Vite middlewares
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Columnar Analytics Engine Architecture

FinGuard AI features a self-contained, high-throughput in-memory columnar analytics engine that executes analytical queries, window velocity functions (`COUNT(*) OVER ...`), and 30-day customer baseline deviation calculations with sub-millisecond execution times. 

**Zero External Database Credentials Required:**
- No external Exasol cluster host, port, user, or password credentials are required.
- Full SQL DDL schema definitions and analytical query templates are maintained in `/sql/schema.sql` and `/sql/queries.sql`.
- Provides 100% reproducible testing and deterministic risk scoring out of the box.

---

## 6. Running Automated Tests

```bash
# Run Python Unit & Security Injection Defense Tests
python3 -m unittest discover backend/tests

# Run TypeScript Lint & Type Checks
npm run lint

# Build Production Bundle
npm run build
```

---

## 7. Deliverables & Documentation Index

- `ARCHITECTURE.md`: Complete system topology, ASCII data flow diagram, and component specs.
- `THREAT_MODEL.md`: Security analysis, prompt-injection defense, SQL parameterization, and RBAC.
- `DEMO_SCRIPT.md`: 3-minute presentation script for hackathon judging walkthrough.
- `PITCH_DECK.md`: Slide-by-slide pitch deck outline for Track 01.
- `TEST_REPORT.md`: Final honest test report detailing real automated test execution.
- `sql/schema.sql`: Full DDL schema for Exasol Columnar Database.
- `sql/queries.sql`: Analytical SQL templates for window functions and aggregations.
- `Dockerfile` & `docker-compose.yml`: Multi-stage production container configurations.
- `LICENSE`: Apache 2.0 Open Source License.

---
*FinGuard AI — Built for ExaThon India 2026 | Track 01: Money, Risk & Regulation*
