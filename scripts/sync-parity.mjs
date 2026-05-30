#!/usr/bin/env node
// MY LIFE IS AN RPG — website⇄game parity exporter
// ─────────────────────────────────────────────────────────────────────
//
// DIRECTION OF TRUTH:  game  ──►  website   (NEVER the reverse)
//
//   The Flutter app is the single source of truth. This script READS the
//   app's own source + asset files and EMITS a generated JSON the website
//   consumes. The app imports NOTHING from the website and is not aware
//   this script exists — reading app files is not influencing the app.
//
//   This file lives in the WEBSITE repo on purpose: the app repo gets
//   nothing added (no script, no dep, no config). It reaches UP into the
//   parent app tree at ../lib and ../assets, which exist locally where
//   both repos are checked out together. It is NOT run on Vercel — the
//   generated JSON is committed, and Vercel just reads the committed file.
//
// MODES:
//   node scripts/sync-parity.mjs           # regenerate the JSON (sync)
//   node scripts/sync-parity.mjs --check    # diff vs committed; exit 1 on drift
//
// COVERS (the FACTS + TOKENS, never the marketing prose):
//   1. UI tokens       ← ../lib/theme.dart      GameColors
//   2. REL tiers       ← ../lib/game_state.dart  kRelTierThresholds/Names
//   3. Item rarities   ← ../lib/payloads/daily_story.dart  ItemRarity
//   4. Vibe bands      ← ../lib/elseworld_vibes.dart
//   5. Squad facts     ← ../lib/characters.dart  (id/name/class/specialty/help)
//   6. Phone-realm map ← ../assets/realm-maps/phone-realm.txt
//   7. Sim scenario    ← ../assets/payloads/run-005/onboarding_hana_d1.json
//
// Extraction is text/regex over stable `const` declarations — no Flutter
// runtime needed (importing lib/theme.dart would drag in the engine).

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// website/scripts → website → parent app repo
const WEBSITE = resolve(__dirname, "..");
const APP = resolve(WEBSITE, "..");
const OUT = join(WEBSITE, "app", "lib", "parity.generated.json");

// The onboarding payload the simulator mirrors. Bump this when the
// canonical run regens (run-003 → run-005 → …). One line to change.
const RUN_DIR = "run-005";
const ONBOARDING_PAYLOAD = "onboarding_hana_d1.json";

const isCheck = process.argv.includes("--check");

function read(rel) {
  const p = join(APP, rel);
  if (!existsSync(p)) {
    fail(`source file missing: ${rel}\n  (run from the parent app checkout — this script reads ../lib and ../assets)`);
  }
  return readFileSync(p, "utf8");
}

function fail(msg) {
  console.error(`\n  ✗ parity: ${msg}\n`);
  process.exit(2);
}

// ── 1. UI tokens — GameColors hex values ─────────────────────────────
function extractColors() {
  const src = read("lib/theme.dart");
  const block = src.match(/class GameColors\s*\{([\s\S]*?)\}/);
  if (!block) fail("could not find GameColors in lib/theme.dart");
  const out = {};
  // static const paper = Color(0xFFF2EBDD);
  const re = /static const (\w+)\s*=\s*Color\(0x([0-9A-Fa-f]{8})\)/g;
  let m;
  while ((m = re.exec(block[1])) !== null) {
    const argb = m[2].toUpperCase();
    // Dart is 0xAARRGGBB; web wants #RRGGBB (alpha always FF here).
    out[m[1]] = "#" + argb.slice(2);
  }
  if (Object.keys(out).length === 0) fail("extracted zero colors from GameColors");
  return out;
}

