import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLeagueLogoUrl, getLeagueUrl, getLeagueStyle } from "@/lib/leagues";

interface LeagueBadgeProps {
  league: string;
  variant?: "inline" | "badge";
}

export function LeagueBadge({ league, variant = "badge" }: LeagueBadgeProps) {
  const logoUrl = getLeagueLogoUrl(league);
  const url = getLeagueUrl(league);
  const logo = logoUrl && <img src={logoUrl} alt="" className="w-3.5 h-3.5 object-contain rounded-sm bg-white/90 p-px" />;

  if (variant === "inline") {
    const content = (
      <>
        {logo}
        {league}
      </>
    );
    return url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1 ml-auto text-xs uppercase tracking-wide text-text-secondary hover:underline">
        {content}
      </a>
    ) : (
      <span className="hidden sm:flex items-center gap-1 ml-auto text-xs uppercase tracking-wide text-text-secondary">
        {content}
      </span>
    );
  }

  // badge variant
  const style = getLeagueStyle(league);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <Badge className={cn("text-[10px] sm:text-xs flex items-center gap-1 hover:opacity-80 transition-opacity", style.bg, style.text)}>
        {logo}
        {league}
      </Badge>
    </a>
  );
}

