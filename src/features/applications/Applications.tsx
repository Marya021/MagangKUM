import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";

import { useNotificationStore } from "@/hooks/use-notification-store";
import { useMemo } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useTableSort } from "@/hooks/use-table-sort";
import { SortableTableHead } from "@/components/SortableTableHead";
import { ModalDialog } from "@/components/ModalDialog";
import { Pencil, FileText, Search, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { CardListSkeleton, TableSkeleton } from "@/components/skeletons";
import { Input } from "@/components/ui/input";

import { statusConfig, PAGE_SIZE } from "./constants";
import { usePenempatanOptions } from "@/features/penempatan/hooks";
import { reviewSchema, type ReviewValues } from "./schemas";
import { StatusTracker } from "./components/StatusTracker";
import { useApplicationsQuery, useUpdateApplication, useDeleteApplication } from "./hooks";
import { formatDownloadFilename, downloadStorageFile } from "./utils";
import type { AppSortKey, ApplicationWithRelations } from "./types";

export function ApplicationsContent() {
  const { user, role } = useAuth();

  const addNotification = useNotificationStore((s) => s.addNotification);
  const [reviewAppId, setReviewAppId] = useQueryState("review", { defaultValue: "" });
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" });
  const [deleteTargetId, setDeleteTargetId] = useQueryState("delete", { defaultValue: "" });
  const { sortConfig: appSortConfig, toggleSort: toggleAppSort, sortData: appSortData } = useTableSort<AppSortKey>();

  const reviewForm = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { status: "pending", reviewerNotes: "", startDate: "", endDate: "", penempatan: "" },
  });

  const { data: applications, isLoading } = useApplicationsQuery();
  const { options: penempatanOptions } = usePenempatanOptions();

  const selectedApp = useMemo(
    () => applications?.find((a) => a.id === reviewAppId) ?? null,
    [applications, reviewAppId],
  );

  const updateMutation = useUpdateApplication({
    onSuccess: (values, selectedApp) => {
      addNotification({
        title: `${values.status === "accepted" ? "✅" : values.status === "rejected" ? "❌" : values.status === "reviewing" ? "🔍" : "⏳"} Status lamaran diperbarui`,
        description: `${selectedApp?.users?.full_name ?? "Pelamar"} diubah menjadi ${statusConfig[values.status]?.label ?? values.status}`,
        type: values.status === "accepted" ? "success" : values.status === "rejected" ? "error" : "info",
      });
      setReviewAppId("");
      toast.success("Lamaran diperbarui");
    },
    onError: (e: Error) => toast.error("Terjadi Kesalahan", { description: e.message }),
  });

  const deleteMutation = useDeleteApplication({
    onSuccess: () => toast.success("Lamaran berhasil dihapus"),
    onError: (e: Error) => toast.error("Terjadi Kesalahan", { description: e.message }),
  });

  const openReview = (app: ApplicationWithRelations) => {
    setReviewAppId(app.id);
    reviewForm.reset({
      status: app.status as ReviewValues["status"],
      reviewerNotes: app.reviewer_notes ?? "",
      startDate: app.start_date ?? "",
      endDate: app.end_date ?? "",
      penempatan: app.penempatan ?? "",
    });
  };

  const handleDownload = async (filePath: string, applicantName: string, createdAt: string, prefix?: string) => {
    const toastId = prefix ? "school-letter-download" : "cv-download";
    const label = prefix ? "Surat Sekolah" : "CV";
    try {
      toast.loading(`Mengunduh ${label}...`, { id: toastId });
      const filename = formatDownloadFilename(applicantName, createdAt, filePath, prefix);
      await downloadStorageFile(supabase, "resumes", filePath, filename);
      toast.success(`${label} berhasil diunduh`, { id: toastId });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : `Gagal mengunduh ${label}`;
      toast.error(message, { id: toastId });
    }
  };

  // Applier view
  if (role === "applier") {
    const filtered =
      applications?.filter((app) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          app.positions?.title?.toLowerCase().includes(q) ||
          app.positions?.department?.toLowerCase().includes(q) ||
          app.status?.toLowerCase().includes(q)
        );
      }) ?? [];
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginatedApps = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lamaran Saya</h1>
            <p className="text-muted-foreground mt-1">Pantau status lamaran Anda</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 w-48 sm:w-64"
            />
          </div>
        </div>
        {isLoading ? (
          <CardListSkeleton count={2} />
        ) : applications?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Anda belum melamar posisi apapun</p>
              <p className="text-sm text-muted-foreground mt-1">Telusuri posisi yang tersedia untuk memulai</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedApps?.map((app) => {
                const config = statusConfig[app.status] || statusConfig.pending;
                return (
                  <Card key={app.id} className="card-clean overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{app.positions?.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{app.positions?.department}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${config.color}`}>
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <StatusTracker currentStatus={app.status} />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Dilamar pada {new Date(app.created_at).toLocaleDateString("id-ID")}{" "}
                          {new Date(app.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {app.updated_at !== app.created_at && (
                          <span>
                            Diperbarui {new Date(app.updated_at).toLocaleDateString("id-ID")}{" "}
                            {new Date(app.updated_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      {app.reviewer_notes && (
                        <div className="bg-muted/50 rounded-lg p-4 text-sm border border-border/30">
                          <p className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">
                            Catatan Peninjau
                          </p>
                          <p className="text-foreground">{app.reviewer_notes}</p>
                        </div>
                      )}
                      {app.status === "accepted" && app.acceptance_letter_url && (
                        <div className="rounded-lg p-4 text-sm border border-green-500/30 bg-green-500/5">
                          <p className="text-xs text-green-700 dark:text-green-400 mb-2 font-semibold uppercase tracking-wide">
                            🎉 Surat Penerimaan Magang
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                app.acceptance_letter_url!,
                                app.users?.full_name ?? "Pelamar",
                                app.updated_at,
                                "SuratPenerimaan",
                              )
                            }
                            className="inline-flex items-center gap-1.5"
                          >
                            <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                              <FileText className="h-3 w-3 mr-1" />
                              Unduh Surat Penerimaan
                              <Download className="h-3 w-3 ml-1.5" />
                            </Badge>
                          </button>
                        </div>
                      )}
                      {app.status === "accepted" && (
                        <div className="rounded-lg p-4 text-sm border border-emerald-500/30 bg-emerald-500/5">
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-2 font-semibold uppercase tracking-wide">
                            📱 Wajib Gabung Grup WhatsApp
                          </p>
                          <p className="text-foreground mb-3">
                            Selamat! Silakan bergabung ke grup <strong>Magang Kemenkum</strong> untuk informasi & koordinasi selama magang.
                          </p>
                          <a
                            href="https://chat.whatsapp.com/Hqr3re5Vfps9uwtXHkbbaP"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5"
                          >
                            <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
                              Gabung Grup WhatsApp
                            </Badge>
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}{" "}
                  dari {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Admin/reviewer view
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lamaran</h1>
          <p className="text-muted-foreground mt-1">Review dan kelola lamaran</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 w-48 sm:w-64"
          />
        </div>
      </div>
      {(() => {
        const adminFiltered =
          applications?.filter((app) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              app.positions?.title?.toLowerCase().includes(q) ||
              app.positions?.department?.toLowerCase().includes(q) ||
              app.users?.full_name?.toLowerCase().includes(q) ||
              app.users?.email?.toLowerCase().includes(q) ||
              app.status?.toLowerCase().includes(q)
            );
          }) ?? [];
        const sortedAdmin = appSortData(adminFiltered, (item, key) => {
          if (key === "posisi") return item.positions?.title || "";
          if (key === "pelamar") return item.users?.full_name || "";
          if (key === "status") return item.status || "";
          if (key === "tanggal") return item.created_at || "";
          return "";
        });
        const adminTotalPages = Math.ceil(sortedAdmin.length / PAGE_SIZE);
        return isLoading ? (
          <TableSkeleton columns={5} rows={4} />
        ) : adminFiltered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{searchQuery ? "Tidak ada hasil pencarian" : "Belum ada lamaran"}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-clean">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead sortKey="posisi" sortConfig={appSortConfig} onToggle={toggleAppSort}>
                      Posisi
                    </SortableTableHead>
                    <SortableTableHead sortKey="pelamar" sortConfig={appSortConfig} onToggle={toggleAppSort}>
                      Pelamar
                    </SortableTableHead>
                    <SortableTableHead sortKey="status" sortConfig={appSortConfig} onToggle={toggleAppSort}>
                      Status
                    </SortableTableHead>
                    <SortableTableHead sortKey="tanggal" sortConfig={appSortConfig} onToggle={toggleAppSort}>
                      Tanggal
                    </SortableTableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAdmin.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((app) => {
                    const config = statusConfig[app.status] || statusConfig.pending;
                    return (
                      <TableRow key={app.id} className="hover:bg-accent/50 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.positions?.title}</p>
                            <p className="text-sm text-muted-foreground">{app.positions?.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.users?.full_name || "—"}</p>
                            <p className="text-sm text-muted-foreground">{app.users?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(app.created_at).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openReview(app)}>
                              <Pencil className="h-4 w-4 mr-1" />
                            </Button>
                            {role === "admin" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteTargetId(app.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {adminTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, sortedAdmin.length)} dari {sortedAdmin.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentPage} / {adminTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= adminTotalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })()}

      {/* Dialog review */}
      <Dialog
        open={!!reviewAppId}
        onOpenChange={(o) => {
          if (!updateMutation.isPending) {
            if (!o) setReviewAppId("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Lamaran</DialogTitle>
            <DialogDescription>Review dan perbarui status lamaran</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Posisi</p>
                  <p className="font-medium">{selectedApp.positions?.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pelamar</p>
                  <p className="font-medium">{selectedApp.users?.full_name || selectedApp.users?.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resume / CV</p>
                {selectedApp.resume_url ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(selectedApp.resume_url!, selectedApp.users?.full_name ?? "", selectedApp.created_at)
                    }
                    className="inline-flex items-center gap-1.5"
                  >
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                      <FileText className="h-3 w-3 mr-1" />
                      {formatDownloadFilename(
                        selectedApp.users?.full_name ?? "",
                        selectedApp.created_at,
                        selectedApp.resume_url,
                      )}
                      <Download className="h-3 w-3 ml-1.5" />
                    </Badge>
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Tidak ada file CV yang diunggah</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Surat Keterangan dari Sekolah</p>
                {selectedApp.school_letter_url ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        selectedApp.school_letter_url!,
                        selectedApp.users?.full_name ?? "",
                        selectedApp.created_at,
                        "SuratSekolah",
                      )
                    }
                    className="inline-flex items-center gap-1.5"
                  >
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                      <FileText className="h-3 w-3 mr-1" />
                      {formatDownloadFilename(
                        selectedApp.users?.full_name ?? "",
                        selectedApp.created_at,
                        selectedApp.school_letter_url,
                        "SuratSekolah",
                      )}
                      <Download className="h-3 w-3 ml-1.5" />
                    </Badge>
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Tidak ada Surat Keterangan yang diunggah</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Surat Lamaran</p>
                <div className="bg-muted rounded-lg p-3 text-sm">
                  {selectedApp.cover_letter || "Tidak ada surat lamaran"}
                </div>
              </div>
              <Form {...reviewForm}>
                <form
                  onSubmit={reviewForm.handleSubmit((v) =>
                    updateMutation.mutate({ values: v, selectedApp, userId: user!.id }),
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={reviewForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perbarui Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="reviewing">Sedang Direview</SelectItem>
                            <SelectItem value="accepted">Diterima</SelectItem>
                            <SelectItem value="rejected">Ditolak</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {reviewForm.watch("status") === "accepted" && (
                    <FormField
                      control={reviewForm.control}
                      name="acceptanceLetterFile"
                      render={({ field: { onChange, value: _v, ...rest } }) => (
                        <FormItem>
                          <FormLabel>
                            Surat Penerimaan (PDF){" "}
                            {selectedApp.acceptance_letter_url && (
                              <span className="text-xs text-muted-foreground font-normal">
                                — sudah ada, unggah baru untuk mengganti
                              </span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => onChange(e.target.files?.[0])}
                              {...rest}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            File akan dikirim ke pelamar melalui notifikasi (max 5MB)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={reviewForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Mulai Magang</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reviewForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Akhir Magang</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={reviewForm.control}
                    name="penempatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Penempatan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih penempatan..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {penempatanOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={reviewForm.control}
                    name="reviewerNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan Peninjau</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tambahkan catatan..." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={updateMutation.isPending} className="w-full">
                    {updateMutation.isPending ? "Menyimpan..." : "Perbarui Lamaran"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
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
        title="Hapus Lamaran"
        description="Yakin ingin menghapus lamaran ini? Tindakan ini tidak dapat dibatalkan."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
