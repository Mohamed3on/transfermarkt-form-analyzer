import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import * as cheerio from "cheerio";
import { fetchPage } from "@/lib/fetch";
import { BASE_URL } from "@/lib/constants";
import { LEAGUES } from "@/lib/leagues";
import { parseMarketValue } from "@/lib/parse-market-value";
import type { InjuredPlayer } from "@/app/types";

const DATA_DIR = join(process.cwd(), "data");
const OUT_PATH = join(DATA_DIR, "injured.json");

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
    const imageUrl = (inlineTable.find("img").attr("data-src") || inlineTable.find("img").attr("src") || "").replace("/small/", "/header/");
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
      players.push({ name, position, club, clubLogoUrl, injury, returnDate, injurySince, age, marketValue, marketValueNum, imageUrl, profileUrl: profileUrl ? `${BASE_URL}${profileUrl}` : "", league: leagueName });
    }
  });
  return players;
}

async function main() {
  console.log("[refresh-injured] Fetching injured players...");
  const results = await Promise.allSettled(
    LEAGUES.map(async (league) => {
      const url = `${BASE_URL}/${league.slug}/verletztespieler/wettbewerb/${league.code}/plus/1`;
      const html = await fetchPage(url);
      const $ = cheerio.load(html);
      return parseInjuredPlayers($, league.name);
    })
  );

  const allPlayers: InjuredPlayer[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      allPlayers.push(...result.value);
      console.log(`[refresh-injured] ${LEAGUES[i].name}: ${result.value.length} players`);
    } else {
      console.warn(`[refresh-injured] ${LEAGUES[i].name} failed: ${result.reason}`);
    }
  });

  allPlayers.sort((a, b) => b.marketValueNum - a.marketValueNum);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(allPlayers));
  console.log(`[refresh-injured] Done: ${allPlayers.length} injured players → ${OUT_PATH}`);
}

main().catch((err) => {
  console.error("[refresh-injured] Fatal:", err);
  process.exit(1);
});
