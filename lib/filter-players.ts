export const TOP_5_LEAGUES = ["Premier League", "LaLiga", "Bundesliga", "Serie A", "Ligue 1"];

/** Build sorted Combobox options from a list of items, with an "All ..." default. */
export function uniqueFilterOptions<T>(items: T[], accessor: (item: T) => string | undefined, allLabel: string) {
  return [{ value: "all", label: allLabel }, ...Array.from(new Set(items.map(accessor).filter(Boolean))).sort().map((v) => ({ value: v!, label: v! }))];
}

export function filterPlayersByLeagueAndClub<T extends { league: string; club: string }>(
  players: T[],
  leagueFilter: string,
  clubFilter: string
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

export function getFormMinutes(player: { minutes: number; recentForm?: { minutes: number }[] }, window: "season" | number): number {
  if (window === "season") return player.minutes;
  return (player.recentForm ?? []).slice(0, window).reduce((s, g) => s + g.minutes, 0);
}

export function getFormNpga(player: { recentForm?: { goals: number; assists: number; penaltyGoals: number }[] }, window: number): number {
  return (player.recentForm ?? []).slice(0, window).reduce((s, g) => s + g.goals - (g.penaltyGoals ?? 0) + g.assists, 0);
}

/** Fraction of games missed (0–1). Players with 0 matches and 0 minutes are treated as 100% unavailable. */
export function missedPct(p: { totalMatches: number; minutes: number; gamesMissed?: number }): number {
  const missed = p.gamesMissed ?? 0;
  const total = p.totalMatches + missed;
  if (total === 0) return p.minutes === 0 ? 1 : 0;
  return missed / total;
}
