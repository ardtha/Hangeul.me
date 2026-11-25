import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Grid2X2,
  Layers,
  MessageSquareText,
  PenTool,
  Puzzle,
  RotateCcw,
  Sparkles,
  Star,
  Timer,
  Volume2,
} from 'lucide-react';
import {
  ALL_CARDS,
  CURRICULUM_MODULES,
  LETTER_CARDS,
  WORD_CARDS,
  extractWritingGlyphsFromText,
  type CurriculumModule,
  type FlashcardItem,
} from '../data/hangeulData';
import {
  applySwipeAnswer,
  calculateMultiplier,
  recycleWeakCard,
  type SwipeSessionState,
} from '../lib/gameRules';
import { canSpeakKorean, speakKorean } from '../lib/speech';
import { AnimatedStrokeGuide } from './exercises/AnimatedStrokeGuide';
import { MatchPairsDrill } from './exercises/MatchPairsDrill';
import { ParticleFillDrill } from './exercises/ParticleFillDrill';
import { QuizDrill } from './exercises/QuizDrill';
import { SentenceScrambleDrill } from './exercises/SentenceScrambleDrill';
import { SyllableBuilderDrill } from './exercises/SyllableBuilderDrill';
import { WritingCanvasDrill } from './exercises/WritingCanvasDrill';
import type { PaywallReason } from './PaywallModal';

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

