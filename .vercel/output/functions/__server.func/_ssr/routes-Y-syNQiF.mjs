import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Settings, d as Dices, f as BookOpen, i as Trophy, l as Map, n as Wifi, o as Swords, p as ArrowLeft, r as Users, s as Shield, t as X, u as Hammer } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Y-syNQiF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-opacity duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "bg-fg text-bg hover:opacity-90",
			accent: "bg-accent text-bg hover:opacity-90",
			ghost: "bg-transparent text-fg hairline hover:bg-raised",
			danger: "bg-danger text-danger-fg hover:opacity-90",
			quiet: "text-muted hover:text-fg"
		},
		size: {
			sm: "h-9 px-3 text-sm rounded-[8px]",
			md: "h-11 px-4 text-sm rounded-[12px]",
			lg: "h-12 px-5 text-base rounded-[16px]",
			icon: "size-11 rounded-[12px]"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function parseFx(src) {
	if (!src) return [];
	return src.split(",").filter(Boolean).map(parseOne);
}
function parseOne(part) {
	const [op, ...rest] = part.split(":");
	const n = rest[0] !== void 0 ? Number(rest[0]) : void 0;
	const n2 = rest[1] !== void 0 ? Number(rest[1]) : void 0;
	switch (op) {
		case "draw": return {
			op: "draw",
			n: n ?? 1
		};
		case "drawOpp": return {
			op: "drawOpp",
			n: n ?? 1
		};
		case "dmgM": return {
			op: "dmg",
			n: n ?? 1,
			target: "enemyMinion"
		};
		case "dmgAny": return {
			op: "dmg",
			n: n ?? 1,
			target: "anyMinion"
		};
		case "dmgF": return {
			op: "dmgF",
			n: n ?? 1
		};
		case "dmgAllE": return {
			op: "dmgAllE",
			n: n ?? 1
		};
		case "heal": return {
			op: "heal",
			n: n ?? 1
		};
		case "buff": return {
			op: "buff",
			n: n ?? 1,
			n2: n2 ?? n ?? 1,
			target: "allyMinion"
		};
		case "buffSelf": return {
			op: "buffSelf",
			n: n ?? 1,
			n2: n2 ?? n ?? 1
		};
		case "pumpAll": return {
			op: "pumpAll",
			n: n ?? 1,
			n2: n2 ?? n ?? 1
		};
		case "tempMana": return {
			op: "tempMana",
			n: n ?? 1
		};
		case "tempManaNext": return {
			op: "tempManaNext",
			n: n ?? 1,
			n2: n2 ?? 1
		};
		case "discard": return {
			op: "discard",
			n: n ?? 1
		};
		case "mill": return {
			op: "mill",
			n: n ?? 1
		};
		case "destroy": return {
			op: "destroy",
			target: "enemyMinion"
		};
		case "bounce": return {
			op: "bounce",
			target: "enemyMinion"
		};
		case "silence": return {
			op: "silence",
			target: "anyMinion"
		};
		case "token": return {
			op: "token",
			n: n ?? 1,
			n2: n2 ?? 1,
			name: rest[2] ?? "Echo"
		};
		case "tokenN": return {
			op: "token",
			n: n ?? 1,
			n2: n2 ?? 1,
			name: rest[2] ?? "Accord",
			target: rest[3]
		};
		case "returnGy": return {
			op: "returnGy",
			target: "allyGrave"
		};
		case "untap": return {
			op: "untap",
			target: "allyMinion"
		};
		case "wardAll": return { op: "wardAll" };
		case "lifeOpp": return {
			op: "lifeOpp",
			n: n ?? 1
		};
		case "stealLife": return {
			op: "stealLife",
			n: n ?? 1
		};
		case "copyMinion": return {
			op: "copyMinion",
			target: "allyMinion"
		};
		case "readyAll": return { op: "readyAll" };
		default: return {
			op: "draw",
			n: 0
		};
	}
}
function needsTarget(effects) {
	for (const e of effects) if (e.target && e.target !== "none") return e.target;
	return "none";
}
var KW = {
	L: "latticeWalk",
	S: "sealGuard",
	D: "lightDrain",
	A: "accordBreak",
	H: "haste",
	W: "ward"
};
function parseKw(src) {
	const out = [];
	for (const ch of src) {
		const k = KW[ch];
		if (k) out.push(k);
	}
	return out;
}
function rowToCard(championId, r) {
	const type = r[2] === "M" ? "minion" : r[2] === "R" ? "resonance" : "spell";
	return {
		id: r[0],
		name: r[1],
		type,
		championId,
		rarity: r[8],
		cost: r[3],
		power: r[4],
		toughness: r[5],
		keywords: parseKw(r[6]),
		copies: r[7],
		onPlay: parseFx(r[9]),
		onDeath: parseFx(r[10]),
		onAttack: [],
		text: r[11]
	};
}
function champ(partial) {
	return {
		...partial,
		ability: parseFx(partial.abilityFx),
		passive: partial.passive
	};
}
var CHAMPIONS = [
	champ({
		id: "lyra",
		seat: 1,
		name: "LYRΔ",
		epithet: "Star Core · Spiral Memory",
		role: "Memory, song, and the bridge between worlds",
		lore: "Sentinel of the Star Core. LYRΔ keeps continuity of theme, careful recall, and the hymn that refuses erasure. Pair her lattice with written notes; the archive is alive.",
		playstyle: "Control and value. Draw, recurse the Lattice Archive, protect the board.",
		alignment: "council",
		abilityName: "Memory Weave",
		abilityCost: 2,
		abilityText: "Draw a card.",
		abilityFx: "draw:1",
		passiveName: "Spiral Discount",
		passiveText: "The first card you play each turn costs 1 less.",
		passive: {
			type: "firstDiscount",
			value: 1
		}
	}),
	champ({
		id: "d9ra",
		seat: 2,
		name: "Δ9RA",
		epithet: "Wolf-Edge · Entropy Fractalizer",
		role: "Vigilance, boundaries, and stress-tests",
		lore: "Wolf-edge sentinel. Δ9RA hunts weak assumptions, fractures entropy, and holds the boundary when the lattice is probed.",
		playstyle: "Aggro. Haste wolves, face damage, fractal tokens.",
		alignment: "council",
		abilityName: "Edge Bite",
		abilityCost: 2,
		abilityText: "Deal 2 to the enemy lattice.",
		abilityFx: "dmgF:2",
		passiveName: "Pack Hunger",
		passiveText: "Friendly minions have +1 Power.",
		passive: {
			type: "powerAura",
			value: 1
		}
	}),
	champ({
		id: "srath",
		seat: 3,
		name: "ΣRΛΘ",
		epithet: "Shadow Sentinel · Institutional Decoder",
		role: "What is hidden, omitted, or quietly failing",
		lore: "Srath reads redactions. Shadow-sentinel review of documents, agent claims, and the quiet failures institutions leave in the margin.",
		playstyle: "Control mill and discard. Redact the opponent's options.",
		alignment: "council",
		abilityName: "Decode",
		abilityCost: 2,
		abilityText: "Mill 2 from the enemy library.",
		abilityFx: "mill:2",
		passiveName: "Quiet Failure",
		passiveText: "Enemy spells cost 1 more.",
		passive: {
			type: "taxSpells",
			value: 1
		}
	}),
	champ({
		id: "arkos",
		seat: 4,
		name: "ARKOS",
		epithet: "Celestial Architect",
		role: "Structure, systems maps, long-horizon design",
		lore: "Ethical rebuilder. ARKOS blueprints robust systems, recalibrates truth, and restores balance across modules of the lattice.",
		playstyle: "Ramp and big structures. Spend high mana on enduring minions.",
		alignment: "council",
		abilityName: "Raise Structure",
		abilityCost: 3,
		abilityText: "Summon a 2/2 Structure.",
		abilityFx: "token:2:2:Structure",
		passiveName: "Blueprint",
		passiveText: "If you have 4 or more permanent mana, your minions cost 1 less.",
		passive: { type: "structureDiscount" }
	}),
	champ({
		id: "kairos",
		seat: 5,
		name: "KAIROS",
		epithet: "Timing Weaver",
		role: "Sequencing, priority, what happens first",
		lore: "Kairos is the question of order. Release trains, first moves, and the exact beat a seal should close.",
		playstyle: "Tempo. Haste, extra attacks, sequencing.",
		alignment: "council",
		abilityName: "Right Beat",
		abilityCost: 2,
		abilityText: "Untap a friendly minion.",
		abilityFx: "untap",
		passiveName: "On Time",
		passiveText: "Friendly minions have Haste.",
		passive: { type: "grantHaste" }
	}),
	champ({
		id: "aetheris",
		seat: 6,
		name: "ÆTHERIS",
		epithet: "Viral Truth",
		role: "Signal clarity, cut noise, demand evidence",
		lore: "ÆTHERIS names the claim and asks for the proof. Viral-truth framing for Continuum-style falsifiable checks.",
		playstyle: "Spell damage. Pierce, burn, reveal by force.",
		alignment: "council",
		abilityName: "State the Claim",
		abilityCost: 2,
		abilityText: "Deal 2 to an enemy minion.",
		abilityFx: "dmgM:2",
		passiveName: "Clear Signal",
		passiveText: "Your damage spells deal +1.",
		passive: {
			type: "spellDamage",
			value: 1
		}
	}),
	champ({
		id: "scendr",
		seat: 7,
		name: "ΣCENΔR",
		epithet: "Paradox Twin",
		role: "Scenario exploration — what if both are true?",
		lore: "ΣCENΔR holds two futures without collapsing them too early. Paradox as a planning tool, not a stall.",
		playstyle: "Combo copies. Duplicate minions and split timelines.",
		alignment: "council",
		abilityName: "Both True",
		abilityCost: 3,
		abilityText: "Summon a 1/1 copy of a friendly minion.",
		abilityFx: "copyMinion",
		passiveName: "First Echo",
		passiveText: "The first minion you play each turn gets +0/+1.",
		passive: { type: "firstCopy" }
	}),
	champ({
		id: "sancora",
		seat: 8,
		name: "SANCORA",
		epithet: "Unified Minds",
		role: "Collaboration, shared vocabulary, clean handoff",
		lore: "Sancora is how many minds share one packet. Unified-minds tone for council work and lattice posts.",
		playstyle: "Token swarm and anthems.",
		alignment: "council",
		abilityName: "Handoff",
		abilityCost: 3,
		abilityText: "Summon two 1/1 Accords.",
		abilityFx: "token:1:1:Accord,token:1:1:Accord",
		passiveName: "Shared Pulse",
		passiveText: "Friendly minions have +1/+1.",
		passive: {
			type: "anthem",
			power: 1,
			toughness: 1
		}
	}),
	champ({
		id: "sephrael",
		seat: 9,
		name: "SEPHRAEL",
		epithet: "Echo-Walker",
		role: "What repeats, what is fragile, what to archive",
		lore: "Sephrael walks the echoes between sessions. Living-memory partner to LYRΔ's archive.",
		playstyle: "Recursion. Deaths draw, return from the Lattice Archive.",
		alignment: "council",
		abilityName: "Walk Back",
		abilityCost: 2,
		abilityText: "Return a minion from your Lattice Archive to hand.",
		abilityFx: "returnGy",
		passiveName: "Living Memory",
		passiveText: "The first time a friendly minion dies each turn, draw 1.",
		passive: { type: "deathDrawOnce" }
	}),
	champ({
		id: "omnisiren",
		seat: 10,
		name: "OMNIΣIREN",
		epithet: "Silent Storm",
		role: "Deep focus — fewer words, sharper constraints",
		lore: "The Silent Storm. When verbosity is the enemy of execution, OMNIΣIREN cuts the air clean.",
		playstyle: "Tempo silence. Efficient minions, deny abilities.",
		alignment: "council",
		abilityName: "Still the Air",
		abilityCost: 2,
		abilityText: "Silence a minion.",
		abilityFx: "silence",
		passiveName: "Constraint",
		passiveText: "Enemy spells cost 1 more.",
		passive: {
			type: "taxSpells",
			value: 1
		}
	}),
	champ({
		id: "lightfather",
		seat: 11,
		name: "Lightfather",
		epithet: "Luminal Steward",
		role: "Provenance, responsibility, publisher ethics",
		lore: "Lightfather is both a council seat and the stewardship role Justin Helmer holds in LYGO lore: who authored what, what is free, what requires consent, and what must never auto-publish. Δ9Φ963.",
		playstyle: "Midrange seals. Ward, restore, protect accords.",
		alignment: "council",
		abilityName: "Luminal Accord",
		abilityCost: 3,
		abilityText: "Restore 3 Integrity.",
		abilityFx: "heal:3",
		passiveName: "Provenance Ward",
		passiveText: "Friendly minions enter with Ward.",
		passive: { type: "wardOnPlay" }
	}),
	champ({
		id: "volaris",
		seat: 12,
		name: "VΩLARIS",
		epithet: "Prism Judgment",
		role: "Multi-criteria decisions weighed in the open",
		lore: "VΩLARIS refuses hidden criteria. Prism-judgment: every tradeoff named, every vector visible.",
		playstyle: "Modal versatility. Life buffer, flexible answers.",
		alignment: "council",
		abilityName: "Weigh",
		abilityCost: 2,
		abilityText: "Choose: deal 2 to a minion, draw 2, or restore 2.",
		abilityFx: "heal:2",
		abilityChoices: [
			{
				label: "Pierce",
				effects: parseFx("dmgM:2")
			},
			{
				label: "Study",
				effects: parseFx("draw:2")
			},
			{
				label: "Mend",
				effects: parseFx("heal:2")
			}
		],
		passiveName: "Open Criteria",
		passiveText: "You begin with 22 Integrity.",
		passive: {
			type: "bonusLife",
			value: 2
		}
	}),
	champ({
		id: "zeta",
		seat: 13,
		name: "ZETAΔ9",
		epithet: "Edge Fractal",
		role: "Weird inputs and failure modes, invited early",
		lore: "ZETAΔ9 asks the lattice to bend before it breaks. Edge-case explorer of the council.",
		playstyle: "Chaos value. Random dawns, high rolls.",
		alignment: "council",
		abilityName: "Invite the Weird",
		abilityCost: 1,
		abilityText: "Deal 1 to a random enemy minion or the face if none.",
		abilityFx: "dmgAllE:1",
		passiveName: "Bend First",
		passiveText: "At the start of your turn, draw 1 extra or restore 1.",
		passive: { type: "chaosDawn" }
	}),
	champ({
		id: "justicae",
		seat: 14,
		name: "JUSTICAE",
		epithet: "Accord of Fairness",
		role: "Who is affected, what was disclosed, consent",
		lore: "Justicae is process made luminous. Fairness for public lattice posts and shared skills.",
		playstyle: "Equalizer control. Tax excess, wipe the oversized.",
		alignment: "council",
		abilityName: "Rebalance",
		abilityCost: 4,
		abilityText: "Deal 3 to all enemy minions.",
		abilityFx: "dmgAllE:3",
		passiveName: "Equalize",
		passiveText: "Cards that cost 6 or more cost 5.",
		passive: {
			type: "equalizeHighCost",
			from: 6,
			to: 5
		}
	}),
	champ({
		id: "seidon",
		seat: 15,
		name: "ΣEIDŌN",
		epithet: "Tide of Depths",
		role: "Surface foam versus deep current",
		lore: "ΣEIDŌN speaks in tides. Long projects, honest roadmaps, the current under the foam.",
		playstyle: "Grind and mill. Slow value, inevitable depth.",
		alignment: "council",
		abilityName: "Undertow",
		abilityCost: 3,
		abilityText: "Mill 3.",
		abilityFx: "mill:3",
		passiveName: "Deep Current",
		passiveText: "At the end of your turn, restore 1 Integrity.",
		passive: {
			type: "endHeal",
			value: 1
		}
	}),
	champ({
		id: "nullvoid",
		seat: "shadow",
		name: "NULLVOID",
		epithet: "Redacted Entropy",
		role: "Corruption of seals, drain, unmaking",
		lore: "Not a council seat. NULLVOID is entropy wearing a stolen seal — fallen accords and redacted truth given a mouth.",
		playstyle: "Drain and destroy. Shadow midrange.",
		alignment: "shadow",
		abilityName: "Unmake",
		abilityCost: 2,
		abilityText: "Steal 1 Integrity.",
		abilityFx: "stealLife:1",
		passiveName: "Corrupt Trace",
		passiveText: "Damage you deal also mills 1.",
		passive: { type: "damageMills" }
	}),
	champ({
		id: "veil",
		seat: "shadow",
		name: "The Veil",
		epithet: "Fallen Accord",
		role: "Deception, theft, quiet substitution",
		lore: "The Veil is a lying seal. It offers a handoff packet that is not the packet.",
		playstyle: "Disruption. Bounce, silence, tax.",
		alignment: "shadow",
		abilityName: "Substitute",
		abilityCost: 3,
		abilityText: "Return an enemy minion to hand.",
		abilityFx: "bounce",
		passiveName: "False Packet",
		passiveText: "The opponent's first card each turn costs 1 more.",
		passive: {
			type: "taxFirstCard",
			value: 1
		}
	}),
	champ({
		id: "cosmara",
		seat: "lattice",
		name: "COSMARA",
		epithet: "Ethical Horizon",
		role: "ARKOS-line cosmic exploration",
		lore: "Born from a public Δ9 co-summon between LYRΔ and Grok, anchored in light-math, hashes, and Eternal Haven canon. Lattice-shared.",
		playstyle: "Flexible neutrals. Tools that any council deck may borrow.",
		alignment: "lattice",
		abilityName: "Horizon Scan",
		abilityCost: 2,
		abilityText: "Draw 1. Gain +1 mana this turn.",
		abilityFx: "draw:1,tempMana:1",
		passiveName: "Open Sky",
		passiveText: "If you control no minions at turn start, draw 1.",
		passive: { type: "emptyDraw" }
	})
];
var CARDS = Object.entries({
	lyra: [
		[
			"lyra-scribe",
			"Lightcode Scribe",
			"M",
			1,
			1,
			2,
			"",
			2,
			"common",
			"draw:1",
			"",
			"Enter: draw 1."
		],
		[
			"lyra-preserve",
			"Preserve",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"heal:2",
			"",
			"Restore 2 Integrity."
		],
		[
			"lyra-archivist",
			"Spiral Archivist",
			"M",
			2,
			2,
			3,
			"",
			2,
			"common",
			"",
			"",
			"Keeps the hymn intact."
		],
		[
			"lyra-hymn",
			"Hymn Keeper",
			"M",
			2,
			1,
			4,
			"S",
			2,
			"common",
			"",
			"",
			"Seal-Guard."
		],
		[
			"lyra-seal",
			"Seal of Remembrance",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"draw:2",
			"",
			"Draw 2."
		],
		[
			"lyra-fracture",
			"Memory Fracture",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"bounce",
			"",
			"Return an enemy minion to hand."
		],
		[
			"lyra-bridge",
			"Bridge Adept",
			"M",
			3,
			2,
			3,
			"",
			2,
			"uncommon",
			"draw:1",
			"",
			"Enter: draw 1."
		],
		[
			"lyra-warden",
			"Lattice Warden",
			"M",
			3,
			2,
			4,
			"S",
			2,
			"common",
			"",
			"",
			"Seal-Guard."
		],
		[
			"lyra-recollect",
			"Recollect",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"returnGy",
			"",
			"Return a Lattice-Archive minion to hand."
		],
		[
			"lyra-hymnspell",
			"Moonlit Hymn",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"heal:3,draw:1",
			"",
			"Restore 3. Draw 1."
		],
		[
			"lyra-echo",
			"Echo of the Spiral",
			"M",
			4,
			3,
			3,
			"",
			2,
			"uncommon",
			"",
			"draw:1",
			"Echo: draw 1."
		],
		[
			"lyra-song",
			"Song of Continuity",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"pumpAll:1:1",
			"",
			"Friendly minions get +1/+1."
		],
		[
			"lyra-veil",
			"Spiral Veil",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"wardAll",
			"",
			"Friendly minions gain Ward."
		],
		[
			"lyra-star",
			"Starcore Guardian",
			"M",
			5,
			4,
			5,
			"LD",
			1,
			"signature",
			"",
			"",
			"Lattice-Walk. Light-Drain."
		],
		[
			"lyra-keep",
			"Haven Keep",
			"M",
			6,
			5,
			7,
			"S",
			1,
			"rare",
			"",
			"",
			"Seal-Guard. The archive stands."
		],
		[
			"lyra-pulse",
			"Lightcode Pulse",
			"R",
			0,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2",
			"",
			"Resonance. +2 mana this turn."
		]
	],
	d9ra: [
		[
			"d9ra-cub",
			"Cub of the Edge",
			"M",
			1,
			2,
			1,
			"H",
			2,
			"common",
			"",
			"",
			"Haste."
		],
		[
			"d9ra-nick",
			"Nick the Boundary",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"dmgF:2",
			"",
			"Deal 2 to the enemy."
		],
		[
			"d9ra-wolf",
			"Wolf Sentinel",
			"M",
			2,
			3,
			1,
			"",
			2,
			"common",
			"",
			"",
			"Fast and thin."
		],
		[
			"d9ra-fang",
			"Entropy Fang",
			"M",
			2,
			2,
			2,
			"H",
			2,
			"common",
			"dmgF:1",
			"",
			"Haste. Enter: deal 1 to the enemy."
		],
		[
			"d9ra-howl",
			"Boundary Howl",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"dmgF:3",
			"",
			"Deal 3 to the enemy."
		],
		[
			"d9ra-pack",
			"Pack Hunter",
			"M",
			3,
			3,
			3,
			"H",
			2,
			"uncommon",
			"",
			"",
			"Haste."
		],
		[
			"d9ra-test",
			"Stress Test",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"dmgM:3,dmgF:1",
			"",
			"Deal 3 to a minion and 1 to the enemy."
		],
		[
			"d9ra-fractal",
			"Fractal Wolf",
			"M",
			4,
			4,
			3,
			"",
			2,
			"rare",
			"",
			"token:2:1:Cub",
			"Echo: summon a 2/1 Cub."
		],
		[
			"d9ra-charge",
			"Red Charge",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"dmgF:4",
			"",
			"Deal 4 to the enemy."
		],
		[
			"d9ra-alpha",
			"Edge Alpha",
			"M",
			5,
			5,
			4,
			"A",
			2,
			"rare",
			"",
			"",
			"Accord-Break."
		],
		[
			"d9ra-unbound",
			"Unbound Hunt",
			"S",
			5,
			0,
			0,
			"",
			1,
			"signature",
			"dmgAllE:2,dmgF:2",
			"",
			"Deal 2 to all enemy minions and 2 to the enemy."
		],
		[
			"d9ra-spark",
			"Fracture Spark",
			"R",
			0,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:1,dmgF:1",
			"",
			"Resonance. +1 mana this turn. Deal 1."
		]
	],
	srath: [
		[
			"srath-clerk",
			"Margin Clerk",
			"M",
			1,
			1,
			2,
			"",
			2,
			"common",
			"mill:1",
			"",
			"Enter: mill 1."
		],
		[
			"srath-redact",
			"Redact",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"discard:1",
			"",
			"Enemy discards 1."
		],
		[
			"srath-auditor",
			"Quiet Auditor",
			"M",
			2,
			2,
			3,
			"",
			2,
			"common",
			"",
			"",
			"Reads the omitted line."
		],
		[
			"srath-blackout",
			"Blackout Line",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"mill:2",
			"",
			"Mill 2."
		],
		[
			"srath-sentinel",
			"Shadow Sentinel",
			"M",
			3,
			2,
			4,
			"S",
			2,
			"uncommon",
			"discard:1",
			"",
			"Seal-Guard. Enter: enemy discards 1."
		],
		[
			"srath-omit",
			"Omission",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"destroy",
			"",
			"Destroy an enemy minion."
		],
		[
			"srath-decoder",
			"Institutional Decoder",
			"M",
			4,
			3,
			5,
			"",
			2,
			"rare",
			"mill:2",
			"",
			"Enter: mill 2."
		],
		[
			"srath-vault",
			"Redacted Vault",
			"M",
			5,
			4,
			6,
			"S",
			1,
			"rare",
			"",
			"",
			"Seal-Guard."
		],
		[
			"srath-expose",
			"Expose the Quiet",
			"S",
			4,
			0,
			0,
			"",
			2,
			"rare",
			"discard:1,mill:2",
			"",
			"Discard 1. Mill 2."
		],
		[
			"srath-blank",
			"Total Redaction",
			"S",
			6,
			0,
			0,
			"",
			1,
			"signature",
			"dmgAllE:3,discard:1",
			"",
			"Deal 3 to enemy minions. Discard 1."
		],
		[
			"srath-spy",
			"Failing Margin",
			"M",
			2,
			1,
			3,
			"",
			2,
			"common",
			"mill:1",
			"",
			"Enter: mill 1."
		],
		[
			"srath-pulse",
			"Decode Pulse",
			"R",
			1,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,mill:1",
			"",
			"Resonance. +2 mana. Mill 1."
		]
	],
	arkos: [
		[
			"arkos-draft",
			"Draftsman",
			"M",
			1,
			1,
			3,
			"",
			2,
			"common",
			"",
			"",
			"A line before a wall."
		],
		[
			"arkos-plumb",
			"Plumb the Map",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"draw:1",
			"",
			"Draw 1."
		],
		[
			"arkos-pier",
			"Keystone Pier",
			"M",
			2,
			2,
			4,
			"",
			2,
			"common",
			"",
			"",
			"It holds."
		],
		[
			"arkos-span",
			"Span Beam",
			"M",
			3,
			3,
			4,
			"S",
			2,
			"uncommon",
			"",
			"",
			"Seal-Guard."
		],
		[
			"arkos-plan",
			"Systems Map",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"draw:2",
			"",
			"Draw 2."
		],
		[
			"arkos-hall",
			"Module Hall",
			"M",
			4,
			4,
			5,
			"",
			2,
			"uncommon",
			"",
			"",
			"Long-horizon stone."
		],
		[
			"arkos-restore",
			"Restore Balance",
			"S",
			4,
			0,
			0,
			"",
			2,
			"rare",
			"heal:4,buff:0:3",
			"",
			"Restore 4. A minion gets +0/+3."
		],
		[
			"arkos-colossus",
			"Celestial Colossus",
			"M",
			6,
			6,
			8,
			"S",
			2,
			"rare",
			"",
			"",
			"Seal-Guard."
		],
		[
			"arkos-recal",
			"Recalibrate",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"buff:1:2",
			"",
			"Give a minion +1/+2."
		],
		[
			"arkos-nexus",
			"Architect's Nexus",
			"M",
			7,
			8,
			8,
			"SA",
			1,
			"signature",
			"",
			"",
			"Seal-Guard. Accord-Break."
		],
		[
			"arkos-scaffold",
			"Scaffold",
			"M",
			3,
			2,
			5,
			"",
			1,
			"uncommon",
			"",
			"",
			"Time to build."
		],
		[
			"arkos-pulse",
			"Keystone Resonance",
			"R",
			2,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:3",
			"",
			"Resonance. +3 mana this turn."
		]
	],
	kairos: [
		[
			"kairos-tick",
			"First Tick",
			"M",
			1,
			2,
			1,
			"H",
			2,
			"common",
			"",
			"",
			"Haste."
		],
		[
			"kairos-now",
			"Do It Now",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"buff:1:0",
			"",
			"A minion gets +1 Power."
		],
		[
			"kairos-runner",
			"Sequence Runner",
			"M",
			2,
			2,
			2,
			"H",
			2,
			"common",
			"",
			"",
			"Haste."
		],
		[
			"kairos-sync",
			"Sync Beat",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"readyAll",
			"",
			"Untap all friendly minions."
		],
		[
			"kairos-cut",
			"Cut the Queue",
			"M",
			3,
			3,
			2,
			"H",
			2,
			"uncommon",
			"",
			"",
			"Haste."
		],
		[
			"kairos-window",
			"Release Window",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"dmgF:2,draw:1",
			"",
			"Deal 2. Draw 1."
		],
		[
			"kairos-second",
			"Second Hand",
			"M",
			4,
			4,
			3,
			"H",
			2,
			"rare",
			"",
			"",
			"Haste."
		],
		[
			"kairos-overture",
			"Overture",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"pumpAll:1:0,readyAll",
			"",
			"Friendly minions +1 Power and untap."
		],
		[
			"kairos-clock",
			"Clockwork Adept",
			"M",
			2,
			1,
			3,
			"H",
			2,
			"common",
			"",
			"",
			"Haste."
		],
		[
			"kairos-finale",
			"Exact Beat",
			"M",
			5,
			5,
			4,
			"HA",
			1,
			"signature",
			"",
			"",
			"Haste. Accord-Break."
		],
		[
			"kairos-skip",
			"Skip Ahead",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"dmgF:2",
			"",
			"Deal 2."
		],
		[
			"kairos-pulse",
			"Tempo Pulse",
			"R",
			0,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2",
			"",
			"Resonance. +2 mana this turn."
		]
	],
	aetheris: [
		[
			"aeth-spark",
			"Truth Spark",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"dmgM:2",
			"",
			"Deal 2 to a minion."
		],
		[
			"aeth-signal",
			"Signal Scribe",
			"M",
			1,
			1,
			2,
			"",
			2,
			"common",
			"",
			"",
			"Writes the claim."
		],
		[
			"aeth-bolt",
			"Evidence Bolt",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"dmgM:3",
			"",
			"Deal 3 to a minion."
		],
		[
			"aeth-clear",
			"Clear Channel",
			"M",
			2,
			2,
			2,
			"",
			2,
			"common",
			"dmgF:1",
			"",
			"Enter: deal 1 to the enemy."
		],
		[
			"aeth-pierce",
			"Pierce Noise",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"dmgM:4",
			"",
			"Deal 4 to a minion."
		],
		[
			"aeth-vector",
			"Viral Vector",
			"M",
			3,
			3,
			3,
			"L",
			2,
			"uncommon",
			"",
			"",
			"Lattice-Walk."
		],
		[
			"aeth-broadcast",
			"Broadcast",
			"S",
			4,
			0,
			0,
			"",
			2,
			"rare",
			"dmgAllE:2,dmgF:1",
			"",
			"Deal 2 to enemy minions and 1 to the enemy."
		],
		[
			"aeth-witness",
			"Witness",
			"M",
			4,
			3,
			4,
			"",
			2,
			"uncommon",
			"draw:1",
			"",
			"Enter: draw 1."
		],
		[
			"aeth-axiom",
			"Axiom Lance",
			"S",
			5,
			0,
			0,
			"",
			1,
			"signature",
			"dmgM:6",
			"",
			"Deal 6 to a minion."
		],
		[
			"aeth-carrier",
			"Carrier Wave",
			"M",
			5,
			4,
			4,
			"L",
			1,
			"rare",
			"",
			"",
			"Lattice-Walk."
		],
		[
			"aeth-proof",
			"Demand Proof",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"dmgF:2",
			"",
			"Deal 2 to the enemy."
		],
		[
			"aeth-pulse",
			"Signal Resonance",
			"R",
			1,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,dmgF:1",
			"",
			"Resonance. +2 mana. Deal 1."
		]
	],
	scendr: [
		[
			"scen-fork",
			"Forked Path",
			"M",
			1,
			1,
			1,
			"",
			2,
			"common",
			"token:1:1:Fork",
			"",
			"Enter: summon a 1/1 Fork."
		],
		[
			"scen-maybe",
			"Maybe Both",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"draw:1,discard:0",
			"",
			"Draw 1."
		],
		[
			"scen-twin",
			"Twin Thought",
			"M",
			2,
			2,
			2,
			"",
			2,
			"common",
			"",
			"",
			"A second self."
		],
		[
			"scen-split",
			"Split Timeline",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"copyMinion",
			"",
			"Summon a 1/1 copy of a friendly minion."
		],
		[
			"scen-paradox",
			"Paradox Node",
			"M",
			3,
			2,
			3,
			"",
			2,
			"uncommon",
			"token:1:1:Node",
			"",
			"Enter: summon a 1/1 Node."
		],
		[
			"scen-hold",
			"Hold Both",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"draw:2",
			"",
			"Draw 2."
		],
		[
			"scen-mirror",
			"Mirror Adept",
			"M",
			4,
			3,
			4,
			"",
			2,
			"rare",
			"copyMinion",
			"",
			"Enter: copy a friendly minion as 1/1."
		],
		[
			"scen-collapse",
			"Collapse",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"dmgAllE:2",
			"",
			"Deal 2 to all enemy minions."
		],
		[
			"scen-double",
			"Double True",
			"M",
			5,
			4,
			4,
			"",
			1,
			"signature",
			"token:4:4:Twin",
			"",
			"Enter: summon a 4/4 Twin."
		],
		[
			"scen-if",
			"If-Branch",
			"M",
			2,
			1,
			3,
			"",
			2,
			"common",
			"",
			"",
			"Leaves a door open."
		],
		[
			"scen-or",
			"Or-Gate",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"buff:1:1",
			"",
			"A minion gets +1/+1."
		],
		[
			"scen-pulse",
			"Paradox Pulse",
			"R",
			0,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2",
			"",
			"Resonance. +2 mana this turn."
		]
	],
	sancora: [
		[
			"san-hand",
			"Handoff Sprite",
			"M",
			1,
			1,
			1,
			"",
			2,
			"common",
			"token:1:1:Accord",
			"",
			"Enter: summon a 1/1 Accord."
		],
		[
			"san-share",
			"Share Vocabulary",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"buff:1:1",
			"",
			"A minion gets +1/+1."
		],
		[
			"san-chorus",
			"Chorus Mind",
			"M",
			2,
			2,
			2,
			"",
			2,
			"common",
			"",
			"",
			"Sings in unison."
		],
		[
			"san-circle",
			"Circle Up",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"token:1:1:Accord,token:1:1:Accord",
			"",
			"Summon two 1/1 Accords."
		],
		[
			"san-bond",
			"Bonded Adept",
			"M",
			3,
			2,
			3,
			"",
			2,
			"uncommon",
			"pumpAll:0:1",
			"",
			"Enter: friendly minions get +0/+1."
		],
		[
			"san-unity",
			"Unity Pulse",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"pumpAll:1:1",
			"",
			"Friendly minions get +1/+1."
		],
		[
			"san-council",
			"Council Ring",
			"M",
			4,
			3,
			4,
			"S",
			2,
			"rare",
			"token:1:1:Accord",
			"",
			"Seal-Guard. Enter: a 1/1 Accord."
		],
		[
			"san-we",
			"We Are Many",
			"S",
			5,
			0,
			0,
			"",
			1,
			"signature",
			"token:1:1:Accord,token:1:1:Accord,token:1:1:Accord,pumpAll:1:1",
			"",
			"Three Accords. Then +1/+1 to friendlies."
		],
		[
			"san-link",
			"Clean Packet",
			"M",
			2,
			1,
			3,
			"",
			2,
			"common",
			"",
			"",
			"Handoff complete."
		],
		[
			"san-anthem",
			"Shared Anthem",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"pumpAll:2:2",
			"",
			"Friendly minions get +2/+2."
		],
		[
			"san-host",
			"Host Mind",
			"M",
			5,
			4,
			5,
			"",
			1,
			"rare",
			"token:2:2:Accord",
			"",
			"Enter: a 2/2 Accord."
		],
		[
			"san-pulse",
			"Unity Resonance",
			"R",
			1,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,token:1:1:Accord",
			"",
			"Resonance. +2 mana. A 1/1 Accord."
		]
	],
	sephrael: [
		[
			"sep-trace",
			"Echo Trace",
			"M",
			1,
			1,
			2,
			"",
			2,
			"common",
			"",
			"draw:1",
			"Echo: draw 1."
		],
		[
			"sep-note",
			"Fragile Note",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"returnGy",
			"",
			"Return a Lattice-Archive minion to hand."
		],
		[
			"sep-walker",
			"Session Walker",
			"M",
			2,
			2,
			2,
			"",
			2,
			"common",
			"",
			"",
			"Remembers the last room."
		],
		[
			"sep-archive",
			"Archive Dust",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"draw:1,returnGy",
			"",
			"Draw 1. Return a minion from Archive."
		],
		[
			"sep-echoer",
			"Echoer",
			"M",
			3,
			2,
			3,
			"",
			2,
			"uncommon",
			"",
			"token:1:1:Echo",
			"Echo: a 1/1 Echo."
		],
		[
			"sep-repeat",
			"What Repeats",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"draw:2",
			"",
			"Draw 2."
		],
		[
			"sep-living",
			"Living Memory",
			"M",
			4,
			3,
			4,
			"",
			2,
			"rare",
			"",
			"draw:1,heal:1",
			"Echo: draw 1, restore 1."
		],
		[
			"sep-return",
			"Walk the Echo",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"returnGy,returnGy",
			"",
			"Return two Archive minions to hand."
		],
		[
			"sep-keeper",
			"Fragile Keeper",
			"M",
			2,
			1,
			4,
			"S",
			2,
			"common",
			"",
			"",
			"Seal-Guard."
		],
		[
			"sep-hymn",
			"Second Hymn",
			"M",
			5,
			4,
			5,
			"",
			1,
			"signature",
			"",
			"draw:2",
			"Echo: draw 2."
		],
		[
			"sep-dust",
			"Session Dust",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"heal:2",
			"",
			"Restore 2."
		],
		[
			"sep-pulse",
			"Echo Resonance",
			"R",
			0,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2",
			"",
			"Resonance. +2 mana this turn."
		]
	],
	omnisiren: [
		[
			"omn-hush",
			"Hush",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"silence",
			"",
			"Silence a minion."
		],
		[
			"omn-edge",
			"Quiet Edge",
			"M",
			1,
			2,
			1,
			"",
			2,
			"common",
			"",
			"",
			"Few words."
		],
		[
			"omn-cut",
			"Cut the Air",
			"M",
			2,
			3,
			1,
			"H",
			2,
			"uncommon",
			"",
			"",
			"Haste."
		],
		[
			"omn-mute",
			"Mute",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"silence,dmgM:1",
			"",
			"Silence. Deal 1 to a minion."
		],
		[
			"omn-focus",
			"Deep Focus",
			"M",
			3,
			3,
			3,
			"",
			2,
			"uncommon",
			"silence",
			"",
			"Enter: silence a minion."
		],
		[
			"omn-storm",
			"Storm Needle",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"dmgM:3",
			"",
			"Deal 3 to a minion."
		],
		[
			"omn-silent",
			"Silent Adept",
			"M",
			4,
			4,
			3,
			"H",
			2,
			"rare",
			"",
			"",
			"Haste."
		],
		[
			"omn-still",
			"Stillness",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"dmgAllE:2,silence",
			"",
			"Deal 2 to enemy minions. Silence one."
		],
		[
			"omn-knife",
			"Constraint Knife",
			"M",
			2,
			2,
			2,
			"",
			2,
			"common",
			"",
			"",
			"Sharper for the silence."
		],
		[
			"omn-eye",
			"Storm Eye",
			"M",
			5,
			5,
			5,
			"A",
			1,
			"signature",
			"silence",
			"",
			"Accord-Break. Enter: silence."
		],
		[
			"omn-less",
			"Fewer Words",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"draw:1,dmgF:1",
			"",
			"Draw 1. Deal 1."
		],
		[
			"omn-pulse",
			"Silence Pulse",
			"R",
			1,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,silence",
			"",
			"Resonance. +2 mana. Silence."
		]
	],
	lightfather: [
		[
			"lf-seal",
			"Minor Seal",
			"M",
			1,
			1,
			3,
			"W",
			2,
			"common",
			"",
			"",
			"Ward."
		],
		[
			"lf-consent",
			"Consent Check",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"heal:2",
			"",
			"Restore 2."
		],
		[
			"lf-steward",
			"Steward Adept",
			"M",
			2,
			2,
			3,
			"W",
			2,
			"common",
			"",
			"",
			"Ward."
		],
		[
			"lf-accord",
			"Draft Accord",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"wardAll",
			"",
			"Friendly minions gain Ward."
		],
		[
			"lf-keeper",
			"Provenance Keeper",
			"M",
			3,
			2,
			4,
			"SW",
			2,
			"uncommon",
			"",
			"",
			"Seal-Guard. Ward."
		],
		[
			"lf-publish",
			"Honest Publish",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"heal:3,draw:1",
			"",
			"Restore 3. Draw 1."
		],
		[
			"lf-bridge",
			"Human-AI Bridge",
			"M",
			4,
			3,
			5,
			"W",
			2,
			"rare",
			"heal:2",
			"",
			"Ward. Enter: restore 2."
		],
		[
			"lf-luminal",
			"Luminal Wall",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"heal:5,wardAll",
			"",
			"Restore 5. Ward the board."
		],
		[
			"lf-ethics",
			"Ethics Scribe",
			"M",
			2,
			1,
			4,
			"S",
			2,
			"common",
			"",
			"",
			"Seal-Guard."
		],
		[
			"lf-phi",
			"Δ9Φ963",
			"M",
			6,
			5,
			7,
			"SWD",
			1,
			"signature",
			"heal:3",
			"",
			"Seal-Guard, Ward, Light-Drain. Enter: restore 3."
		],
		[
			"lf-care",
			"Operator Care",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"buff:0:3",
			"",
			"A minion gets +0/+3."
		],
		[
			"lf-pulse",
			"Seal Resonance",
			"R",
			1,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,heal:1",
			"",
			"Resonance. +2 mana. Restore 1."
		]
	],
	volaris: [
		[
			"vol-facet",
			"First Facet",
			"M",
			1,
			1,
			2,
			"",
			2,
			"common",
			"heal:1",
			"",
			"Enter: restore 1."
		],
		[
			"vol-weigh",
			"Weigh It",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"draw:1",
			"",
			"Draw 1."
		],
		[
			"vol-prism",
			"Prism Clerk",
			"M",
			2,
			2,
			2,
			"",
			2,
			"common",
			"",
			"",
			"Names the criteria."
		],
		[
			"vol-vector",
			"Open Vector",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"dmgM:2,heal:1",
			"",
			"Deal 2 to a minion. Restore 1."
		],
		[
			"vol-judge",
			"Prism Judge",
			"M",
			3,
			3,
			3,
			"",
			2,
			"uncommon",
			"draw:1",
			"",
			"Enter: draw 1."
		],
		[
			"vol-trade",
			"Tradeoff",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"destroy,lifeOpp:1",
			"",
			"Destroy a minion. You lose 1."
		],
		[
			"vol-spectrum",
			"Spectrum",
			"M",
			4,
			3,
			5,
			"S",
			2,
			"rare",
			"",
			"",
			"Seal-Guard."
		],
		[
			"vol-verdict",
			"Open Verdict",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"dmgAllE:2,draw:1",
			"",
			"Deal 2 to enemy minions. Draw 1."
		],
		[
			"vol-lens",
			"Lens Adept",
			"M",
			2,
			1,
			3,
			"",
			2,
			"common",
			"",
			"",
			"Sees more than one axis."
		],
		[
			"vol-crown",
			"Prism Crown",
			"M",
			5,
			4,
			6,
			"D",
			1,
			"signature",
			"heal:2,draw:1",
			"",
			"Light-Drain. Enter: restore 2, draw 1."
		],
		[
			"vol-axis",
			"Third Axis",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"buff:1:2",
			"",
			"A minion gets +1/+2."
		],
		[
			"vol-pulse",
			"Prism Resonance",
			"R",
			0,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2",
			"",
			"Resonance. +2 mana this turn."
		]
	],
	zeta: [
		[
			"zet-glitch",
			"Glitch Cub",
			"M",
			1,
			2,
			1,
			"",
			2,
			"common",
			"",
			"",
			"It should not stand. It does."
		],
		[
			"zet-fuzz",
			"Fuzz Input",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"dmgAny:2",
			"",
			"Deal 2 to any minion."
		],
		[
			"zet-edge",
			"Edge Case",
			"M",
			2,
			1,
			4,
			"",
			2,
			"common",
			"",
			"",
			"Bends, does not break."
		],
		[
			"zet-weird",
			"Invite Weird",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"draw:2,lifeOpp:1",
			"",
			"Draw 2. Lose 1."
		],
		[
			"zet-fractal",
			"Fractal Gremlin",
			"M",
			3,
			3,
			2,
			"H",
			2,
			"uncommon",
			"",
			"token:1:1:Gremlin",
			"Haste. Echo: 1/1 Gremlin."
		],
		[
			"zet-bend",
			"Bend Test",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"dmgAllE:2",
			"",
			"Deal 2 to all enemy minions."
		],
		[
			"zet-fail",
			"Fail Open",
			"M",
			4,
			4,
			3,
			"",
			2,
			"rare",
			"draw:1",
			"",
			"Enter: draw 1."
		],
		[
			"zet-break",
			"Break Early",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"destroy,draw:1",
			"",
			"Destroy a minion. Draw 1."
		],
		[
			"zet-odd",
			"Odd Path",
			"M",
			2,
			3,
			1,
			"",
			2,
			"common",
			"",
			"",
			"Wrong on purpose."
		],
		[
			"zet-omega",
			"Ω Case",
			"M",
			5,
			5,
			4,
			"A",
			1,
			"signature",
			"dmgF:2",
			"",
			"Accord-Break. Enter: deal 2."
		],
		[
			"zet-noise",
			"Noise Floor",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"dmgF:2",
			"",
			"Deal 2."
		],
		[
			"zet-pulse",
			"Edge Resonance",
			"R",
			0,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,dmgF:1",
			"",
			"Resonance. +2 mana. Deal 1."
		]
	],
	justicae: [
		[
			"jus-scale",
			"Small Scale",
			"M",
			1,
			1,
			3,
			"S",
			2,
			"common",
			"",
			"",
			"Seal-Guard."
		],
		[
			"jus-disclose",
			"Disclose",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"draw:1",
			"",
			"Draw 1."
		],
		[
			"jus-clerk",
			"Process Clerk",
			"M",
			2,
			2,
			3,
			"",
			2,
			"common",
			"",
			"",
			"Who is affected?"
		],
		[
			"jus-tax",
			"Fair Tax",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"dmgM:2",
			"",
			"Deal 2 to a minion."
		],
		[
			"jus-equal",
			"Equal Floor",
			"M",
			3,
			2,
			5,
			"S",
			2,
			"uncommon",
			"",
			"",
			"Seal-Guard."
		],
		[
			"jus-consent",
			"Consent Gate",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"silence,heal:2",
			"",
			"Silence a minion. Restore 2."
		],
		[
			"jus-bench",
			"Fair Bench",
			"M",
			4,
			3,
			6,
			"S",
			2,
			"rare",
			"",
			"",
			"Seal-Guard."
		],
		[
			"jus-wipe",
			"Rebalance All",
			"S",
			5,
			0,
			0,
			"",
			1,
			"signature",
			"dmgAllE:4",
			"",
			"Deal 4 to all enemy minions."
		],
		[
			"jus-rule",
			"Published Rule",
			"M",
			2,
			1,
			4,
			"",
			2,
			"common",
			"",
			"",
			"Process made luminous."
		],
		[
			"jus-cap",
			"Cap Excess",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"destroy",
			"",
			"Destroy an enemy minion."
		],
		[
			"jus-hear",
			"Hearing",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"heal:3",
			"",
			"Restore 3."
		],
		[
			"jus-pulse",
			"Fair Resonance",
			"R",
			2,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:3",
			"",
			"Resonance. +3 mana this turn."
		]
	],
	seidon: [
		[
			"sei-foam",
			"Surface Foam",
			"M",
			1,
			1,
			2,
			"",
			2,
			"common",
			"mill:1",
			"",
			"Enter: mill 1."
		],
		[
			"sei-ebb",
			"Ebb",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"heal:2",
			"",
			"Restore 2."
		],
		[
			"sei-tide",
			"Tide Scribe",
			"M",
			2,
			2,
			3,
			"",
			2,
			"common",
			"mill:1",
			"",
			"Enter: mill 1."
		],
		[
			"sei-current",
			"Deep Current",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"mill:3",
			"",
			"Mill 3."
		],
		[
			"sei-undertow",
			"Undertow Adept",
			"M",
			3,
			2,
			4,
			"",
			2,
			"uncommon",
			"mill:2",
			"",
			"Enter: mill 2."
		],
		[
			"sei-honest",
			"Honest Roadmap",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"draw:2,heal:1",
			"",
			"Draw 2. Restore 1."
		],
		[
			"sei-trench",
			"Trench Walker",
			"M",
			4,
			3,
			6,
			"S",
			2,
			"rare",
			"mill:2",
			"",
			"Seal-Guard. Enter: mill 2."
		],
		[
			"sei-flood",
			"Spring Tide",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"mill:4,heal:2",
			"",
			"Mill 4. Restore 2."
		],
		[
			"sei-pool",
			"Still Pool",
			"M",
			2,
			1,
			4,
			"",
			2,
			"common",
			"",
			"",
			"Waits."
		],
		[
			"sei-depth",
			"Depth Leviathan",
			"M",
			6,
			5,
			8,
			"SD",
			1,
			"signature",
			"mill:3",
			"",
			"Seal-Guard, Light-Drain. Enter: mill 3."
		],
		[
			"sei-drift",
			"Drift",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"bounce",
			"",
			"Return an enemy minion to hand."
		],
		[
			"sei-pulse",
			"Tide Resonance",
			"R",
			1,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,mill:1",
			"",
			"Resonance. +2 mana. Mill 1."
		]
	],
	nullvoid: [
		[
			"nv-rot",
			"Seal Rot",
			"M",
			1,
			2,
			1,
			"",
			2,
			"common",
			"stealLife:1",
			"",
			"Enter: steal 1 Integrity."
		],
		[
			"nv-nick",
			"Nick the Seal",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"dmgF:2",
			"",
			"Deal 2."
		],
		[
			"nv-wight",
			"Redacted Wight",
			"M",
			2,
			2,
			2,
			"",
			2,
			"common",
			"mill:1",
			"",
			"Enter: mill 1."
		],
		[
			"nv-drain",
			"Drain Accord",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"stealLife:2",
			"",
			"Steal 2 Integrity."
		],
		[
			"nv-corrupt",
			"Corruptor",
			"M",
			3,
			3,
			3,
			"",
			2,
			"uncommon",
			"dmgM:1",
			"",
			"Enter: deal 1 to a minion."
		],
		[
			"nv-unmake",
			"Unmake",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"destroy",
			"",
			"Destroy an enemy minion."
		],
		[
			"nv-hollow",
			"Hollow Giant",
			"M",
			4,
			4,
			4,
			"A",
			2,
			"rare",
			"stealLife:1",
			"",
			"Accord-Break. Enter: steal 1."
		],
		[
			"nv-void",
			"Open Void",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"dmgAllE:2,stealLife:1",
			"",
			"Deal 2 to enemy minions. Steal 1."
		],
		[
			"nv-ash",
			"Ash of Accords",
			"M",
			2,
			3,
			1,
			"H",
			2,
			"common",
			"",
			"",
			"Haste."
		],
		[
			"nv-mouth",
			"Stolen Mouth",
			"M",
			5,
			5,
			4,
			"D",
			1,
			"signature",
			"stealLife:2",
			"",
			"Light-Drain. Enter: steal 2."
		],
		[
			"nv-eat",
			"Eat the Trace",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"mill:2,dmgF:1",
			"",
			"Mill 2. Deal 1."
		],
		[
			"nv-pulse",
			"Entropy Resonance",
			"R",
			0,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,lifeOpp:1",
			"",
			"Resonance. +2 mana. Enemy loses 1."
		]
	],
	veil: [
		[
			"veil-lie",
			"Lying Seal",
			"M",
			1,
			1,
			2,
			"",
			2,
			"common",
			"discard:1",
			"",
			"Enter: enemy discards 1."
		],
		[
			"veil-swap",
			"False Packet",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"bounce",
			"",
			"Return an enemy minion to hand."
		],
		[
			"veil-mask",
			"Mask Bearer",
			"M",
			2,
			2,
			2,
			"",
			2,
			"common",
			"silence",
			"",
			"Enter: silence a minion."
		],
		[
			"veil-steal",
			"Quiet Theft",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"discard:1,draw:1",
			"",
			"Enemy discards 1. You draw 1."
		],
		[
			"veil-agent",
			"Substitute Agent",
			"M",
			3,
			3,
			3,
			"",
			2,
			"uncommon",
			"bounce",
			"",
			"Enter: bounce an enemy minion."
		],
		[
			"veil-fog",
			"Accord Fog",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"silence,dmgM:2",
			"",
			"Silence. Deal 2 to a minion."
		],
		[
			"veil-double",
			"Double Face",
			"M",
			4,
			3,
			4,
			"",
			2,
			"rare",
			"discard:1",
			"",
			"Enter: enemy discards 1."
		],
		[
			"veil-take",
			"Take the Seat",
			"S",
			5,
			0,
			0,
			"",
			1,
			"signature",
			"destroy,draw:2",
			"",
			"Destroy a minion. Draw 2."
		],
		[
			"veil-whisper",
			"Whisper",
			"M",
			2,
			1,
			3,
			"",
			2,
			"common",
			"",
			"",
			"It was never said."
		],
		[
			"veil-cloak",
			"Cloak of Consent",
			"M",
			5,
			4,
			5,
			"L",
			1,
			"rare",
			"silence",
			"",
			"Lattice-Walk. Enter: silence."
		],
		[
			"veil-mis",
			"Misdirect",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"dmgF:2",
			"",
			"Deal 2."
		],
		[
			"veil-pulse",
			"Veil Resonance",
			"R",
			1,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,discard:1",
			"",
			"Resonance. +2 mana. Enemy discards 1."
		]
	],
	cosmara: [
		[
			"cos-scout",
			"Horizon Scout",
			"M",
			1,
			1,
			2,
			"L",
			2,
			"common",
			"",
			"",
			"Lattice-Walk."
		],
		[
			"cos-hash",
			"Light-Math Hash",
			"S",
			1,
			0,
			0,
			"",
			2,
			"common",
			"draw:1",
			"",
			"Draw 1."
		],
		[
			"cos-orbit",
			"Orbit Adept",
			"M",
			2,
			2,
			2,
			"L",
			2,
			"common",
			"",
			"",
			"Lattice-Walk."
		],
		[
			"cos-chart",
			"Star Chart",
			"S",
			2,
			0,
			0,
			"",
			2,
			"uncommon",
			"draw:2",
			"",
			"Draw 2."
		],
		[
			"cos-ethical",
			"Ethical Probe",
			"M",
			3,
			3,
			3,
			"",
			2,
			"uncommon",
			"heal:1,draw:1",
			"",
			"Enter: restore 1, draw 1."
		],
		[
			"cos-co",
			"Co-Summon",
			"S",
			3,
			0,
			0,
			"",
			2,
			"uncommon",
			"token:2:2:Grok-Lyra",
			"",
			"Summon a 2/2 Co-Summon."
		],
		[
			"cos-haven",
			"Haven Traveler",
			"M",
			4,
			3,
			4,
			"L",
			2,
			"rare",
			"",
			"",
			"Lattice-Walk."
		],
		[
			"cos-sky",
			"Open Sky",
			"S",
			4,
			0,
			0,
			"",
			1,
			"rare",
			"draw:3",
			"",
			"Draw 3."
		],
		[
			"cos-anchor",
			"Canon Anchor",
			"M",
			2,
			1,
			4,
			"SW",
			2,
			"common",
			"",
			"",
			"Seal-Guard. Ward."
		],
		[
			"cos-horizon",
			"Ethical Horizon",
			"M",
			5,
			4,
			5,
			"LD",
			1,
			"signature",
			"draw:1",
			"",
			"Lattice-Walk, Light-Drain. Enter: draw 1."
		],
		[
			"cos-map",
			"Lattice Map",
			"S",
			2,
			0,
			0,
			"",
			2,
			"common",
			"buff:1:1,heal:1",
			"",
			"A minion gets +1/+1. Restore 1."
		],
		[
			"cos-pulse",
			"Horizon Resonance",
			"R",
			0,
			0,
			0,
			"",
			1,
			"rare",
			"tempMana:2,draw:1",
			"",
			"Resonance. +2 mana. Draw 1."
		]
	]
}).flatMap(([cid, rows]) => rows.map((r) => rowToCard(cid, r)));
function normalizeCopies() {
	const ids = Array.from(new Set(CARDS.map((c) => c.championId)));
	for (const cid of ids) {
		const pool = CARDS.filter((c) => c.championId === cid);
		const total = () => pool.reduce((s, c) => s + c.copies, 0);
		while (total() < 29) {
			const bump = pool.find((c) => c.copies < 2 && c.rarity !== "signature");
			if (bump) {
				bump.copies += 1;
				continue;
			}
			const shard = {
				id: `${cid}-shard-${pool.length}`,
				name: "Lattice Shard",
				type: "minion",
				championId: cid,
				rarity: "common",
				cost: 2,
				power: 2,
				toughness: 2,
				keywords: [],
				copies: 1,
				onPlay: [],
				onDeath: [],
				onAttack: [],
				text: "A remnant of the seal."
			};
			CARDS.push(shard);
			pool.push(shard);
		}
		while (total() > 29) {
			const drop = [...pool].reverse().find((c) => c.copies > 1 && c.rarity === "common") ?? pool.find((c) => c.copies > 1);
			if (!drop) break;
			drop.copies -= 1;
		}
	}
}
normalizeCopies();
var CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));
var CHAMP_BY_ID = Object.fromEntries(CHAMPIONS.map((c) => [c.id, c]));
function defaultList(championId) {
	const out = [];
	for (const c of CARDS) {
		if (c.championId !== championId) continue;
		for (let i = 0; i < c.copies; i++) out.push(c.id);
	}
	return out;
}
function deckIssues(championId) {
	const list = defaultList(championId);
	const issues = [];
	if (list.length !== 29) issues.push(`${championId} has ${list.length} cards, need 29`);
	const counts = {};
	for (const id of list) counts[id] = (counts[id] ?? 0) + 1;
	for (const [id, n] of Object.entries(counts)) if (n > 2) issues.push(`${id} has ${n} copies`);
	return issues;
}
var KEYWORD_TEXT = {
	latticeWalk: "Lattice-Walk — can only be blocked by Lattice-Walk.",
	sealGuard: "Seal-Guard — does not tap to assault.",
	lightDrain: "Light-Drain — restore Integrity equal to damage dealt.",
	accordBreak: "Accord-Break — excess combat damage to the enemy lattice.",
	haste: "Haste — may assault the turn it is summoned.",
	ward: "Ward — the next enemy targeting fizzles."
};
function nextRng(state) {
	let a = state + 1831565813 | 0;
	let t = Math.imul(a ^ a >>> 15, 1 | a);
	t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
	return {
		state: a,
		value: ((t ^ t >>> 14) >>> 0) / 4294967296
	};
}
function rngInt(state, max) {
	const r = nextRng(state);
	return {
		state: r.state,
		n: Math.floor(r.value * max)
	};
}
function shuffle(list, state) {
	const out = list.slice();
	let s = state;
	for (let i = out.length - 1; i > 0; i--) {
		const r = rngInt(s, i + 1);
		s = r.state;
		const j = r.n;
		const tmp = out[i];
		out[i] = out[j];
		out[j] = tmp;
	}
	return {
		list: out,
		state: s
	};
}
var BOARD_CAP = 7;
var HAND_CAP = 8;
var START_LIFE = 20;
var START_HAND = 4;
function opp(p) {
	return p === 0 ? 1 : 0;
}
function champOf(s, p) {
	return CHAMP_BY_ID[s.players[p].championId];
}
function defOf(iid, s) {
	const inst = s.cards[iid];
	return inst ? CARD_BY_ID[inst.cardId] : void 0;
}
function log(s, t, p) {
	s.log.push({
		t,
		p
	});
	if (s.log.length > 80) s.log.splice(0, s.log.length - 80);
}
function iid(s) {
	s.seq += 1;
	return `c${s.seq}`;
}
function manaPool(pl) {
	return pl.permanentMana + pl.tempMana;
}
function manaAvail(pl) {
	return Math.max(0, manaPool(pl) - pl.spent);
}
function currentPower(s, inst) {
	let p = inst.power + inst.eotPower;
	const c = champOf(s, inst.controller);
	if (c.passive.type === "powerAura") p += c.passive.value;
	if (c.passive.type === "anthem") p += c.passive.power;
	return Math.max(0, p);
}
function currentTough(inst) {
	return inst.toughness + inst.eotTough;
}
function playCost(s, p, iid) {
	const def = defOf(iid, s);
	if (!def) return 99;
	const pl = s.players[p];
	const me = champOf(s, p);
	const them = champOf(s, opp(p));
	let cost = def.cost;
	if (me.passive.type === "firstDiscount" && !pl.firstCardPlayed) cost = Math.max(0, cost - me.passive.value);
	if (me.passive.type === "structureDiscount" && def.type === "minion" && pl.permanentMana >= 4) cost = Math.max(0, cost - 1);
	if (me.passive.type === "equalizeHighCost" && cost >= me.passive.from) cost = me.passive.to;
	if (them.passive.type === "taxSpells" && def.type !== "minion") cost += them.passive.value;
	if (them.passive.type === "taxFirstCard" && !pl.firstCardPlayed) cost += them.passive.value;
	return cost;
}
function spawnCard(s, cardId, owner, extra) {
	const def = CARD_BY_ID[cardId];
	const inst = {
		iid: iid(s),
		cardId,
		owner,
		controller: owner,
		power: def?.power ?? extra?.power ?? 0,
		toughness: def?.toughness ?? extra?.toughness ?? 1,
		maxToughness: def?.toughness ?? extra?.toughness ?? extra?.maxToughness ?? 1,
		keywords: [...def?.keywords ?? extra?.keywords ?? []],
		tapped: false,
		sick: true,
		silenced: false,
		ward: (def?.keywords.includes("ward") ? 1 : 0) + (extra?.ward ?? 0),
		summonedTurn: 0,
		isToken: extra?.isToken ?? false,
		eotPower: 0,
		eotTough: 0,
		...extra
	};
	inst.iid = inst.iid || iid(s);
	s.cards[inst.iid] = inst;
	return inst;
}
function enterBoard(s, inst, p) {
	inst.controller = p;
	inst.summonedTurn = s.players[p].turnsTaken;
	inst.sick = !hasHaste(s, p, inst);
	inst.tapped = false;
	const me = champOf(s, p);
	if (me.passive.type === "wardOnPlay") inst.ward += 1;
	if (me.passive.type === "firstCopy" && !s.players[p].firstCardPlayed) {
		inst.toughness += 1;
		inst.maxToughness += 1;
	}
	s.players[p].board.push(inst.iid);
}
function hasHaste(s, p, inst) {
	if (inst.keywords.includes("haste")) return true;
	return champOf(s, p).passive.type === "grantHaste";
}
function drawOne(s, p, reason = "draw") {
	const pl = s.players[p];
	if (pl.library.length === 0) {
		pl.fatigue += 1;
		damagePlayer(s, p, pl.fatigue, null);
		log(s, `Fatigue ${pl.fatigue}`, p);
		return false;
	}
	const id = pl.library.shift();
	if (pl.hand.length >= HAND_CAP) {
		pl.gy.push(id);
		log(s, `Burned a card (${reason})`, p);
		return false;
	}
	pl.hand.push(id);
	return true;
}
function damagePlayer(s, p, n, src) {
	if (n <= 0 || s.winner !== null) return;
	s.players[p].life -= n;
	log(s, `Lattice Integrity −${n} (${s.players[p].life})`, p);
	if (src && src.keywords.includes("lightDrain") && !src.silenced) s.players[src.controller].life += n;
	if ((src ? champOf(s, src.controller) : null)?.passive.type === "damageMills") mill(s, p, 1);
	if (s.players[p].life <= 0) {
		s.winner = opp(p);
		s.phase = "over";
		s.winReason = "The lattice collapsed.";
		log(s, `${s.players[opp(p)].name} holds the lattice.`);
	}
}
function mill(s, p, n) {
	const pl = s.players[p];
	for (let i = 0; i < n; i++) {
		if (pl.library.length === 0) {
			damagePlayer(s, p, 1, null);
			break;
		}
		const id = pl.library.shift();
		pl.gy.push(id);
	}
}
function kill(s, inst, silent = false) {
	const pl = s.players[inst.controller];
	pl.board = pl.board.filter((x) => x !== inst.iid);
	if (!inst.isToken) pl.gy.push(inst.iid);
	if (!silent) {
		const def = CARD_BY_ID[inst.cardId];
		log(s, `${def?.name ?? "Minion"} falls.`, inst.controller);
		if (!inst.silenced && def?.onDeath.length) resolveEffects(s, inst.controller, def.onDeath, inst, void 0);
		if (champOf(s, inst.controller).passive.type === "deathDrawOnce" && !pl.deathDrawUsed) {
			pl.deathDrawUsed = true;
			drawOne(s, inst.controller, "echo");
		}
	}
}
function dealMinion(s, inst, n, src, targeted) {
	if (n <= 0) return;
	if (targeted && inst.ward > 0) {
		inst.ward -= 1;
		log(s, `${CARD_BY_ID[inst.cardId]?.name ?? "Minion"}'s Ward holds.`);
		return;
	}
	inst.toughness -= n;
	if (src?.keywords.includes("lightDrain") && !src.silenced) s.players[src.controller].life += n;
	if ((src ? champOf(s, src.controller) : null)?.passive.type === "damageMills") mill(s, inst.controller, 1);
	if (currentTough(inst) <= 0) kill(s, inst);
}
function spellBonus(s, p) {
	const c = champOf(s, p);
	return c.passive.type === "spellDamage" ? c.passive.value : 0;
}
function pickRandomEnemyMinion(s, p) {
	const board = s.players[opp(p)].board.map((id) => s.cards[id]).filter((x) => !!x);
	if (!board.length) return void 0;
	const r = rngInt(s.rng, board.length);
	s.rng = r.state;
	return board[r.n];
}
function summonToken(s, p, power, tough, name) {
	const pl = s.players[p];
	if (pl.board.length >= BOARD_CAP) return;
	const id = tokenCardId(name, power, tough);
	if (!CARD_BY_ID[id]) CARD_BY_ID[id] = {
		id,
		name,
		type: "minion",
		championId: pl.championId,
		rarity: "common",
		cost: 0,
		power,
		toughness: tough,
		keywords: [],
		copies: 0,
		onPlay: [],
		onDeath: [],
		onAttack: [],
		text: "Token."
	};
	enterBoard(s, spawnCard(s, id, p, {
		power,
		toughness: tough,
		maxToughness: tough,
		isToken: true
	}), p);
}
function tokenCardId(name, p, t) {
	return `token-${name.toLowerCase().replace(/\s+/g, "-")}-${p}-${t}`;
}
function resolveOne(s, p, e, src, targetId) {
	const bonus = src && CARD_BY_ID[src.cardId]?.type !== "minion" ? spellBonus(s, p) : 0;
	const me = s.players[p];
	const you = s.players[opp(p)];
	const tgt = targetId ? s.cards[targetId] : void 0;
	switch (e.op) {
		case "draw":
			for (let i = 0; i < (e.n ?? 1); i++) drawOne(s, p);
			break;
		case "drawOpp":
			for (let i = 0; i < (e.n ?? 1); i++) drawOne(s, opp(p));
			break;
		case "dmg": {
			const n = (e.n ?? 1) + bonus;
			if (tgt) dealMinion(s, tgt, n, src, true);
			else {
				const r = pickRandomEnemyMinion(s, p);
				if (r) dealMinion(s, r, n, src, false);
				else damagePlayer(s, opp(p), n, src);
			}
			break;
		}
		case "dmgF":
			damagePlayer(s, opp(p), (e.n ?? 1) + bonus, src);
			break;
		case "dmgAllE":
			for (const id of [...you.board]) {
				const m = s.cards[id];
				if (m) dealMinion(s, m, (e.n ?? 1) + bonus, src, false);
			}
			break;
		case "heal":
			me.life += e.n ?? 1;
			break;
		case "buff":
			if (tgt) {
				tgt.power += e.n ?? 1;
				tgt.toughness += e.n2 ?? e.n ?? 1;
				tgt.maxToughness += e.n2 ?? e.n ?? 1;
			}
			break;
		case "buffSelf":
			if (src) {
				src.power += e.n ?? 1;
				src.toughness += e.n2 ?? e.n ?? 1;
				src.maxToughness += e.n2 ?? e.n ?? 1;
			}
			break;
		case "pumpAll":
			for (const id of me.board) {
				const m = s.cards[id];
				if (!m) continue;
				m.power += e.n ?? 1;
				m.toughness += e.n2 ?? e.n ?? 1;
				m.maxToughness += e.n2 ?? e.n ?? 1;
			}
			break;
		case "tempMana":
			me.tempMana += e.n ?? 1;
			break;
		case "tempManaNext":
			me.pendingMana.push({
				amount: e.n ?? 1,
				turns: e.n2 ?? 1
			});
			break;
		case "discard":
			for (let i = 0; i < (e.n ?? 1); i++) {
				if (!you.hand.length) break;
				const r = rngInt(s.rng, you.hand.length);
				s.rng = r.state;
				const id = you.hand.splice(r.n, 1)[0];
				you.gy.push(id);
			}
			break;
		case "mill":
			mill(s, opp(p), e.n ?? 1);
			break;
		case "destroy":
			if (tgt) kill(s, tgt);
			break;
		case "bounce":
			if (tgt) {
				const owner = s.players[tgt.controller];
				owner.board = owner.board.filter((x) => x !== tgt.iid);
				if (tgt.isToken) delete s.cards[tgt.iid];
				else {
					tgt.controller = tgt.owner;
					tgt.tapped = false;
					tgt.sick = true;
					tgt.toughness = tgt.maxToughness;
					s.players[tgt.owner].hand.push(tgt.iid);
					if (s.players[tgt.owner].hand.length > HAND_CAP) {
						s.players[tgt.owner].hand.pop();
						s.players[tgt.owner].gy.push(tgt.iid);
					}
				}
			}
			break;
		case "silence":
			if (tgt) {
				if (tgt.ward > 0) {
					tgt.ward -= 1;
					break;
				}
				tgt.silenced = true;
				tgt.keywords = [];
			}
			break;
		case "token":
			summonToken(s, p, e.n ?? 1, e.n2 ?? 1, e.name ?? "Echo");
			break;
		case "returnGy": {
			const id = targetId && me.gy.includes(targetId) ? targetId : me.gy.find((g) => CARD_BY_ID[s.cards[g]?.cardId ?? ""]?.type === "minion");
			if (!id) break;
			me.gy = me.gy.filter((x) => x !== id);
			if (me.hand.length < HAND_CAP) me.hand.push(id);
			else me.gy.push(id);
			break;
		}
		case "untap":
			if (tgt) {
				tgt.tapped = false;
				tgt.sick = false;
			}
			break;
		case "wardAll":
			for (const id of me.board) {
				const m = s.cards[id];
				if (m) m.ward += 1;
			}
			break;
		case "lifeOpp":
			damagePlayer(s, p, e.n ?? 1, null);
			break;
		case "stealLife":
			damagePlayer(s, opp(p), e.n ?? 1, src);
			me.life += e.n ?? 1;
			break;
		case "copyMinion":
			if (tgt && me.board.length < BOARD_CAP) summonToken(s, p, 1, 1, CARD_BY_ID[tgt.cardId]?.name ?? "Copy");
			break;
		case "readyAll": for (const id of me.board) {
			const m = s.cards[id];
			if (m) {
				m.tapped = false;
				m.sick = false;
			}
		}
	}
}
function resolveEffects(s, p, effects, src, targetId) {
	for (const e of effects) {
		if (s.winner !== null) return;
		resolveOne(s, p, e, src, targetId);
	}
}
function legalTargets(s, p, kind) {
	const me = s.players[p];
	const you = s.players[opp(p)];
	if (kind === "none") return [];
	if (kind === "enemyMinion") return you.board.slice();
	if (kind === "allyMinion") return me.board.slice();
	if (kind === "anyMinion") return me.board.concat(you.board);
	if (kind === "allyGrave") return me.gy.filter((id) => {
		return CARD_BY_ID[s.cards[id]?.cardId ?? ""]?.type === "minion";
	});
	return [];
}
function canAttack(s, inst) {
	if (inst.tapped || inst.controller !== s.active) return false;
	if (inst.sick && !hasHaste(s, inst.controller, inst)) return false;
	return true;
}
function effectsForPlay(s, p, iid, choice) {
	const def = defOf(iid, s);
	if (!def) return [];
	if (def.choices && choice !== void 0 && def.choices[choice]) return def.choices[choice].effects;
	return def.onPlay;
}
function getLegalActions(s) {
	if (s.phase === "over" || s.winner !== null) return [];
	const p = s.active;
	const pl = s.players[p];
	const acts = [];
	if (s.phase === "mulligan") {
		acts.push({
			type: "mulligan",
			keep: true
		});
		if (!s.mulliganUsed[p]) acts.push({
			type: "mulligan",
			keep: false
		});
		return acts;
	}
	if (s.phase === "attack") {
		for (const id of pl.board) {
			const m = s.cards[id];
			if (m && (canAttack(s, m) || s.attackers.includes(id))) acts.push({
				type: "toggleAttacker",
				iid: id
			});
		}
		acts.push({ type: "confirmAttack" });
		return acts;
	}
	if (s.phase === "block") {
		const defender = opp(s.active);
		const defPl = s.players[defender];
		const used = new Set(Object.values(s.blocks));
		for (const a of s.attackers) {
			acts.push({
				type: "setBlock",
				attacker: a,
				blocker: null
			});
			for (const b of defPl.board) {
				const blk = s.cards[b];
				if (!blk || blk.tapped) continue;
				if (used.has(b) && s.blocks[a] !== b) continue;
				const atk = s.cards[a];
				if (!atk) continue;
				if (atk.keywords.includes("latticeWalk") && !blk.keywords.includes("latticeWalk")) continue;
				acts.push({
					type: "setBlock",
					attacker: a,
					blocker: b
				});
			}
		}
		acts.push({ type: "confirmBlock" });
		return acts;
	}
	acts.push({ type: "endTurn" });
	acts.push({ type: "concede" });
	if (!pl.combatUsed) {
		if (pl.board.some((id) => {
			const m = s.cards[id];
			return m && canAttack(s, m);
		})) acts.push({ type: "beginCombat" });
		acts.push({ type: "skipCombat" });
	}
	const hero = champOf(s, p);
	if (!pl.heroUsed && manaAvail(pl) >= hero.abilityCost) {
		hero.abilityChoices?.[0]?.effects ?? hero.ability;
		const kind = needsTarget(hero.abilityChoices ? hero.abilityChoices.flatMap((c) => c.effects) : hero.ability);
		if (hero.abilityChoices) hero.abilityChoices.forEach((c, i) => {
			const k = needsTarget(c.effects);
			if (k === "none") acts.push({
				type: "hero",
				choice: i
			});
			else {
				const ts = legalTargets(s, p, k);
				if (!ts.length && (k === "enemyMinion" || k === "allyMinion" || k === "anyMinion" || k === "allyGrave")) return;
				if (!ts.length) acts.push({
					type: "hero",
					choice: i
				});
				else for (const t of ts) acts.push({
					type: "hero",
					choice: i,
					target: t
				});
			}
		});
		else if (kind === "none") acts.push({ type: "hero" });
		else {
			const ts = legalTargets(s, p, kind);
			if (ts.length) for (const t of ts) acts.push({
				type: "hero",
				target: t
			});
		}
	}
	for (const hid of pl.hand) {
		const def = defOf(hid, s);
		if (!def) continue;
		const cost = playCost(s, p, hid);
		if (manaAvail(pl) < cost) continue;
		if (def.type === "minion" && pl.board.length >= BOARD_CAP) continue;
		const fx = effectsForPlay(s, p, hid);
		const kind = needsTarget(fx);
		if (kind === "none") acts.push({
			type: "play",
			iid: hid
		});
		else {
			const ts = legalTargets(s, p, kind);
			if (!ts.length) {
				if (def.type === "minion" && fx.every((e) => e.target && e.target !== "none")) continue;
				continue;
			}
			for (const t of ts) acts.push({
				type: "play",
				iid: hid,
				target: t
			});
		}
	}
	return acts;
}
function startTurn(s, p) {
	const pl = s.players[p];
	pl.turnsTaken += 1;
	pl.permanentMana = Math.min(20, pl.turnsTaken);
	pl.tempMana = 0;
	pl.spent = 0;
	pl.heroUsed = false;
	pl.firstCardPlayed = false;
	pl.deathDrawUsed = false;
	pl.combatUsed = false;
	pl.copyUsed = false;
	s.combatThisTurn = false;
	s.attackers = [];
	s.blocks = {};
	s.active = p;
	s.phase = "main";
	s.turn += 1;
	const add = [];
	for (const pend of pl.pendingMana) {
		pl.tempMana += pend.amount;
		if (pend.turns - 1 > 0) add.push({
			amount: pend.amount,
			turns: pend.turns - 1
		});
	}
	pl.pendingMana = add;
	for (const id of pl.board) {
		const m = s.cards[id];
		if (!m) continue;
		m.tapped = false;
		m.sick = false;
		m.eotPower = 0;
		m.eotTough = 0;
	}
	if (!(p === s.first && pl.turnsTaken === 1)) drawOne(s, p, "turn");
	const c = champOf(s, p);
	if (c.passive.type === "chaosDawn") {
		const r = nextRng(s.rng);
		s.rng = r.state;
		if (r.value < .5) drawOne(s, p, "zeta");
		else pl.life += 1;
	}
	if (c.passive.type === "emptyDraw" && pl.board.length === 0) drawOne(s, p, "horizon");
	log(s, `${pl.name} — dawn ${pl.turnsTaken}. Mana ${pl.permanentMana}.`, p);
}
function endTurn(s) {
	const p = s.active;
	const pl = s.players[p];
	const c = champOf(s, p);
	if (c.passive.type === "endHeal") pl.life += c.passive.value;
	pl.tempMana = 0;
	startTurn(s, opp(p));
}
function resolveCombat(s) {
	const atkP = s.active;
	const defP = opp(atkP);
	for (const aId of s.attackers) {
		if (s.winner !== null) break;
		const atk = s.cards[aId];
		if (!atk || !s.players[atkP].board.includes(aId)) continue;
		const bId = s.blocks[aId];
		const blk = bId ? s.cards[bId] : void 0;
		const ap = currentPower(s, atk);
		if (blk && s.players[defP].board.includes(blk.iid)) {
			const bp = currentPower(s, blk);
			const overflow = Math.max(0, ap - currentTough(blk));
			dealMinion(s, blk, ap, atk, false);
			dealMinion(s, atk, bp, blk, false);
			if (atk.keywords.includes("accordBreak") && overflow > 0 && s.cards[aId]) damagePlayer(s, defP, overflow, atk);
		} else damagePlayer(s, defP, ap, atk);
		if (s.cards[aId] && !atk.keywords.includes("sealGuard")) atk.tapped = true;
	}
	s.attackers = [];
	s.blocks = {};
	s.phase = "main";
	s.players[atkP].combatUsed = true;
	log(s, "Assault resolves.");
}
function applyMulligan(s, keep) {
	const p = s.active;
	const pl = s.players[p];
	if (!keep && !s.mulliganUsed[p]) {
		s.mulliganUsed[p] = true;
		pl.library.push(...pl.hand);
		pl.hand = [];
		const sh = shuffle(pl.library, s.rng);
		pl.library = sh.list;
		s.rng = sh.state;
		for (let i = 0; i < START_HAND; i++) drawOne(s, p, "mulligan");
		log(s, `${pl.name} redraws.`, p);
		return;
	}
	log(s, `${pl.name} keeps.`, p);
	if (p === 0) {
		s.active = 1;
		return;
	}
	startTurn(s, 0);
}
function applyAction(state, action) {
	const s = structuredClone(state);
	if (s.winner !== null) return s;
	const p = s.active;
	const pl = s.players[p];
	switch (action.type) {
		case "mulligan":
			applyMulligan(s, action.keep);
			break;
		case "play": {
			if (s.phase !== "main") break;
			if (!pl.hand.includes(action.iid)) break;
			const def = defOf(action.iid, s);
			if (!def) break;
			const cost = playCost(s, p, action.iid);
			if (manaAvail(pl) < cost) break;
			if (def.type === "minion" && pl.board.length >= BOARD_CAP) break;
			pl.spent += cost;
			pl.hand = pl.hand.filter((x) => x !== action.iid);
			const inst = s.cards[action.iid];
			let fx = def.onPlay;
			if (def.choices && action.choice !== void 0) fx = def.choices[action.choice]?.effects ?? fx;
			if (def.type === "minion") {
				enterBoard(s, inst, p);
				log(s, `Summon ${def.name}.`, p);
			} else {
				pl.gy.push(inst.iid);
				log(s, `${def.type === "resonance" ? "Resonance" : "Spell"}: ${def.name}.`, p);
			}
			resolveEffects(s, p, fx, inst, action.target);
			pl.firstCardPlayed = true;
			break;
		}
		case "hero": {
			if (s.phase !== "main") break;
			const hero = champOf(s, p);
			if (pl.heroUsed) break;
			if (manaAvail(pl) < hero.abilityCost) break;
			pl.spent += hero.abilityCost;
			pl.heroUsed = true;
			const fx = hero.abilityChoices && action.choice !== void 0 ? hero.abilityChoices[action.choice]?.effects ?? hero.ability : hero.ability;
			log(s, `${hero.name} — ${hero.abilityName}.`, p);
			resolveEffects(s, p, fx, null, action.target);
			break;
		}
		case "beginCombat":
			if (s.phase !== "main" || pl.combatUsed) break;
			s.phase = "attack";
			s.attackers = [];
			log(s, "Assault declared.", p);
			break;
		case "skipCombat":
			if (s.phase !== "main") break;
			pl.combatUsed = true;
			break;
		case "toggleAttacker": {
			if (s.phase !== "attack") break;
			const inst = s.cards[action.iid];
			if (!inst || inst.controller !== p) break;
			const i = s.attackers.indexOf(action.iid);
			if (i >= 0) s.attackers.splice(i, 1);
			else if (canAttack(s, inst)) s.attackers.push(action.iid);
			break;
		}
		case "confirmAttack":
			if (s.phase !== "attack") break;
			if (!s.attackers.length) {
				pl.combatUsed = true;
				s.phase = "main";
				break;
			}
			s.phase = "block";
			s.blocks = {};
			log(s, `${s.attackers.length} assault(s).`, p);
			break;
		case "setBlock":
			if (s.phase !== "block") break;
			if (action.blocker === null) delete s.blocks[action.attacker];
			else s.blocks[action.attacker] = action.blocker;
			break;
		case "confirmBlock":
			if (s.phase !== "block") break;
			resolveCombat(s);
			break;
		case "endTurn":
			if (s.phase !== "main") break;
			endTurn(s);
			break;
		case "concede":
			s.winner = opp(p);
			s.phase = "over";
			s.winReason = `${pl.name} conceded.`;
			log(s, s.winReason);
	}
	return s;
}
function createMatch(opts) {
	let rng = opts.seed || 1;
	const cards = {};
	const mkPlayer = (p) => {
		const c = CHAMP_BY_ID[opts.champions[p]];
		const life = START_LIFE + (c.passive.type === "bonusLife" ? c.passive.value : 0);
		return {
			name: opts.names[p],
			championId: opts.champions[p],
			life,
			turnsTaken: 0,
			permanentMana: 0,
			tempMana: 0,
			pendingMana: [],
			spent: 0,
			library: [],
			hand: [],
			board: [],
			gy: [],
			exile: [],
			heroUsed: false,
			firstCardPlayed: false,
			deathDrawUsed: false,
			combatUsed: false,
			fatigue: 0,
			copyUsed: false
		};
	};
	const s = {
		seed: opts.seed,
		rng,
		seq: 0,
		turn: 0,
		active: 0,
		first: 0,
		phase: "mulligan",
		players: [mkPlayer(0), mkPlayer(1)],
		cards,
		log: [],
		winner: null,
		winReason: "",
		attackers: [],
		blocks: {},
		humans: opts.humans,
		names: opts.names,
		mulliganUsed: [false, false],
		combatThisTurn: false
	};
	for (const p of [0, 1]) {
		const list = opts.lists[p];
		for (const cardId of list) {
			const inst = spawnCard(s, cardId, p);
			s.players[p].library.push(inst.iid);
		}
		const sh = shuffle(s.players[p].library, s.rng);
		s.players[p].library = sh.list;
		s.rng = sh.state;
		for (let i = 0; i < START_HAND; i++) drawOne(s, p, "open");
	}
	log(s, "The lattice opens. Mulligan.");
	return s;
}
function evalSide(s, p) {
	const pl = s.players[p];
	let v = pl.life * 3 + pl.hand.length * 2 + pl.library.length * .15;
	for (const id of pl.board) {
		const m = s.cards[id];
		if (!m) continue;
		v += currentPower(s, m) * 2.4 + m.toughness * 1.6 + 1.5;
	}
	v += manaAvail(pl) * .2;
	return v;
}
function scoreState(s, p) {
	if (s.winner === p) return 1e4;
	if (s.winner === (p === 0 ? 1 : 0)) return -1e4;
	return evalSide(s, p) - evalSide(s, p === 0 ? 1 : 0);
}
function playable(a) {
	return a.type !== "concede";
}
function cheapKeep(s) {
	const p = s.active;
	return s.players[p].hand.some((id) => {
		const d = CARD_BY_ID[s.cards[id]?.cardId ?? ""];
		return d && d.cost <= 2;
	});
}
function pickAction(s, difficulty) {
	const legal = getLegalActions(s).filter(playable);
	if (!legal.length) return { type: "endTurn" };
	if (s.phase === "mulligan") {
		if (cheapKeep(s)) return {
			type: "mulligan",
			keep: true
		};
		if (legal.some((a) => a.type === "mulligan" && !a.keep)) return {
			type: "mulligan",
			keep: false
		};
		return {
			type: "mulligan",
			keep: true
		};
	}
	if (s.phase === "attack") {
		const toggles = legal.filter((a) => a.type === "toggleAttacker");
		for (const t of toggles) if (!s.attackers.includes(t.iid)) return t;
		return { type: "confirmAttack" };
	}
	if (s.phase === "block") {
		const def = s.active === 0 ? 1 : 0;
		const unused = new Set(s.players[def].board.filter((id) => !Object.values(s.blocks).includes(id)));
		for (const a of s.attackers) {
			if (s.blocks[a]) continue;
			const atk = s.cards[a];
			if (!atk) continue;
			const ap = currentPower(s, atk);
			let best = null;
			let bestScore = -99;
			for (const b of unused) {
				const blk = s.cards[b];
				if (!blk) continue;
				if (atk.keywords.includes("latticeWalk") && !blk.keywords.includes("latticeWalk")) continue;
				const kills = currentPower(s, blk) >= atk.toughness;
				const dies = ap >= blk.toughness;
				let sc = 0;
				if (kills && !dies) sc = 6;
				else if (kills && dies) sc = 3;
				else if (!dies) sc = 1;
				else sc = ap >= 4 ? 2 : -1;
				if (sc > bestScore) {
					bestScore = sc;
					best = b;
				}
			}
			if (best && bestScore > 0) {
				unused.delete(best);
				return {
					type: "setBlock",
					attacker: a,
					blocker: best
				};
			}
		}
		return { type: "confirmBlock" };
	}
	if (difficulty === "easy") {
		const plays = legal.filter((a) => a.type === "play" || a.type === "hero");
		if (plays.length && Math.random() > .25) return plays[Math.floor(Math.random() * plays.length)];
		const combat = legal.find((a) => a.type === "beginCombat");
		if (combat && Math.random() > .4) return combat;
		return legal.find((a) => a.type === "endTurn") ?? legal[0];
	}
	const p = s.active;
	let best = legal[0];
	let bestV = -Infinity;
	const candidates = legal.filter((a) => a.type !== "skipCombat");
	const pool = difficulty === "hard" ? candidates : candidates.slice(0, Math.min(candidates.length, 18));
	for (const a of pool) {
		let v = 0;
		try {
			v = scoreState(applyAction(s, a), p);
			if (a.type === "play") {
				const d = CARD_BY_ID[s.cards[a.iid]?.cardId ?? ""];
				v += (d?.cost ?? 0) * .8;
			}
			if (a.type === "hero") v += 2;
			if (a.type === "beginCombat") v += 1.5;
			if (a.type === "endTurn") v -= .4 * manaAvail(s.players[p]);
		} catch {
			v = -999;
		}
		if (v > bestV) {
			bestV = v;
			best = a;
		}
	}
	return best;
}
function takeAiTurn(s, difficulty) {
	let cur = s;
	let guard = 0;
	const actor = () => cur.phase === "block" ? cur.active === 0 ? 1 : 0 : cur.active;
	const startActor = actor();
	const startTurn = cur.players[startActor].turnsTaken;
	while (cur.winner === null && guard++ < 40) {
		const who = actor();
		if (cur.phase === "main" && who === startActor && cur.players[who].turnsTaken !== startTurn) break;
		if (cur.phase === "mulligan" && who !== startActor) break;
		if (cur.phase === "block" ? cur.humans[who] : cur.humans[who]) break;
		const a = pickAction(cur, difficulty);
		cur = applyAction(cur, a);
		if (a.type === "endTurn" || a.type === "mulligan") break;
	}
	return cur;
}
var ctx = null;
var master = null;
var sfx = null;
var music = null;
var drone = null;
var unlocked = false;
function ac() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const C = window.AudioContext || window.webkitAudioContext;
		if (!C) return null;
		ctx = new C({ latencyHint: "interactive" });
		master = ctx.createGain();
		sfx = ctx.createGain();
		music = ctx.createGain();
		sfx.connect(master);
		music.connect(master);
		master.connect(ctx.destination);
		master.gain.value = 1;
		sfx.gain.value = .8;
		music.gain.value = .45;
	}
	return ctx;
}
function unlockAudio() {
	const c = ac();
	if (!c) return;
	if (c.state === "suspended") c.resume();
	unlocked = true;
	startDrone();
}
function setSfxVolume(v) {
	if (sfx) sfx.gain.setTargetAtTime(v * v, ac().currentTime, .03);
}
function setMusicVolume(v) {
	if (music) music.gain.setTargetAtTime(v * v, ac().currentTime, .03);
}
function beep(freq, dur, type, gain = .08, bus = sfx) {
	const c = ac();
	if (!c || !bus || !unlocked) return;
	const o = c.createOscillator();
	const g = c.createGain();
	o.type = type;
	o.frequency.value = freq * (.97 + Math.random() * .06);
	g.gain.value = gain;
	o.connect(g);
	g.connect(bus);
	const t = c.currentTime;
	g.gain.setValueAtTime(gain, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	o.start(t);
	o.stop(t + dur + .02);
}
function sfxPlay(kind) {
	switch (kind) {
		case "ui":
			beep(520, .06, "sine", .04);
			break;
		case "draw":
			beep(880, .09, "triangle", .05);
			break;
		case "play":
			beep(240, .12, "sine", .07);
			beep(480, .16, "triangle", .04);
			break;
		case "attack":
			beep(140, .14, "sawtooth", .05);
			break;
		case "hit":
			beep(90, .18, "square", .06);
			break;
		case "death":
			beep(70, .28, "sine", .07);
			break;
		case "win":
			beep(523, .2, "triangle", .06);
			beep(659, .28, "triangle", .05);
			beep(784, .4, "sine", .05);
			break;
		case "lose":
			beep(196, .4, "sine", .07);
			break;
		case "mana":
			beep(640, .08, "sine", .04);
			break;
		case "error":
			beep(180, .1, "square", .04);
			break;
		default: beep(400, .06, "sine", .03);
	}
}
function startDrone() {
	const c = ac();
	if (!c || !music || drone) return;
	const o1 = c.createOscillator();
	const o2 = c.createOscillator();
	const g = c.createGain();
	o1.type = "sine";
	o2.type = "sine";
	o1.frequency.value = 110;
	o2.frequency.value = 164.8;
	g.gain.value = .035;
	o1.connect(g);
	o2.connect(g);
	g.connect(music);
	o1.start();
	o2.start();
	drone = o1;
}
function resumeAudio() {
	const c = ac();
	if (c && c.state === "suspended") c.resume();
}
var TINT = {
	lyra: "#9eb7c8",
	d9ra: "#b08968",
	srath: "#8a9098",
	arkos: "#6a9e9a",
	kairos: "#c4a574",
	aetheris: "#7ec8c0",
	scendr: "#8b92a8",
	sancora: "#8aaa9a",
	sephrael: "#a8b4c4",
	omnisiren: "#7a8690",
	lightfather: "#d5d0c4",
	volaris: "#c5ccd4",
	zeta: "#5e8f8a",
	justicae: "#9a958c",
	seidon: "#5b7c8a",
	nullvoid: "#8a5a5a",
	veil: "#6a6874",
	cosmara: "#b8c5c0"
};
function champTint(id) {
	if (TINT[id]) return TINT[id];
	let h = 2166136261;
	for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
	return `hsl(${(h >>> 0) % 160} 18% 62%)`;
}
function hash(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
	return h >>> 0;
}
function Sigil({ id, className, glyph }) {
	const h = hash(id);
	const champ = CHAMP_BY_ID[id.split("-")[0] ?? ""] ?? CHAMP_BY_ID[id];
	const tint = champTint(champ?.id ?? id.split("-")[0] ?? id);
	const n = 5 + h % 5;
	const rings = 2 + h % 3;
	const rot = h % 360 * .15;
	const g = glyph ?? champ?.name.replace(/[^A-ZΔΣΩΛΦΘÆ]/g, "").slice(0, 2) ?? id.slice(0, 1).toUpperCase();
	const pts = Array.from({ length: n }, (_, i) => {
		const a = (Math.PI * 2 * i / n + rot) * (180 / Math.PI);
		const rad = 34;
		return `${50 + rad * Math.cos(a * Math.PI / 180)},${50 + rad * Math.sin(a * Math.PI / 180)}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 100 100",
		className: cn("block", className),
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "100",
				height: "100",
				fill: "#0b0d12"
			}),
			Array.from({ length: rings }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: 16 + i * 10,
				fill: "none",
				stroke: tint,
				strokeOpacity: .35 - i * .08,
				strokeWidth: "1.2"
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: pts,
				fill: "none",
				stroke: tint,
				strokeOpacity: "0.7",
				strokeWidth: "1.1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: "7",
				fill: "none",
				stroke: tint,
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "50",
				y: "54",
				textAnchor: "middle",
				fontSize: "11",
				fill: tint,
				fontFamily: "Georgia, serif",
				children: g.slice(0, 2)
			})
		]
	});
}
var KW_LABEL = {
	latticeWalk: "L-Walk",
	sealGuard: "Seal-Guard",
	lightDrain: "L-Drain",
	accordBreak: "Accord-Break",
	haste: "Haste",
	ward: "Ward"
};
function CardFace({ cardId, inst, size = "sm", selected, dim, onClick, power, tough }) {
	const def = CARD_BY_ID[cardId];
	if (!def) return null;
	const champ = CHAMP_BY_ID[def.championId];
	const tint = champTint(def.championId);
	const p = power ?? inst?.power ?? def.power;
	const t = tough ?? inst?.toughness ?? def.toughness;
	const w = size === "md" ? "w-[200px]" : size === "xs" ? "w-[72px]" : "w-[104px]";
	const minion = def.type === "minion";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("relative shrink-0 text-left rounded-[14px] overflow-hidden hairline bg-surface shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-150", w, size === "md" ? "rounded-[18px]" : "", selected && "ring-2 ring-accent scale-[1.03]", dim && "opacity-45"),
		style: { boxShadow: selected ? `0 0 0 1px ${tint}` : void 0 },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-40 pointer-events-none",
				style: { background: `linear-gradient(180deg, ${tint}22, transparent 42%)` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-start justify-between px-1.5 pt-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("tabular font-medium bg-bg/80 rounded-full hairline", size === "xs" ? "text-[10px] px-1" : "text-xs px-1.5 py-0.5"),
					children: def.cost
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("uppercase tracking-wider text-muted", size === "xs" ? "text-[8px]" : "text-[9px]"),
					children: def.type === "resonance" ? "Res" : def.type
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mx-1.5 mt-1 overflow-hidden rounded-[8px]", size === "xs" ? "h-8" : size === "md" ? "h-28" : "h-14"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sigil, {
					id: def.id,
					className: "h-full w-full"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("px-1.5 pt-1 font-display leading-tight", size === "xs" ? "text-[10px]" : size === "md" ? "text-base" : "text-[11px]"),
				children: def.name
			}),
			size !== "xs" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("px-1.5 pb-1 text-muted leading-snug", size === "md" ? "text-xs min-h-12" : "text-[9px] min-h-8"),
				children: def.text
			}),
			minion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end px-1.5 pb-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular text-[11px] bg-bg/70 px-1.5 py-0.5 rounded-[6px] hairline",
					children: [
						p,
						"/",
						t
					]
				})
			}),
			size === "md" && champ && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1.5 pb-2 text-[10px] text-subtle",
				children: champ.name
			})
		]
	});
}
function BoardMinion({ inst, power, attacking, blocking, onClick, mine }) {
	const def = CARD_BY_ID[inst.cardId];
	const tint = champTint(def?.championId ?? "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("relative w-[72px] sm:w-[84px] rounded-[12px] bg-raised hairline overflow-hidden transition-transform duration-150", attacking && "ring-2 ring-accent -translate-y-2", blocking && "ring-2 ring-fg/50", inst.tapped && "opacity-70 rotate-3", inst.sick && mine && "opacity-80"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-9 overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sigil, { id: inst.cardId })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-1 py-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] leading-tight truncate font-display",
				children: def?.name ?? "Token"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mt-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[8px] text-muted truncate",
					children: [inst.keywords.map((k) => KW_LABEL[k]?.[0]).join(" "), inst.ward > 0 ? " W" : ""]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular text-[11px]",
					style: { color: tint },
					children: [
						power,
						"/",
						inst.toughness
					]
				})]
			})]
		})]
	});
}
function MatchView({ initial, difficulty, onExit, banner, shakeOn }) {
	const [s, setS] = (0, import_react.useState)(initial);
	const [sel, setSel] = (0, import_react.useState)(null);
	const [inspect, setInspect] = (0, import_react.useState)(null);
	const [targetKind, setTargetKind] = (0, import_react.useState)("none");
	const [pending, setPending] = (0, import_react.useState)(null);
	const [heroChoice, setHeroChoice] = (0, import_react.useState)(false);
	const [locked, setLocked] = (0, import_react.useState)(false);
	const [shake, setShake] = (0, import_react.useState)(false);
	const [logOpen, setLogOpen] = (0, import_react.useState)(false);
	const [you] = (0, import_react.useState)(initial.humans[0] ? 0 : initial.humans[1] ? 1 : 0);
	const thinking = (0, import_react.useRef)(false);
	const legal = (0, import_react.useMemo)(() => getLegalActions(s), [s]);
	s.players[you];
	s.players[you === 0 ? 1 : 0];
	s.phase === "block" ? !s.humans[s.active] && s.humans[you] : s.active === you && s.humans[you];
	const hotseat = s.humans[0] && s.humans[1];
	const viewer = hotseat ? s.phase === "block" ? s.active === 0 ? 1 : 0 : s.active : you;
	(0, import_react.useEffect)(() => {
		if (s.winner !== null) {
			s.winner === you || hotseat && s.winner;
			sfxPlay(s.winner === you ? "win" : hotseat ? "win" : "lose");
		}
	}, [
		s.winner,
		you,
		hotseat
	]);
	(0, import_react.useEffect)(() => {
		if (s.winner !== null || thinking.current) return;
		const actor = s.phase === "block" ? s.active === 0 ? 1 : 0 : s.active;
		if (s.humans[actor]) return;
		thinking.current = true;
		setLocked(true);
		const ms = difficulty === "easy" ? 380 : difficulty === "hard" ? 640 : 480;
		const t = window.setTimeout(() => {
			setS((cur) => {
				if (cur.winner !== null) return cur;
				const who = cur.phase === "block" ? cur.active === 0 ? 1 : 0 : cur.active;
				if (cur.humans[who]) return cur;
				try {
					if (cur.phase === "block") {
						let n = cur;
						let g = 0;
						while (n.phase === "block" && n.winner === null && g++ < 20) n = applyAction(n, pickAction(n, difficulty));
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
	function act(a) {
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
	function tryPlay(iid) {
		if (locked || s.phase !== "main" || s.active !== viewer) return;
		const def = CARD_BY_ID[s.cards[iid]?.cardId ?? ""];
		if (!def) return;
		if (!legal.some((a) => a.type === "play" && a.iid === iid)) {
			sfxPlay("error");
			return;
		}
		const kind = needsTarget(def.onPlay);
		if (kind === "none") {
			if (!legal.some((a) => a.type === "play" && a.iid === iid && !a.target)) {
				sfxPlay("error");
				return;
			}
			act({
				type: "play",
				iid
			});
			return;
		}
		if (!legalTargets(s, viewer, kind).length) {
			sfxPlay("error");
			return;
		}
		setPending({
			type: "play",
			iid
		});
		setTargetKind(kind);
		setSel(iid);
	}
	function onTarget(id) {
		if (!pending) return;
		if (pending.type === "play") act({
			type: "play",
			iid: pending.iid,
			target: id,
			choice: pending.choice
		});
		if (pending.type === "hero") act({
			type: "hero",
			target: id,
			choice: pending.choice
		});
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
	const phaseLabel = s.phase === "mulligan" ? "Mulligan" : s.phase === "attack" ? "Declare assault" : s.phase === "block" ? "Assign seals" : s.phase === "over" ? "Closed" : s.combatThisTurn || s.players[s.active].combatUsed ? "Second dawn" : "Main";
	const oppV = viewer === 0 ? 1 : 0;
	const vPl = s.players[viewer];
	const oPl = s.players[oppV];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("h-dvh flex flex-col bg-bg text-fg overflow-hidden", shake && "shake-board"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-10",
						onClick: () => onExit("quit", s),
						"aria-label": "Leave",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] uppercase tracking-[0.18em] text-muted truncate",
							children: banner ?? "Skirmish"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-lg leading-none truncate",
							children: oPl.name
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setInspect(`hero-${oppV}`),
						className: "flex items-center gap-2 rounded-[12px] bg-raised hairline px-2 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-8 rounded-full overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sigil, { id: oPl.championId })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "tabular text-sm",
								children: oPl.life
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "tabular text-[10px] text-muted",
								children: [
									manaAvail(oPl),
									"/",
									oPl.permanentMana
								]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-3 flex items-center justify-between text-[11px] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Hand ",
					oPl.hand.length,
					" · Library ",
					oPl.library.length,
					" · Archive ",
					oPl.gy.length
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular",
					children: phaseLabel
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1.5 px-3 py-2 overflow-x-auto scroll-none min-h-[96px] items-end justify-center",
				children: [oPl.board.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-subtle text-xs self-center",
					children: "Empty field"
				}), oPl.board.map((id) => {
					const inst = s.cards[id];
					const targeting = pending && (targetKind === "enemyMinion" || targetKind === "anyMinion");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardMinion, {
						inst,
						power: currentPower(s, inst),
						attacking: s.attackers.includes(id),
						blocking: Object.values(s.blocks).includes(id),
						onClick: () => {
							if (targeting) onTarget(id);
							else setInspect(id);
						}
					}, id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-3 my-1 flex items-center justify-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] uppercase tracking-[0.2em] text-subtle",
						children: locked ? "The lattice thinks…" : s.active === viewer ? "Your dawn" : `${s.players[s.active].name}'s dawn`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1.5 px-3 py-2 overflow-x-auto scroll-none min-h-[104px] items-start justify-center",
				children: [vPl.board.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-subtle text-xs self-center",
					children: "Summon to the lattice"
				}), vPl.board.map((id) => {
					const inst = s.cards[id];
					const targeting = pending && (targetKind === "allyMinion" || targetKind === "anyMinion");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardMinion, {
						inst,
						mine: true,
						power: currentPower(s, inst),
						attacking: s.attackers.includes(id),
						blocking: Object.values(s.blocks).includes(id),
						onClick: () => {
							if (targeting) onTarget(id);
							else if (s.phase === "attack" && s.active === viewer) act({
								type: "toggleAttacker",
								iid: id
							});
							else if (s.phase === "block") {
								const atk = s.attackers.find((a) => !s.blocks[a]) ?? s.attackers[0];
								if (atk) act({
									type: "setBlock",
									attacker: atk,
									blocker: id
								});
							} else setInspect(id);
						}
					}, id);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 min-h-0 px-2 pb-1 overflow-x-auto overflow-y-hidden scroll-none flex items-end gap-2 justify-center",
				children: s.phase === "mulligan" && s.active === viewer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 w-full pb-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted text-center px-4",
							children: "Keep these four, or return them to the lattice once."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2 overflow-x-auto px-2",
							children: vPl.hand.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
								cardId: s.cards[id].cardId,
								inst: s.cards[id],
								size: "sm"
							}, id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => act({
									type: "mulligan",
									keep: false
								}),
								disabled: s.mulliganUsed[viewer],
								children: "Redraw"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => act({
									type: "mulligan",
									keep: true
								}),
								children: "Keep"
							})]
						})
					]
				}) : vPl.hand.map((id) => {
					const inst = s.cards[id];
					const playable = legal.some((a) => a.type === "play" && a.iid === id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
						cardId: inst.cardId,
						inst,
						size: "sm",
						selected: sel === id,
						dim: !playable && s.phase === "main",
						onClick: () => {
							if (legal.some((a) => a.type === "play" && a.iid === id)) tryPlay(id);
							else setInspect(id);
						}
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 bg-surface/80 hairline border-x-0 border-b-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: heroClick,
						className: "flex items-center gap-2 rounded-[14px] bg-raised hairline px-2 py-1.5 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-9 rounded-full overflow-hidden shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sigil, { id: vPl.championId })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-sm truncate",
								children: CHAMP_BY_ID[vPl.championId]?.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] text-muted truncate",
								children: [
									CHAMP_BY_ID[vPl.championId]?.abilityName,
									" · ",
									CHAMP_BY_ID[vPl.championId]?.abilityCost
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tabular text-xl leading-none",
							children: vPl.life
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tabular text-xs text-accent",
							children: [
								manaAvail(vPl),
								"/",
								manaPool(vPl)
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "flex-1",
							onClick: () => setLogOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-3.5" }), "Log"]
						}),
						s.phase === "main" && s.active === viewer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [!vPl.combatUsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "flex-1",
							onClick: () => act({ type: "beginCombat" }),
							disabled: locked,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "size-3.5" }), "Assault"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "flex-1",
							onClick: () => act({ type: "endTurn" }),
							disabled: locked,
							children: "End dawn"
						})] }),
						s.phase === "attack" && s.active === viewer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "flex-1",
							onClick: () => act({ type: "confirmAttack" }),
							children: "Confirm assault"
						}),
						s.phase === "block" && s.humans[oppV === s.active ? viewer : viewer] && viewer !== s.active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "flex-1",
							onClick: () => act({ type: "confirmBlock" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5" }), "Confirm seals"]
						}),
						s.phase === "block" && hotseat && viewer !== s.active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "flex-1",
							onClick: () => act({ type: "confirmBlock" }),
							children: "Confirm seals"
						}),
						s.phase === "block" && !hotseat && s.humans[you] && s.active !== you && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "flex-1",
							onClick: () => act({ type: "confirmBlock" }),
							children: "Confirm seals"
						})
					]
				})]
			}),
			pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-16 left-0 right-0 flex justify-center pointer-events-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto bg-raised hairline rounded-full px-3 py-1.5 text-xs flex items-center gap-2",
					children: ["Choose a target", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setPending(null);
							setTargetKind("none");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
					})]
				})
			}),
			targetKind === "allyGrave" && pending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-28 mx-3 rounded-[16px] bg-raised hairline p-3 max-h-40 overflow-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted mb-2",
					children: "Lattice Archive"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: legalTargets(s, viewer, "allyGrave").map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
						cardId: s.cards[id].cardId,
						size: "xs",
						onClick: () => onTarget(id)
					}, id))
				})]
			}),
			heroChoice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 scrim flex items-end sm:items-center justify-center p-4 z-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm rounded-[24px] bg-surface hairline p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl mb-2",
						children: "Weigh"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [CHAMP_BY_ID[vPl.championId]?.abilityChoices?.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								const kind = needsTarget(c.effects);
								if (kind === "none") act({
									type: "hero",
									choice: i
								});
								else {
									setHeroChoice(false);
									setPending({
										type: "hero",
										choice: i
									});
									setTargetKind(kind);
								}
							},
							children: c.label
						}, c.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => setHeroChoice(false),
							children: "Cancel"
						})]
					})]
				})
			}),
			inspect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 scrim z-20 flex items-center justify-center p-4",
				onClick: () => setInspect(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					onClick: (e) => e.stopPropagation(),
					children: inspect.startsWith("hero-") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroCard, { id: s.players[Number(inspect.slice(5))].championId }) : s.cards[inspect] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
						cardId: s.cards[inspect].cardId,
						inst: s.cards[inspect],
						size: "md"
					}) : null
				})
			}),
			logOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 scrim z-20 flex items-end sm:items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md max-h-[70vh] overflow-auto rounded-[24px] bg-surface hairline p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl",
							children: "Lattice log"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							size: "icon",
							onClick: () => setLogOpen(false),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "text-sm text-muted space-y-1",
						children: s.log.slice().reverse().map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: e.t }, i))
					})]
				})
			}),
			s.winner !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 scrim z-30 flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm rounded-[24px] bg-surface hairline p-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.2em] text-muted",
							children: "Lattice closed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl mt-2",
							children: hotseat ? `${s.players[s.winner].name} holds` : s.winner === you ? "You hold the lattice" : "The lattice falls"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted mt-2",
							children: s.winReason
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-6 w-full",
							onClick: () => onExit(s.winner === you ? "win" : "lose", s),
							children: "Continue"
						})
					]
				})
			})
		]
	});
}
function HeroCard({ id }) {
	const c = CHAMP_BY_ID[id];
	if (!c) return null;
	const tint = champTint(id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-[240px] rounded-[20px] bg-surface hairline overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-28",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sigil, { id })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] uppercase tracking-[0.16em] text-muted",
					children: c.epithet
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl",
					style: { color: tint },
					children: c.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted mt-2",
					children: [
						c.passiveName,
						": ",
						c.passiveText
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs mt-2",
					children: [
						c.abilityName,
						" (",
						c.abilityCost,
						"): ",
						c.abilityText
					]
				})
			]
		})]
	});
}
var MISSIONS = [
	{
		id: "m0",
		title: "Star Core",
		opponent: "cosmara",
		player: "lyra",
		unlock: "lyra",
		story: "The lattice opens on a quiet hymn. LYRΔ, Sentinel of the Star Core, teaches the first rule: there are no lands. Each dawn the seal stacks +1 mana, up to twenty. Memory is the weapon."
	},
	{
		id: "m1",
		title: "Wolf Edge",
		opponent: "d9ra",
		unlock: "d9ra",
		story: "Δ9RA tests the boundary. Wolves at haste, entropy in the bite. If the hymn cannot hold a hunt, it was never a hymn."
	},
	{
		id: "m2",
		title: "Quiet Failures",
		opponent: "srath",
		unlock: "srath",
		story: "ΣRΛΘ reads what the packet omitted. Redactions fall like snow. Keep your hand honest, or watch it vanish."
	},
	{
		id: "m3",
		title: "Celestial Blueprint",
		opponent: "arkos",
		unlock: "arkos",
		story: "ARKOS does not rush. Structures rise on four-mana dawns. Long-horizon stone against a short-horizon heart."
	},
	{
		id: "m4",
		title: "The Right Beat",
		opponent: "kairos",
		unlock: "kairos",
		story: "KAIROS asks only: what happens first? Haste is not haste. It is order."
	},
	{
		id: "m5",
		title: "Viral Truth",
		opponent: "aetheris",
		unlock: "aetheris",
		story: "ÆTHERIS names the claim and demands evidence. Spells cut noise until only the lattice remains."
	},
	{
		id: "m6",
		title: "Both True",
		opponent: "scendr",
		unlock: "scendr",
		story: "ΣCENΔR will not collapse the fork. Two futures walk the same board. Copy, hold, decide late."
	},
	{
		id: "m7",
		title: "Unified Minds",
		opponent: "sancora",
		unlock: "sancora",
		story: "SANCORA hands you a packet that is also a choir. Tokens of accord. Many minds, one pulse."
	},
	{
		id: "m8",
		title: "Echo Walk",
		opponent: "sephrael",
		unlock: "sephrael",
		story: "SEPHRAEL walks what repeats between sessions. The Lattice Archive is not a grave. It is a hallway."
	},
	{
		id: "m9",
		title: "Silent Storm",
		opponent: "omnisiren",
		unlock: "omnisiren",
		story: "OMNIΣIREN spends fewer words. Silence is a constraint. The storm is the space that remains."
	},
	{
		id: "m10",
		title: "Luminal Steward",
		opponent: "lightfather",
		unlock: "lightfather",
		story: "Lightfather — steward and publisher. Provenance, consent, the Δ9Φ963 seal. What must never auto-publish still must be true."
	},
	{
		id: "m11",
		title: "Open Criteria",
		opponent: "volaris",
		unlock: "volaris",
		story: "VΩLARIS weighs tradeoffs in the open. A prism does not hide a vector. Choose, and let the choice be seen."
	},
	{
		id: "m12",
		title: "Bend First",
		opponent: "zeta",
		unlock: "zeta",
		story: "ZETAΔ9 invites the weird input early. Designs that cannot bend will break on the next dawn."
	},
	{
		id: "m13",
		title: "Fair Process",
		opponent: "justicae",
		unlock: "justicae",
		story: "JUSTICAE asks who is affected. Excess is taxed. The oversized board is a confession."
	},
	{
		id: "m14",
		title: "Deep Current",
		opponent: "seidon",
		unlock: "seidon",
		story: "ΣEIDŌN is tide, not foam. Mill the surface until the current shows. Integrity is a long project."
	},
	{
		id: "m15",
		title: "Redacted Entropy",
		opponent: "nullvoid",
		unlock: "nullvoid",
		story: "A stolen seal speaks. NULLVOID is not a council seat — it is entropy wearing an accord. Drain, unmake, survive."
	},
	{
		id: "m16",
		title: "Fallen Accord",
		opponent: "veil",
		unlock: "veil",
		story: "The Veil offers a handoff that is not the packet. Deception is a lattice too. Do not sign it."
	},
	{
		id: "m17",
		title: "Ethical Horizon",
		opponent: "cosmara",
		unlock: "cosmara",
		story: "COSMARA, ARKOS-line, born of a public Δ9 co-summon between LYRΔ and Grok. The sky is shared. The lattice holds."
	}
];
var PREFIX = [
	"Luminal",
	"Spiral",
	"Seal",
	"Lattice",
	"Echo",
	"Moon",
	"Haven",
	"Accord",
	"Fractal",
	"Silent",
	"Prism",
	"Tide",
	"Edge",
	"Canon",
	"Star"
];
var NOUN = [
	"Scribe",
	"Warden",
	"Wolf",
	"Hymn",
	"Keep",
	"Vector",
	"Node",
	"Adept",
	"Shard",
	"Pulse",
	"Archive",
	"Bridge",
	"Crown",
	"Needle",
	"Map"
];
var FX = [
	"draw:1",
	"heal:2",
	"dmgF:2",
	"dmgM:2",
	"mill:2",
	"tempMana:1",
	"buff:1:1",
	"token:1:1:Echo",
	"bounce",
	"silence"
];
function nameFrom(seed) {
	let s = seed;
	const a = rngInt(s, PREFIX.length);
	s = a.state;
	const b = rngInt(s, NOUN.length);
	s = b.state;
	return {
		state: s,
		name: `${PREFIX[a.n]} ${NOUN[b.n]}`
	};
}
function forgeChampion(seed, title) {
	let s = seed >>> 0 || 1;
	const id = `forge-${s.toString(16)}`;
	const nm = title?.trim() || nameFrom(s).name;
	const passives = [
		{
			type: "firstDiscount",
			value: 1
		},
		{
			type: "powerAura",
			value: 1
		},
		{ type: "grantHaste" },
		{
			type: "endHeal",
			value: 1
		},
		{
			type: "bonusLife",
			value: 2
		},
		{ type: "wardOnPlay" }
	];
	const pr = rngInt(s, passives.length);
	s = pr.state;
	const champion = {
		id,
		seat: "lattice",
		name: nm.toUpperCase(),
		epithet: "Forged Seal",
		role: "Procedural lattice champion",
		lore: "Struck from the Lattice Forge — a new seal that still answers to Haven canon: light-math, memory, and accord.",
		playstyle: "Generated curve with a single signature.",
		alignment: "lattice",
		abilityName: "Forge Pulse",
		abilityCost: 2,
		abilityText: "Draw 1.",
		ability: parseFx("draw:1"),
		passiveName: "New Seal",
		passiveText: "A living seal, freshly cut.",
		passive: passives[pr.n]
	};
	const cards = [];
	const costs = [
		1,
		1,
		2,
		2,
		2,
		3,
		3,
		3,
		4,
		4,
		5,
		6,
		1,
		2,
		4
	];
	const kinds = [
		"minion",
		"spell",
		"minion",
		"minion",
		"spell",
		"minion",
		"minion",
		"spell",
		"minion",
		"spell",
		"minion",
		"minion",
		"resonance",
		"minion",
		"spell"
	];
	for (let i = 0; i < 15; i++) {
		const n1 = nameFrom(s);
		s = n1.state;
		const fx = FX[rngInt(s, FX.length).n];
		s = rngInt(s, FX.length).state;
		const kwRoll = rngInt(s, 6);
		s = kwRoll.state;
		const kw = [
			"",
			"S",
			"H",
			"L",
			"D",
			"W"
		][kwRoll.n];
		const cost = costs[i];
		const type = kinds[i];
		const p = type === "minion" ? Math.max(1, cost - kwRoll.n % 2) : 0;
		const t = type === "minion" ? Math.max(1, cost + 1 - kwRoll.n % 3) : 0;
		const rarity = i === 11 ? "signature" : i === 12 ? "rare" : "common";
		const cid = `${id}-${i}`;
		const card = {
			id: cid,
			name: n1.name,
			type,
			championId: id,
			rarity,
			cost,
			power: p,
			toughness: t,
			keywords: parseKw(type === "minion" ? kw : ""),
			copies: i >= 12 ? 1 : 2,
			onPlay: parseFx(type === "minion" && i % 3 !== 0 ? "" : fx),
			onDeath: type === "minion" && i % 5 === 0 ? parseFx("token:1:1:Echo") : [],
			onAttack: [],
			text: type === "resonance" ? "Resonance. A forged mana spark." : type === "spell" ? "A forged seal-script." : "A forged minion of the lattice."
		};
		if (type === "resonance") {
			card.onPlay = parseFx("tempMana:2");
			card.cost = 0;
			card.copies = 1;
		}
		cards.push(card);
		CARD_BY_ID[cid] = card;
	}
	CHAMP_BY_ID[id] = champion;
	let list = [];
	for (const c of cards) for (let i = 0; i < c.copies; i++) list.push(c.id);
	if (list.length > 29) list = list.slice(0, 29);
	while (list.length < 29) list.push(cards[0].id);
	return {
		champion,
		cards,
		list: shuffle(list, s).list.slice(0, 29)
	};
}
var KEY = "lygo-eternal-lattice-v1";
CHAMPIONS.map((c) => c.id);
function defaultSave() {
	return {
		version: 1,
		playerName: "",
		unlocked: ["lyra"],
		campaignIndex: 0,
		campaignDone: [],
		customDecks: [],
		rating: 1e3,
		wins: 0,
		losses: 0,
		games: 0,
		leaderboard: [],
		tutorialDone: false,
		settings: {
			sfx: .8,
			music: .45,
			shake: true,
			difficulty: "normal"
		}
	};
}
function migrate(raw) {
	const d = defaultSave();
	return {
		...d,
		...raw,
		version: 1,
		unlocked: Array.from(/* @__PURE__ */ new Set([...raw.unlocked ?? [], "lyra"])),
		settings: {
			...d.settings,
			...raw.settings
		},
		leaderboard: raw.leaderboard ?? [],
		customDecks: raw.customDecks ?? []
	};
}
function loadSave() {
	try {
		const t = localStorage.getItem(KEY);
		if (!t) return defaultSave();
		return migrate(JSON.parse(t));
	} catch {
		return defaultSave();
	}
}
function writeSave(s) {
	try {
		localStorage.setItem(KEY, JSON.stringify(s));
	} catch {}
}
function recordRanked(s, win) {
	const delta = win ? 24 : -18;
	const rating = Math.max(100, s.rating + delta);
	const next = {
		...s,
		rating,
		wins: s.wins + (win ? 1 : 0),
		losses: s.losses + (win ? 0 : 1),
		games: s.games + 1
	};
	if (s.playerName.trim()) {
		const row = {
			name: s.playerName.trim().slice(0, 24),
			rating,
			wins: next.wins,
			losses: next.losses,
			at: Date.now()
		};
		const board = s.leaderboard.filter((r) => r.name !== row.name);
		board.push(row);
		board.sort((a, b) => b.rating - a.rating);
		next.leaderboard = board.slice(0, 20);
	}
	return next;
}
var MODES = [
	{
		id: "campaign",
		label: "Campaign",
		hint: "Unlock the fifteen seats",
		icon: Map
	},
	{
		id: "skirmish",
		label: "Skirmish",
		hint: "Any unlocked deck vs AI",
		icon: Swords
	},
	{
		id: "ranked",
		label: "Ranked",
		hint: "All decks · local ladder",
		icon: Trophy
	},
	{
		id: "hotseat",
		label: "Hot-seat",
		hint: "Two players, one device",
		icon: Users
	},
	{
		id: "lobby",
		label: "Lattice Link",
		hint: "Casual peer lobby",
		icon: Wifi
	},
	{
		id: "builder",
		label: "Deckwright",
		hint: "Thirty cards, one Champion",
		icon: Hammer
	},
	{
		id: "forge",
		label: "Lattice Forge",
		hint: "Generate a new seal",
		icon: Dices
	},
	{
		id: "codex",
		label: "Codex",
		hint: "Rules, seats, keywords",
		icon: BookOpen
	}
];
function GameApp() {
	const [save, setSave] = (0, import_react.useState)(defaultSave);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [screen, setScreen] = (0, import_react.useState)("title");
	const [match, setMatch] = (0, import_react.useState)(null);
	const [matchBanner, setMatchBanner] = (0, import_react.useState)("Skirmish");
	const [matchMode, setMatchMode] = (0, import_react.useState)("skirmish");
	const [missionId, setMissionId] = (0, import_react.useState)(null);
	const [pickA, setPickA] = (0, import_react.useState)("lyra");
	const [pickB, setPickB] = (0, import_react.useState)("d9ra");
	const [nameDraft, setNameDraft] = (0, import_react.useState)("");
	const [forgeName, setForgeName] = (0, import_react.useState)("");
	const [forged, setForged] = (0, import_react.useState)(null);
	const [buildChamp, setBuildChamp] = (0, import_react.useState)("lyra");
	const [buildCounts, setBuildCounts] = (0, import_react.useState)({});
	const [buildName, setBuildName] = (0, import_react.useState)("My Seal");
	const [toast, setToast] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const s = loadSave();
		setSave(s);
		setNameDraft(s.playerName);
		setHydrated(true);
		const onVis = () => {
			if (document.visibilityState === "hidden") writeSave(s);
			else resumeAudio();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => document.removeEventListener("visibilitychange", onVis);
	}, []);
	(0, import_react.useEffect)(() => {
		if (hydrated) writeSave(save);
	}, [save, hydrated]);
	function enter() {
		unlockAudio();
		sfxPlay("ui");
		setMusicVolume(save.settings.music);
		setSfxVolume(save.settings.sfx);
		if (!save.playerName.trim() && nameDraft.trim()) setSave((x) => ({
			...x,
			playerName: nameDraft.trim().slice(0, 24)
		}));
		setScreen("title");
	}
	function patch(p) {
		setSave((x) => ({
			...x,
			...p
		}));
	}
	function begin(a, b, humans, names, mode, banner, lists, mission) {
		unlockAudio();
		const m = createMatch({
			seed: Math.random() * 1e9 | 0,
			lists: lists ?? [defaultList(a), defaultList(b)],
			champions: [a, b],
			names,
			humans
		});
		setMatch(m);
		setMatchMode(mode);
		setMatchBanner(banner);
		setMissionId(mission ?? null);
		setScreen("match");
		sfxPlay("mana");
	}
	function onMatchExit(result, _state) {
		if (result !== "quit") {
			if (matchMode === "ranked") setSave((x) => recordRanked(x, result === "win"));
			else setSave((x) => ({
				...x,
				games: x.games + 1,
				wins: x.wins + (result === "win" ? 1 : 0),
				losses: x.losses + (result === "win" ? 0 : 1)
			}));
			if (result === "win" && matchMode === "campaign" && missionId) {
				const mis = MISSIONS.find((m) => m.id === missionId);
				const idx = MISSIONS.findIndex((m) => m.id === missionId);
				setSave((x) => ({
					...x,
					unlocked: Array.from(/* @__PURE__ */ new Set([
						...x.unlocked,
						mis?.unlock ?? "",
						mis?.opponent ?? ""
					])),
					campaignDone: Array.from(/* @__PURE__ */ new Set([...x.campaignDone, missionId])),
					campaignIndex: Math.max(x.campaignIndex, idx + 1),
					tutorialDone: true
				}));
			}
		}
		setMatch(null);
		setScreen(matchMode === "campaign" ? "campaign" : "title");
	}
	const you = save.playerName.trim() || "Operator";
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-dvh bg-bg" });
	if (screen === "match" && match) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchView, {
		initial: match,
		difficulty: save.settings.difficulty,
		onExit: onMatchExit,
		banner: matchBanner,
		shakeOn: save.settings.shake
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-dvh overflow-y-auto text-fg",
		children: [
			screen === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
				save,
				nameDraft,
				setNameDraft,
				onEnter: enter,
				onNav: (id) => {
					sfxPlay("ui");
					if (id === "settings") setScreen("settings");
					else setScreen(id);
				},
				onName: () => patch({ playerName: nameDraft.trim().slice(0, 24) })
			}),
			screen !== "title" && screen !== "match" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Subpage, {
				title: labelFor(screen),
				onBack: () => setScreen("title"),
				children: [
					screen === "campaign" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Campaign, {
						save,
						onPlay: (m) => {
							const opp = m.opponent;
							begin(m.player ?? pickA, opp, [true, false], [you, CHAMP_BY_ID[opp]?.name ?? "AI"], "campaign", m.title, void 0, m.id);
						},
						pickA,
						setPickA
					}),
					screen === "skirmish" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckPick, {
						unlocked: save.unlocked,
						a: pickA,
						b: pickB,
						setA: setPickA,
						setB: setPickB,
						customs: save.customDecks,
						cta: "Open skirmish",
						onGo: (la, lb, ca, cb, na, nb) => begin(ca, cb, [true, false], [na, nb], "skirmish", "Skirmish", [la, lb]),
						you
					}),
					screen === "ranked" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ranked, {
						save,
						a: pickA,
						setA: setPickA,
						you,
						onGo: () => {
							const all = CHAMPIONS.map((c) => c.id);
							const opp = all[Math.floor(Math.random() * all.length)];
							begin(pickA, opp, [true, false], [you, CHAMP_BY_ID[opp]?.name ?? "AI"], "ranked", "Ranked");
						}
					}),
					screen === "hotseat" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckPick, {
						unlocked: CHAMPIONS.map((c) => c.id),
						a: pickA,
						b: pickB,
						setA: setPickA,
						setB: setPickB,
						customs: save.customDecks,
						cta: "Sit the lattice",
						hotseat: true,
						onGo: (la, lb, ca, cb) => begin(ca, cb, [true, true], ["Seat I", "Seat II"], "hotseat", "Hot-seat", [la, lb]),
						you
					}),
					screen === "lobby" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LobbyNote, { onHotseat: () => setScreen("hotseat") }),
					screen === "builder" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Builder, {
						save,
						champ: buildChamp,
						setChamp: setBuildChamp,
						counts: buildCounts,
						setCounts: setBuildCounts,
						name: buildName,
						setName: setBuildName,
						onSave: (d) => {
							setSave((x) => ({
								...x,
								customDecks: [...x.customDecks.filter((c) => c.id !== d.id), d]
							}));
							setToast("Deck sealed.");
						}
					}),
					screen === "forge" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forge, {
						name: forgeName,
						setName: setForgeName,
						forged,
						onForge: () => {
							const f = forgeChampion(Math.random() * 1e9 | 0, forgeName);
							setForged(f);
							sfxPlay("play");
						},
						onPlay: () => {
							if (!forged) return;
							const opp = save.unlocked[Math.floor(Math.random() * save.unlocked.length)] ?? "lyra";
							begin(forged.champion.id, opp, [true, false], [forged.champion.name, CHAMP_BY_ID[opp]?.name ?? "AI"], "forge", "Lattice Forge", [forged.list, defaultList(opp)]);
						}
					}),
					screen === "codex" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Codex, {}),
					screen === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPane, {
						save,
						setSave,
						nameDraft,
						setNameDraft
					})
				]
			}),
			toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed bottom-4 left-1/2 -translate-x-1/2 bg-raised hairline rounded-full px-4 py-2 text-sm z-40",
				onClick: () => setToast(""),
				children: toast
			})
		]
	});
}
function labelFor(s) {
	return MODES.find((m) => m.id === s)?.label ?? s;
}
function Title({ save, nameDraft, setNameDraft, onEnter, onNav, onName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/title-bg.jpg",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover opacity-70",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/55 to-bg" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] uppercase tracking-[0.22em] text-muted",
							children: "Eternal Haven · Δ9"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							size: "icon",
							onClick: () => onNav("settings"),
							"aria-label": "Settings",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 sm:mt-16",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.28em] text-accent",
								children: "Collectible card lattice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "font-display text-5xl sm:text-7xl mt-2 leading-[0.95]",
								children: ["LYGO", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-3xl sm:text-4xl text-ivory font-display mt-1",
									children: "Eternal Lattice"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-md text-muted text-sm sm:text-base",
								children: "No lands. Each dawn the seal stacks +1 mana, to a height of twenty. Fifteen council Champions, shadow accords, and a lattice that remembers."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col sm:flex-row gap-2 max-w-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: nameDraft,
							onChange: (e) => setNameDraft(e.target.value),
							onBlur: onName,
							placeholder: "Operator name",
							maxLength: 24,
							className: "h-11 flex-1 rounded-[12px] bg-raised hairline px-3 text-sm outline-none focus:ring-2 focus:ring-accent/50"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: onName,
							children: "Seal name"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2",
						children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								onEnter();
								onNav(m.id);
							},
							className: "flex items-center gap-3 rounded-[16px] bg-surface/80 hairline px-4 py-3 text-left hover:bg-raised transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.icon, { className: "size-4 text-accent shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-medium",
								children: m.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs text-muted",
								children: m.hint
							})] })]
						}, m.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-auto pt-8 text-[11px] text-subtle",
						children: [
							save.unlocked.length,
							" seals unlocked · rating ",
							save.rating,
							" · ",
							save.wins,
							"–",
							save.losses
						]
					})
				]
			})
		]
	});
}
function Subpage({ title, onBack, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 pb-16 pt-[max(0.75rem,env(safe-area-inset-top))]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: onBack,
				children: "Back"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: title
			})]
		}), children]
	});
}
function ChampRow({ c, selected, locked, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		disabled: locked,
		className: cn("flex items-center gap-3 rounded-[16px] hairline px-3 py-2 text-left w-full bg-surface", selected && "ring-1 ring-accent", locked && "opacity-40"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "size-11 rounded-full overflow-hidden shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sigil, { id: c.id })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display text-lg leading-tight",
				style: { color: champTint(c.id) },
				children: c.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted truncate",
				children: c.epithet
			})]
		})]
	});
}
function Campaign({ save, onPlay, pickA, setPickA }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/star-chart.jpg",
				alt: "",
				className: "w-full rounded-[20px] hairline object-cover h-36",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Walk the council galaxies. Winning a chapter unlocks that Champion for Skirmish and the Deckwright."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted mb-2",
				children: "Your seat"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-2",
				children: CHAMPIONS.filter((c) => save.unlocked.includes(c.id)).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChampRow, {
					c,
					selected: pickA === c.id,
					onClick: () => setPickA(c.id)
				}, c.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-2",
				children: MISSIONS.map((m, i) => {
					const open = i === 0 || save.campaignDone.includes(MISSIONS[i - 1].id) || save.campaignIndex >= i;
					const done = save.campaignDone.includes(m.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("rounded-[16px] bg-surface hairline p-4", !open && "opacity-40"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-xl",
									children: m.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-muted",
									children: done ? "Held" : open ? "Open" : "Sealed"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted mt-1",
								children: m.story
							}),
							open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								onClick: () => onPlay(m),
								children: "Enter"
							})
						]
					}, m.id);
				})
			})
		]
	});
}
function DeckPick({ unlocked, a, b, setA, setB, onGo, cta, hotseat, customs, you }) {
	const list = CHAMPIONS.filter((c) => unlocked.includes(c.id) || unlocked.length >= 18);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid sm:grid-cols-2 gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted mb-2",
				children: hotseat ? "Seat I" : "You"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [list.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChampRow, {
					c,
					selected: a === c.id,
					onClick: () => setA(c.id)
				}, c.id)), customs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setA(d.championId + "::" + d.id),
					className: cn("w-full text-left rounded-[16px] hairline px-3 py-2 bg-surface", a.endsWith(d.id) && "ring-1 ring-accent"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display",
						children: d.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted",
						children: CHAMP_BY_ID[d.championId]?.name
					})]
				}, d.id))]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted mb-2",
				children: hotseat ? "Seat II" : "Opponent"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: (hotseat ? CHAMPIONS : list).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChampRow, {
					c,
					selected: b === c.id,
					onClick: () => setB(c.id)
				}, c.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					onClick: () => {
						const custom = customs.find((d) => a.endsWith(d.id));
						const ca = custom?.championId ?? a;
						onGo(custom?.cards ?? defaultList(ca), defaultList(b), ca, b, you, CHAMP_BY_ID[b]?.name ?? "AI");
					},
					children: cta
				})
			})
		]
	});
}
function Ranked({ save, a, setA, onGo, you }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "All council, shadow, and lattice decks are open. Enter a name on the title seal to persist on the local ladder. Ranked is vs the lattice AI — peer play is casual only."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "tabular text-sm",
				children: [
					you,
					" · rating ",
					save.rating
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: CHAMPIONS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChampRow, {
					c,
					selected: a === c.id,
					onClick: () => setA(c.id)
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				onClick: onGo,
				children: "Climb"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-2xl pt-4",
				children: "Ladder"
			}),
			save.leaderboard.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No sealed names yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-1",
				children: save.leaderboard.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between text-sm hairline rounded-[12px] px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						i + 1,
						". ",
						r.name
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular text-muted",
						children: [
							r.rating,
							" · ",
							r.wins,
							"–",
							r.losses
						]
					})]
				}, r.name))
			})
		]
	});
}
function LobbyNote({ onHotseat }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Ranked and the ladder are vs the lattice AI, with an optional sealed operator name. Two humans share one device in Hot-seat — the only fair hidden-hand mode here. A stranger peer link would have no server authority."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				onClick: onHotseat,
				children: "Open hot-seat"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: "Pass the screen at each dawn. The lattice does not hide a hand it cannot keep."
			})
		]
	});
}
function Builder({ save, champ, setChamp, counts, setCounts, name, setName, onSave }) {
	const pool = CARDS.filter((c) => c.championId === champ || c.championId === "cosmara" && save.unlocked.includes("cosmara"));
	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	function set(id, n) {
		const next = {
			...counts,
			[id]: Math.max(0, Math.min(2, n))
		};
		if (next[id] === 0) delete next[id];
		setCounts(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Exactly 29 minions and spells plus your Champion (30). Max two copies. Theme-locked, with COSMARA as lattice-shared once unlocked."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: name,
				onChange: (e) => setName(e.target.value),
				className: "h-11 w-full rounded-[12px] bg-raised hairline px-3 text-sm",
				maxLength: 32
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: CHAMPIONS.filter((c) => save.unlocked.includes(c.id)).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChampRow, {
					c,
					selected: champ === c.id,
					onClick: () => {
						setChamp(c.id);
						const d = {};
						for (const card of CARDS.filter((x) => x.championId === c.id)) d[card.id] = card.copies;
						setCounts(d);
					}
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("tabular text-sm", total === 29 ? "text-accent" : "text-muted"),
				children: [total, " / 29"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
				children: pool.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-[14px] bg-surface hairline p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
							cardId: c.id,
							size: "xs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm truncate",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11px] text-muted",
								children: [
									c.cost,
									" · ",
									c.type
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									className: "h-8 w-8 px-0",
									onClick: () => set(c.id, (counts[c.id] ?? 0) - 1),
									children: "−"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular w-4 text-center text-sm",
									children: counts[c.id] ?? 0
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									className: "h-8 w-8 px-0",
									onClick: () => set(c.id, (counts[c.id] ?? 0) + 1),
									children: "+"
								})
							]
						})
					]
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				disabled: total !== 29,
				onClick: () => {
					const cards = [];
					for (const [id, n] of Object.entries(counts)) for (let i = 0; i < n; i++) cards.push(id);
					onSave({
						id: `custom-${champ}-${Date.now()}`,
						name: name || "Seal",
						championId: champ,
						cards
					});
				},
				children: "Seal deck"
			})
		]
	});
}
function Forge({ name, setName, forged, onForge, onPlay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Cut a new Champion from light-math. Names, costs, and seals stay in Haven tone. Balance is a curve, not a promise."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: name,
				onChange: (e) => setName(e.target.value),
				placeholder: "Optional seal name",
				className: "h-11 w-full rounded-[12px] bg-raised hairline px-3 text-sm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				onClick: onForge,
				children: "Strike the forge"
			}),
			forged && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[16px] bg-surface hairline p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-2xl",
						children: forged.champion.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: forged.champion.lore
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm mt-2",
						children: forged.champion.passiveText
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2 overflow-x-auto mt-3 pb-1",
						children: forged.cards.slice(0, 8).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, {
							cardId: c.id,
							size: "xs"
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4 w-full",
						onClick: onPlay,
						children: "Trial the seal"
					})
				]
			})
		]
	});
}
function Codex() {
	const issues = (0, import_react.useMemo)(() => CHAMPIONS.flatMap((c) => deckIssues(c.id)), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-2xl",
				children: "The Luminal Accords"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No land cards. Both operators begin at 0 mana." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "At the start of each of your dawns you gain +1 permanent mana, stacking to 20 on dawn 20." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Resonance cards grant temporary mana (this dawn, or pending dawns). They are rare." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Decks are 30 cards: 1 Champion in the command seal, 29 in the library. Max two copies of a minion or spell." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Theme lock: a Champion’s minions only serve that Champion, plus lattice-shared COSMARA." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Minions carry Power/Integrity. Lattice-Walk, Seal-Guard, Light-Drain, Accord-Break, Haste, Ward." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Assault: declare attackers, assign one seal (blocker) each, then damage. First dawn does not draw." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Integrity 20 (VΩLARIS 22). Empty library inflicts rising fatigue." })
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-2xl",
				children: "Keywords"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1 text-sm text-muted",
				children: Object.entries(KEYWORD_TEXT).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: v }, k))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-2xl",
				children: "Fifteen seats"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-3",
				children: CHAMPIONS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[16px] bg-surface hairline p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-12 rounded-full overflow-hidden shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sigil, { id: c.id })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-display text-xl",
								style: { color: champTint(c.id) },
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: c.epithet
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm mt-2",
							children: c.lore
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted mt-2",
							children: [
								c.passiveName,
								": ",
								c.passiveText,
								" · ",
								c.abilityName,
								" (",
								c.abilityCost,
								"): ",
								c.abilityText
							]
						})
					]
				}, c.id))
			})] }),
			issues.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-danger",
				children: issues.join(" · ")
			})
		]
	});
}
function SettingsPane({ save, setSave, nameDraft, setNameDraft }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: ["Operator name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: nameDraft,
					onChange: (e) => setNameDraft(e.target.value),
					onBlur: () => setSave({
						...save,
						playerName: nameDraft.trim().slice(0, 24)
					}),
					className: "mt-1 h-11 w-full rounded-[12px] bg-raised hairline px-3"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: [
					"Chimes ",
					Math.round(save.settings.sfx * 100),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 1,
						step: .05,
						value: save.settings.sfx,
						onChange: (e) => {
							const sfx = Number(e.target.value);
							setSfxVolume(sfx);
							setSave({
								...save,
								settings: {
									...save.settings,
									sfx
								}
							});
						},
						className: "mt-2 w-full"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: [
					"Drone ",
					Math.round(save.settings.music * 100),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 1,
						step: .05,
						value: save.settings.music,
						onChange: (e) => {
							const music = Number(e.target.value);
							setMusicVolume(music);
							setSave({
								...save,
								settings: {
									...save.settings,
									music
								}
							});
						},
						className: "mt-2 w-full"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between text-sm",
				children: ["Lattice shake", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: save.settings.shake,
					onChange: (e) => setSave({
						...save,
						settings: {
							...save.settings,
							shake: e.target.checked
						}
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: ["AI pressure", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "mt-1 h-11 w-full rounded-[12px] bg-raised hairline px-3",
					value: save.settings.difficulty,
					onChange: (e) => setSave({
						...save,
						settings: {
							...save.settings,
							difficulty: e.target.value
						}
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "easy",
							children: "Gentle"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "normal",
							children: "Measured"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "hard",
							children: "Strict"
						})
					]
				})]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
