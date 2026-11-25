import React from 'react';
import { BookOpen, Check, Flame, Layers, Snowflake, Sparkles } from 'lucide-react';
import { formatIdr } from '../lib/gameRules';

interface BusinessProViewProps {
  isPro: boolean;
  onActivatePro: (cycle: 'monthly' | 'annual') => void;
  onSwitchToFree: () => void;
}

const FEATURE_MATRIX = [
  {
    feature: 'Alfabet Hangeul (40 Huruf), Kanvas Tulis & Papan Bunyi',
    free: 'Akses penuh gratis',
    pro: 'Akses penuh + panduan goresan lengkap',
  },
  {
    feature: 'Pelindung Rekor Harian (Streak Freeze)',
    free: 'Belum tersedia (0 Freeze)',
    pro: '2 Streak Freeze otomatis tiap periode',
  },
  {
    feature: 'Modul Eksklusif (K-Drama, Travel, EPS-TOPIK Kerja, TOPIK I)',
    free: 'Terkunci (Pratinjau kurikulum)',
    pro: 'Semua 4 unit eksklusif terbuka',
  },
  {
    feature: 'Kamus 600+ Entri + Contoh Kalimat & Dek Favorit',
    free: 'Kategori umum & favorit gratis',
    pro: 'Termasuk kosakata K-Drama & Kerja EPS-TOPIK',
  },
  {
    feature: 'Studio Latihan (Isian Partikel & Susun Kalimat Korea)',
    free: 'Soal dasar gratis',
    pro: 'Seluruh skenario partikel & kalimat terbuka',
  },
];

const MONETIZATION_PILLARS = [
  {
    order: '01',
    icon: Layers,
    title: 'Akses Modul Eksklusif Berbasis Tujuan',
    hook: 'Pengguna gratis jatuh cinta pada alfabet dasar, lalu butuh tujuan nyata.',
    strategy:
      'Bagi modul Pro ke 3 segmen berdaya beli tinggi: K-Drama & Budaya Pop (Gen-Z), Travel & Kuliner Seoul (Wisatawan), serta EPS-TOPIK Kerja bagi calon pekerja profesional di Korea.',
  },
  {
    order: '02',
    icon: BookOpen,
    title: 'Kamus 600+ Entri, Contoh Kalimat & Favorit',
    hook: 'Pembelajar cepat bosan jika kamus hanya berisi kata tanpa konteks.',
    strategy:
      'Sediakan puluhan kategori seperti Sekolah & Kampus, Belanja, Teknologi, serta paket kosakata K-Drama & EPS-TOPIK dengan contoh kalimat dan penyimpanan Favorit pribadi.',
  },
  {
    order: '03',
    icon: Snowflake,
    title: 'Pelindung Rekor Harian (Streak Freeze)',
    hook: 'Ketakutan kehilangan streak harian adalah pemicu retensi terkuat.',
    strategy:
      'Akun Pro mendapatkan 2 Streak Freeze otomatis untuk menjaga rekor belajar harian tetap aman ketika pengguna berhalangan membuka aplikasi selama 1 hari.',
  },
  {
    order: '04',
    icon: Sparkles,
    title: '7 Studio Latihan + Liga Papan Peringkat',
    hook: 'Kompetisi ringan mingguan membuat pembelajar kembali setiap hari.',
    strategy:
      'Gabungkan Kuis Kilat, Kanvas Tulis Hangeul, Rakit Suku Kata, Isian Partikel, Cocokkan Pasangan, Susun Kalimat, dan Kartu Geser 60d yang langsung terhubung ke Liga Papan Peringkat.',
  },
];

