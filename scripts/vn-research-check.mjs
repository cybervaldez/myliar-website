// Gemini 2nd-opinion on the VN + pop-culture narrative-craft research synthesis.
// Key inline-env ONLY. GEMINI_API_KEY=… node scripts/vn-research-check.mjs
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
const PROMPT = `You are a senior narrative-systems designer giving a HARD second opinion (no sycophancy, quote specifics, disagree where warranted). We researched what builds devoted fanbases in memorable visual novels + pop culture, to inform "My Life is an RPG" — a life-RPG/dating-sim whose thesis is: the curated daily story is a NOTE-FACTORY that fills a relationship to its deepest tier ("Unspoken"); the CHAT is the destination; the cast are COACHES who ready you for REAL life and deliberately make themselves obsolete (anti-AI-dependency moat). Hard floors: coaches are NOT courtship (romance floor); Main Line characters are LOCKED canon (no player editing); single curated spine (not heavy branching); NO retention by guilt/FOMO/streak-shame (secure-attachment goodbyes).

OUR RESEARCH CONCLUSIONS (pressure-test them):
1. The VN hub-and-spoke "slowly earn the bond" + the TRUE ENDING that recontextualizes the whole run = our note-factory + our deferred endgame (Memory-Theater/NG+/"the cast remembers all your past versions"). We call the true-ending/memory layer our #1 build target, DOUBLE-validated by Undertale's "the game remembers you" mechanic.
2. We claim Steven Universe + Ted Lasso PROVE that our anti-toxic, secure-attachment, emotional-growth content is a FANBASE MAGNET (not a constraint) — the floor-content is the very thing fans fall in love with.
3. We ADOPT: "the game remembers you" (Undertale), bond-deepens-across-loops + Keepsake (Hades/Persona), the bond that helps you grow = our Passive (Persona), archetype-then-subversion reveals, foreshadowing.
4. We REJECT: romance routes, combinatorial branching, real-issue-as-a-twist-hook (DDLC/Katawa "fetishization without narrative distance" critique — SU as the positive model), confidant-"farming," Undertale's genocide/meta-cruelty.
5. We say fan creation (fan art/wiki) is the validated LONG-TERM fandom-sustaining engine.

CRITIQUE, concretely:
A. SURVIVORSHIP BIAS: Is "SU/Ted Lasso prove the floor-content is a fanbase magnet" a real inference, or are we cherry-picking winners? What's the actual risk that earnest, anti-toxic, no-conflict-spectacle content reads as BORING / low-stakes to a mass mobile audience — and how do we get the warmth WITHOUT being saccharine or losing the hooks that actually drive virality?
B. The ANTI-DEPENDENCY TENSION: Persona/Hades bond loops are explicitly engagement-maximizing (keep coming back to deepen the bond / chase the keepsake). We want to import the bond-deepening structure WHILE our floor says the coach makes themselves OBSOLETE and we never retain by pressure. Is that contradiction reconcilable, or are we importing the exact dependency mechanic we claim to reject? Be specific about where the line is.
C. "The game remembers you" — Undertale's version cost enormous bespoke authoring (hand-written reactive variants). For a CURATED-but-scalable mobile game, is making the cast "remember all your past versions" actually tractable, or a trap that doesn't scale? What's the minimum viable version that still delivers the "knows me" payoff?
D. What pop-culture relationship-engine did we MISS that fits our floors BETTER than what we listed (anti-dependency coach + locked canon + no romance)?
E. Rank the single highest-leverage thing to BUILD next, and the single biggest RISK in this synthesis.`;
const out = await gemini(PROMPT);
console.log(out);
