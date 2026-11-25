import fs from 'node:fs';
import path from 'node:path';
import type {
  AuthenticatedUser,
  ServerStore,
  StoredUser,
  TransactionPlan,
  UserProgressSnapshot,
} from './types.ts';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, '.data');
const STORE_PATH = path.join(DATA_DIR, 'hangeul-store.json');

export const PLAN_PRICES: Record<TransactionPlan, { label: string; amountIdr: number }> = {
  monthly: { label: 'Hangeul.me Pro Bulanan', amountIdr: 49000 },
  annual: { label: 'Hangeul.me Pro Tahunan', amountIdr: 399000 },
};

export function createDefaultProgress(): UserProgressSnapshot {
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

export function normalizeProgress(raw?: Partial<UserProgressSnapshot>): UserProgressSnapshot {
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

export function saveStore(data: ServerStore): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function loadStore(): ServerStore {
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

export function sanitizeUser(u: StoredUser): AuthenticatedUser {
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

export const store: ServerStore = loadStore();
