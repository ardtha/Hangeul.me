import type { CardKind, CurriculumModule, FlashcardItem } from './types';

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
  data.split(';').forEach((entry) => {
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

export const FULL_DICTIONARY_CARDS: FlashcardItem[] = [
  ...ALL_CARDS,
  ...KDRAMA_SLANG_CARDS,
  ...WORK_EPSTOPIK_CARDS,
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
