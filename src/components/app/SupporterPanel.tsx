import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, KeyRound, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudioChip, StudioPanel } from "@/components/app/StudioUI";
import { cn } from "@/lib/utils";

/* ── Supporter access ────────────────────────────────────────────────────
   The arcade serves /games/lygo-gate.js on every game page: a donation
   reminder every ten minutes, plus a monthly code that switches the
   reminders off in the browser that entered it. Until now the only door was
   injected into the page as a fixed bar, which on this app (a compiled
   bundle with no menu root to anchor to) landed on top of the match footer
   and swallowed the clicks meant for End dawn / Confirm.

   So the app owns the UI: this pane is the door, reading and writing the
   gate's own state through window.LYGO_GATE. The check itself stays where it
   belongs — SHA-256 in the gate module, plaintext never stored, localStorage
   keeps {label, until, at} and nothing else. Nothing about the game is
   withheld either way, which is what the copy on the pane says. */

type GateState = { unlocked: boolean; label: string; until: string; lapsed: boolean };

type Gate = {
  state: () => GateState;
  unlock: (code: string) => Promise<{ ok: boolean; why?: string; label?: string; until?: string }>;
  relock: () => void;
  suppress?: (ms: number) => void;
  hold?: (on: boolean) => void;
  embed?: boolean;
  version?: string;
};

declare global {
  interface Window {
    LYGO_GATE?: Gate;
  }
}

const EMPTY: GateState = { unlocked: false, label: "", until: "", lapsed: false };

function gate(): Gate | undefined {
  return typeof window === "undefined" ? undefined : window.LYGO_GATE;
}

/** The gate's state, kept live by its own `lygo-supporter` event. */
export function useSupporterState() {
  const [state, setState] = useState<GateState>(EMPTY);
  const [present, setPresent] = useState(false);

  useEffect(() => {
    const g = gate();
    setPresent(!!g);
    if (!g) return;
    const read = () => {
      try {
        setState(g.state());
      } catch {
        setState(EMPTY);
      }
    };
    read();
    const onEvent = (ev: Event) => {
      const detail = (ev as CustomEvent<GateState>).detail;
      if (detail && typeof detail.unlocked === "boolean") setState(detail);
      else read();
    };
    document.addEventListener("lygo-supporter", onEvent);
    const t = window.setTimeout(read, 600);
    return () => {
      document.removeEventListener("lygo-supporter", onEvent);
      window.clearTimeout(t);
    };
  }, []);

  return { state, present };
}

export function SupporterPane({ onDone }: { onDone?: () => void }) {
  const { state, present } = useSupporterState();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    const g = gate();
    if (!g) return;
    const trimmed = code.trim();
    if (!trimmed) {
      setMsg("Type the code from the Patreon post — it looks like LYGO-2609-XXXX-XXXX.");
      return;
    }
    setBusy(true);
    try {
      const res = await g.unlock(trimmed);
      if (res.ok) {
        setCode("");
        setMsg(
          "Unlocked — the reminders stay off in this browser" +
            (res.until ? ` through ${res.until}` : "") +
            ". Thank you for keeping the lattice lit.",
        );
      } else {
        setMsg(res.why ?? "That code was not accepted.");
      }
    } catch {
      setMsg("This browser will not hash outside a secure page (https). The live games are https.");
    } finally {
      setBusy(false);
    }
  }, [code]);

  const status = state.lapsed
    ? { tone: "danger" as const, text: `Lapsed ${state.until}` }
    : state.unlocked
      ? { tone: "accent" as const, text: state.until ? `Active through ${state.until}` : "Active · permanent" }
      : { tone: "muted" as const, text: "No code in this browser" };

  return (
    <div className="space-y-4 max-w-xl">
      <StudioPanel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-[12px] border border-accent/25 bg-accent/10 text-accent">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="studio-eyebrow">Supporter access</p>
              <h3 className="font-display text-2xl mt-0.5">Keep the lattice lit</h3>
            </div>
          </div>
          <StudioChip tone={status.tone}>{status.text}</StudioChip>
        </div>

        <p className="mt-3 text-sm text-muted">
          One monthly code from the Patreon post switches the donation reminders off in this browser. Every mode,
          every deck and the ladder play exactly the same without it — this is a thank-you, not a locked door.
        </p>

        {!present ? (
          <p className="mt-4 rounded-[14px] bg-raised hairline p-3 text-xs text-subtle">
            The supporter gate loads with the arcade at chatagent.ca. This standalone build carries no reminders,
            so there is nothing here to switch off.
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Supporter code</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void submit();
                    }
                  }}
                  placeholder="LYGO-2609-XXXX-XXXX"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={state.unlocked || busy}
                  className={cn(
                    "tabular h-11 w-full rounded-[12px] bg-raised hairline px-3 text-sm uppercase outline-none",
                    "focus:ring-2 focus:ring-accent/50 disabled:opacity-55",
                  )}
                />
              </label>
              {state.unlocked ? (
                <Button
                  variant="ghost"
                  className="h-11"
                  onClick={() => {
                    gate()?.relock();
                    setMsg("Locked again in this browser. The reminders will come back.");
                  }}
                >
                  <Lock className="size-4" />
                  Lock again
                </Button>
              ) : (
                <Button className="h-11" onClick={() => void submit()} disabled={busy}>
                  <KeyRound className="size-4" />
                  {busy ? "Checking…" : "Unlock"}
                </Button>
              )}
            </div>
            <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs text-muted">
              {msg}
            </p>
          </>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <a
            className="inline-flex items-center gap-1 text-accent underline-offset-4 hover:underline"
            href="https://www.patreon.com/Excavationpro/posts/chatagent-ca-api-170485961"
            target="_blank"
            rel="noopener"
          >
            <BadgeCheck className="size-3.5" />
            Get this month&apos;s code — Patreon post
          </a>
          <span className="text-subtle">
            Checked in your browser; only the label and expiry date are stored.
          </span>
        </div>
      </StudioPanel>

      <ul className="space-y-1.5 text-xs text-subtle">
        <li>· Codes rotate monthly and run to the 5th of the month after, so nobody is locked out on rotation day.</li>
        <li>· A code entered anywhere on chatagent.ca quiets the reminders everywhere — same browser.</li>
        <li>· The reminder inside a match is held back: it can only appear on the menus, never over a live board.</li>
      </ul>

      {onDone && (
        <Button variant="quiet" size="sm" onClick={onDone}>
          Back to the lattice
        </Button>
      )}
    </div>
  );
}

/** One-line door for the title screen / menus. */
export function SupporterDoor({ onOpen }: { onOpen: () => void }) {
  const { state, present } = useSupporterState();
  if (!present) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex items-center gap-2 rounded-full bg-raised hairline px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
    >
      <Sparkles className="size-3.5 text-accent" />
      {state.unlocked
        ? `Supporter${state.until ? ` · through ${state.until}` : " · permanent"}`
        : "Supporter access — this month's code"}
    </button>
  );
}