// ── 2. REL tiers — thresholds + names ────────────────────────────────
function extractRelTiers() {
  const src = read("lib/game_state.dart");
  const thr = src.match(/kRelTierThresholds\s*=\s*\[([\s\S]*?)\]/);
  const nam = src.match(/kRelTierNames\s*=\s*\[([\s\S]*?)\]/);
  if (!thr || !nam) fail("could not find kRelTierThresholds / kRelTierNames in lib/game_state.dart");
  // Strip line comments first — the threshold rows carry "// < 15 -> …"
  // annotations whose numbers would otherwise be miscounted as values.
  const thrBody = thr[1].replace(/\/\/[^\n]*/g, "");
  const thresholds = [...thrBody.matchAll(/(\d+)/g)].map((x) => parseInt(x[1], 10));
  const names = [...nam[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  if (names.length !== thresholds.length + 1) {
    fail(`REL tier shape mismatch: ${names.length} names vs ${thresholds.length} thresholds (expected names = thresholds + 1)`);
  }
  return { thresholds, names };
}

// ── 3. Item rarities — enum order ────────────────────────────────────
function extractItemRarities() {
  const src = read("lib/payloads/daily_story.dart");
  const block = src.match(/enum ItemRarity\s*\{([\s\S]*?)\}/);
  if (!block) fail("could not find enum ItemRarity in lib/payloads/daily_story.dart");
  // strip line comments, then take bare identifiers before commas
  const body = block[1].replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const rarities = [...body.matchAll(/\b([a-z]\w*)\b/g)].map((x) => x[1]);
  if (rarities.length === 0) fail("extracted zero ItemRarity values");
  return rarities;
}

// ── 4. Vibe bands — id + label ───────────────────────────────────────
function extractVibeBands() {
  const src = read("lib/elseworld_vibes.dart");
  // Each ElseworldVibe has `id: '<band>',` immediately followed by
  // `label: '<label>',`. The character sub-objects have `id: 'enc-…'`
  // followed by `name:` (never `label:`), and the choice options have
  // `label:` with no preceding `id:` — so anchoring on the id→label
  // adjacency selects exactly the six picker-level vibe bands.
  const re = /\bid:\s*'([a-z0-9-]+)',\s*\n\s*label:\s*'([^']+)'/g;
  const bands = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[1].startsWith("enc-")) continue;
    bands.push({ id: m[1], label: m[2] });
  }
  if (bands.length === 0) fail("extracted zero vibe bands");
  return bands;
}

// ── 5. Squad facts — canonical character sheets ──────────────────────
// Sam lives in lib/sam.dart; Hana/Kenji/Mei in lib/characters.dart.
// Fields may use single OR double quotes and Dart adjacent-string
// concatenation across lines (e.g. "first part " 'second part').
function extractSquad() {
  const src = read("lib/sam.dart") + "\n" + read("lib/characters.dart");
  const blocks = [...src.matchAll(/Character\(([\s\S]*?)\n\);/g)].map((x) => x[1]);
  const joinsDay = deriveJoinDays();
  const squad = [];
  for (const b of blocks) {
    if (!/isCanonical:\s*true/.test(b)) continue;
    const id = dartField(b, "id");
    squad.push({
      id,
      name: dartField(b, "name"),
      classLabel: dartField(b, "classLabel"),
      specialty: dartField(b, "specialty"),
      helpSummary: dartField(b, "helpSummary"),
      archetype: dartField(b, "archetype"),
      personaDescription: dartField(b, "personaDescription"),
      quirk: dartField(b, "quirk"),
      starterPrompts: dartStringList(b, "starterPrompts"),
      gender: dartField(b, "gender"),
      // Sam is the Day-0 onboarder (not introduced via a payload); the
      // rest derive from the run payloads. Default 0 for anyone absent.
      joinsDay: id === "sam" ? 0 : (joinsDay[id] ?? null),
    });
  }
  if (squad.length === 0) fail("extracted zero canonical characters");
  return squad;
}

// Derive each character's join day from the run payloads: the minimum
// globalDayIndex at which they appear as the focal `characterId` OR are
// named in `introducesCharacter`. Game-sourced — no hardcoded calendar.
function deriveJoinDays() {
  const dir = join(APP, "assets", "payloads", RUN_DIR);
  const out = {};
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return out;
  }
  for (const f of files) {
    // base payloads only — skip .b1./.gemini. model-variant captures
    if (!f.endsWith(".json") || f.includes(".b1.") || f.includes(".gemini.")) continue;
    let p;
    try {
      p = JSON.parse(readFileSync(join(dir, f), "utf8"));
    } catch {
      continue;
    }
    const day = p.globalDayIndex;
    if (typeof day !== "number") continue;
    const mark = (cid) => {
      if (!cid) return;
      if (out[cid] === undefined || day < out[cid]) out[cid] = day;
    };
    mark(p.characterId);
    if (p.introducesCharacter && p.introducesCharacter.id) {
      mark(p.introducesCharacter.id);
    }
  }
  return out;
}

