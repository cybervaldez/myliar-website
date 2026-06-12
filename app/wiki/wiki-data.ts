// Wiki data layer — typed accessors over parity.generated.json.
//
// The wiki's factual spine is the parity export (game → website, one-way).
// This module types it, exposes getters, and owns the nav registry + the
// [[cross-link]] slug resolver. Never hand-edit the JSON; run `npm run
// parity`. Hand-authored prose (arc, lexicon) lives in its own pages.

import parityRaw from "../lib/parity.generated.json";

// The Full-REL PASSIVE ("what they taught you") — the KEEP reward unlocked at
// a character's Unspoken tier (story-engine §2). null when none (e.g. Sam).
export interface Passive {
  name: string;
  taught: string;
  critBonusPct: number;
}

export interface SquadMember {
  id: string;
  name: string;
  classLabel: string;
  specialty: string;
  helpSummary: string | null;
  archetype: string | null;
  // NOTE: personaDescription + quirk are intentionally NOT carried for the
  // canonical squad — they're author-craft fields (IDIOLECT directives +
  // NEVER-clauses listing banned words) and would leak those words onto
  // the public wiki. The player-facing voice is helpSummary + archetype.
  // (Elseworld samples DO carry them — those sheets are written clean.)
  // appearance = the in-fiction "Field Notes" that double as an image-gen brief
  // (the headline wiki feature). Revealed canon for the squad.
  appearance: string | null;
  starterPrompts: string[];
  gender: string | null;
  titles: string[];
  intimateTitle: string;
  passive: Passive | null;
  joinsDay: number | null;
}

// A campaign's metadata + its achievement-title MOTIF (the viral, story-tied
// trophy-naming convention it holds — kind: prefix | suffix | theme).
export interface CampaignMeta {
  id: string;
  title: string;
  tagline: string;
  gift: string;
  runId: string;
  nativeThemeId: string; // theme_pack id this campaign wears (e.g. 'corner')
  motif: { kind: string; pattern: string; hook: string };
  relTierNames: string[];
}

// The Wingman coaches — a second canonical cast (the dating expansion). Squad
// shape PLUS the earned titles[], the intimate (full-REL) title, the intro line,
// and the dating-reskinned stat lane (NERVE/VOICE/READ/PRESENCE/the FLOOR).
export interface WingmanCoach {
  id: string;
  name: string;
  classLabel: string;
  statLane: string | null;
  specialty: string;
  helpSummary: string;
  archetype: string;
  appearance: string;
  starterPrompts: string[];
  titles: string[];
  intimateTitle: string;
  passive: Passive | null;
  introLine: string;
  gender: string | null;
  joinsDay: number | null;
}

// Spoiler-safe: a mystery character (e.g. Wren) carries ONLY the obscured brief
// + a gate count. No name/title/class/real-appearance/persona ever ships — the
// page renders ??? exactly as the game does until the player earns the reveal.
export interface MysteryCharacter {
  id: string;
  mystery: true;
  mysteryAppearance: string | null;
  gateCount: number;
  gender: string | null;
}

export interface ElseworldSample {
  bandId: string;
  encounterId: string | null;
  name: string | null;
  classLabel: string | null;
  archetype: string | null;
  personaDescription: string | null;
  quirk: string | null;
  specialty: string | null;
  helpSummary: string | null;
  gender: string | null;
  coldOpen: string | null;
  firstVoice: string | null;
  engageOption: { label: string; roleHint: string } | null;
  observeOption: { label: string; roleHint: string } | null;
  declineOption: { label: string; roleHint: string } | null;
}

export interface VibeBand {
  id: string;
  label: string;
}

export interface Achievement {
  id: string;
  title: string | null;
  blurb: string | null;
  category: string | null;
  critBonusPct: number;
  rarity: string; // common | uncommon | rare | epic | legendary
  hidden: boolean;
}

export interface Item {
  id: string | null;
  name: string;
  description: string;
  rarity: string; // memento | keepsake | relic | legendary (payload `kind`)
  statDeltas: Record<string, number>;
  grantsAchievement: string | null;
  foundDay: number | null;
  foundCharacter: string | null;
}

// v0.0.42 — callback variants: a held achievement FLAG (set by a past
// selection) swaps in this text on a later day. The "selections influence
// future dialogue" mechanic, routed through the one unlock currency.
export interface ReactionVariant {
  unlockIf: string[];
  reactionText: string;
  reactionTextOnCritFail: string | null;
}
export interface ScenarioVariant {
  unlockIf: string[];
  scenario: string;
}

