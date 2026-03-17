import { ShieldAlert } from "lucide-react";
import { formatReturnInfo, formatInjuryDuration } from "@/lib/format";
import { getInjuredPlayers } from "@/lib/injured";

const PLAYER_ID_RE = /\/spieler\/(\d+)/;

export async function PlayerInjuryBadge({ playerId }: { playerId: string }) {
  const injuredData = await getInjuredPlayers();
  const injury = injuredData.players.find(
    (p) => p.profileUrl.match(PLAYER_ID_RE)?.[1] === playerId,
  );

  if (!injury) return null;

  const returnInfo = formatReturnInfo(injury.returnDate);
  const duration = formatInjuryDuration(injury.injurySince);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-accent-cold-border bg-accent-cold-glow px-3 py-1.5 text-xs text-accent-cold-soft">
      <ShieldAlert className="mr-0.5 h-3.5 w-3.5" />
      {injury.injury}
      {duration ? ` · out ${duration}` : ""}
      {returnInfo ? ` · ${returnInfo.label}` : ""}
    </div>
  );
}
