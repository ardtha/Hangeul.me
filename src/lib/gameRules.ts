import type { CurriculumModule, FlashcardItem } from '../data/hangeulData';

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

export interface WritingCoverageEvaluation {
  passed: boolean;
  scorePct: number;
  feedback: string;
}

export function evaluateWritingCoverage(
  inkSamples: number,
  boundingRatio: number
): WritingCoverageEvaluation {
  const safeInk = Math.max(0, inkSamples);
  const safeBound = Math.max(0, Math.min(1, boundingRatio));
  const rawScore = Math.round(Math.min(100, safeInk * 1.4 + safeBound * 55));

  if (safeInk < 18 || safeBound < 0.16) {
    return {
      passed: false,
      scorePct: rawScore,
      feedback: 'Goresan masih terlalu pendek. Ikuti garis panduan huruf dari awal hingga akhir.',
    };
  }

  return {
    passed: true,
    scorePct: Math.max(72, rawScore),
    feedback: 'Bentuk huruf Hangeul terlihat rapi & proporsional!',
  };
}

export interface Point2D {
  x: number;
  y: number;
}

function appendLineSamples(out: Point2D[], x0: number, y0: number, x1: number, y1: number, step = 6) {
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const count = Math.max(1, Math.ceil(dist / step));
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    out.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t });
  }
}

export function sampleSvgPathPoints(pathD: string): Point2D[] {
  const tokens = pathD.match(/[a-zA-Z]|[-+]?\d*\.?\d+/g);
  if (!tokens) return [];

  const points: Point2D[] = [];
  let i = 0;
  let cmd = '';
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;

  const num = () => Number(tokens[i++]);

  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) {
      cmd = tokens[i++];
      if (cmd === 'Z' || cmd === 'z') {
        if (Math.hypot(sx - cx, sy - cy) > 1) {
          appendLineSamples(points, cx, cy, sx, sy);
        }
        cx = sx;
        cy = sy;
        continue;
      }
    }

    if (cmd === 'M') {
      cx = num();
      cy = num();
      sx = cx;
      sy = cy;
      points.push({ x: cx, y: cy });
      cmd = 'L';
    } else if (cmd === 'L') {
      const x1 = num();
      const y1 = num();
      appendLineSamples(points, cx, cy, x1, y1);
      cx = x1;
      cy = y1;
    } else if (cmd === 'Q') {
      const qx = num();
      const qy = num();
      const x1 = num();
      const y1 = num();
      const steps = 20;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const inv = 1 - t;
        points.push({
          x: inv * inv * cx + 2 * inv * t * qx + t * t * x1,
          y: inv * inv * cy + 2 * inv * t * qy + t * t * y1,
        });
      }
      cx = x1;
      cy = y1;
    } else if (cmd === 'A') {
      let rx = Math.abs(num());
      let ry = Math.abs(num());
      const phiDeg = num();
      const largeArc = num();
      const sweep = num();
      const x2 = num();
      const y2 = num();

      if (rx > 0 && ry > 0 && (cx !== x2 || cy !== y2)) {
        const phi = (phiDeg * Math.PI) / 180;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);
        const dx2 = (cx - x2) / 2;
        const dy2 = (cy - y2) / 2;
        const x1p = cosP * dx2 + sinP * dy2;
        const y1p = -sinP * dx2 + cosP * dy2;

        const rx2 = rx * rx;
        const ry2 = ry * ry;
        const x1p2 = x1p * x1p;
        const y1p2 = y1p * y1p;
        const lambda = x1p2 / rx2 + y1p2 / ry2;
        if (lambda > 1) {
          const s = Math.sqrt(lambda);
          rx *= s;
          ry *= s;
        }
        const rx2u = rx * rx;
        const ry2u = ry * ry;
        const denom = rx2u * y1p2 + ry2u * x1p2;
        const sq = denom > 0 ? Math.max(0, (rx2u * ry2u - denom) / denom) : 0;
        const coef = (largeArc === sweep ? -1 : 1) * Math.sqrt(sq);
        const cxp = coef * ((rx * y1p) / ry);
        const cyp = coef * (-(ry * x1p) / rx);
        const arcCx = cosP * cxp - sinP * cyp + (cx + x2) / 2;
        const arcCy = sinP * cxp + cosP * cyp + (cy + y2) / 2;

        const vecAng = (ux: number, uy: number, vx: number, vy: number) => {
          const dot = ux * vx + uy * vy;
          const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
          const ratio = len > 0 ? Math.max(-1, Math.min(1, dot / len)) : 1;
          const ang = Math.acos(ratio);
          return ux * vy - uy * vx < 0 ? -ang : ang;
        };

        const vx1 = (x1p - cxp) / rx;
        const vy1 = (y1p - cyp) / ry;
        const vx2 = (-x1p - cxp) / rx;
        const vy2 = (-y1p - cyp) / ry;

        const theta1 = vecAng(1, 0, vx1, vy1);
        let dTheta = vecAng(vx1, vy1, vx2, vy2);
        if (sweep === 0 && dTheta > 0) dTheta -= 2 * Math.PI;
        if (sweep === 1 && dTheta < 0) dTheta += 2 * Math.PI;

        const steps = 32;
        for (let s = 0; s <= steps; s++) {
          const t = theta1 + (dTheta * s) / steps;
          const px = rx * Math.cos(t);
          const py = ry * Math.sin(t);
          points.push({
            x: cosP * px - sinP * py + arcCx,
            y: sinP * px + cosP * py + arcCy,
          });
        }
      }
      cx = x2;
      cy = y2;
    } else {
      i++;
    }
  }

  return points;
}

