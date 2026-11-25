"""
Hangeul.me — Platform Website Belajar Bahasa Korea (Edisi Tugas Kuliah Python)
Menjalankan server HTTP Python (stdlib only) dengan 7 mode Studio Latihan interaktif
(Kuis, Kanvas Tulis Hangeul, Rakit Hangeul, Isian Partikel, Cocokkan Pasangan, Susun Kalimat,
Kartu Geser 60d), Papan Bunyi 40 huruf + Panduan Batchim, kamus 500+ entri tematik dengan
Favorit & Contoh Kalimat, Peringkat Mingguan, Streak Harian + Freeze, dan paket Gratis & Pro.

Cara menjalankan:
    python hangeul_me.py
"""

import base64
import datetime
import hashlib
import hmac
import http.server
import json
import os
import secrets
import socketserver
import urllib.parse
import webbrowser

PORT = int(os.environ.get("PORT", 8000))
SESSION_SECRET = os.environ.get("SESSION_SECRET", "").encode("utf-8") or secrets.token_bytes(32)
REVOKED_TOKENS = set()

# ==============================================================================
# 1. DATA KURIKULUM, KAMUS & LATIHAN INTERAKTIF (PYTHON BACKEND)
# ==============================================================================

RAW_DATA = [
    ("L", "Konsonan Dasar", "Konsonan", "ㄱ|g / k|m;ㄴ|n|s;ㄷ|d / t|b;ㄹ|r / l|g;ㅁ|m|n;ㅂ|b / p|j;ㅅ|s|h;ㅇ|ng|m|Diam di awal, ng di akhir;ㅈ|j|k;ㅎ|h|n"),
    ("L", "Konsonan Aspirasi", "Konsonan", "ㅋ|k (tebal)|t;ㅌ|t (tebal)|p;ㅍ|p (tebal)|k;ㅊ|ch|j"),
    ("L", "Konsonan Kembar", "Konsonan kembar", "ㄲ|kk|kh;ㄸ|tt|th;ㅃ|pp|ph;ㅆ|ss|s;ㅉ|jj|ch"),
    ("L", "Vokal Dasar", "Vokal", "ㅏ|a|eo;ㅓ|eo|a;ㅗ|o|u;ㅜ|u|o;ㅡ|eu|i;ㅣ|i|eu;ㅑ|ya|yeo;ㅕ|yeo|ya;ㅛ|yo|yu;ㅠ|yu|yo"),
    ("L", "Vokal Ganda", "Vokal ganda", "ㅐ|ae|eo|Bunyinya mirip ㅔ;ㅒ|yae|ye;ㅔ|e|a|Bunyinya mirip ㅐ;ㅖ|ye|yo;ㅘ|wa|wo;ㅙ|wae|yu;ㅚ|oe|u;ㅝ|wo|wa;ㅞ|we|ae;ㅟ|wi|u;ㅢ|ui|i"),
    ("W", "Kata Dasar", "", "가다|ga-da|sa-da|Pergi;사다|sa-da|ma-si|Membeli;오다|o-da|ga-da|Datang;먹다|meok-da|mok-da|Makan;마시다|ma-si-da|ma-sa-da|Minum;보다|bo-da|o-da|Melihat;사람|sa-ram|na-ra|Orang;나라|na-ra|sa-ram|Negara;나무|na-mu|mo-ja|Pohon;모자|mo-ja|ba-ji|Topi;바지|ba-ji|na-mu|Celana;고기|go-gi|gim-chi|Daging;김치|gim-chi|go-gi|Kimchi;친구|chin-gu|hak-gyo|Teman;학교|hak-gyo|chin-gu|Sekolah;사랑|sa-rang|ha-neul|Cinta;하늘|ha-neul|sa-rang|Langit;물|mul|bul|Air;불|bul|mul|Api;집|jip|jim|Rumah;의자|ui-ja|chaek-sang|Kursi;책상|chaek-sang|ui-ja|Meja;가방|ga-bang|gong-chaek|Tas;공책|gong-chaek|yeon-pil|Buku catatan;연필|yeon-pil|ga-bang|Pensil;노래|no-rae|no-ra|Lagu;회사|hoe-sa|byeong-won|Perusahaan;병원|byeong-won|hoe-sa|Rumah sakit;의사|ui-sa|ui-ja|Dokter;시간|si-gan|si-ga|Waktu;이름|i-reum|na-i|Nama;나이|na-i|i-reum|Usia;마음|ma-eum|sa-rang|Hati / Perasaan;꿈|kkum|bam|Mimpi;소리|so-ri|no-rae|Suara;생각|saeng-gak|gi-eok|Pikiran / Ide"),
    ("D", "Salam & Ungkapan", "", "안녕하세요|an-nyeong-ha-se-yo||Halo;감사합니다|gam-sa-ham-ni-da||Terima kasih;죄송합니다|joe-song-ham-ni-da||Maaf (formal);미안해요|mi-an-hae-yo||Maaf (santai);네|ne||Ya;아니요|a-ni-yo||Tidak;괜찮아요|gwaen-chan-a-yo||Tidak apa-apa;맛있어요|ma-si-sseo-yo||Enak;사랑해요|sa-rang-hae-yo||Aku cinta kamu;안녕히 가세요|an-nyeong-hi ga-se-yo||Selamat tinggal (untuk yang pergi);처음 뵙겠습니다|cheo-eum boep-get-seum-ni-da||Senang berkenalan;안녕히 계세요|an-nyeong-hi gye-se-yo||Selamat tinggal (untuk yang tinggal);환영합니다|hwan-yeong-ham-ni-da||Selamat datang;축하합니다|chuk-ha-ham-ni-da||Selamat;화이팅|hwa-i-ting||Semangat!;잘 먹겠습니다|jal meok-get-seum-ni-da||Selamat makan;잘 먹었습니다|jal meo-geo-sseum-ni-da||Terima kasih makanannya;잘 자요|jal ja-yo||Selamat tidur;도와주세요|do-wa-ju-se-yo||Tolong bantu saya;잠시만요|jam-si-man-yo||Tunggu sebentar;모르겠어요|mo-reu-ge-sseo-yo||Saya tidak tahu;알겠어요|al-ge-sseo-yo||Saya mengerti;주세요|ju-se-yo||Tolong beri saya;얼마예요|eol-ma-ye-yo||Berapa harganya?;어디예요|eo-di-ye-yo||Di mana?;이거 뭐예요|i-geo mwo-ye-yo||Ini apa?;천천히 말해 주세요|cheon-cheon-hi mal-hae ju-se-yo||Tolong bicara pelan-pelan;다시 말해 주세요|da-si mal-hae ju-se-yo||Tolong ulangi;잘 지냈어요?|jal ji-nae-sseo-yo?||Apa kabar?;오랜만이에요|o-raen-man-i-e-yo||Lama tidak berjumpa;실례합니다|sil-lye-ham-ni-da||Permisi;조심하세요|jo-sim-ha-se-yo||Hati-hati ya;걱정하지 마세요|geok-jeong-ha-ji ma-se-yo||Jangan khawatir;별말씀을요|byeol-mal-sseu-meul-yo||Sama-sama (formal)"),
    ("D", "Kata Ganti", "", "나|na||Saya (santai);저|jeo||Saya (sopan);너|neo||Kamu (santai);당신|dang-sin||Anda;우리|u-ri||Kami / kita;그|geu||Dia (laki-laki);그녀|geu-nyeo||Dia (perempuan);이것|i-geot||Ini;그것|geu-geot||Itu;저것|jeo-geot||Itu (jauh);모두|mo-du||Semua orang;누군가|nu-gun-ga||Seseorang"),
    ("D", "Kata Tanya", "", "누구|nu-gu||Siapa;무엇|mu-eot||Apa;뭐|mwo||Apa (santai);어디|eo-di||Di mana;언제|eon-je||Kapan;왜|wae||Mengapa;어떻게|eo-tteo-ke||Bagaimana;얼마|eol-ma||Berapa (harga);몇|myeot||Berapa (jumlah);어느|eo-neu||Yang mana;얼마나|eol-ma-na||Seberapa lama/banyak"),
    ("D", "Angka (Sino-Korea)", "", "일|il||Satu;이|i||Dua;삼|sam||Tiga;사|sa||Empat;오|o||Lima;육|yuk||Enam;칠|chil||Tujuh;팔|pal||Delapan;구|gu||Sembilan;십|sip||Sepuluh;백|baek||Seratus;천|cheon||Seribu;만|man||Sepuluh ribu;영|yeong||Nol;억|eok||Seratus juta"),
    ("D", "Angka Korea Asli", "", "하나|ha-na||Satu;둘|dul||Dua;셋|set||Tiga;넷|net||Empat;다섯|da-seot||Lima;여섯|yeo-seot||Enam;일곱|il-gop||Tujuh;여덟|yeo-deol||Delapan;아홉|a-hop||Sembilan;열|yeol||Sepuluh;스물|seu-mul||Dua puluh;서른|seo-reun||Tiga puluh;마흔|ma-heun||Empat puluh;쉰|swin||Lima puluh"),
    ("D", "Keluarga", "", "가족|ga-jok||Keluarga;엄마|eom-ma||Ibu;아빠|a-ppa||Ayah;형|hyeong||Kakak laki-laki (dari pria);누나|nu-na||Kakak perempuan (dari pria);오빠|o-ppa||Kakak laki-laki (dari wanita);언니|eon-ni||Kakak perempuan (dari wanita);동생|dong-saeng||Adik;할머니|hal-meo-ni||Nenek;할아버지|ha-ra-beo-ji||Kakek;아들|a-deul||Anak laki-laki;딸|ttal||Anak perempuan;남편|nam-pyeon||Suami;아내|a-nae||Istri;아기|a-gi||Bayi;부모님|bu-mo-nim||Orang tua;삼촌|sam-chon||Paman;이모|i-mo||Bibi (dari pihak ibu);고모|go-mo||Bibi (dari pihak ayah);조카|jo-ka||Keponakan"),
    ("D", "Makanan & Minuman", "", "밥|bap||Nasi;빵|ppang||Roti;라면|ra-myeon||Mi instan;비빔밥|bi-bim-bap||Nasi campur;불고기|bul-go-gi||Bulgogi (daging panggang);계란|gye-ran||Telur;과일|gwa-il||Buah;사과|sa-gwa||Apel;커피|keo-pi||Kopi;우유|u-yu||Susu;국|guk||Sup;찌개|jji-gae||Semur / sup;떡볶이|tteok-bok-ki||Tteokbokki;김밥|gim-bap||Kimbap;삼겹살|sam-gyeop-sal||Daging panggang;만두|man-du||Pangsit;냉면|naeng-myeon||Mi dingin;된장|doen-jang||Pasta kedelai;고추장|go-chu-jang||Pasta cabai;치킨|chi-kin||Ayam goreng;차|cha||Teh;주스|ju-seu||Jus;바나나|ba-na-na||Pisang;포도|po-do||Anggur;딸기|ttal-gi||Stroberi;수박|su-bak||Semangka;귤|gyul||Jeruk mandarin;감자|gam-ja||Kentang;양파|yang-pa||Bawang bombai;마늘|ma-neul||Bawang putih;고추|go-chu||Cabai;야채|ya-chae||Sayur;소금|so-geum||Garam;설탕|seol-tang||Gula;과자|gwa-ja||Camilan;아이스크림|a-i-seu-keu-rim||Es krim;물냉면|mul-naeng-myeon||Mi dingin berkuah;갈비|gal-bi||Iga panggang;잡채|jap-chae||Soun tumis Korea;어묵|eo-muk||Sate bakso ikan"),
    ("D", "Warna", "", "빨간색|ppal-gan-saek||Merah;파란색|pa-ran-saek||Biru;노란색|no-ran-saek||Kuning;초록색|cho-rok-saek||Hijau;하얀색|ha-yan-saek||Putih;검은색|geo-meun-saek||Hitam;주황색|ju-hwang-saek||Oranye;보라색|bo-ra-saek||Ungu;분홍색|bun-hong-saek||Merah muda;갈색|gal-saek||Cokelat;회색|hoe-saek||Abu-abu;금색|geum-saek||Emas;은색|eun-saek||Perak"),
    ("D", "Hewan", "", "개|gae||Anjing;고양이|go-yang-i||Kucing;새|sae||Burung;물고기|mul-go-gi||Ikan;말|mal||Kuda;소|so||Sapi;돼지|dwae-ji||Babi;닭|dak||Ayam;오리|o-ri||Bebek;양|yang||Domba;토끼|to-kki||Kelinci;호랑이|ho-rang-i||Harimau;사자|sa-ja||Singa;곰|gom||Beruang;코끼리|ko-kki-ri||Gajah;원숭이|won-sung-i||Monyet;쥐|jwi||Tikus;뱀|baem||Ular;거북이|geo-bug-i||Kura-kura;나비|na-bi||Kupu-kupu;벌|beol||Lebah;개미|gae-mi||Semut"),
    ("D", "Waktu", "", "오늘|o-neul||Hari ini;내일|nae-il||Besok;어제|eo-je||Kemarin;아침|a-chim||Pagi;점심|jeom-sim||Siang;저녁|jeo-nyeok||Sore / malam;밤|bam||Malam;지금|ji-geum||Sekarang;매일|mae-il||Setiap hari;주말|ju-mal||Akhir pekan;오전|o-jeon||Pagi (AM);오후|o-hu||Sore (PM);올해|ol-hae||Tahun ini;작년|jak-nyeon||Tahun lalu;내년|nae-nyeon||Tahun depan;방금|bang-geum||Baru saja;나중에|na-jung-e||Nanti"),
    ("D", "Hari & Bulan", "", "월요일|wol-yo-il||Senin;화요일|hwa-yo-il||Selasa;수요일|su-yo-il||Rabu;목요일|mok-yo-il||Kamis;금요일|geum-yo-il||Jumat;토요일|to-yo-il||Sabtu;일요일|il-yo-il||Minggu;일월|il-wol||Januari;이월|i-wol||Februari;삼월|sam-wol||Maret;사월|sa-wol||April;오월|o-wol||Mei;유월|yu-wol||Juni;칠월|chil-wol||Juli;팔월|pal-wol||Agustus;구월|gu-wol||September;시월|si-wol||Oktober;십일월|si-bil-wol||November;십이월|si-bi-wol||Desember;생일|saeng-il||Ulang tahun;휴일|hyu-il||Hari libur"),
    ("D", "Tubuh", "", "머리|meo-ri||Kepala / rambut;얼굴|eol-gul||Wajah;눈|nun||Mata;코|ko||Hidung;입|ip||Mulut;귀|gwi||Telinga;목|mok||Leher;어깨|eo-kkae||Bahu;팔|pal||Lengan;손|son||Tangan;손가락|son-ga-rak||Jari;배|bae||Perut;등|deung||Punggung;다리|da-ri||Kaki (tungkai);발|bal||Telapak kaki;무릎|mu-reup||Lutut;치아|chi-a||Gigi;피부|pi-bu||Kulit;몸|mom||Tubuh;마음|ma-eum||Hati / perasaan"),
    ("D", "Kata Kerja", "", "하다|ha-da||Melakukan;되다|doe-da||Menjadi;있다|it-da||Ada;없다|eop-da||Tidak ada;자다|ja-da||Tidur;일어나다|il-eo-na-da||Bangun;앉다|an-da||Duduk;서다|seo-da||Berdiri;걷다|geot-da||Berjalan;뛰다|ttwi-da||Berlari;읽다|ik-da||Membaca;쓰다|sseu-da||Menulis;듣다|deut-da||Mendengar;말하다|mal-ha-da||Berbicara;배우다|bae-u-da||Belajar;가르치다|ga-reu-chi-da||Mengajar;일하다|il-ha-da||Bekerja;공부하다|gong-bu-ha-da||Belajar (studi);만나다|man-na-da||Bertemu;주다|ju-da||Memberi;받다|bat-da||Menerima;열다|yeol-da||Membuka;닫다|dat-da||Menutup;사랑하다|sa-rang-ha-da||Mencintai;좋아하다|jo-a-ha-da||Menyukai;알다|al-da||Tahu;모르다|mo-reu-da||Tidak tahu;기다리다|gi-da-ri-da||Menunggu;전화하다|jeon-hwa-ha-da||Menelepon;요리하다|yo-ri-ha-da||Memasak;청소하다|cheong-so-ha-da||Membersihkan;쉬다|swi-da||Beristirahat;운동하다|un-dong-ha-da||Berolahraga;여행하다|yeo-haeng-ha-da||Berwisata;준비하다|jun-bi-ha-da||Mempersiapkan"),
    ("D", "Kata Sifat", "", "크다|keu-da||Besar;작다|jak-da||Kecil;많다|man-ta||Banyak;적다|jeok-da||Sedikit;좋다|jo-ta||Baik / bagus;나쁘다|na-ppeu-da||Buruk;예쁘다|ye-ppeu-da||Cantik;멋있다|meo-sit-da||Keren;맛있다|ma-sit-da||Enak;맛없다|ma-deop-da||Tidak enak;뜨겁다|tteu-geop-da||Panas (benda);차갑다|cha-gap-da||Dingin (benda);덥다|deop-da||Panas (cuaca);춥다|chup-da||Dingin (cuaca);어렵다|eo-ryeop-da||Sulit;쉽다|swip-da||Mudah;재미있다|jae-mi-it-da||Menyenangkan;비싸다|bi-ssa-da||Mahal;싸다|ssa-da||Murah;빠르다|ppa-reu-da||Cepat;느리다|neu-ri-da||Lambat;새롭다|sae-rop-da||Baru;멀다|meol-da||Jauh;가깝다|ga-kkap-da||Dekat;깨끗하다|kkae-kkeut-ha-da||Bersih;조용하다|jo-yong-ha-da||Tenang / sepi;시끄럽다|si-kkeu-reop-da||Berisik;편하다|pyeon-ha-da||Nyaman;불편하다|bul-pyeon-ha-da||Tidak nyaman;중요하다|jung-yo-ha-da||Penting"),
    ("D", "Perasaan", "", "기쁘다|gi-ppeu-da||Senang;슬프다|seul-peu-da||Sedih;화나다|hwa-na-da||Marah;무섭다|mu-seop-da||Takut;피곤하다|pi-gon-ha-da||Lelah;배고프다|bae-go-peu-da||Lapar;목마르다|mong-ma-reu-da||Haus;행복하다|haeng-bok-ha-da||Bahagia;외롭다|oe-rop-da||Kesepian;아프다|a-peu-da||Sakit;신나다|sin-na-da||Bersemangat;긴장되다|gin-jang-doe-da||Gugup;부끄럽다|bu-kkeu-reop-da||Malu"),
    ("D", "Tempat", "", "도서관|do-seo-gwan||Perpustakaan;은행|eun-haeng||Bank;시장|si-jang||Pasar;가게|ga-ge||Toko;슈퍼마켓|syu-peo-ma-ket||Supermarket;식당|sik-dang||Restoran;카페|ka-pe||Kafe;공원|gong-won||Taman;우체국|u-che-guk||Kantor pos;경찰서|gyeong-chal-seo||Kantor polisi;약국|yak-guk||Apotek;극장|geuk-jang||Bioskop;호텔|ho-tel||Hotel;화장실|hwa-jang-sil||Toilet;교회|gyo-hoe||Gereja;대학교|dae-hak-gyo||Universitas;방|bang||Kamar;부엌|bu-eok||Dapur;문|mun||Pintu;창문|chang-mun||Jendela;백화점|baek-hwa-jeom||Mal / Department store;편의점|pyeon-ui-jeom||Minimarket 24 jam"),
    ("D", "Transportasi", "", "버스|beo-seu||Bus;지하철|ji-ha-cheol||Kereta bawah tanah;택시|taek-si||Taksi;기차|gi-cha||Kereta api;비행기|bi-haeng-gi||Pesawat;공항|gong-hang||Bandara;자동차|ja-dong-cha||Mobil;자전거|ja-jeon-geo||Sepeda;오토바이|o-to-ba-i||Sepeda motor;역|yeok||Stasiun;정류장|jeong-nyu-jang||Halte;길|gil||Jalan;신호등|sin-ho-deung||Lampu lalu lintas;횡단보도|hoeng-dan-bo-do||Zebra cross"),
    ("D", "Benda Sehari-hari", "", "책|chaek||Buku;전화|jeon-hwa||Telepon;휴대폰|hyu-dae-pon||Ponsel;컴퓨터|keom-pyu-teo||Komputer;텔레비전|tel-le-bi-jeon||Televisi;시계|si-gye||Jam;우산|u-san||Payung;열쇠|yeol-soe||Kunci;돈|don||Uang;지갑|ji-gap||Dompet;안경|an-gyeong||Kacamata;침대|chim-dae||Tempat tidur;컵|keop||Gelas;숟가락|sut-ga-rak||Sendok;젓가락|jeot-ga-rak||Sumpit;사진|sa-jin||Foto;편지|pyeon-ji||Surat;선물|seon-mul||Hadiah"),
    ("D", "Pakaian", "", "옷|ot||Pakaian;신발|sin-bal||Sepatu;양말|yang-mal||Kaus kaki;셔츠|syeo-cheu||Kemeja;치마|chi-ma||Rok;청바지|cheong-ba-ji||Jeans;코트|ko-teu||Mantel;장갑|jang-gap||Sarung tangan;목도리|mok-do-ri||Syal;한복|han-bok||Pakaian tradisional Korea;티셔츠|ti-syeo-cheu||Kaus;운동화|un-dong-hwa||Sepatu olahraga"),
    ("D", "Alam & Cuaca", "", "산|san||Gunung;바다|ba-da||Laut;강|gang||Sungai;호수|ho-su||Danau;섬|seom||Pulau;꽃|kkot||Bunga;풀|pul||Rumput;땅|ttang||Tanah;비|bi||Hujan;눈|nun||Salju;바람|ba-ram||Angin;구름|gu-reum||Awan;해|hae||Matahari;달|dal||Bulan;별|byeol||Bintang;날씨|nal-ssi||Cuaca;봄|bom||Musim semi;여름|yeo-reum||Musim panas;가을|ga-eul||Musim gugur;겨울|gyeo-ul||Musim dingin;번개|beon-gae||Petir;무지개|mu-ji-gae||Pelangi"),
    ("D", "Pekerjaan", "", "선생님|seon-saeng-nim||Guru;학생|hak-saeng||Murid;간호사|gan-ho-sa||Perawat;경찰|gyeong-chal||Polisi;군인|gun-in||Tentara;요리사|yo-ri-sa||Koki;가수|ga-su||Penyanyi;배우|bae-u||Aktor;회사원|hoe-sa-won||Karyawan;변호사|byeon-ho-sa||Pengacara;기자|gi-ja||Wartawan;운전사|un-jeon-sa||Pengemudi;농부|nong-bu||Petani;프로그래머|peu-ro-geu-rae-meo||Programmer;디자이너|di-ja-i-neo||Desainer"),
    ("D", "Sekolah & Kampus", "", "교실|gyo-sil||Ruang kelas;학생증|hak-saeng-jeung||Kartu mahasiswa/pelajar;시험|si-heom||Ujian;숙제|suk-je||Pekerjaan rumah (PR);전공|jeon-gong||Jurusan kuliah;장학금|jang-hak-geum||Beasiswa;졸업|jo-reop||Kelulusan / Wisuda;입학|ip-hak||Masuk sekolah/kuliah;칠판|chil-pan||Papan tulis;사전|sa-jeon||Kamus;노트북|no-teu-buk||Laptop;방학|bang-hak||Libur sekolah;학기|hak-gi||Semester;성적|seong-jeok||Nilai akademik;질문|jil-mun||Pertanyaan;대답|dae-dap||Jawaban;발표|bal-pyo||Presentasi;동아리|dong-a-ri||Klub / UKM kampus"),
    ("D", "Belanja & Pembayaran", "", "가격|ga-gyeok||Harga;할인|ha-rin||Diskon;영수증|yeong-su-jeung||Struk belanja;현금|hyeon-geum||Uang tunai;신용카드|sin-yong-ka-deu||Kartu kredit;계산대|gye-san-dae||Kasir;포장|po-jang||Bungkus / bawa pulang;환불|hwan-bul||Pengembalian dana;교환|gyo-hwan||Tukar barang;크기|keu-gi||Ukuran;무료|mu-ryo||Gratis;배달|bae-dal||Pengiriman / antar;주문|ju-mun||Pesanan;택배|taek-bae||Paket kurir;봉투|bong-tu||Kantong belanja"),
    ("D", "Teknologi & Media", "", "인터넷|in-teo-net||Internet;비밀번호|bi-mil-beon-ho||Kata sandi;충전기|chung-jeon-gi||Pengisi daya (charger);배터리|bae-teo-ri||Baterai;와이파이|wa-i-pa-i||Wi-Fi;화면|hwa-myeon||Layar;카메라|ka-me-ra||Kamera;동영상|dong-yeong-sang||Video;메시지|me-si-ji||Pesan teks;검색|geom-saek||Pencarian;다운로드|da-un-lo-deu||Unduhan;앱|aep||Aplikasi;이어폰|i-eo-pon||Earphone;키보드|ki-bo-deu||Papan ketik;마우스|ma-u-seu||Tetikus (mouse)"),
    ("D", "Hobi & Olahraga", "", "운동|un-dong||Olahraga;축구|chuk-gu||Sepak bola;농구|nong-gu||Bola basket;수영|su-yeong||Berenang;등산|deung-san||Mendaki gunung;여행|yeo-haeng||Jalan-jalan;요리|yo-ri||Memasak;독서|dok-seo||Membaca buku;영화|yeong-hwa||Film;음악|eu-mak||Musik;그림|geu-rim||Gambar / lukisan;춤|chum||Tarian;게임|ge-im||Permainan / game;캠핑|kaem-ping||Berkemah;요가|yo-ga||Yoga;배드민턴|bae-deu-min-teon||Bulu tangkis"),
    ("D", "Kesehatan & Medis", "", "감기|gam-gi||Flu / pilek;열|yeol||Demam;기침|gi-chim||Batuk;두통|du-tong||Sakit kepala;치과|chi-gwa||Klinik gigi;처방전|cheo-bang-jeon||Resep dokter;약|yak||Obat;주사|ju-sa||Suntikan;건강|geon-gang||Kesehatan;휴식|hyu-sik||Istirahat;체온|che-on||Suhu tubuh;구급차|gu-geup-cha||Ambulans;응급실|eung-geup-sil||UGD (Gawat darurat)"),
    ("D", "Rumah & Perabotan", "", "거실|geo-sil||Ruang tamu;침실|chim-sil||Kamar tidur;욕실|yok-sil||Kamar mandi;베란다|be-ran-da||Balkon;냉장고|naeng-jang-go||Kulkas;세탁기|se-tak-gi||Mesin cuci;에어컨|e-eo-keon||AC;선풍기|seon-pung-gi||Kipas angin;소파|so-pa||Sofa;거울|geo-ul||Cermin;수건|su-geon||Handuk;비누|bi-nu||Sabun;치약|chi-yak||Pasta gigi;칫솔|chit-sol||Sikat gigi"),
    ("D", "Arah & Posisi", "", "위|wi||Atas;아래|a-rae||Bawah;앞|ap||Depan;뒤|dwi||Belakang;옆|yeop||Samping;안|an||Dalam;밖|bak||Luar;왼쪽|oen-jjok||Kiri;오른쪽|o-reun-jjok||Kanan;가운데|ga-un-de||Tengah;여기|yeo-gi||Di sini;저기|jeo-gi||Di sana"),
    ("D", "Partikel & Penghubung", "", "은/는|eun / neun||Partikel topik;이/가|i / ga||Partikel subjek;을/를|eul / reul||Partikel objek;에|e||Ke / pada (waktu, tempat);에서|e-seo||Di (tempat aktivitas);와/과|wa / gwa||Dan / dengan;도|do||Juga;그리고|geu-ri-go||Dan;그래서|geu-rae-seo||Jadi;하지만|ha-ji-man||Tetapi"),
]

