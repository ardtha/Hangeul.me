import React, { useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { LETTER_CARDS, type FlashcardItem } from '../../data/hangeulData';
import { speakKorean } from '../../lib/speech';

const SOUNDBOARD_GROUPS = [
  'Konsonan Dasar',
  'Konsonan Aspirasi',
  'Konsonan Kembar',
  'Vokal Dasar',
  'Vokal Ganda',
] as const;

type SoundboardGroup = (typeof SOUNDBOARD_GROUPS)[number];

interface HangeulSoundboardProps {
  onOpenBatchimGuide: () => void;
}

export const HangeulSoundboard: React.FC<HangeulSoundboardProps> = ({
  onOpenBatchimGuide,
}) => {
  const [soundGroup, setSoundGroup] = useState<SoundboardGroup>('Konsonan Dasar');
  const [activeLetter, setActiveLetter] = useState<FlashcardItem>(LETTER_CARDS[0]);

  const visibleLetters = useMemo(
    () => LETTER_CARDS.filter((card) => card.type === soundGroup),
    [soundGroup]
  );

  return (
    <section
      aria-labelledby="soundboard-heading"
      className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-5 sm:p-7 space-y-5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
            <Volume2 className="w-4 h-4" />
            <span>Papan Bunyi 40 Huruf Hangeul Interaktif</span>
          </div>
          <h2
            id="soundboard-heading"
            className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white"
          >
            Ketuk Huruf untuk Mendengar Pelafalan Aslinya
          </h2>
        </div>

        <div
          role="group"
          aria-label="Filter kelompok huruf"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white/45 dark:bg-white/10 backdrop-blur-md border border-white/70 dark:border-white/12 max-w-full"
        >
          {SOUNDBOARD_GROUPS.map((grp) => (
            <button
              key={grp}
              type="button"
              onClick={() => setSoundGroup(grp)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                soundGroup === grp
                  ? 'bg-white/90 dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Letter Spotlight */}
      <div className="ios-glass-well rounded-2xl bg-white/50 dark:bg-white/[0.06] border border-white/70 dark:border-white/12 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-white/10 border border-white/80 dark:border-white/15 flex items-center justify-center font-display text-4xl font-extrabold text-slate-900 dark:text-white shrink-0 shadow-xs">
            {activeLetter.h}
          </div>
          <div>
            <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
              {activeLetter.type}
            </div>
            <div className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
              Pelafalan: &quot;{activeLetter.c}&quot;
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">{activeLetter.m}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenBatchimGuide}
            className="px-3.5 py-2.5 rounded-xl border border-white/75 dark:border-white/12 bg-white/70 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/15"
          >
            Aturan Pola Baca
          </button>
          <button
            type="button"
            onClick={() => speakKorean(activeLetter.h)}
            className="btn-tactile inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-xs font-bold whitespace-nowrap"
          >
            <Volume2 className="w-4 h-4" />
            <span>Putar ({activeLetter.h})</span>
          </button>
        </div>
      </div>

      {/* Clickable Soundboard Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5">
        {visibleLetters.map((letter) => {
          const isSelected = activeLetter.id === letter.id;
          const isVowel = letter.type.startsWith('Vokal');
          return (
            <button
              key={letter.id}
              type="button"
              onClick={() => {
                setActiveLetter(letter);
                speakKorean(letter.h);
              }}
              className={`btn-tactile p-2.5 rounded-2xl border border-b-4 text-center transition-colors backdrop-blur-md ${
                isSelected
                  ? 'bg-sky-600 border-sky-800 text-white'
                  : isVowel
                  ? 'bg-amber-50/65 dark:bg-white/[0.07] border-amber-200/80 dark:border-white/12 text-slate-900 dark:text-white hover:border-amber-400'
                  : 'bg-emerald-50/65 dark:bg-white/[0.07] border-emerald-200/80 dark:border-white/12 text-slate-900 dark:text-white hover:border-emerald-400'
              }`}
            >
              <div className="font-display text-2xl font-extrabold leading-none">{letter.h}</div>
              <div
                className={`mt-1 text-[11px] font-semibold truncate ${
                  isSelected ? 'text-sky-100' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {letter.c}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
