import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { ModalDialog } from "@/components/ModalDialog";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Trash2, ChevronLeft, ChevronRight, Search, Plus, Pencil } from "lucide-react";
import { useTableSort } from "@/hooks/use-table-sort";
import { SortableTableHead } from "@/components/SortableTableHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/skeletons";
import { UserFormDialog } from "./components/UserForm";

import type { AppRole } from "./types";
import { ROLE_BADGE_COLORS, ROLE_LABELS, PAGE_SIZE } from "./constants";
import { useUsersQuery, useUpdateRole, useDeleteUser, useAddUser, useEditUser } from "./hooks";

export function UsersManagementContent() {
  const { role: myRole } = useAuth();
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" });
  const [deleteTarget, setDeleteTarget] = useQueryState("delete", { defaultValue: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editData, setEditData] = useState<{ userId: string; fullName: string; email: string } | null>(null);
  type UserSortKey = "nama" | "email" | "peran" | "bergabung";
  const {
    sortConfig: userSortConfig,
    toggleSort: toggleUserSort,
    sortData: userSortData,
  } = useTableSort<UserSortKey>();

  const { data: users, isLoading } = useUsersQuery(myRole === "admin");

  const updateRoleMutation = useUpdateRole({
    onSuccess: () => toast.success("Peran berhasil diperbarui"),
    onError: (e: Error) => toast.error("Terjadi Kesalahan", { description: e.message }),
  });

  const deleteUserMutation = useDeleteUser({
    onSuccess: () => toast.success("Pengguna berhasil dihapus"),
    onError: (e: Error) => toast.error("Terjadi Kesalahan", { description: e.message }),
  });

  const addUserMutation = useAddUser({
    onSuccess: () => {
      toast.success("Pengguna berhasil ditambahkan");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error("Gagal menambahkan pengguna", { description: e.message }),
  });

  const editUserMutation = useEditUser({
    onSuccess: () => {
      toast.success("Data pengguna berhasil diperbarui");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error("Gagal memperbarui pengguna", { description: e.message }),
  });

  const roleBadge = (r: string) => ROLE_BADGE_COLORS[r] ?? "";
  const roleLabel = (r: string) => ROLE_LABELS[r] ?? r;

  const openAddDialog = () => {
    setDialogMode("add");
    setEditData(null);
    setDialogOpen(true);
  };
  const openEditDialog = (u: { user_id: string; full_name: string; email: string }) => {
    setDialogMode("edit");
    setEditData({ userId: u.user_id, fullName: u.full_name, email: u.email });
    setDialogOpen(true);
  };

  if (myRole !== "admin") return <div className="text-center py-12 text-muted-foreground">Akses ditolak</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Pengguna</h1>
          <p className="text-muted-foreground mt-1">Kelola peran dan izin pengguna</p>
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
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Tambah Pengguna</span>
          </Button>
        </div>
      </div>
      {(() => {
        const filtered =
          users?.filter((u) => {
            if (u.role === "applier") return false;
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              u.full_name?.toLowerCase().includes(q) ||
              u.email?.toLowerCase().includes(q) ||
              u.role?.toLowerCase().includes(q)
            );
          }) ?? [];
        const sorted = userSortData(filtered, (item, key) => {
          if (key === "nama") return item.full_name || "";
          if (key === "email") return item.email || "";
          if (key === "peran") return item.role || "";
          if (key === "bergabung") return item.created_at || "";
          return "";
        });
        const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
        return isLoading ? (
          <TableSkeleton columns={4} rows={5} />
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada pengguna"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-clean">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead sortKey="nama" sortConfig={userSortConfig} onToggle={toggleUserSort}>
                      Nama
                    </SortableTableHead>
                    <SortableTableHead sortKey="email" sortConfig={userSortConfig} onToggle={toggleUserSort}>
                      Email
                    </SortableTableHead>
                    <SortableTableHead sortKey="peran" sortConfig={userSortConfig} onToggle={toggleUserSort}>
                      Peran Saat Ini
                    </SortableTableHead>
                    <TableHead>Ubah Peran</TableHead>
                    <SortableTableHead sortKey="bergabung" sortConfig={userSortConfig} onToggle={toggleUserSort}>
                      Bergabung
                    </SortableTableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((u) => (
                    <TableRow key={u.id} className="hover:bg-accent/50 transition-colors">
                      <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleBadge(u.role)}>
                          {roleLabel(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(v) => updateRoleMutation.mutate({ userId: u.user_id, newRole: v as AppRole })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="reviewer">Peninjau</SelectItem>
                            <SelectItem value="supervisor">Pembimbing</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(u.user_id)}
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
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)}{" "}
                  dari {sorted.length}
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
          </Card>
        );
      })()}
      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        editData={editData}
        onSubmitAdd={(data) => addUserMutation.mutate(data)}
        onSubmitEdit={(data) => editUserMutation.mutate(data)}
        loading={addUserMutation.isPending || editUserMutation.isPending}
      />
      <ModalDialog
        variant="delete"
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget("")}
        onConfirm={() => {
          if (deleteTarget) {
            deleteUserMutation.mutate(deleteTarget);
            setDeleteTarget("");
          }
        }}
        title="Hapus Pengguna"
        description="Yakin ingin menghapus pengguna ini? Semua data terkait akan ikut terhapus."
        loading={deleteUserMutation.isPending}
      />
    </div>
  );
}
