"use client";

import { Children, useEffect, useMemo, useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DetailDeckProps {
  sections: { value: string; label: string }[];
  children: ReactNode;
}

export function DetailDeck({ sections, children }: DetailDeckProps) {
  const keys = useMemo(() => sections.map((s) => s.value), [sections]);

  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return keys[0];
    const hash = window.location.hash.slice(1);
    return keys.includes(hash) ? hash : keys[0];
  });
  const [direction, setDirection] = useState<1 | -1>(1);
  const panels = useMemo(() => keys.map((_, index) => Children.toArray(children)[index]), [children, keys]);

  const activeIndex = keys.indexOf(active);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (keys.includes(hash) && hash !== active) {
        setDirection(keys.indexOf(hash) > keys.indexOf(active) ? 1 : -1);
        setActive(hash);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [active, keys]);

  const switchTab = (nextValue: string) => {
    const nextIndex = keys.indexOf(nextValue);
    if (nextIndex === -1 || nextValue === active) return;
    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActive(nextValue);
    window.history.replaceState(null, "", `#${nextValue}`);
  };

  return (
    <section className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-[linear-gradient(180deg,rgba(13,17,23,0.94),rgba(8,10,12,0.96))]">
        <div className="px-5 py-4 sm:px-6">
          <Tabs value={active} onValueChange={switchTab}>
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
