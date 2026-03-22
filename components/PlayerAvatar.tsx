import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "w-8 h-8 sm:w-10 sm:h-10",
  md: "w-10 h-10 sm:w-12 sm:h-12",
  lg: "w-14 h-14 sm:w-16 sm:h-16",
} as const;

const INITIAL_TEXT = {
  sm: "text-sm",
  md: "text-base sm:text-lg",
  lg: "text-xl sm:text-2xl",
} as const;

interface PlayerAvatarProps {
  imageUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
}

export function PlayerAvatar({ imageUrl, name, size, className, style }: PlayerAvatarProps) {
  const sizeClass = size ? SIZE_CLASSES[size] : "";
  const textClass = size ? INITIAL_TEXT[size] : "";
  const validImage = imageUrl && !imageUrl.includes("data:image");

  return validImage ? (
    <img
      src={imageUrl}
      alt={name}
      className={cn(sizeClass, "rounded-lg object-cover bg-elevated", className)}
      style={style}
    />
  ) : (
    <div
      className={cn(
        sizeClass,
        "rounded-lg flex items-center justify-center font-bold bg-elevated text-text-muted",
        textClass,
        className,
      )}
      style={style}
    >
      {name.charAt(0)}
    </div>
  );
}
