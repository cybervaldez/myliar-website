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
// THE PER-STEP PRIMERS — the collapsible ELI5 at the top of each step page: what the step is FOR,
// how it IMPACTS the story, how to CHOOSE, + a named CRAFT principle. Grounded by the 2026-06-14
// deep-research pass (screenwriting/novel/game-narrative craft, adversarially verified): logline =
// promise/nucleus (not a pass/fail acid test); opening = tonal audition answering 3 silent questions;
// ending-first reshapes act one; Truby psychological vs moral need; ensemble unified by a THEME (not
// forced-distinct functions); motif = meaning by repetition. Sources in docs/flavors/concepts/GUIDELINE.md.
export const PRIMERS: Record<string, { tldr: string; whatFor: string; impact: string; howToChoose: string; mechanic?: string; craft?: string }> = {
  concept: {
    tldr: "the big idea — the world, the gift, and who it’s for; the promise that makes someone pick this off the shelf",
    whatFor: "The concept is the cover and the logline rolled into one: the setting, the gift you get on night one, and who it’s for. Like a good logline it hooks by what it OFFERS while leaving the ending unspoken — a promise to the player.",
    impact: "It’s the nucleus everything downstream organizes around — tone, coach, struggle, motif all grow from it. A weak concept can’t be rescued by good writing later; the world you pick here is the soil for all of it.",
    howToChoose: "Don’t crown the ‘best’ — there’s no single-sentence acid test that proves a premise (the research killed that myth). Pick the one whose AUDIENCE deeply relates AND that the later build-steps can build richly on (load-bearing legs). A high score with a hairline leg is a strong idea carrying a known gem to fix — keep it; the gem is the to-do.",
    mechanic: "the GIFT (useful at REL 0) + the stat-skins. Fit test: can the coach actually deliver this gift, and can the four stats skin this domain honestly?",
    craft: "Craft: a logline is a promise that hooks by withholding the ending — the nucleus the whole story organizes around (it’s not a pass/fail acid test for the idea).",
  },
  pilot: {
    tldr: "the first scene — and the TONE it sets. the taste test.",
    whatFor: "The pilot is night one: a tiny microcosm of the whole story that must answer three silent questions in the first minutes — what is this, who do I care about, why keep going? — and lock the voice (wry, warm, still) the rest will speak in.",
    impact: "Tone is a promise. The opening is an audition: if it feels safe and unhurried, the player trusts the story won’t ambush them. You’re allowed deliberate range later — what breaks trust is an UNSIGNALED contradiction of the tone you set here.",
    howToChoose: "Pick the tone that makes the target audience exhale AND proves the concept’s hardest gem can be FELT, not just claimed. The take with all load-bearing legs is the voice the rest can stand on; a high score that splits the audience is a flag, not a winner.",
    mechanic: "the day-unit ritual + the coach’s chat VOICE. The tone you lock here is the voice the coach speaks in all the way up to Unspoken.",
    craft: "Craft: the opening is your audition — a tonal microcosm answering what-is-this / who-do-I-care-about / why-keep-going; only an unsignaled tonal contradiction is off-limits.",
  },
  destination: {
    tldr: "the ending you’re walking toward — the deepest version of the relationship",
    whatFor: "The destination is the full-REL coach: the last, deepest chat the whole game converges to. We author it FIRST, then build the path backward — because the ending is what gives every earlier beat its meaning.",
    impact: "The ending reshapes everything before it: once you know where it lands, you plant the setups backward from it. A destination that feels like a duty handed to you (now perform!) repels; one where the coach becomes an EQUAL — a witness, not a boss — is worth the climb.",
    howToChoose: "Pick the version the audience LONGS for, not the one that sounds impressive. Watch for the trap: a ‘graduation’ that makes the player feel judged or on-the-hook craters relate/safe (the gem flag). The winner makes belonging feel unconditional — cathartic, not hollow.",
    mechanic: "the chat-agent at its apex + the REL ladder + the earned title. Author the BOND (the writing) as what earns intimacy — game-design research couldn’t show that climbing rungs makes intimacy feel earned, so the ladder is the map, never the cause.",
    craft: "Craft: write the ending first — the third-act payoff retroactively reshapes act one; setups are planted backward from where you land.",
  },
  struggle: {
    tldr: "the real-life thing the player quietly works through with the coach",
    whatFor: "The struggle is the internal conflict — the want-vs-need under the cozy surface. For this audience it’s a PSYCHOLOGICAL one: a weakness that hurts only the player, not others — a letting-go, not a boss fight.",
    impact: "No struggle, no growth, no earned intimacy. But it has to be shown by how the character RESPONDS, never named as a diagnosis — too sharp and it reads as therapy; too soft and nothing happened.",
    howToChoose: "Pick the struggle the concept + pilot already seeded (here: leaving a day behind unfinished, ‘logged at full weight’). The right one is felt through the world’s own mechanics and woven in, not labeled.",
    mechanic: "the four stats + the signature minigame — THE keystone. The mechanic must ENACT the struggle (clear the day’s debuffs = letting a day go). And NEVER a fail-state: for anxious/low-worth players, challenge mechanics that can fail backfire (research-backed).",
    craft: "Craft: Truby’s psychological need (a weakness that hurts only the hero) suits gentle arcs; authenticity lives in how they respond, never in the diagnosis.",
  },
  cast: {
    tldr: "the other characters — mirrors and foils that reflect the player’s struggle",
    whatFor: "The cast spreads the story across several characters, unified by one thematic through-line. Each is a mirror or a foil — a different ANGLE on the same struggle the player carries.",
    impact: "A good cast makes the main bond believable and lets the struggle be seen from sides the coach can’t show. What holds it together is the shared theme, not a roster of forced-different personalities.",
    howToChoose: "Pick the ensemble unified by one through-line, each a distinct ANGLE on it (the player is a witness, not everyone’s fixer — ≤1 growth arc). Coverage of the audience’s facets beats crowd-pleasers; don’t make characters different just to be different.",
    mechanic: "the multi-coach roster + the Ensemble minigame engine. Each cast member is a functional coach-agent — pick distinct domains the roster actually needs, not duplicates.",
    craft: "Craft: an ensemble is held together by a thematic through-line, not by forcing each character a unique function; foils/mirrors reflect the protagonist’s inner struggle.",
  },
  motif: {
    tldr: "the recurring pattern — the day-unit, image, and title grammar that make it all rhyme",
    whatFor: "The motif is the pattern language: the unit a day is counted in (a ‘crossing’), the stat skins, the recurring image, the title shape — the story’s fingerprint.",
    impact: "Motif is what makes a world feel authored, not assembled — the same chord struck in the title, the mechanics, and the ending. A symbol can appear once; a motif earns its meaning by RECURRING.",
    howToChoose: "Pick the kernel that’s a REAL difference, not a reskin — one image the day-unit, the stats, AND the title can all genuinely express, and that you’ll place again and again. If it only changes the labels, it isn’t a motif yet.",
    mechanic: "the entire skin layer — stat skins · day-unit · title grammar · lexicon · the signature mechanic. Score it on mechanical COHESION (does one image skin the stats AND the day-unit?), not just title flavor.",
    craft: "Craft: a motif differs from a one-off symbol by RECURRING — its meaning comes from repetition and placement.",
  },
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
