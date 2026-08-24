import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  Dices,
  Hammer,
  Map as MapIcon,
  Music,
  Settings,
  Swords,
  Trophy,
  Users,
  Volume2,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchView } from "@/components/game/MatchView";
import { CardFace } from "@/components/game/CardFace";
import { Sigil, champTint } from "@/components/game/Sigil";
import { MuteButton, SoundSwitch, VolumeRow } from "@/components/game/SoundControls";
import { MISSIONS } from "@/lib/game/campaign";
import { CARD_BY_ID, CARDS, CHAMP_BY_ID, CHAMPIONS, defaultList, deckIssues, KEYWORD_TEXT } from "@/lib/game/catalog";
import { createMatch } from "@/lib/game/engine";
import { forgeChampion } from "@/lib/game/procedural";
import {
  applyAudioSettings,
  resumeAudio,
  setMusicOn,
  setMusicVolume,
  setMuted,
  setSfxOn,
  setSfxVolume,
  sfxPlay,
  unlockAudio,
} from "@/lib/game/audio";
import type { ChampionDef, Difficulty, MatchState, Screen } from "@/lib/game/types";
import { defaultSave, loadSave, recordRanked, writeSave, type CustomDeck, type SaveData } from "@/lib/store/save";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const ALL_SEATS = CHAMPIONS.map((c) => c.id);

const MODES: { id: Screen; label: string; hint: string; icon: typeof Swords }[] = [
  { id: "campaign", label: "Campaign", hint: "Unlock the fifteen seats, one chapter at a time", icon: MapIcon },
  { id: "skirmish", label: "Skirmish", hint: "Any council deck vs AI", icon: Swords },
  { id: "ranked", label: "Ranked", hint: "All decks · local ladder", icon: Trophy },
  { id: "hotseat", label: "Hot-seat", hint: "Two players, one device", icon: Users },
  { id: "lobby", label: "Lattice Link", hint: "Casual peer lobby", icon: Wifi },
  { id: "builder", label: "Deckwright", hint: "Thirty cards, one Champion", icon: Hammer },
  { id: "forge", label: "Lattice Forge", hint: "Generate a new seal", icon: Dices },
  { id: "codex", label: "Codex", hint: "Rules, seats, keywords", icon: BookOpen },
];

