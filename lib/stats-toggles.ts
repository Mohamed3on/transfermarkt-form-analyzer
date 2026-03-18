import type { PlayerStats } from "@/app/types";

/** Adjust stats based on pen/intl toggles. Returns new array. */
export function applyStatsToggles(
  players: PlayerStats[],
  opts: { includePen: boolean; includeIntl: boolean },
): PlayerStats[] {
  return players.map((p) => {
    const rawGoals = p.goals + (opts.includeIntl ? p.intlGoals : 0);
    const assists = p.assists + (opts.includeIntl ? p.intlAssists : 0);
    const penAdj = opts.includePen ? 0 : p.penaltyGoals + (opts.includeIntl ? p.intlPenaltyGoals : 0);
    const goals = rawGoals - penAdj;
    return {
      ...p,
      goals,
      assists,
      points: goals + assists,
      minutes: (p.minutes ?? 0) + (opts.includeIntl ? p.intlMinutes : 0),
      matches: p.matches + (opts.includeIntl ? p.intlAppearances : 0),
    };
  });
}
