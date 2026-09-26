import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Heart, Shield, Swords, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MuteButton, RadioToggle } from "@/components/game/SoundControls";
import { CARD_BY_ID, CHAMP_BY_ID } from "@/lib/game/catalog";
import { pickAction, takeAiTurn } from "@/lib/game/ai";
import {
  applyAction,
  canDeclareAttack,
  champOf,
  combatPreview,
  currentPower,
  getLegalActions,
  isLegalAction,
  legalTargets,
  manaAvail,
  manaPool,
  maxLifeOf,
  playBlockReason,
  playCost,
} from "@/lib/game/engine";
import { FACE_TARGET, allowsFace, needsTarget, targetPrompt } from "@/lib/game/fx";
import { sfxPlay } from "@/lib/game/audio";
import type { Action, Difficulty, MatchState, TargetKind } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { useRadioOpen } from "@/lib/radio-ui";
import { RadioDock, RADIO_DROP } from "@/components/app/RadioDock";
import { BoardMinion, CardFace } from "./CardFace";
import { StudioChip, StudioManaPips, StudioStats } from "@/components/app/StudioUI";
import { ChampPortrait, champTint } from "./Sigil";

export function MatchView({
  initial,
  difficulty,
  onExit,
  banner,
  shakeOn,
  muted,
  onToggleMute,
  nextLabel,
  onNext,
  onRetry,
  radioVolume,
  radioEnabled,
  onRadioVolume,
  onRadioEnabled,
}: {
  initial: MatchState;
  difficulty: Difficulty;
  onExit: (result: "win" | "lose" | "quit", state: MatchState) => void;
  banner?: string;
  shakeOn: boolean;
  muted: boolean;
  onToggleMute: () => void;
  nextLabel?: string;
  onNext?: () => void;
  onRetry?: () => void;
  radioVolume: number;
  radioEnabled: boolean;
  onRadioVolume: (v: number) => void;
  onRadioEnabled: (on: boolean) => void;
}) {
  const radioOpen = useRadioOpen();
  const [s, setS] = useState(initial);
  const [sel, setSel] = useState<string | null>(null);
  const [inspect, setInspect] = useState<string | null>(null);
  const [targetKind, setTargetKind] = useState<TargetKind>("none");
  const [pending, setPending] = useState<Action | null>(null);
  const [heroChoice, setHeroChoice] = useState(false);
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [hint, setHint] = useState("");
  const [blockFocus, setBlockFocus] = useState<string | null>(null);
  const [you] = useState<0 | 1>(initial.humans[0] ? 0 : initial.humans[1] ? 1 : 0);
  const thinking = useRef(false);
  const seenBoard = useRef<Set<string>>(new Set());
  const hintTimer = useRef<number>(0);
  const suppressBoard = useRef(false);
  const boardRef = useRef<HTMLDivElement | null>(null);

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
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      setS((cur) => {
        if (cur.winner !== null) return cur;
        const who: 0 | 1 = cur.phase === "block" ? (cur.active === 0 ? 1 : 0) : cur.active;
        if (cur.humans[who]) return cur;
        try {
          if (cur.phase === "block") {
            let n = cur;
            let g = 0;
            while (n.phase === "block" && n.winner === null && g++ < 12) {
              const actn = pickAction(n, difficulty);
              n = applyAction(n, actn);
              if (actn.type === "confirmBlock") break;
            }
            if (n.phase === "block") n = applyAction(n, { type: "confirmBlock" });
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
    return () => {
      cancelled = true;
      thinking.current = false;
      window.clearTimeout(t);
    };
  }, [s, difficulty]);

  useEffect(() => {
    if (!locked) return;
    const t = window.setTimeout(() => {
      thinking.current = false;
      setLocked(false);
    }, 2800);
    return () => window.clearTimeout(t);
  }, [locked]);

  useEffect(() => {
    for (const id of s.players[viewer].board) seenBoard.current.add(id);
  }, [s.players, viewer]);

  /* Your hand sits at the bottom of the pan area, so when a full board
     overflows the region the cards a player needs are the part that starts
     hidden. Always rest on the bottom: the opponent's row is what pans out of
     sight, never the hand or your own seals.

     Same effect sizes the board: `--board-zoom` is the ratio of the space the
     shell gives the board to what the board actually needs, so a short window
     scales every card instead of stacking rows past the action strip. It is
     measured, never guessed — scrollHeight is in the board's own units, so the
     ratio is stable however the current zoom already sits. */
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const fit = () => {
      const pageAvail = el.getBoundingClientRect().height;
      const natural = el.scrollHeight;
      if (!pageAvail || !natural) return;
      const z = Math.max(0.72, Math.min(1, pageAvail / natural));
      document.documentElement.style.setProperty("--board-zoom", z.toFixed(3));
      el.scrollTop = el.scrollHeight;
    };
    fit();
    const settle = window.setTimeout(fit, 80); // after art and fonts land
    window.addEventListener("resize", fit);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", fit);
    };
  }, [s, viewer]);

  function flash(msg: string) {
    setHint(msg);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(""), 1800);
  }

  function clearAim() {
    setPending(null);
    setTargetKind("none");
    setSel(null);
    setHeroChoice(false);
  }

  function act(a: Action) {
    if (s.winner !== null) return;
    if (locked && a.type !== "mulligan") {
      flash("The lattice is still thinking…");
      return;
    }
    if (!isLegalAction(s, a)) {
      sfxPlay("error");
      if (a.type === "play") flash(playBlockReason(s, viewer, a.iid) ?? "That play isn't legal");
      else if (a.type === "hero") flash("Champion ability isn't ready");
      else if (a.type === "beginCombat") flash("No minion can assault");
      else flash("That action isn't legal");
      return;
    }
    const next = applyAction(s, a);
    if (a.type === "play") sfxPlay("play");
    if (a.type === "play") {
      suppressBoard.current = true;
      window.setTimeout(() => {
        suppressBoard.current = false;
      }, 400);
    }
    if (a.type === "confirmAttack") sfxPlay("attack");
    if (a.type === "endTurn") sfxPlay("mana");
    if (a.type === "hero") sfxPlay("mana");
    if (next.players[you].life < s.players[you].life && shakeOn) {
      setShake(true);
      sfxPlay("hit");
      window.setTimeout(() => setShake(false), 420);
    }
    setS(next);
    clearAim();
    setInspect(null);
    if (a.type === "beginCombat") setBlockFocus(null);
    if (a.type === "confirmAttack") {
      const first = next.attackers.find((id) => !next.blocks[id]) ?? next.attackers[0] ?? null;
      setBlockFocus(first);
    }
  }

  function tryPlay(iid: string) {
    if (suppressBoard.current) return;
    if (locked) {
      flash("Wait for the lattice");
      return;
    }
    if (s.phase !== "main" || s.active !== viewer) {
      setInspect(iid);
      return;
    }
    const def = CARD_BY_ID[s.cards[iid]?.cardId ?? ""];
    if (!def) return;
    const plays = legal.filter((a) => a.type === "play" && a.iid === iid);
    if (!plays.length) {
      sfxPlay("error");
      flash(playBlockReason(s, viewer, iid) ?? "Cannot play");
      setInspect(iid);
      return;
    }
    const fx = def.onPlay;
    const kind = needsTarget(fx);
    const ts = legalTargets(s, viewer, kind, fx).filter((id) => id !== FACE_TARGET);
    const face = plays.some((a) => a.type === "play" && a.target === FACE_TARGET);
    const untargeted = plays.some((a) => a.type === "play" && !a.target);

    if (kind === "none" || (ts.length === 0 && !face && untargeted)) {
      act({ type: "play", iid });
      return;
    }
    if (ts.length === 0 && face) {
      act({ type: "play", iid, target: FACE_TARGET });
      return;
    }
    if (ts.length === 1 && !face) {
      act({ type: "play", iid, target: ts[0] });
      return;
    }
    setPending({ type: "play", iid });
    setTargetKind(kind);
    setSel(iid);
    flash(targetPrompt(kind, face || allowsFace(fx)));
  }

  function onTarget(id: string) {
    if (!pending) return;
    if (pending.type === "play") act({ type: "play", iid: pending.iid, target: id, choice: pending.choice });
    if (pending.type === "hero") act({ type: "hero", target: id, choice: pending.choice });
  }

  function heroClick() {
    if (locked || s.phase !== "main" || s.active !== viewer) {
      setInspect(`hero-${viewer}`);
      return;
    }
    const h = champOf(s, viewer);
    if (s.players[viewer].heroUsed) {
      flash("Already used this dawn");
      setInspect(`hero-${viewer}`);
      return;
    }
    if (manaAvail(s.players[viewer]) < h.abilityCost) {
      sfxPlay("error");
      flash(`Needs ${h.abilityCost} mana`);
      return;
    }
    if (h.abilityChoices) {
      setHeroChoice(true);
      return;
    }
    const kind = needsTarget(h.ability);
    const heroes = legal.filter((a) => a.type === "hero");
    if (!heroes.length) {
      sfxPlay("error");
      flash("Champion ability isn't ready");
      return;
    }
    if (kind === "none") {
      act({ type: "hero" });
      return;
    }
    const ts = legalTargets(s, viewer, kind, h.ability);
    const minionTs = ts.filter((id) => id !== FACE_TARGET);
    if (minionTs.length === 0 && ts.includes(FACE_TARGET)) {
      act({ type: "hero", target: FACE_TARGET });
      return;
    }
    if (minionTs.length === 1 && !ts.includes(FACE_TARGET)) {
      act({ type: "hero", target: minionTs[0] });
      return;
    }
    if (!ts.length) {
      act({ type: "hero" });
      return;
    }
    setPending({ type: "hero" });
    setTargetKind(kind);
    flash(targetPrompt(kind, allowsFace(h.ability)));
  }

  function clickOwnMinion(id: string) {
    if (suppressBoard.current) return;
    const inst = s.cards[id];
    if (!inst) return;
    const targeting = pending && (targetKind === "allyMinion" || targetKind === "anyMinion");
    if (targeting) {
      onTarget(id);
      return;
    }
    if (s.phase === "attack" && s.active === viewer) {
      act({ type: "toggleAttacker", iid: id });
      return;
    }
    if (s.phase === "block" && viewer !== s.active) {
      const atk = blockFocus ?? s.attackers.find((a) => !s.blocks[a]) ?? s.attackers[0];
      if (atk) {
        if (s.blocks[atk] === id) act({ type: "setBlock", attacker: atk, blocker: null });
        else act({ type: "setBlock", attacker: atk, blocker: id });
      }
      return;
    }
    if (s.phase === "main" && s.active === viewer && !s.players[viewer].combatUsed && canDeclareAttack(s, inst)) {
      let cur = applyAction(s, { type: "beginCombat" });
      for (const aid of [...cur.attackers]) {
        if (aid !== id) cur = applyAction(cur, { type: "toggleAttacker", iid: aid });
      }
      if (!cur.attackers.includes(id)) {
        cur = applyAction(cur, { type: "toggleAttacker", iid: id });
      }
      setS(cur);
      clearAim();
      sfxPlay("attack");
      flash("Tap others to join — then confirm assault");
      return;
    }
    setInspect(id);
  }

  function clickEnemyMinion(id: string) {
    if (suppressBoard.current && !(pending && (targetKind === "enemyMinion" || targetKind === "anyMinion"))) return;
    const targeting = pending && (targetKind === "enemyMinion" || targetKind === "anyMinion");
    if (targeting) {
      onTarget(id);
      return;
    }
    if (s.phase === "block" && viewer !== s.active && s.attackers.includes(id)) {
      setBlockFocus(id);
      flash("Choose a seal to block with");
      return;
    }
    setInspect(id);
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
  const pendingFx =
    pending?.type === "play"
      ? CARD_BY_ID[s.cards[pending.iid]?.cardId ?? ""]?.onPlay ?? []
      : pending?.type === "hero"
        ? champOf(s, viewer).ability
        : [];
  const faceAim = !!pending && allowsFace(pendingFx) && (targetKind === "enemyMinion" || targetKind === "anyMinion");
  const canAssault = !vPl.combatUsed && vPl.board.some((id) => {
    const m = s.cards[id];
    return m && canDeclareAttack(s, m);
  });

  return (
    <div className={cn("app-shell relative flex flex-col bg-bg text-fg overflow-hidden", shake && "shake-board")}>
      <header className="flex shrink-0 items-center gap-1.5 px-2.5 pt-[max(0.4rem,env(safe-area-inset-top))] pb-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => onExit("quit", s)}
          aria-label="Leave the match"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted truncate">
            {banner ?? "Skirmish"}
          </div>
          <div className="font-display text-base leading-none truncate">{oPl.name}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => setLogOpen(true)}
          aria-label="Lattice log"
        >
          <BookOpen className="size-4" />
        </Button>
        <MuteButton muted={muted} onToggle={onToggleMute} className="size-9" />
        <RadioToggle className="size-9" />
        <button
          type="button"
          onClick={() => {
            if (faceAim) onTarget(FACE_TARGET);
            else setInspect(`hero-${oppV}`);
          }}
          className={cn(
            "flex items-center gap-2 rounded-[12px] bg-raised hairline px-2 py-1",
            faceAim && "target-pulse",
          )}
        >
          <div className="size-7 rounded-full overflow-hidden shrink-0">
            <ChampPortrait id={oPl.championId} />
          </div>
          <LifeMeter
            life={oPl.life}
            max={maxLifeOf(s, oppV)}
            mana={`${manaAvail(oPl)}/${oPl.permanentMana}`}
            align="right"
            pips={{ available: manaAvail(oPl), permanent: oPl.permanentMana }}
          />
        </button>
      </header>

      {/* The dock hangs under the button that opened it, never over the action
          strip where End dawn / Confirm / Keep live. */}
      {radioOpen && (
        <RadioDock
          className={RADIO_DROP}
          volume={radioVolume}
          enabled={radioEnabled}
          onVolume={onRadioVolume}
          onEnabled={onRadioEnabled}
        />
      )}

      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-1 text-[10px] text-muted">
        <span className="flex items-center gap-2 min-w-0">
          <StudioChip tone={yourTurn ? "accent" : "muted"}>Dawn {s.turn}</StudioChip>
          <StudioChip tone={yourTurn ? "ivory" : "muted"}>{phaseLabel}</StudioChip>
        </span>
        <span className="tabular truncate text-right">
          {s.phase === "main"
            ? `Hand ${oPl.hand.length} · Library ${oPl.library.length} · Archive ${oPl.gy.length}`
            : (s.phase === "attack" || s.phase === "block") && s.attackers.length > 0
              ? `${s.attackers.reduce((n, id) => n + combatPreview(s, id, s.blocks[id]).face, 0)} to HP · ${s.attackers.length} assaulting`
              : phaseLabel}
        </span>
      </div>

      {/* The board pans and scales as one piece; the action strip below it
          never moves, so End dawn / Confirm / Keep are always reachable. */}
      <div ref={boardRef} className="board-zoom flex-1 min-h-0 overflow-y-auto scroll-none flex flex-col">
      <div
        className={cn(
          "flex shrink-0 items-end justify-center gap-1.5 overflow-x-auto scroll-none px-3",
          oPl.board.length === 0 ? "min-h-[30px] py-1" : "min-h-[116px] py-2",
        )}
      >
        {oPl.board.length === 0 && (
          <span className="text-subtle text-[11px] self-center">Empty field</span>
        )}
        {oPl.board.map((id) => {
          const inst = s.cards[id]!;
          const targeting =
            pending &&
            (targetKind === "enemyMinion" || targetKind === "anyMinion");
          const blkId = Object.entries(s.blocks).find(([, b]) => b === id)?.[0];
          const prev = s.attackers.includes(id)
            ? combatPreview(s, id, s.blocks[id])
            : blkId
              ? combatPreview(s, blkId, id)
              : undefined;
          return (
            <BoardMinion
              key={id}
              inst={inst}
              power={currentPower(s, inst)}
              attacking={s.attackers.includes(id)}
              blocking={Object.values(s.blocks).includes(id)}
              preview={prev}
              targetable={!!targeting || (s.phase === "block" && (blockFocus === id || s.attackers.includes(id)))}
              onClick={() => clickEnemyMinion(id)}
            />
          );
        })}
      </div>

      <div className="dawn-band mx-3 my-1 flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span
          className={cn(
            "text-[10px] uppercase tracking-[0.2em]",
            locked ? "text-subtle" : yourTurn ? "text-accent" : "text-muted",
          )}
        >
          {locked
            ? "The lattice thinks…"
            : hotseat
              ? `${s.players[s.active].name} · ${s.active === 1 ? "Seat II" : "Seat I"}`
              : yourTurn
                ? "Your dawn"
                : `${s.players[s.active].name}'s dawn`}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div
        className={cn(
          "flex shrink-0 items-start justify-center gap-1.5 overflow-x-auto scroll-none px-3",
          vPl.board.length === 0 ? "min-h-[30px] py-1" : "min-h-[124px] py-2",
        )}
      >
        {vPl.board.length === 0 && (
          <span className="text-subtle text-[11px] self-center">Summon to the lattice</span>
        )}
        {vPl.board.map((id) => {
          const inst = s.cards[id]!;
          const targeting =
            pending &&
            (targetKind === "allyMinion" || targetKind === "anyMinion");
          const prev = s.attackers.includes(id)
            ? combatPreview(s, id, s.blocks[id])
            : undefined;
          return (
            <BoardMinion
              key={id}
              inst={inst}
              mine
              power={currentPower(s, inst)}
              attacking={s.attackers.includes(id)}
              blocking={Object.values(s.blocks).includes(id)}
              preview={prev}
              targetable={!!targeting}
              fresh={!seenBoard.current.has(id)}
              onClick={() => clickOwnMinion(id)}
            />
          );
        })}
      </div>

      <div className="flex shrink-0 items-end justify-center gap-2 overflow-x-auto overflow-y-hidden scroll-none px-2 pb-1.5 pt-1 min-h-[204px] mt-auto">
        {vPl.hand.length === 0 && (
          <span className="text-subtle text-xs self-center">Hand empty</span>
        )}
        {vPl.hand.map((id) => {
          const inst = s.cards[id]!;
          const canPlay = legal.some((a) => a.type === "play" && a.iid === id);
          return (
            <CardFace
              key={id}
              cardId={inst.cardId}
              inst={inst}
              size="sm"
              selected={sel === id}
              dim={!canPlay && s.phase === "main"}
              playable={canPlay && s.phase === "main"}
              playCost={playCost(s, viewer, id)}
              onClick={() => {
                if (sel === id && pending) {
                  clearAim();
                  return;
                }
                if (canPlay) tryPlay(id);
                else {
                  const why = playBlockReason(s, viewer, id);
                  if (why && s.phase === "main" && s.active === viewer) flash(why);
                  setInspect(id);
                }
              }}
            />
          );
        })}
      </div>
      </div>

      {/* The action strip is pinned: it is the only place phase actions live,
          so nothing a player must press can be scrolled off or covered. */}
      <footer className="shrink-0 bg-surface/80 hairline border-x-0 border-b-0 px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={heroClick}
            className="flex items-center gap-2 rounded-[14px] bg-raised hairline px-2 py-1 min-w-0"
          >
            <div className="size-8 rounded-full overflow-hidden shrink-0">
              <ChampPortrait id={vPl.championId} />
            </div>
            <div className="min-w-0 text-left">
              <div className="font-display text-sm truncate">{CHAMP_BY_ID[vPl.championId]?.name}</div>
              <div className="text-[10px] text-muted truncate">
                {CHAMP_BY_ID[vPl.championId]?.abilityName} · {CHAMP_BY_ID[vPl.championId]?.abilityCost}
              </div>
            </div>
          </button>
          <div className="ml-auto">
            <LifeMeter
              life={vPl.life}
              max={maxLifeOf(s, viewer)}
              mana={`${manaAvail(vPl)}/${manaPool(vPl)}`}
              pips={{ available: manaAvail(vPl), permanent: vPl.permanentMana }}
              large
            />
          </div>
        </div>

        {s.phase === "mulligan" && s.active === viewer && (
          <p className="mt-1 text-[11px] text-muted text-center leading-snug">
            Keep these four, or return them to the lattice once. Both Champions start at {maxLifeOf(s, viewer)} HP.
          </p>
        )}
        {s.phase === "main" &&
          s.active === viewer &&
          !vPl.combatUsed &&
          !canAssault &&
          !vPl.hand.some((id) => legal.some((a) => a.type === "play" && a.iid === id)) && (
            <p className="mt-1 text-[11px] text-subtle text-center">
              Nothing in hand lands this dawn — end it and let the seal stack.
            </p>
          )}

        <div className="mt-1.5 flex items-stretch gap-2">
          {s.phase === "mulligan" && s.active === viewer && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => act({ type: "mulligan", keep: false })}
                disabled={s.mulliganUsed[viewer]}
              >
                Redraw
              </Button>
              <Button size="sm" className="flex-[2]" onClick={() => act({ type: "mulligan", keep: true })}>
                Keep these four
              </Button>
            </>
          )}

          {s.phase === "main" && s.active === viewer && (
            <>
              {!vPl.combatUsed && canAssault && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (!canAssault) {
                      flash("No minion is ready to assault");
                      return;
                    }
                    act({ type: "beginCombat" });
                    flash("Tap to hold a minion back — then confirm");
                  }}
                >
                  <Swords className="size-3.5" />
                  Assault
                </Button>
              )}
              <Button size="sm" className="flex-[2]" onClick={() => act({ type: "endTurn" })}>
                End dawn
              </Button>
            </>
          )}

          {s.phase === "attack" && s.active === viewer && (
            <Button size="sm" className="flex-1" onClick={() => act({ type: "confirmAttack" })}>
              {s.attackers.length ? `Confirm assault (${s.attackers.length})` : "Pass assault"}
            </Button>
          )}

          {s.phase === "block" && s.humans[viewer] && viewer !== s.active && (
            <Button size="sm" className="flex-1" onClick={() => act({ type: "confirmBlock" })}>
              <Shield className="size-3.5" />
              Confirm seals
            </Button>
          )}

          {!(
            (s.phase === "mulligan" && s.active === viewer) ||
            (s.phase === "main" && s.active === viewer) ||
            (s.phase === "attack" && s.active === viewer) ||
            (s.phase === "block" && s.humans[viewer] && viewer !== s.active)
          ) && (
            <p className="flex-1 self-center text-center text-[11px] text-subtle">
              {locked ? "The lattice thinks…" : `${s.players[s.active].name} is playing…`}
            </p>
          )}
        </div>
      </footer>

      {pending && (
        <div className="absolute top-16 left-0 right-0 flex justify-center pointer-events-none z-10">
          <div className="pointer-events-auto bg-raised hairline rounded-full px-3 py-1.5 text-xs flex items-center gap-2">
            {targetPrompt(targetKind, faceAim)}
            <button type="button" onClick={clearAim} aria-label="Cancel target">
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {hint && !pending && (
        <div className="absolute top-16 left-0 right-0 flex justify-center pointer-events-none z-10">
          <div className="bg-raised hairline rounded-full px-3 py-1.5 text-xs">{hint}</div>
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
              <CardFace
                cardId={s.cards[inspect]!.cardId}
                inst={s.cards[inspect]}
                size="md"
                power={currentPower(s, s.cards[inspect]!)}
                tough={s.cards[inspect]!.toughness}
              />
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
          <div className="result-plate w-full max-w-sm rounded-[24px] bg-surface hairline p-6 text-center shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)]">
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
                {s.winner === you || hotseat ? "Victory" : "Defeat"}
              </p>
              <h2 className="font-display text-4xl mt-2">
                {hotseat ? `${s.players[s.winner].name} wins` : s.winner === you ? "You win" : "You lose"}
              </h2>
              <p className="text-sm text-muted mt-2">{s.winReason || "A Champion reached 0 HP."}</p>
              <div className="mt-4">
                <StudioStats
                  items={[
                    { label: "Dawns", value: String(s.turn) },
                    { label: "Your HP", value: String(Math.max(0, s.players[you].life)) },
                    { label: "Foe HP", value: String(Math.max(0, s.players[you === 0 ? 1 : 0].life)) },
                  ]}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-left">
                {([0, 1] as const).map((p) => (
                  <div
                    key={p}
                    className={cn(
                      "rounded-[14px] bg-raised hairline p-3 flex items-center gap-2",
                      s.winner === p && "ring-1 ring-accent",
                    )}
                  >
                    <div className="size-9 rounded-full overflow-hidden shrink-0">
                      <ChampPortrait id={s.players[p].championId} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted">{p === you ? "You" : "Foe"}</div>
                      <div className="font-display text-base truncate">{s.players[p].name}</div>
                      <div className={cn("tabular text-xs", s.players[p].life <= 0 && "text-danger")}>
                        {Math.max(0, s.players[p].life)} HP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-2">
                {s.winner === you && onNext && nextLabel && (
                  <Button
                    size="lg"
                    onClick={() => {
                      onExit("win", s);
                      onNext();
                    }}
                  >
                    <Swords className="size-4" />
                    {nextLabel}
                  </Button>
                )}
                {s.winner !== you && onRetry && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      onExit("lose", s);
                      onRetry();
                    }}
                  >
                    Retry chapter
                  </Button>
                )}
                <Button
                  variant={s.winner === you && onNext ? "ghost" : "primary"}
                  className="w-full"
                  onClick={() => onExit(s.winner === you ? "win" : "lose", s)}
                >
                  {s.winner === you && onNext ? "Back to the campaign" : "Continue"}
                </Button>
              </div>
            </div>
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
    <div className="w-[248px] rounded-[20px] bg-surface hairline overflow-hidden">
      <div className="h-36">
        <ChampPortrait id={id} />
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

function LifeMeter({
  life,
  max,
  mana,
  align = "right",
  large,
  pips,
}: {
  life: number;
  max: number;
  mana: string;
  align?: "left" | "right";
  large?: boolean;
  pips?: { available: number; permanent: number };
}) {
  const pct = Math.max(0, Math.min(100, (life / Math.max(1, max)) * 100));
  const crit = life <= 5;
  const low = life <= 8;
  return (
    <div className={cn(align === "right" ? "text-right" : "text-left", "min-w-[4.75rem]")}>
      <div
        className={cn(
          "tabular font-medium flex items-baseline gap-1",
          align === "right" && "justify-end",
          large ? "text-xl leading-none" : "text-sm leading-none",
          crit && "text-danger",
        )}
      >
        <Heart className={cn("size-3 shrink-0", crit ? "text-danger" : "text-accent")} fill="currentColor" />
        {Math.max(0, life)}
        <span className="text-[10px] font-normal text-muted">HP</span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-[width] duration-200", crit ? "bg-danger" : low ? "bg-ivory" : "bg-accent")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className={cn(
          "mt-1 flex items-center gap-2",
          align === "right" ? "justify-end" : "justify-start",
        )}
      >
        {pips && <StudioManaPips available={pips.available} permanent={pips.permanent} large={large} />}
        <span className={cn("tabular text-[10px]", large ? "text-accent" : "text-muted")}>{mana} mana</span>
      </div>
    </div>
  );
}
