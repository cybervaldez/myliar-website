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
  personaDescription: string | null;
  quirk: string | null;
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

export interface ParityData {
  tokens: Record<string, string>;
  relTiers: { thresholds: number[]; names: string[] };
  itemRarities: string[];
  vibeBands: VibeBand[];
  squad: SquadMember[];
  elseworldSamples: ElseworldSample[];
  phoneRealmMap: string;
  simScenario: unknown;
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
    { label: "The Codex", href: "/wiki" },
    {
      label: "Dramatis Personae",
      href: "/wiki/characters",
      children: squad().map((c) => ({
        label: c.name,
        href: `/wiki/characters/${c.id}`,
      })),
    },
    {
      label: "Elseworlds",
      href: "/wiki/elseworlds",
      children: vibeBands().map((b) => ({
        label: b.label,
        href: `/wiki/elseworlds/${b.id}`,
      })),
    },
    { label: "Atlas", href: "/wiki/atlas" },
    { label: "Mechanics", href: "/wiki/mechanics" },
    { label: "The Main Line", href: "/wiki/arc", editorial: true },
    { label: "Lexicon", href: "/wiki/lexicon", editorial: true },
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
