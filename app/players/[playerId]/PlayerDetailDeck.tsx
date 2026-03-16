"use client";

import { Children, useMemo, useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type SectionKey = "snapshot" | "comparisons" | "minutes" | "club";

const SECTION_ORDER: SectionKey[] = ["snapshot", "comparisons", "minutes", "club"];

interface PlayerDetailDeckProps {
  children: ReactNode;
}

export function PlayerDetailDeck({ children }: PlayerDetailDeckProps) {
  const [active, setActive] = useState<SectionKey>("snapshot");
  const [direction, setDirection] = useState<1 | -1>(1);
  const panels = useMemo(() => SECTION_ORDER.map((_, index) => Children.toArray(children)[index]), [children]);

  const sections: { value: SectionKey; label: string }[] = [
    { value: "snapshot", label: "Snapshot" },
    { value: "comparisons", label: "Market comps" },
    { value: "minutes", label: "Minutes" },
    { value: "club", label: "Club context" },
  ];

  const activeIndex = SECTION_ORDER.indexOf(active);

  return (
    <section className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-[linear-gradient(180deg,rgba(13,17,23,0.94),rgba(8,10,12,0.96))]">
        <div className="px-5 py-4 sm:px-6">
          <Tabs
            value={active}
            onValueChange={(nextValue) => {
              const next = nextValue as SectionKey;
              const nextIndex = SECTION_ORDER.indexOf(next);
              if (nextIndex === -1 || next === active) return;
              setDirection(nextIndex > activeIndex ? 1 : -1);
              setActive(next);
            }}
          >
            <TabsList>
              {sections.map((section) => (
                <TabsTrigger key={section.value} value={section.value}>
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-hidden p-5 sm:p-6">
          <div
            key={active}
            className={cn(
              "motion-reduce:animate-none",
              direction === 1 ? "animate-room-in-right" : "animate-room-in-left",
            )}
          >
            {panels[activeIndex]}
          </div>
        </div>
      </div>
    </section>
  );
}
