"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import {
  extractClubIdFromLogoUrl,
  formatReturnInfo,
  formatInjuryDuration,
  getPlayerDetailHref,
  getPlayerIdFromProfileUrl,
} from "@/lib/format";
import type { InjuredPlayer, ManagerInfo } from "@/app/types";

// --- Shared injuries context (fetch once, use in badge + tab) ---

const InjuriesContext = createContext<InjuredPlayer[] | null>(null);

export function InjuriesProvider({ clubId, children }: { clubId: string; children: ReactNode }) {
  const [injuries, setInjuries] = useState<InjuredPlayer[] | null>(null);

  useEffect(() => {
    fetch("/api/injured")
      .then((r) => r.json())
      .then((d) => {
        const allPlayers: InjuredPlayer[] = d.players ?? [];
        setInjuries(allPlayers.filter((p) => extractClubIdFromLogoUrl(p.clubLogoUrl) === clubId));
      })
      .catch(() => setInjuries([]));
  }, [clubId]);

  return <InjuriesContext.Provider value={injuries}>{children}</InjuriesContext.Provider>;
}

// --- Manager ---

export function ManagerClient({ clubId }: { clubId: string }) {
  const [manager, setManager] = useState<ManagerInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/manager/${clubId}`)
      .then((r) => r.json())
      .then((d) => { setManager(d.manager); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [clubId]);

  if (!loaded) return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-16 animate-pulse rounded bg-border-subtle/50" />
        <div className="h-3.5 w-32 animate-pulse rounded bg-border-subtle/40" />
      </div>
      <div className="h-3 w-48 animate-pulse rounded bg-border-subtle/30" />
    </div>
  );
  if (!manager) return null;

  const hasRanking = manager.ppg !== null && manager.ppgRank !== undefined && manager.totalComparableManagers !== undefined;
  const isOnly = hasRanking && manager.totalComparableManagers === 1;
  const isBest = hasRanking && manager.ppgRank === 1 && !isOnly;
  const isWorst = hasRanking && manager.ppgRank === manager.totalComparableManagers && !isBest && !isOnly;
  const ppgColor = isBest ? "text-emerald-400" : isWorst ? "text-red-400" : "text-text-secondary";

  return (
    <div className="mt-3 space-y-1.5 text-sm text-text-secondary animate-in fade-in duration-300">
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

// --- Injuries badge ---

// --- Injuries tab ---

export function InjuriesTabClient() {
  const injuries = useContext(InjuriesContext);

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
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
                <span>{player.position}</span>
                <span className="opacity-40">·</span>
                <span className="text-red-400">{player.injury}</span>
                {duration && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>out {duration}</span>
                  </>
                )}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-value text-accent-hot">{player.marketValue}</p>
              {returnInfo && (
                <p className={`text-[11px] ${returnInfo.imminent ? "text-emerald-400 font-medium" : "text-text-muted"}`}>
                  {returnInfo.label}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
