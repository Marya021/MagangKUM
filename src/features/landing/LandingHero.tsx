import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Rocket, Briefcase, Users, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import heroDevices from "@/assets/hero-devices.png";
import officeBuilding from "@/assets/office-building.png";

interface LandingHeroProps {
  positionsCount: number;
  totalQuota: number;
}

export function LandingHero({ positionsCount, totalQuota }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Soft accent circles (let landing-bg gradient show through) */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[hsl(200_90%_88%)]/40 blur-2xl" />
      <div className="pointer-events-none absolute -left-60 top-40 h-[600px] w-[600px] rounded-full bg-[hsl(200_90%_90%)]/30 blur-2xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-[hsl(200_90%_88%)]/40 blur-2xl" />
      <div className="pointer-events-none absolute right-1/4 -top-32 h-[400px] w-[400px] rounded-full bg-[hsl(200_90%_92%)]/30 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              Platform Magang Resmi
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.05]">
              Temukan Peluang
              <br />
              <span className="text-primary">Magang Terbaik</span>
              <br />
              di Kemenkum Riau
            </h1>

            <p className="mt-6 max-w-lg text-base text-muted-foreground leading-relaxed">
              MagangKUM adalah platform resmi untuk menemukan, mendaftar, dan memantau program magang di Kementerian
              Hukum Riau. Kelola lamaran dan pantau progresmu dalam satu tempat.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Rocket className="h-4 w-4" />
                Mulai Sekarang
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#positions"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-card px-6 py-3.5 text-base font-semibold text-primary transition-all hover:border-primary hover:bg-primary/5"
              >
                <Briefcase className="h-4 w-4" />
                Lihat Lowongan
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/64?img=12" alt="Mahasiswa magang" loading="lazy" className="h-8 w-8 rounded-full border-2 border-background object-cover" />
                <img src="https://i.pravatar.cc/64?img=47" alt="Mahasiswa magang" loading="lazy" className="h-8 w-8 rounded-full border-2 border-background object-cover" />
                <img src="https://i.pravatar.cc/64?img=32" alt="Mahasiswa magang" loading="lazy" className="h-8 w-8 rounded-full border-2 border-background object-cover" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="text-sm text-muted-foreground">Dipercaya oleh mahasiswa dari berbagai kampus</p>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -top-16 -right-16 -z-10 h-72 w-72 rounded-full bg-[hsl(210_85%_60%)]/15 blur-3xl" />

            {/* Office building backdrop — fully visible */}
            <img
              src={officeBuilding}
              alt="Gedung Kementerian Hukum Riau"
              className="pointer-events-none absolute left-1/2 top-0 z-0 h-auto w-[115%] max-w-none -translate-x-1/2 opacity-95 drop-shadow-[0_20px_40px_rgba(15,42,90,0.18)]"
              width={1280}
              height={853}
            />

            {/* Hero devices (laptop + phone) — sized so the building stays visible above */}
            <img
              src={heroDevices}
              alt="Pratinjau dashboard dan sertifikat magang MagangKUM"
              className="relative z-10 h-auto w-[110%] max-w-none -ml-[5%] mt-[32%] drop-shadow-[0_30px_50px_rgba(15,42,90,0.32)]"
              width={1536}
              height={1152}
            />

            {/* Floating card: Lowongan (top-left, outside the laptop) — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -left-2 top-[28%] z-20 hidden rounded-2xl border border-white/70 bg-white/95 p-4 shadow-[0_24px_48px_-12px_rgba(15,42,90,0.22)] backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 sm:-left-6 sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(210_85%_55%)] text-primary-foreground shadow-lg shadow-primary/30">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold tracking-tight text-foreground leading-none">{positionsCount}</span>
                    <span className="text-sm font-bold leading-none text-primary">+</span>
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold text-muted-foreground">Lowongan Tersedia</div>
                  <a href="#positions" className="group/btn mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80">
                    Lihat Lowongan
                    <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Floating card: Aktif & Terbuka (top-right pill, outside the laptop) — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute top-[30%] -right-2 z-20 hidden items-center gap-3 rounded-full border border-white/70 bg-white/95 py-2.5 pl-2.5 pr-5 shadow-[0_20px_40px_rgba(15,42,90,0.18)] backdrop-blur-xl sm:-right-4 sm:flex"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-success/15">
                <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-success opacity-75" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-success ring-2 ring-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight text-foreground">Aktif & Terbuka</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-success">Pendaftaran dibuka</span>
              </div>
            </motion.div>



            {/* Floating card: Total Kuota (bottom, close to laptop) — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-4 rounded-2xl border border-white/70 bg-white/90 p-4 pr-5 shadow-[0_24px_48px_-12px_rgba(15,42,90,0.25)] backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 hover:scale-[1.02] sm:flex"
              style={{ transform: "translateX(-50%)" }}
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(210_85%_55%)] text-primary-foreground shadow-lg shadow-primary/30">
                <Users className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-success ring-2 ring-white" />
                </span>
              </div>
              <div className="min-w-[130px]">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold tracking-tight text-foreground leading-none">{totalQuota}</span>
                  <span className="text-xs font-bold text-primary">peserta</span>
                </div>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Kuota Magang</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(210_85%_55%)]"
                  />
                </div>
              </div>
            </motion.div>

            {/* Mobile-only compact stats — clean grid below the devices */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:hidden">
              <div className="rounded-2xl border border-white/70 bg-white/95 p-3 shadow-[0_12px_24px_-12px_rgba(15,42,90,0.18)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(210_85%_55%)] text-primary-foreground">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold leading-none text-foreground">{positionsCount}+</div>
                    <div className="mt-0.5 text-[10px] font-semibold text-muted-foreground">Lowongan</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/95 p-3 shadow-[0_12px_24px_-12px_rgba(15,42,90,0.18)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(210_85%_55%)] text-primary-foreground">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold leading-none text-foreground">{totalQuota}</div>
                    <div className="mt-0.5 text-[10px] font-semibold text-muted-foreground">Kuota Magang</div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-3 rounded-full border border-white/70 bg-white/95 px-3 py-2 shadow-[0_12px_24px_-12px_rgba(15,42,90,0.18)]">
                <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-success/15">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-success ring-2 ring-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-tight text-foreground">Aktif & Terbuka</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-success">Pendaftaran dibuka</span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}

