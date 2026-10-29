/**
 * FinGuard AI — Express Server & API Backend
 * Track 01: Money, Risk & Regulation | ExaThon India 2026
 * Entry point for full-stack application running Vite middlewares in dev mode.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { RiskEngine, DEFAULT_RULES } from './src/backend/riskEngine.ts';
import { ExasolDatabase } from './src/backend/exasol.ts';
import { InvestigationCopilot } from './src/backend/copilot.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Request Parsing & Security Headers
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Initialize Domain Services
const riskEngine = new RiskEngine();
const db = new ExasolDatabase(riskEngine);
const copilot = new InvestigationCopilot(db);

// Session State for Prototype Evaluation
interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'ANALYST' | 'SENIOR_INVESTIGATOR' | 'COMPLIANCE_HEAD' | 'AUDITOR';
  organization: string;
  permissions: string[];
}

let currentUser: SessionUser = {
  id: 'usr-901',
  name: 'Devin Vance',
  email: 'devin.vance@finguard-ai.internal',
  role: 'SENIOR_INVESTIGATOR',
  organization: 'State Risk & Financial Intelligence Unit',
  permissions: ['VIEW_TRANSACTIONS', 'RUN_COPILOT', 'CREATE_CASE', 'FILE_SAR', 'MODIFY_RULES', 'VIEW_AUDIT'],
};

// --- AUTHENTICATION ENDPOINTS ---
app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({
    user: currentUser,
    auth_provider: 'Firebase & FinGuard Enterprise Gateway',
    firebase_configured: !!process.env.FIREBASE_PROJECT_ID,
  });
});

app.post('/api/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const validRoles = ['ANALYST', 'SENIOR_INVESTIGATOR', 'COMPLIANCE_HEAD', 'AUDITOR'] as const;
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role provided' });
  }

  const rolePermissions: Record<typeof validRoles[number], string[]> = {
    ANALYST: ['VIEW_TRANSACTIONS', 'RUN_COPILOT', 'CREATE_CASE', 'VIEW_AUDIT'],
    SENIOR_INVESTIGATOR: ['VIEW_TRANSACTIONS', 'RUN_COPILOT', 'CREATE_CASE', 'FILE_SAR', 'VIEW_AUDIT'],
    COMPLIANCE_HEAD: ['VIEW_TRANSACTIONS', 'RUN_COPILOT', 'CREATE_CASE', 'FILE_SAR', 'MODIFY_RULES', 'VIEW_AUDIT', 'RESEED_DATA'],
    AUDITOR: ['VIEW_TRANSACTIONS', 'VIEW_AUDIT'],
  };

  const typedRole = role as typeof validRoles[number];
  currentUser = {
    ...currentUser,
    role: typedRole,
    permissions: rolePermissions[typedRole],
  };

  db.logAuditEvent({
    event_id: `AUDIT-${Date.now()}-ROLE-SWITCH`,
    event_timestamp: new Date().toISOString(),
    actor_id: currentUser.id,
    actor_role: currentUser.role,
    action_type: 'MODIFY_RULE_CONFIG',
    target_entity: 'SESSION',
    target_id: currentUser.id,
    details: { new_role: role },
  });

  res.json({ success: true, user: currentUser });
});

// --- DASHBOARD ENDPOINTS ---
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch dashboard metrics' });
  }
});

// --- TRANSACTIONS ENDPOINTS ---
app.get('/api/transactions', (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      severity: req.query.severity as string,
      channel: req.query.channel as string,
      status: req.query.status as string,
      minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
      maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    };
    const result = db.getTransactions(filters);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to query transactions' });
  }
});

app.get('/api/transactions/:id', (req: Request, res: Response) => {
  try {
    const result = db.getTransactionById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: `Transaction ${req.params.id} not found` });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transactions/:id/graph', (req: Request, res: Response) => {
  try {
    const result = db.getTransactionGraph(req.params.id);
    if (!result) {
      return res.status(404).json({ error: `Graph for transaction ${req.params.id} not found` });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// What-if Risk Rescore
app.post('/api/transactions/:id/rescore', (req: Request, res: Response) => {
  try {
    const txnData = db.getTransactionById(req.params.id);
    if (!txnData || !txnData.transaction || !txnData.customer) {
      return res.status(404).json({ error: 'Transaction or customer baseline not found' });
    }

    const { amount, is_new_beneficiary, counterparty_country } = req.body;
    const modifiedTxn = {
      ...txnData.transaction,
      amount: amount !== undefined ? Number(amount) : txnData.transaction.amount,
      is_new_beneficiary: is_new_beneficiary !== undefined ? Boolean(is_new_beneficiary) : txnData.transaction.is_new_beneficiary,
      counterparty_country: counterparty_country !== undefined ? counterparty_country : txnData.transaction.counterparty_country,
    };

    const rescoreResult = riskEngine.evaluate(modifiedTxn, txnData.customer, txnData.recent_history);
    res.json(rescoreResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- COMPLIANCE RULES ENDPOINTS ---
app.get('/api/rules', (req: Request, res: Response) => {
  res.json({ rules: riskEngine.getRules(), version: riskEngine.modelVersion });
});

app.put('/api/rules/:id', (req: Request, res: Response) => {
  const { enabled, threshold, weight } = req.body;
  const ok = riskEngine.updateRule(req.params.id, {
    ...(enabled !== undefined ? { enabled: Boolean(enabled) } : {}),
    ...(threshold !== undefined ? { threshold: Number(threshold) } : {}),
    ...(weight !== undefined ? { weight: Number(weight) } : {}),
  });

  if (!ok) {
    return res.status(404).json({ error: `Rule ${req.params.id} not found` });
  }

  db.logAuditEvent({
    event_id: `AUDIT-${Date.now()}-RULE-UPDATE`,
    event_timestamp: new Date().toISOString(),
    actor_id: currentUser.id,
    actor_role: currentUser.role,
    action_type: 'MODIFY_RULE_CONFIG',
    target_entity: 'COMPLIANCE_RULE',
    target_id: req.params.id,
    details: { enabled, threshold, weight },
  });

  res.json({ success: true, rules: riskEngine.getRules() });
});

// --- INVESTIGATION CASES ENDPOINTS ---
app.get('/api/cases', (req: Request, res: Response) => {
  res.json({ cases: db.getCases() });
});

app.get('/api/cases/:id', (req: Request, res: Response) => {
  const c = db.getCaseById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  res.json({ case: c });
});

app.post('/api/cases', (req: Request, res: Response) => {
  try {
    const { title, priority, primaryTxnId, initialNote } = req.body;
    if (!title || !primaryTxnId) {
      return res.status(400).json({ error: 'Title and primaryTxnId are required' });
    }

    const newCase = db.createCase({
      title,
      priority: priority || 'P2_HIGH',
      primaryTxnId,
      assignedAnalyst: currentUser.name,
      initialNote,
    });

    res.status(201).json({ case: newCase });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases/:id/disposition', (req: Request, res: Response) => {
  try {
    const { disposition, notes, sarReference } = req.body;
    if (!disposition || !notes) {
      return res.status(400).json({ error: 'Disposition and notes are required' });
    }

    const ok = db.updateCaseDisposition(
      req.params.id,
      disposition,
      notes,
      currentUser.name,
      sarReference
    );

    if (!ok) return res.status(404).json({ error: 'Case not found' });
    res.json({ success: true, case: db.getCaseById(req.params.id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases/:id/notes', (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Note text required' });

    const ok = db.addCaseNote(req.params.id, currentUser.name, text);
    if (!ok) return res.status(404).json({ error: 'Case not found' });
    res.json({ success: true, case: db.getCaseById(req.params.id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- GEMINI INVESTIGATION COPILOT ---
app.post('/api/copilot/ask', async (req: Request, res: Response) => {
  try {
    const { txnId, question } = req.body;
    if (!txnId || !question) {
      return res.status(400).json({ error: 'txnId and question are required' });
    }

    const response = await copilot.investigate({
      txnId,
      question,
      analystId: currentUser.id,
      analystRole: currentUser.role,
    });

    db.logAuditEvent({
      event_id: `AUDIT-${Date.now()}-COPILOT`,
      event_timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_role: currentUser.role,
      action_type: 'COPILOT_QUERY',
      target_entity: 'TRANSACTION',
      target_id: txnId,
      details: { question, latency_ms: response.latency_ms },
    });

    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Copilot investigation failed' });
  }
});

// --- PERFORMANCE LAB & BENCHMARK ---
app.get('/api/performance/benchmark', (req: Request, res: Response) => {
  try {
    const benchmarks = db.runBenchmarkSuite();
    res.json({ benchmarks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- DATABASE HEALTH & CONFIG ---
app.get(['/api/health', '/api/db/health'], async (req: Request, res: Response) => {
  try {
    const health = await db.checkHealth();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/config', async (req: Request, res: Response) => {
  try {
    const health = await db.checkHealth();
    res.json({ success: true, health });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Re-seed Synthetic Dataset
app.post('/api/seed/reset', (req: Request, res: Response) => {
  try {
    const seed = req.body.seed ? parseInt(req.body.seed, 10) : 2026;
    const count = req.body.count ? parseInt(req.body.count, 10) : 250;
    db.initializeData(seed, count);
    res.json({
      success: true,
      message: `Synthetic dataset successfully regenerated with seed=${seed} (${count} records).`,
      health: db.getDashboardStats(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUDIT LOGS ---
app.get('/api/audit', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  res.json({ audit_events: db.getAuditEvents(limit) });
});

// --- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FinGuard AI] Full-stack engine running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[FinGuard AI] Server failed to start:', err);
});
