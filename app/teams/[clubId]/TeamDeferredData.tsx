"use client";

import { useManagerQuery } from "@/lib/hooks/use-manager-query";
import { ManagerSkeleton } from "@/app/components/ManagerPPGBadge";

export function ManagerClient({ clubId }: { clubId: string }) {
  const { data: manager, isLoading } = useManagerQuery(clubId);

  if (isLoading) return (
    <div className="mt-3">
      <ManagerSkeleton />
    </div>
  );
  if (!manager) return null;

  const hasRanking = manager.ppg !== null && manager.ppgRank !== undefined && manager.totalComparableManagers !== undefined;
  const isOnly = hasRanking && manager.totalComparableManagers === 1;
  const isBest = hasRanking && manager.ppgRank === 1 && !isOnly;
  const isWorst = hasRanking && manager.ppgRank === manager.totalComparableManagers && !isBest && !isOnly;
  const ppgColor = isBest ? "text-emerald-400" : isWorst ? "text-red-400" : "text-text-secondary";

  return (
    <div className="mt-3 space-y-1.5 text-sm text-text-secondary animate-fade-in">
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
