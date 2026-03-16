"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { formatMarketValue } from "@/lib/format";

interface SearchPlayer {
  id: string;
  name: string;
  club: string;
  position: string;
  league: string;
  nationality: string;
  imageUrl: string;
  marketValue: number;
}

interface SearchTeam {
  id: string;
  name: string;
  logoUrl: string;
}

interface SearchIndex {
  players: SearchPlayer[];
  teams: SearchTeam[];
}

type ScoredResult =
  | { type: "player"; data: SearchPlayer; score: number }
  | { type: "team"; data: SearchTeam; score: number };

export function PlayerSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const fetchedRef = useRef(false);

  const fetchIndex = useCallback(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/players/search")
      .then((r) => {
        if (!r.ok) throw new Error(`Search index returned ${r.status}`);
        return r.json();
      })
      .then(setIndex)
      .catch((err) => {
        console.error("[PlayerSearch] Failed to load search index:", err);
        fetchedRef.current = false;
        setIndex({ players: [], teams: [] });
      });
  }, []);

  // Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Prefetch after idle
  useEffect(() => {
    const timer = setTimeout(fetchIndex, 3000);
    return () => clearTimeout(timer);
  }, [fetchIndex]);

  // Also fetch immediately on open
  useEffect(() => {
    if (open) fetchIndex();
  }, [open, fetchIndex]);

  // Reset query on close
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo((): ScoredResult[] => {
    if (!index || query.length === 0) return [];
    const q = query.toLowerCase();
    const scored: ScoredResult[] = [];

    // Score: lower = better. name startsWith (0) > name contains (1) > secondary field (2)
    for (const p of index.players) {
      const name = p.name.toLowerCase();
      const score = name.startsWith(q) ? 0
        : name.includes(q) ? 1
        : p.club.toLowerCase().includes(q) || p.league.toLowerCase().includes(q)
          || p.nationality.toLowerCase().includes(q) || p.position.toLowerCase().includes(q) ? 2
        : -1;
      if (score >= 0) scored.push({ type: "player", data: p, score });
    }
    for (const t of index.teams) {
      const name = t.name.toLowerCase();
      const score = name.startsWith(q) ? 0 : name.includes(q) ? 1 : -1;
      if (score >= 0) scored.push({ type: "team", data: t, score });
    }

    scored.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      // Within same score tier: players with higher market value first, teams after players
      const aVal = a.type === "player" ? a.data.marketValue : 0;
      const bVal = b.type === "player" ? b.data.marketValue : 0;
      return bVal - aVal;
    });

    return scored.slice(0, 8);
  }, [index, query]);

  const handleSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-auto p-2 text-text-muted hover:text-text-primary"
        aria-label="Search players"
      >
        <Search className="h-4 w-4" />
        <kbd className="pointer-events-none ml-1.5 hidden h-5 items-center gap-0.5 rounded border border-border-subtle bg-elevated px-1.5 font-mono text-[10px] text-text-muted xl:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[30%] translate-y-0 gap-0 overflow-hidden rounded-2xl border-border-subtle/60 bg-[var(--bg-card)] p-0 shadow-2xl shadow-black/40 sm:max-w-xl [&>button]:hidden">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search for players or teams
          </DialogDescription>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search players or teams..."
              value={query}
              onValueChange={setQuery}
              wrapperClassName="border-border-subtle/40 px-4"
              className="h-12 text-sm placeholder:text-text-muted"
            />
            <CommandList className="max-h-80 p-1.5">
              {query.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
                  <Search className="h-5 w-5 opacity-30" />
                  <p className="text-sm">{index ? "Search 700+ players and 400+ teams" : "Loading\u2026"}</p>
                  <p className="text-xs opacity-50">Try a name, club, league, or nationality</p>
                </div>
              ) : results.length === 0 ? (
                <CommandEmpty className="py-12 text-text-muted">No results found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {results.map((r) => {
                    const prefix = r.type === "player" ? "p" : "t";
                    const href = r.type === "player" ? `/players/${r.data.id}` : `/teams/${r.data.id}`;
                    return (
                      <CommandItem
                        key={`${prefix}-${r.data.id}`}
                        value={`${prefix}-${r.data.id}`}
                        onSelect={() => handleSelect(href)}
                        className="gap-3 rounded-xl px-3 py-2.5 data-[selected=true]:bg-white/5"
                      >
                        {r.type === "player" ? (
                          <PlayerAvatar name={r.data.name} imageUrl={r.data.imageUrl} className="h-9 w-9 rounded-lg border border-border-subtle/50" />
                        ) : (
                          <img src={r.data.logoUrl} alt={r.data.name} className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-0.5" />
                        )}
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-sm text-text-primary">{r.data.name}</span>
                          {r.type === "player" && (
                            <span className="truncate text-xs text-text-muted">{r.data.position} · {r.data.club}</span>
                          )}
                        </div>
                        <span className="font-value text-xs text-text-muted">
                          {r.type === "player" ? formatMarketValue(r.data.marketValue) : "Team"}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
