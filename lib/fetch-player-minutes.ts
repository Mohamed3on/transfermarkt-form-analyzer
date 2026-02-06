import { unstable_cache } from "next/cache";
import * as cheerio from "cheerio";
import type { PlayerStatsResult } from "@/app/types";
import { BASE_URL } from "./constants";
import { fetchPage } from "./fetch";

const ZERO_STATS: PlayerStatsResult = { minutes: 0, appearances: 0, goals: 0, assists: 0 };

/** Raw fetch — no caching. Used by the offline refresh script. */
export async function fetchPlayerMinutesRaw(playerId: string): Promise<PlayerStatsResult> {
  if (!playerId) return ZERO_STATS;
  const url = `${BASE_URL}/x/leistungsdaten/spieler/${playerId}`;
  const htmlContent = await fetchPage(url);
  const $ = cheerio.load(htmlContent);

  const headlines = $("h2.content-box-headline")
    .map((_, el) => $(el).text().trim().toLowerCase())
    .get();
  if (headlines.some((h) => h.includes("career stats"))) return ZERO_STATS;

  const footer = $("table.items tfoot tr").last();
  const parse = (s: string) => parseInt(s.trim().replace(/[.']/g, "").replace(/,/g, "")) || 0;

  const zentriert = footer.find("td.zentriert");
  const rechts = footer.find("td.rechts");

  const appearances = parse(zentriert.eq(0).text());
  const goals = parse(zentriert.eq(1).text());
  const assists = parse(zentriert.eq(2).text());
  const minutes = parse(rechts.last().text());

  return { minutes, appearances, goals, assists };
}

export async function fetchPlayerMinutes(playerId: string): Promise<PlayerStatsResult> {
  if (!playerId) return ZERO_STATS;
  try {
    return await unstable_cache(
      () => fetchPlayerMinutesRaw(playerId),
      [`player-minutes-${playerId}`],
      { revalidate: 86400, tags: ["player-minutes"] }
    )();
  } catch (err) {
    console.error(`[player-minutes] ${playerId}: ERROR`, err);
    return ZERO_STATS;
  }
}
