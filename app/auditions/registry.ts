// THE AUDITION REGISTRY — the single add-point for new content. The URL is campaign-primary
// (/auditions/<campaign>/<step>); this maps every campaign × step to its data, normalizers, the
// carried-forward look-back, and the cross-story reference. A new story = add one block to CAMPAIGNS
// (+ its data/<campaign>/<step>.json). Concept is the shared SLATE (the master idea bank) — every
// campaign's pipeline is born from it. NOT canon.
import { type Item, type StepData, type SourceStudy, topOf } from "./score";
import slate from "./data/settings.json";
import ferryPilot from "./data/ferry/pilot.json";
import roomPilot from "./data/room/pilot.json";
import lighthousePilot from "./data/lighthouse/pilot.json";

// THE HOOK-ENGINE PIPELINE (§8.14): the CONCEPT is the SETTING (the shared world/ground — a hook-
// engine), the PILOT is the set of MOMENTS (tonal story-doors, light-cohesive); each moment spawns
// its own STORY downstream (own cast/coach — no shared coach). So destination/struggle/cast/motif are
// PER-STORY (built after a moment is chosen), not campaign-level.
// The campaign-level flow is just two steps now: the SETTING and its MOMENTS. The story-build steps
// (destination/struggle/cast/motif) are PER-STORY — built on demand once a moment is chosen — so they
// are not campaign-level steps here. (The pre-hook-engine version lives at /auditions-v1.)
export const STEP_DEFS = [
  { key: "concept", label: "The Setting" },
  { key: "pilot", label: "The Range" },
  { key: "story", label: "The Story" },
  { key: "tone", label: "The Tone" },
];
export const stepLabel = (k: string) => STEP_DEFS.find((s) => s.key === k)?.label ?? k;
export const stepNo = (k: string) => "①②③④⑤⑥"[STEP_DEFS.findIndex((s) => s.key === k)] ?? "•";

// THE SLATE — the master SETTING ledger (every setting/world auditioned). Cross-campaign by nature:
// settings are the grouping ground; a picked setting becomes a campaign that spawns its stories.
export const SLATE = slate as unknown as { settings: { id: string; title: string; line: string; world: string; nativeAge?: string }[] } & StepData;
export const SLATE_STATUS: Record<string, string> = { ferry: "building", lighthouse: "available", cloudhouse: "available" };

