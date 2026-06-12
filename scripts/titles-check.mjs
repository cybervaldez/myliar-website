// Gemini 2nd-opinion on TITLES as a progress-with-you narrative tool. Key inline-env ONLY.
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
const P = `Senior narrative-systems / game designer, HARD 2nd opinion (quote specifics, disagree). A 2nd-person faceless-MC life-RPG/dating-sim; the cast are COACHES who make themselves obsolete (anti-dependency moat — no FOMO/streaks/gacha; deterministic; "achievements are the ONE currency" — nothing is a second economy). Two campaigns: Life Ops (life-coaching squad) + The Wingman (dating, the "Corner").

VERIFIED CURRENT STATE: each coach has canon DATA — an ordered titles[] set (e.g. Hana: 'the Iron Monk' → 'the Powerhouse' → 'the Drillmaster') + an intimateTitle (Hana: 'the Spotter', Nico: 'the Count-In', Sloane: 'the Tell'). But the title MECHANIC is UNBUILT: titles aren't earned/unlocked, the player can't choose which to display, there's no "Just Name" toggle. The game shows one canonical title; the intimate title only shows on the graduated squad tile + the chat preamble. There's a ratified spec (earn flavored titles by REL+achievements; player display-choice; Just-Name opt-out) but no code.

THE PROPOSAL — make titles a "PROGRESS WITH YOU" narrative tool (grounded in 3 findings: sociolinguistics = address evolves polite→familiar→intimate; Homeric epithets = emphasize an EXISTING trait never invent; Hades titles = symbolic pride, zero mechanical effect):
1. TWO-WAY ADDRESS LADDER. (a) How the PLAYER addresses the COACH deepens with REL: polite class-title ('the Iron Monk') → insider/flavored titles (unlocked by REL tiers + achievements) → the intimate title at Unspoken ('the Spotter' = your private word for her). The word changing IS the intimacy. (b) RECIPROCAL: what the COACH calls the PLAYER also evolves — each coach bestows a player-epithet that climbs (rookie → regular → their word for you, e.g. Hana hands you 'the Spotter' at graduation). Your identity accretes the marks of everyone who changed you.
2. SYMBOLIC ONLY — titles unlock on the existing achievement+REL currency and grant NOTHING mechanical (the passive is the buff; the title is the flex). No second economy.
3. AUTO-DRIVEN DEFAULT + a "Just Name" floor — the address just deepens as you play (you notice the coach starts calling you something); a global Just-Names toggle for players who find titles cheesy. Never require managing titles.
4. EPITHET CRAFT — every rung emphasizes the SAME gift, just closer in (Homeric); never invent a new trait.

Critique, concretely:
A. Is the TWO-WAY ladder right, or does the reciprocal "coach gives the player an evolving epithet" risk feeling like an MMO title-grind / cringe ("You are now The Spotter!") that breaks the grounded, anti-dependency tone? Where's the line between meaningful and corny?
B. The PLAYER-epithet specifically: a faceless 2nd-person MC accreting titles from each coach — identity-through-relationships, or an incoherent pile of nicknames that means nothing? Should the player get ONE evolving title, one PER coach, or none?
C. "Auto-driven, symbolic, Just-Name floor" — does auto-changing how a coach addresses you (without you choosing) feel magical or presumptuous/jarring? How to introduce a new term of address so it lands as earned, not assigned?
D. Biggest FAILURE MODE of a title/address system in THIS anti-dependency coach game specifically, + the single highest-leverage rule to add.
E. What did we MISS — a use of titles/address that serves "progress with you" better than the two-way ladder?
Rank the top 3 fixes.`;
console.log(await gemini(P));
