import React, { useState } from 'react';
import { BookOpen, Volume2, X } from 'lucide-react';
import { BATCHIM_GUIDE_SECTIONS } from '../data/hangeulData';
import { speakKorean } from '../lib/speech';

interface BatchimGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const BatchimGuideModal: React.FC<BatchimGuideModalProps> = ({ open, onClose }) => {
  const [sectionIdx, setSectionIdx] = useState(0);

  if (!open) return null;

  const active = BATCHIM_GUIDE_SECTIONS[sectionIdx] ?? BATCHIM_GUIDE_SECTIONS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="batchim-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-md p-3 sm:p-6"
    >
      <div className="ios-card w-full max-w-2xl max-h-[90vh] flex flex-col bg-white/82 dark:bg-slate-900/80 border border-white/75 dark:border-white/15 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/60 dark:border-white/10 flex items-center justify-between gap-4 bg-white/45 dark:bg-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-sky-600 text-white inline-flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="batchim-guide-title"
                className="font-display text-base sm:text-lg font-extrabold text-slate-900 dark:text-white"
              >
                Panduan Pola Baca, Batchim &amp; Tata Bahasa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik contoh kata untuk mendengar pelafalan aslinya
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan pola baca"
            className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-white/70 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Topic Selector (iOS style) */}
        <div className="px-6 pt-4">
          <div
            role="tablist"
            aria-label="Topik panduan pola baca"
            className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-900/5 dark:bg-white/10 border border-white/65 dark:border-white/12"
          >
            {BATCHIM_GUIDE_SECTIONS.map((sec, idx) => {
              const selected = idx === sectionIdx;
              return (
                <button
                  key={sec.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setSectionIdx(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors truncate ${
                    selected
                      ? 'bg-white/90 dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sec.badge}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <h3 className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
              {active.title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {active.summary}
            </p>
          </div>

          <div className="space-y-3">
            {active.examples.map((ex) => (
              <div
                key={ex.korean}
                className="ios-glass-well rounded-2xl bg-white/55 dark:bg-white/[0.06] border border-white/70 dark:border-white/12 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <span className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                      {ex.korean}
                    </span>
                    <span className="text-xs font-mono-num font-bold text-sky-700 dark:text-sky-400">
                      → {ex.pronounced}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      ({ex.roman})
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {ex.meaning}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ex.note}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => speakKorean(ex.korean)}
                  className="btn-tactile inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-xs font-bold whitespace-nowrap shrink-0 self-start sm:self-center"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Dengar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
