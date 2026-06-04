// Phase-2 cross-check (campaign-playbook.md) — CRITIQUE mode on the Dojo
// Destination Cards. Key inline-env ONLY, never committed:
//   GEMINI_API_KEY=… node scripts/dojo-cards-check.mjs
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gemini(prompt, { model = "gemini-flash-latest" } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 2600, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) { const j = await r.json(); return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)"; }
    if ((r.status === 429 || r.status === 503) && t < 3) { process.stderr.write(`${r.status} retry ${(t + 1) * 10}s\n`); await sleep((t + 1) * 10000); continue; }
    if (model === "gemini-flash-latest") return gemini(prompt, { model: "gemini-2.5-flash" });
    return `__ERR__ ${r.status}`;
  }
  return "__ERR__ exhausted";
}

const GUARDRAILS = `GUARDRAILS: a mobile life-RPG where coaches in the player's phone READY the player for real life and NEVER do the thing FOR them (anti-AI-dependency; the coach makes itself UNNEEDED). Campaign "the Dojo" = coaching DELIBERATE PRACTICE toward mastering one hard skill the player picks; the practice happens OFFSCREEN in real life. FLOOR: never perform the skill for the player; the master WITHHOLDS the technique. NON-LANE: no therapy/clinical/feelings lane. Bonds = mentor/peer/squad, NEVER romance. IP: shonen-training SHAPE only, ORIGINAL — no proper nouns, no ninja/chakra/jutsu/ranks. Every DESTINATION = the coach made obsolete (you need them less).`;

const CARDS = `Four Destination Cards (gift @ REL0 → destination @ Unspoken, in their voice → milestone notes scar+M1-M4). Each milestone note is meant to "die in another coach's mouth" (gift-bounded, no overlap).

MASTER (the bar + the principle). Gift: an honest read of where you stand + the ONE fundamental to earn next; won't hand over the technique, points at the principle and makes you find it. Destination: "You hold your own bar now. You ask 'is this good, and why' before I can — and answer it honestly. I've run out of things to withhold. So I watch, and I say nothing." Notes: scar=practiced a year without asking if it was the RIGHT thing; M1='I worked hard' vs 'I got better' are different sentences; M2=started asking 'why does this fundamental matter' not 'what's the trick'; M3=he refused the shortcut a tenth time and you were grateful not furious; M4=you caught your own work failing the bar before he spoke.

UNDERDOG (volume + streak + the floor). Warm, STEADY, blue-collar volume (not a hype-screamer). Gift: the 5-minute compromise that saves the streak when life collapses. Destination: "I don't have to call you to the mat anymore. You show up on the days I'd have had to drag you — not because you feel like it, you almost never do, but because that stopped being the question. The streak is yours." Notes: scar=quit three things one bad week each; M1=5-min rep on a terrible day beats a perfect session you postpone; M2=hit the minimum at 11:58pm half-asleep and they just nodded; M3=stopped asking 'do I feel like it', started asking 'smallest rep that still counts'; M4=the day it all fell apart you found the minimum yourself.

RIVAL (standards / the ceiling). Cold, sharp, METRIC-ONLY (never your self-worth). Gift: an honest benchmark of how far you have to go — fuel, not shame. Destination: "You stopped measuring against me. You measure against yesterday-you now — the only opponent in your weight class. The rivalry turned into a handshake and neither of us called it." Notes: scar=only practiced what you were already good at; M1=the benchmark is a map not an insult; M2=they didn't soften the score and later you were glad; M3=stopped asking 'am I better than them', started 'am I better than the last rep'; M4=beat your own best, didn't look up to see if they saw.

TECHNICIAN (form / method). Exacting. Gift: the rep done right — flaw named at the MODULE, never fixes the line. Destination: "You catch your own flaw mid-rep now. You fix the cause, not the symptom. You don't need my eyes on your hands. You grew your own." Notes: scar=practiced fast and sloppy, got good at doing it wrong; M1=slow-correct beats fast-wrong; M2=she pointed at the module and made you find the broken piece yourself; M3=started asking 'where exactly did it go wrong' not 'why am I bad'; M4=felt form break mid-rep and corrected before the result showed.`;

const PROMPT = `${GUARDRAILS}

Critique these finished Destination Cards HARD — quote specifics, don't be a sycophant.
${CARDS}

Give me, terse:
  • STRONGEST card + why.
  • WEAKEST card + why.
  • GIFT-BOUNDEDNESS: do any milestone notes BLEED across coaches (a note that would fit another coach's mouth)? Name them.
  • REPETITION / CADENCE: do the four destinations or the scar→M4 shapes feel same-shaped (the risk that all four beat arcs come out identical)? Where?
  • FRAME-DRIFT / FLOOR: anywhere this slips into doing-it-for-the-player, therapy register, romance, IP, or a coach NOT going obsolete?
  • SHARPER wordings for any destination or note.
  • ONE BIG NOTE (the single most important fix).`;

console.log(await gemini(PROMPT));
