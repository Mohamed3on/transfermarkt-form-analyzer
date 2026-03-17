export type PositionClass = "cf" | "forward" | "attacking-midfield" | "central-midfield" | "other";

const POSITION_CLASS_MAP: Record<string, PositionClass> = {
  "Centre-Forward": "cf",
  "Left Winger": "forward",
  "Right Winger": "forward",
  "Second Striker": "forward",
  "Attacking Midfield": "attacking-midfield",
  "Central Midfield": "central-midfield",
};
const POSITION_CLASS_RANK: Record<PositionClass, number> = {
  other: 1,
  "central-midfield": 2,
  "attacking-midfield": 3,
  forward: 4,
  cf: 5,
};
const DEFENSIVE_POSITIONS = new Set<string>([
  "Goalkeeper",
  "Centre-Back",
  "Left-Back",
  "Right-Back",
  "Defensive Midfield",
  "Left Wing-Back",
  "Right Wing-Back",
]);

export type BroadPositionGroup = "forwards" | "midfielders" | "defenders" | "goalkeepers";

const BROAD_POSITION_MAP: Record<string, BroadPositionGroup> = {
  "Centre-Forward": "forwards",
  "Left Winger": "forwards",
  "Right Winger": "forwards",
  "Second Striker": "forwards",
  "Attacking Midfield": "midfielders",
  "Central Midfield": "midfielders",
  "Defensive Midfield": "midfielders",
  "Left Wing-Back": "defenders",
  "Right Wing-Back": "defenders",
  "Left-Back": "defenders",
  "Right-Back": "defenders",
  "Centre-Back": "defenders",
  "Goalkeeper": "goalkeepers",
};

export function getBroadPositionGroup(position: string): BroadPositionGroup {
  return BROAD_POSITION_MAP[position] ?? "midfielders";
}

const BROAD_POSITION_LABELS: Record<BroadPositionGroup, string> = {
  forwards: "Forwards",
  midfielders: "Midfielders",
  defenders: "Defenders",
  goalkeepers: "Goalkeepers",
};

export function getBroadPositionLabel(position: string): string {
  return BROAD_POSITION_LABELS[getBroadPositionGroup(position)];
}

const BROAD_POSITION_SHORT: Record<BroadPositionGroup, string> = {
  forwards: "FWD",
  midfielders: "MID",
  defenders: "DEF",
  goalkeepers: "GK",
};

export function getBroadPositionShortLabel(position: string): string {
  return BROAD_POSITION_SHORT[getBroadPositionGroup(position)];
}

/** Maps to the players page ?pos= filter values */
const BROAD_POSITION_FILTER: Record<BroadPositionGroup, string> = {
  forwards: "att",
  midfielders: "mid",
  defenders: "def",
  goalkeepers: "gk",
};

export function getBroadPositionFilter(position: string): string {
  return BROAD_POSITION_FILTER[getBroadPositionGroup(position)];
}

/** Effective position — prefers the most-played position this season over the registered position. */
export function effectivePosition(p: { playedPosition?: string; position: string }): string {
  return p.playedPosition || p.position;
}

export function getPositionClass(position: string): PositionClass {
  return POSITION_CLASS_MAP[position] ?? "other";
}

export function getPositionClassRank(position: string): number {
  return POSITION_CLASS_RANK[getPositionClass(position)];
}

export function canBeUnderperformerAgainst(candidatePosition: string, targetPosition: string): boolean {
  if (isDefensivePosition(candidatePosition) && !isDefensivePosition(targetPosition)) {
    return false;
  }
  return getPositionClassRank(candidatePosition) >= getPositionClassRank(targetPosition);
}

export function canBeOutperformerAgainst(candidatePosition: string, targetPosition: string): boolean {
  return getPositionClassRank(candidatePosition) <= getPositionClassRank(targetPosition);
}

export function isDefensivePosition(position: string): boolean {
  return DEFENSIVE_POSITIONS.has(position);
}

export function isAttackingPosition(position: string): boolean {
  return getPositionClassRank(position) >= POSITION_CLASS_RANK["attacking-midfield"];
}

/** `a` got equal or better output in equal or fewer minutes, with at least one strictly better. Falls back to strict points comparison when either side has no minutes data. */
export function strictlyOutperforms(
  a: { points: number; minutes?: number },
  b: { points: number; minutes?: number },
): boolean {
  if (a.minutes === undefined || b.minutes === undefined) return a.points > b.points;
  return a.points >= b.points && a.minutes <= b.minutes &&
    (a.points > b.points || a.minutes < b.minutes);
}
