import type { WritingGlyphGuide } from './types';

export const WRITING_GLYPHS: WritingGlyphGuide[] = [
  {
    id: 'wg-1',
    char: 'ㄱ',
    roman: 'g / k',
    name: 'Giyeok (기역)',
    category: 'Konsonan',
    strokeCount: 1,
    tips: 'Tarik 1 garis datar dari kiri ke kanan lalu langsung turun ke bawah tanpa mengangkat pena.',
    strokes: ['M 45 52 L 148 52 L 148 152'],
  },
  {
    id: 'wg-2',
    char: 'ㄴ',
    roman: 'n',
    name: 'Nieun (니은)',
    category: 'Konsonan',
    strokeCount: 1,
    tips: 'Mulai dari atas ke bawah, lalu belok ke kanan menjadi sudut siku 90°.',
    strokes: ['M 52 48 L 52 148 L 154 148'],
  },
  {
    id: 'wg-3',
    char: 'ㄷ',
    roman: 'd / t',
    name: 'Digeut (디귿)',
    category: 'Konsonan',
    strokeCount: 2,
    tips: 'Goresan 1: garis datar atas. Goresan 2: mulai dari kiri atas turun lalu belok ke kanan (seperti ㄴ).',
    strokes: ['M 50 50 L 148 50', 'M 52 50 L 52 148 L 152 148'],
  },
  {
    id: 'wg-4',
    char: 'ㄹ',
    roman: 'r / l',
    name: 'Rieul (리을)',
    category: 'Konsonan',
    strokeCount: 3,
    tips: 'Goresan 1: ㄱ di atas. Goresan 2: garis tengah kiri-ke-kanan. Goresan 3: ㄴ di bawah.',
    strokes: [
      'M 52 46 L 148 46 L 148 92',
      'M 52 96 L 148 96',
      'M 52 96 L 52 152 L 152 152',
    ],
  },
  {
    id: 'wg-5',
    char: 'ㅁ',
    roman: 'm',
    name: 'Mieum (미음)',
    category: 'Konsonan',
    strokeCount: 3,
    tips: 'Goresan 1: garis vertikal kiri. Goresan 2: ㄱ menyatu ke kanan & bawah. Goresan 3: tutup kotak di bawah.',
    strokes: ['M 52 48 L 52 150', 'M 52 48 L 148 48 L 148 150', 'M 52 150 L 148 150'],
  },
  {
    id: 'wg-6',
    char: 'ㅂ',
    roman: 'b / p',
    name: 'Bieup (비읍)',
    category: 'Konsonan',
    strokeCount: 4,
    tips: 'Tarik 2 tiang vertikal dulu (kiri lalu kanan), lalu sambungkan garis tengah dan garis bawah.',
    strokes: ['M 54 45 L 54 152', 'M 146 45 L 146 152', 'M 54 98 L 146 98', 'M 54 152 L 146 152'],
  },
  {
    id: 'wg-7',
    char: 'ㅅ',
    roman: 's',
    name: 'Siot (시옷)',
    category: 'Konsonan',
    strokeCount: 2,
    tips: 'Goresan 1: melengkung serong kiri dari puncak tengah. Goresan 2: serong kanan dari tengah batang.',
    strokes: ['M 102 45 Q 92 108 42 152', 'M 98 88 Q 124 122 158 152'],
  },
  {
    id: 'wg-8',
    char: 'ㅇ',
    roman: 'ng / diam',
    name: 'Ieung (이응)',
    category: 'Konsonan',
    strokeCount: 1,
    tips: 'Tulis satu lingkaran penuh berlawanan arah jarum jam mulai dari bagian paling atas.',
    strokes: ['M 100 45 A 55 55 0 1 0 100.1 45 Z'],
  },
  {
    id: 'wg-9',
    char: 'ㅈ',
    roman: 'j',
    name: 'Jieut (지읒)',
    category: 'Konsonan',
    strokeCount: 3,
    tips: 'Garis datar atas serong turun ke kiri, lalu tambah kaki miring ke kanan.',
    strokes: ['M 48 52 L 150 52', 'M 104 52 Q 88 112 44 152', 'M 98 94 Q 126 124 156 152'],
  },
  {
    id: 'wg-10',
    char: 'ㅎ',
    roman: 'h',
    name: 'Hieut (히읗)',
    category: 'Konsonan',
    strokeCount: 3,
    tips: 'Titik atas pendek, garis datar di bawahnya, lalu lingkaran bulat di bagian bawah.',
    strokes: ['M 100 32 L 100 50', 'M 44 64 L 156 64', 'M 100 84 A 38 38 0 1 0 100.1 84 Z'],
  },
  {
    id: 'wg-11',
    char: 'ㅏ',
    roman: 'a',
    name: 'Vokal A',
    category: 'Vokal',
    strokeCount: 2,
    tips: 'Garis vertikal panjang dari atas ke bawah, lalu garis pendek menghadap kanan di tengah.',
    strokes: ['M 82 36 L 82 164', 'M 82 100 L 146 100'],
  },
  {
    id: 'wg-12',
    char: 'ㅓ',
    roman: 'eo',
    name: 'Vokal Eo',
    category: 'Vokal',
    strokeCount: 2,
    tips: 'Garis pendek dari kiri ke tengah dulu, lalu garis vertikal panjang dari atas ke bawah.',
    strokes: ['M 52 100 L 116 100', 'M 116 36 L 116 164'],
  },
  {
    id: 'wg-13',
    char: 'ㅗ',
    roman: 'o',
    name: 'Vokal O',
    category: 'Vokal',
    strokeCount: 2,
    tips: 'Garis pendek vertikal turun dulu, lalu garis horizontal panjang di bawahnya.',
    strokes: ['M 100 54 L 100 116', 'M 38 116 L 162 116'],
  },
  {
    id: 'wg-14',
    char: 'ㅜ',
    roman: 'u',
    name: 'Vokal U',
    category: 'Vokal',
    strokeCount: 2,
    tips: 'Garis horizontal panjang di atas, lalu garis vertikal pendek turun di tengah.',
    strokes: ['M 38 82 L 162 82', 'M 100 82 L 100 148'],
  },
  {
    id: 'wg-15',
    char: 'ㅡ',
    roman: 'eu',
    name: 'Vokal Eu',
    category: 'Vokal',
    strokeCount: 1,
    tips: 'Satu garis lurus datar dari kiri ke kanan.',
    strokes: ['M 36 100 L 164 100'],
  },
  {
    id: 'wg-16',
    char: 'ㅣ',
    roman: 'i',
    name: 'Vokal I',
    category: 'Vokal',
    strokeCount: 1,
    tips: 'Satu garis lurus tegak dari atas ke bawah.',
    strokes: ['M 100 36 L 100 164'],
  },
];

