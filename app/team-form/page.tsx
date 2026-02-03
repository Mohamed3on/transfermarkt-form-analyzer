import type { Metadata } from "next";
import { getTeamFormData } from "@/lib/team-form";
import { TeamFormUI } from "./TeamFormUI";

export const metadata: Metadata = {
  title: "Team Δ Pts | FormTracker",
  description: "Teams over/underperforming their expected position based on squad market value",
};

export default async function TeamFormPage() {
  const data = await getTeamFormData();
  return <TeamFormUI initialData={data} />;
}
