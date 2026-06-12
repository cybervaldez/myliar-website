// Gemini 2nd-opinion on the d38 sams-source SEED beat. Key inline-env ONLY.
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(p, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2200, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { await sleep((t + 1) * 9000); continue; }
    if (model === "gemini-flash-latest") return gemini(p, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}
const P = `Senior narrative director, HARD 2nd opinion (quote specifics, disagree). 2nd-person faceless-MC life-RPG; coaches who make themselves obsolete (anti-dependency; "grows with you"). I authored a QUIET SEED beat (d38) for Sam, the meta-guide/narrator (he explains every game system to anyone who asks; idiolect "sync", "on file", "the system"; mild, dry, tech-support patience). It's the morning after a big family meal. It SEEDS a payoff that lands at Sam's graduation much later (d58).

THE BEAT (d38, grants achievement "sams-source"):
- The player notices, for the first time, that one index card on Sam's [notes*] wall is turned FACE-IN (its back to the room, same spot-red pushpin as the rest). Sam: "That's not a system card. It's the line I onboard myself with — the one I don't sync. A keeper's allowed one of those." He will NOT turn it over.
- Player choices: leave it face-down (don't ask) / ask what's on it (Sam: "not today... it only works if you arrive at it; ask me again when you don't need me to answer") / reach to flip it yourself (crit-fail: he stops you — "I keep one page to myself; a person's allowed that").
- Chat inquiry "why keep one card private?" -> Sam: "a guide who syncs everything, including himself, isn't a person — he's a manual... you'll get a turn at it, not because you'll need it, but because by then you'll have your own face-down card."
- It's a no-CG, no-trophy-fanfare breather day; the PAYOFF (reading the card) is held for d58 (his Unspoken graduation, where he goes quiet for good).

Critique, concretely:
A. Does this earn being a beat at all, or is it too SLIGHT — "a guide has a private card he won't show you" — does anything actually HAPPEN, or is it a hook with no beat? Is the withholding satisfying or frustrating (a tease that pays off ~20 days later)?
B. The "you'll get a turn when you don't need me to answer" / "you'll have your own face-down card" lines — profound or too-precious/fortune-cookie? Is Sam over-explaining his own mystique (the thing that kills a withholding character)?
C. Does it serve grows-with-you / anti-dependency (the guide is a person, not a manual; you don't get to extract everything), or does "a coach withholds a secret to bring you back later" read as a RETENTION hook (the exact thing the moat forbids)?
D. Biggest risk in this beat + the single highest-leverage cut/fix. What did it miss?
Rank the top 3 fixes.`;
console.log(await gemini(P));
