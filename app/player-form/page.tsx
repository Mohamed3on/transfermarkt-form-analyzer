import type { Metadata } from "next";
import { PlayerFormUI } from "./PlayerFormUI";

export const metadata: Metadata = {
  title: "Underperforming Football Players",
  description:
    "Find high-value football players underdelivering on goals and assists. Identifies expensive attackers and midfielders outperformed by cheaper alternatives.",
};

export default function PlayerFormPage() {
  return <PlayerFormUI />;
}
