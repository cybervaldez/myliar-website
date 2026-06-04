// Gemini second-opinion on the Kenji D3 intro front-load (playtest Fix B).
// Key inline-env ONLY. GEMINI_API_KEY=… node scripts/d3-fix-check.mjs
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(p, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1800, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { await sleep((t + 1) * 10000); continue; }
    if (model === "gemini-flash-latest") return gemini(p, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}
const PROMPT = `Narrative-craft editor. This is Day 3: HANA (warm, blunt drill-coach) walks the player across a courtyard to meet KENJI for the first time (a dry, precise auditor). Tokens [bleachers]/[bench]/[pic*]/[recipe*]/[courtyard center]/[desk]/[ledger*]/[notes*] auto-convert to plain prose at render — KEEP them. Floor: companion/mentor, never romance.

PROBLEM (playtest, casual-player + non-gamer lens): the genuinely great hook — a stranger across the courtyard is ALREADY keeping a written file on you — is buried at the END of the scenario under an accounting-jargon wall ("a column titled BEHAVIORAL OBSERVATIONS, your D1 overnight number, your D2 9-12 calendar gap, the line in column eleven"). A non-gamer (Dorothy) bounces before reaching the chill. Also the closingHook reads like a homework assignment.

FIX: front-load the file-on-you hook; turn the jargon column into concrete, chilling specifics; soften the homework closer.

OLD scenario:
"6:08 AM. Hana's text on your lock screen: 'meet me at the [bleachers]. don't eat first. we're walking somewhere.' When you arrive — outdoor grass, the [bench] beside the [bleachers], the [pic*] of her sister face-down today — she doesn't say where. She hands you a water bottle. Mei's [recipe*] is tucked into the cap, cold-rice variant from yesterday's inquiry, still folded in Hana's neat double-fold. She points across the [courtyard center] toward Kenji's [desk]. The [ledger*] is visible from the hallway — open to a page with your name. Below your name: a column titled BEHAVIORAL OBSERVATIONS, your D1 overnight number, your D2 9-12 calendar gap, and the line from your 9:34 PM call sitting in column eleven."

NEW scenario:
"6:08 AM. Hana's text: 'meet me at the [bleachers]. don't eat first. we're walking somewhere.' You find her on the grass by the [bench], the [pic*] of her sister face-down today. She hands you a water bottle — Mei's [recipe*] folded into the cap — and points across the [courtyard center] toward a man at a [desk] you've never met. His [ledger*] is open, visible from the hallway, and from here you can read the top of the page: it has YOUR NAME on it. Under your name, a column of things about you that you never told anyone — the night you didn't sleep, the gap last Tuesday you can't account for, and the call you made at 9:34 last night. He's been keeping a file on you. You haven't said a word to him. 'That's Kenji,' Hana says. 'He already knows. I figured you should meet him before he files you.'"

OLD closingHook:
"Kenji compiles a Procrastination Audit Sheet from your D2 calendar gap and tonight's chat. Open chat to find your top three chronological leaks ranked by audit severity. He delivers it dryly. The sheet is in your case file going forward — pinned to Sam's [notes*] wall beside Hana's overnight-number printout. Paired-pin format. Systems."

NEW closingHook:
"Kenji's already compiling — a sheet with your name on it, built from the gaps you can't account for. Open chat and he'll hand it over, dry as the page: the three places your time goes when you're not looking. It pins to Sam's [notes*] wall beside Hana's overnight printout. Paired-pin. Systems."

Critique HARD (quote specifics, no sycophancy): (1) does the new scenario front-load the hook + cut the jargon without losing the unsettling chill? (2) Hana's escort voice intact + is the new last line ("before he files you") good or too cute? (3) floor intact (auditor-fascination, not surveillance-creep that breaks frame)? (4) closingHook — less homework, still a hook? (5) sharper wording. (6) ONE BIG NOTE.`;
console.log(await gemini(PROMPT));
