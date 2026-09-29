// Where "Get started" buttons send people: the separate intake app, once its
// address is set as PUBLIC_APP_URL. Until then, everything falls back to the
// "coming soon" page instead of a broken link.
export function appLink(topic?: string): string {
  const base = import.meta.env.PUBLIC_APP_URL as string | undefined;
  if (!base) return "/coming-soon";
  if (!topic) return base;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}topic=${encodeURIComponent(topic)}`;
}
