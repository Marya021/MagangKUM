import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, ExternalLink, Clock } from "lucide-react";
import logoKemenkum from "@/assets/logo-kemenkum.png";

const KANWIL_ADDRESS = "Jl. Jend. Sudirman No. 233, Pekanbaru, Riau 28116";
const MAPS_QUERY = encodeURIComponent("Kantor Wilayah Kementerian Hukum Riau Pekanbaru");
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const MAPS_EMBED = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socials = [
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/kemenkumriau/" },
  { name: "YouTube", icon: Youtube, href: "https://www.youtube.com/@kemenkumriau" },
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/KanwilKemenkumhamRiau/" },
  { name: "Twitter / X", icon: XIcon, href: "https://twitter.com/kemenkumriau" },
];

export function LandingFooter() {
  return (
    <footer id="contact" className="relative bg-[hsl(222,70%,15%)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + sosial */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3">
              <img src={logoKemenkum} alt="Logo Kementerian Hukum" className="h-10 w-10 object-contain" loading="lazy" />
              <div>
                <div className="text-lg font-bold">MagangKUM</div>
                <p className="text-xs text-white/70">Kementerian Hukum Riau</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Platform resmi program magang di lingkungan Kantor Wilayah Kementerian Hukum Riau.
              Wujud komitmen kami dalam mencetak talenta muda berintegritas dan profesional.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    title={s.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Tautan Cepat */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold">Tautan Cepat</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li><a href="#top" className="hover:text-white transition-colors">Beranda</a></li>
              <li><a href="#positions" className="hover:text-white transition-colors">Lowongan</a></li>
              <li><Link to="/panduan" className="hover:text-white transition-colors">Alur Magang</Link></li>
              <li><a href="#about" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><Link to="/panduan" className="hover:text-white transition-colors">Panduan</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Informasi */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold">Informasi</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Syarat &amp; Ketentuan</a></li>
              <li><Link to="/panduan" className="hover:text-white transition-colors">Panduan Pendaftaran</Link></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Kontak Kami</a></li>
            </ul>
          </div>

          {/* Kontak Kami */}
          <div className="lg:col-span-3">
            <h4 className="text-base font-bold">Kontak Kami</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                <span className="leading-relaxed">{KANWIL_ADDRESS}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                <a href="tel:+628116904422" className="hover:text-white transition-colors">+62 811-6904-422</a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                <a href="mailto:kanwilriau@kemenkumham.go.id" className="break-all hover:text-white transition-colors">
                  kanwilriau@kemenkumham.go.id
                </a>
              </li>
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                <span>Senin – Jumat, 08.00 – 16.00 WIB</span>
              </li>
            </ul>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="relative">
                <iframe
                  title="Lokasi Kanwil Kemenkum Riau"
                  src={MAPS_EMBED}
                  className="h-40 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white/90 hover:text-white transition-colors"
              >
                Lihat di Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} MagangKUM · Kementerian Hukum Riau. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