export const EXTENDED_WRITING_GLYPHS: WritingGlyphGuide[] = [
  {
    id: 'wg-17',
    char: 'ㅋ',
    roman: 'k (tebal)',
    name: 'Kieuk (키읔)',
    category: 'Konsonan',
    strokeCount: 2,
    tips: 'Goresan 1: bentuk ㄱ dari kiri ke kanan lalu turun. Goresan 2: tarik garis datar di bagian tengah.',
    strokes: ['M 46 48 L 148 48 L 148 152', 'M 50 98 L 148 98'],
  },
  {
    id: 'wg-18',
    char: 'ㅌ',
    roman: 't (tebal)',
    name: 'Tieut (티읕)',
    category: 'Konsonan',
    strokeCount: 3,
    tips: 'Goresan 1: garis datar atas. Goresan 2: garis tengah. Goresan 3: garis kiri turun lalu belok kanan (ㄴ).',
    strokes: ['M 52 48 L 148 48', 'M 54 96 L 142 96', 'M 52 48 L 52 148 L 152 148'],
  },
  {
    id: 'wg-19',
    char: 'ㅍ',
    roman: 'p (tebal)',
    name: 'Pieup (피읖)',
    category: 'Konsonan',
    strokeCount: 4,
    tips: 'Goresan 1: garis datar atas. Goresan 2–3: dua tiang vertikal kiri & kanan. Goresan 4: garis datar bawah.',
    strokes: ['M 46 50 L 154 50', 'M 76 50 L 76 146', 'M 124 50 L 124 146', 'M 46 146 L 154 146'],
  },
  {
    id: 'wg-20',
    char: 'ㅊ',
    roman: 'ch',
    name: 'Chieut (치읓)',
    category: 'Konsonan',
    strokeCount: 4,
    tips: 'Goresan 1: titik atas. Goresan 2: garis datar. Goresan 3–4: kaki miring kiri lalu kaki miring kanan.',
    strokes: ['M 100 30 L 100 48', 'M 46 62 L 154 62', 'M 102 62 Q 86 116 44 154', 'M 98 98 Q 126 128 156 154'],
  },
  {
    id: 'wg-21',
    char: 'ㄲ',
    roman: 'kk',
    name: 'Ssang-giyeok (쌍기역)',
    category: 'Konsonan',
    strokeCount: 2,
    tips: 'Tulis dua huruf ㄱ berdampingan secara rapat dari kiri ke kanan.',
    strokes: ['M 36 52 L 90 52 L 90 152', 'M 110 52 L 164 52 L 164 152'],
  },
  {
    id: 'wg-22',
    char: 'ㄸ',
    roman: 'tt',
    name: 'Ssang-digeut (쌍디귿)',
    category: 'Konsonan',
    strokeCount: 4,
    tips: 'Tulis huruf ㄷ pertama di sebelah kiri (2 goresan), lalu ㄷ kedua di sebelah kanan.',
    strokes: ['M 34 50 L 90 50', 'M 36 50 L 36 148 L 92 148', 'M 108 50 L 164 50', 'M 110 50 L 110 148 L 166 148'],
  },
  {
    id: 'wg-23',
    char: 'ㅃ',
    roman: 'pp',
    name: 'Ssang-bieup (쌍비읍)',
    category: 'Konsonan',
    strokeCount: 8,
    tips: 'Tulis bentuk ㅂ ramping di kiri (4 goresan), lalu ulangi ㅂ ramping di kanan.',
    strokes: [
      'M 34 48 L 34 150',
      'M 88 48 L 88 150',
      'M 34 98 L 88 98',
      'M 34 150 L 88 150',
      'M 112 48 L 112 150',
      'M 166 48 L 166 150',
      'M 112 98 L 166 98',
      'M 112 150 L 166 150',
    ],
  },
  {
    id: 'wg-24',
    char: 'ㅆ',
    roman: 'ss',
    name: 'Ssang-siot (쌍시옷)',
    category: 'Konsonan',
    strokeCount: 4,
    tips: 'Tulis huruf ㅅ di kiri (2 goresan), lalu ㅅ di kanan secara seimbang.',
    strokes: ['M 68 48 Q 58 106 28 150', 'M 64 92 Q 80 122 96 150', 'M 136 48 Q 126 106 96 150', 'M 132 92 Q 148 122 168 150'],
  },
  {
    id: 'wg-25',
    char: 'ㅉ',
    roman: 'jj',
    name: 'Ssang-jieut (쌍지읒)',
    category: 'Konsonan',
    strokeCount: 6,
    tips: 'Tulis bentuk ㅈ di kiri (3 goresan), lalu bentuk ㅈ kedua di sebelah kanan.',
    strokes: [
      'M 30 52 L 92 52',
      'M 64 52 Q 54 110 28 150',
      'M 60 94 Q 78 124 94 150',
      'M 108 52 L 170 52',
      'M 142 52 Q 132 110 106 150',
      'M 138 94 Q 156 124 172 150',
    ],
  },
  {
    id: 'wg-26',
    char: 'ㅑ',
    roman: 'ya',
    name: 'Vokal Ya',
    category: 'Vokal',
    strokeCount: 3,
    tips: 'Tarik garis vertikal panjang dulu, lalu dua garis pendek ke kanan (atas lalu bawah).',
    strokes: ['M 80 36 L 80 164', 'M 80 78 L 146 78', 'M 80 122 L 146 122'],
  },
  {
    id: 'wg-27',
    char: 'ㅕ',
    roman: 'yeo',
    name: 'Vokal Yeo',
    category: 'Vokal',
    strokeCount: 3,
    tips: 'Tulis dua garis pendek ke kiri (atas lalu bawah), lalu tutup dengan garis vertikal panjang di kanan.',
    strokes: ['M 54 78 L 120 78', 'M 54 122 L 120 122', 'M 120 36 L 120 164'],
  },
  {
    id: 'wg-28',
    char: 'ㅛ',
    roman: 'yo',
    name: 'Vokal Yo',
    category: 'Vokal',
    strokeCount: 3,
    tips: 'Tarik dua garis pendek vertikal dari kiri ke kanan, lalu garis horizontal panjang di bawahnya.',
    strokes: ['M 76 54 L 76 118', 'M 124 54 L 124 118', 'M 36 118 L 164 118'],
  },
  {
    id: 'wg-29',
    char: 'ㅠ',
    roman: 'yu',
    name: 'Vokal Yu',
    category: 'Vokal',
    strokeCount: 3,
    tips: 'Garis horizontal panjang di atas, diikuti dua garis pendek vertikal turun (kiri lalu kanan).',
    strokes: ['M 36 82 L 164 82', 'M 76 82 L 76 146', 'M 124 82 L 124 146'],
  },
  {
    id: 'wg-30',
    char: 'ㅐ',
    roman: 'ae',
    name: 'Vokal Ae',
    category: 'Vokal',
    strokeCount: 3,
    tips: 'Tulis ㅏ terlebih dahulu (vertikal lalu horizontal tengah), kemudian garis vertikal ㅣ di kanan.',
    strokes: ['M 66 38 L 66 162', 'M 66 100 L 114 100', 'M 124 38 L 124 162'],
  },
  {
    id: 'wg-31',
    char: 'ㅒ',
    roman: 'yae',
    name: 'Vokal Yae',
    category: 'Vokal',
    strokeCount: 4,
    tips: 'Tulis ㅑ terlebih dahulu (3 goresan), lalu tambahkan garis vertikal ㅣ di sebelah kanan.',
    strokes: ['M 62 38 L 62 162', 'M 62 78 L 112 78', 'M 62 122 L 112 122', 'M 128 38 L 128 162'],
  },
  {
    id: 'wg-32',
    char: 'ㅔ',
    roman: 'e',
    name: 'Vokal E',
    category: 'Vokal',
    strokeCount: 3,
    tips: 'Tulis ㅓ (horizontal pendek lalu vertikal), kemudian tambah garis vertikal ㅣ di sebelah kanan.',
    strokes: ['M 46 100 L 94 100', 'M 94 38 L 94 162', 'M 136 38 L 136 162'],
  },
  {
    id: 'wg-33',
    char: 'ㅖ',
    roman: 'ye',
    name: 'Vokal Ye',
    category: 'Vokal',
    strokeCount: 4,
    tips: 'Tulis ㅕ (dua goresan pendek lalu vertikal), kemudian garis vertikal ㅣ paling kanan.',
    strokes: ['M 44 78 L 94 78', 'M 44 122 L 94 122', 'M 94 38 L 94 162', 'M 136 38 L 136 162'],
  },
  {
    id: 'wg-34',
    char: 'ㅘ',
    roman: 'wa',
    name: 'Vokal Wa',
    category: 'Vokal',
    strokeCount: 4,
    tips: 'Tulis ㅗ di kiri (2 goresan), lalu gabungkan ㅏ di kanan (vertikal lalu horizontal pendek).',
    strokes: ['M 78 44 L 78 106', 'M 32 106 L 118 106', 'M 134 38 L 134 162', 'M 134 100 L 170 100'],
  },
  {
    id: 'wg-35',
    char: 'ㅙ',
    roman: 'wae',
    name: 'Vokal Wae',
    category: 'Vokal',
    strokeCount: 5,
    tips: 'Tulis ㅗ di sisi kiri, lalu lengkapi dengan ㅐ di sisi kanan (vertikal, tengah, vertikal kanan).',
    strokes: ['M 68 44 L 68 106', 'M 28 106 L 106 106', 'M 118 38 L 118 162', 'M 118 100 L 150 100', 'M 162 38 L 162 162'],
  },
  {
    id: 'wg-36',
    char: 'ㅚ',
    roman: 'oe',
    name: 'Vokal Oe',
    category: 'Vokal',
    strokeCount: 3,
    tips: 'Tulis ㅗ dulu (vertikal pendek lalu horizontal), lalu garis vertikal ㅣ di kanan.',
    strokes: ['M 82 44 L 82 110', 'M 34 110 L 124 110', 'M 148 38 L 148 162'],
  },
  {
    id: 'wg-37',
    char: 'ㅝ',
    roman: 'wo',
    name: 'Vokal Wo',
    category: 'Vokal',
    strokeCount: 4,
    tips: 'Tulis ㅜ di kiri (horizontal lalu vertikal turun), lalu gabung ㅓ di kanan.',
    strokes: ['M 32 76 L 114 76', 'M 74 76 L 74 148', 'M 104 110 L 140 110', 'M 144 38 L 144 162'],
  },
  {
    id: 'wg-38',
    char: 'ㅞ',
    roman: 'we',
    name: 'Vokal We',
    category: 'Vokal',
    strokeCount: 5,
    tips: 'Tulis ㅜ di kiri (2 goresan), lalu tambah ㅔ di kanan (goresan pendek dan dua vertikal).',
    strokes: ['M 28 76 L 104 76', 'M 66 76 L 66 146', 'M 92 104 L 122 104', 'M 126 38 L 126 162', 'M 160 38 L 160 162'],
  },
  {
    id: 'wg-39',
    char: 'ㅟ',
    roman: 'wi',
    name: 'Vokal Wi',
    category: 'Vokal',
    strokeCount: 3,
    tips: 'Tulis ㅜ dulu (horizontal atas lalu vertikal turun), lalu garis vertikal ㅣ di kanan.',
    strokes: ['M 34 78 L 124 78', 'M 80 78 L 80 152', 'M 148 38 L 148 162'],
  },
  {
    id: 'wg-40',
    char: 'ㅢ',
    roman: 'ui',
    name: 'Vokal Ui',
    category: 'Vokal',
    strokeCount: 2,
    tips: 'Tarik garis horizontal ㅡ dari kiri ke kanan, lalu garis vertikal ㅣ dari atas ke bawah.',
    strokes: ['M 32 108 L 122 108', 'M 146 38 L 146 162'],
  },
];

