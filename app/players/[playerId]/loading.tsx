import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeroSkeleton, DetailPageShellSkeleton } from "@/components/DetailHero";

export default function PlayerDetailLoading() {
  return (
    <DetailPageShellSkeleton>
      <DetailHeroSkeleton>
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

        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </DetailHeroSkeleton>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border-subtle bg-card">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex gap-1">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>

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
    </DetailPageShellSkeleton>
  );
}
