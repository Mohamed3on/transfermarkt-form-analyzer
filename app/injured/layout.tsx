export default function InjuredLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-black mb-1 sm:mb-2 text-[var(--text-primary)]">
            Injury Impact
          </h1>
          <p className="text-sm sm:text-lg text-[var(--text-muted)]">
            Currently injured players ranked by market value across Europe&apos;s top 5 leagues. Team impact is the combined value of all sidelined squad members.
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