export const ALL_WRITING_GLYPHS: WritingGlyphGuide[] = [
  ...WRITING_GLYPHS,
  ...EXTENDED_WRITING_GLYPHS,
];

const WRITING_GLYPH_MAP = new Map<string, WritingGlyphGuide>(
  ALL_WRITING_GLYPHS.map((g) => [g.char, g])
);

const DECOMPOSE_CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const DECOMPOSE_JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const DECOMPOSE_JONG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ',
  'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
const COMPOUND_JONG_SPLIT: Record<string, string[]> = {
  'ㄳ': ['ㄱ', 'ㅅ'],
  'ㄵ': ['ㄴ', 'ㅈ'],
  'ㄶ': ['ㄴ', 'ㅎ'],
  'ㄺ': ['ㄹ', 'ㄱ'],
  'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'],
  'ㄾ': ['ㄹ', 'ㅌ'],
  'ㄿ': ['ㄹ', 'ㅍ'],
  'ㅀ': ['ㄹ', 'ㅎ'],
  'ㅄ': ['ㅂ', 'ㅅ'],
};

export function getWritingGlyphByChar(char: string): WritingGlyphGuide | undefined {
  return WRITING_GLYPH_MAP.get(char.trim());
}

export function extractWritingGlyphsFromText(text: string): WritingGlyphGuide[] {
  const seen = new Set<string>();
  const result: WritingGlyphGuide[] = [];

  const pushChar = (ch: string) => {
    if (seen.has(ch)) return;
    const guide = WRITING_GLYPH_MAP.get(ch);
    if (guide) {
      seen.add(ch);
      result.push(guide);
    }
  };

  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const choIdx = Math.floor(offset / 588);
      const jungIdx = Math.floor((offset % 588) / 28);
      const jongIdx = offset % 28;
      if (DECOMPOSE_CHO[choIdx]) pushChar(DECOMPOSE_CHO[choIdx]);
      if (DECOMPOSE_JUNG[jungIdx]) pushChar(DECOMPOSE_JUNG[jungIdx]);
      const jong = DECOMPOSE_JONG[jongIdx];
      if (jong) {
        const parts = COMPOUND_JONG_SPLIT[jong] ?? [jong];
        parts.forEach(pushChar);
      }
    } else {
      pushChar(ch);
    }
  }

  return result;
}
