import type { InjuredPlayer } from "@/app/types";
import { extractClubIdFromLogoUrl } from "@/lib/format";

export interface TeamInjuryGroup {
  club: string;
  clubLogoUrl: string;
  league: string;
  players: InjuredPlayer[];
  totalValue: number;
  count: number;
}

export function groupPlayersByClub(players: InjuredPlayer[]): TeamInjuryGroup[] {
  const groupMap = new Map<string, TeamInjuryGroup>();

  for (const player of players) {
    const existing = groupMap.get(player.club);
    if (existing) {
      existing.players.push(player);
      existing.totalValue += player.marketValueNum;
      existing.count++;
    } else {
      groupMap.set(player.club, {
        club: player.club,
        clubLogoUrl: player.clubLogoUrl,
        league: player.league,
        players: [player],
        totalValue: player.marketValueNum,
        count: 1,
      });
    }
  }

  return Array.from(groupMap.values());
}

export type WorstHitReason = "count" | "value" | "both" | null;
export type WorstHitScope = "top5" | "league" | null;

export interface WorstHitResult {
  reason: WorstHitReason;
  scope: WorstHitScope;
}

function getReasonFromGroups(
  clubId: string,
  groups: TeamInjuryGroup[],
): WorstHitReason {
  const mine = groups.find(
    (g) => extractClubIdFromLogoUrl(g.clubLogoUrl) === clubId,
  );
  if (!mine) return null;

  const maxCount = Math.max(...groups.map((g) => g.count));
  const maxValue = Math.max(...groups.map((g) => g.totalValue));
  const isCount = mine.count === maxCount;
  const isValue = mine.totalValue === maxValue;

  if (isCount && isValue) return "both";
  if (isCount) return "count";
  if (isValue) return "value";
  return null;
}

/** Check if clubId is the worst-hit team — first across all top 5 leagues, then within its league */
export function getWorstHitResult(
  clubId: string,
  clubInjuries: InjuredPlayer[],
  allPlayers: InjuredPlayer[],
): WorstHitResult {
  if (clubInjuries.length === 0) return { reason: null, scope: null };

  const allGroups = groupPlayersByClub(allPlayers);
  const top5Reason = getReasonFromGroups(clubId, allGroups);
  if (top5Reason) return { reason: top5Reason, scope: "top5" };

  const league = clubInjuries[0].league;
  const leagueGroups = allGroups.filter((g) => g.league === league);
  const leagueReason = getReasonFromGroups(clubId, leagueGroups);
  if (leagueReason) return { reason: leagueReason, scope: "league" };

  return { reason: null, scope: null };
}
