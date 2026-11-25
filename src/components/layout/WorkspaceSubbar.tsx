import React from 'react';
import { Award, Flame, Moon, Snowflake, Sun } from 'lucide-react';
import { calculateLearnerLevel, type AuthUser } from '../../lib/gameRules';

interface WorkspaceSubbarProps {
  isPro: boolean;
  currentUser: AuthUser | null;
  xp: number;
  dailyStreak: number;
  streakFreezeCount: number;
  bestStreak: number;
  weakCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSwitchTier: (nextPro: boolean) => void;
}

export const WorkspaceSubbar: React.FC<WorkspaceSubbarProps> = ({
  isPro,
  currentUser,
  xp,
  dailyStreak,
  streakFreezeCount,
  bestStreak,
  weakCount,
  theme,
  onToggleTheme,
  onSwitchTier,
}) => {
  const levelInfo = calculateLearnerLevel(xp);

  return (
    <div className="no-print border-b border-white/55 dark:border-white/10 bg-white/42 dark:bg-slate-900/45 backdrop-blur-xl backdrop-saturate-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-700 dark:text-slate-300 tabular-nums">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Lv.{levelInfo.level} {levelInfo.title}
            </span>
          </span>

          <span className="inline-flex items-center gap-1 font-semibold">
            <span className="text-slate-500 dark:text-slate-400">XP</span>
            <strong className="text-emerald-600 dark:text-emerald-400">{xp}</strong>
          </span>

          <span className="inline-flex items-center gap-1 font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <strong className="text-amber-600 dark:text-amber-400">{dailyStreak}h</strong>
          </span>

          <span
            title="Streak Freeze melindungi streak harian saat absen 1 hari"
            className="inline-flex items-center gap-1 font-semibold"
          >
            <Snowflake className="w-3.5 h-3.5 text-sky-500" />
            <strong className="text-sky-600 dark:text-sky-400">{streakFreezeCount}</strong>
          </span>

          <span className="hidden md:inline text-slate-500 dark:text-slate-400">
            Combo: <strong className="text-slate-800 dark:text-slate-200">{bestStreak}</strong>
            {' · '}
            Lemah: <strong className="text-slate-800 dark:text-slate-200">{weakCount}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/70 dark:border-white/12 text-xs font-medium text-slate-700 dark:text-slate-200">
              <span>
                Paket:{' '}
                <strong
                  className={
                    isPro
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }
                >
                  {isPro ? 'Pelajar Pro' : 'Gratis'}
                </strong>
              </span>
            </div>
          ) : (
            <div
              role="group"
              aria-label="Pratinjau paket akun"
              className="inline-flex items-center p-0.5 rounded-xl bg-white/45 dark:bg-white/10 backdrop-blur-md border border-white/65 dark:border-white/12"
            >
              <button
                type="button"
                onClick={() => onSwitchTier(false)}
                className={`px-2.5 py-1 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  !isPro
                    ? 'bg-white/90 text-slate-900 dark:bg-white/20 dark:text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Akun Gratis
              </button>
              <button
                type="button"
                onClick={() => onSwitchTier(true)}
                className={`px-2.5 py-1 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isPro
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Mode Pro
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-white/70 dark:border-white/12 bg-white/65 dark:bg-white/10 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/20 transition-colors shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
