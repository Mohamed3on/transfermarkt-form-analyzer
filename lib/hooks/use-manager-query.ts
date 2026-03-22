import { useQuery } from "@tanstack/react-query";
import type { ManagerInfo } from "@/app/types";

export function useManagerQuery(clubId: string) {
  return useQuery<ManagerInfo | null>({
    queryKey: ["manager", clubId],
    queryFn: () =>
      fetch(`/api/manager/${clubId}`)
        .then((r) => r.json())
        .then((d) => d.manager ?? null),
    staleTime: 86400_000,
  });
}

export const managerQueryOptions = (clubId: string) => ({
  queryKey: ["manager", clubId] as const,
  queryFn: () =>
    fetch(`/api/manager/${clubId}`)
      .then((r: Response) => r.json())
      .then((d: { manager?: ManagerInfo | null }) => d.manager ?? null),
  staleTime: 86400_000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
