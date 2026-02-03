import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)]" />
              <div className="w-14 h-14 rounded-lg bg-[var(--bg-elevated)]" />
              <div className="flex-1 space-y-2">
                <div className="h-5 rounded w-1/3 bg-[var(--bg-elevated)]" />
                <div className="h-4 rounded w-1/4 bg-[var(--bg-elevated)]" />
                <div className="h-4 rounded w-1/2 bg-[var(--bg-elevated)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
