import React from 'react';
import { Flame } from 'lucide-react';
import type { WritingGlyphGuide } from '../../data/hangeulData';
import { calculateMultiplier, type SwipeSessionState } from '../../lib/gameRules';
import { AnimatedStrokeGuide } from './AnimatedStrokeGuide';

interface SessionStatsSidebarProps {
  session: SwipeSessionState;
  bestChallenge: number;
  showStrokeGuide: boolean;
  strokeGlyphs: WritingGlyphGuide[];
  activeLearnText: string;
  isWeakMode: boolean;
  weakCount: number;
  onPracticeChar: (char: string) => void;
  onSwitchToWeakMode: () => void;
}

export const SessionStatsSidebar: React.FC<SessionStatsSidebarProps> = ({
  session,
  bestChallenge,
  showStrokeGuide,
  strokeGlyphs,
  activeLearnText,
  isWeakMode,
  weakCount,
  onPracticeChar,
  onSwitchToWeakMode,
}) => {
  const multiplier = calculateMultiplier(session.streak);
  const accuracy =
    session.totalAnswered > 0
      ? `${Math.round((session.correctCount / session.totalAnswered) * 100)}%`
      : '0%';

  return (
    <aside className="lg:col-span-4 space-y-5">
      <div className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-6 space-y-4">
        <h2 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
          Statistik Sesi Latihan
        </h2>

        <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-white/60 dark:border-white/10 tabular-nums">
          <div className="ios-glass-well rounded-2xl bg-white/55 dark:bg-white/[0.06] border border-white/65 dark:border-white/10 p-3.5">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Skor Sesi</div>
            <div className="mt-0.5 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
              {session.score}
            </div>
          </div>
          <div className="ios-glass-well rounded-2xl bg-white/55 dark:bg-white/[0.06] border border-white/65 dark:border-white/10 p-3.5">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Combo</div>
            <div className="mt-0.5 font-display text-2xl font-extrabold text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>
                {session.streak} (x{multiplier})
              </span>
            </div>
          </div>
          <div className="ios-glass-well rounded-2xl bg-white/55 dark:bg-white/[0.06] border border-white/65 dark:border-white/10 p-3.5">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Akurasi</div>
            <div className="mt-0.5 font-display text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {accuracy}
            </div>
          </div>
          <div className="ios-glass-well rounded-2xl bg-white/55 dark:bg-white/[0.06] border border-white/65 dark:border-white/10 p-3.5">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Rekor 60d</div>
            <div className="mt-0.5 font-display text-xl font-extrabold text-slate-900 dark:text-white">
              {bestChallenge}
            </div>
          </div>
        </div>
      </div>

      {showStrokeGuide && strokeGlyphs.length > 0 && (
        <AnimatedStrokeGuide
          glyphs={strokeGlyphs}
          sourceLabel={activeLearnText}
          onPracticeChar={onPracticeChar}
        />
      )}

      <div className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-6 space-y-3">
        <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white">
          Tips Belajar &amp; Kartu Lemah
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Setiap XP yang terkumpul dari <strong>7 mode latihan</strong> langsung masuk ke Misi Harian, menjaga <strong>Streak</strong>, dan mendorong peringkat Anda di Liga Mingguan.
        </p>
        {isWeakMode ? (
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Mode Fokus Kartu Lemah aktif: selesaikan kartu yang sempat keliru untuk menguasainya kembali.
          </p>
        ) : weakCount > 0 ? (
          <button
            type="button"
            onClick={onSwitchToWeakMode}
            className="btn-tactile w-full py-2.5 px-3 rounded-2xl bg-emerald-600 border-b-4 border-emerald-800 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
          >
            Latih {weakCount} Kartu Lemah Sekarang
          </button>
        ) : null}
      </div>
    </aside>
  );
};
