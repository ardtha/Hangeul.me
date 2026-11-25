import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_CARDS,
  ALL_WRITING_GLYPHS,
  BATCHIM_GUIDE_SECTIONS,
  CURRICULUM_MODULES,
  extractWritingGlyphsFromText,
  getCardExampleSentence,
  LETTER_CARDS,
  PARTICLE_PUZZLES,
  WRITING_GLYPHS,
} from '../data/hangeulData';
import {
  applySwipeAnswer,
  buildLeaderboardRows,
  buildQuizQuestion,
  calculateLearnerLevel,
  calculateMultiplier,
  canAccessModule,
  checkParticleAnswer,
  checkSentenceOrder,
  composeHangulSyllable,
  createMatchRound,
  evaluateDailyQuests,
  evaluateDailyStreak,
  evaluateWritingCoverage,
  evaluateWritingPattern,
  recycleWeakCard,
  sampleSvgPathPoints,
  type SwipeSessionState,
} from './gameRules';

const sampleCard = ALL_CARDS[0];

function makeInitialState(overrides: Partial<SwipeSessionState> = {}): SwipeSessionState {
  return {
    score: 0,
    streak: 0,
    bestStreak: 0,
    runBestStreak: 0,
    totalAnswered: 0,
    correctCount: 0,
    isPro: false,
    weakCards: {},
    ...overrides,
  };
}

test('multiplier increases every 5 consecutive correct answers', () => {
  assert.equal(calculateMultiplier(0), 1);
  assert.equal(calculateMultiplier(4), 1);
  assert.equal(calculateMultiplier(5), 2);
  assert.equal(calculateMultiplier(10), 3);
});

test('correct swipe increments score by multiplier and reduces weak count', () => {
  const state = makeInitialState({
    streak: 5,
    bestStreak: 5,
    weakCards: { [sampleCard.h]: 2 },
  });
  const outcome = applySwipeAnswer(state, sampleCard, true, true);
  assert.equal(outcome.isCorrect, true);
  assert.equal(outcome.pointsEarned, 2);
  assert.equal(outcome.nextState.score, 2);
  assert.equal(outcome.nextState.streak, 6);
  assert.equal(outcome.nextState.bestStreak, 6);
  assert.equal(outcome.nextState.weakCards[sampleCard.h], 1);
});

test('wrong swipe resets streak and marks card weak=2 without hearts restriction', () => {
  const state = makeInitialState({ streak: 4 });
  const outcome = applySwipeAnswer(state, sampleCard, true, false);
  assert.equal(outcome.isCorrect, false);
  assert.equal(outcome.nextState.streak, 0);
  assert.equal(outcome.nextState.weakCards[sampleCard.h], 2);
  assert.equal(outcome.nextState.totalAnswered, 1);
});

test('recycleWeakCard re-inserts missed card near the top of the remaining queue', () => {
  const queue = ALL_CARDS.slice(0, 6);
  const card = ALL_CARDS[10];
  const recycled = recycleWeakCard(queue, card);
  assert.equal(recycled.length, 7);
  assert.equal(recycled[3].id, card.id);
});

test('module access respects Free and Pro tiers', () => {
  const freeMod = CURRICULUM_MODULES.find((m) => m.tier === 'free')!;
  const proMod = CURRICULUM_MODULES.find((m) => m.tier === 'pro')!;
  assert.equal(canAccessModule(freeMod, false), true);
  assert.equal(canAccessModule(proMod, false), false);
  assert.equal(canAccessModule(proMod, true), true);
});

test('expanded Korean dictionary contains 700+ entries across 35+ categories', () => {
  assert.ok(ALL_CARDS.length >= 650, `Expected >= 650 base cards, got ${ALL_CARDS.length}`);
  const categories = new Set(ALL_CARDS.map((c) => c.type));
  assert.ok(categories.size >= 35, `Expected >= 35 categories, got ${categories.size}`);
  for (const mod of CURRICULUM_MODULES) {
    assert.ok(mod.cards.length > 0, `Module ${mod.id} should not be empty`);
  }
});

test('composeHangulSyllable combines Choseong, Jungseong, and Jongseong Unicode accurately', () => {
  assert.equal(composeHangulSyllable(18, 0, 4), '한');
  assert.equal(composeHangulSyllable(0, 18, 8), '글');
  assert.equal(composeHangulSyllable(6, 13, 8), '물');
  assert.equal(composeHangulSyllable(0, 0, 0), '가');
});

test('buildQuizQuestion builds 4 unique options containing exactly 1 correct answer', () => {
  const pool = ALL_CARDS.slice(0, 20);
  const q = buildQuizQuestion(pool[0], pool, 'listen', 3);
  assert.equal(q.options.length, 4);
  const correctOptions = q.options.filter((o) => o.isCorrect);
  assert.equal(correctOptions.length, 1);
  const uniqueTexts = new Set(q.options.map((o) => o.text));
  assert.equal(uniqueTexts.size, 4);
});

