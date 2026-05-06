import * as cheerio from "cheerio";
import type { CeapiGame, PlayerStatsResult, RecentGameStats } from "@/app/types";
import { BASE_URL } from "./constants";
import { fetchPage, withSlot } from "./fetch";
import { parseMarketValue } from "./parse-market-value";
import nationalTeamTypes from "@/data/national-teams.json";

const NATIONAL_TEAM_TYPES = nationalTeamTypes as Record<string, number>;
const SENIOR_NT_TYPE_ID = 1;
const TM_API_BASE = "https://tmapi-alpha.transfermarkt.technology";

function isSeniorNationalTeam(clubId: string | undefined): boolean {
  return !!clubId && NATIONAL_TEAM_TYPES[clubId] === SENIOR_NT_TYPE_ID;
}

interface NationalCareerEntry {
  clubId: string;
  gamesPlayed: number;
  careerState: string;
}

/**
 * Fetches the canonical senior NT line from the same API that powers
 * Transfermarkt's player widget. Returns null on any network/parse error so
 * callers can fall back to header / ceapi-derived values.
 */
async function fetchSeniorCareer(
  playerId: string,
): Promise<{ caps: number; isCurrent: boolean } | null> {
  try {
    const r = await fetch(`${TM_API_BASE}/player/${playerId}/national-career-history`, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { data?: { history?: NationalCareerEntry[] } };
    const senior = j?.data?.history?.find((h) => isSeniorNationalTeam(h.clubId));
    if (!senior) return null;
    return {
      caps: senior.gamesPlayed ?? 0,
      isCurrent: senior.careerState === "CURRENT_NATIONAL_PLAYER",
    };
  } catch {
    return null;
  }
}

/** Fallback when the career-history API is unreachable: walk ceapi games and
 *  count senior caps via the static NT-type map. ceapi returns games
 *  newest-first, so the first senior NT clubId we hit resolves dual-nationals
 *  (e.g. switched from Spain to Morocco) to their current team. */
function deriveSeniorCapsFromGames(games: CeapiGame[]): number {
  let seniorClubId: string | undefined;
  let caps = 0;
  for (const g of games) {
    if (!g.gameInformation.isNationalGame) continue;
    const cid = g.clubsInformation?.club?.clubId;
    if (!cid) continue;
    if (!seniorClubId) {
      if (!isSeniorNationalTeam(cid)) continue;
      seniorClubId = cid;
    } else if (cid !== seniorClubId) {
      continue;
    }
    if ((g.statistics.playingTimeStatistics?.playedMinutes ?? 0) > 0) caps++;
  }
  return caps;
}

const ZERO_STATS: PlayerStatsResult = {
  minutes: 0,
  appearances: 0,
  goals: 0,
  assists: 0,
  penaltyGoals: 0,
  penaltyMisses: 0,
  intlGoals: 0,
  intlAssists: 0,
  intlMinutes: 0,
  intlAppearances: 0,
  intlPenaltyGoals: 0,
  intlCareerCaps: 0,
  isCurrentIntl: false,
  club: "",
  clubLogoUrl: "",
  league: "",
  isNewSigning: false,
  isOnLoan: false,
  playedPosition: "",
  contractExpiry: undefined,
  gamesMissed: 0,
  totalGames: 0,
  positionStats: [],
  marketValue: 0,
  marketValueDisplay: "-",
  age: 0,
};

const CEAPI_BASE_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Accept: "application/json",
};

function getCeapiHeaders(): Record<string, string> {
  return process.env.TM_COOKIE
    ? { ...CEAPI_BASE_HEADERS, Cookie: process.env.TM_COOKIE }
    : CEAPI_BASE_HEADERS;
}

/** Domestic league competition ID → display name */
export const LEAGUE_NAMES: Record<string, string> = {
  GB1: "Premier League",
  ES1: "LaLiga",
  L1: "Bundesliga",
  IT1: "Serie A",
  FR1: "Ligue 1",
  PO1: "Liga Portugal",
  NL1: "Eredivisie",
  BE1: "Jupiler Pro League",
  TR1: "Süper Lig",
  SA1: "Saudi Pro League",
  BRA1: "Série A",
  RU1: "Premier Liga",
  GR1: "Super League 1",
  DK1: "Superliga",
  GB2: "Championship",
  ES2: "LaLiga2",
};

