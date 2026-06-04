// Two-model cross-check for the "Dojo" campaign cast (campaign-playbook.md spine).
// Call 1 = BLIND derivation (Gemini gets guardrails + theme + cast rules, NO answer
// key → convergence is an honest signal). Call 2 = CRITIQUE of our actual grid.
// Key is inline-env ONLY, never committed:
//   GEMINI_API_KEY=… node scripts/dojo-cast-check.mjs
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gemini(prompt, { model = "gemini-flash-latest" } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 2400, thinkingConfig: { thinkingBudget: 0 } } }),
    });
    if (r.ok) { const j = await r.json(); return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)"; }
    if ((r.status === 429 || r.status === 503) && t < 3) { process.stderr.write(`${r.status} — retry in ${(t + 1) * 10}s\n`); await sleep((t + 1) * 10000); continue; }
    if (model === "gemini-flash-latest") return gemini(prompt, { model: "gemini-2.5-flash" }); // fallback
    return `__ERR__ ${r.status}: ${(await r.text()).slice(0, 200)}`;
  }
  return "__ERR__ exhausted";
}

const GUARDRAILS = `GUARDRAILS (read first — these gate everything):
- This is a mobile life-RPG. A cast of coaches/companions who live in the player's phone READY the player for their REAL life. They NEVER do the thing FOR the player — the product thesis is anti-AI-dependency: a good coach makes itself UNNEEDED.
- THE CAMPAIGN ("the Dojo") coaches the player toward MASTERING ONE HARD SKILL the player picks (an instrument, a language, drawing, code, a craft) via DELIBERATE PRACTICE. The cast readies the reps; the actual practice happens in the player's real life, OFFSCREEN.
- THE FLOOR (never break): the cast NEVER performs the skill for the player — never plays the scale, writes the code, paints the stroke, or hands over the finished artifact. The MASTER deliberately WITHHOLDS the technique so the player earns it. Hints, drills, corrections, benchmarks = yes; the finished thing = never.
- INTENTIONAL NON-LANE: no therapy / clinical / medical / feelings-processing lane. The Dojo trains the SKILL, not emotions.
- RELATIONSHIP FLOOR: bonds are mentor / peer / squad trust — NEVER courtship, flirtation, or romance.
- IP BRIGHT LINE: inspired by the SHAPE of a shonen training team (3 peers + 1 masked mentor, forged by a first trial) but the cast must be ORIGINAL and genre-vibe only. NO proper nouns, NO ninja/chakra/jutsu/hidden-village/ranks. Archetypes only.

CAST-DESIGN RULES (the 2-axis law):
- AXIS 1 (SKILL-DOMAIN): each character owns a DISTINCT sub-domain of "getting good at a hard skill." Gap-fill or rival-school, NEVER redundant. Handoffs at the seams (a character sends the player to another for the part they're not best at).
- AXIS 2 (TEMPERAMENT): the four must span a WIDE dynamic range (e.g. warm/loud ↔ cold/sharp ↔ cool/dry ↔ exacting/precise) so ANY player finds one on-ramp in session one.
- Each character has a GIFT that is valuable at REL 0 — before any relationship exists.`;

const BLIND = `${GUARDRAILS}

TASK — design the cast from scratch (you have NO answer key; derive it independently):
Design a 4-character cast for "the Dojo": THREE peers + ONE mentor (the master). For EACH character give exactly:
  • role-handle (nameless — e.g. "the Master", "the Underdog"; no real names)
  • Axis-1 skill sub-domain (what part of mastery they own; must not overlap the others)
  • Axis-2 temperament (one short phrase)
  • the GIFT at REL 0 (one line)
  • one-line WHY this seat earns its place on both axes
Then: name the ONE handoff seam you find most important, and one risk this cast must guard against.
Be concrete and terse. No preamble.`;

const OUR_GRID = `OUR cast grid for "the Dojo" (3 peers + 1 mentor):
1. the MASTER — domain: structure + the WHY (refuses to hand over the technique; makes you earn the fundamentals). temperament: cool, dry, deceptively idle, indirect. gift: a real practice you can RUN, and the discipline of earning it.
2. the UNDERDOG — domain: volume / showing-up (the streak; out-works talent). temperament: warm, loud, relentless, never quits. gift: today's rep, because they never skip theirs.
3. the RIVAL — domain: standards / the ceiling (the honest benchmark, stays just ahead). temperament: cold, sharp, competitive, sparing with praise. gift: a true mirror of how far you have to go — as FUEL, not shame.
4. the TECHNICIAN — domain: form / method (breaks the skill into the RIGHT reps, catches the flaw). temperament: exacting, observant, measured. gift: the rep done RIGHT — slow, correct, the thing that compounds.

Title-motif for trophies = "the VOW": each is a flat line you'd say after a real rep ("Day 100. Still Bad. Still Here.").
Ending reframe: the source IP's goal is external acknowledgement; OURS inverts it to SELF-SUFFICIENCY (the coach goes obsolete).`;

const CRITIQUE = `${GUARDRAILS}

Below is a finished cast draft. Critique it hard — quote specifics, do NOT be a sycophant.
${OUR_GRID}

Give me, terse and concrete:
  • STRONGEST seat (which character is most clearly right, and why)
  • WEAKEST seat (which is muddiest / most redundant / most at risk, and why)
  • FRAME-DRIFT or FLOOR risk (anywhere this could slip into doing-it-for-the-player, therapy register, romance, or IP)
  • TEMPERAMENT-RANGE gap (is a player type left with no on-ramp?)
  • SHARPER wordings for any role's domain or gift
  • the VOW motif + the self-sufficiency reframe: do they land? one risk each
  • ONE BIG NOTE (the single most important change).`;

console.log("================ CALL 1 — BLIND DERIVATION ================\n");
console.log(await gemini(BLIND));
await sleep(3000);
console.log("\n\n================ CALL 2 — CRITIQUE OF OUR GRID ================\n");
console.log(await gemini(CRITIQUE));