export const BusinessProView: React.FC<BusinessProViewProps> = ({
  isPro,
  onActivatePro,
  onSwitchToFree,
}) => {
  return (
    <div className="space-y-10">
      {/* Pricing Tier Cards */}
      <section aria-labelledby="pricing-heading" className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <h1 id="pricing-heading" className="sr-only">
          Pilihan Paket Harga Hangeul.me Pro
        </h1>

        {/* Free Tier */}
        <div className="ios-card flex flex-col justify-between bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-6">
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Untuk Pelajar Pemula
            </div>
            <h3 className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white">
              Gratis (Free)
            </h3>
            <div className="mt-4 font-display text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatIdr(0)}
              <span className="text-xs font-normal text-slate-500"> / selamanya</span>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>40 huruf Hangeul, Kanvas Tulis &amp; kosakata inti</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Latihan interaktif tanpa batas sesi</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>7 mode latihan interaktif &amp; liga mingguan</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={onSwitchToFree}
            className="btn-tactile mt-6 w-full py-3 px-4 rounded-2xl border border-white/75 border-b-4 border-b-slate-300/80 dark:border-white/15 bg-white/70 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/15"
          >
            {!isPro ? 'Sedang Aktif (Akun Gratis)' : 'Uji Tampilan Akun Gratis'}
          </button>
        </div>

        {/* Pro Annual */}
        <div className="ios-card flex flex-col justify-between bg-slate-900/82 dark:bg-slate-900/75 border-2 border-emerald-400/80 p-6 text-white">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Rekomendasi · Pelajar Serius</span>
              <span>Hemat 32%</span>
            </div>
            <h3 className="mt-1 font-display text-xl font-extrabold">Hangeul.me Pro Tahunan</h3>
            <div className="mt-4 font-display text-3xl font-extrabold tabular-nums">
              {formatIdr(399000)}
              <span className="text-xs font-normal text-slate-300"> / tahun</span>
            </div>
            <p className="mt-1 text-xs text-slate-300 tabular-nums">
              Setara {formatIdr(33250)} per bulan
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Semua 4 modul eksklusif (K-Drama, Travel, EPS-TOPIK, TOPIK I)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Akses penuh kamus 600+ entri K-Drama &amp; Kerja</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Semua skenario latihan + 2 Streak Freeze otomatis</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onActivatePro('annual')}
            className="btn-tactile mt-6 w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 text-slate-950 text-xs font-extrabold transition-colors"
          >
            {isPro ? 'Mode Pro Aktif' : 'Aktifkan Simulasi Pro Tahunan'}
          </button>
        </div>

        {/* Pro Monthly */}
        <div className="ios-card flex flex-col justify-between bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-6">
          <div>
            <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
              Fleksibel Tanpa Komitmen
            </div>
            <h3 className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white">
              Hangeul.me Pro Bulanan
            </h3>
            <div className="mt-4 font-display text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatIdr(49000)}
              <span className="text-xs font-normal text-slate-500"> / bulan</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Langganan bulanan yang bisa diaktifkan kapan saja
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Seluruh fitur Hangeul.me Pro tanpa komitmen tahunan</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Persiapan cepat ujian EPS-TOPIK &amp; tata bahasa</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Semua skenario latihan + 2 Streak Freeze pelindung streak</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onActivatePro('monthly')}
            className="btn-tactile mt-6 w-full py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 border-b-4 border-sky-800 text-white text-xs font-bold transition-colors"
          >
            {isPro ? 'Gunakan Pro Bulanan' : 'Aktifkan Simulasi Pro Bulanan'}
          </button>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="ios-card bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/60 dark:border-white/10">
          <h2 className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
            Perbandingan Paket Gratis vs Hangeul.me Pro
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] text-xs text-slate-500 dark:text-slate-400">
                <th className="py-3 px-6 font-semibold">Fitur Produk</th>
                <th className="py-3 px-6 font-semibold">Gratis (Free)</th>
                <th className="py-3 px-6 font-semibold text-emerald-600 dark:text-emerald-400">
                  Hangeul.me Pro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/10">
              {FEATURE_MATRIX.map((row) => (
                <tr key={row.feature} className="hover:bg-white/45 dark:hover:bg-white/[0.04]">
                  <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-slate-100">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400">{row.free}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                    {row.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pillars Strategy Advice */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>Strategi Fitur Monetisasi &amp; Retensi Pelajar</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MONETIZATION_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.order}
                className="ios-card rounded-3xl bg-white/62 dark:bg-slate-900/52 border border-white/75 dark:border-white/12 p-6 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
                  <span>{pillar.order}. Pilar Monetisasi</span>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Pemicu konversi: {pillar.hook}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pillar.strategy}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
