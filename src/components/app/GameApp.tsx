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
import { ChampPortrait, Sigil, champTint } from "@/components/game/Sigil";
import {
  StudioBackdrop,
  StudioChip,
  StudioMark,
  StudioNextUp,
  StudioPanel,
  StudioPortrait,
  StudioPortraitRow,
  StudioProgress,
  StudioSection,
  StudioStats,
  StudioTile,
} from "@/components/app/StudioUI";
import { MuteButton, RadioToggle, SoundSwitch, VolumeRow } from "@/components/game/SoundControls";
import { RadioMini } from "@/components/app/RadioMini";
import { MISSIONS, type Mission } from "@/lib/game/campaign";
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

  function playMission(m: Mission) {
    const opp = m.opponent;
    const me = m.player ?? (save.unlocked.includes(pickA) ? pickA : "lyra");
    begin(me, opp, [true, false], [you, CHAMP_BY_ID[opp]?.name ?? "AI"], "campaign", m.title, undefined, m.id);
  }

  const nextMission = MISSIONS.find((m) => !save.campaignDone.includes(m.id)) ?? null;

  if (!hydrated) {
    return <div className="h-dvh bg-bg" />;
  }

  if (screen === "match" && match) {
    return (
      <>
        <MatchView
          initial={match}
          difficulty={save.settings.difficulty}
          onExit={onMatchExit}
          banner={matchBanner}
          shakeOn={save.settings.shake}
          muted={save.settings.muted}
          onToggleMute={toggleSound}
          nextLabel={
            matchMode === "campaign" && nextMission ? `Next · ${nextMission.title}` : undefined
          }
          onNext={
            matchMode === "campaign" && nextMission
              ? () => {
                  const m = nextMission;
                  setMatch(null);
                  setScreen("campaign");
                  window.setTimeout(() => playMission(m), 0);
                }
              : undefined
          }
          onRetry={
            matchMode === "campaign" && missionId
              ? () => {
                  const m = MISSIONS.find((x) => x.id === missionId);
                  setMatch(null);
                  if (m) window.setTimeout(() => playMission(m), 0);
                  else setScreen("campaign");
                }
              : undefined
          }
        />
        <RadioMini />
      </>
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
          onQuickPlay={playMission}
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
            <Campaign save={save} onPlay={playMission} pickA={pickA} setPickA={setPickA} />
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
      <RadioMini />
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
  onQuickPlay,
  muted,
  onToggleMute,
}: {
  save: SaveData;
  nameDraft: string;
  setNameDraft: (v: string) => void;
  onEnter: () => void;
  onNav: (s: Screen) => void;
  onName: () => void;
  onQuickPlay: (m: Mission) => void;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const done = save.campaignDone.length;
  const idx = Math.min(MISSIONS.length - 1, Math.max(0, save.campaignIndex));
  const next = MISSIONS.find((m) => !save.campaignDone.includes(m.id)) ?? MISSIONS[idx] ?? MISSIONS[0]!;
  const complete = done >= MISSIONS.length;
  const held = new Set(save.unlocked);
  const stat = (id: Screen): string | undefined => {
    if (id === "campaign") return `${done}/${MISSIONS.length}`;
    if (id === "ranked") return String(save.rating);
    if (id === "hotseat") return save.customDecks.length ? `${save.customDecks.length} seals` : undefined;
    if (id === "lobby") return `W ${save.wins} · L ${save.losses}`;
    return undefined;
  };
  return (
    <div className="relative min-h-dvh">
      <StudioBackdrop art="art/title-bg.jpg" dim={0.5} />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-5 pb-12 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-accent">
            <StudioMark />
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Eternal Haven · Δ9</span>
          </div>
          <div className="flex items-center gap-1">
            <MuteButton muted={muted} onToggle={onToggleMute} />
            <RadioToggle />
            <Button variant="quiet" size="icon" onClick={() => onNav("settings")} aria-label="Settings">
              <Settings className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Collectible card lattice</p>
          <h1 className="font-display text-6xl sm:text-7xl mt-3 leading-[0.92] studio-hero-title">
            LYGO
            <span className="block text-3xl sm:text-4xl text-ivory font-display mt-2 tracking-tight">
              Eternal Lattice
            </span>
          </h1>
          <p className="mt-4 max-w-md text-muted text-sm sm:text-base">
            No lands. Each dawn the seal stacks +1 mana, to a height of twenty. Fifteen council Champions, shadow
            accords, and a lattice that remembers.
          </p>
        </div>

        <div className="mt-7 flex flex-col sm:flex-row gap-2 max-w-md">
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={onName}
            placeholder="Operator name"
            maxLength={24}
            className="h-11 flex-1 rounded-[12px] bg-raised/80 hairline px-3 text-sm outline-none focus:ring-2 focus:ring-accent/50"
          />
          <Button variant="ghost" onClick={onName}>
            Seal name
          </Button>
        </div>

        <div className="mt-7">
          <StudioNextUp
            index={complete ? MISSIONS.length - 1 : MISSIONS.indexOf(next)}
            total={MISSIONS.length}
            title={complete ? "The lattice holds" : next.title}
            story={
              complete
                ? "Every chapter is held, every seat sits the council. Skirmish, Ranked, and the Forge stay open for as long as the lattice remembers you."
                : next.story
            }
            opponentId={next.opponent}
            opponentName={CHAMP_BY_ID[next.opponent]?.name ?? "The lattice"}
            cta={complete ? "Open the campaign" : done === 0 ? "Begin the campaign" : "Continue the campaign"}
            done={complete}
            onGo={() => {
              onEnter();
              if (complete) onNav("campaign");
              else onQuickPlay(next);
            }}
          />
        </div>

        <div className="mt-4">
          <StudioStats
            items={[
              { label: "Chapters held", value: `${done}/${MISSIONS.length}` },
              { label: "Rating", value: String(save.rating) },
              { label: "Record", value: `${save.wins}–${save.losses}` },
              { label: "Seals cut", value: String(save.customDecks.length) },
            ]}
          />
        </div>

        <div className="mt-9">
          <StudioSection title="Take a seat" hint="Every mode shares one lattice; choose how you want to arrive.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODES.map((m) => (
                <StudioTile
                  key={m.id}
                  icon={m.icon}
                  title={m.label}
                  hint={m.hint}
                  stat={stat(m.id)}
                  feature={m.id === "campaign"}
                  progress={m.id === "campaign" ? { value: done, max: MISSIONS.length } : undefined}
                  onClick={() => {
                    onEnter();
                    onNav(m.id);
                  }}
                />
              ))}
            </div>
          </StudioSection>
        </div>

        <div className="mt-9">
          <StudioSection
            title="The council"
            hint={`${held.size} of ${CHAMPIONS.length} seats answer the call. Win a chapter to open the seat beyond it.`}
          >
            <StudioPortraitRow>
              {CHAMPIONS.map((c) => (
                <StudioPortrait
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  epithet={c.epithet}
                  locked={!held.has(c.id)}
                  selected={c.id === next.opponent}
                  onClick={() => {
                    onEnter();
                    onNav("campaign");
                  }}
                />
              ))}
            </StudioPortraitRow>
          </StudioSection>
        </div>

        <p className="mt-auto pt-10 text-[11px] text-subtle">
          Lattice Link is casual peer play · ladder is local to this device · {save.games} matches remembered
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
    <div className="relative min-h-dvh">
      <StudioBackdrop art="art/star-chart.jpg" dim={0.68} />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="sticky top-0 z-20 -mx-4 mb-6 flex items-center gap-2 border-b border-fg/10 bg-bg/70 px-4 py-2 backdrop-blur">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
          <h2 className="font-display text-3xl flex-1">{title}</h2>
          <MuteButton muted={muted} onToggle={onToggleMute} />
          <RadioToggle />
        </div>
        {children}
      </div>
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
  const done = save.campaignDone.length;
  const held = new Set(save.unlocked);
  return (
    <div className="space-y-6">
      <StudioPanel className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="studio-eyebrow">Council campaign</p>
            <h3 className="font-display text-2xl mt-1">{done} of {MISSIONS.length} chapters held</h3>
          </div>
          <StudioChip tone={done >= MISSIONS.length ? "accent" : "muted"}>
            {done >= MISSIONS.length
              ? "Complete"
              : `${held.size} ${held.size === 1 ? "seat" : "seats"} open`}
          </StudioChip>
        </div>
        <StudioProgress className="mt-3" value={done} max={MISSIONS.length} />
        <p className="text-xs text-muted mt-3">
          Walk the council galaxies one seat at a time. Other modes already have every deck. Winning a chapter opens the
          next mission and that Champion&apos;s seat.
        </p>
      </StudioPanel>

      <StudioSection title="Your seat" hint="Pick the Champion you bring to the next chapter.">
        <StudioPortraitRow>
          {CHAMPIONS.filter((c) => held.has(c.id)).map((c) => (
            <StudioPortrait
              key={c.id}
              id={c.id}
              name={c.name}
              epithet={c.epithet}
              selected={pickA === c.id}
              onClick={() => setPickA(c.id)}
            />
          ))}
        </StudioPortraitRow>
      </StudioSection>

      <StudioSection title="Chapters" hint="Each held chapter opens the seat that follows it.">
        <ol className="space-y-2">
          {MISSIONS.map((m, i) => {
            const open = i === 0 || save.campaignDone.includes(MISSIONS[i - 1]!.id) || save.campaignIndex >= i;
            const isDone = save.campaignDone.includes(m.id);
            const seat = CHAMP_BY_ID[m.unlock];
            return (
              <li key={m.id}>
                <StudioPanel className={cn("overflow-hidden", !open && "opacity-55")}>
                  <div className="flex items-stretch">
                    <div className="w-24 sm:w-28 shrink-0 relative overflow-hidden">
                      <ChampPortrait id={m.opponent} />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to right, transparent 30%, color-mix(in oklab, var(--color-surface) 92%, transparent))",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 p-3 sm:p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="tabular text-[11px] text-subtle">{String(i + 1).padStart(2, "0")}</span>
                        <h4 className="font-display text-xl">{m.title}</h4>
                        <StudioChip tone={isDone ? "accent" : open ? "ivory" : "muted"}>
                          {isDone ? "Held" : open ? "Open" : "Sealed"}
                        </StudioChip>
                        {seat && (
                          <span className="text-[11px] text-muted">
                            Seat · <span style={{ color: champTint(m.unlock) }}>{seat.name}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted mt-1.5 max-w-2xl">{m.story}</p>
                      {open && (
                        <Button className="mt-3" size="sm" onClick={() => onPlay(m)}>
                          <Swords className="size-3.5" />
                          {isDone ? "Replay chapter" : "Enter"}
                        </Button>
                      )}
                    </div>
                  </div>
                </StudioPanel>
              </li>
            );
          })}
        </ol>
      </StudioSection>
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
  const custom = customs.find((d) => a.endsWith(d.id));
  const ca = custom?.championId ?? a;
  const foeList = hotseat ? CHAMPIONS : list;
  function side(id: string, set: (v: string) => void, label: string, options: ChampionDef[], me: boolean) {
    const sel = options.find((c) => c.id === id) ?? CHAMP_BY_ID[id.split("::")[0]!];
    return (
      <StudioPanel className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="studio-eyebrow">{label}</p>
          {sel && <StudioChip tone={me ? "accent" : "muted"}>{sel.name}</StudioChip>}
        </div>
        <StudioPortraitRow className="mt-3">
          {options.map((c) => (
            <StudioPortrait
              key={c.id}
              id={c.id}
              name={c.name}
              epithet={c.epithet}
              selected={id === c.id}
              onClick={() => set(c.id)}
            />
          ))}
        </StudioPortraitRow>
        {me && customs.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-subtle mb-1">Your seals</p>
            <div className="flex flex-wrap gap-2">
              {customs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => set(`${d.championId}::${d.id}`)}
                  className={cn(
                    "rounded-full hairline px-3 py-1.5 text-xs bg-surface hover:bg-raised",
                    a.endsWith(d.id) && "ring-1 ring-accent text-accent",
                  )}
                >
                  {d.name} · {CHAMP_BY_ID[d.championId]?.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {sel && (
          <p className="text-xs text-muted mt-3 leading-relaxed">
            <span className="text-fg">{sel.abilityName}</span> ({sel.abilityCost}) · {sel.abilityText}
          </p>
        )}
      </StudioPanel>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-3 items-start">
        {side(a, setA, hotseat ? "Seat I" : "You", hotseat ? CHAMPIONS : list, true)}
        {side(b, setB, hotseat ? "Seat II" : "Opponent", foeList, false)}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-display text-lg text-subtle">versus</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <Button
        className="w-full"
        size="lg"
        onClick={() => {
          const la = custom?.cards ?? defaultList(ca);
          onGo(la, defaultList(b), ca, b, you, CHAMP_BY_ID[b]?.name ?? "AI");
        }}
      >
        <Swords className="size-4" />
        {cta}
      </Button>
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
  const played = save.wins + save.losses;
  const winRate = played ? Math.round((save.wins / played) * 100) : 0;
  return (
    <div className="space-y-6">
      <StudioPanel glow className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="studio-eyebrow">Local ladder</p>
            <h3 className="font-display text-3xl mt-1" style={{ color: champTint(a) }}>
              {you}
            </h3>
          </div>
          <StudioStats
            items={[
              { label: "Rating", value: String(save.rating) },
              { label: "Record", value: `${save.wins}–${save.losses}` },
              { label: "Win rate", value: `${winRate}%` },
            ]}
          />
        </div>
        <p className="text-xs text-muted mt-3">
          All council, shadow, and lattice decks are open. Ranked is vs the lattice AI — peer play is casual only.
        </p>
      </StudioPanel>

      <StudioSection title="Your Champion" hint="Every seat is open here; the ladder only remembers the result.">
        <StudioPortraitRow>
          {CHAMPIONS.map((c) => (
            <StudioPortrait
              key={c.id}
              id={c.id}
              name={c.name}
              epithet={c.epithet}
              selected={a === c.id}
              onClick={() => setA(c.id)}
            />
          ))}
        </StudioPortraitRow>
      </StudioSection>

      <Button className="w-full" size="lg" onClick={onGo}>
        <Trophy className="size-4" />
        Climb the lattice
      </Button>

      <StudioSection title="Sealed names" hint="Ranked results are kept on this device only.">
        {save.leaderboard.length === 0 ? (
          <p className="text-sm text-muted">No sealed names yet — climb once to write your line.</p>
        ) : (
          <ol className="space-y-1.5">
            {save.leaderboard.map((r, i) => (
              <li
                key={r.name}
                className={cn(
                  "flex items-center justify-between rounded-[14px] hairline px-3 py-2 text-sm bg-surface",
                  i === 0 && "ring-1 ring-accent/40",
                )}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="tabular text-[11px] text-subtle w-5">{i + 1}</span>
                  <span className="truncate">{r.name}</span>
                </span>
                <span className="tabular text-muted shrink-0">
                  {r.rating} · {r.wins}–{r.losses}
                </span>
              </li>
            ))}
          </ol>
        )}
      </StudioSection>
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
