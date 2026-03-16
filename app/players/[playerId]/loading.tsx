import { Skeleton } from "@/components/ui/skeleton";

export default function PlayerDetailLoading() {
  return (
    <div className="full-bleed pb-12 sm:pb-16">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-4">
        <Skeleton className="mb-4 h-5 w-36" />

        {/* Hero */}
        <div className="rounded-2xl border border-border-subtle bg-card p-5 sm:p-7 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Skeleton className="h-24 w-24 shrink-0 rounded-[1.5rem]" />
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-12 w-full max-w-lg" />
                  <div className="flex gap-3">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Hero metrics — plain text, not cards */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Deck with tabs */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border-subtle bg-card">
          {/* Tab bar */}
          <div className="px-5 py-4 sm:px-6">
            <div className="flex gap-1">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Rankings table */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
              {/* Season table */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>

            {/* Matches */}
            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-28" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
