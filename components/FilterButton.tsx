"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle-group";

export function FilterButton({ active, onClick, children, className }: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-state={active ? "on" : "off"}
      onClick={onClick}
      className={cn(toggleVariants({ size: "sm", variant: "outline" }), "gap-1.5 rounded-lg", className)}
    >
      {children}
    </button>
  );
}
