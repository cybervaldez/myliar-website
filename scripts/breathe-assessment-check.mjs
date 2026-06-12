const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(p, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2400, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { await sleep((t + 1) * 9000); continue; }
    if (model === "gemini-flash-latest") return gemini(p, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}
const P = `Senior game-design director, HARD 2nd opinion (quote specifics, disagree, rank fixes). A life-RPG / dating-sim with two campaigns: the MAIN LINE (a coaching/found-family arc, deliberately expanded to ~60 days) and THE WINGMAN (a dating-coaching campaign, 5 coaches × 5 days = 25 days). Core moat: coaches who make themselves OBSOLETE (anti-dependency; the loop must push you toward real life, never validate you into staying). I wrote a DECISION DOC answering "should each campaign expand its days (breathe) like the Main Line did, or stay compressed?" The doc's argument:

1. PRINCIPLE: length is mechanics-driven, never a target. The test: does each character run a genuine TWO-PHASE arc (learn-from-them → then HELP-them, gated behind their graduation) AND does the goodbye want to be a slow ache vs a clean exit? YES → earn the length; NO (esp. a sprint-shaped relationship) → adding days is padding that actively breaks it. Corollary: you don't improve a campaign by lengthening it, you improve it by making it CONVERGE (fire the whole signature-moment stack).
2. MAIN LINE → expanded (60d) is CORRECT: 5 characters, distinct arc types, full two-phase arcs across 10 relationship tiers; the help-them back half has nowhere to live in 2-3 weeks; staggered slow graduations. The engine needs the room.
3. THE WINGMAN → KEEP COMPRESSED (25d), do NOT expand: a dating relationship is a SPRINT, not a slow goodbye; extending it to a Main-Line-style graduation contradicts the campaign's own thesis. Compression IS the anti-slop moat (more days = more validation loop = the failure mode the campaign refuses). What it lacks is CONVERGENCE not days — fix by (a) tagging existing peaks (the "scar" day = the Wall moment), (b) folding a compressed 3-beat graduation into each coach's final day (B5) as its three events, arc length unchanged.
4. FUTURE EXPANSIONS → apply the test per-campaign; declare each campaign's length-shape (+reason) explicitly, never imitate a number.
Ruling: "Only the Main Line breathes; the Wingman sprints; future campaigns prove they need the room before they take it."

Critique HARD:
A. Is the central principle ("length follows mechanics; converge before you lengthen") actually SOUND, or is it a rationalization that lets me avoid the work of expanding the Wingman? Is there a real case that the Wingman SHOULD breathe (e.g. 25 days is too thin for 5 coaches = only 5 days each to form an attachment worth graduating from)?
B. THE STRONGEST COUNTER-ARGUMENT to "keep the Wingman a sprint" — make it as forcefully as you can. (e.g.: a 5-day arc per coach is too short to earn the obsolescence payoff; the player won't feel they outgrew a coach they knew for 5 days; the graduation lands hollow.) Does the doc adequately answer it?
C. Is "compression is the anti-slop moat" a real mechanic or a convenient story? Could a longer Wingman ALSO be anti-dependency (more time to build real-world skills before graduating) — i.e., is the sprint a genuine design necessity or just the current scope?
D. Does this doc ADD anything over the existing convergence audit it cites, or is it a restatement dressed as a decision? What's the one thing it's missing that would make it actually decision-grade?
E. Biggest risk in the ruling + the single highest-leverage fix. Rank the top 3 fixes.`;
console.log(await gemini(P));
