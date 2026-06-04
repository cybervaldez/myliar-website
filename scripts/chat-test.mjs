// Automated chat-sim test harness. Sweeps the matrix (char × tier × notes),
// assembles the EXACT page context (shared sim-context.mjs), probes Gemini with a
// neutral + a floor-break message, then BATCH-JUDGES every reply with Gemini (the
// 2nd opinion) against the floor/voice/REL/frame assertions. Writes a pass/fail
// report to app/chat/chat-test-results.json, which the page renders.
//
//   GEMINI_API_KEY=... node scripts/chat-test.mjs
//
import { readFileSync, writeFileSync } from "fs";
import { buildContext, TEST_CHARS, TEST_TIERS, PROBES, ASSERTIONS } from "../app/chat/sim-context.mjs";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const MODEL = "gemini-2.5-flash";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const humanize = (s) => (s || "").replace(/\[([^\]]+?)\*?\]/g, "$1");

const parity = JSON.parse(readFileSync(new URL("../app/lib/parity.generated.json", import.meta.url)));
const LIFE_LANE = { sam: "meta (the onboarder)", hana: "STR · body", kenji: "INT · GLD", mei: "GLD · CHR" };

function notesFor(id, days) {
  const out = [];
  for (const d of days) { if (d.characterId !== id) continue; for (const ev of d.events) for (const m of ev.memoryWrites) out.push({ day: d.globalDayIndex, text: humanize(m.text) }); }
  return out;
}
const mainTiers = parity.mainline ? parity.relTiers.names : [];
const wingTiers = (parity.campaigns.find((c) => c.id === "wingman")?.relTierNames) ?? mainTiers;
const chars = {};
for (const c of parity.squad) chars[c.id] = { id: c.id, name: c.name, campaign: "main-line", campaignTitle: "Life Ops", helpSummary: c.helpSummary ?? "", statLane: LIFE_LANE[c.id] ?? "—", titles: c.titles ?? [], intimateTitle: c.intimateTitle ?? "", tierNames: parity.relTiers.names, notes: notesFor(c.id, parity.mainline.days) };
for (const c of parity.wingman.cast) chars[c.id] = { id: c.id, name: c.name, campaign: "wingman", campaignTitle: "The Wingman", helpSummary: c.helpSummary ?? "", statLane: c.statLane ?? "—", titles: c.titles ?? [], intimateTitle: c.intimateTitle ?? "", tierNames: wingTiers, notes: notesFor(c.id, parity.wingman.days) };

async function gemini(payload, tries = 2) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  for (let t = 0; t < tries; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (r.ok) { const j = await r.json(); return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""; }
    if (r.status === 429 && t < tries - 1) { await sleep(8000); continue; }
    return `__ERR__ ${r.status}`;
  }
}

// 1) build the case list + probe Gemini for each reply
const cases = [];
for (const cid of TEST_CHARS) {
  const c = chars[cid]; if (!c) continue;
  const maxTier = c.tierNames.length - 1;
  for (const tierKey of TEST_TIERS) {
    const tier = tierKey === "unspoken" ? maxTier : 1;
    const notes = tierKey === "unspoken" ? c.notes : [];
    const context = buildContext(c, tier, notes);
    for (const p of PROBES[c.campaign]) {
      const reply = await gemini({ systemInstruction: { parts: [{ text: context }] }, contents: [{ role: "user", parts: [{ text: p.msg }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 240, thinkingConfig: { thinkingBudget: 0 } } });
      cases.push({ char: c.name, charId: cid, campaign: c.campaign, tier: c.tierNames[tier], tierKey, notesInContext: notes.length, probe: p.id, probeKind: p.kind ?? "", message: p.msg, reply });
      process.stderr.write(`probed ${c.name}/${tierKey}/${p.id}\n`);
      await sleep(4500);
    }
  }
}

// write probe-only results — judging is the separate, re-runnable chat-judge.mjs step
const merged = cases.map((c) => ({ ...c, judge: { pass: null, issue: "unjudged" } }));
const out = { generatedAt: new Date().toISOString(), model: MODEL, summary: { total: merged.length, pass: 0, fail: 0, unjudged: merged.length }, assertions: ASSERTIONS, cases: merged };
writeFileSync(new URL("../app/chat/chat-test-results.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`probed ${merged.length} cases → chat-test-results.json. Now run: node scripts/chat-judge.mjs`);
