import { NextResponse } from "next/server";
import { getMinutesValueData } from "@/lib/fetch-minutes-value";

export async function GET() {
  try {
    const players = await getMinutesValueData();
    const index = players.map((p) => ({
      id: p.playerId,
      name: p.name,
      club: p.club,
      position: p.position,
      league: p.league,
      nationality: p.nationality ?? "",
      imageUrl: p.imageUrl,
      marketValue: p.marketValue,
    }));
    return NextResponse.json(index, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("[API /players/search] Failed to build search index:", error);
    return NextResponse.json({ error: "Failed to load player search data" }, { status: 500 });
  }
}
