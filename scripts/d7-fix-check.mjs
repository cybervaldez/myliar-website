// Gemini second-opinion on the daily_kenji_d7 rewrite (playtest Fix B + C).
// Layered AFTER the kaizen/writers-room adjudication. Key inline-env ONLY.
//   GEMINI_API_KEY=… node scripts/d7-fix-check.mjs
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(prompt, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 2400, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { process.stderr.write(`${r.status} retry\n`); await sleep((t + 1) * 10000); continue; }
    if (model === "gemini-flash-latest") return gemini(prompt, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}

const PROMPT = `You are a narrative-craft editor for a life-RPG. Character KENJI is a dry, precise auditor who speaks in ledger/column/drawer terms; his warmth is buried under bookkeeping and shows only by what he chooses to log. His scenes use authoring tokens like [ledger*], [drawer], [desk] (these get auto-converted to plain prose at render — KEEP them, they're load-bearing). The relationship floor: companion/mentor trust, never romance; he never does the player's real life FOR them.

CONTEXT: A playtest found Kenji's week-one finale (Day 7) buries its human payoff (Kenji's mother confession at event 4 of 5) under 3 events of accounting, and the finale choices feel fake (two synonymous "stay quiet" options; a reaction that admits a prior choice "didn't matter"). Two fixes: FRONT-LOAD one human hook to event 1, and make the finale choices feel real.

Critique these specific rewrites HARD — quote specifics, don't be a sycophant. For each: does it keep Kenji's deadpan voice, hold the floor, and actually fix the problem? Offer a sharper wording where you can.

CHANGE 1 — evt-1 scenario, APPEND this sentence (front-load the mother-confession's shadow at 0% depth):
"The invite carries a second attachment the metadata shouldn't — a [ledger*] row with Kenji's own name on it, the entry itself redacted to a black bar. Created 4:58, never unsent. He either missed it, or let it ride."

CHANGE 2 — evt-2 scenario, REPLACE the three-column enumeration ("Three column headers below it: 'column one… column two… column eleven…'") WITH a single concrete detail tying back to the hook:
"Four rows ruled below it — Sam, Hana, Mei, and a fourth left blank where his own name should be: the black-bar row from the invite, now drawn fresh and empty."

CHANGE 3 — evt-2 choice-a reactionText, the OLD line admits a choice didn't matter:
OLD: "+1 INT. correct question. the chaotic crit-success cleared the first rotation. the logical and passive options each contributed half a rotation in parallel — the system averages. you got the half. don't ask which one mattered more — the system doesn't distinguish and neither do I. +1 GLD + 1 REL…"
NEW (credit both paths as real/additive): "+1 INT. correct question. the chaotic crit cleared the first rotation; the steady picks earned the half in their own column. two routes, one half-turn — both logged, both load-bearing. +1 GLD + 1 REL for asking the question the [ledger*] is built to answer."

CHANGE 4 — evt-4 (the mother beat). Both choices stay no-fail (a sacred trust beat), but DIFFERENTIATE the payoff so the casual SEES the choice land: choice-a ("don't ask his mother's name, let him close the page") now drops a MEMENTO:
name: "Kenji's Closed Page"
description: "The ring-binder page he closed himself, his mother's name still under it. You never asked. A photo of the closed cover, his hand flat on it. Lives in the case file."
(choice-b — "sit in it, say nothing" — keeps no item but the deeper +REL +INT and the 'harder version' framing.)

CHANGE 5 — closingHook, soften the foreclosure:
OLD: "…Chat tonight is an epilogue, not the decision; the decision's already made."
NEW: "…Chat tonight isn't the epilogue — the seam's set, but what you do with the key tonight writes week two's first line."

Give me: per-change verdict (keeps voice? holds floor? fixes it?), any sharper wording, and ONE BIG NOTE.`;

console.log(await gemini(PROMPT));
