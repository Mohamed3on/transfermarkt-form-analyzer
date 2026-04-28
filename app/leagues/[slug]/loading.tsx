import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeroSkeleton, DetailPageShellSkeleton } from "@/components/DetailHero";

function SkeletonRow() {
  return (
    <div className="rounded-xl border border-border-subtle bg-card p-3 sm:p-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="h-7 w-7 rounded-lg sm:h-8 sm:w-8" />
        <Skeleton className="h-12 w-12 rounded-xl sm:h-14 sm:w-14" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/5 sm:h-5" />
          <Skeleton className="h-3 w-1/4 sm:h-4" />
        </div>
        <Skeleton className="h-6 w-12 sm:h-7" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <DetailPageShellSkeleton>
      <DetailHeroSkeleton>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-24 w-24 rounded-[1.5rem] sm:h-28 sm:w-28" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-72" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </DetailHeroSkeleton>

      {Array.from({ length: 3 }).map((_, sectionIdx) => (
        <div key={sectionIdx} className="mt-10">
          <Skeleton className="mb-2 h-7 w-48" />
          <Skeleton className="mb-4 h-4 w-72" />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      ))}
    </DetailPageShellSkeleton>
  );
}
