import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Headphones, Sparkles, Volume2, XCircle } from 'lucide-react';
import type { FlashcardItem } from '../../data/hangeulData';
import { buildQuizQuestion, type QuizPromptStyle } from '../../lib/gameRules';
import { canSpeakKorean, speakKorean } from '../../lib/speech';

interface QuizDrillProps {
  deckPool: FlashcardItem[];
  streak: number;
  onCorrectAnswer: (card: FlashcardItem, xpEarned: number) => void;
  onWrongAnswer: (card: FlashcardItem) => void;
  onActiveCardChange?: (hangeulText: string) => void;
}

export const QuizDrill: React.FC<QuizDrillProps> = ({
  deckPool,
  streak,
  onCorrectAnswer,
  onWrongAnswer,
  onActiveCardChange,
}) => {
  const [promptMode, setPromptMode] = useState<'mix' | 'listen'>('mix');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [sessionRight, setSessionRight] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  const safePool = useMemo(
    () => (deckPool.length >= 4 ? deckPool : [...deckPool]),
    [deckPool]
  );

  const currentCard = safePool[questionIndex % safePool.length];

  useEffect(() => {
    if (currentCard?.h) {
      onActiveCardChange?.(currentCard.h);
    }
  }, [currentCard?.h, onActiveCardChange]);

  const activeStyle: QuizPromptStyle = useMemo(() => {
    if (promptMode === 'listen') return 'listen';
    return questionIndex % 2 === 0 ? 'meaning' : 'roman';
  }, [promptMode, questionIndex]);

  const question = useMemo(
    () => buildQuizQuestion(currentCard, safePool, activeStyle, questionIndex + safePool.length),
    [currentCard, safePool, activeStyle, questionIndex]
  );

  useEffect(() => {
    setSelectedIdx(null);
  }, [deckPool]);

  const handleSelectOption = useCallback(
    (optIdx: number) => {
      if (selectedIdx !== null) return;

      setSelectedIdx(optIdx);
      setSessionTotal((t) => t + 1);
      const picked = question.options[optIdx];
      if (picked.isCorrect) {
        setSessionRight((r) => r + 1);
        const xpEarned = 3 + Math.min(3, Math.floor(streak / 3));
        onCorrectAnswer(question.card, xpEarned);
      } else {
        onWrongAnswer(question.card);
      }
    },
    [selectedIdx, question, streak, onCorrectAnswer, onWrongAnswer]
  );

  const handleNext = useCallback(() => {
    setSelectedIdx(null);
    setQuestionIndex((i) => i + 1);
  }, []);

  // Keyboard shortcuts 1..4 & Enter
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      if (['1', '2', '3', '4'].includes(e.key) && selectedIdx === null) {
        e.preventDefault();
        handleSelectOption(Number(e.key) - 1);
      } else if (e.key === 'Enter' && selectedIdx !== null) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIdx, handleSelectOption, handleNext]);

  const isAnswered = selectedIdx !== null;
  const isPickedCorrect = isAnswered && question.options[selectedIdx]?.isCorrect;

  return (
    <div className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-8 space-y-6">
      {/* Top Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kuis Pilihan Ganda · Soal #{questionIndex + 1}</span>
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
            Benar {sessionRight}/{sessionTotal}
          </span>
        </div>

        <div
          role="group"
          aria-label="Mode pertanyaan kuis"
          className="inline-flex items-center p-1 rounded-2xl bg-white/45 dark:bg-white/10 backdrop-blur-md border border-white/70 dark:border-white/12"
        >
          <button
            type="button"
            onClick={() => setPromptMode('mix')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              promptMode === 'mix'
                ? 'bg-white/90 dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Visual &amp; Bacaan
          </button>
          <button
            type="button"
            onClick={() => {
              setPromptMode('listen');
              speakKorean(question.card.h);
            }}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              promptMode === 'listen'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Mode Dengar</span>
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="ios-glass-well rounded-3xl bg-white/52 dark:bg-white/[0.06] border border-white/70 dark:border-white/12 p-6 sm:p-8 text-center">
        <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
          {question.card.type} · {question.promptLabel}
        </p>

        {activeStyle === 'listen' ? (
          <div className="my-5 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => speakKorean(question.card.h)}
              className="btn-tactile inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white font-display font-bold text-base shadow-sm"
            >
              <Volume2 className="w-5 h-5" />
              <span>Putar Suara Korea</span>
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {isAnswered
                ? `Hangeul: ${question.card.h} (${question.card.c})`
                : 'Klik tombol biru untuk mendengar lalu pilih artinya di bawah'}
            </span>
          </div>
        ) : (
          <div className="my-4">
            <div
              className={`font-display font-extrabold text-slate-900 dark:text-white tracking-tight ${
                question.card.h.length > 4
                  ? 'text-3xl sm:text-4xl'
                  : question.card.h.length > 1
                  ? 'text-5xl'
                  : 'text-7xl'
              }`}
            >
              {question.card.h}
            </div>
            {canSpeakKorean() && (
              <button
                type="button"
                onClick={() => speakKorean(question.card.h)}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Dengar Pelafalan</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4 Tactile Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {question.options.map((opt, idx) => {
          const picked = selectedIdx === idx;
          let optionStyle =
            'bg-white/65 dark:bg-white/[0.07] backdrop-blur-md border-2 border-white/75 border-b-4 dark:border-white/15 hover:border-sky-400 dark:hover:border-sky-400 text-slate-800 dark:text-slate-100';

          if (isAnswered) {
            if (opt.isCorrect) {
              optionStyle =
                'bg-emerald-50/85 dark:bg-emerald-950/60 border-2 border-emerald-500 border-b-4 text-emerald-900 dark:text-emerald-200 animate-gentle-pop';
            } else if (picked && !opt.isCorrect) {
              optionStyle =
                'bg-rose-50/85 dark:bg-rose-950/60 border-2 border-rose-500 border-b-4 text-rose-900 dark:text-rose-200';
            } else {
              optionStyle =
                'bg-white/35 dark:bg-white/[0.03] border-2 border-white/50 dark:border-white/10 text-slate-400 dark:text-slate-500 opacity-75';
            }
          }

          return (
            <button
              key={`${opt.id}-${idx}`}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`btn-tactile flex items-center justify-between gap-3 p-4 rounded-2xl text-left transition-all ${optionStyle}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-semibold text-sm leading-snug">{opt.text}</span>
              </div>
              {isAnswered && opt.isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              {isAnswered && picked && !opt.isCorrect && (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Next Row */}
      {isAnswered && (
        <div
          role="status"
          className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
            isPickedCorrect
              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900'
              : 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
          }`}
        >
          <div>
            <div
              className={`font-display font-bold text-sm ${
                isPickedCorrect
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-rose-800 dark:text-rose-300'
              }`}
            >
              {isPickedCorrect
                ? `Hebat! Jawaban Benar · ${question.card.h} (${question.card.c})`
                : `Kurang Tepat · Yang benar: ${question.card.h} = ${question.card.m} (${question.card.c})`}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {question.card.m} · Kategori {question.card.type}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="btn-tactile inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 text-white text-xs font-bold whitespace-nowrap shrink-0"
          >
            <span>Soal Berikutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
