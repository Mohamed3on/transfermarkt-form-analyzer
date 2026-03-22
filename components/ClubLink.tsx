import Link from "next/link";
import { extractClubIdFromLogoUrl, getTeamDetailHref } from "@/lib/format";

export function ClubLink({
  club,
  clubLogoUrl,
  className = "",
  logoSize = "w-3.5 h-3.5",
}: {
  club: string;
  clubLogoUrl?: string;
  className?: string;
  logoSize?: string;
}) {
  const clubId = extractClubIdFromLogoUrl(clubLogoUrl);
  const logo = clubLogoUrl && (
    <img
      src={clubLogoUrl}
      alt={club}
      className={`${logoSize} object-contain bg-white rounded p-px shrink-0`}
    />
  );

  if (clubId) {
    return (
      <Link
        href={getTeamDetailHref(clubId)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-text-primary ${className}`}
      >
        {logo}
        {club}
      </Link>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {logo}
      {club}
    </span>
  );
}
