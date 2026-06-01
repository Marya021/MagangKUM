import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, GraduationCap } from "lucide-react";
import { useState } from "react";
import logoKemenkum from "@/assets/logo-kemenkum.png";

type Institution = {
  name: string;
  initials: string;
  color: string;
  logo: string;
};

// Logo asli (favicon resmi) dari masing-masing situs universitas/sekolah
const institutions: Institution[] = [
  { name: "Universitas Riau", initials: "UR", color: "from-blue-500 to-blue-700", logo: "/institutions/unri.png" },
  { name: "UIN Sultan Syarif Kasim Riau", initials: "US", color: "from-emerald-500 to-emerald-700", logo: "/institutions/uin-suska.png" },
  { name: "Universitas Islam Riau", initials: "UIR", color: "from-rose-500 to-rose-700", logo: "/institutions/uir.png" },
  { name: "Politeknik Caltex Riau", initials: "PCR", color: "from-amber-500 to-amber-700", logo: "/institutions/pcr.png" },
  { name: "Universitas Lancang Kuning", initials: "UL", color: "from-violet-500 to-violet-700", logo: "/institutions/unilak.png" },
  { name: "Universitas Muhammadiyah Riau", initials: "UM", color: "from-teal-500 to-teal-700", logo: "/institutions/umri.png" },
  { name: "Universitas Abdurrab", initials: "UA", color: "from-orange-500 to-orange-700", logo: "/institutions/abdurrab.png" },
  { name: "SMK/SMA Negeri (Kemdikbud)", initials: "SMK", color: "from-cyan-500 to-cyan-700", logo: "/institutions/kemdikbud.png" },
];

function InstitutionLogo({ inst }: { inst: Institution }) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      title={inst.name}
      className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background ring-2 ring-border shadow-sm transition-transform hover:-translate-y-0.5 hover:ring-primary/40"
    >
      {!errored ? (
        <img
          src={inst.logo}
          alt={inst.name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-8 w-8 object-contain"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${inst.color} text-[10px] font-bold text-white`}
        >
          {inst.initials}
        </div>
      )}
    </div>
  );
}

export function LandingTrust() {
  return (
    <section className="pb-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          {/* Institusi Pendidikan card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Dipercaya oleh Institusi Pendidikan di Riau</h3>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex flex-1 flex-wrap items-center gap-3 sm:gap-4">
                {institutions.map((inst) => (
                  <InstitutionLogo key={inst.name} inst={inst} />
                ))}
              </div>
              <a
                href="#positions"
                className="hidden shrink-0 items-center gap-1 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary sm:inline-flex"
              >
                Lihat Semua
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </motion.div>

          {/* Platform Resmi card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">Platform Resmi</h3>
                <p className="text-xs text-muted-foreground">
                  MagangKUM merupakan platform resmi di bawah Kementerian Hukum RI
                </p>
              </div>
            </div>
            <img src={logoKemenkum} alt="Logo Kemenkum" className="h-12 w-12 shrink-0 object-contain" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
