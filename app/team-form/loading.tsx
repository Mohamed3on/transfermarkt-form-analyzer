function SkeletonCard() {
  return (
    <div
      className="p-3 rounded-xl animate-pulse"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
        <div className="w-10 h-10 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded w-1/3" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-3 rounded w-1/4" style={{ background: "var(--bg-elevated)" }} />
        </div>
        <div className="h-6 w-12 rounded" style={{ background: "var(--bg-elevated)" }} />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-3" style={{ color: "#16a34a" }}>
          Overperformers
        </h2>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-3" style={{ color: "#dc2626" }}>
          Underperformers
        </h2>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
