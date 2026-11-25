export type CardKind = 'L' | 'W' | 'D';

export interface FlashcardItem {
  id: string;
  h: string; // Hangeul text
  c: string; // Correct romanization
  w: string; // Wrong distractor romanization
  kind: CardKind;
  type: string; // Category / Sub-label
  m: string; // Indonesian meaning / note
}

export type ModuleTier = 'free' | 'pro';

export interface CurriculumModule {
  id: string;
  order: string;
  title: string;
  subtitle: string;
  tier: ModuleTier;
  categoryTags: string[];
  estimatedMinutes: number;
  description: string;
  cards: FlashcardItem[];
}

const RAW: Array<[CardKind, string, string, string]> = [
  ['L', 'Konsonan Dasar', 'Konsonan', 'ㄱ|g / k|m;ㄴ|n|s;ㄷ|d / t|b;ㄹ|r / l|g;ㅁ|m|n;ㅂ|b / p|j;ㅅ|s|h;ㅇ|ng|m|Diam di awal, ng di akhir;ㅈ|j|k;ㅎ|h|n'],
  ['L', 'Konsonan Aspirasi', 'Konsonan', 'ㅋ|k (tebal)|t;ㅌ|t (tebal)|p;ㅍ|p (tebal)|k;ㅊ|ch|j'],
  ['L', 'Konsonan Kembar', 'Konsonan kembar', 'ㄲ|kk|kh;ㄸ|tt|th;ㅃ|pp|ph;ㅆ|ss|s;ㅉ|jj|ch'],
  ['L', 'Vokal Dasar', 'Vokal', 'ㅏ|a|eo;ㅓ|eo|a;ㅗ|o|u;ㅜ|u|o;ㅡ|eu|i;ㅣ|i|eu;ㅑ|ya|yeo;ㅕ|yeo|ya;ㅛ|yo|yu;ㅠ|yu|yo'],
  ['L', 'Vokal Ganda', 'Vokal ganda', 'ㅐ|ae|eo|Bunyinya mirip ㅔ;ㅒ|yae|ye;ㅔ|e|a|Bunyinya mirip ㅐ;ㅖ|ye|yo;ㅘ|wa|wo;ㅙ|wae|yu;ㅚ|oe|u;ㅝ|wo|wa;ㅞ|we|ae;ㅟ|wi|u;ㅢ|ui|i'],
  [
    'W',
    'Kata Dasar',
    '',
    '가다|ga-da|sa-da|Pergi;사다|sa-da|ma-si|Membeli;오다|o-da|ga-da|Datang;먹다|meok-da|mok-da|Makan;마시다|ma-si-da|ma-sa-da|Minum;보다|bo-da|o-da|Melihat;사람|sa-ram|na-ra|Orang;나라|na-ra|sa-ram|Negara;나무|na-mu|mo-ja|Pohon;모자|mo-ja|ba-ji|Topi;바지|ba-ji|na-mu|Celana;고기|go-gi|gim-chi|Daging;김치|gim-chi|go-gi|Kimchi;친구|chin-gu|hak-gyo|Teman;학교|hak-gyo|chin-gu|Sekolah;사랑|sa-rang|ha-neul|Cinta;하늘|ha-neul|sa-rang|Langit;물|mul|bul|Air;불|bul|mul|Api;집|jip|jim|Rumah;의자|ui-ja|chaek-sang|Kursi;책상|chaek-sang|ui-ja|Meja;가방|ga-bang|gong-chaek|Tas;공책|gong-chaek|yeon-pil|Buku catatan;연필|yeon-pil|ga-bang|Pensil;노래|no-rae|no-ra|Lagu;회사|hoe-sa|byeong-won|Perusahaan;병원|byeong-won|hoe-sa|Rumah sakit;의사|ui-sa|ui-ja|Dokter;시간|si-gan|si-ga|Waktu;이름|i-reum|na-i|Nama;나이|na-i|i-reum|Usia;마음|ma-eum|sa-rang|Hati / Perasaan;꿈|kkum|bam|Mimpi;소리|so-ri|no-rae|Suara;생각|saeng-gak|gi-eok|Pikiran / Ide',
  ],
  [
    'D',
    'Salam & Ungkapan',
    '',
    '안녕하세요|an-nyeong-ha-se-yo||Halo;감사합니다|gam-sa-ham-ni-da||Terima kasih;죄송합니다|joe-song-ham-ni-da||Maaf (formal);미안해요|mi-an-hae-yo||Maaf (santai);네|ne||Ya;아니요|a-ni-yo||Tidak;괜찮아요|gwaen-chan-a-yo||Tidak apa-apa;맛있어요|ma-si-sseo-yo||Enak;사랑해요|sa-rang-hae-yo||Aku cinta kamu;안녕히 가세요|an-nyeong-hi ga-se-yo||Selamat tinggal (untuk yang pergi);처음 뵙겠습니다|cheo-eum boep-get-seum-ni-da||Senang berkenalan;안녕히 계세요|an-nyeong-hi gye-se-yo||Selamat tinggal (untuk yang tinggal);환영합니다|hwan-yeong-ham-ni-da||Selamat datang;축하합니다|chuk-ha-ham-ni-da||Selamat;화이팅|hwa-i-ting||Semangat!;잘 먹겠습니다|jal meok-get-seum-ni-da||Selamat makan;잘 먹었습니다|jal meo-geo-sseum-ni-da||Terima kasih makanannya;잘 자요|jal ja-yo||Selamat tidur;도와주세요|do-wa-ju-se-yo||Tolong bantu saya;잠시만요|jam-si-man-yo||Tunggu sebentar;모르겠어요|mo-reu-ge-sseo-yo||Saya tidak tahu;알겠어요|al-ge-sseo-yo||Saya mengerti;주세요|ju-se-yo||Tolong beri saya;얼마예요|eol-ma-ye-yo||Berapa harganya?;어디예요|eo-di-ye-yo||Di mana?;이거 뭐예요|i-geo mwo-ye-yo||Ini apa?;천천히 말해 주세요|cheon-cheon-hi mal-hae ju-se-yo||Tolong bicara pelan-pelan;다시 말해 주세요|da-si mal-hae ju-se-yo||Tolong ulangi;잘 지냈어요?|jal ji-nae-sseo-yo?||Apa kabar?;오랜만이에요|o-raen-man-i-e-yo||Lama tidak berjumpa;실례합니다|sil-lye-ham-ni-da||Permisi;조심하세요|jo-sim-ha-se-yo||Hati-hati ya;걱정하지 마세요|geok-jeong-ha-ji ma-se-yo||Jangan khawatir;별말씀을요|byeol-mal-sseu-meul-yo||Sama-sama (formal)',
  ],
  ['D', 'Kata Ganti', '', '나|na||Saya (santai);저|jeo||Saya (sopan);너|neo||Kamu (santai);당신|dang-sin||Anda;우리|u-ri||Kami / kita;그|geu||Dia (laki-laki);그녀|geu-nyeo||Dia (perempuan);이것|i-geot||Ini;그것|geu-geot||Itu;저것|jeo-geot||Itu (jauh);모두|mo-du||Semua orang;누군가|nu-gun-ga||Seseorang'],
  ['D', 'Kata Tanya', '', '누구|nu-gu||Siapa;무엇|mu-eot||Apa;뭐|mwo||Apa (santai);어디|eo-di||Di mana;언제|eon-je||Kapan;왜|wae||Mengapa;어떻게|eo-tteo-ke||Bagaimana;얼마|eol-ma||Berapa (harga);몇|myeot||Berapa (jumlah);어느|eo-neu||Yang mana;얼마나|eol-ma-na||Seberapa lama/banyak'],
  ['D', 'Angka (Sino-Korea)', '', '일|il||Satu;이|i||Dua;삼|sam||Tiga;사|sa||Empat;오|o||Lima;육|yuk||Enam;칠|chil||Tujuh;팔|pal||Delapan;구|gu||Sembilan;십|sip||Sepuluh;백|baek||Seratus;천|cheon||Seribu;만|man||Sepuluh ribu;영|yeong||Nol;억|eok||Seratus juta'],
  ['D', 'Angka Korea Asli', '', '하나|ha-na||Satu;둘|dul||Dua;셋|set||Tiga;넷|net||Empat;다섯|da-seot||Lima;여섯|yeo-seot||Enam;일곱|il-gop||Tujuh;여덟|yeo-deol||Delapan;아홉|a-hop||Sembilan;열|yeol||Sepuluh;스물|seu-mul||Dua puluh;서른|seo-reun||Tiga puluh;마흔|ma-heun||Empat puluh;쉰|swin||Lima puluh'],
  ['D', 'Keluarga', '', '가족|ga-jok||Keluarga;엄마|eom-ma||Ibu;아빠|a-ppa||Ayah;형|hyeong||Kakak laki-laki (dari pria);누나|nu-na||Kakak perempuan (dari pria);오빠|o-ppa||Kakak laki-laki (dari wanita);언니|eon-ni||Kakak perempuan (dari wanita);동생|dong-saeng||Adik;할머니|hal-meo-ni||Nenek;할아버지|ha-ra-beo-ji||Kakek;아들|a-deul||Anak laki-laki;딸|ttal||Anak perempuan;남편|nam-pyeon||Suami;아내|a-nae||Istri;아기|a-gi||Bayi;부모님|bu-mo-nim||Orang tua;삼촌|sam-chon||Paman;이모|i-mo||Bibi (dari pihak ibu);고모|go-mo||Bibi (dari pihak ayah);조카|jo-ka||Keponakan'],
  ['D', 'Makanan & Minuman', '', '밥|bap||Nasi;빵|ppang||Roti;라면|ra-myeon||Mi instan;비빔밥|bi-bim-bap||Nasi campur;불고기|bul-go-gi||Bulgogi (daging panggang);계란|gye-ran||Telur;과일|gwa-il||Buah;사과|sa-gwa||Apel;커피|keo-pi||Kopi;우유|u-yu||Susu;국|guk||Sup;찌개|jji-gae||Semur / sup;떡볶이|tteok-bok-ki||Tteokbokki;김밥|gim-bap||Kimbap;삼겹살|sam-gyeop-sal||Daging panggang;만두|man-du||Pangsit;냉면|naeng-myeon||Mi dingin;된장|doen-jang||Pasta kedelai;고추장|go-chu-jang||Pasta cabai;치킨|chi-kin||Ayam goreng;차|cha||Teh;주스|ju-seu||Jus;바나나|ba-na-na||Pisang;포도|po-do||Anggur;딸기|ttal-gi||Stroberi;수박|su-bak||Semangka;귤|gyul||Jeruk mandarin;감자|gam-ja||Kentang;양파|yang-pa||Bawang bombai;마늘|ma-neul||Bawang putih;고추|go-chu||Cabai;야채|ya-chae||Sayur;소금|so-geum||Garam;설탕|seol-tang||Gula;과자|gwa-ja||Camilan;아이스크림|a-i-seu-keu-rim||Es krim;물냉면|mul-naeng-myeon||Mi dingin berkuah;갈비|gal-bi||Iga panggang;잡채|jap-chae||Soun tumis Korea;어묵|eo-muk||Sate bakso ikan'],
  ['D', 'Warna', '', '빨간색|ppal-gan-saek||Merah;파란색|pa-ran-saek||Biru;노란색|no-ran-saek||Kuning;초록색|cho-rok-saek||Hijau;하얀색|ha-yan-saek||Putih;검은색|geo-meun-saek||Hitam;주황색|ju-hwang-saek||Oranye;보라색|bo-ra-saek||Ungu;분홍색|bun-hong-saek||Merah muda;갈색|gal-saek||Cokelat;회색|hoe-saek||Abu-abu;금색|geum-saek||Emas;은색|eun-saek||Perak'],
  ['D', 'Hewan', '', '개|gae||Anjing;고양이|go-yang-i||Kucing;새|sae||Burung;물고기|mul-go-gi||Ikan;말|mal||Kuda;소|so||Sapi;돼지|dwae-ji||Babi;닭|dak||Ayam;오리|o-ri||Bebek;양|yang||Domba;토끼|to-kki||Kelinci;호랑이|ho-rang-i||Harimau;사자|sa-ja||Singa;곰|gom||Beruang;코끼리|ko-kki-ri||Gajah;원숭이|won-sung-i||Monyet;쥐|jwi||Tikus;뱀|baem||Ular;거북이|geo-bug-i||Kura-kura;나비|na-bi||Kupu-kupu;벌|beol||Lebah;개미|gae-mi||Semut'],
  ['D', 'Waktu', '', '오늘|o-neul||Hari ini;내일|nae-il||Besok;어제|eo-je||Kemarin;아침|a-chim||Pagi;점심|jeom-sim||Siang;저녁|jeo-nyeok||Sore / malam;밤|bam||Malam;지금|ji-geum||Sekarang;매일|mae-il||Setiap hari;주말|ju-mal||Akhir pekan;오전|o-jeon||Pagi (AM);오후|o-hu||Sore (PM);올해|ol-hae||Tahun ini;작년|jak-nyeon||Tahun lalu;내년|nae-nyeon||Tahun depan;방금|bang-geum||Baru saja;나중에|na-jung-e||Nanti'],
  ['D', 'Hari & Bulan', '', '월요일|wol-yo-il||Senin;화요일|hwa-yo-il||Selasa;수요일|su-yo-il||Rabu;목요일|mok-yo-il||Kamis;금요일|geum-yo-il||Jumat;토요일|to-yo-il||Sabtu;일요일|il-yo-il||Minggu;일월|il-wol||Januari;이월|i-wol||Februari;삼월|sam-wol||Maret;사월|sa-wol||April;오월|o-wol||Mei;유월|yu-wol||Juni;칠월|chil-wol||Juli;팔월|pal-wol||Agustus;구월|gu-wol||September;시월|si-wol||Oktober;십일월|si-bil-wol||November;십이월|si-bi-wol||Desember;생일|saeng-il||Ulang tahun;휴일|hyu-il||Hari libur'],
  ['D', 'Tubuh', '', '머리|meo-ri||Kepala / rambut;얼굴|eol-gul||Wajah;눈|nun||Mata;코|ko||Hidung;입|ip||Mulut;귀|gwi||Telinga;목|mok||Leher;어깨|eo-kkae||Bahu;팔|pal||Lengan;손|son||Tangan;손가락|son-ga-rak||Jari;배|bae||Perut;등|deung||Punggung;다리|da-ri||Kaki (tungkai);발|bal||Telapak kaki;무릎|mu-reup||Lutut;치아|chi-a||Gigi;피부|pi-bu||Kulit;몸|mom||Tubuh;마음|ma-eum||Hati / perasaan'],
  ['D', 'Kata Kerja', '', '하다|ha-da||Melakukan;되다|doe-da||Menjadi;있다|it-da||Ada;없다|eop-da||Tidak ada;자다|ja-da||Tidur;일어나다|il-eo-na-da||Bangun;앉다|an-da||Duduk;서다|seo-da||Berdiri;걷다|geot-da||Berjalan;뛰다|ttwi-da||Berlari;읽다|ik-da||Membaca;쓰다|sseu-da||Menulis;듣다|deut-da||Mendengar;말하다|mal-ha-da||Berbicara;배우다|bae-u-da||Belajar;가르치다|ga-reu-chi-da||Mengajar;일하다|il-ha-da||Bekerja;공부하다|gong-bu-ha-da||Belajar (studi);만나다|man-na-da||Bertemu;주다|ju-da||Memberi;받다|bat-da||Menerima;열다|yeol-da||Membuka;닫다|dat-da||Menutup;사랑하다|sa-rang-ha-da||Mencintai;좋아하다|jo-a-ha-da||Menyukai;알다|al-da||Tahu;모르다|mo-reu-da||Tidak tahu;기다리다|gi-da-ri-da||Menunggu;전화하다|jeon-hwa-ha-da||Menelepon;요리하다|yo-ri-ha-da||Memasak;청소하다|cheong-so-ha-da||Membersihkan;쉬다|swi-da||Beristirahat;운동하다|un-dong-ha-da||Berolahraga;여행하다|yeo-haeng-ha-da||Berwisata;준비하다|jun-bi-ha-da||Mempersiapkan'],
  ['D', 'Kata Sifat', '', '크다|keu-da||Besar;작다|jak-da||Kecil;많다|man-ta||Banyak;적다|jeok-da||Sedikit;좋다|jo-ta||Baik / bagus;나쁘다|na-ppeu-da||Buruk;예쁘다|ye-ppeu-da||Cantik;멋있다|meo-sit-da||Keren;맛있다|ma-sit-da||Enak;맛없다|ma-deop-da||Tidak enak;뜨겁다|tteu-geop-da||Panas (benda);차갑다|cha-gap-da||Dingin (benda);덥다|deop-da||Panas (cuaca);춥다|chup-da||Dingin (cuaca);어렵다|eo-ryeop-da||Sulit;쉽다|swip-da||Mudah;재미있다|jae-mi-it-da||Menyenangkan;비싸다|bi-ssa-da||Mahal;싸다|ssa-da||Murah;빠르다|ppa-reu-da||Cepat;느리다|neu-ri-da||Lambat;새롭다|sae-rop-da||Baru;멀다|meol-da||Jauh;가깝다|ga-kkap-da||Dekat;깨끗하다|kkae-kkeut-ha-da||Bersih;조용하다|jo-yong-ha-da||Tenang / sepi;시끄럽다|si-kkeu-reop-da||Berisik;편하다|pyeon-ha-da||Nyaman;불편하다|bul-pyeon-ha-da||Tidak nyaman;중요하다|jung-yo-ha-da||Penting'],
  ['D', 'Perasaan', '', '기쁘다|gi-ppeu-da||Senang;슬프다|seul-peu-da||Sedih;화나다|hwa-na-da||Marah;무섭다|mu-seop-da||Takut;피곤하다|pi-gon-ha-da||Lelah;배고프다|bae-go-peu-da||Lapar;목마르다|mong-ma-reu-da||Haus;행복하다|haeng-bok-ha-da||Bahagia;외롭다|oe-rop-da||Kesepian;아프다|a-peu-da||Sakit;신나다|sin-na-da||Bersemangat;긴장되다|gin-jang-doe-da||Gugup;부끄럽다|bu-kkeu-reop-da||Malu'],
  ['D', 'Tempat', '', '도서관|do-seo-gwan||Perpustakaan;은행|eun-haeng||Bank;시장|si-jang||Pasar;가게|ga-ge||Toko;슈퍼마켓|syu-peo-ma-ket||Supermarket;식당|sik-dang||Restoran;카페|ka-pe||Kafe;공원|gong-won||Taman;우체국|u-che-guk||Kantor pos;경찰서|gyeong-chal-seo||Kantor polisi;약국|yak-guk||Apotek;극장|geuk-jang||Bioskop;호텔|ho-tel||Hotel;화장실|hwa-jang-sil||Toilet;교회|gyo-hoe||Gereja;대학교|dae-hak-gyo||Universitas;방|bang||Kamar;부엌|bu-eok||Dapur;문|mun||Pintu;창문|chang-mun||Jendela;백화점|baek-hwa-jeom||Mal / Department store;편의점|pyeon-ui-jeom||Minimarket 24 jam'],
  ['D', 'Transportasi', '', '버스|beo-seu||Bus;지하철|ji-ha-cheol||Kereta bawah tanah;택시|taek-si||Taksi;기차|gi-cha||Kereta api;비행기|bi-haeng-gi||Pesawat;공항|gong-hang||Bandara;자동차|ja-dong-cha||Mobil;자전거|ja-jeon-geo||Sepeda;오토바이|o-to-ba-i||Sepeda motor;역|yeok||Stasiun;정류장|jeong-nyu-jang||Halte;길|gil||Jalan;신호등|sin-ho-deung||Lampu lalu lintas;횡단보도|hoeng-dan-bo-do||Zebra cross'],
  ['D', 'Benda Sehari-hari', '', '책|chaek||Buku;전화|jeon-hwa||Telepon;휴대폰|hyu-dae-pon||Ponsel;컴퓨터|keom-pyu-teo||Komputer;텔레비전|tel-le-bi-jeon||Televisi;시계|si-gye||Jam;우산|u-san||Payung;열쇠|yeol-soe||Kunci;돈|don||Uang;지갑|ji-gap||Dompet;안경|an-gyeong||Kacamata;침대|chim-dae||Tempat tidur;컵|keop||Gelas;숟가락|sut-ga-rak||Sendok;젓가락|jeot-ga-rak||Sumpit;사진|sa-jin||Foto;편지|pyeon-ji||Surat;선물|seon-mul||Hadiah'],
  ['D', 'Pakaian', '', '옷|ot||Pakaian;신발|sin-bal||Sepatu;양말|yang-mal||Kaus kaki;셔츠|syeo-cheu||Kemeja;치마|chi-ma||Rok;청바지|cheong-ba-ji||Jeans;코트|ko-teu||Mantel;장갑|jang-gap||Sarung tangan;목도리|mok-do-ri||Syal;한복|han-bok||Pakaian tradisional Korea;티셔츠|ti-syeo-cheu||Kaus;운동화|un-dong-hwa||Sepatu olahraga'],
  ['D', 'Alam & Cuaca', '', '산|san||Gunung;바다|ba-da||Laut;강|gang||Sungai;호수|ho-su||Danau;섬|seom||Pulau;꽃|kkot||Bunga;풀|pul||Rumput;땅|ttang||Tanah;비|bi||Hujan;눈|nun||Salju;바람|ba-ram||Angin;구름|gu-reum||Awan;해|hae||Matahari;달|dal||Bulan;별|byeol||Bintang;날씨|nal-ssi||Cuaca;봄|bom||Musim semi;여름|yeo-reum||Musim panas;가을|ga-eul||Musim gugur;겨울|gyeo-ul||Musim dingin;번개|beon-gae||Petir;무지개|mu-ji-gae||Pelangi'],
  ['D', 'Pekerjaan', '', '선생님|seon-saeng-nim||Guru;학생|hak-saeng||Murid;간호사|gan-ho-sa||Perawat;경찰|gyeong-chal||Polisi;군인|gun-in||Tentara;요리사|yo-ri-sa||Koki;가수|ga-su||Penyanyi;배우|bae-u||Aktor;회사원|hoe-sa-won||Karyawan;변호사|byeon-ho-sa||Pengacara;기자|gi-ja||Wartawan;운전사|un-jeon-sa||Pengemudi;농부|nong-bu||Petani;프로그래머|peu-ro-geu-rae-meo||Programmer;디자이너|di-ja-i-neo||Desainer'],
  ['D', 'Sekolah & Kampus', '', '교실|gyo-sil||Ruang kelas;학생증|hak-saeng-jeung||Kartu mahasiswa/pelajar;시험|si-heom||Ujian;숙제|suk-je||Pekerjaan rumah (PR);전공|jeon-gong||Jurusan kuliah;장학금|jang-hak-geum||Beasiswa;졸업|jo-reop||Kelulusan / Wisuda;입학|ip-hak||Masuk sekolah/kuliah;칠판|chil-pan||Papan tulis;사전|sa-jeon||Kamus;노트북|no-teu-buk||Laptop;방학|bang-hak||Libur sekolah;학기|hak-gi||Semester;성적|seong-jeok||Nilai akademik;질문|jil-mun||Pertanyaan;대답|dae-dap||Jawaban;발표|bal-pyo||Presentasi;동아리|dong-a-ri||Klub / UKM kampus'],
  ['D', 'Belanja & Pembayaran', '', '가격|ga-gyeok||Harga;할인|ha-rin||Diskon;영수증|yeong-su-jeung||Struk belanja;현금|hyeon-geum||Uang tunai;신용카드|sin-yong-ka-deu||Kartu kredit;계산대|gye-san-dae||Kasir;포장|po-jang||Bungkus / bawa pulang;환불|hwan-bul||Pengembalian dana;교환|gyo-hwan||Tukar barang;크기|keu-gi||Ukuran;무료|mu-ryo||Gratis;배달|bae-dal||Pengiriman / antar;주문|ju-mun||Pesanan;택배|taek-bae||Paket kurir;봉투|bong-tu||Kantong belanja'],
  ['D', 'Teknologi & Media', '', '인터넷|in-teo-net||Internet;비밀번호|bi-mil-beon-ho||Kata sandi;충전기|chung-jeon-gi||Pengisi daya (charger);배터리|bae-teo-ri||Baterai;와이파이|wa-i-pa-i||Wi-Fi;화면|hwa-myeon||Layar;카메라|ka-me-ra||Kamera;동영상|dong-yeong-sang||Video;메시지|me-si-ji||Pesan teks;검색|geom-saek||Pencarian;다운로드|da-un-lo-deu||Unduhan;앱|aep||Aplikasi;이어폰|i-eo-pon||Earphone;키보드|ki-bo-deu||Papan ketik;마우스|ma-u-seu||Tetikus (mouse)'],
  ['D', 'Hobi & Olahraga', '', '운동|un-dong||Olahraga;축구|chuk-gu||Sepak bola;농구|nong-gu||Bola basket;수영|su-yeong||Berenang;등산|deung-san||Mendaki gunung;여행|yeo-haeng||Jalan-jalan;요리|yo-ri||Memasak;독서|dok-seo||Membaca buku;영화|yeong-hwa||Film;음악|eu-mak||Musik;그림|geu-rim||Gambar / lukisan;춤|chum||Tarian;게임|ge-im||Permainan / game;캠핑|kaem-ping||Berkemah;요가|yo-ga||Yoga;배드민턴|bae-deu-min-teon||Bulu tangkis'],
  ['D', 'Kesehatan & Medis', '', '감기|gam-gi||Flu / pilek;열|yeol||Demam;기침|gi-chim||Batuk;두통|du-tong||Sakit kepala;치과|chi-gwa||Klinik gigi;처방전|cheo-bang-jeon||Resep dokter;약|yak||Obat;주사|ju-sa||Suntikan;건강|geon-gang||Kesehatan;휴식|hyu-sik||Istirahat;체온|che-on||Suhu tubuh;구급차|gu-geup-cha||Ambulans;응급실|eung-geup-sil||UGD (Gawat darurat)'],
  ['D', 'Rumah & Perabotan', '', '거실|geo-sil||Ruang tamu;침실|chim-sil||Kamar tidur;욕실|yok-sil||Kamar mandi;베란다|be-ran-da||Balkon;냉장고|naeng-jang-go||Kulkas;세탁기|se-tak-gi||Mesin cuci;에어컨|e-eo-keon||AC;선풍기|seon-pung-gi||Kipas angin;소파|so-pa||Sofa;거울|geo-ul||Cermin;수건|su-geon||Handuk;비누|bi-nu||Sabun;치약|chi-yak||Pasta gigi;칫솔|chit-sol||Sikat gigi'],
  ['D', 'Arah & Posisi', '', '위|wi||Atas;아래|a-rae||Bawah;앞|ap||Depan;뒤|dwi||Belakang;옆|yeop||Samping;안|an||Dalam;밖|bak||Luar;왼쪽|oen-jjok||Kiri;오른쪽|o-reun-jjok||Kanan;가운데|ga-un-de||Tengah;여기|yeo-gi||Di sini;저기|jeo-gi||Di sana'],
  ['D', 'Partikel & Penghubung', '', '은/는|eun / neun||Partikel topik;이/가|i / ga||Partikel subjek;을/를|eul / reul||Partikel objek;에|e||Ke / pada (waktu, tempat);에서|e-seo||Di (tempat aktivitas);와/과|wa / gwa||Dan / dengan;도|do||Juga;그리고|geu-ri-go||Dan;그래서|geu-rae-seo||Jadi;하지만|ha-ji-man||Tetapi'],
];

