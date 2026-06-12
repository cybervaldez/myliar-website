// Gemini SET-LEVEL 2nd-opinion on the D32-35 connective batch (closes D21-35). Key inline-env ONLY.
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
const P = `Senior narrative director — HARD set-level 2nd opinion on a 4-day batch (D32-35) that closes a connective run and sets up a major tier-8 emotional peak (the D36 family meal, where coach Hana finally tells the whole story of her dead sister Maya = the SOLE peak of the act). 2nd-person faceless-MC life-RPG; coaches who make themselves obsolete (anti-dependency); the player is a WITNESS, not a fixer ("Veto of Witness"); Hana's arc-type is "Monument" (already whole — NEVER fixed by the player). Quote specifics, disagree, rank fixes. The batch:

- D32 (Mei, M0 run-up, grants nothing): Mei sources/preps for the squad meal, breaking her own "don't waste money" rule for the good ingredient ("it's not for service" / "I don't buy the good one for strangers"); the player is her trusted second palate. "The meal IS the sentence" (her anti-sentiment love-language).
- D33 (Hana, THE REGRESSION, grants nothing, category=fear): Hana runs her hard "4-count" recovery breath and CAN'T land the fourth beat — the wind is audible in the gap (a callback to an earlier day when she said the name "Maya" once and went quiet). She resets, breaks again, deflects ("the fourth one's been a problem lately"), does NOT explain. The player WITNESSES: the correct (passive) move is to count the three WITH her and let the fourth be hard — NOT finish it, NOT ask who Maya is. Crit-fail = excavation (pushing/naming) → she shuts it hard ("that one's not yours to open"). An inquiry confirms the LINK (yes, it's about the name) but withholds the STORY (saved for D36). Stat reward (+STR) is explicitly held until AFTER the breath, never mid-count.
- D34 (Sam, M0 quiet-aftermath, grants nothing): the morning after — nobody crowds Hana (kindness = space). Sam, the indexer, refuses to close an old unresolved pin ("an open entry filed as closed is a lie that feels tidy; some things are just open; don't poke them to close faster") — obliquely rhyming the witness lesson WITHOUT counseling the player (Sam fixes filing, not feelings).
- D35 (Mei, M0 meal-eve, grants nothing): the day before — final prep, food brought "to the edge of ready," the table deliberately NOT set yet, the guest list not named. "I don't hope at a meal, I prep it." Hands directly to D36 (same kitchen, next evening). Explicitly does NOT set the place-and-a-half or touch Maya (D36's job).

Critique the BATCH as a SET:
1. D33 PEAK-PROTECTION — does the regression FORESHADOW the D36 Maya reveal, or does it accidentally STEAL/blunt it (showing Hana cracked 3 days early)? Is the inquiry confirming "yes it's about the name" a smart restraint or does it give away too much before the meal? Where exactly is the line between "I felt the shape of the grief" (good) and "I basically already know" (bad)?
2. D33 VETO OF WITNESS — is "witnessing, not fixing" actually the SATISFYING action here, or will players feel passive/useless ("I just... sat there")? Does making the passive option the CORRECT one, and the active push a crit-fail, risk feeling like the game punishes engagement? How do you make NOT-acting feel like a meaningful choice rather than a non-choice?
3. SPARSENESS TAIL — this batch caps a long sparse run (D21-35, ~13 grant-light days). By D32-35 is the player starved for a reward/unlock, or does the imminent meal carry them? Is three M0 days around one heavy beat (D33) the right ratio?
4. D34 PLACEMENT — is a quiet "nobody dwells, Sam talks about filing" day the right call after D33, or does it deflate the momentum into the meal (a wasted slot that should push harder toward D36)? Is Sam's oblique "I'm-not-talking-about-Hana-but-I-am" too cute/precious?
5. EVE DISCIPLINE — does D35 make D36 feel INEVITABLE+IMMINENT (good) or PRE-SPENT (bad)? Is "the deliberately unset table" a strong restraint or a contrived way to dodge giving the meal-setup any actual content?
6. Biggest risk across the batch + the single highest-leverage fix. Rank the top 3 fixes.`;
console.log(await gemini(P));
