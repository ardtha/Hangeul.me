import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Flame,
  Lock,
  PenTool,
  Play,
  Snowflake,
  Sparkles,
  Target,
  Volume2,
} from 'lucide-react';
import {
  CURRICULUM_MODULES,
  LETTER_CARDS,
  type CurriculumModule,
  type FlashcardItem,
} from '../data/hangeulData';
import type { DailyQuestRecord } from '../hooks/useLearningStore';
import {
  calculateLearnerLevel,
  canAccessModule,
  evaluateDailyQuests,
} from '../lib/gameRules';
import { speakKorean } from '../lib/speech';
import type { PaywallReason } from './PaywallModal';
import type { PracticeStudioTab } from './SwipeArenaView';

interface LearningPathViewProps {
  isPro: boolean;
  xp: number;
  dailyStreak: number;
  streakFreezeCount: number;
  favoritesCount: number;
  dailyQuests: DailyQuestRecord;
  moduleMastery: Record<string, number>;
  onStartModule: (mod: CurriculumModule) => void;
  onStartQuickArena: (mode?: PracticeStudioTab) => void;
  onOpenDictionary: () => void;
  onOpenBatchimGuide: () => void;
  onTriggerPaywall: (reason: PaywallReason, contextTitle?: string) => void;
}

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
];

