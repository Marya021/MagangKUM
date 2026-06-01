import { Card, CardContent } from "@/components/ui/card";
import { ScrollSection } from "@/components/landing/ScrollSection";
import { Building2, MapPin, Scale, Lightbulb, ScrollText, Megaphone, Search, Info, ExternalLink } from "lucide-react";
import logoKemenkum from "@/assets/logo-kemenkum.png";
import kantorWilayah from "@/assets/kantor-wilayah.jpg";

export function LandingAbout() {
  return (
    <section id="about" className="relative">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
        <ScrollSection>
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src={logoKemenkum} alt="Logo Kemenkumham Riau" className="hidden h-14 w-14 object-contain lg:block" />
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Kementerian Hukum Riau</h2>
            </div>
            <p className="text-base font-medium text-primary">
              Membangun Pelayanan Hukum yang Profesional dan Terpercaya
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Kantor Wilayah Kementerian Hukum Riau merupakan instansi vertikal yang melaksanakan sebagian tugas Kementerian Hukum di wilayah Provinsi Riau.
            </p>
            <a
              href="https://riau.kemenkum.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-md"
            >
              Kunjungi Situs Resmi Kemenkum Riau
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </ScrollSection>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <ScrollSection direction="left">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={kantorWilayah}
                alt="Kantor Wilayah Kementerian Hukum Riau"
                className="h-full w-full object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">20+</div>
                  <div className="text-xs text-muted-foreground">Satuan Kerja</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Seluruh Wilayah</div>
                  <div className="text-xs text-muted-foreground">Riau Terjangkau</div>
                </div>
              </div>
            </div>
          </ScrollSection>

          <ScrollSection delay={200} direction="right">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Scale, title: "Administrasi Hukum Umum", desc: "Pendaftaran fidusia\nKewarganegaraan & pewarganegaraan\nPengawasan notaris\nApostille" },
                { icon: Lightbulb, title: "Kekayaan Intelektual", desc: "Pendaftaran merek, hak cipta, paten\nPerlindungan dan pengakan KI\nEdukasi KI kepada masyarakat" },
                { icon: ScrollText, title: "Pembentukan Peraturan Daerah", desc: "Harmonisasi Raperda\nFasilitasi penyusunan produk hukum daerah" },
                { icon: Megaphone, title: "Pembinaan & Penyuluhan Hukum", desc: "Penyuluhan hukum ke masyarakat\nBantuan hukum\nLiterasi hukum" },
                { icon: Search, title: "Analisis & Evaluasi Hukum", desc: "Evaluasi peraturan daerah\nReformasi hukum daerah" },
                { icon: Info, title: "Konsultasi & Informasi Hukum", desc: "Konsultasi hukum\nJaringan dokumentasi & informasi hukum" },
              ].map((item, i) => (
                <Card key={i} className="border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 h-full">
                  <CardContent className="p-4">
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground whitespace-pre-line">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollSection>
        </div>
      </div>
    </section>
  );
}
