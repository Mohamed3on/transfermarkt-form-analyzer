import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";
import type { RecentGameStats } from "@/app/types";
import { BASE_URL } from "./constants";
import { fetchPage } from "./fetch";
import { fetchPlayerMinutesRaw, LEAGUE_NAMES } from "./fetch-player-minutes";

interface MatchReportContext {
  awayLogoUrl?: string;
  awayName?: string;
  competitionName?: string;
  homeLogoUrl?: string;
  homeName?: string;
}

function parseCompetitionName(title: string): string | undefined {
  const match = title.match(/,\s+\d{2}\/\d{2}\/\d{4}\s+-\s+(.+?)\s+-\s+Match sheet/i);
  return match?.[1]?.trim() || undefined;
}

function parseMatchReportContext(html: string): MatchReportContext {
  const $ = cheerio.load(html);
  const homeTeam = $(".sb-team.sb-heim").first();
  const awayTeam = $(".sb-team.sb-gast").first();
  const title = $('meta[property="og:title"]').attr("content") || $("title").text().trim();

  const homeName =
    homeTeam.find("a.sb-vereinslink").first().text().trim() ||
    homeTeam.find("img").first().attr("alt") ||
    undefined;
  const awayName =
    awayTeam.find("a.sb-vereinslink").first().text().trim() ||
    awayTeam.find("img").first().attr("alt") ||
    undefined;

  return {
    competitionName: parseCompetitionName(title),
    homeName,
    awayName,
    homeLogoUrl: homeTeam.find("img").first().attr("src") || undefined,
    awayLogoUrl: awayTeam.find("img").first().attr("src") || undefined,
  };
}

function getMatchReportContext(gameId: string): Promise<MatchReportContext> {
  return unstable_cache(
    async () => {
      const html = await fetchPage(`${BASE_URL}/spielbericht/index/spielbericht/${gameId}`);
      return parseMatchReportContext(html);
    },
    [`match-report-${gameId}`],
    { revalidate: 86400, tags: ["player-recent-matches"] },
  )();
}

function enrichMatchWithContext(match: RecentGameStats, context?: MatchReportContext): RecentGameStats {
  const isAway = match.venue === "away";
  return {
    ...match,
    competitionName:
      match.competitionName ||
      context?.competitionName ||
      (match.competitionId ? LEAGUE_NAMES[match.competitionId] : undefined),
    opponentName: match.opponentName || (isAway ? context?.homeName : context?.awayName),
    opponentLogoUrl: match.opponentLogoUrl || (isAway ? context?.homeLogoUrl : context?.awayLogoUrl),
    matchReportUrl:
      match.matchReportUrl || (match.gameId ? `${BASE_URL}/spielbericht/index/spielbericht/${match.gameId}` : undefined),
  };
}

function getPlayerRecentMatchesCached(playerId: string, fallbackMatches: RecentGameStats[]): Promise<RecentGameStats[]> {
  return unstable_cache(
    async () => {
      const liveStats = await fetchPlayerMinutesRaw(playerId);
      const recentMatches = (liveStats.recentForm?.length ? liveStats.recentForm : fallbackMatches).slice(0, 10);

      return Promise.all(
        recentMatches.map(async (match) => {
          if (!match.gameId) {
            return enrichMatchWithContext(match);
          }

          try {
            const context = await getMatchReportContext(match.gameId);
            return enrichMatchWithContext(match, context);
          } catch (error) {
            console.error(`[Player recent matches] Failed to enrich match ${match.gameId}:`, error);
            return enrichMatchWithContext(match);
          }
        }),
      );
    },
    [`player-recent-matches-${playerId}`],
    { revalidate: 86400, tags: ["player-recent-matches"] },
  )();
}

export async function getPlayerRecentMatches(
  playerId: string,
  fallbackMatches: RecentGameStats[] = [],
): Promise<RecentGameStats[]> {
  try {
    return await getPlayerRecentMatchesCached(playerId, fallbackMatches);
  } catch (error) {
    console.error(`[Player recent matches] Failed for player ${playerId}:`, error);
    return fallbackMatches.map((match) => enrichMatchWithContext(match));
  }
}
