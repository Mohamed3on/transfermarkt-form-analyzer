import { NextResponse } from "next/server";
import { getPlayerStatsData } from "@/lib/fetch-minutes-value";
import { findValueCandidates } from "@/lib/value-analysis";

const MIN_DISCOVERY_MINUTES = 260;

export async function GET() {
  try {
    const allPlayers = await getPlayerStatsData();
    const underperformers = findValueCandidates(allPlayers, { candidateOutperforms: false, minMinutes: MIN_DISCOVERY_MINUTES, sortAsc: false })
      .map(({ count, ...p }) => ({ ...p, outperformedByCount: count }));
    return NextResponse.json({ underperformers });
  } catch (error) {
    console.error("Error computing underperformers:", error);
    return NextResponse.json({ error: "Failed to compute underperformers" }, { status: 500 });
  }
}
