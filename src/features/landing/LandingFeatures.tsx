import { motion } from "framer-motion";
import { Briefcase, FileText, CheckCircle, Users, Sparkles } from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Posisi Magang Terkurasi",
    description: "Temukan posisi magang terbaik dari berbagai departemen dan lokasi.",
  },
  {
    icon: FileText,
    title: "Lamaran Mudah",
    description: "Kirim lamaran dengan mudah lengkap dengan CV dan surat pengantar.",
  },
  {
    icon: CheckCircle,
    title: "Pantau Status",
    description: "Lacak status lamaran Anda secara real-time dari awal hingga akhir.",
  },
  {
    icon: Users,
    title: "Manajemen Terpadu",
    description: "Reviewer dan admin dapat mengelola lamaran dengan efisien.",
  },
];

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-gradient-to-br from-[hsl(210_85%_55%)] via-primary to-[hsl(197_80%_45%)] py-16 sm:py-20 lg:py-28"
    >
      {/* Top + bottom wave dividers (soft) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/40 to-transparent" />

      {/* Dot pattern overlay with fade mask */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(circle, white 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      {/* Glow blobs */}
      <div className="pointer-events-none absolute -right-40 -top-20 h-[28rem] w-[28rem] rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 -bottom-20 h-[28rem] w-[28rem] rounded-full bg-[hsl(190_100%_70%)]/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Fitur Unggulan
          </div>
          <h2 className="text-3xl font-bold text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
            Semua yang Kamu Butuhkan
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            Fitur lengkap untuk memudahkan proses magang dari awal hingga akhir.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative"
            >
              {/* Outer glow on hover */}
              <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-white/40 to-[hsl(190_100%_80%)]/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative h-full overflow-hidden rounded-2xl border border-white/40 bg-white/95 p-6 shadow-[0_10px_40px_-12px_hsl(210_80%_30%/0.4)] backdrop-blur-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_-12px_hsl(210_80%_30%/0.5)]">
                {/* Subtle top sheen */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                {/* Corner accent */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl transition-opacity duration-500 group-hover:opacity-80" />

                <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(197_80%_45%)] text-white shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-foreground sm:text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>

                {/* Bottom accent line */}
                <div className="mt-5 h-1 w-10 rounded-full bg-gradient-to-r from-primary to-[hsl(197_80%_55%)] transition-all duration-300 group-hover:w-20" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
