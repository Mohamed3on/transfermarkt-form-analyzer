import { getTeamFormData } from "@/lib/team-form";
import { TeamFormUI } from "./TeamFormUI";
import { createPageMetadata } from "@/lib/metadata";
import { DiscoveryLinkGrid } from "@/app/components/DiscoveryLinkGrid";

export const revalidate = 7200;

export const metadata = createPageMetadata({
  title: "Value vs Table Performance",
  description:
    "Compare each team's actual points with expected points from squad market value rank. Quickly spot clubs overperforming or underperforming their spending level.",
  path: "/team-form",
  keywords: [
    "overperforming football teams",
    "underperforming football teams",
    "team value vs table",
  ],
});

const emptyData = {
  success: false as const,
  overperformers: [],
  underperformers: [],
  totalTeams: 0,
  leagues: [],
};

export default async function TeamFormPage() {
  let data;
  try {
    data = await getTeamFormData();
    if (!data.overperformers.length && !data.underperformers.length) throw new Error("Empty team-form data");
  } catch {
    data = emptyData;
  }
  return (
    <>
      <TeamFormUI initialData={data} />
      <DiscoveryLinkGrid
        section="team-form"
        title="Team Performance Boards"
        description="League-level and global boards for overperformers and underperformers."
        currentPath="/team-form"
      />
    </>
  );
}
