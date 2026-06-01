import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ModalDialog } from "@/components/ModalDialog";
import { EmptyState } from "@/components/EmptyState";
import {
  Penempatan,
  useCreatePenempatan,
  useDeletePenempatan,
  usePenempatanList,
  useUpdatePenempatan,
} from "./hooks";

export function PenempatanAdmin() {
  const { data: items = [], isLoading } = usePenempatanList();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Penempatan | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [deleteId, setDeleteId] = useState<string>("");

  const resetForm = () => {
    setEditing(null);
    setName("");
    setSortOrder(items.length + 1);
  };

  const openAdd = () => {
    resetForm();
    setSortOrder(items.length + 1);
    setFormOpen(true);
  };

  const openEdit = (p: Penempatan) => {
    setEditing(p);
    setName(p.name);
    setSortOrder(p.sort_order);
    setFormOpen(true);
  };

  const createMut = useCreatePenempatan({
    onSuccess: () => {
      toast.success("Penempatan ditambahkan");
      setFormOpen(false);
      resetForm();
    },
  });
  const updateMut = useUpdatePenempatan({
    onSuccess: () => {
      toast.success("Penempatan diperbarui");
      setFormOpen(false);
      resetForm();
    },
  });
  const deleteMut = useDeletePenempatan({
    onSuccess: () => {
      toast.success("Penempatan dihapus");
      setDeleteId("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Nama penempatan wajib diisi");
      return;
    }
    if (editing) {
      updateMut.mutate({ id: editing.id, name: trimmed, sort_order: sortOrder });
    } else {
      createMut.mutate({ name: trimmed, sort_order: sortOrder });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Penempatan</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar pilihan penempatan magang.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Penempatan
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Belum ada penempatan"
            description="Tambahkan penempatan pertama agar tersedia di formulir lamaran."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Urutan</TableHead>
                <TableHead>Nama Penempatan</TableHead>
                <TableHead className="w-40 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-muted-foreground">{p.sort_order}</TableCell>
                  <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={(o) => { if (!createMut.isPending && !updateMut.isPending) setFormOpen(o); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Penempatan" : "Tambah Penempatan"}</DialogTitle>
            <DialogDescription>
              Nama akan muncul sebagai pilihan saat admin/reviewer menetapkan penempatan lamaran.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="penempatan-name">Nama Penempatan</Label>
              <Input
                id="penempatan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth. P3H (Perancang)"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="penempatan-order">Urutan</Label>
              <Input
                id="penempatan-order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ModalDialog
        variant="delete"
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId("")}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        title="Hapus Penempatan"
        description="Yakin ingin menghapus penempatan ini? Lamaran yang sudah memakai nama ini tidak akan ikut terhapus."
        loading={deleteMut.isPending}
      />
    </div>
  );
}
