"use client";

// The interactive stepper — URL as the single source of truth, so the URL IS the
// path: /play/[campaign]/[day]?e=<phase>&p=<choices>&seed=<dice>. Every step is a
// router.push; the page derives all state from the URL (share/back/forward = the
// run). The HUD (stat tallies) is computed by REPLAYING the choice path.
//
// Parity with the Flutter app: authoring anchors ([the floor]) are humanized
// (lib/lexicon.dart). Mechanics ported so far: scenario → choices → seeded dice
// rolls on chaotic choices (crit-fail skips deltas, parity with applyChoice) →
// stat deltas (floor at 0) → crit-branched reaction text → success-gated item
// drops → grantsAchievement unlocks → tier-up badge → youSee whisper → vital
// reveals (??? → value) → BPM (deriveBpm port: word-stagger reveal pace + the
// threshold-gated dual heartbeat) → per-character REL → focal tier name →
// memoryWrites ("✎ remembered") → scenario/reaction callback variants (held-flag,
// position-scoped, ↩ marker) → crit-BUFF loop (earned achievements + Unspoken
// passives buff the chaotic crit, position-scoped) → item rarity counters
// (junk-collector @100 mementos) + item statDeltas → theme-gated battle panel
// (outcome = the crit) → closing hook → graduation (VacatedFrame) + the replay HUD.
// The MECHANIC surface is complete; what's left is presentation (CG/framing/
// reduced-motion) + the interactive battle UI (tracked in docs/CONSOLIDATION-LOG.md leftovers).

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CSS, CampaignCtx, CAMPAIGNS, VacatedFrame, Heartbeat } from "../../animations/gallery";
import { humanizeLexicon as humanizeRaw } from "../../wiki/wiki-data";
import { resolveIdentity } from "./identity";
import { supabase } from "../../wiki/supabaseClient";
import type { PlayMeta } from "../campaigns";
import { deriveBpm, bpmShiftFromString, relTierIndex, relFrictionFromTier, type Bpm } from "./bpm";
import { visitorToken } from "./ugc";
import { ChaoticInput, ChaoticOthers } from "./ChaoticLine";

type DataVersion = { runId?: string; contentHash?: string };

// The "you're in good company" headline — belonging, not surveillance (anti-creep
// floor), as a per-campaign genre MOTIF, dry comedy. `others` = distinct players who
// made the same CHOICES so far, minus you (null = unknown/offline → the pioneer line).
// Ratified copy: docs/design/community-discussion.md § Path Cohort. Gemini-vetted.
function cohortHeadline(campaignKey: string, others: number | null): string {
  const corner = campaignKey === "corner";
  if (others === null || others <= 0) {
    // FIRST on this path — a trailblazer who OPENS it, never lonely (owner note).
    return corner
      ? "First one into this corner — the tape starts with you."
      : "First down this exact path. The trail starts with you.";
  }
  if (others === 1) {
    return corner
      ? "One other threw this exact combo. You'd know each other across the gym."
      : "One other life ran exactly this way. Statistically, that's a club.";
  }
  return corner
    ? `${others} others worked the same corner, same combos. The gym's seen your kind.`
    : `${others} others made the exact same calls you did. The odds remain unbothered.`;
}

// v0.0.42 — a held flag (set by a past selection) swaps the reaction text.
type ReactionVariant = { unlockIf?: string[]; reactionText?: string; reactionTextOnCritFail?: string | null };
// v0.0.33 — battle framing for a chaotic choice (theme-gated; outcome IS the crit).
type BattleSpec = { hero?: string; enemy?: string; enemyHp?: number; heroHp?: number; intro?: string };
type Choice = {
  id: string; role?: string; label: string; delta?: Record<string, number>;
  critFailDelta?: Record<string, number>; // the brave-loss consolation — applied ONLY on chaotic crit-fail (parity: applyChoice)
  diceRoll?: { critChance?: number }; reactionText?: string; reactionTextOnCritFail?: string;
  itemDrop?: { kind?: string; name?: string; description?: string; grantsAchievement?: string | null; statDeltas?: Record<string, number> };
  grantsAchievement?: string; reactionVariants?: ReactionVariant[];
  battle?: BattleSpec | null;
  allowPlayerInput?: boolean | null; lineOptions?: string[] | null; // v0.0.46 Smart Chaotic
  scriptedLine?: string | null; // the ACTUAL default line for the input box (NOT the label)
};

// Smart Chaotic (docs/design/community-discussion.md § SMART CHAOTIC, Gemini-vetted):
// the player-line input is SELECTIVE. Opt-in via allowPlayerInput/lineOptions; default
// scripted. A HARD OVERRIDE suppresses it on a high-value payload (legendary item /
// tier-up / battle / low-odds trap) even if opted-in. When un-authored (flag null), an
// interim heuristic shows it unless the beat is high-value.
function chaoticInputEnabled(c: Choice, isTierUpEvent: boolean): boolean {
  if (c.role !== "chaotic") return false;
  const highValue =
    c.itemDrop?.kind === "legendary" || isTierUpEvent || !!c.battle ||
    ((c.diceRoll?.critChance ?? 1) < 0.15); // a low-odds "trap" — don't gate a likely flop
  if (highValue) return false;
  if (c.lineOptions && c.lineOptions.length > 0) return true;
  if (c.allowPlayerInput === true) return true;
  return false; // OPT-IN default — un-authored chaotic stays scripted (no repetition).
  // (Cadence is curated by authoring allowPlayerInput on ~1-2 beats/arc — the /goal.)
}
type MemoryWrite = { text?: string; emotion?: string | null };
type ScenarioVariant = { unlockIf?: string[]; scenario?: string };
type Ev = {
  id: string; scenario?: string; choices?: Choice[];
  youSee?: string; revealsVitals?: string[]; // v0.0.45 animation fields
  characterExposed?: boolean; bpmShift?: string; // v0.0.46 BPM inputs
  memoryWrites?: MemoryWrite[]; // the note(s) the day writes to the coach's memory
  scenarioVariants?: ScenarioVariant[]; // v0.0.42 callback — held flag swaps the scenario
};
export type PlayDay = {
  episodeTitle?: string; characterId?: string; globalDayIndex?: number;
  closingHook?: string; tierUpReveal?: unknown; events?: Ev[];
  nextDayStart?: { label?: string; recap?: string } | null; // this day's recap + next START label
};
export type VitalMap = Record<string, { label: string; value: string }>;

type Decision = { day: number; ei: number; cid: string };