// ── 5b. Elseworld sample encounter characters ────────────────────────
// Each ElseworldVibe carries a hand-authored EncounterSample — a full
// character sheet + cold-open + first voice line + 3 options. These
// become the Bestiary/Elseworld wiki pages. One sample per band.
function extractElseworldSamples() {
  const src = read("lib/elseworld_vibes.dart");
  // Split into per-vibe chunks at the `const _xxx = ElseworldVibe(`
  // boundaries so each chunk holds exactly one character + sample.
  const parts = src.split(/const\s+_\w+\s*=\s*ElseworldVibe\(/).slice(1);
  const samples = [];
  for (const chunk of parts) {
    const bandId = (chunk.match(/^\s*id:\s*'([a-z0-9-]+)'/m) || [])[1] || null;
    const encId = (chunk.match(/id:\s*'(enc-[^']+)'/) || [])[1] || null;
    const opt = (name) => {
      const m = chunk.match(
        new RegExp(`${name}:\\s*\\(label:\\s*'((?:[^'\\\\]|\\\\.)*)',\\s*roleHint:\\s*'([^']+)'\\)`),
      );
      return m ? { label: m[1].replace(/\\'/g, "'"), roleHint: m[2] } : null;
    };
    samples.push({
      bandId,
      encounterId: encId,
      name: dartField(chunk, "name"),
      classLabel: dartField(chunk, "classLabel"),
      archetype: dartField(chunk, "archetype"),
      personaDescription: dartField(chunk, "personaDescription"),
      quirk: dartField(chunk, "quirk"),
      specialty: dartField(chunk, "specialty"),
      helpSummary: dartField(chunk, "helpSummary"),
      gender: dartField(chunk, "gender"),
      coldOpen: dartField(chunk, "coldOpen"),
      firstVoice: dartField(chunk, "firstVoice"),
      engageOption: opt("engageOption"),
      observeOption: opt("observeOption"),
      declineOption: opt("declineOption"),
    });
  }
  if (samples.length === 0) fail("extracted zero elseworld samples");
  return samples;
}

// Extract a string-valued Dart field, quote-agnostic, joining adjacent
// concatenated literals. Returns null if the field is absent.
function dartField(block, name) {
  // one-or-more adjacent string literals (either quote), then a comma
  const re = new RegExp(
    `${name}:\\s*((?:\\s*(?:'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"))+)\\s*,`,
    "m",
  );
  const m = block.match(re);
  if (!m) return null;
  const literals = [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)];
  return literals
    .map((x) => (x[1] ?? x[2]))
    .join("")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"');
}

// Extract a Dart list-of-strings field: `name: [ 'a', 'b', 'c' ]`.
// Returns [] if absent. Single-element strings only (no adjacent-concat
// inside list items, which the source doesn't use for these fields).
function dartStringList(block, name) {
  const m = block.match(new RegExp(`${name}:\\s*\\[([\\s\\S]*?)\\]`, "m"));
  if (!m) return [];
  return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) =>
    x[1].replace(/\\'/g, "'"),
  );
}

// ── 6. Phone-realm map — the courtyard box (frontmatter + legend stripped)
function extractPhoneRealmMap() {
  const raw = read("assets/realm-maps/phone-realm.txt");
  const lines = raw.split("\n");
  // Drop YAML frontmatter (--- … ---) if present.
  let start = 0;
  if (lines[0].trim() === "---") {
    const end = lines.indexOf("---", 1);
    if (end > 0) start = end + 1;
  }
  const body = lines.slice(start);
  // Take the FIRST box: first line beginning with ╔ to its matching ╚.
  const open = body.findIndex((l) => l.startsWith("╔"));
  if (open < 0) fail("no ╔ box found in phone-realm.txt");
  const close = body.findIndex((l, i) => i > open && l.startsWith("╚"));
  if (close < 0) fail("no closing ╚ found in phone-realm.txt courtyard box");
  return body.slice(open, close + 1).join("\n");
}

// ── 7. Sim scenario — first 3 events of the onboarding payload ───────
function extractSimScenario() {
  const raw = read(join("assets", "payloads", RUN_DIR, ONBOARDING_PAYLOAD));
  const payload = JSON.parse(raw);
  const events = (payload.events ?? []).slice(0, 3).map((ev) => ({
    id: ev.id,
    scenario: ev.scenario,
    choices: (ev.choices ?? []).map((c) => ({
      id: c.id,
      role: c.role,
      label: c.label,
      delta: c.delta ?? {},
      reactionText: c.reactionText ?? "",
      reactionTextOnCritFail: c.reactionTextOnCritFail ?? null,
      diceRoll: c.diceRoll ?? null,
      itemDrop: c.itemDrop ?? null,
    })),
  }));
  if (events.length === 0) fail(`no events in ${RUN_DIR}/${ONBOARDING_PAYLOAD}`);
  return {
    source: `${RUN_DIR}/${ONBOARDING_PAYLOAD}`,
    characterId: payload.characterId ?? null,
    events,
  };
}

// ── Assemble ─────────────────────────────────────────────────────────
function build() {
  return {
    // Provenance banner — makes it obvious in the committed file that
    // hand-editing is pointless (the next sync overwrites it).
    _generated: "DO NOT EDIT BY HAND — produced by website/scripts/sync-parity.mjs",
    _sourceOfTruth: "the Flutter app (../lib, ../assets). Run sync-parity after game changes.",
    tokens: extractColors(),
    relTiers: extractRelTiers(),
    itemRarities: extractItemRarities(),
    vibeBands: extractVibeBands(),
    squad: extractSquad(),
    elseworldSamples: extractElseworldSamples(),
    phoneRealmMap: extractPhoneRealmMap(),
    simScenario: extractSimScenario(),
  };
}

// Stable stringify (sorted keys are NOT used — source order is meaningful
// for tiers/bands/events, so we keep insertion order and 2-space indent).
function serialize(obj) {
  return JSON.stringify(obj, null, 2) + "\n";
}

// ── globals.css cross-check (warn-only) ──────────────────────────────
// The website palette is hand-authored in app/globals.css for Tailwind.
// We can't import JSON into CSS, so instead we VERIFY the CSS matches the
// game tokens and warn loudly on drift. Maps CSS var names → Dart names.
const CSS_VAR_TO_TOKEN = {
  "--paper": "paper",
  "--paper-shade": "paperShade",
  "--ink": "ink",
  "--ink-soft": "inkSoft",
  "--forest": "forest",
  "--forest-dim": "forestDim",
  "--spot-red": "spotRed",
  "--margin-ink": "marginInk",
};
function checkCssTokens(tokens) {
  const cssPath = join(WEBSITE, "app", "globals.css");
  if (!existsSync(cssPath)) return [];
  const css = readFileSync(cssPath, "utf8");
  const mismatches = [];
  for (const [cssVar, token] of Object.entries(CSS_VAR_TO_TOKEN)) {
    const m = css.match(new RegExp(`${cssVar}:\\s*(#[0-9A-Fa-f]{6})`));
    if (!m) {
      mismatches.push(`${cssVar}: not found in globals.css`);
      continue;
    }
    const cssHex = m[1].toUpperCase();
    const gameHex = (tokens[token] ?? "").toUpperCase();
    if (cssHex !== gameHex) {
      mismatches.push(`${cssVar}: css=${cssHex} game=${gameHex} (token ${token})`);
    }
  }
  return mismatches;
}

// ── Run ──────────────────────────────────────────────────────────────
const data = build();
const next = serialize(data);
const cssDrift = checkCssTokens(data.tokens);

if (isCheck) {
  const committed = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  let bad = false;
  if (committed !== next) {
    console.error("\n  ✗ parity: parity.generated.json is STALE vs the game.");
    console.error("    Run: node scripts/sync-parity.mjs  (then commit)\n");
    bad = true;
  }
  if (cssDrift.length) {
    console.error("  ✗ parity: globals.css palette drifted from game tokens:");
    for (const d of cssDrift) console.error(`      - ${d}`);
    console.error("");
    bad = true;
  }
  if (bad) process.exit(1);
  console.log("  ✓ parity: website is in sync with the game.");
} else {
  writeFileSync(OUT, next);
  console.log(`  ✓ parity: wrote ${OUT.replace(APP + "/", "")}`);
  console.log(`      tokens=${Object.keys(data.tokens).length}  relTiers=${data.relTiers.names.length}  vibeBands=${data.vibeBands.length}  squad=${data.squad.length}  elseworldSamples=${data.elseworldSamples.length}  simEvents=${data.simScenario.events.length}`);
  if (cssDrift.length) {
    console.warn("\n  ⚠ parity: globals.css palette drifted — fix these by hand:");
    for (const d of cssDrift) console.warn(`      - ${d}`);
    console.warn("");
  }
}
