import React, { useEffect, useState } from 'react';
import { KeyRound, Lock, UserPlus, X } from 'lucide-react';
import type { AuthUser, UserProgressSnapshot } from '../lib/gameRules';

export type AuthModalTab = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  initialTab?: AuthModalTab;
  initialProgress?: UserProgressSnapshot;
  onClose: () => void;
  onLogin: (payload: { email: string; password: string }) => Promise<AuthUser>;
  onRegister: (payload: {
    name: string;
    email: string;
    password: string;
    initialProgress?: UserProgressSnapshot;
  }) => Promise<AuthUser>;
  onAuthenticated: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  initialTab = 'login',
  initialProgress,
  onClose,
  onLogin,
  onRegister,
  onAuthenticated,
}) => {
  const [tab, setTab] = useState<AuthModalTab>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setError('');
      setName('');
      setPassword('');
      setEmail('');
    }
  }, [open, initialTab]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user =
        tab === 'register'
          ? await onRegister({ name, email, password, initialProgress })
          : await onLogin({ email, password });
      onAuthenticated(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-md p-4"
    >
      <div className="ios-card w-full max-w-md rounded-[28px] bg-white/82 dark:bg-slate-900/80 border border-white/75 dark:border-white/15 p-6 sm:p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <KeyRound className="w-4 h-4" />
            <span>Akun Pelajar Hangeul.me</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog login"
            className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-white/70 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2
          id="auth-modal-title"
          className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white"
        >
          {tab === 'login' ? 'Masuk ke Akun Pelajar' : 'Daftar Akun Baru'}
        </h2>

        {/* Mode Tabs */}
        <div
          role="tablist"
          aria-label="Pilih metode masuk"
          className="mt-4 grid grid-cols-2 p-1 rounded-xl bg-slate-900/5 dark:bg-white/10 border border-white/60 dark:border-white/12 text-xs font-semibold"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'login'}
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`py-2 rounded-lg transition-colors whitespace-nowrap ${
              tab === 'login'
                ? 'bg-white/90 dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'register'}
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`py-2 rounded-lg transition-colors whitespace-nowrap ${
              tab === 'register'
                ? 'bg-white/90 dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {tab === 'register' && (
            <div>
              <label
                htmlFor="auth-name-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Nama Lengkap
              </label>
              <input
                id="auth-name-input"
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/12 bg-white/70 dark:bg-white/[0.06] text-sm text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Email
            </label>
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Kata Sandi
            </label>
            <input
              id="auth-password-input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {tab === 'register' ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>
              {submitting
                ? 'Memproses...'
                : tab === 'register'
                ? 'Buat Akun Gratis'
                : 'Masuk Sekarang'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
