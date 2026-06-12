// Gemini SET-LEVEL 2nd-opinion on D42/D43/D44 (completes the D37-45 gaps). Key inline-env ONLY.
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
const P = `Senior narrative director — HARD set-level 2nd opinion on 3 beats (D42, D43, D44) closing a connective run into an Act IV climax. 2nd-person faceless-MC life-RPG; coaches who make themselves obsolete (anti-dependency); player is a WITNESS not a fixer ("Veto of Witness"). Quote specifics, disagree, rank fixes. Context: a tier-8 meal (~D36) already happened where coach Hana told the whole story of her dead sister Maya; coach Kenji keeps a hand-sewn 7-year personal ledger with "column eleven" (his uncategorised self-audit) — the player has heard ONE row of it read aloud back in week 2. The future climax D52 is where Kenji OPENS the whole column eleven + slides the player the drawer-key + names them keeper-after-him (the quietest beat in the run). The beats under review:

- D42 (Hana, M0 quiet-payoff, grants nothing): the small earned aftermath of the D36 telling — Hana's hard "4-count" breath (which broke on the fourth beat at D33, with an audible "wind" in the gap) lands WHOLE for the first time, no wind. Neither she nor the player marks it. The game does NOT let the player celebrate it ("a celebrated breath becomes a braced breath"). "I'm not over it, I'm just not strangling it anymore. The fourth beat's allowed to land now. That's all 'better' ever means."
- D43 (Kenji, the TIER-9 CROSSING, grants nothing): Kenji finally CLOSES the oldest row in column eleven — a 7-year-overdue call to his mother, re-copied forward every year rather than admit it lapsed. He shows the player the ONE row (doesn't let them read the words), makes the call off-earshot, crosses the row "like a paid debt." Then opens the keeper-QUESTION for the first time, to the room not the player: "a keeper closes everyone's books but his own. Who closes mine, after?" GUARDS: he does NOT open the whole column or hand over the keeper role (that's D52); he does NOT name the player as the answer ("not yet... it has its own day... not a thing I hand over because someone volunteered"). The player WITNESSES the close, does not push him to call (crit-fail = pushing/grading his lateness).
- D44 (Mei, M0 scale-widening, grants nothing): a stranger Mei never met references her long-CLOSED kitchen secondhand ("people still talk about the last night"). It cracks her "strangers stay strangers / a kitchen that feeds strangers is a conveyor" theory from the OUTSIDE — turns out some strangers DID keep the meal — softening her toward reopening it (~D45, the loud reopening). Establishes the world is bigger than the four of them BEFORE D45 pays it off.

Critique the BATCH as a SET:
1. D43 PEAK-PROTECTION — Kenji closing a 7-year personal row + asking "who closes mine, after?" is a BIG emotional beat. Does it STEAL thunder from D52 (where he opens the whole column + names the player keeper)? Is "close one row + ask the question, but don't open the column or name the heir" a clean enough division, or does D43 give away so much of Kenji's interior that D52 becomes anticlimactic? Where's the line?
2. D43 — is the 7-years-overdue mother-call EARNED and in-character for a hyper-rigorous ledger-keeper (does "re-copied the row forward every year rather than admit it lapsed" ring true or contrived-poignant)? Is making the call OFF-earshot the right restraint, or a dodge of the actual emotional content?
3. D42 — does "the breath lands whole, don't celebrate it" land as a profound restraint, or is a SECOND Hana-grief-adjacent beat (after D33 regression + D36 telling) one too many — is the player fatigued on Hana's breath by now? Is "I'm not over it, I'm just not strangling it" wise or a touch quotable-precious?
4. D44 — does the secondhand-stranger establish SCALE meaningfully, or is "a rando mentions your old thing" thin filler? Does cracking Mei's conveyor-theory from outside ENRICH her D45 reopening or PRE-SPEND her D45 clarity beat (where she explains why she closed it)?
5. WITNESS FATIGUE — D33, D42, AND D43 all use the same "player witnesses a coach's private hard moment and is rewarded for NOT acting" structure. Three times. Is that a powerful signature or a repetitive mechanic the player will see coming? How to differentiate the third instance (D43)?
6. Biggest risk across the batch + the single highest-leverage fix. Rank the top 3 fixes.`;
console.log(await gemini(P));
