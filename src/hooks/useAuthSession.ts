import { useCallback, useState } from 'react';
import type {
  AuthUser,
  LeaderboardEntry,
  RevenueTransaction,
  UserProgressSnapshot,
} from '../lib/gameRules';

export function useAuthSession() {
  // Session Bearer token lives strictly in React JS memory (never localStorage/sessionStorage)
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      initialProgress?: UserProgressSnapshot;
    }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { token?: string; user?: AuthUser; error?: string };
      if (!res.ok || !data.token || !data.user) {
        throw new Error(data.error || 'Pendaftaran gagal.');
      }
      setToken(data.token);
      setCurrentUser(data.user);
      return data.user;
    },
    []
  );

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { token?: string; user?: AuthUser; error?: string };
      if (!res.ok || !data.token || !data.user) {
        throw new Error(data.error || 'Login gagal. Periksa email dan kata sandi Anda.');
      }
      setToken(data.token);
      setCurrentUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore logout network error
      }
    }
    setToken(null);
    setCurrentUser(null);
  }, [token]);

  const syncProgress = useCallback(
    async (snapshot: UserProgressSnapshot) => {
      if (!token) return;
      try {
        const res = await fetch('/api/progress', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(snapshot),
        });
        if (res.ok) {
          const data = (await res.json()) as { user?: AuthUser };
          if (data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch {
        // Silent background sync tolerance
      }
    },
    [token]
  );

  const fetchLeaderboard = useCallback(async (): Promise<LeaderboardEntry[]> => {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) {
      throw new Error('Gagal memuat papan peringkat.');
    }
    const data = (await res.json()) as { entries?: LeaderboardEntry[] };
    return Array.isArray(data.entries) ? data.entries : [];
  }, []);

  const checkoutPro = useCallback(
    async (plan: 'monthly' | 'annual', method = 'QRIS Instan') => {
      if (!token) {
        throw new Error('Silakan masuk terlebih dahulu untuk mencatat transaksi.');
      }
      const res = await fetch('/api/transactions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, method }),
      });
      const data = (await res.json()) as {
        user?: AuthUser;
        transaction?: RevenueTransaction;
        error?: string;
      };
      if (!res.ok || !data.user || !data.transaction) {
        throw new Error(data.error || 'Pembayaran gagal diproses.');
      }
      setCurrentUser(data.user);
      return data;
    },
    [token]
  );

  return {
    token,
    currentUser,
    register,
    login,
    logout,
    syncProgress,
    fetchLeaderboard,
    checkoutPro,
  };
}

