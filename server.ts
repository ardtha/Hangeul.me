import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import express from 'express';
import {
  authenticateMiddleware,
  hashPassword,
  requireAuthUser,
  revokedTokens,
  signToken,
  validateRegisterInput,
  verifyPassword,
} from './server/auth.ts';
import {
  normalizeProgress,
  PLAN_PRICES,
  sanitizeUser,
  saveStore,
  store,
} from './server/store.ts';
import type {
  AuthenticatedRequest,
  RevenueTransaction,
  StoredUser,
  TransactionPlan,
  UserProgressSnapshot,
} from './server/types.ts';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT_DIR = process.cwd();

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/auth/register', (req, res) => {
    const body = req.body as {
      name?: string;
      email?: string;
      password?: string;
      initialProgress?: Partial<UserProgressSnapshot>;
    };
    const validated = validateRegisterInput(body);
    if (validated.error) {
      res.status(400).json({ error: validated.error });
      return;
    }

    const { name, email, password } = validated;
    if (store.users.some((u) => u.email.toLowerCase() === email)) {
      res.status(409).json({ error: 'Email sudah terdaftar. Silakan masuk menggunakan akun Anda.' });
      return;
    }

    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      name,
      email,
      isPro: false,
      planCycle: 'free',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString().slice(0, 10),
      progress: normalizeProgress(body.initialProgress),
    };

    store.users.unshift(newUser);
    saveStore(store);

    const token = signToken({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  app.post('/api/auth/login', (req, res) => {
    const body = req.body as { email?: string; password?: string };
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email) {
      res.status(400).json({ error: 'Email wajib diisi.' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Kata sandi wajib diisi.' });
      return;
    }

    const user = store.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Email atau kata sandi salah.' });
      return;
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
    res.json({ token, user: sanitizeUser(user) });
  });

  app.get('/api/auth/me', authenticateMiddleware, (req: AuthenticatedRequest, res) => {
    const authUser = requireAuthUser(req, res);
    if (!authUser) return;
    res.json({ user: authUser });
  });

  app.post('/api/auth/logout', authenticateMiddleware, (req: AuthenticatedRequest, res) => {
    if (req.tokenJti) {
      revokedTokens.add(req.tokenJti);
    }
    res.json({ ok: true });
  });

  app.put('/api/progress', authenticateMiddleware, (req: AuthenticatedRequest, res) => {
    const authUser = requireAuthUser(req, res);
    if (!authUser) return;

    const user = store.users.find((u) => u.id === authUser.id);
    if (!user) {
      res.status(404).json({ error: 'Akun tidak ditemukan.' });
      return;
    }

    const incoming = req.body as Partial<UserProgressSnapshot>;
    const normalized = normalizeProgress({
      ...user.progress,
      ...incoming,
    });
    user.progress = normalized;
    saveStore(store);

    res.json({ user: sanitizeUser(user), progress: normalized });
  });

  app.get('/api/leaderboard', (_req, res) => {
    const entries = store.users
      .map((u) => {
        const p = normalizeProgress(u.progress);
        return {
          id: u.id,
          name: u.name,
          isPro: u.isPro,
          xp: p.xp,
          dailyStreak: p.dailyStreak,
          bestStreak: p.bestStreak,
        };
      })
      .sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.dailyStreak !== a.dailyStreak) return b.dailyStreak - a.dailyStreak;
        return b.bestStreak - a.bestStreak;
      });

    res.json({ entries });
  });

  app.post('/api/transactions/checkout', authenticateMiddleware, (req: AuthenticatedRequest, res) => {
    const authUser = requireAuthUser(req, res);
    if (!authUser) return;

    const body = req.body as { plan?: string; method?: string };
    const plan: TransactionPlan = body.plan === 'monthly' ? 'monthly' : 'annual';
    const method = String(body.method ?? 'QRIS Instan').trim() || 'QRIS Instan';
    const price = PLAN_PRICES[plan];
    const today = new Date().toISOString().slice(0, 10);

    const tx: RevenueTransaction = {
      id: `INV-${new Date().getFullYear()}-${String(store.transactions.length + 1).padStart(3, '0')}`,
      userId: authUser.id,
      buyerName: authUser.name,
      buyerEmail: authUser.email,
      plan,
      planLabel: price.label,
      amountIdr: price.amountIdr,
      method,
      status: 'paid',
      createdAt: today,
    };

    store.transactions.unshift(tx);

    let updatedUser = authUser;
    const user = store.users.find((u) => u.id === authUser.id);
    if (user) {
      user.isPro = true;
      user.planCycle = plan;
      user.progress = {
        ...normalizeProgress(user.progress),
        streakFreezeCount: Math.max(user.progress?.streakFreezeCount ?? 0, 2),
      };
      updatedUser = sanitizeUser(user);
    }

    saveStore(store);
    res.status(201).json({ transaction: tx, user: updatedUser });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hangeul.me Web & Auth Server running on http://localhost:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start Hangeul.me server:', err);
  process.exit(1);
});
