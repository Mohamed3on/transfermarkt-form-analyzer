export const PROFIL_RE = /\/profil\//;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatReturnInfo(dateStr: string): { label: string; imminent: boolean } | null {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split("/").map(Number);
  if (!d || !m || !y) return null;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days = Math.ceil((target.getTime() - now.getTime()) / 86400000);
  const mon = MONTHS[m - 1];
  if (days <= 0) return { label: `back ${mon} ${d}`, imminent: true };
  if (days <= 14) return { label: `back in ${days} days`, imminent: true };
  if (days <= 60) return { label: `back in ~${Math.ceil(days / 7)} wks`, imminent: false };
  return { label: `back ${mon} ${d}`, imminent: false };
}

export function formatInjuryDuration(sinceStr: string): string | null {
  if (!sinceStr) return null;
  const [d, m, y] = sinceStr.split("/").map(Number);
  if (!d || !m || !y) return null;
  const since = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((now.getTime() - since.getTime()) / 86400000));
  if (days < 14) return `${days} days`;
  if (days < 45) return `${Math.round(days / 7)} wks`;
  const months = Math.round(days / 30);
  return months === 1 ? "1 mo" : `${months} mos`;
}
