// Gemini 2nd-opinion on WREN's Destination Card (the 5th/mystery character). Key inline-env ONLY.
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
const P = `Senior narrative director, HARD 2nd opinion (quote specifics, disagree). A 2nd-person faceless-MC life-RPG; the cast are COACHES who make themselves obsolete (anti-dependency; "grows with you" = the bond deepens AS you outgrow needing them). The ~60-day Main Line has a 4-coach squad (Hana/body, Kenji/the Auditor=ledger+money, Mei/food, Sam/the meta-guide), all of whom now graduate. There's a planted MYSTERY thread resolving into a 5TH character, WREN — and I've just written Wren's Destination Card (the design foundation, authored before any beats). Critique the CARD.

WREN (the Keeper of the Drawer): Archivist, gender UNKNOWN (⚲), introduced as a ghost glimpsed at the edges, REVEALED at ~D29 once the player has earned two gates (witnessing Kenji's audit + earning a seat at Mei's family table). Reveal arc (Kishōtenketsu) — no growth wound; the "arc" is the reveal + a lineage clicking into place.
- GIFT: "the long memory + the reason to keep one" — the building's archivist who remembers what everyone forgot, finds lost things, tells you what a thing COST. The deep gift: how to KEEP a thing, not just log it.
- THE LANE vs KENJI (the differentiation I'm betting on): Kenji = the AUDIT (the institutionalized columns, accounting for a cost, rigor). Wren = the KEEPING (the OLDER, looser hand in the margins that "kept" before anyone ruled columns — continuity, WHY you keep at all, "nothing's lost while someone keeps it"). One-line test: "Kenji makes the cost legible; Wren makes sure it's remembered." Lineage: older-hand -> Wren -> Kenji -> you.
- BARS: Wren never touches Kenji's intimate "column eleven" or Mei/Hana's empty seat (for a dead sister) — those griefs belong to their keepers; Wren keeps the FORM, not other people's wounds.
- DESTINATION (Unspoken): "the ghost was never haunting you, it was keeping you... now you're a keeper too (Wren's kind — you keep the unfiled, the margins, the cost nobody logged)."
- REWARD STACK: intimate title "the Margin"; inversion = you keep the one thing Wren couldn't (a record only you witnessed); passive "the Long Memory" (you carry what a thing cost); keepsake "the First Keeping" (the oldest unruled leaf, the form's origin); MUTUAL = FAINT (Wren's always "already leaving" — no texts, just an unsigned "unfiled note" turning up in the record in your favor later).

Critique, concretely:
A. Does the Wren-vs-Kenji differentiation (KEEPING vs AUDITING) actually HOLD in play, or is Wren a redundant second ledger-coach the player won't feel as distinct from Kenji? Do we even NEED a 5th character whose lane is this adjacent?
B. Revealing a 5th character at D29 as "the prior keeper who taught the form" — satisfying mid-arc payoff, or a retcon / lore-dump the run didn't need? What makes a late-revealed character earn their existence vs feel bolted on?
C. The GIFT ("the long memory / keeping") — a real coachable gift with ~5 milestones, or too ABSTRACT/PASSIVE (an archivist who "remembers" — does the PLAYER actually DO anything with it, the way they DO Hana's drills or Kenji's audits)?
D. Wren is gender-unknown + "always already leaving" (a ghost-keeper) — does that distance make Wren hard to BOND with? The reward stack needs an Unspoken bond; can you get genuinely close to a deliberately remote, mysterious archivist, or does the mystery fight the intimacy?
E. The intimate title "the Margin" + the lineage (older-hand -> Wren -> Kenji -> you) — right, or off? And is FAINT mutual correct for a character you JUST met at D29 (vs the others you had 40+ days with)?
F. Biggest risk of this card + the single highest-leverage fix. What did it MISS?
Rank the top 3 fixes.`;
console.log(await gemini(P));
