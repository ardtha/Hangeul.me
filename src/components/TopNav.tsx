import React, { useState } from 'react';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import type { AuthUser } from '../lib/gameRules';

export type AppTab = 'learn' | 'arena' | 'dictionary' | 'leaderboard' | 'business';

interface TopNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isPro: boolean;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenUpgrade: () => void;
}

const NAV_ITEMS: Array<{ id: AppTab; label: string }> = [
  { id: 'learn', label: 'Belajar' },
  { id: 'arena', label: 'Latihan Seru' },
  { id: 'dictionary', label: 'Kamus' },
  { id: 'leaderboard', label: 'Peringkat' },
  { id: 'business', label: 'Bisnis & Pro' },
];

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  isPro,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenUpgrade,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (tab: AppTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/58 dark:bg-slate-950/58 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/65 dark:border-white/10 shadow-[0_1px_12px_rgba(15,23,42,0.04)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Tactile Hangeul tile + crisp brand wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('learn')}
          className="inline-flex items-center gap-2 font-display text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2 rounded-xl"
        >
          <span
            aria-hidden="true"
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 border-b-2 border-emerald-700 text-white font-display font-extrabold text-sm inline-flex items-center justify-center shadow-xs"
          >
            한
          </span>
          <span>
            Hangeul<span className="text-sky-600 dark:text-sky-400">.me</span>
          </span>
        </button>

        {/* Zone 2: Single-line navigation links */}
        <nav
          aria-label="Navigasi utama"
          className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`py-2 border-b-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-4 ${
                  active
                    ? 'border-sky-600 text-slate-950 dark:border-sky-400 dark:text-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Auth & Primary Action */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {currentUser ? (
            <button
              type="button"
              onClick={onLogout}
              title={`Keluar dari ${currentUser.email}`}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-white/70 dark:border-white/12 bg-white/65 dark:bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-white/85 dark:hover:bg-white/15 transition-colors whitespace-nowrap shrink-0"
            >
              <span className="max-w-[72px] sm:max-w-[120px] truncate">{currentUser.name}</span>
              <LogOut className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-white/70 dark:border-white/12 bg-white/65 dark:bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-white/85 dark:hover:bg-white/15 transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Masuk</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenUpgrade}
            className={`btn-tactile ${
              currentUser ? 'hidden sm:inline-flex' : 'inline-flex'
            } items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-xl border-b-[3px] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2 ${
              isPro
                ? 'bg-emerald-600 border-emerald-800 text-white hover:bg-emerald-500'
                : 'bg-sky-600 border-sky-800 text-white hover:bg-sky-500'
            }`}
          >
            {isPro ? 'Pro Aktif' : (
              <>
                <span className="hidden sm:inline">Upgrade&nbsp;</span>
                <span>Pro</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/70 dark:border-white/12 bg-white/65 dark:bg-white/10 backdrop-blur-md text-slate-700 dark:text-slate-200 shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi seluler"
          className="lg:hidden border-t border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-950/85 backdrop-blur-2xl px-4 py-3 flex flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-sky-500/15 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300 font-bold'
                    : 'text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};
