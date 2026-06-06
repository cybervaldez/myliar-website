// Gemini 2nd-opinion on the RESEARCH-derived additions to the motif framework.
// Key inline-env ONLY. GEMINI_API_KEY=… node scripts/motif-research-check.mjs
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
const PROMPT = `You are a senior game-systems designer giving a HARD second opinion (no sycophancy, quote specifics, disagree where warranted). We did a deep-research pass on "re-skinning a shared system per-campaign so each feels standalone yet cohesive" and derived FOUR additions to our motif framework. Pressure-test them.

CONTEXT: "My Life is an RPG" ships multiple CAMPAIGNS (curated content packs) on one shared engine: "Life Ops" (self-improvement, FRIENDS-sitcom voice) and "The Wingman" (dating prep, terse boxing-gym "Corner" voice). Campaigns are independent silos — a player only plays one at a time. A campaign declares a MOTIF SET; flavorable surfaces route through it. We just wired two motifs:
- statAxes: the 4-stat polygon re-labels per campaign. Underlying mechanic is ALWAYS STR/INT/GLD/CHR; only the DISPLAYED label re-voices. Corner mapping (recovered from 25 days of already-authored content): STR→PRESENCE (the physical coach), INT→VOICE (the words coach), GLD→READ (the perception coach — NOTE: GLD here is an attribute stat, NOT spendable gold; AP is the currency), CHR→NERVE (the approach coach).
- dayUnit: the "DAY N" eyebrow re-labels ("ROUND N" in the Corner).

THE RESEARCH'S KEY FINDING (4 independent sources — MTG color-pie, WoW resources, Hades aspects, UX consistency): a re-skin earns its place ONLY when the new label points at a REAL difference underneath (domain/behavior/emotion); a purely cosmetic relabel is cliché AND a cognitive-load tax.

THE FOUR ADDITIONS we're about to commit:
1. REAL-DIFFERENCE GATE — added as a 2nd question to our design rule: not just "could two campaigns say this differently?" but ALSO "does the new voice point at something actually DIFFERENT underneath, or is it just paint?" We claim statAxes PASSES this gate because (a) each axis is a different coach's real teaching domain, not STR-in-a-costume, and (b) silos mean a player never sees two namings at once.
2. RECURRENCE + CLIMACTIC PAYOFF — a motif must recur across surfaces AND pay off transformed at the campaign's climax (leitmotif lesson: Persona threads one phrase battle→palace→final-boss). Authoring note: the Corner's "ROUND N" should crescendo so the final day reads as the last round of a long fight.
3. signatureMechanic SLOT — each campaign should own ONE exclusive mechanic as its identity anchor (the MTG "one keyword per faction" generalized): Life Ops = the notes-wall; the Corner = the spar/battle being ON.
4. NO-WIKI / SELF-EVIDENT RULE — a motif label must read clearly without a glossary (stat-design "3-6 attributes, no wiki"), alongside hard char ceilings (stat ≤8, dayUnit ≤6).

CRITIQUE, concretely:
A. Does statAxes ACTUALLY pass the real-difference gate, or are we rationalizing a cosmetic relabel? Be skeptical — is "different coach's domain" a real mechanical difference, or just narrative dressing on identical math? If it's borderline, what would make it genuinely pass (or should we cut the slot)?
B. Is the silo-discipline defense sound, or a crutch? If we ever add cross-campaign meta-progression / a unified profile, does the whole statAxes motif collapse?
C. Addition #2 (recurrence + payoff): is "the final day = last round" a real payoff or a gimmick? How do you make a LABEL motif (ROUND) actually pay off mechanically/emotionally vs just being a renamed counter?
D. Addition #3 (signatureMechanic): good idea or scope creep? Does forcing every campaign to own an exclusive mechanic risk gimmicky one-offs that fragment the shared engine?
E. What did the research (or we) MISS — the strongest motif principle NOT in these four?
Rank your top 3 actionable recommendations before we commit.`;
const out = await gemini(PROMPT);
console.log(out);
