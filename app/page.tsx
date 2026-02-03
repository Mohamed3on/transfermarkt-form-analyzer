import type { Metadata } from "next";
import { AnalyzerUI } from "./components/AnalyzerUI";

export const metadata: Metadata = {
  title: "Football Team Form Analyzer",
  description:
    "Find which football teams are in the best and worst form across Europe's top 5 leagues. Analyzes points, goals scored, goals conceded, and goal difference over recent matches.",
};

export default function Home() {
  return <AnalyzerUI />;
}
