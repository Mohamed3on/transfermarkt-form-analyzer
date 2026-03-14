"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsTouchDevice } from "@/lib/hooks/use-touch-device";

interface InfoTipProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoTip({ children, className }: InfoTipProps) {
  const isTouch = useIsTouchDevice();

  const trigger = (
    <span className={`inline-flex cursor-help items-center ${className ?? ""}`}>
      <Info className="h-3.5 w-3.5 text-text-muted transition-colors hover:text-text-secondary" />
    </span>
  );

  const contentClass =
    "max-w-xs sm:max-w-sm p-3 text-xs sm:text-sm leading-relaxed bg-card text-text-primary border border-border-subtle shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

  if (isTouch) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="center"
          sideOffset={8}
          avoidCollisions
          collisionPadding={16}
          className={contentClass}
        >
          {children}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="center"
        sideOffset={8}
        avoidCollisions
        collisionPadding={16}
        className={contentClass}
      >
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
