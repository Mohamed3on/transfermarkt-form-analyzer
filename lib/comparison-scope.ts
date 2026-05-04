export type ComparisonScope = "all" | "league" | "top5";

export function paramsToScope(params: {
  sameLeague?: string | null;
  top5?: string | null;
}): ComparisonScope {
  if (params.sameLeague === "1") return "league";
  if (params.top5 === "1") return "top5";
  return "all";
}

export function scopeToParams(scope: ComparisonScope): {
  sameLeague: string | null;
  top5: string | null;
} {
  return {
    sameLeague: scope === "league" ? "1" : null,
    top5: scope === "top5" ? "1" : null,
  };
}
