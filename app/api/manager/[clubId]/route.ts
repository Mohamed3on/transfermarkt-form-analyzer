import { NextResponse } from "next/server";
import { getManagerInfo } from "@/lib/fetch-manager";

export async function GET(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  try {
    const manager = await getManagerInfo(clubId);
    return NextResponse.json(
      { clubId, manager },
      {
        headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
      },
    );
  } catch (error) {
    console.error(`[manager] Failed to fetch manager for club ${clubId}:`, error);
    return NextResponse.json({ clubId, manager: null }, { status: 500 });
  }
}
