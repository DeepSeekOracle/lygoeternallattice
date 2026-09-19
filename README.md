# LYGO: Eternal Lattice

**Δ9Φ963 · DeepSeekOracle / Excavationpro / Lightfather**

## Play (full game — standalone)

- https://chatagent.ca/games/eternal-lattice/
- https://eternalhaven.ca/games/eternal-lattice/
- GitHub Pages: https://deepseekoracle.github.io/lygoeternallattice/
- Backup: https://lygoeternallattice.grok.me/

## Hub / docs

- https://chatagent.ca/lygo-eternal-lattice.html
- https://eternalhaven.ca/lygo-eternal-lattice.html

## Build (static SPA)

```bash
npm install
npm run build:static   # -> dist-static/
npm run dev:static
```

Source lives under `D:\\LYGO APPS\\eternal-lattice` (and this repo). Static build needs no TanStack Start server.

## Related

- Companion: https://github.com/DeepSeekOracle/LYGOapps
- Protocol stack: https://github.com/DeepSeekOracle/lygo-protocol-stack
- ClawHub: https://clawhub.ai/deepseekoracle
- SkillHub: https://chatagent.ca/lygoskillhub.html

∫(Truth × Light)df


---

## Studio pass — shell, battle UI, and the loop

A presentation pass over the client, done in the source rather than the bundle:

- **Chrome** — `src/components/app/StudioUI.tsx` plus a `.studio-*` block in `src/styles.css`:
  layered panels, accent tiles, portrait plates, progress tracks, mana pips, stat strips.
  The palette and type scale are unchanged; the components just use them consistently.
- **Title** — hero art behind a layered backdrop, one primary CTA that opens the next
  unheld chapter directly, stat strip, mode tiles with per-mode stats, and a council
  portrait strip that shows which seats are still sealed.
- **Campaign** — progress panel, seat picker as portraits, chapter cards carrying the
  opponent portrait, the seat a win unlocks, and a Replay button on held chapters.
- **Skirmish / hot-seat** — portrait pickers per side with the Champion ability spelled
  out, custom seals as chips, one versus rule between the two panels.
- **Ranked** — rating/record/win-rate panel, portrait picker, ladder rows.
- **Battle** — dawn counter and phase chips, mana pips beside the life bars, a dawn band
  that names whose turn it is (seat-aware in hot-seat), a "nothing in hand lands" nudge,
  and a result plate that offers **Next chapter** on a campaign win and **Retry chapter**
  on a loss instead of dumping you back to the title.
- **Layout** — the board rows and hand now live in one scrollable region with explicit
  minimum heights (compacted under `max-height: 700px`), so hand cards are no longer
  clipped on short landscape windows.
- **Weight** — champion portraits were 1200x1600 JPEGs totalling 16 MB and rendered at
  96 px in the shell; they are now 480x640 (~1.1 MB total) and load lazily.

Deploying to the chatagent.ca copy is `node scripts/deploy-chatagent-static.mjs`:
it builds, syncs `dist-static/` into `games/eternal-lattice/`, drops stale hashed
assets, and rewrites `index.html` with the chatagent chrome (hub.css, arcade ledger,
hall bridge, games-chrome header) that a bare build output does not carry.