function shuffleCards(list: FlashcardItem[]): FlashcardItem[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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
  const [quizActiveText, setQuizActiveText] = useState<string>('');
  const [arenaMode, setArenaMode] = useState<ArenaMode>(activeModule ? 'module' : 'letters');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    activeModule?.id ?? CURRICULUM_MODULES[0].id
  );
  const [challengeActive, setChallengeActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [challengeSummary, setChallengeSummary] = useState<{
    score: number;
    right: number;
    total: number;
    runBest: number;
    isNewRecord: boolean;
  } | null>(null);

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
    if (initialPracticeMode) {
      setPracticeTab(initialPracticeMode);
    }
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

  const fullCatalog = useMemo(() => {
    const proExtra = CURRICULUM_MODULES.filter((m) => m.id === 'mod-kdrama-pack' || m.id === 'mod-work-epstopik')
      .flatMap((m) => m.cards.filter((c) => c.id.startsWith('kd-') || c.id.startsWith('wk-')));
    return [...ALL_CARDS, ...proExtra];
  }, []);

  const favoriteCards = useMemo(() => {
    const favSet = new Set(favorites);
    return fullCatalog.filter((c) => favSet.has(c.id));
  }, [fullCatalog, favorites]);

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

  const [queue, setQueue] = useState<FlashcardItem[]>(() => shuffleCards(deckPool));
  const [currentCard, setCurrentCard] = useState<FlashcardItem>(() => deckPool[0] ?? ALL_CARDS[0]);

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
  const [leftIsCorrect, setLeftIsCorrect] = useState(() => Math.random() < 0.5);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const drawNext = useCallback((sourceQueue: FlashcardItem[], fallbackPool: FlashcardItem[]) => {
    let working = sourceQueue;
    if (working.length === 0) {
      working = shuffleCards(fallbackPool);
    }
    const next = working[working.length - 1];
    const remaining = working.slice(0, -1);
    setQueue(remaining);
    setCurrentCard(next);
    setLeftIsCorrect(Math.random() < 0.5);
    setDragX(0);
    setBusy(false);
  }, []);

  useEffect(() => {
    const shuffled = shuffleCards(deckPool);
    setQueue(shuffled.slice(0, -1));
    setCurrentCard(shuffled[shuffled.length - 1] ?? ALL_CARDS[0]);
    setLeftIsCorrect(Math.random() < 0.5);
    setFeedback(null);
    setDragX(0);
    setBusy(false);
  }, [arenaMode, selectedModuleId, challengeActive, favorites.length]);

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

  const handleAnswer = useCallback(
    (swipedLeft: boolean) => {
      if (busy || !currentCard) return;

      setBusy(true);
      const outcome = applySwipeAnswer(session, currentCard, swipedLeft, leftIsCorrect);
      setSession(outcome.nextState);

      if (outcome.isCorrect) {
        setFeedback({
          ok: true,
          text: `Benar (+${outcome.pointsEarned} XP): ${currentCard.c} · ${currentCard.m}`,
        });
      } else {
        setFeedback({
          ok: false,
          text: `Jawaban tepat: ${currentCard.c} · ${currentCard.m}`,
        });
      }

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
    [
      busy,
      currentCard,
      session,
      arenaMode,
      leftIsCorrect,
      onProgressUpdate,
      currentModule,
      queue,
      drawNext,
      deckPool,
    ]
  );

  useEffect(() => {
    if (practiceTab !== 'swipe') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        speakKorean(currentCard.h);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [practiceTab, handleAnswer, currentCard]);

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

  const handleQuizCorrect = (card: FlashcardItem, xpEarned: number) => {
    const nextWeak = { ...weakCards };
    if (nextWeak[card.h]) {
      if (nextWeak[card.h] <= 1) delete nextWeak[card.h];
      else nextWeak[card.h] -= 1;
    }
    const nextStreak = session.streak + 1;
    setSession((prev) => ({
      ...prev,
      score: prev.score + xpEarned,
      streak: nextStreak,
      bestStreak: Math.max(prev.bestStreak, nextStreak),
      correctCount: prev.correctCount + 1,
      totalAnswered: prev.totalAnswered + 1,
    }));
    onProgressUpdate({
      xpDelta: xpEarned,
      bestStreak: nextStreak,
      weakCards: nextWeak,
      moduleId: arenaMode === 'module' ? currentModule.id : undefined,
      moduleCorrectDelta: 1,
      moduleTotalCards: arenaMode === 'module' ? currentModule.cards.length : undefined,
      questCorrectDelta: 1,
    });
  };

  const handleQuizWrong = (card: FlashcardItem) => {
    const nextWeak = { ...weakCards, [card.h]: 2 };
    setSession((prev) => ({
      ...prev,
      streak: 0,
      totalAnswered: prev.totalAnswered + 1,
    }));
    onProgressUpdate({
      weakCards: nextWeak,
    });
  };

  const leftText = leftIsCorrect ? currentCard.c : currentCard.w;
  const rightText = leftIsCorrect ? currentCard.w : currentCard.c;
  const isWeak = Boolean(weakCards[currentCard.h]);
  const weakCount = Object.keys(weakCards).length;
  const multiplier = calculateMultiplier(session.streak);

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

        {/* Empty Favorites Helpful Hint */}
        {arenaMode === 'favorites' && favoriteCards.length === 0 && (
          <div className="rounded-2xl bg-amber-50/75 dark:bg-amber-950/35 backdrop-blur-md border border-amber-200/80 dark:border-amber-800 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
            Daftar Favorit Anda masih kosong. Sementara kami menampilkan 16 kosakata dasar pilihan—ketuk ikon ★ di menu <strong>Kamus</strong> untuk menyusun dek pribadi Anda.
          </div>
        )}

        {/* 7 Mode Selector Tabs */}
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

        {/* Module picker row when Per Modul active */}
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
              onWritingCompleted={(_glyph, xpEarned) => {
                const nextStreak = session.streak + 1;
                setSession((prev) => ({
                  ...prev,
                  score: prev.score + xpEarned,
                  streak: nextStreak,
                  bestStreak: Math.max(prev.bestStreak, nextStreak),
                  correctCount: prev.correctCount + 1,
                  totalAnswered: prev.totalAnswered + 1,
                }));
                onProgressUpdate({
                  xpDelta: xpEarned,
                  bestStreak: nextStreak,
                  questCorrectDelta: 1,
                });
              }}
            />
          )}

          {practiceTab === 'builder' && (
            <SyllableBuilderDrill
              onPuzzleSolved={(_char, xpEarned) => {
                const nextStreak = session.streak + 1;
                setSession((prev) => ({
                  ...prev,
                  score: prev.score + xpEarned,
                  streak: nextStreak,
                  bestStreak: Math.max(prev.bestStreak, nextStreak),
                }));
                onProgressUpdate({
                  xpDelta: xpEarned,
                  bestStreak: nextStreak,
                  questCorrectDelta: 1,
                  questBuilderDelta: 1,
                });
              }}
            />
          )}

          {practiceTab === 'particle' && (
            <ParticleFillDrill
              isPro={isPro}
              onSolved={(_puzzle, xpEarned) => {
                const nextStreak = session.streak + 1;
                setSession((prev) => ({
                  ...prev,
                  score: prev.score + xpEarned,
                  streak: nextStreak,
                  bestStreak: Math.max(prev.bestStreak, nextStreak),
                  correctCount: prev.correctCount + 1,
                  totalAnswered: prev.totalAnswered + 1,
                }));
                onProgressUpdate({
                  xpDelta: xpEarned,
                  bestStreak: nextStreak,
                  questCorrectDelta: 1,
                  questBuilderDelta: 1,
                });
              }}
              onWrong={() => {
                setSession((prev) => ({
                  ...prev,
                  streak: 0,
                  totalAnswered: prev.totalAnswered + 1,
                }));
              }}
              onTriggerPaywall={onTriggerPaywall}
            />
          )}

          {practiceTab === 'match' && (
            <MatchPairsDrill
              deckPool={deckPool}
              onRoundComplete={(_mistakes, xpEarned) => {
                setSession((prev) => ({
                  ...prev,
                  score: prev.score + xpEarned,
                  correctCount: prev.correctCount + 1,
                }));
                onProgressUpdate({
                  xpDelta: xpEarned,
                  questCorrectDelta: 1,
                  questPairDelta: 1,
                });
              }}
            />
          )}

          {practiceTab === 'sentence' && (
            <SentenceScrambleDrill
              isPro={isPro}
              onSentenceSolved={(xpEarned) => {
                const nextStreak = session.streak + 1;
                setSession((prev) => ({
                  ...prev,
                  score: prev.score + xpEarned,
                  streak: nextStreak,
                  bestStreak: Math.max(prev.bestStreak, nextStreak),
                }));
                onProgressUpdate({
                  xpDelta: xpEarned,
                  bestStreak: nextStreak,
                  questCorrectDelta: 1,
                  questBuilderDelta: 1,
                });
              }}
              onWrongSentence={() => {
                setSession((prev) => ({ ...prev, streak: 0 }));
              }}
              onTriggerPaywall={onTriggerPaywall}
            />
          )}

          {practiceTab === 'swipe' && (
            <div className="ios-card bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 rounded-[28px] p-6 sm:p-8 flex flex-col items-center">
              <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-5">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Arena Kartu Geser &amp; Tantangan 60 Detik
                </span>
                <button
                  type="button"
                  onClick={challengeActive ? stopChallenge : startChallenge}
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
                  onClick={() => handleAnswer(true)}
                  className="btn-tactile flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 disabled:opacity-50 text-white font-display font-bold text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <span className="truncate">{leftText}</span>
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAnswer(false)}
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
                      handleAnswer(true);
                    } else if (dragX > 75) {
                      handleAnswer(false);
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
          )}
        </div>

        {/* Right Telemetry & Cheerful Coach Sidebar */}
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
                  {session.totalAnswered > 0
                    ? `${Math.round((session.correctCount / session.totalAnswered) * 100)}%`
                    : '0%'}
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

          {practiceTab !== 'writing' && activeStrokeGlyphs.length > 0 && (
            <AnimatedStrokeGuide
              glyphs={activeStrokeGlyphs}
              sourceLabel={activeLearnText}
              onPracticeChar={handlePracticeChar}
            />
          )}

          <div className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-6 space-y-3">
            <h3 className="font-display text-sm font-extrabold text-slate-900 dark:text-white">
              Tips Belajar &amp; Kartu Lemah
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Setiap XP yang terkumpul dari <strong>7 mode latihan</strong> langsung masuk ke Misi Harian, menjaga <strong>Streak</strong>, dan mendorong peringkat Anda di Liga Mingguan.
            </p>
            {arenaMode === 'weak' ? (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Mode Fokus Kartu Lemah aktif: selesaikan kartu yang sempat keliru untuk menguasainya kembali.
              </p>
            ) : weakCount > 0 ? (
              <button
                type="button"
                onClick={() => setArenaMode('weak')}
                className="btn-tactile w-full py-2.5 px-3 rounded-2xl bg-emerald-600 border-b-4 border-emerald-800 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
              >
                Latih {weakCount} Kartu Lemah Sekarang
              </button>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Challenge Summary Dialog */}
      {challengeSummary && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-md p-4"
        >
          <div className="ios-card w-full max-w-sm rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/75 dark:border-white/15 p-6 text-center">
            <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
              {challengeSummary.isNewRecord ? 'Rekor Baru Tercapai!' : 'Tantangan 60 Detik Selesai'}
            </h2>
            <div className="mt-3 font-display text-5xl font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
              {challengeSummary.score}
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 tabular-nums">
              Benar {challengeSummary.right} dari {challengeSummary.total} kartu (
              {challengeSummary.total > 0
                ? Math.round((challengeSummary.right / challengeSummary.total) * 100)
                : 0}
              %) · Combo terbaik: {challengeSummary.runBest}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={startChallenge}
                className="btn-tactile flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-600 border-b-4 border-sky-800 text-white text-sm font-bold"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Main Lagi</span>
              </button>
              <button
                type="button"
                onClick={() => setChallengeSummary(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
