import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function PlayerCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
          <Skeleton className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 sm:h-5 w-2/5" />
            <Skeleton className="h-3 sm:h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <>
      {/* Stats skeleton */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-1">
                <Skeleton className="h-6 sm:h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs skeleton */}
      <div className="mb-4 sm:mb-6">
        <Skeleton className="h-10 w-56 rounded-lg" />
      </div>

      {/* Player cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <PlayerCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
