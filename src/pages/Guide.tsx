import { Link } from "react-router-dom";
import { LandingNavbar } from "@/features/landing/LandingNavbar";
import { LandingFooter } from "@/features/landing/LandingFooter";
import { SEO } from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Shield, UserCog, GraduationCap, Eye, ArrowLeft, CheckCircle2, Lightbulb } from "lucide-react";

interface Step {
  title: string;
  description: string;
  details?: string[];
}

interface RoleGuide {
  title: string;
  intro: string;
  steps: Step[];
  tips: string[];
}

const adminGuide: RoleGuide = {
  title: "Panduan untuk Admin",
  intro:
    "Admin memiliki akses penuh ke seluruh sistem MagangKUM, termasuk mengelola lowongan, lamaran, peserta magang, pembimbing, absensi, laporan, dan semua pengguna.",
  steps: [
    {
      title: "Masuk ke Dasbor",
      description: "Setelah login, Anda akan diarahkan ke Dasbor admin yang menampilkan ringkasan statistik platform.",
      details: [
        "Lihat jumlah lowongan aktif, total pelamar, dan pelamar diterima",
        "Pantau grafik tren pendaftaran 7 hari terakhir dan distribusi status lamaran",
        "Akses cepat ke semua modul melalui sidebar",
      ],
    },
    {
      title: "Mengelola Lowongan (Posisi)",
      description: "Buat, edit, atau hapus lowongan magang melalui menu 'Posisi'.",
      details: [
        "Klik tombol 'Tambah Posisi' untuk membuat lowongan baru",
        "Isi judul, departemen, lokasi, deskripsi, persyaratan, kuota, dan deadline",
        "Atur status 'open' agar lowongan tampil di halaman publik landing",
        "Edit atau hapus lowongan kapan saja melalui ikon aksi di tabel",
        "Sistem otomatis menampilkan badge 'Kuota Penuh' jika kuota tercapai",
      ],
    },
    {
      title: "Meninjau Lamaran",
      description: "Tinjau seluruh lamaran yang masuk melalui menu 'Lamaran'.",
      details: [
        "Lihat detail pelamar, unduh CV, dan Surat Keterangan Sekolah",
        "Ubah status: Pending, Reviewing, Accepted, atau Rejected",
        "Atur tanggal mulai, tanggal berakhir, dan penempatan saat menerima lamaran",
        "Tambahkan catatan peninjau untuk dokumentasi",
        "Gunakan kolom pencarian dan paginasi untuk mempermudah peninjauan",
      ],
    },
    {
      title: "Mengelola Peserta Magang",
      description: "Tambah dan kelola data peserta magang di menu 'Magang'.",
      details: [
        "Tambah peserta secara manual jika datanya berasal dari luar sistem lamaran",
        "Atur nama, asal, jurusan, penempatan, tanggal mulai, dan tanggal berakhir",
        "Ubah status menjadi 'Aktif' atau 'Selesai' sesuai progres",
      ],
    },
    {
      title: "Memantau Absensi",
      description: "Pantau absensi semua peserta magang melalui menu 'Absensi'.",
      details: [
        "Pilih peserta magang dari combobox untuk melihat kalender absensinya",
        "Edit jam masuk/keluar tiap tanggal jika diperlukan",
        "Gunakan mode bulk untuk mengatur absensi banyak tanggal sekaligus untuk semua magang",
        "Pilih 'Semua hari kerja' untuk seleksi cepat (mengabaikan akhir pekan & libur)",
      ],
    },
    {
      title: "Memantau Laporan Harian",
      description: "Akses laporan harian semua peserta melalui menu 'Laporan'.",
      details: [
        "Lihat aktivitas, kendala, dan rencana esok hari dari setiap peserta",
        "Filter berdasarkan tanggal atau peserta tertentu",
      ],
    },
    {
      title: "Mengelola Pengguna & Role",
      description: "Kelola akun pengguna dan atur role mereka di menu 'Pengguna'.",
      details: [
        "Ubah role pengguna: Admin, Peninjau, Pembimbing, atau Pelamar",
        "Hapus akun yang tidak aktif",
        "Tugaskan pembimbing untuk peserta magang tertentu (relasi pembimbing-magang)",
      ],
    },
  ],
  tips: [
    "Selalu periksa lamaran baru secara berkala agar pelamar tidak menunggu terlalu lama",
    "Pastikan kuota lowongan sesuai dengan kapasitas penempatan masing-masing divisi",
    "Tetapkan pembimbing segera setelah peserta diterima agar pemantauan berjalan lancar",
  ],
};