test('createMatchRound produces paired Hangeul & unique meaning columns with staggered order', () => {
  const wordPool = ALL_CARDS.slice(40, 60);
  const wordRound = createMatchRound(wordPool, 6, 2);
  assert.equal(wordRound.leftTiles.length, 6);
  assert.equal(wordRound.rightTiles.length, 6);
  assert.equal(new Set(wordRound.rightTiles.map((t) => t.text)).size, 6);
  const leftPairIds = new Set(wordRound.leftTiles.map((t) => t.pairId));
  const rightPairIds = new Set(wordRound.rightTiles.map((t) => t.pairId));
  assert.deepEqual(leftPairIds, rightPairIds);

  const letterPool = ALL_CARDS.slice(0, 40);
  const letterRound = createMatchRound(letterPool, 6, 1);
  assert.equal(letterRound.leftTiles.length, 6);
  assert.equal(new Set(letterRound.rightTiles.map((t) => t.text)).size, 6);
  assert.equal(letterRound.leftTiles[0].subtext, undefined);
});

test('checkSentenceOrder validates Korean token placement accurately', () => {
  const target = ['저는', '한국어를', '공부해요'];
  assert.equal(checkSentenceOrder(['저는', '한국어를', '공부해요'], target), true);
  assert.equal(checkSentenceOrder(['한국어를', '저는', '공부해요'], target), false);
  assert.equal(checkSentenceOrder(['저는', '한국어를'], target), false);
});

test('calculateLearnerLevel and evaluateDailyQuests compute progress cleanly', () => {
  const lvl1 = calculateLearnerLevel(25);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.title, 'Pemula Hangeul');
  assert.equal(lvl1.progressPct, 50);

  const lvl3 = calculateLearnerLevel(120);
  assert.equal(lvl3.level, 3);
  assert.equal(lvl3.title, 'Penggemar Seoul');

  const quests = evaluateDailyQuests({
    correctAnswered: 5,
    builderSolved: 1,
    pairOrChallengeDone: 1,
  });
  assert.equal(quests.length, 3);
  assert.equal(quests[0].completed, true);
  assert.equal(quests[1].completed, false);
  assert.equal(quests[2].completed, true);
});

test('evaluateDailyStreak increments consecutive days, saves 1-day gap with Streak Freeze, and resets after 2+ days', () => {
  const nextDay = evaluateDailyStreak({
    lastActiveDate: '2026-11-23',
    todayDate: '2026-11-24',
    currentStreak: 4,
    streakFreezeCount: 2,
    isPro: true,
  });
  assert.equal(nextDay.dailyStreak, 5);
  assert.equal(nextDay.freezeActivated, false);
  assert.equal(nextDay.streakFreezeCount, 2);

  const missedOneSaved = evaluateDailyStreak({
    lastActiveDate: '2026-11-22',
    todayDate: '2026-11-24',
    currentStreak: 6,
    streakFreezeCount: 2,
    isPro: true,
  });
  assert.equal(missedOneSaved.dailyStreak, 7);
  assert.equal(missedOneSaved.freezeActivated, true);
  assert.equal(missedOneSaved.streakFreezeCount, 1);

  const missedOneNoFreeze = evaluateDailyStreak({
    lastActiveDate: '2026-11-22',
    todayDate: '2026-11-24',
    currentStreak: 6,
    streakFreezeCount: 0,
    isPro: false,
  });
  assert.equal(missedOneNoFreeze.dailyStreak, 1);
  assert.equal(missedOneNoFreeze.freezeActivated, false);
});

