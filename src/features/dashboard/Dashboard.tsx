import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, FileText, Clock, CheckCircle, XCircle, TrendingUp, Users } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { STATUS_COLORS, pieConfig, trendConfig, attendanceConfig, quotaConfig } from "./constants";
import { usePositionsCount, useApplicationsStats, useAttendanceWeeklyStats, usePositionQuotaStats, useInternDashboard } from "./hooks";
import { InternDashboard } from "./InternDashboard";

export function DashboardContent() {
  const { user, role } = useAuth();

  const { data: positions, isLoading: posLoading } = usePositionsCount();
  const { data: applications, isLoading: appLoading } = useApplicationsStats();
  const { data: attendanceData } = useAttendanceWeeklyStats();
  const { data: positionStats } = usePositionQuotaStats();
  const { data: internData } = useInternDashboard(role === "applier" ? user?.id : undefined);

  const trendData = (() => {
    const raw = applications?.raw || [];
    const today = new Date();
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = startOfDay(subDays(today, i));
      const dateStr = format(d, "yyyy-MM-dd");
      const label = format(d, "EEE", { locale: idLocale });
      const count = raw.filter((a) => a.created_at?.startsWith(dateStr)).length;
      days.push({ date: label, count });
    }
    return days;
  })();

  const isLoading = posLoading || appLoading;
  const stats = applications?.stats ?? { total: 0, pending: 0, reviewing: 0, accepted: 0, rejected: 0 };

  const pieData = [
    { name: "pending", value: stats.pending },
    { name: "reviewing", value: stats.reviewing },
    { name: "accepted", value: stats.accepted },
    { name: "rejected", value: stats.rejected },
  ].filter((d) => d.value > 0);

  const adminCards = [
    { label: "Posisi Terbuka", value: positions ?? 0, icon: Briefcase, color: "text-primary", accent: "accent-primary", iconBg: "bg-primary/10" },
    { label: "Total Lamaran", value: stats.total, icon: FileText, color: "text-primary", accent: "accent-primary", iconBg: "bg-primary/10" },
    { label: "Menunggu", value: stats.pending, icon: Clock, color: "text-warning", accent: "accent-warning", iconBg: "bg-warning/10" },
    { label: "Diterima", value: stats.accepted, icon: CheckCircle, color: "text-success", accent: "accent-success", iconBg: "bg-success/10" },
  ];

  const reviewerCards = [
    { label: "Perlu Direview", value: stats.pending + stats.reviewing, icon: FileText, color: "text-warning", accent: "accent-warning", iconBg: "bg-warning/10" },
    { label: "Diterima", value: stats.accepted, icon: CheckCircle, color: "text-success", accent: "accent-success", iconBg: "bg-success/10" },
    { label: "Ditolak", value: stats.rejected, icon: XCircle, color: "text-destructive", accent: "accent-destructive", iconBg: "bg-destructive/10" },
  ];

  const applierCards = [
    { label: "Lamaran Saya", value: stats.total, icon: FileText, color: "text-primary", accent: "accent-primary", iconBg: "bg-primary/10" },
    { label: "Menunggu", value: stats.pending, icon: Clock, color: "text-warning", accent: "accent-warning", iconBg: "bg-warning/10" },
    { label: "Diterima", value: stats.accepted, icon: CheckCircle, color: "text-success", accent: "accent-success", iconBg: "bg-success/10" },
  ];

  const cards = role === "admin" ? adminCards : role === "reviewer" ? reviewerCards : applierCards;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  })();

  const userName = user?.user_metadata?.full_name || "";

  if (role === "applier" && internData?.hasInternship) {
    return <InternDashboard data={internData} userName={userName} greeting={greeting} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">{greeting}{userName ? `, ${userName}` : ""}! 👋</h1>
        <p className="mt-1 text-primary-foreground/80 text-sm">
          {role === "admin" ? "Kelola platform magang dari sini." : role === "reviewer" ? "Tinjau lamaran yang masuk." : role === "supervisor" ? "Pantau perkembangan magang Anda." : "Pantau status lamaran dan aktivitas magang Anda."}
        </p>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => (
              <Card
                key={card.label}
                className={`stat-card-accent ${card.accent} border-border/40 shadow-sm`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${card.iconBg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid gap-4 lg:grid-cols-2"
          >
            {/* Application status pie */}
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-base">Status Lamaran</CardTitle>
                <CardDescription>Distribusi status semua lamaran</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ChartContainer config={pieConfig} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        strokeWidth={2}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                    Belum ada data lamaran
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application trend area */}
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-base">Tren Lamaran</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> 7 hari terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trendConfig} className="max-h-[250px]">
                  <AreaChart data={trendData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <defs>
                      <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(197, 71%, 52%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(197, 71%, 52%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(197, 71%, 52%)"
                      fill="url(#fillCount)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Second charts row - admin/reviewer only */}
          {(role === "admin" || role === "reviewer") && (
            <div className="grid gap-4 lg:grid-cols-2">
              {attendanceData && attendanceData.length > 0 && (
                <Card className="card-clean">
                  <CardHeader>
                    <CardTitle className="text-base">Kehadiran Mingguan</CardTitle>
                    <CardDescription>Rekap kehadiran 7 hari terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={attendanceConfig} className="max-h-[250px]">
                      <BarChart data={attendanceData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="ontime" stackId="a" fill="hsl(152, 60%, 45%)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="late" stackId="a" fill="hsl(38, 92%, 50%)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="absent" stackId="a" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {positionStats && positionStats.length > 0 && (
                <Card className="card-clean">
                  <CardHeader>
                    <CardTitle className="text-base">Kuota Posisi</CardTitle>
                    <CardDescription>Terisi vs sisa kuota per posisi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={quotaConfig} className="max-h-[250px]">
                      <BarChart data={positionStats} layout="vertical">
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="terisi" stackId="a" fill="hsl(152, 60%, 45%)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="sisa" stackId="a" fill="hsl(200, 20%, 88%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
