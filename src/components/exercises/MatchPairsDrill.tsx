import React, { useMemo, useState } from 'react';
import { CheckCircle2, Grid2X2, RotateCcw, Sparkles } from 'lucide-react';
import type { FlashcardItem } from '../../data/hangeulData';
import { createMatchRound, type MatchTileItem } from '../../lib/gameRules';
import { speakKorean } from '../../lib/speech';

interface MatchPairsDrillProps {
  deckPool: FlashcardItem[];
  onRoundComplete: (mistakes: number, xpEarned: number) => void;
}

export const MatchPairsDrill: React.FC<MatchPairsDrillProps> = ({
  deckPool,
  onRoundComplete,
}) => {
  const [roundSeed, setRoundSeed] = useState(1);
  const [selectedLeft, setSelectedLeft] = useState<MatchTileItem | null>(null);
  const [selectedRight, setSelectedRight] = useState<MatchTileItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<Record<string, boolean>>({});
  const [mismatchPair, setMismatchPair] = useState<{ leftId: string; rightId: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);

  const round = useMemo(
    () => createMatchRound(deckPool, Math.min(6, deckPool.length), roundSeed),
    [deckPool, roundSeed]
  );

  const matchedCount = Object.keys(matchedIds).length;
  const totalPairs = round.leftTiles.length;

  const evaluatePair = (left: MatchTileItem, right: MatchTileItem) => {
    if (left.pairId === right.pairId) {
      const nextMatched = { ...matchedIds, [left.pairId]: true };
      setMatchedIds(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      speakKorean(left.text);

      if (Object.keys(nextMatched).length === totalPairs && !roundCompleted) {
        setRoundCompleted(true);
        const xpEarned = Math.max(8, 20 - mistakes * 2);
        onRoundComplete(mistakes, xpEarned);
      }
    } else {
      setMistakes((m) => m + 1);
      setMismatchPair({ leftId: left.tileId, rightId: right.tileId });
      window.setTimeout(() => {
        setMismatchPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 420);
    }
  };

  const handleTapLeft = (tile: MatchTileItem) => {
    if (matchedIds[tile.pairId] || mismatchPair) return;
    speakKorean(tile.text);
    setSelectedLeft(tile);
    if (selectedRight) {
      evaluatePair(tile, selectedRight);
    }
  };

  const handleTapRight = (tile: MatchTileItem) => {
    if (matchedIds[tile.pairId] || mismatchPair) return;
    setSelectedRight(tile);
    if (selectedLeft) {
      evaluatePair(selectedLeft, tile);
    }
  };

  const handleNewRound = () => {
    setRoundSeed((s) => s + 1);
    setMatchedIds({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setMismatchPair(null);
    setMistakes(0);
    setRoundCompleted(false);
  };

  return (
    <div className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400">
            <Grid2X2 className="w-4 h-4" />
            <span>Cocokkan Pasangan Hangeul &amp; Arti</span>
          </div>
          <h2 className="mt-1 font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Ketuk 1 Kartu Korea (Kiri) + 1 Pasangan Artinya (Kanan)
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold tabular-nums">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50/75 dark:bg-emerald-950/45 backdrop-blur-md border border-emerald-200/70 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
            Cocok: {matchedCount}/{totalPairs}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50/75 dark:bg-white/[0.08] backdrop-blur-md border border-amber-200/70 dark:border-white/12 text-amber-800 dark:text-amber-300">
            Salah: {mistakes}
          </span>
          <button
            type="button"
            onClick={handleNewRound}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/65 dark:bg-white/[0.08] backdrop-blur-md border border-white/80 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/[0.14]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Acak Baru</span>
          </button>
        </div>
      </div>

      {roundCompleted && (
        <div
          role="status"
          className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-gentle-pop"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 shrink-0" />
            <div>
              <div className="font-display text-lg font-extrabold">
                Semua Pasangan Berhasil Dicocokkan!
              </div>
              <div className="text-xs text-emerald-50">
                Total kesalahan: {mistakes} · Bonus hadiah +{Math.max(8, 20 - mistakes * 2)} XP
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNewRound}
            className="btn-tactile px-4 py-2.5 rounded-xl bg-white text-emerald-800 border-b-4 border-emerald-200 text-xs font-bold whitespace-nowrap shrink-0"
          >
            Main Ronde Berikutnya
          </button>
        </div>
      )}

      {/* Dual Column Match Board */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Hangeul column */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Kartu Hangeul
          </div>
          {round.leftTiles.map((tile) => {
            const isMatched = Boolean(matchedIds[tile.pairId]);
            const isSelected = selectedLeft?.tileId === tile.tileId;
            const isWrong = mismatchPair?.leftId === tile.tileId;

            return (
              <button
                key={tile.tileId}
                type="button"
                disabled={isMatched}
                onClick={() => handleTapLeft(tile)}
                className={`btn-tactile w-full min-h-[70px] sm:min-h-[76px] p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left flex items-center justify-between gap-2 transition-colors backdrop-blur-md ${
                  isMatched
                    ? 'bg-emerald-50/65 dark:bg-emerald-950/35 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 opacity-60'
                    : isWrong
                    ? 'bg-rose-50/85 dark:bg-rose-950/55 border-rose-500 text-rose-800 dark:text-rose-200'
                    : isSelected
                    ? 'bg-sky-600 border-sky-800 text-white'
                    : 'bg-sky-50/55 dark:bg-white/[0.07] border-sky-200/80 dark:border-white/15 text-slate-900 dark:text-white hover:border-sky-400'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-display text-xl sm:text-2xl font-extrabold truncate">
                    {tile.text}
                  </div>
                  {tile.subtext && (
                    <div
                      className={`text-xs truncate ${
                        isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {tile.subtext}
                    </div>
                  )}
                </div>
                {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right: Meanings column */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Arti Bahasa Indonesia
          </div>
          {round.rightTiles.map((tile) => {
            const isMatched = Boolean(matchedIds[tile.pairId]);
            const isSelected = selectedRight?.tileId === tile.tileId;
            const isWrong = mismatchPair?.rightId === tile.tileId;

            return (
              <button
                key={tile.tileId}
                type="button"
                disabled={isMatched}
                onClick={() => handleTapRight(tile)}
                className={`btn-tactile w-full min-h-[70px] sm:min-h-[76px] p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-left flex items-center justify-between gap-2 transition-colors backdrop-blur-md ${
                  isMatched
                    ? 'bg-emerald-50/65 dark:bg-emerald-950/35 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 opacity-60'
                    : isWrong
                    ? 'bg-rose-50/85 dark:bg-rose-950/55 border-rose-500 text-rose-800 dark:text-rose-200'
                    : isSelected
                    ? 'bg-amber-500 border-amber-700 text-white'
                    : 'bg-amber-50/50 dark:bg-white/[0.07] border-amber-200/80 dark:border-white/15 text-slate-800 dark:text-slate-100 hover:border-amber-400'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold leading-snug">{tile.text}</span>
                {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
