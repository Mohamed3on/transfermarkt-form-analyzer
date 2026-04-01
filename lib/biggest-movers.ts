import { readFile } from "fs/promises";
import { join } from "path";
import { unstable_cache } from "next/cache";
import type { MarketValueMoversResult } from "@/app/types";

async function readMovers(file: string): Promise<MarketValueMoversResult> {
  const raw = await readFile(join(process.cwd(), "data", file), "utf-8");
  const data = JSON.parse(raw) as MarketValueMoversResult;
  data.repeatMovers.sort(
    (a, b) =>
      b.reduce((s, m) => s + m.absoluteChange, 0) - a.reduce((s, m) => s + m.absoluteChange, 0),
  );
  return data;
}

export const findRepeatLosers = unstable_cache(
  () => readMovers("biggest-losers.json"),
  ["biggest-losers"],
  { revalidate: 7200, tags: ["biggest-movers"] },
);
export const findRepeatWinners = unstable_cache(
  () => readMovers("biggest-winners.json"),
  ["biggest-winners"],
  { revalidate: 7200, tags: ["biggest-movers"] },
);
