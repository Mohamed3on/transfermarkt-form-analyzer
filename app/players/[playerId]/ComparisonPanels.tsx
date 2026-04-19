"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PlayerStats } from "@/app/types";
import { ComparisonItem } from "@/components/ComparisonItem";
import { FilterButton } from "@/components/FilterButton";
import { SectionPanel } from "@/components/SectionPanel";

type CardProps = {
  title: string;
  emptyLabel: string;
  players: PlayerStats[];
  positive: boolean;
  benchmarkUrl: string;
};

function Card({ title, emptyLabel, players, positive, benchmarkUrl }: CardProps) {
  return (
    <SectionPanel
      title={title}
      aside={
        <Link
          href={benchmarkUrl}
          className="text-xs text-text-secondary transition-colors hover:text-text-primary"
        >
          See full benchmark →
        </Link>
      }
    >
      <div className="space-y-3">
        {players.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-elevated px-4 py-6 text-sm text-text-secondary">
            {emptyLabel}
          </div>
        ) : (
          players.map((player) => (
            <ComparisonItem key={player.playerId} player={player} positive={positive} />
          ))
        )}
      </div>
    </SectionPanel>
  );
}

export function ComparisonPanels({
  underperformers,
  outperformers,
  sameLeagueOnly,
  leagueLabel,
  underBenchmarkUrl,
  overBenchmarkUrl,
}: {
  underperformers: PlayerStats[];
  outperformers: PlayerStats[];
  sameLeagueOnly: boolean;
  leagueLabel: string;
  underBenchmarkUrl: string;
  overBenchmarkUrl: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = new URLSearchParams(params);
    if (sameLeagueOnly) next.delete("sameLeague");
    else next.set("sameLeague", "1");
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const withScope = (url: string) => (sameLeagueOnly ? `${url}&bLeague=1` : url);

  return (
    <div className={`space-y-4 ${isPending ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <FilterButton active={sameLeagueOnly} onClick={toggle}>
          {leagueLabel} only
        </FilterButton>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Pricier peers he's beating"
          emptyLabel={
            sameLeagueOnly
              ? `No pricier ${leagueLabel} peers are behind him on the current value model.`
              : "No pricier comparable players are behind him on the current value model."
          }
          players={underperformers}
          positive
          benchmarkUrl={withScope(underBenchmarkUrl)}
        />
        <Card
          title="Cheaper peers ahead of him"
          emptyLabel={
            sameLeagueOnly
              ? `No cheaper ${leagueLabel} peers are ahead of him on the current value model.`
              : "No cheaper comparable players are ahead of him on the current value model."
          }
          players={outperformers}
          positive={false}
          benchmarkUrl={withScope(overBenchmarkUrl)}
        />
      </section>
    </div>
  );
}
