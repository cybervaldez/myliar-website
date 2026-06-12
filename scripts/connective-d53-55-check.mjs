// Gemini SET-LEVEL 2nd-opinion on D53-55 (post-naming keeper-role -> Mei-grad run-up). Key inline-env ONLY.
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
const P = `Senior narrative director — HARD set-level 2nd opinion on 3 beats (D53-55), the post-climax stretch after a major beat (D52, where coach Kenji named the player keeper-after-him). 2nd-person faceless-MC life-RPG; coaches who make themselves OBSOLETE ("grows with you" = the relationship deepens AS you outgrow needing it; intimacy + autonomy rise together). Quote specifics, disagree, rank fixes. The beats (all M0, grant nothing):

- D53 (Kenji, the PEER DWELL): the morning after the naming. The player audits their OWN ledger now; Kenji reads it as a PEER (not a teacher), finds a public-room cover the player caught that he'd have missed in his old rigid grid (the D49 kitchen-strain is now RESOLVED — Kenji adapted his columns). "You don't thank a peer for the desk that's already yours." "My books outliving me is the only thing a keeper actually wants." The rank is gone; the bond stands where the hierarchy was.
- D54 (Sam, the CROSS-LANE TALLY): Sam (the building's indexer) reads off the board all the posts the player now holds — the GATE (Hana's, since she graduated), the LEDGER (Kenji's, since the naming), the CORNER at the pass (Mei's, since week 3). "You walked in a stranger and became the person this building is partly kept BY... and you got here by needing them LESS, one post at a time, until needing turned into keeping — and ended up CLOSER to all of them, not further." No medal; he reads it as a fact. (The anti-dependency floor is SHOWN — the board, the posts, nobody dimmed — not lectured.)
- D55 (Mei, the HERALD-SEED): the eve of Mei's graduation. A newcomer hovers at the pass in the exact posture the player had on Day 5, and the player makes them room UNPROMPTED, in their own words (not Mei's clipped line) — the instinct's just there now. Mei clocks it from her boards and does NOT correct the player's version, which "is the closest thing to a graduation certificate she will ever issue." Seeds the D56 herald deed without spending it (tomorrow she hands over the line + names the corner). Mei is flat/anti-sentiment by canon (warmth in the act, never the face).

Critique the BATCH as a SET:
1. THE BIG RISK — D53, D54, AND D55 are all fundamentally "look how far the player has come / the player keeps things now" beats. Three "you've grown into the keeper" beats in a row. Even differentiated by lane (Kenji peer / Sam tally / Mei herald), is the EMOTIONAL note ("you're capable now, you keep this place") repeated one too many times? Does this stretch read as a victory-lap / self-congratulation pileup right before Mei's graduation? Which of the three is most cuttable or most needs re-pitching to a DIFFERENT note?
2. D54 specifically — a beat whose entire content is a character LISTING the player's accomplishments ("you hold the gate, the ledger, the corner") risks being the game patting the player on the head. Is Sam's tally earned and moving, or is it an achievement-screen in prose? Does "you got closer by needing them less" land as insight or as the game stating its own thesis at the player?
3. D53 — is the peer-dwell ("Kenji reads my ledger as an equal, finds a thing I caught") a satisfying grows-with-you payoff, or does Kenji conceding "you keep them better than I kept the rigid ones" ring slightly false / too-generous (would a hyper-rigorous 11-year keeper really hand the crown that cleanly)?
4. D55 — does "the player does the Mei-thing unprompted, Mei doesn't correct it" set up D56 well, or does it STEAL D56's punch (if the herald instinct already fully arrived at D55, what's left for the graduation to do)? Where's the line between seed and spend?
5. PACING — is three grant-nothing "you've arrived" days the right runway into Mei's quiet graduation, or should one of them be a genuinely different beat (a setback, an ordinary non-growth day, a problem) to break the upward-only curve?
6. Biggest risk across the batch + the single highest-leverage fix. Rank the top 3 fixes.`;
console.log(await gemini(P));