const reviewerGuide: RoleGuide = {
  title: "Panduan untuk Peninjau (Reviewer)",
  intro:
    "Sebagai Peninjau, tugas utama Anda adalah meninjau lamaran magang yang masuk dan menentukan status penerimaan. Anda tidak dapat membuat lowongan atau mengelola pengguna.",
  steps: [
    {
      title: "Masuk ke Dasbor",
      description: "Setelah login, Anda diarahkan ke Dasbor dengan ringkasan lamaran yang perlu ditinjau.",
      details: ["Pantau jumlah lamaran berstatus pending dan reviewing", "Akses menu 'Lamaran' untuk mulai meninjau"],
    },
    {
      title: "Meninjau Lamaran",
      description: "Buka menu 'Lamaran' untuk melihat seluruh lamaran yang masuk.",
      details: [
        "Klik tombol pensil pada baris lamaran untuk membuka dialog peninjauan",
        "Unduh CV dan Surat Keterangan Sekolah pelamar",
        "Ubah status menjadi Reviewing (sedang ditinjau), Accepted, atau Rejected",
        "Saat menerima lamaran, isi tanggal mulai, tanggal berakhir, dan penempatan",
        "Tulis catatan peninjau sebagai dokumentasi keputusan",
      ],
    },
    {
      title: "Memantau Status",
      description: "Gunakan filter pencarian untuk menemukan lamaran tertentu.",
      details: [
        "Cari berdasarkan nama pelamar atau posisi",
        "Pantau Status Tracker untuk melihat progres tiap lamaran",
      ],
    },
  ],
  tips: [
    "Berikan catatan peninjau yang jelas agar admin & pelamar paham keputusan Anda",
    "Pastikan kuota posisi belum penuh sebelum menerima lamaran",
    "Gunakan status 'Reviewing' untuk lamaran yang masih perlu pertimbangan lebih lanjut",
  ],
};

const supervisorGuide: RoleGuide = {
  title: "Panduan untuk Pembimbing",
  intro:
    "Sebagai Pembimbing, Anda dapat memantau peserta magang yang ditugaskan oleh admin kepada Anda — termasuk profil, absensi, dan laporan harian mereka, semua dalam satu halaman.",
  steps: [
    {
      title: "Masuk ke Dasbor Pembimbing",
      description: "Setelah login, Anda akan melihat ringkasan jumlah peserta magang yang ditugaskan kepada Anda.",
      details: ["Akses menu 'Magang' di sidebar untuk melihat daftar peserta yang dibimbing"],
    },
    {
      title: "Memilih Peserta Magang",
      description: "Pilih peserta magang dari daftar untuk melihat detail lengkap.",
      details: [
        "Klik salah satu kartu peserta untuk membuka halaman detail",
        "Halaman detail berisi 3 tab: Profil, Absensi, dan Laporan",
      ],
    },
    {
      title: "Memantau Absensi",
      description: "Tab 'Absensi' menampilkan riwayat kehadiran peserta dalam tabel.",
      details: [
        "Lihat tanggal, jam masuk, dan jam keluar setiap hari",
        "Identifikasi peserta yang sering absen atau terlambat",
        "Gunakan paginasi untuk navigasi data yang banyak",
      ],
    },
    {
      title: "Membaca Laporan Harian",
      description: "Tab 'Laporan' menampilkan laporan harian peserta magang.",
      details: [
        "Baca aktivitas, kendala, dan rencana esok hari dari peserta",
        "Berikan masukan langsung secara informal kepada peserta",
      ],
    },
    {
      title: "Memantau Profil Peserta",
      description: "Tab 'Profil' berisi informasi lengkap peserta magang.",
      details: [
        "Lihat asal sekolah/kampus dan jurusan",
        "Pantau periode magang (tanggal mulai dan berakhir) serta penempatan",
      ],
    },
  ],
  tips: [
    "Pantau absensi & laporan secara berkala minimal seminggu sekali",
    "Catat perkembangan peserta untuk evaluasi akhir",
    "Hubungi admin jika menemukan kendala dengan peserta tertentu",
  ],
};

