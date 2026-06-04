// Gemini second-opinion on the daily_kenji_d4 evt-1 front-load (playtest Fix D).
// Key inline-env ONLY. GEMINI_API_KEY=… node scripts/d4-fix-check.mjs
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(p, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1600, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { await sleep((t + 1) * 10000); continue; }
    if (model === "gemini-flash-latest") return gemini(p, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}
const PROMPT = `Narrative-craft editor. KENJI = a dry, precise auditor who speaks in ledger/column/drawer terms; warmth shows only by what he logs. Tokens like [ledger*]/[desk]/[drawer] auto-convert to plain prose at render — keep them. Floor: companion/mentor, never romance; never does the player's real life for them.

PROBLEM (playtest, Day 4): evt-1 is a dry "did you arrive at 7:00" compliance check; the real hook (Kenji has yesterday's 11:42 PM 43-minute scroll audit waiting) only lands at evt-2, so a casual thumbs past the opener. FIX (this rewrite): make the 11:42 reckoning VISIBLE in the evt-1 scenario so arriving happens under a hook the player can already see — without changing the choices (still about how you arrive).

OLD evt-1 scenario:
"7:00 AM exactly. A sharp crimson calendar alert on your lock screen: 'K · 07:00–07:25 · review window · [desk].' Kenji's first calendar block, locked overnight via the audit-chain access. Across the [courtyard center] the [ledger*] is already open at his [desk] — visible from the hallway, page turned to today's column. The [drawer] key sits in the SECOND-QUARTER position from yesterday. Mei's [bell*] from the [prep] zone has already rung once. Hana is on the [bleachers] watching the door of Kenji's office."

NEW evt-1 scenario (front-loads the hook):
"7:00 AM exactly. A sharp crimson calendar alert on your lock screen: 'K · 07:00–07:25 · review window · [desk].' Kenji's first calendar block, locked overnight via the audit-chain access. Across the [courtyard center] the [ledger*] is already open at his [desk] — and from the hallway you can read the line he left at the top of today's column, waiting: 'yesterday, 11:42 PM. 43 min unaccounted. ask what they were looking at.' He wrote the question before you woke up. The [drawer] key sits in the SECOND-QUARTER position from yesterday. Mei's [bell*] has rung once; Hana is on the [bleachers] watching his door. Whatever you do about the 7:00 block, the 11:42 line is what's waiting inside."

Critique HARD (quote specifics, no sycophancy): (1) does it front-load the hook so beat 1 is no longer a dry compliance check? (2) is it Kenji's voice (an auditor pre-writing the question is in-character)? (3) floor intact? (4) any sharper wording? (5) ONE BIG NOTE.`;
console.log(await gemini(PROMPT));
