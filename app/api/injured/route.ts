import { NextResponse } from "next/server";
import { getInjuredPlayers } from "@/lib/injured";

export async function GET() {
  try {
    const data = await getInjuredPlayers();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching injured players:", error);
    return NextResponse.json({ error: "Failed to fetch injured players" }, { status: 500 });
  }
}
