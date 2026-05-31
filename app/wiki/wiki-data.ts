// Wiki data layer — typed accessors over parity.generated.json.
//
// The wiki's factual spine is the parity export (game → website, one-way).
// This module types it, exposes getters, and owns the nav registry + the
// [[cross-link]] slug resolver. Never hand-edit the JSON; run `npm run
// parity`. Hand-authored prose (arc, lexicon) lives in its own pages.

import parityRaw from "../lib/parity.generated.json";

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
  starterPrompts: string[];
  gender: string | null;
  joinsDay: number | null;
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

export interface MainlineChoice {
  id: string;
  role: string;
  label: string;
  delta: Record<string, number>;
  diceRoll: { critSuccessMultiplier: number; critFailMultiplier: number; critChance: number } | null;
  reactionText: string;
  reactionTextOnCritFail: string | null;
  itemDrop: { name: string; description: string; kind: string } | null;
}

export interface MainlineEvent {
  id: string;
  scenario: string;
  choices: MainlineChoice[];
  memoryWrites: { text: string; emotion: string | null }[];
}

export interface MainlineDay {
  payloadId: string;
  narrativeType: string;
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
  elseworldSamples: ElseworldSample[];
  phoneRealmMap: string;
  simScenario: unknown;
  mainline: { runId: string; days: MainlineDay[] };
}

const parity = parityRaw as unknown as ParityData;

export const squad = (): SquadMember[] => parity.squad;
export const characterById = (id: string): SquadMember | undefined =>
  parity.squad.find((c) => c.id === id);
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

export function navTree(): NavEntry[] {
  return [
    { label: "🏠 Home", href: "/wiki" },
    {
      label: "👥 Characters",
      href: "/wiki/characters",
      children: squad().map((c) => ({
        label: c.name,
        href: `/wiki/characters/${c.id}`,
      })),
    },
    {
      label: "✦ Elseworlds",
      href: "/wiki/elseworlds",
      children: vibeBands().map((b) => ({
        label: b.label,
        href: `/wiki/elseworlds/${b.id}`,
      })),
    },
    { label: "🗺 Maps", href: "/wiki/atlas" },
    { label: "🎮 How to Play", href: "/wiki/mechanics" },
    { label: "📖 Story", href: "/wiki/arc", editorial: true },
    { label: "💬 Words", href: "/wiki/lexicon", editorial: true },
    { label: "🔥 Buzz", href: "/wiki/buzz" },
    { label: "🆕 Updates", href: "/wiki/changelog" },
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
