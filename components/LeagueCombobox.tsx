"use client";

import { useMemo } from "react";
import { Combobox } from "@/components/Combobox";
import { buildLeagueGroups } from "@/lib/filter-players";

export function LeagueCombobox({
  players,
  value,
  onChange,
}: {
  players: { league: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const groups = useMemo(() => buildLeagueGroups(players), [players]);
  return (
    <Combobox
      value={value}
      onChange={onChange}
      groups={groups}
      placeholder="All leagues"
      searchPlaceholder="Search leagues..."
    />
  );
}
