import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, Sparkles, Volume2, XCircle } from 'lucide-react';
import { PARTICLE_PUZZLES, type ParticlePuzzle } from '../../data/hangeulData';
import { checkParticleAnswer } from '../../lib/gameRules';
import { canSpeakKorean, speakKorean } from '../../lib/speech';
import type { PaywallReason } from '../PaywallModal';

interface ParticleFillDrillProps {
  isPro: boolean;
  onSolved: (puzzle: ParticlePuzzle, xpEarned: number) => void;
  onWrong: () => void;
  onTriggerPaywall: (reason: PaywallReason, contextTitle?: string) => void;
}

export const ParticleFillDrill: React.FC<ParticleFillDrillProps> = ({
  isPro,
  onSolved,
  onWrong,
  onTriggerPaywall,
}) => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  const active = PARTICLE_PUZZLES[puzzleIdx % PARTICLE_PUZZLES.length];
  const isLocked = active.tier === 'pro' && !isPro;
  const answered = selectedOpt !== null;
  const isCorrect = answered && checkParticleAnswer(selectedOpt, active.correctOption);

  const fullKoreanSentence = `${active.sentenceBefore}${active.correctOption}${active.sentenceAfter}`;

  const handlePick = (opt: string) => {
    if (answered || isLocked) return;
    setSelectedOpt(opt);
    const ok = checkParticleAnswer(opt, active.correctOption);
    if (ok) {
      setSolvedCount((c) => c + 1);
      speakKorean(fullKoreanSentence);
      onSolved(active, 10);
    } else {
      onWrong();
    }
  };

  const goTo = (nextIdx: number) => {
    setPuzzleIdx(nextIdx);
    setSelectedOpt(null);
  };

  return (
    <div className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Isian Partikel &amp; Tata Bahasa · Soal #{puzzleIdx + 1}</span>
            {solvedCount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                · {solvedCount} benar
              </span>
            )}
          </div>
          <h2 className="mt-1 font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {active.topic}
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PARTICLE_PUZZLES.map((item, idx) => {
            const lockedItem = item.tier === 'pro' && !isPro;
            const current = idx === puzzleIdx % PARTICLE_PUZZLES.length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(idx)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap backdrop-blur-md ${
                  current
                    ? 'bg-amber-500 text-white'
                    : lockedItem
                    ? 'bg-rose-50/75 dark:bg-white/[0.06] text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-white/12'
                    : 'bg-white/60 dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-white/70 dark:border-white/12'
                }`}
              >
                {lockedItem ? `🔒 ${idx + 1}` : `#${idx + 1}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sentence Prompt Card */}
      <div className="ios-glass-well rounded-3xl bg-white/52 dark:bg-white/[0.06] border border-white/70 dark:border-white/12 p-6 sm:p-8 text-center space-y-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Lengkapi partikel Korea yang paling tepat untuk arti: "{active.meaningId}"
        </p>

        {isLocked ? (
          <div className="py-4 space-y-3">
            <Lock className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
            <div className="font-display text-base font-bold text-slate-900 dark:text-white">
              Latihan Tata Bahasa Pro: {active.topic}
            </div>
            <button
              type="button"
              onClick={() => onTriggerPaywall('module', active.topic)}
              className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 text-white text-xs font-bold"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Buka dengan Hangeul.me Pro</span>
            </button>
          </div>
        ) : (
          <>
            <div className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
              <span>{active.sentenceBefore}</span>
              <span
                className={`inline-flex items-center justify-center min-w-[54px] mx-1 px-3 py-1 rounded-2xl border-2 transition-colors ${
                  answered
                    ? isCorrect
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-white dark:bg-slate-900 border-dashed border-amber-400 text-amber-600 dark:text-amber-400'
                }`}
              >
                {selectedOpt ?? '___'}
              </span>
              <span>{active.sentenceAfter}</span>
            </div>

            {canSpeakKorean() && (
              <button
                type="button"
                onClick={() => speakKorean(fullKoreanSentence)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Dengar Kalimat Lengkap</span>
              </button>
            )}
          </>
        )}
      </div>

      {!isLocked && (
        <>
          {/* 4 Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {active.options.map((opt) => {
              const picked = selectedOpt === opt;
              const rightOpt = opt === active.correctOption;
              let btnStyle =
                'bg-white/65 dark:bg-white/[0.07] backdrop-blur-md border-2 border-white/75 border-b-4 dark:border-white/15 hover:border-amber-400 text-slate-900 dark:text-white';
              if (answered) {
                if (rightOpt) {
                  btnStyle =
                    'bg-emerald-50/85 dark:bg-emerald-950/55 border-2 border-emerald-500 border-b-4 text-emerald-800 dark:text-emerald-200';
                } else if (picked) {
                  btnStyle =
                    'bg-rose-50/85 dark:bg-rose-950/55 border-2 border-rose-500 border-b-4 text-rose-800 dark:text-rose-200';
                } else {
                  btnStyle =
                    'bg-white/35 dark:bg-white/[0.03] border-2 border-white/50 dark:border-white/10 text-slate-400 opacity-70';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={answered}
                  onClick={() => handlePick(opt)}
                  className={`btn-tactile py-4 px-4 rounded-2xl font-display text-xl font-extrabold text-center transition-colors ${btnStyle}`}
                >
                  -{opt}
                </button>
              );
            })}
          </div>

          {/* Feedback Banner */}
          {answered && (
            <div
              role="status"
              className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <div className="font-bold">
                    {isCorrect
                      ? `Tepat Sekali! "${fullKoreanSentence}" (+10 XP)`
                      : `Jawaban benar: -${active.correctOption} ("${fullKoreanSentence}")`}
                  </div>
                  <p className="opacity-90">{active.explanation}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => goTo((puzzleIdx + 1) % PARTICLE_PUZZLES.length)}
                className="btn-tactile inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 text-white text-xs font-bold whitespace-nowrap shrink-0"
              >
                <span>Soal Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
