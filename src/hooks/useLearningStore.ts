import { useCallback, useEffect, useState } from 'react';
import {
  evaluateDailyStreak,
  type UserProgressSnapshot,
} from '../lib/gameRules';

export interface DailyQuestRecord {
  date: string;
  correctAnswered: number;
  builderSolved: number;
  pairOrChallengeDone: number;
}

export interface LearningStoreState {
  theme: 'light' | 'dark';
  isPro: boolean;
  planCycle: 'monthly' | 'annual';
  xp: number;
  bestStreak: number;
  dailyStreak: number;
  lastActiveDate: string;
  bestChallenge: number;
  streakFreezeCount: number;
  freezeActivatedToday: boolean;
  favorites: string[];
  weakCards: Record<string, number>;
  moduleMastery: Record<string, number>;
  dailyQuests: DailyQuestRecord;
  learnerName: string;
}

const STORAGE_KEY = 'hangeul_me_web_store_v3';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function readInitialState(): LearningStoreState {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const today = todayIso();
  const emptyQuests: DailyQuestRecord = {
    date: today,
    correctAnswered: 0,
    builderSolved: 0,
    pairOrChallengeDone: 0,
  };

  const defaults: LearningStoreState = {
    theme: prefersDark ? 'dark' : 'light',
    isPro: false,
    planCycle: 'annual',
    xp: 0,
    bestStreak: 0,
    dailyStreak: 1,
    lastActiveDate: today,
    bestChallenge: 0,
    streakFreezeCount: 0,
    freezeActivatedToday: false,
    favorites: [],
    weakCards: {},
    moduleMastery: {},
    dailyQuests: emptyQuests,
    learnerName: 'Pengguna Hangeul.me',
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('hangeul_me_web_store_v2');
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<LearningStoreState>;
    const savedQuests = parsed.dailyQuests;

    const streakEval = evaluateDailyStreak({
      lastActiveDate: parsed.lastActiveDate || today,
      todayDate: today,
      currentStreak: parsed.dailyStreak ?? 1,
      streakFreezeCount: parsed.streakFreezeCount ?? 0,
      isPro: Boolean(parsed.isPro),
    });

    return {
      ...defaults,
      ...parsed,
      dailyStreak: streakEval.dailyStreak,
      lastActiveDate: streakEval.lastActiveDate,
      streakFreezeCount: streakEval.streakFreezeCount,
      freezeActivatedToday: streakEval.freezeActivated,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      dailyQuests:
        savedQuests && savedQuests.date === today ? savedQuests : emptyQuests,
    };
  } catch {
    return defaults;
  }
}

export function useLearningStore() {
  const [state, setState] = useState<LearningStoreState>(readInitialState);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const activatePro = useCallback((cycle: 'monthly' | 'annual' = 'annual') => {
    setState((prev) => ({
      ...prev,
      isPro: true,
      planCycle: cycle,
      streakFreezeCount: Math.max(prev.streakFreezeCount, 2),
    }));
  }, []);

  const switchToFree = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPro: false,
    }));
  }, []);

  const toggleFavorite = useCallback((cardId: string) => {
    setState((prev) => {
      const exists = prev.favorites.includes(cardId);
      const nextFavs = exists
        ? prev.favorites.filter((id) => id !== cardId)
        : [cardId, ...prev.favorites];
      return {
        ...prev,
        favorites: nextFavs,
      };
    });
  }, []);

  const updateProgress = useCallback(
    (patch: {
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
    }) => {
      setState((prev) => {
        const nextModuleMastery = { ...prev.moduleMastery };
        if (patch.moduleId && patch.moduleCorrectDelta && patch.moduleTotalCards) {
          const prevPct = nextModuleMastery[patch.moduleId] ?? 0;
          const stepPct = Math.max(4, Math.round((patch.moduleCorrectDelta / patch.moduleTotalCards) * 100));
          nextModuleMastery[patch.moduleId] = Math.min(100, prevPct + stepPct);
        }

        const today = todayIso();
        const baseQuests =
          prev.dailyQuests.date === today
            ? prev.dailyQuests
            : { date: today, correctAnswered: 0, builderSolved: 0, pairOrChallengeDone: 0 };

        const streakEval = evaluateDailyStreak({
          lastActiveDate: prev.lastActiveDate,
          todayDate: today,
          currentStreak: prev.dailyStreak,
          streakFreezeCount: prev.streakFreezeCount,
          isPro: prev.isPro,
        });

        return {
          ...prev,
          xp: prev.xp + (patch.xpDelta ?? 0),
          bestStreak:
            patch.bestStreak !== undefined ? Math.max(prev.bestStreak, patch.bestStreak) : prev.bestStreak,
          dailyStreak: streakEval.dailyStreak,
          lastActiveDate: today,
          streakFreezeCount: streakEval.streakFreezeCount,
          freezeActivatedToday: prev.freezeActivatedToday || streakEval.freezeActivated,
          bestChallenge:
            patch.bestChallenge !== undefined
              ? Math.max(prev.bestChallenge, patch.bestChallenge)
              : prev.bestChallenge,
          weakCards: patch.weakCards !== undefined ? patch.weakCards : prev.weakCards,
          moduleMastery: nextModuleMastery,
          dailyQuests: {
            date: today,
            correctAnswered: baseQuests.correctAnswered + (patch.questCorrectDelta ?? 0),
            builderSolved: baseQuests.builderSolved + (patch.questBuilderDelta ?? 0),
            pairOrChallengeDone: baseQuests.pairOrChallengeDone + (patch.questPairDelta ?? 0),
          },
        };
      });
    },
    []
  );

  const setLearnerName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      learnerName: name,
    }));
  }, []);

  const applyServerProgress = useCallback((serverProg?: UserProgressSnapshot) => {
    if (!serverProg) return;
    setState((prev) => {
      const mergedFavs = Array.from(new Set([...(serverProg.favorites || []), ...prev.favorites]));
      const mergedMastery: Record<string, number> = { ...prev.moduleMastery };
      for (const [k, v] of Object.entries(serverProg.moduleMastery || {})) {
        mergedMastery[k] = Math.max(mergedMastery[k] ?? 0, v);
      }
      return {
        ...prev,
        xp: Math.max(prev.xp, serverProg.xp),
        bestStreak: Math.max(prev.bestStreak, serverProg.bestStreak),
        dailyStreak: Math.max(prev.dailyStreak, serverProg.dailyStreak),
        streakFreezeCount: Math.max(prev.streakFreezeCount, serverProg.streakFreezeCount),
        favorites: mergedFavs,
        moduleMastery: mergedMastery,
      };
    });
  }, []);

  return {
    state,
    toggleTheme,
    activatePro,
    switchToFree,
    toggleFavorite,
    updateProgress,
    setLearnerName,
    applyServerProgress,
  };
}

