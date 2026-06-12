// Gemini SET-LEVEL 2nd-opinion on the D37/D39/D41 connective gaps. Key inline-env ONLY.
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(p, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2600, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { await sleep((t + 1) * 9000); continue; }
    if (model === "gemini-flash-latest") return gemini(p, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}
const P = `Senior narrative director — HARD set-level 2nd opinion on 3 connective gap-beats (D37, D39, D41) that thread between authored tentpoles (D36 family meal, D38 a Sam beat, D40 the reveal of a long-teased mystery character "Wren"). 2nd-person faceless-MC life-RPG; coaches who make themselves obsolete (anti-dependency); player is a WITNESS not a fixer; gender ⚲ for Wren. Quote specifics, disagree, rank fixes. The beats:

- D37 (Mei, M0 morning-after-the-meal, grants nothing): the kitchen resets the day after the big emotional meal (where coach Hana told the whole story of her dead sister Maya, and an extra place was set for the absent sister). Mei washes the extra plate and returns it to the stack with no comment — "a shrine is grief that forgot how to keep cooking... you honor a seat by setting it, not by leaving it out to rot into a shrine." A new dim door ("Fridge Wins" — small cooking victories) surfaces on the horizon, not entered. RESTRAINT GOAL: do NOT re-spend the meal's grief; the morning-after is quieter, the kitchen moves on.
- D39 (Sam, M0, grants nothing): the player's corner [drawer] (junk drawer, canon since week 1) is backing up — a month of kept things shoved in (an audit's leavings, the meal's odds) — and won't shut. The TWIST: it's overstuffed but somehow ORDERED/sorted, which isn't the player (who hoards, doesn't sort). That ordering is the unseen keeper's (Wren's) hand — FELT, not seen. Sam (the building's indexer) is delighted/puzzled, can't find who sorts it ("your junk has a librarian and your librarian is out of shelf"). Sets up D40 where the drawer SPILLS and Wren is finally revealed. Wren kept fully obscured (no face/name, gender ⚲).
- D41 (Wren, post-D40-reveal, grants nothing): the first real interaction now that Wren's known. Wren is the "janitor of the soul" — dusty, pragmatic, tired, warmth-in-the-act-never-the-speech. They pull a specific FAILED thing the player threw away months ago, kept in order, and show the one good line still in it: "a failure is a page left open with one good line, and a margin just waits." This opens the SCRAPBOOK lane (find the salvage in a failure). Wren REFUSES to be a saviour ("it's not love, it's filing"; "don't promote me into a miracle"). It forward-points to a later beat (~D52, where coach Kenji hands the player something he kept = names them keeper) WITHOUT naming it: "someone'll hand you what they kept of you, soon, in another room... it has a date, it isn't today."

Critique the BATCH as a SET:
1. D37 RESTRAINT — does "Mei washes the extra plate and puts it back, refusing a shrine" land as dignified restraint, or as COLD / too-quickly-moving-on from a sister's grief the morning after (risk: the audience needed a beat to breathe, and Mei's anti-sentiment makes the grief feel briskly filed away)? Is "a shrine is grief that forgot how to keep cooking" wise or glib?
2. D39 OBSCURED HINT — is "the drawer is overstuffed but ORDERED (not your doing)" a satisfying clue that someone unseen tends it, or too on-the-nose a tell the day before the reveal (does it pre-explain the D40 reveal)? Does Sam being unable to find the keeper successfully avoid a chase-carrot, or is it a contrivance?
3. D41 SAVIOUR-GUARD — Wren's whole v2 design exists because v1 was "saviour-coded / surveillance-creepy." Does D41 actually HOLD the janitor-not-angel line, or does "I comb your wreckage and keep the real part of you until your hands are steady" slide RIGHT BACK into saviour-coding no matter how dry the delivery? Is keeping a player's discarded things still subtly surveillance-creepy?
4. D41 FORWARD-POINT — "someone'll hand you what they kept of you, soon, another room" — is this elegant foreshadowing of the D52 keeper-naming, or a too-cute riddle that over-promises? Does pointing Wren's beat at Kenji's future beat make D41 feel like a SERVANT to D52 rather than its own thing?
5. D41 vs D40 — is the Scrapbook lesson ("a failure has one good line") a real ESCALATION past the D40 reveal, or a restatement of it? What does D41 give that D40 didn't?
6. Biggest risk across the batch + the single highest-leverage fix. Rank the top 3 fixes.`;
console.log(await gemini(P));
