#!/usr/bin/env node
/**
 * Deploy the static build of Eternal Lattice into the chatagent.ca site copy.
 *
 * The site copy is not a bare build output: it carries chatagent chrome
 * (hub.css, the arcade ledger + hall bridge scripts, and the games-chrome
 * header), a chatagent-only ledger.html, and its own meta description. A plain
 * copy of dist-static/ over it silently strips all of that, so this script
 * builds, syncs, drops stale hashed assets, and then rewrites index.html as
 * built output + chrome.
 *
 *   node scripts/deploy-chatagent-static.mjs
 *   CHATAGENT_GAME_DIR=/path/to/games/eternal-lattice node scripts/deploy-chatagent-static.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist-static");
const target =
  process.env.CHATAGENT_GAME_DIR ?? "C:/Users/justi/source/chatagent/games/eternal-lattice";

const DESCRIPTION =
  "Playable Δ9 Eternal Lattice — Week 1: undo, keys 1–8, How to play. Champion card battles, campaign, Deckwright. Local-first.";

function build() {
  console.log("· building static bundle");
  // npm is a .cmd shim on Windows, which Node refuses to spawn without a shell
  execSync("npm run build:static", { cwd: root, stdio: "inherit" });
}

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

function sync() {
  const files = walk(dist);
  for (const rel of files) {
    const to = path.join(target, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(dist, rel), to);
  }
  // drop stale hashed assets from previous builds
  const assets = path.join(target, "assets");
  const keep = new Set(files.filter((f) => f.startsWith("assets")).map((f) => path.basename(f)));
  let dropped = 0;
  for (const f of fs.existsSync(assets) ? fs.readdirSync(assets) : []) {
    if (!keep.has(f)) {
      fs.rmSync(path.join(assets, f));
      dropped += 1;
    }
  }
  console.log(`· synced ${files.length} files (dropped ${dropped} stale asset(s))`);
}

function chrome() {
  const built = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  const js = built.match(/src="\.\/assets\/(index-[^"]+\.js)"/)?.[1];
  const css = built.match(/href="\.\/assets\/(index-[^"]+\.css)"/)?.[1];
  if (!js || !css) throw new Error("could not read hashed asset names from dist-static/index.html");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>LYGO: Eternal Lattice</title>
    <meta name="description" content="${DESCRIPTION}" />
    <meta name="robots" content="index, follow" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta name="theme-color" content="#07080c" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="canonical" href="https://chatagent.ca/games/eternal-lattice/" />
    <meta property="og:title" content="LYGO: Eternal Lattice" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://chatagent.ca/games/eternal-lattice/" />
    <meta property="og:image" content="https://chatagent.ca/games/eternal-lattice/og.jpg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@400;500;600&display=swap"
    />
    <script src="/games/arcade-ledger.js?v=5"></script>
    <script src="/games/hall-bridge.js?v=1"></script>
    <script>window.LYGO_GATE_EMBED = true;</script>
    <link rel="stylesheet" href="/games/lygo-gate.css?v=2">
    <script src="/games/lygo-gate.js?v=2" defer></script>
    <script type="module" crossorigin src="./assets/${js}"></script>
    <link rel="stylesheet" crossorigin href="./assets/${css}">
    <link rel="stylesheet" href="/games/hub.css?v=5">
  </head>
  <body class="starfield">
    <header class="games-chrome">
      <a href="/games/">Hub</a>
      <a href="/games/eternal-lattice/ledger.html">Live ladder</a>
      <a class="games-chrome-home" href="/">chatagent.ca</a>
    </header>
    <div id="root"></div>
  </body>
</html>
`;
  fs.writeFileSync(path.join(target, "index.html"), html, "utf8");
  console.log(`· index.html rewritten with chrome (${js}, ${css})`);
}

build();
sync();
chrome();
console.log("✓ deployed to", target);
