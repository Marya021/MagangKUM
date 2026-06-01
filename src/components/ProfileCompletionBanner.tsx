import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function ProfileCompletionBanner() {
  const { user, role } = useAuth();
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ["profile-completion", user?.id],
    enabled: !!user?.id && role === "applier",
    queryFn: async () => {
      const { data } = await supabase
        .from("users")
        .select("asal, jurusan")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  if (role !== "applier" || !profile) return null;

  const missingAsal = !profile.asal?.trim();
  const missingJurusan = !profile.jurusan?.trim();
  if (!missingAsal && !missingJurusan) return null;
  if (location.pathname === "/profile") return null;

  const missing = [missingAsal && "Asal Sekolah/Kampus", missingJurusan && "Jurusan"]
    .filter(Boolean)
    .join(" dan ");

  return (
    <div className="border-b border-warning/30 bg-warning/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Lengkapi profil Anda</p>
            <p className="text-muted-foreground">
              Data <span className="font-medium text-foreground">{missing}</span> belum diisi. Mohon lengkapi agar proses magang berjalan lancar.
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link to="/profile">Lengkapi Sekarang</Link>
        </Button>
      </div>
    </div>
  );
}
