import { Skeleton } from "@/components/ui/skeleton";

export default function PlayerDetailLoading() {
  return (
    <div className="pb-12 sm:pb-16">
      <Skeleton className="mb-4 h-5 w-36" />

      <div className="rounded-[1.75rem] border border-border-subtle bg-card p-5 sm:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Skeleton className="h-24 w-24 rounded-[1.5rem]" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-80 max-w-full" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-36" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Skeleton className="h-8 w-48 rounded-full" />
              <Skeleton className="h-8 w-40 rounded-full" />
              <Skeleton className="h-8 w-44 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-2xl" />
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[30rem] rounded-2xl" />
        <Skeleton className="h-[30rem] rounded-2xl" />
      </div>
    </div>
  );
}
