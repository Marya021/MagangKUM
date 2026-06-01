import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, BookOpen, CalendarClock, Sparkles, AlertCircle, Trophy } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { InternDashboardData } from "./hooks";

const QUOTES: { text: string; author: string }[] = [
  { text: "Hari ini adalah kesempatan baru untuk belajar sesuatu yang berharga.", author: "MagangKUM" },
  { text: "Pengalaman terbaik datang dari ketekunan menyelesaikan hal-hal kecil.", author: "Anonim" },
  { text: "Bukan seberapa cepat kamu berlari, tapi seberapa konsisten kamu melangkah.", author: "Anonim" },
  { text: "Belajar adalah investasi terbaik untuk masa depan.", author: "Benjamin Franklin" },
  { text: "Setiap ahli pernah menjadi pemula. Teruslah bertanya.", author: "Anonim" },
  { text: "Disiplin adalah jembatan antara tujuan dan pencapaian.", author: "Jim Rohn" },
  { text: "Jangan menunggu sempurna. Mulai dulu, lalu perbaiki.", author: "Anonim" },
  { text: "Catatan hari ini adalah peta untuk perjalanan esok.", author: "MagangKUM" },
  { text: "Profesionalisme lahir dari kebiasaan kecil yang dilakukan setiap hari.", author: "Anonim" },
  { text: "Yang berkualitas selalu berasal dari proses yang sabar.", author: "Anonim" },
  { text: "Tidak ada usaha yang sia-sia, semua adalah pelajaran.", author: "Anonim" },
  { text: "Magang bukan tentang tugas, tapi tentang membentuk dirimu sendiri.", author: "MagangKUM" },
  { text: "Kerja keras mengalahkan bakat, ketika bakat tidak bekerja keras.", author: "Tim Notke" },
  { text: "Lakukan dengan sepenuh hati, atau jangan sama sekali.", author: "Anonim" },
];

function quoteOfTheDay() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return QUOTES[day % QUOTES.length];
}

interface Props {
  data: InternDashboardData;
  userName: string;
  greeting: string;
}

export function InternDashboard({ data, userName, greeting }: Props) {
  const quote = useMemo(quoteOfTheDay, []);
  const startLabel = data.startDate ? format(parseISO(data.startDate), "d MMM yyyy", { locale: idLocale }) : "-";
  const endLabel = data.endDate ? format(parseISO(data.endDate), "d MMM yyyy", { locale: idLocale }) : "-";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary/80 p-6 text-primary-foreground">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h1 className="text-2xl font-bold">
            {greeting}{userName ? `, ${userName}` : ""}! 👋
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/85">
            Terus semangat dan jadikan setiap hari bermakna.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <CalendarClock className="h-3.5 w-3.5" />
            {startLabel} – {endLabel}
          </div>
        </div>
      </div>

      {/* Today reminder */}
      {data.todayIsWorkday && !data.todayHasJournal && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4"
        >
          <div className="rounded-full bg-warning/20 p-2">
            <AlertCircle className="h-4 w-4 text-warning" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Jurnal hari ini belum diisi</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Catat kegiatanmu hari ini agar progres magangmu tetap tercatat rapi.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/daily-reports">Isi sekarang</Link>
          </Button>
        </motion.div>
      )}

      {data.todayIsWorkday && data.todayHasJournal && (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
          <div className="rounded-full bg-success/20 p-2">
            <Trophy className="h-4 w-4 text-success" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Jurnal hari ini sudah diisi. Kerja bagus! 🎉
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="stat-card-accent accent-primary border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kehadiran</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CalendarCheck2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{data.attendanceRate}%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.attendancePresent} dari {data.attendanceExpected} hari kerja
            </p>
            <Progress value={data.attendanceRate} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="stat-card-accent accent-success border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jurnal Kegiatan</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <BookOpen className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{data.journalCount}</span>
              <span className="text-base text-muted-foreground">/ {data.journalExpected}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Jurnal tercatat</p>
            <Progress
              value={data.journalExpected ? (data.journalCount / data.journalExpected) * 100 : 0}
              className="mt-3 h-1.5"
            />
          </CardContent>
        </Card>

        <Card className="stat-card-accent accent-warning border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sisa Hari Magang</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <CalendarClock className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{data.daysRemaining}</span>
              <span className="text-base text-muted-foreground">hari</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Hari ke-{data.daysPassed} dari {data.totalDays}
            </p>
            <Progress value={data.progressPercent} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Quote of the day */}
      <Card className="card-clean overflow-hidden border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Quote Hari Ini
          </CardTitle>
          <CardDescription>Inspirasi untuk hari yang produktif</CardDescription>
        </CardHeader>
        <CardContent>
          <blockquote className="border-l-4 border-primary/60 pl-4 italic text-foreground">
            "{quote.text}"
          </blockquote>
          <p className="mt-2 text-right text-sm text-muted-foreground">— {quote.author}</p>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild variant="outline" className="justify-start">
          <Link to="/attendance">
            <CalendarCheck2 className="mr-2 h-4 w-4" />
            Absensi
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link to="/daily-reports">
            <BookOpen className="mr-2 h-4 w-4" />
            Jurnal Kegiatan
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link to="/certificate">
            <Trophy className="mr-2 h-4 w-4" />
            Sertifikat
          </Link>
        </Button>
      </div>
    </div>
  );
}
