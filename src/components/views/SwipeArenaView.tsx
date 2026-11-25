import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Grid2X2,
  Layers,
  MessageSquareText,
  PenTool,
  Puzzle,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  ALL_CARDS,
  CURRICULUM_MODULES,
  FULL_DICTIONARY_CARDS,
  LETTER_CARDS,
  WORD_CARDS,
  extractWritingGlyphsFromText,
  type CurriculumModule,
  type FlashcardItem,
} from '../../data/hangeulData';
import {
  applySwipeAnswer,
  recycleWeakCard,
  shuffleArray,
  type SwipeSessionState,
} from '../../lib/gameRules';
import { ChallengeSummaryModal, type ChallengeSummary } from '../exercises/ChallengeSummaryModal';
import { MatchPairsDrill } from '../exercises/MatchPairsDrill';
import { ParticleFillDrill } from '../exercises/ParticleFillDrill';
import { QuizDrill } from '../exercises/QuizDrill';
import { SentenceScrambleDrill } from '../exercises/SentenceScrambleDrill';
import { SessionStatsSidebar } from '../exercises/SessionStatsSidebar';
import { SwipeCardDrill } from '../exercises/SwipeCardDrill';
import { SyllableBuilderDrill } from '../exercises/SyllableBuilderDrill';
import { WritingCanvasDrill } from '../exercises/WritingCanvasDrill';
import type { PaywallReason } from '../modals/PaywallModal';

export type PracticeStudioTab =
  | 'quiz'
  | 'writing'
  | 'builder'
  | 'particle'
  | 'match'
  | 'sentence'
  | 'swipe';
export type ArenaMode = 'letters' | 'words' | 'module' | 'favorites' | 'weak';

interface SwipeArenaViewProps {
  activeModule: CurriculumModule | null;
  initialPracticeMode?: PracticeStudioTab;
  isPro: boolean;
  bestStreak: number;
  bestChallenge: number;
  weakCards: Record<string, number>;
  favorites: string[];
  onProgressUpdate: (patch: {
    xpDelta?: number;
    bestStreak?: number;
    bestChallenge?: number;
    weakCards?: Record<string, number>;
    moduleId?: string;
    moduleCorrectDelta?: number;
    moduleTotalCards?: number;
    questCorrectDelta?: number;
    questBuilderDelta?: number;
    questPairDelta?: number;
  }) => void;
  onTriggerPaywall: (reason: PaywallReason, contextTitle?: string) => void;
}

const STUDIO_TABS: Array<{
  id: PracticeStudioTab;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
}> = [
  {
    id: 'quiz',
    label: 'Kuis Kilat',
    sublabel: 'Pilihan & Audio',
    icon: Sparkles,
    accentClass: 'bg-amber-500 border-amber-700 text-white',
  },
  {
    id: 'writing',
    label: 'Tulis Hangeul',
    sublabel: 'Kanvas Goresan',
    icon: PenTool,
    accentClass: 'bg-indigo-600 border-indigo-800 text-white',
  },
  {
    id: 'builder',
    label: 'Rakit Hangeul',
    sublabel: 'Gabung Suku Kata',
    icon: Puzzle,
    accentClass: 'bg-violet-600 border-violet-800 text-white',
  },
  {
    id: 'particle',
    label: 'Isian Partikel',
    sublabel: '은/는 · 을/를',
    icon: Sparkles,
    accentClass: 'bg-emerald-600 border-emerald-800 text-white',
  },
  {
    id: 'match',
    label: 'Cocokkan',
    sublabel: 'Pasangan Cepat',
    icon: Grid2X2,
    accentClass: 'bg-teal-600 border-teal-800 text-white',
  },
  {
    id: 'sentence',
    label: 'Susun Kalimat',
    sublabel: 'Rangkai Kata',
    icon: MessageSquareText,
    accentClass: 'bg-sky-600 border-sky-800 text-white',
  },
  {
    id: 'swipe',
    label: 'Kartu Geser',
    sublabel: 'Refleks 60 Detik',
    icon: Layers,
    accentClass: 'bg-rose-600 border-rose-800 text-white',
  },
];

