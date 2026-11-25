import type { Request } from 'express';

export type PlanCycle = 'free' | 'monthly' | 'annual';
export type TransactionPlan = 'monthly' | 'annual';

export interface UserProgressSnapshot {
  xp: number;
  bestStreak: number;
  dailyStreak: number;
  lastActiveDate: string;
  streakFreezeCount: number;
  favorites: string[];
  moduleMastery: Record<string, number>;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  planCycle: PlanCycle;
  passwordHash: string;
  createdAt: string;
  progress: UserProgressSnapshot;
}

export interface RevenueTransaction {
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

export interface ServerStore {
  users: StoredUser[];
  transactions: RevenueTransaction[];
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  jti: string;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  planCycle: PlanCycle;
  createdAt: string;
  progress: UserProgressSnapshot;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
  tokenJti?: string;
}
