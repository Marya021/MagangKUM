import { type ReactNode, useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { useApplicationRealtime } from "@/hooks/use-realtime";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageTransition } from "@/components/PageTransition";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dasbor",
  "/positions": "Posisi",
  "/intern": "Magang",
  "/applications": "Lamaran",
  "/attendance": "Absensi",
  "/reports": "Laporan",
  "/users": "Pengguna",
  "/profile": "Profil",
  "/certificate": "Sertifikat",
  "/supervisor": "Pembimbing",
  "/activity-logs": "Log Aktivitas",
};

function ThemeToggleBtn() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useApplicationRealtime();

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("users").select("full_name, avatar_url").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = (profile?.full_name || user?.email?.[0] || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const pageTitle = pageTitles[location.pathname] || "";

  const roleLabel = role === "admin" ? "Admin" : role === "reviewer" ? "Peninjau" : role === "supervisor" ? "Pembimbing" : "Pelamar";
  const roleBadgeClass =
    role === "admin"
      ? "bg-destructive/10 text-destructive"
      : role === "reviewer"
        ? "bg-warning/10 text-warning"
        : role === "supervisor"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-primary/10 text-primary";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-50 h-14 flex items-center justify-between border-b border-border bg-card px-3 sm:px-5 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              {pageTitle && (
                <h2 className="text-base font-semibold text-foreground hidden sm:block">{pageTitle}</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full hidden sm:inline-block ${roleBadgeClass}`}>{roleLabel}</span>
              <ThemeToggleBtn />
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ""} />
                      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{profile?.full_name || "Pengguna"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />Profil Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <ProfileCompletionBanner />
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
