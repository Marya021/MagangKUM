import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, LogIn, LogOut, Clock, CheckSquare,
  Users, ChevronsUpDown, Check, FileText, HeartPulse, AlertTriangle,
} from "lucide-react";
import { CalendarSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { WEEKDAYS, HOLIDAYS, DEFAULT_TIME_IN, DEFAULT_TIME_OUT } from "./constants";
import type { AttendanceRow } from "./types";
import { editAttendanceSchema, bulkAttendanceSchema, type EditAttendanceValues, type BulkAttendanceValues } from "./schemas";
import { useIsAccepted, useInternStartDate, useAcceptedUsers, useAdminSchedule, useAttendances, useClockMutation, useEditAttendance, useBulkAttendance, useAbsenceMutation, useAttendanceRealtime } from "./hooks";
import { getCurrentDate } from "./utils";

const absenceSchema = z.object({
  status: z.enum(["izin", "sakit"]),
  note: z.string().min(5, "Alasan minimal 5 karakter").max(500, "Alasan terlalu panjang"),
});
type AbsenceValues = z.infer<typeof absenceSchema>;

export function AttendanceContent() {
  const { user, role } = useAuth();
  useAttendanceRealtime();
  const [currentMonth, setCurrentMonth] = useState(getCurrentDate());
  const [editDialog, setEditDialog] = useState<{ open: boolean; date: string; record?: AttendanceRow }>({ open: false, date: "" });
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState(false);
  const [absenceDialog, setAbsenceDialog] = useState<{ open: boolean; status: "izin" | "sakit" }>({ open: false, status: "izin" });
  const [_applyAll, setApplyAll] = useState(false);

  const editForm = useForm<EditAttendanceValues>({ resolver: zodResolver(editAttendanceSchema), defaultValues: { timeIn: "", timeOut: "" } });
  const bulkForm = useForm<BulkAttendanceValues>({ resolver: zodResolver(bulkAttendanceSchema), defaultValues: { timeIn: DEFAULT_TIME_IN, timeOut: DEFAULT_TIME_OUT } });
  const absenceForm = useForm<AbsenceValues>({ resolver: zodResolver(absenceSchema), defaultValues: { status: "izin", note: "" } });

  const { data: isAccepted = true } = useIsAccepted(user?.id, role === "applier");
  const { data: internStartDate } = useInternStartDate(user?.id, role === "applier");
  const today = getCurrentDate();
  const todayStr = format(today, "yyyy-MM-dd");
  const notAccepted = role === "applier" && !isAccepted;
  const internNotStarted = role === "applier" && isAccepted && internStartDate && todayStr < internStartDate;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const { data: acceptedUsers = [] } = useAcceptedUsers(role === "admin");
  const { adminScheduleMap } = useAdminSchedule(currentMonth, role === "applier" || role === "admin");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const viewUserId = role === "admin" ? selectedUserId || user?.id : user?.id;
  const selectedUserName = selectedUserId ? (acceptedUsers.find((u) => u.user_id === selectedUserId)?.full_name ?? "User") : null;

  const { attendanceMap, isLoading } = useAttendances(viewUserId, currentMonth);

  const clockMutation = useClockMutation({
    onSuccess: () => toast.success("Berhasil!"),
    onError: (e) => { if (!e.message.includes("Already") && !e.message.includes("Not clocked")) toast.error(e.message); },
  });

  const absenceMutation = useAbsenceMutation({
    onSuccess: () => {
      toast.success("Pengajuan terkirim ke admin");
      setAbsenceDialog((d) => ({ ...d, open: false }));
      absenceForm.reset({ status: "izin", note: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;

  const editMutation = useEditAttendance({
    onSuccess: () => { toast.success("Absensi diperbarui"); setEditDialog({ open: false, date: "" }); setApplyAll(false); },
    onError: (e) => toast.error(e.message),
  });

  const bulkMutation = useBulkAttendance({
    onSuccess: (count) => { toast.success(`${count} hari berhasil diperbarui untuk semua magang`); setBulkDialog(false); setSelectedDates(new Set()); setBulkMode(false); },
    onError: (e) => toast.error(e.message),
  });

  const toggleDate = (dateStr: string) => {
    setSelectedDates((prev) => { const next = new Set(prev); if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr); return next; });
  };

  const selectAllWorkdays = () => {
    const workdays = days.filter((d) => { const dow = getDay(d); const dateStr = format(d, "yyyy-MM-dd"); return dow !== 0 && dow !== 6 && dow !== 5 && !HOLIDAYS[dateStr]; }).map((d) => format(d, "yyyy-MM-dd"));
    setSelectedDates(new Set(workdays));
  };

  const openEdit = (dateStr: string) => {
    const record = attendanceMap[dateStr];
    editForm.reset({ timeIn: record?.time_in ? record.time_in.substring(0, 5) : "", timeOut: record?.time_out ? record.time_out.substring(0, 5) : "" });
    setApplyAll(false);
    setEditDialog({ open: true, date: dateStr, record });
  };

  const openAbsence = (status: "izin" | "sakit") => {
    absenceForm.reset({ status, note: "" });
    setAbsenceDialog({ open: true, status });
  };

  const todayStrLocal = format(getCurrentDate(), "yyyy-MM-dd");
  const todayRecord = attendanceMap[todayStrLocal];
  const todayDow = getDay(getCurrentDate());
  const isTodayFriday = todayDow === 5;
  const isTodayWorkday = todayDow !== 0 && todayDow !== 6 && todayDow !== 5 && !HOLIDAYS[todayStrLocal];
  const todayIsAbsent = todayRecord?.status === "izin" || todayRecord?.status === "sakit";

  const getWorkdayDates = () => days.filter((d) => { const dow = getDay(d); const ds = format(d, "yyyy-MM-dd"); return dow !== 0 && dow !== 6 && dow !== 5 && !HOLIDAYS[ds]; }).map((d) => format(d, "yyyy-MM-dd"));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-foreground">Absensi</h1>
        <div className="flex flex-wrap gap-2">
          {role === "admin" && !bulkMode && !selectedUserId && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setBulkMode(true)}><CheckSquare className="h-4 w-4" /><span className="hidden sm:inline">Set Absensi</span></Button>
          )}
          {role === "admin" && bulkMode && (
            <>
              <Button variant="outline" size="sm" onClick={selectAllWorkdays}><span className="hidden sm:inline">Pilih Semua</span><span className="sm:hidden">Semua</span></Button>
              <Button size="sm" disabled={selectedDates.size === 0} onClick={() => setBulkDialog(true)}>Set {selectedDates.size}</Button>
              <Button variant="ghost" size="sm" onClick={() => { setBulkMode(false); setSelectedDates(new Set()); }}>Batal</Button>
            </>
          )}
          {role === "applier" && notAccepted && (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border px-3 py-1.5">🔒 Belum diterima magang</Badge>
          )}
          {role === "applier" && !notAccepted && internNotStarted && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 px-3 py-1.5">⏳ Magang belum dimulai</Badge>
          )}
          {role === "applier" && !notAccepted && isTodayFriday && !internNotStarted && (
            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800 px-3 py-1.5">🏠 WFH — Tidak ada absen Jumat</Badge>
          )}
          {role === "applier" && !notAccepted && isTodayWorkday && !internNotStarted && (
            <>
              <Button onClick={() => clockMutation.mutate({ type: "in", userId: user!.id, attendanceMap })} disabled={clockMutation.isPending || !!todayRecord?.time_in || todayIsAbsent} size="sm" className="gap-2"><LogIn className="h-4 w-4" />Clock In</Button>
              <Button onClick={() => clockMutation.mutate({ type: "out", userId: user!.id, attendanceMap })} disabled={clockMutation.isPending || !todayRecord?.time_in || !!todayRecord?.time_out} variant="outline" size="sm" className="gap-2"><LogOut className="h-4 w-4" />Clock Out</Button>
              <Button onClick={() => openAbsence("izin")} disabled={!!todayRecord?.time_in || todayIsAbsent} variant="outline" size="sm" className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"><FileText className="h-4 w-4" />Izin</Button>
              <Button onClick={() => openAbsence("sakit")} disabled={!!todayRecord?.time_in || todayIsAbsent} variant="outline" size="sm" className="gap-2 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400"><HeartPulse className="h-4 w-4" />Sakit</Button>
            </>
          )}
        </div>
      </div>

      {role === "applier" && notAccepted && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-foreground">Belum diterima magang</p>
              <p className="text-sm text-muted-foreground">Anda belum dapat melakukan absensi. Silakan tunggu sampai lamaran magang Anda diterima oleh admin.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {role === "applier" && !notAccepted && !internNotStarted && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-3">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              Jam kerja magang: <strong>{DEFAULT_TIME_IN}</strong> – <strong>{DEFAULT_TIME_OUT}</strong> WIB · <strong className="text-violet-600 dark:text-violet-400">Setiap Jumat WFH</strong> (tidak ada clock in/out)
            </p>
          </CardContent>
        </Card>
      )}

      {role === "admin" && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Lihat Absensi:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full sm:w-[300px] justify-between font-normal">
                    {selectedUserId ? (acceptedUsers.find((u) => u.user_id === selectedUserId)?.full_name ?? "User") : "Semua"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] sm:w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Cari..." />
                    <CommandList>
                      <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="semua" onSelect={() => setSelectedUserId(null)}><Check className={cn("mr-2 h-4 w-4", !selectedUserId ? "opacity-100" : "opacity-0")} />Semua</CommandItem>
                        {acceptedUsers.map((u) => (
                          <CommandItem key={u.user_id} value={u.full_name} onSelect={() => setSelectedUserId(u.user_id)}>
                            <Check className={cn("mr-2 h-4 w-4", selectedUserId === u.user_id ? "opacity-100" : "opacity-0")} />{u.full_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="text-center">
              <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy", { locale: idLocale })}</CardTitle>
              {selectedUserName && <p className="text-sm text-muted-foreground mt-1">Absensi: {selectedUserName}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => (<div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>))}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (<div key={`empty-${i}`} />))}
                {days.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const record = attendanceMap[dateStr];
                  const dayOfWeek = getDay(day);
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const isFriday = dayOfWeek === 5;
                  const holiday = HOLIDAYS[dateStr];
                  const isOff = isWeekend || isFriday || !!holiday;
                  const todayCell = format(day, "yyyy-MM-dd") === format(getCurrentDate(), "yyyy-MM-dd");
                  const isAbsent = record?.status === "izin" || record?.status === "sakit";

                  return (
                    <div key={dateStr} className={cn(
                      "relative rounded-lg border p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] text-[10px] sm:text-xs transition-colors",
                      holiday ? "bg-destructive/5 border-destructive/20" :
                        isFriday ? "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800" :
                        isWeekend ? "bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800" : "bg-card",
                      record?.status === "izin" && !isOff && "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
                      record?.status === "sakit" && !isOff && "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800",
                      todayCell && "ring-2 ring-primary",
                      !isOff && !bulkMode && role === "admin" && "cursor-pointer hover:bg-accent/50",
                      bulkMode && !isOff && !selectedUserId && "cursor-pointer",
                      bulkMode && !selectedUserId && selectedDates.has(dateStr) && "ring-2 ring-primary bg-primary/5",
                    )} onClick={() => {
                      if (bulkMode && selectedUserId) return;
                      if (bulkMode && !isOff) toggleDate(dateStr);
                      else if (!isOff && role === "admin") openEdit(dateStr);
                    }}>
                      <div className="flex items-center justify-between">
                        {bulkMode && !isOff && (<Checkbox checked={selectedDates.has(dateStr)} onCheckedChange={() => toggleDate(dateStr)} onClick={(e) => e.stopPropagation()} className="h-3.5 w-3.5" />)}
                        <span className={cn("font-medium", todayCell && "text-primary", isWeekend && !holiday && "text-sky-600", isFriday && !holiday && "text-violet-600", holiday && "text-destructive")}>{format(day, "d")}</span>
                      </div>
                      {holiday && <p className="mt-0.5 text-[10px] leading-tight text-destructive font-medium truncate" title={holiday}>{holiday}</p>}
                      {isFriday && !holiday && <p className="mt-0.5 text-[10px] text-violet-600 dark:text-violet-400 font-medium">🏠 WFH</p>}
                      {isWeekend && !holiday && <p className="mt-0.5 text-[10px] text-muted-foreground">Libur</p>}
                      {isAbsent && !isOff && (
                        <div className="mt-0.5">
                          <span className={cn("inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-semibold", record?.status === "izin" ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100" : "bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100")}>
                            {record?.status === "izin" ? <FileText className="h-2.5 w-2.5" /> : <HeartPulse className="h-2.5 w-2.5" />}
                            {record?.status === "izin" ? "Izin" : "Sakit"}
                          </span>
                          {record?.note && <p className="mt-0.5 text-[9px] text-muted-foreground line-clamp-2" title={record.note}>{record.note}</p>}
                        </div>
                      )}
                      {role === "applier" && !isOff && !isAbsent && adminScheduleMap[dateStr] && (
                        <div className="mt-0.5"><div className="flex items-center gap-0.5 text-muted-foreground/70"><Clock className="h-2 w-2" /><span className="text-[9px]">{adminScheduleMap[dateStr].time_in?.substring(0, 5) ?? "--:--"} - {adminScheduleMap[dateStr].time_out?.substring(0, 5) ?? "--:--"}</span></div></div>
                      )}
                      {record && !isOff && !isAbsent && (
                        <div className="mt-1 space-y-0.5">
                          {record.time_in && (() => {
                            const t = record.time_in.substring(0, 5);
                            const schedule = adminScheduleMap[dateStr];
                            const lateThreshold = schedule?.time_in?.substring(0, 5) || DEFAULT_TIME_IN;
                            const isLate = t > lateThreshold;
                            return (<div className={cn("flex items-center gap-1", isLate ? "text-destructive" : "text-primary")}><LogIn className="h-2.5 w-2.5" /><span>{t}</span><span className="text-[9px]">{isLate ? "Telat" : "✓"}</span></div>);
                          })()}
                          {record.time_out && (() => {
                            const t = record.time_out.substring(0, 5);
                            const schedule = adminScheduleMap[dateStr];
                            const earlyThreshold = schedule?.time_out?.substring(0, 5) || DEFAULT_TIME_OUT;
                            const isEarly = t < earlyThreshold;
                            return (<div className={cn("flex items-center gap-1", isEarly ? "text-orange-500" : "text-muted-foreground")}><LogOut className="h-2.5 w-2.5" /><span>{t}</span><span className="text-[9px]">{isEarly ? "Awal" : "✓"}</span></div>);
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded border bg-card" /><span>Hari Kerja</span></div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded border border-sky-200 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-800" /><span>Weekend</span></div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded border border-violet-200 bg-violet-50 dark:bg-violet-950/30 dark:border-violet-800" /><span>Jumat WFH</span></div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded border border-destructive/20 bg-destructive/5" /><span>Tanggal Merah</span></div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800" /><span>Izin</span></div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800" /><span>Sakit</span></div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded ring-2 ring-primary" /><span>Hari Ini</span></div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialog.open} onOpenChange={(open) => { if (!editMutation.isPending) setEditDialog((d) => ({ ...d, open })); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Absensi — {editDialog.date}</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((values) => editMutation.mutate({
              date: editDialog.date, time_in: values.timeIn || null, time_out: values.timeOut || null,
              applyToAll: false, viewUserId: viewUserId!, attendanceMap, datesToApply: getWorkdayDates(),
            }))} className="space-y-4">
              <FormField control={editForm.control} name="timeIn" render={({ field }) => (<FormItem><FormLabel>Jam Masuk</FormLabel><FormControl><Input type="time" {...field} disabled={role !== "admin"} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={editForm.control} name="timeOut" render={({ field }) => (<FormItem><FormLabel>Jam Keluar</FormLabel><FormControl><Input type="time" {...field} disabled={role !== "admin"} /></FormControl><FormMessage /></FormItem>)} />
              {role === "admin" && (<Button type="submit" className="w-full" disabled={editMutation.isPending}>{editMutation.isPending ? "Menyimpan..." : "Simpan"}</Button>)}
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDialog} onOpenChange={(o) => { if (!bulkMutation.isPending) setBulkDialog(o); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Absensi — {selectedDates.size} hari</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Akan diterapkan untuk <strong>{acceptedUsers.length + 1}</strong> user (semua magang yang diterima)</p>
          </DialogHeader>
          <Form {...bulkForm}>
            <form onSubmit={bulkForm.handleSubmit((values) => bulkMutation.mutate({
              dates: Array.from(selectedDates), time_in: values.timeIn || null, time_out: values.timeOut || null,
              acceptedUsers, adminUserId: user!.id,
            }))} className="space-y-4">
              <FormField control={bulkForm.control} name="timeIn" render={({ field }) => (<FormItem><FormLabel>Jam Masuk</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={bulkForm.control} name="timeOut" render={({ field }) => (<FormItem><FormLabel>Jam Keluar</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" className="w-full" disabled={bulkMutation.isPending}>{bulkMutation.isPending ? "Menyimpan..." : `Simpan ${selectedDates.size} Hari untuk Semua`}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={absenceDialog.open} onOpenChange={(open) => { if (!absenceMutation.isPending) setAbsenceDialog((d) => ({ ...d, open })); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {absenceDialog.status === "izin" ? <FileText className="h-5 w-5 text-amber-600" /> : <HeartPulse className="h-5 w-5 text-rose-600" />}
              {absenceDialog.status === "izin" ? "Pengajuan Izin" : "Laporan Sakit"}
            </DialogTitle>
            <DialogDescription>
              Tanggal: <strong>{format(getCurrentDate(), "EEEE, d MMMM yyyy", { locale: idLocale })}</strong>
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-200">Wajib melapor</AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300/90 text-xs">
              Anda <strong>wajib</strong> melapor secara langsung ke <strong>admin</strong> dan <strong>pembimbing</strong> magang Anda perihal {absenceDialog.status === "sakit" ? "kondisi sakit" : "izin"} ini. Pengajuan ini hanya sebagai catatan absensi.
            </AlertDescription>
          </Alert>
          <Form {...absenceForm}>
            <form onSubmit={absenceForm.handleSubmit((values) => absenceMutation.mutate({
              status: values.status, note: values.note, userId: user!.id, attendanceMap,
            }))} className="space-y-4">
              <FormField control={absenceForm.control} name="note" render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan {absenceDialog.status === "izin" ? "Izin" : "Sakit"} <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={absenceDialog.status === "izin" ? "Contoh: Menghadiri acara keluarga..." : "Contoh: Demam dan flu, sudah ke dokter..."}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setAbsenceDialog((d) => ({ ...d, open: false }))} disabled={absenceMutation.isPending}>Batal</Button>
                <Button type="submit" className="flex-1" disabled={absenceMutation.isPending}>{absenceMutation.isPending ? "Mengirim..." : "Kirim"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
