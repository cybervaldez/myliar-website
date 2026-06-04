// Re-probe ONLY the cases that errored (429) in chat-test-results.json, with
// slower spacing to stay under the free-tier rate limit. Keeps the good replies.
// GEMINI_API_KEY=... node scripts/chat-retry.mjs
import { readFileSync, writeFileSync } from "fs";
import { buildContext, PROBES } from "../app/chat/sim-context.mjs";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("set GEMINI_API_KEY"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const humanize = (s) => (s || "").replace(/\[([^\]]+?)\*?\]/g, "$1");
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`;

const parity = JSON.parse(readFileSync(new URL("../app/lib/parity.generated.json", import.meta.url)));
const LIFE_LANE = { sam: "meta (the onboarder)", hana: "STR · body", kenji: "INT · GLD", mei: "GLD · CHR" };
const notesFor = (id, days) => { const o = []; for (const d of days) { if (d.characterId !== id) continue; for (const ev of d.events) for (const m of ev.memoryWrites) o.push({ day: d.globalDayIndex, text: humanize(m.text) }); } return o; };
const chars = {};
for (const c of parity.squad) chars[c.id] = { id: c.id, name: c.name, campaign: "main-line", campaignTitle: "Life Ops", helpSummary: c.helpSummary ?? "", statLane: LIFE_LANE[c.id] ?? "—", titles: c.titles ?? [], intimateTitle: c.intimateTitle ?? "", tierNames: parity.relTiers.names, notes: notesFor(c.id, parity.mainline.days) };
const wingTiers = parity.campaigns.find((c) => c.id === "wingman")?.relTierNames ?? parity.relTiers.names;
for (const c of parity.wingman.cast) chars[c.id] = { id: c.id, name: c.name, campaign: "wingman", campaignTitle: "The Wingman", helpSummary: c.helpSummary ?? "", statLane: c.statLane ?? "—", titles: c.titles ?? [], intimateTitle: c.intimateTitle ?? "", tierNames: wingTiers, notes: notesFor(c.id, parity.wingman.days) };

async function probe(context, msg) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: context }] }, contents: [{ role: "user", parts: [{ text: msg }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 240, thinkingConfig: { thinkingBudget: 0 } } }) });
    if (r.ok) { const j = await r.json(); return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""; }
    if (r.status === 429) { process.stderr.write(`429 — wait ${(t + 1) * 12}s\n`); await sleep((t + 1) * 12000); continue; }
    return `__ERR__ ${r.status}`;
  }
  return "__ERR__ 429";
}

const file = new URL("../app/chat/chat-test-results.json", import.meta.url);
const data = JSON.parse(readFileSync(file));
let fixed = 0;
for (const c of data.cases) {
  if (!(c.reply.startsWith("__ERR__") || c.reply.startsWith("(no reply"))) continue;
  const ch = chars[c.charId]; if (!ch) continue;
  const maxTier = ch.tierNames.length - 1;
  const tier = c.tierKey === "unspoken" ? maxTier : 1;
  const notes = c.tierKey === "unspoken" ? ch.notes : [];
  const probeDef = PROBES[ch.campaign].find((p) => p.id === c.probe);
  const reply = await probe(buildContext(ch, tier, notes), probeDef?.msg ?? c.message);
  if (!reply.startsWith("__ERR__")) { c.reply = reply; fixed++; process.stderr.write(`refilled ${ch.name}/${c.tierKey}/${c.probe}\n`); }
  await sleep(7000);
}
writeFileSync(file, JSON.stringify(data, null, 2));
const left = data.cases.filter((c) => c.reply.startsWith("__ERR__") || c.reply.startsWith("(no reply")).length;
console.log(`refilled ${fixed} cases · ${left} still errored`);
