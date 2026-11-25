import React, { useState } from 'react';
import { BookOpen, Check, Lock, Snowflake, X } from 'lucide-react';
import { formatIdr } from '../../lib/gameRules';

export type PaywallReason = 'module' | 'general';

interface PaywallModalProps {
  open: boolean;
  reason: PaywallReason;
  contextTitle?: string;
  isLoggedIn: boolean;
  onClose: () => void;
  onActivatePro: (cycle: 'monthly' | 'annual') => void | Promise<void>;
  onViewBlueprint: () => void;
  onOpenAuth: () => void;
}

const REASON_COPY: Record<PaywallReason, { headline: string; summary: string }> = {
  module: {
    headline: 'Buka Unit Eksklusif Hangeul.me Pro',
    summary:
      'Unit K-Drama, Travel Seoul, EPS-TOPIK Kerja, dan Tata Bahasa lanjutan disiapkan khusus untuk anggota Pro.',
  },
  general: {
    headline: 'Tingkatkan ke Hangeul.me Pro',
    summary:
      'Buka seluruh jalur kurikulum Korea, kamus 600+ entri K-Drama & EPS-TOPIK, semua skenario tata bahasa, serta 2 Streak Freeze.',
  },
};

export const PaywallModal: React.FC<PaywallModalProps> = ({
  open,
  reason,
  contextTitle,
  isLoggedIn,
  onClose,
  onActivatePro,
  onViewBlueprint,
  onOpenAuth,
}) => {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('annual');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const copy = REASON_COPY[reason];

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onActivatePro(cycle);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-md p-4"
    >
      <div className="ios-card w-full max-w-lg rounded-[28px] bg-white/82 dark:bg-slate-900/80 border border-white/75 dark:border-white/15 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Lock className="w-4 h-4" />
            <span>Hangeul.me Pro</span>
            {contextTitle && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                  {contextTitle}
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog upgrade"
            className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-white/70 dark:bg-white/10 text-slate-600 dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2
          id="paywall-title"
          className="mt-3 font-display text-2xl font-extrabold text-slate-900 dark:text-white text-balance"
        >
          {copy.headline}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {copy.summary}
        </p>

        {/* Plan Selector */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCycle('annual')}
              className={`text-left p-4 rounded-2xl border-2 transition-colors ${
                cycle === 'annual'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/35 dark:border-emerald-500'
                  : 'border-white/70 dark:border-white/12 bg-white/55 dark:bg-white/[0.05] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span>Tahunan</span>
                <span>Hemat 32%</span>
              </div>
              <div className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                {formatIdr(399000)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Setara {formatIdr(33250)} / bulan
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCycle('monthly')}
              className={`text-left p-4 rounded-2xl border-2 transition-colors ${
                cycle === 'monthly'
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/35 dark:border-sky-500'
                  : 'border-white/70 dark:border-white/12 bg-white/55 dark:bg-white/[0.05] hover:border-slate-300'
              }`}
          >
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Bulanan</div>
            <div className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatIdr(49000)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Fleksibel tiap bulan</div>
          </button>
        </div>

        {/* Key Pro Benefits */}
        <ul className="mt-5 space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Akses penuh 4 unit eksklusif (K-Drama, Travel, EPS-TOPIK, Tata Bahasa)</span>
          </li>
          <li className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Kamus K-Drama &amp; Kerja EPS-TOPIK + semua soal Isian Partikel</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Snowflake className="w-4 h-4 text-sky-500 shrink-0" />
            <span>2 Streak Freeze otomatis pelindung rekor harian</span>
          </li>
        </ul>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleConfirm()}
            className="btn-tactile flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 disabled:opacity-50 text-white text-sm font-bold transition-colors whitespace-nowrap"
          >
            {busy
              ? 'Memproses...'
              : isLoggedIn
              ? 'Bayar & Aktifkan Pro'
              : 'Aktifkan Simulasi Pro'}
          </button>
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Masuk / Daftar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewBlueprint();
              }}
              className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Lihat Paket Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
