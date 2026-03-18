import { unstable_cache } from "next/cache";
import * as cheerio from "cheerio";
import type { InjuredPlayer } from "@/app/types";
import { BASE_URL } from "@/lib/constants";
import { LEAGUES } from "@/lib/leagues";
import { fetchPage } from "@/lib/fetch";
import { parseMarketValue } from "@/lib/parse-market-value";

function parseInjuredPlayers($: cheerio.CheerioAPI, leagueName: string): InjuredPlayer[] {
  const players: InjuredPlayer[] = [];
  $("table.items > tbody > tr").each((_, row) => {
    const cells = $(row).find("> td");
    if (cells.length < 8) return;
    const nameCell = $(cells[0]);
    const inlineTable = nameCell.find(".inline-table");
    const playerLink = inlineTable.find(".hauptlink a").first();
    const name = playerLink.attr("title") || playerLink.text().trim();
    const profileUrl = playerLink.attr("href") || "";
    const position = inlineTable.find("tr:last-child td").text().trim();
    const imageUrl = (
      inlineTable.find("img").attr("data-src") ||
      inlineTable.find("img").attr("src") ||
      ""
    ).replace("/small/", "/header/");
    const clubCell = $(cells[1]);
    const clubLink = clubCell.find("a").first();
    const club = clubLink.attr("title") || "";
    const clubLogoUrl = (clubCell.find("img").attr("src") || "").replace("/tiny/", "/head/");
    const age = parseInt($(cells[2]).text().trim(), 10) || undefined;
    const injury = $(cells[4]).text().trim();
    const injurySince = $(cells[5]).text().trim();
    const returnDate = $(cells[6]).text().trim();
    const marketValue = $(cells[7]).text().trim();
    const marketValueNum = parseMarketValue(marketValue);
    if (name && marketValueNum > 0) {
      players.push({
        name,
        position,
        club,
        clubLogoUrl,
        injury,
        returnDate,
        injurySince,
        age,
        marketValue,
        marketValueNum,
        imageUrl,
        profileUrl: profileUrl ? `${BASE_URL}${profileUrl}` : "",
        league: leagueName,
      });
    }
  });
  return players;
}

export async function fetchInjuredPlayersUncached(): Promise<{
  success: boolean;
  players: InjuredPlayer[];
  totalPlayers: number;
  leagues: string[];
  failedLeagues: string[];
}> {
  const results = await Promise.allSettled(
    LEAGUES.map(async (league) => {
      const url = `${BASE_URL}/${league.slug}/verletztespieler/wettbewerb/${league.code}/plus/1`;
      const html = await fetchPage(url);
      const $ = cheerio.load(html);
      return { players: parseInjuredPlayers($, league.name), league: league.name };
    })
  );

  const allPlayers: InjuredPlayer[] = [];
  const leagueSet = new Set<string>();
  const failedLeagues: string[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      allPlayers.push(...result.value.players);
      leagueSet.add(result.value.league);
    } else {
      failedLeagues.push(String(result.reason));
    }
  });

  allPlayers.sort((a, b) => b.marketValueNum - a.marketValueNum);
  const leagues = [...leagueSet];

  return {
    success: true,
    players: allPlayers,
    totalPlayers: allPlayers.length,
    leagues,
    failedLeagues,
  };
}

export const getInjuredPlayers = unstable_cache(
  fetchInjuredPlayersUncached,
  ["injured-players"],
  { revalidate: 7200, tags: ["injured"] }
);
