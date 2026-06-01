import { motion } from "framer-motion";
import { Quote, Star, Sparkles } from "lucide-react";

type Testimonial = {
  name: string;
  university: string;
  batch: string;
  quote: string;
  rating: number;
  initials: string;
  avatarGradient: string;
  accentGradient: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Dinda Putri",
    university: "Universitas Riau",
    batch: "Batch 1",
    quote:
      "Magang di Kemenkum Riau memberi saya banyak pengalaman baru dan ilmu yang tidak saya dapatkan di kelas. Pegawainya sangat membantu!",
    rating: 5,
    initials: "DP",
    avatarGradient: "from-rose-400 to-rose-600",
    accentGradient: "from-rose-400 via-pink-500 to-rose-600",
  },
  {
    name: "Muhammad Fadli",
    university: "UIN Suska Riau",
    batch: "Batch 1",
    quote:
      "Sistem MagangKUM sangat membantu, semua proses jadi lebih mudah, transparan, dan terstruktur.",
    rating: 5,
    initials: "MF",
    avatarGradient: "from-blue-400 to-blue-600",
    accentGradient: "from-sky-400 via-blue-500 to-indigo-600",
  },
  {
    name: "Siti Nurhaliza",
    university: "Politeknik Caltex Riau",
    batch: "Batch 1",
    quote:
      "Saya bangga bisa menjadi bagian dari Kemenkum Riau dan berkontribusi dalam pelayanan hukum.",
    rating: 5,
    initials: "SN",
    avatarGradient: "from-emerald-400 to-emerald-600",
    accentGradient: "from-emerald-400 via-teal-500 to-emerald-600",
  },
];

export function LandingTestimonials() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-[hsl(197_80%_55%)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Testimoni
          </div>
          <h2 className="text-4xl font-bold sm:text-5xl">
            <span className="bg-gradient-to-r from-primary via-[hsl(210_85%_50%)] to-[hsl(197_80%_45%)] bg-clip-text text-transparent">
              Apa Kata Mereka?
            </span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Cerita nyata dari peserta magang yang telah merasakan pengalamannya.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative"
            >
              {/* Soft glow on hover */}
              <div
                className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${t.accentGradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30`}
              />
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                {/* Top accent bar */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.accentGradient}`}
                />

                {/* Watermark quote */}
                <Quote
                  className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 text-primary/[0.06]"
                  strokeWidth={1.5}
                />

                {/* Rating up top */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <Quote className="mt-4 h-6 w-6 text-primary/40" />
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                  <div className="relative shrink-0">
                    <div
                      className={`absolute -inset-0.5 rounded-full bg-gradient-to-br ${t.accentGradient} opacity-70 blur-sm`}
                    />
                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarGradient} text-sm font-bold text-white ring-2 ring-background`}
                    >
                      {t.initials}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      {t.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {t.university}
                    </div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-primary/80">
                      {t.batch}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
