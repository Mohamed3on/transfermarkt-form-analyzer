export default function TeamFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black mb-1 sm:mb-2" style={{ color: "var(--text-primary)" }}>
            Team Value vs Table
          </h1>
          <p className="text-sm sm:text-lg" style={{ color: "var(--text-muted)" }}>
            Each team&apos;s expected points are derived from their squad market value rank within the league. The delta shows how many points they&apos;re ahead or behind what their spending level predicts.
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