// per-step normalizers → Item[]. concept = the SETTINGS slate; pilot = the MOMENTS (story-doors).
const NORM: Record<string, (d: { [k: string]: unknown }) => Item[]> = {
  concept: (d) => (d as unknown as typeof SLATE).settings.map((s, k) => ({ key: s.id, idx: k + 1, title: s.title, sub: s.nativeAge ? `${s.line}  ·  🎯 ${s.nativeAge}` : s.line, body: s.world })),
  // the pilot is SCRUB GROUPS — each rendered as the SCENE arc (the scrubber): one row per scene (the
  // surrounding WEATHER, the stage) + its arc bar (calm → the storm → first light). NOT the story's tone.
  pilot: (d) => {
    const dd = d as unknown as { scenes: string[]; spark: Record<string, string>; scrubGroups: { id: string; name: string; settingTitle: string; storyTitles: string[] }[] };
    return dd.scrubGroups.map((g, k) => ({
      key: g.id, idx: k + 1, title: g.name, mono: true,
      sub: `the SCENE arc · scrub the weather ↓ · anchor: “${g.settingTitle}”`,
      body: dd.scenes.map((c, i) => `${dd.spark[c]}   ${g.settingTitle}  /  ${g.storyTitles[i]}   — ${c}`).join("\n"),
    }));
  },
};
// THE PER-STEP PRIMERS — the collapsible ELI5 at the top of each step page: what the step is FOR,
// how it IMPACTS the story, how to CHOOSE, + a named CRAFT principle. Grounded by the 2026-06-14
// deep-research pass (screenwriting/novel/game-narrative craft, adversarially verified): logline =
// promise/nucleus (not a pass/fail acid test); opening = tonal audition answering 3 silent questions;
// ending-first reshapes act one; Truby psychological vs moral need; ensemble unified by a THEME (not
// forced-distinct functions); motif = meaning by repetition. Sources in docs/flavors/concepts/GUIDELINE.md.
export const PRIMERS: Record<string, { tldr: string; whatFor: string; impact: string; howToChoose: string; mechanic?: string; craft?: string }> = {
  concept: {
    tldr: "the SETTING — the surrounding world you’d dwell in. NOT a story; the shared ground stories spawn from.",
    whatFor: "The concept is the SETTING, not a story. It’s the surrounding environment + who-it’s-for — the grouping ground. We don’t build a coach or a struggle here; we pick the WORLD that everything else branches off.",
    impact: "The setting is a HOOK-ENGINE: build the world once (and its safety floor), and every story spun off it is a cheap tonal hook that catches a different reader. The setting is capital; the stories are dividends. A wide-range setting catches the whole audience; a one-note setting catches a sliver.",
    howToChoose: "Don’t pick ‘the best story’ — there’s no story yet. Pick the SETTING whose audience feels safe to DWELL in AND that can spawn the WIDEST tonal range (a cozy hook AND a melancholy hook AND a held-but-safe hook) while holding the floor. The hook-capacity legs (tone-breadth · safety-floor · story-spawn · persistence) score that capacity.",
    mechanic: "the shared safety FLOOR + the stat-skin DOMAIN. Fit test: does the surrounding environment carry the audience’s safety on its own, and can the four stats skin this world’s domain?",
    craft: "Craft (§8.14/§8.15): the setting is the convergence, NOT a coach — it’s a persistent backdrop the player dwells in, never an arc. The stories (own casts) branch off it.",
  },
  pilot: {
    tldr: "the RANGE — scrub each candidate; the WEATHER runs the §8.13 arc (cozy → the storm-peak → a renewed dawn)",
    whatFor: "Each candidate is its OWN environment. Dragging the dial runs the surrounding WEATHER through the §8.13 five phases — COZY (calm) → HEIGHTENED (building) → INTENSE (the storm-peak, the MIDDLE) → AFTERMATH (the storm passing) → RENEWAL (a renewed dawn). The two-part title + the phase follow the arc; the WORLD (the ferry) holds throughout (§8.15 — only the weather arcs).",
    impact: "The resolution (aftermath→renewal) is what makes the storm safe to have happened — you come home to a RENEWED world, not the calm you began in. A cohesive set feels like ONE world arcing through the storm and out; an incohesive one breaks somewhere on the arc.",
    howToChoose: "Scrub EACH candidate’s dial — we pick by FEEL. The SURROUNDING anchor (line 1, §8.16) holds across the WHOLE arc; the storm-peak stays floor-clipped (weight, never ambush); the resolution lands (a real renewal, not just back-to-start).",
    mechanic: "the SCRUBBER per environment — the dial = the §8.13 WEATHER arc (cozy → storm-peak at ½ → renewed dawn) + the distinct surrounding ASCII + the two-part title. The WORLD holds (§8.15); the AMPLITUDE of the arc = coziness (the subrange).",
    craft: "Craft: the dial is the SCENE (the surrounding WEATHER — the stage) across the §8.13 arc — calm water · rising wind · the storm · settling sea · first light; the WORLD is the invariant (§8.15). The scene is NOT the story’s tone — that’s the SUBRANGE (cozy↔intense), a separate axis free to contrast any scene.",
  },
  destination: {
    tldr: "the ending THIS story walks toward — its own deepest coach (per-story, §8.14: no shared coach)",
    whatFor: "The destination is the full-REL coach THIS story reaches — built per chosen moment/story (each story has its OWN coach). Author it FIRST for that story, then build the path backward — the ending is what gives every earlier beat its meaning.",
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
  concept: "The SETTING meets the room — the surrounding world you’d dwell in, not a story. The audience scores whether it feels safe to LIVE in; the hook-capacity legs score how wide a tonal range it can spawn while holding the floor. The picked setting becomes a campaign that spawns its stories.",
  pilot: "One setting, candidate dynamic ranges — each its OWN environment. The dial scrubs the SCENE — the surrounding WEATHER (the stage): calm water → the storm → first light (the §8.13 arc), the WORLD holding throughout (§8.15). The scene labels are NOT the story’s feeling — the story’s TONE is a SEPARATE axis (the SUBRANGE, cozy ↔ intense), free to MATCH or CONTRAST any scene (a tender beat in the storm, a charged one in the calm). We PICK the most cohesive scene-arc by FEEL — scrub each.",
  destination: "The deepest chat THIS story reaches — the full-REL coach (per-story, §8.14: no shared coach). Authored after a moment is chosen; the path is built backward to it. The fleet asks: does the deepest relationship land?",
  story: "The picked range is now a STORY — here we set its AMBIENCE & SETTING: the TONE & MOOD (the ambient palette), the world-moments, the UI + the palette→prose recipe (the real beats are authored later). Scrub the crossing (the world-moments); at each, the SUBRANGE shows EXAMPLE scenes — a cozy one, a warm one, an intense one — so you can feel the range and how a scene can run with or against the surrounding. These are examples (variations), not the authored story. The CREW’s own palettes/prompts are auditioned in the SUBRANGE step, not here.",
  tone: "The MAKEUP for the picked story — auditioned. In the game the reader DIALS THE TONE (cozy → warm → intense, the scrubber is the dial); here we audition the makeup at each. FIRST the EXPERTS (matched to the audience) frame the state of mind → the MAKEUP BRIEF. THEN a candidate cast-SET (the crew tone-mapped cozy → warm → intense, worn OVER the story’s ambient ground) is auditioned for COHESION (one crew across the tones) · CONTRAST (the tones genuinely distinct) · SAFE (every tone holds — the intense deepens PRESENCE, never threat). Pick the most cohesive set; THEN build its per-tone content, cozy-first.",
};

// §8.19 HARD RULE — every PICKED step (status building/shipped) ships a plain-language ELI5 "why this
// WON" (distinct from the PRIMER's "what is this step"). Keyed campaign→step. A step still being
// auditioned (no pick yet) returns { pending: true } — the slot shows, the rule lands on pick.
const WHY_PICKED: Record<string, Record<string, string>> = {
  ferry: {
    concept: "We picked the Night Ferry because everyone we showed it to felt safe and ‘got it’ instantly — a clean sweep (relate 5.0 / safe 5.0). It’s a boat that crosses the dark water every night and asks nothing of you: a place to set a bad day down and let it go. The other ideas were good but lonelier (the lighthouse) or too small to grow many stories from (the sky station). The ferry gives the most kinds of gentle story while always feeling safe — so it earns the slot.",
    pilot: "We picked The Dark Water because its metaphor — surrender as support — is the richest of the three. The Strait (pressure as passage) and the Crossing (destination as hope) are about getting THROUGH a hard thing or getting TO a far thing; The Dark Water is about the hard thing itself — the vast, overwhelming sea — turning out to be what holds you up. For someone worn out by trying to manage everything, ‘the world that feels like too much is actually carrying you’ is the deepest, kindest turn the night can make. It was the world-builder’s richest pick and stayed safe (≥4.8). The other two stay in the bank; this story is built on the deep.",
  },
};
export const whyPicked = (campaign: string, step: string): { text?: string; pending?: boolean } => {
  const t = WHY_PICKED[campaign]?.[step];
  return t ? { text: t } : { pending: true };
};

type Carried = { step: string; lines: string[] }[];
export const CAMPAIGNS: Record<string, {
  label: string; pick: string; blurb: string;
  steps: Record<string, StepData>;
  carried: Record<string, Carried>;
  sourceStudy?: Record<string, SourceStudy>;
}> = {
  ferry: {
    label: "The Night Ferry", pick: "ferry",
    blurb: "the night-ferry SETTING — a world that holds whether the strait is glass-calm or running heavy; its moments are the doors its stories spawn from",
    // NOTE: the tone step's data lives in the legacy pilot.json fields (subrange[], subrangeAudit) +
    // expertPanel / castAudition / mirror — field names kept; the STEP is officially "the Tone".
    steps: { pilot: ferryPilot as unknown as StepData, story: ferryPilot as unknown as StepData, tone: ferryPilot as unknown as StepData },
    carried: {
      pilot: [{
        step: "① THE SETTING — the Night Ferry",
        lines: [
          "won as a hook-engine: a world that holds calm OR heavy — the widest tonal range of the three settings (its hook-capacity legs were all load-bearing)",
          "↳ carry the SAFETY FLOOR across the WHOLE range (the intense pole stays floor-clipped — weight, never ambush)",
          "↳ the range must be the SAME ferry dialed (§8.12) — cohesion is the test, the titles the load-bearing read",
        ],
      }],
    },
    // §8.18 SOURCE STUDY — verified by the source-study research (2026-06-14, 22 sources, adversarial).
    // Verdict: no vein beats the Ferry; its iyashikei/keeper vein has the strongest proven track record.
    sourceStudy: {
      concept: {
        method: "deep-research",
        vein: "cozy night-transit iyashikei — the KEEPER who witnesses transient strangers (Spiritfarer · Midnight Diner · Mushishi · ARIA). The strongest-evidenced of the three veins; the Ferry pick is validated.",
        works: [
          { title: "Spiritfarer", what: "the closest STRUCTURAL analog — a keeper brings transient passengers aboard, fulfills their unfinished business, and releases them (board → witness → depart). The emotional payoff is the GOODBYE, not the systems; the simplest beat (a hug) lands hardest. (One-way departures, though — the Ferry’s nightly RETURN is its own untested bet.)" },
          { title: "Midnight Diner (Shinya Shokudō)", what: "the PROVEN TEMPLATE for the Ferry’s exact shape: one dish / one guest per night, the keeper a near-silent WITNESS not a mentor, a fixed closing ritual (“Good night” = the logged crossing). This IS the Ferry’s tone." },
          { title: "Mushishi", what: "proof that a tranquil frame can safely HOLD dark/bittersweet content — the keeper’s clear-eyed, calm witnessing carries “the dark strait” + “a day is a shore, not a verdict” without breaking the soothing frame." },
          { title: "ARIA", what: "“Nothing really happens, but in a really good way” — ‘nothing happens’ is a FEATURE, not a defect (a water/crossing vibe analog; its undines are tour-guides, not loggers)." },
          { title: "Coziness (Kitfox / Tanya Short)", what: "Safety · Abundance · Softness + RITUAL — repeated meaningful actions create familiarity; validates the nightly crossing + the log as a warmth ENGINE, not a gimmick." },
        ],
        borrow: [
          "the EPISODIC per-rider vignette (board → witness → depart) over a quiet throughline — Midnight Diner’s exact shape",
          "concentrate the warmth in the GOODBYE / the gesture, never in the systems (Spiritfarer: the hug, not the management)",
          "the keeper as near-silent WITNESS who logs “at full weight,” not a mentor",
          "a tranquil tone can carry the dark strait — Mushishi’s frame holds bittersweet weight without breaking cozy",
          "no-fail / no-danger / no-time-pressure = “the one hour nobody can ask anything more of you” (Spiritfarer)",
        ],
        avoid: [
          "Spiritfarer’s management/grind busywork — it “loses sight of what it wants to say” and dilutes the farewells; keep the logging ritual LIGHT, never gate warmth behind chores",
          "framing the dark strait as a contrast-THREAT outside the cozy space (refuted 0-3) — it’s atmospheric, never a threat mechanic",
          "open bet: the recurring RETURN (vs Spiritfarer’s one-way departure) has no proven analog — watch that perpetual return doesn’t dilute the goodbye payoff",
        ],
      },
      // (the pilot witness-voice + destination studies were pre-hook-engine; archived at /auditions-v1.
      //  The moments' own source study + the per-story destination study get authored on demand.)
    },
  },
  // SEEDS — the age-prior demo campaigns (same audience struggle, different age). Only the TONE step is
  // live (its full makeup: experts · cast · palette · mirror · per-tone content); the earlier steps are
  // folded in (no fleet-scored range). `isSeed` gates the render so the spine/board don't choke.
  room: {
    label: "The Open Room", pick: "room",
    blurb: "the TEEN demo — a school room a caretaker keeps unlocked after the bell; the same audience (anxiety · low self-worth · ADHD) dialed to TEEN. «kept, not chosen».",
    steps: { tone: roomPilot as unknown as StepData },
    carried: {},
  },
  lighthouse: {
    label: "The Lighthouse Coast", pick: "lighthouse",
    blurb: "the MATURE demo — a lone lighthouse, the long watch; the same audience dialed to MATURE/depth. «vigil as devotion».",
    steps: { tone: lighthousePilot as unknown as StepData },
    carried: {},
  },
};

export const isSeed = (campaign: string) => !!CAMPAIGNS[campaign] && !CAMPAIGNS[campaign].steps.pilot;
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
