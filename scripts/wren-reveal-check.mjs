// Gemini 2nd-opinion on the WREN REVEAL beat (the 5th-character reveal). Key inline-env ONLY.
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
const P = `Senior narrative director, HARD 2nd opinion (quote specifics, disagree). A 2nd-person faceless-MC life-RPG; coaches who make themselves obsolete (anti-dependency; "grows with you"). I just authored the REVEAL BEAT for the 5th/mystery character, WREN, off a Gemini-vetted Destination Card. Critique the BEAT (not the card).

CONTEXT: For weeks the player has half-glimpsed a ghost-figure at the edges (a paper-coloured coat, keys that never sound, ledgers). Wren = the Keeper of the Drawer (gender ⚲). The player has used a "Drawer" since week 1 (it quietly collected their discards — failed drills, blown audits, junk). The reveal is GATE-TRIGGERED (fires only after the player has earned BOTH: witnessing Kenji's audit + a seat at Mei's family meal), so it lands ~D40 (a deliberate gap after the meal). Wren's lane = "the Scrapbook": keep the unusable/failed/wasted things a ledger can't value. Contrast established: "Kenji logs what it COST; I keep what it was WORTH."

THE BEAT (2 events):
- EVENT 1 (the reveal): the figure doesn't leave this time. Wren steps under the light, sets down dated ledgers, opens the Drawer the player's used since week 1 — it's FULL of everything they thought they threw away. "You didn't lose those. I kept them. You only find the keeper once you've learned to keep, and to belong. You did both. The ghost was never haunting you. It was keeping you." Player choice: ask who they are / take them in silently / demand why they "watched" you (Wren: "not watched — KEPT. different verb. I only ever knew what you brought to the drawer."). Lineage handled in one line: "Kenji rules his ledger into columns — his own. He didn't learn it from me and I didn't teach him. Two keepers of two things. A building always has a keeper."
- EVENT 2 (the lane): Wren turns the open Drawer toward the player — it's their discards kept in order. "Kenji would log every one as a loss. I keep what it was worth, which a column can't hold." Lifts a receipt: "Kenji has it as a loss. I have it as the night you finally admitted the thing you'd been avoiding. Same receipt. Two drawers." Player choice: name what one "failure" was worth (the Scrapbook skill) / sit with the open drawer / ask to throw out the junk (Wren: "knowing WHICH is the skill; not everything that can't be accounted for should be thrown away").

Critique, concretely:
A. Does the reveal EARN its goosebumps, or is "the ghost was keeping you / I kept them since week one" too neat / sentimental — does it over-explain the magic? Is there a line that's one beat too on-the-nose?
B. "Not watched — KEPT, different verb. I only ever knew what you brought to the drawer." — does that successfully defuse the SURVEILLANCE creep (a stranger who's been collecting your stuff for weeks could read as stalkerish), or does the creep survive?
C. The lane reveal (EVENT 2: "Kenji logs the cost, I keep the worth; same receipt, two drawers") — does it land the distinct gift in ONE scene, or still feel like Kenji-with-a-different-adjective? Is the "two drawers / same receipt" device clear or too cute?
D. Is gating the reveal on TWO prerequisites (Kenji's trust + Mei's table) and framing them as "two keys to reach the keeper" earned and meaningful, or contrived/gamey ("collect 2 tokens to unlock NPC")?
E. Biggest risk in THIS beat + the single highest-leverage line/cut to fix it. What did it MISS?
Rank the top 3 fixes.`;
console.log(await gemini(P));
