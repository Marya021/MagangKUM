import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNotificationStore } from "@/hooks/use-notification-store";
import type { Tables } from "@/integrations/supabase/types";

type ApplicationRow = Tables<"applications">;

const statusLabels: Record<string, string> = {
  pending: "Menunggu",
  reviewing: "Sedang Direview",
  accepted: "Diterima",
  rejected: "Ditolak",
};

const statusIcons: Record<string, string> = {
  pending: "⏳",
  reviewing: "🔍",
  accepted: "✅",
  rejected: "❌",
};

export function useApplicationRealtime() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["applications"] });
    queryClient.invalidateQueries({ queryKey: ["applications-stats"] });
    queryClient.invalidateQueries({ queryKey: ["my-applications"] });
  }, [queryClient]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("applications-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "applications",
        },
        (payload) => {
          const newRecord = payload.new as ApplicationRow;
          const oldRecord = payload.old as Partial<ApplicationRow>;

          invalidateAll();

          if (oldRecord.status !== newRecord.status) {
            const newStatus = statusLabels[newRecord.status] || newRecord.status;
            const icon = statusIcons[newRecord.status] || "📋";

            if (role === "applier" && newRecord.applicant_id === user.id) {
              const title = `${icon} Status lamaran diperbarui!`;
              const description = `Status lamaran Anda berubah menjadi: ${newStatus}`;

              addNotification({
                title,
                description,
                type: newRecord.status === "accepted" ? "success" : newRecord.status === "rejected" ? "error" : "info",
              });

              if (newRecord.status === "accepted") {
                toast.success(title, { description });
              } else if (newRecord.status === "rejected") {
                toast.error(title, { description });
              } else {
                toast.info(title, { description });
              }
            } else if (role === "admin" || role === "reviewer") {
              const title = `${icon} Status lamaran diperbarui`;
              const description = `Lamaran diperbarui ke: ${newStatus}`;

              addNotification({ title, description, type: "info" });
              toast.info(title, { description });
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "applications",
        },
        (_payload) => {
          invalidateAll();

          if (role === "admin" || role === "reviewer") {
            const title = "🆕 Lamaran baru masuk!";
            const description = "Ada pelamar baru yang mengirimkan lamaran.";

            addNotification({ title, description, type: "success" });
            toast.success(title, { description });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role, invalidateAll, addNotification]);
}
