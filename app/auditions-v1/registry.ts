// THE AUDITION REGISTRY — the single add-point for new content. The URL is campaign-primary
// (/auditions/<campaign>/<step>); this maps every campaign × step to its data, normalizers, the
// carried-forward look-back, and the cross-story reference. A new story = add one block to CAMPAIGNS
// (+ its data/<campaign>/<step>.json). Concept is the shared SLATE (the master idea bank) — every
// campaign's pipeline is born from it. NOT canon.
import { type Item, type StepData, type SourceStudy, topOf } from "./score";
import slate from "./data/settings.json";
import ferryPilot from "./data/ferry/pilot.json";

// THE HOOK-ENGINE PIPELINE (§8.14): the CONCEPT is the SETTING (the shared world/ground — a hook-
// engine), the PILOT is the set of MOMENTS (tonal story-doors, light-cohesive); each moment spawns
// its own STORY downstream (own cast/coach — no shared coach). So destination/struggle/cast/motif are
// PER-STORY (built after a moment is chosen), not campaign-level.
export const STEP_DEFS = [
  { key: "concept", label: "The Setting" },
  { key: "pilot", label: "The Moments" },
  { key: "destination", label: "The Destination" },
  { key: "struggle", label: "The Struggle" },
  { key: "cast", label: "The Cast" },
  { key: "motif", label: "The Motif" },
];
export const stepLabel = (k: string) => STEP_DEFS.find((s) => s.key === k)?.label ?? k;
export const stepNo = (k: string) => "①②③④⑤⑥"[STEP_DEFS.findIndex((s) => s.key === k)] ?? "•";

// THE SLATE — the master SETTING ledger (every setting/world auditioned). Cross-campaign by nature:
// settings are the grouping ground; a picked setting becomes a campaign that spawns its stories.
export const SLATE = slate as unknown as { settings: { id: string; title: string; line: string; world: string }[] } & StepData;
export const SLATE_STATUS: Record<string, string> = { ferry: "building", lighthouse: "available", cloudhouse: "available" };

