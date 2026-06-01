export interface InternRow {
  id: string;
  nama: string;
  asal: string;
  jurusan: string;
  start_date: string | null;
  end_date: string | null;
  penempatan: string;
  status: string;
  user_id?: string | null;
}
