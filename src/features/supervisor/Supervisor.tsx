import { useMemo, useState } from "react";
import { useQueryState } from "nuqs";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GraduationCap, CalendarCheck, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import { useAssignedInterns, useInternAttendance, useInternReports } from "./hooks";
import type { InternAttendance, InternReport } from "./types";

const PAGE_SIZE = 10;

function PaginationControls({ page, totalPages, onPrev, onNext }: { page: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function PaginatedAttendanceTable({ data }: { data: InternAttendance[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jam Masuk</TableHead>
              <TableHead>Jam Keluar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{formatDate(a.date)}</TableCell>
                <TableCell>{formatTime(a.time_in)}</TableCell>
                <TableCell>{formatTime(a.time_out)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />}
    </>
  );
}

function PaginatedReports({ data }: { data: InternReport[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="space-y-3">
        {paged.map((r) => (
          <Card key={r.id} className="border-border/50">
            <CardContent className="p-4 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{formatDate(r.report_date)}</p>
              <p className="text-sm"><span className="font-medium">Kegiatan:</span> {r.activities}</p>
              {r.obstacles && <p className="text-sm"><span className="font-medium">Kendala:</span> {r.obstacles}</p>}
              {r.plan_tomorrow && <p className="text-sm"><span className="font-medium">Rencana besok:</span> {r.plan_tomorrow}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
      {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />}
    </>
  );
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID");
}

function formatTime(t: string | null) {
  if (!t) return "-";
  return t.slice(0, 5);
}

export function SupervisorContent() {
  const { user } = useAuth();
  const { data: interns = [], isLoading } = useAssignedInterns(user?.id);
  const [selectedInternId, setSelectedInternId] = useQueryState("intern", { defaultValue: "" });
  const selectedIntern = useMemo(() => interns.find((i) => i.intern_id === selectedInternId) ?? null, [interns, selectedInternId]);

  const { data: attendance = [], isLoading: loadingAtt } = useInternAttendance(selectedIntern?.user_id);
  const { data: reports = [], isLoading: loadingRep } = useInternReports(selectedIntern?.user_id);

  if (isLoading) return <TableSkeleton columns={5} rows={3} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Magang</h1>
        <p className="text-muted-foreground mt-1">Daftar peserta magang yang Anda bimbing</p>
      </div>

      {interns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Belum ada peserta magang yang ditugaskan</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Asal</TableHead>
                      <TableHead>Jurusan</TableHead>
                      <TableHead>Penempatan</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interns.map((intern) => (
                      <TableRow
                        key={intern.id}
                        className={`cursor-pointer hover:bg-accent/50 transition-colors ${selectedIntern?.intern_id === intern.intern_id ? "bg-accent/30" : ""}`}
                        onClick={() => setSelectedInternId(intern.intern_id)}
                      >
                        <TableCell className="font-medium">{intern.nama}</TableCell>
                        <TableCell>{intern.asal}</TableCell>
                        <TableCell>{intern.jurusan}</TableCell>
                        <TableCell>{intern.penempatan}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              intern.status === "Selesai"
                                ? "bg-destructive/15 text-destructive border-destructive/20"
                                : "bg-success/15 text-success border-success/20"
                            }
                          >
                            {intern.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {selectedIntern && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detail — {selectedIntern.nama}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="attendance">
                  <TabsList>
                    <TabsTrigger value="attendance" className="gap-1.5">
                      <CalendarCheck className="h-4 w-4" />
                      Absensi
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="gap-1.5">
                      <ClipboardList className="h-4 w-4" />
                      Laporan
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="attendance" className="mt-4">
                    {loadingAtt ? (
                      <TableSkeleton columns={3} rows={5} />
                    ) : attendance.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground">Belum ada data absensi</p>
                    ) : (
                      <PaginatedAttendanceTable data={attendance} />
                    )}
                  </TabsContent>

                  <TabsContent value="reports" className="mt-4">
                    {loadingRep ? (
                      <TableSkeleton columns={3} rows={5} />
                    ) : reports.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground">Belum ada laporan harian</p>
                    ) : (
                      <PaginatedReports data={reports} />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
