import { motion } from "framer-motion";
import { Briefcase, Users, Building2, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface LandingStatsProps {
  stats: { value: string; label: string }[];
}

const META: { icon: LucideIcon; iconClass: string; sub: string }[] = [
  { icon: Briefcase, iconClass: "bg-primary text-primary-foreground", sub: "Lowongan aktif saat ini" },
  { icon: Users, iconClass: "bg-success text-success-foreground", sub: "Kuota peserta magang" },
  { icon: Building2, iconClass: "bg-[hsl(265_70%_60%)] text-white", sub: "Unit kerja di Kemenkum Riau" },
  { icon: GraduationCap, iconClass: "bg-warning text-warning-foreground", sub: "Telah bergabung bersama kami" },
];

export function LandingStats({ stats }: LandingStatsProps) {
  return (
    <section className="relative -mt-4 pb-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat, i) => {
              const meta = META[i] ?? META[0];
              const Icon = meta.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl font-bold leading-none text-foreground">{stat.value}</div>
                    <div className="mt-1 text-sm font-medium text-foreground">{stat.label}</div>
                    <div className="text-[11px] text-muted-foreground">{meta.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