/** Current Transfermarkt season ID (e.g. 2025 = the 25/26 season). */
function currentSeasonId(): number {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 7 ? year : year - 1;
}

/** Transfermarkt CEAPI positionId → display name */
export const POSITION_NAMES: Record<number, string> = {
  1: "Goalkeeper",
  3: "Centre-Back",
  4: "Left-Back",
  5: "Right-Back",
  6: "Defensive Midfield",
  7: "Central Midfield",
  8: "Right Midfield",
  9: "Left Midfield",
  10: "Attacking Midfield",
  11: "Left Winger",
  12: "Right Winger",
  13: "Second Striker",
  14: "Centre-Forward",
};

interface AggregatedStats {
  goals: number;
  assists: number;
  minutes: number;
  appearances: number;
  penaltyGoals: number;
  penaltyMisses: number;
  intlGoals: number;
  intlAssists: number;
  intlMinutes: number;
  intlAppearances: number;
  intlPenaltyGoals: number;
  league: string;
  recentForm: RecentGameStats[];
  playedPosition: string;
  gamesMissed: number;
  totalGames: number;
  positionStats: {
    positionId: number;
    position: string;
    minutes: number;
    goals: number;
    assists: number;
    appearances: number;
  }[];
}

/** CEAPI competition type IDs */
const COMP_TYPE_INTERNATIONAL = 11;
const COMP_TYPE_DOMESTIC_LEAGUE = 1;

/** States that count as "missed" (injury, suspension, absence — but not "not in squad") */
const MISSED_STATES = new Set(["injured", "absent", "suspended"]);

function aggregateSeasonStats(games: CeapiGame[]): AggregatedStats {
  const seasonId = currentSeasonId();
  let goals = 0,
    assists = 0,
    minutes = 0,
    appearances = 0,
    penaltyGoals = 0,
    penaltyMisses = 0;
  let intlGoals = 0,
    intlAssists = 0,
    intlMinutes = 0,
    intlAppearances = 0,
    intlPenaltyGoals = 0;
  let gamesMissed = 0;
  let totalGames = 0;
  let league = "";
  const recentDomestic: RecentGameStats[] = [];
  for (const g of games) {
    if (g.gameInformation.seasonId !== seasonId) continue;
    totalGames++;
    const gs = g.statistics.goalStatistics;
    const mins = g.statistics.playingTimeStatistics.playedMinutes ?? 0;
    const state = g.statistics.generalStatistics.participationState ?? "";
    if (MISSED_STATES.has(state)) gamesMissed++;
    const posId = g.statistics.generalStatistics.positionId;
    if (g.gameInformation.competitionTypeId === COMP_TYPE_INTERNATIONAL) {
      intlGoals += gs.goalsScoredTotal ?? 0;
      intlAssists += gs.assists ?? 0;
      intlPenaltyGoals += gs.penaltyShooterGoalsScored ?? 0;
      intlMinutes += mins;
      if (mins > 0) intlAppearances++;
    } else {
      const gls = gs.goalsScoredTotal ?? 0;
      const ast = gs.assists ?? 0;
      const pGoals = gs.penaltyShooterGoalsScored ?? 0;
      goals += gls;
      assists += ast;
      penaltyGoals += pGoals;
      penaltyMisses += gs.penaltyShooterMisses ?? 0;
      minutes += mins;
      if (mins > 0) {
        appearances++;
        recentDomestic.push({
          goals: gls,
          assists: ast,
          penaltyGoals: pGoals,
          minutes: mins,
          date: g.gameInformation.date?.dateTimeUTC?.slice(0, 10) ?? "",
          gameId: g.gameInformation.gameId,
          gameDay: g.gameInformation.gameDay,
          competitionId: g.gameInformation.competitionId,
          positionId: posId ?? undefined,
          competitionName: LEAGUE_NAMES[g.gameInformation.competitionId],
          venue: g.clubsInformation?.club?.venue,
          teamGoals: g.clubsInformation?.club?.goalsTotal ?? undefined,
          opponentGoals: g.clubsInformation?.club?.opponentGoalsTotal ?? undefined,
          opponentClubId: g.clubsInformation?.opponent?.clubId,
          matchReportUrl: g.gameInformation.gameId
            ? `${BASE_URL}/spielbericht/index/spielbericht/${g.gameInformation.gameId}`
            : undefined,
        });
      }
      if (!league && g.gameInformation.competitionTypeId === COMP_TYPE_DOMESTIC_LEAGUE) {
        league = LEAGUE_NAMES[g.gameInformation.competitionId] ?? "";
      }
    }
  }
  // ceapi returns games newest-first; sort to ensure that, then keep last 10
  recentDomestic.sort((a, b) => b.date.localeCompare(a.date));
  const recentForm = recentDomestic.slice(0, 10);
  const positionStats = derivePositionStats(games);
  const playedPosition = positionStats[0]?.position ?? "";
  return {
    goals,
    assists,
    minutes,
    appearances,
    penaltyGoals,
    penaltyMisses,
    intlGoals,
    intlAssists,
    intlMinutes,
    intlAppearances,
    intlPenaltyGoals,
    league,
    recentForm,
    playedPosition,
    gamesMissed,
    totalGames,
    positionStats,
  };
}

