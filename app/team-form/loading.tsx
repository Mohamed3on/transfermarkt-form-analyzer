import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard() {
  return (
    <div
      className="p-3 sm:p-4 rounded-xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
        <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 sm:h-5 w-2/5" />
          <Skeleton className="h-3 sm:h-4 w-1/4" />
        </div>
        <Skeleton className="h-6 sm:h-7 w-12" />
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-xs">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      {/* Stats skeleton */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-8 p-3 sm:p-4 rounded-xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center space-y-1">
            <Skeleton className="h-6 sm:h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-36" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