const ROLE_TINT: Record<string, string> = {
  passive: "var(--forest)", logical: "var(--ink-soft)", chaotic: "var(--spot-red)",
};

function parsePath(p: string): Decision[] {
  if (!p) return [];
  return p.split("~").map((s) => {
    const [d, e, c] = s.split("-");
    return { day: Number(d), ei: Number(e), cid: c };
  }).filter((d) => Number.isFinite(d.day) && Number.isFinite(d.ei) && !!d.cid);
}
const serializePath = (ds: Decision[]) => ds.map((d) => `${d.day}-${d.ei}-${d.cid}`).join("~");

function deltaText(delta: Record<string, number> | undefined, statLabels?: Record<string, string>): string {
  if (!delta) return "";
  return Object.entries(delta).map(([k, v]) => `${v >= 0 ? "+" : ""}${v} ${statLabels?.[k] ?? k}`).join("  ·  ");
}
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
// Deterministic [0,1) from a string — so a chaotic roll is reproducible from the
// URL seed (same URL → same crit). Parity with narrative_event_screen's roll,
// including the earned crit-buff (achievements + Full-REL passives) passed as `buff`.
function rng01(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return ((h >>> 0) % 100000) / 100000;
}
// One roll per event-attempt (keyed by seed+day+event), compared to the BUFFED
// crit chance (base critChance + earned buff, clamped). Non-chaotic / no-dice
// choices always "succeed" (delta applies). `buff` is the crit-chance bonus as a
// fraction (achievements.critBonusPct + passivePct)/100 — the build-layer that
// makes the gamble's odds personal (narrative_event_screen 198-200).
function buffedCrit(c: Choice, buff: number): number {
  return clamp01((c.diceRoll?.critChance ?? 0) + buff);
}
function isCrit(seed: string, day: number, ei: number, c: Choice, buff = 0): boolean {
  if (c.role !== "chaotic" || !c.diceRoll) return true;
  return rng01(`${seed}:${day}:${ei}`) < buffedCrit(c, buff);
}
const isChaoticFail = (seed: string, day: number, ei: number, c: Choice, buff = 0) =>
  c.role === "chaotic" && !!c.diceRoll && !isCrit(seed, day, ei, c, buff);

const kPassiveCritCap = 8; // lib/game_state.dart — a whole-cast max can't compound forever
type TierUp = { category?: string; deliveredInEventId?: string };
type CastPassive = { id: string; critBonusPct: number };

