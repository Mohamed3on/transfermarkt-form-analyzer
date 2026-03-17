import { readFile } from "fs/promises";
import { join } from "path";
import type { InjuredPlayer } from "@/app/types";

/** Reads pre-built injured player data from the committed JSON file. */
export async function getInjuredPlayers(): Promise<{
  success: boolean;
  players: InjuredPlayer[];
  totalPlayers: number;
  leagues: string[];
  failedLeagues: string[];
}> {
  try {
    const filePath = join(process.cwd(), "data", "injured.json");
    const raw = await readFile(filePath, "utf-8");
    const players = JSON.parse(raw) as InjuredPlayer[];
    const leagues = [...new Set(players.map((p) => p.league))];
    return { success: true, players, totalPlayers: players.length, leagues, failedLeagues: [] };
  } catch {
    return { success: false, players: [], totalPlayers: 0, leagues: [], failedLeagues: [] };
  }
}
