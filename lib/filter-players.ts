export const TOP_5_LEAGUES = ["Premier League", "LaLiga", "Bundesliga", "Serie A", "Ligue 1"];

export function filterPlayersByLeagueAndClub<T extends { league: string; club: string }>(
  players: T[],
  leagueFilter: string,
  clubFilter: string
): T[] {
  return players.filter((player) => {
    if (leagueFilter !== "all" && player.league !== leagueFilter) return false;
    if (clubFilter !== "all" && clubFilter && player.club !== clubFilter) return false;
    return true;
  });
}

export function filterTop5<T extends { league: string }>(players: T[]): T[] {
  return players.filter((p) => TOP_5_LEAGUES.includes(p.league));
}
