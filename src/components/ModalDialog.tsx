import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ModalVariant = "delete" | "add" | "edit" | "confirm";

const variantDefaults: Record<ModalVariant, { title: string; description: string; confirmLabel: string; loadingLabel: string; isDestructive: boolean }> = {
  delete: {
    title: "Konfirmasi Hapus",
    description: "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
    confirmLabel: "Hapus",
    loadingLabel: "Menghapus...",
    isDestructive: true,
  },
  add: {
    title: "Konfirmasi Tambah",
    description: "Apakah Anda yakin ingin menambahkan data ini?",
    confirmLabel: "Tambah",
    loadingLabel: "Menyimpan...",
    isDestructive: false,
  },
  edit: {
    title: "Konfirmasi Edit",
    description: "Apakah Anda yakin ingin menyimpan perubahan ini?",
    confirmLabel: "Simpan",
    loadingLabel: "Menyimpan...",
    isDestructive: false,
  },
  confirm: {
    title: "Konfirmasi",
    description: "Apakah Anda yakin ingin melanjutkan?",
    confirmLabel: "Ya, Lanjutkan",
    loadingLabel: "Memproses...",
    isDestructive: false,
  },
};

interface ModalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  variant?: ModalVariant;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ModalDialog({
  open,
  onOpenChange,
  onConfirm,
  variant = "delete",
  title,
  description,
  confirmLabel,
  loading = false,
}: ModalDialogProps) {
  const defaults = variantDefaults[variant];

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!loading) onOpenChange(o); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? defaults.title}</AlertDialogTitle>
          <AlertDialogDescription>{description ?? defaults.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={defaults.isDestructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {loading ? defaults.loadingLabel : (confirmLabel ?? defaults.confirmLabel)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
