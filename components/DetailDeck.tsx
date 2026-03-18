"use client";

import { Children, useEffect, useMemo, useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DetailDeckProps {
  sections: { value: string; label: string }[];
  children: ReactNode;
}

export function DetailDeck({ sections, children }: DetailDeckProps) {
  const keys = useMemo(() => sections.map((s) => s.value), [sections]);

  const [active, setActive] = useState(keys[0]);
  const panels = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (keys.includes(hash)) setActive(hash);

    const onHashChange = () => {
      const h = window.location.hash.slice(1);
      if (keys.includes(h)) setActive(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [keys]);

  return (
    <section className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-[linear-gradient(180deg,rgba(13,17,23,0.94),rgba(8,10,12,0.96))]">
        <div className="px-5 py-4 sm:px-6">
          <Tabs value={active} onValueChange={(v) => {
            setActive(v);
            window.history.replaceState(null, "", `#${v}`);
          }}>
            <TabsList>
              {sections.map((section) => (
                <TabsTrigger key={section.value} value={section.value}>
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="p-5 sm:p-6">
          {keys.map((key, i) => (
            <div key={key} className={key === active ? undefined : "hidden"}>
              {panels[i]}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
