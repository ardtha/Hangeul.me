import type { CurriculumModule, FlashcardItem } from '../data/hangeulData';

export {
  evaluateWritingCoverage,
  evaluateWritingPattern,
  sampleSvgPathPoints,
  type Point2D,
  type WritingCoverageEvaluation,
} from './writingEvaluator';

export interface SwipeSessionState {
  score: number;
  streak: number;
  bestStreak: number;
  runBestStreak: number;
  totalAnswered: number;
  correctCount: number;
  isPro: boolean;
  weakCards: Record<string, number>;
}

export interface SwipeOutcome {
  nextState: SwipeSessionState;
  isCorrect: boolean;
  pointsEarned: number;
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function calculateMultiplier(streak: number): number {
  if (streak < 0) return 1;
  return 1 + Math.floor(streak / 5);
}

export function applySwipeAnswer(
  state: SwipeSessionState,
  card: FlashcardItem,
  swipedLeft: boolean,
  leftIsCorrect: boolean
): SwipeOutcome {
  const isCorrect = swipedLeft ? leftIsCorrect : !leftIsCorrect;
  const nextWeak = { ...state.weakCards };

  if (isCorrect) {
    const nextStreak = state.streak + 1;
    const pointsEarned = calculateMultiplier(state.streak);
    if (nextWeak[card.h]) {
      const remaining = nextWeak[card.h] - 1;
      if (remaining <= 0) {
        delete nextWeak[card.h];
      } else {
        nextWeak[card.h] = remaining;
      }
    }
    return {
      isCorrect: true,
      pointsEarned,
      nextState: {
        ...state,
        score: state.score + pointsEarned,
        streak: nextStreak,
        bestStreak: Math.max(state.bestStreak, nextStreak),
        runBestStreak: Math.max(state.runBestStreak, nextStreak),
        totalAnswered: state.totalAnswered + 1,
        correctCount: state.correctCount + 1,
        weakCards: nextWeak,
      },
    };
  }

  nextWeak[card.h] = 2;
  return {
    isCorrect: false,
    pointsEarned: 0,
    nextState: {
      ...state,
      streak: 0,
      totalAnswered: state.totalAnswered + 1,
      weakCards: nextWeak,
    },
  };
}

export function recycleWeakCard(queue: FlashcardItem[], card: FlashcardItem): FlashcardItem[] {
  const next = [...queue];
  const insertAt = Math.max(0, next.length - 3);
  next.splice(insertAt, 0, card);
  return next;
}

export interface UserProgressSnapshot {
  xp: number;
  bestStreak: number;
  dailyStreak: number;
  lastActiveDate: string;
  streakFreezeCount: number;
  favorites: string[];
  moduleMastery: Record<string, number>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  planCycle: 'free' | 'monthly' | 'annual';
  createdAt: string;
  progress?: UserProgressSnapshot;
}

export type TransactionPlan = 'monthly' | 'annual';

export interface RevenueTransaction {
  id: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  plan: TransactionPlan;
  planLabel: string;
  amountIdr: number;
  method: string;
  status: 'paid';
  createdAt: string;
}

export function canAccessModule(mod: CurriculumModule, isPro: boolean): boolean {
  return mod.tier === 'free' || isPro;
}

export function formatIdr(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================
// INTERACTIVE EXERCISE & PROGRESSION PURE RULES
// ============================================================

export function composeHangulSyllable(
  initialIdx: number,
  medialIdx: number,
  finalIdx = 0
): string {
  const safeL = Math.max(0, Math.min(18, Math.floor(initialIdx)));
  const safeV = Math.max(0, Math.min(20, Math.floor(medialIdx)));
  const safeT = Math.max(0, Math.min(27, Math.floor(finalIdx)));
  const codePoint = 0xac00 + (safeL * 21 + safeV) * 28 + safeT;
  return String.fromCharCode(codePoint);
}

export type QuizPromptStyle = 'meaning' | 'roman' | 'listen';

export interface QuizQuestionItem {
  card: FlashcardItem;
  style: QuizPromptStyle;
  promptLabel: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
}

function deterministicOrder<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let s = Math.abs(Math.floor(seed)) + 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildQuizQuestion(
  card: FlashcardItem,
  pool: FlashcardItem[],
  style: QuizPromptStyle = 'meaning',
  seed = 0
): QuizQuestionItem {
  const useMeaning = style === 'meaning' || style === 'listen';
  const correctText = useMeaning ? `${card.m} (${card.c})` : card.c;

  const candidates = deterministicOrder(
    pool.filter((item) => item.id !== card.id && item.h !== card.h),
    seed + 17
  );
  const distractors: Array<{ id: string; text: string; isCorrect: boolean }> = [];
  const seenText = new Set<string>([correctText.toLowerCase()]);

  for (const pick of candidates) {
    if (distractors.length >= 3) break;
    const text = useMeaning ? `${pick.m} (${pick.c})` : pick.c;
    const key = text.toLowerCase();
    if (!seenText.has(key)) {
      seenText.add(key);
      distractors.push({ id: pick.id, text, isCorrect: false });
    }
  }

  // Fallback distractor if pool was tiny
  const fallbackPool = ['a / eo', 'ga-da (Pergi)', 'sa-ram (Orang)', 'ha-na (Satu)'];
  for (let f = 0; distractors.length < 3 && f < fallbackPool.length; f++) {
    const text = fallbackPool[f];
    if (!seenText.has(text.toLowerCase())) {
      seenText.add(text.toLowerCase());
      distractors.push({ id: `fb-${f}`, text, isCorrect: false });
    }
  }

  const allOptions = [
    { id: card.id, text: correctText, isCorrect: true },
    ...distractors,
  ];
  const options = deterministicOrder(allOptions, seed + 31);

  const promptLabel =
    style === 'listen'
      ? 'Dengarkan audio Korea lalu pilih arti & bacaan yang tepat:'
      : style === 'roman'
      ? 'Pilih pelafalan romanisasi yang paling tepat:'
      : 'Apa arti dan pelafalan kata/huruf berikut?';

  return {
    card,
    style,
    promptLabel,
    options,
  };
}

export interface MatchTileItem {
  tileId: string;
  pairId: string;
  side: 'hangeul' | 'meaning';
  text: string;
  subtext?: string;
}

export function createMatchRound(
  pool: FlashcardItem[],
  pairCount = 6,
  seed = 1
): { leftTiles: MatchTileItem[]; rightTiles: MatchTileItem[] } {
  const orderedPool = deterministicOrder(pool, seed);
  const meaningCounts = new Map<string, number>();
  for (const item of pool) {
    const k = item.m.trim().toLowerCase();
    meaningCounts.set(k, (meaningCounts.get(k) ?? 0) + 1);
  }

  const formatRightLabel = (card: FlashcardItem): string => {
    const genericCategory =
      card.m.startsWith('Konsonan') || card.m.startsWith('Vokal');
    const duplicateMeaning = (meaningCounts.get(card.m.trim().toLowerCase()) ?? 0) > 1;
    return genericCategory || duplicateMeaning ? `${card.c} · ${card.m}` : card.m;
  };

  const uniqueCards: Array<{ card: FlashcardItem; rightLabel: string }> = [];
  const seenH = new Set<string>();
  const seenRight = new Set<string>();

  for (const card of orderedPool) {
    if (uniqueCards.length >= pairCount) break;
    const rightLabel = formatRightLabel(card);
    const rightKey = rightLabel.toLowerCase();
    if (!seenH.has(card.h) && !seenRight.has(rightKey)) {
      seenH.add(card.h);
      seenRight.add(rightKey);
      uniqueCards.push({ card, rightLabel });
    }
  }

  const leftTiles: MatchTileItem[] = uniqueCards.map(({ card }) => ({
    tileId: `L-${card.id}`,
    pairId: card.id,
    side: 'hangeul',
    text: card.h,
  }));

  const rawRight: MatchTileItem[] = uniqueCards.map(({ card, rightLabel }) => ({
    tileId: `R-${card.id}`,
    pairId: card.id,
    side: 'meaning',
    text: rightLabel,
  }));

  const rightTiles = deterministicOrder(rawRight, seed + 97);
  if (rightTiles.length > 1 && rightTiles[0].pairId === leftTiles[0].pairId) {
    [rightTiles[0], rightTiles[1]] = [rightTiles[1], rightTiles[0]];
  }

  return { leftTiles, rightTiles };
}

export function checkSentenceOrder(selectedTokens: string[], targetTokens: string[]): boolean {
  if (selectedTokens.length !== targetTokens.length) return false;
  return selectedTokens.every((tok, idx) => tok === targetTokens[idx]);
}

export interface LearnerLevelInfo {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPct: number;
}

const LEVEL_TITLES = [
  'Pemula Hangeul',
  'Penjelajah Aksara',
  'Penggemar Seoul',
  'Jagoan Percakapan',
  'Siap Kerja Korea',
  'Master Hangeul',
];

export function calculateLearnerLevel(xp: number): LearnerLevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  const stepXp = 50;
  const level = Math.floor(safeXp / stepXp) + 1;
  const currentLevelXp = safeXp % stepXp;
  const progressPct = Math.round((currentLevelXp / stepXp) * 100);
  const titleIdx = Math.min(LEVEL_TITLES.length - 1, level - 1);
  return {
    level,
    title: LEVEL_TITLES[titleIdx],
    currentLevelXp,
    nextLevelXp: stepXp,
    progressPct,
  };
}

export interface DailyQuestProgress {
  correctAnswered: number;
  builderSolved: number;
  pairOrChallengeDone: number;
}

export interface DailyQuestItem {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardXp: number;
  completed: boolean;
  progressPct: number;
}

export function evaluateDailyQuests(stats: DailyQuestProgress): DailyQuestItem[] {
  const items = [
    {
      id: 'quest-correct',
      title: 'Pemanasan Kilat',
      description: 'Jawab benar 5 soal di mode mana saja',
      current: Math.min(5, Math.max(0, stats.correctAnswered)),
      target: 5,
      rewardXp: 20,
    },
    {
      id: 'quest-builder',
      title: 'Arsitek Hangeul',
      description: 'Selesaikan 2 ronde Rakit Hangeul / Susun Kalimat',
      current: Math.min(2, Math.max(0, stats.builderSolved)),
      target: 2,
      rewardXp: 30,
    },
    {
      id: 'quest-pair',
      title: 'Detektif Pasangan',
      description: 'Tuntaskan 1 ronde Cocokkan Pasangan / Tantangan 60d',
      current: Math.min(1, Math.max(0, stats.pairOrChallengeDone)),
      target: 1,
      rewardXp: 25,
    },
  ];

  return items.map((item) => ({
    ...item,
    completed: item.current >= item.target,
    progressPct: Math.min(100, Math.round((item.current / item.target) * 100)),
  }));
}

// ============================================================
// DAILY STREAK + STREAK FREEZE, PARTICLES, WRITING & LEADERBOARD
// ============================================================

export interface DailyStreakInput {
  lastActiveDate: string;
  todayDate: string;
  currentStreak: number;
  streakFreezeCount: number;
  isPro: boolean;
}

export interface DailyStreakResult {
  dailyStreak: number;
  lastActiveDate: string;
  streakFreezeCount: number;
  freezeActivated: boolean;
}

function parseIsoDayUtc(dateStr: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const ms = Date.parse(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  return Math.floor(ms / 86400000);
}

export function evaluateDailyStreak(input: DailyStreakInput): DailyStreakResult {
  const todayDay = parseIsoDayUtc(input.todayDate);
  const lastDay = parseIsoDayUtc(input.lastActiveDate);

  if (todayDay === null || lastDay === null || input.currentStreak <= 0) {
    return {
      dailyStreak: Math.max(1, input.currentStreak),
      lastActiveDate: input.todayDate,
      streakFreezeCount: input.streakFreezeCount,
      freezeActivated: false,
    };
  }

  const diffDays = todayDay - lastDay;
  if (diffDays <= 0) {
    return {
      dailyStreak: input.currentStreak,
      lastActiveDate: input.lastActiveDate,
      streakFreezeCount: input.streakFreezeCount,
      freezeActivated: false,
    };
  }

  if (diffDays === 1) {
    return {
      dailyStreak: input.currentStreak + 1,
      lastActiveDate: input.todayDate,
      streakFreezeCount: input.streakFreezeCount,
      freezeActivated: false,
    };
  }

  // Missed exactly 1 full day (diffDays === 2): Streak Freeze protects the streak!
  if (diffDays === 2 && (input.streakFreezeCount > 0 || input.isPro)) {
    const nextFreeze = Math.max(0, input.streakFreezeCount - 1);
    return {
      dailyStreak: input.currentStreak + 1,
      lastActiveDate: input.todayDate,
      streakFreezeCount: nextFreeze,
      freezeActivated: true,
    };
  }

  // Missed 2+ days or no freeze available -> reset to day 1
  return {
    dailyStreak: 1,
    lastActiveDate: input.todayDate,
    streakFreezeCount: input.streakFreezeCount,
    freezeActivated: false,
  };
}

export function checkParticleAnswer(selectedOption: string, correctOption: string): boolean {
  return selectedOption.trim() === correctOption.trim();
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  isPro: boolean;
  xp: number;
  dailyStreak: number;
  bestStreak: number;
  isCurrentUser?: boolean;
}

export interface RankedLeaderboardEntry extends LeaderboardEntry {
  rank: number;
  league: 'Perunggu' | 'Perak' | 'Emas' | 'Berlian';
}

export function getLearnerLeague(xp: number): RankedLeaderboardEntry['league'] {
  if (xp >= 450) return 'Berlian';
  if (xp >= 220) return 'Emas';
  if (xp >= 90) return 'Perak';
  return 'Perunggu';
}

export function buildLeaderboardRows(
  entries: LeaderboardEntry[],
  currentUserId?: string
): RankedLeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.dailyStreak !== a.dailyStreak) return b.dailyStreak - a.dailyStreak;
    return b.bestStreak - a.bestStreak;
  });

  return sorted.map((entry, idx) => ({
    ...entry,
    isCurrentUser: entry.isCurrentUser || (currentUserId ? entry.id === currentUserId : false),
    rank: idx + 1,
    league: getLearnerLeague(entry.xp),
  }));
}


