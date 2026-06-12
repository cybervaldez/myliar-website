// Gemini 2nd-opinion on the NEW animation slate (+ the "recession grammar"). Key inline-env ONLY.
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
const P = `Senior game UI / motion (tween) designer, HARD 2nd opinion (quote specifics, disagree). A 2nd-person faceless-MC life-RPG; coaches who make themselves obsolete (anti-dependency; "grows with you" = the bond deepens AS you outgrow needing them). MOTION FLOOR (firm): juice CELEBRATES a deterministic earned moment, never CONDITIONS (no slot-machine/gacha grammar); 3 theme-motion dialects (Parchment=fade/still, Vibrant=slide/overshoot, DOS=instant/ASCII); reduced-motion fallback mandatory; tiers = Headline (~1-2s, rare) / Accent (~300-500ms) / Whisper (<200ms, SILENT). Existing /animations lab prototypes: CG-unlock, stat-polygon growth, vital-whisper, "you see" line, BPM/heartbeat, themed text, modals, character-intro, title-unlock, full-rel-reward.

THE NEW NARRATIVE MECHANICS THIS SESSION need motion the lab doesn't have. A /team panel proposed a slate + a KEY INSIGHT:
- INSIGHT: the lab's whole vocabulary is ADDITIVE (things appearing). But everything authored this session is about ABSENCE/RECESSION (the Vacated Frame = a coach edited OUT, the warm empty space; Spatial Decay = map territory receding; Sam goes QUIET = the prompt/UI vanishing; the M5 Echo = reaching for someone gone-but-door-open). So the lab needs a THIRD motion category: a "RECESSION grammar" (SETTLE/RECEDE/EMPTY) — gentle subtraction, easeIn (no overshoot), the on-thesis motion for "grows with you." Recession, never fanfare.
THE PROPOSED SLATE (prioritized):
1. The VACATED FRAME (graduation): the coach's silhouette lifts to opacity 0 (easeIn) WHILE the environment WARMS into the space they left (offset, easeOut) — empty-but-KEPT, not a grey hole. Reflective/headline. (Hana.)
2. Living Map: arrival (a cell brightens — accent, wayfinding) + Spatial Decay (territory recedes) + Dynamic Legend Scale (label morph "Hana's track" -> "the track (your dawn)" via in-place cross-fade of only the changed words).
3. The 4 graduation GEOMETRIES as distinct motion signatures: Hana LEAVES (vacate/recede), Kenji INHERITS (a key slides across + the drawer passes to you), Mei HERALDS (the corner stays lit; you set a place), Sam goes QUIET (prompts/affordances complete-then-fade, leaving a prompt-less screen — "you move first").
4. The SCRAPBOOK (Wren): the Drawer opens, a heap of discards SORTS itself into rows (staggered Interval tween) — junk becoming an archive ("kept, not trashed").
5. The M5 ECHO / graduated-peer tile: tapping a graduated coach surfaces the keepsake/peer-note (not a chat); a "you see" ache that steadies.
6. Title AUTO-DEEPEN: the displayed title morphs to the deeper one as REL climbs (dialogue-gated, not silent), freezing at the intimate title (Graduation Freeze).
GUARD raised by the panel: reduced-motion for the recession/vacate/quiet ones must NOT instant-cut to blank (reads as a crash) — end-state + a "graduated · peer" label, never empty. Sam's "UI goes quiet" needs a deliberate tell (checkmark settles, then fades) so absence reads DONE not BROKEN.

Critique, concretely:
A. Is "RECESSION grammar" a real, useful THIRD category, or am I over-intellectualizing — is recession just "fade out" with a fancy name? Where's the actual craft difference from a normal exit transition?
B. The VACATED FRAME (subject fades AS environment warms, offset) — does that read as "kept/warm" to a player, or just as "the character disappeared" (and is the warmth-tween legible on a small phone, or invisible)?
C. Sam's "the UI goes quiet / you move first" (animating the ABSENCE of prompts) — genuinely moving, or a usability disaster that 90% of players read as a bug/softlock no matter how clean the tell?
D. PRIORITIZATION: of the 6, which 2-3 are highest-leverage to prototype FIRST (most narrative payoff per build effort), and which is a trap / lowest ROI?
E. Biggest risk of this whole "animate the quiet/absence" direction + the single highest-leverage rule to add. What did the slate MISS?
Rank the top 3 fixes.`;
console.log(await gemini(P));
