import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollSection } from "@/components/landing/ScrollSection";
import { MapPin, CalendarDays, Users, ArrowRight, ChevronLeft, ChevronRight, Search, Sparkles, Bookmark, CheckCircle2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PositionDetailModal } from "./PositionDetailModal";

function formatDeadline(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isNew(dateStr: string) {
  const created = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return diffMs < 7 * 24 * 60 * 60 * 1000;
}

const ITEMS_PER_PAGE = 6;

interface LandingPositionsProps {
  positions: Tables<"positions">[];
  loading: boolean;
}

export function LandingPositions({ positions, loading }: LandingPositionsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<Tables<"positions"> | null>(null);

  const filteredPositions = useMemo(() => {
    if (!search.trim()) return positions;
    const q = search.toLowerCase();
    return positions.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [positions, search]);

  const totalPages = Math.ceil(filteredPositions.length / ITEMS_PER_PAGE);
  const paginatedPositions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPositions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPositions, currentPage]);

  const { data: acceptedCounts = {} } = useQuery({
    queryKey: ["landing-accepted-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_accepted_counts");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as { position_id: string; count: number }[] | null)?.forEach((r) => {
        counts[r.position_id] = r.count;
      });
      return counts;
    },
  });

  return (
    <section id="positions" className="relative overflow-hidden bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent">
      {/* Decorative glow blobs */}
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-[hsl(197_80%_55%)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8">
        <ScrollSection>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Lowongan Terbuka
            </div>
            <h2 className="text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-primary via-[hsl(210_85%_50%)] to-[hsl(197_80%_45%)] bg-clip-text text-transparent">
                Posisi Magang Tersedia
              </span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Jelajahi berbagai posisi magang dari departemen dan lokasi berbeda.
            </p>
          </div>
        </ScrollSection>

        {/* Search bar */}
        <div className="mx-auto mt-10 max-w-md">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-primary/30 to-[hsl(197_80%_55%)]/30 opacity-0 blur transition-opacity duration-300 group-focus-within:opacity-100" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari posisi, departemen, atau lokasi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-background/80 backdrop-blur-sm border-border/60 shadow-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-6 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-12 w-full rounded bg-muted animate-pulse" />
                  <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
                  <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-base font-medium text-foreground">
              {search ? "Tidak ada hasil" : "Belum Ada Lowongan"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Coba kata kunci lain." : "Posisi magang baru akan segera tersedia."}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedPositions.map((pos, i) => {
                const accepted = acceptedCounts[pos.id] ?? 0;
                const quota = pos.quota ?? 20;
                const remaining = Math.max(0, quota - accepted);
                const quotaFull = remaining <= 0;
                const quotaPercent = quota > 0 ? Math.min((accepted / quota) * 100, 100) : 100;

                return (
                  <ScrollSection key={pos.id} delay={i * 80} className="overflow-visible">
                    <div className="group relative h-full">
                      {/* Outer gradient glow on hover */}
                      <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary/40 via-[hsl(197_80%_55%)]/30 to-primary/40 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />

                      <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 h-full">
                        <CardContent className="relative flex h-full flex-col p-6">
                          {/* Top row: status badge + bookmark */}
                          <div className="flex items-start justify-between">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${quotaFull ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-600"}`}>
                              <CheckCircle2 className="h-3 w-3" />
                              {quotaFull ? "Penuh" : "Dibuka"}
                            </span>
                            <button
                              type="button"
                              aria-label="Simpan"
                              className="text-muted-foreground/60 transition-colors hover:text-primary"
                              onClick={(e) => e.preventDefault()}
                            >
                              <Bookmark className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Title + department */}
                          <h3 className="mt-3 text-[17px] font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                            {pos.title}
                          </h3>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-[11px] gap-1 border-primary/30 bg-primary/5 text-primary rounded-full px-2.5 py-0.5">
                              {pos.department}
                            </Badge>
                          </div>

                          {/* Meta icons row */}
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {pos.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {quota} Kuota
                            </span>
                          </div>

                          {/* Description */}
                          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                            {pos.description}
                          </p>

                          {/* Quota progress (subtle) */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className={`font-medium ${quotaFull ? "text-destructive" : "text-foreground/70"}`}>
                                Sisa {remaining}/{quota}
                              </span>
                              {!quotaFull && (
                                <span className="text-muted-foreground">{Math.round(100 - quotaPercent)}% tersisa</span>
                              )}
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${quotaFull ? "bg-destructive" : "bg-gradient-to-r from-primary to-[hsl(197_80%_55%)]"}`}
                                style={{ width: `${quotaPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Deadline */}
                          {pos.deadline && (
                            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Deadline {formatDeadline(pos.deadline)}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1 border-border/70 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                              onClick={() => setSelectedPosition(pos)}
                            >
                              Lihat Detail
                            </Button>
                            {quotaFull ? (
                              <Button className="flex-1" variant="secondary" disabled>
                                Kuota Penuh
                              </Button>
                            ) : (
                              <Button className="flex-1 gap-1 bg-gradient-to-r from-primary to-[hsl(197_80%_50%)] shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 transition-all" asChild>
                                <Link to="/auth">
                                  Apply Sekarang
                                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollSection>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={page === currentPage ? "default" : "outline"} size="icon" onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <PositionDetailModal
        position={selectedPosition}
        open={!!selectedPosition}
        onOpenChange={(open) => !open && setSelectedPosition(null)}
        accepted={selectedPosition ? acceptedCounts[selectedPosition.id] ?? 0 : 0}
      />
    </section>
  );
}
