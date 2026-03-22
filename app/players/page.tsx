import { getMinutesValueData } from "@/lib/fetch-minutes-value";
import { getInjuredPlayers } from "@/lib/injured";
import { DataLastUpdated } from "@/app/components/DataLastUpdated";
import { PlayersUI } from "./PlayersUI";
import { createPageMetadata } from "@/lib/metadata";
import { DiscoveryLinkGrid } from "@/app/components/DiscoveryLinkGrid";

export const metadata = createPageMetadata({
  title: "Player Explorer",
  description:
    "Filter and rank 500+ elite players by market value, minutes, goals + assists, loans, and new signings across the Premier League, La Liga, Bundesliga, Serie A, and Ligue 1.",
  path: "/players",
  keywords: [
    "football player stats",
    "soccer player rankings",
    "top loan players europe",
    "highest scoring new signings",
    "player minutes analysis",
  ],
});

const SPIELER_RE = /\/spieler\/(\d+)/;

export default async function PlayersPage() {
  const [players, injuredData] = await Promise.all([getMinutesValueData(), getInjuredPlayers()]);

  const injuryMap: Record<string, { injury: string; returnDate: string; injurySince: string }> = {};
  for (const p of injuredData.players) {
    const m = p.profileUrl.match(SPIELER_RE);
    if (m)
      injuryMap[m[1]] = { injury: p.injury, returnDate: p.returnDate, injurySince: p.injurySince };
  }

  return (
    <>
      <PlayersUI initialData={players} injuryMap={injuryMap} />
      <DiscoveryLinkGrid
        section="players"
        title="Player Scouting Boards"
        description="Use purpose-built boards for loans, new signings, and top-5 output leaders."
        currentPath="/players"
      />
      <DataLastUpdated />
    </>
  );
}
