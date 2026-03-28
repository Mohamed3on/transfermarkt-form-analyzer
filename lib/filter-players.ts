export const TOP_5_LEAGUES = ["Premier League", "LaLiga", "Bundesliga", "Serie A", "Ligue 1"];

/** Build sorted Combobox options from a list of items, with an "All ..." default. */
export function uniqueFilterOptions<T>(
  items: T[],
  accessor: (item: T) => string | undefined,
  allLabel: string,
) {
  return [
    { value: "all", label: allLabel },
    ...Array.from(new Set(items.map(accessor).filter(Boolean)))
      .sort()
      .map((v) => ({ value: v!, label: v! })),
  ];
}

import type { ComboboxGroup } from "@/components/Combobox";

/** Build grouped league options (Top 5 + Other, sorted by player count) for Combobox. */
export function buildLeagueGroups(players: { league: string }[]): ComboboxGroup[] {
  const counts = new Map<string, number>();
  for (const p of players) if (p.league) counts.set(p.league, (counts.get(p.league) ?? 0) + 1);
  const byCount = (a: string, b: string) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
  const top5 = [...counts.keys()].filter((l) => TOP_5_LEAGUES.includes(l)).sort(byCount);
  const other = [...counts.keys()].filter((l) => !TOP_5_LEAGUES.includes(l)).sort(byCount);
  return [
    {
      options: [
        { value: "all", label: "All leagues" },
        { value: "top5", label: "Top 5 leagues" },
      ],
    },
    ...(top5.length
      ? [{ heading: "Top 5", options: top5.map((l) => ({ value: l, label: l })) }]
      : []),
    ...(other.length
      ? [{ heading: "Other", options: other.map((l) => ({ value: l, label: l })) }]
      : []),
  ];
}

export function filterPlayersByLeagueAndClub<T extends { league: string; club: string }>(
  players: T[],
  leagueFilter: string,
  clubFilter: string,
): T[] {
  return players.filter((player) => {
    if (leagueFilter === "top5") {
      if (!TOP_5_LEAGUES.includes(player.league)) return false;
    } else if (leagueFilter !== "all" && player.league !== leagueFilter) return false;
    if (clubFilter !== "all" && clubFilter && player.club !== clubFilter) return false;
    return true;
  });
}

export function filterTop5<T extends { league: string }>(players: T[]): T[] {
  return players.filter((p) => TOP_5_LEAGUES.includes(p.league));
}

export function getFormMinutes(
  player: { minutes: number; recentForm?: { minutes: number }[] },
  window: "season" | number,
): number {
  if (window === "season") return player.minutes;
  return (player.recentForm ?? []).slice(0, window).reduce((s, g) => s + g.minutes, 0);
}

export function getFormNpga(
  player: { recentForm?: { goals: number; assists: number; penaltyGoals: number }[] },
  window: number,
): number {
  return (player.recentForm ?? [])
    .slice(0, window)
    .reduce((s, g) => s + g.goals - (g.penaltyGoals ?? 0) + g.assists, 0);
}

export function getFormGoals(player: { recentForm?: { goals: number }[] }, window: number): number {
  return (player.recentForm ?? []).slice(0, window).reduce((s, g) => s + g.goals, 0);
}

export function getFormAssists(
  player: { recentForm?: { assists: number }[] },
  window: number,
): number {
  return (player.recentForm ?? []).slice(0, window).reduce((s, g) => s + g.assists, 0);
}

/** Single-pass form stats for a window — avoids 4 separate traversals. */
export function getFormStats(
  player: {
    recentForm?: { goals: number; assists: number; penaltyGoals: number; minutes: number }[];
  },
  window: number,
): { goals: number; assists: number; penaltyGoals: number; npga: number; minutes: number } {
  const games = (player.recentForm ?? []).slice(0, window);
  let goals = 0,
    assists = 0,
    penaltyGoals = 0,
    npga = 0,
    minutes = 0;
  for (const g of games) {
    goals += g.goals;
    assists += g.assists;
    penaltyGoals += g.penaltyGoals ?? 0;
    npga += g.goals - (g.penaltyGoals ?? 0) + g.assists;
    minutes += g.minutes;
  }
  return { goals, assists, penaltyGoals, npga, minutes };
}

/** Total games the player's team has played this season. */
export function gamesScheduled(p: {
  totalMatches: number;
  gamesMissed?: number;
  totalGames?: number;
}): number {
  return p.totalGames ?? p.totalMatches + (p.gamesMissed ?? 0);
}

/** Games the player was available for (not injured/suspended/absent). */
export function gamesAvailable(p: {
  totalMatches: number;
  gamesMissed?: number;
  totalGames?: number;
}): number {
  return gamesScheduled(p) - (p.gamesMissed ?? 0);
}

/** Split players into those playing less and more minutes than the target, filtered to same-or-higher value and same-or-more available games. */
export function filterMinutesBenchmark<
  T extends {
    playerId: string;
    marketValue: number;
    minutes: number;
    totalMatches: number;
    gamesMissed?: number;
    totalGames?: number;
  },
>(players: T[], target: T): { playingLess: T[]; playingMore: T[] } {
  const benchAvail = gamesAvailable(target);
  const playingLess: T[] = [];
  const playingMore: T[] = [];
  for (const p of players) {
    if (p.playerId === target.playerId) continue;
    if (p.marketValue < target.marketValue) continue;
    if (gamesAvailable(p) < benchAvail) continue;
    if (p.minutes <= target.minutes) playingLess.push(p);
    else playingMore.push(p);
  }
  return { playingLess, playingMore };
}

/** Fraction of games missed (0–1). Players with 0 matches and 0 minutes are treated as 100% unavailable. */
export function missedPct(p: {
  totalMatches: number;
  minutes: number;
  gamesMissed?: number;
  totalGames?: number;
}): number {
  const total = gamesScheduled(p);
  if (total === 0) return p.minutes === 0 ? 1 : 0;
  return (p.gamesMissed ?? 0) / total;
}
