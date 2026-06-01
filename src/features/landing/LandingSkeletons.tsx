import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Skeleton className="h-8 w-48 rounded-full" />
            <Skeleton className="mt-6 h-12 w-full max-w-md" />
            <Skeleton className="mt-3 h-12 w-3/4" />
            <Skeleton className="mt-6 h-5 w-full max-w-lg" />
            <Skeleton className="mt-2 h-5 w-4/5" />
            <div className="mt-8 flex gap-3">
              <Skeleton className="h-12 w-40 rounded-md" />
              <Skeleton className="h-12 w-40 rounded-md" />
            </div>
          </div>
          <div className="relative">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <Skeleton className="absolute -top-4 -left-4 h-16 w-40 rounded-xl" />
            <Skeleton className="absolute -bottom-4 -right-4 h-16 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatsSkeleton() {
  return (
    <section className="relative bg-primary">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-center">
          <Skeleton className="h-16 w-full rounded-md bg-primary-foreground/10" />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="mx-auto h-12 w-20 bg-primary-foreground/10" />
                <Skeleton className="mx-auto h-4 w-24 bg-primary-foreground/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <Skeleton className="mx-auto h-9 w-72" />
        <Skeleton className="mx-auto mt-4 h-5 w-96" />
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-12 w-12 rounded-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function PositionsSkeleton() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto h-9 w-64" />
          <Skeleton className="mx-auto mt-4 h-5 w-80" />
        </div>
        <div className="mx-auto mt-10 max-w-md">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-1.5 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSkeleton() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto h-9 w-72" />
          <Skeleton className="mx-auto mt-3 h-5 w-56" />
          <Skeleton className="mx-auto mt-4 h-4 w-96" />
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTASkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-8">
      <Skeleton className="h-52 w-full rounded-2xl" />
    </section>
  );
}