const internGuide: RoleGuide = {
  title: "Panduan untuk Peserta Magang (Pelamar)",
  intro:
    "Sebagai Pelamar/Peserta Magang, Anda dapat melamar lowongan, mengisi absensi harian (clock in/out), mengirim laporan harian, dan mengunduh sertifikat setelah magang dimulai.",
  steps: [
    {
      title: "Mendaftar & Membuat Akun",
      description: "Buat akun terlebih dahulu untuk dapat melamar lowongan magang.",
      details: [
        "Klik tombol 'Masuk' di pojok kanan atas, lalu pilih tab 'Daftar'",
        "Isi nama lengkap, email, dan password (sistem mengecek kekuatan password)",
        "Setelah berhasil, Anda akan langsung diarahkan ke Dasbor",
      ],
    },
    {
      title: "Melengkapi Profil",
      description: "Lengkapi profil sebelum melamar agar lamaran Anda diproses dengan baik.",
      details: [
        "Buka menu 'Profil' melalui ikon avatar di pojok kanan atas",
        "Isi asal sekolah/kampus dan jurusan",
        "Unggah foto profil (opsional) — disimpan di bucket avatars",
        "Anda juga dapat mengubah password di halaman Profil",
      ],
    },
    {
      title: "Mencari & Melamar Lowongan",
      description: "Telusuri lowongan yang tersedia dan kirimkan lamaran.",
      details: [
        "Buka menu 'Posisi' untuk melihat daftar lowongan aktif",
        "Klik posisi yang diminati untuk melihat detail (deskripsi & persyaratan)",
        "Klik 'Lamar', tulis cover letter singkat, lalu unggah CV (PDF)",
        "Unggah Surat Keterangan Sekolah (PDF/Word, maks 10 MB)",
        "Kirim lamaran dan tunggu peninjauan dari admin/peninjau",
        "Catatan: posisi dengan badge 'Kuota Penuh' tidak dapat dilamar",
      ],
    },
    {
      title: "Memantau Status Lamaran",
      description: "Pantau perkembangan lamaran Anda di menu 'Lamaran Saya'.",
      details: [
        "Status: Pending (menunggu), Reviewing (sedang ditinjau), Accepted (diterima), Rejected (ditolak)",
        "Lihat catatan dari peninjau jika tersedia",
        "Notifikasi otomatis muncul saat status berubah (real-time)",
      ],
    },
    {
      title: "Mengisi Absensi Harian",
      description: "Setelah diterima dan periode magang dimulai, isi absensi setiap hari kerja.",
      details: [
        "Buka menu 'Absensi' — tampil dalam bentuk kalender bulanan",
        "Klik 'Clock In' saat tiba dan 'Clock Out' saat pulang (hanya hari kerja)",
        "Akhir pekan & tanggal libur otomatis dinonaktifkan",
        "Anda hanya bisa absen mulai dari tanggal mulai magang yang ditetapkan",
      ],
    },
    {
      title: "Mengirim Laporan Harian",
      description: "Kirim laporan kegiatan setiap hari sebagai dokumentasi magang.",
      details: [
        "Buka menu 'Laporan'",
        "Isi kegiatan hari ini, kendala (opsional), dan rencana untuk besok",
        "Simpan laporan; bisa diedit kembali jika diperlukan",
      ],
    },
    {
      title: "Mengunduh Sertifikat",
      description: "Setelah ada minimal 1 absensi tercatat, menu 'Sertifikat' akan otomatis muncul di sidebar.",
      details: [
        "Pastikan status lamaran 'Accepted' dan minimal ada 1 absensi tercatat",
        "Buka menu 'Sertifikat' di sidebar",
        "Klik 'Unduh Sertifikat PDF' untuk menyimpan sertifikat resmi",
        "Sertifikat memuat nama, periode magang, dan nama pembimbing (jika ada)",
      ],
    },
  ],
  tips: [
    "Lengkapi profil sebelum melamar untuk meningkatkan peluang diterima",
    "Isi absensi & laporan harian secara konsisten — keduanya menjadi syarat sertifikat",
    "Tulis cover letter yang jelas dan personal untuk setiap lamaran",
  ],
};