// per-step normalizers → Item[]. concept = the SETTINGS slate; pilot = the MOMENTS (story-doors).
const NORM: Record<string, (d: { [k: string]: unknown }) => Item[]> = {
  concept: (d) => (d as unknown as typeof SLATE).settings.map((s, k) => ({ key: s.id, idx: k + 1, title: s.title, sub: s.line, body: s.world })),
  pilot: (d) => (d as { moments: { id: string; title: string; tone: string; scene: string }[] }).moments.map((m, k) => ({ key: m.id, idx: k + 1, title: m.title, sub: `tone — ${m.tone}`, body: m.scene })),
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
    tldr: "the MOMENTS — a set of scenes in the one world, each a tonal hook. Each moment is a story-door.",
    whatFor: "Not ‘one scene, three tones, pick one.’ The pilot is a SET of distinct MOMENTS in the same world — the quiet boarding, the warm galley, the fog-bound wheelhouse, the far-shore rail — each carrying its own tone. Each is a door a different reader walks through; each spawns its own story (own cast/coach) downstream.",
    impact: "This is the hook FACTORY. Each moment that lands is another reader caught — the one who’d bounce off ‘slow and quiet’ is hooked by ‘a long, watchful crossing,’ and both are safe because the SETTING guarantees the floor. More landed moments = a wider net.",
    howToChoose: "NO PICK — keep the RANGE. Each moment is a story-door, not a candidate to eliminate; the set IS the scrub’s subrange. Test two things: does each moment HOOK (relate) + stay SAFE, and is the set LIGHT-COHESIVE (one world, no moment binding another into one plot, §8.14).",
    mechanic: "the day-unit + the scrub (the browser’s tonal subrange). Each moment = a scrub-point; together they’re the range the player browses to find their story.",
    craft: "Craft: tone is built ENVIRONMENTALLY (atmosphere, pacing, no-pressure), and the moments are light-cohesive POINTERS, never binding facts (§8.14 — a cross-ref is a teaser, not canon).",
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
  pilot: "One world, a SET of moments — each a tonal door into it. No pick: we keep the range (the scrub’s subrange). The fleet scores each moment’s hook (relate/safe + the story it promises); the legs score the story it spawns + the set’s light-cohesiveness.",
  destination: "The deepest chat THIS story reaches — the full-REL coach (per-story, §8.14: no shared coach). Authored after a moment is chosen; the path is built backward to it. The fleet asks: does the deepest relationship land?",
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
    steps: { pilot: ferryPilot as unknown as StepData },
    carried: {
      pilot: [{
        step: "① THE SETTING — the Night Ferry",
        lines: [
          "won as a hook-engine: a world that holds calm OR heavy — the widest tonal range of the three settings",
          "↳ carry its SAFETY FLOOR into every moment (even the held ones stay floor-clipped, no ambush)",
          "↳ keep the moments LIGHT-COHESIVE — one ferry, no moment binding another (§8.14)",
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
      pilot: {
        method: "deep-research",
        vein: "the WITNESS VOICE in the opening — how successful works lock “I see you clearly and I won’t fix you” in the first beat. Verdict: a NEAR-precedent — our PURE witness (“logged at full weight,” no advice) is a defensible TIGHTENING, not an exact match.",
        works: [
          { title: "Midnight Diner — the Master’s narration", what: "the strongest reproducible device: a fixed opening-image / tone-promise (camera reveals Shinjuku; “open midnight to 7am… I make whatever customers request. That’s my policy. When people finish their day and hurry home, my day starts.”) — it states the unhurried, low-stakes policy BEFORE any story. The night-ferry conceit is structurally identical; borrow it directly. The Master is an “ear,” advice optional (“to consider and heed”), never too involved." },
          { title: "the AFFECTIVE CONTRACT (Roquet 2009, peer-reviewed)", what: "the audience can sit in a safe space because they TRUST the author won’t hurt them with a distressing twist (“translucent simplicity + comfortable mystery”). THIS is what lets the keeper hold a hard rider “at full weight” without the tone breaking — the opening must signal the contract in the first beat." },
          { title: "Mushishi — Ginko", what: "“verbal medicine”: heals by listening + reciprocity (gives AND receives), a “mouthpiece for both Mushi and people,” not a fixer. Warmth-without-preaching — but he still remedies, so not a pure witness." },
          { title: "ARIA — Alicia · Coffee Talk", what: "tone built ENVIRONMENTALLY (calm visuals + a relaxed daily rhythm + matched sound); Coffee Talk removes time pressure from the core interaction (“take as much time as you want… no rush”) — “design by subtraction.” (Alicia is a goal-directed MENTOR, past our witness line — a vibe analog, not a structural one.)" },
        ],
        borrow: [
          "a fixed OPENING-IMAGE / tone-promise that states the unhurried, low-stakes policy before any story (the Master) — the opening is load-bearing; a weak one can’t be rescued later",
          "build tone ENVIRONMENTALLY — atmosphere, pacing, removal of pressure — not through stakes (ARIA, Coffee Talk’s subtraction)",
          "signal the AFFECTIVE CONTRACT in the first beat (the player won’t be ambushed) — that trust is what lets a hard day be logged “at full weight”",
          "warm RESTRAINT — the keeper is an “ear” / facilitator, present without getting too involved",
        ],
        avoid: [
          "the PRIMARY failure — “nothing happens / boring” if the tone is mis-set (“Nothing really happens, but in a really good way” is the knife-edge; ARIA gets called slow/saccharine when the promise misses)",
          "surface-platitude handling of real “issues” — it weakens the warmth frame (Coffee Talk’s scattershot social themes); witness the rider’s weight, don’t force conflict the tone can’t carry",
          "tipping the PURE witness into COLD/detached — every proven voice (Master · Ginko · Alicia) keeps an optional warmth; our no-advice tightening must stay WARM, not clinical",
        ],
      },
      destination: {
        method: "ultrathink",
        vein: "the DEEPEST bond + the ending beat in the keeper-witness vein — how the relationship reaches its fullest state and how the payoff lands. Pick: “The Open Page” (the keeper shows what HE carried → an equal). Verdict: STRONGLY precedented — the INVERSION is the genre’s emotional core.",
        works: [
          { title: "Spiritfarer — Stella", what: "the deepest beat is the INVERSION — the caretaker is herself dying; the one who tends is revealed to need tending. And the payoff is a GESTURE (the hug), not a speech. The closest precedent for “The Open Page”: the keeper showing his own carried weight." },
          { title: "Avatar — Iroh (“Leaves from the Vine”)", what: "the warm, wise witness whose deepest moment is HIS unspoken grief (the song for his dead son). The mentor becomes an equal SUFFERER, not a dispenser of wisdom — the bond deepens when the witness is himself witnessed." },
          { title: "Midnight Diner — the Master", what: "preserved MYSTERY — the scar/past is never explained; the deepest bond with a regular is unspoken, shown by remembering the order, not by disclosure. Depth from ONE revealed thing, not a backstory dump." },
          { title: "iyashikei endings (Mushishi · Natsume)", what: "the ending shape is ACCEPTANCE, not resolution or triumph — “a day is a shore, not a verdict.” The bond’s fullest state is being seen and let go, door-open." },
        ],
        borrow: [
          "the INVERSION as the deepest beat — the keeper reveals his own carried weight and becomes an EQUAL (Spiritfarer’s dying caretaker; Iroh’s grief). This is exactly “The Open Page.”",
          "the payoff is a GESTURE, not a speech (Spiritfarer’s hug — the simplest beat lands hardest)",
          "preserve MYSTERY — reveal ONE carried thing (“the one page”), never a full backstory; depth comes from restraint (the Master’s unexplained scar)",
          "an OPEN-DOOR ending — acceptance, not finale; the bond can go quiet because you no longer need the push (grows-with-you)",
        ],
        avoid: [
          "the “graduation as DUTY” trap — handing the player the keeper’s role triggers performance fear (our own audition killed “The Pen Is Yours” for exactly this: relate 1.5 / safe 1.8)",
          "the one-way mentor who never becomes vulnerable — stays a service provider; the bond stays shallow",
          "over-explaining the keeper — a full backstory dump dilutes the mystery; one page, not the whole log",
          "a triumphant / closed FINALE — the wrong shape for this vein; the ending is open-door, not a trophy",
        ],
      },
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
