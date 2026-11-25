import React from 'react';
import { RotateCcw } from 'lucide-react';

export interface ChallengeSummary {
  score: number;
  right: number;
  total: number;
  runBest: number;
  isNewRecord: boolean;
}

interface ChallengeSummaryModalProps {
  summary: ChallengeSummary | null;
  onReplay: () => void;
  onClose: () => void;
}

export const ChallengeSummaryModal: React.FC<ChallengeSummaryModalProps> = ({
  summary,
  onReplay,
  onClose,
}) => {
  if (!summary) return null;

  const accuracy =
    summary.total > 0 ? Math.round((summary.right / summary.total) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-md p-4"
    >
      <div className="ios-card w-full max-w-sm rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/75 dark:border-white/15 p-6 text-center">
        <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
          {summary.isNewRecord ? 'Rekor Baru Tercapai!' : 'Tantangan 60 Detik Selesai'}
        </h2>
        <div className="mt-3 font-display text-5xl font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
          {summary.score}
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 tabular-nums">
          Benar {summary.right} dari {summary.total} kartu ({accuracy}%) · Combo terbaik:{' '}
          {summary.runBest}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="btn-tactile flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-600 border-b-4 border-sky-800 text-white text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Main Lagi</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
