import React, { useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Flame,
  PenTool,
  Play,
  Snowflake,
  Sparkles,
  Target,
} from 'lucide-react';
import type { CurriculumModule } from '../../data/hangeulData';
import type { DailyQuestRecord } from '../../hooks/useLearningStore';
import { calculateLearnerLevel, evaluateDailyQuests } from '../../lib/gameRules';
import { CurriculumGrid } from './CurriculumGrid';
import { HangeulSoundboard } from './HangeulSoundboard';
import type { PaywallReason } from '../modals/PaywallModal';
import type { PracticeStudioTab } from '../views/SwipeArenaView';

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
  const levelInfo = calculateLearnerLevel(xp);
  const questItems = useMemo(() => evaluateDailyQuests(dailyQuests), [dailyQuests]);
  const completedQuestsCount = questItems.filter((q) => q.completed).length;

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
            {completedQuestsCount}/{questItems.length} selesai
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

      <HangeulSoundboard onOpenBatchimGuide={onOpenBatchimGuide} />

      <CurriculumGrid
        isPro={isPro}
        moduleMastery={moduleMastery}
        onStartModule={onStartModule}
        onTriggerPaywall={onTriggerPaywall}
      />
    </div>
  );
};
