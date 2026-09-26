/* Layout metrics for the arcade embed.
 *
 * This app is served from chatagent.ca under a 40px `header.games-chrome`
 * bar. `100dvh` counts that bar, so a full-height shell was 40px taller than
 * the space it was given and the last strip of every screen — including the
 * match footer that holds End dawn / Confirm assault / Keep — sat below the
 * fold, where it could be seen only by scrolling and sometimes not at all.
 *
 * Two numbers are published on <html>:
 *   --app-h       the height the app is actually given (viewport minus the
 *                 host's own chrome, 0px when there is none)
 *   --board-zoom  a single scale for the match board so tall columns and the
 *                 hand fit short windows together, instead of fixed
 *                 min-heights stacking past the shell.
 *
 * Measured rather than guessed: any in-flow element the host places before
 * #root counts as chrome, so a host that adds a banner or a gate bar is
 * handled without touching this file.
 */

const MIN_APP_H = 320;

function chromeHeight(appRoot: HTMLElement | null): number {
  let chrome = 0;
  for (const el of Array.from(document.body.children)) {
    if (el === appRoot) break;
    const cs = getComputedStyle(el);
    if (cs.position === "fixed" || cs.position === "absolute") continue;
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    chrome += el.getBoundingClientRect().height;
  }
  return chrome;
}

function measure(): void {
  if (typeof document === "undefined") return;
  const appRoot = document.getElementById("root");
  const chrome = Math.max(0, Math.round(chromeHeight(appRoot)));
  const viewport = window.innerHeight || document.documentElement.clientHeight || MIN_APP_H;
  const appH = Math.max(MIN_APP_H, Math.round(viewport - chrome));

  const root = document.documentElement;
  root.style.setProperty("--app-chrome", `${chrome}px`);
  root.style.setProperty("--app-h", `${appH}px`);
}

/** Install the measurement once; returns a cleanup for the React effect. */
export function installLayoutMetrics(): () => void {
  if (typeof window === "undefined") return () => {};
  measure();

  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      measure();
    });
  };

  window.addEventListener("resize", schedule);
  window.addEventListener("orientationchange", schedule);

  // The host chrome (and its own injected furniture) arrives after first
  // paint, so re-measure until the page settles.
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true });
  [250, 1000, 3000].forEach((ms) => window.setTimeout(measure, ms));

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("orientationchange", schedule);
    observer.disconnect();
  };
}
