// Gemini 2nd-opinion on the character-arc typology. Key inline-env ONLY.
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
const P = `Senior narrative-systems designer, HARD 2nd opinion (quote specifics, disagree). Context: a life-RPG where the cast are COACHES whose GIFT helps the player (value prop at REL 0); the player maxes a relationship to "Unspoken" (a reward stack). Anti-dependency is a HARD floor: coaches make themselves obsolete, no engagement-milking. We are ADDING a reciprocal motif: the player also helps each CHARACTER finish their own personal journey, with a payoff to THEIR story. The user demanded variety — NOT everyone a "growing-up/needs-therapy" arc; many fan-favorites are STRONG with a sad backstory who just need to be HEARD.

Proposed TYPOLOGY (assign distinct types per cast; cap the growth ones):
1. Standard-Bearer (flat arc — already whole, holds a truth; player helps them ACT on it; payoff = truth lands in the world)
2. Witnessed Wound ("just be heard" — strong, sad backstory; player becomes the one they tell; payoff = being SEEN, not healed; cap <=2)
3. Unfinished Business (a concrete deed they couldn't finish, the "loyalty mission"; player helps them DO it; payoff = deed done)
4. The Thaw (cold/silent; player earns a degree of trust; payoff = they let YOU in, stay cold to the world)
5. The Guard (protects something precious; player earns being trusted with it; payoff = handed the heavy thing)
6. Positive Change (genuine growth; CAP <=1 per campaign)

FLOORS we set: player is WITNESS/CATALYST never FIXER/THERAPIST (research: reciprocity dies on the fixer dynamic); the GIFT stays primary, reciprocity is additive; reveal arcs use Kishotenketsu (understanding rebuilt, a crack not a confession), not hero-journey growth.

Critique, concretely:
A. Are these 6 types GENUINELY distinct, or do some collapse (e.g. Thaw vs Guard vs Witnessed Wound all read as "cold person opens up")? Which to merge/cut/sharpen?
B. The witness-not-fixer floor: actually holdable, or will "help them finish their journey" drift into the player being the character's therapist/fixer? Where EXACTLY is the line, mechanically?
C. CONTRADICTION CHECK: a coach who needs the player to finish THEIR arc — does that break anti-dependency (the coach is supposed to make ITSELF obsolete, not become needy)? Reconcile "player helps the coach" with "coach makes itself obsolete".
D. Caps (growth <=1, witnessed <=2): right, too rigid, or arbitrary?
E. Single biggest FAILURE MODE of this whole motif, and what type/rule is MISSING?
Rank the top 3 fixes before we finalize.`;
console.log(await gemini(P));
