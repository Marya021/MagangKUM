import { Briefcase, Users, FileText, Home, CalendarCheck, ClipboardList, Award, GraduationCap, ScrollText, MapPin } from "lucide-react";
import logoKemenkum from "@/assets/logo-kemenkum.png";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = { label: string; icon: typeof Home; path: string };

const navItems: Record<string, NavItem[]> = {
  admin: [
    { label: "Dasbor", icon: Home, path: "/dashboard" },
    { label: "Posisi", icon: Briefcase, path: "/positions" },
    { label: "Penempatan", icon: MapPin, path: "/penempatan" },
    { label: "Magang", icon: GraduationCap, path: "/intern" },
    { label: "Lamaran", icon: FileText, path: "/applications" },
    { label: "Absensi", icon: CalendarCheck, path: "/attendance" },
    { label: "Laporan", icon: ClipboardList, path: "/reports" },
    { label: "Pengguna", icon: Users, path: "/users" },
    { label: "Log Aktivitas", icon: ScrollText, path: "/activity-logs" },
  ],
  reviewer: [
    { label: "Dasbor", icon: Home, path: "/dashboard" },
    { label: "Lamaran", icon: FileText, path: "/applications" },
  ],
  supervisor: [
    { label: "Dasbor", icon: Home, path: "/dashboard" },
    { label: "Magang", icon: GraduationCap, path: "/supervisor" },
  ],
  applier: [
    { label: "Dasbor", icon: Home, path: "/dashboard" },
    { label: "Posisi", icon: Briefcase, path: "/positions" },
    { label: "Lamaran Saya", icon: FileText, path: "/applications" },
    { label: "Absensi", icon: CalendarCheck, path: "/attendance" },
    { label: "Laporan", icon: ClipboardList, path: "/reports" },
  ],
};

function SidebarInner() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role, user } = useAuth();

  const { data: acceptedInfo } = useQuery({
    queryKey: ["applier-accepted", user?.id],
    queryFn: async () => {
      const { data: app } = await supabase
        .from("applications")
        .select("id")
        .eq("applicant_id", user!.id)
        .eq("status", "accepted")
        .limit(1)
        .maybeSingle();
      if (!app) return { accepted: false, certificateAvailable: false };

      // Sertifikat baru muncul H+1 setelah end_date magang
      const { data: intern } = await supabase
        .from("intern")
        .select("end_date")
        .eq("user_id", user!.id)
        .maybeSingle();

      let certificateAvailable = false;
      if (intern?.end_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const available = new Date(new Date(intern.end_date).getTime() + 24 * 60 * 60 * 1000);
        certificateAvailable = available <= today;
      }
      return { accepted: true, certificateAvailable };
    },
    enabled: !!user && role === "applier",
  });

  const hasCompletedInternship = acceptedInfo?.certificateAvailable ?? false;

  const baseItems = role ? navItems[role] : [];
  const items: NavItem[] = [
    ...baseItems,
    ...(role === "applier" && hasCompletedInternship
      ? [{ label: "Sertifikat", icon: Award, path: "/certificate" }]
      : []),
  ];



  return (
    <>
      <SidebarContent>
        {/* Logo */}
        <SidebarGroup>
          <div className={cn("flex items-center gap-3 px-3 py-4", collapsed && "justify-center px-1")}>
            <img src={logoKemenkum} alt="MagangKUM" className="h-10 w-10 rounded-lg shrink-0 object-contain" />
            {!collapsed && <span className="font-bold text-lg text-foreground tracking-tight">MagangKUM</span>}
          </div>
          {!collapsed && <div className="mx-3 border-b border-sidebar-border" />}
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <NavLink
                        to={item.path}
                        end
                        className={cn(
                          "relative rounded-lg transition-colors",
                          active
                            ? "bg-primary/8 text-primary font-semibold border-l-[3px] border-primary"
                            : "hover:bg-muted/50 text-sidebar-foreground"
                        )}
                        activeClassName=""
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarInner />
    </Sidebar>
  );
}
