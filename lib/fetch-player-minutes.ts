import * as cheerio from "cheerio";
import type { CeapiGame, PlayerStatsResult, RecentGameStats } from "@/app/types";
import { BASE_URL } from "./constants";
import { fetchPage } from "./fetch";
import { parseMarketValue } from "./parse-market-value";

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
  positionStats: [],
  marketValue: 0,
  marketValueDisplay: "-",
  age: 0,
};

const CEAPI_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Accept: "application/json",
};

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
  goals: number; assists: number; minutes: number; appearances: number; penaltyGoals: number; penaltyMisses: number;
  intlGoals: number; intlAssists: number; intlMinutes: number; intlAppearances: number; intlPenaltyGoals: number;
  league: string;
  recentForm: RecentGameStats[];
  playedPosition: string;
  gamesMissed: number;
  positionStats: { positionId: number; position: string; minutes: number; goals: number; assists: number; appearances: number }[];
}

/** States that count as "missed" (injury, suspension, absence — but not "not in squad") */
const MISSED_STATES = new Set(["injured", "absent", "suspended"]);

function aggregateSeasonStats(games: CeapiGame[]): AggregatedStats {
  const seasonId = currentSeasonId();
  let goals = 0, assists = 0, minutes = 0, appearances = 0, penaltyGoals = 0, penaltyMisses = 0;
  let intlGoals = 0, intlAssists = 0, intlMinutes = 0, intlAppearances = 0, intlPenaltyGoals = 0;
  let gamesMissed = 0;
  let league = "";
  const recentDomestic: RecentGameStats[] = [];
  for (const g of games) {
    if (g.gameInformation.seasonId !== seasonId) continue;
    const gs = g.statistics.goalStatistics;
    const pts = g.statistics.playingTimeStatistics;
    const mins = pts.playedMinutes ?? 0;
    const state = g.statistics.generalStatistics.participationState ?? "";
    if (MISSED_STATES.has(state)) gamesMissed++;
    const posId = g.statistics.generalStatistics.positionId;
    const isIntl = g.gameInformation.competitionTypeId === 11;
    if (isIntl) {
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
      if (!league && g.gameInformation.competitionTypeId === 1) {
        league = LEAGUE_NAMES[g.gameInformation.competitionId] ?? "";
      }
    }
  }
  // ceapi returns games newest-first; sort to ensure that, then keep last 10
  recentDomestic.sort((a, b) => b.date.localeCompare(a.date));
  const recentForm = recentDomestic.slice(0, 10);
  const positionStats = derivePositionStats(games);
  const playedPosition = positionStats[0]?.position ?? "";
  return { goals, assists, minutes, appearances, penaltyGoals, penaltyMisses, intlGoals, intlAssists, intlMinutes, intlAppearances, intlPenaltyGoals, league, recentForm, playedPosition, gamesMissed, positionStats };
}

/** Derive per-position stats from raw CEAPI games (server-only). */
export function derivePositionStats(rawGames: CeapiGame[]): NonNullable<PlayerStatsResult["positionStats"]> {
  const season = currentSeasonId();
  const byPos: Record<number, { minutes: number; goals: number; assists: number; appearances: number }> = {};
  for (const g of rawGames) {
    if (g.gameInformation.seasonId !== season) continue;
    const mins = g.statistics.playingTimeStatistics.playedMinutes ?? 0;
    const posId = g.statistics.generalStatistics.positionId;
    if (mins > 0 && posId) {
      const ps = byPos[posId] ??= { minutes: 0, goals: 0, assists: 0, appearances: 0 };
      ps.minutes += mins;
      ps.goals += g.statistics.goalStatistics.goalsScoredTotal ?? 0;
      ps.assists += g.statistics.goalStatistics.assists ?? 0;
      ps.appearances++;
    }
  }
  return Object.entries(byPos)
    .map(([id, ps]) => ({ positionId: Number(id), position: POSITION_NAMES[Number(id)] ?? `Position ${id}`, ...ps }))
    .sort((a, b) => b.minutes - a.minutes);
}

/** Raw fetch — no caching. Used by the offline refresh script. */
export async function fetchPlayerMinutesRaw(playerId: string): Promise<PlayerStatsResult> {
  if (!playerId) return ZERO_STATS;

  // Fetch HTML (for club/ribbon) and ceapi (for stats) in parallel
  const [htmlContent, ceapiRes] = await Promise.all([
    fetchPage(`${BASE_URL}/x/leistungsdaten/spieler/${playerId}`),
    fetch(`${BASE_URL}/ceapi/performance-game/${playerId}`, {
      headers: CEAPI_HEADERS,
      cache: "no-store",
    }),
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

  // Nationality flag URL from profile header
  const natFlagImg = $("span[itemprop='nationality'] img.flaggenrahmen").first();
  const nationalityFlagUrl = (natFlagImg.attr("src") || "").replace(/\/(tiny|verysmall)\//, "/medium/") || "";

  // League logo URL from profile header
  const leagueLinkImg = $(".data-header__league-link img").first();
  const leagueLogoUrl = (leagueLinkImg.attr("src") || "").replace(/\/(verytiny|tiny)\//, "/header/") || "";

  // Parse senior international caps from profile header (Caps/Goals: N)
  // The team label varies: "Current international", "Former International", "National player"
  // Find the <ul> containing Caps/Goals, then check the team name in the sibling <li>
  const capsLi = $("li:contains('Caps/Goals')").first();
  const capsUl = capsLi.closest("ul");
  const natTeamName = capsUl.find("a[href*='/startseite/verein/']").first().attr("title") || "";
  const isSeniorTeam = !!natTeamName && !/U\d/i.test(natTeamName);
  const intlCareerCaps = isSeniorTeam ? (parseInt(capsLi.find("a").first().text().trim()) || 0) : 0;
  const ntLabel = capsUl.find(".data-header__label").first().text().trim().toLowerCase();
  const isCurrentIntl = isSeniorTeam && ntLabel.includes("current international");

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

  // Parse stats + league from ceapi
  const shared = { club, clubLogoUrl, intlCareerCaps, isCurrentIntl, isNewSigning, isOnLoan, contractExpiry, nationalityFlagUrl, leagueLogoUrl, marketValue, marketValueDisplay, age };

  if (!ceapiRes.ok) {
    return { ...ZERO_STATS, ...shared };
  }
  const ceapi = await ceapiRes.json();
  const games: CeapiGame[] = ceapi?.data?.performance ?? [];
  const stats = aggregateSeasonStats(games);

  return { ...stats, ...shared, rawGames: games };
}