function GuideContent({ guide }: { guide: RoleGuide }) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/50 bg-primary/5 p-6">
        <p className="text-sm leading-relaxed text-foreground sm:text-base">{guide.intro}</p>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-foreground sm:text-xl">Langkah-langkah Penggunaan</h3>
        <Accordion type="single" collapsible defaultValue="step-0" className="space-y-3">
          {guide.steps.map((step, i) => (
            <AccordionItem
              key={i}
              value={`step-${i}`}
              className="rounded-xl border border-border/50 bg-card px-4 sm:px-5"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-foreground sm:text-base">{step.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-10">
                <p className="mb-3 text-sm text-muted-foreground">{step.description}</p>
                {step.details && (
                  <ul className="space-y-2">
                    {step.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-bold text-foreground">Tips Berguna</h4>
          </div>
          <ul className="space-y-2">
            {guide.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Guide() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Panduan Pengguna MagangKUM | Magang Kemenkum Riau" description="Panduan lengkap menggunakan platform MagangKUM untuk pelamar, admin, reviewer, dan supervisor program magang." />
      <LandingNavbar />

      <section className="border-b border-border/50 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-20">
          <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground sm:h-14 sm:w-14">
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Panduan</h1>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                Panduan lengkap penggunaan sistem MagangKUM untuk semua pengguna.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
          <Tabs defaultValue="intern" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-4">
              <TabsTrigger
                value="intern"
                className="flex items-center gap-2 rounded-xl border border-border bg-card py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Peserta Magang</span>
              </TabsTrigger>
              <TabsTrigger
                value="supervisor"
                className="flex items-center gap-2 rounded-xl border border-border bg-card py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <UserCog className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Pembimbing</span>
              </TabsTrigger>
              <TabsTrigger
                value="reviewer"
                className="flex items-center gap-2 rounded-xl border border-border bg-card py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Eye className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Peninjau</span>
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="flex items-center gap-2 rounded-xl border border-border bg-card py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Shield className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Admin</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="intern" className="mt-0">
                <h2 className="mb-2 text-2xl font-bold text-foreground">{internGuide.title}</h2>
                <GuideContent guide={internGuide} />
              </TabsContent>
              <TabsContent value="supervisor" className="mt-0">
                <h2 className="mb-2 text-2xl font-bold text-foreground">{supervisorGuide.title}</h2>
                <GuideContent guide={supervisorGuide} />
              </TabsContent>
              <TabsContent value="reviewer" className="mt-0">
                <h2 className="mb-2 text-2xl font-bold text-foreground">{reviewerGuide.title}</h2>
                <GuideContent guide={reviewerGuide} />
              </TabsContent>
              <TabsContent value="admin" className="mt-0">
                <h2 className="mb-2 text-2xl font-bold text-foreground">{adminGuide.title}</h2>
                <GuideContent guide={adminGuide} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
