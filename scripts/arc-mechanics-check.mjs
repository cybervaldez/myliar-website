// Gemini 2nd-opinion on the campaign-arc x mechanics audit + the convergence model. Key inline-env ONLY.
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
const P = `Senior narrative-systems director, HARD 2nd opinion (quote specifics, disagree). A 2nd-person faceless-MC life-RPG/dating-sim; cast are COACHES who make themselves obsolete (anti-dependency moat — no FOMO/streaks/gacha; deterministic). Two campaigns: MAIN LINE (Life Ops, ~60-day arc, half-authored D1-20 + spine D21-60; HAS a navigable ASCII realm map) and THE WINGMAN (dating, 25 days fully authored, 5 coaches x 5 days, phone-realm-only / NO navigable map by design — the "Corner" is a staging area pointing outward).

We built a big storybuilding stack: BPM (scene tempo, rare pulses), Framing (camera angle = subtext; subject-dominance; depth-of-field via BPM), a CG-moment taxonomy (Meeting/Wall/Pivot/Graduation milestone CGs; a "Relapse Unlock" CG earned only by vulnerability; a "Vacated Frame" = coach edited out of CGs at graduation), the Living Map (Static Horizon not fog; arrival-as-beat; Spatial Decay = coach territory recedes as you graduate), MC-POV "you see"+vitals, character-arc typology, the Full-REL reward stack (KNOW intimate title / DO inversion peer-beat / KEEP passive+keepsake / MUTUAL they-reach-out), character titles, the note-factory (every beat writes a memory note).

AUDIT FINDING: both campaigns are "machinery-rich, convergence-poor" — the shared layer (notes, you-see, titles, typology) is present, but everything built this session (BPM, Framing, CG taxonomy, Living Map, Spatial Decay, Vacated Frame) fires in ZERO authored beats, and the reward stack is data not played. #1 gap: NEITHER campaign has an authored "Graduation Bundle" (Wingman ends AT Unspoken with the payoff beats unauthored; Main Line graduations are spine-only) — so the moat's signature beat is unplayed in the whole product.

THE PROPOSAL (a reframe to make "use the whole stack" achievable without overloading every beat):
1. Mechanics CONVERGE at ~5 signature moments, they are not sprinkled: M0 ordinary beat (light: a note + derived BPM/focal-depth) / M1 the Meeting (intro CG + youSee + vital + title + area arrival + establishing framing) / M2 the Wall (Relapse-Unlock CG + BPM pulse + high-angle framing + vital) / M3 the Pivot (Pivot CG + shared-focus framing + tier-up) / M4 the Graduation Bundle (Graduation CG -> Vacated Frame + Spatial Decay + the FULL reward stack + peer note). A campaign "uses the stack" iff its M1-M4 fire their bundles; M0 stays sparse.
2. Restraint rule: heavy mechanics fire ONLY at M1-M4; most beats are M0 (avoid "everything pulses = nothing pulses").
3. Place-mechanic adapts per campaign: Main Line = navigable map (full Living Map); Wingman = NO map, but the place-principles apply via its 5 contextual location anchors (a coach's stool "empties" at graduation = Spatial Decay in Corner form).
4. Plan: author ONE full M4 bundle as the exemplar; extend Wingman past D25 with playable M4 per coach; author Main Line D21-60 natively M1-M4; then BPM/Framing/title passes over the signature beats.

Critique, concretely:
A. Is the "convergence at 5 signature moments" model RIGHT, or does forcing every milestone CG + reward + framing + BPM into the SAME beat create overstuffed, melodramatic "everything happens at once" tentpoles that exhaust the player? Where's the line between convergence and bloat?
B. The M4 "Graduation Bundle" fires ~8 mechanics in one beat (Graduation CG + Vacated Frame + Spatial Decay + Dynamic Legend + intimate title + inversion + passive + keepsake + mutual + peer note). Is that a satisfying crescendo or an unreadable pile-up? Should it be ONE beat or a short SEQUENCE of beats?
C. The Wingman ends AT Unspoken (D25) with inversion/mutual unauthored. Extend past D25, or fold a compressed M4 into each coach's last day? Which is right for a coach-obsolescence game?
D. Biggest RISK of this whole "make every arc exploit every mechanic" initiative — what's the failure mode that kills the game's feel, and the single highest-leverage rule to prevent it?
E. What did we MISS — a mechanic-interaction or a convergence moment (other than M0-M4) that matters?
Rank the top 3 fixes.`;
console.log(await gemini(P));
