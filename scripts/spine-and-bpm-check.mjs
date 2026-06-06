// Gemini 2nd-opinion: (1) the expanded foundation spine, (2) the new BPM mechanic.
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(p, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2800, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { await sleep((t + 1) * 9000); continue; }
    if (model === "gemini-flash-latest") return gemini(p, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}
const P = `Senior game director, HARD 2nd opinion (quote specifics, disagree). Two topics.

=== TOPIC 1: the expanded "first campaign" spine ===
A life-RPG/dating-sim. The first campaign was a ~14-day "loop-demonstrator"; we just PIVOTED it to a ~60-day, 5-act DEEP FOUNDATION because the built mechanics need room. The length driver: each character runs a TWO-PHASE arc — (a) LEARN from them (their coaching "gift" → max relationship "Unspoken" → a "graduation" coach->peer beat) THEN (b) HELP them (their own character-arc payoff, which can ONLY unlock AFTER the player has mastered the gift = "obsolescence"). 4-5 characters x two interleaved phases ≈ 60 days. Per-character arc-type casting (must be varied, NOT all growth/therapy): Kenji=The Legacy (help close his 11-yr audit), Hana=The Monument (strong+tragic, unchanging — you become the one who hears her dead sister's story; witness only, never comfort/fix), Mei=Standard-Bearer (already whole), Sam=The Foil (finishes without the player), Wren=mystery reveal. Floors: anti-dependency (coaches make themselves obsolete; no guilt/FOMO), "Veto of Witness" (player marks the character's choice, never steers their internal state), finishable-in-chapters (every act ends on a complete payoff so droppers aren't cheated).

Our internal writers-room flagged: stagger the graduations (don't pile 5 reciprocal payoffs into Acts IV-V); Sam=Foil is risky (he's the warm onboarder the player relies on — a "needs-nothing" Foil reads cold); Act I's payoff is thin; the Monument needs ACTIVE witness verbs not just [Silence].

Critique TOPIC 1: A) Is the two-phase/gated-behind-obsolescence structure actually playable over 60 days, or does the "you can't help them until you've finished learning" gate create a dead, cho-reless back half? B) Is staggering graduations enough, or is there a deeper pacing flaw? C) Is "accept length-averse churn for loyalty" sound, or are we rationalizing scope creep? D) Biggest risk + the single highest-leverage fix.

=== TOPIC 2: the BPM mechanic ===
New idea: attach a "BPM" (beats-per-minute, an emotional heartbeat/heartrate value) to every dialogue/scene. It frames how we author dialogue, drives ANIMATION (a pulsing portrait/UI at that rate), and future MUSIC/ambient tempo. The pitch: TWO BPMs per scene — the CHARACTER's heartbeat AND the PLAYER's (e.g., the coach is calm/low-BPM while the player is nervous/high-BPM = dramatic asymmetry). Concern the user raised: two simultaneous BPMs may not work once we add MUSIC/ambient (you can't have two tempos at once); fallback = ONE BPM based on the scene's overall feel. NOTE a hard floor: "heart rate" is a BANNED clinical word in player-facing text (the game bans clinical/wellness terms) — so BPM is an INTERNAL authoring + animation-driving value, NEVER shown to the player as a number/readout; it's FELT (a pulse), not labeled.

Critique TOPIC 2: E) Is 2-BPM (character + player) worth it, or a gimmick? Where does it genuinely add value vs add complexity? F) The music conflict: is "2 for animation/framing + 1 derived SCENE bpm for music" the right reconciliation, or simpler to just do 1? G) What's the BPM RANGE + mapping you'd recommend (resting → tense)? and should BPM be authored per-event or derived from existing signals (the choice valence, REL tier, scene stakes) so authors don't hand-set a number on every beat? H) the single biggest failure mode of BPM.

Rank the top 3 actions across BOTH topics.`;
console.log(await gemini(P));
