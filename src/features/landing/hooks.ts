import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export function useLandingData() {
  const [positions, setPositions] = useState<Tables<"positions">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("positions")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPositions(data || []);
        setLoading(false);
      });
  }, []);

  const totalQuota = positions.reduce((sum, p) => sum + (p.quota ?? 20), 0);

  const stats = [
    { value: positions.length.toString(), label: "Posisi Tersedia" },
    { value: totalQuota.toString(), label: "Total Kuota" },
    { value: "20+", label: "Satuan Kerja" },
    { value: "100+", label: "Alumni Magang" },
  ];

  return { positions, loading, stats, totalQuota };
}
