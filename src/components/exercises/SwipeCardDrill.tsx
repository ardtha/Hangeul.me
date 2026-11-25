import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Timer, Volume2 } from 'lucide-react';
import type { FlashcardItem } from '../../data/hangeulData';
import { canSpeakKorean, speakKorean } from '../../lib/speech';

interface SwipeCardDrillProps {
  currentCard: FlashcardItem;
  leftText: string;
  rightText: string;
  isWeak: boolean;
  busy: boolean;
  dragX: number;
  setDragX: (x: number) => void;
  challengeActive: boolean;
  timeLeft: number;
  feedback: { ok: boolean; text: string } | null;
  onAnswer: (swipedLeft: boolean) => void;
  onStartChallenge: () => void;
  onStopChallenge: () => void;
}

export const SwipeCardDrill: React.FC<SwipeCardDrillProps> = ({
  currentCard,
  leftText,
  rightText,
  isWeak,
  busy,
  dragX,
  setDragX,
  challengeActive,
  timeLeft,
  feedback,
  onAnswer,
  onStartChallenge,
  onStopChallenge,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onAnswer(true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onAnswer(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        speakKorean(currentCard.h);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onAnswer, currentCard.h]);

  return (
    <div className="ios-card bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 rounded-[28px] p-6 sm:p-8 flex flex-col items-center">
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
          Arena Kartu Geser &amp; Tantangan 60 Detik
        </span>
        <button
          type="button"
          onClick={challengeActive ? onStopChallenge : onStartChallenge}
          className={`btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-b-4 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
            challengeActive
              ? 'bg-rose-600 border-rose-800 text-white hover:bg-rose-500'
              : 'bg-sky-600 border-sky-800 text-white hover:bg-sky-500'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>{challengeActive ? `Berhenti (${timeLeft}d)` : 'Tantangan 60 Detik'}</span>
        </button>
      </div>

      {/* Top Options */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => onAnswer(true)}
          className="btn-tactile flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 disabled:opacity-50 text-white font-display font-bold text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="truncate">{leftText}</span>
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => onAnswer(false)}
          className="btn-tactile flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 disabled:opacity-50 text-white font-display font-bold text-sm sm:text-base"
        >
          <span className="truncate">{rightText}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* Draggable Card */}
      <div className="relative w-full max-w-xs h-72 sm:h-80 my-6 flex items-center justify-center">
        <div
          data-testid="active-flashcard"
          onPointerDown={(e) => {
            if (busy) return;
            setIsDragging(true);
            startXRef.current = e.clientX;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!isDragging || busy) return;
            setDragX(e.clientX - startXRef.current);
          }}
          onPointerUp={() => {
            if (!isDragging) return;
            setIsDragging(false);
            if (dragX < -75) {
              onAnswer(true);
            } else if (dragX > 75) {
              onAnswer(false);
            } else {
              setDragX(0);
            }
          }}
          onPointerCancel={() => {
            setIsDragging(false);
            setDragX(0);
          }}
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX * 0.06}deg)`,
            transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className={`w-full h-full rounded-3xl select-none cursor-grab active:cursor-grabbing bg-white/72 dark:bg-white/[0.08] backdrop-blur-xl border-2 border-b-4 p-6 flex flex-col items-center justify-center text-center touch-none shadow-lg ${
            dragX < -30
              ? 'border-rose-500'
              : dragX > 30
              ? 'border-sky-600'
              : isWeak
              ? 'border-amber-500 dark:border-amber-400'
              : 'border-white/80 dark:border-white/15'
          }`}
        >
          <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            {currentCard.type}
            {isWeak ? ' · Kartu Lemah' : ''}
          </span>

          <div
            className={`my-4 font-display font-extrabold text-slate-900 dark:text-white tracking-tight ${
              currentCard.h.length > 3
                ? 'text-4xl'
                : currentCard.h.length > 1
                ? 'text-5xl'
                : 'text-7xl'
            }`}
          >
            {currentCard.h}
          </div>

          {canSpeakKorean() && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => speakKorean(currentCard.h)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Dengar (Spasi)</span>
            </button>
          )}
        </div>
      </div>

      <div className="min-h-[36px] flex items-center justify-center">
        {feedback && (
          <p
            role="status"
            className={`text-sm font-semibold text-center ${
              feedback.ok
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        ← Geser kartu ke kiri/kanan atau gunakan panah keyboard →
      </p>
    </div>
  );
};
