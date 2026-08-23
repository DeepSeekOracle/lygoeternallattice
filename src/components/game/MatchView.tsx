import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Shield, Swords, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CARD_BY_ID, CHAMP_BY_ID } from "@/lib/game/catalog";
import { pickAction, takeAiTurn } from "@/lib/game/ai";
import {
  applyAction,
  champOf,
  currentPower,
  getLegalActions,
  legalTargets,
  manaAvail,
  manaPool,
} from "@/lib/game/engine";
import { needsTarget } from "@/lib/game/fx";
import { sfxPlay } from "@/lib/game/audio";
import type { Action, Difficulty, MatchState, TargetKind } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { BoardMinion, CardFace } from "./CardFace";
import { Sigil, champTint } from "./Sigil";

export function MatchView({
  initial,
  difficulty,
  onExit,
  banner,
  shakeOn,
}: {
  initial: MatchState;
  difficulty: Difficulty;
  onExit: (result: "win" | "lose" | "quit", state: MatchState) => void;
  banner?: string;
  shakeOn: boolean;
}) {
  const [s, setS] = useState(initial);
  const [sel, setSel] = useState<string | null>(null);
  const [inspect, setInspect] = useState<string | null>(null);
  const [targetKind, setTargetKind] = useState<TargetKind>("none");
  const [pending, setPending] = useState<Action | null>(null);
  const [heroChoice, setHeroChoice] = useState(false);
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [you] = useState<0 | 1>(initial.humans[0] ? 0 : initial.humans[1] ? 1 : 0);
  const thinking = useRef(false);

  const legal = useMemo(() => getLegalActions(s), [s]);
  const pl = s.players[you];
  const op = s.players[you === 0 ? 1 : 0];
  const yourTurn = s.phase === "block" ? !s.humans[s.active] && s.humans[you] : s.active === you && s.humans[you];
  const hotseat = s.humans[0] && s.humans[1];
  const viewer: 0 | 1 = hotseat ? (s.phase === "block" ? (s.active === 0 ? 1 : 0) : s.active) : you;

  useEffect(() => {
    if (s.winner !== null) {
      const win = s.winner === you || (hotseat && s.winner !== null);
      sfxPlay(s.winner === you ? "win" : hotseat ? "win" : "lose");
    }
  }, [s.winner, you, hotseat]);

  useEffect(() => {
    if (s.winner !== null || thinking.current) return;
    const actor: 0 | 1 = s.phase === "block" ? (s.active === 0 ? 1 : 0) : s.active;
    if (s.humans[actor]) return;
    thinking.current = true;
    setLocked(true);
    const ms = difficulty === "easy" ? 380 : difficulty === "hard" ? 640 : 480;
    const t = window.setTimeout(() => {
      setS((cur) => {
        if (cur.winner !== null) return cur;
        const who: 0 | 1 = cur.phase === "block" ? (cur.active === 0 ? 1 : 0) : cur.active;
        if (cur.humans[who]) return cur;
        try {
          if (cur.phase === "block") {
            let n = cur;
            let g = 0;
            while (n.phase === "block" && n.winner === null && g++ < 20) {
              n = applyAction(n, pickAction(n, difficulty));
            }
            return n;
          }
          return takeAiTurn(cur, difficulty);
        } catch {
          return applyAction(cur, { type: "endTurn" });
        }
      });
      thinking.current = false;
      setLocked(false);
    }, ms);
    return () => window.clearTimeout(t);
  }, [s, difficulty]);

  function act(a: Action) {
    if (s.winner !== null) return;
    const next = applyAction(s, a);
    if (a.type === "play") sfxPlay("play");
    if (a.type === "confirmAttack") sfxPlay("attack");
    if (a.type === "endTurn") sfxPlay("mana");
    if (next.players[you].life < s.players[you].life && shakeOn) {
      setShake(true);
      sfxPlay("hit");
      window.setTimeout(() => setShake(false), 420);
    }
    setS(next);
    setSel(null);
    setPending(null);
    setTargetKind("none");
    setHeroChoice(false);
    setInspect(null);
  }

  function tryPlay(iid: string) {
    if (locked || s.phase !== "main" || s.active !== viewer) return;
    const def = CARD_BY_ID[s.cards[iid]?.cardId ?? ""];
    if (!def) return;
    if (!legal.some((a) => a.type === "play" && a.iid === iid)) {
      sfxPlay("error");
      return;
    }
    const kind = needsTarget(def.onPlay);
    if (kind === "none") {
      const ok = legal.some((a) => a.type === "play" && a.iid === iid && !a.target);
      if (!ok) {
        sfxPlay("error");
        return;
      }
      act({ type: "play", iid });
      return;
    }
    const ts = legalTargets(s, viewer, kind);
    if (!ts.length) {
      sfxPlay("error");
      return;
    }
    setPending({ type: "play", iid });
    setTargetKind(kind);
    setSel(iid);
  }

  function onTarget(id: string) {
    if (!pending) return;
    if (pending.type === "play") act({ type: "play", iid: pending.iid, target: id, choice: pending.choice });
    if (pending.type === "hero") act({ type: "hero", target: id, choice: pending.choice });
  }

  function heroClick() {
    if (locked || s.phase !== "main" || s.active !== viewer) return;
    const h = champOf(s, viewer);
    if (s.players[viewer].heroUsed) return;
    if (manaAvail(s.players[viewer]) < h.abilityCost) {
      sfxPlay("error");
      return;
    }
    if (h.abilityChoices) {
      setHeroChoice(true);
      return;
    }
    const kind = needsTarget(h.ability);
    if (kind === "none") act({ type: "hero" });
    else {
      setPending({ type: "hero" });
      setTargetKind(kind);
    }
  }

  const phaseLabel =
    s.phase === "mulligan"
      ? "Mulligan"
      : s.phase === "attack"
        ? "Declare assault"
        : s.phase === "block"
          ? "Assign seals"
          : s.phase === "over"
            ? "Closed"
            : s.combatThisTurn || s.players[s.active].combatUsed
              ? "Second dawn"
              : "Main";

  const oppV = viewer === 0 ? 1 : 0;
  const vPl = s.players[viewer];
  const oPl = s.players[oppV];

  return (
    <div className={cn("h-dvh flex flex-col bg-bg text-fg overflow-hidden", shake && "shake-board")}>
      <header className="flex items-center gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <Button variant="ghost" size="icon" className="size-10" onClick={() => onExit("quit", s)} aria-label="Leave">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted truncate">
            {banner ?? "Skirmish"}
          </div>
          <div className="font-display text-lg leading-none truncate">{oPl.name}</div>
        </div>
        <button
          type="button"
          onClick={() => setInspect(`hero-${oppV}`)}
          className="flex items-center gap-2 rounded-[12px] bg-raised hairline px-2 py-1"
        >
          <div className="size-8 rounded-full overflow-hidden">
            <Sigil id={oPl.championId} />
          </div>
          <div className="text-right">
            <div className="tabular text-sm">{oPl.life}</div>
            <div className="tabular text-[10px] text-muted">
              {manaAvail(oPl)}/{oPl.permanentMana}
            </div>
          </div>
        </button>
      </header>

      <div className="px-3 flex items-center justify-between text-[11px] text-muted">
        <span>
          Hand {oPl.hand.length} · Library {oPl.library.length} · Archive {oPl.gy.length}
        </span>
        <span className="tabular">{phaseLabel}</span>
      </div>

      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scroll-none min-h-[96px] items-end justify-center">
        {oPl.board.length === 0 && (
          <span className="text-subtle text-xs self-center">Empty field</span>
        )}
        {oPl.board.map((id) => {
          const inst = s.cards[id]!;
          const targeting =
            pending &&
            (targetKind === "enemyMinion" || targetKind === "anyMinion");
          return (
            <BoardMinion
              key={id}
              inst={inst}
              power={currentPower(s, inst)}
              attacking={s.attackers.includes(id)}
              blocking={Object.values(s.blocks).includes(id)}
              onClick={() => {
                if (targeting) onTarget(id);
                else setInspect(id);
              }}
            />
          );
        })}
      </div>

      <div className="mx-3 my-1 flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-subtle">
          {locked ? "The lattice thinks…" : s.active === viewer ? "Your dawn" : `${s.players[s.active].name}'s dawn`}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scroll-none min-h-[104px] items-start justify-center">
        {vPl.board.length === 0 && (
          <span className="text-subtle text-xs self-center">Summon to the lattice</span>
        )}
        {vPl.board.map((id) => {
          const inst = s.cards[id]!;
          const targeting =
            pending &&
            (targetKind === "allyMinion" || targetKind === "anyMinion");
          return (
            <BoardMinion
              key={id}
              inst={inst}
              mine
              power={currentPower(s, inst)}
              attacking={s.attackers.includes(id)}
              blocking={Object.values(s.blocks).includes(id)}
              onClick={() => {
                if (targeting) onTarget(id);
                else if (s.phase === "attack" && s.active === viewer) act({ type: "toggleAttacker", iid: id });
                else if (s.phase === "block") {
                  const atk = s.attackers.find((a) => !s.blocks[a]) ?? s.attackers[0];
                  if (atk) act({ type: "setBlock", attacker: atk, blocker: id });
                } else setInspect(id);
              }}
            />
          );
        })}
      </div>

      <div className="flex-1 min-h-0 px-2 pb-1 overflow-x-auto overflow-y-hidden scroll-none flex items-end gap-2 justify-center">
        {s.phase === "mulligan" && s.active === viewer ? (
          <div className="flex flex-col items-center gap-3 w-full pb-2">
            <p className="text-sm text-muted text-center px-4">
              Keep these four, or return them to the lattice once.
            </p>
            <div className="flex gap-2 overflow-x-auto px-2">
              {vPl.hand.map((id) => (
                <CardFace key={id} cardId={s.cards[id]!.cardId} inst={s.cards[id]} size="sm" />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => act({ type: "mulligan", keep: false })} disabled={s.mulliganUsed[viewer]}>
                Redraw
              </Button>
              <Button onClick={() => act({ type: "mulligan", keep: true })}>Keep</Button>
            </div>
          </div>
        ) : (
          vPl.hand.map((id) => {
            const inst = s.cards[id]!;
            const playable = legal.some((a) => a.type === "play" && a.iid === id);
            return (
              <CardFace
                key={id}
                cardId={inst.cardId}
                inst={inst}
                size="sm"
                selected={sel === id}
                dim={!playable && s.phase === "main"}
                onClick={() => {
                  const playable = legal.some((a) => a.type === "play" && a.iid === id);
                  if (playable) tryPlay(id);
                  else setInspect(id);
                }}
              />
            );
          })
        )}
      </div>

      <footer className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 bg-surface/80 hairline border-x-0 border-b-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={heroClick}
            className="flex items-center gap-2 rounded-[14px] bg-raised hairline px-2 py-1.5 min-w-0"
          >
            <div className="size-9 rounded-full overflow-hidden shrink-0">
              <Sigil id={vPl.championId} />
            </div>
            <div className="min-w-0 text-left">
              <div className="font-display text-sm truncate">{CHAMP_BY_ID[vPl.championId]?.name}</div>
              <div className="text-[10px] text-muted truncate">
                {CHAMP_BY_ID[vPl.championId]?.abilityName} · {CHAMP_BY_ID[vPl.championId]?.abilityCost}
              </div>
            </div>
          </button>
          <div className="ml-auto text-right">
            <div className="tabular text-xl leading-none">{vPl.life}</div>
            <div className="tabular text-xs text-accent">
              {manaAvail(vPl)}/{manaPool(vPl)}
            </div>
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => setLogOpen(true)}>
            <BookOpen className="size-3.5" />
            Log
          </Button>
          {s.phase === "main" && s.active === viewer && (
            <>
              {!vPl.combatUsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => act({ type: "beginCombat" })}
                  disabled={locked}
                >
                  <Swords className="size-3.5" />
                  Assault
                </Button>
              )}
              <Button size="sm" className="flex-1" onClick={() => act({ type: "endTurn" })} disabled={locked}>
                End dawn
              </Button>
            </>
          )}
          {s.phase === "attack" && s.active === viewer && (
            <Button size="sm" className="flex-1" onClick={() => act({ type: "confirmAttack" })}>
              Confirm assault
            </Button>
          )}
          {s.phase === "block" && s.humans[oppV === s.active ? viewer : viewer] && viewer !== s.active && (
            <Button size="sm" className="flex-1" onClick={() => act({ type: "confirmBlock" })}>
              <Shield className="size-3.5" />
              Confirm seals
            </Button>
          )}
          {s.phase === "block" && hotseat && viewer !== s.active && (
            <Button size="sm" className="flex-1" onClick={() => act({ type: "confirmBlock" })}>
              Confirm seals
            </Button>
          )}
          {s.phase === "block" && !hotseat && s.humans[you] && s.active !== you && (
            <Button size="sm" className="flex-1" onClick={() => act({ type: "confirmBlock" })}>
              Confirm seals
            </Button>
          )}
        </div>
      </footer>

      {pending && (
        <div className="absolute top-16 left-0 right-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-raised hairline rounded-full px-3 py-1.5 text-xs flex items-center gap-2">
            Choose a target
            <button type="button" onClick={() => { setPending(null); setTargetKind("none"); }}>
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {targetKind === "allyGrave" && pending && (
        <div className="absolute inset-x-0 bottom-28 mx-3 rounded-[16px] bg-raised hairline p-3 max-h-40 overflow-auto">
          <div className="text-xs text-muted mb-2">Lattice Archive</div>
          <div className="flex gap-2">
            {legalTargets(s, viewer, "allyGrave").map((id) => (
              <CardFace key={id} cardId={s.cards[id]!.cardId} size="xs" onClick={() => onTarget(id)} />
            ))}
          </div>
        </div>
      )}

      {heroChoice && (
        <div className="absolute inset-0 scrim flex items-end sm:items-center justify-center p-4 z-20">
          <div className="w-full max-w-sm rounded-[24px] bg-surface hairline p-4">
            <h3 className="font-display text-xl mb-2">Weigh</h3>
            <div className="flex flex-col gap-2">
              {CHAMP_BY_ID[vPl.championId]?.abilityChoices?.map((c, i) => (
                <Button
                  key={c.label}
                  variant="ghost"
                  onClick={() => {
                    const kind = needsTarget(c.effects);
                    if (kind === "none") act({ type: "hero", choice: i });
                    else {
                      setHeroChoice(false);
                      setPending({ type: "hero", choice: i });
                      setTargetKind(kind);
                    }
                  }}
                >
                  {c.label}
                </Button>
              ))}
              <Button variant="quiet" onClick={() => setHeroChoice(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {inspect && (
        <div className="absolute inset-0 scrim z-20 flex items-center justify-center p-4" onClick={() => setInspect(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            {inspect.startsWith("hero-") ? (
              <HeroCard id={s.players[Number(inspect.slice(5)) as 0 | 1].championId} />
            ) : s.cards[inspect] ? (
              <CardFace cardId={s.cards[inspect]!.cardId} inst={s.cards[inspect]} size="md" />
            ) : null}
          </div>
        </div>
      )}

      {logOpen && (
        <div className="absolute inset-0 scrim z-20 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md max-h-[70vh] overflow-auto rounded-[24px] bg-surface hairline p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-xl">Lattice log</h3>
              <Button variant="quiet" size="icon" onClick={() => setLogOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <ol className="text-sm text-muted space-y-1">
              {s.log.slice().reverse().map((e, i) => (
                <li key={i}>{e.t}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {s.winner !== null && (
        <div className="absolute inset-0 scrim z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-[24px] bg-surface hairline p-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Lattice closed</p>
            <h2 className="font-display text-3xl mt-2">
              {hotseat
                ? `${s.players[s.winner].name} holds`
                : s.winner === you
                  ? "You hold the lattice"
                  : "The lattice falls"}
            </h2>
            <p className="text-sm text-muted mt-2">{s.winReason}</p>
            <Button className="mt-6 w-full" onClick={() => onExit(s.winner === you ? "win" : "lose", s)}>
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function HeroCard({ id }: { id: string }) {
  const c = CHAMP_BY_ID[id];
  if (!c) return null;
  const tint = champTint(id);
  return (
    <div className="w-[240px] rounded-[20px] bg-surface hairline overflow-hidden">
      <div className="h-28">
        <Sigil id={id} />
      </div>
      <div className="p-4">
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted">{c.epithet}</div>
        <h3 className="font-display text-2xl" style={{ color: tint }}>
          {c.name}
        </h3>
        <p className="text-xs text-muted mt-2">{c.passiveName}: {c.passiveText}</p>
        <p className="text-xs mt-2">
          {c.abilityName} ({c.abilityCost}): {c.abilityText}
        </p>
      </div>
    </div>
  );
}
