import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { fetchMinutesValueRaw } from "@/lib/fetch-minutes-value";
import { fetchTopScorersRaw } from "@/lib/fetch-top-scorers";
import { fetchPlayerMinutesRaw } from "@/lib/fetch-player-minutes";
import type { PlayerStatsResult } from "@/app/types";

const INITIAL_CONCURRENCY = 30;
const MIN_CONCURRENCY = 5;
const INITIAL_DELAY_MS = 500;
const BACKOFF_MULTIPLIER = 2;
const FAILURE_THRESHOLD = 0.3; // back off if >30% of batch fails

type PlayerCache = Record<string, PlayerStatsResult>;

const CACHE_PATH = join(process.cwd(), "data", "player-cache.json");

async function saveCache(cache: PlayerCache): Promise<void> {
  await writeFile(CACHE_PATH, JSON.stringify(cache));
}

async function main() {
  console.log("[refresh] Fetching MV pages...");
  const players = await fetchMinutesValueRaw();
  console.log(`[refresh] Got ${players.length} players from MV pages`);

  // Merge top scorers not already in MV set
  console.log("[refresh] Fetching top scorers...");
  const scorers = await fetchTopScorersRaw();
  const mvIds = new Set(players.map((p) => p.playerId));
  let added = 0;
  for (const scorer of scorers) {
    if (!mvIds.has(scorer.playerId)) {
      players.push(scorer);
      mvIds.add(scorer.playerId);
      added++;
    }
  }
  console.log(`[refresh] Added ${added} new players from top scorers (${scorers.length} total, ${scorers.length - added} already in MV)`);

  const cache: PlayerCache = {};

  let concurrency = INITIAL_CONCURRENCY;
  let delayMs = INITIAL_DELAY_MS;
  console.log(`[refresh] Fetching stats for ${players.length} players (concurrency: ${concurrency})...`);

  for (let i = 0; i < players.length; i += concurrency) {
    const batch = players.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map((p) => fetchPlayerMinutesRaw(p.playerId))
    );
    const failures = results.filter((r) => r.status === "rejected").length;
    batch.forEach((p, j) => {
      if (results[j].status === "fulfilled") {
        cache[p.playerId] = results[j].value;
      }
    });

    const batchNum = Math.floor(i / concurrency) + 1;
    if (failures / batch.length > FAILURE_THRESHOLD && concurrency > MIN_CONCURRENCY) {
      concurrency = Math.max(MIN_CONCURRENCY, Math.floor(concurrency / 2));
      delayMs *= BACKOFF_MULTIPLIER;
      console.log(`[refresh] Batch ${batchNum}: ${failures}/${batch.length} failed, backing off → concurrency=${concurrency}, delay=${delayMs}ms`);
    } else {
      console.log(`[refresh] Batch ${batchNum}: ${batch.length - failures}/${batch.length} ok`);
    }

    await saveCache(cache);
    if (i + concurrency < players.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  // Merge cached stats into players
  for (const p of players) {
    const entry = cache[p.playerId];
    if (entry) {
      p.minutes = entry.minutes;
      p.totalMatches = entry.appearances || p.totalMatches;
      p.goals = entry.goals;
      p.assists = entry.assists;
      if (entry.club) p.club = entry.club;
      if (entry.league) p.league = entry.league;
      if (entry.isNewSigning) {
        p.isNewSigning = true;
      } else {
        delete p.isNewSigning;
      }
    }
  }

  const outDir = join(process.cwd(), "data");
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, "minutes-value.json");
  await writeFile(outPath, JSON.stringify(players));
  console.log(`[refresh] Wrote ${players.length} players to ${outPath}`);
}

main().catch((err) => {
  console.error("[refresh] Fatal error:", err);
  process.exit(1);
});
