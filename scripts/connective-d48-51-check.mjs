// Gemini SET-LEVEL 2nd-opinion on D48-51 (post-Hana-grad → D52 run-up). Key inline-env ONLY.
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
const P = `Senior narrative director — HARD set-level 2nd opinion on 4 beats (D48-51) in the final stretch of a 60-day arc. 2nd-person faceless-MC life-RPG; coaches who make themselves OBSOLETE (anti-dependency is the core moat — every goodbye is secure-attachment, NEVER guilt/FOMO/streak-shame). Player is a WITNESS not a fixer. Quote specifics, disagree, rank fixes. Context: coach Hana just GRADUATED and LEFT (the "Monument" — she doesn't stay); coach Mei reopened a long-closed kitchen to the public (~D45); the Act IV climax is D52 (Kenji's quietest beat: he turns over the drawer-key for good, names the player keeper-after-him, and opens "Column Eleven" — his private self-audit — for the first time). The beats:

- D48 (Sam, M0, grants nothing): the Vacated Frame settling after Hana left. Sam (the building's indexer) frames what graduation looks like ON THE MAP: her bench recedes + WARMS ("kept, not greyed; graduated, not deleted — different verb"). The ECHO: tap her faded bench -> her left-behind band + note; she's a message away (chat). Sam draws the floor hard: "the bad apps would ping you — 'Hana misses you, come back!' — make you feel you dropped something. You didn't. You outgrew needing her daily, she left BECAUSE you did, the door's open, nobody guilts you through it." Explicitly NO last-seen/streak/counter. The crit-fail catches the player messaging Hana out of OBLIGATION and tells them to "delete the obligation, keep the person."
- D49 (Kenji, the STRAIN, grants nothing): the reopened kitchen is now standing/public, and it STRAINS the squad — Kenji's private column system can't scale to public volume ("un-auditable; I can't keep it the way I keep things"); Mei won't re-close the room she fought for; BOTH are right; the squad is briefly out of sync. The player WITNESSES and is stopped from brokering a tidy fix ("don't broker what you don't yet keep"). Framed as "a LOAD, not a break — not a rupture." Resolves later (D52 re-centers).
- D50 (Wren, M0, grants nothing): the player brings the strain to Wren (the archivist) like a failure to fix; Wren refuses to close it ("I keep things, I don't close them") and hands a LENS: "an unresolved thing isn't a failure, it's an open page; an empty margin is room, not a wound; a kept page finds its finishing line if you don't bin it early. A margin waits." No resolution — a reframe. Wren stays material/dry (no saviour-coding).
- D51 (Kenji, M0 eve, grants nothing): the night before D52 — Kenji sits late with his own ledger, NOT writing, just being sure of a decision he's worked out but won't voice (carrying the strain + the keeper-weight). "A decision this size sets overnight like a stock and gets said clean in the morning. Ask me tomorrow, early, there'll be tea." Hands directly to D52.

Critique the BATCH as a SET:
1. D48 ANTI-DEPENDENCY — does the Vacated Frame / Echo actually achieve secure-attachment, or does Sam EXPLAINING the anti-guilt design (naming "the bad apps would ping you") break the fiction / protest-too-much (the pink-elephant risk again — by naming the manipulative version, do you import it)? Is the floor better SHOWN (no ping exists) than STATED (Sam lectures about pings)?
2. D49 FRICTION-NOT-RUPTURE — does "both coaches are right, it's a load not a break" land as mature tension, or as conflict-avoidant / toothless (a "fight" where nobody's wrong and nothing's at stake has no teeth)? Does the squad-strain have real enough stakes to be a RISE, or is it a safe pseudo-conflict?
3. D50 — is bringing the strain to Wren for a "lens" a satisfying use of the Scrapbook character, or does it make Wren a fortune-cookie dispenser (two Wren "a margin waits"-type wisdoms in 10 days — D41 and D50 — risk a sage-tic)? Is "anxiety with a stapler" a good line or trying-too-hard?
4. D51 — is "Kenji sits being sure of an unspoken decision" evocative eve-restraint, or just a stall that withholds for its own sake (a whole beat of 'something's coming tomorrow' with no content of its own)? Does it give D51 its own reason to exist beyond setting up D52?
5. PACING — D48 (graduation aftermath) + D49 (strain) + D50 (reframe the strain) + D51 (eve) — is there enough VARIETY, or do D49+D50 (both "the strain") + D51 (eve) feel like three days of marking time before D52? Which beat is weakest / cuttable?
6. Biggest risk across the batch + the single highest-leverage fix. Rank the top 3 fixes.`;
console.log(await gemini(P));
