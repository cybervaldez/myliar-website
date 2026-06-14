// THE AUDITION REGISTRY — the single add-point for new content. The URL is campaign-primary
// (/auditions/<campaign>/<step>); this maps every campaign × step to its data, normalizers, the
// carried-forward look-back, and the cross-story reference. A new story = add one block to CAMPAIGNS
// (+ its data/<campaign>/<step>.json). Concept is the shared SLATE (the master idea bank) — every
// campaign's pipeline is born from it. NOT canon.
import { type Item, type StepData, topOf } from "./score";
import slate from "./data/concepts.json";
import ferryPilot from "./data/ferry/pilot.json";
import ferryDestination from "./data/ferry/destination.json";

export const STEP_DEFS = [
  { key: "concept", label: "The Concept" },
  { key: "pilot", label: "The Pilot" },
  { key: "destination", label: "The Destination" },
  { key: "struggle", label: "The Struggle" },
  { key: "cast", label: "The Cast" },
  { key: "motif", label: "The Motif" },
];
export const stepLabel = (k: string) => STEP_DEFS.find((s) => s.key === k)?.label ?? k;
export const stepNo = (k: string) => "①②③④⑤⑥"[STEP_DEFS.findIndex((s) => s.key === k)] ?? "•";

// THE SLATE — the master concept ledger (every concept, all rounds). Cross-campaign by nature.
export const SLATE = slate as unknown as { concepts: { id: string; t1: string; t2: string; world: string; gift: string }[] } & StepData;
export const SLATE_STATUS: Record<string, string> = { ferry: "building", lighthouse: "available", cloudhouse: "available" };

// per-step normalizers → Item[] (add a new step's normalizer here when its audition lands)
const NORM: Record<string, (d: { [k: string]: unknown }) => Item[]> = {
  concept: (d) => (d as unknown as typeof SLATE).concepts.map((c, k) => ({ key: c.id, idx: k + 1, title: c.t2, sub: c.t1, body: `${c.world}\n\nGift — ${c.gift}` })),
  pilot: (d) => (d as { pilots: { id: string; title: string; tone: string; scene: string }[] }).pilots.map((p, k) => ({ key: p.id, idx: k + 1, title: p.title, sub: `tone — ${p.tone}`, body: p.scene })),
  destination: (d) => (d as { destinations: { id: string; title: string; facet: string; sample: string }[] }).destinations.map((x, k) => ({ key: x.id, idx: k + 1, title: x.title, sub: x.facet, body: x.sample })),
};
export const INTRO: Record<string, string> = {
  concept: "The cover meets the room. Each candidate is shown the way a player meets it — its two-part title, its world, and the gift it gives on night one. The audience scores relate · feels-safe; the look-ahead legs leave forward notes.",
  pilot: "One concept, three tones for the night-one scene. The fleet scores which tone lands — and whether the look-ahead legs can now build the struggle the concept left hairline.",
  destination: "The deepest chat the whole game converges to — the full-REL coach. Authored first; every other build step makes the PATH to it. The fleet asks: does the deepest relationship land? The path-building legs ask: is this coach worth the climb?",
};

type Carried = { step: string; lines: string[] }[];
export const CAMPAIGNS: Record<string, {
  label: string; pick: string; blurb: string;
  steps: Record<string, StepData>;
  carried: Record<string, Carried>;
}> = {
  ferry: {
    label: "The Ferry", pick: "ferry",
    blurb: "a small night ferry that crosses the same dark strait every night, and always comes back — the one hour nobody can ask more of you",
    steps: { pilot: ferryPilot as unknown as StepData, destination: ferryDestination as unknown as StepData },
    carried: {
      pilot: [{
        step: "① CONCEPT — building THE FERRY",
        lines: [
          "won the room (r5.0 / s5.0 — the night crossing = the one hour nobody can ask more of you)",
          "◆ gem carried: the calm risks a passive struggle — the struggle + mechanics legs came back hairline",
          "↳ seed: the letting-go must be INTERNAL (leave a day behind unfinished, honestly), not external stakes",
        ],
      }],
      destination: [
        { step: "① CONCEPT — THE FERRY", lines: ["the crossing as the day-unit", "◆ gem: a passive struggle (hairline) → must resolve to an internal letting-go"] },
        { step: "② PILOT — “Logged at Full Weight” won (5★, every leg load-bearing)", lines: ["a clear-eyed WITNESS, not a mentor", "the “I log you at full weight” tone turned the struggle gem load-bearing", "↳ seed: the coach witnesses without grading — belonging must never read as social demand"] },
      ],
    },
  },
};

export const campaignKeys = () => Object.keys(CAMPAIGNS);
export const hasStep = (campaign: string, step: string) => step === "concept" ? !!SLATE_STATUS[CAMPAIGNS[campaign]?.pick] : !!CAMPAIGNS[campaign]?.steps[step];

// the data + normalized items for one campaign × step (concept resolves to the shared SLATE)
export function stepDataFor(campaign: string, step: string): { data: StepData; items: Item[]; isSlate: boolean } | null {
  if (!CAMPAIGNS[campaign]) return null;
  if (step === "concept") return { data: SLATE, items: NORM.concept(SLATE as unknown as { [k: string]: unknown }), isSlate: true };
  const d = CAMPAIGNS[campaign].steps[step];
  if (!d || !NORM[step]) return null;
  return { data: d, items: NORM[step](d as unknown as { [k: string]: unknown }), isSlate: false };
}

// every static path: each campaign × each step it has auditioned
export function allParams(): { campaign: string; step: string }[] {
  const out: { campaign: string; step: string }[] = [];
  for (const c of campaignKeys()) for (const s of STEP_DEFS) if (hasStep(c, s.key)) out.push({ campaign: c, step: s.key });
  return out;
}

// the cross-story reference: how OTHER campaigns auditioned this same step (the idea bank)
export function crossRef(campaign: string, step: string): { campaign: string; label: string; title: string; star: number }[] {
  if (step === "concept") return [];
  const out = [];
  for (const c of campaignKeys()) {
    if (c === campaign) continue;
    const sd = stepDataFor(c, step);
    if (!sd) continue;
    const top = topOf(sd.data, sd.items.map((i) => i.title));
    out.push({ campaign: c, label: CAMPAIGNS[c].label, title: top.title, star: top.star });
  }
  return out;
}
