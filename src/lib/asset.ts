/** Resolve public assets under the game folder (works on /games/... and GH Pages). */
export function asset(path: string): string {
  const clean = path.replace(/^\.?\/+/, "");
  if (typeof window !== "undefined") {
    const base = window.location.href.replace(/[#?].*$/, "").replace(/\/?$/, "/");
    return new URL(clean, base).href;
  }
  const viteBase = import.meta.env.BASE_URL || "./";
  return `${viteBase.endsWith("/") ? viteBase : viteBase + "/"}${clean}`;
}
