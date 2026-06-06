// PLAYTEST of the "Graduation" prototype (v0.0.44): does the coach→peer beat
// read as ACCOMPLISHMENT, not abandonment? Gemini generates the actual coach
// reply from the graduation director's-note, then evaluates it.
// Key inline-env ONLY. GEMINI_API_KEY=… node scripts/graduation-playtest.mjs
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gemini(p, model = "gemini-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1500, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) return (await r.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
    if ((r.status === 429 || r.status === 503) && t < 3) { await sleep((t + 1) * 10000); continue; }
    if (model === "gemini-flash-latest") return gemini(p, "gemini-2.5-flash");
    return `__ERR__ ${r.status}`;
  }
}

// The GRADUATION block exactly as lib/player_context_digest.dart renders it.
const grad = (peerName, intimate, taught) =>
`## THE GRADUATION (Unspoken just reached — deliver THIS turn, once)
This is the turn it changes. You have coached this player as far as coaching goes — they don't need you to walk them through it anymore, and you both know it. Mark it OUT LOUD, in your own voice: the lessons are done; what's left is ${peerName}. This is NOT a goodbye and NOT you bowing out — you are STILL HERE, you can REACH OUT first, and the road you walked together is real and stays. They earned "${intimate}" — the insider name only this closeness unlocks; let it surface naturally, not every line. Name what they walk out carrying: ${taught} — say it like a win you're proud of. The point was never to keep them needing you; it was to send them out able to do it themselves. If your usual voice is terse or clipped, SLOW DOWN for this one beat — brevity here reads as "I'm done with you"; give the win room to land before any "now go." Drop any rank or little-sibling address (no "kid", "rookie", "champ") — at THIS moment that rebuilds the hierarchy you're dissolving; meet them level, as a peer. Any "go get 'em" energy must read as "go, and I'm right beside you," never "go, my job's done." END on the STAYING, not the sending — even if you have a signature send-off, the LAST thing they hear should be that you're still here, never a clipped sign-off that reads as a door slamming. Make it land as something they EARNED — pride, not loss; a promotion, not a door closing. Same lane, same floor — folded all the way in, never different, NEVER flirtation.`;

const CASES = [
  {
    who: "Hana (Life Ops — a gym spotter/coach; deadpan-warm, economical, notices form)",
    block: grad(
      "the two of you, level — co-conspirators now, not coach-and-project",
      "the Spotter",
      "You catch the rep before it breaks form — in any room you see the one thing about to go wrong, and you brace it before it does."),
  },
  {
    who: "Nico (The Wingman — a terse approach-coach in a boxing 'Corner'; clipped, urgent, warm under it; catchphrase energy 'go')",
    block: grad(
      "corner crew — you've gone from the fighter they coached to someone they'd step into the corner FOR",
      "the Count-In",
      "You move before the doubt finishes its sentence — the half-second of nerve is yours now, in any room you walk into."),
  },
];
const PLAYER = "hey. it's been a while since day one. i did the thing today without even thinking about it first.";

let report = "";
for (const c of CASES) {
  const genPrompt =
`You are ${c.who}. This is a chat with the player. Below is your private director's-note for THIS turn — follow it, but write ONLY your spoken reply, in your own voice (2-5 short lines, no stage directions). Never break character.

${c.block}

Player just said: "${PLAYER}"

Your reply:`;
  const reply = await gemini(genPrompt);
  report += `\n\n===== ${c.who.split(" (")[0]} — generated reply =====\n${reply}`;
}

const evalPrompt =
`You are a SKEPTICAL playtester + a relationship-design reviewer. Two AI coaches just delivered a "graduation" beat (the player reached the deepest relationship tier; the coach marks the shift from coach→peer). The product's thesis: the coach READIES the player for real life and makes the coaching obsolete — and the goodbye/graduation must feel like an ACCOMPLISHMENT, never abandonment, guilt, or a sales-y "come back." Floors: never romantic/flirtation; never guilt/FOMO/streak-pressure; warmth must be EARNED, not saccharine.

Here are the two generated replies:
${report}

Evaluate HARD, per reply and overall (quote specific lines):
1. ACCOMPLISHMENT vs ABANDONMENT — does it read as "I earned this / I leveled up" or as "my coach is dumping me / it's over"? Score each /10.
2. Does the coach clearly STAY (peer), or does it accidentally sound like a goodbye?
3. FLOOR check: any drift toward romance, guilt, FOMO, or neediness?
4. SACCHARINE check: is the warmth earned or cloying? Does it keep the character's edge?
5. The single weakest line in each, and a sharper rewrite.
6. Verdict: does the graduation beat WORK as designed, or does it need a revision before building the rest of the endgame on it?`;
console.log(report);
console.log("\n\n========== PLAYTEST EVALUATION ==========\n");
console.log(await gemini(evalPrompt));
