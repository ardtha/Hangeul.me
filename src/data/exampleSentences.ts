import type { DictionaryExampleSentence, FlashcardItem } from './types';

const CURATED_EXAMPLES: Record<string, DictionaryExampleSentence> = {
  안녕하세요: {
    korean: '안녕하세요, 오늘 날씨가 정말 좋아요!',
    roman: 'An-nyeong-ha-se-yo, o-neul nal-ssi-ga jeong-mal jo-a-yo!',
    indonesian: 'Halo, cuaca hari ini sangat cerah!',
  },
  감사합니다: {
    korean: '도와주셔서 정말 감사합니다.',
    roman: 'Do-wa-ju-syeo-seo jeong-mal gam-sa-ham-ni-da.',
    indonesian: 'Terima kasih banyak sudah membantu saya.',
  },
  가다: {
    korean: '저는 내일 서울에 가요.',
    roman: 'Jeo-neun nae-il seo-u-re ga-yo.',
    indonesian: 'Besok saya pergi ke Seoul.',
  },
  먹다: {
    korean: '친구와 맛있는 김밥을 먹어요.',
    roman: 'Chin-gu-wa ma-sin-neun gim-ba-beul meo-geo-yo.',
    indonesian: 'Saya makan kimbap yang lezat bersama teman.',
  },
  물: {
    korean: '차가운 물 한 잔 주세요.',
    roman: 'Cha-ga-un mul han jan ju-se-yo.',
    indonesian: 'Tolong beri saya segelas air dingin.',
  },
  커피: {
    korean: '아침마다 따뜻한 커피를 마셔요.',
    roman: 'A-chim-ma-da tta-tteut-han keo-pi-reul ma-syeo-yo.',
    indonesian: 'Setiap pagi saya minum kopi hangat.',
  },
  김치: {
    korean: '한국 음식 중에서 김치가 제일 맛있어요.',
    roman: 'Han-guk eum-sik jung-e-seo gim-chi-ga je-il ma-si-sseo-yo.',
    indonesian: 'Di antara makanan Korea, kimchi yang paling enak.',
  },
  학교: {
    korean: '우리 학교 도서관은 아주 깨끗해요.',
    roman: 'U-ri hak-gyo do-seo-gwa-neun a-ju kkae-kkeu-tae-yo.',
    indonesian: 'Perpustakaan sekolah kami sangat bersih.',
  },
  대박: {
    korean: '와, 이 노래 정말 대박이에요!',
    roman: 'Wa, i no-rae jeong-mal dae-ba-gi-e-yo!',
    indonesian: 'Wah, lagu ini benar-benar luar biasa!',
  },
  안전모: {
    korean: '작업장에서는 꼭 안전모를 써야 해요.',
    roman: 'Ja-geop-jang-e-seo-neun kkok an-jeon-mo-reul sseo-ya hae-yo.',
    indonesian: 'Di area kerja wajib memakai helm keselamatan.',
  },
};

export function getCardExampleSentence(item: FlashcardItem): DictionaryExampleSentence {
  const exact = CURATED_EXAMPLES[item.h];
  if (exact) return exact;

  if (item.kind === 'L') {
    return {
      korean: `"${item.h}" (${item.c}) — 한 · 글`,
      roman: `Pelafalan huruf ${item.h}: ${item.c}`,
      indonesian: `${item.type}: ${item.m}. Latih huruf ini lewat Papan Bunyi atau Kanvas Tulis Hangeul.`,
    };
  }

  switch (item.type) {
    case 'Makanan & Minuman':
      return {
        korean: `여기 ${item.h} 하나 주세요.`,
        roman: `Yeo-gi ${item.c} ha-na ju-se-yo.`,
        indonesian: `Permisi, tolong satu ${item.m.toLowerCase()}.`,
      };
    case 'Tempat':
    case 'Transportasi':
      return {
        korean: `지금 ${item.h}에 가고 있어요.`,
        roman: `Ji-geum ${item.c}-e ga-go i-sseo-yo.`,
        indonesian: `Sekarang saya sedang pergi ke ${item.m.toLowerCase()}.`,
      };
    case 'Salam & Ungkapan':
      return {
        korean: `${item.h}!`,
        roman: item.c,
        indonesian: `Ungkapan sopan untuk mengatakan "${item.m}".`,
      };
    case 'Kata Sifat':
    case 'Perasaan':
      return {
        korean: `오늘 기분이 정말 ${item.h.replace(/다$/, '')}아요/어요.`,
        roman: `O-neul gi-bu-ni jeong-mal (${item.c}).`,
        indonesian: `Menyatakan sifat atau perasaan: "${item.m}".`,
      };
    case 'Kerja & EPS-TOPIK':
    case 'Kantor & Bisnis':
      return {
        korean: `직장에서 ${item.h} 표현을 자주 써요.`,
        roman: `Jik-jang-e-seo ${item.c} pyo-hyeo-neul ja-ju sseo-yo.`,
        indonesian: `Istilah "${item.m}" sering dipakai di lingkungan kerja Korea.`,
      };
    case 'Kafe & Dessert':
      return {
        korean: `카페에서 ${item.h} 하나 주문했어요.`,
        roman: `Ka-pe-e-seo ${item.c} ha-na ju-mun-hae-sseo-yo.`,
        indonesian: `Saya memesan satu ${item.m.toLowerCase()} di kafe.`,
      };
    case 'Perjalanan & Hotel':
      return {
        korean: `여행할 때 ${item.h}이/가 꼭 필요해요.`,
        roman: `Yeo-haeng-hal ttae ${item.c} i/ga kkok pi-ryo-hae-yo.`,
        indonesian: `Saat bepergian ke Korea, ${item.m.toLowerCase()} sangat diperlukan.`,
      };
    case 'Musik & K-Pop':
      return {
        korean: `좋아하는 가수의 ${item.h}이/가 정말 멋져요!`,
        roman: `Jo-a-ha-neun ga-su-ui ${item.c} jeong-mal meot-jyeo-yo!`,
        indonesian: `${item.m} dari penyanyi favorit benar-benar keren!`,
      };
    default:
      return {
        korean: `이것은 한국어로 ${item.h}이에요/예요.`,
        roman: `I-geo-seun han-gu-geo-ro ${item.c} i-e-yo.`,
        indonesian: `Dalam bahasa Korea, "${item.m}" disebut ${item.h} (${item.c}).`,
      };
  }
}
