import type { RecentGameStats } from "@/app/types";
import { LEAGUE_NAMES } from "./fetch-player-minutes";

/**
 * Returns enriched recent matches for a player.
 * Opponent names/logos are pre-populated by the refresh script via clubs.json.
 * This function just fills in any remaining gaps (competition names, match report URLs).
 */
export async function getPlayerRecentMatches(
  _playerId: string,
  fallbackMatches: RecentGameStats[] = [],
): Promise<RecentGameStats[]> {
  return fallbackMatches.map((match) => ({
    ...match,
    competitionName:
      match.competitionName ||
      (match.competitionId ? LEAGUE_NAMES[match.competitionId] : undefined),
  }));
}
