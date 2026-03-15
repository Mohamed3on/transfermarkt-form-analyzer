export function NationalityFlag({ url, name }: { url?: string; name?: string }) {
  if (!url) return null;
  return <img src={url} alt={name || ""} title={name || ""} className="w-4 h-3 object-contain shrink-0" />;
}
