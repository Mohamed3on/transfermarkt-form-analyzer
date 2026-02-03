import type { Metadata } from "next";
import { getTeamFormData } from "@/lib/team-form";
import { TeamFormUI } from "./TeamFormUI";

export const metadata: Metadata = {
  title: "Football Teams Over/Underperforming",
  description:
    "Compare football team league positions against their expected position based on squad market value. Find which teams are overperforming or underperforming relative to their budget.",
};

export default async function TeamFormPage() {
  const data = await getTeamFormData();
  return <TeamFormUI initialData={data} />;
}