KDRAMA_CARDS = [
    {"id": "kd-1", "h": "대박", "c": "dae-bak", "w": "jeong-mal", "kind": "W", "type": "K-Drama", "m": "Luar biasa / Keren banget!"},
    {"id": "kd-2", "h": "진짜요?", "c": "jin-jja-yo?", "w": "mwo-ra-go?", "kind": "W", "type": "K-Drama", "m": "Benarkah? / Serius?"},
    {"id": "kd-3", "h": "설레다", "c": "seol-le-da", "w": "bo-go-sip-da", "kind": "W", "type": "K-Drama", "m": "Berdebar-debar (hati)"},
    {"id": "kd-4", "h": "보고 싶어요", "c": "bo-go si-peo-yo", "w": "ga-go si-peo-yo", "kind": "W", "type": "K-Drama", "m": "Aku merindukanmu"},
    {"id": "kd-5", "h": "어떡해", "c": "eo-tteo-kae", "w": "wae-geu-rae", "kind": "W", "type": "K-Drama", "m": "Bagaimana ini!"},
    {"id": "kd-6", "h": "눈치", "c": "nun-chi", "w": "ma-eum", "kind": "W", "type": "K-Drama", "m": "Kepekaan membaca situasi"},
    {"id": "kd-7", "h": "꿀잼", "c": "kkul-jaem", "w": "no-jaem", "kind": "W", "type": "K-Drama", "m": "Sangat seru / lucu"},
    {"id": "kd-8", "h": "고생했어요", "c": "go-saeng-hae-sseo-yo", "w": "su-go-hae-sseo-yo", "kind": "W", "type": "K-Drama", "m": "Kamu sudah bekerja keras"},
    {"id": "kd-9", "h": "약속해요", "c": "yak-sok-hae-yo", "w": "gi-da-ryeo-yo", "kind": "W", "type": "K-Drama", "m": "Aku berjanji"},
    {"id": "kd-10", "h": "운명", "c": "un-myeong", "w": "gi-jeok", "kind": "W", "type": "K-Drama", "m": "Takdir"},
    {"id": "kd-11", "h": "심쿵", "c": "sim-kung", "w": "du-geun", "kind": "W", "type": "K-Drama", "m": "Jantung berdegup kencang"},
    {"id": "kd-12", "h": "갑자기", "c": "gap-ja-gi", "w": "jeon-hyeo", "kind": "W", "type": "K-Drama", "m": "Tiba-tiba / mendadak"},
    {"id": "kd-13", "h": "솔직히", "c": "sol-jik-hi", "w": "jeong-mal", "kind": "W", "type": "K-Drama", "m": "Sejujurnya"},
    {"id": "kd-14", "h": "분위기", "c": "bun-wi-gi", "w": "gi-bun", "kind": "W", "type": "K-Drama", "m": "Suasana / atmosfer"},
]

