import { Link } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  CalendarDays,
  Building2,
  Users,
  Briefcase,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface PositionDetailModalProps {
  position: Tables<"positions"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accepted: number;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : "")).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isNew(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function parseList(text: string): string[] {
  return text
    .split(/\r?\n|•|;|·/)
    .map((s) => s.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((s) => s.length > 0);
}

export function PositionDetailModal({ position, open, onOpenChange, accepted }: PositionDetailModalProps) {
  if (!position) return null;

  const quota = position.quota ?? 20;
  const remaining = Math.max(0, quota - accepted);
  const quotaFull = remaining <= 0;
  const quotaPercent = quota > 0 ? Math.min((accepted / quota) * 100, 100) : 100;
  const qualifications = parseList(position.requirements || "");
  const isRemote = /remote/i.test(position.location);

  // Default benefits (static — bisa diganti jika kolom benefit ditambahkan)
  const benefits = [
    "Sertifikat magang resmi",
    "Mentoring dari profesional",
    "Pengalaman kerja nyata",
  ];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[800px]",
            "-translate-x-1/2 -translate-y-1/2",
            "bg-background rounded-2xl border shadow-2xl overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-200",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Detail Program Magang - {position.title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Informasi lengkap mengenai posisi magang {position.title}.
          </DialogPrimitive.Description>

          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1.5 -ml-2 px-2 py-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
            <p className="text-sm font-medium text-muted-foreground">
              Detail Program Magang
            </p>
            <DialogPrimitive.Close className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
              <span className="sr-only">Tutup</span>
            </DialogPrimitive.Close>
          </div>

        <div className="px-8 py-7 space-y-7 max-h-[75vh] overflow-y-auto">
          {/* Title + badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {isNew(position.created_at) && (
                <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-0 gap-1">
                  <Sparkles className="h-3 w-3" />
                  Baru
                </Badge>
              )}
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                {position.department}
              </Badge>
              <Badge variant="secondary" className="font-normal">Umum</Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
              {position.title}
            </h2>
          </div>

          {/* Quick info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoItem icon={MapPin} label="Lokasi" value={position.location} />
            <InfoItem
              icon={CalendarDays}
              label="Deadline"
              value={formatDate(position.deadline)}
            />
            <InfoItem
              icon={Briefcase}
              label="Tipe"
              value={isRemote ? "Remote" : "Kantor (On-site)"}
            />
          </div>

          {/* Description */}
          <Section title="Deskripsi Program">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {position.description}
            </p>
          </Section>

          {/* Qualifications */}
          {qualifications.length > 0 && (
            <Section title="Kualifikasi">
              <div className="flex flex-wrap gap-2">
                {qualifications.map((q, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground/80"
                  >
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {q}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Quota progress */}
          <Section title="Kuota Pendaftaran">
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Sisa kuota
                </span>
                <span className={`font-semibold ${quotaFull ? "text-destructive" : "text-foreground"}`}>
                  {remaining}/{quota}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${quotaFull ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
              {quotaFull && (
                <p className="text-xs text-destructive font-medium">
                  Kuota untuk posisi ini sudah penuh.
                </p>
              )}
            </div>
          </Section>

          {/* Additional info */}
          <Section title="Informasi Tambahan">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InfoItem icon={Clock} label="Durasi" value="3 Bulan" />
              <InfoItem icon={Building2} label="Divisi" value={position.department} />
              <InfoItem icon={Sparkles} label="Benefit" value={`${benefits.length} manfaat`} />
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {benefits.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Footer CTA */}
        <div className="px-8 py-5 border-t bg-muted/20">
          <Button
            asChild={!quotaFull}
            disabled={quotaFull}
            size="lg"
            className="w-full rounded-xl gap-2 text-base font-semibold shadow-md shadow-primary/20"
          >
            {quotaFull ? (
              <span>Kuota Penuh</span>
            ) : (
              <Link to="/auth">
                Lamar Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </Button>
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3 flex items-start gap-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
