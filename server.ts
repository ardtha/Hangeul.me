import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';

type PlanCycle = 'free' | 'monthly' | 'annual';
type TransactionPlan = 'monthly' | 'annual';

interface UserProgressSnapshot {
  xp: number;
  bestStreak: number;
  dailyStreak: number;
  lastActiveDate: string;
  streakFreezeCount: number;
  favorites: string[];
  moduleMastery: Record<string, number>;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  planCycle: PlanCycle;
  passwordHash: string;
  createdAt: string;
  progress: UserProgressSnapshot;
}

interface RevenueTransaction {
  id: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  plan: TransactionPlan;
  planLabel: string;
  amountIdr: number;
  method: string;
  status: 'paid';
  createdAt: string;
}

interface ServerStore {
  users: StoredUser[];
  transactions: RevenueTransaction[];
}

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  jti: string;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  authUser?: {
    id: string;
    name: string;
    email: string;
    isPro: boolean;
    planCycle: PlanCycle;
    createdAt: string;
    progress: UserProgressSnapshot;
  };
  tokenJti?: string;
}

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, '.data');
const STORE_PATH = path.join(DATA_DIR, 'hangeul-store.json');

const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16
    ? process.env.SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

const revokedTokens = new Set<string>();

const PLAN_PRICES: Record<TransactionPlan, { label: string; amountIdr: number }> = {
  monthly: { label: 'Hangeul.me Pro Bulanan', amountIdr: 49000 },
  annual: { label: 'Hangeul.me Pro Tahunan', amountIdr: 399000 },
};

function createDefaultProgress(): UserProgressSnapshot {
  return {
    xp: 0,
    bestStreak: 0,
    dailyStreak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    streakFreezeCount: 0,
    favorites: [],
    moduleMastery: {},
  };
}

function normalizeProgress(raw?: Partial<UserProgressSnapshot>): UserProgressSnapshot {
  const base = createDefaultProgress();
  if (!raw || typeof raw !== 'object') return base;
  return {
    xp: Number.isFinite(raw.xp) ? Math.max(0, Math.floor(Number(raw.xp))) : base.xp,
    bestStreak: Number.isFinite(raw.bestStreak)
      ? Math.max(0, Math.floor(Number(raw.bestStreak)))
      : base.bestStreak,
    dailyStreak: Number.isFinite(raw.dailyStreak)
      ? Math.max(1, Math.floor(Number(raw.dailyStreak)))
      : base.dailyStreak,
    lastActiveDate:
      typeof raw.lastActiveDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastActiveDate)
        ? raw.lastActiveDate
        : base.lastActiveDate,
    streakFreezeCount: Number.isFinite(raw.streakFreezeCount)
      ? Math.max(0, Math.floor(Number(raw.streakFreezeCount)))
      : base.streakFreezeCount,
    favorites: Array.isArray(raw.favorites)
      ? raw.favorites.filter((x): x is string => typeof x === 'string').slice(0, 300)
      : [],
    moduleMastery:
      raw.moduleMastery && typeof raw.moduleMastery === 'object' ? { ...raw.moduleMastery } : {},
  };
}

function createDefaultStore(): ServerStore {
  return {
    users: [],
    transactions: [],
  };
}

function loadStore(): ServerStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<ServerStore>;
      return {
        users: Array.isArray(parsed.users)
          ? parsed.users.map((u) => ({
              ...u,
              progress: normalizeProgress(u.progress),
            }))
          : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      };
    }
  } catch {
    // Fallback to initial store on parse failure
  }
  const initial = createDefaultStore();
  saveStore(initial);
  return initial;
}

function saveStore(store: ServerStore): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

const store: ServerStore = loadStore();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(keyHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function signToken(payload: Omit<TokenPayload, 'jti' | 'exp'>): string {
  const fullPayload: TokenPayload = {
    ...payload,
    jti: crypto.randomUUID(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf-8');
  const expBuf = Buffer.from(expectedSig, 'utf-8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as TokenPayload;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    if (revokedTokens.has(parsed.jti)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function sanitizeUser(u: StoredUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    isPro: u.isPro,
    planCycle: u.planCycle,
    createdAt: u.createdAt,
    progress: normalizeProgress(u.progress),
  };
}

function authenticateMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sesi tidak ditemukan. Silakan masuk terlebih dahulu.' });
    return;
  }
  const token = header.slice(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Sesi berakhir atau tidak valid. Silakan masuk ulang.' });
    return;
  }

  req.tokenJti = payload.jti;

  const found = store.users.find((u) => u.id === payload.sub);
  if (!found) {
    res.status(401).json({ error: 'Akun tidak ditemukan.' });
    return;
  }
  req.authUser = sanitizeUser(found);
  next();
}

type AuthenticatedUser = NonNullable<AuthenticatedRequest['authUser']>;

function requireAuthUser(req: AuthenticatedRequest, res: Response): AuthenticatedUser | null {
  if (!req.authUser) {
    res.status(401).json({ error: 'Sesi tidak ditemukan. Silakan masuk terlebih dahulu.' });
    return null;
  }
  return req.authUser;
}

function validateRegisterInput(body: {
  name?: string;
  email?: string;
  password?: string;
}): { error?: string; name: string; email: string; password: string } {
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (name.length < 2) {
    return { error: 'Nama lengkap minimal 2 karakter.', name, email, password };
  }
  if (!email.includes('@') || email.length < 5) {
    return { error: 'Masukkan alamat email yang valid.', name, email, password };
  }
  if (password.length < 6) {
    return { error: 'Kata sandi minimal 6 karakter.', name, email, password };
  }
  return { name, email, password };
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Register new learner account
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

  // Login for learner
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

  // Save learner progress to server store
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

  // Public weekly leaderboard based strictly on real registered learners
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

  // Checkout Pro subscription for learner
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