WORK_CARDS = [
    {"id": "wk-1", "h": "출근하다", "c": "chul-geun-ha-da", "w": "toe-geun-ha-da", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Berangkat kerja"},
    {"id": "wk-2", "h": "퇴근하다", "c": "toe-geun-ha-da", "w": "chul-geun-ha-da", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Pulang kerja"},
    {"id": "wk-3", "h": "안전모", "c": "an-jeon-mo", "w": "bo-ho-bok", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Helm keselamatan"},
    {"id": "wk-4", "h": "월급", "c": "wol-geup", "w": "bo-neo-seu", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Gaji bulanan"},
    {"id": "wk-5", "h": "회의", "c": "hoe-ui", "w": "gye-yak", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Rapat / pertemuan"},
    {"id": "wk-6", "h": "보고서", "c": "bo-go-seo", "w": "i-ryeok-seo", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Laporan kerja"},
    {"id": "wk-7", "h": "조심하세요", "c": "jo-sim-ha-se-yo", "w": "jo-yong-ha-se-yo", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Harap berhati-hati"},
    {"id": "wk-8", "h": "계약서", "c": "gye-yak-seo", "w": "bo-go-seo", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Surat kontrak kerja"},
    {"id": "wk-9", "h": "휴게실", "c": "hyu-ge-sil", "w": "sa-mu-sil", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Ruang istirahat"},
    {"id": "wk-10", "h": "수고하셨습니다", "c": "su-go-ha-syeot-seum-ni-da", "w": "gam-sa-ham-ni-da", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Terima kasih atas kerja kerasnya"},
    {"id": "wk-11", "h": "야근", "c": "ya-geun", "w": "hyu-geun", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Lembur kerja malam"},
    {"id": "wk-12", "h": "안전화", "c": "an-jeon-hwa", "w": "un-dong-hwa", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Sepatu keselamatan (safety shoes)"},
    {"id": "wk-13", "h": "작업장", "c": "ja-geop-jang", "w": "hoe-sa", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Area / lokasi kerja"},
    {"id": "wk-14", "h": "출입증", "c": "chul-ip-jeung", "w": "sin-bun-jeung", "kind": "W", "type": "Kerja & EPS-TOPIK", "m": "Kartu akses masuk"},
]


def parse_all_cards():
    cards = []
    idx = 0
    for kind, cat_type, default_meaning, raw_entries in RAW_DATA:
        for entry in raw_entries.split(";"):
            parts = entry.split("|")
            h, c, w = parts[0], parts[1], parts[2]
            m = parts[3] if len(parts) > 3 and parts[3] else default_meaning
            cards.append({
                "id": f"c-{idx}",
                "h": h,
                "c": c,
                "w": w,
                "kind": kind,
                "type": "Kata Dasar" if kind == "W" else cat_type,
                "m": m,
            })
            idx += 1

    # Isi pengecoh (distractor) untuk entri kamus agar semua modul bisa dimainkan di Studio Latihan
    for i, card in enumerate(cards):
        if not card["w"]:
            same_cat = [x for x in cards if x["type"] == card["type"] and x["c"] != card["c"]]
            pool = same_cat if same_cat else [x for x in cards if x["c"] != card["c"]]
            pick = pool[(i * 7 + 3) % len(pool)]
            card["w"] = pick["c"]
    return cards


ALL_CARDS = parse_all_cards()


def by_types(type_names):
    return [c for c in ALL_CARDS if c["type"] in type_names]


CURRICULUM_MODULES = [
    {
        "id": "mod-hangeul-core",
        "order": "01",
        "title": "Alfabet Hangeul Dasar & Ganda",
        "subtitle": "40 huruf konsonan & vokal Korea",
        "tier": "free",
        "minutes": 12,
        "description": "Kuasai konsonan dasar, aspirasi, konsonan kembar, serta vokal dasar dan ganda dengan pelafalan audio ko-KR.",
        "cards": [c for c in ALL_CARDS if c["kind"] == "L"],
    },
    {
        "id": "mod-daily-vocab",
        "order": "02",
        "title": "Kosakata Pemula & Salam Penting",
        "subtitle": "Kata benda dasar, kampus, dan ungkapan sopan",
        "tier": "free",
        "minutes": 18,
        "description": "Latih kata kerja inti, kosakata kampus, dan salam sehari-hari mulai dari 안녕하세요 hingga 감사합니다.",
        "cards": [c for c in ALL_CARDS if c["kind"] == "W"] + by_types(["Salam & Ungkapan", "Sekolah & Kampus"]),
    },
    {
        "id": "mod-kdrama-pack",
        "order": "03",
        "title": "K-Drama, Ekspresi & Perasaan",
        "subtitle": "Dialog natural, slang sopan, dan emosi",
        "tier": "pro",
        "minutes": 20,
        "description": "Pahami ungkapan populer drama Korea seperti 대박, 설레다, 눈치, 심쿵 serta kosakata perasaan dan hobi.",
        "cards": KDRAMA_CARDS + by_types(["Perasaan", "Hobi & Olahraga"]),
    },
    {
        "id": "mod-travel-seoul",
        "order": "04",
        "title": "Travel, Kuliner & Belanja Seoul",
        "subtitle": "Pesan makanan, naik subway, dan pembayaran",
        "tier": "pro",
        "minutes": 25,
        "description": "Kuasai menu restoran, stasiun 지하철, tempat umum, belanja, dan angka Sino-Korea selama di Korea.",
        "cards": by_types(["Makanan & Minuman", "Transportasi", "Tempat", "Belanja & Pembayaran", "Angka (Sino-Korea)"]),
    },
    {
        "id": "mod-work-epstopik",
        "order": "05",
        "title": "Kerja, Kesehatan & Persiapan EPS-TOPIK",
        "subtitle": "Kosakata pabrik, kantor, teknologi, dan keselamatan",
        "tier": "pro",
        "minutes": 24,
        "description": "Modul khusus calon pekerja & profesional Indonesia di Korea: kontrak kerja, keselamatan, medis, dan teknologi.",
        "cards": WORK_CARDS + by_types(["Pekerjaan", "Kesehatan & Medis", "Teknologi & Media"]),
    },
    {
        "id": "mod-grammar-topik",
        "order": "06",
        "title": "Tata Bahasa, Partikel & TOPIK I",
        "subtitle": "Struktur kalimat 은/는, 이/가, 을/를 dan kata sifat",
        "tier": "pro",
        "minutes": 30,
        "description": "Bangun kalimat Korea yang benar secara gramatikal dengan penguasaan partikel, kata kerja, dan kata sifat TOPIK I.",
        "cards": by_types(["Partikel & Penghubung", "Kata Kerja", "Kata Sifat"]),
    },
]

SYLLABLE_PUZZLES_PY = [
    {"id": "syl-1", "char": "한", "roman": "han", "meaning": "Korea / Satu (한국)", "hint": "ㅎ + ㅏ + batchim ㄴ", "l": 18, "v": 0, "t": 4},
    {"id": "syl-2", "char": "글", "roman": "geul", "meaning": "Aksara / Tulisan (한글)", "hint": "ㄱ + ㅡ + batchim ㄹ", "l": 0, "v": 18, "t": 8},
    {"id": "syl-3", "char": "물", "roman": "mul", "meaning": "Air minum", "hint": "ㅁ + ㅜ + batchim ㄹ", "l": 6, "v": 13, "t": 8},
    {"id": "syl-4", "char": "밥", "roman": "bap", "meaning": "Nasi / Makanan", "hint": "ㅂ + ㅏ + batchim ㅂ", "l": 7, "v": 0, "t": 17},
    {"id": "syl-5", "char": "봄", "roman": "bom", "meaning": "Musim semi", "hint": "ㅂ + ㅗ + batchim ㅁ", "l": 7, "v": 8, "t": 16},
]

SENTENCE_PUZZLES_PY = [
    {"id": "s-1", "tier": "free", "topic": "Belajar Dasar", "korean": "저는 한국어를 공부해요", "roman": "Jeo-neun han-gu-geo-reul gong-bu-hae-yo", "meaning": "Saya belajar bahasa Korea.", "tokens": ["저는", "한국어를", "공부해요"], "tip": "Subjek (저는) + Objek (-를) + Kata Kerja di akhir kalimat."},
    {"id": "s-2", "tier": "free", "topic": "Makan & Minum", "korean": "오늘 김밥을 먹어요", "roman": "O-neul gim-ba-beul meo-geo-yo", "meaning": "Hari ini saya makan kimbap.", "tokens": ["오늘", "김밥을", "먹어요"], "tip": "Waktu di awal kalimat, objek memakai partikel -을."},
    {"id": "s-3", "tier": "pro", "topic": "Travel Seoul", "korean": "지금 지하철을 타요", "roman": "Ji-geum ji-ha-cheo-reul ta-yo", "meaning": "Sekarang saya naik kereta bawah tanah.", "tokens": ["지금", "지하철을", "타요"], "tip": "Kata kerja 타요 (naik) berpasangan dengan objek transportasi (-을)."},
    {"id": "s-4", "tier": "pro", "topic": "Kerja & EPS-TOPIK", "korean": "작업장에서 안전모를 써요", "roman": "Ja-geop-jang-e-seo an-jeon-mo-reul sseo-yo", "meaning": "Di area kerja memakai helm keselamatan.", "tokens": ["작업장에서", "안전모를", "써요"], "tip": "Partikel -에서 menunjukkan lokasi aktivitas kerja."},
]

WRITING_GLYPHS_PY = [
    {"id": "wg-1", "char": "ㄱ", "roman": "g / k", "name": "Giyeok (기역)", "category": "Konsonan", "strokeCount": 1, "tips": "Tarik 1 garis datar dari kiri ke kanan lalu langsung turun ke bawah tanpa mengangkat pena.", "strokes": ["M 45 52 L 148 52 L 148 152"]},
    {"id": "wg-2", "char": "ㄴ", "roman": "n", "name": "Nieun (니은)", "category": "Konsonan", "strokeCount": 1, "tips": "Mulai dari atas ke bawah, lalu belok ke kanan menjadi sudut siku 90°.", "strokes": ["M 52 48 L 52 148 L 154 148"]},
    {"id": "wg-3", "char": "ㄷ", "roman": "d / t", "name": "Digeut (디귿)", "category": "Konsonan", "strokeCount": 2, "tips": "Goresan 1: garis datar atas. Goresan 2: mulai dari kiri atas turun lalu belok ke kanan.", "strokes": ["M 50 50 L 148 50", "M 52 50 L 52 148 L 152 148"]},
    {"id": "wg-4", "char": "ㄹ", "roman": "r / l", "name": "Rieul (리을)", "category": "Konsonan", "strokeCount": 3, "tips": "Goresan 1: ㄱ di atas. Goresan 2: garis tengah. Goresan 3: ㄴ di bawah.", "strokes": ["M 52 46 L 148 46 L 148 92", "M 52 96 L 148 96", "M 52 96 L 52 152 L 152 152"]},
    {"id": "wg-5", "char": "ㅁ", "roman": "m", "name": "Mieum (미음)", "category": "Konsonan", "strokeCount": 3, "tips": "Goresan 1: vertikal kiri. Goresan 2: ㄱ menyatu. Goresan 3: tutup kotak di bawah.", "strokes": ["M 52 48 L 52 150", "M 52 48 L 148 48 L 148 150", "M 52 150 L 148 150"]},
    {"id": "wg-6", "char": "ㅂ", "roman": "b / p", "name": "Bieup (비읍)", "category": "Konsonan", "strokeCount": 4, "tips": "Tarik 2 tiang vertikal dulu, lalu sambungkan garis tengah dan garis bawah.", "strokes": ["M 54 45 L 54 152", "M 146 45 L 146 152", "M 54 98 L 146 98", "M 54 152 L 146 152"]},
    {"id": "wg-7", "char": "ㅅ", "roman": "s", "name": "Siot (시옷)", "category": "Konsonan", "strokeCount": 2, "tips": "Goresan 1: melengkung serong kiri. Goresan 2: serong kanan dari tengah.", "strokes": ["M 102 45 Q 92 108 42 152", "M 98 88 Q 124 122 158 152"]},
    {"id": "wg-8", "char": "ㅇ", "roman": "ng / diam", "name": "Ieung (이응)", "category": "Konsonan", "strokeCount": 1, "tips": "Tulis satu lingkaran penuh berlawanan arah jarum jam.", "strokes": ["M 100 45 A 55 55 0 1 0 100.1 45 Z"]},
    {"id": "wg-9", "char": "ㅈ", "roman": "j", "name": "Jieut (지읒)", "category": "Konsonan", "strokeCount": 3, "tips": "Garis datar atas serong turun ke kiri, lalu tambah kaki miring ke kanan.", "strokes": ["M 48 52 L 150 52", "M 104 52 Q 88 112 44 152", "M 98 94 Q 126 124 156 152"]},
    {"id": "wg-10", "char": "ㅎ", "roman": "h", "name": "Hieut (히읗)", "category": "Konsonan", "strokeCount": 3, "tips": "Titik atas pendek, garis datar di bawahnya, lalu lingkaran bulat di bagian bawah.", "strokes": ["M 100 32 L 100 50", "M 44 64 L 156 64", "M 100 84 A 38 38 0 1 0 100.1 84 Z"]},
    {"id": "wg-11", "char": "ㅏ", "roman": "a", "name": "Vokal A", "category": "Vokal", "strokeCount": 2, "tips": "Garis vertikal panjang dari atas ke bawah, lalu garis pendek menghadap kanan.", "strokes": ["M 82 36 L 82 164", "M 82 100 L 146 100"]},
    {"id": "wg-12", "char": "ㅓ", "roman": "eo", "name": "Vokal Eo", "category": "Vokal", "strokeCount": 2, "tips": "Garis pendek dari kiri ke tengah dulu, lalu garis vertikal panjang.", "strokes": ["M 52 100 L 116 100", "M 116 36 L 116 164"]},
    {"id": "wg-13", "char": "ㅗ", "roman": "o", "name": "Vokal O", "category": "Vokal", "strokeCount": 2, "tips": "Garis pendek vertikal turun dulu, lalu garis horizontal panjang di bawahnya.", "strokes": ["M 100 54 L 100 116", "M 38 116 L 162 116"]},
    {"id": "wg-14", "char": "ㅜ", "roman": "u", "name": "Vokal U", "category": "Vokal", "strokeCount": 2, "tips": "Garis horizontal panjang di atas, lalu garis vertikal pendek turun di tengah.", "strokes": ["M 38 82 L 162 82", "M 100 82 L 100 148"]},
    {"id": "wg-15", "char": "ㅡ", "roman": "eu", "name": "Vokal Eu", "category": "Vokal", "strokeCount": 1, "tips": "Satu garis lurus datar dari kiri ke kanan.", "strokes": ["M 36 100 L 164 100"]},
    {"id": "wg-16", "char": "ㅣ", "roman": "i", "name": "Vokal I", "category": "Vokal", "strokeCount": 1, "tips": "Satu garis lurus tegak dari atas ke bawah.", "strokes": ["M 100 36 L 100 164"]},
]

PARTICLE_PUZZLES_PY = [
    {"id": "prt-1", "tier": "free", "topic": "Partikel Topik (은/는)", "sentenceBefore": "저", "sentenceAfter": " 인도네시아 사람이에요.", "meaningId": "Saya adalah orang Indonesia.", "romanFull": "Jeo-neun in-do-ne-si-a sa-ram-i-e-yo.", "correctOption": "는", "options": ["는", "은", "을", "에"], "explanation": "Kata 저 (saya) berakhir huruf vokal (tanpa batchim), jadi memakai partikel topik -는."},
    {"id": "prt-2", "tier": "free", "topic": "Partikel Objek (을/를)", "sentenceBefore": "오늘 김밥", "sentenceAfter": " 먹어요.", "meaningId": "Hari ini saya makan kimbap.", "romanFull": "O-neul gim-ba-beul meo-geo-yo.", "correctOption": "을", "options": ["을", "를", "가", "에서"], "explanation": "Kata 김밥 berakhir dengan konsonan batchim ㅂ, maka objeknya memakai partikel -을."},
    {"id": "prt-3", "tier": "free", "topic": "Partikel Subjek (이/가)", "sentenceBefore": "친구", "sentenceAfter": " 학교에 가요.", "meaningId": "Teman pergi ke sekolah.", "romanFull": "Chin-gu-ga hak-gyo-e ga-yo.", "correctOption": "가", "options": ["가", "이", "를", "와"], "explanation": "Kata 친구 berakhir vokal ㅜ (tanpa batchim), sehingga partikel subjeknya memakai -가."},
    {"id": "prt-4", "tier": "free", "topic": "Partikel Tujuan (에)", "sentenceBefore": "내일 한국", "sentenceAfter": " 가요.", "meaningId": "Besok saya pergi ke Korea.", "romanFull": "Nae-il han-gu-ge ga-yo.", "correctOption": "에", "options": ["에", "에서", "은", "을"], "explanation": "Kata kerja perpindahan seperti 가요 (pergi) berpasangan dengan -에."},
    {"id": "prt-5", "tier": "free", "topic": "Partikel Lokasi Aktivitas (에서)", "sentenceBefore": "도서관", "sentenceAfter": " 공부해요.", "meaningId": "Saya belajar di perpustakaan.", "romanFull": "Do-seo-gwa-ne-seo gong-bu-hae-yo.", "correctOption": "에서", "options": ["에서", "에", "를", "도"], "explanation": "Menunjukkan tempat berlangsungnya aktivitas (belajar/bekerja) memakai -에서."},
    {"id": "prt-6", "tier": "free", "topic": "Partikel Objek (을/를)", "sentenceBefore": "아침에 커피", "sentenceAfter": " 마셔요.", "meaningId": "Di pagi hari saya minum kopi.", "romanFull": "A-chi-me keo-pi-reul ma-syeo-yo.", "correctOption": "를", "options": ["를", "을", "이", "는"], "explanation": "Kata 커피 berakhir vokal ㅣ tanpa batchim, jadi memakai partikel objek -를."},
    {"id": "prt-7", "tier": "pro", "topic": "Partikel Juga (도)", "sentenceBefore": "저", "sentenceAfter": " 한국 드라마를 좋아해요.", "meaningId": "Saya juga menyukai drama Korea.", "romanFull": "Jeo-do han-guk deu-ra-ma-reul jo-a-hae-yo.", "correctOption": "도", "options": ["도", "만", "을", "에서"], "explanation": "Partikel -도 berarti 'juga' dan menggantikan partikel topik/subjek."},
    {"id": "prt-8", "tier": "pro", "topic": "EPS-TOPIK Kerja (안전)", "sentenceBefore": "작업장", "sentenceAfter": " 안전모를 꼭 쓰세요.", "meaningId": "Di area kerja harap pastikan memakai helm keselamatan.", "romanFull": "Ja-geop-jang-e-seo an-jeon-mo-reul kkok sseu-se-yo.", "correctOption": "에서", "options": ["에서", "에", "은", "과"], "explanation": "Di area kerja terjadi aktivitas bekerja/memakai helm, maka dipakai -에서."},
    {"id": "prt-9", "tier": "pro", "topic": "Penghubung Dan (와/과)", "sentenceBefore": "빵", "sentenceAfter": " 우유를 주세요.", "meaningId": "Tolong beri saya roti dan susu.", "romanFull": "Ppang-gwa u-yu-reul ju-se-yo.", "correctOption": "과", "options": ["과", "와", "를", "가"], "explanation": "Kata 빵 berakhir konsonan penutup (batchim ㅇ), sehingga memakai -과."},
    {"id": "prt-10", "tier": "pro", "topic": "Partikel Subjek (이/가)", "sentenceBefore": "날씨", "sentenceAfter": " 정말 좋아요.", "meaningId": "Cuacanya sangat bagus.", "romanFull": "Nal-ssi-ga jeong-mal jo-a-yo.", "correctOption": "가", "options": ["가", "이", "을", "에"], "explanation": "날씨 berakhir vokal ㅣ, sehingga memakai partikel subjek -가."},
]

BATCHIM_GUIDE_PY = [
    {
        "id": "bg-syllable",
        "title": "Cara Merangkai Blok Suku Kata",
        "badge": "Dasar Membaca",
        "summary": "Setiap blok Hangeul dibaca dari Kiri → Kanan atau Atas → Bawah. Satu blok wajib punya 1 Konsonan Awal + 1 Vokal, dan boleh ditambah 1 Batchim di bawah.",
        "examples": [
            {"korean": "가", "pronounced": "[가]", "roman": "ga", "meaning": "Konsonan ㄱ + Vokal kanan ㅏ", "note": "Vokal tegak (ㅏ, ㅓ, ㅣ) berada di sebelah kanan konsonan."},
            {"korean": "고", "pronounced": "[고]", "roman": "go", "meaning": "Konsonan ㄱ + Vokal bawah ㅗ", "note": "Vokal tidur (ㅗ, ㅜ, ㅡ) berada tepat di bawah konsonan."},
            {"korean": "한글", "pronounced": "[한글]", "roman": "han-geul", "meaning": "Tulisan Hangeul", "note": "ㅎ+ㅏ+ㄴ disusul ㄱ+ㅡ+ㄹ."},
        ],
    },
    {
        "id": "bg-7sounds",
        "title": "7 Bunyi Akhir Batchim (받침)",
        "badge": "Aturan Emas",
        "summary": "Saat diletakkan di posisi paling bawah (Batchim), belasan huruf konsonan mengerucut hanya menjadi 7 bunyi tahanan saja: k, n, t, l, m, p, ng.",
        "examples": [
            {"korean": "책", "pronounced": "[책]", "roman": "chaek", "meaning": "Buku (ㄱ, ㄲ, ㅋ → -k)", "note": "Bunyi k ditahan lembut tanpa letupan udara."},
            {"korean": "꽃", "pronounced": "[꼳]", "roman": "kkot", "meaning": "Bunga (ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅎ → -t)", "note": "Berubah menjadi bunyi -t tertutup saat berdiri sendiri."},
            {"korean": "물", "pronounced": "[물]", "roman": "mul", "meaning": "Air (ㄹ → -l)", "note": "Di posisi akhir selalu dibaca -l jelas."},
            {"korean": "밥", "pronounced": "[밥]", "roman": "bap", "meaning": "Nasi (ㅂ, ㅍ → -p)", "note": "Bibir dikatupkan pada akhir kata."},
        ],
    },
    {
        "id": "bg-liaison",
        "title": "Hukum Penghubungan Bunyi (연음)",
        "badge": "Kunci Fasih",
        "summary": "Jika suku kata berakhir Batchim lalu langsung diikuti vokal kosong (ㅇ), maka bunyi Batchim berpindah mengisi huruf ㅇ tersebut!",
        "examples": [
            {"korean": "한국어", "pronounced": "[한구거]", "roman": "han-gu-geo", "meaning": "Bahasa Korea", "note": "Batchim ㄱ pada 국 mengalir ke 어 → 한-구-거."},
            {"korean": "먹어요", "pronounced": "[머거요]", "roman": "meo-geo-yo", "meaning": "Makan (sopan)", "note": "Batchim ㄱ berpindah mengisi ㅇ menjadi 거."},
            {"korean": "이름이", "pronounced": "[이르미]", "roman": "i-reu-mi", "meaning": "Nama (subjek)", "note": "Batchim ㅁ berpindah ke partikel 이 menjadi 미."},
        ],
    },
    {
        "id": "bg-particles",
        "title": "Cheat-Sheet Partikel & Kesopanan",
        "badge": "Tata Bahasa",
        "summary": "Kalimat Korea mengikuti pola Subjek + Objek + Kata Kerja di akhir kalimat. Pemilihan partikel bergantung pada ada atau tidaknya Batchim.",
        "examples": [
            {"korean": "은 / 는", "pronounced": "Topik", "roman": "Batchim → 은 · Vokal → 는", "meaning": "Penanda topik (저는, 이름은)", "note": "Dipakai memperkenalkan diri atau membandingkan."},
            {"korean": "을 / 를", "pronounced": "Objek", "roman": "Batchim → 을 · Vokal → 를", "meaning": "Penanda objek kata kerja (밥을, 커피를)", "note": "Menempel di belakang benda yang dikenai tindakan."},
            {"korean": "-아요 / -어요", "pronounced": "Sopan", "roman": "ㅏ/ㅗ → 아요 · Lainnya → 어요", "meaning": "Akhiran kalimat sopan sehari-hari", "note": "Paling sering dipakai dalam percakapan & K-Drama."},
        ],
    },
]

# ==============================================================================
# 1B. AUTENTIKASI PELAJAR & SINKRONISASI PROGRES (SCRYPT + BEARER TOKEN)
# ==============================================================================

PLAN_PRICES = {
    "monthly": {"label": "Hangeul.me Pro Bulanan", "amount": 49000},
    "annual": {"label": "Hangeul.me Pro Tahunan", "amount": 399000},
}

STORE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".hangeul_py_store.json")


def _default_auth_store():
    return {
        "users": [],
        "transactions": [],
    }


def _load_auth_store():
    if os.path.exists(STORE_FILE):
        try:
            with open(STORE_FILE, "r", encoding="utf-8") as fp:
                data = json.load(fp)
                if isinstance(data, dict) and "users" in data and "transactions" in data:
                    return data
        except Exception:
            pass
    return _default_auth_store()


AUTH_STORE = _load_auth_store()


def _save_auth_store():
    try:
        with open(STORE_FILE, "w", encoding="utf-8") as fp:
            json.dump(AUTH_STORE, fp, ensure_ascii=False, indent=2)
    except Exception:
        pass


def _hash_password(password):
    salt = secrets.token_hex(16)
    dk = hashlib.scrypt(password.encode("utf-8"), salt=salt.encode("utf-8"), n=16384, r=8, p=1, dklen=64)
    return f"{salt}:{dk.hex()}"


def _verify_password(password, stored_hash):
    if not stored_hash or ":" not in stored_hash:
        return False
    salt, hex_dk = stored_hash.split(":", 1)
    try:
        expected = bytes.fromhex(hex_dk)
        dk = hashlib.scrypt(password.encode("utf-8"), salt=salt.encode("utf-8"), n=16384, r=8, p=1, dklen=64)
        return hmac.compare_digest(dk, expected)
    except Exception:
        return False


def _sign_token(sub, email, name):
    exp = int(datetime.datetime.now(datetime.timezone.utc).timestamp()) + 86400
    payload = {
        "sub": sub,
        "email": email,
        "name": name,
        "jti": secrets.token_hex(12),
        "exp": exp,
    }
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    b64 = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")
    sig = hmac.new(SESSION_SECRET, b64.encode("ascii"), hashlib.sha256).hexdigest()
    return f"{b64}.{sig}"


def _verify_token(token):
    if not token or "." not in token:
        return None
    b64, sig = token.split(".", 1)
    expected_sig = hmac.new(SESSION_SECRET, b64.encode("ascii"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected_sig):
        return None
    try:
        pad = "=" * ((4 - len(b64) % 4) % 4)
        payload = json.loads(base64.urlsafe_b64decode(b64 + pad).decode("utf-8"))
        now_ts = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
        if payload.get("exp", 0) < now_ts or payload.get("jti") in REVOKED_TOKENS:
            return None
        return payload
    except Exception:
        return None


def _sanitize_progress(raw, is_pro=False):
    raw = raw if isinstance(raw, dict) else {}
    xp = max(0, int(raw.get("xp", 0) or 0))
    best_streak = max(0, int(raw.get("bestStreak", 0) or 0))
    daily_streak = max(0, int(raw.get("dailyStreak", 0) or 0))
    freeze = max(2 if is_pro else 0, int(raw.get("streakFreezeCount", 0) or 0))
    last_date = raw.get("lastActiveDate") if isinstance(raw.get("lastActiveDate"), str) else None
    favs = [str(x) for x in raw.get("favorites", []) if isinstance(x, str)][:500]
    mastery = raw.get("moduleMastery") if isinstance(raw.get("moduleMastery"), dict) else {}
    return {
        "xp": xp,
        "bestStreak": best_streak,
        "dailyStreak": daily_streak,
        "lastActiveDate": last_date,
        "streakFreezeCount": freeze,
        "favorites": favs,
        "moduleMastery": {str(k): int(v) for k, v in mastery.items() if isinstance(v, (int, float))},
    }


def _sanitize_user(u):
    is_pro = bool(u.get("isPro", False))
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "isPro": is_pro,
        "planCycle": u["planCycle"],
        "createdAt": u["createdAt"],
        "progress": _sanitize_progress(u.get("progress"), is_pro),
    }


def build_leaderboard():
    entries = []
    for u in AUTH_STORE["users"]:
        p = _sanitize_progress(u.get("progress"), bool(u.get("isPro")))
        entries.append({
            "id": u["id"],
            "name": u["name"],
            "xp": p["xp"],
            "dailyStreak": p["dailyStreak"],
            "bestStreak": p["bestStreak"],
            "isPro": bool(u.get("isPro")),
        })
    entries.sort(key=lambda x: (-x["xp"], -x["dailyStreak"], -x["bestStreak"]))
    for i, e in enumerate(entries, start=1):
        e["rank"] = i
        e["level"] = (e["xp"] // 50) + 1
    return entries[:30]


# ==============================================================================
# 2. WEBSITE HTML TEMPLATE (DUOLINGO x iOS UI, DISAJIKAN OLEH PYTHON)
# ==============================================================================

def render_website_html():
    all_catalog = ALL_CARDS + KDRAMA_CARDS + WORK_CARDS
    bootstrap_json = json.dumps({
        "modules": CURRICULUM_MODULES,
        "allCards": all_catalog,
        "syllablePuzzles": SYLLABLE_PUZZLES_PY,
        "sentencePuzzles": SENTENCE_PUZZLES_PY,
        "writingGlyphs": WRITING_GLYPHS_PY,
        "particlePuzzles": PARTICLE_PUZZLES_PY,
        "batchimGuide": BATCHIM_GUIDE_PY,
    }, ensure_ascii=False)

    return f"""<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Hangeul.me — Website Belajar Bahasa Korea (Python Edition)</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+KR:wght@500;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
<style>
  :root {{
    --bg: #eaf2ff;
    --bg-gradient:
      radial-gradient(1200px 700px at 8% -5%, rgba(56, 189, 248, 0.24), transparent 60%),
      radial-gradient(960px 640px at 94% 8%, rgba(52, 211, 153, 0.22), transparent 58%),
      radial-gradient(880px 640px at 52% 96%, rgba(167, 139, 250, 0.20), transparent 60%),
      linear-gradient(160deg, #eaf2ff 0%, #eff7f4 48%, #f3efff 100%);
    --surface: rgba(255, 255, 255, 0.62);
    --surface-strong: rgba(255, 255, 255, 0.78);
    --surface-alt: rgba(255, 255, 255, 0.45);
    --surface-soft: rgba(255, 255, 255, 0.56);
    --text: #0f172a; --muted: #475569;
    --border: rgba(255, 255, 255, 0.78);
    --rim: inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 14px 36px -14px rgba(15, 23, 42, 0.14);
    --rose: #FF3B30; --rose-hover: #DC2626;
    --blue: #0A84FF; --blue-hover: #0070E0;
    --emerald: #22C55E; --amber: #FF9F0A; --violet: #AF52DE;
  }}
  html.dark {{
    --bg: #070b14;
    --bg-gradient:
      radial-gradient(1200px 720px at 10% -6%, rgba(14, 165, 233, 0.24), transparent 58%),
      radial-gradient(960px 640px at 92% 10%, rgba(16, 185, 129, 0.19), transparent 58%),
      radial-gradient(900px 640px at 50% 98%, rgba(139, 92, 246, 0.20), transparent 60%),
      linear-gradient(160deg, #070b14 0%, #0b1324 52%, #110f22 100%);
    --surface: rgba(15, 23, 42, 0.56);
    --surface-strong: rgba(15, 23, 42, 0.78);
    --surface-alt: rgba(255, 255, 255, 0.06);
    --surface-soft: rgba(255, 255, 255, 0.08);
    --text: #F8FAFC; --muted: #94A3B8;
    --border: rgba(255, 255, 255, 0.14);
    --rim: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 18px 44px -16px rgba(0, 0, 0, 0.55);
    --rose: #FF453A; --rose-hover: #FF3B30;
    --blue: #0A84FF; --blue-hover: #38BDF8;
    --emerald: #30D158; --amber: #FFD60A; --violet: #BF5AF2;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; background-color: var(--bg); background-image: var(--bg-gradient);
    background-attachment: fixed; color: var(--text);
    font-family: 'DM Sans', 'Noto Sans KR', system-ui, sans-serif;
    line-height: 1.5; min-height: 100vh; display: flex; flex-direction: column;
    transition: background-color .2s, color .2s;
  }}
  h1, h2, h3, h4, .display {{ font-family: 'Plus Jakarta Sans', 'Noto Sans KR', system-ui, sans-serif; margin: 0; }}
  .mono {{ font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }}
  .num {{ font-variant-numeric: tabular-nums; }}
  button, input, select {{ font-family: inherit; }}
  button {{ cursor: pointer; }}
  .wrap {{ max-width: 1120px; margin: 0 auto; padding: 0 20px; width: 100%; }}

  /* Frosted iOS Liquid Glass Top Bar */
  header {{
    position: sticky; top: 0; z-index: 40;
    background: var(--surface);
    backdrop-filter: blur(26px) saturate(180%);
    -webkit-backdrop-filter: blur(26px) saturate(180%);
    border-bottom: 1px solid var(--border);
  }}
  .topbar {{ height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }}
  .brand {{ display: inline-flex; align-items: center; gap: 10px; background: none; border: none; color: var(--text); font-size: 18px; font-weight: 800; letter-spacing: -0.02em; padding: 0; white-space: nowrap; }}
  .brand-badge {{ width: 34px; height: 34px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #22C55E, #16A34A); color: #fff; font-weight: 800; border-bottom: 3px solid #15803D; box-shadow: 0 6px 16px rgba(34, 197, 94, 0.28); }}
  nav.desk {{ display: flex; gap: 20px; overflow-x: auto; }}
  .nav-btn {{
    background: none; border: none; border-bottom: 2.5px solid transparent;
    padding: 8px 0; font-size: 14px; font-weight: 600; color: var(--muted); white-space: nowrap; flex-shrink: 0;
  }}
  .nav-btn.active {{ color: var(--text); border-bottom-color: var(--emerald); font-weight: 800; }}
  .cta-top {{
    border: none; border-bottom: 3px solid #1D4ED8; border-radius: 14px; padding: 8px 16px; font-size: 12px; font-weight: 800;
    background: var(--blue); color: #fff; white-space: nowrap;
  }}
  .cta-top.pro {{ background: var(--emerald); border-bottom-color: #15803D; }}

  /* Frosted Subbar */
  .subbar {{
    background: var(--surface-alt);
    backdrop-filter: blur(20px) saturate(165%);
    -webkit-backdrop-filter: blur(20px) saturate(165%);
    border-bottom: 1px solid var(--border); font-size: 12px; color: var(--muted);
  }}
  .subbar-in {{ display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 20px; }}
  .stats-line {{ display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }}
  .stats-line strong {{ color: var(--text); }}
  .sub-controls {{ display: flex; align-items: center; gap: 8px; }}
  .seg {{
    display: inline-flex; background: var(--surface-alt); padding: 3px; border-radius: 14px;
    border: 1px solid var(--border); backdrop-filter: blur(16px);
  }}
  .seg button {{ border: none; background: transparent; color: var(--muted); font-size: 12px; font-weight: 700; padding: 5px 11px; border-radius: 10px; white-space: nowrap; }}
  .seg button.active {{ background: var(--surface-strong); color: var(--text); box-shadow: 0 2px 8px rgba(15,23,42,.1); }}
  .icon-btn {{
    width: 34px; height: 34px; border-radius: 12px; border: 1px solid var(--border);
    background: var(--surface-soft); color: var(--text); backdrop-filter: blur(16px);
  }}

  /* Main Layout & iOS Glass Cards */
  main {{ flex: 1; padding: 30px 0 48px; }}
  .card {{
    background: var(--surface); border: 1px solid var(--border); border-radius: 26px; padding: 24px;
    backdrop-filter: blur(24px) saturate(185%);
    -webkit-backdrop-filter: blur(24px) saturate(185%);
    box-shadow: var(--rim);
  }}
  .hero {{ display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 24px; align-items: stretch; }}
  .hero h1 {{ font-size: clamp(26px, 3.6vw, 38px); line-height: 1.15; margin-top: 10px; }}
  .hero p {{ color: var(--muted); font-size: 15px; margin: 14px 0 0; max-width: 60ch; }}
  .btn-row {{ display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }}
  .btn-primary {{ border: none; border-bottom: 4px solid #15803D; border-radius: 16px; padding: 12px 20px; background: var(--emerald); color: #fff; font-size: 14px; font-weight: 800; transition: transform .1s; box-shadow: 0 8px 20px -6px rgba(34, 197, 94, 0.45); }}
  .btn-primary:hover {{ filter: brightness(1.04); }}
  .btn-primary:active {{ transform: translateY(2px); }}
  .btn-sec {{
    border: 1.5px solid var(--border); border-bottom: 4px solid var(--border); border-radius: 16px; padding: 11px 18px;
    background: var(--surface-strong); color: var(--text); font-size: 14px; font-weight: 700; transition: transform .1s;
    backdrop-filter: blur(16px);
  }}
  .btn-sec:active {{ transform: translateY(2px); }}
  .hero-side {{
    display: flex; flex-direction: column; justify-content: space-between;
    background: linear-gradient(155deg, rgba(239, 246, 255, 0.72), rgba(240, 253, 244, 0.68) 58%, rgba(255, 251, 235, 0.72));
    color: #0f172a; border: 1px solid var(--border); border-radius: 26px; padding: 24px;
    backdrop-filter: blur(22px) saturate(175%); -webkit-backdrop-filter: blur(22px) saturate(175%);
    box-shadow: var(--rim);
  }}
  html.dark .hero-side {{
    background: linear-gradient(155deg, rgba(30, 41, 59, 0.56), rgba(15, 23, 42, 0.64));
    color: #fff;
  }}
  .sound-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; margin-top: 14px; }}
  .sound-tile {{
    border: 1.5px solid var(--border); border-bottom: 4px solid var(--border);
    background: var(--surface-soft); color: var(--text); border-radius: 16px; padding: 10px 6px; text-align: center;
    backdrop-filter: blur(14px);
  }}
  .sound-tile.active {{ background: var(--blue); border-color: #1D4ED8; color: #fff; }}
  .quiz-opt {{
    border: 1.5px solid var(--border); border-bottom: 4px solid var(--border);
    background: var(--surface-soft); color: var(--text); border-radius: 16px; padding: 14px; text-align: left; font-weight: 700; font-size: 13px;
    backdrop-filter: blur(14px);
  }}
  .quiz-opt.ok {{ background: rgba(220, 252, 231, 0.85); border-color: var(--emerald); color: #14532D; }}
  .quiz-opt.bad {{ background: rgba(254, 226, 226, 0.85); border-color: var(--rose); color: #7F1D1D; }}
  .jamo-btn {{
    border: 1.5px solid var(--border); border-bottom: 4px solid var(--border);
    background: var(--surface-soft); color: var(--text); border-radius: 14px; padding: 8px 10px; min-width: 48px; text-align: center; font-weight: 800;
    backdrop-filter: blur(12px);
  }}
  .jamo-btn.active {{ background: var(--violet); border-color: #7E22CE; color: #fff; }}

  .sec-head {{ display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 14px; margin: 34px 0 22px; }}
  .grid-2 {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }}
  .grid-3 {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }}
  .mod-meta {{ display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }}
  .mod-actions {{ margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; align-items: center; }}

  /* Arena */
  .arena-grid {{ display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 24px; align-items: start; }}
  .opt-pair {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 420px; margin: 0 auto; }}
  .opt-btn {{ border: none; border-bottom: 4px solid rgba(0,0,0,0.22); border-radius: 16px; padding: 14px; font-size: 15px; font-weight: 800; color: #fff; }}
  .opt-l {{ background: var(--rose); }}
  .opt-r {{ background: var(--blue); }}
  .flashcard {{
    width: 100%; max-width: 300px; height: 270px; margin: 22px auto;
    border-radius: 26px; background: var(--surface-strong); border: 1.5px solid var(--border);
    backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
    box-shadow: var(--rim);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 20px; user-select: none; transition: transform .2s;
  }}
  .flashcard.weak {{ border-color: var(--amber); }}
  .fc-char {{ font-family: 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif; font-size: 68px; font-weight: 800; line-height: 1.1; margin: 12px 0; }}

  /* Writing Canvas */
  .canvas-stage {{
    position: relative; width: 280px; height: 280px; margin: 14px auto;
    border-radius: 24px; border: 2px solid var(--border); background: var(--surface-strong);
    backdrop-filter: blur(18px); overflow: hidden; box-shadow: var(--rim);
  }}
  .canvas-stage svg, .canvas-stage canvas {{
    position: absolute; inset: 0; width: 100%; height: 100%;
  }}
  .canvas-stage canvas {{ touch-action: none; cursor: crosshair; }}

  /* Dictionary */
  .dict-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-top: 12px; }}
  .dict-item {{
    position: relative; text-align: left; background: var(--surface-soft); border: 1.5px solid var(--border);
    border-radius: 20px; padding: 14px; color: var(--text); display: flex; flex-direction: column; justify-content: space-between;
    backdrop-filter: blur(18px) saturate(165%); -webkit-backdrop-filter: blur(18px) saturate(165%);
    box-shadow: var(--rim);
  }}
  .dict-item:hover {{ border-color: var(--blue); }}
  .fav-btn {{ border: 1px solid var(--border); background: var(--surface-soft); color: var(--muted); border-radius: 10px; width: 30px; height: 30px; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; }}
  .fav-btn.on {{ background: #FEF3C7; border-color: var(--amber); color: #D97706; }}
  .chips {{ display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; }}

  /* Table */
  table.cmp {{ width: 100%; border-collapse: collapse; font-size: 14px; }}
  table.cmp th, table.cmp td {{ padding: 12px 16px; border-bottom: 1px solid var(--border); text-align: left; }}
  table.cmp th {{ font-size: 12px; color: var(--muted); background: var(--surface-alt); }}

  /* Modal & Auth */
  .modal-bg {{ position: fixed; inset: 0; background: rgba(15,23,42,.48); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: none; align-items: center; justify-content: center; padding: 16px; z-index: 80; }}
  .modal-bg.open {{ display: flex; }}
  .modal-box {{
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
    background: var(--surface-strong); border: 1px solid var(--border); border-radius: 28px; padding: 28px;
    backdrop-filter: blur(28px) saturate(190%); -webkit-backdrop-filter: blur(28px) saturate(190%);
    box-shadow: var(--rim);
  }}
  .inp {{ width: 100%; margin-top: 6px; padding: 10px 14px; border-radius: 14px; border: 1px solid var(--border); background: var(--surface-alt); color: var(--text); font-size: 14px; backdrop-filter: blur(12px); }}
  .alert-err {{ margin-top: 12px; padding: 10px 12px; border-radius: 12px; border: 1px solid #fecdd3; background: #fff1f2; color: #be123c; font-size: 12px; font-weight: 600; }}

  footer {{
    border-top: 1px solid var(--border); background: var(--surface);
    backdrop-filter: blur(20px) saturate(165%); -webkit-backdrop-filter: blur(20px) saturate(165%);
    padding: 20px 0; font-size: 12px; color: var(--muted);
  }}
  .foot-in {{ display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }}
  .hidden {{ display: none !important; }}

  @media (max-width: 820px) {{
    .hero, .arena-grid, .grid-2, .grid-3 {{ grid-template-columns: 1fr; }}
    nav.desk {{ max-width: 48vw; gap: 12px; }}
  }}
</style>
</head>
<body>
<header>
  <div class="wrap topbar">
    <button class="brand" onclick="setTab('learn')">
      <span class="brand-badge">한</span>
      <span>Hangeul<span style="color:var(--emerald)">.me</span></span>
    </button>
    <nav class="desk" aria-label="Navigasi utama">
      <button class="nav-btn active" data-tab="learn" onclick="setTab('learn')">Belajar</button>
      <button class="nav-btn" data-tab="arena" onclick="setTab('arena')">Latihan Seru</button>
      <button class="nav-btn" data-tab="dictionary" onclick="setTab('dictionary')">Kamus</button>
      <button class="nav-btn" data-tab="leaderboard" onclick="setTab('leaderboard')">Peringkat</button>
      <button class="nav-btn" data-tab="business" onclick="setTab('business')">Bisnis &amp; Pro</button>
    </nav>
    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
      <button id="authTopBtn" class="btn-sec" style="padding:8px 14px;font-size:12px;border-radius:14px" onclick="handleAuthBtn()">Masuk</button>
      <button id="topCta" class="cta-top" onclick="handleTopCta()">Upgrade Pro</button>
    </div>
  </div>
</header>

<div class="subbar">
  <div class="wrap subbar-in">
    <div class="stats-line num">
      <span>Lv.<strong id="hudLv">1</strong></span>
      <span>XP: <strong id="hudXp">0</strong></span>
      <span style="color:var(--amber)">Streak: <strong id="hudDailyStreak">0h</strong></span>
      <span style="color:var(--blue)">Freeze: <strong id="hudFreeze">0</strong></span>
      <span>Rekor Combo: <strong id="hudBest">0</strong></span>
      <span>Server: <strong>Python 3</strong></span>
    </div>
    <div class="sub-controls">
      <div id="guestTierSeg" class="seg" role="group" aria-label="Pratinjau paket akun">
        <button id="btnTierFree" class="active" onclick="setTier(false)">Akun Gratis</button>
        <button id="btnTierPro" onclick="setTier(true)">Mode Pro</button>
      </div>
      <span id="loggedStatusBadge" class="hidden" style="font-weight:700;color:var(--text)"></span>
      <button class="icon-btn" id="themeToggle" onclick="toggleTheme()" title="Ubah tema">☾</button>
    </div>
  </div>
</div>

<main class="wrap">
  <!-- TAB 1: BELAJAR -->
  <section id="tab-learn">
    <div class="hero">
      <div class="card">
        <div>
          <div style="font-size:12px;font-weight:800;color:var(--emerald)">KURIKULUM INTERAKTIF · GAYA iOS &amp; DUOLINGO (PYTHON 3)</div>
          <h1>Baca, Tulis Hangeul, &amp; Kuasai Kosakata Korea!</h1>
          <p>Belajar terstruktur mulai dari 40 huruf interaktif, Kanvas Menulis Hangeul, Lab Rakit Suku Kata, Isian Partikel Tata Bahasa, hingga kamus 500+ entri berfitur Favorit &amp; Contoh Kalimat.</p>
        </div>
        <div class="btn-row">
          <button class="btn-primary" onclick="startQuickArena('quiz')">Mulai Latihan Seru</button>
          <button class="btn-sec" style="background:var(--blue);color:#fff;border-color:#1D4ED8" onclick="startQuickArena('writing')">Kanvas Menulis</button>
          <button class="btn-sec" onclick="openBatchimModal()">Panduan Batchim</button>
          <button class="btn-sec" onclick="setTab('dictionary')">Buka Kamus</button>
        </div>
      </div>
      <div class="hero-side">
        <div>
          <div style="font-size:12px;color:var(--blue);font-weight:800">한국어 공부 · Level &amp; Misi Harian</div>
          <h2 id="heroLevelTitle" style="font-size:22px;margin-top:8px">Lv.1 Pemula Hangeul</h2>
          <p style="font-size:13px;opacity:.85;margin-top:8px">Selesaikan latihan untuk naik level, jaga streak harianmu, dan simpan progres ke server Python 3.</p>
          <div id="questsBox" style="margin-top:14px;display:flex;flex-direction:column;gap:8px;font-size:12px"></div>
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--blue);margin-top:16px">7 Mode Latihan · Panduan Batchim · Peringkat Mingguan</div>
      </div>
    </div>

    <!-- Papan Alfabet Interaktif -->
    <div class="card" style="margin-top:24px">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
        <div>
          <div style="font-size:12px;font-weight:800;color:var(--blue)">PAPAN BUNYI 40 HURUF HANGEUL INTERAKTIF</div>
          <h2 style="font-size:20px;margin-top:4px">Klik Huruf Mana Saja untuk Mendengar Suaranya</h2>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
          <button class="btn-sec" style="padding:7px 12px;font-size:12px" onclick="openBatchimModal()">Panduan Pola Baca &amp; Batchim</button>
          <div class="seg">
            <button class="active" onclick="filterSound('Konsonan Dasar', this)">Konsonan Dasar</button>
            <button onclick="filterSound('Vokal Dasar', this)">Vokal Dasar</button>
            <button onclick="filterSound('Semua', this)">Semua (40)</button>
          </div>
        </div>
      </div>
      <div id="soundSpotlight" style="margin-top:14px;padding:12px 16px;border-radius:16px;background:var(--surface-soft);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div><strong id="spotChar" style="font-size:28px;margin-right:10px">ㄱ</strong> <span id="spotInfo" style="font-size:13px;font-weight:700">g / k · Konsonan Dasar</span></div>
        <button class="btn-sec" style="padding:7px 14px;font-size:12px;background:var(--blue);color:#fff;border-color:#1D4ED8" onclick="speakCur($('spotChar').textContent)">Putar Suara</button>
      </div>
      <div id="soundGrid" class="sound-grid"></div>
    </div>

    <div class="sec-head">
      <div>
        <h2>Jalur Kurikulum Tematik</h2>
        <div style="font-size:13px;color:var(--muted)">Pilih modul tematik untuk berlatih langsung di Studio Latihan interaktif.</div>
      </div>
      <div class="seg">
        <button class="active" onclick="filterMods('all', this)">Semua (6)</button>
        <button onclick="filterMods('free', this)">Gratis (2)</button>
        <button onclick="filterMods('pro', this)">Eksklusif Pro (4)</button>
      </div>
    </div>
    <div id="modulesGrid" class="grid-2"></div>
  </section>

  <!-- TAB 2: STUDIO LATIHAN SERU (7 MODE INTERAKTIF) -->
  <section id="tab-arena" class="hidden">
    <div class="card" style="margin-bottom:22px">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
        <div>
          <div style="font-size:12px;font-weight:800;color:var(--emerald)">STUDIO LATIHAN INTERAKTIF · 7 JENIS PERMAINAN</div>
          <h2 style="margin-top:4px">Pilih Mode Latihan Favoritmu</h2>
        </div>
        <div class="seg" style="overflow-x:auto">
          <button class="active" onclick="setArenaMode('letters', this)">Huruf</button>
          <button onclick="setArenaMode('words', this)">Kata Dasar</button>
          <button onclick="setArenaMode('weak', this)">Kartu Lemah</button>
          <button onclick="setArenaMode('favorites', this)">Favorit</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:10px;margin-top:16px">
        <button class="quiz-opt" style="background:var(--amber);color:#fff;border-color:#B45309" id="modeBtn-quiz" onclick="setStudioMode('quiz')">1. Kuis Kilat</button>
        <button class="quiz-opt" id="modeBtn-writing" onclick="setStudioMode('writing')">2. Tulis Hangeul</button>
        <button class="quiz-opt" id="modeBtn-builder" onclick="setStudioMode('builder')">3. Rakit Hangeul</button>
        <button class="quiz-opt" id="modeBtn-particles" onclick="setStudioMode('particles')">4. Isian Partikel</button>
        <button class="quiz-opt" id="modeBtn-match" onclick="setStudioMode('match')">5. Cocokkan</button>
        <button class="quiz-opt" id="modeBtn-sentence" onclick="setStudioMode('sentence')">6. Susun Kalimat</button>
        <button class="quiz-opt" id="modeBtn-swipe" onclick="setStudioMode('swipe')">7. Kartu Geser</button>
      </div>
    </div>

    <div class="arena-grid">
      <div>
        <!-- Mode 1: Kuis Kilat -->
        <div id="pane-quiz" class="card">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="color:var(--amber);font-size:12px">KUIS PILIHAN GANDA &amp; AUDIO</strong>
            <button class="btn-sec" style="padding:6px 12px;font-size:12px" onclick="speakCur(quizCur.card.h)">Putar Audio</button>
          </div>
          <div style="text-align:center;margin:20px 0">
            <div id="quizPromptChar" class="fc-char" style="margin:6px 0">ㄱ</div>
            <div id="quizPromptHint" style="font-size:12px;color:var(--muted)">Pilih arti dan bacaan yang benar:</div>
          </div>
          <div id="quizOptionsBox" class="grid-2" style="gap:12px"></div>
          <div id="quizFeedback" style="margin-top:14px;font-size:13px;font-weight:700"></div>
          <button id="quizNextBtn" class="btn-primary hidden" style="margin-top:12px" onclick="renderQuiz()">Soal Berikutnya →</button>
        </div>

        <!-- Mode 2: Kanvas Tulis Hangeul -->
        <div id="pane-writing" class="card hidden">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
            <div>
              <strong style="color:var(--rose);font-size:12px">KANVAS MENULIS HANGEUL</strong>
              <div id="wriTitle" style="font-size:17px;font-weight:800;margin-top:2px">ㄱ · Giyeok (g / k)</div>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn-sec" style="padding:6px 12px;font-size:12px" onclick="prevWriteGlyph()">←</button>
              <button class="btn-sec" style="padding:6px 12px;font-size:12px" onclick="nextWriteGlyph()">→</button>
              <button class="btn-sec" style="padding:6px 12px;font-size:12px" onclick="speakCur(currentGlyph().char)">Audio</button>
            </div>
          </div>
          <div id="wriTips" style="font-size:12px;color:var(--muted);margin-top:8px"></div>
          <div class="canvas-stage">
            <svg viewBox="0 0 200 200" style="pointer-events:none">
              <line x1="100" y1="8" x2="100" y2="192" stroke="#CBD5E1" stroke-dasharray="4 4" stroke-width="1" />
              <line x1="8" y1="100" x2="192" y2="100" stroke="#CBD5E1" stroke-dasharray="4 4" stroke-width="1" />
              <g id="wriGuideGroup"></g>
            </svg>
            <canvas id="writeCanvas" width="280" height="280"></canvas>
          </div>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px">
            <button id="wriGuideBtn" class="btn-sec" style="padding:8px 14px;font-size:12px" onclick="toggleWriteGuide()">Sembunyikan Panduan</button>
            <button class="btn-sec" style="padding:8px 14px;font-size:12px" onclick="undoWriteStroke()">Urungkan</button>
            <button class="btn-sec" style="padding:8px 14px;font-size:12px" onclick="clearWriteCanvas()">Bersihkan</button>
            <button class="btn-primary" style="padding:8px 16px;font-size:12px" onclick="evaluateWriteCanvas()">Periksa Tulisan</button>
          </div>
          <div id="wriFeedback" style="margin-top:12px;text-align:center;font-size:13px;font-weight:700"></div>
        </div>

        <!-- Mode 3: Rakit Hangeul -->
        <div id="pane-builder" class="card hidden">
          <div style="font-size:12px;font-weight:800;color:var(--violet)">LAB RAKIT SUKU KATA HANGEUL</div>
          <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin:16px 0;padding:16px;border-radius:18px;background:var(--surface-soft);border:1px solid var(--border)">
            <div id="bldPreview" style="width:92px;height:92px;border-radius:18px;background:var(--surface);border:2px solid var(--violet);display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:800">한</div>
            <div style="flex:1;min-width:200px">
              <div style="font-size:12px;color:var(--muted);font-weight:700">Target Misi Rakit:</div>
              <div id="bldTargetTitle" style="font-size:22px;font-weight:800">한 ("han") · Korea / Satu</div>
              <div id="bldTargetHint" style="font-size:12px;color:var(--muted);margin-top:4px">Petunjuk: ㅎ + ㅏ + batchim ㄴ</div>
              <div style="display:flex;gap:8px;margin-top:12px">
                <button class="btn-primary" style="padding:8px 14px;font-size:12px;background:var(--violet);border-color:#7E22CE" onclick="checkBuilder()">Periksa Susunan</button>
                <button class="btn-sec" style="padding:8px 14px;font-size:12px" onclick="nextBuilderTarget()">Target Berikutnya</button>
                <button class="btn-sec" style="padding:8px 12px;font-size:12px" onclick="speakCur($('bldPreview').textContent)">Audio</button>
              </div>
            </div>
          </div>
          <div id="bldFeedback" style="margin-bottom:12px;font-size:13px;font-weight:700"></div>
          <div style="font-size:12px;font-weight:700;margin-bottom:6px">1. Konsonan Awal (Choseong)</div>
          <div id="bldRackL" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>
          <div style="font-size:12px;font-weight:700;margin-bottom:6px">2. Vokal Inti (Jungseong)</div>
          <div id="bldRackV" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>
          <div style="font-size:12px;font-weight:700;margin-bottom:6px">3. Batchim Akhir (Opsional)</div>
          <div id="bldRackT" style="display:flex;flex-wrap:wrap;gap:6px"></div>
        </div>

        <!-- Mode 4: Isian Partikel -->
        <div id="pane-particles" class="card hidden">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="color:var(--blue);font-size:12px">ISIAN PARTIKEL &amp; TATA BAHASA</strong>
            <button class="btn-sec" style="padding:6px 12px;font-size:12px" onclick="nextParticle()">Soal Berikutnya →</button>
          </div>
          <div id="prtPromptBox" style="margin:16px 0;padding:18px;border-radius:18px;background:var(--surface-soft);border:1px solid var(--border)"></div>
          <div id="prtOptionsBox" class="grid-2" style="gap:10px"></div>
          <div id="prtFeedback" style="margin-top:14px;font-size:13px;font-weight:700"></div>
        </div>

        <!-- Mode 5: Cocokkan Pasangan -->
        <div id="pane-match" class="card hidden">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div><strong style="color:var(--emerald);font-size:12px">COCOKKAN PASANGAN</strong><div style="font-size:13px;font-weight:700">Ketuk 1 Hangeul (Kiri) + 1 Arti (Kanan)</div></div>
            <button class="btn-sec" style="padding:7px 12px;font-size:12px" onclick="startMatchRound()">Acak Baru</button>
          </div>
          <div id="matchFeedback" style="margin-bottom:10px;font-size:13px;font-weight:700"></div>
          <div class="grid-2" style="gap:14px">
            <div id="matchLeftCol" style="display:flex;flex-direction:column;gap:8px"></div>
            <div id="matchRightCol" style="display:flex;flex-direction:column;gap:8px"></div>
          </div>
        </div>

        <!-- Mode 6: Susun Kalimat -->
        <div id="pane-sentence" class="card hidden">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="color:var(--blue);font-size:12px">SUSUN KALIMAT KOREA</strong>
            <button class="btn-sec" style="padding:6px 12px;font-size:12px" onclick="nextSentence()">Kalimat Lain →</button>
          </div>
          <div id="sentPromptBox" style="margin:14px 0;padding:14px;border-radius:16px;background:var(--surface-soft);border:1px solid var(--border)"></div>
          <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:6px">Kalimat Anda:</div>
          <div id="sentTray" style="min-height:54px;padding:10px;border:2px dashed var(--blue);border-radius:16px;display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px"></div>
          <div id="sentBank" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px"></div>
          <div style="display:flex;gap:8px">
            <button class="btn-primary" style="padding:9px 16px;font-size:12px" onclick="checkSentence()">Periksa Kalimat</button>
            <button class="btn-sec" style="padding:9px 14px;font-size:12px" onclick="resetSentence()">Ulangi</button>
          </div>
          <div id="sentFeedback" style="margin-top:12px;font-size:13px;font-weight:700"></div>
        </div>

        <!-- Mode 7: Kartu Geser 60d -->
        <div id="pane-swipe" class="card hidden" style="text-align:center">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <strong style="color:var(--rose);font-size:12px">KARTU GESER &amp; TANTANGAN 60 DETIK</strong>
            <button id="chalToggleBtn" class="btn-primary" style="padding:7px 14px;font-size:12px;background:var(--blue);border-color:#1D4ED8" onclick="toggleChallenge()">Tantangan 60 Detik</button>
          </div>
          <div class="opt-pair">
            <button id="optL" class="opt-btn opt-l" onclick="answerCard(true)">← -</button>
            <button id="optR" class="opt-btn opt-r" onclick="answerCard(false)">- →</button>
          </div>
          <div id="flashcard" class="flashcard">
            <div id="fcType" style="font-size:12px;color:var(--muted)">Konsonan</div>
            <div id="fcChar" class="fc-char">ㄱ</div>
            <button class="btn-sec" style="padding:7px 14px;font-size:12px" onclick="speakCur()">Dengar (Spasi)</button>
          </div>
          <div id="arenaFeedback" style="min-height:24px;font-size:14px;font-weight:700"></div>
        </div>
      </div>

      <div class="card">
        <h3>Statistik Sesi Berjalan</h3>
        <div class="grid-2 num" style="margin-top:16px;gap:16px">
          <div><div style="font-size:12px;color:var(--muted)">Skor Sesi</div><div id="sesScore" style="font-size:26px;font-weight:800">0</div></div>
          <div><div style="font-size:12px;color:var(--muted)">Combo &amp; Pengali</div><div id="sesCombo" style="font-size:26px;font-weight:800;color:var(--blue)">0 (x1)</div></div>
          <div><div style="font-size:12px;color:var(--muted)">Akurasi</div><div id="sesAcc" style="font-size:20px;font-weight:700">0%</div></div>
          <div><div style="font-size:12px;color:var(--muted)">Timer Tantangan</div><div id="sesTimer" style="font-size:20px;font-weight:700">-</div></div>
        </div>
      </div>
    </div>
  </section>

  <!-- TAB 3: KAMUS -->
  <section id="tab-dictionary" class="hidden">
    <div class="sec-head" style="margin-top:0">
      <div>
        <h2>Kamus &amp; Referensi Hangeul ({len(all_catalog)} Entri)</h2>
        <div style="font-size:13px;color:var(--muted)">Ketuk kartu untuk melihat contoh kalimat &amp; audio Korea, atau tandai bintang (★) untuk dek Favorit.</div>
      </div>
      <input id="dictSearch" type="search" placeholder="Cari hangeul, romanisasi, atau arti..." oninput="renderDict()" style="padding:10px 14px;border-radius:14px;border:1px solid var(--border);background:var(--surface);color:var(--text);min-width:260px" />
    </div>
    <div id="dictExampleSpot" class="card hidden" style="margin-bottom:16px;background:var(--surface-soft)"></div>
    <div id="dictChips" class="chips"></div>
    <div id="dictBody"></div>
  </section>

  <!-- TAB 4: PERINGKAT MINGGUAN & STREAK -->
  <section id="tab-leaderboard" class="hidden">
    <div class="grid-3">
      <div class="card">
        <div style="font-size:12px;font-weight:800;color:var(--amber)">STREAK HARIAN</div>
        <div id="lbStreakVal" style="font-size:30px;font-weight:800;margin-top:6px" class="num">0 Hari</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">Teruskan latihan setiap hari agar XP dan streak makin tinggi.</div>
      </div>
      <div class="card">
        <div style="font-size:12px;font-weight:800;color:var(--blue)">PERISAI STREAK FREEZE</div>
        <div id="lbFreezeVal" style="font-size:30px;font-weight:800;margin-top:6px" class="num">0 Perisai</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">Anggota Pro otomatis mendapat 2 Streak Freeze agar streak aman saat libur 1 hari.</div>
      </div>
      <div class="card">
        <div style="font-size:12px;font-weight:800;color:var(--emerald)">STATUS SINKRONISASI</div>
        <div id="lbSyncVal" style="font-size:20px;font-weight:800;margin-top:8px">Lokal / Tamu</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">Masuk akun untuk mencatat XP ke Peringkat Mingguan Server Python.</div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <h2 style="font-size:20px">Papan Peringkat Pelajar Mingguan</h2>
          <div style="font-size:12px;color:var(--muted)">Diurutkan berdasarkan XP dan streak harian aktif di server Python 3.</div>
        </div>
        <button class="btn-sec" style="padding:8px 14px;font-size:12px" onclick="loadLeaderboard()">Muat Ulang</button>
      </div>
      <div id="leaderboardRows" style="display:flex;flex-direction:column;gap:8px"></div>
    </div>
  </section>

  <!-- TAB 5: BISNIS & PRO -->
  <section id="tab-business" class="hidden">
    <div class="grid-3">
      <div class="card">
        <div style="font-size:12px;color:var(--muted);font-weight:700">Gratis (Free)</div>
        <div style="font-size:28px;font-weight:800;margin:8px 0" class="num">Rp 0</div>
        <p style="font-size:13px;color:var(--muted)">40 huruf Hangeul, Kanvas Tulis Hangeul, partikel dasar, latihan tanpa batas sesi, dan kamus Favorit.</p>
        <button class="btn-sec" style="width:100%;margin-top:16px" onclick="setTier(false)">Uji Tampilan Gratis</button>
      </div>
      <div class="card" style="background:#0F172A;color:#fff;border:2px solid var(--emerald)">
        <div style="font-size:12px;color:#4ADE80;font-weight:800">Pro Tahunan · Hemat 32%</div>
        <div style="font-size:28px;font-weight:800;margin:8px 0" class="num">Rp 399.000 <span style="font-size:12px;font-weight:400">/ thn</span></div>
        <p style="font-size:13px;color:#CBD5E1">Semua 4 modul eksklusif, kamus K-Drama &amp; EPS-TOPIK, semua partikel &amp; kalimat, plus 2x Streak Freeze.</p>
        <button class="btn-primary" style="width:100%;margin-top:16px" onclick="setTier(true)">Aktifkan Simulasi Pro</button>
      </div>
      <div class="card">
        <div style="font-size:12px;color:var(--blue);font-weight:700">Pro Bulanan · Fleksibel</div>
        <div style="font-size:28px;font-weight:800;margin:8px 0" class="num">Rp 49.000 <span style="font-size:12px;font-weight:400">/ bln</span></div>
        <p style="font-size:13px;color:var(--muted)">Seluruh fitur Hangeul.me Pro tanpa komitmen tahunan, lengkap dengan 2x Streak Freeze Mingguan.</p>
        <button class="btn-sec" style="width:100%;margin-top:16px" onclick="setTier(true)">Pilih Paket Bulanan</button>
      </div>
    </div>

    <div class="card" style="margin-top:24px;padding:0;overflow:hidden">
      <table class="cmp">
        <thead><tr><th>Fitur</th><th>Gratis</th><th>Hangeul.me Pro</th></tr></thead>
        <tbody>
          <tr><td>40 Huruf, Kanvas Menulis Hangeul &amp; Panduan Batchim</td><td>Akses penuh</td><td>Akses penuh</td></tr>
          <tr><td>Pelindung Rekor Harian (Streak Freeze)</td><td>Belum tersedia (0 Freeze)</td><td>2x Streak Freeze otomatis</td></tr>
          <tr><td>Modul Eksklusif (K-Drama, Travel, EPS-TOPIK, TOPIK I)</td><td>Terkunci</td><td>Terbuka semua</td></tr>
          <tr><td>Kamus 500+ Entri + Favorit + Contoh Kalimat</td><td>Kategori umum terbuka</td><td>Termasuk K-Drama &amp; EPS-TOPIK</td></tr>
          <tr><td>Latihan Isian Partikel &amp; Susun Kalimat</td><td>Soal dasar gratis</td><td>Seluruh soal &amp; kalimat tematik</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</main>

<div id="batchimModal" class="modal-bg" role="dialog" aria-modal="true">
  <div class="modal-box" style="max-width:680px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:12px;font-weight:800;color:var(--blue)">PANDUAN POLA BACA &amp; BATCHIM</div>
        <h2 style="margin-top:2px;font-size:20px">Rahasia Membaca &amp; Melafalkan Hangeul Fasih</h2>
      </div>
      <button type="button" onclick="closeBatchimModal()" style="border:none;background:none;color:var(--muted);font-size:22px">×</button>
    </div>
    <div id="batchimTabs" class="seg" style="display:flex;flex-wrap:wrap;margin-top:14px"></div>
    <div id="batchimContent" style="margin-top:14px"></div>
  </div>
</div>

<div id="paywallModal" class="modal-bg" role="dialog" aria-modal="true">
  <div class="modal-box">
    <div style="font-size:12px;font-weight:800;color:var(--emerald)">Hangeul.me Pro</div>
    <h2 id="pwTitle" style="margin-top:6px">Buka Fitur Premium Hangeul.me</h2>
    <p id="pwDesc" style="font-size:14px;color:var(--muted);margin-top:8px">Tingkatkan ke Pro untuk membuka modul eksklusif, kamus K-Drama &amp; EPS-TOPIK, semua soal tata bahasa, dan 2x Streak Freeze.</p>
    <div class="btn-row">
      <button class="btn-primary" style="flex:1" onclick="upgradeProFromPaywall()">Aktifkan Pro Sekarang</button>
      <button class="btn-sec" onclick="closePaywall()">Tutup</button>
    </div>
  </div>
</div>

<div id="authModal" class="modal-bg" role="dialog" aria-modal="true">
  <div class="modal-box">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:12px;font-weight:700;color:var(--blue)">Akun Pelajar Hangeul.me</div>
      <button type="button" onclick="closeAuthModal()" style="border:none;background:none;color:var(--muted);font-size:18px">×</button>
    </div>
    <h2 id="authTitle" style="margin-top:6px">Masuk ke Akun Pelajar</h2>
    <div class="seg" style="width:100%;display:grid;grid-template-columns:repeat(2,1fr);margin-top:14px">
      <button type="button" id="authTabLogin" class="active" onclick="switchAuthTab('login')">Masuk</button>
      <button type="button" id="authTabReg" onclick="switchAuthTab('register')">Daftar Akun</button>
    </div>
    <form onsubmit="submitAuth(event)" style="margin-top:14px;display:flex;flex-direction:column;gap:12px">
      <div id="authNameWrap" class="hidden">
        <label style="font-size:12px;font-weight:700">Nama Lengkap</label>
        <input id="authName" class="inp" placeholder="Masukkan nama Anda" />
      </div>
      <div>
        <label style="font-size:12px;font-weight:700">Email</label>
        <input id="authEmail" type="email" class="inp" required placeholder="nama@email.com" />
      </div>
      <div>
        <label id="authPassLbl" style="font-size:12px;font-weight:700">Kata Sandi</label>
        <input id="authPass" type="password" class="inp" required placeholder="Minimal 6 karakter" />
      </div>
      <div id="authErr" class="alert-err hidden"></div>
      <button id="authSubmitBtn" type="submit" class="btn-primary" style="width:100%;margin-top:4px">Masuk Sekarang</button>
    </form>
  </div>
</div>

<footer>
  <div class="wrap foot-in">
    <div>Hangeul.me — Website Belajar Bahasa Korea (Python Standard Library Server)</div>
    <div>Tugas Kuliah · Python 3 HTTP Server &amp; REST API</div>
  </div>
</footer>

<script>
const BOOT = {bootstrap_json};
let authToken = null;
let currentUser = null;
let authMode = 'login';

let isPro = false, xp = 0, streak = 0, bestStreak = 0, totalAns = 0, rightAns = 0;
let dailyStreak = 0, lastActiveDate = null, streakFreezeCount = 0;
let favorites = [];
let weak = {{}}, modFilter = 'all', arenaMode = 'letters', activeModId = null;
let queue = [], cur = null, leftOk = false, chalTimer = null, chalLeft = 60, chalOn = false;
let dictCat = 'Semua', selectedDictCard = null;
let syncTimeout = null;

const $ = id => document.getElementById(id);
const effectivePro = () => currentUser ? !!currentUser.isPro : isPro;

function setTab(t) {{
  ['learn','arena','dictionary','leaderboard','business'].forEach(id => {{
    const el = $('tab-' + id);
    if (el) el.classList.toggle('hidden', id !== t);
  }});
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  if (t === 'dictionary') renderDict();
  if (t === 'leaderboard') loadLeaderboard();
}}

function recordDailyActivity() {{
  const today = new Date().toISOString().slice(0, 10);
  if (lastActiveDate === today) return;
  if (!lastActiveDate) {{
    dailyStreak = 1;
  }} else {{
    const d1 = new Date(lastActiveDate + 'T00:00:00Z');
    const d2 = new Date(today + 'T00:00:00Z');
    const diff = Math.round((d2 - d1) / 86400000);
    if (diff === 1) dailyStreak += 1;
    else if (diff === 2 && (streakFreezeCount > 0 || effectivePro())) {{
      streakFreezeCount = Math.max(0, streakFreezeCount - 1);
      dailyStreak += 1;
    }} else if (diff > 1) {{
      dailyStreak = 1;
    }}
  }}
  lastActiveDate = today;
  scheduleSync();
}}

function scheduleSync() {{
  if (!authToken || !currentUser) return;
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {{
    try {{
      const res = await fetch('/api/progress', {{
        method: 'PUT',
        headers: {{ 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken }},
        body: JSON.stringify({{
          xp, bestStreak, dailyStreak, lastActiveDate,
          streakFreezeCount, favorites,
        }})
      }});
      if (res.ok) {{
        const data = await res.json();
        if (data.user) currentUser = data.user;
      }}
    }} catch (e) {{}}
  }}, 350);
}}

function toggleTheme() {{
  document.documentElement.classList.toggle('dark');
  $('themeToggle').textContent = document.documentElement.classList.contains('dark') ? '☀' : '☾';
}}

function syncAuthUi() {{
  const proNow = effectivePro();
  $('guestTierSeg').classList.toggle('hidden', !!currentUser);
  $('loggedStatusBadge').classList.toggle('hidden', !currentUser);
  if (currentUser) {{
    $('authTopBtn').textContent = currentUser.name + ' · Keluar';
    $('loggedStatusBadge').textContent = proNow ? 'Pelajar Pro' : 'Pelajar Gratis';
    $('loggedStatusBadge').style.color = proNow ? 'var(--emerald)' : 'var(--text)';
  }} else {{
    $('authTopBtn').textContent = 'Masuk';
  }}
  $('topCta').textContent = proNow ? 'Pro Aktif' : 'Upgrade Pro';
  $('topCta').classList.toggle('pro', proNow);
  $('btnTierFree').classList.toggle('active', !proNow);
  $('btnTierPro').classList.toggle('active', proNow);
  updateHud();
  renderModules();
  renderDict();
}}

function handleAuthBtn() {{
  if (currentUser) {{
    doLogout();
  }} else {{
    openAuthModal('login');
  }}
}}

function openAuthModal(tab) {{
  switchAuthTab(tab || 'login');
  $('authModal').classList.add('open');
}}
function closeAuthModal() {{ $('authModal').classList.remove('open'); }}

function switchAuthTab(mode) {{
  authMode = mode;
  $('authTabLogin').classList.toggle('active', mode === 'login');
  $('authTabReg').classList.toggle('active', mode === 'register');
  $('authErr').classList.add('hidden');
  $('authPass').value = '';
  const showName = mode === 'register';
  $('authNameWrap').classList.toggle('hidden', !showName);
  $('authName').required = showName;
  if (mode === 'login') {{
    $('authTitle').textContent = 'Masuk ke Akun Pelajar';
    $('authPassLbl').textContent = 'Kata Sandi';
    $('authSubmitBtn').textContent = 'Masuk Sekarang';
  }} else {{
    $('authTitle').textContent = 'Daftar Akun Pelajar Baru';
    $('authPassLbl').textContent = 'Kata Sandi (min. 6 karakter)';
    $('authSubmitBtn').textContent = 'Buat Akun Gratis';
  }}
}}

function applyServerProgress(p) {{
  if (!p) return;
  xp = Math.max(xp, p.xp || 0);
  bestStreak = Math.max(bestStreak, p.bestStreak || 0);
  dailyStreak = Math.max(dailyStreak, p.dailyStreak || 0);
  if (p.lastActiveDate) lastActiveDate = p.lastActiveDate;
  streakFreezeCount = Math.max(streakFreezeCount, p.streakFreezeCount || 0);
  if (Array.isArray(p.favorites)) favorites = Array.from(new Set([...favorites, ...p.favorites]));
}}

async function submitAuth(e) {{
  e.preventDefault();
  $('authErr').classList.add('hidden');
  const payload = {{
    name: $('authName').value.trim(),
    email: $('authEmail').value.trim(),
    password: $('authPass').value,
    initialProgress: authMode === 'register' ? {{ xp, bestStreak, dailyStreak, lastActiveDate, streakFreezeCount, favorites }} : undefined,
  }};
  const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
  const res = await fetch(endpoint, {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify(payload)
  }});
  const data = await res.json();
  if (!res.ok) {{
    $('authErr').textContent = data.error || 'Otentikasi gagal.';
    $('authErr').classList.remove('hidden');
    return;
  }}
  authToken = data.token;
  currentUser = data.user;
  applyServerProgress(currentUser.progress);
  closeAuthModal();
  syncAuthUi();
}}

async function doLogout() {{
  if (authToken) {{
    await fetch('/api/auth/logout', {{ method: 'POST', headers: {{ Authorization: 'Bearer ' + authToken }} }});
  }}
  authToken = null;
  currentUser = null;
  syncAuthUi();
}}

function setTier(pro) {{
  isPro = pro;
  if (pro) {{
    streakFreezeCount = Math.max(streakFreezeCount, 2);
  }}
  syncAuthUi();
}}

async function upgradeProFromPaywall() {{
  if (currentUser && authToken) {{
    const res = await fetch('/api/transactions/checkout', {{
      method: 'POST',
      headers: {{ 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken }},
      body: JSON.stringify({{ plan: 'annual', method: 'QRIS Instan' }})
    }});
    const data = await res.json();
    if (res.ok && data.user) {{
      currentUser = data.user;
      applyServerProgress(currentUser.progress);
    }}
  }} else {{
    isPro = true;
    streakFreezeCount = Math.max(streakFreezeCount, 2);
  }}
  closePaywall();
  syncAuthUi();
}}

function handleTopCta() {{
  if (effectivePro()) setTab('business'); else openPaywall('Upgrade ke Hangeul.me Pro', 'Buka seluruh modul eksklusif, kamus K-Drama & EPS-TOPIK, semua skenario tata bahasa, dan 2x Streak Freeze.');
}}

function openPaywall(title, desc) {{
  $('pwTitle').textContent = title;
  $('pwDesc').textContent = desc;
  $('paywallModal').classList.add('open');
}}
function closePaywall() {{ $('paywallModal').classList.remove('open'); }}

function updateHud() {{
  const proNow = effectivePro();
  const lv = Math.floor(xp / 50) + 1;
  const freezeNow = proNow ? Math.max(2, streakFreezeCount) : streakFreezeCount;
  $('hudLv').textContent = lv;
  $('hudDailyStreak').textContent = dailyStreak + 'h';
  $('hudFreeze').textContent = freezeNow;
  $('hudXp').textContent = xp;
  $('hudBest').textContent = bestStreak;
  if ($('lbStreakVal')) $('lbStreakVal').textContent = dailyStreak + ' Hari';
  if ($('lbFreezeVal')) $('lbFreezeVal').textContent = freezeNow + ' Perisai';
  if ($('lbSyncVal')) $('lbSyncVal').textContent = currentUser ? 'Tersimpan (' + currentUser.name + ')' : 'Lokal / Tamu';
}}

function filterMods(tier, btn) {{
  modFilter = tier;
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderModules();
}}

function renderModules() {{
  const box = $('modulesGrid');
  box.innerHTML = '';
  const proNow = effectivePro();
  BOOT.modules.filter(m => modFilter === 'all' || m.tier === modFilter).forEach(m => {{
    const unlocked = m.tier === 'free' || proNow;
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="mod-meta num">
        <span>Modul ${{m.order}} · ${{m.cards.length}} kartu · ${{m.minutes}} mnt</span>
        <strong style="color:${{m.tier==='free'?'var(--emerald)':unlocked?'var(--blue)':'var(--rose)'}}">${{m.tier==='free'?'Akses Gratis':unlocked?'Pro Terbuka':'Eksklusif Pro'}}</strong>
      </div>
      <h3 style="margin-top:8px;font-size:18px">${{m.title}}</h3>
      <div style="font-size:13px;font-weight:600;color:var(--muted);margin-top:4px">${{m.subtitle}}</div>
      <p style="font-size:13px;color:var(--muted);margin-top:8px">${{m.description}}</p>
      <div class="mod-actions">
        <button class="btn-primary" style="padding:9px 14px;font-size:12px;background:${{unlocked?'var(--text)':'var(--rose)'}};color:${{unlocked?'var(--bg)':'#fff'}};border-color:rgba(0,0,0,0.2)" onclick="playModule('${{m.id}}')">${{unlocked?'Mulai Latihan':'Buka dengan Pro'}}</button>
        <span style="font-size:12px;color:var(--muted);font-weight:600">${{unlocked?'Siap dimainkan':'Paket Pro'}}</span>
      </div>`;
    box.appendChild(el);
  }});
}}

function playModule(id) {{
  const m = BOOT.modules.find(x => x.id === id);
  if (!m) return;
  if (m.tier === 'pro' && !effectivePro()) {{
    openPaywall('Modul Eksklusif Pro: ' + m.title, m.description);
    return;
  }}
  activeModId = id;
  arenaMode = 'module';
  queue = [];
  setTab('arena');
  renderQuiz();
  nextCard();
}}

function startQuickArena(mode) {{
  activeModId = null;
  arenaMode = 'letters';
  queue = [];
  setTab('arena');
  setStudioMode(mode || 'quiz');
  nextCard();
}}

function getPool() {{
  if (chalOn) return BOOT.allCards.filter(c => c.kind === 'L' || c.kind === 'W');
  if (arenaMode === 'module' && activeModId) {{
    const m = BOOT.modules.find(x => x.id === activeModId);
    if (m) return m.cards;
  }}
  if (arenaMode === 'favorites') {{
    const f = BOOT.allCards.filter(c => favorites.includes(c.id));
    return f.length ? f : BOOT.allCards.filter(c => c.kind === 'L');
  }}
  if (arenaMode === 'words') return BOOT.allCards.filter(c => c.kind === 'W');
  if (arenaMode === 'weak') {{
    const w = BOOT.allCards.filter(c => weak[c.h]);
    return w.length ? w : BOOT.allCards.filter(c => c.kind === 'L');
  }}
  return BOOT.allCards.filter(c => c.kind === 'L');
}}

function setArenaMode(m, btn) {{
  arenaMode = m;
  activeModId = null;
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  queue = [];
  renderQuiz();
  nextCard();
}}

function nextCard() {{
  if (!queue.length) queue = [...getPool()].sort(() => Math.random() - 0.5);
  cur = queue.pop();
  leftOk = Math.random() < 0.5;
  $('fcType').textContent = cur.type + (weak[cur.h] ? ' · Kartu Lemah' : '');
  $('flashcard').classList.toggle('weak', !!weak[cur.h]);
  $('fcChar').textContent = cur.h;
  $('fcChar').style.fontSize = cur.h.length > 3 ? '40px' : cur.h.length > 1 ? '54px' : '72px';
  $('optL').textContent = '← ' + (leftOk ? cur.c : cur.w);
  $('optR').textContent = (leftOk ? cur.w : cur.c) + ' →';
  updateArenaHud();
}}

function answerCard(swipedLeft) {{
  if (!cur) return;
  totalAns++;
  const ok = swipedLeft ? leftOk : !leftOk;
  const mult = 1 + Math.floor(streak / 5);
  if (ok) {{
    rightAns++; streak++; xp += mult; bestStreak = Math.max(bestStreak, streak);
    recordDailyActivity();
    if (weak[cur.h]) {{ weak[cur.h]--; if (weak[cur.h] <= 0) delete weak[cur.h]; }}
    $('arenaFeedback').style.color = 'var(--emerald)';
    $('arenaFeedback').textContent = `Benar (+${{mult}} XP): ${{cur.c}} · ${{cur.m}}`;
  }} else {{
    streak = 0; weak[cur.h] = 2;
    queue.splice(Math.max(0, queue.length - 3), 0, cur);
    $('arenaFeedback').style.color = 'var(--rose)';
    $('arenaFeedback').textContent = `Jawaban tepat: ${{cur.c}} · ${{cur.m}}`;
  }}
  updateHud();
  nextCard();
}}

function updateArenaHud() {{
  const mult = 1 + Math.floor(streak / 5);
  $('sesScore').textContent = xp;
  $('sesCombo').textContent = `${{streak}} (x${{mult}})`;
  $('sesAcc').textContent = totalAns ? Math.round((rightAns / totalAns) * 100) + '%' : '0%';
  $('sesTimer').textContent = chalOn ? chalLeft + 'd' : '-';
}}

function toggleChallenge() {{
  if (chalOn) {{
    clearInterval(chalTimer); chalOn = false;
    $('chalToggleBtn').textContent = 'Tantangan 60 Detik';
    updateArenaHud();
    return;
  }}
  chalOn = true; chalLeft = 60; queue = [];
  $('chalToggleBtn').textContent = 'Berhenti (60d)';
  nextCard();
  chalTimer = setInterval(() => {{
    chalLeft--;
    $('chalToggleBtn').textContent = `Berhenti (${{chalLeft}}d)`;
    updateArenaHud();
    if (chalLeft <= 0) toggleChallenge();
  }}, 1000);
}}

function speakCur(txt) {{
  const word = typeof txt === 'string' ? txt : (cur && cur.h);
  if (!word || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'ko-KR'; u.rate = 0.82;
  speechSynthesis.speak(u);
}}

window.addEventListener('keydown', e => {{
  if ($('tab-arena').classList.contains('hidden')) return;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.key === 'ArrowLeft') answerCard(true);
  if (e.key === 'ArrowRight') answerCard(false);
  if (e.key === ' ') {{ e.preventDefault(); speakCur(); }}
}});

function getExampleForCard(item) {{
  if (item.kind === 'L') {{
    return {{
      korean: item.h + ' (' + item.c + ') — 한 · 글',
      roman: 'Pelafalan huruf ' + item.h + ': ' + item.c,
      id: item.type + ': ' + item.m + '. Latih penulisan huruf ini di Kanvas Menulis Hangeul.'
    }};
  }}
  if (item.type === 'Makanan & Minuman') {{
    return {{
      korean: '여기 ' + item.h + ' 하나 주세요.',
      roman: 'Yeo-gi ' + item.c + ' ha-na ju-se-yo.',
      id: 'Permisi, tolong satu ' + item.m.toLowerCase() + '.'
    }};
  }}
  if (item.type === 'Tempat' || item.type === 'Transportasi') {{
    return {{
      korean: '지금 ' + item.h + '에 가고 있어요.',
      roman: 'Ji-geum ' + item.c + '-e ga-go i-sseo-yo.',
      id: 'Sekarang saya sedang pergi ke ' + item.m.toLowerCase() + '.'
    }};
  }}
  return {{
    korean: '이것은 한국어로 ' + item.h + '이에요/예요.',
    roman: 'I-geo-seun han-gu-geo-ro ' + item.c + ' i-e-yo.',
    id: 'Dalam bahasa Korea, "' + item.m + '" disebut ' + item.h + '.'
  }};
}}

function toggleFav(cardId, ev) {{
  if (ev) ev.stopPropagation();
  const idx = favorites.indexOf(cardId);
  if (idx >= 0) favorites.splice(idx, 1);
  else favorites.push(cardId);
  scheduleSync();
  renderDict();
}}

function renderDictExampleSpot() {{
  const spot = $('dictExampleSpot');
  if (!spot) return;
  if (!selectedDictCard) {{
    spot.classList.add('hidden');
    return;
  }}
  const ex = getExampleForCard(selectedDictCard);
  spot.classList.remove('hidden');
  spot.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
      <div>
        <div style="font-size:11px;font-weight:800;color:var(--blue)">CONTOH PENGGUNAAN · ${{selectedDictCard.h}} (${{selectedDictCard.c}})</div>
        <div style="font-size:20px;font-weight:800;margin-top:4px">${{ex.korean}}</div>
        <div style="font-size:12px;font-weight:700;color:var(--blue);margin-top:2px">${{ex.roman}}</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px">${{ex.id}}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-sec" style="padding:8px 14px;font-size:12px;background:var(--blue);color:#fff;border-color:#1D4ED8" id="dictExPlayBtn">Dengar Kalimat</button>
        <button class="btn-sec" style="padding:8px 12px;font-size:12px" onclick="selectedDictCard=null;renderDictExampleSpot()">Tutup</button>
      </div>
    </div>`;
  $('dictExPlayBtn').onclick = () => speakCur(ex.korean);
}}

function renderDict() {{
  const q = ($('dictSearch').value || '').toLowerCase().trim();
  const favLabel = 'Favorit (' + favorites.length + ')';
  const cats = ['Semua', favLabel, ...new Set(BOOT.allCards.map(c => c.type))];
  const proNow = effectivePro();
  $('dictChips').innerHTML = '';
  cats.forEach(c => {{
    const isFavChip = c.startsWith('Favorit (');
    const active = isFavChip ? dictCat === '__FAV__' : dictCat === c;
    const b = document.createElement('button');
    b.className = 'btn-sec';
    b.style.cssText = 'padding:6px 12px;font-size:12px;white-space:nowrap;' + (active ? 'background:var(--text);color:var(--bg)' : '');
    b.textContent = c;
    b.onclick = () => {{ dictCat = isFavChip ? '__FAV__' : c; renderDict(); }};
    $('dictChips').appendChild(b);
  }});
  const items = BOOT.allCards.filter(c => {{
    const matchCat = dictCat === 'Semua' ? true : dictCat === '__FAV__' ? favorites.includes(c.id) : c.type === dictCat;
    const matchQ = !q || [c.h,c.c,c.m,c.type].join(' ').toLowerCase().includes(q);
    return matchCat && matchQ;
  }});
  renderDictExampleSpot();
  const body = $('dictBody');
  body.innerHTML = '';
  const g = document.createElement('div');
  g.className = 'dict-grid';
  const listToRender = (dictCat === 'Semua' && !q) ? items.slice(0, 180) : items;
  if (!listToRender.length) {{
    body.innerHTML = '<div class="card" style="text-align:center;color:var(--muted)">Belum ada entri pada filter ini. Klik ikon bintang (★) pada kartu kamus untuk menyimpannya ke Favorit.</div>';
    return;
  }}
  listToRender.forEach(i => {{
    const locked = (i.type === 'K-Drama' || i.type === 'Kerja & EPS-TOPIK') && !proNow;
    const isFav = favorites.includes(i.id);
    const d = document.createElement('div');
    d.className = 'dict-item';
    d.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
        <button type="button" style="flex:1;text-align:left;background:none;border:none;color:inherit;padding:0">
          <div style="font-size:20px;font-weight:800">${{i.h}}</div>
          <div style="font-size:12px;font-weight:700;color:var(--blue);margin-top:4px">${{locked?'Khusus Pro':i.c}}</div>
          <div style="font-size:12px;color:var(--muted)">${{i.m}}</div>
        </button>
        <button type="button" class="fav-btn ${{isFav?'on':''}}" title="Simpan ke Favorit">${{isFav?'★':'☆'}}</button>
      </div>`;
    const [mainBtn, starBtn] = d.querySelectorAll('button');
    mainBtn.onclick = () => {{
      if (locked) {{
        openPaywall('Kamus Eksklusif Pro', 'Aktifkan Pro untuk membuka kosakata K-Drama & EPS-TOPIK.');
      }} else {{
        selectedDictCard = i;
        speakCur(i.h);
        renderDictExampleSpot();
      }}
    }};
    starBtn.onclick = ev => toggleFav(i.id, ev);
    g.appendChild(d);
  }});
  body.appendChild(g);
}}

let soundFilter = 'Konsonan Dasar';
let studioMode = 'quiz';
let questCorrect = 0, questBuilder = 0, questPair = 0;

function filterSound(grp, btn) {{
  soundFilter = grp;
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSoundboard();
}}

function renderSoundboard() {{
  const letters = BOOT.allCards.filter(c => c.kind === 'L' && (soundFilter === 'Semua' || c.type === soundFilter));
  const grid = $('soundGrid');
  if (!grid) return;
  grid.innerHTML = '';
  letters.forEach(l => {{
    const b = document.createElement('button');
    b.className = 'sound-tile' + ($('spotChar').textContent === l.h ? ' active' : '');
    b.innerHTML = `<div style="font-size:22px;font-weight:800">${{l.h}}</div><div style="font-size:11px;opacity:.85">${{l.c}}</div>`;
    b.onclick = () => {{
      $('spotChar').textContent = l.h;
      $('spotInfo').textContent = `${{l.c}} · ${{l.type}} · ${{l.m}}`;
      speakCur(l.h);
      renderSoundboard();
    }};
    grid.appendChild(b);
  }});
}}

function renderQuestsAndLevel() {{
  const lvl = Math.floor(xp / 50) + 1;
  if ($('heroLevelTitle')) $('heroLevelTitle').textContent = `Lv.${{lvl}} Pembelajar Hangeul (${{xp}} XP)`;
  const qb = $('questsBox');
  if (!qb) return;
  const qs = [
    {{ t: 'Jawab 5 Latihan Benar', cur: Math.min(5, questCorrect), max: 5 }},
    {{ t: 'Tulis / Rakit Hangeul (2x)', cur: Math.min(2, questBuilder), max: 2 }},
    {{ t: 'Cocokkan / Partikel (1x)', cur: Math.min(1, questPair), max: 1 }},
  ];
  qb.innerHTML = qs.map(q => `<div style="display:flex;justify-content:space-between;background:rgba(255,255,255,0.85);color:#0f172a;padding:7px 11px;border-radius:12px;font-weight:700"><span>${{q.t}}</span><span>${{q.cur}}/${{q.max}}${{q.cur>=q.max?' ✓':''}}</span></div>`).join('');
}}

function setStudioMode(mode) {{
  studioMode = mode;
  ['quiz','writing','builder','particles','match','sentence','swipe'].forEach(m => {{
    const pane = $('pane-' + m);
    if (pane) pane.classList.toggle('hidden', m !== mode);
    const btn = $('modeBtn-' + m);
    if (btn) {{
      btn.style.background = m === mode ? 'var(--blue)' : 'var(--surface)';
      btn.style.color = m === mode ? '#fff' : 'var(--text)';
      btn.style.borderColor = m === mode ? '#1D4ED8' : 'var(--border)';
    }}
  }});
  if (mode === 'quiz') renderQuiz();
  if (mode === 'writing') renderWriteCanvas();
  if (mode === 'builder') initBuilderRacks();
  if (mode === 'particles') renderParticle();
  if (mode === 'match') startMatchRound();
  if (mode === 'sentence') renderSentence();
}}

// Quiz Mode
let quizCur = {{ card: BOOT.allCards[0], options: [] }};
let quizIdx = 0;
function renderQuiz() {{
  const pool = getPool();
  const card = pool[quizIdx % pool.length];
  quizIdx++;
  const others = pool.filter(x => x.h !== card.h);
  const opts = [{{ h: card.h, text: `${{card.m}} (${{card.c}})`, ok: true }}];
  for (let i = 0; i < others.length && opts.length < 4; i++) {{
    const p = others[(quizIdx * 3 + i * 5) % others.length];
    const t = `${{p.m}} (${{p.c}})`;
    if (!opts.some(o => o.text === t)) opts.push({{ h: p.h, text: t, ok: false }});
  }}
  opts.sort(() => Math.random() - 0.5);
  quizCur = {{ card, options: opts }};
  $('quizPromptChar').textContent = card.h;
  $('quizFeedback').textContent = '';
  $('quizNextBtn').classList.add('hidden');
  const box = $('quizOptionsBox');
  box.innerHTML = '';
  opts.forEach((o, i) => {{
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = `${{i + 1}}. ${{o.text}}`;
    btn.onclick = () => {{
      if (!$('quizNextBtn').classList.contains('hidden')) return;
      totalAns++;
      if (o.ok) {{
        btn.classList.add('ok'); rightAns++; streak++; xp += 5; questCorrect++;
        bestStreak = Math.max(bestStreak, streak);
        recordDailyActivity();
        $('quizFeedback').style.color = 'var(--emerald)';
        $('quizFeedback').textContent = `Benar (+5 XP)! ${{card.h}} = ${{card.m}} (${{card.c}})`;
      }} else {{
        btn.classList.add('bad'); streak = 0; weak[card.h] = 2;
        $('quizFeedback').style.color = 'var(--rose)';
        $('quizFeedback').textContent = `Belum tepat · Jawaban: ${{card.m}} (${{card.c}})`;
      }}
      $('quizNextBtn').classList.remove('hidden');
      updateHud(); updateArenaHud(); renderQuestsAndLevel();
    }};
    box.appendChild(btn);
  }});
}}

// Writing Canvas Mode
let wriIdx = 0, wriShowGuide = true, wriStrokes = [], wriCurStroke = [], wriDrawing = false;
function currentGlyph() {{ return BOOT.writingGlyphs[wriIdx % BOOT.writingGlyphs.length]; }}
function renderWriteCanvas() {{
  const g = currentGlyph();
  $('wriTitle').textContent = `${{g.char}} · ${{g.name}} (${{g.roman}})`;
  $('wriTips').textContent = `Tips (${{g.strokeCount}} goresan): ${{g.tips}}`;
  const grp = $('wriGuideGroup');
  grp.innerHTML = '';
  if (wriShowGuide) {{
    g.strokes.forEach((d, idx) => {{
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', idx === 0 ? '#0A84FF' : '#94A3B8');
      p.setAttribute('stroke-width', '14');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('stroke-dasharray', '6 6');
      p.setAttribute('opacity', '0.42');
      grp.appendChild(p);
    }});
  }}
  redrawWriteStrokes();
}}
function redrawWriteStrokes() {{
  const cv = $('writeCanvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0F172A';
  [...wriStrokes, wriCurStroke].forEach(pts => {{
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }});
}}
(function setupWriteCanvasEvents() {{
  const cv = $('writeCanvas'); if (!cv) return;
  const pt = e => {{
    const r = cv.getBoundingClientRect();
    return {{ x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) }};
  }};
  cv.addEventListener('pointerdown', e => {{ wriDrawing = true; wriCurStroke = [pt(e)]; $('wriFeedback').textContent = ''; }});
  cv.addEventListener('pointermove', e => {{ if (!wriDrawing) return; wriCurStroke.push(pt(e)); redrawWriteStrokes(); }});
  const endStroke = () => {{ if (wriDrawing && wriCurStroke.length > 0) wriStrokes.push(wriCurStroke); wriCurStroke = []; wriDrawing = false; redrawWriteStrokes(); }};
  cv.addEventListener('pointerup', endStroke);
  cv.addEventListener('pointerleave', endStroke);
}})();
function toggleWriteGuide() {{
  wriShowGuide = !wriShowGuide;
  $('wriGuideBtn').textContent = wriShowGuide ? 'Sembunyikan Panduan' : 'Tampilkan Panduan';
  renderWriteCanvas();
}}
function undoWriteStroke() {{ wriStrokes.pop(); $('wriFeedback').textContent = ''; redrawWriteStrokes(); }}
function clearWriteCanvas() {{ wriStrokes = []; wriCurStroke = []; $('wriFeedback').textContent = ''; redrawWriteStrokes(); }}
function prevWriteGlyph() {{ wriIdx = (wriIdx - 1 + BOOT.writingGlyphs.length) % BOOT.writingGlyphs.length; clearWriteCanvas(); renderWriteCanvas(); }}
function nextWriteGlyph() {{ wriIdx = (wriIdx + 1) % BOOT.writingGlyphs.length; clearWriteCanvas(); renderWriteCanvas(); }}
function appendLineSamplePts(out, x0, y0, x1, y1, step = 6) {{
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const cnt = Math.max(1, Math.ceil(dist / step));
  for (let i = 0; i <= cnt; i++) {{
    const t = i / cnt;
    out.push({{ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t }});
  }}
}}
function sampleSvgGuidePts(pathD) {{
  const tokens = pathD.match(/[a-zA-Z]|[-+]?\d*\.?\d+/g);
  if (!tokens) return [];
  const pts = [];
  let i = 0, cmd = '', cx = 0, cy = 0, sx = 0, sy = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {{
    if (/^[a-zA-Z]$/.test(tokens[i])) {{
      cmd = tokens[i++];
      if (cmd === 'Z' || cmd === 'z') {{
        if (Math.hypot(sx - cx, sy - cy) > 1) appendLineSamplePts(pts, cx, cy, sx, sy);
        cx = sx; cy = sy; continue;
      }}
    }}
    if (cmd === 'M') {{
      cx = num(); cy = num(); sx = cx; sy = cy; pts.push({{ x: cx, y: cy }}); cmd = 'L';
    }} else if (cmd === 'L') {{
      const x1 = num(), y1 = num();
      appendLineSamplePts(pts, cx, cy, x1, y1); cx = x1; cy = y1;
    }} else if (cmd === 'Q') {{
      const qx = num(), qy = num(), x1 = num(), y1 = num();
      for (let s = 0; s <= 20; s++) {{
        const t = s / 20, inv = 1 - t;
        pts.push({{ x: inv*inv*cx + 2*inv*t*qx + t*t*x1, y: inv*inv*cy + 2*inv*t*qy + t*t*y1 }});
      }}
      cx = x1; cy = y1;
    }} else if (cmd === 'A') {{
      let rx = Math.abs(num()), ry = Math.abs(num());
      const phi = (num() * Math.PI) / 180, largeArc = num(), sweep = num(), x2 = num(), y2 = num();
      if (rx > 0 && ry > 0 && (cx !== x2 || cy !== y2)) {{
        const cosP = Math.cos(phi), sinP = Math.sin(phi), dx2 = (cx - x2) / 2, dy2 = (cy - y2) / 2;
        const x1p = cosP * dx2 + sinP * dy2, y1p = -sinP * dx2 + cosP * dy2;
        const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
        if (lam > 1) {{ const s = Math.sqrt(lam); rx *= s; ry *= s; }}
        const rx2 = rx * rx, ry2 = ry * ry, denom = rx2 * y1p * y1p + ry2 * x1p * x1p;
        const sq = denom > 0 ? Math.max(0, (rx2 * ry2 - denom) / denom) : 0;
        const coef = (largeArc === sweep ? -1 : 1) * Math.sqrt(sq);
        const cxp = coef * ((rx * y1p) / ry), cyp = coef * (-(ry * x1p) / rx);
        const acx = cosP * cxp - sinP * cyp + (cx + x2) / 2, acy = sinP * cxp + cosP * cyp + (cy + y2) / 2;
        const vecAng = (ux, uy, vx, vy) => {{
          const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
          const ang = Math.acos(len > 0 ? Math.max(-1, Math.min(1, (ux * vx + uy * vy) / len)) : 1);
          return ux * vy - uy * vx < 0 ? -ang : ang;
        }};
        const vx1 = (x1p - cxp) / rx, vy1 = (y1p - cyp) / ry;
        const vx2 = (-x1p - cxp) / rx, vy2 = (-y1p - cyp) / ry;
        const th1 = vecAng(1, 0, vx1, vy1);
        let dTh = vecAng(vx1, vy1, vx2, vy2);
        if (sweep === 0 && dTh > 0) dTh -= 2 * Math.PI;
        if (sweep === 1 && dTh < 0) dTh += 2 * Math.PI;
        for (let s = 0; s <= 32; s++) {{
          const t = th1 + (dTh * s) / 32, px = rx * Math.cos(t), py = ry * Math.sin(t);
          pts.push({{ x: cosP * px - sinP * py + acx, y: sinP * px + cosP * py + acy }});
        }}
      }}
      cx = x2; cy = y2;
    }} else {{ i++; }}
  }}
  return pts;
}}
function evaluateWritePattern(strokes, guidePaths, canvasSize = 280) {{
  const rawPts = strokes.flat();
  if (rawPts.length < 2) return {{ passed: false, scorePct: 0, feedback: 'Goresan masih terlalu pendek. Tulis pola huruf lengkap sesuai panduan!' }};
  const scale = 200 / Math.max(1, canvasSize);
  const resampled = [];
  for (const st of strokes) {{
    if (!st.length) continue;
    for (let k = 0; k < st.length; k++) {{
      const p0 = {{ x: st[k].x * scale, y: st[k].y * scale }};
      if (k === 0) resampled.push(p0);
      else appendLineSamplePts(resampled, st[k - 1].x * scale, st[k - 1].y * scale, p0.x, p0.y, 6);
    }}
  }}
  if (resampled.length < 10) return {{ passed: false, scorePct: 12, feedback: 'Pola goresan belum cukup lengkap. Ikuti garis panduan huruf!' }};
  const guidePts = guidePaths.flatMap(d => sampleSvgGuidePts(d));
  const tolSq = 28 * 28;
  let gHits = 0, uHits = 0;
  for (const gp of guidePts) if (resampled.some(up => (gp.x-up.x)*(gp.x-up.x) + (gp.y-up.y)*(gp.y-up.y) <= tolSq)) gHits++;
  for (const up of resampled) if (guidePts.some(gp => (gp.x-up.x)*(gp.x-up.x) + (gp.y-up.y)*(gp.y-up.y) <= tolSq)) uHits++;
  const recall = gHits / guidePts.length, precision = uHits / resampled.length;
  const f1 = recall + precision > 0 ? (2 * recall * precision) / (recall + precision) : 0;
  const scorePct = Math.round(f1 * 100);
  if (recall < 0.62 || precision < 0.60) {{
    return {{
      passed: false,
      scorePct,
      feedback: recall < 0.62
        ? 'Pola huruf belum lengkap atau melenceng — kanvas huruf ini direset, silakan tulis ulang!'
        : 'Goresan terlalu keluar dari pola huruf — kanvas huruf ini direset, silakan coba lagi!'
    }};
  }}
  return {{ passed: true, scorePct: Math.max(72, scorePct), feedback: 'Pola huruf tepat & proporsional!' }};
}}
function evaluateWriteCanvas() {{
  const g = currentGlyph();
  const cv = $('writeCanvas');
  const evalRes = evaluateWritePattern(wriStrokes, g.strokes, cv ? cv.width : 280);
  if (evalRes.passed) {{
    xp += 8; rightAns++; totalAns++; questCorrect++; questBuilder++;
    recordDailyActivity();
    speakCur(g.char); updateHud(); updateArenaHud(); renderQuestsAndLevel();
    wriIdx = (wriIdx + 1) % BOOT.writingGlyphs.length;
    const nextG = currentGlyph();
    wriStrokes = []; wriCurStroke = [];
    renderWriteCanvas();
    $('wriFeedback').style.color = 'var(--emerald)';
    $('wriFeedback').textContent = `Benar! (+8 XP · Skor ${{evalRes.scorePct}}%) Huruf ${{g.char}} tepat. Lanjut ke "${{nextG.char}}" (${{nextG.name}})!`;
    return;
  }}
  wriStrokes = []; wriCurStroke = [];
  redrawWriteStrokes();
  $('wriFeedback').style.color = 'var(--rose)';
  $('wriFeedback').textContent = `Pola Salah (Skor ${{evalRes.scorePct}}%) — Kanvas huruf "${{g.char}}" direset, tulis ulang huruf ini!`;
}}

// Particle Fill Mode
let prtIdx = 0, prtLockedChoice = false;
function renderParticle() {{
  const p = BOOT.particlePuzzles[prtIdx % BOOT.particlePuzzles.length];
  const locked = p.tier === 'pro' && !effectivePro();
  prtLockedChoice = false;
  $('prtPromptBox').innerHTML = `
    <div style="font-size:12px;font-weight:800;color:var(--blue)">${{p.topic}} ${{locked?'(Pro)':''}}</div>
    <div style="font-size:24px;font-weight:800;margin-top:8px">${{p.sentenceBefore}} <span style="padding:2px 12px;border-radius:10px;border:2px dashed var(--blue);color:var(--blue)">___</span> ${{p.sentenceAfter}}</div>
    <div style="font-size:13px;color:var(--muted);margin-top:6px">"${{p.meaningId}}"</div>`;
  $('prtFeedback').textContent = locked ? 'Aktifkan Mode Pro untuk membuka soal partikel lanjutan ini.' : '';
  const box = $('prtOptionsBox');
  box.innerHTML = '';
  p.options.forEach(opt => {{
    const b = document.createElement('button');
    b.className = 'quiz-opt';
    b.style.textAlign = 'center'; b.style.fontSize = '18px';
    b.textContent = '-' + opt;
    b.onclick = () => {{
      if (prtLockedChoice) return;
      if (locked) {{ openPaywall('Latihan Partikel Pro', p.meaningId); return; }}
      prtLockedChoice = true;
      totalAns++;
      if (opt === p.correctOption) {{
        b.classList.add('ok'); rightAns++; streak++; xp += 9; questCorrect++; questPair++;
        bestStreak = Math.max(bestStreak, streak);
        recordDailyActivity();
        $('prtFeedback').style.color = 'var(--emerald)';
        $('prtFeedback').textContent = `Benar (+9 XP)! ${{p.explanation}}`;
        speakCur(p.sentenceBefore + opt + p.sentenceAfter);
      }} else {{
        b.classList.add('bad'); streak = 0;
        $('prtFeedback').style.color = 'var(--rose)';
        $('prtFeedback').textContent = `Belum tepat · Jawaban benar: -${{p.correctOption}}. ${{p.explanation}}`;
      }}
      updateHud(); updateArenaHud(); renderQuestsAndLevel();
    }};
    box.appendChild(b);
  }});
}}
function nextParticle() {{ prtIdx++; renderParticle(); }}

// Batchim Modal
let batchimTabIdx = 0;
function openBatchimModal() {{ $('batchimModal').classList.add('open'); renderBatchimModal(); }}
function closeBatchimModal() {{ $('batchimModal').classList.remove('open'); }}
function renderBatchimModal() {{
  const tabs = $('batchimTabs'), body = $('batchimContent');
  tabs.innerHTML = '';
  BOOT.batchimGuide.forEach((sec, idx) => {{
    const b = document.createElement('button');
    b.className = idx === batchimTabIdx ? 'active' : '';
    b.textContent = sec.badge;
    b.onclick = () => {{ batchimTabIdx = idx; renderBatchimModal(); }};
    tabs.appendChild(b);
  }});
  const curSec = BOOT.batchimGuide[batchimTabIdx];
  body.innerHTML = `
    <div style="padding:14px;border-radius:16px;background:var(--surface-soft);border:1px solid var(--border);margin-bottom:12px">
      <div style="font-size:16px;font-weight:800">${{curSec.title}}</div>
      <div style="font-size:13px;color:var(--muted);margin-top:4px">${{curSec.summary}}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${{curSec.examples.map(ex => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;border:1px solid var(--border);background:var(--surface)">
          <div>
            <div><strong style="font-size:20px">${{ex.korean}}</strong> <span style="font-size:12px;font-weight:800;color:var(--blue);margin-left:6px">${{ex.pronounced}} · ${{ex.roman}}</span></div>
            <div style="font-size:13px;font-weight:700;margin-top:2px">${{ex.meaning}}</div>
            <div style="font-size:12px;color:var(--muted);margin-top:2px">${{ex.note}}</div>
          </div>
          <button class="btn-sec" style="padding:7px 12px;font-size:12px;flex-shrink:0" onclick="speakCur('${{ex.korean.replace(/'/g, '')}}')">Dengar</button>
        </div>
      `).join('')}}
    </div>`;
}}

// Leaderboard Loader
async function loadLeaderboard() {{
  try {{
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    const box = $('leaderboardRows');
    if (!box) return;
    const rows = data.leaderboard || [];
    if (!rows.length) {{
      box.innerHTML = '<div style="padding:28px 16px;text-align:center;border-radius:16px;border:1px dashed var(--border);color:var(--muted);font-size:13px">Papan peringkat masih kosong. Masuk atau daftar akun lalu kumpulkan XP pertama Anda!</div>';
      return;
    }}
    box.innerHTML = rows.map(row => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:16px;border:1px solid var(--border);background:${{currentUser && currentUser.id === row.id ? 'color-mix(in srgb, var(--blue) 12%, var(--surface))' : 'var(--surface-soft)'}}">
        <div style="display:flex;align-items:center;gap:12px">
          <strong style="width:28px;text-align:center;color:${{row.rank<=3?'var(--amber)':'var(--muted)'}}">#${{row.rank}}</strong>
          <div>
            <div style="font-weight:800;font-size:14px">${{row.name}} ${{row.isPro ? '<span style="font-size:10px;padding:2px 6px;border-radius:6px;background:var(--emerald);color:#fff;margin-left:4px">PRO</span>' : ''}}</div>
            <div style="font-size:11px;color:var(--muted)">Lv.${{row.level}} · Streak ${{row.dailyStreak}} hari · Combo ${{row.bestStreak}}</div>
          </div>
        </div>
        <strong style="font-size:15px;color:var(--blue)" class="num">${{row.xp}} XP</strong>
      </div>
    `).join('');
  }} catch (e) {{}}
}}

// Syllable Builder Mode
const PY_CHOSEONG = [[18,'ㅎ'],[0,'ㄱ'],[2,'ㄴ'],[3,'ㄷ'],[5,'ㄹ'],[6,'ㅁ'],[7,'ㅂ'],[9,'ㅅ'],[11,'ㅇ'],[12,'ㅈ']];
const PY_JUNGSEONG = [[0,'ㅏ'],[4,'ㅓ'],[8,'ㅗ'],[13,'ㅜ'],[18,'ㅡ'],[20,'ㅣ'],[6,'ㅕ']];
const PY_JONGSEONG = [[0,'—'],[1,'ㄱ'],[4,'ㄴ'],[8,'ㄹ'],[16,'ㅁ'],[17,'ㅂ'],[21,'ㅇ']];
let bldL = 18, bldV = 0, bldT = 0, bldPuzzleIdx = 0;

function initBuilderRacks() {{
  const makeRack = (id, list, curVal, onPick) => {{
    const el = $(id); el.innerHTML = '';
    list.forEach(([idx, ch]) => {{
      const b = document.createElement('button');
      b.className = 'jamo-btn' + (curVal === idx ? ' active' : '');
      b.textContent = ch;
      b.onclick = () => {{ onPick(idx); updateBuilderPreview(); initBuilderRacks(); }};
      el.appendChild(b);
    }});
  }};
  makeRack('bldRackL', PY_CHOSEONG, bldL, v => bldL = v);
  makeRack('bldRackV', PY_JUNGSEONG, bldV, v => bldV = v);
  makeRack('bldRackT', PY_JONGSEONG, bldT, v => bldT = v);
  updateBuilderPreview();
}}
function updateBuilderPreview() {{
  const ch = String.fromCharCode(0xAC00 + (bldL * 21 + bldV) * 28 + bldT);
  $('bldPreview').textContent = ch;
  const p = BOOT.syllablePuzzles[bldPuzzleIdx % BOOT.syllablePuzzles.length];
  $('bldTargetTitle').textContent = `${{p.char}} ("${{p.roman}}") · ${{p.meaning}}`;
  $('bldTargetHint').textContent = 'Petunjuk: ' + p.hint;
}}
function checkBuilder() {{
  const ch = $('bldPreview').textContent;
  const p = BOOT.syllablePuzzles[bldPuzzleIdx % BOOT.syllablePuzzles.length];
  if (ch === p.char) {{
    xp += 10; rightAns++; totalAns++; questCorrect++; questBuilder++;
    recordDailyActivity();
    $('bldFeedback').style.color = 'var(--emerald)';
    $('bldFeedback').textContent = `Sempurna! "${{p.char}}" (${{p.roman}}) berhasil dirakit (+10 XP).`;
    speakCur(p.char); updateHud(); updateArenaHud(); renderQuestsAndLevel();
  }} else {{
    $('bldFeedback').style.color = 'var(--rose)';
    $('bldFeedback').textContent = `Blok sekarang "${{ch}}". Coba lagi (${{p.hint}}).`;
  }}
}}
function nextBuilderTarget() {{
  bldPuzzleIdx++; bldT = 0; $('bldFeedback').textContent = ''; initBuilderRacks();
}}

// Match Pairs Mode
let matchPickL = null, matchPickR = null, matchDone = {{}};
function formatMatchRight(c) {{
  return (c.m.startsWith('Konsonan') || c.m.startsWith('Vokal')) ? (c.c + ' · ' + c.m) : c.m;
}}
function startMatchRound() {{
  const shuffled = [...getPool()].sort(() => Math.random() - 0.5);
  const pool = [];
  const seenR = new Set();
  for (const c of shuffled) {{
    const r = formatMatchRight(c);
    if (!seenR.has(r)) {{
      seenR.add(r);
      pool.push(c);
    }}
    if (pool.length >= 5) break;
  }}
  matchDone = {{}}; matchPickL = null; matchPickR = null;
  $('matchFeedback').textContent = '';
  const left = [...pool], right = [...pool].sort(() => Math.random() - 0.5);
  $('matchLeftCol').innerHTML = ''; $('matchRightCol').innerHTML = '';
  left.forEach(c => {{
    const b = document.createElement('button');
    b.className = 'quiz-opt'; b.id = 'mL-' + c.id; b.textContent = c.h;
    b.onclick = () => {{ if (matchDone[c.id]) return; matchPickL = c; speakCur(c.h); tryMatchPair(); }};
    $('matchLeftCol').appendChild(b);
  }});
  right.forEach(c => {{
    const b = document.createElement('button');
    b.className = 'quiz-opt'; b.id = 'mR-' + c.id; b.textContent = formatMatchRight(c);
    b.onclick = () => {{ if (matchDone[c.id]) return; matchPickR = c; tryMatchPair(); }};
    $('matchRightCol').appendChild(b);
  }});
}}
function tryMatchPair() {{
  if (!matchPickL || !matchPickR) return;
  if (matchPickL.id === matchPickR.id) {{
    matchDone[matchPickL.id] = true;
    $('mL-' + matchPickL.id).classList.add('ok');
    $('mR-' + matchPickR.id).classList.add('ok');
    xp += 4; questCorrect++;
    recordDailyActivity();
    if (Object.keys(matchDone).length >= 5) {{
      questPair++;
      $('matchFeedback').style.color = 'var(--emerald)';
      $('matchFeedback').textContent = 'Semua pasangan cocok! (+20 XP bonus sesi)';
    }}
    matchPickL = null; matchPickR = null;
    updateHud(); renderQuestsAndLevel();
  }} else {{
    $('matchFeedback').style.color = 'var(--rose)';
    $('matchFeedback').textContent = 'Belum cocok, coba pasangan lain!';
    matchPickL = null; matchPickR = null;
  }}
}}

// Sentence Scramble Mode
let sentIdx = 0, sentPicked = [], sentBankList = [];
function renderSentence() {{
  const p = BOOT.sentencePuzzles[sentIdx % BOOT.sentencePuzzles.length];
  const locked = p.tier === 'pro' && !effectivePro();
  $('sentPromptBox').innerHTML = `<div style="font-size:12px;color:var(--blue);font-weight:700">${{p.topic}} ${{locked?'(Pro)':''}}</div><div style="font-size:18px;font-weight:800;margin-top:4px">"${{p.meaning}}"</div>`;
  sentPicked = []; sentBankList = [...p.tokens].sort(() => Math.random() - 0.5);
  $('sentFeedback').textContent = locked ? 'Aktifkan Mode Pro untuk membuka kalimat tematik ini.' : '';
  drawSentenceBoxes(locked);
}}
function drawSentenceBoxes(locked) {{
  $('sentTray').innerHTML = '';
  sentPicked.forEach((t, idx) => {{
    const b = document.createElement('button');
    b.className = 'jamo-btn active'; b.textContent = t;
    b.onclick = () => {{ sentPicked.splice(idx, 1); drawSentenceBoxes(locked); }};
    $('sentTray').appendChild(b);
  }});
  $('sentBank').innerHTML = '';
  sentBankList.forEach(t => {{
    const b = document.createElement('button');
    b.className = 'jamo-btn'; b.textContent = t;
    b.disabled = locked || sentPicked.includes(t);
    b.onclick = () => {{ sentPicked.push(t); speakCur(t); drawSentenceBoxes(locked); }};
    $('sentBank').appendChild(b);
  }});
}}
function checkSentence() {{
  const p = BOOT.sentencePuzzles[sentIdx % BOOT.sentencePuzzles.length];
  if (p.tier === 'pro' && !effectivePro()) {{ openPaywall('Kalimat Eksklusif Pro', p.meaning); return; }}
  const ok = sentPicked.length === p.tokens.length && sentPicked.every((t, i) => t === p.tokens[i]);
  if (ok) {{
    xp += 12; rightAns++; totalAns++; questCorrect++; questBuilder++;
    recordDailyActivity();
    $('sentFeedback').style.color = 'var(--emerald)';
    $('sentFeedback').textContent = `Tepat sekali! "${{p.korean}}" (+12 XP) · ${{p.tip}}`;
    speakCur(p.korean); updateHud(); updateArenaHud(); renderQuestsAndLevel();
  }} else {{
    $('sentFeedback').style.color = 'var(--rose)';
    $('sentFeedback').textContent = 'Urutan kata belum tepat. ' + p.tip;
  }}
}}
function resetSentence() {{ sentPicked = []; $('sentFeedback').textContent = ''; drawSentenceBoxes(false); }}
function nextSentence() {{ sentIdx++; renderSentence(); }}

syncAuthUi();
renderSoundboard();
renderQuestsAndLevel();
renderQuiz();
nextCard();
</script>
</body>
</html>"""


# ==============================================================================
# 3. PYTHON HTTP HANDLER (SERVER & REST API)
# ==============================================================================

class HangeulHandler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0 or length > 1048576:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw) if raw else {}

    def _authenticate(self):
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return None, None
        token = auth[7:].strip()
        payload = _verify_token(token)
        if not payload:
            return None, None
        user = next((u for u in AUTH_STORE["users"] if u["id"] == payload.get("sub")), None)
        return (_sanitize_user(user), payload) if user else (None, None)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/":
            page = render_website_html().encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(page)))
            self.end_headers()
            self.wfile.write(page)
            return

        if parsed.path == "/api/auth/me":
            user, _ = self._authenticate()
            if not user:
                self._send_json(401, {"error": "Sesi tidak ditemukan atau sudah berakhir."})
                return
            self._send_json(200, {"user": user})
            return

        if parsed.path == "/api/modules":
            self._send_json(200, {"modules": CURRICULUM_MODULES})
            return

        if parsed.path == "/api/leaderboard":
            self._send_json(200, {"leaderboard": build_leaderboard()})
            return

        self.send_response(404)
        self.end_headers()

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/progress":
            user, _ = self._authenticate()
            if not user:
                self._send_json(401, {"error": "Sesi tidak ditemukan."})
                return
            data = self._read_json_body()
            for u in AUTH_STORE["users"]:
                if u["id"] == user["id"]:
                    cur = _sanitize_progress(u.get("progress"), bool(u.get("isPro")))
                    inc = _sanitize_progress(data, bool(u.get("isPro")))
                    cur["xp"] = max(cur["xp"], inc["xp"])
                    cur["bestStreak"] = max(cur["bestStreak"], inc["bestStreak"])
                    cur["dailyStreak"] = max(cur["dailyStreak"], inc["dailyStreak"])
                    if inc["lastActiveDate"]:
                        cur["lastActiveDate"] = inc["lastActiveDate"]
                    cur["streakFreezeCount"] = max(2 if u.get("isPro") else 0, inc["streakFreezeCount"])
                    cur["favorites"] = list(dict.fromkeys(inc["favorites"]))
                    u["progress"] = cur
                    user = _sanitize_user(u)
                    break
            _save_auth_store()
            self._send_json(200, {"user": user})
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        data = self._read_json_body()

        if parsed.path == "/api/auth/register":
            name = str(data.get("name", "")).strip()
            email = str(data.get("email", "")).strip().lower()
            pw = str(data.get("password", ""))
            if len(name) < 2 or "@" not in email or len(pw) < 6:
                self._send_json(400, {"error": "Nama, email valid, dan kata sandi min. 6 karakter wajib diisi."})
                return
            if any(u["email"].lower() == email for u in AUTH_STORE["users"]):
                self._send_json(409, {"error": "Email sudah terdaftar."})
                return
            new_user = {
                "id": f"usr-{secrets.token_hex(4)}",
                "name": name,
                "email": email,
                "isPro": False,
                "planCycle": "free",
                "passwordHash": _hash_password(pw),
                "createdAt": datetime.date.today().isoformat(),
                "progress": _sanitize_progress(data.get("initialProgress"), False),
            }
            AUTH_STORE["users"].insert(0, new_user)
            _save_auth_store()
            tok = _sign_token(new_user["id"], new_user["email"], new_user["name"])
            self._send_json(201, {"token": tok, "user": _sanitize_user(new_user)})
            return

        if parsed.path == "/api/auth/login":
            email = str(data.get("email", "")).strip().lower()
            pw = str(data.get("password", ""))
            user = next((u for u in AUTH_STORE["users"] if u["email"].lower() == email), None)
            if not user or not _verify_password(pw, user.get("passwordHash", "")):
                self._send_json(401, {"error": "Email atau kata sandi salah."})
                return
            tok = _sign_token(user["id"], user["email"], user["name"])
            self._send_json(200, {"token": tok, "user": _sanitize_user(user)})
            return

        if parsed.path == "/api/auth/logout":
            _, payload = self._authenticate()
            if payload and payload.get("jti"):
                REVOKED_TOKENS.add(payload["jti"])
            self._send_json(200, {"ok": True})
            return

        if parsed.path == "/api/transactions/checkout":
            user, _ = self._authenticate()
            if not user:
                self._send_json(401, {"error": "Silakan masuk terlebih dahulu."})
                return
            plan = "monthly" if data.get("plan") == "monthly" else "annual"
            method = str(data.get("method", "QRIS Instan")).strip() or "QRIS Instan"
            amount = PLAN_PRICES[plan]["amount"]
            tx = {
                "id": f"INV-{datetime.date.today().year}-{len(AUTH_STORE['transactions']) + 1:03d}",
                "userId": user["id"],
                "buyerName": user["name"],
                "buyerEmail": user["email"],
                "plan": plan,
                "planLabel": PLAN_PRICES[plan]["label"],
                "amountIdr": amount,
                "method": method,
                "status": "paid",
                "createdAt": datetime.date.today().isoformat(),
            }
            AUTH_STORE["transactions"].insert(0, tx)
            for u in AUTH_STORE["users"]:
                if u["id"] == user["id"]:
                    u["isPro"] = True
                    u["planCycle"] = plan
                    p = _sanitize_progress(u.get("progress"), True)
                    p["streakFreezeCount"] = max(2, p["streakFreezeCount"])
                    u["progress"] = p
                    user = _sanitize_user(u)
                    break
            _save_auth_store()
            self._send_json(201, {"transaction": tx, "user": user})
            return

        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        print(f"[Hangeul.me Python] {self.address_string()} - {format % args}")


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    print(f"Server website Python Hangeul.me berjalan di http://localhost:{PORT}")
    if os.environ.get("NO_BROWSER") != "1":
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except Exception:
            pass
    with socketserver.TCPServer(("", PORT), HangeulHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")
