import { Badge } from "@/components/ui/badge";

export function SignalBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return <Badge className={`rounded-full border px-3 py-1 text-xs ${className}`}>{children}</Badge>;
}
