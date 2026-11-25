import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, MessageCircle, Search, Star, Volume2, X } from 'lucide-react';
import {
  FULL_DICTIONARY_CARDS,
  getCardExampleSentence,
  type FlashcardItem,
} from '../../data/hangeulData';
import { speakKorean } from '../../lib/speech';
import type { PaywallReason } from '../modals/PaywallModal';

interface DictionaryViewProps {
  isPro: boolean;
  weakCards: Record<string, number>;
  favorites: string[];
  onToggleFavorite: (cardId: string) => void;
  onTriggerPaywall: (reason: PaywallReason, contextTitle?: string) => void;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  isPro,
  weakCards,
  favorites,
  onToggleFavorite,
  onTriggerPaywall,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [spotlightCard, setSpotlightCard] = useState<FlashcardItem | null>(null);
  const categoryBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = categoryBarRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (e.deltaY !== 0 || e.deltaX !== 0) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollLeft += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const combinedCatalog = FULL_DICTIONARY_CARDS;
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(combinedCatalog.map((item) => item.type)));
    return ['Semua', 'Favorit', ...unique];
  }, [combinedCatalog]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return combinedCatalog.filter((item) => {
      if (selectedCategory === 'Favorit') {
        if (!favoriteSet.has(item.id)) return false;
      } else if (selectedCategory !== 'Semua' && item.type !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return [item.h, item.c, item.m, item.type].join(' ').toLowerCase().includes(q);
    });
  }, [combinedCatalog, query, selectedCategory, favoriteSet]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filteredItems>();
    filteredItems.forEach((item) => {
      const arr = map.get(item.type) ?? [];
      arr.push(item);
      map.set(item.type, arr);
    });
    return Array.from(map.entries());
  }, [filteredItems]);

  const isProCategory = (cat: string) => cat === 'K-Drama' || cat === 'Kerja & EPS-TOPIK';

  const spotlightExample = spotlightCard ? getCardExampleSentence(spotlightCard) : null;

  return (
    <div className="space-y-6">
      {/* Header & iOS Search Field */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/60 dark:border-white/10 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kamus &amp; Contoh Kalimat ({combinedCatalog.length} Entri)
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Ketuk kartu untuk mendengar suara Korea dan melihat contoh kalimatnya. Tekan ★ untuk menyimpan ke Dek Favorit.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <label htmlFor="dictionary-search" className="sr-only">
            Cari hangeul, romanisasi, atau arti
          </label>
          <input
            id="dictionary-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kata Korea, bacaan, atau arti..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/[0.08] backdrop-blur-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 shadow-xs"
          />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div
        ref={categoryBarRef}
        className="no-scrollbar overscroll-contain flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        {categories.map((cat) => {
          const isFavTab = cat === 'Favorit';
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 backdrop-blur-md ${
                active
                  ? isFavTab
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white/60 dark:bg-white/[0.07] text-slate-700 dark:text-slate-200 border border-white/70 dark:border-white/12 hover:bg-white/85 dark:hover:bg-white/15'
              }`}
            >
              {isFavTab && <Star className="w-3.5 h-3.5" />}
              <span>{isFavTab ? `Favorit (${favorites.length})` : cat}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Example Sentence Spotlight Card (iOS grouped glass sheet) */}
      {spotlightCard && spotlightExample && (
        <section
          aria-label="Detail contoh kalimat kamus"
          className="ios-card rounded-3xl bg-white/72 dark:bg-slate-900/65 border-2 border-sky-400/70 dark:border-sky-500/60 p-5 sm:p-6 space-y-4 animate-gentle-pop"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                Contoh Penggunaan · {spotlightCard.type}
              </span>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {spotlightCard.h}
                </h2>
                <span className="text-sm font-bold text-sky-700 dark:text-sky-400">
                  ({spotlightCard.c})
                </span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  — {spotlightCard.m}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleFavorite(spotlightCard.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  favoriteSet.has(spotlightCard.id)
                    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${favoriteSet.has(spotlightCard.id) ? 'fill-amber-500 text-amber-500' : ''}`}
                />
                <span>{favoriteSet.has(spotlightCard.id) ? 'Tersimpan' : 'Simpan Favorit'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSpotlightCard(null)}
                aria-label="Tutup detail contoh kalimat"
                className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="ios-glass-well rounded-2xl bg-white/55 dark:bg-white/[0.06] border border-white/70 dark:border-white/12 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
                <span>Contoh Kalimat Asli</span>
              </div>
              <div className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                {spotlightExample.korean}
              </div>
              <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                {spotlightExample.roman}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                "{spotlightExample.indonesian}"
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakKorean(spotlightExample.korean)}
              className="btn-tactile inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-xs font-bold whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              <Volume2 className="w-4 h-4" />
              <span>Putar Kalimat</span>
            </button>
          </div>
        </section>
      )}

      {/* Dictionary Results */}
      {grouped.length === 0 ? (
        <div className="ios-card rounded-3xl border border-white/75 dark:border-white/12 bg-white/62 dark:bg-slate-900/52 p-10 text-center space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {selectedCategory === 'Favorit'
              ? 'Belum ada kosakata di daftar Favorit Anda. Ketuk ikon bintang ★ pada kartu kamus untuk menyimpannya!'
              : `Tidak ditemukan entri kamus yang cocok dengan "${query}".`}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('Semua');
            }}
            className="btn-tactile px-4 py-2.5 rounded-xl bg-sky-600 border-b-4 border-sky-800 text-white text-xs font-bold"
          >
            Tampilkan Semua Entri
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([categoryName, items]) => {
            const locked = isProCategory(categoryName) && !isPro;
            return (
              <section key={categoryName} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                    {categoryName}{' '}
                    <span className="font-normal text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      · {items.length} entri
                    </span>
                  </h2>
                  {locked && (
                    <button
                      type="button"
                      onClick={() => onTriggerPaywall('module', categoryName)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Buka Modul Pro</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {items.map((item) => {
                    const isWeak = Boolean(weakCards[item.h]);
                    const isFav = favoriteSet.has(item.id);
                    const isSpotlit = spotlightCard?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`ios-card rounded-2xl border p-3.5 transition-colors flex flex-col justify-between bg-white/62 dark:bg-slate-900/52 ${
                          isSpotlit
                            ? 'border-sky-500 ring-2 ring-sky-500/25'
                            : isWeak
                            ? 'border-amber-400 bg-amber-50/50 dark:border-amber-500 dark:bg-amber-950/30'
                            : 'border-white/75 dark:border-white/12 hover:border-sky-400/70 dark:hover:border-sky-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (locked) {
                                onTriggerPaywall('module', categoryName);
                                return;
                              }
                              setSpotlightCard(item);
                              speakKorean(item.h);
                            }}
                            className="flex-1 text-left min-w-0"
                          >
                            <span className="font-display text-xl font-extrabold text-slate-900 dark:text-white block truncate">
                              {item.h}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (locked) {
                                onTriggerPaywall('module', categoryName);
                                return;
                              }
                              onToggleFavorite(item.id);
                            }}
                            aria-label={isFav ? `Hapus ${item.h} dari favorit` : `Simpan ${item.h} ke favorit`}
                            className="w-8 h-8 -mr-1 -mt-1 rounded-xl inline-flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                          >
                            {locked ? (
                              <Lock className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Star
                                className={`w-4 h-4 ${
                                  isFav ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                                }`}
                              />
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (locked) {
                              onTriggerPaywall('module', categoryName);
                              return;
                            }
                            setSpotlightCard(item);
                            speakKorean(item.h);
                          }}
                          className="mt-1 text-left w-full"
                        >
                          <div className="text-xs font-bold text-sky-700 dark:text-sky-400 truncate">
                            {locked ? 'Khusus Anggota Pro' : item.c}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {item.m}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
