"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import type { TeamFormEntry, ManagerInfo } from "@/app/types";

export interface TeamFormResponse {
  success: boolean;
  overperformers: TeamFormEntry[];
  underperformers: TeamFormEntry[];
  totalTeams: number;
  leagues: string[];
}

interface TeamFormUIProps {
  initialData: TeamFormResponse;
}

async function fetchManager(clubId: string): Promise<{ clubId: string; manager: ManagerInfo | null }> {
  const res = await fetch(`/api/manager/${clubId}`);
  return res.json();
}

function getLeagueColor(league: string): string {
  const colors: Record<string, string> = {
    Bundesliga: "#d20515",
    "Premier League": "#38003c",
    "La Liga": "#ff4b44",
    "Serie A": "#024494",
    "Ligue 1": "#dae025",
  };
  return colors[league] || "#666";
}

function formatValue(value: string): string {
  return value || "-";
}

interface TeamCardProps {
  team: TeamFormEntry;
  rank: number;
  type: "over" | "under";
  manager?: ManagerInfo | null;
  managerLoading?: boolean;
  index?: number;
}

function TeamCard({ team, rank, type, manager, managerLoading, index = 0 }: TeamCardProps) {
  const isOver = type === "over";
  const showManager = manager !== undefined;

  return (
    <div
      className="rounded-xl p-3 sm:p-4 transition-[transform,box-shadow] hover:scale-[1.01] hover-lift animate-slide-up opacity-0"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        animationDelay: `${index * 0.05}s`,
        animationFillMode: "forwards",
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Rank */}
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0"
          style={{
            background: rank <= 3 ? (isOver ? "#16a34a" : "#dc2626") : "var(--bg-elevated)",
            color: rank <= 3 ? "#fff" : "var(--text-muted)",
          }}
        >
          {rank}
        </div>

        {/* Club Logo */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1.5" style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          {team.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
          ) : (
            <div className="text-xl" style={{ color: "var(--text-muted)" }}>?</div>
          )}
        </div>

        {/* Team Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <a
                href={team.clubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sm sm:text-base hover:underline block truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {team.name}
              </a>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold shrink-0"
                  style={{
                    background: getLeagueColor(team.league),
                    color: team.league === "Ligue 1" ? "#000" : "#fff",
                  }}
                >
                  {team.league}
                </span>
              </div>
            </div>
            {/* Delta */}
            <div
              className="text-lg sm:text-xl font-black shrink-0"
              style={{ color: isOver ? "#16a34a" : "#dc2626" }}
            >
              {team.deltaPts > 0 ? `+${team.deltaPts}` : team.deltaPts}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            <span>
              <span style={{ color: "var(--text-secondary)" }}>Pos:</span> {team.leaguePosition}
            </span>
            <span>
              <span style={{ color: "var(--text-secondary)" }}>Pts:</span> {team.points}
            </span>
            <span>
              <span style={{ color: "var(--text-secondary)" }}>Expected:</span> {team.marketValueRank}th → {team.expectedPoints}pts
            </span>
            <span>
              <span style={{ color: "var(--text-secondary)" }}>Value:</span> {formatValue(team.marketValue)}
            </span>
          </div>

          {/* Manager info */}
          {showManager && team.clubId && (
            <div className="mt-2 text-[11px] sm:text-sm" style={{ color: "var(--text-muted)" }}>
              {managerLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border animate-spin inline-block"
                    style={{
                      borderColor: "var(--border-subtle)",
                      borderTopColor: "var(--accent-blue)",
                    }}
                  />
                  <span>Manager...</span>
                </span>
              ) : manager ? (
                <span>
                  Manager:{" "}
                  <a
                    href={manager.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                    style={{ color: "var(--accent-blue)" }}
                  >
                    {manager.name}
                  </a>
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component that handles parallel manager fetching for a list of teams
function TeamListSection({
  teams,
  type,
  title,
  icon,
}: {
  teams: TeamFormEntry[];
  type: "over" | "under";
  title: string;
  icon: React.ReactNode;
}) {
  const clubIds = useMemo(() => teams.map((t) => t.clubId).filter(Boolean), [teams]);

  const managerQueries = useQueries({
    queries: clubIds.map((clubId) => ({
      queryKey: ["manager", clubId],
      queryFn: () => fetchManager(clubId),
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
      gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in cache for 7 days
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    })),
  });

  const managersMap = useMemo(() => {
    const map: Record<string, ManagerInfo | null> = {};
    managerQueries.forEach((q, i) => {
      if (q.data) {
        map[clubIds[i]] = q.data.manager;
      }
    });
    return map;
  }, [managerQueries, clubIds]);

  const isOver = type === "over";

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2" style={{ color: isOver ? "#16a34a" : "#dc2626" }}>
        {icon}
        {title}
      </h2>
      <div className="space-y-3">
        {teams.map((team, idx) => {
          const clubIdIndex = clubIds.indexOf(team.clubId);
          const managerQuery = clubIdIndex >= 0 ? managerQueries[clubIdIndex] : null;
          return (
            <TeamCard
              key={`${team.name}-${team.league}`}
              team={team}
              rank={idx + 1}
              type={type}
              manager={managersMap[team.clubId]}
              managerLoading={managerQuery?.isLoading}
              index={idx}
            />
          );
        })}
      </div>
    </div>
  );
}

export function TeamFormUI({ initialData }: TeamFormUIProps) {
  const data = initialData;

  return (
    <>
      {/* Stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-8 p-3 sm:p-4 rounded-xl animate-scale-in"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-black" style={{ color: "var(--accent-hot)" }}>
            {data.totalTeams}
          </div>
          <div className="text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Teams
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-black" style={{ color: "var(--accent-hot)" }}>
            {data.leagues.length}
          </div>
          <div className="text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Leagues
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-black" style={{ color: "#16a34a" }}>
            +{data.overperformers[0]?.deltaPts || 0}
          </div>
          <div className="text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Top Δ
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-black" style={{ color: "#dc2626" }}>
            {data.underperformers[0]?.deltaPts || 0}
          </div>
          <div className="text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Bottom Δ
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Overperformers */}
        <TeamListSection
          teams={data.overperformers}
          type="over"
          title="Overperformers"
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          }
        />

        {/* Underperformers */}
        <TeamListSection
          teams={data.underperformers}
          type="under"
          title="Underperformers"
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>
    </>
  );
}
