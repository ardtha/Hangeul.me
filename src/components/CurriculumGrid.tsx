import React, { useState } from 'react';
import { Lock, Play } from 'lucide-react';
import { CURRICULUM_MODULES, type CurriculumModule } from '../data/hangeulData';
import { canAccessModule } from '../lib/gameRules';
import type { PaywallReason } from './PaywallModal';

const MODULE_ACCENTS = [
  {
    topBar: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    progressBar: 'bg-emerald-500',
  },
  {
    topBar: 'bg-sky-500',
    badgeBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    progressBar: 'bg-sky-500',
  },
  {
    topBar: 'bg-violet-500',
    badgeBg: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
    progressBar: 'bg-violet-500',
  },
  {
    topBar: 'bg-amber-500',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    progressBar: 'bg-amber-500',
  },
  {
    topBar: 'bg-rose-500',
    badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    progressBar: 'bg-rose-500',
  },
  {
    topBar: 'bg-indigo-500',
    badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    progressBar: 'bg-indigo-500',
  },
] as const;

interface CurriculumGridProps {
  isPro: boolean;
  moduleMastery: Record<string, number>;
  onStartModule: (mod: CurriculumModule) => void;
  onTriggerPaywall: (reason: PaywallReason, contextTitle?: string) => void;
}

export const CurriculumGrid: React.FC<CurriculumGridProps> = ({
  isPro,
  moduleMastery,
  onStartModule,
  onTriggerPaywall,
}) => {
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'pro'>('all');

  const visibleModules = CURRICULUM_MODULES.filter((mod) => {
    if (filterTier === 'all') return true;
    return mod.tier === filterTier;
  });

  return (
    <section aria-labelledby="curriculum-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/60 dark:border-white/10 pb-4">
        <div>
          <h2
            id="curriculum-heading"
            className="font-display text-2xl font-extrabold text-slate-900 dark:text-white"
          >
            Jalur Kurikulum Tematik
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Pilih unit terstruktur untuk dilatih di Studio Latihan dengan 7 jenis latihan interaktif.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter modul kurikulum"
          className="inline-flex items-center p-1 rounded-2xl bg-white/45 dark:bg-white/10 backdrop-blur-md border border-white/70 dark:border-white/12 self-start"
        >
          {(
            [
              { id: 'all', label: 'Semua (6)' },
              { id: 'free', label: 'Gratis (2)' },
              { id: 'pro', label: 'Pro (4)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTier(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                filterTier === tab.id
                  ? 'bg-white/90 dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleModules.map((mod, idx) => {
          const unlocked = canAccessModule(mod, isPro);
          const mastery = moduleMastery[mod.id] ?? 0;
          const accent = MODULE_ACCENTS[idx % MODULE_ACCENTS.length];

          return (
            <article
              key={mod.id}
              className="ios-card flex flex-col justify-between bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 overflow-hidden transition-colors hover:border-sky-300/80 dark:hover:border-white/25"
            >
              <div className={`h-1.5 w-full ${accent.topBar}`} />
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="tabular-nums font-medium">
                      Unit {mod.order} · {mod.cards.length} kartu · {mod.estimatedMinutes} mnt
                    </span>
                    <span
                      className={`font-bold ${
                        mod.tier === 'free'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : unlocked
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {mod.tier === 'free' ? 'Gratis' : unlocked ? 'Pro Terbuka' : 'Eksklusif Pro'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`w-10 h-10 rounded-2xl font-display font-extrabold text-sm inline-flex items-center justify-center shrink-0 ${accent.badgeBg}`}
                    >
                      {mod.order}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                        {mod.title}
                      </h3>
                      <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {mod.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {mod.description}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>Penguasaan Unit</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{mastery}%</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${accent.progressBar}`}
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!unlocked) {
                        onTriggerPaywall('module', mod.title);
                        return;
                      }
                      onStartModule(mod);
                    }}
                    className={`btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                      unlocked
                        ? 'bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300'
                    }`}
                  >
                    {unlocked ? <Play className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{unlocked ? 'Latih Unit Ini' : 'Buka dengan Pro'}</span>
                  </button>

                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    {unlocked ? 'Siap dimainkan' : 'Paket Pro'}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
