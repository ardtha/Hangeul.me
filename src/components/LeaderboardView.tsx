import React, { useEffect, useMemo, useState } from 'react';
import { Crown, Flame, Medal, RefreshCw, Snowflake, Trophy, UserCheck } from 'lucide-react';
import {
  buildLeaderboardRows,
  type AuthUser,
  type LeaderboardEntry,
} from '../lib/gameRules';

interface LeaderboardViewProps {
  currentUser: AuthUser | null;
  localName: string;
  localXp: number;
  localDailyStreak: number;
  localBestStreak: number;
  localFreezeCount: number;
  localIsPro: boolean;
  fetchLeaderboard: () => Promise<LeaderboardEntry[]>;
  onOpenAuth: () => void;
  onStartArena: () => void;
}

const LEAGUE_COLORS: Record<string, string> = {
  Berlian: 'text-sky-600 dark:text-sky-400',
  Emas: 'text-amber-600 dark:text-amber-400',
  Perak: 'text-slate-600 dark:text-slate-300',
  Perunggu: 'text-orange-700 dark:text-orange-400',
};

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  localName,
  localXp,
  localDailyStreak,
  localBestStreak,
  localFreezeCount,
  localIsPro,
  fetchLeaderboard,
  onOpenAuth,
  onStartArena,
}) => {
  const [serverEntries, setServerEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const entries = await fetchLeaderboard();
      setServerEntries(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat peringkat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [currentUser?.id, localXp]);

  const rankedRows = useMemo(() => {
    const baseEntries = [...serverEntries];
    if (currentUser) {
      const idx = baseEntries.findIndex((e) => e.id === currentUser.id);
      const userRow: LeaderboardEntry = {
        id: currentUser.id,
        name: currentUser.name,
        isPro: localIsPro,
        xp: Math.max(localXp, currentUser.progress?.xp ?? 0),
        dailyStreak: Math.max(localDailyStreak, currentUser.progress?.dailyStreak ?? 1),
        bestStreak: Math.max(localBestStreak, currentUser.progress?.bestStreak ?? 0),
        isCurrentUser: true,
      };
      if (idx >= 0) {
        baseEntries[idx] = userRow;
      } else {
        baseEntries.push(userRow);
      }
    }
    return buildLeaderboardRows(baseEntries, currentUser?.id);
  }, [serverEntries, currentUser, localIsPro, localXp, localDailyStreak, localBestStreak]);

  const myRow = rankedRows.find((r) => r.isCurrentUser);
  const topThree = rankedRows.length >= 3 ? rankedRows.slice(0, 3) : [];
  const summaryLeague = myRow?.league ?? 'Perunggu';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Trophy className="w-4 h-4" />
            <span>Liga Mingguan Hangeul.me</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Papan Peringkat Pelajar
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Kumpulkan XP dari Kuis, Kanvas Tulis Hangeul, Isian Partikel, dan Rakit Kata untuk naik dari Liga Perunggu menuju Liga Berlian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!currentUser && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-xs font-bold whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk untuk Simpan Skor</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-white/75 dark:border-white/12 bg-white/65 dark:bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/15"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </section>

      {/* Personal Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="ios-card rounded-2xl bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Peringkat Anda</div>
          <div className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
            {myRow ? `#${myRow.rank}` : '—'}
          </div>
          <div className={`mt-0.5 text-xs font-bold ${LEAGUE_COLORS[summaryLeague]}`}>
            {myRow ? `Liga ${myRow.league}` : `Tamu (${localName})`}
          </div>
        </div>

        <div className="ios-card rounded-2xl bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total XP Mingguan</div>
          <div className="mt-1 font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {myRow ? myRow.xp : localXp} XP
          </div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {currentUser ? 'Tersinkronisasi ke server' : 'Disimpan lokal'}
          </div>
        </div>

        <div className="ios-card rounded-2xl bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Streak Harian</div>
          <div className="mt-1 flex items-center gap-1.5 font-display text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            <Flame className="w-5 h-5" />
            <span>{myRow ? myRow.dailyStreak : localDailyStreak} Hari</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Combo terbaik: {myRow ? myRow.bestStreak : localBestStreak}
          </div>
        </div>

        <div className="ios-card rounded-2xl bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Streak Freeze</div>
          <div className="mt-1 flex items-center gap-1.5 font-display text-2xl font-extrabold text-sky-600 dark:text-sky-400">
            <Snowflake className="w-5 h-5" />
            <span>{localFreezeCount}</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {localFreezeCount > 0 ? 'Aktif melindungi 1 hari bolong' : 'Tersedia otomatis di Pro'}
          </div>
        </div>
      </section>

      {/* Top 3 Podium Cards (shown when 3+ learners are ranked) */}
      {topThree.length === 3 && (
        <section aria-label="Podium peringkat teratas" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((item) => (
            <div
              key={item.id}
              className={`ios-card rounded-3xl border p-5 flex items-center justify-between gap-4 ${
                item.rank === 1
                  ? 'bg-gradient-to-br from-amber-50/80 to-white/65 dark:from-amber-950/45 dark:to-slate-900/60 border-amber-300/80 dark:border-amber-600/60'
                  : 'bg-white/62 dark:bg-slate-900/52 border-white/75 dark:border-white/12'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`w-11 h-11 rounded-2xl font-display font-extrabold text-base inline-flex items-center justify-center shrink-0 ${
                    item.rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : item.rank === 2
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'bg-orange-200 dark:bg-orange-950 text-orange-900 dark:text-orange-200'
                  }`}
                >
                  #{item.rank}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-sm font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    <span className="truncate">{item.name}</span>
                    {item.isPro && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  </div>
                  <div className={`text-xs font-semibold ${LEAGUE_COLORS[item.league]}`}>
                    Liga {item.league} · {item.dailyStreak} hari streak
                  </div>
                </div>
              </div>

              <div className="text-right tabular-nums shrink-0">
                <div className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                  {item.xp}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">XP</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200/80 dark:border-rose-900/70 bg-rose-50/75 dark:bg-rose-950/45 backdrop-blur-md px-4 py-3 text-xs font-semibold text-rose-700 dark:text-rose-300"
        >
          {error}
        </div>
      )}

      {/* Full Leaderboard Grouped List (iOS inset grouped glass card) */}
      <section className="ios-card rounded-[28px] bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/60 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-display text-base font-extrabold text-slate-900 dark:text-white">
            <Medal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Klasemen Pelajar Aktif</span>
          </div>
          <button
            type="button"
            onClick={onStartArena}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Tambah XP Sekarang →
          </button>
        </div>

        {rankedRows.length === 0 ? (
          <div className="px-6 py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/70 dark:bg-white/10 border border-white/75 dark:border-white/12 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                Papan peringkat masih kosong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Masuk atau daftar akun terlebih dahulu, lalu selesaikan latihan untuk mencatat skor XP Anda ke klasemen mingguan.
              </p>
            </div>
            {!currentUser && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-xs font-bold"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Masuk / Daftar Akun</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rankedRows.map((row) => (
              <div
                key={row.id}
                className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                  row.isCurrentUser
                    ? 'bg-sky-50/70 dark:bg-sky-950/30'
                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-7 text-center font-mono-num text-sm font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    {row.rank}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                        {row.name}
                      </span>
                      {row.isCurrentUser && (
                        <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400">
                          · Anda
                        </span>
                      )}
                      {row.isPro && (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          · Pro
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      Liga {row.league} · Streak {row.dailyStreak} hari · Combo {row.bestStreak}
                    </div>
                  </div>
                </div>

                <div className="font-display text-base font-extrabold text-slate-900 dark:text-white tabular-nums shrink-0">
                  {row.xp} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
