import { NextResponse } from "next/server";
import { getAnalysis } from "@/lib/form-analysis";

export async function GET() {
  try {
    const result = await getAnalysis();
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("Error analyzing form:", error);
    return NextResponse.json({ error: "Failed to analyze form data" }, { status: 500 });
  }
}