export function evaluateWritingPattern(
  userStrokes: Point2D[][],
  guideSvgPaths: string[],
  canvasSize = 280
): WritingCoverageEvaluation {
  const rawPts = userStrokes.flat();
  if (rawPts.length < 2) {
    return {
      passed: false,
      scorePct: 0,
      feedback: 'Goresan masih terlalu pendek. Tulis pola huruf lengkap sesuai panduan!',
    };
  }

  const scale = 200 / Math.max(1, canvasSize);
  const resampledUser: Point2D[] = [];
  for (const stroke of userStrokes) {
    if (stroke.length === 0) continue;
    for (let k = 0; k < stroke.length; k++) {
      const p0 = { x: stroke[k].x * scale, y: stroke[k].y * scale };
      if (k === 0) {
        resampledUser.push(p0);
      } else {
        const prev = { x: stroke[k - 1].x * scale, y: stroke[k - 1].y * scale };
        appendLineSamples(resampledUser, prev.x, prev.y, p0.x, p0.y, 6);
      }
    }
  }

  if (resampledUser.length < 10) {
    return {
      passed: false,
      scorePct: 12,
      feedback: 'Pola goresan belum cukup lengkap. Ikuti garis panduan huruf!',
    };
  }

  const guidePts = guideSvgPaths.flatMap((d) => sampleSvgPathPoints(d));
  if (guidePts.length === 0) {
    return {
      passed: false,
      scorePct: 0,
      feedback: 'Panduan pola huruf tidak ditemukan.',
    };
  }

  const tol = 28;
  const tolSq = tol * tol;

  let guideHits = 0;
  for (const gp of guidePts) {
    for (const up of resampledUser) {
      const dx = gp.x - up.x;
      const dy = gp.y - up.y;
      if (dx * dx + dy * dy <= tolSq) {
        guideHits++;
        break;
      }
    }
  }

  let userHits = 0;
  for (const up of resampledUser) {
    for (const gp of guidePts) {
      const dx = gp.x - up.x;
      const dy = gp.y - up.y;
      if (dx * dx + dy * dy <= tolSq) {
        userHits++;
        break;
      }
    }
  }

  const recall = guideHits / guidePts.length;
  const precision = userHits / resampledUser.length;
  const f1 = recall + precision > 0 ? (2 * recall * precision) / (recall + precision) : 0;
  const scorePct = Math.round(f1 * 100);

  if (recall < 0.62 || precision < 0.6) {
    return {
      passed: false,
      scorePct,
      feedback:
        recall < 0.62
          ? 'Pola huruf belum lengkap atau melenceng — kanvas huruf ini direset, silakan tulis ulang!'
          : 'Goresan terlalu keluar dari pola huruf — kanvas huruf ini direset, silakan coba lagi!',
    };
  }

  return {
    passed: true,
    scorePct: Math.max(72, scorePct),
    feedback: 'Pola huruf tepat & proporsional!',
  };
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


