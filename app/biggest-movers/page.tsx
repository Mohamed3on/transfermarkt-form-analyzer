import { findRepeatLosers, findRepeatWinners } from "@/lib/biggest-movers";
import { BiggestMoversUI } from "./BiggestMoversUI";
import { DataLastUpdated } from "@/app/components/DataLastUpdated";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Biggest Movers",
  description:
    "Track players whose market value keeps rising or falling across Europe's top 5 leagues. Spot career surges and freefalls with Transfermarkt value history.",
  path: "/biggest-movers",
  keywords: [
    "market value changes football",
    "biggest movers transfermarkt",
    "player value tracker",
    "rising soccer players",
    "falling market value players",
  ],
});

export default async function BiggestMoversPage() {
  const [losers, winners] = await Promise.all([findRepeatLosers(), findRepeatWinners()]);
  return (
    <>
      <BiggestMoversUI losers={losers} winners={winners} />
      <DataLastUpdated file="biggest-movers-updated-at.txt" />
    </>
  );
}
