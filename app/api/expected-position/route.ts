import { NextResponse } from "next/server";
import { getTeamFormData } from "@/lib/team-form";

export async function GET() {
  try {
    const data = await getTeamFormData();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("Error fetching team form data:", error);
    return NextResponse.json({ error: "Failed to fetch team form data" }, { status: 500 });
  }
}
