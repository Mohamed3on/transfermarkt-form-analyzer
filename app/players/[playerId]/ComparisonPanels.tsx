"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PlayerStats } from "@/app/types";
import type { ComparisonScope } from "@/lib/player-detail";
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
  scope,
  leagueLabel,
  underBenchmarkUrl,
  overBenchmarkUrl,
}: {
  underperformers: PlayerStats[];
  outperformers: PlayerStats[];
  scope: ComparisonScope;
  leagueLabel: string;
  underBenchmarkUrl: string;
  overBenchmarkUrl: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setScope = (next: ComparisonScope) => {
    const qp = new URLSearchParams(params);
    qp.delete("sameLeague");
    qp.delete("top5");
    if (next === "league") qp.set("sameLeague", "1");
    else if (next === "top5") qp.set("top5", "1");
    const qs = qp.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const toggleScope = (target: Exclude<ComparisonScope, "all">) =>
    setScope(scope === target ? "all" : target);

  const benchmarkSuffix = { all: "", league: "&bLeague=1", top5: "&bTop5=1" }[scope];
  const peerLabel = { all: "comparable", league: leagueLabel, top5: "top 5 league" }[scope];

  return (
    <div className={`space-y-4 ${isPending ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <FilterButton active={scope === "top5"} onClick={() => toggleScope("top5")}>
          Top 5 leagues only
        </FilterButton>
        <FilterButton active={scope === "league"} onClick={() => toggleScope("league")}>
          {leagueLabel} only
        </FilterButton>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Pricier peers he's beating"
          emptyLabel={`No pricier ${peerLabel} peers are behind him on the current value model.`}
          players={underperformers}
          positive
          benchmarkUrl={`${underBenchmarkUrl}${benchmarkSuffix}`}
        />
        <Card
          title="Cheaper peers ahead of him"
          emptyLabel={`No cheaper ${peerLabel} peers are ahead of him on the current value model.`}
          players={outperformers}
          positive={false}
          benchmarkUrl={`${overBenchmarkUrl}${benchmarkSuffix}`}
        />
      </section>
    </div>
  );
}