export function GameApp() {
  const [save, setSave] = useState<SaveData>(defaultSave);
  const [hydrated, setHydrated] = useState(() => typeof window !== "undefined");
  const [screen, setScreen] = useState<Screen>("title");
  const [match, setMatch] = useState<MatchState | null>(null);
  const [matchBanner, setMatchBanner] = useState("Skirmish");
  const [matchMode, setMatchMode] = useState<"skirmish" | "campaign" | "ranked" | "hotseat" | "forge">("skirmish");
  const [missionId, setMissionId] = useState<string | null>(null);
  const [pickA, setPickA] = useState("lyra");
  const [pickB, setPickB] = useState("d9ra");
  const [nameDraft, setNameDraft] = useState("");
  const [forgeName, setForgeName] = useState("");
  const [forged, setForged] = useState<ReturnType<typeof forgeChampion> | null>(null);
  const [buildChamp, setBuildChamp] = useState("lyra");
  const [buildCounts, setBuildCounts] = useState<Record<string, number>>({});
  const [buildName, setBuildName] = useState("My Seal");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const s = loadSave();
    setSave(s);
    setNameDraft(s.playerName);
    applyAudioSettings(s.settings);
    setHydrated(true);
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    const onVis = () => {
      if (document.visibilityState === "hidden") writeSave(s);
      else resumeAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (hydrated) writeSave(save);
  }, [save, hydrated]);

  function enter() {
    unlockAudio();
    applyAudioSettings(save.settings);
    if (!save.settings.muted) sfxPlay("ui");
    if (!save.playerName.trim() && nameDraft.trim()) {
      setSave((x) => ({ ...x, playerName: nameDraft.trim().slice(0, 24) }));
    }
    setScreen("title");
  }

  function patchSettings(p: Partial<SaveData["settings"]>) {
    setSave((x) => {
      const settings = { ...x.settings, ...p };
      applyAudioSettings(settings);
      return { ...x, settings };
    });
  }

  function toggleSound() {
    const next = !save.settings.muted;
    unlockAudio();
    setMuted(next);
    patchSettings({ muted: next });
    if (!next) sfxPlay("ui");
  }

  function patch(p: Partial<SaveData>) {
    setSave((x) => ({ ...x, ...p }));
  }

  function begin(
    a: string,
    b: string,
    humans: [boolean, boolean],
    names: [string, string],
    mode: typeof matchMode,
    banner: string,
    lists?: [string[], string[]],
    mission?: string,
  ) {
    unlockAudio();
    const m = createMatch({
      seed: (Math.random() * 1e9) | 0,
      lists: lists ?? [defaultList(a), defaultList(b)],
      champions: [a, b],
      names,
      humans,
    });
    setMatch(m);
    setMatchMode(mode);
    setMatchBanner(banner);
    setMissionId(mission ?? null);
    setScreen("match");
    sfxPlay("mana");
  }

  function onMatchExit(result: "win" | "lose" | "quit", _state: MatchState) {
    if (result !== "quit") {
      if (matchMode === "ranked") {
        setSave((x) => recordRanked(x, result === "win"));
      } else {
        setSave((x) => ({
          ...x,
          games: x.games + 1,
          wins: x.wins + (result === "win" ? 1 : 0),
          losses: x.losses + (result === "win" ? 0 : 1),
        }));
      }
      if (result === "win" && matchMode === "campaign" && missionId) {
        const mis = MISSIONS.find((m) => m.id === missionId);
        const idx = MISSIONS.findIndex((m) => m.id === missionId);
        setSave((x) => ({
          ...x,
          unlocked: Array.from(new Set([...x.unlocked, mis?.unlock ?? "", mis?.opponent ?? ""])),
          campaignDone: Array.from(new Set([...x.campaignDone, missionId])),
          campaignIndex: Math.max(x.campaignIndex, idx + 1),
          tutorialDone: true,
        }));
      }
    }
    setMatch(null);
    setScreen(matchMode === "campaign" ? "campaign" : "title");
  }

  const you = save.playerName.trim() || "Operator";

  if (!hydrated) {
    return <div className="h-dvh bg-bg" />;
  }

  if (screen === "match" && match) {
    return (
      <MatchView
        initial={match}
        difficulty={save.settings.difficulty}
        onExit={onMatchExit}
        banner={matchBanner}
        shakeOn={save.settings.shake}
        muted={save.settings.muted}
        onToggleMute={toggleSound}
      />
    );
  }

  return (
    <div className="h-dvh overflow-y-auto text-fg">
      {screen === "title" && (
        <Title
          save={save}
          nameDraft={nameDraft}
          setNameDraft={setNameDraft}
          onEnter={enter}
          onNav={(id) => {
            unlockAudio();
            applyAudioSettings(save.settings);
            if (!save.settings.muted) sfxPlay("ui");
            if (id === "settings") setScreen("settings");
            else setScreen(id);
          }}
          onName={() => patch({ playerName: nameDraft.trim().slice(0, 24) })}
          muted={save.settings.muted}
          onToggleMute={toggleSound}
        />
      )}
      {screen !== "title" && screen !== "match" && (
        <Subpage
          title={labelFor(screen)}
          onBack={() => setScreen("title")}
          muted={save.settings.muted}
          onToggleMute={toggleSound}
        >
          {screen === "campaign" && (
            <Campaign save={save} onPlay={(m) => {
              const opp = m.opponent;
              const me = m.player ?? (save.unlocked.includes(pickA) ? pickA : "lyra");
              begin(me, opp, [true, false], [you, CHAMP_BY_ID[opp]?.name ?? "AI"], "campaign", m.title, undefined, m.id);
            }} pickA={pickA} setPickA={setPickA} />
          )}
          {screen === "skirmish" && (
            <DeckPick
              unlocked={ALL_SEATS}
              a={pickA}
              b={pickB}
              setA={setPickA}
              setB={setPickB}
              customs={save.customDecks}
              cta="Open skirmish"
              onGo={(la, lb, ca, cb, na, nb) =>
                begin(ca, cb, [true, false], [na, nb], "skirmish", "Skirmish", [la, lb])
              }
              you={you}
            />
          )}
          {screen === "ranked" && (
            <Ranked
              save={save}
              a={pickA}
              setA={setPickA}
              you={you}
              onGo={() => {
                const all = CHAMPIONS.map((c) => c.id);
                const opp = all[Math.floor(Math.random() * all.length)]!;
                begin(pickA, opp, [true, false], [you, CHAMP_BY_ID[opp]?.name ?? "AI"], "ranked", "Ranked");
              }}
            />
          )}
          {screen === "hotseat" && (
            <DeckPick
              unlocked={ALL_SEATS}
              a={pickA}
              b={pickB}
              setA={setPickA}
              setB={setPickB}
              customs={save.customDecks}
              cta="Sit the lattice"
              hotseat
              onGo={(la, lb, ca, cb) =>
                begin(ca, cb, [true, true], ["Seat I", "Seat II"], "hotseat", "Hot-seat", [la, lb])
              }
              you={you}
            />
          )}
          {screen === "lobby" && <LobbyNote onHotseat={() => setScreen("hotseat")} />}
          {screen === "builder" && (
            <Builder
              save={save}
              champ={buildChamp}
              setChamp={setBuildChamp}
              counts={buildCounts}
              setCounts={setBuildCounts}
              name={buildName}
              setName={setBuildName}
              onSave={(d) => {
                setSave((x) => ({ ...x, customDecks: [...x.customDecks.filter((c) => c.id !== d.id), d] }));
                setToast("Deck sealed.");
              }}
            />
          )}
          {screen === "forge" && (
            <Forge
              name={forgeName}
              setName={setForgeName}
              forged={forged}
              onForge={() => {
                const f = forgeChampion((Math.random() * 1e9) | 0, forgeName);
                setForged(f);
                sfxPlay("play");
              }}
              onPlay={() => {
                if (!forged) return;
                const opp = ALL_SEATS[Math.floor(Math.random() * ALL_SEATS.length)] ?? "lyra";
                begin(
                  forged.champion.id,
                  opp,
                  [true, false],
                  [forged.champion.name, CHAMP_BY_ID[opp]?.name ?? "AI"],
                  "forge",
                  "Lattice Forge",
                  [forged.list, defaultList(opp)],
                );
              }}
            />
          )}
          {screen === "codex" && <Codex />}
          {screen === "settings" && (
            <SettingsPane
              save={save}
              patchSettings={patchSettings}
              nameDraft={nameDraft}
              setNameDraft={setNameDraft}
              setSave={setSave}
            />
          )}
        </Subpage>
      )}
      {toast && (
        <button
          type="button"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-raised hairline rounded-full px-4 py-2 text-sm z-40"
          onClick={() => setToast("")}
        >
          {toast}
        </button>
      )}
    </div>
  );
}

