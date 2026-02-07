import type { Metadata } from "next";
import { AnalyzerUI } from "@/app/components/AnalyzerUI";

export const metadata: Metadata = {
  title: "Recent Form Signals",
  description:
    "Identify best and worst recent form across Europe's top 5 leagues. Teams are flagged when they lead at least 2 metrics in the same match window.",
};

export default function FormSignalsPage() {
  return <AnalyzerUI />;
}
