"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import {
  formatMarketValue,
  formatReturnInfo,
  formatInjuryDuration,
  getPlayerDetailHref,
  getPlayerIdFromProfileUrl,
} from "@/lib/format";
import type { InjuredPlayer, ManagerInfo } from "@/app/types";

export function ManagerClient({ clubId }: { clubId: string }) {
  const [manager, setManager] = useState<ManagerInfo | null>(null);

  useEffect(() => {
    fetch(`/api/manager/${clubId}`)
      .then((r) => r.json())
      .then((d) => setManager(d.manager))
      .catch(() => {});
  }, [clubId]);

  if (!manager) return <div className="mt-3 h-5 w-48 animate-pulse rounded bg-border-subtle" />;

  const hasRanking = manager.ppg !== null && manager.ppgRank !== undefined && manager.totalComparableManagers !== undefined;
  const isOnly = hasRanking && manager.totalComparableManagers === 1;
  const isBest = hasRanking && manager.ppgRank === 1 && !isOnly;
  const isWorst = hasRanking && manager.ppgRank === manager.totalComparableManagers && !isBest && !isOnly;
  const ppgColor = isBest ? "text-emerald-400" : isWorst ? "text-red-400" : "text-text-secondary";

  return (
    <div className="mt-3 space-y-1.5 text-sm text-text-secondary">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-text-muted">Manager:</span>
        <a href={manager.profileUrl} target="_blank" rel="noopener noreferrer" className={`font-semibold hover:underline transition-colors ${manager.isCurrentManager ? "text-accent-blue" : "text-text-muted"}`}>
          {manager.name}
        </a>
        {!manager.isCurrentManager && (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-500 border border-red-500/30">Sacked</span>
        )}
        {hasRanking && (
          <span className={`text-xs ${ppgColor}`}>
            <span className="font-value">{manager.ppg!.toFixed(2)}</span> PPG · {manager.matches} {manager.matches === 1 ? "game" : "games"} · <span className="font-value">#{manager.ppgRank}</span> of {manager.totalComparableManagers}
            {isBest && <span className="ml-1 text-emerald-400 font-medium">· Best ever</span>}
            {isWorst && <span className="ml-1 text-red-400 font-medium">· Worst ever</span>}
            {isOnly && <span className="ml-1 text-text-muted">· Only manager since &apos;95 with {manager.matches}+ games</span>}
          </span>
        )}
        {manager.ppg !== null && !hasRanking && (
          <span className="text-xs text-text-secondary">
            <span className="font-value">{manager.ppg.toFixed(2)}</span> PPG · {manager.matches} {manager.matches === 1 ? "game" : "games"}
          </span>
        )}
        {manager.matches === 0 && <span className="text-xs text-text-muted">New manager</span>}
      </div>
      {hasRanking && !isOnly && (
        <p className="text-[11px] text-text-muted">
          Ranked among managers with {manager.matches}+ games at this club since 1995.
        </p>
      )}
      {manager.bestManager && manager.worstManager && !isOnly && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span>
            <span className="text-text-muted">Best:</span>{" "}
            <a href={manager.bestManager.profileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-medium">{manager.bestManager.name}</a>
            <span className="font-value text-text-secondary ml-1">{manager.bestManager.ppg.toFixed(2)} PPG</span>
            <span className="text-text-muted ml-1">({manager.bestManager.years})</span>
          </span>
          <span>
            <span className="text-text-muted">Worst:</span>{" "}
            <a href={manager.worstManager.profileUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline font-medium">{manager.worstManager.name}</a>
            <span className="font-value text-text-secondary ml-1">{manager.worstManager.ppg.toFixed(2)} PPG</span>
            <span className="text-text-muted ml-1">({manager.worstManager.years})</span>
          </span>
        </div>
      )}
    </div>
  );
}

export function InjuriesBadgeClient({ clubId }: { clubId: string }) {
  const [injuries, setInjuries] = useState<InjuredPlayer[] | null>(null);

  useEffect(() => {
    fetch("/api/injured")
      .then((r) => r.json())
      .then((d) => {
        const clubInjuries = (d.players ?? []).filter(
          (p: InjuredPlayer) => {
            const id = p.clubLogoUrl?.match(/\/(\d+)\.png/)?.[1];
            return id === clubId;
          },
        );
        setInjuries(clubInjuries);
      })
      .catch(() => setInjuries([]));
  }, [clubId]);

  if (!injuries || injuries.length === 0) return null;
  const injuryValue = injuries.reduce((s, p) => s + p.marketValueNum, 0);

  return (
    <Badge className="rounded-full border border-accent-cold-border bg-accent-cold-glow px-3 py-1 text-xs text-accent-cold-soft">
      {injuries.length} injured · {formatMarketValue(injuryValue)} sidelined
    </Badge>
  );
}

export function InjuriesTabClient({ clubId }: { clubId: string }) {
  const [injuries, setInjuries] = useState<InjuredPlayer[] | null>(null);

  useEffect(() => {
    fetch("/api/injured")
      .then((r) => r.json())
      .then((d) => {
        const clubInjuries = (d.players ?? []).filter(
          (p: InjuredPlayer) => {
            const id = p.clubLogoUrl?.match(/\/(\d+)\.png/)?.[1];
            return id === clubId;
          },
        );
        setInjuries(clubInjuries);
      })
      .catch(() => setInjuries([]));
  }, [clubId]);

  if (injuries === null) return <div className="h-24 animate-pulse rounded-xl bg-border-subtle/30" />;
  if (injuries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-subtle bg-elevated px-4 py-6 text-sm text-text-secondary">
        No injured players currently tracked for this team.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {injuries.map((player) => {
        const returnInfo = formatReturnInfo(player.returnDate);
        const duration = formatInjuryDuration(player.injurySince);
        const playerId = getPlayerIdFromProfileUrl(player.profileUrl);
        const href = playerId ? getPlayerDetailHref(playerId) : `https://www.transfermarkt.com${player.profileUrl}`;
        return (
          <Link
            key={player.profileUrl || player.name}
            href={href}
            className="hover-lift flex items-center gap-3 rounded-2xl border border-border-subtle bg-[linear-gradient(180deg,rgba(22,27,34,0.92),rgba(13,17,23,0.95))] p-3 transition-colors hover:border-border-medium hover:bg-card-hover sm:gap-4 sm:p-4"
          >
            <PlayerAvatar name={player.name} imageUrl={player.imageUrl} className="h-10 w-10 rounded-lg border border-border-subtle sm:h-12 sm:w-12" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-text-primary">{player.name}</p>
              <p className="mt-0.5 text-xs text-text-muted">{player.position} · {player.age ? `${player.age}y` : ""}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-400">{player.injury}</p>
              <p className="mt-0.5 text-xs text-text-muted">
                {returnInfo ? returnInfo.label : ""}
                {duration && ` · ${duration}`}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
