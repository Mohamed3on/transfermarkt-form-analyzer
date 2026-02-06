import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { fetchMinutesValueRaw } from "@/lib/fetch-minutes-value";
import { fetchPlayerMinutesRaw } from "@/lib/fetch-player-minutes";

const CONCURRENCY = 25;

async function main() {
  console.log("[refresh] Fetching minutes-value data...");
  const players = await fetchMinutesValueRaw();
  console.log(`[refresh] Got ${players.length} players, enriching zero-minute entries...`);

  const zeroMinute = players.filter((p) => p.minutes === 0);
  console.log(`[refresh] ${zeroMinute.length} players with 0 minutes to enrich`);

  for (let i = 0; i < zeroMinute.length; i += CONCURRENCY) {
    const batch = zeroMinute.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((p) => fetchPlayerMinutesRaw(p.playerId))
    );
    batch.forEach((p, j) => {
      if (results[j].status === "fulfilled" && results[j].value.minutes > 0) {
        const s = results[j].value;
        p.minutes = s.minutes;
        p.totalMatches = s.appearances || p.totalMatches;
        p.goals = s.goals;
        p.assists = s.assists;
      }
    });
    console.log(`[refresh] Enriched batch ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(zeroMinute.length / CONCURRENCY)}`);
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
