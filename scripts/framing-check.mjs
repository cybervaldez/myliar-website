// Gemini 2nd-opinion on the FRAMING layer. Key inline-env ONLY.
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
const P = `Senior narrative/cinematography designer, HARD 2nd opinion (quote specifics, disagree). A 2nd-person, faceless-MC life-RPG/dating-sim (text-first; the cast are coaches). We're adding a FRAMING layer — cinematic shot grammar as subtext — to both the prose AND the asset-facing art briefs (CGs).

The design:
1. Grammar: low angle = power/looming, high angle = small/vulnerable, eye-level = peer; wide = isolation, close = intimacy; foreground barrier = a wall between you; negative space = loneliness; over-the-shoulder = with them.
2. FLOOR 1 — the camera IS the MC's EYELINE (faceless MC): write the LOOK not the lens ("you tilt your head up to meet her eyes", never "the shot tilts up"). Each framing has a 1:1 prose translation — that's how a text game does cinematography. One authored eyeline-line serves BOTH the prose AND the CG imageBrief.
3. FLOOR 2 — framing carries the subtext the dialogue does NOT; shows the SPACE, never the player's named emotion (you describe the empty bench; the player supplies the loneliness).
4. SYSTEMIC: framing TRACKS the relationship — derived from state like our BPM. Early (low REL) = coach is the expert = low angle (you look up). Graduation/Unspoken = eye-level (the peer transition, SHOWN). The "Monument" character type towers (low angle always). The "Foil" type is framed leaving (wide, their back). Tense beat (high BPM) pushes close+canted. Author overrides per beat.

Critique, concretely:
A. Does framing genuinely WORK in 2nd-person prose, or will "you look up at her / you look down at her" get repetitive and mechanical fast? How to keep it from becoming a tic? Where's the line between evocative and formulaic?
B. The systemic claim — framing DERIVED from REL/arc/BPM (low-angle early → eye-level at graduation). Sound and elegant, or over-determined/gimmicky (every early scene literally has the player looking up)? Should it be derived at all, or purely authored?
C. The "one authored line → prose + CG brief" claim: does an eyeline-in-prose line REALLY translate cleanly to an art-gen brief, or are these two different crafts we're conflating?
D. Biggest failure mode of a framing layer in a TEXT game specifically + the single highest-leverage rule to add.
E. What did we MISS — a framing technique or principle that matters more for our format than the film grammar we listed?
Rank the top 3 fixes.`;
console.log(await gemini(P));
