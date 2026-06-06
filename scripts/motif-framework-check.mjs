// Gemini 2nd-opinion on the per-campaign MOTIF FRAMEWORK + the statAxes proposal.
// Key inline-env ONLY. GEMINI_API_KEY=… node scripts/motif-framework-check.mjs
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(p, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2600, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { await sleep((t + 1) * 10000); continue; }
    if (model === "gemini-flash-latest") return gemini(p, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}
const PROMPT = `You are a senior game-systems designer giving a HARD second opinion (no sycophancy, quote specifics, disagree where warranted). Context:

"My Life is an RPG" is a life-RPG / dating-sim. It ships multiple CAMPAIGNS (curated content packs): "Life Ops" (self-improvement, FRIENDS-sitcom voice) and "The Wingman" (dating prep, terse boxing-gym "Corner" voice). Campaigns are independent silos.

We want each campaign to feel STANDALONE yet part of one cohesive framework. The idea: a campaign declares a MOTIF SET, and every flavorable mechanic ROUTES THROUGH it (a shared engine, a per-campaign skin). Here's the proposed framework.

MOTIF SLOTS (what a campaign declares):
1. Title motif — trophy/episode/Card titles. DONE. LifeOps="The One…"; Wingman="the moment, named".
2. REL ladder — the 10 relationship-tier NAMES (numbers stay shared). DONE. Wingman re-voices to "Just walked in → … → Unspoken".
3. Theme — palette/register/motion/battle-flag. DONE. LifeOps=Parchment&Ink; Wingman=the Corner (boxing).
4. Positioning — title/tagline/gift elevator pitch. DONE.
5. Stat axes — the 4-stat polygon labels. PARTIAL → about to wire. Underlying mechanic stays STR/INT/GLD/CHR globally; only the DISPLAYED label re-voices per campaign. Proposed Wingman mapping: STR→PRESENCE, INT→VOICE, GLD→READ, CHR→NERVE (derived from each coach's authored reaction text: remy/STR teaches PRESENCE, wes/INT teaches VOICE, sloane/GLD teaches READ, nico/CHR teaches NERVE).
6. Cosmology / chat-floor — the in-world premise + relationship floor. DONE (in the chat preambles).
7. Memory-container name (the "case file" where a character's notes on you live). GAP (soft).
8. Currency name (AP = day-action points). GAP (soft).
9. Keepsake-object aesthetic (what legendary items ARE). EMERGENT.
10. Battle framing (drill/spar/kata + enemy/move names, when battles on). GAP.

DELIBERATELY KEPT SHARED (engine, not skin): the choice trichotomy (logical/passive/chaotic), achievement-as-only-currency, the note schema, the 10 REL thresholds (only names re-voice), the lexicon-leak + frame gates.

We DECIDED NOT to make the LEXICON (the [bracket] object-token vocabulary, e.g. [ledger], [drawer]) a per-campaign motif: Life Ops is object-dense (its world is a literal phone-realm of objects, 100s of tokens) but the Wingman uses ~8 tokens total (its world is abstract/social) — so a rich per-campaign object vocabulary would be motif-for-motif's-sake on a social campaign.

PRIORITY ranking: (1) Stat axes — HIGH×tractable, DO FIRST; (2) Battle framing — MED; (3) Memory-container — LOW effort; (4) currency/keepsake — lazy.

DESIGN RULE: when adding any player-facing flavorable mechanic, ask "could two campaigns want to say this differently?" → if yes, per-campaign motif with a shared fallback; if no, keep shared.

CRITIQUE, concretely:
A. Is the have/gap classification right? Anything mis-slotted?
B. Is statAxes the correct #1 priority, and is the STR→PRESENCE / INT→VOICE / GLD→READ / CHR→NERVE mapping sound? Any risk in re-labeling only the DISPLAY while the mechanic stays STR/INT/GLD/CHR (e.g. cross-campaign stat carryover confusion, the polygon "shape" meaning drifting)?
C. Is excluding the lexicon a mistake, or right?
D. What MOTIF OPPORTUNITY are we MISSING — a flavorable surface not in this list of 10 that should be per-campaign? (This is the most important question — the user explicitly asked us to find MORE motif surfaces to tighten the framework.)
E. What's the biggest RISK of over-motif'ing (where does per-campaign voice start hurting cohesion or maintainability)?
Be specific and rank your top 3 actionable recommendations.`;
const out = await gemini(PROMPT);
console.log(out);
