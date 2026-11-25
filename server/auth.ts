import crypto from 'node:crypto';
import type { NextFunction, Response } from 'express';
import { sanitizeUser, store } from './store.ts';
import type { AuthenticatedRequest, AuthenticatedUser, TokenPayload } from './types.ts';

const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16
    ? process.env.SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

export const revokedTokens = new Set<string>();

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(keyHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function signToken(payload: Omit<TokenPayload, 'jti' | 'exp'>): string {
  const fullPayload: TokenPayload = {
    ...payload,
    jti: crypto.randomUUID(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
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

export function authenticateMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
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

export function requireAuthUser(
  req: AuthenticatedRequest,
  res: Response
): AuthenticatedUser | null {
  if (!req.authUser) {
    res.status(401).json({ error: 'Sesi tidak ditemukan. Silakan masuk terlebih dahulu.' });
    return null;
  }
  return req.authUser;
}

export function validateRegisterInput(body: {
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
