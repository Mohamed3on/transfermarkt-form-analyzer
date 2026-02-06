import type { Metadata } from "next";
import { getMinutesValueData } from "@/lib/fetch-minutes-value";
import { fetchPlayerMinutes } from "@/lib/fetch-player-minutes";
import { MinutesValueUI } from "./MinutesValueUI";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Benched Stars | FormTracker",
  description:
    "High-value football players getting the fewest minutes across Europe's top leagues.",
};

export default async function MinutesValuePage() {
  const players = await getMinutesValueData();

  const zeroMinute = players.filter((p) => p.minutes === 0);
  if (zeroMinute.length > 0) {
    const results = await Promise.allSettled(
      zeroMinute.map((p) => fetchPlayerMinutes(p.playerId))
    );
    zeroMinute.forEach((p, i) => {
      if (results[i].status === "fulfilled" && results[i].value.minutes > 0) {
        const s = results[i].value;
        p.minutes = s.minutes;
        p.totalMatches = s.appearances || p.totalMatches;
        p.goals = s.goals;
        p.assists = s.assists;
      }
    });
  }

  return <MinutesValueUI initialData={players} />;
}
