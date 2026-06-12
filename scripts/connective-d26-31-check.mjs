// Gemini SET-LEVEL 2nd-opinion on the D26-31 connective batch. Key inline-env ONLY.
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
const P = `Senior narrative director — HARD set-level 2nd opinion on a 5-day CONNECTIVE batch (D26-31, with D29 already authored elsewhere = a Wren-mystery precursor, not in this set). Quote specifics, disagree, rank fixes. 2nd-person faceless-MC life-RPG; coaches who make themselves obsolete (anti-dependency, "grows with you" = the relationship deepens AS you outgrow needing it; intimacy + autonomy rise together). These are the run-up to a tier-8 FAMILY MEAL (~D36) whose SOLE emotional peak is one coach (Hana) finally telling a dead-sister grief story — so NOTHING in this batch may steal that peak. The batch:

- D26 (Kenji, the TIER-7 CROSSING, "knows where you keep things", grants nothing — the tier-up IS the reward): Kenji has quietly cleared a desk-corner for the player's ledger for weeks and never said so; reveals it only when needed. Explicitly guards the line between SEEN and SURVEILLED: "a keeper who watches to OWN you is a debt collector... I keep the space, you keep the grip." "A kept space you just USE is a home."
- D27 (Sam, M0, grants nothing): a deliberately NON-mystery breather — Sam helps the player index their OWN messy notes ("file by future-panic"). "I don't fix you, I make your stuff findable so you can." Shows his gift (the index) in plain form.
- D28 (Mei, M0 folded-in, grants nothing): belonging shown by DROPPED EXPLANATION — mid-rush Mei gives the player the staff short-version ("watch the back-left") instead of guest instructions, and they keep up. "Belonging is the day someone stops explaining and you don't fall behind."
- D30 (Hana, the RECIPROCITY beat, grants nothing): the inversion — Hana comes in empty-tanked (a plain bad morning, NOT a breakdown), and the player keeps HER the bench-seat and runs HER count, returning the D18 ritual. She lets herself be held, hands her own line ("tribute later") back. Guarded as Hana being MET, not FIXED (her arc is a "Monument" — she doesn't need fixing); she shuts down excavation ("don't excavate me").
- D31 (Kenji, M0 run-up, grants nothing): the ~D36 meal first surfaces as pure logistics — Kenji puts the player on the headcount with NO invitation ("I don't invite fixed costs; an invitation implies you were a maybe"). Belonging-as-given.

All five deliberately differentiate the same "unannounced care" motif BY METHOD (Kenji=ledger/space, Sam=index, Mei=dropped-explanation, Hana=count, ) to dodge voice-blur. The Wren margin is deliberately RESTING across this batch (it moved D22/D24, near-encounters D29, reveals ~D40) — so D26-31 carry ZERO un-columned/mystery content on purpose.

Critique the BATCH as a SET:
1. THE D26 TIER-7 CROSSING — does "he cleared me a desk-corner and didn't say so" carry enough weight to be a real REL milestone, or is it too slight for a tier crossing? Does the explicit "seen not surveilled / debt collector" guard land as reassuring, or does NAMING the creepy reading actually plant the creepy reading (protesting-too-much, like the earlier "don't chase it" problem)?
2. THE D30 RECIPROCITY / MUTUALITY — is "the player spots the spotter" a satisfying grows-with-you inversion, or does a coach having a bad day and being comforted by the player risk the exact role-collapse the product guards against (player becomes the caretaker = coach becomes dependent = inverts the moat)? Is the "MET not FIXED" guard actually achieved by the text, or is the player still functionally therapizing Hana?
3. THE FOLDED-IN MOTIF — three of five days (D28, D31, and arguably D26) are variations of "you belong now, shown not said." Even differentiated by method, is "you're one of us" three times in six days repetitive? Which of the three is the weakest / cuttable?
4. SPARSENESS / MEAL SETUP — five grant-nothing days before the meal: confident runway, or does the player feel the game stall for a week with no unlocks? Does D31 make the D36 meal feel INEVITABLE (good) or PRE-SPENT (bad)?
5. PEAK PROTECTION — does any beat (esp. D30's emotional Hana moment) leak emotional intensity that should be saved for D36's Maya-grief peak? D30 has Hana vulnerable 6 days before her big grief reveal — does that blunt D36?
6. Biggest risk across the batch + the single highest-leverage fix. Rank the top 3 fixes.`;
console.log(await gemini(P));
