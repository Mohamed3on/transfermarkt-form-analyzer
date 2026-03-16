import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Crown, Medal, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { createPageMetadata } from "@/lib/metadata";
import {
  formatMarketValue,
  formatReturnInfo,
  formatInjuryDuration,
  getPlayerDetailHref,
  getPlayerIdFromProfileUrl,
  ordinal,
} from "@/lib/format";
import { getTeamDetailData } from "@/lib/team-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { LeagueBadge } from "@/components/LeagueBadge";
import { ComparisonItem } from "@/components/ComparisonItem";
import { DetailDeck } from "@/components/DetailDeck";
import { HeroMetric } from "@/components/HeroMetric";
import { SectionPanel } from "@/components/SectionPanel";
import { SquadTab } from "./SquadTab";
import type { InjuredPlayer } from "@/app/types";

function InjuredPlayerRow({ player }: { player: InjuredPlayer }) {
  const returnInfo = formatReturnInfo(player.returnDate);
  const duration = formatInjuryDuration(player.injurySince);
  const playerId = getPlayerIdFromProfileUrl(player.profileUrl);
  const href = playerId ? getPlayerDetailHref(playerId) : `https://www.transfermarkt.com${player.profileUrl}`;

  return (
    <Link
      href={href}
      target={playerId ? undefined : "_blank"}
      rel={playerId ? undefined : "noopener noreferrer"}
      className="flex items-center gap-3 rounded-xl border border-border-subtle bg-elevated p-2.5 transition-colors hover:border-border-medium hover:bg-card-hover"
    >
      <PlayerAvatar imageUrl={player.imageUrl} name={player.name} size="sm" className="border border-border-subtle" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text-primary">{player.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
          <span>{player.position}</span>
          <span className="opacity-40">·</span>
          <span className="text-red-400">{player.injury}</span>
          {duration && (
            <>
              <span className="opacity-40">·</span>
              <span>out {duration}</span>
            </>
          )}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-value text-accent-hot">{player.marketValue}</p>
        {returnInfo && (
          <p className={`text-[11px] ${returnInfo.imminent ? "text-emerald-400 font-medium" : "text-text-muted"}`}>
            {returnInfo.label}
          </p>
        )}
      </div>
    </Link>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const data = await getTeamDetailData(clubId);

  if (!data) {
    return createPageMetadata({
      title: "Team Report",
      description: "Detailed team report with squad, value analysis, and injuries.",
      path: `/teams/${clubId}`,
    });
  }

  return createPageMetadata({
    title: `${data.name} Report`,
    description: `${data.name}: squad overview, value analysis, injury report, and form data from SquadStat.`,
    path: `/teams/${clubId}`,
    keywords: [data.name, data.league, "team report", "squad analysis"],
  });
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const data = await getTeamDetailData(clubId);

  if (!data) {
    if (/^\d+$/.test(clubId)) {
      const url = `https://www.transfermarkt.com/x/startseite/verein/${clubId}`;
      return (
        <div className="mx-auto flex min-h-64 max-w-md flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-elevated">
            <ArrowUpRight className="h-5 w-5 text-text-muted" />
          </div>
          <div>
            <p className="text-lg font-pixel text-text-primary">Not in tracked dataset</p>
            <p className="mt-1 text-sm text-text-secondary">Redirecting to Transfermarkt&hellip;</p>
          </div>
          <meta httpEquiv="refresh" content={`1;url=${url}`} />
          <a href={url} className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-elevated px-4 py-2 text-sm text-text-primary transition-colors hover:bg-card-hover">
            Go now
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <Link href="/expected-position" className="text-xs text-text-muted transition-colors hover:text-text-secondary">
            &larr; Back to team rankings
          </Link>
        </div>
      );
    }
    notFound();
  }

  const {
    name,
    logoUrl,
    league,
    clubUrl,
    teamForm,
    squad,
    squadValue,
    manager,
    formPresence,
    recentForm,
    injuries,
    overperformers,
    underperformers,
    trendPlayers,
  } = data;

  const avgValue = squad.length > 0 ? Math.round(squadValue / squad.length) : 0;
  const injuryValue = injuries.reduce((s, p) => s + p.marketValueNum, 0);

  const deltaLabel = teamForm
    ? teamForm.deltaPts > 0
      ? `+${teamForm.deltaPts} above expectation`
      : teamForm.deltaPts < 0
      ? `${teamForm.deltaPts} below expectation`
      : "On par with expectation"
    : null;

  return (
    <div className="full-bleed pt-6 pb-12 sm:pt-8 sm:pb-16">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-4">
        <Link
          href="/expected-position"
          className="mb-4 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to team rankings
        </Link>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[1.75rem] border border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(88,166,255,0.16),transparent_38%),radial-gradient(circle_at_80%_12%,rgba(0,255,135,0.14),transparent_30%),linear-gradient(180deg,var(--bg-card),var(--bg-elevated))] p-5 animate-blur-in motion-reduce:animate-none sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(88,166,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(88,166,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.5rem] border border-border-medium bg-white p-3 sm:h-28 sm:w-28">
                  {logoUrl ? (
                    <img src={logoUrl} alt={name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-3xl text-text-muted">?</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <LeagueBadge league={league} />
                    {teamForm && teamForm.deltaPts > 0 && (
                      <Badge className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                        Overperforming
                      </Badge>
                    )}
                    {teamForm && teamForm.deltaPts < 0 && (
                      <Badge className="rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs text-red-400">
                        Underperforming
                      </Badge>
                    )}
                    {formPresence.some((f) => f.type === "top") && (
                      <Badge className="rounded-full border border-accent-hot-border bg-accent-hot-glow px-3 py-1 text-xs text-accent-hot">
                        Form leader
                      </Badge>
                    )}
                  </div>

                  <h1 className="mt-4 text-3xl font-pixel leading-tight text-text-primary sm:text-4xl">
                    {name}
                  </h1>

                  {manager && (() => {
                    const hasRanking = manager.ppg !== null && manager.ppgRank !== undefined && manager.totalComparableManagers !== undefined;
                    const isOnly = hasRanking && manager.totalComparableManagers === 1;
                    const isBest = hasRanking && manager.ppgRank === 1 && !isOnly;
                    const isWorst = hasRanking && manager.ppgRank === manager.totalComparableManagers && !isBest && !isOnly;

                    const ppgColor = isBest
                      ? "text-emerald-400"
                      : isWorst
                      ? "text-red-400"
                      : "text-text-secondary";

                    return (
                      <div className="mt-3 space-y-1.5 text-sm text-text-secondary">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-text-muted">Manager:</span>
                          <a
                            href={manager.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-semibold hover:underline transition-colors ${manager.isCurrentManager ? "text-accent-blue" : "text-text-muted"}`}
                          >
                            {manager.name}
                          </a>
                          {!manager.isCurrentManager && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-500 border border-red-500/30">Sacked</span>
                          )}
                          {hasRanking && (
                            <span className={`text-xs ${ppgColor}`}>
                              <span className="font-value">{manager.ppg!.toFixed(2)}</span> PPG · {manager.matches} {manager.matches === 1 ? "game" : "games"} · <span className="font-value">#{manager.ppgRank}</span> of {manager.totalComparableManagers}
                              {isBest && <span className="ml-1 text-emerald-400 font-medium">· Best ever</span>}
                              {isWorst && <span className="ml-1 text-red-400 font-medium">· Worst ever</span>}
                              {isOnly && <span className="ml-1 text-text-muted">· Only manager</span>}
                            </span>
                          )}
                          {manager.ppg !== null && !hasRanking && (
                            <span className="text-xs text-text-secondary">
                              <span className="font-value">{manager.ppg.toFixed(2)}</span> PPG · {manager.matches} {manager.matches === 1 ? "game" : "games"}
                            </span>
                          )}
                          {manager.matches === 0 && (
                            <span className="text-xs text-text-muted">New manager</span>
                          )}
                        </div>
                        {hasRanking && !isOnly && (
                          <p className="text-[11px] text-text-muted">
                            Ranked among managers with {manager.matches}+ games at this club since 1995.
                          </p>
                        )}
                        {manager.bestManager && manager.worstManager && !isOnly && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            <span>
                              <span className="text-text-muted">Best:</span>{" "}
                              <a href={manager.bestManager.profileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-medium">{manager.bestManager.name}</a>
                              <span className="font-value text-text-secondary ml-1">{manager.bestManager.ppg.toFixed(2)} PPG</span>
                              <span className="text-text-muted ml-1">({manager.bestManager.years})</span>
                            </span>
                            <span>
                              <span className="text-text-muted">Worst:</span>{" "}
                              <a href={manager.worstManager.profileUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline font-medium">{manager.worstManager.name}</a>
                              <span className="font-value text-text-secondary ml-1">{manager.worstManager.ppg.toFixed(2)} PPG</span>
                              <span className="text-text-muted ml-1">({manager.worstManager.years})</span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button asChild variant="outline" className="border-border-medium bg-elevated text-text-primary hover:bg-card-hover">
                      <Link href={`/players?club=${encodeURIComponent(squad[0]?.club ?? name)}`}>
                        Filter in Players
                      </Link>
                    </Button>
                    {clubUrl && (
                      <Button asChild variant="outline" className="border-border-medium bg-elevated text-text-primary hover:bg-card-hover">
                        <a href={clubUrl} target="_blank" rel="noopener noreferrer">
                          Transfermarkt
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`grid gap-x-8 gap-y-5 ${teamForm ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}>
              {teamForm && (
                <HeroMetric
                  label="League position"
                  value={ordinal(teamForm.leaguePosition)}
                  subline={`${teamForm.points} pts · expected ${ordinal(teamForm.marketValueRank)}`}
                  accentClass="text-text-primary"
                />
              )}
              {teamForm && (
                <HeroMetric
                  label="Points gap"
                  value={teamForm.deltaPts > 0 ? `+${teamForm.deltaPts}` : String(teamForm.deltaPts)}
                  subline={deltaLabel ?? ""}
                  accentClass={teamForm.deltaPts > 0 ? "text-emerald-400" : teamForm.deltaPts < 0 ? "text-red-400" : "text-text-primary"}
                />
              )}
              <HeroMetric
                label="Avg. player value"
                value={formatMarketValue(avgValue)}
                subline={teamForm ? `${ordinal(teamForm.marketValueRank)} by squad value` : `${squad.length} tracked players`}
                accentClass="text-accent-gold"
              />
            </div>

            {(injuries.length > 0 || trendPlayers.length > 0 || formPresence.length > 0) && (
              <div className="col-span-full flex flex-wrap gap-2.5">
                {injuries.length > 0 && (
                  <Badge className="rounded-full border border-accent-cold-border bg-accent-cold-glow px-3 py-1 text-xs text-accent-cold-soft">
                    {injuries.length} injured · {formatMarketValue(injuryValue)} sidelined
                  </Badge>
                )}
                {trendPlayers.map((tp) => (
                  <Link key={tp.player.playerId} href={getPlayerDetailHref(tp.player.playerId)}>
                    <Badge className={`rounded-full border px-3 py-1 text-xs transition-colors hover:brightness-125 ${
                      tp.type === "winner"
                        ? "border-accent-hot-border bg-accent-hot-glow text-accent-hot"
                        : "border-accent-cold-border bg-accent-cold-glow text-accent-cold-soft"
                    }`}>
                      {tp.type === "winner" ? <TrendingUp className="mr-1 h-3.5 w-3.5" /> : <TrendingDown className="mr-1 h-3.5 w-3.5" />}
                      {tp.player.name} · {tp.appearances.length} {tp.type === "winner" ? "rises" : "drops"}
                    </Badge>
                  </Link>
                ))}
                {formPresence.map((fp) => (
                  <Link key={`${fp.type}-${fp.category}`} href="/form">
                    <Badge className={`rounded-full border px-3 py-1 text-xs transition-colors hover:brightness-125 ${
                      fp.type === "top"
                        ? "border-accent-hot-border bg-accent-hot-glow text-accent-hot"
                        : "border-accent-cold-border bg-accent-cold-glow text-accent-cold-soft"
                    }`}>
                      {fp.type === "top" ? "↑" : "↓"} {fp.category} · last {fp.periods.join(", ")}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <DetailDeck sections={[
          { value: "squad", label: "Squad" },
          { value: "form", label: "Recent Form" },
          { value: "value", label: "Value Analysis" },
          { value: "injuries", label: `Injuries${injuries.length > 0 ? ` (${injuries.length})` : ""}` },
        ]}>
          {/* Tab 1: Squad */}
          <SquadTab squad={squad} />

          {/* Tab 2: Recent Form */}
          <div>
            {recentForm.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-subtle bg-elevated px-4 py-6 text-sm text-text-secondary">
                No recent form data available for this team.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Form table across windows */}
                <div className="overflow-x-auto rounded-xl border border-border-subtle">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle bg-black/20 text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        <th className="px-3 py-2 text-left font-normal">Window <span className="text-text-secondary">/ {recentForm[0]?.totalTeams ?? ""} top-5 league teams</span></th>
                        <th className="px-3 py-2 text-right font-normal">W</th>
                        <th className="px-3 py-2 text-right font-normal">D</th>
                        <th className="px-3 py-2 text-right font-normal">L</th>
                        <th className="px-3 py-2 text-right font-normal">Pts</th>
                        <th className="px-3 py-2 text-right font-normal">GF</th>
                        <th className="px-3 py-2 text-right font-normal">GA</th>
                        <th className="px-3 py-2 text-right font-normal">GD</th>
                        <th className="hidden sm:table-cell px-3 py-2 text-right font-normal">PPG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentForm.map(({ period, stats, ranks, totalTeams }) => {
                        const games = stats.wins + stats.draws + stats.losses;
                        const ppg = games > 0 ? (stats.points / games).toFixed(2) : "—";
                        const rankLabel = (r: number) => {
                          const fromBottom = totalTeams - r + 1;
                          const isTop = r <= 3;
                          const isBottom = fromBottom <= 3;
                          const color = isTop ? "text-emerald-400" : isBottom ? "text-red-400/80" : "text-text-muted";
                          const icon = r === 1 ? <Crown className="inline h-2.5 w-2.5" />
                            : isTop ? <Medal className="inline h-2.5 w-2.5 opacity-60" />
                            : isBottom ? <TriangleAlert className="inline h-2.5 w-2.5" />
                            : null;
                          return (
                            <span className={`ml-1 text-[10px] ${color}`}>
                              {icon} #{r}
                            </span>
                          );
                        };
                        return (
                          <tr key={period} className="border-b border-border-subtle/50 last:border-0">
                            <td className="px-3 py-2.5 text-text-secondary whitespace-nowrap">Last {period}</td>
                            <td className="px-3 py-2.5 text-right font-value text-text-primary">{stats.wins}</td>
                            <td className="px-3 py-2.5 text-right font-value text-text-primary">{stats.draws}</td>
                            <td className="px-3 py-2.5 text-right font-value text-text-primary">{stats.losses}</td>
                            <td className="px-3 py-2.5 text-right font-value text-accent-blue whitespace-nowrap">
                              {stats.points}{rankLabel(ranks.points)}
                            </td>
                            <td className="px-3 py-2.5 text-right font-value text-text-primary whitespace-nowrap">
                              {stats.goalsScored}{rankLabel(ranks.goalsScored)}
                            </td>
                            <td className="px-3 py-2.5 text-right font-value text-text-primary whitespace-nowrap">
                              {stats.goalsConceded}{rankLabel(ranks.goalsConceded)}
                            </td>
                            <td className={`px-3 py-2.5 text-right font-value whitespace-nowrap ${stats.goalDiff > 0 ? "text-emerald-400" : stats.goalDiff < 0 ? "text-red-400" : "text-text-primary"}`}>
                              {stats.goalDiff > 0 ? "+" : ""}{stats.goalDiff}{rankLabel(ranks.goalDiff)}
                            </td>
                            <td className="hidden sm:table-cell px-3 py-2.5 text-right font-value text-text-secondary">{ppg}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Form presence badges */}
                {formPresence.length > 0 && (
                  <SectionPanel
                    title="Category leaders"
                    aside={
                      <Link href="/form" className="text-xs text-text-secondary transition-colors hover:text-text-primary">
                        Full form analysis &rarr;
                      </Link>
                    }
                  >
                    <div className="flex flex-wrap gap-2">
                      {formPresence.map((fp) => (
                        <div
                          key={`${fp.type}-${fp.category}`}
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            fp.type === "top"
                              ? "border-accent-hot/25 bg-accent-hot-glow text-accent-hot"
                              : "border-accent-cold/25 bg-accent-cold-glow text-accent-cold-soft"
                          }`}
                        >
                          <span className="font-medium">{fp.type === "top" ? "↑" : "↓"} {fp.category}</span>
                          <span className="ml-1.5 opacity-60">in last {fp.periods.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </SectionPanel>
                )}
              </div>
            )}
          </div>

          {/* Tab 3: Value Analysis */}
          <div className="space-y-8">
            <SectionPanel
              title={`Bargains at ${name} (${overperformers.length})`}
              aside={
                <Link href="/value-analysis?mode=ga&dTab=bargains" className="text-xs text-text-secondary transition-colors hover:text-text-primary">
                  Full analysis &rarr;
                </Link>
              }
            >
              {overperformers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-subtle bg-elevated px-4 py-6 text-sm text-text-secondary">
                  No club players currently outperform 3+ pricier comparable peers.
                </div>
              ) : (
                <div className="space-y-3">
                  {overperformers.map((p) => (
                    <ComparisonItem key={p.playerId} player={p} positive />
                  ))}
                </div>
              )}
            </SectionPanel>

            <SectionPanel
              title={`Overpriced at ${name} (${underperformers.length})`}
              aside={
                <Link href="/value-analysis?mode=ga" className="text-xs text-text-secondary transition-colors hover:text-text-primary">
                  Full analysis &rarr;
                </Link>
              }
            >
              {underperformers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-subtle bg-elevated px-4 py-6 text-sm text-text-secondary">
                  No club players are currently outperformed by 3+ cheaper comparable peers.
                </div>
              ) : (
                <div className="space-y-3">
                  {underperformers.map((p) => (
                    <ComparisonItem key={p.playerId} player={p} positive={false} />
                  ))}
                </div>
              )}
            </SectionPanel>
          </div>

          {/* Tab 4: Injuries */}
          <div>
            {injuries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-subtle bg-elevated px-4 py-6 text-sm text-text-secondary">
                No injured players at this club right now.
              </div>
            ) : (
              <div className="space-y-3">
                {injuries.map((p) => (
                  <InjuredPlayerRow key={p.profileUrl || p.name} player={p} />
                ))}
              </div>
            )}
          </div>
        </DetailDeck>
      </div>
    </div>
  );
}
