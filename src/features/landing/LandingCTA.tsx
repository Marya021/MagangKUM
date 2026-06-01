import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";

export function LandingCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-6 pb-20 sm:px-8"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[hsl(210_85%_50%)] to-[hsl(197_80%_45%)] px-6 py-12 shadow-2xl shadow-primary/30 sm:px-12 sm:py-14">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        {/* Dotted grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Floating sparkles */}
        <Sparkles className="pointer-events-none absolute right-10 top-8 h-5 w-5 animate-pulse text-white/40" />
        <Sparkles className="pointer-events-none absolute bottom-10 left-1/3 h-4 w-4 animate-pulse text-white/30 [animation-delay:600ms]" />

        <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative hidden shrink-0 sm:flex">
              <div className="absolute inset-0 animate-ping rounded-2xl bg-white/20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
                <Rocket className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Pendaftaran Dibuka
              </div>
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                Siap Memulai Karirmu?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
                Pendaftaran batch terbaru sedang dibuka. Jangan lewatkan kesempatan emas ini!
              </p>
            </div>
          </div>

          <Button
            size="lg"
            variant="secondary"
            className="group h-14 shrink-0 gap-2 rounded-xl bg-white px-7 text-base font-semibold text-primary shadow-xl shadow-black/10 transition-transform hover:scale-[1.03] hover:bg-white"
            asChild
          >
            <Link to="/auth">
              Daftar Sekarang
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
