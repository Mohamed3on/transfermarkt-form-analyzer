import Link from "next/link";
import {
  DISCOVERY_SECTION_LABELS,
  DISCOVERY_SECTION_ORDER,
  getDiscoveryPresetsBySection,
  getPresetTargetHref,
} from "@/lib/discovery-presets";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Quick Views",
  description:
    "Curated preset filters across player rankings, value analysis, injury impact, and team form for the Premier League, La Liga, Bundesliga, Serie A, and Ligue 1.",
  path: "/discover",
  keywords: [
    "football analytics shortcuts",
    "loan players ranking europe",
    "new signings performance tracker",
    "injury impact rankings",
    "soccer quick stats",
  ],
});

export default function DiscoverPage() {
  return (
    <div className="py-4 sm:py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-pixel text-text-primary sm:text-3xl">Quick Views</h1>
        <p className="mt-2 max-w-3xl text-sm text-text-muted">
          Pre-configured filters that jump straight to specific stats — no setup needed. Just click and explore.
        </p>
      </header>

      <div className="space-y-8">
        {DISCOVERY_SECTION_ORDER.map((section) => {
          const presets = getDiscoveryPresetsBySection(section);
          if (presets.length === 0) return null;

          return (
            <section key={section}>
              <h2 className="mb-3 text-base font-pixel font-bold text-text-primary sm:text-lg">
                {DISCOVERY_SECTION_LABELS[section]}
              </h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {presets.map((preset) => (
                  <article
                    key={preset.slug}
                    className="rounded-lg border border-border-subtle bg-card p-3"
                  >
                    <h3 className="text-sm font-medium text-text-primary">{preset.title}</h3>
                    <p className="mt-1 text-xs text-text-muted">{preset.description}</p>
                    <div className="mt-2 text-xs">
                      <Link
                        href={getPresetTargetHref(preset)}
                        className="text-accent-blue hover:underline"
                      >
                        Open quick view
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
