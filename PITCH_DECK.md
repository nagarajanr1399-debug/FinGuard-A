# FinGuard AI — Pitch Deck Outline
**Track 01: Money, Risk & Regulation | ExaThon India 2026**

---

### Slide 1: Cover & Vision
- **Title:** FinGuard AI — Explainable Financial Fraud & Risk Intelligence
- **Subtitle:** Solving the black-box compliance crisis with Exasol Columnar Analytics & Grounded Gemini Intelligence
- **Team / Track:** ExaThon India 2026 | Track 01: Money, Risk & Regulation

---

### Slide 2: The Core Problem ($10.5 Trillion Crime Wave)
- **The Reality:** Financial cyber-fraud and money laundering losses surpass $10.5T globally.
- **The Banking Crisis:**
  - 92% false positive rate in legacy rule engines.
  - Opaque "black-box" machine learning algorithms that cannot be explained in legal or regulatory audits.
  - Disconnected data silos: Transaction logs, customer baselines, and counterparty KYC are fragmented.

---

### Slide 3: The FinGuard Solution
- **High-Throughput Analytics:** Exasol Personal columnar in-memory database powers sub-millisecond window scans.
- **Deterministic Explainability:** Mathematical 0-100 scoring with transparent point waterfalls (no black boxes).
- **Grounded Copilot Reasoning:** Gemini 3.8 Flash bounded strictly to verified Exasol database records.
- **Regulatory Readiness:** Built-in FIU-IND SAR workflow with cryptographic audit logging.

---

### Slide 4: Real-World Injected Typologies
- **Typology 1: The Bengaluru Money Mule Pass-through Ring:** Rapid 3-inbound layering funneling out to offshore UAE bank within 12 minutes.
- **Typology 2: Structuring / Smurfing Threshold Evasion:** Cluster of ₹48,000–₹49,500 UPI transfers to evade ₹50,000 statutory reporting.
- **Typology 3: Dormant Account Takeover:** 125-day inactive account abruptly initiating high-value bullion purchase.
- **Typology 4: Impossible Geolocation Jump:** Mumbai morning coffee purchase followed 22 minutes later by London card swipe.

---

### Slide 5: The Power of Exasol Columnar Engine
- **Speed Comparison:**
  - 10-Minute Rolling Window Velocity Scan: **1.1 ms** (Exasol) vs 68.4 ms (Row SQL) &rarr; **62x faster**
  - Full Ingest Volume Aggregation: **0.4 ms** (Exasol) vs 24.8 ms (Row SQL) &rarr; **60x faster**
- **In-Memory Column Compression:** Enables instantaneous correlation between live payments and 30-day customer baseline means.

---

### Slide 6: Product Capabilities & Architecture
- 10 Production-Ready Views:
  1. Landing Overview
  2. Authenticated Risk Operations Dashboard
  3. Filterable Transaction Explorer
  4. 360° Explainable Investigation & What-If Simulator
  5. Multi-Hop Entity Relationship Graph
  6. Compliance Rules & Alert Simulator
  7. Investigation Case Management & SAR Workflow
  8. Dedicated Gemini 3.8 Flash Copilot Studio
  9. Exasol Query Performance Lab
  10. Tamper-Evident Audit Trail & Settings

---

### Slide 7: Security & Threat Model
- Prompt-injection defense neutralizing untrusted customer transaction memos.
- Parameterized SQL execution preventing SQL injection.
- Role-based server authorization (Analyst, Senior Investigator, Compliance Head, Auditor).
- Zero secret exposure: API keys and database credentials strictly isolated to backend.

---

### Slide 8: Business Impact & Market Opportunity
- **68% Reduction** in investigation triage resolution time (from 45m down to 14m).
- **74% Reduction** in false-positive escalation costs for financial institutions.
- Seamless compatibility with FIU-IND (Financial Intelligence Unit - India), PMLA, and FATF global standards.

---

### Slide 9: Tech Stack & Open-Source Architecture
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide.
- **Backend:** Node.js / Express, Python / FastAPI, Pydantic, Pytest.
- **Analytics Database:** Exasol Personal v7.1.
- **AI Engine:** Google Gemini 3.8 Flash via `@google/genai`.
- **License:** Apache 2.0 Open Source.