function labelFor(s: Screen): string {
  return MODES.find((m) => m.id === s)?.label ?? s;
}

function Title({
  save,
  nameDraft,
  setNameDraft,
  onEnter,
  onNav,
  onName,
  muted,
  onToggleMute,
}: {
  save: SaveData;
  nameDraft: string;
  setNameDraft: (v: string) => void;
  onEnter: () => void;
  onNav: (s: Screen) => void;
  onName: () => void;
  muted: boolean;
  onToggleMute: () => void;
}) {
  return (
    <div className="relative min-h-dvh">
      <img
        src={asset("art/title-bg.jpg")}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/55 to-bg" />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Eternal Haven · Δ9</span>
          <div className="flex items-center gap-1">
            <MuteButton muted={muted} onToggle={onToggleMute} />
            <Button variant="quiet" size="icon" onClick={() => onNav("settings")} aria-label="Settings">
              <Settings className="size-4" />
            </Button>
          </div>
        </div>
        <div className="mt-10 sm:mt-16">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Collectible card lattice</p>
          <h1 className="font-display text-5xl sm:text-7xl mt-2 leading-[0.95]">
            LYGO
            <span className="block text-3xl sm:text-4xl text-ivory font-display mt-1">Eternal Lattice</span>
          </h1>
          <p className="mt-4 max-w-md text-muted text-sm sm:text-base">
            No lands. Each dawn the seal stacks +1 mana, to a height of twenty. Fifteen council Champions, shadow
            accords, and a lattice that remembers.
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md">
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={onName}
            placeholder="Operator name"
            maxLength={24}
            className="h-11 flex-1 rounded-[12px] bg-raised hairline px-3 text-sm outline-none focus:ring-2 focus:ring-accent/50"
          />
          <Button variant="ghost" onClick={onName}>
            Seal name
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onEnter();
                onNav(m.id);
              }}
              className="flex items-center gap-3 rounded-[16px] bg-surface/80 hairline px-4 py-3 text-left hover:bg-raised transition-colors"
            >
              <m.icon className="size-4 text-accent shrink-0" />
              <span>
                <span className="block font-medium">{m.label}</span>
                <span className="block text-xs text-muted">{m.hint}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-auto pt-8 text-[11px] text-subtle">
          Campaign {save.campaignDone.length}/{MISSIONS.length} · rating {save.rating} · {save.wins}–{save.losses}
        </p>
      </div>
    </div>
  );
}

