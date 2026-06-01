import { useState, useMemo } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  FileSpreadsheet,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { useTableSort } from "@/hooks/use-table-sort";
import { SortableTableHead } from "@/components/SortableTableHead";
import * as XLSX from "xlsx";
import { TableSkeleton } from "@/components/skeletons";
import { ModalDialog } from "@/components/ModalDialog";
import { toast } from "sonner";

import { STATUS_OPTIONS, PAGE_SIZE } from "./constants";
import { usePenempatanOptions } from "@/features/penempatan/hooks";
import type { InternRow } from "./types";
import { editInternSchema, type EditInternValues } from "./schemas";
import { formatDateRange } from "./utils";
import {
  useInternQuery,
  useUpdateIntern,
  useDeleteIntern,
  useSupervisorUsers,
  useSupervisorAssignments,
  useAssignSupervisor,
} from "./hooks";

export function InternDataContent() {
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" });
  const { options: penempatanOptions } = usePenempatanOptions();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useQueryState("edit", { defaultValue: "" });
  const [deleteId, setDeleteId] = useQueryState("delete", { defaultValue: "" });
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const editForm = useForm<EditInternValues>({
    resolver: zodResolver(editInternSchema),
    defaultValues: { nama: "", asal: "", jurusan: "", startDate: "", endDate: "", penempatan: "", status: "Aktif" },
  });

  const { data: internData = [], isLoading } = useInternQuery();
  const { data: supervisorUsers = [] } = useSupervisorUsers();
  const { data: assignments = [] } = useSupervisorAssignments();
  const assignSupervisorMutation = useAssignSupervisor({
    onSuccess: () => toast.success("Pembimbing berhasil diperbarui"),
    onError: (e: Error) => toast.error(e.message),
  });

  const getSupervisorForIntern = (internId: string) => {
    const a = assignments.find((x) => x.intern_id === internId);
    if (!a) return null;
    const u = supervisorUsers.find((s) => s.user_id === a.supervisor_id);
    return u ? { id: a.supervisor_id, name: u.full_name } : null;
  };

  const updateMutation = useUpdateIntern({
    onSuccess: () => {
      toast.success("Data berhasil diperbarui");
      setEditId("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useDeleteIntern({
    onSuccess: () => {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        n.delete(deleteId);
        return n;
      });
      toast.success("Data berhasil dihapus");
      setDeleteId("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (item: InternRow) => {
    setEditId(item.id);
    editForm.reset({
      nama: item.nama,
      asal: item.asal,
      jurusan: item.jurusan,
      startDate: item.start_date || "",
      endDate: item.end_date || "",
      penempatan: item.penempatan,
      status: item.status,
    });
  };

  const handleSaveEdit = (values: EditInternValues) => {
    if (!editId) return;
    updateMutation.mutate({
      id: editId,
      nama: values.nama,
      asal: values.asal,
      jurusan: values.jurusan,
      start_date: values.startDate || null,
      end_date: values.endDate || null,
      status: values.status,
    });
  };

  const filtered = useMemo(() => {
    return internData.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(q) ||
        item.asal.toLowerCase().includes(q) ||
        item.jurusan.toLowerCase().includes(q) ||
        item.penempatan.toLowerCase().includes(q)
      );
    });
  }, [internData, searchQuery]);

  type InternSortKey = "nama" | "asal" | "jurusan" | "start_date" | "penempatan" | "status";
  const { sortConfig, toggleSort, sortData } = useTableSort<InternSortKey>();
  const sorted = useMemo(() => sortData(filtered), [sortData, filtered]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id));
  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        filtered.forEach((i) => n.delete(i.id));
        return n;
      });
    } else {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        filtered.forEach((i) => n.add(i.id));
        return n;
      });
    }
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "Selesai")
      return <Badge className="bg-destructive/15 text-destructive border-destructive/20">Selesai</Badge>;
    return <Badge className="bg-success/15 text-success border-success/20">Aktif</Badge>;
  };

  const handleDownloadExcel = () => {
    const toDownload = selectedIds.size > 0 ? filtered.filter((i) => selectedIds.has(i.id)) : filtered;
    const data = toDownload.map((item, i) => ({
      No: i + 1,
      Nama: item.nama,
      Asal: item.asal,
      Jurusan: item.jurusan,
      "Tanggal Magang / PKL": formatDateRange(item.start_date, item.end_date),
      Penempatan: item.penempatan,
      Status: item.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 4 }, { wch: 30 }, { wch: 22 }, { wch: 24 }, { wch: 38 }, { wch: 18 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Magang");
    XLSX.writeFile(wb, "Data_Magang.xlsx");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Magang</h1>
          <p className="text-muted-foreground mt-1">Daftar peserta magang dan PKL</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-40 sm:w-64"
            />
          </div>
          <Button onClick={handleDownloadExcel} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span className="hidden sm:inline">{selectedIds.size > 0 ? `Download (${selectedIds.size})` : "Download Excel"}</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={8} rows={5} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data"}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox checked={allFilteredSelected} onCheckedChange={toggleAll} />
                    </TableHead>
                    <TableHead className="w-[40px]">No</TableHead>
                    <SortableTableHead sortKey="nama" sortConfig={sortConfig} onToggle={toggleSort}>
                      Nama
                    </SortableTableHead>
                    <SortableTableHead sortKey="asal" sortConfig={sortConfig} onToggle={toggleSort}>
                      Asal
                    </SortableTableHead>
                    <SortableTableHead sortKey="jurusan" sortConfig={sortConfig} onToggle={toggleSort}>
                      Jurusan
                    </SortableTableHead>
                    <SortableTableHead sortKey="start_date" sortConfig={sortConfig} onToggle={toggleSort}>
                      Tanggal Magang / PKL
                    </SortableTableHead>
                    <SortableTableHead sortKey="penempatan" sortConfig={sortConfig} onToggle={toggleSort}>
                      Penempatan
                    </SortableTableHead>
                    <TableHead>Pembimbing</TableHead>
                    <SortableTableHead
                      sortKey="status"
                      sortConfig={sortConfig}
                      onToggle={toggleSort}
                      className="text-center"
                    >
                      Status
                    </SortableTableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className={`hover:bg-accent/50 transition-colors ${selectedIds.has(item.id) ? "bg-accent/30" : ""}`}
                    >
                      <TableCell>
                        <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => toggleOne(item.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{item.asal}</TableCell>
                      <TableCell>{item.jurusan}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateRange(item.start_date, item.end_date)}
                      </TableCell>
                      <TableCell>{item.penempatan}</TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-44 h-8 text-xs justify-between font-normal"
                            >
                              <span className="truncate">
                                {getSupervisorForIntern(item.id)?.name ?? "Pilih pembimbing"}
                              </span>
                              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-52 p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Cari pembimbing..." className="h-8 text-xs" />
                              <CommandList>
                                <CommandEmpty>Tidak ditemukan</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="none"
                                    onSelect={() =>
                                      assignSupervisorMutation.mutate({
                                        internId: item.id,
                                        supervisorId: null,
                                      })
                                    }
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-3 w-3",
                                        !getSupervisorForIntern(item.id) ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    Belum ada
                                  </CommandItem>
                                  {supervisorUsers.map((s) => (
                                    <CommandItem
                                      key={s.user_id}
                                      value={s.full_name}
                                      onSelect={() =>
                                        assignSupervisorMutation.mutate({
                                          internId: item.id,
                                          supervisorId: s.user_id,
                                        })
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-3 w-3",
                                          getSupervisorForIntern(item.id)?.id === s.user_id
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {s.full_name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                <span className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)}{" "}
                  dari {sorted.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
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
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editId}
        onOpenChange={(open) => {
          if (!updateMutation.isPending && !open) setEditId("");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Magang</DialogTitle>
            <DialogDescription>Perbarui informasi peserta magang</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="grid gap-4 py-2">
              <FormField
                control={editForm.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="asal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asal</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="jurusan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurusan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Selesai</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="penempatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Penempatan</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled>
                        <FormControl>
                          <SelectTrigger disabled className="bg-muted cursor-not-allowed">
                            <SelectValue placeholder="Pilih penempatan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {penempatanOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-amber-600">Dikelola dari halaman Lamaran</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditId("")}>
                  Batal
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ModalDialog
        variant="delete"
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId("")}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
