import { useEffect, useState } from 'react';
import { Footer } from './components/layout/Footer';
import { TopNav, type AppTab } from './components/layout/TopNav';
import { WorkspaceSubbar } from './components/layout/WorkspaceSubbar';
import { LearningPathView } from './components/learn/LearningPathView';
import { AuthModal, type AuthModalTab } from './components/modals/AuthModal';
import { BatchimGuideModal } from './components/modals/BatchimGuideModal';
import { PaywallModal, type PaywallReason } from './components/modals/PaywallModal';
import { BusinessProView } from './components/views/BusinessProView';
import { DictionaryView } from './components/views/DictionaryView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { SwipeArenaView, type PracticeStudioTab } from './components/views/SwipeArenaView';
import type { CurriculumModule } from './data/hangeulData';
import { useAuthSession } from './hooks/useAuthSession';
import { useLearningStore } from './hooks/useLearningStore';

export default function App() {
  const {
    state,
    toggleTheme,
    activatePro,
    switchToFree,
    toggleFavorite,
    updateProgress,
    setLearnerName,
    applyServerProgress,
  } = useLearningStore();

  const {
    token,
    currentUser,
    register,
    login,
    logout,
    syncProgress,
    fetchLeaderboard,
    checkoutPro,
  } = useAuthSession();

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'arena';
      const tabParam = params.get('tab') as AppTab | null;
      if (
        tabParam &&
        ['learn', 'arena', 'dictionary', 'leaderboard', 'business'].includes(tabParam)
      ) {
        return tabParam;
      }
    }
    return 'learn';
  });

  const [selectedModule, setSelectedModule] = useState<CurriculumModule | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeStudioTab>('quiz');
  const [batchimGuideOpen, setBatchimGuideOpen] = useState(false);

  const [paywallState, setPaywallState] = useState<{
    open: boolean;
    reason: PaywallReason;
    contextTitle?: string;
  }>({ open: false, reason: 'general' });

  const [authModal, setAuthModal] = useState<{ open: boolean; tab: AuthModalTab }>({
    open: false,
    tab: 'login',
  });

  const effectiveIsPro = currentUser ? currentUser.isPro : state.isPro;

  const currentUserId = currentUser?.id ?? null;

  // Sync learner progress to backend whenever XP, streak, favorites, or mastery updates while signed in
  useEffect(() => {
    if (!token || !currentUserId) return;
    const timer = window.setTimeout(() => {
      void syncProgress({
        xp: state.xp,
        bestStreak: state.bestStreak,
        dailyStreak: state.dailyStreak,
        lastActiveDate: state.lastActiveDate,
        streakFreezeCount: state.streakFreezeCount,
        favorites: state.favorites,
        moduleMastery: state.moduleMastery,
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [
    token,
    currentUserId,
    state.xp,
    state.bestStreak,
    state.dailyStreak,
    state.lastActiveDate,
    state.streakFreezeCount,
    state.favorites,
    state.moduleMastery,
    syncProgress,
  ]);

  const triggerPaywall = (reason: PaywallReason, contextTitle?: string) => {
    setPaywallState({ open: true, reason, contextTitle });
  };

  const handleStartModule = (mod: CurriculumModule) => {
    setSelectedModule(mod);
    setPracticeMode('quiz');
    setActiveTab('arena');
  };

  const handleUpgradePro = async (cycle: 'monthly' | 'annual') => {
    if (currentUser) {
      await checkoutPro(cycle, 'QRIS Instan');
    }
    activatePro(cycle);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
      <TopNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isPro={effectiveIsPro}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModal({ open: true, tab: 'login' })}
        onLogout={() => void handleLogout()}
        onOpenUpgrade={() => {
          if (effectiveIsPro) {
            setActiveTab('business');
          } else {
            triggerPaywall('general');
          }
        }}
      />

      <WorkspaceSubbar
        isPro={effectiveIsPro}
        currentUser={currentUser}
        xp={state.xp}
        dailyStreak={state.dailyStreak}
        streakFreezeCount={state.streakFreezeCount}
        bestStreak={state.bestStreak}
        weakCount={Object.keys(state.weakCards).length}
        theme={state.theme}
        onToggleTheme={toggleTheme}
        onSwitchTier={(nextPro) => (nextPro ? activatePro(state.planCycle) : switchToFree())}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-7">
        {activeTab === 'learn' && (
          <LearningPathView
            isPro={effectiveIsPro}
            xp={state.xp}
            dailyStreak={state.dailyStreak}
            streakFreezeCount={state.streakFreezeCount}
            favoritesCount={state.favorites.length}
            dailyQuests={state.dailyQuests}
            moduleMastery={state.moduleMastery}
            onStartModule={handleStartModule}
            onStartQuickArena={(mode = 'quiz') => {
              setSelectedModule(null);
              setPracticeMode(mode);
              setActiveTab('arena');
            }}
            onOpenDictionary={() => setActiveTab('dictionary')}
            onOpenBatchimGuide={() => setBatchimGuideOpen(true)}
            onTriggerPaywall={triggerPaywall}
          />
        )}

        {activeTab === 'arena' && (
          <SwipeArenaView
            activeModule={selectedModule}
            initialPracticeMode={practiceMode}
            isPro={effectiveIsPro}
            bestStreak={state.bestStreak}
            bestChallenge={state.bestChallenge}
            weakCards={state.weakCards}
            favorites={state.favorites}
            onProgressUpdate={updateProgress}
            onTriggerPaywall={triggerPaywall}
          />
        )}

        {activeTab === 'dictionary' && (
          <DictionaryView
            isPro={effectiveIsPro}
            weakCards={state.weakCards}
            favorites={state.favorites}
            onToggleFavorite={toggleFavorite}
            onTriggerPaywall={triggerPaywall}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            currentUser={currentUser}
            localName={state.learnerName}
            localXp={state.xp}
            localDailyStreak={state.dailyStreak}
            localBestStreak={state.bestStreak}
            localFreezeCount={state.streakFreezeCount}
            localIsPro={effectiveIsPro}
            fetchLeaderboard={fetchLeaderboard}
            onOpenAuth={() => setAuthModal({ open: true, tab: 'login' })}
            onStartArena={() => setActiveTab('arena')}
          />
        )}

        {activeTab === 'business' && (
          <BusinessProView
            isPro={effectiveIsPro}
            onActivatePro={(cycle) => void handleUpgradePro(cycle)}
            onSwitchToFree={switchToFree}
          />
        )}
      </main>

      <Footer onSelectTab={setActiveTab} />

      <BatchimGuideModal
        open={batchimGuideOpen}
        onClose={() => setBatchimGuideOpen(false)}
      />

      <PaywallModal
        open={paywallState.open}
        reason={paywallState.reason}
        contextTitle={paywallState.contextTitle}
        isLoggedIn={Boolean(currentUser)}
        onClose={() => setPaywallState((prev) => ({ ...prev, open: false }))}
        onActivatePro={handleUpgradePro}
        onViewBlueprint={() => setActiveTab('business')}
        onOpenAuth={() => setAuthModal({ open: true, tab: 'login' })}
      />

      <AuthModal
        open={authModal.open}
        initialTab={authModal.tab}
        initialProgress={{
          xp: state.xp,
          bestStreak: state.bestStreak,
          dailyStreak: state.dailyStreak,
          lastActiveDate: state.lastActiveDate,
          streakFreezeCount: state.streakFreezeCount,
          favorites: state.favorites,
          moduleMastery: state.moduleMastery,
        }}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
        onLogin={login}
        onRegister={register}
        onAuthenticated={(user) => {
          setLearnerName(user.name);
          applyServerProgress(user.progress);
        }}
      />
    </div>
  );
}
