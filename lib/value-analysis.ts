import type { PlayerStats } from "@/app/types";
import {
  canBeUnderperformerAgainst,
  canBeOutperformerAgainst,
  isDefensivePosition,
  strictlyOutperforms,
} from "@/lib/positions";

export type ValueCandidate = PlayerStats & { count: number };

/**
 * Find players who are either overperformers (bargains) or underperformers (overpriced).
 * When `candidateOutperforms` is true, finds cheap players outperforming expensive ones.
 * When false, finds expensive players outperformed by cheaper ones.
 */
export function findValueCandidates(
  players: PlayerStats[],
  { candidateOutperforms, minMinutes, sortAsc }: {
    candidateOutperforms: boolean;
    minMinutes?: number;
    sortAsc: boolean;
  }
): ValueCandidate[] {
  const candidates: ValueCandidate[] = [];

  for (const player of players) {
    if (isDefensivePosition(player.position) || player.position === "Central Midfield") continue;
    if (player.minutes === undefined) continue;
    if (minMinutes !== undefined && player.minutes < minMinutes) continue;

    const count = players.filter((p) =>
      p.playerId !== player.playerId &&
      (candidateOutperforms
        ? p.marketValue >= player.marketValue &&
          strictlyOutperforms(player, p) &&
          canBeUnderperformerAgainst(p.position, player.position)
        : p.marketValue <= player.marketValue &&
          strictlyOutperforms(p, player) &&
          canBeOutperformerAgainst(p.position, player.position))
    ).length;

    if (count >= 2) candidates.push({ ...player, count });
  }

  const undominated = candidates.filter((player) =>
    !candidates.some((other) =>
      other.playerId !== player.playerId &&
      (candidateOutperforms
        ? canBeUnderperformerAgainst(player.position, other.position) &&
          other.marketValue <= player.marketValue &&
          strictlyOutperforms(other, player)
        : canBeUnderperformerAgainst(other.position, player.position) &&
          other.marketValue >= player.marketValue &&
          strictlyOutperforms(player, other))
    )
  );

  return undominated.sort((a, b) => sortAsc ? a.marketValue - b.marketValue : b.marketValue - a.marketValue);
}
