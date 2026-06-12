// Gemini 2nd-opinion on the area-arrival batch: d45 (Last Service Menu) + d29 (Wren precursor). Key inline-env ONLY.
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
const P = `Senior narrative director, HARD 2nd opinion (quote specifics, disagree, rank fixes). 2nd-person faceless-MC life-RPG; coaches who make themselves obsolete (anti-dependency; "grows with you"). Two AREA-related beats in one batch:

=== BEAT A — d45 "The Last Service Menu" (Mei, Act IV LOUD/peopled CREST; an AREA-ARRIVAL beat) ===
- A big kitchen behind the [recipe*] line has been DARK on the map the whole run (a "Static Horizon" — visible-but-dim, never fogged). Tonight Mei reopens it for ONE night, to STRANGERS (private->public). The map cell brightens; the PLACE gets an establishing CG (wide, the room dominates, MC absent). Mei resists a portrait CG — "the spectacle is the room, not her face."
- Mei's clarity beat (why she closed it, terse/object-anchored): "Four hundred covers. Couldn't tell you a single name. A line that feeds strangers who stay strangers isn't a line, it's a conveyor. So I shut it." Why reopen: the player (a D5 stranger) became someone whose hundred little things [a 100-memento collectible counter] get kept — "maybe a stranger is just someone whose little things nobody's kept yet. One night, we test it." The 100 mementos become the night's MENU. She hands the player the menu when the room empties.
- Kenji is present, paid to make it legal, buses tables all night — but leaves his OWN name-row on his ledger BLANK, on purpose, lets the player see it blank, won't say why. This is a deliberate micro-dangle pulling to a D52 beat (where he names the player keeper). The game does NOT let the player force him to explain (crit-fail hardens it).
- Grants a LEGENDARY item "The Last Service Menu" (gate: ate-at-the-pass + 100-mementos).

=== BEAT B — d29 Wren PRECURSOR (obscured-introduction; "the ear before the face") ===
- Wren is a long-teased ??? mystery character (the building's archivist/keeper, gender ⚲). Full reveal (~D40) is gated on TWO achievements (witnessed-Kenji's-audit + ate-at-the-pass); the meal grants at D36, so D29 CANNOT reveal them by construction.
- Tonight: after the [archive] floodlights cut, the player HEARS Wren (a page turning in an empty room, a ring of keys that "never sounds" sounding once), catches only edges (a paper-coloured coat, a glasses-gleam, no face), and they're "always already leaving." AUDIO-FIRST obscured intro. The ??? slot does NOT unlock.
- Sam is the diegetic INDEXER (he pins the evidence, the "un-synced hand"), and explicitly says he CAN'T open the door — "I index the building, I don't run it... you'll find them when two things are true that aren't yet. Ask the building, not me." (Deliberately NO "come back and try again" carrot — anti-retention.) Chaotic option: player calls into the dark, gets no face but a green-ruled card left on the threshold with their own forgotten handwriting on it (the keeper "answers in the only language they use").

Critique BOTH, concretely:
1. d45 — does the AREA-arrival carry real weight, or is "a dark room turns on" a thin pretext? Does recontextualizing a 100-item COLLECTIBLE GRIND as "tonight's menu / proof a stranger can be kept" redeem the grind or retro-justify a chore? Is Mei's "you're the experiment that worked" warmth earned or saccharine for a character whose whole signature is flat/anti-sentiment?
2. d45 — the Kenji blank-row dangle: intriguing hook or frustrating withhold-for-withhold's-sake? Does planting a question you can't resolve for ~7 days respect the player or tease them?
3. d29 — is an audio-first OBSCURED character intro satisfying on a phone (text + maybe a sound), or does "you hear but never see" read as the game dodging an art asset? Is the "always already leaving" ghost-at-the-edges device fresh or a cliché?
4. d29 — does Sam-can't-open-the-door / "ask the building" successfully AVOID the retention-hook trap (a dangled mystery to pull players back), or does a gated mystery character INHERENTLY function as a retention carrot no matter how it's framed?
5. Biggest risk across the batch + the single highest-leverage fix. What did each beat MISS?
Rank the top 3 fixes for the batch.`;
console.log(await gemini(P));