export const SwipeArenaView: React.FC<SwipeArenaViewProps> = ({
  activeModule,
  initialPracticeMode = 'quiz',
  isPro,
  bestStreak,
  bestChallenge,
  weakCards,
  favorites,
  onProgressUpdate,
  onTriggerPaywall,
}) => {
  const [practiceTab, setPracticeTab] = useState<PracticeStudioTab>(initialPracticeMode);
  const [writingTarget, setWritingTarget] = useState<{ char: string; nonce: number } | null>(null);
  const [quizActiveText, setQuizActiveText] = useState('');
  const [arenaMode, setArenaMode] = useState<ArenaMode>(activeModule ? 'module' : 'letters');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    activeModule?.id ?? CURRICULUM_MODULES[0].id
  );
  const [challengeActive, setChallengeActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [challengeSummary, setChallengeSummary] = useState<ChallengeSummary | null>(null);

  const [session, setSession] = useState<SwipeSessionState>({
    score: 0,
    streak: 0,
    bestStreak,
    runBestStreak: 0,
    totalAnswered: 0,
    correctCount: 0,
    isPro,
    weakCards,
  });

  useEffect(() => {
    setPracticeTab(initialPracticeMode);
  }, [initialPracticeMode]);

  useEffect(() => {
    setSession((prev) => ({ ...prev, isPro, bestStreak, weakCards }));
  }, [isPro, bestStreak, weakCards]);

  useEffect(() => {
    if (activeModule) {
      setArenaMode('module');
      setSelectedModuleId(activeModule.id);
    }
  }, [activeModule]);

  const currentModule = useMemo(
    () => CURRICULUM_MODULES.find((m) => m.id === selectedModuleId) ?? CURRICULUM_MODULES[0],
    [selectedModuleId]
  );

  const favoriteCards = useMemo(() => {
    const favSet = new Set(favorites);
    return FULL_DICTIONARY_CARDS.filter((c) => favSet.has(c.id));
  }, [favorites]);

  const deckPool = useMemo(() => {
    if (challengeActive) return [...LETTER_CARDS, ...WORD_CARDS];
    if (arenaMode === 'letters') return LETTER_CARDS;
    if (arenaMode === 'words') return WORD_CARDS;
    if (arenaMode === 'favorites') {
      return favoriteCards.length > 0 ? favoriteCards : WORD_CARDS.slice(0, 16);
    }
    if (arenaMode === 'weak') {
      const weakSet = ALL_CARDS.filter((c) => weakCards[c.h]);
      return weakSet.length > 0 ? weakSet : LETTER_CARDS;
    }
    if (arenaMode === 'module') return currentModule.cards;
    return ALL_CARDS;
  }, [arenaMode, challengeActive, currentModule, weakCards, favoriteCards]);

  const [queue, setQueue] = useState<FlashcardItem[]>(() => shuffleArray(deckPool));
  const [currentCard, setCurrentCard] = useState<FlashcardItem>(() => deckPool[0] ?? ALL_CARDS[0]);
  const [leftIsCorrect, setLeftIsCorrect] = useState(() => Math.random() < 0.5);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragX, setDragX] = useState(0);

  const activeLearnText =
    practiceTab === 'quiz' && quizActiveText
      ? quizActiveText
      : currentCard?.h ?? deckPool[0]?.h ?? '';

  const activeStrokeGlyphs = useMemo(
    () => extractWritingGlyphsFromText(activeLearnText),
    [activeLearnText]
  );

  const handlePracticeChar = useCallback((char: string) => {
    setWritingTarget((prev) => ({ char, nonce: (prev?.nonce ?? 0) + 1 }));
    setPracticeTab('writing');
  }, []);

  const drawNext = useCallback((sourceQueue: FlashcardItem[], fallbackPool: FlashcardItem[]) => {
    const working = sourceQueue.length > 0 ? sourceQueue : shuffleArray(fallbackPool);
    const next = working[working.length - 1];
    setQueue(working.slice(0, -1));
    setCurrentCard(next);
    setLeftIsCorrect(Math.random() < 0.5);
    setDragX(0);
    setBusy(false);
  }, []);

  useEffect(() => {
    const shuffled = shuffleArray(deckPool);
    setQueue(shuffled.slice(0, -1));
    setCurrentCard(shuffled[shuffled.length - 1] ?? ALL_CARDS[0]);
    setLeftIsCorrect(Math.random() < 0.5);
    setFeedback(null);
    setDragX(0);
    setBusy(false);
  }, [arenaMode, selectedModuleId, challengeActive, favorites.length, deckPool]);

  useEffect(() => {
    if (!challengeActive) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [challengeActive]);

  useEffect(() => {
    if (challengeActive && timeLeft === 0) {
      setChallengeActive(false);
      const isNewRecord = session.score > bestChallenge;
      onProgressUpdate({
        bestChallenge: isNewRecord ? session.score : bestChallenge,
        questPairDelta: 1,
      });
      setChallengeSummary({
        score: session.score,
        right: session.correctCount,
        total: session.totalAnswered,
        runBest: session.runBestStreak,
        isNewRecord,
      });
    }
  }, [challengeActive, timeLeft, session, bestChallenge, onProgressUpdate]);

  const handleSwipeAnswer = useCallback(
    (swipedLeft: boolean) => {
      if (busy || !currentCard) return;

      setBusy(true);
      const outcome = applySwipeAnswer(session, currentCard, swipedLeft, leftIsCorrect);
      setSession(outcome.nextState);
      setFeedback(
        outcome.isCorrect
          ? { ok: true, text: `Benar (+${outcome.pointsEarned} XP): ${currentCard.c} · ${currentCard.m}` }
          : { ok: false, text: `Jawaban tepat: ${currentCard.c} · ${currentCard.m}` }
      );

      onProgressUpdate({
        xpDelta: outcome.pointsEarned,
        bestStreak: outcome.nextState.bestStreak,
        weakCards: outcome.nextState.weakCards,
        moduleId: arenaMode === 'module' ? currentModule.id : undefined,
        moduleCorrectDelta: outcome.isCorrect ? 1 : 0,
        moduleTotalCards: arenaMode === 'module' ? currentModule.cards.length : undefined,
        questCorrectDelta: outcome.isCorrect ? 1 : 0,
      });

      const nextQueue = outcome.isCorrect ? queue : recycleWeakCard(queue, currentCard);
      setDragX(swipedLeft ? -360 : 360);

      window.setTimeout(() => {
        drawNext(nextQueue, deckPool);
      }, 240);
    },
    [busy, currentCard, session, arenaMode, leftIsCorrect, onProgressUpdate, currentModule, queue, drawNext, deckPool]
  );

  const startChallenge = () => {
    setPracticeTab('swipe');
    setChallengeSummary(null);
    setTimeLeft(60);
    setSession((prev) => ({
      ...prev,
      score: 0,
      streak: 0,
      runBestStreak: 0,
      totalAnswered: 0,
      correctCount: 0,
    }));
    setChallengeActive(true);
  };

  const stopChallenge = () => {
    setChallengeActive(false);
    setTimeLeft(60);
  };

  const recordDrillSuccess = (
    xpEarned: number,
    options?: {
      incrementAnswered?: boolean;
      incrementStreak?: boolean;
      questBuilderDelta?: number;
      questPairDelta?: number;
      weakCardsPatch?: Record<string, number>;
      includeModuleDelta?: boolean;
    }
  ) => {
    const nextStreak = options?.incrementStreak === false ? session.streak : session.streak + 1;
    setSession((prev) => ({
      ...prev,
      score: prev.score + xpEarned,
      streak: nextStreak,
      bestStreak: Math.max(prev.bestStreak, nextStreak),
      correctCount: prev.correctCount + 1,
      totalAnswered:
        options?.incrementAnswered === false ? prev.totalAnswered : prev.totalAnswered + 1,
    }));
    onProgressUpdate({
      xpDelta: xpEarned,
      bestStreak: options?.incrementStreak === false ? undefined : nextStreak,
      weakCards: options?.weakCardsPatch,
      moduleId: options?.includeModuleDelta && arenaMode === 'module' ? currentModule.id : undefined,
      moduleCorrectDelta: options?.includeModuleDelta ? 1 : undefined,
      moduleTotalCards:
        options?.includeModuleDelta && arenaMode === 'module'
          ? currentModule.cards.length
          : undefined,
      questCorrectDelta: 1,
      questBuilderDelta: options?.questBuilderDelta,
      questPairDelta: options?.questPairDelta,
    });
  };

  const handleQuizCorrect = (card: FlashcardItem, xpEarned: number) => {
    const nextWeak = { ...weakCards };
    if (nextWeak[card.h]) {
      if (nextWeak[card.h] <= 1) delete nextWeak[card.h];
      else nextWeak[card.h] -= 1;
    }
    recordDrillSuccess(xpEarned, { weakCardsPatch: nextWeak, includeModuleDelta: true });
  };

  const handleQuizWrong = (card: FlashcardItem) => {
    setSession((prev) => ({
      ...prev,
      streak: 0,
      totalAnswered: prev.totalAnswered + 1,
    }));
    onProgressUpdate({
      weakCards: { ...weakCards, [card.h]: 2 },
    });
  };

  const leftText = leftIsCorrect ? currentCard.c : currentCard.w;
  const rightText = leftIsCorrect ? currentCard.w : currentCard.c;
  const isWeak = Boolean(weakCards[currentCard.h]);
  const weakCount = Object.keys(weakCards).length;

  return (
    <div className="space-y-6">
      {/* Studio Banner + 7 Interactive Exercise Modes */}
      <section className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
              Studio Latihan Interaktif · 7 Mode Permainan
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Latih Hangeul &amp; Tata Bahasa Secara Alami
            </h1>
          </div>

          <div
            role="group"
            aria-label="Sumber materi dek"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white/45 dark:bg-white/10 backdrop-blur-md border border-white/70 dark:border-white/12"
          >
            {(
              [
                { id: 'letters', label: 'Huruf' },
                { id: 'words', label: 'Kata Dasar' },
                { id: 'module', label: 'Per Modul' },
                { id: 'favorites', label: `Favorit (${favorites.length})` },
                { id: 'weak', label: `Lemah (${weakCount})` },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={challengeActive}
                onClick={() => setArenaMode(m.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  arenaMode === m.id && !challengeActive
                    ? 'bg-white/90 text-slate-900 dark:bg-white/20 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m.id === 'favorites' && <Star className="w-3 h-3 text-amber-500" />}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {arenaMode === 'favorites' && favoriteCards.length === 0 && (
          <div className="rounded-2xl bg-amber-50/75 dark:bg-amber-950/35 backdrop-blur-md border border-amber-200/80 dark:border-amber-800 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
            Daftar Favorit Anda masih kosong. Sementara kami menampilkan 16 kosakata dasar pilihan—ketuk ikon ★ di menu <strong>Kamus</strong> untuk menyusun dek pribadi Anda.
          </div>
        )}

        <div
          role="tablist"
          aria-label="Pilih jenis latihan"
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2"
        >
          {STUDIO_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = practiceTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={challengeActive && tab.id !== 'swipe'}
                onClick={() => setPracticeTab(tab.id)}
                className={`btn-tactile flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-b-4 text-left transition-all backdrop-blur-md ${
                  active
                    ? tab.accentClass
                    : 'bg-white/55 dark:bg-white/[0.06] border-white/70 dark:border-white/12 text-slate-800 dark:text-slate-100 hover:border-sky-300'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-xs font-extrabold truncate">{tab.label}</div>
                  <div
                    className={`text-[10px] truncate ${
                      active ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {arenaMode === 'module' &&
          !challengeActive &&
          (practiceTab === 'quiz' || practiceTab === 'match' || practiceTab === 'swipe') && (
            <div className="flex flex-wrap items-center gap-3 text-sm pt-1">
              <label htmlFor="module-select" className="font-semibold text-slate-700 dark:text-slate-300">
                Unit sumber latihan:
              </label>
              <select
                id="module-select"
                value={selectedModuleId}
                onChange={(e) => {
                  const target = CURRICULUM_MODULES.find((m) => m.id === e.target.value);
                  if (target && target.tier === 'pro' && !isPro) {
                    onTriggerPaywall('module', target.title);
                    return;
                  }
                  setSelectedModuleId(e.target.value);
                }}
                className="px-3.5 py-2 rounded-xl border border-white/75 dark:border-white/12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-slate-900 dark:text-white text-sm font-medium"
              >
                {CURRICULUM_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.order}. {m.title} {m.tier === 'pro' && !isPro ? '(Pro)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
      </section>

      {/* Main Content + Compact Telemetry Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          {practiceTab === 'quiz' && (
            <QuizDrill
              deckPool={deckPool}
              streak={session.streak}
              onCorrectAnswer={handleQuizCorrect}
              onWrongAnswer={handleQuizWrong}
              onActiveCardChange={setQuizActiveText}
            />
          )}

          {practiceTab === 'writing' && (
            <WritingCanvasDrill
              targetChar={writingTarget}
              onWritingCompleted={(_glyph, xpEarned) => recordDrillSuccess(xpEarned)}
            />
          )}

          {practiceTab === 'builder' && (
            <SyllableBuilderDrill
              onPuzzleSolved={(_char, xpEarned) =>
                recordDrillSuccess(xpEarned, { incrementAnswered: false, questBuilderDelta: 1 })
              }
            />
          )}

          {practiceTab === 'particle' && (
            <ParticleFillDrill
              isPro={isPro}
              onSolved={(_puzzle, xpEarned) => recordDrillSuccess(xpEarned, { questBuilderDelta: 1 })}
              onWrong={() =>
                setSession((prev) => ({
                  ...prev,
                  streak: 0,
                  totalAnswered: prev.totalAnswered + 1,
                }))
              }
              onTriggerPaywall={onTriggerPaywall}
            />
          )}

          {practiceTab === 'match' && (
            <MatchPairsDrill
              deckPool={deckPool}
              onRoundComplete={(_mistakes, xpEarned) =>
                recordDrillSuccess(xpEarned, {
                  incrementAnswered: false,
                  incrementStreak: false,
                  questPairDelta: 1,
                })
              }
            />
          )}

          {practiceTab === 'sentence' && (
            <SentenceScrambleDrill
              isPro={isPro}
              onSentenceSolved={(xpEarned) =>
                recordDrillSuccess(xpEarned, { incrementAnswered: false, questBuilderDelta: 1 })
              }
              onWrongSentence={() => setSession((prev) => ({ ...prev, streak: 0 }))}
              onTriggerPaywall={onTriggerPaywall}
            />
          )}

          {practiceTab === 'swipe' && (
            <SwipeCardDrill
              currentCard={currentCard}
              leftText={leftText}
              rightText={rightText}
              isWeak={isWeak}
              busy={busy}
              dragX={dragX}
              setDragX={setDragX}
              challengeActive={challengeActive}
              timeLeft={timeLeft}
              feedback={feedback}
              onAnswer={handleSwipeAnswer}
              onStartChallenge={startChallenge}
              onStopChallenge={stopChallenge}
            />
          )}
        </div>

        <SessionStatsSidebar
          session={session}
          bestChallenge={bestChallenge}
          showStrokeGuide={practiceTab !== 'writing'}
          strokeGlyphs={activeStrokeGlyphs}
          activeLearnText={activeLearnText}
          isWeakMode={arenaMode === 'weak'}
          weakCount={weakCount}
          onPracticeChar={handlePracticeChar}
          onSwitchToWeakMode={() => setArenaMode('weak')}
        />
      </div>

      <ChallengeSummaryModal
        summary={challengeSummary}
        onReplay={startChallenge}
        onClose={() => setChallengeSummary(null)}
      />
    </div>
  );
};
