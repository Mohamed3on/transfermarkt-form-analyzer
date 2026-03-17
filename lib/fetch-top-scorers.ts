import * as cheerio from "cheerio";
import type { MinutesValuePlayer } from "@/app/types";
import { BASE_URL } from "./constants";
import { fetchPage } from "./fetch";
import { EMPTY_PLAYER_STATS } from "./fetch-minutes-value";

function fetchPlayerList(
  urls: string[],
  label: string,
  extraHeaders?: Record<string, string>,
): Promise<MinutesValuePlayer[]> {
  return Promise.allSettled(urls.map((url) => fetchPage(url, undefined, extraHeaders))).then((results) => {
    const players: MinutesValuePlayer[] = [];
    const seen = new Set<string>();

    for (const [index, result] of results.entries()) {
      if (result.status !== "fulfilled") {
        console.error(`[${label}] Failed to fetch ${urls[index]}:`, result.reason);
        continue;
      }
      const $ = cheerio.load(result.value);
      $("table.items > tbody > tr").each((_, row) => {
        const cells = $(row).find("> td");
        if (cells.length < 6) return;

        const inlineTable = $(cells[1]).find(".inline-table");
        const nameLink = inlineTable.find("td.hauptlink a");
        const name = nameLink.attr("title") || nameLink.text().trim();
        const profileUrl = nameLink.attr("href") || "";
        const playerIdMatch = profileUrl.match(/\/spieler\/(\d+)/);
        const playerId = playerIdMatch ? playerIdMatch[1] : "";

        if (!name || !playerId || seen.has(playerId)) return;
        seen.add(playerId);

        const position = inlineTable.find("tr").eq(1).find("td").text().trim();
        const imgEl = inlineTable.find("img").first();
        const imageUrl = (imgEl.attr("data-src") || imgEl.attr("src") || "").replace("/medium/", "/header/");

        players.push({ ...EMPTY_PLAYER_STATS, name, position, imageUrl, profileUrl, playerId });
      });
    }

    return players;
  });
}

function paginateUrls(baseUrl: string, pages: number): string[] {
  return Array.from({ length: pages }, (_, i) => {
    const page = i + 1;
    return page === 1 ? `${baseUrl}?ajax=yw1` : `${baseUrl}/page/${page}?ajax=yw1`;
  });
}

/** Season top scorers (10 pages, ~250 players). */
export function fetchTopScorersRaw(): Promise<MinutesValuePlayer[]> {
  const baseUrl = `${BASE_URL}/scorer/topscorer/statistik/2024/saison_id/2025/selectedOptionKey/6/land_id/0/altersklasse//ausrichtung//spielerposition_id//filter/0/yt0/Show/plus/1/galerie/0`;
  return fetchPlayerList(paginateUrls(baseUrl, 10), "topScorers");
}

/** Yearly top scorers (10 pages, ~250 players). Uses current year. */
export function fetchYearlyScorersRaw(): Promise<MinutesValuePlayer[]> {
  const year = new Date().getFullYear();
  const basePath = `${BASE_URL}/spieler-statistik/jahrestorschuetzen/statistik/stat/ajax/yw1/jahr/${year}/selectedOptionKey/6/monatVon/01/monatBis/12/altersklasse//land_id//ausrichtung/alle/spielerposition_id/alle/art/2/plus/1/galerie/0`;
  const referer = `${BASE_URL}/spieler-statistik/jahrestorschuetzen/statistik/stat/plus/1/galerie/0?jahr=${year}&selectedOptionKey=6&monatVon=01&monatBis=12&altersklasse=&land_id=&ausrichtung=alle&spielerposition_id=alle&art=2`;
  return fetchPlayerList(paginateUrls(basePath, 10), "yearlyScorers", {
    "X-Requested-With": "XMLHttpRequest",
    Referer: referer,
    Accept: "*/*",
  });
}
