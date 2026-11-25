import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Puzzle, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import {
  CHOSEONG_LIST,
  JONGSEONG_LIST,
  JUNGSEONG_LIST,
  SYLLABLE_PUZZLES,
} from '../../data/hangeulData';
import { composeHangulSyllable } from '../../lib/gameRules';
import { canSpeakKorean, speakKorean } from '../../lib/speech';

interface SyllableBuilderDrillProps {
  onPuzzleSolved: (targetChar: string, xpEarned: number) => void;
}

export const SyllableBuilderDrill: React.FC<SyllableBuilderDrillProps> = ({
  onPuzzleSolved,
}) => {
  const [subMode, setSubMode] = useState<'puzzle' | 'sandbox'>('puzzle');
  const [puzzleIdx, setPuzzleIdx] = useState(0);

  const [initialIdx, setInitialIdx] = useState<number>(18); // ㅎ
  const [medialIdx, setMedialIdx] = useState<number>(0); // ㅏ
  const [finalIdx, setFinalIdx] = useState<number>(0); // none

  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  const activePuzzle = SYLLABLE_PUZZLES[puzzleIdx % SYLLABLE_PUZZLES.length];
  const composedChar = composeHangulSyllable(initialIdx, medialIdx, finalIdx);

  const choseongMeta = CHOSEONG_LIST.find((c) => c.unicodeIndex === initialIdx);
  const jungseongMeta = JUNGSEONG_LIST.find((v) => v.unicodeIndex === medialIdx);
  const jongseongMeta = JONGSEONG_LIST.find((t) => t.unicodeIndex === finalIdx);

  const pickChoseong = (idx: number) => {
    setInitialIdx(idx);
    setFeedback(null);
    const nextChar = composeHangulSyllable(idx, medialIdx, finalIdx);
    speakKorean(nextChar);
  };

  const pickJungseong = (idx: number) => {
    setMedialIdx(idx);
    setFeedback(null);
    const nextChar = composeHangulSyllable(initialIdx, idx, finalIdx);
    speakKorean(nextChar);
  };

  const pickJongseong = (idx: number) => {
    setFinalIdx(idx);
    setFeedback(null);
    const nextChar = composeHangulSyllable(initialIdx, medialIdx, idx);
    speakKorean(nextChar);
  };

  const handleCheckPuzzle = () => {
    if (composedChar === activePuzzle.targetChar) {
      setSolvedCount((c) => c + 1);
      setFeedback({
        ok: true,
        text: `Sempurna! Kamu berhasil merakit "${activePuzzle.targetChar}" (${activePuzzle.roman}) — ${activePuzzle.meaning}. +10 XP!`,
      });
      speakKorean(activePuzzle.targetChar);
      onPuzzleSolved(activePuzzle.targetChar, 10);
    } else {
      setFeedback({
        ok: false,
        text: `Blok saat ini berbunyi "${composedChar}". Petunjuk: ${activePuzzle.hint}`,
      });
    }
  };

  const handleNextPuzzle = () => {
    setPuzzleIdx((i) => i + 1);
    setFeedback(null);
    setFinalIdx(0);
  };

  return (
    <div className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-8 space-y-6">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
            <Puzzle className="w-4 h-4" />
            <span>Lab Rakit Blok Suku Kata Hangeul</span>
            {solvedCount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                · {solvedCount} terpecahkan
              </span>
            )}
          </div>
          <h2 className="mt-1 font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Gabungkan Konsonan Awal + Vokal + Batchim
          </h2>
        </div>

        <div
          role="group"
          aria-label="Mode Rakit Hangeul"
          className="inline-flex items-center p-1 rounded-2xl bg-white/55 dark:bg-white/[0.08] backdrop-blur-md border border-white/75 dark:border-white/12 self-start"
        >
          <button
            type="button"
            onClick={() => {
              setSubMode('puzzle');
              setFeedback(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              subMode === 'puzzle'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            Tantangan Kata ({puzzleIdx % SYLLABLE_PUZZLES.length + 1}/{SYLLABLE_PUZZLES.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSubMode('sandbox');
              setFeedback(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              subMode === 'sandbox'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            Eksplorasi Bebas
          </button>
        </div>
      </div>

      {/* Live Preview Banner */}
      <div className="ios-glass-well grid grid-cols-1 md:grid-cols-12 gap-5 items-center rounded-3xl bg-white/52 dark:bg-white/[0.06] border border-white/75 dark:border-white/12 p-5 sm:p-6">
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
          <div
            data-testid="composed-hangeul-char"
            className="w-28 h-28 rounded-3xl bg-white/78 dark:bg-white/[0.1] backdrop-blur-xl border-2 border-violet-300/80 dark:border-violet-500/50 shadow-sm flex items-center justify-center font-display text-6xl font-extrabold text-slate-900 dark:text-white animate-gentle-pop"
          >
            {composedChar}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>{choseongMeta?.char}</span>
            <span>+</span>
            <span>{jungseongMeta?.char}</span>
            {finalIdx > 0 && (
              <>
                <span>+</span>
                <span>{jongseongMeta?.char}</span>
              </>
            )}
          </div>
          {canSpeakKorean() && (
            <button
              type="button"
              onClick={() => speakKorean(composedChar)}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/75 dark:bg-white/[0.08] backdrop-blur-md border border-violet-200/80 dark:border-white/15 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:bg-white/95 dark:hover:bg-white/[0.14]"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Bunyikan "{composedChar}"</span>
            </button>
          )}
        </div>

        <div className="md:col-span-7 space-y-3">
          {subMode === 'puzzle' ? (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Misi Rakit Suku Kata Target</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-extrabold text-violet-700 dark:text-violet-300">
                  {activePuzzle.targetChar}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Dibaca: "{activePuzzle.roman}"
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Arti: {activePuzzle.meaning}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Petunjuk susunan: <strong className="text-slate-800 dark:text-slate-200">{activePuzzle.hint}</strong>
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCheckPuzzle}
                  className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 border-b-4 border-violet-800 text-white text-xs font-bold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Periksa Susunan</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextPuzzle}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-violet-200/80 dark:border-white/15 bg-white/70 dark:bg-white/[0.08] backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/95 dark:hover:bg-white/[0.14]"
                >
                  <span>Target Berikutnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-bold text-violet-700 dark:text-violet-300">
                Kotak Pasir Hangeul Bebas
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Klik huruf mana saja pada 3 rak di bawah untuk bereksperimen menggabungkan Konsonan Awal, Vokal Tengah, dan Konsonan Akhir (Batchim) menjadi ribuan blok kata Korea asli.
              </p>
              <button
                type="button"
                onClick={() => {
                  setInitialIdx(0);
                  setMedialIdx(0);
                  setFinalIdx(0);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-200/80 dark:border-white/15 bg-white/70 dark:bg-white/[0.08] backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke 가</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`rounded-2xl p-4 text-xs font-semibold border ${
            feedback.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* 3 Jamo Selector Racks */}
      <div className="space-y-5">
        {/* Rack 1: Choseong */}
        <div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            1. Konsonan Awal (초성 · Choseong)
          </div>
          <div className="flex flex-wrap gap-2">
            {CHOSEONG_LIST.map((item) => {
              const selected = initialIdx === item.unicodeIndex;
              return (
                <button
                  key={`L-${item.unicodeIndex}`}
                  type="button"
                  onClick={() => pickChoseong(item.unicodeIndex)}
                  className={`btn-tactile px-3 py-2 rounded-xl border-2 border-b-4 text-center min-w-[54px] transition-colors backdrop-blur-md ${
                    selected
                      ? 'bg-rose-600 border-rose-800 text-white'
                      : 'bg-rose-50/55 dark:bg-white/[0.07] border-rose-200/80 dark:border-white/15 text-slate-900 dark:text-slate-100 hover:border-rose-400'
                  }`}
                >
                  <div className="font-display text-lg font-extrabold leading-none">{item.char}</div>
                  <div
                    className={`mt-1 text-[10px] font-semibold ${
                      selected ? 'text-rose-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.roman}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rack 2: Jungseong */}
        <div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            2. Vokal Inti (중성 · Jungseong)
          </div>
          <div className="flex flex-wrap gap-2">
            {JUNGSEONG_LIST.map((item) => {
              const selected = medialIdx === item.unicodeIndex;
              return (
                <button
                  key={`V-${item.unicodeIndex}`}
                  type="button"
                  onClick={() => pickJungseong(item.unicodeIndex)}
                  className={`btn-tactile px-3 py-2 rounded-xl border-2 border-b-4 text-center min-w-[52px] transition-colors backdrop-blur-md ${
                    selected
                      ? 'bg-sky-600 border-sky-800 text-white'
                      : 'bg-sky-50/55 dark:bg-white/[0.07] border-sky-200/80 dark:border-white/15 text-slate-900 dark:text-slate-100 hover:border-sky-400'
                  }`}
                >
                  <div className="font-display text-lg font-extrabold leading-none">{item.char}</div>
                  <div
                    className={`mt-1 text-[10px] font-semibold ${
                      selected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.roman}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rack 3: Jongseong (Batchim) */}
        <div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            3. Konsonan Penutup / Batchim (종성 · Opsional)
          </div>
          <div className="flex flex-wrap gap-2">
            {JONGSEONG_LIST.map((item) => {
              const selected = finalIdx === item.unicodeIndex;
              return (
                <button
                  key={`T-${item.unicodeIndex}`}
                  type="button"
                  onClick={() => pickJongseong(item.unicodeIndex)}
                  className={`btn-tactile px-3 py-2 rounded-xl border-2 border-b-4 text-center min-w-[60px] transition-colors backdrop-blur-md ${
                    selected
                      ? 'bg-emerald-600 border-emerald-800 text-white'
                      : 'bg-emerald-50/55 dark:bg-white/[0.07] border-emerald-200/80 dark:border-white/15 text-slate-900 dark:text-slate-100 hover:border-emerald-400'
                  }`}
                >
                  <div className="font-display text-lg font-extrabold leading-none">{item.char}</div>
                  <div
                    className={`mt-1 text-[10px] font-semibold ${
                      selected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.roman}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
