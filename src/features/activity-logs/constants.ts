// Hanya aksi CRUD yang ditampilkan pada Log Aktivitas
export const ACTION_LABELS: Record<string, string> = {
  create: "Buat",
  update: "Ubah",
  delete: "Hapus",
};

// Label tambahan untuk menampilkan log lama (jika masih ada di DB)
export const ACTION_LABELS_EXTRA: Record<string, string> = {
  login: "Masuk",
  logout: "Keluar",
  status_change: "Ubah Status",
  upload: "Unggah",
};

export const CRUD_ACTIONS = ["create", "update", "delete"] as const;

export const ENTITY_LABELS: Record<string, string> = {
  position: "Posisi",
  application: "Lamaran",
  attendance: "Absensi",
  report: "Laporan",
  user: "Pengguna",
  intern: "Magang",
  supervisor: "Pembimbing",
};

export const ACTION_BADGE_CLASS: Record<string, string> = {
  login: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  logout: "bg-muted text-muted-foreground",
  create: "bg-primary/10 text-primary",
  update: "bg-warning/10 text-warning",
  delete: "bg-destructive/10 text-destructive",
  status_change: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  upload: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  reviewer: "Peninjau",
  supervisor: "Pembimbing",
  applier: "Pelamar",
};

export const PAGE_SIZE = 25;
