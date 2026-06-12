// Gemini 2nd-opinion on the FULL four-coach graduation SET (Main Line). Key inline-env ONLY.
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
const P = `Senior narrative director, HARD 2nd opinion (quote specifics, disagree). A 2nd-person faceless-MC life-RPG. The cast are COACHES who make themselves OBSOLETE (anti-dependency moat; secure-attachment, door-open; "grows with you" = the bond deepens AS you outgrow needing them). The ~60-day Main Line ends with the four-coach squad each GRADUATING at Unspoken (full REL). I just authored all four, deliberately giving each a DIFFERENT arc geometry so it's not a formula. Each graduation is a 3-beat bundle: KNOW (an intimate title = the player's word for the coach) · DO (an "inversion deed" — the gift enacted/handed on) · KEEP (a permanent passive + a keepsake) · MUTUAL (they reach out as a peer) · plus "Spatial Decay" (the coach's place on the map changes). A shared floor: the player is a WITNESS to the coach's own ending, never their fixer.

THE FOUR (all keyed off a D36 "Family Meal" where Hana first tells the whole of her dead sister Maya):
1. HANA (Monument) ~D46: she LEAVES. Hands you the spot-red wristband + "the watch" (she watched a gate for years for the sister who didn't come; now you watch it). Her map territory RECEDES (a "Vacated Frame": her bench renders empty-but-warm). You can't comfort her (trying = the fail). Intimate title "the Spotter" = your word for HER.
2. KENJI (Legacy) ~D52: he STAYS; you INHERIT. Slides you the drawer key "to keep, not to borrow," names you keeper-after-him (lineage: a prior keeper -> Kenji -> you). Shows you "Column Eleven," the tender/self column of his ledger he shows no one; your name was already in it. Intimate title "Column Eleven." The quietest beat.
3. MEI (Standard-Bearer) ~D56: she STAYS; you HERALD. Already whole, no change. Hands you the line; mentions flatly she's set you a "second plate" every day whether you came; then watches you feed a hovering stranger in her exact cadence. UNDERSTATED on purpose. Intimate title "the Second Plate."
4. SAM (Foil, the meta GUIDE/narrator) ~D58 (capstone): he FINISHES ALONE; you WITNESS. Shows you the one line he keeps & never syncs; refuses to explain the next area; points at a new door (a Tavern = the first EXPANSION front-door) and DOESN'T walk you through it ("you'd read it yourself 30 seconds in and wonder why i was still talking"). The guide made unnecessary. PROPOSES new canon: intimate title "the First Voice", passive "the Self-Onboard."

Critique the SET, concretely:
A. Do the four geometries (LEAVES / INHERITS / HERALDS / WITNESSES-the-guide-go) actually FEEL distinct in play, or does "another Unspoken graduation" become repetitive by the 3rd-4th — emotional fatigue, diminishing returns? Is four goodbyes too many?
B. PACING: all four land in ~D46–58 (a 12-day window) at the back of a 60-day arc. Is that a moving crescendo or a "goodbye parade" that exhausts? Should they be more spread out, or is clustering them right?
C. The shared "you WITNESS, never fix" floor across all four — does the player end up PASSIVE in their own coaches' endings? The "inversion deed" gives some agency; is it enough, or does the player just watch four people graduate AT them?
D. SAM as capstone pointing at the Tavern/expansion door: earned emotional close, or does ending the Main Line by gesturing at the next purchasable content read as sequel-bait that undercuts the goodbye?
E. Which of the four is WEAKEST / doesn't earn its geometry? And is Sam's proposed new canon ("the First Voice" / "the Self-Onboard") right, or off?
F. What did the SET MISS — a graduation shape, an emotional note, or a structural beat that four endings need but these don't have?
Rank the top 3 fixes.`;
console.log(await gemini(P));
