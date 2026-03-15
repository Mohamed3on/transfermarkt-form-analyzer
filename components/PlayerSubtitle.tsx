import { PositionDisplay } from "@/components/PositionDisplay";
import { NationalityFlag } from "@/components/NationalityFlag";
import { ClubLogo } from "@/components/ClubLogo";

interface PlayerSubtitleProps {
  position: string;
  playedPosition?: string;
  club: string;
  clubLogoUrl?: string;
  age: number;
  nationalityFlagUrl?: string;
  nationality?: string;
}

export function PlayerSubtitle({ position, playedPosition, club, clubLogoUrl, age, nationalityFlagUrl, nationality }: PlayerSubtitleProps) {
  return (
    <>
      <PositionDisplay position={position} playedPosition={playedPosition} abbreviated />
      {nationalityFlagUrl && (
        <>
          <span className="opacity-40">•</span>
          <NationalityFlag url={nationalityFlagUrl} name={nationality} />
        </>
      )}
      <span className="opacity-40">•</span>
      <span className="truncate max-w-24 sm:max-w-none inline-flex items-center gap-1">
        {clubLogoUrl && <ClubLogo src={clubLogoUrl} />}
        {club}
      </span>
      <span className="hidden sm:inline opacity-40">•</span>
      <span className="hidden sm:inline">{age}y</span>
    </>
  );
}
