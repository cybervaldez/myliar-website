// Gemini 2nd-opinion on CG trigger-moments + multiple gallery locations. Key inline-env ONLY.
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
const P = `Senior game-design / narrative director, HARD 2nd opinion (quote specifics, disagree). A 2nd-person faceless-MC life-RPG/dating-sim; the cast are COACHES who make themselves obsolete (anti-dependency is the moat — no FOMO, no streaks, no variable-reward gacha; every reveal is deterministic). We use VN-style "event CGs" (full illustrations of key moments, MC drawn face-obscured). Existing floor: a CG is a SUBSET of achievements (most trophies get NO CG) because CG=every-trophy gamifies intimacy + warps pacing. We have a framing layer (camera angle = power dynamic: low REL = distance/establishing, graduation = eye-level).

The question: WHICH mechanics/moments should earn a CG, and WHERE are CGs re-viewed (we want MULTIPLE gallery locations, each with a distinct job, not one monolithic gallery).

PROPOSAL:
1. CG TRIGGER TAXONOMY = relationship "firsts & lasts", NOT a trophy class. Per character: (a) INTRODUCTION CG — the establishing shot, framed as distance/formal (one, at first meeting); (b) ONE optional MID-ARC TURN CG — the beat the bond visibly changes (capped at 1 so it stays a peak); (c) GRADUATION/UNSPOKEN CG — the eye-level peer payoff (the reward-stack climax). Plus per campaign: one ENDING CG. So ~2-3 CGs per character, bounded. NOT: ordinary tier-ups, item drops, common achievements, daily beats.
2. The CG is the REVEAL CEREMONY (a 3-phase unlock animation) that plays AFTER the moment is deterministically earned — the curtain rising on the reward/title, NOT a suspense-gate before a random pull.
3. MULTIPLE GALLERY LOCATIONS, each a different question: (a) CHARACTER SHEET = "their album" (that coach's CGs in arc order — who they are to me); (b) MEMORY ALBUM / trophy wall = "the run's spine" (all CGs chronological — what happened this run; ties to New Game+); (c) THE CARD = "the outward face" (any CG → shareable card); (d) the INTRO moment + roster silhouette = "the front door" (locked characters show an obscured silhouette to meet). Same asset surfaces in multiple places, each with a distinct job.
4. Locked CGs = calm silhouettes (using the framing establishing-composition, obscured), never nagging "come back for your CG" carrots.

Critique, concretely:
A. Is "firsts & lasts" the right CG cadence, or does ~2-3/character feel too sparse (no payoff between intro and graduation over a ~30-60 day arc) OR still too many? What's the actual right count + spacing?
B. The "CG as reveal ceremony before the reward" — does that stay clear of the gacha line given we're deterministic, or does ANY anticipation animation risk the slot-machine grammar we refuse?
C. Multiple gallery locations: genuinely useful (distinct jobs) or fragmented/confusing (player can't find a CG they remember)? Which of the 4 locations is weakest / should be cut?
D. Biggest failure mode of tying CG unlocks to relationship milestones in a COACH game specifically (vs a romance VN), + the single highest-leverage rule to add.
E. What did we MISS — a trigger-moment or a gallery location that matters more than what we listed?
Rank the top 3 fixes.`;
console.log(await gemini(P));
