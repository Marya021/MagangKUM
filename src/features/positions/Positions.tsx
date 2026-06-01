import { useState, useMemo } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { useQueryState, parseAsInteger } from "nuqs";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import {
  Plus,
  MapPin,
  Building,
  Trash2,
  Edit,
  Upload,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Users,
  CalendarIcon,
  Search,
} from "lucide-react";
import { PositionCardSkeleton } from "@/components/skeletons";
import { ModalDialog } from "@/components/ModalDialog";

import { positionSchema, applySchema, statusLabel, type PositionValues, type ApplyValues } from "./schemas";
import {
  usePositionsQuery,
  useMyApplications,
  useAcceptedCounts,
  useUpsertPosition,
  useDeletePosition,
  useApplyPosition,
} from "./hooks";
import { ITEMS_PER_PAGE } from "./constants";
import { getRemainingQuota, statusColor } from "./utils";

export function PositionsContent() {
  const { user, role } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useQueryState("edit", { defaultValue: "" });
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyPositionId, setApplyPositionId] = useQueryState("apply", { defaultValue: "" });
  const [deleteTargetId, setDeleteTargetId] = useQueryState("delete", { defaultValue: "" });

  const positionForm = useForm<PositionValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      title: "",
      department: "",
      description: "",
      requirements: "",
      location: "Remote",
      status: "open",
      quota: 20,
      deadline: null,
    },
  });

  const applyForm = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { coverLetter: "", durationMonths: 3 },
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [schoolLetterFile, setSchoolLetterFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" });

  const { data: positions, isLoading } = usePositionsQuery();
  const { data: myApplications } = useMyApplications(user?.id, role === "applier");
  const { data: acceptedCounts = {} } = useAcceptedCounts();

  const appliedPositionIds = new Set(myApplications?.map((a) => a.position_id) ?? []);
  const _getAppStatus = (posId: string) => myApplications?.find((a) => a.position_id === posId)?.status;

  const resetForm = () => {
    positionForm.reset({
      title: "",
      department: "",
      description: "",
      requirements: "",
      location: "Remote",
      status: "open",
      quota: 20,
      deadline: null,
    });
    setEditId("");
  };

  const upsertMutation = useUpsertPosition({
    onSuccess: (returnedEditId) => {
      setDialogOpen(false);
      resetForm();
      toast.success(returnedEditId ? "Posisi diperbarui" : "Posisi dibuat");
    },
    onError: (e: Error) => toast.error("Terjadi Kesalahan", { description: e.message }),
  });

  const deleteMutation = useDeletePosition({
    onSuccess: () => toast.success("Posisi dihapus"),
  });

  const applyMutation = useApplyPosition({
    onSuccess: () => {
      setApplyDialogOpen(false);
      applyForm.reset();
      setResumeFile(null);
      setSchoolLetterFile(null);
      toast.success("Lamaran berhasil dikirim!");
    },
    onError: (e: Error) => toast.error("Terjadi Kesalahan", { description: e.message }),
  });

  const filteredPositions = useMemo(() => {
    if (!positions) return [];
    if (!searchQuery.trim()) return positions;
    const q = searchQuery.toLowerCase();
    return positions.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q),
    );
  }, [positions, searchQuery]);

  const totalPages = Math.ceil(filteredPositions.length / ITEMS_PER_PAGE);
  const paginatedPositions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPositions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPositions, currentPage]);

  const openEdit = (pos: Tables<"positions">) => {
    positionForm.reset({
      title: pos.title,
      department: pos.department,
      description: pos.description,
      requirements: pos.requirements,
      location: pos.location,
      status: pos.status as "open" | "closed" | "draft",
      quota: pos.quota ?? 20,
      deadline: pos.deadline ? new Date(pos.deadline + "T00:00:00") : null,
    });
    setEditId(pos.id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Posisi Magang</h1>
          <p className="text-muted-foreground mt-1">
            {role === "admin" ? "Kelola lowongan magang" : "Telusuri dan lamar magang"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 w-40 sm:w-64"
            />
          </div>
          {role === "admin" && (
            <Dialog
              open={dialogOpen}
              onOpenChange={(o) => {
                if (!upsertMutation.isPending) {
                  setDialogOpen(o);
                  if (!o) resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Tambah Posisi</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editId ? "Edit Posisi" : "Buat Posisi"}</DialogTitle>
                </DialogHeader>
                <Form {...positionForm}>
                  <form
                    onSubmit={positionForm.handleSubmit((v) =>
                      upsertMutation.mutate({ values: v, editId, userId: user!.id }),
                    )}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={positionForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Judul</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={positionForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departemen</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={positionForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lokasi</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={positionForm.control}
                      name="quota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kuota Pelamar</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={1000}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={positionForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={positionForm.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Persyaratan</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={positionForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="open">Dibuka</SelectItem>
                              <SelectItem value="closed">Ditutup</SelectItem>
                              <SelectItem value="draft">Draf</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={positionForm.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Deadline Pendaftaran</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd MMMM yyyy", { locale: idLocale })
                                  ) : (
                                    <span>Pilih tanggal...</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ?? undefined}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={upsertMutation.isPending}>
                      {upsertMutation.isPending ? "Menyimpan..." : editId ? "Perbarui" : "Buat"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <PositionCardSkeleton count={6} />
      ) : filteredPositions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Belum ada posisi</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPositions.map((pos) => {
              const remaining = getRemainingQuota(pos, acceptedCounts);
              const quotaFull = remaining <= 0;
              return (
                <Card key={pos.id} className="card-clean group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{pos.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Building className="h-3.5 w-3.5" />
                          {pos.department}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={statusColor(pos.status)}>
                        {statusLabel(pos.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{pos.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {pos.location}
                      </span>
                      <span className={cn("flex items-center gap-1", quotaFull && "text-destructive font-medium")}>
                        <Users className="h-3.5 w-3.5" />
                        Sisa Kuota: {remaining === 0 ? "0" : `${remaining}/${pos.quota ?? 20}`}
                      </span>
                      {pos.deadline && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          Deadline: {format(new Date(pos.deadline + "T00:00:00"), "dd MMM yyyy", { locale: idLocale })}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      {role === "admin" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openEdit(pos)}>
                            <Edit className="h-3.5 w-3.5 mr-1" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTargetId(pos.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {role === "applier" &&
                        pos.status === "open" &&
                        (appliedPositionIds.has(pos.id) ? (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Sudah Melamar
                          </Badge>
                        ) : quotaFull ? (
                          <Button size="sm" disabled className="opacity-50 cursor-not-allowed">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            Kuota Penuh
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setApplyPositionId(pos.id);
                              setApplyDialogOpen(true);
                            }}
                          >
                            Lamar Sekarang
                          </Button>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className="w-9"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Dialog lamaran */}
      <Dialog
        open={applyDialogOpen}
        onOpenChange={(o) => {
          if (!applyMutation.isPending) {
            setApplyDialogOpen(o);
            if (!o) {
              applyForm.reset();
              setResumeFile(null);
              setSchoolLetterFile(null);
              setApplyPositionId("");
            }
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lamar Posisi</DialogTitle>
          </DialogHeader>
          <Form {...applyForm}>
            <form
              onSubmit={applyForm.handleSubmit(
                (v) =>
                  applyMutation.mutate({
                    values: v,
                    userId: user!.id,
                    positionId: applyPositionId,
                    alreadyApplied: appliedPositionIds.has(applyPositionId),
                  }),
                (errors) => {
                  const first = Object.values(errors)[0] as { message?: string } | undefined;
                  toast.error("Lengkapi form lamaran", {
                    description:
                      first?.message ??
                      "Pastikan CV, Surat Keterangan Sekolah, dan Durasi sudah diisi.",
                  });
                },
              )}
              className="space-y-4"
            >
              <FormField
                control={applyForm.control}
                name="resumeFile"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel>Unggah CV / Resume *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex items-center gap-2 cursor-pointer border border-input rounded-md px-3 py-2 text-sm hover:bg-accent/50 transition-colors">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">
                            {resumeFile ? resumeFile.name : "Pilih file PDF atau Word..."}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setResumeFile(file);
                                onChange(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={applyForm.control}
                name="schoolLetterFile"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel>Surat Keterangan dari Sekolah *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex items-center gap-2 cursor-pointer border border-input rounded-md px-3 py-2 text-sm hover:bg-accent/50 transition-colors">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">
                            {schoolLetterFile ? schoolLetterFile.name : "Pilih file PDF atau Word..."}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSchoolLetterFile(file);
                                onChange(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={applyForm.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durasi Magang (bulan) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        placeholder="Contoh: 3"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={applyForm.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surat Lamaran (opsional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ceritakan mengapa Anda cocok untuk posisi ini..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={applyMutation.isPending}>
                {applyMutation.isPending ? "Mengirim..." : "Kirim Lamaran"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ModalDialog
        variant="delete"
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId("")}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteMutation.mutate(deleteTargetId);
            setDeleteTargetId("");
          }
        }}
        title="Hapus Posisi"
        description="Yakin ingin menghapus posisi ini? Semua lamaran terkait juga akan terhapus."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