/** Derive per-position stats from raw CEAPI games (server-only). */
export function derivePositionStats(
  rawGames: CeapiGame[],
): NonNullable<PlayerStatsResult["positionStats"]> {
  const season = currentSeasonId();
  const byPos: Record<
    number,
    { minutes: number; goals: number; assists: number; appearances: number }
  > = {};
  for (const g of rawGames) {
    if (g.gameInformation.seasonId !== season) continue;
    const mins = g.statistics.playingTimeStatistics.playedMinutes ?? 0;
    const posId = g.statistics.generalStatistics.positionId;
    if (mins > 0 && posId) {
      const ps = (byPos[posId] ??= { minutes: 0, goals: 0, assists: 0, appearances: 0 });
      ps.minutes += mins;
      ps.goals += g.statistics.goalStatistics.goalsScoredTotal ?? 0;
      ps.assists += g.statistics.goalStatistics.assists ?? 0;
      ps.appearances++;
    }
  }
  return Object.entries(byPos)
    .map(([id, ps]) => ({
      positionId: Number(id),
      position: POSITION_NAMES[Number(id)] ?? `Position ${id}`,
      ...ps,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

/** Raw fetch — no caching. Used by the offline refresh script. */
export async function fetchPlayerMinutesRaw(playerId: string): Promise<PlayerStatsResult> {
  if (!playerId) return ZERO_STATS;

  // Fetch HTML (club/ribbon), ceapi (per-game stats), and the alpha-API senior
  // NT row in parallel. HTML + ceapi go through the shared TM concurrency
  // limiter; the alpha API runs on a different host and small payload, so we
  // don't slot it.
  const [htmlContent, ceapiRes, seniorCareer] = await Promise.all([
    fetchPage(`${BASE_URL}/x/leistungsdaten/spieler/${playerId}`),
    withSlot(() =>
      fetch(`${BASE_URL}/ceapi/performance-game/${playerId}`, {
        headers: getCeapiHeaders(),
        cache: "no-store",
      }),
    ),
    fetchSeniorCareer(playerId),
  ]);

  // Parse club/ribbon from HTML
  const $ = cheerio.load(htmlContent);
  const clubInfo = $(".data-header__club-info");
  const club = clubInfo.find(".data-header__club a").text().trim();
  const clubLogoImg = $(".data-header__box__club-link img").first();
  const clubLogoSrcset = (clubLogoImg.attr("srcset") || "").trim();
  const clubLogoUrl = clubLogoSrcset.split(/\s+/)[0] || clubLogoImg.attr("src") || "";
  const ribbonText = $(".data-header__ribbon span").text().trim().toLowerCase();
  const isOnLoan = ribbonText === "on loan";
  const isNewSigning = ribbonText === "new arrival" || ribbonText === "winter signing" || isOnLoan;

  // Nationality from profile header
  const natFlagImg = $("span[itemprop='nationality'] img.flaggenrahmen").first();
  const nationalityFlagUrl =
    (natFlagImg.attr("src") || "").replace(/\/(tiny|verysmall)\//, "/medium/") || "";
  const nationality = natFlagImg.attr("title") || "";

  // League logo URL from profile header
  const leagueLinkImg = $(".data-header__league-link img").first();
  const leagueLogoUrl =
    (leagueLinkImg.attr("src") || "").replace(/\/(verytiny|tiny)\//, "/header/") || "";

  // Parse senior international caps from profile header (Caps/Goals: N).
  // The header only shows the player's *current* national team — for players in a youth
  // squad (e.g. Portugal U21), it omits any senior caps. The senior fallback below patches
  // those cases using ceapi's per-game data.
  const capsLi = $("li:contains('Caps/Goals')").first();
  const capsUl = capsLi.closest("ul");
  const natTeamName = capsUl.find("a[href*='/startseite/verein/']").first().attr("title") || "";
  const headerIsSenior = !!natTeamName && !/U\d/i.test(natTeamName);
  const headerCaps = headerIsSenior ? parseInt(capsLi.find("a").first().text().trim()) || 0 : 0;
  const ntLabel = capsUl.find(".data-header__label").first().text().trim().toLowerCase();
  const headerCurrentIntl = headerIsSenior && ntLabel.includes("current international");

  // Parse contract expiry from club info header
  const contractLabel = clubInfo.find(".data-header__label:contains('Contract expires:')");
  const contractExpiry = contractLabel.find(".data-header__content").text().trim() || undefined;

  // Parse market value from profile header
  const mvEl = $(".data-header__market-value-wrapper");
  const mvText = mvEl.clone().children("p").remove().end().text().trim();
  const marketValue = parseMarketValue(mvText);
  const marketValueDisplay = mvText || "-";

  // Parse age from birth date
  const birthText = $("span[itemprop='birthDate']").text().trim();
  const ageMatch = birthText.match(/\((\d+)\)/);
  const age = ageMatch ? parseInt(ageMatch[1]) : 0;

  if (!ceapiRes.ok) {
    throw new Error(`ceapi ${ceapiRes.status} for ${playerId}`);
  }
  const ceapi = await ceapiRes.json();
  const games: CeapiGame[] | undefined = ceapi?.data?.performance;
  // TM occasionally returns 200 with a nullish `performance` under rate pressure.
  // Treat that as a failure so the retry loop fires instead of silently caching zeros.
  if (!Array.isArray(games)) {
    throw new Error(`ceapi returned no performance array for ${playerId}`);
  }
  const stats = aggregateSeasonStats(games);

  // The alpha API is the canonical source for both the senior cap count and
  // whether the player is in the current squad (the same data drives TM's
  // green/yellow shirt-number badge). Fall back to header for caps when the
  // header is senior, or to ceapi-derived caps when it's a youth squad. The
  // "currently in senior squad" signal can only come from the API — if it's
  // unreachable we leave it at the header's value rather than guess.
  const intlCareerCaps =
    seniorCareer?.caps ?? (headerIsSenior ? headerCaps : deriveSeniorCapsFromGames(games));
  const isCurrentIntl = seniorCareer?.isCurrent ?? headerCurrentIntl;

  const shared = {
    club,
    clubLogoUrl,
    intlCareerCaps,
    isCurrentIntl,
    isNewSigning,
    isOnLoan,
    contractExpiry,
    nationality,
    nationalityFlagUrl,
    leagueLogoUrl,
    marketValue,
    marketValueDisplay,
    age,
  };

  return { ...stats, ...shared, rawGames: games };
}
