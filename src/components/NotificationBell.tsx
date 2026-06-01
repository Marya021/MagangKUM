import { Bell, Check, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDbNotifications, type DbNotification } from "@/hooks/use-db-notifications";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

const typeStyles: Record<DbNotification["type"], string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  error: "bg-destructive",
  warning: "bg-yellow-500",
};

async function downloadNotificationFile(filePath: string) {
  try {
    toast.loading("Mengunduh file...", { id: "notif-download" });
    const { data, error } = await supabase.storage.from("resumes").download(filePath);
    if (error) throw error;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filePath.split("/").pop() ?? "file.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("File berhasil diunduh", { id: "notif-download" });
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Gagal mengunduh file", { id: "notif-download" });
  }
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useDbNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h4 className="text-sm font-semibold">Notifikasi</h4>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAllRead()}>
                <Check className="mr-1 h-3 w-3" />
                Tandai dibaca
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => clearAll()}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">Belum ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      !n.read ? typeStyles[n.type] : "bg-transparent",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <button onClick={() => !n.read && markRead(n.id)} className="text-left w-full">
                      <p className={cn("text-sm leading-tight", !n.read && "font-medium")}>{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: idLocale })}
                      </p>
                    </button>
                    {n.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => downloadNotificationFile(n.file_url!)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Unduh Surat Penerimaan
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
