import {
  HelpCircle,
  UserPlus,
  FileText,
  CalendarCheck,
  Award,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface FAQ {
  q: string;
  a: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  items: FAQ[];
}

export const faqCategories: FAQCategory[] = [
  {
    id: "umum",
    title: "Umum",
    icon: HelpCircle,
    items: [
      {
        q: "Apa itu MagangKUM?",
        a: "MagangKUM adalah platform manajemen magang resmi Kementerian Hukum Wilayah Riau yang memudahkan proses pendaftaran, peninjauan lamaran, absensi, pelaporan harian, hingga penerbitan sertifikat magang secara digital.",
      },
      {
        q: "Apakah MagangKUM gratis digunakan?",
        a: "Ya, seluruh layanan MagangKUM dapat digunakan secara gratis baik oleh peserta magang, pembimbing, maupun pihak Kementerian Hukum.",
      },
      {
        q: "Siapa saja yang bisa menggunakan MagangKUM?",
        a: "Platform ini terbuka untuk siswa SMK, mahasiswa D3/S1, dan pelajar lain yang ingin melaksanakan magang di lingkungan Kementerian Hukum Wilayah Riau, beserta admin, peninjau, dan pembimbing internal.",
      },
      {
        q: "Apakah saya bisa melamar lebih dari satu posisi?",
        a: "Bisa, selama posisi tersebut masih dalam status terbuka dan kuotanya belum penuh. Pantau status setiap lamaran melalui menu 'Lamaran Saya'.",
      },
    ],
  },
  {
    id: "pendaftaran",
    title: "Pendaftaran & Akun",
    icon: UserPlus,
    items: [
      {
        q: "Bagaimana cara mendaftar akun MagangKUM?",
        a: "Klik tombol 'Masuk' di pojok kanan atas, pilih tab 'Daftar', kemudian isi nama lengkap, email, dan password. Setelah berhasil, Anda akan langsung masuk ke Dasbor.",
      },
      {
        q: "Saya lupa password, bagaimana cara mengaturnya kembali?",
        a: "Saat ini reset password dilakukan melalui admin. Hubungi tim MagangKUM untuk membantu memulihkan akses akun Anda.",
      },
      {
        q: "Apakah email saya perlu diverifikasi?",
        a: "Tidak. Sistem MagangKUM mengaktifkan auto-confirm email sehingga Anda bisa langsung login setelah pendaftaran.",
      },
      {
        q: "Bagaimana cara mengubah foto profil dan data diri?",
        a: "Buka menu 'Profil' melalui ikon avatar di pojok kanan atas. Anda dapat memperbarui nama, asal sekolah/kampus, jurusan, foto profil, dan password.",
      },
    ],
  },
  {
    id: "lamaran",
    title: "Lamaran Magang",
    icon: FileText,
    items: [
      {
        q: "Dokumen apa saja yang perlu disiapkan saat melamar?",
        a: "Anda perlu mengunggah CV/Resume dalam format PDF dan Surat Keterangan dari Sekolah/Kampus dalam format PDF atau Word (maksimal 10 MB).",
      },
      {
        q: "Apa arti status Pending, Reviewing, Accepted, dan Rejected?",
        a: "Pending: lamaran baru masuk. Reviewing: sedang ditinjau peninjau/admin. Accepted: lamaran diterima. Rejected: lamaran tidak lolos. Anda mendapat notifikasi otomatis saat status berubah.",
      },
      {
        q: "Mengapa saya tidak bisa melamar posisi tertentu?",
        a: "Posisi yang sudah penuh akan menampilkan badge 'Kuota Penuh' dan tidak dapat dilamar. Anda juga tidak bisa melamar posisi yang sudah Anda lamar sebelumnya.",
      },
      {
        q: "Berapa lama proses peninjauan lamaran?",
        a: "Waktu peninjauan bervariasi tergantung jumlah lamaran masuk, biasanya 3–7 hari kerja. Pantau status secara berkala di menu 'Lamaran Saya'.",
      },
    ],
  },
  {
    id: "absensi",
    title: "Absensi & Laporan",
    icon: CalendarCheck,
    items: [
      {
        q: "Kapan saya bisa mulai mengisi absensi?",
        a: "Absensi dapat diisi setelah status lamaran 'Accepted' dan tanggal mulai magang sudah tercapai. Akhir pekan dan tanggal libur otomatis dinonaktifkan.",
      },
      {
        q: "Apakah saya bisa mengisi absensi di hari sebelumnya?",
        a: "Tidak. Absensi hanya dapat diisi pada tanggal hari ini sesuai jadwal kerja. Hubungi admin jika ada koreksi yang perlu dilakukan.",
      },
      {
        q: "Apa yang harus diisi dalam laporan harian?",
        a: "Laporan harian terdiri dari kegiatan hari ini (wajib), kendala yang dihadapi (opsional), dan rencana untuk hari berikutnya. Laporan dapat diedit kapan saja.",
      },
      {
        q: "Apakah laporan harian wajib diisi setiap hari?",
        a: "Sangat disarankan. Konsistensi laporan menjadi salah satu indikator penilaian dan menjadi dokumentasi pengalaman magang Anda.",
      },
    ],
  },
  {
    id: "sertifikat",
    title: "Sertifikat",
    icon: Award,
    items: [
      {
        q: "Bagaimana cara mendapatkan sertifikat magang?",
        a: "Setelah lamaran 'Accepted' dan minimal terdapat 1 absensi tercatat, menu 'Sertifikat' akan otomatis muncul di sidebar. Klik 'Unduh Sertifikat PDF' untuk menyimpannya.",
      },
      {
        q: "Apa saja informasi yang tercantum dalam sertifikat?",
        a: "Sertifikat memuat nama lengkap peserta, periode magang (tanggal mulai & berakhir), penempatan divisi, serta nama pembimbing apabila telah ditugaskan.",
      },
      {
        q: "Apakah sertifikat ini resmi dari Kementerian Hukum?",
        a: "Ya, sertifikat diterbitkan secara digital melalui platform MagangKUM dan disahkan oleh Kantor Wilayah Kementerian Hukum Riau.",
      },
    ],
  },
  {
    id: "keamanan",
    title: "Keamanan & Privasi",
    icon: ShieldCheck,
    items: [
      {
        q: "Apakah data pribadi saya aman?",
        a: "Ya. MagangKUM menerapkan Row-Level Security (RLS) di database, sehingga setiap pengguna hanya dapat mengakses data miliknya. Dokumen lamaran disimpan di storage terenkripsi.",
      },
      {
        q: "Siapa saja yang bisa melihat CV dan dokumen saya?",
        a: "Hanya Anda sendiri, peninjau, dan admin yang dapat mengakses dokumen lamaran Anda. Pembimbing tidak memiliki akses ke dokumen lamaran.",
      },
      {
        q: "Bagaimana password saya dilindungi?",
        a: "Password disimpan dengan hashing aman dan dicek terhadap database kebocoran (HIBP) untuk memastikan password Anda tidak pernah bocor di internet.",
      },
    ],
  },
];

/** All FAQ items flattened, used for matching user free-text queries. */
export const allFaqs: FAQ[] = faqCategories.flatMap((c) => c.items);

/** Quick-question shortcuts surfaced on the welcome screen. */
export interface QuickQuestion {
  icon: LucideIcon;
  label: string;
  /** Question text used to find the matching FAQ. */
  match: string;
}

import { MessageSquare, Building2, Clock, Calendar } from "lucide-react";

export const quickQuestions: QuickQuestion[] = [
  { icon: MessageSquare, label: "Apa itu MagangKUM?", match: "Apa itu MagangKUM?" },
  { icon: FileText, label: "Bagaimana cara mendaftar magang?", match: "Bagaimana cara mendaftar akun MagangKUM?" },
  { icon: Building2, label: "Dokumen apa saja yang perlu disiapkan?", match: "Dokumen apa saja yang perlu disiapkan saat melamar?" },
  { icon: Clock, label: "Berapa lama proses peninjauan lamaran?", match: "Berapa lama proses peninjauan lamaran?" },
  { icon: Calendar, label: "Kapan saya bisa mulai mengisi absensi?", match: "Kapan saya bisa mulai mengisi absensi?" },
  { icon: Award, label: "Bagaimana cara mendapatkan sertifikat?", match: "Bagaimana cara mendapatkan sertifikat magang?" },
];

/**
 * Very small keyword-based matcher to find the most relevant FAQ
 * for a free-text user message. Returns null when no good match exists.
 */
export function findFaqAnswer(query: string): FAQ | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // Exact / substring match on question first
  const direct = allFaqs.find((f) => f.q.toLowerCase() === q);
  if (direct) return direct;

  // Tokenize and score by overlap with question + answer
  const stopwords = new Set([
    "apa", "itu", "yang", "dan", "atau", "di", "ke", "dari", "untuk", "dengan",
    "saya", "anda", "bagaimana", "kapan", "siapa", "kenapa", "mengapa", "berapa",
    "ya", "tidak", "bisa", "dapat", "harus", "akan", "the", "is", "a", "an",
  ]);
  const tokens = q
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !stopwords.has(t));

  if (tokens.length === 0) return null;

  let best: { faq: FAQ; score: number } | null = null;
  for (const faq of allFaqs) {
    const haystack = (faq.q + " " + faq.a).toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (haystack.includes(t)) score += 1;
      if (faq.q.toLowerCase().includes(t)) score += 1; // boost question match
    }
    if (!best || score > best.score) best = { faq, score };
  }

  if (!best || best.score < 2) return null;
  return best.faq;
}
