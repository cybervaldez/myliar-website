// Gemini SET-LEVEL 2nd-opinion on the D21-25 connective batch. Key inline-env ONLY.
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
const P = `Senior narrative director — HARD set-level 2nd opinion on a 5-day CONNECTIVE batch (quote specifics, disagree, rank fixes). 2nd-person faceless-MC life-RPG; coaches who make themselves obsolete (anti-dependency, "grows with you"). These are the ORDINARY M0 days between authored tentpoles — most should grant NOTHING (sparse by design). They sit on a long-running MYSTERY thread: an unseen archivist (Wren, gender ⚲) keeps the building's records and leaves marks in a [ledger]'s margins. The ladder is D18 (player reads the oldest "week zero" pages = read-the-page) → D22 (first margin voice-completion) → D24 (second margin line + Sam pins it) → D29 (player nearly catches them at a doorway — a sound, never a face) → D40 (full reveal). The batch:

- D21 (Kenji, M0, grants nothing): a fresh mark appears overnight on the old leaf in a hand that's neither Kenji's nor the original keeper's — a half-ruled line in a LOCKED office. Kenji, contained, "I don't like not knowing who." A held breath. Builds to D22.
- D22 (Kenji, MYSTERY TWITCH #1, grants nothing — surfaces an obscured ??? line): mid-reconciliation Kenji hits a line that "doesn't take a column" and a second un-columned hand FINISHES it in the margin, in real time, answering something the PLAYER did. Gated on read-the-page (cold-path variant if not). Responsive variants keyed to the player's D18 branch (COLUMNS/MARGIN/COPY). The unfinished thing is a PAGE thing ("I never closed that page"), NEVER food (food is another coach's lane). Kenji: "that one's yours; somebody keeps better notes than I do." The game tells the player NOT to chase it ("they'll close their own line when ready").
- D23 (Hana, M0 LULL, grants nothing): a deliberately NON-mystery warmth breather — Hana keeps the player's bench seat, runs the count, says "you're steadier than week one... I count you every day; I notice. I'd tell you if it went the other way too — THAT'S the gift." No mystery content on purpose.
- D24 (Sam, MYSTERY TWITCH #2, grants nothing): the SAME hand leaves a SECOND line — DRY/observant this time (not wistful), clocking a real habit of the player's and approving ("you front your leftovers so the old food gets eaten first — noticed"). Sam (the building's indexer) pins the waveform and says it "doesn't sync" — no column to file it under — a meta-rhyme with a private un-synced card Sam himself keeps. Gender ⚲ enforced (killed a "she'd have" the spine sample had). Two facets (D22 incompleteness / D24 dry recognition) so D29/D40 deepens, not repeats. Again: don't chase it.
- D25 (Mei, M0 LULL-FILL, grants nothing): plain prep morning — Mei silently fronts the player's about-to-turn leftovers, fixes their grip, refuses thanks ("a saved plate stops being a kindness the second you make me admit it's one"). Plants a feather toward the D26 tier-7 "they know your spaces" crossing without spending it.

Critique the BATCH as a SET:
1. PACING/SPARSENESS — do 5 connective days with ZERO grants read as confident restraint or as filler the player will swipe through? Is the two-twitch + two-breather + one-setup rhythm right, or is it monotonous (4 of 5 days are "someone quietly notices the player")?
2. THE MYSTERY ESCALATION — D21 mark → D22 wistful completion → D24 dry recognition. Does that escalate, or are D22 and D24 too similar (both "an unseen hand comments on you")? Is the "two facets, not a third repeat" claim actually achieved by the text, or are they the same note twice?
3. ANTI-RETENTION — three separate beats tell the player NOT to chase the mystery ("they'll come when ready", "don't hunt it", "be polite back"). Does repeating "don't chase it" successfully defuse the retention-carrot, or does protesting-too-much actually HIGHLIGHT that a gated mystery character IS a come-back hook? Is there a cleaner way?
4. VOICE — across Kenji/Hana/Sam/Mei in the same batch, is each distinct, or do they blur into one "warm-but-terse observer who sees the player"? (All four essentially say "I notice you and won't make it a thing.") Is that a unifying motif or a sameness problem?
5. TENTPOLE-STEALING — does any connective day accidentally carry too much weight (a near-reveal, an over-large emotional beat) that would upstage D26 (tier-7 crossing), D29 (near-encounter), or D40 (face)?
6. Biggest risk across the batch + the single highest-leverage fix. Rank the top 3 fixes.`;
console.log(await gemini(P));
