import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Download, Award, Loader2, Lock } from "lucide-react";
import { useCertificateProfile, useAttendanceDates, useSupervisorName } from "./hooks";
import { generateCertificatePdf, formatTanggalIndonesia } from "./utils";

export function CertificateContent() {
  const { user } = useAuth();
  const { data: profile } = useCertificateProfile(user?.id);
  const { data: attendanceDates, isLoading } = useAttendanceDates(user?.id);
  const { data: supervisorName } = useSupervisorName(user?.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDateObj = attendanceDates?.endDate ? new Date(attendanceDates.endDate) : null;
  // Sertifikat baru bisa diunduh H+1 setelah tanggal akhir magang
  const availableDateObj = endDateObj ? new Date(endDateObj.getTime() + 24 * 60 * 60 * 1000) : null;
  const isCompleted = availableDateObj ? availableDateObj <= today : false;

  const handleDownload = async () => {
    if (!profile?.full_name || !attendanceDates?.startDate || !attendanceDates?.endDate) return;
    if (!isCompleted) return;
    const doc = await generateCertificatePdf({ fullName: profile.full_name, startDate: attendanceDates.startDate, endDate: attendanceDates.endDate, supervisorName });
    const safeName = profile.full_name.replace(/\s+/g, "_");
    doc.save(`Sertifikat_Magang_${safeName}.pdf`);
  };

  const startFormatted = attendanceDates?.startDate ? formatTanggalIndonesia(attendanceDates.startDate) : "-";
  const endFormatted = attendanceDates?.endDate ? formatTanggalIndonesia(attendanceDates.endDate) : "-";

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sertifikat Magang</h1>
        <p className="text-muted-foreground mt-1">Unduh sertifikat kegiatan magang Anda.</p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Award className="h-10 w-10 text-primary" />
          <div>
            <p className="font-semibold text-lg text-foreground">{profile?.full_name ?? "-"}</p>
            <p className="text-sm text-muted-foreground">Periode: {startFormatted} — {endFormatted}</p>
          </div>
        </div>
        {!isCompleted && attendanceDates?.endDate && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <Lock className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Sertifikat baru bisa diunduh <strong>1 hari setelah</strong> masa magang berakhir (mulai {availableDateObj ? formatTanggalIndonesia(availableDateObj.toISOString().slice(0,10)) : "-"}).</span>
          </div>
        )}
        <Button onClick={handleDownload} className="gap-2" disabled={!attendanceDates?.startDate || !isCompleted}>
          {isCompleted ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {isCompleted ? "Unduh Sertifikat PDF" : "Belum Tersedia"}
        </Button>
      </div>
    </div>
  );
}
