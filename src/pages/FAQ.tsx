import { Link } from "react-router-dom";
import { LandingNavbar } from "@/features/landing/LandingNavbar";
import { LandingFooter } from "@/features/landing/LandingFooter";
import { SEO } from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, ArrowLeft, Mail } from "lucide-react";
import { faqCategories as categories } from "@/features/assistant/faq-data";


export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="FAQ - Pertanyaan Seputar Magang | MagangKUM" description="Jawaban atas pertanyaan umum tentang program magang Kementerian Hukum Riau: pendaftaran, persyaratan, absensi, dan sertifikat." />
      <LandingNavbar />

      {/* Hero */}
      <section className="border-b border-border/50 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-20">
          <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground sm:h-14 sm:w-14">
              <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">FAQ</h1>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                Pertanyaan yang sering diajukan seputar penggunaan platform MagangKUM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick navigation */}
      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground sm:text-sm">{cat.title}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="bg-background">
        <div className="mx-auto max-w-5xl space-y-12 px-6 pb-16 sm:px-8 sm:pb-20">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} id={cat.id} className="scroll-mt-20">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">{cat.title}</h2>
                </div>
                <Accordion type="single" collapsible className="space-y-3">
                  {cat.items.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`${cat.id}-${i}`}
                      className="rounded-xl border border-border/50 bg-card px-4 sm:px-5"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="text-sm font-semibold text-foreground sm:text-base">{item.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}

          {/* Contact CTA */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground sm:text-xl">Masih punya pertanyaan?</h3>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Tim MagangKUM siap membantu Anda. Lihat panduan lengkap atau hubungi admin.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link to="/panduan">Lihat Panduan</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Kembali ke Beranda</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
