import { NextResponse } from "next/server";
import { getMinutesValueData } from "@/lib/fetch-minutes-value";

export async function GET() {
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
}