function Subpage({
  title,
  onBack,
  muted,
  onToggleMute,
  children,
}: {
  title: string;
  onBack: () => void;
  muted: boolean;
  onToggleMute: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <h2 className="font-display text-3xl flex-1">{title}</h2>
        <MuteButton muted={muted} onToggle={onToggleMute} />
      </div>
      {children}
    </div>
  );
}

function ChampRow({
  c,
  selected,
  locked,
  onClick,
}: {
  c: ChampionDef;
  selected?: boolean;
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={cn(
        "flex items-center gap-3 rounded-[16px] hairline px-3 py-2 text-left w-full bg-surface",
        selected && "ring-1 ring-accent",
        locked && "opacity-40",
      )}
    >
      <div className="size-11 rounded-full overflow-hidden shrink-0">
        <Sigil id={c.id} />
      </div>
      <div className="min-w-0">
        <div className="font-display text-lg leading-tight" style={{ color: champTint(c.id) }}>
          {c.name}
        </div>
        <div className="text-xs text-muted truncate">{c.epithet}</div>
      </div>
    </button>
  );
}

function Campaign({
  save,
  onPlay,
  pickA,
  setPickA,
}: {
  save: SaveData;
  onPlay: (m: (typeof MISSIONS)[number]) => void;
  pickA: string;
  setPickA: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <img src={asset("art/star-chart.jpg")} alt="" className="w-full rounded-[20px] hairline object-cover h-36" crossOrigin="anonymous" />
      <p className="text-sm text-muted">
        Walk the council galaxies one seat at a time. Other modes already have every deck. Winning a chapter opens the next campaign mission and that Champion&apos;s campaign seat.
      </p>
      <div>
        <p className="text-xs text-muted mb-2">Your seat</p>
        <div className="grid grid-cols-1 gap-2">
          {CHAMPIONS.filter((c) => save.unlocked.includes(c.id)).map((c) => (
            <ChampRow key={c.id} c={c} selected={pickA === c.id} onClick={() => setPickA(c.id)} />
          ))}
        </div>
      </div>
      <ol className="space-y-2">
        {MISSIONS.map((m, i) => {
          const open = i === 0 || save.campaignDone.includes(MISSIONS[i - 1]!.id) || save.campaignIndex >= i;
          const done = save.campaignDone.includes(m.id);
          return (
            <li key={m.id} className={cn("rounded-[16px] bg-surface hairline p-4", !open && "opacity-40")}>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-xl">{m.title}</h3>
                <span className="text-[11px] text-muted">{done ? "Held" : open ? "Open" : "Sealed"}</span>
              </div>
              <p className="text-sm text-muted mt-1">{m.story}</p>
              {open && (
                <Button className="mt-3" size="sm" onClick={() => onPlay(m)}>
                  Enter
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DeckPick({
  unlocked,
  a,
  b,
  setA,
  setB,
  onGo,
  cta,
  hotseat,
  customs,
  you,
}: {
  unlocked: string[];
  a: string;
  b: string;
  setA: (id: string) => void;
  setB: (id: string) => void;
  onGo: (la: string[], lb: string[], ca: string, cb: string, na: string, nb: string) => void;
  cta: string;
  hotseat?: boolean;
  customs: CustomDeck[];
  you: string;
}) {
  const list = CHAMPIONS.filter((c) => unlocked.includes(c.id));
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div>
        <p className="text-xs text-muted mb-2">{hotseat ? "Seat I" : "You"}</p>
        <div className="space-y-2">
          {list.map((c) => (
            <ChampRow key={c.id} c={c} selected={a === c.id} onClick={() => setA(c.id)} />
          ))}
          {customs.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setA(d.championId + "::" + d.id)}
              className={cn("w-full text-left rounded-[16px] hairline px-3 py-2 bg-surface", a.endsWith(d.id) && "ring-1 ring-accent")}
            >
              <div className="font-display">{d.name}</div>
              <div className="text-xs text-muted">{CHAMP_BY_ID[d.championId]?.name}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted mb-2">{hotseat ? "Seat II" : "Opponent"}</p>
        <div className="space-y-2">
          {(hotseat ? CHAMPIONS : list).map((c) => (
            <ChampRow key={c.id} c={c} selected={b === c.id} onClick={() => setB(c.id)} />
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <Button
          className="w-full"
          onClick={() => {
            const custom = customs.find((d) => a.endsWith(d.id));
            const ca = custom?.championId ?? a;
            const la = custom?.cards ?? defaultList(ca);
            onGo(la, defaultList(b), ca, b, you, CHAMP_BY_ID[b]?.name ?? "AI");
          }}
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}

function Ranked({
  save,
  a,
  setA,
  onGo,
  you,
}: {
  save: SaveData;
  a: string;
  setA: (id: string) => void;
  onGo: () => void;
  you: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        All council, shadow, and lattice decks are open. Enter a name on the title seal to persist on the local ladder.
        Ranked is vs the lattice AI — peer play is casual only.
      </p>
      <p className="tabular text-sm">
        {you} · rating {save.rating}
      </p>
      <div className="space-y-2">
        {CHAMPIONS.map((c) => (
          <ChampRow key={c.id} c={c} selected={a === c.id} onClick={() => setA(c.id)} />
        ))}
      </div>
      <Button className="w-full" onClick={onGo}>
        Climb
      </Button>
      <h3 className="font-display text-2xl pt-4">Ladder</h3>
      {save.leaderboard.length === 0 && <p className="text-sm text-muted">No sealed names yet.</p>}
      <ol className="space-y-1">
        {save.leaderboard.map((r, i) => (
          <li key={r.name} className="flex justify-between text-sm hairline rounded-[12px] px-3 py-2">
            <span>
              {i + 1}. {r.name}
            </span>
            <span className="tabular text-muted">
              {r.rating} · {r.wins}–{r.losses}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LobbyNote({ onHotseat }: { onHotseat: () => void }) {
  return (
    <div className="space-y-3 max-w-md">
      <p className="text-sm text-muted">
        Ranked and the ladder are vs the lattice AI, with an optional sealed operator name. Two humans share one device
        in Hot-seat — the only fair hidden-hand mode here. A stranger peer link would have no server authority.
      </p>
      <Button className="w-full" onClick={onHotseat}>
        Open hot-seat
      </Button>
      <p className="text-xs text-subtle">Pass the screen at each dawn. The lattice does not hide a hand it cannot keep.</p>
    </div>
  );
}

function Builder({
  save,
  champ,
  setChamp,
  counts,
  setCounts,
  name,
  setName,
  onSave,
}: {
  save: SaveData;
  champ: string;
  setChamp: (id: string) => void;
  counts: Record<string, number>;
  setCounts: (c: Record<string, number>) => void;
  name: string;
  setName: (n: string) => void;
  onSave: (d: CustomDeck) => void;
}) {
  const pool = CARDS.filter((c) => c.championId === champ || c.championId === "cosmara");
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  function set(id: string, n: number) {
    const next = { ...counts, [id]: Math.max(0, Math.min(2, n)) };
    if (next[id] === 0) delete next[id];
    setCounts(next);
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Exactly 29 minions and spells plus your Champion (30). Max two copies. Theme-locked, with COSMARA as lattice-shared
        in every mode except campaign (campaign still unlocks seats one by one).
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-11 w-full rounded-[12px] bg-raised hairline px-3 text-sm"
        maxLength={32}
      />
      <div className="space-y-2">
        {CHAMPIONS.map((c) => (
          <ChampRow
            key={c.id}
            c={c}
            selected={champ === c.id}
            onClick={() => {
              setChamp(c.id);
              const d: Record<string, number> = {};
              for (const card of CARDS.filter((x) => x.championId === c.id)) d[card.id] = card.copies;
              setCounts(d);
            }}
          />
        ))}
      </div>
      <p className={cn("tabular text-sm", total === 29 ? "text-accent" : "text-muted")}>{total} / 29</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pool.map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-[14px] bg-surface hairline p-2">
            <CardFace cardId={c.id} size="xs" />
            <div className="min-w-0 flex-1">
              <div className="text-sm truncate">{c.name}</div>
              <div className="text-[11px] text-muted">{c.cost} · {c.type}</div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={() => set(c.id, (counts[c.id] ?? 0) - 1)}>
                −
              </Button>
              <span className="tabular w-4 text-center text-sm">{counts[c.id] ?? 0}</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 px-0" onClick={() => set(c.id, (counts[c.id] ?? 0) + 1)}>
                +
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        className="w-full"
        disabled={total !== 29}
        onClick={() => {
          const cards: string[] = [];
          for (const [id, n] of Object.entries(counts)) for (let i = 0; i < n; i++) cards.push(id);
          onSave({ id: `custom-${champ}-${Date.now()}`, name: name || "Seal", championId: champ, cards });
        }}
      >
        Seal deck
      </Button>
    </div>
  );
}

function Forge({
  name,
  setName,
  forged,
  onForge,
  onPlay,
}: {
  name: string;
  setName: (n: string) => void;
  forged: ReturnType<typeof forgeChampion> | null;
  onForge: () => void;
  onPlay: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Cut a new Champion from light-math. Names, costs, and seals stay in Haven tone. Balance is a curve, not a promise.
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Optional seal name"
        className="h-11 w-full rounded-[12px] bg-raised hairline px-3 text-sm"
      />
      <Button className="w-full" onClick={onForge}>
        Strike the forge
      </Button>
      {forged && (
        <div className="rounded-[16px] bg-surface hairline p-4">
          <h3 className="font-display text-2xl">{forged.champion.name}</h3>
          <p className="text-sm text-muted">{forged.champion.lore}</p>
          <p className="text-sm mt-2">{forged.champion.passiveText}</p>
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
            {forged.cards.slice(0, 8).map((c) => (
              <CardFace key={c.id} cardId={c.id} size="xs" />
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={onPlay}>
            Trial the seal
          </Button>
        </div>
      )}
    </div>
  );
}

function Codex() {
  const issues = useMemo(() => CHAMPIONS.flatMap((c) => deckIssues(c.id)), []);
  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-display text-2xl">The Luminal Accords</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            <span className="text-fg">Win:</span> reduce the enemy Champion to{" "}
            <span className="text-fg">0 HP</span>. Both start at 20 HP (VΩLARIS 22). Unblocked assaults and some spells hit HP.
          </li>
          <li>No land cards. Both operators begin at 0 mana.</li>
          <li>At the start of each of your dawns you gain +1 permanent mana, stacking to 20 on dawn 20.</li>
          <li>Resonance cards grant temporary mana (this dawn, or pending dawns). They are rare.</li>
          <li>Decks are 30 cards: 1 Champion in the command seal, 29 in the library. Max two copies of a minion or spell.</li>
          <li>Theme lock: a Champion’s minions only serve that Champion, plus lattice-shared COSMARA.</li>
          <li>Minions carry Power / Toughness. Lattice-Walk, Seal-Guard, Light-Drain, Accord-Break, Haste, Ward.</li>
          <li>Assault: declare attackers, assign one seal (blocker) each, then damage. First dawn does not draw.</li>
          <li>Empty library inflicts rising fatigue to HP (1, then 2, then 3…).</li>
        </ul>
      </section>
      <section>
        <h3 className="font-display text-2xl">Keywords</h3>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {Object.entries(KEYWORD_TEXT).map(([k, v]) => (
            <li key={k}>{v}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-display text-2xl">Fifteen seats</h3>
        <div className="mt-3 space-y-3">
          {CHAMPIONS.map((c) => (
            <article key={c.id} className="rounded-[16px] bg-surface hairline p-4">
              <div className="flex gap-3">
                <div className="size-12 rounded-full overflow-hidden shrink-0">
                  <Sigil id={c.id} />
                </div>
                <div>
                  <h4 className="font-display text-xl" style={{ color: champTint(c.id) }}>
                    {c.name}
                  </h4>
                  <p className="text-xs text-muted">{c.epithet}</p>
                </div>
              </div>
              <p className="text-sm mt-2">{c.lore}</p>
              <p className="text-xs text-muted mt-2">
                {c.passiveName}: {c.passiveText} · {c.abilityName} ({c.abilityCost}): {c.abilityText}
              </p>
            </article>
          ))}
        </div>
      </section>
      {issues.length > 0 && (
        <p className="text-xs text-danger">{issues.join(" · ")}</p>
      )}
    </div>
  );
}

function SettingsPane({
  save,
  setSave,
  patchSettings,
  nameDraft,
  setNameDraft,
}: {
  save: SaveData;
  setSave: (s: SaveData) => void;
  patchSettings: (p: Partial<SaveData["settings"]>) => void;
  nameDraft: string;
  setNameDraft: (v: string) => void;
}) {
  const { muted, sfxOn, musicOn, sfx, music, shake, difficulty } = save.settings;
  return (
    <div className="space-y-5 max-w-md">
      <section className="space-y-3">
        <h3 className="font-display text-2xl">Sound</h3>
        <SoundSwitch
          on={!muted}
          onChange={(on) => {
            unlockAudio();
            setMuted(!on);
            patchSettings({ muted: !on });
            if (on) sfxPlay("ui");
          }}
          label={muted ? "Sound off" : "Sound on"}
          hint={muted ? "Chimes and lattice drone are silent." : "Chimes and lattice drone are live."}
        />
        <VolumeRow
          label="Chimes"
          value={sfx}
          enabled={sfxOn}
          disabled={muted}
          icon={Volume2}
          onEnabled={(v) => {
            unlockAudio();
            setSfxOn(v);
            patchSettings({ sfxOn: v });
            if (v && !muted) sfxPlay("ui");
          }}
          onChange={(v) => {
            unlockAudio();
            setSfxVolume(v);
            patchSettings({ sfx: v });
            if (!muted && sfxOn) sfxPlay("ui");
          }}
        />
        <VolumeRow
          label="Lattice drone"
          value={music}
          enabled={musicOn}
          disabled={muted}
          icon={Music}
          onEnabled={(v) => {
            unlockAudio();
            setMusicOn(v);
            patchSettings({ musicOn: v });
          }}
          onChange={(v) => {
            unlockAudio();
            setMusicVolume(v);
            patchSettings({ music: v });
          }}
        />
      </section>
      <label className="block text-sm">
        Operator name
        <input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={() => setSave({ ...save, playerName: nameDraft.trim().slice(0, 24) })}
          className="mt-1 h-11 w-full rounded-[12px] bg-raised hairline px-3"
        />
      </label>
      <SoundSwitch
        on={shake}
        onChange={(v) => patchSettings({ shake: v })}
        label="Lattice shake"
        hint="Board pulse when you take damage."
      />
      <label className="block text-sm">
        AI pressure
        <select
          className="mt-1 h-11 w-full rounded-[12px] bg-raised hairline px-3"
          value={difficulty}
          onChange={(e) => patchSettings({ difficulty: e.target.value as Difficulty })}
        >
          <option value="easy">Gentle</option>
          <option value="normal">Measured</option>
          <option value="hard">Strict</option>
        </select>
      </label>
    </div>
  );
}