export interface MainlineChoice {
  id: string;
  role: string;
  label: string;
  delta: Record<string, number>;
  diceRoll: { critSuccessMultiplier: number; critFailMultiplier: number; critChance: number } | null;
  reactionText: string;
  reactionTextOnCritFail: string | null;
  itemDrop: { name: string; description: string; kind: string; grantsAchievement: string | null } | null;
  // v0.0.42 — the flag this selection sets, + callback reactions it may show.
  grantsAchievement: string | null;
  reactionVariants: ReactionVariant[];
}

export interface MainlineEvent {
  id: string;
  scenario: string;
  choices: MainlineChoice[];
  scenarioVariants: ScenarioVariant[];
  memoryWrites: { text: string; emotion: string | null }[];
}

export interface MainlineDay {
  payloadId: string;
  narrativeType: string;
  episodeTitle: string; // the per-campaign EPISODE-TITLE motif (the day card)
  globalDayIndex: number;
  characterId: string | null;
  introducesCharacterId: string | null;
  agentMoodToday: string | null;
  closingHook: string | null;
  tierUpReveal: { category: string; deliveredInEventId: string } | null;
  callbacks: unknown[];
  frameFlags: string[];
  events: MainlineEvent[];
}

export interface DataVersion {
  runId: string;
  contentHash: string;
}

export interface ParityData {
  version: DataVersion;
  tokens: Record<string, string>;
  relTiers: { thresholds: number[]; names: string[] };
  itemRarities: string[];
  vibeBands: VibeBand[];
  squad: SquadMember[];
  campaigns?: CampaignMeta[];
  mysteryRoster: MysteryCharacter[];
  achievements: Achievement[];
  items: Item[];
  elseworldSamples: ElseworldSample[];
  phoneRealmMap: string;
  simScenario: unknown;
  mainline: { runId: string; days: MainlineDay[] };
  wingman: { runId: string; cast: WingmanCoach[]; days: MainlineDay[]; items: Item[] };
}

const parity = parityRaw as unknown as ParityData;

export const squad = (): SquadMember[] => parity.squad;
export const campaignsMeta = (): CampaignMeta[] => parity.campaigns ?? [];
export const campaignMeta = (id: string): CampaignMeta | undefined =>
  (parity.campaigns ?? []).find((c) => c.id === id);
export const characterById = (id: string): SquadMember | undefined =>
  parity.squad.find((c) => c.id === id);
export const achievements = (): Achievement[] => parity.achievements;
export const achievementById = (id: string): Achievement | undefined =>
  parity.achievements.find((a) => a.id === id);
