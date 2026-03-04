// Static OG image served from public/og.png
// This file configures Next.js metadata for the OG image

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "SquadStat - Football Form, Value & Injury Analytics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const buffer = await readFile(join(process.cwd(), "public", "og.png"));
  return new Response(buffer, {
    headers: { "Content-Type": "image/png" },
  });
}
