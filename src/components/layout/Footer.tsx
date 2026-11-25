import React from 'react';
import type { AppTab } from './TopNav';

interface FooterProps {
  onSelectTab: (tab: AppTab) => void;
}

const FOOTER_LINKS: Array<{ tab: AppTab; label: string }> = [
  { tab: 'learn', label: 'Kurikulum' },
  { tab: 'arena', label: 'Latihan Seru' },
  { tab: 'dictionary', label: 'Kamus' },
  { tab: 'leaderboard', label: 'Peringkat' },
  { tab: 'business', label: 'Bisnis & Pro' },
];

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => (
  <footer className="no-print border-t border-white/60 dark:border-white/10 bg-white/55 dark:bg-slate-950/55 backdrop-blur-2xl backdrop-saturate-150">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
      <div>Hangeul.me — Website Belajar Bahasa Korea (Tersedia versi Python)</div>
      <div className="flex flex-wrap items-center gap-5">
        {FOOTER_LINKS.map((item) => (
          <button
            key={item.tab}
            type="button"
            onClick={() => onSelectTab(item.tab)}
            className="hover:text-slate-900 dark:hover:text-slate-200"
          >
            {item.label}
          </button>
        ))}
        <a
          href="/hangeul_me.py"
          download="hangeul_me.py"
          className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
        >
          Unduh Kode Python (.py)
        </a>
      </div>
    </div>
  </footer>
);