export const items = (): Item[] => parity.items;
export const itemSlug = (it: Item): string =>
  (it.id ?? it.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
export const itemBySlug = (slug: string): Item | undefined =>
  parity.items.find((it) => itemSlug(it) === slug);
// Display-time lexicon substitution — a faithful 1:1 port of the Flutter app's
// lib/lexicon.dart humanizeLexicon(), so the WEBSITE (wiki, codex, /play) shows
// the SAME player-facing prose the app does. Authoring anchors like "[the floor]"
// / "[bell*]" / "`,` outdoor grass" are realm-map grammar for the generation
// pipeline, NOT meant to render to players. Keep this in lockstep with the Dart.
const _objectTokens: Record<string, string> = {
  recipe: "the recipe", ledger: "the ledger", bell: "the bell", clip: "the training log",
  pic: "the photo", notes: "the notes wall", drawer: "the drawer", desk: "the desk",
  "foam-roller": "the foam roller", noticeboard: "the noticeboard", bleachers: "the bleachers",
  track: "the track", bench: "the bench", prep: "the prep station", line: "the line",
  mise: "the mise station", "dish pit": "the dish pit", "courtyard center": "the courtyard",
  "portal gate": "the portal gate",
  urn: "the urn", till: "the till", shelf: "the shelf", book: "the burnt book", gate: "the gate", stall: "the stall",
};
const _tilePhrases: Record<string, string> = {
  "outdoor grass": "the grass", "commercial tile": "the kitchen floor", "neutral tile": "the floor",
};
const _bracketToken = /\[([^[\]]+?)\]/g;
const _backtickGlyph = /`[^`]`(\s+[a-z]+(?:\s+[a-z]+)?)?/g;
// A word that already determines the noun — when it immediately precedes a
// token, the injected "the" is dropped ("a [desk]" → "a desk", "Kenji's
// [ledger*]" → "Kenji's ledger"). The 's branch must be a true possessive:
// contraction stems ("that's the recipe" = "that is") keep the article.
const _precedingDeterminer = new RegExp(
  "(?:\\b(?:a|an|the|his|her|their|your|my|our|its)" +
    "|\\b(?!(?:that|it|what|here|there|she|he|who|let|where|how|when|why" +
    "|everything|something|anything|nothing|everyone|someone|anyone|one)')" +
    "\\w+'s)\\s*$",
  "i",
);

// Fit a substitution into its surroundings: drop the injected article when
// the preceding word already determines the noun, and drop the trailing word
// when the very next word repeats it ("[notes*] wall" → "the notes wall").
const _fitContext = (input: string, start: number, end: number, sub: string): string => {
  let s = sub;
  if (s.toLowerCase().startsWith("the ") && _precedingDeterminer.test(input.slice(0, start))) {
    s = s.slice(4);
  }
  const lastWord = s.includes(" ") ? s.split(" ").pop()! : s;
  const follow = /^\s+([A-Za-z-]+)/.exec(input.slice(end));
  if (follow && follow[1].toLowerCase() === lastWord.toLowerCase()) {
    s = s.slice(0, s.length - lastWord.length).trimEnd();
  }
  return s;
};

/** Convert authoring lexicon tokens into player-facing prose. Idempotent. */
export const humanizeLexicon = (raw: string): string => {
  if (!raw) return raw;
  let out = raw;
  // 1. Backtick map-glyphs first ("`,` outdoor grass" → "the grass"; bare "`:`" → "").
  out = out.replace(_backtickGlyph, (m, g1: string | undefined, offset: number, full: string) => {
    const trailing = (g1 ?? "").trim().toLowerCase();
    if (!trailing) return "";
    const sub = _tilePhrases[trailing] ?? trailing;
    return _fitContext(full, offset, offset + m.length, sub);
  });
  // 2. Bracket object-tokens ("[bell*]" → "the bell"; "[prep] zone" → "the prep station zone").
  out = out.replace(_bracketToken, (m, inner: string, offset: number, full: string) => {
    let v = inner.trim();
    if (v.endsWith("*")) v = v.slice(0, -1);
    const key = v.toLowerCase();
    let sub: string;
    if (key in _objectTokens) {
      sub = _objectTokens[key];
    } else {
      // An inner that already carries its article ("[the floor]") is not
      // double-articled by the graceful default.
      const cleaned = v.replace(/[_-]/g, " ").trim();
      if (!cleaned) return "";
      sub = cleaned.toLowerCase().startsWith("the ") ? cleaned : `the ${cleaned}`;
    }
    return _fitContext(full, offset, offset + m.length, sub);
  });
  // 3. Tidy doubled articles (CASE-PRESERVING — "The the grass" keeps its
  //    capital) + whitespace the substitution can create.
  out = out.replace(/\b(the)\s+the\b/gi, "$1").replace(/ {2,}/g, " ").replace(/ +([.,;:!?])/g, "$1");
  return out.trim();
};

export const mysteryRoster = (): MysteryCharacter[] => parity.mysteryRoster;
export const mysteryById = (id: string): MysteryCharacter | undefined =>
  parity.mysteryRoster.find((m) => m.id === id);
export const relTiers = () => parity.relTiers;
export const itemRarities = () => parity.itemRarities;
export const vibeBands = (): VibeBand[] => parity.vibeBands;
export const elseworldSamples = (): ElseworldSample[] => parity.elseworldSamples;
export const elseworldSampleByBand = (bandId: string): ElseworldSample | undefined =>
  parity.elseworldSamples.find((s) => s.bandId === bandId);
export const phoneRealmMap = (): string => parity.phoneRealmMap;
export const tokens = () => parity.tokens;

// The data snapshot this wiki was generated from. Every note records it
// so triage knows which canon version a note refers to.
export const dataVersion = (): DataVersion => parity.version;
export const snapshotLabel = (): string =>
  `${parity.version.runId} · ${parity.version.contentHash}`;

// ── Mainline accessors ───────────────────────────────────────────────
export const mainline = () => parity.mainline;
export const mainlineDays = (): MainlineDay[] => parity.mainline.days;
export const mainlineDay = (day: number): MainlineDay | undefined =>
  parity.mainline.days.find((d) => d.globalDayIndex === day);
export const mainlineFlagCount = (): number =>
  parity.mainline.days.reduce((n, d) => n + d.frameFlags.length, 0);

// ── The Wingman (the dating expansion) ──────────────────────────────────
export const wingman = () => parity.wingman;
export const wingmanCast = (): WingmanCoach[] => parity.wingman.cast;
export const wingmanCoachById = (id: string): WingmanCoach | undefined =>
  parity.wingman.cast.find((c) => c.id === id);
export const wingmanDays = (): MainlineDay[] => parity.wingman.days;
export const wingmanDay = (day: number): MainlineDay | undefined =>
  parity.wingman.days.find((d) => d.globalDayIndex === day);
export const wingmanItems = (): Item[] => parity.wingman.items;
export const wingmanFlagCount = (): number =>
  parity.wingman.days.reduce((n, d) => n + d.frameFlags.length, 0);

// ── REL tier helper ──────────────────────────────────────────────────
// Returns the inclusive REL range string for tier i, e.g. "15–39".
export function relRange(i: number): string {
  const { thresholds } = parity.relTiers;
  const lo = i === 0 ? 0 : thresholds[i - 1];
  const hi = i < thresholds.length ? thresholds[i] - 1 : null;
  return hi === null ? `${lo}+` : `${lo}–${hi}`;
}

// ── Navigation registry ──────────────────────────────────────────────
// The left-nav namespaces. `editorial` entries are hand-authored prose
// pages (arc / lexicon) still being written — flagged so the nav can
// mark them honestly rather than pretending they're complete.
export interface NavEntry {
  label: string;
  href: string;
  editorial?: boolean;
  children?: { label: string; href: string }[];
}

// The six fixed portals (companion-wiki §4) + a demoted utility group.
// Portals are derived from what the game contains: people, things, the
// unlock-currency, places, the story, the rules.
export function navTree(): NavEntry[] {
  return [
    { label: "Home", href: "/wiki" },
    {
      label: "Characters",
      href: "/wiki/characters",
      children: squad().map((c) => ({ label: c.name, href: `/wiki/characters/${c.id}` })),
    },
    { label: "Items", href: "/wiki/codex" },
    { label: "Achievements", href: "/wiki/trophies" },
    {
      label: "Worlds",
      href: "/wiki/atlas",
      children: [
        { label: "Community Worlds", href: "/wiki/elseworlds/community" },
        ...vibeBands().map((b) => ({ label: b.label, href: `/wiki/elseworlds/${b.id}` })),
      ],
    },
    { label: "Story", href: "/wiki/arc", editorial: true },
    {
      label: "The Wingman",
      href: "/wiki/wingman",
      editorial: true,
      children: wingmanCast().map((c) => ({ label: c.name, href: `/wiki/wingman#${c.id}` })),
    },
    {
      label: "How to Play",
      href: "/wiki/mechanics",
      children: [{ label: "Lexicon", href: "/wiki/lexicon" }],
    },
    // ── utility (not content sections) ──
    { label: "Buzz", href: "/wiki/buzz" },
    { label: "Updates", href: "/wiki/changelog" },
    { label: "Companion", href: "/profile" },
  ];
}

// ── [[cross-link]] resolver ──────────────────────────────────────────
// Resolves a slug token to { href, label }. Used by <WikiLink to="hana">.
// Unknown tokens return null so the caller can render a "stub" style.
export function resolveWikiLink(
  to: string,
): { href: string; label: string } | null {
  const c = characterById(to);
  if (c) return { href: `/wiki/characters/${c.id}`, label: c.name };

  const band = vibeBands().find((b) => b.id === to);
  if (band) return { href: `/wiki/elseworlds/${band.id}`, label: band.label };

  const mechAnchors: Record<string, { href: string; label: string }> = {
    REL: { href: "/wiki/mechanics#rel", label: "REL" },
    stats: { href: "/wiki/mechanics#stats", label: "the four stats" },
    dice: { href: "/wiki/mechanics#dice", label: "dice & crits" },
    items: { href: "/wiki/mechanics#items", label: "item rarities" },
    AP: { href: "/wiki/mechanics#ap", label: "AP" },
    trichotomy: { href: "/wiki/mechanics#trichotomy", label: "the trichotomy" },
    courtyard: { href: "/wiki/atlas", label: "the Courtyard" },
  };
  return mechAnchors[to] ?? null;
}
