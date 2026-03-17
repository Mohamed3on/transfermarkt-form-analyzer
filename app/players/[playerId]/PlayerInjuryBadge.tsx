"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { formatReturnInfo, formatInjuryDuration } from "@/lib/format";
import type { InjuredPlayer } from "@/app/types";

export function PlayerInjuryBadge({ playerId }: { playerId: string }) {
  const [injury, setInjury] = useState<InjuredPlayer | null>(null);

  useEffect(() => {
    fetch("/api/injured")
      .then((r) => r.json())
      .then((d) => {
        const match = (d.players ?? []).find(
          (p: InjuredPlayer) => p.profileUrl?.includes(`/spieler/${playerId}`),
        );
        if (match) setInjury(match);
      })
      .catch(() => {});
  }, [playerId]);

  if (!injury) return null;

  const returnInfo = formatReturnInfo(injury.returnDate);
  const duration = formatInjuryDuration(injury.injurySince);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-accent-cold-border bg-accent-cold-glow px-3 py-1.5 text-xs text-accent-cold-soft animate-in fade-in duration-300">
      <ShieldAlert className="mr-0.5 h-3.5 w-3.5" />
      {injury.injury}
      {duration ? ` · out ${duration}` : ""}
      {returnInfo ? ` · ${returnInfo.label}` : ""}
    </div>
  );
}
