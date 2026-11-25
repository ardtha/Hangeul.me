import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Lock, MessageSquareText, RotateCcw, Volume2, XCircle } from 'lucide-react';
import { SENTENCE_PUZZLES } from '../../data/hangeulData';
import { checkSentenceOrder } from '../../lib/gameRules';
import { canSpeakKorean, speakKorean } from '../../lib/speech';
import type { PaywallReason } from '../PaywallModal';

interface SentenceScrambleDrillProps {
  isPro: boolean;
  onSentenceSolved: (xpEarned: number) => void;
  onWrongSentence: () => void;
  onTriggerPaywall: (reason: PaywallReason, contextTitle?: string) => void;
}

export const SentenceScrambleDrill: React.FC<SentenceScrambleDrillProps> = ({
  isPro,
  onSentenceSolved,
  onWrongSentence,
  onTriggerPaywall,
}) => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [checkedStatus, setCheckedStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const activePuzzle = SENTENCE_PUZZLES[puzzleIdx % SENTENCE_PUZZLES.length];
  const isLocked = activePuzzle.tier === 'pro' && !isPro;

  // Deterministic scramble order that isn't equal to target order
  const scrambledTokens = useMemo(() => {
    const list = activePuzzle.tokens.map((tok, i) => ({ tok, id: i }));
    const rotated = [...list.slice(1), list[0]];
    if (rotated.length > 2) {
      [rotated[0], rotated[rotated.length - 1]] = [rotated[rotated.length - 1], rotated[0]];
    }
    return rotated;
  }, [activePuzzle]);

  const selectedTokens = pickedIndices.map((idx) => scrambledTokens[idx].tok);

  const selectTile = (scrambleIdx: number) => {
    if (isLocked || pickedIndices.includes(scrambleIdx) || checkedStatus === 'correct') return;
    setCheckedStatus('idle');
    speakKorean(scrambledTokens[scrambleIdx].tok);
    setPickedIndices((prev) => [...prev, scrambleIdx]);
  };

  const removePickedAt = (slotIdx: number) => {
    if (checkedStatus === 'correct') return;
    setCheckedStatus('idle');
    setPickedIndices((prev) => prev.filter((_, i) => i !== slotIdx));
  };

  const handleCheck = () => {
    if (isLocked) {
      onTriggerPaywall('module', activePuzzle.topic);
      return;
    }
    const ok = checkSentenceOrder(selectedTokens, activePuzzle.tokens);
    if (ok) {
      setCheckedStatus('correct');
      speakKorean(activePuzzle.korean);
      onSentenceSolved(12);
    } else {
      setCheckedStatus('wrong');
      onWrongSentence();
    }
  };

  const goToPuzzle = (nextIdx: number) => {
    setPuzzleIdx(nextIdx);
    setPickedIndices([]);
    setCheckedStatus('idle');
  };

  return (
    <div className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-8 space-y-6">
      {/* Header & Sentence Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
            <MessageSquareText className="w-4 h-4" />
            <span>Susun Kalimat Korea ({puzzleIdx + 1}/{SENTENCE_PUZZLES.length})</span>
            <span>· {activePuzzle.topic}</span>
          </div>
          <h2 className="mt-1 font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Rangkai Potongan Kata &amp; Partikel Menjadi Kalimat Alami
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SENTENCE_PUZZLES.map((p, idx) => {
            const lockedItem = p.tier === 'pro' && !isPro;
            const active = idx === puzzleIdx % SENTENCE_PUZZLES.length;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => goToPuzzle(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap backdrop-blur-md ${
                  active
                    ? 'bg-sky-600 text-white'
                    : lockedItem
                    ? 'bg-rose-50/75 dark:bg-white/[0.06] text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-white/12'
                    : 'bg-white/60 dark:bg-white/[0.07] border border-white/75 dark:border-white/12 text-slate-700 dark:text-slate-300'
                }`}
              >
                {lockedItem ? `🔒 ${idx + 1}` : `#${idx + 1}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Banner */}
      <div className="ios-glass-well rounded-2xl bg-gradient-to-br from-sky-50/75 to-indigo-50/65 dark:from-white/[0.08] dark:to-white/[0.04] border border-sky-200/75 dark:border-white/12 p-5 sm:p-6">
        <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">
          Terjemahkan ke dalam Bahasa Korea:
        </div>
        <div className="mt-1.5 font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          "{activePuzzle.meaning}"
        </div>
        {!isLocked && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span>Bacaan: {activePuzzle.roman}</span>
            {canSpeakKorean() && (
              <button
                type="button"
                onClick={() => speakKorean(activePuzzle.korean)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/75 dark:bg-white/[0.08] backdrop-blur-md border border-sky-200/80 dark:border-white/15 font-semibold text-sky-700 dark:text-sky-300"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Dengar Contoh Kalimat</span>
              </button>
            )}
          </div>
        )}
      </div>

      {isLocked ? (
        <div className="rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/20 p-6 text-center space-y-3">
          <Lock className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <div className="font-display text-base font-bold text-slate-900 dark:text-white">
            Kalimat Tematik "{activePuzzle.topic}" Tersedia untuk Anggota Pro
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Latih kalimat #1–#4 gratis di atas, atau buka paket Pro untuk kalimat skenario K-Drama, Travel Seoul, dan Kerja EPS-TOPIK.
          </p>
          <button
            type="button"
            onClick={() => onTriggerPaywall('module', activePuzzle.topic)}
            className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 text-white text-xs font-bold"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Buka Kalimat Pro</span>
          </button>
        </div>
      ) : (
        <>
          {/* Answer Tray */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Susunan Kalimat Anda (ketuk kata di atas untuk melepas):
            </div>
            <div className="min-h-[64px] rounded-2xl border-2 border-dashed border-sky-300/80 dark:border-white/20 bg-white/45 dark:bg-white/[0.04] backdrop-blur-md p-3 flex flex-wrap items-center gap-2.5">
              {selectedTokens.length === 0 ? (
                <span className="text-xs text-slate-500 dark:text-slate-400 px-2">
                  Pilih potongan kata di bawah sesuai urutan Subjek → Objek/Keterangan → Predikat...
                </span>
              ) : (
                selectedTokens.map((tok, slotIdx) => (
                  <button
                    key={`${tok}-${slotIdx}`}
                    type="button"
                    onClick={() => removePickedAt(slotIdx)}
                    className="btn-tactile px-4 py-2 rounded-xl bg-sky-600 text-white border-b-4 border-sky-800 font-display text-base font-bold animate-gentle-pop"
                  >
                    {tok}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Available Word Bank */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Pilihan Potongan Kata:
            </div>
            <div className="flex flex-wrap gap-2.5">
              {scrambledTokens.map((item, sIdx) => {
                const used = pickedIndices.includes(sIdx);
                return (
                  <button
                    key={`${item.id}-${item.tok}`}
                    type="button"
                    disabled={used}
                    onClick={() => selectTile(sIdx)}
                    className={`btn-tactile px-4 py-2.5 rounded-xl border-2 border-b-4 font-display text-base font-bold transition-colors backdrop-blur-md ${
                      used
                        ? 'bg-white/30 dark:bg-white/[0.03] border-white/50 dark:border-white/10 text-transparent select-none'
                        : 'bg-white/70 dark:bg-white/[0.08] border-white/80 dark:border-white/15 text-slate-900 dark:text-white hover:border-sky-400'
                    }`}
                  >
                    {item.tok}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={selectedTokens.length !== activePuzzle.tokens.length}
                onClick={handleCheck}
                className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 disabled:opacity-50 text-white text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Periksa Kalimat</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPickedIndices([]);
                  setCheckedStatus('idle');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/65 dark:bg-white/[0.08] backdrop-blur-md border border-white/80 dark:border-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => goToPuzzle((puzzleIdx + 1) % SENTENCE_PUZZLES.length)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50/75 dark:bg-white/[0.08] backdrop-blur-md border border-sky-200/70 dark:border-white/15 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100/80 dark:hover:bg-white/[0.14]"
            >
              <span>Kalimat Berikutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {checkedStatus !== 'idle' && (
            <div
              role="status"
              className={`rounded-2xl p-4 border flex items-start gap-3 ${
                checkedStatus === 'correct'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200'
              }`}
            >
              {checkedStatus === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <div className="font-bold">
                  {checkedStatus === 'correct'
                    ? `Tepat Sekali! "${activePuzzle.korean}" (+12 XP)`
                    : 'Urutan partikel belum tepat. Ingat urutan Korea: Subjek + Objek/Lokasi + Kata Kerja di akhir!'}
                </div>
                <p className="opacity-90">{activePuzzle.grammarTip}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