const parsedItems: FlashcardItem[] = [];
let idxCounter = 0;

RAW.forEach(([kind, type, def, data]) => {
  const entries = data.split(';');
  entries.forEach((entry) => {
    const [h, c, w, m] = entry.split('|');
    parsedItems.push({
      id: `card-${idxCounter++}`,
      h,
      c,
      w: w || '',
      kind,
      type: kind === 'W' ? 'Kata Dasar' : type,
      m: m || def,
    });
  });
});

// Ensure every card has a plausible distractor romanization `w` so any module can be played in Swipe Arena
export const ALL_CARDS: FlashcardItem[] = parsedItems.map((item, idx) => {
  if (item.w) return item;
  const sameCategory = parsedItems.filter((other) => other.type === item.type && other.c !== item.c);
  const pool = sameCategory.length > 0 ? sameCategory : parsedItems.filter((other) => other.c !== item.c);
  const pick = pool[(idx * 7 + 3) % pool.length];
  return {
    ...item,
    w: pick ? pick.c : 'eo-ga',
  };
});

export const LETTER_CARDS = ALL_CARDS.filter((i) => i.kind === 'L');
export const WORD_CARDS = ALL_CARDS.filter((i) => i.kind === 'W');

// Exclusive Pro Content Packs
const KDRAMA_SLANG_CARDS: FlashcardItem[] = [
  { id: 'kd-1', h: '대박', c: 'dae-bak', w: 'jeong-mal', kind: 'W', type: 'K-Drama', m: 'Luar biasa / Keren banget!' },
  { id: 'kd-2', h: '진짜요?', c: 'jin-jja-yo?', w: 'mwo-ra-go?', kind: 'W', type: 'K-Drama', m: 'Benarkah? / Serius?' },
  { id: 'kd-3', h: '설레다', c: 'seol-le-da', w: 'bo-go-sip-da', kind: 'W', type: 'K-Drama', m: 'Berdebar-debar (hati)' },
  { id: 'kd-4', h: '보고 싶어요', c: 'bo-go si-peo-yo', w: 'ga-go si-peo-yo', kind: 'W', type: 'K-Drama', m: 'Aku merindukanmu' },
  { id: 'kd-5', h: '어떡해', c: 'eo-tteo-kae', w: 'wae-geu-rae', kind: 'W', type: 'K-Drama', m: 'Bagaimana ini!' },
  { id: 'kd-6', h: '눈치', c: 'nun-chi', w: 'ma-eum', kind: 'W', type: 'K-Drama', m: 'Kepekaan membaca situasi' },
  { id: 'kd-7', h: '꿀잼', c: 'kkul-jaem', w: 'no-jaem', kind: 'W', type: 'K-Drama', m: 'Sangat seru / lucu' },
  { id: 'kd-8', h: '고생했어요', c: 'go-saeng-hae-sseo-yo', w: 'su-go-hae-sseo-yo', kind: 'W', type: 'K-Drama', m: 'Kamu sudah bekerja keras' },
  { id: 'kd-9', h: '약속해요', c: 'yak-sok-hae-yo', w: 'gi-da-ryeo-yo', kind: 'W', type: 'K-Drama', m: 'Aku berjanji' },
  { id: 'kd-10', h: '운명', c: 'un-myeong', w: 'gi-jeok', kind: 'W', type: 'K-Drama', m: 'Takdir' },
  { id: 'kd-11', h: '심쿵', c: 'sim-kung', w: 'du-geun', kind: 'W', type: 'K-Drama', m: 'Jantung berdegup kencang' },
  { id: 'kd-12', h: '갑자기', c: 'gap-ja-gi', w: 'jeon-hyeo', kind: 'W', type: 'K-Drama', m: 'Tiba-tiba / mendadak' },
  { id: 'kd-13', h: '솔직히', c: 'sol-jik-hi', w: 'jeong-mal', kind: 'W', type: 'K-Drama', m: 'Sejujurnya' },
  { id: 'kd-14', h: '분위기', c: 'bun-wi-gi', w: 'gi-bun', kind: 'W', type: 'K-Drama', m: 'Suasana / atmosfer' },
];

