import { useState, useMemo } from "react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWeekend, isSameDay, isAfter, isBefore, addWeeks, subWeeks } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, Eye, ChevronsUpDown, Check } from "lucide-react";
import { WeekCardSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

import type { DailyReport } from "./types";
import { reportSchema, type ReportValues } from "./schemas";
import { useIsAcceptedReports, useInternStartDateReports, useAcceptedDate, useDailyReports, useInternProfiles, useUpsertReport } from "./hooks";

export function DailyReportsContent() {
  const { user, role } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [viewReportId, setViewReportId] = useQueryState("view", { defaultValue: "" });
  const [filterUserId, setFilterUserId] = useQueryState("user", { defaultValue: "all" });


  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const today = new Date();
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd }).filter((d) => !isWeekend(d));

  const form = useForm<ReportValues>({ resolver: zodResolver(reportSchema), defaultValues: { activities: "", obstacles: "", plan_tomorrow: "" } });
  const isAdmin = role === "admin";

  const { data: isAccepted = true } = useIsAcceptedReports(user?.id, !isAdmin);
  const { data: internStartDate } = useInternStartDateReports(user?.id, !isAdmin);
  const todayStr = format(today, "yyyy-MM-dd");
  const notAccepted = !isAdmin && !isAccepted;
  const internNotStarted = !isAdmin && isAccepted && internStartDate && todayStr < internStartDate;

  const { data: acceptedDate } = useAcceptedDate(user?.id, !isAdmin);
  const acceptedWeekStart = !isAdmin && acceptedDate ? startOfWeek(acceptedDate, { weekStartsOn: 1 }) : null;
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const canGoPrev = isAdmin || (acceptedWeekStart ? currentWeekStart > acceptedWeekStart : false);
  const canGoNext = currentWeekStart < thisWeekStart;

  const { data: reports = [], isLoading } = useDailyReports(currentWeekStart, isAdmin, filterUserId, user?.id);
  const { data: internProfiles = [] } = useInternProfiles(isAdmin);
  const viewReport = useMemo(() => reports.find((r) => r.id === viewReportId) ?? null, [reports, viewReportId]);

  const getReportForDate = (date: Date) => reports.find((r) => r.report_date === format(date, "yyyy-MM-dd"));

  const upsertMutation = useUpsertReport({
    onSuccess: (isEdit) => { setDialogOpen(false); setEditingReport(null); form.reset(); toast.success(isEdit ? "Laporan diperbarui" : "Laporan berhasil disimpan"); },
    onError: (e: Error) => toast.error("Gagal", { description: e.message }),
  });

  const openCreateOrEdit = (date: Date) => {
    const existing = getReportForDate(date);
    setSelectedDate(date);
    if (existing) { setEditingReport(existing); form.reset({ activities: existing.activities, obstacles: existing.obstacles || "", plan_tomorrow: existing.plan_tomorrow || "" }); }
    else { setEditingReport(null); form.reset({ activities: "", obstacles: "", plan_tomorrow: "" }); }
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Laporan Harian</h1>
        <p className="text-muted-foreground mt-1">{isAdmin ? "Lihat laporan harian magang" : "Buat laporan harian setiap hari kerja"}</p>
      </div>

      {notAccepted && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-foreground">Belum diterima magang</p>
              <p className="text-sm text-muted-foreground">Anda belum dapat membuat laporan harian. Silakan tunggu sampai lamaran magang Anda diterima oleh admin.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!notAccepted && internNotStarted && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="font-medium text-foreground">Magang belum dimulai</p>
              <p className="text-sm text-muted-foreground">Magang Anda dimulai pada {new Date(internStartDate! + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}. Anda belum dapat membuat laporan harian.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart((w) => subWeeks(w, 1))} disabled={!canGoPrev}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium min-w-[180px] sm:min-w-[200px] text-center">{format(currentWeekStart, "d MMM", { locale: localeId })} – {format(currentWeekEnd, "d MMM yyyy", { locale: localeId })}</span>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart((w) => addWeeks(w, 1))} disabled={!canGoNext}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="text-muted-foreground hidden sm:inline-flex">Minggu ini</Button>
        </div>
        {isAdmin && internProfiles.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full sm:w-[260px] justify-between font-normal">
                {filterUserId === "all" ? "Semua" : (internProfiles.find((p) => p.user_id === filterUserId)?.full_name ?? "User")}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] sm:w-[260px] p-0">
              <Command>
                <CommandInput placeholder="Cari..." />
                <CommandList>
                  <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem value="semua" onSelect={() => setFilterUserId("all")}><Check className={cn("mr-2 h-4 w-4", filterUserId === "all" ? "opacity-100" : "opacity-0")} />Semua</CommandItem>
                    {internProfiles.map((p) => (
                      <CommandItem key={p.user_id} value={p.full_name || p.email} onSelect={() => setFilterUserId(p.user_id)}>
                        <Check className={cn("mr-2 h-4 w-4", filterUserId === p.user_id ? "opacity-100" : "opacity-0")} />{p.full_name || p.email}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {isAdmin && filterUserId !== "all" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertCircle className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              Mode admin: Anda dapat <strong>menembak</strong> (membuat/mengedit) laporan harian untuk magang ini. Klik kartu hari yang kosong untuk membuat, atau "Edit" untuk mengubah.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (<WeekCardSkeleton />) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-5">
          {weekDays.map((day) => {
            const report = getReportForDate(day);
            const isDayToday = isSameDay(day, today);
            const isFuture = isAfter(day, today);
            const isBeforeAccepted = !isAdmin && acceptedDate ? isBefore(day, new Date(acceptedDate.getFullYear(), acceptedDate.getMonth(), acceptedDate.getDate())) : false;
            const isBeforeStart = !isAdmin && internStartDate ? format(day, "yyyy-MM-dd") < internStartDate : false;
            const isDisabled = isFuture || isBeforeAccepted || isBeforeStart || notAccepted;
            const hasReport = !!report;
            const adminCanWrite = isAdmin && filterUserId !== "all" && !isFuture;
            return (
              <Card key={day.toISOString()} className={`transition-all border-border/40 shadow-sm ${isDayToday ? "ring-2 ring-primary/50" : ""} ${hasReport ? "border-success/30" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{format(day, "EEEE", { locale: localeId })}</CardTitle>
                    {hasReport ? <CheckCircle2 className="h-4 w-4 text-success" /> : isDisabled ? <Clock className="h-4 w-4 text-muted-foreground/50" /> : <AlertCircle className="h-4 w-4 text-warning" />}
                  </div>
                  <CardDescription>{format(day, "d MMM", { locale: localeId })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {hasReport ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground line-clamp-2">{report.activities}</p>
                      <div className="flex gap-1">
                        {(!isAdmin || adminCanWrite) && (<Button variant="outline" size="sm" className="text-xs h-7" onClick={() => openCreateOrEdit(day)}>Edit</Button>)}
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setViewReportId(report.id)}><Eye className="h-3 w-3 mr-1" />Detail</Button>
                      </div>
                    </div>
                  ) : (!isAdmin && !isDisabled) || adminCanWrite ? (
                    <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => openCreateOrEdit(day)}>{isAdmin ? "Tembak Laporan" : "Buat Laporan"}</Button>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">{notAccepted ? "Belum diterima" : isFuture ? "Belum tersedia" : isBeforeStart ? "Magang belum dimulai" : isBeforeAccepted ? "Belum diterima" : "Tidak ada laporan"}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!upsertMutation.isPending) { setDialogOpen(o); if (!o) { setEditingReport(null); form.reset(); } } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingReport ? "Edit Laporan" : "Buat Laporan"} – {format(selectedDate, "d MMMM yyyy", { locale: localeId })}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => upsertMutation.mutate({ values: v, selectedDate, editingReport, userId: (isAdmin && filterUserId !== "all" ? filterUserId : user!.id) }))} className="space-y-4">
              <FormField control={form.control} name="activities" render={({ field }) => (<FormItem><FormLabel>Aktivitas Hari Ini *</FormLabel><FormControl><Textarea rows={4} placeholder="Apa saja yang dikerjakan hari ini..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="obstacles" render={({ field }) => (<FormItem><FormLabel>Kendala (opsional)</FormLabel><FormControl><Textarea rows={2} placeholder="Kendala yang dihadapi..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="plan_tomorrow" render={({ field }) => (<FormItem><FormLabel>Rencana Besok (opsional)</FormLabel><FormControl><Textarea rows={2} placeholder="Rencana untuk besok..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" className="w-full" disabled={upsertMutation.isPending}>{upsertMutation.isPending ? "Menyimpan..." : editingReport ? "Perbarui" : "Simpan"}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewReportId} onOpenChange={(o) => { if (!o) setViewReportId(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Laporan – {viewReport && format(new Date(viewReport.report_date), "d MMMM yyyy", { locale: localeId })}</DialogTitle></DialogHeader>
          {viewReport && (
            <div className="space-y-4">
              <div><h4 className="text-sm font-medium mb-1">Aktivitas</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewReport.activities}</p></div>
              {viewReport.obstacles && (<div><h4 className="text-sm font-medium mb-1">Kendala</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewReport.obstacles}</p></div>)}
              {viewReport.plan_tomorrow && (<div><h4 className="text-sm font-medium mb-1">Rencana Besok</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewReport.plan_tomorrow}</p></div>)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
