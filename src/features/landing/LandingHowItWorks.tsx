import { Search, UploadCloud, ClipboardCheck, Briefcase, Award, Sparkles, type LucideIcon } from "lucide-react";
import { ScrollSection } from "@/components/landing/ScrollSection";

type Step = {
  icon: LucideIcon;
  title: string;
  desc: string;
  iconClass: string;
  iconBg: string;
  iconBorder: string;
  badgeBg: string;
  glow: string;
};

const STEPS: Step[] = [
  {
    icon: Search,
    title: "Cari Lowongan",
    desc: "Temukan lowongan magang yang sesuai dengan minat dan jurusanmu.",
    iconClass: "text-rose-500",
    iconBg: "bg-rose-50",
    iconBorder: "border-rose-100",
    badgeBg: "bg-rose-500",
    glow: "from-rose-400/40 to-rose-300/0",
  },
  {
    icon: UploadCloud,
    title: "Upload Berkas",
    desc: "Lengkapi dan unggah berkas persyaratan dengan mudah secara online.",
    iconClass: "text-emerald-500",
    iconBg: "bg-emerald-50",
    iconBorder: "border-emerald-100",
    badgeBg: "bg-emerald-500",
    glow: "from-emerald-400/40 to-emerald-300/0",
  },
  {
    icon: ClipboardCheck,
    title: "Seleksi",
    desc: "Tim melakukan seleksi berkas dan mengumumkan hasilnya secara transparan.",
    iconClass: "text-violet-500",
    iconBg: "bg-violet-50",
    iconBorder: "border-violet-100",
    badgeBg: "bg-violet-500",
    glow: "from-violet-400/40 to-violet-300/0",
  },
  {
    icon: Briefcase,
    title: "Mulai Magang",
    desc: "Ikuti program magang sesuai penempatan dan bimbingan dari pembimbing.",
    iconClass: "text-amber-500",
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-100",
    badgeBg: "bg-amber-500",
    glow: "from-amber-400/40 to-amber-300/0",
  },
  {
    icon: Award,
    title: "Dapat Sertifikat",
    desc: "Selesaikan program dan dapatkan sertifikat magang resmi dari Kemenkum Riau.",
    iconClass: "text-blue-500",
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-100",
    badgeBg: "bg-blue-500",
    glow: "from-blue-400/40 to-blue-300/0",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[hsl(197_80%_55%)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8">
        <ScrollSection>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Cara Kerja
            </div>
            <h2 className="text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-primary via-[hsl(210_85%_50%)] to-[hsl(197_80%_45%)] bg-clip-text text-transparent">
                Alur Magang yang Mudah dan Terstruktur
              </span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Hanya lima langkah sederhana dari pendaftaran sampai mendapatkan sertifikat.
            </p>
          </div>
        </ScrollSection>

        {/* Desktop: horizontal timeline */}
        <div className="relative mt-16 hidden lg:block">
          <div className="pointer-events-none absolute left-0 right-0 top-[44px] mx-auto h-px border-t-2 border-dashed border-primary/25" />

          <div className="relative grid grid-cols-5 gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <ScrollSection key={step.title} delay={i * 100}>
                  <div className="group flex flex-col items-center text-center">
                    <div className="relative">
                      <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${step.glow} opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100`} />
                      <div className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-full ${step.iconBg} border-2 ${step.iconBorder} shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl`}>
                        <Icon className={`h-9 w-9 ${step.iconClass} transition-transform duration-300 group-hover:scale-110`} />
                      </div>
                      <span className={`absolute -top-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full ${step.badgeBg} text-xs font-bold text-white shadow-md ring-2 ring-background`}>
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 max-w-[200px] text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </ScrollSection>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet: vertical timeline */}
        <div className="relative mt-12 lg:hidden">
          <div className="pointer-events-none absolute left-[43px] top-2 bottom-2 w-px border-l-2 border-dashed border-primary/25" />
          <div className="space-y-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <ScrollSection key={step.title} delay={i * 80}>
                  <div className="group flex items-start gap-5">
                    <div className="relative shrink-0">
                      <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${step.glow} opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100`} />
                      <div className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-full ${step.iconBg} border-2 ${step.iconBorder} shadow-lg transition-all duration-300`}>
                        <Icon className={`h-7 w-7 ${step.iconClass}`} />
                      </div>
                      <span className={`absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full ${step.badgeBg} text-[11px] font-bold text-white shadow-md ring-2 ring-background`}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="pt-2">
                      <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </ScrollSection>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
