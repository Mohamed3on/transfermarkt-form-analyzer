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

export function PlayerSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<SearchPlayer[] | null>(null);
  const fetchedRef = useRef(false);

  const fetchPlayers = useCallback(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/players/search")
      .then((r) => {
        if (!r.ok) throw new Error(`Search index returned ${r.status}`);
        return r.json();
      })
      .then(setPlayers)
      .catch((err) => {
        console.error("[PlayerSearch] Failed to load search index:", err);
        fetchedRef.current = false;
        setPlayers([]);
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
    const timer = setTimeout(fetchPlayers, 3000);
    return () => clearTimeout(timer);
  }, [fetchPlayers]);

  // Also fetch immediately on open
  useEffect(() => {
    if (open) fetchPlayers();
  }, [open, fetchPlayers]);

  // Reset query on close
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    if (!players || query.length === 0) return [];
    const q = query.toLowerCase();
    return players
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.club.toLowerCase().includes(q) ||
          p.position.toLowerCase().includes(q) ||
          p.league.toLowerCase().includes(q) ||
          p.nationality.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [players, query]);

  const handleSelect = useCallback(
    (playerId: string) => {
      setOpen(false);
      router.push(`/players/${playerId}`);
    },
    [router]
  );

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
        <DialogContent className="gap-0 overflow-hidden p-0 [&>button]:hidden">
          <DialogTitle className="sr-only">Search players</DialogTitle>
          <DialogDescription className="sr-only">
            Search for players by name, club, or position
          </DialogDescription>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search players..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {query.length === 0 ? (
                <div className="py-10 text-center text-sm text-text-muted">
                  {players ? "Search 500+ elite players" : "Loading\u2026"}
                </div>
              ) : filtered.length === 0 ? (
                <CommandEmpty>No players found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filtered.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.id}
                      onSelect={() => handleSelect(p.id)}
                      className="gap-3 py-2.5"
                    >
                      <PlayerAvatar
                        name={p.name}
                        imageUrl={p.imageUrl}
                        className="h-8 w-8 rounded-md"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm text-text-primary">
                          {p.name}
                        </span>
                        <span className="truncate text-xs text-text-muted">
                          {p.position} · {p.club}
                        </span>
                      </div>
                      <span className="font-value text-xs text-text-muted">
                        {formatMarketValue(p.marketValue)}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
