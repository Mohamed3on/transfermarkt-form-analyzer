import { readFile } from "fs/promises";
import { join } from "path";
import type { MarketValueMoversResult } from "@/app/types";

async function readMovers(file: string): Promise<MarketValueMoversResult> {
  const raw = await readFile(join(process.cwd(), "data", file), "utf-8");
  const data = JSON.parse(raw) as MarketValueMoversResult;
  data.repeatMovers.sort((a, b) =>
    b.reduce((s, m) => s + m.absoluteChange, 0) - a.reduce((s, m) => s + m.absoluteChange, 0)
  );
  return data;
}

export const findRepeatLosers = () => readMovers("biggest-losers.json");
export const findRepeatWinners = () => readMovers("biggest-winners.json");