const SOUNDBOARD_GROUPS = [
  'Semua',
  'Konsonan Dasar',
  'Konsonan Aspirasi',
  'Konsonan Kembar',
  'Vokal Dasar',
  'Vokal Ganda',
] as const;

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  isPro,
  xp,
  dailyStreak,
  streakFreezeCount,
  favoritesCount,
  dailyQuests,
  moduleMastery,
  onStartModule,
  onStartQuickArena,
  onOpenDictionary,
  onOpenBatchimGuide,
  onTriggerPaywall,
}) => {
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'pro'>('all');
  const [soundGroup, setSoundGroup] = useState<(typeof SOUNDBOARD_GROUPS)[number]>('Konsonan Dasar');
  const [activeLetter, setActiveLetter] = useState<FlashcardItem>(LETTER_CARDS[0]);

  const levelInfo = calculateLearnerLevel(xp);
  const questItems = useMemo(() => evaluateDailyQuests(dailyQuests), [dailyQuests]);

  const visibleModules = CURRICULUM_MODULES.filter((mod) => {
    if (filterTier === 'all') return true;
    return mod.tier === filterTier;
  });

  const visibleLetters = useMemo(() => {
    if (soundGroup === 'Semua') return LETTER_CARDS;
    return LETTER_CARDS.filter((c) => c.type === soundGroup);
  }, [soundGroup]);

  return (
    <div className="space-y-8">
      {/* iOS × Duolingo Glass Hero */}
      <section>
        <div className="ios-card flex flex-col justify-between bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-6 sm:p-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Belajar Korea Interaktif · 7 Mode Latihan &amp; Peringkat</span>
              </span>
              <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 tabular-nums">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{dailyStreak} Hari Streak</span>
                <Snowflake className="w-3.5 h-3.5 text-sky-500 ml-1" />
                <span>{streakFreezeCount} Freeze</span>
              </span>
            </div>

            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance leading-tight">
              Kuasai Hangeul, Tata Bahasa, &amp; Percakapan Korea
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
              Asah kemampuan lewat Kuis Kilat, Kanvas Tulis Hangeul, Isian Partikel, Rakit Suku Kata, hingga Tantangan 60 Detik dengan panduan pola baca Batchim.
            </p>

            {/* iOS-clean Frosted Level Progress Strip */}
            <div className="mt-5 ios-glass-well rounded-2xl bg-white/55 dark:bg-white/[0.06] border border-white/70 dark:border-white/12 p-4 max-w-md">
              <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                <span className="text-slate-900 dark:text-white">
                  Level {levelInfo.level} · {levelInfo.title}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {levelInfo.currentLevelXp}/{levelInfo.nextLevelXp} XP
                </span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-slate-900/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(6, levelInfo.progressPct)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onStartQuickArena('quiz')}
              className="btn-tactile inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4" />
              <span>Mulai Latihan Seru</span>
            </button>

            <button
              type="button"
              onClick={() => onStartQuickArena('writing')}
              className="btn-tactile inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0"
            >
              <PenTool className="w-4 h-4" />
              <span>Tulis Hangeul</span>
            </button>

            <button
              type="button"
              onClick={onOpenBatchimGuide}
              className="btn-tactile inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/75 border-b-4 border-b-slate-300/80 dark:border-white/15 bg-white/70 dark:bg-white/10 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/15 text-slate-800 dark:text-slate-100 text-sm font-bold transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Panduan Batchim</span>
            </button>

            <button
              type="button"
              onClick={onOpenDictionary}
              className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-sky-700 dark:text-sky-400 hover:bg-white/60 dark:hover:bg-white/10 text-sm font-bold transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Kamus{favoritesCount > 0 ? ` (${favoritesCount}★)` : ''}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Misi Harian Strip */}
      <section aria-labelledby="quests-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 id="quests-heading" className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
              Misi Belajar Hari Ini
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
            {questItems.filter((q) => q.completed).length}/{questItems.length} selesai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {questItems.map((q) => (
            <div
              key={q.id}
              className={`ios-card rounded-2xl border p-4 transition-colors ${
                q.completed
                  ? 'bg-emerald-50/65 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-700/60'
                  : 'bg-white/62 dark:bg-slate-900/52 border-white/75 dark:border-white/12'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    {q.title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{q.description}</p>
                </div>
                <span
                  className={`text-xs font-extrabold tabular-nums shrink-0 ${
                    q.completed
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {q.completed ? 'Tuntas ✓' : `+${q.rewardXp} XP`}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 tabular-nums">
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      q.completed ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${q.progressPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {q.current}/{q.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Papan Alfabet Interaktif (40-Huruf Soundboard) */}
      <section
        aria-labelledby="soundboard-heading"
        className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-7 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
              <Volume2 className="w-4 h-4" />
              <span>Papan Bunyi 40 Huruf Hangeul Interaktif</span>
            </div>
            <h2
              id="soundboard-heading"
              className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white"
            >
              Ketuk Huruf untuk Mendengar Pelafalan Aslinya
            </h2>
          </div>

          <div
            role="group"
            aria-label="Filter kelompok huruf"
            className="inline-flex flex-nowrap items-center gap-1 p-1 rounded-2xl bg-white/45 dark:bg-white/10 backdrop-blur-md border border-white/70 dark:border-white/12 overflow-x-auto max-w-full"
          >
            {SOUNDBOARD_GROUPS.map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSoundGroup(grp)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  soundGroup === grp
                    ? 'bg-white/90 dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Letter Spotlight */}
        <div className="ios-glass-well rounded-2xl bg-white/50 dark:bg-white/[0.06] border border-white/70 dark:border-white/12 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-white/10 border border-white/80 dark:border-white/15 flex items-center justify-center font-display text-4xl font-extrabold text-slate-900 dark:text-white shrink-0 shadow-xs">
              {activeLetter.h}
            </div>
            <div>
              <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
                {activeLetter.type}
              </div>
              <div className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                Pelafalan: "{activeLetter.c}"
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{activeLetter.m}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenBatchimGuide}
              className="px-3.5 py-2.5 rounded-xl border border-white/75 dark:border-white/12 bg-white/70 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/15"
            >
              Aturan Pola Baca
            </button>
            <button
              type="button"
              onClick={() => speakKorean(activeLetter.h)}
              className="btn-tactile inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-xs font-bold whitespace-nowrap"
            >
              <Volume2 className="w-4 h-4" />
              <span>Putar ({activeLetter.h})</span>
            </button>
          </div>
        </div>

        {/* Clickable Soundboard Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5">
          {visibleLetters.map((letter) => {
            const isSelected = activeLetter.id === letter.id;
            const isVowel = letter.type.startsWith('Vokal');
            return (
              <button
                key={letter.id}
                type="button"
                onClick={() => {
                  setActiveLetter(letter);
                  speakKorean(letter.h);
                }}
                className={`btn-tactile p-2.5 rounded-2xl border border-b-4 text-center transition-colors backdrop-blur-md ${
                  isSelected
                    ? 'bg-sky-600 border-sky-800 text-white'
                    : isVowel
                    ? 'bg-amber-50/65 dark:bg-white/[0.07] border-amber-200/80 dark:border-white/12 text-slate-900 dark:text-white hover:border-amber-400'
                    : 'bg-emerald-50/65 dark:bg-white/[0.07] border-emerald-200/80 dark:border-white/12 text-slate-900 dark:text-white hover:border-emerald-400'
                }`}
              >
                <div className="font-display text-2xl font-extrabold leading-none">{letter.h}</div>
                <div
                  className={`mt-1 text-[11px] font-semibold truncate ${
                    isSelected ? 'text-sky-100' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {letter.c}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Curriculum Path */}
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
    </div>
  );
};
