import { NextResponse } from "next/server";
import { getPlayerStatsData } from "@/lib/fetch-minutes-value";
import { findValueCandidates } from "@/lib/value-analysis";

export async function GET() {
  try {
    const allPlayers = await getPlayerStatsData();
    const overperformers = findValueCandidates(allPlayers, {
      candidateOutperforms: true,
      sortAsc: true,
    }).map(({ count, ...p }) => ({ ...p, outperformsCount: count }));
    return NextResponse.json(
      { overperformers },
      {
        headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
      },
    );
  } catch (error) {
    console.error("Error computing overperformers:", error);
    return NextResponse.json({ error: "Failed to compute overperformers" }, { status: 500 });
  }
}