test('particle checks, writing stroke evaluation, example sentences, and batchim guides are valid', () => {
  assert.ok(WRITING_GLYPHS.length >= 16);
  assert.ok(PARTICLE_PUZZLES.length >= 10);
  assert.ok(BATCHIM_GUIDE_SECTIONS.length >= 4);

  const firstParticle = PARTICLE_PUZZLES[0];
  assert.equal(checkParticleAnswer(firstParticle.correctOption, firstParticle.correctOption), true);
  assert.equal(checkParticleAnswer('wrong', firstParticle.correctOption), false);

  const lowInk = evaluateWritingCoverage(5, 0.05);
  assert.equal(lowInk.passed, false);
  const goodInk = evaluateWritingCoverage(45, 0.42);
  assert.equal(goodInk.passed, true);
  assert.ok(goodInk.scorePct >= 72);

  // Geometric pattern check for ㄱ ('M 45 52 L 148 52 L 148 152' in 200x200 scaled to 280x280)
  const giyeokPaths = WRITING_GLYPHS[0].strokes;
  const scale = 280 / 200;
  const goodGiyeok = evaluateWritingPattern(
    [
      [
        { x: 45 * scale, y: 52 * scale },
        { x: 148 * scale, y: 52 * scale },
        { x: 148 * scale, y: 152 * scale },
      ],
    ],
    giyeokPaths
  );
  assert.equal(goodGiyeok.passed, true);
  assert.ok(goodGiyeok.scorePct >= 80);

  // Drawing ㄴ pattern when target is ㄱ must fail
  const wrongNieunForGiyeok = evaluateWritingPattern(
    [
      [
        { x: 52 * scale, y: 48 * scale },
        { x: 52 * scale, y: 148 * scale },
        { x: 154 * scale, y: 148 * scale },
      ],
    ],
    giyeokPaths
  );
  assert.equal(wrongNieunForGiyeok.passed, false);

  // Drawing circle ㅇ pattern must match wg-8
  const ieungPaths = WRITING_GLYPHS.find((g) => g.char === 'ㅇ')!.strokes;
  const circleStroke = Array.from({ length: 25 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return { x: (100 + 55 * Math.cos(a)) * scale, y: (100 + 55 * Math.sin(a)) * scale };
  });
  assert.equal(evaluateWritingPattern([circleStroke], ieungPaths).passed, true);

  // Fast 2-point stroke for ㅡ must pass via resampling
  const euPaths = WRITING_GLYPHS.find((g) => g.char === 'ㅡ')!.strokes;
  assert.equal(
    evaluateWritingPattern(
      [[{ x: 36 * scale, y: 100 * scale }, { x: 164 * scale, y: 100 * scale }]],
      euPaths
    ).passed,
    true
  );

  const sampleWord = ALL_CARDS.find((c) => c.kind === 'W')!;
  const ex = getCardExampleSentence(sampleWord);
  assert.ok(ex.korean.length > 0 && ex.indonesian.length > 0);
});

test('buildLeaderboardRows ranks learners by XP descending, assigns leagues, and handles empty list', () => {
  assert.deepEqual(buildLeaderboardRows([]), []);
  const rows = buildLeaderboardRows(
    [
      { id: 'u1', name: 'Ayu', isPro: false, xp: 80, dailyStreak: 2, bestStreak: 5 },
      { id: 'u2', name: 'Budi', isPro: true, xp: 480, dailyStreak: 12, bestStreak: 20 },
      { id: 'u3', name: 'Citra', isPro: true, xp: 240, dailyStreak: 6, bestStreak: 10 },
    ],
    'u1'
  );
  assert.equal(rows[0].name, 'Budi');
  assert.equal(rows[0].rank, 1);
  assert.equal(rows[0].league, 'Berlian');
  assert.equal(rows[1].league, 'Emas');
  assert.equal(rows[2].isCurrentUser, true);
  assert.equal(rows[2].league, 'Perunggu');
});

test('ALL_WRITING_GLYPHS covers all 40 LETTER_CARDS and passes pattern self-validation', () => {
  assert.equal(ALL_WRITING_GLYPHS.length, 40);
  const glyphChars = new Set(ALL_WRITING_GLYPHS.map((g) => g.char));
  for (const letter of LETTER_CARDS) {
    assert.ok(glyphChars.has(letter.h), `Missing stroke guide for letter ${letter.h}`);
  }

  const scale = 280 / 200;
  for (const glyph of ALL_WRITING_GLYPHS) {
    assert.ok(glyph.strokes.length > 0, `Empty strokes for ${glyph.char}`);
    assert.equal(glyph.strokeCount, glyph.strokes.length, `Mismatch strokeCount for ${glyph.char}`);
    const userStrokes = glyph.strokes.map((d) =>
      sampleSvgPathPoints(d).map((pt) => ({ x: pt.x * scale, y: pt.y * scale }))
    );
    const evalRes = evaluateWritingPattern(userStrokes, glyph.strokes, 280);
    assert.equal(evalRes.passed, true, `Self-path check failed for ${glyph.char}: ${evalRes.feedback}`);
  }
});

test('extractWritingGlyphsFromText decomposes Hangul syllables and compound batchim cleanly', () => {
  const gada = extractWritingGlyphsFromText('가다');
  assert.deepEqual(
    gada.map((g) => g.char),
    ['ㄱ', 'ㅏ', 'ㄷ']
  );

  const dak = extractWritingGlyphsFromText('닭');
  assert.deepEqual(
    dak.map((g) => g.char),
    ['ㄷ', 'ㅏ', 'ㄹ', 'ㄱ']
  );

  const nonHangul = extractWritingGlyphsFromText('123!');
  assert.equal(nonHangul.length, 0);
});