export default function PlayRunner({ meta, days, di, e, pathStr, seed, vitals, relThresholds, relNames, critBonusById, castPassives, castLite, version, openingHook, lockedPrefs }: {
  meta: PlayMeta; days: PlayDay[]; di: number; e: string; pathStr: string; seed: string;
  vitals?: VitalMap; relThresholds?: number[]; relNames?: string[];
  critBonusById?: Record<string, number>; castPassives?: CastPassive[];
  // id → display parts: the run shows cast names per the NAMES-SHOW pref (lockedPrefs.td —
  // title / both / name; character-titles.md display choice), never a raw id.
  castLite?: { id?: string; name?: string; title?: string }[];
  version?: DataVersion; openingHook?: string;
  // The Front Door's HARD-LOCKED prefs (id / vibe / td / nm …) — carried in every step
  // URL so the run can't desync (docs/design/front-door-interaction.md). Read-only here;
  // only Reset changes them. An opaque map so new prefs need no PlayRunner change.
  lockedPrefs?: Record<string, string>;
}) {
  const router = useRouter();
  const copy = (CAMPAIGNS.find((c) => c.key === meta.campaignKey) ?? CAMPAIGNS[0]).copy;
  // Identity tokens ([they]/[name]/[v:…]) resolve BEFORE lexicon humanization — the web
  // mirror of the app's renderPlayerText (lib/identity_tokens.dart). Shadows the imported
  // name so every existing call site below gets the identity pass for free.
  const humanizeLexicon = useCallback(
    (s: string) => humanizeRaw(resolveIdentity(s, lockedPrefs?.id, lockedPrefs?.nm)),
    [lockedPrefs?.id, lockedPrefs?.nm],
  );
  // the NAMES-SHOW pref applied to cast labels (td: title / both / name-default) — raw ids never ship.
  const displayName = useCallback((id?: string | null) => {
    if (!id) return "";
    const c = castLite?.find((x) => x.id === id);
    if (!c?.name) return id;
    // TITLE SUNSET (2026-06-12): labels are NAMES; titles live in the story + sheet.
    return c.name;
  }, [castLite]);
  // The committed Chaotic Line per event (chaotic → input → continue): the picked
  // chaotic choice doesn't resolve until the player locks in their line; the line is
  // then woven into the outcome. Local/ephemeral (UGC, not part of the URL path).
  const [committedLines, setCommittedLines] = useState<Record<string, string>>({});

  // Apply the campaign skin while playing; restore on leave.
  useEffect(() => {
    const r = document.documentElement;
    const prevPack = r.dataset.pack, prevMode = r.dataset.mode;
    r.dataset.pack = meta.pack; r.dataset.mode = meta.mode;
    return () => { if (prevPack) r.dataset.pack = prevPack; if (prevMode) r.dataset.mode = prevMode; };
  }, [meta.pack, meta.mode]);

  const decisions = parsePath(pathStr);
  const pickMap = new Map(decisions.map((d) => [`${d.day}-${d.ei}`, d.cid]));
  const idxByDay = new Map(days.map((d, i) => [d.globalDayIndex, i]));

  // The current position (needed before the replay so we can snapshot the state
  // as it was BEFORE this event — for callbacks + the pre-roll crit buff).
  const day = days[di];
  const tier = day.tierUpReveal as TierUp | undefined;
  const dayNum = day.globalDayIndex ?? di + 1;
  const events = day.events ?? [];
  const lastDayNum = days[days.length - 1]?.globalDayIndex ?? days.length;
  const ei = /^\d+$/.test(e) ? Number(e) : -1;
  const atIntro = e === "intro", atEnd = e === "end", done = e === "done";
  const ev = ei >= 0 && ei < events.length ? events[ei] : null;
  const picked = ev ? pickMap.get(`${dayNum}-${ei}`) : undefined;
  const lineKey = `${dayNum}-${ei}`;
  const committedLine = committedLines[lineKey];
  // chaotic → input → continue: a picked chaotic choice GATES on the player's line
  // before resolving — but ONLY when this choice is input-enabled (Smart Chaotic;
  // scripted/loaded chaotic choices resolve immediately like passive/logical).
  const pickedChoice = ev?.choices?.find((c) => c.id === picked);
  const isTierUpEvent = !!tier?.deliveredInEventId && tier.deliveredInEventId === ev?.id;
  const awaitingChaoticInput = !!pickedChoice && chaoticInputEnabled(pickedChoice, isTierUpEvent) && committedLine === undefined;

  // The Full-REL PASSIVE crit nudge: coaches maxed to Unspoken (top tier) in THIS
  // campaign lend a small, capped edge (passiveCritBonusForCampaign, story-engine §2).
  const unspokenAt = relThresholds?.length ? relThresholds[relThresholds.length - 1] : Infinity;
  const passiveCritBonus = (rel: Record<string, number>) => {
    let sum = 0;
    for (const p of castPassives ?? []) if ((rel[p.id] ?? 0) >= unspokenAt) sum += p.critBonusPct;
    return Math.min(sum, kPassiveCritCap);
  };
  const achBonusFor = (id?: string | null) => (id ? (critBonusById?.[id] ?? 0) : 0);

  // POSITION-SCOPED replay (sorted by play order) → HUD totals + per-character REL +
  // earned flags, AND each chaotic roll uses the crit BUFF accrued strictly BEFORE it
  // (the build layer: earned achievements + Unspoken passives make the odds personal).
  // We snapshot the state as of just-before the current event for callbacks + display.
  const sortedDecisions = [...decisions].sort((a, b) => a.day - b.day || a.ei - b.ei);
  const totals: Record<string, number> = {};
  const granted = new Set<string>();
  const relByChar: Record<string, number> = {};
  // The LEAD-IN head-start (convergent-origins §6; playtest fix #1B): the helper you
  // walked toward at the front door carries a small REL head-start into the run — the
  // door's path choice is CONSUMED, not decoration. Non-leads stay at baseline (REL
  // parity); the full per-helper prologue stays the tracked authoring gap. `leadIn`
  // rides the opaque lockedPrefs map, so it propagates across every step URL.
  if (lockedPrefs?.leadIn) relByChar[lockedPrefs.leadIn] = 2;
  // The ROUTED COLD OPEN (the Mei→Hana rule): the walked lead's flag lets Day-1's
  // first scene proceed from the door's path pick (scenarioVariants on walked-<id>).
  if (lockedPrefs?.leadIn) granted.add(`walked-${lockedPrefs.leadIn}`);
  // The DOOR-GRANTED tendency flag ("what are you here for?" — prefs-as-hooks):
  // the gate-intake pick carries the flag id itself (e.g. nm-tend-push), seeded
  // before LANTERN 1 so the register variants resolve from the first night.
  if (lockedPrefs?.hf) granted.add(lockedPrefs.hf);
  const itemRarityCounts: Record<string, number> = {}; // by kind — feeds counter-achievements
  let achBonus = 0; // running sum of earned achievement critBonusPct
  // apply an item's one-shot statDeltas (success-only) into the running totals.
  const applyItemDeltas = (sd: Record<string, number> | undefined, focal?: string | null) => {
    if (!sd) return;
    for (const [k, v] of Object.entries(sd)) {
      totals[k] = k === "REL" ? (totals[k] ?? 0) + v : Math.max(0, (totals[k] ?? 0) + v);
      if (k === "REL" && focal) relByChar[focal] = (relByChar[focal] ?? 0) + v;
    }
  };
  let snapped = false;
  let heldBefore = new Set<string>(), achBonusBefore = 0, relBefore: Record<string, number> = {};
  const beforeCurrent = (d: number, x: number) => d < dayNum || (d === dayNum && x < ei);
  for (const dec of sortedDecisions) {
    if (!snapped && !beforeCurrent(dec.day, dec.ei)) {
      heldBefore = new Set(granted); achBonusBefore = achBonus; relBefore = { ...relByChar }; snapped = true;
    }
    const dIdx = idxByDay.get(dec.day);
    if (dIdx == null) continue;
    const ch = days[dIdx].events?.[dec.ei]?.choices?.find((c) => c.id === dec.cid);
    if (!ch) continue;
    const buff = (achBonus + passiveCritBonus(relByChar)) / 100; // buff as of BEFORE this roll's own grant
    const fail = isChaoticFail(seed, dec.day, dec.ei, ch, buff);
    // The choice-level flag records the PATH, so it's granted REGARDLESS of dice
    // (applyChoice: outside the crit-fail block) — a callback fires even on a flop —
    // and it accrues its crit bonus into the build.
    if (ch.grantsAchievement) { granted.add(ch.grantsAchievement); achBonus += achBonusFor(ch.grantsAchievement); }
    if (fail) {
      // the BRAVE-LOSS consolation (playtest ruling): an authored critFailDelta
      // pays on the flop — "+2 NERVE anyway" is a real ledger entry.
      const focalF = days[dIdx].characterId;
      if (ch.critFailDelta) for (const [k, v] of Object.entries(ch.critFailDelta)) {
        totals[k] = k === "REL" ? (totals[k] ?? 0) + v : Math.max(0, (totals[k] ?? 0) + v);
        if (k === "REL" && focalF) relByChar[focalF] = (relByChar[focalF] ?? 0) + v;
      }
      continue; // the main deltas + item stay skipped
    }
    const focal = days[dIdx].characterId;
    if (ch.delta) for (const [k, v] of Object.entries(ch.delta)) {
      totals[k] = k === "REL" ? (totals[k] ?? 0) + v : Math.max(0, (totals[k] ?? 0) + v); // stats floor at 0
      if (k === "REL" && focal) relByChar[focal] = (relByChar[focal] ?? 0) + v;
    }
    // an item drop (success-only): rarity counter (by kind) → counter-achievements,
    // its own flag, and its one-shot statDeltas (applyChoice 691-708).
    if (ch.itemDrop) {
      const kind = ch.itemDrop.kind ?? "memento";
      itemRarityCounts[kind] = (itemRarityCounts[kind] ?? 0) + 1;
      if ((itemRarityCounts["memento"] ?? 0) >= 100 && !granted.has("junk-collector")) { granted.add("junk-collector"); achBonus += achBonusFor("junk-collector"); }
      if (ch.itemDrop.grantsAchievement) { granted.add(ch.itemDrop.grantsAchievement); achBonus += achBonusFor(ch.itemDrop.grantsAchievement); }
      applyItemDeltas(ch.itemDrop.statDeltas, focal);
    }
  }
  if (!snapped) { heldBefore = new Set(granted); achBonusBefore = achBonus; relBefore = { ...relByChar }; }
  // the crit buff in effect for THIS event's rolls (pre-roll: earned before now).
  const currentBuff = (achBonusBefore + passiveCritBonus(relBefore)) / 100;

  // The focal coach's relationship — per-character REL → tier index → tier name
  // (Circling … Named in the will). Drives the tier label + the BPM friction.
  const focalRel = day.characterId ? (relByChar[day.characterId] ?? 0) : 0;
  const focalTierIdx = relTierIndex(focalRel, relThresholds ?? []);
  const focalTierName = relNames?.[focalTierIdx];

  // The scene's felt BPM (lib/bpm.dart parity, via _bpmFor's input derivation):
  // stakes (tier-up=peak, last event=climax, else baseline) + REL friction (from
  // the FOCAL coach's tier vs the tiers) + the character's exposed beat + override.
  // Internal — it conducts the reveal pace + the threshold-gated heartbeat pulse.
  const bpm: Bpm | null = ev ? (() => {
    const isTierUp = tier?.deliveredInEventId === ev.id;
    const isLast = ei + 1 >= events.length;
    const stakes = isTierUp ? 3 : isLast ? 2 : 1;
    const friction = relFrictionFromTier(focalTierIdx);
    return deriveBpm({ stakes, relFriction: friction, characterExposed: ev.characterExposed, shift: bpmShiftFromString(ev.bpmShift) });
  })() : null;
  // Vibrant dialect (the Corner/Wingman skin) staggers the reveal word-by-word at
  // the BPM pace; Parchment stays instant (theme-faithful — text is instant there).
  const conducts = meta.pack === "corner" || meta.pack === "dos";

  // v0.0.42 callbacks — the flags HELD when this event renders = those from
  // selections strictly BEFORE this position (heldBefore, snapshotted above; a
  // callback reads the PAST, never the event's own just-set flag). scenario/reaction
  // variants resolve against this (matches Event.scenarioFor / Choice.reactionTextFor:
  // first variant whose non-empty unlockIf is fully held wins, else the base text).
  const hasFlag = (f: string) => heldBefore.has(f);
  const variantMatches = (unlockIf?: string[]) => (unlockIf?.length ?? 0) > 0 && unlockIf!.every(hasFlag);
  // the scenario to render — a held flag's callback variant if one matches, else base.
  const activeScenario = (ev?.scenarioVariants ?? []).find((v) => variantMatches(v.unlockIf))?.scenario ?? ev?.scenario ?? "";
  const activeReaction = (c: Choice): ReactionVariant | null =>
    (c.reactionVariants ?? []).find((v) => variantMatches(v.unlockIf)) ?? null;

  const href = (nDi: number, nE: string, nPath = pathStr) => {
    const q = new URLSearchParams();
    q.set("e", nE);
    if (nPath) q.set("p", nPath);
    if (seed) q.set("seed", seed);
    for (const [k, v] of Object.entries(lockedPrefs ?? {})) if (v) q.set(k, v); // carry the locked prefs
    return `/play/${meta.campaign}/${days[nDi].globalDayIndex}?${q.toString()}`;
  };
  const go = (nDi: number, nE: string, nPath?: string) => router.push(href(nDi, nE, nPath));

  // HOME returns to the Front Door carrying the locked prefs (shown read-only) + a
  // RESUME pointer back to this exact position. The Front Door is the hub; there is no
  // free Back through days (it would desync the URL-truth state). Reset = a fresh run.
  const homeHref = (() => {
    const pos = new URLSearchParams({ e });
    if (pathStr) pos.set("p", pathStr);
    if (seed) pos.set("seed", seed);
    for (const [k, v] of Object.entries(lockedPrefs ?? {})) if (v) pos.set(k, v);
    const hq = new URLSearchParams();
    for (const [k, v] of Object.entries(lockedPrefs ?? {})) if (v) hq.set(k, v);
    hq.set("resume", `${dayNum}?${pos.toString()}`);
    return `/play/${meta.campaign}?${hq.toString()}`;
  })();

  const pick = (c: Choice) => {
    const key = `${dayNum}-${ei}`;
    const kept = decisions.filter((d) => `${d.day}-${d.ei}` !== key);
    go(di, e, serializePath([...kept, { day: dayNum, ei, cid: c.id }]));
  };
  const cont = () => {
    if (atIntro) go(di, events.length ? "0" : "end");
    else if (ei >= 0) go(di, ei + 1 < events.length ? String(ei + 1) : "end");
    else if (atEnd) { if (di < days.length - 1) go(di + 1, "intro"); else go(di, "done"); }
  };

  const card: React.CSSProperties = { border: "2px solid var(--ink-soft)", background: "var(--paper)", color: "var(--ink)", padding: "20px 18px", minHeight: 200, fontFamily: "var(--theme-body)" };
  const eyebrow: React.CSSProperties = { fontFamily: "var(--theme-display)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--spot-red)", marginBottom: 6 };
  const statKeys = Object.keys(totals).filter((k) => totals[k] !== 0);
  const itemCount = Object.values(itemRarityCounts).reduce((a, b) => a + b, 0);

  // Community feedback is anchored to the PATH POINT (campaign:day:event), versioned
  // by the data snapshot — never the dice seed (the seed is a transient roll, not an
  // identity). data_version on a reply tells you if it was written against an older
  // or newer version of this content. (wiki_comments, migration 0009.)
  const fbAnchor = `play:${meta.campaign}:day-${dayNum}:event:${e}`;
  const fbLabel = `${meta.title} · ${done ? "complete" : `${meta.dayUnit} ${dayNum} · ${ev?.id ?? e}`}`;
  // The PRECISE same-path cohort key (for the "good company" headline count): campaign
  // + content version + the ordered CHOICE ids made so far. CHOICES ONLY — no dice /
  // stats / items / unlocks (those would shatter cohorts; § Path Cohort). The thread
  // (replies) stays broad (fbAnchor) for liveness; only the headline is path-precise.
  // "so far" = up to the current event; at the day-end/done screens it INCLUDES all of
  // today's picks (you just played them), so the end-screen cohort reflects today too.
  const cutoffEi = atEnd || done ? Infinity : ei;
  const pathSoFar = sortedDecisions.filter((d) => d.day < dayNum || (d.day === dayNum && d.ei <= cutoffEi));
  const cohortKey = `${meta.campaign}@${version?.contentHash ?? "v0"}#${pathSoFar.map((d) => `${d.day}.${d.ei}.${d.cid}`).join("-")}`;

  // The same-path cohort, recorded + counted ONCE here and shared by the intro
  // headline + the reply modal. Anonymous, idempotent, best-effort (null = offline).
  const [cohortOthers, setCohortOthers] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    const c = supabase();
    if (!c) { setCohortOthers(null); return; }
    (async () => {
      await c.from("play_path_cohort").upsert(
        { path_key: cohortKey, visitor_token: visitorToken(), campaign: meta.campaign },
        { onConflict: "path_key,visitor_token", ignoreDuplicates: true },
      );
      const { count } = await c.from("play_path_cohort").select("*", { count: "exact", head: true }).eq("path_key", cohortKey);
      if (live) setCohortOthers(count == null ? null : Math.max(0, count - 1));
    })().catch(() => { if (live) setCohortOthers(null); });
    return () => { live = false; };
  }, [cohortKey, meta.campaign]);

  // "Story So Far" — the chain of day recaps up to today (each day's recap describes
  // what happened; shown on the NEXT day). PREVIOUSLY = just yesterday's. The START
  // button wears yesterday's cliffhanger label (parity with the Flutter day_entry_screen).
  const prevStarts = days.slice(0, di).map((d) => d.nextDayStart).filter((n): n is { label?: string; recap?: string } => !!n);
  const previously = di > 0 ? (days[di - 1].nextDayStart?.recap ?? "") : "";
  const startLabel = di > 0 ? (days[di - 1].nextDayStart?.label ?? "") : "";
  const storySoFar = prevStarts.map((n) => n.recap ?? "").filter(Boolean);

  return (
    <CampaignCtx.Provider value={copy}>
      <style>{CSS}</style>

      {/* HUD — accumulated from the replayed path (proves the URL drives state) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: "var(--theme-display)", fontSize: 17, color: "var(--ink)" }}>{meta.title}</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {statKeys.length === 0 && <span style={{ fontSize: 11, color: "var(--margin-ink)", fontStyle: "italic" }}>no stats yet</span>}
          {statKeys.map((k) => (
            <span key={k} style={{ fontFamily: "var(--theme-display)", fontSize: 10, letterSpacing: ".08em", padding: "2px 7px", border: "1.5px solid var(--ink-soft)", color: k === "REL" ? "var(--spot-red)" : "var(--forest)" }}>
              {(meta.statLabels?.[k] ?? k)} {totals[k] >= 0 ? "+" : ""}{totals[k]}
            </span>
          ))}
          {granted.size > 0 && (
            <span style={{ fontFamily: "var(--theme-display)", fontSize: 10, letterSpacing: ".08em", padding: "2px 7px", border: "1.5px solid var(--spot-red)", color: "var(--spot-red)" }}>
              ✦ {granted.size} unlocked
            </span>
          )}
          {itemCount > 0 && (
            <span style={{ fontFamily: "var(--theme-display)", fontSize: 10, letterSpacing: ".08em", padding: "2px 7px", border: "1.5px solid var(--ink-soft)", color: "var(--ink)" }}>
              ★ {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--margin-ink)", marginBottom: 10 }}>
        {done ? "complete" : `${meta.dayUnit} ${dayNum} / ${lastDayNum}`}{seed ? `  ·  seed ${seed}` : ""}
        {!done && day.characterId && focalTierName && (
          <span>{"  ·  "}<span style={{ color: "var(--spot-red)" }}>{displayName(day.characterId)}</span> · {focalTierName}{focalRel ? ` (REL ${focalRel})` : ""}</span>
        )}
      </div>

      <div style={card}>
        {done ? (
          <div>
            <div style={eyebrow}>the campaign graduated you</div>
            <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 6px" }}>
              You ran the whole thing. The coaches step back — not gone, just no longer needed at the edge of the room.
            </p>
            {statKeys.length > 0 && (
              <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 14px" }}>
                this run: {statKeys.map((k) => `${meta.statLabels?.[k] ?? k} ${totals[k] >= 0 ? "+" : ""}${totals[k]}`).join("  ·  ")}
              </p>
            )}
            <VacatedFrame dialect={meta.pack === "dos" ? "dos" : meta.pack === "corner" ? "vibrant" : "parchment"} />
          </div>
        ) : atIntro ? (
          <div>
            <div style={eyebrow}>{meta.dayUnit} {dayNum} · {displayName(day.characterId)}</div>
            <h2 style={{ fontFamily: "var(--theme-display)", fontSize: 26, margin: "0 0 10px", color: "var(--ink)" }}>{humanizeLexicon(day.episodeTitle ?? "")}</h2>
            {/* DAY 1 = the COVER. The opening hook sells the whole campaign + pulls into
                the first beat (no "previously" exists yet). docs/design/community-discussion.md. */}
            {di === 0 && openingHook && (
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink)", margin: "0 0 14px", whiteSpace: "pre-wrap" }}>{humanizeLexicon(openingHook)}</p>
            )}
            {/* PREVIOUSLY — yesterday's recap, so a returning player catches up at a glance
                (parity with the Flutter day_entry_screen). */}
            {previously && (
              <div style={{ borderLeft: "3px solid var(--spot-red)", paddingLeft: 10, margin: "0 0 12px" }}>
                <div style={{ fontFamily: "var(--theme-display)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--spot-red)", marginBottom: 3 }}>Previously</div>
                <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink-soft)", margin: 0 }}>{humanizeLexicon(previously)}</p>
              </div>
            )}
            {/* "The story so far" — the whole chain of recaps, collapsed (catch up even
                after a long time away; path-scoped, like the discussion model). */}
            {storySoFar.length > 1 && (
              <details style={{ margin: "0 0 12px" }}>
                <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--forest)" }}>the story so far ({storySoFar.length} {meta.dayUnit.toLowerCase()}s)</summary>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  {storySoFar.map((r, i) => (
                    <p key={i} style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-soft)", margin: 0, paddingLeft: 10, borderLeft: "1.5px solid var(--ink-soft)" }}>{humanizeLexicon(r)}</p>
                  ))}
                </div>
              </details>
            )}
            {/* same-path cohort — "you're in good company", motif voice (belonging) */}
            <p style={{ fontSize: 12, fontStyle: "italic", color: "var(--ink)", margin: "0 0 10px" }}>{cohortHeadline(meta.campaignKey, cohortOthers)}</p>
            {/* the begin teaser — yesterday's cliffhanger; suppressed on Day 1 (the hook
                already ends on its own call to action). */}
            {!(di === 0 && openingHook) && (
              <p style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>{startLabel ? humanizeLexicon(startLabel) : `tap begin to play this ${meta.dayUnit.toLowerCase()}.`}</p>
            )}
          </div>
        ) : atEnd ? (
          <div>
            <div style={eyebrow}>{meta.dayUnit} {dayNum} · close</div>
            <p style={{ fontSize: 15, lineHeight: 1.65, margin: "0 0 12px" }}>{humanizeLexicon(day.closingHook ?? "")}</p>
            {/* same-path cohort at the close — who played today the way you did */}
            <p style={{ fontSize: 12, fontStyle: "italic", color: "var(--ink)", margin: 0 }}>{cohortHeadline(meta.campaignKey, cohortOthers)}</p>
          </div>
        ) : (
          <div>
            <div style={eyebrow}>
              {meta.dayUnit} {dayNum} · {ev?.id}
              {/* the scenario is a held-flag callback variant (a past choice echoes here) */}
              {ev && activeScenario !== (ev.scenario ?? "") && (
                <span style={{ marginLeft: 8, color: "var(--forest)", textTransform: "none", letterSpacing: 0 }}>↩ callback</span>
              )}
            </div>
            {tier?.deliveredInEventId && tier.deliveredInEventId === ev?.id && (
              // playtest fix #13: the LAST tier earns a heavier frame + its NAME — the cap
              // must not look like tier 2→3 (earned-warmth register, no "MAX LEVEL!").
              focalTierIdx >= (relNames?.length ?? 1) - 1 && relNames?.length ? (
                <div style={{ display: "inline-block", textAlign: "center", fontFamily: "var(--theme-display)", color: "var(--spot-red)", border: "4px double var(--spot-red)", padding: "8px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 17, letterSpacing: ".18em", textTransform: "uppercase" }}>✦ {relNames[relNames.length - 1]}</div>
                  <div style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--margin-ink)", marginTop: 3 }}>— their last tier —</div>
                  <div style={{ height: 6, background: "var(--spot-red)", marginTop: 7 }} />
                </div>
              ) : (
                <div style={{ display: "inline-block", fontFamily: "var(--theme-display)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--spot-red)", border: "2px solid var(--spot-red)", padding: "3px 9px", marginBottom: 12 }}>
                  ✦ Tier up{tier.category ? ` · ${tier.category}` : ""}
                </div>
              )
            )}
            {/* Threshold-gated dual heartbeat — fires only on an emotional shift
                (a BPM leaving the resting band), never during ordinary talk. */}
            {bpm?.anyPulse && (
              <div style={{ display: "flex", gap: 16, margin: "0 0 12px" }}>
                <Heartbeat label="them" bpm={bpm.character} />
                <Heartbeat label="you" bpm={bpm.player} />
              </div>
            )}
            <BpmReveal text={humanizeLexicon(activeScenario)} perWordMs={conducts && bpm ? bpm.revealMsPerWord() : 0} />
            {/* MC-POV perception whisper (the "you see…" line) — italic, fades in */}
            {ev?.youSee && (
              <div className="adk-ys" style={{ width: "auto", marginBottom: 12 }}>
                <div className="adk-ys-line" style={{ marginTop: 0 }}>{humanizeLexicon(ev.youSee)}</div>
              </div>
            )}
            {/* Vital reveals — the perception line unlocks "??? → value" on the sheet */}
            {(ev?.revealsVitals?.length ?? 0) > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
                {ev!.revealsVitals!.map((key) => {
                  const v = vitals?.[key];
                  return (
                    <div key={key} style={{ fontSize: 12, color: "var(--ink-soft)", display: "flex", gap: 6, alignItems: "baseline" }}>
                      <span style={{ color: "var(--spot-red)" }}>✦ vital</span>
                      <span style={{ fontFamily: "var(--theme-display)", letterSpacing: ".06em", textTransform: "uppercase", fontSize: 10, color: "var(--ink)" }}>{v?.label ?? key}</span>
                      <span style={{ color: "var(--margin-ink)" }}>???→</span>
                      <span style={{ color: "var(--ink)" }}>{v ? humanizeLexicon(v.value) : key}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {(ev?.choices?.length ?? 0) > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ev!.choices!.map((c) => {
                  const isPick = picked === c.id;
                  const dimmed = picked && !isPick;
                  const isGamble = c.role === "chaotic" && !!c.diceRoll;
                  const inputEnabled = chaoticInputEnabled(c, isTierUpEvent); // Smart Chaotic
                  const cFail = isPick && isChaoticFail(seed, dayNum, ei, c, currentBuff);
                  // a held flag's callback variant overrides the reaction text (Choice.reactionTextFor);
                  // crit-fail uses the variant's critfail line only when it's non-empty, else base.
                  const rv = isPick ? activeReaction(c) : null;
                  const reaction = isPick
                    ? (cFail
                        ? (rv?.reactionTextOnCritFail || c.reactionTextOnCritFail)
                        : (rv?.reactionText || c.reactionText))
                    : undefined;
                  // chaotic → input → continue: an INPUT-ENABLED picked chaotic choice waits
                  // for the player's line; only THEN does the outcome render (line woven in).
                  const awaitingInput = isPick && inputEnabled && committedLine === undefined;
                  const lineAnchor = `${fbAnchor}:choice-${c.id}`;
                  return (
                    <div key={c.id}>
                      <button onClick={() => pick(c)} style={{
                        width: "100%", textAlign: "left", fontFamily: "var(--theme-body)", fontSize: 14, lineHeight: 1.4, padding: "8px 12px", cursor: "pointer",
                        border: `2px solid ${isPick ? "var(--forest)" : "var(--ink-soft)"}`,
                        background: isPick ? "color-mix(in srgb, var(--forest) 12%, transparent)" : "transparent",
                        color: "var(--ink)", opacity: dimmed ? 0.5 : 1,
                      }}>
                        <span style={{ color: ROLE_TINT[c.role ?? ""] ?? "var(--margin-ink)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", marginRight: 8 }}>{c.role}</span>
                        {c.diceRoll && <span title="a gamble: the % is the chance it lands; a miss changes nothing on your sheet" style={{ color: "var(--spot-red)", fontSize: 11, marginRight: 6, cursor: "help" }}>🎲 {Math.round(buffedCrit(c, currentBuff) * 100)}%{currentBuff > 0 ? <span style={{ color: "var(--forest)" }}> (+{Math.round(currentBuff * 100)})</span> : ""}</span>}
                        {/* Smart Chaotic affordance — this chaotic beat INVITES your own line
                            (absence = a set path). Makes the selectivity read as intentional. */}
                        {inputEnabled && <span title="your move — write your own line" style={{ color: "var(--spot-red)", fontSize: 11, marginRight: 6 }}>✍</span>}
                        {humanizeLexicon(c.label)}
                      </button>
                      {/* the input GATE — chaotic resolves only after the player locks a line in */}
                      {awaitingInput && (
                        <ChaoticInput anchor={lineAnchor} campaign={meta.campaign} campaignKey={meta.campaignKey} version={version} seed={seed}
                          defaultLine={humanizeLexicon(c.scriptedLine || "")} options={c.lineOptions?.map((o) => humanizeLexicon(o))}
                          onLockIn={(line) => setCommittedLines((p) => ({ ...p, [lineKey]: line }))} />
                      )}
                      {isPick && !awaitingInput && (
                        <div style={{ marginTop: 6, paddingLeft: 12 }}>
                          {/* the committed line, woven into the outcome (success lands / crit-fail flops) */}
                          {inputEnabled && committedLine && (
                            <div style={{ fontStyle: "italic", fontSize: 13, color: "var(--ink)", marginBottom: 4 }}>you said: &ldquo;{committedLine}&rdquo;</div>
                          )}
                          {/* battle (theme-gated) vs instant roll — outcome IS the crit */}
                          {isGamble && c.battle && meta.battlesEnabled ? (
                            <div style={{ border: "2px solid var(--ink-soft)", padding: "6px 8px" }}>
                              <span style={{ display: "block", fontFamily: "var(--theme-display)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--spot-red)" }}>⚔ Battle · {c.battle.hero} vs {c.battle.enemy} (HP {c.battle.enemyHp})</span>
                              {c.battle.intro && <span style={{ display: "block", marginTop: 3, fontStyle: "italic", color: "var(--ink-soft)", fontSize: 12 }}>{humanizeLexicon(c.battle.intro)}</span>}
                              <span style={{ display: "block", marginTop: 4, fontWeight: 700, fontSize: 12, color: cFail ? "var(--spot-red)" : "var(--forest)" }}>{cFail ? `▼ ${c.battle.enemy} held — no change` : `▲ ${c.battle.enemy} down`}</span>
                            </div>
                          ) : isGamble ? (
                            <div style={{ fontWeight: 700, fontSize: 12, color: cFail ? "var(--spot-red)" : "var(--forest)" }}>
                              {cFail ? "🎲 crit fail — no change" : "🎲 crit success"}
                            </div>
                          ) : null}
                          {!cFail && deltaText(c.delta, meta.statLabels) && (
                            <div style={{ marginTop: 4, color: "var(--forest)", fontWeight: 700, fontSize: 13 }}>{deltaText(c.delta, meta.statLabels)}</div>
                          )}
                          {reaction && (
                            <div style={{ marginTop: 4, fontStyle: "italic", color: "var(--ink-soft)", fontSize: 13 }}>
                              {humanizeLexicon(reaction)}
                              {rv && <span style={{ fontStyle: "normal", color: "var(--forest)" }}> ↩</span>}
                            </div>
                          )}
                          {!cFail && c.itemDrop?.name && (
                            <div style={{ marginTop: 4, color: "var(--spot-red)", fontSize: 12 }}>
                              ★ {(c.itemDrop.kind ?? "item").toUpperCase()} · {humanizeLexicon(c.itemDrop.name)}
                              {deltaText(c.itemDrop.statDeltas, meta.statLabels) && <span style={{ color: "var(--forest)" }}> ({deltaText(c.itemDrop.statDeltas, meta.statLabels)})</span>}
                            </div>
                          )}
                          {!cFail && c.grantsAchievement && (
                            <div style={{ marginTop: 4, fontFamily: "var(--theme-display)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--spot-red)", fontSize: 11 }}>✦ Unlocked · {c.grantsAchievement}</div>
                          )}
                          {/* the multiplayer surface — only on input-enabled (line) beats */}
                          {inputEnabled && (
                            <div style={{ marginTop: 6 }}>
                              <ChaoticOthers anchor={lineAnchor} campaignKey={meta.campaignKey} version={version} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {/* The note(s) the day writes to the coach's memory (the note-factory) —
                surfaced once the event resolves (a choice picked, or no choices). */}
            {(picked || (ev?.choices?.length ?? 0) === 0) && (ev?.memoryWrites?.length ?? 0) > 0 && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                {ev!.memoryWrites!.filter((m) => m.text).map((m, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--ink-soft)", fontStyle: "italic", display: "flex", gap: 6, alignItems: "baseline" }}>
                    <span style={{ color: "var(--forest)", fontStyle: "normal" }}>✎ remembered</span>
                    <span>{humanizeLexicon(m.text ?? "")}{m.emotion ? ` · ${m.emotion}` : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* controls — HOME returns to the Front Door (prefs locked); RESET starts a fresh run */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <button onClick={() => router.push(homeHref)} style={ctrl(false)}>⌂ home</button>
        {done ? (
          <button onClick={() => router.push(`/play/${meta.campaign}`)} style={ctrl(false, true)}>↺ reset</button>
        ) : ev && (ev.choices?.length ?? 0) > 0 && !picked ? (
          <span style={{ fontSize: 13, color: "var(--margin-ink)", fontStyle: "italic" }}>pick a line to continue…</span>
        ) : awaitingChaoticInput ? (
          <span style={{ fontSize: 13, color: "var(--margin-ink)", fontStyle: "italic" }}>lock in your line first…</span>
        ) : (
          <button onClick={cont} style={ctrl(false, true)}>
            {atIntro ? "begin ▸" : atEnd ? (di < days.length - 1 ? `next ${meta.dayUnit.toLowerCase()} ▸` : "finish ▸") : "continue ▸"}
          </button>
        )}
        {/* community feedback on THIS path point (right edge), versioned not seeded */}
        <PathFeedback anchor={fbAnchor} anchorLabel={fbLabel} version={version}
          campaignKey={meta.campaignKey} others={cohortOthers} />
      </div>
    </CampaignCtx.Provider>
  );
}

// Path-anchored community feedback (TIERED — § Path Cohort, Gemini-vetted):
//  • the THREAD (replies) is anchored BROADLY to the path POINT (campaign:day:event)
//    so discussions have critical mass and stay alive (vs ghost-town path-scoping);
//  • the HEADLINE is PRECISE — "you're in good company" for players who made the SAME
//    CHOICES so far (cohortKey: campaign + version + ordered choice ids; choices only,
//    never dice/stats/items/unlocks). Framed as belonging, not surveillance.
// Each reply carries the data version it was written against → an "↺ older version"
// badge flags feedback on stale content (NOT the dice seed — the seed is a transient
// roll, never an identity). Reads public (RLS comments_read); posting + cohort logging
// are best-effort anon, degrading to a graceful offline state. Schema: wiki_comments
// (0009) + play_path_cohort (0020).
type FbRow = { id: string; body: string; author: string; data_version: string | null };
function PathFeedback({ anchor, anchorLabel, version, campaignKey, others }: {
  anchor: string; anchorLabel: string; version?: DataVersion; campaignKey: string; others: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<FbRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    const c = supabase();
    if (!c) { setLoaded(true); return; }
    c.from("wiki_comments").select("id,body,author,data_version").eq("anchor", anchor).eq("hidden", false)
      .order("created_at", { ascending: true })
      .then(({ data }) => { setRows((data as FbRow[]) ?? []); setLoaded(true); });
  }, [anchor]);
  useEffect(() => { setLoaded(false); setRows([]); setErr(null); load(); }, [load]);

  const post = async () => {
    const body = draft.trim();
    if (!body) return;
    const c = supabase();
    if (!c) { setErr("Discussion is offline here."); return; }
    setPosting(true); setErr(null);
    const { error } = await c.from("wiki_comments").insert({
      anchor, anchor_label: anchorLabel, data_run: version?.runId ?? null, data_version: version?.contentHash ?? null, body,
    });
    setPosting(false);
    if (error) { setErr("Couldn't post — try again signed out, or it's read-only here."); return; }
    setDraft(""); load();
  };

  return (
    <span style={{ marginLeft: "auto", position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} title={`Feedback on this path point · ${anchor}${version?.contentHash ? ` · v${version.contentHash}` : ""}`}
        style={{ ...ctrl(false), display: "inline-flex", alignItems: "center", gap: 5 }}>
        💬 {rows.length}
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, bottom: "100%", marginBottom: 8, width: 320, maxHeight: 340, overflowY: "auto",
          border: "2px solid var(--ink-soft)", background: "var(--paper)", color: "var(--ink)", padding: 10, zIndex: 20,
          boxShadow: "3px 3px 0 var(--ink-soft)", fontFamily: "var(--theme-body)", textAlign: "left",
        }}>
          {/* "good company" headline — same-path cohort, motif voice, dry comedy */}
          <div style={{ fontStyle: "italic", fontSize: 12, lineHeight: 1.45, color: "var(--ink)", borderBottom: "1.5px solid var(--ink-soft)", paddingBottom: 8, marginBottom: 8 }}>
            {cohortHeadline(campaignKey, others)}
          </div>
          <div style={{ fontFamily: "var(--theme-display)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--margin-ink)", marginBottom: 8 }}>
            Feedback · {anchorLabel}{version?.contentHash ? ` · v${version.contentHash}` : ""}
          </div>
          {!loaded ? (
            <div style={{ fontSize: 12, color: "var(--margin-ink)" }}>loading…</div>
          ) : rows.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--margin-ink)", fontStyle: "italic" }}>No feedback on this path point yet.</div>
          ) : rows.map((r) => (
            <div key={r.id} style={{ marginBottom: 8, fontSize: 12, lineHeight: 1.4 }}>
              <span>{r.body}</span>
              <span style={{ display: "block", color: "var(--margin-ink)", fontSize: 10, marginTop: 2 }}>
                — {r.author}
                {r.data_version && version?.contentHash && r.data_version !== version.contentHash && (
                  <span style={{ color: "var(--spot-red)" }}> · ↺ older version</span>
                )}
              </span>
            </div>
          ))}
          <textarea value={draft} onChange={(ev2) => setDraft(ev2.target.value)} placeholder="reply on this path point…" rows={2}
            style={{ width: "100%", marginTop: 6, fontFamily: "var(--theme-body)", fontSize: 12, padding: 6, border: "1.5px solid var(--ink-soft)", background: "transparent", color: "var(--ink)", boxSizing: "border-box" }} />
          {err && <div style={{ color: "var(--spot-red)", fontSize: 10, marginTop: 2 }}>{err}</div>}
          <button onClick={post} disabled={posting || !draft.trim()} style={{ ...ctrl(posting || !draft.trim(), true), marginTop: 6 }}>
            {posting ? "…" : "reply ↩"}
          </button>
        </div>
      )}
    </span>
  );
}

// Scenario text, optionally CONDUCTED by the scene BPM: when perWordMs > 0 the
// words reveal one-by-one at that pace (the Vibrant/DOS dialect — a racing heart
// reveals fast, a heavy one slow). perWordMs === 0 (or reduced-motion) → instant
// (the Parchment dialect's text is always instant; only dwell + pulse apply).
function BpmReveal({ text, perWordMs }: { text: string; perWordMs: number }) {
  const words = text.split(/(\s+)/); // keep whitespace tokens so spacing survives
  const wordCount = words.filter((w) => w.trim()).length;
  const [shown, setShown] = useState(perWordMs > 0 ? 0 : wordCount);
  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (perWordMs <= 0 || reduced) { setShown(wordCount); return; }
    setShown(0);
    let i = 0;
    const id = setInterval(() => { i += 1; setShown(i); if (i >= wordCount) clearInterval(id); }, perWordMs);
    return () => clearInterval(id);
  }, [text, perWordMs, wordCount]);
  let seen = 0;
  return (
    <p style={{ fontSize: 15, lineHeight: 1.65, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>
      {words.map((w, i) => {
        if (!w.trim()) return <span key={i}>{w}</span>;
        seen += 1;
        return <span key={i} style={{ opacity: seen <= shown ? 1 : 0, transition: "opacity .18s" }}>{w}</span>;
      })}
    </p>
  );
}

function ctrl(disabled: boolean, primary = false): React.CSSProperties {
  return {
    fontFamily: "var(--theme-body)", fontSize: 13, padding: "6px 14px",
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1,
    border: "2px solid var(--ink-soft)",
    background: primary ? "var(--forest)" : "transparent",
    color: primary ? "var(--paper)" : "var(--ink)",
  };
}