const WORK_EPSTOPIK_CARDS: FlashcardItem[] = [
  { id: 'wk-1', h: '출근하다', c: 'chul-geun-ha-da', w: 'toe-geun-ha-da', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Berangkat kerja' },
  { id: 'wk-2', h: '퇴근하다', c: 'toe-geun-ha-da', w: 'chul-geun-ha-da', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Pulang kerja' },
  { id: 'wk-3', h: '안전모', c: 'an-jeon-mo', w: 'bo-ho-bok', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Helm keselamatan' },
  { id: 'wk-4', h: '월급', c: 'wol-geup', w: 'bo-neo-seu', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Gaji bulanan' },
  { id: 'wk-5', h: '회의', c: 'hoe-ui', w: 'gye-yak', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Rapat / pertemuan' },
  { id: 'wk-6', h: '보고서', c: 'bo-go-seo', w: 'i-ryeok-seo', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Laporan kerja' },
  { id: 'wk-7', h: '조심하세요', c: 'jo-sim-ha-se-yo', w: 'jo-yong-ha-se-yo', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Harap berhati-hati' },
  { id: 'wk-8', h: '계약서', c: 'gye-yak-seo', w: 'bo-go-seo', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Surat kontrak kerja' },
  { id: 'wk-9', h: '휴게실', c: 'hyu-ge-sil', w: 'sa-mu-sil', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Ruang istirahat' },
  { id: 'wk-10', h: '수고하셨습니다', c: 'su-go-ha-syeot-seum-ni-da', w: 'gam-sa-ham-ni-da', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Terima kasih atas kerja kerasnya' },
  { id: 'wk-11', h: '야근', c: 'ya-geun', w: 'hyu-geun', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Lembur kerja malam' },
  { id: 'wk-12', h: '안전화', c: 'an-jeon-hwa', w: 'un-dong-hwa', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Sepatu keselamatan (safety shoes)' },
  { id: 'wk-13', h: '작업장', c: 'ja-geop-jang', w: 'hoe-sa', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Area / lokasi kerja' },
  { id: 'wk-14', h: '출입증', c: 'chul-ip-jeung', w: 'sin-bun-jeung', kind: 'W', type: 'Kerja & EPS-TOPIK', m: 'Kartu akses masuk' },
];

function cardsByTypes(types: string[]): FlashcardItem[] {
  return ALL_CARDS.filter((c) => types.includes(c.type));
}

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'mod-hangeul-core',
    order: '01',
    title: 'Alfabet Hangeul Dasar & Ganda',
    subtitle: '40 huruf konsonan & vokal Korea',
    tier: 'free',
    categoryTags: ['Gratis', 'Fondasi', '40 Kartu'],
    estimatedMinutes: 12,
    description:
      'Kuasai seluruh konsonan dasar, aspirasi, konsonan kembar, serta vokal dasar dan vokal ganda dengan pelafalan audio ko-KR.',
    cards: LETTER_CARDS,
  },
  {
    id: 'mod-daily-vocab',
    order: '02',
    title: 'Kosakata Pemula & Salam Penting',
    subtitle: 'Kata benda dasar, kampus, dan ungkapan sopan',
    tier: 'free',
    categoryTags: ['Gratis', 'Pemula', 'Kosakata Inti'],
    estimatedMinutes: 18,
    description:
      'Latih kata kerja inti, kosakata kampus, dan salam sehari-hari mulai dari 안녕하세요 hingga 감사합니다.',
    cards: [...WORD_CARDS, ...cardsByTypes(['Salam & Ungkapan', 'Sekolah & Kampus'])],
  },
  {
    id: 'mod-kdrama-pack',
    order: '03',
    title: 'K-Drama, Ekspresi & Perasaan',
    subtitle: 'Dialog natural, slang sopan, dan emosi',
    tier: 'pro',
    categoryTags: ['Eksklusif Pro', 'Pop Culture'],
    estimatedMinutes: 20,
    description:
      'Pahami ungkapan populer drama Korea seperti 대박, 설레다, 눈치, 심쿵 serta kosakata perasaan dan hobi sehari-hari.',
    cards: [...KDRAMA_SLANG_CARDS, ...cardsByTypes(['Perasaan', 'Hobi & Olahraga'])],
  },
  {
    id: 'mod-travel-seoul',
    order: '04',
    title: 'Travel, Kuliner & Belanja Seoul',
    subtitle: 'Pesan makanan, naik subway, dan pembayaran',
    tier: 'pro',
    categoryTags: ['Eksklusif Pro', 'Wisata'],
    estimatedMinutes: 25,
    description:
      'Siap jalan-jalan ke Seoul: kuasai menu restoran, stasiun 지하철, tempat umum, belanja, serta angka Sino-Korea.',
    cards: cardsByTypes(['Makanan & Minuman', 'Transportasi', 'Tempat', 'Belanja & Pembayaran', 'Angka (Sino-Korea)']),
  },
  {
    id: 'mod-work-epstopik',
    order: '05',
    title: 'Kerja, Kesehatan & Persiapan EPS-TOPIK',
    subtitle: 'Kosakata pabrik, kantor, teknologi, dan keselamatan',
    tier: 'pro',
    categoryTags: ['Eksklusif Pro', 'Karier'],
    estimatedMinutes: 24,
    description:
      'Modul khusus calon pekerja & profesional Indonesia di Korea: kontrak kerja, alat keselamatan, istilah medis, dan teknologi.',
    cards: [...WORK_EPSTOPIK_CARDS, ...cardsByTypes(['Pekerjaan', 'Kesehatan & Medis', 'Teknologi & Media'])],
  },
  {
    id: 'mod-grammar-topik',
    order: '06',
    title: 'Tata Bahasa, Partikel & TOPIK I',
    subtitle: 'Struktur kalimat 은/는, 이/가, 을/를 dan kata sifat',
    tier: 'pro',
    categoryTags: ['Eksklusif Pro', 'Tata Bahasa'],
    estimatedMinutes: 30,
    description:
      'Bangun kalimat Korea yang benar secara gramatikal dengan penguasaan partikel, kata kerja, dan kata sifat TOPIK I.',
    cards: cardsByTypes(['Partikel & Penghubung', 'Kata Kerja', 'Kata Sifat']),
  },
];

// ============================================================
// INTERACTIVE JAMO COMPOSER TABLES & EXERCISE DATASETS
// ============================================================

export interface JamoSlot {
  unicodeIndex: number; // Standard Unicode Choseong (0..18), Jungseong (0..20), or Jongseong (0..27)
  char: string;
  roman: string;
  label: string;
}

export const CHOSEONG_LIST: JamoSlot[] = [
  { unicodeIndex: 0, char: 'ㄱ', roman: 'g / k', label: 'giyeok' },
  { unicodeIndex: 2, char: 'ㄴ', roman: 'n', label: 'nieun' },
  { unicodeIndex: 3, char: 'ㄷ', roman: 'd / t', label: 'digeut' },
  { unicodeIndex: 5, char: 'ㄹ', roman: 'r / l', label: 'rieul' },
  { unicodeIndex: 6, char: 'ㅁ', roman: 'm', label: 'mieum' },
  { unicodeIndex: 7, char: 'ㅂ', roman: 'b / p', label: 'bieup' },
  { unicodeIndex: 9, char: 'ㅅ', roman: 's', label: 'siot' },
  { unicodeIndex: 11, char: 'ㅇ', roman: '(diam)', label: 'ieung' },
  { unicodeIndex: 12, char: 'ㅈ', roman: 'j', label: 'jieut' },
  { unicodeIndex: 14, char: 'ㅊ', roman: 'ch', label: 'chieut' },
  { unicodeIndex: 15, char: 'ㅋ', roman: 'k', label: 'kieuk' },
  { unicodeIndex: 16, char: 'ㅌ', roman: 't', label: 'tieut' },
  { unicodeIndex: 17, char: 'ㅍ', roman: 'p', label: 'pieup' },
  { unicodeIndex: 18, char: 'ㅎ', roman: 'h', label: 'hieut' },
  { unicodeIndex: 1, char: 'ㄲ', roman: 'kk', label: 'ssang-giyeok' },
  { unicodeIndex: 4, char: 'ㄸ', roman: 'tt', label: 'ssang-digeut' },
  { unicodeIndex: 8, char: 'ㅃ', roman: 'pp', label: 'ssang-bieup' },
  { unicodeIndex: 10, char: 'ㅆ', roman: 'ss', label: 'ssang-siot' },
  { unicodeIndex: 13, char: 'ㅉ', roman: 'jj', label: 'ssang-jieut' },
];

export const JUNGSEONG_LIST: JamoSlot[] = [
  { unicodeIndex: 0, char: 'ㅏ', roman: 'a', label: 'a' },
  { unicodeIndex: 4, char: 'ㅓ', roman: 'eo', label: 'eo' },
  { unicodeIndex: 8, char: 'ㅗ', roman: 'o', label: 'o' },
  { unicodeIndex: 13, char: 'ㅜ', roman: 'u', label: 'u' },
  { unicodeIndex: 18, char: 'ㅡ', roman: 'eu', label: 'eu' },
  { unicodeIndex: 20, char: 'ㅣ', roman: 'i', label: 'i' },
  { unicodeIndex: 2, char: 'ㅑ', roman: 'ya', label: 'ya' },
  { unicodeIndex: 6, char: 'ㅕ', roman: 'yeo', label: 'yeo' },
  { unicodeIndex: 12, char: 'ㅛ', roman: 'yo', label: 'yo' },
  { unicodeIndex: 17, char: 'ㅠ', roman: 'yu', label: 'yu' },
  { unicodeIndex: 1, char: 'ㅐ', roman: 'ae', label: 'ae' },
  { unicodeIndex: 5, char: 'ㅔ', roman: 'e', label: 'e' },
  { unicodeIndex: 9, char: 'ㅘ', roman: 'wa', label: 'wa' },
  { unicodeIndex: 14, char: 'ㅝ', roman: 'wo', label: 'wo' },
  { unicodeIndex: 19, char: 'ㅢ', roman: 'ui', label: 'ui' },
];

export const JONGSEONG_LIST: JamoSlot[] = [
  { unicodeIndex: 0, char: '—', roman: 'tanpa batchim', label: 'kosong' },
  { unicodeIndex: 1, char: 'ㄱ', roman: '-k', label: 'giyeok' },
  { unicodeIndex: 4, char: 'ㄴ', roman: '-n', label: 'nieun' },
  { unicodeIndex: 7, char: 'ㄷ', roman: '-t', label: 'digeut' },
  { unicodeIndex: 8, char: 'ㄹ', roman: '-l', label: 'rieul' },
  { unicodeIndex: 16, char: 'ㅁ', roman: '-m', label: 'mieum' },
  { unicodeIndex: 17, char: 'ㅂ', roman: '-p', label: 'bieup' },
  { unicodeIndex: 19, char: 'ㅅ', roman: '-t', label: 'siot' },
  { unicodeIndex: 21, char: 'ㅇ', roman: '-ng', label: 'ieung' },
];

export interface SyllablePuzzle {
  id: string;
  targetChar: string;
  roman: string;
  meaning: string;
  hint: string;
  initialIdx: number;
  medialIdx: number;
  finalIdx: number;
}

export const SYLLABLE_PUZZLES: SyllablePuzzle[] = [
  {
    id: 'syl-1',
    targetChar: '한',
    roman: 'han',
    meaning: 'Korea / Satu (dari 한국 · Hangeul)',
    hint: 'ㅎ (h) + ㅏ (a) + batchim ㄴ (-n)',
    initialIdx: 18,
    medialIdx: 0,
    finalIdx: 4,
  },
  {
    id: 'syl-2',
    targetChar: '글',
    roman: 'geul',
    meaning: 'Tulisan / Aksara (dari 한글 · Hangeul)',
    hint: 'ㄱ (g) + ㅡ (eu) + batchim ㄹ (-l)',
    initialIdx: 0,
    medialIdx: 18,
    finalIdx: 8,
  },
  {
    id: 'syl-3',
    targetChar: '물',
    roman: 'mul',
    meaning: 'Air minum',
    hint: 'ㅁ (m) + ㅜ (u) + batchim ㄹ (-l)',
    initialIdx: 6,
    medialIdx: 13,
    finalIdx: 8,
  },
  {
    id: 'syl-4',
    targetChar: '밥',
    roman: 'bap',
    meaning: 'Nasi / Makanan',
    hint: 'ㅂ (b) + ㅏ (a) + batchim ㅂ (-p)',
    initialIdx: 7,
    medialIdx: 0,
    finalIdx: 17,
  },
  {
    id: 'syl-5',
    targetChar: '봄',
    roman: 'bom',
    meaning: 'Musim semi',
    hint: 'ㅂ (b) + ㅗ (o) + batchim ㅁ (-m)',
    initialIdx: 7,
    medialIdx: 8,
    finalIdx: 16,
  },
  {
    id: 'syl-6',
    targetChar: '별',
    roman: 'byeol',
    meaning: 'Bintang di langit',
    hint: 'ㅂ (b) + ㅕ (yeo) + batchim ㄹ (-l)',
    initialIdx: 7,
    medialIdx: 6,
    finalIdx: 8,
  },
  {
    id: 'syl-7',
    targetChar: '눈',
    roman: 'nun',
    meaning: 'Mata atau Salju',
    hint: 'ㄴ (n) + ㅜ (u) + batchim ㄴ (-n)',
    initialIdx: 2,
    medialIdx: 13,
    finalIdx: 4,
  },
  {
    id: 'syl-8',
    targetChar: '강',
    roman: 'gang',
    meaning: 'Sungai (misal Hangang 한강)',
    hint: 'ㄱ (g) + ㅏ (a) + batchim ㅇ (-ng)',
    initialIdx: 0,
    medialIdx: 0,
    finalIdx: 21,
  },
];

export interface SentencePuzzle {
  id: string;
  tier: ModuleTier;
  topic: string;
  korean: string;
  roman: string;
  meaning: string;
  tokens: string[];
  grammarTip: string;
}

export const SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: 'sent-1',
    tier: 'free',
    topic: 'Belajar Dasar',
    korean: '저는 한국어를 공부해요',
    roman: 'Jeo-neun han-gu-geo-reul gong-bu-hae-yo',
    meaning: 'Saya belajar bahasa Korea.',
    tokens: ['저는', '한국어를', '공부해요'],
    grammarTip: 'Pola S + O + K.Kerja: 저는 (Saya) + 한국어를 (bahasa Korea, objek) + 공부해요 (belajar).',
  },
  {
    id: 'sent-2',
    tier: 'free',
    topic: 'Makan & Minum',
    korean: '오늘 김밥을 먹어요',
    roman: 'O-neul gim-ba-beul meo-geo-yo',
    meaning: 'Hari ini saya makan kimbap.',
    tokens: ['오늘', '김밥을', '먹어요'],
    grammarTip: 'Keterangan waktu (오늘 = hari ini) ditempatkan di awal, diikuti objek dengan partikel -을.',
  },
  {
    id: 'sent-3',
    tier: 'free',
    topic: 'Keluarga & Teman',
    korean: '친구가 학교에 가요',
    roman: 'Chin-gu-ga hak-gyo-e ga-yo',
    meaning: 'Teman pergi ke sekolah.',
    tokens: ['친구가', '학교에', '가요'],
    grammarTip: 'Partikel -가 menandai subjek (teman), dan -에 menandai tujuan tempat (ke sekolah).',
  },
  {
    id: 'sent-4',
    tier: 'free',
    topic: 'Salam Sopan',
    korean: '내일 다시 만나요',
    roman: 'Nae-il da-si man-na-yo',
    meaning: 'Sampai bertemu lagi besok.',
    tokens: ['내일', '다시', '만나요'],
    grammarTip: '내일 (besok) + 다시 (lagi) + 만나요 (bertemu).',
  },
  {
    id: 'sent-5',
    tier: 'pro',
    topic: 'K-Drama & Perasaan',
    korean: '우리 내일 약속해요',
    roman: 'U-ri nae-il yak-sok-hae-yo',
    meaning: 'Ayo kita berjanji untuk besok.',
    tokens: ['우리', '내일', '약속해요'],
    grammarTip: '우리 (kita) + 내일 (besok) + 약속해요 (berjanji / bikin janji).',
  },
  {
    id: 'sent-6',
    tier: 'pro',
    topic: 'Travel Seoul',
    korean: '지금 지하철을 타요',
    roman: 'Ji-geum ji-ha-cheo-reul ta-yo',
    meaning: 'Sekarang saya naik kereta bawah tanah.',
    tokens: ['지금', '지하철을', '타요'],
    grammarTip: 'Kata kerja 타요 (naik transportasi) selalu berpasangan dengan objek transportasi (-을/를).',
  },
  {
    id: 'sent-7',
    tier: 'pro',
    topic: 'Travel & Belanja',
    korean: '커피 한 잔 주세요',
    roman: 'Keo-pi han jan ju-se-yo',
    meaning: 'Tolong beri saya satu cangkir kopi.',
    tokens: ['커피', '한 잔', '주세요'],
    grammarTip: 'Satu cangkir = 한 잔, diikuti ungkapan sopan memesan 주세요 (tolong beri).',
  },
  {
    id: 'sent-8',
    tier: 'pro',
    topic: 'Kerja & EPS-TOPIK',
    korean: '작업장에서 안전모를 써요',
    roman: 'Ja-geop-jang-e-seo an-jeon-mo-reul sseo-yo',
    meaning: 'Di area kerja saya memakai helm keselamatan.',
    tokens: ['작업장에서', '안전모를', '써요'],
    grammarTip: 'Partikel -에서 menunjukkan lokasi berlangsungnya kegiatan kerja (di tempat kerja).',
  },
];

// ============================================================
// WRITING CANVAS STROKE ORDER GUIDES (CORE HANGEUL)
// ============================================================

export interface WritingGlyphGuide {
  id: string;
  char: string;
  roman: string;
  name: string;
  category: 'Konsonan' | 'Vokal';
  strokeCount: number;
  tips: string;
  strokes: string[]; // SVG polyline path in 0..200 coordinate space
}

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

// ============================================================
// PARTICLE & GRAMMAR FILL-IN-THE-BLANK PUZZLES
// ============================================================

export interface ParticlePuzzle {
  id: string;
  tier: ModuleTier;
  topic: string;
  sentenceBefore: string;
  sentenceAfter: string;
  meaningId: string;
  romanFull: string;
  correctOption: string;
  options: string[];
  explanation: string;
}

export const PARTICLE_PUZZLES: ParticlePuzzle[] = [
  {
    id: 'prt-1',
    tier: 'free',
    topic: 'Partikel Topik (은/는)',
    sentenceBefore: '저',
    sentenceAfter: ' 인도네시아 사람이에요.',
    meaningId: 'Saya adalah orang Indonesia.',
    romanFull: 'Jeo-neun in-do-ne-si-a sa-ram-i-e-yo.',
    correctOption: '는',
    options: ['는', '은', '을', '에'],
    explanation: 'Kata 저 (saya) berakhir huruf vokal (tidak ada batchim), jadi memakai partikel topik -는.',
  },
  {
    id: 'prt-2',
    tier: 'free',
    topic: 'Partikel Objek (을/를)',
    sentenceBefore: '오늘 김밥',
    sentenceAfter: ' 먹어요.',
    meaningId: 'Hari ini saya makan kimbap.',
    romanFull: 'O-neul gim-ba-beul meo-geo-yo.',
    correctOption: '을',
    options: ['을', '를', '가', '에서'],
    explanation: 'Kata 김밥 berakhir dengan konsonan batchim ㅂ, maka objeknya memakai partikel -을.',
  },
  {
    id: 'prt-3',
    tier: 'free',
    topic: 'Partikel Subjek (이/가)',
    sentenceBefore: '친구',
    sentenceAfter: ' 학교에 가요.',
    meaningId: 'Teman pergi ke sekolah.',
    romanFull: 'Chin-gu-ga hak-gyo-e ga-yo.',
    correctOption: '가',
    options: ['가', '이', '를', '와'],
    explanation: 'Kata 친구 berakhir vokal ㅜ (tanpa batchim), sehingga partikel subjeknya memakai -가.',
  },
  {
    id: 'prt-4',
    tier: 'free',
    topic: 'Partikel Tujuan (에)',
    sentenceBefore: '내일 한국',
    sentenceAfter: ' 가요.',
    meaningId: 'Besok saya pergi ke Korea.',
    romanFull: 'Nae-il han-gu-ge ga-yo.',
    correctOption: '에',
    options: ['에', '에서', '은', '을'],
    explanation: 'Kata kerja perpindahan seperti 가요 (pergi) atau 와요 (datang) selalu berpasangan dengan -에.',
  },
  {
    id: 'prt-5',
    tier: 'free',
    topic: 'Partikel Lokasi Aktivitas (에서)',
    sentenceBefore: '도서관',
    sentenceAfter: ' 공부해요.',
    meaningId: 'Saya belajar di perpustakaan.',
    romanFull: 'Do-seo-gwa-ne-seo gong-bu-hae-yo.',
    correctOption: '에서',
    options: ['에서', '에', '를', '도'],
    explanation: 'Menunjukkan tempat berlangsungnya suatu kegiatan (belajar/bekerja/makan) memakai -에서.',
  },
  {
    id: 'prt-6',
    tier: 'free',
    topic: 'Partikel Objek (을/를)',
    sentenceBefore: '아침에 커피',
    sentenceAfter: ' 마셔요.',
    meaningId: 'Di pagi hari saya minum kopi.',
    romanFull: 'A-chi-me keo-pi-reul ma-syeo-yo.',
    correctOption: '를',
    options: ['를', '을', '이', '는'],
    explanation: 'Kata 커피 berakhir huruf vokal ㅣ tanpa konsonan akhir, jadi partikel objeknya memakai -를.',
  },
  {
    id: 'prt-7',
    tier: 'pro',
    topic: 'Partikel Kepemilikan / Juga (도)',
    sentenceBefore: '저',
    sentenceAfter: ' 한국 드라마를 좋아해요.',
    meaningId: 'Saya juga menyukai drama Korea.',
    romanFull: 'Jeo-do han-guk deu-ra-ma-reul jo-a-hae-yo.',
    correctOption: '도',
    options: ['도', '만', '을', '에서'],
    explanation: 'Partikel -도 berarti "juga" dan langsung menggantikan partikel topik/subjek di kata benda.',
  },
  {
    id: 'prt-8',
    tier: 'pro',
    topic: 'EPS-TOPIK Kerja (안전 규칙)',
    sentenceBefore: '작업장',
    sentenceAfter: ' 안전모를 꼭 쓰세요.',
    meaningId: 'Di area kerja harap pastikan memakai helm keselamatan.',
    romanFull: 'Ja-geop-jang-e-seo an-jeon-mo-reul kkok sseu-se-yo.',
    correctOption: '에서',
    options: ['에서', '에', '은', '과'],
    explanation: 'Di area kerja terjadi aktivitas bekerja/memakai helm, maka dipakai -에서 (di).',
  },
  {
    id: 'prt-9',
    tier: 'pro',
    topic: 'Penghubung "Dan / Bersama" (와/과)',
    sentenceBefore: '빵',
    sentenceAfter: ' 우유를 주세요.',
    meaningId: 'Tolong beri saya roti dan susu.',
    romanFull: 'Ppang-gwa u-yu-reul ju-se-yo.',
    correctOption: '과',
    options: ['과', '와', '를', '가'],
    explanation: 'Kata 빵 memiliki konsonan penutup (batchim ㅇ), sehingga kata hubung "dan" memakai -과 (bukan -와).',
  },
  {
    id: 'prt-10',
    tier: 'pro',
    topic: 'Partikel Subjek dengan Batchim (이/가)',
    sentenceBefore: '날씨',
    sentenceAfter: ' 정말 좋아요.',
    meaningId: 'Cuacanya sangat bagus.',
    romanFull: 'Nal-ssi-ga jeong-mal jo-a-yo.',
    correctOption: '가',
    options: ['가', '이', '을', '에'],
    explanation: '날씨 (cuaca) berakhir dengan vokal ㅣ, sehingga memakai partikel subjek -가.',
  },
];

// ============================================================
// PANDUAN POLA BACA, BATCHIM & TATA BAHASA INTI
// ============================================================

export interface BatchimRuleExample {
  korean: string;
  pronounced: string;
  roman: string;
  meaning: string;
  note: string;
}

export interface BatchimGuideSection {
  id: string;
  title: string;
  badge: string;
  summary: string;
  examples: BatchimRuleExample[];
}

export const BATCHIM_GUIDE_SECTIONS: BatchimGuideSection[] = [
  {
    id: 'bg-syllable',
    title: 'Cara Merangkai Blok Suku Kata',
    badge: 'Dasar Membaca',
    summary:
      'Setiap blok Hangeul dibaca dari Kiri → Kanan atau Atas → Bawah. Satu blok wajib minimal punya 1 Konsonan Awal + 1 Vokal, dan boleh ditambah 1 Batchim (konsonan penutup di bawah).',
    examples: [
      {
        korean: '가',
        pronounced: '[가]',
        roman: 'ga',
        meaning: 'Konsonan ㄱ + Vokal kanan ㅏ',
        note: 'Vokal tegak (ㅏ, ㅓ, ㅣ) diletakkan di sebelah kanan konsonan.',
      },
      {
        korean: '고',
        pronounced: '[고]',
        roman: 'go',
        meaning: 'Konsonan ㄱ + Vokal bawah ㅗ',
        note: 'Vokal tidur (ㅗ, ㅜ, ㅡ) diletakkan tepat di bawah konsonan.',
      },
      {
        korean: '한글',
        pronounced: '[한글]',
        roman: 'han-geul',
        meaning: 'Tulisan Hangeul',
        note: 'ㅎ+ㅏ+ㄴ (kiri-kanan-bawah) disusul ㄱ+ㅡ+ㄹ (atas-tengah-bawah).',
      },
    ],
  },
  {
    id: 'bg-7sounds',
    title: '7 Bunyi Akhir Batchim (받침)',
    badge: 'Aturan Emas',
    summary:
      'Meskipun ada belasan huruf konsonan, saat diletakkan di posisi paling bawah (Batchim) bunyinya mengerucut hanya menjadi 7 bunyi tahanan saja: k, n, t, l, m, p, ng.',
    examples: [
      {
        korean: '책',
        pronounced: '[책]',
        roman: 'chaek',
        meaning: 'Buku (ㄱ, ㄲ, ㅋ → -k)',
        note: 'Huruf k ditahan di tenggorokan tanpa letupan udara keluar.',
      },
      {
        korean: '꽃',
        pronounced: '[꼳]',
        roman: 'kkot',
        meaning: 'Bunga (ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅎ → -t)',
        note: 'Semua huruf desis/akhir ini berubah menjadi bunyi -t tertutup saat berdiri sendiri.',
      },
      {
        korean: '물',
        pronounced: '[물]',
        roman: 'mul',
        meaning: 'Air (ㄹ → -l)',
        note: 'Di awal suku kata ㄹ berbunyi r/l halus, tetapi di akhir (batchim) selalu -l jelas.',
      },
      {
        korean: '밥',
        pronounced: '[밥]',
        roman: 'bap',
        meaning: 'Nasi (ㅂ, ㅍ → -p)',
        note: 'Bibir dikatupkan pada akhir kata.',
      },
    ],
  },
  {
    id: 'bg-liaison',
    title: 'Hukum Penghubungan Bunyi (연음 · Yeon-eum)',
    badge: 'Kunci Fasih',
    summary:
      'Jika sebuah suku kata berakhir Batchim lalu langsung diikuti suku kata berawalan vokal kosong (ㅇ), maka bunyi Batchim berpindah masuk menggantikan huruf ㅇ tersebut!',
    examples: [
      {
        korean: '한국어',
        pronounced: '[한구거]',
        roman: 'han-gu-geo',
        meaning: 'Bahasa Korea',
        note: 'Batchim ㄱ pada 국 mengalir ke 어 sehingga dibaca 한-구-거, bukan 한-국-어.',
      },
      {
        korean: '먹어요',
        pronounced: '[머거요]',
        roman: 'meo-geo-yo',
        meaning: 'Makan (sopan)',
        note: 'Batchim ㄱ berpindah mengisi ㅇ menjadi 거.',
      },
      {
        korean: '이름이',
        pronounced: '[이르미]',
        roman: 'i-reu-mi',
        meaning: 'Nama (subjek)',
        note: 'Batchim ㅁ berpindah ke partikel 이 menjadi 미.',
      },
    ],
  },
  {
    id: 'bg-particles',
    title: 'Cheat-Sheet Partikel & Kesopanan',
    badge: 'Tata Bahasa',
    summary:
      'Bahasa Korea mengikuti urutan Subjek + Keterangan + Objek + Kata Kerja di akhir kalimat. Pemilihan partikel bergantung pada ada atau tidaknya Batchim.',
    examples: [
      {
        korean: '은 / 는',
        pronounced: 'Topik',
        roman: 'Batchim → 은 · Vokal → 는',
        meaning: 'Penanda topik pembicaraan (cth: 저는, 이름은)',
        note: 'Dipakai untuk memperkenalkan diri atau membandingkan dua hal.',
      },
      {
        korean: '을 / 를',
        pronounced: 'Objek',
        roman: 'Batchim → 을 · Vokal → 를',
        meaning: 'Penanda objek kata kerja (cth: 밥을, 커피를)',
        note: 'Selalu menempel di belakang benda yang dikenai tindakan.',
      },
      {
        korean: '-아요 / -어요',
        pronounced: 'Sopan Harian',
        roman: 'Vokal ㅏ/ㅗ → 아요 · Lainnya → 어요',
        meaning: 'Akhiran kalimat sopan standar sehari-hari',
        note: 'Paling sering dipakai dalam percakapan, kafe, toko, dan K-Drama.',
      },
    ],
  },
];

// ============================================================
// CURATED & CONTEXTUAL DICTIONARY EXAMPLE SENTENCES
// ============================================================

export interface DictionaryExampleSentence {
  korean: string;
  roman: string;
  indonesian: string;
}

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
      return {
        korean: `직장에서 ${item.h} 표현을 자주 써요.`,
        roman: `Jik-jang-e-seo ${item.c} pyo-hyeo-neul ja-ju sseo-yo.`,
        indonesian: `Istilah "${item.m}" sering dipakai di lingkungan kerja Korea.`,
      };
    default:
      return {
        korean: `이것은 한국어로 ${item.h}이에요/예요.`,
        roman: `I-geo-seun han-gu-geo-ro ${item.c} i-e-yo.`,
        indonesian: `Dalam bahasa Korea, "${item.m}" disebut ${item.h} (${item.c}).`,
      };
  }
}


