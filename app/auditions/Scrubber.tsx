"use client";
// THE SCRUBBER — the player-facing scrub of the SETTING's surrounding environment, in the bench's
// style (a live <input type="range"> + procedural ASCII). The dial IS the DYNAMIC RANGE (§8.13): the
// WEATHER arcs across the five phases — COZY (0-20) · HEIGHTENED (20-40) · INTENSE/peak (40-60) ·
// AFTERMATH/rebuild (60-80) · RENEWAL (80-100) — calm, builds to the storm-peak, then RESOLVES to a
// renewed dawn. The WORLD holds through all of it (§8.15 — the ferry never becomes a lighthouse);
// only the weather arcs. EACH candidate gets its OWN environment, distinct by structure: the STRAIT
// (two headlands framing a channel), the CROSSING (a far shore on the horizon), the DARK WATER (a
// vast high-horizon deep). Authored in the ASCII-art commission's demoscene/ANSI tradition.
import { useState, useRef } from "react";

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)", amber = "#c08a2e";
const mono: React.CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", whiteSpace: "pre", lineHeight: 1.04, letterSpacing: 0 };

const COLS = 38, ROWS = 13;
function hash(x: number, y: number, seed = 0): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}
function snoise(x: number, seed: number): number {
  const xi = Math.floor(x), xf = x - xi;
  const a = hash(xi, 0, seed), b = hash(xi + 1, 0, seed);
  const t = xf * xf * (3 - 2 * xf);
  return a + (b - a) * t;
}
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Variant = "strait" | "crossing" | "water";

// THE §8.13 DYNAMIC-RANGE ARC — EXACT dr bands. It RISES to the storm-peak plateau (INTENSE 40-60)
// then RESOLVES (AFTERMATH the storm passing → RENEWAL a renewed calm). The peak is the MIDDLE, not
// the end — and the far end is a renewed calm (dawn), NOT the same calm it started in.
function arc(dr: number): number {
  if (dr < 0.4) return 0.05 + (dr / 0.4) * 0.95;          // COZY → HEIGHTENED, climbing to the peak
  if (dr < 0.6) return 1.0;                               // INTENSE — the storm-peak plateau (40-60)
  if (dr < 0.8) return 1.0 - ((dr - 0.6) / 0.2) * 0.62;   // AFTERMATH — the storm passing (1.0 → 0.38)
  return 0.38 - ((dr - 0.8) / 0.2) * 0.30;                // RENEWAL — renewed calm (0.38 → 0.08)
}
// the 5 §8.13 phases the dial steps through (drives the two-part title + the day-cycle)
const phaseOf = (dr: number) => Math.min(4, Math.floor(dr * 5));

function art(variant: Variant, dr: number): string[] {
  const intensity = arc(dr);
  const SEA_Y = variant === "water" ? 5 : 7;            // DARK WATER = high horizon → a vast deep
  const fcx = variant === "crossing" ? 12 : 18;        // CROSSING boat sits left (still travelling)
  const grid: string[][] = [];
  for (let r = 0; r < ROWS; r++) grid.push(new Array(COLS).fill(" "));
  const put = (x: number, y: number, ch: string | null | undefined) => {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS && ch != null) grid[y][x] = ch;
  };
  const night = dr < 0.55, renewal = dr > 0.78;

  // ---- FAR SHORE (crossing only) — a distant land line on the horizon, the destination ahead
  if (variant === "crossing") {
    const fsY = SEA_Y - 2;
    for (let x = 2; x <= 35; x++) {
      const h = snoise(x * 0.4 + 2, 41);
      put(x, fsY, h > 0.6 ? "▄" : "▁");
      if (h > 0.8) put(x, fsY - 1, "▖");
    }
    put(10, fsY, renewal ? "*" : "."); put(25, fsY, "."); // a harbour light or two
  }

  // ---- SKY: night MOON (dims as the storm builds) → storm clouds/rain → dawn SUN (low, rising)
  const moonX = variant === "crossing" ? 31 : 26, moonY = 1;
  if (night) {
    const m = clamp(1 - intensity / 0.85, 0, 1);
    if (m > 0.2) { put(moonX, moonY, "("); put(moonX + 1, moonY, ")"); if (intensity < 0.25) { put(moonX - 1, moonY, "."); put(moonX + 2, moonY, "."); } }
    const starD = clamp(1 - intensity / 0.5, 0, 1);
    for (let y = 0; y < SEA_Y - 1; y++) for (let x = 0; x < COLS; x++) {
      if (Math.abs(x - moonX) < 3 && y <= moonY + 1) continue;
      const h = hash(x, y, 7);
      if (h > 0.985 && h < 0.985 + starD * 0.012) put(x, y, h > 0.991 ? "*" : ".");
    }
  }
  const cloud = clamp((intensity - 0.28) / 0.72, 0, 1);
  if (cloud > 0) {
    const maxDepth = SEA_Y - 1;
    for (let y = 0; y < SEA_Y - 1; y++) for (let x = 0; x < COLS; x++) {
      const n = snoise(x * 0.30 + 11, 21) * 0.6 + snoise(x * 0.13 + y * 0.5 + 3, 31) * 0.4;
      const rowBias = 1 - y / maxDepth;
      const thresh = 1 - cloud * (0.45 + 0.55 * rowBias);
      if (n > thresh) {
        const over = (n - thresh) / (1 - thresh + 1e-6);
        let ch = "░";
        if (intensity > 0.8 && over > 0.55) ch = "▓"; else if (over > 0.5) ch = "▒";
        put(x, y, ch);
      }
    }
  }
  if (intensity > 0.55) {
    const rainAmt = clamp((intensity - 0.55) / 0.45, 0, 1);
    for (let y = 1; y < SEA_Y; y++) for (let x = 0; x < COLS; x++) {
      const h = hash((x + y * 2) % 997, y, 55);
      if (h < rainAmt * 0.09 && (grid[y][x] === " " || grid[y][x] === "░")) put(x, y, "'");
    }
  }
  if (renewal) {                                          // the RENEWED calm reads as a DAWN, not the night it began in
    const dawn = clamp((dr - 0.78) / 0.22, 0, 1);
    const sunX = moonX, sunY = SEA_Y - 2;                 // rises where the moon set — clear of the ferry
    for (let x = 0; x < COLS; x++) if (hash(x, SEA_Y, 99) < dawn * 0.16 && grid[sunY][x] === " ") put(x, sunY, "·");
    put(sunX - 2, sunY, "-"); put(sunX - 1, sunY, "("); put(sunX, sunY, "*"); put(sunX + 1, sunY, ")"); put(sunX + 2, sunY, "-"); put(sunX, sunY - 1, ".");
  }

  // ---- SEA — per-column surf[] height-field; calm SPARSE, fills/darkens with intensity
  const swellAmp = lerp(0.20, 2.4, intensity), chop = intensity;
  const surf = new Array(COLS).fill(0);
  for (let x = 0; x < COLS; x++) {
    const swell = Math.sin(x * 0.22 + 0.4) * 0.6 + (snoise(x * 0.18 + 5, 71) - 0.5) * 1.4;
    const ripple = (snoise(x * 0.9 + 2, 81) - 0.5) * chop;
    surf[x] = swell * swellAmp + ripple * 1.3;
  }
  for (let x = 0; x < COLS; x++) {
    const crest = snoise(x * 0.7 + 9, 91);
    const topRow = SEA_Y - Math.round(clamp(surf[x], -1, 3));
    for (let y = SEA_Y - 2; y < ROWS; y++) {
      if (y < topRow) continue;
      const depth = y - topRow;
      let ch: string;
      if (y === topRow) {
        if (chop < 0.22) ch = crest > 0.62 ? "~" : "·";
        else if (chop < 0.5) ch = crest > 0.55 ? "≈" : "~";
        else if (surf[x] > swellAmp * 0.45 && crest > 0.5) ch = "'";
        else ch = crest > 0.45 ? "▁" : "≈";
      } else {
        const fill = depth + intensity * 2.4 - (1 - intensity) * 2.2;
        if (fill < 0.6) ch = chop < 0.3 ? " " : "≈";
        else if (fill < 1.6) ch = "≈"; else if (fill < 2.6) ch = "▃";
        else if (fill < 3.6) ch = "▅"; else if (fill < 4.6) ch = "▆"; else ch = "▇";
      }
      if (ch !== " ") put(x, y, ch);
    }
  }
  // the moon's / dawn's glade shimmering on calm water (longer for the DARK WATER's deep)
  if (intensity < 0.26 && (night || renewal)) {
    const glade = clamp(1 - intensity / 0.26, 0, 1);
    const gx = moonX;                                     // reflection under the moon / the dawn sun
    const depth = variant === "water" ? 4 : 2;
    for (let y = SEA_Y; y < SEA_Y + depth; y++) for (let dx = -1; dx <= 1; dx++) {
      const x = gx + dx;
      if (hash(x, y, 12) < 0.42 * glade) put(x, y, dx === 0 ? ":" : ".");
    }
  }

  // ---- HEADLANDS (strait only) — two landmasses framing the channel; a steady shore light
  if (variant === "strait") {
    for (let x = 0; x <= 4; x++) { const top = SEA_Y - 6 + x; for (let y = Math.max(0, top); y < ROWS; y++) put(x, y, y === Math.max(0, top) ? "▄" : "█"); }
    for (let x = 33; x <= 37; x++) { const top = SEA_Y - 6 + (37 - x); for (let y = Math.max(0, top); y < ROWS; y++) put(x, y, y === Math.max(0, top) ? "▄" : "█"); }
    put(34, SEA_Y - 4, renewal ? "*" : "¤");
  }

  // ---- THE FERRY — the INVARIANT (§8.15), drawn last; one rigid hull that pitches without cracking
  const sLeft = surf[fcx - 4] || 0, sRight = surf[fcx + 4] || 0;
  const bob = Math.round((surf[fcx] || 0) * 0.55);
  const pitch = clamp(Math.round((sRight - sLeft) * 0.5), -1, 1);
  const hullY = SEA_Y - 1 - bob, hullL = fcx - 5, hullR = fcx + 5;
  const deckY = (x: number) => hullY + Math.round(-pitch * ((x - hullL) / (hullR - hullL) - 0.5) * 2);
  let prevY: number | null = null;
  for (let x = hullL; x <= hullR; x++) {
    const y = deckY(x);
    put(x, y, x === hullL ? "\\" : x === hullR ? "/" : "_");
    put(x, y + 1, x === hullL ? "\\" : x === hullR ? "/" : "=");
    if (prevY != null && y !== prevY) { const lo = Math.min(y, prevY), hi = Math.max(y, prevY); for (let yy = lo; yy <= hi; yy++) if (grid[yy][x] === " ") put(x, yy, "="); }
    prevY = y;
  }
  const cabL = fcx - 2, cabR = fcx + 2, roofY = deckY(fcx) - 2, bodyY = deckY(fcx) - 1;
  for (let yy = roofY; yy <= bodyY; yy++) for (let xx = cabL; xx <= cabR; xx++) put(xx, yy, " ");
  put(cabL, roofY, "["); for (let x = cabL + 1; x < cabR; x++) put(x, roofY, "_"); put(cabR, roofY, "]");
  put(cabL, bodyY, "|"); put(fcx, bodyY, "o"); put(cabR, bodyY, "|");
  const stackX = fcx + 1, stackTop = roofY - 1;
  put(stackX, stackTop, "!");
  const windLean = intensity > 0.4 ? 1 : 0;
  let sx = stackX, sy = stackTop - 1;
  for (let i = 0; i < 2; i++) { if (sy < 0) break; sx += windLean; const g = intensity < 0.35 ? (i === 0 ? "." : null) : (i === 0 ? "~" : "'"); if (g) put(sx, sy, g); sy -= 1; }
  put(hullR, deckY(hullR), "/");
  return grid.map((row) => { let s = row.join(""); if (s.length < COLS) s += " ".repeat(COLS - s.length); else if (s.length > COLS) s = s.slice(0, COLS); return s; });
}

type Group = { id: string; name: string; settingTitle: string; storyTitles: string[]; throughline: string; env: string[]; buildingBlock: string; verdict?: string; metaphor?: string; audienceServe?: string; subrange?: { cozy: string; intense: string }[]; relate: number; safe: number; top?: boolean; picked?: boolean };

const VARIANT_OF = (id: string): Variant => (id === "strait" ? "strait" : id === "water" ? "water" : "crossing");
// the §8.13 arc gauge per phase (rises to the storm-peak, then resolves) — mirrors pilot.json SPARK
const BAR = ["▰▱▱▱▱", "▰▰▰▱▱", "▰▰▰▰▰", "▰▰▱▱▱", "▰▱▱▱▱"];

// THE WHOLE PANEL is the scrub surface (pointer drag — best on mobile; the slider thumb was too small
// to grab). touch-action pan-y lets the page still scroll vertically; horizontal drag scrubs. A slim
// bar + handle is the position read-out (not the control). Keyboard arrows for a11y (role=slider).
function OneScrubber({ g, scenes }: { g: Group; scenes: string[] }) {
  const [dr, setDr] = useState(0.0);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; dr: number } | null>(null);
  const ph = phaseOf(dr);
  const variant = VARIANT_OF(g.id);
  const down = (e: React.PointerEvent) => { box.current?.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, dr }; };
  const move = (e: React.PointerEvent) => { if (!drag.current || !box.current) return; const w = box.current.offsetWidth || 1; setDr(clamp(drag.current.dr + (e.clientX - drag.current.x) / w, 0, 1)); };
  const up = (e: React.PointerEvent) => { drag.current = null; try { box.current?.releasePointerCapture(e.pointerId); } catch {} };
  const key = (e: React.KeyboardEvent) => { if (e.key === "ArrowRight" || e.key === "ArrowUp") { setDr((d) => clamp(d + 0.05, 0, 1)); e.preventDefault(); } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setDr((d) => clamp(d - 0.05, 0, 1)); e.preventDefault(); } };
  return (
    <div ref={box} role="slider" aria-label="dynamic range — drag to scrub" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(dr * 100)} tabIndex={0}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
      style={{ border: `2px solid ${forest}`, background: paper, padding: "10px 12px 12px", touchAction: "pan-y", cursor: "ew-resize", userSelect: "none", WebkitUserSelect: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: "var(--theme-body)", fontSize: 11.5, fontWeight: 700, color: forest }}>{g.name}</span>
        {g.verdict && <span style={{ fontSize: 9.5, color: g.verdict === "distinct" ? forest : amber, border: `1px solid ${g.verdict === "distinct" ? forest : amber}`, borderRadius: 3, padding: "0 5px" }}>✓ {g.verdict}</span>}
      </div>
      {g.picked
        ? <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", color: forest, marginTop: 3 }}>● PICKED — building</div>
        : <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, color: margin, marginTop: 3 }}>○ in the bank — revivable</div>}
      {/* THE METAPHOR — the step's north-star (the surrounding focus IS the story's core metaphor) */}
      {g.metaphor && <div style={{ fontFamily: "var(--theme-display)", fontSize: 14, color: forest, margin: "3px 0 0" }}>◆ {g.metaphor}</div>}
      <div style={{ fontSize: 10, fontStyle: "italic", color: soft, margin: "1px 0 7px" }}>↳ {g.throughline}</div>
      <pre style={{ ...mono, fontSize: 11.5, color: ink, background: paper, border: `1.5px solid ${ink}`, padding: "7px 5px", margin: 0, textAlign: "center", overflow: "hidden" }}>{art(variant, dr).join("\n")}</pre>
      {/* slim position read-out (the panel itself is the scrub surface) — fill · phase ticks · handle */}
      <div style={{ position: "relative", height: 9, background: shade, border: `1.5px solid ${ink}`, margin: "10px 0 0" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${dr * 100}%`, background: forest }} />
        {[0.2, 0.4, 0.6, 0.8].map((t) => <div key={t} style={{ position: "absolute", left: `${t * 100}%`, top: -1, bottom: -1, width: 1, background: "var(--ink-soft)" }} />)}
        <div style={{ position: "absolute", left: `${dr * 100}%`, top: -4, width: 5, height: 15, background: ink, transform: "translateX(-50%)", boxShadow: "1px 1px 0 rgba(0,0,0,.2)" }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 9, color: margin, marginTop: 3, letterSpacing: ".03em" }}>↔ drag anywhere to scrub · cozy → the storm (½) → renewed</div>
      {/* the 1st title (anchor, small) then the range — all five, the active 2nd title BIG */}
      <div style={{ textAlign: "center", fontFamily: "var(--theme-body)", fontSize: 10.5, color: margin, margin: "9px 0 5px" }}>{g.settingTitle}</div>
      <div style={{ margin: "0 2px" }}>
        {g.storyTitles.map((t, i) => { const active = i === ph; return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "0.5px 0" }}>
            <span style={{ ...mono, fontSize: 8.5, color: active ? forest : margin, opacity: active ? 1 : 0.5 }}>{BAR[i]}</span>
            <span style={{ fontFamily: "var(--theme-display)", fontSize: active ? 16 : 11.5, fontWeight: active ? 700 : 400, fontStyle: active ? "normal" : "italic", color: active ? ink : soft, opacity: active ? 1 : 0.55, lineHeight: 1.1 }}>{t}</span>
          </div> ); })}
      </div>
      <div style={{ fontSize: 10, color: soft, fontStyle: "italic", margin: "5px 2px 0", paddingLeft: 16, minHeight: 24 }}><span style={{ color: forest, fontStyle: "normal" }}>{scenes[ph]}</span> — {g.env[ph]}</div>
    </div>
  );
}

// a reusable scrub control (pointer/touch drag + keyboard); the markers/handle live in the render.
function useScrub(initial: number) {
  const [v, setV] = useState(initial);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; v: number } | null>(null);
  const bind = {
    ref: box, role: "slider" as const, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(v * 100), tabIndex: 0,
    onPointerDown: (e: React.PointerEvent) => { box.current?.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, v }; },
    onPointerMove: (e: React.PointerEvent) => { if (!drag.current || !box.current) return; const w = box.current.offsetWidth || 1; setV(clamp(drag.current.v + (e.clientX - drag.current.x) / w, 0, 1)); },
    onPointerUp: (e: React.PointerEvent) => { drag.current = null; try { box.current?.releasePointerCapture(e.pointerId); } catch {} },
    onPointerCancel: (e: React.PointerEvent) => { drag.current = null; try { box.current?.releasePointerCapture(e.pointerId); } catch {} },
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "ArrowRight" || e.key === "ArrowUp") { setV((d) => clamp(d + 0.05, 0, 1)); e.preventDefault(); } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setV((d) => clamp(d - 0.05, 0, 1)); e.preventDefault(); } },
  };
  return { v, bind };
}

// THE STORY BUILD — the picked story's own page, ONE scrubber. The track is divided into the scene
// markers; INSIDE the active segment lives the tone gradient — so a single drag gives BOTH the
// world-moment (which segment) AND the tone within it (where in the segment). The art is frozen per
// world-moment; the story beneath updates as you move within the segment (cozy · warm · intense).
type Tone = { label: string; text: string };
type Ambient = { id: string; name: string; base: string; ink: string; accent: string; why: string };
type Character = { name: string; color: string; is: string; joinsAt: string };
type VetA = { id: string; conveys_metaphor: string; safe_floor: string; arc_fit: string; note: string };
type Vet = { best: string; ambients: VetA[]; characterHarmony: string; contrastFlags: string[]; oneLine: string };
type Prompts = { characters: string[]; objects: string[]; trophy: string[]; items: string[]; achievementIcons: string[] };
type Prose = { objectSeeds: { dominant: string[]; accent: string[] }; diction: { cool: string[]; warm: string[] }; rules: string[]; example: string };
type Mood = { ambients: Ambient[]; characters: Character[]; eli5: string; vet?: Vet; prompts?: Prompts; prose?: Prose };
type StoryT = { id: string; env: string[]; subrange?: Tone[][]; mood?: Mood };
export function StoryBuild({ story, scenes }: { story: StoryT; scenes: string[] }) {
  const main = useScrub(0.1);                                   // ONE scrub: segment = scene, within = tone
  const [amb, setAmb] = useState(0);                           // the picked ambient mood (the audition)
  const N = Math.max(1, scenes.length);
  const seg = Math.min(N - 1, Math.floor(main.v * N));          // the world-moment (the segment)
  const within = clamp(main.v * N - seg, 0, 1);                 // position WITHIN the segment (0..1)
  const tones = story.subrange?.[seg] ?? [];
  const last = Math.max(1, tones.length - 1);
  const ti = tones.length ? Math.min(tones.length - 1, Math.round(within * last)) : 0;
  const beat = tones[ti];
  const variant = VARIANT_OF(story.id);
  const sceneDr = (seg + 0.5) / N;                              // FROZEN per world-moment
  const hot = (l?: string) => (l === "intense" ? "var(--spot-red)" : forest);
  const A = story.mood?.ambients?.[amb];
  const artInk = A?.ink ?? ink, artBg = A?.base ?? paper;
  // the ambient palette GROWS slightly with the tone (the carry joins as it warms)
  const swatches = (A ? [{ c: A.base, label: "the deep", join: 0 }, { c: A.ink, label: "the light", join: 0 }, { c: A.accent, label: "the carry", join: 1 }] : []).filter((s) => s.join <= ti);
  // readable text on a coloured chip (perceived luminance)
  const readOn = (hex: string) => { const c = hex.replace("#", ""); const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16)); return 0.299 * r + 0.587 * g + 0.114 * b > 140 ? "#11181f" : "#eef2f6"; };
  const vet = story.mood?.vet;
  const vetA = vet?.ambients?.find((x) => x.id === A?.name || x.id === A?.id);
  const vcol = (s?: string) => (s === "yes" || s === "safe" || s === "holds" ? forest : s === "weak" || s === "partial" || s === "risky" ? amber : "var(--spot-red)");
  return (
    <div>
      {/* ONE scrubber — the art (frozen per world-moment) + a SEGMENTED track. The active segment fills
          with the tone gradient (cozy→intense); the handle inside it = the tone. */}
      <div {...main.bind} aria-label="the crossing — drag; each scene holds its tone"
        style={{ border: `2px solid ${forest}`, background: paper, padding: "10px 12px 12px", touchAction: "pan-y", cursor: "ew-resize", userSelect: "none", WebkitUserSelect: "none" }}>
        <pre style={{ ...mono, fontSize: 12.5, color: artInk, background: artBg, border: `1.5px solid ${artInk}`, padding: "8px 6px", margin: 0, textAlign: "center", overflow: "hidden", transition: "background .25s, color .25s" }}>{art(variant, sceneDr).join("\n")}</pre>
        {/* the segmented track: passed = solid · active = the tone gradient · ahead = muted */}
        <div style={{ position: "relative", height: 13, margin: "10px 0 0" }}>
          <div style={{ display: "flex", height: 11, border: `1.5px solid ${ink}` }}>
            {scenes.map((_, i) => (
              <div key={i} style={{ flex: 1, borderRight: i < N - 1 ? `1px solid ${ink}` : "none",
                background: i === seg ? `linear-gradient(90deg, ${forest}, var(--spot-red))` : shade,
                opacity: i === seg ? 1 : i < seg ? 0.75 : 0.4 }} />
            ))}
          </div>
          <div style={{ position: "absolute", left: `${main.v * 100}%`, top: -3, width: 5, height: 17, background: ink, transform: "translateX(-50%)", boxShadow: "1px 1px 0 rgba(0,0,0,.25)" }} />
        </div>
        {/* the scene names under each segment (the active one lit) */}
        <div style={{ display: "flex", marginTop: 3 }}>
          {scenes.map((s, i) => <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 8, lineHeight: 1.2, color: i === seg ? forest : margin, fontWeight: i === seg ? 700 : 400, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", padding: "0 1px" }}>{s}</span>)}
        </div>
        <div style={{ textAlign: "center", fontSize: 9, color: margin, marginTop: 5, letterSpacing: ".03em" }}>↔ drag the crossing · inside each scene, the tone runs <span style={{ color: forest }}>cozy</span> → <span style={{ color: "var(--spot-red)" }}>intense</span></div>
      </div>

      {/* the world-moment + an EXAMPLE of the kind of scene at the current tone (NOT the final story) */}
      <div style={{ fontSize: 11, color: soft, fontStyle: "italic", margin: "10px 2px 0", paddingLeft: 2 }}><span style={{ color: forest, fontStyle: "normal", fontWeight: 700, letterSpacing: ".04em" }}>{scenes[seg]}</span> — {story.env[seg]}</div>
      <div style={{ fontSize: 9.5, color: margin, fontStyle: "italic", margin: "7px 2px 0", paddingLeft: 2 }}>↳ EXAMPLE scenes — variations to feel the tone &amp; range here; not the authored story (the real beats come later).</div>
      {beat && (
        <div style={{ border: `2px solid ${hot(beat.label)}`, background: shade, padding: "11px 13px", marginTop: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
            <span style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: hot(beat.label) }}>↕ {beat.label.toUpperCase()} — an example scene</span>
            <span style={{ fontSize: 9, color: margin }}>{tones.map((t, i) => <span key={i} style={{ color: i === ti ? hot(t.label) : margin, fontWeight: i === ti ? 700 : 400 }}>{i ? " · " : ""}{t.label}</span>)}</span>
          </div>
          <div style={{ fontSize: 14.5, color: ink, lineHeight: 1.55, minHeight: 50 }}>{beat.text}</div>
        </div>
      )}

      {/* THE TONE & MOOD — pick the ambient palette (the mood) · it grows with the tone · ELI5 the
          colours. The CREW's own palettes move to the tone step (the cast-set makeup). */}
      {A && (
        <div style={{ border: `2px solid ${forest}`, background: paper, padding: "11px 13px", marginTop: 14 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 3 }}>🎨 TONE &amp; MOOD — pick the ambient palette (the mood)</div>
          <div style={{ fontSize: 10, color: margin, marginBottom: 8, lineHeight: 1.5 }}>the GATES: it must <b>convey the metaphor</b> · stay <b>safe</b> (never oppressive) · <b>hold across the arc</b> · pass <b>contrast</b>. Reviewed by a VN colour director + WCAG.</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 9 }}>
            {story.mood!.ambients.map((a, i) => { const on = i === amb, best = a.id === vet?.best; return (
              <button key={a.id} onClick={() => setAmb(i)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", border: `2px solid ${on ? forest : "var(--ink-soft)"}`, background: on ? shade : paper, padding: "4px 8px" }}>
                <span style={{ display: "flex" }}>{[a.base, a.ink, a.accent].map((c, j) => <span key={j} style={{ width: 11, height: 16, background: c, border: `1px solid ${ink}`, marginLeft: j ? -1 : 0 }} />)}</span>
                <span style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, color: on ? forest : margin }}>{best ? "✓ " : ""}{a.name}</span>
              </button> ); })}
          </div>
          {vetA && (
            <div style={{ border: `1.5px dashed ${forest}`, background: shade, padding: "8px 11px", marginBottom: 10, fontSize: 10.5, lineHeight: 1.5, color: ink }}>
              <span style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: forest }}>🎨 COLOUR VET · {A!.name}</span>{A!.id === vet?.best && <span style={{ color: forest, fontWeight: 700 }}> · recommended</span>}
              <span style={{ marginLeft: 6 }}>metaphor <b style={{ color: vcol(vetA.conveys_metaphor) }}>{vetA.conveys_metaphor}</b> · safe <b style={{ color: vcol(vetA.safe_floor) }}>{vetA.safe_floor}</b> · arc <b style={{ color: vcol(vetA.arc_fit) }}>{vetA.arc_fit}</b> · contrast <b style={{ color: vet!.contrastFlags.length ? "var(--spot-red)" : forest }}>{vet!.contrastFlags.length ? "flags" : "all pass"}</b></span>
              <div style={{ color: soft, fontStyle: "italic", marginTop: 3 }}>{vetA.note}</div>
              {vet!.oneLine && <div style={{ color: margin, marginTop: 3 }}>↳ {vet!.oneLine}</div>}
            </div>
          )}
          <div style={{ fontSize: 9.5, color: margin, fontStyle: "italic", marginBottom: 10, borderLeft: `2px solid var(--ink-soft)`, paddingLeft: 8 }}>↳ the crew’s own palettes (and their asset prompts) are auditioned in the <b style={{ color: forest }}>SUBRANGE step</b> — the cast-set makeup — not here. This page sets the <b>ambient ground</b> they’ll wear.</div>
          <div style={{ fontSize: 10.5, color: ink, lineHeight: 1.5, borderTop: "1px solid var(--ink-soft)", paddingTop: 8 }}><span style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: forest }}>WHY THESE COLOURS · ELI5 </span>{story.mood!.eli5}</div>
          <div style={{ fontSize: 10, color: soft, fontStyle: "italic", marginTop: 5, marginBottom: 11 }}>↳ {A.name}: {A.why}</div>
          {/* the palette swatches — placed LAST so the colours sit right above the UI built from them */}
          <div style={{ fontSize: 10, color: margin, marginBottom: 4 }}>the ambient palette at <b style={{ color: hot(beat?.label) }}>{beat?.label ?? "—"}</b> · <b style={{ color: ink }}>{swatches.length} colours</b> <span style={{ fontStyle: "italic" }}>(the carry joins as it warms)</span></div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {swatches.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 38, height: 24, background: s.c, border: `1.5px solid ${ink}` }} />
                <div style={{ fontSize: 7.5, color: margin, marginTop: 1, maxWidth: 42, lineHeight: 1.1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UI FROM THE AMBIENT — the chrome wears the mood; the DIALOGUE BOX is the centrepiece */}
      {A && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 8 }}>🖥 UI FROM THE AMBIENT — the chrome wears the mood</div>
          <div style={{ background: A.base, border: `2px solid ${A.accent}`, padding: "12px 14px 13px", boxShadow: "3px 3px 0 rgba(0,0,0,.22)" }}>
            <div style={{ color: A.ink, fontSize: 14.5, lineHeight: 1.55 }}>{beat?.text ?? "…"} <span style={{ color: A.accent }}>▾</span></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 9, flexWrap: "wrap" }}>
            <span style={{ background: A.accent, color: readOn(A.accent), fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 11, padding: "5px 11px", border: `1.5px solid ${A.ink}` }}>▸ stay with it</span>
            <span style={{ background: A.base, color: A.ink, fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 11, padding: "5px 11px", border: `1.5px solid ${A.accent}` }}>let go</span>
            <span style={{ flex: 1, minWidth: 110, height: 11, background: A.base, border: `1.5px solid ${A.accent}`, position: "relative", display: "inline-block" }}>
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "62%", background: A.accent, opacity: 0.85 }} />
            </span>
          </div>
          <div style={{ fontSize: 9.5, color: margin, fontStyle: "italic", marginTop: 6 }}>the dialogue box · choices · the stat bar — all from the ambient (base · ink · accent). <span style={{ color: "var(--spot-red)" }}>The line is an example.</span></div>
        </div>
      )}

      {/* PROMPT-FRIENDLY COLOURS — natural-language colour phrases from the palette, for generating assets */}
      {story.mood?.prompts && (
        <div style={{ border: `2px solid ${forest}`, background: paper, padding: "11px 13px", marginTop: 14 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 7 }}>🧩 PROMPT-FRIENDLY COLOURS — the world’s assets <span style={{ color: margin, fontWeight: 400 }}>· objects · trophies · items · icons (character prompts live in the tone step)</span></div>
          {([["objects", "OBJECTS"], ["trophy", "TROPHY"], ["items", "ITEMS"], ["achievementIcons", "ACHIEVEMENT ICONS"]] as const).map(([k, label]) => {
            const list = story.mood!.prompts![k];
            if (!list?.length) return null;
            return (
              <div key={k} style={{ marginTop: 8 }}>
                <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 3 }}>{label}</div>
                <div style={{ display: "grid", gap: 3 }}>
                  {list.map((s, i) => <div key={i} style={{ fontSize: 11, color: ink, lineHeight: 1.45, paddingLeft: 11, position: "relative" }}><span style={{ position: "absolute", left: 0, color: margin }}>·</span>{s}</div>)}
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 9.5, color: margin, fontStyle: "italic", marginTop: 9, borderTop: "1px solid var(--ink-soft)", paddingTop: 7 }}>↳ these feed the asset / icon prompts downstream — the colour language a generator reads, derived from the picked ambient. Examples; re-derive if the palette changes.</div>
        </div>
      )}

      {/* PALETTE → PROSE — colour as TEXT: the palette steers which objects a scene seeds + how the
          prose is worded (deep-research: research-color-in-text.md) */}
      {story.mood?.prose && A && (
        <div style={{ border: `2px solid ${forest}`, background: paper, padding: "11px 13px", marginTop: 14 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 3 }}>✍ PALETTE → PROSE — the palette also steers the WRITING <span style={{ color: margin, fontWeight: 400 }}>· deep-research</span></div>
          <div style={{ fontSize: 9.5, color: margin, fontStyle: "italic", marginBottom: 9 }}>no pixels here: colour lives in the OBJECTS a scene seeds + the WORDS used (the hue is never named).</div>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 3 }}>SEED THE SCENE — the palette's objects</div>
          <div style={{ fontSize: 11, color: ink, lineHeight: 1.5, marginBottom: 8 }}>
            <div><b style={{ color: A.accent }}>cool ◂</b> {story.mood!.prose!.objectSeeds.dominant.join(" · ")}</div>
            <div><b style={{ color: "var(--spot-red)" }}>warm ▸</b> {story.mood!.prose!.objectSeeds.accent.join(" · ")}</div>
          </div>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 3 }}>DICTION — the exact word carries the tone</div>
          <div style={{ fontSize: 11, color: ink, lineHeight: 1.5, marginBottom: 8 }}>
            <div><b style={{ color: A.accent }}>cool</b> {story.mood!.prose!.diction.cool.join(", ")}</div>
            <div><b style={{ color: "var(--spot-red)" }}>warm</b> {story.mood!.prose!.diction.warm.join(", ")}</div>
          </div>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 3 }}>THE RULES</div>
          <div style={{ display: "grid", gap: 3, marginBottom: 9 }}>
            {story.mood!.prose!.rules.map((r, i) => <div key={i} style={{ fontSize: 10.5, color: ink, lineHeight: 1.45, paddingLeft: 11, position: "relative" }}><span style={{ position: "absolute", left: 0, color: margin }}>·</span>{r}</div>)}
          </div>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 4 }}>↳ A BEAT, PALETTE-STEERED <span style={{ color: margin, fontWeight: 400 }}>(example — shown in the palette)</span></div>
          <div style={{ background: A.base, color: A.ink, border: `2px solid ${A.accent}`, padding: "11px 13px", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>{story.mood!.prose!.example}</div>
        </div>
      )}
    </div>
  );
}

// THE TONE BUILD — the picked story's MAKEUP, auditioned (in-game the reader DIALS THE TONE). EXPERTS
// the audience frames the state of mind → the MAKEUP BRIEF. (2) THE CAST-SET AUDITION: the crew, tone-
// mapped (cozy → warm → intense, worn over the story's ambient ground), judged for cohesion · contrast
// · safe. The makeup lives HERE (not the story step) — the story step is the ambient ground it wears.
type Expert = { name: string; role: string; mindset: string; colours: string; cast: string; donts: string };
type Framework = { palette: string; cast: string; tones: string; floor: string };
type ExpertVet = { perExpert: { name: string; trueToAudience: string; safe: string; note: string }[]; missing: string[]; frameworkSound: string; oneLine: string };
type SubAudit = { tones: string[]; focal: string[]; cohesion: string; contrast: string; safeFloor: string; perTone: { tone: string; holds: string; note: string }[]; oneLine: string };
type CastSet = { id: string; name: string; map: { cozy: string[]; warm: string[]; intense: string[] }; deepening: string };
type CastVerdict = { id: string; cohesion: string; contrast: string; safe: string; resonance: string; note: string };
type CastAudition = { sets: CastSet[]; perSet: CastVerdict[]; winner: string; winnerName: string; why: string; runnerUp: string; runnerUpGem: string };
type MirrorCond = { id: string; label: string; from: string };
type MirrorT = { kind: string; premise: string; conditions: MirrorCond[]; perTone: { tone: string; text: string }[]; vet: { perCondition: { id: string; met: string; note: string }[]; perTone: { tone: string; holds: string; note: string }[]; safe: string; oneLine: string } };
type ToneContent = { focal: string; coachVoice: string; sampleLines: string[]; beats: string[]; narrowedBy: string };
export type ToneT = { audience: string; experts: Expert[]; framework: Framework; vet: ExpertVet; characters: Character[]; charPrompts: string[]; audit: SubAudit; ambientName: string; ambientBase: string; castAudition?: CastAudition; mirror?: MirrorT; content?: { [tone: string]: ToneContent } };
const TONE_C: Record<string, string> = { cozy: "#c0795c", warm: "#6b8ba6", intense: "#c98a3e" };
const auditGood = (v: string) => ["cohesive", "distinct", "safe", "yes"].includes(v);

export function ToneBuild({ d }: { d: ToneT }) {
  const red = "var(--spot-red)";
  const ca = d.castAudition;
  const mir = d.mirror;
  const noThe = (n: string) => n.replace(/^the /i, "");
  const mirrorAt = (t: string) => mir?.perTone.find((m) => m.tone.toLowerCase() === t.toLowerCase());
  const charsAt = (t: string) => d.characters.filter((c) => c.joinsAt.toLowerCase() === t.toLowerCase());
  return (
    <div>
      {/* CARRIED — the ambient ground from the story step */}
      <div style={{ border: `2px dashed ${forest}`, background: shade, padding: "10px 14px", margin: "0 0 16px", fontSize: 11.5, color: ink, lineHeight: 1.5 }}>
        <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 6 }}>↩ CARRIED FROM THE STORY STEP — the ground the makeup is worn over</div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 26, height: 26, background: d.ambientBase, border: `1px solid ${ink}`, display: "inline-block", borderRadius: 3, flexShrink: 0 }} />
          <span>the ambient palette <b>{d.ambientName}</b> <code style={{ fontSize: 10, color: margin }}>{d.ambientBase}</code> — the world&rsquo;s base mood. Every cast palette below DERIVES from it.</span>
        </div>
      </div>

      {/* ⓪ EXPERTS FIRST */}
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 3 }}>⓪ EXPERTS FIRST — frame the audience, then build the makeup</div>
      <div style={{ fontSize: 11.5, color: soft, lineHeight: 1.5, marginBottom: 9 }}>experts <b>matched to the audience</b> ({d.audience}) framed the state of mind; their synthesis is the MAKEUP BRIEF the audition judges against.</div>
      <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
        {d.experts.map((e) => {
          const v = d.vet.perExpert.find((p) => p.name === e.name);
          return (
            <div key={e.name} style={{ border: `1px solid ${soft}`, background: paper, padding: "9px 12px", fontSize: 11, color: ink, lineHeight: 1.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span><b style={{ fontSize: 12 }}>{e.name}</b> <span style={{ color: margin, fontSize: 10.5 }}>· {e.role}</span></span>
                {v && <span style={{ fontSize: 9, color: v.trueToAudience === "yes" && v.safe === "yes" ? forest : amber, whiteSpace: "nowrap" }}>✓ true-to-audience · safe</span>}
              </div>
              <div style={{ color: soft, marginTop: 3 }}>{e.mindset}</div>
              <div style={{ marginTop: 4 }}><span style={{ color: margin }}>↳ colours:</span> {e.colours}</div>
              <div><span style={{ color: margin }}>↳ cast:</span> {e.cast}</div>
              <div><span style={{ color: red }}>⚑ don&rsquo;ts:</span> {e.donts}</div>
            </div>
          );
        })}
      </div>

      {/* THE MAKEUP BRIEF */}
      <div style={{ border: `2px solid ${forest}`, background: shade, padding: "11px 14px", marginBottom: 16, fontSize: 11, color: ink, lineHeight: 1.55 }}>
        <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".07em", color: forest, marginBottom: 5 }}>▣ THE MAKEUP BRIEF — what the cast-set audition judges against</div>
        <div><b>palette</b> · {d.framework.palette}</div>
        <div style={{ marginTop: 3 }}><b>cast</b> · {d.framework.cast}</div>
        <div style={{ marginTop: 3 }}><b>tones</b> · {d.framework.tones}</div>
        <div style={{ marginTop: 5, color: forest, fontStyle: "italic" }}>⚑ the floor (unanimous): {d.framework.floor}</div>
        <div style={{ marginTop: 6, paddingTop: 5, borderTop: `1px solid ${soft}`, fontSize: 9.5, color: margin }}>
          <b style={{ color: forest }}>VET</b> framework <b style={{ color: d.vet.frameworkSound === "yes" ? forest : amber }}>{d.vet.frameworkSound}</b> · {d.vet.missing.length ? `missing: ${d.vet.missing.join(", ")}` : "no facet missed"} <span style={{ fontStyle: "italic" }}>— {d.vet.oneLine}</span>
        </div>
      </div>

      {/* ⑃ THE CAST-SET AUDITION — rival makeups */}
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 3 }}>⑃ THE CAST-SET AUDITION — rival makeups, judged against the brief</div>
      <div style={{ fontSize: 11.5, color: soft, lineHeight: 1.5, marginBottom: 9 }}>the crew is FIXED (4 hands); the rivals differ in <b>who carries the intense &ldquo;surrender at your lowest&rdquo;</b>. Each is judged for <b>COHESION · CONTRAST · SAFE · RESONANCE</b> — pick the most cohesive.</div>
      {ca && (
        <>
          <div style={{ display: "grid", gap: 8, marginBottom: 9 }}>
            {ca.sets.map((s) => {
              const verdict = ca.perSet.find((p) => p.id === s.id);
              const won = s.id === ca.winner, runner = s.id === ca.runnerUp;
              return (
                <div key={s.id} style={{ border: `2px ${won ? "solid" : "dashed"} ${won ? forest : soft}`, background: won ? shade : paper, padding: "9px 12px", fontSize: 10.5, color: ink, lineHeight: 1.5 }}>
                  <div><b style={{ fontSize: 12, color: won ? forest : ink }}>{s.name}</b> {won && <span style={{ fontSize: 9, color: forest, fontWeight: 700 }}>★ MOST COHESIVE</span>}{runner && <span style={{ fontSize: 9, color: amber }}>· runner-up</span>}</div>
                  <div style={{ fontSize: 9.5, color: margin, marginTop: 2 }}>cozy: {s.map.cozy.map(noThe).join(" + ")} · warm: {s.map.warm.map(noThe).join(" + ")} · <b style={{ color: TONE_C.intense }}>intense: {s.map.intense.map(noThe).join(" + ")}</b></div>
                  <div style={{ color: soft, marginTop: 3 }}>{s.deepening}</div>
                  {verdict && <div style={{ fontSize: 9, color: margin, marginTop: 4 }}>cohesion <b style={{ color: auditGood(verdict.cohesion) ? forest : amber }}>{verdict.cohesion}</b> · contrast <b style={{ color: auditGood(verdict.contrast) ? forest : amber }}>{verdict.contrast}</b> · safe <b style={{ color: auditGood(verdict.safe) ? forest : red }}>{verdict.safe}</b> · resonance <b style={{ color: verdict.resonance === "strong" ? forest : amber }}>{verdict.resonance}</b> <span style={{ fontStyle: "italic" }}>— {verdict.note}</span></div>}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 10.5, color: ink, marginBottom: 15, lineHeight: 1.5 }}>
            <div><b style={{ color: forest }}>★ why {ca.winnerName} won:</b> {ca.why}</div>
            <div style={{ color: margin, marginTop: 2, fontStyle: "italic" }}>↳ runner-up gem to fold back later: {ca.runnerUpGem}</div>
          </div>
        </>
      )}

      {/* ▣ THE WINNING MAKEUP — the per-tone detail of the won set */}
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 3 }}>▣ THE WINNING MAKEUP{ca ? ` — ${ca.winnerName}` : ""} · tone-mapped over {d.ambientName}</div>
      <div style={{ fontSize: 11, color: soft, lineHeight: 1.5, marginBottom: 10 }}>the won set, the crew HOLDING across the tones (the cohesion test) — each character&rsquo;s palette derived from the ambient.{mir ? " Plus the FELLOW TRAVELER (↣) — the audience's own problem, witnessed." : ""}</div>

      {/* ✦ THE FELLOW TRAVELER — the mirror, gated against the panel's conditions */}
      {mir && (
        <div style={{ border: `2px solid ${forest}`, background: shade, padding: "10px 13px", marginBottom: 12, fontSize: 10.5, color: ink, lineHeight: 1.5 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 3 }}>✦ THE FELLOW TRAVELER — the mirror (audited per the panel)</div>
          <div style={{ color: soft }}>{mir.premise}. Not a rival, not the protagonist — a <b>fellow traveler</b> you witness, per tone (the care stays constant). The panel set four ship-blocker conditions; each is gated:</div>
          <div style={{ marginTop: 6, display: "grid", gap: 3 }}>
            {mir.conditions.map((c) => {
              const vc = mir.vet.perCondition.find((p) => p.id === c.id);
              const ok = vc?.met === "yes";
              return (
                <div key={c.id} style={{ fontSize: 9.5 }}>
                  <b style={{ color: ok ? forest : amber }}>{ok ? "✓" : "⚑"} {c.id}</b> <span style={{ color: margin }}>({c.from})</span> <span style={{ color: soft }}>— {c.label.replace(/ —.*/, "")}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 6, paddingTop: 5, borderTop: `1px solid ${soft}`, fontSize: 9.5, color: margin }}>
            <b style={{ color: mir.vet.safe === "safe" ? forest : red }}>{mir.vet.safe.toUpperCase()}</b> <span style={{ fontStyle: "italic" }}>— {mir.vet.oneLine}</span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 11 }}>
        {d.audit.tones.map((t, i) => {
          const pt = d.audit.perTone.find((p) => p.tone.toLowerCase() === t.toLowerCase());
          const col = TONE_C[t.toLowerCase()] ?? soft;
          return (
            <div key={t} style={{ border: `2px solid ${col}`, background: paper, padding: "9px 10px", fontSize: 10.5, color: ink }}>
              <div style={{ fontWeight: 700, textTransform: "capitalize", color: col, fontSize: 12.5 }}>{t}</div>
              <div style={{ fontSize: 9, color: margin, marginBottom: 6 }}>focal: {d.audit.focal[i]}</div>
              {charsAt(t).map((c) => (
                <div key={c.name} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ width: 13, height: 13, background: c.color, border: `1px solid ${ink}`, flexShrink: 0, marginTop: 1, borderRadius: 2 }} />
                  <span><b>{c.name.replace(/^the /i, "")}</b> <span style={{ color: soft }}>— {c.is}</span></span>
                </div>
              ))}
              {mirrorAt(t) && <div style={{ fontSize: 9.5, color: soft, marginTop: 5, paddingTop: 4, borderTop: `1px dashed ${soft}`, fontStyle: "italic", lineHeight: 1.45 }}><b style={{ color: margin, fontStyle: "normal" }}>↣ the traveler</b> — {mirrorAt(t)!.text}</div>}
              {pt && <div style={{ fontSize: 9, color: pt.holds === "yes" ? forest : amber, fontStyle: "italic", marginTop: 5, paddingTop: 4, borderTop: `1px solid ${soft}` }}>{pt.holds === "yes" ? "✓" : "⚑"} {pt.note}</div>}
            </div>
          );
        })}
      </div>

      {/* the cast prompts */}
      <div style={{ border: `1px solid ${soft}`, background: shade, padding: "9px 12px", marginBottom: 11, fontSize: 10, color: ink, lineHeight: 1.55 }}>
        <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 4 }}>🎨 CAST PROMPTS — prompt-friendly, each derived from the ambient</div>
        {d.charPrompts.map((p, i) => <div key={i} style={{ color: soft, marginBottom: 2 }}>· {p}</div>)}
      </div>

      {/* the verdict */}
      <div style={{ border: `2px solid ${forest}`, background: shade, padding: "10px 14px", fontSize: 11, color: ink }}>
        <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: forest }}>🎭 TONAL VET</span>{" "}
        cohesion <b style={{ color: auditGood(d.audit.cohesion) ? forest : amber }}>{d.audit.cohesion}</b> · contrast <b style={{ color: auditGood(d.audit.contrast) ? forest : amber }}>{d.audit.contrast}</b> · floor <b style={{ color: auditGood(d.audit.safeFloor) ? forest : red }}>{d.audit.safeFloor}</b>
        <div style={{ color: soft, fontStyle: "italic", marginTop: 3 }}>↳ {d.audit.oneLine}</div>
      </div>

      {d.content && Object.entries(d.content).map(([tone, ct]) => (
        <div key={tone} style={{ border: `2px solid ${forest}`, background: shade, padding: "11px 14px", marginTop: 13, fontSize: 11, color: ink, lineHeight: 1.55 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 4 }}>▸ THE <span style={{ textTransform: "uppercase" }}>{tone}</span> CONTENT — the floor, built first · focal: {ct.focal}</div>
          <div><b>coach voice:</b> {ct.coachVoice}</div>
          <div style={{ marginTop: 5 }}><b>sample lines:</b></div>
          {ct.sampleLines.map((l, i) => <div key={i} style={{ color: soft, marginLeft: 8, fontStyle: "italic" }}>“{l}”</div>)}
          <div style={{ marginTop: 5 }}><b>beats:</b></div>
          {ct.beats.map((b, i) => <div key={i} style={{ color: soft, marginLeft: 8 }}>· {b}</div>)}
          <div style={{ marginTop: 6, paddingTop: 5, borderTop: `1px solid ${soft}`, fontSize: 10, color: margin, fontStyle: "italic" }}>↳ the factors narrowed this: {ct.narrowedBy}</div>
        </div>
      ))}
      {!d.content && <div style={{ fontSize: 10, color: margin, marginTop: 11, fontStyle: "italic", lineHeight: 1.5 }}>↓ this set passes the floor. The per-tone CONTENT (chat → beats) is built <b>cozy-first</b> (next).</div>}
    </div>
  );
}

// THE WORLD-BUILDER'S READ — the review lens for this step (replaces the audience cards here): it
// explains the BUILDING BLOCKS each candidate hands the next step (the user's call — worldbuilders
// fit this step better than audience).
function WorldBuilderRead({ groups, richest, picked, note }: { groups: Group[]; richest?: string; picked?: string; note?: string }) {
  const minSafe = Math.min(...groups.map((g) => g.safe));
  const lead = picked ?? richest;
  return (
    <div style={{ border: `2px dashed ${forest}`, background: shade, padding: "11px 14px", margin: "12px 0 0" }}>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 5 }}>🛠 THE WORLD-BUILDER’S READ — the METAPHOR each finds (the step’s north-star)</div>
      <div style={{ fontSize: 11, color: ink, lineHeight: 1.5, marginBottom: 7 }}>This step is about finding the right <b style={{ color: forest }}>metaphor</b> — the surrounding focus IS the story’s core metaphor for healing. All three came back <b style={{ color: forest }}>distinct</b>. The audience (anxiety · low self-worth · ADHD) is carried as <i>context</i> — each metaphor’s healing speaks to one facet:</div>
      <div style={{ display: "grid", gap: 7 }}>
        {groups.map((g) => (
          <div key={g.id} style={{ fontSize: 11, color: ink, lineHeight: 1.4, borderLeft: `2px solid ${g.id === lead ? forest : "var(--ink-soft)"}`, paddingLeft: 8 }}>
            <div><b style={{ color: g.id === lead ? forest : ink }}>{g.id === picked ? "● " : ""}{g.name}</b> {g.metaphor && <span style={{ color: forest, fontFamily: "var(--theme-display)" }}>«{g.metaphor}»</span>}</div>
            <div style={{ color: ink }}><span style={{ color: margin }}>→ next step:</span> {g.buildingBlock}</div>
            {g.audienceServe && <div style={{ color: soft, fontStyle: "italic", fontSize: 10 }}>↳ serves: {g.audienceServe}</div>}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9.5, color: margin, fontStyle: "italic", marginTop: 8, paddingTop: 6, borderTop: "1px solid var(--ink-soft)", lineHeight: 1.5 }}>
        ● <b style={{ color: forest }}>picked: {groups.find((g) => g.id === picked)?.name ?? "—"}</b> (the world-builder’s richest metaphor){note ? ` — ${note}` : ""} · floor clean (§8.15) · audience safety held (≥{minSafe.toFixed(1)} all three).
      </div>
    </div>
  );
}

// Candidates live in TABS (one environment at a time); the richest is ◆ and the default.
export default function Scrubber({ scenes, groups, richest, picked, note }: { scenes: string[]; groups: Group[]; richest?: string; picked?: string; note?: string }) {
  const lead = picked ?? richest;
  const [active, setActive] = useState(Math.max(0, groups.findIndex((x) => x.id === lead)));
  const g = groups[active] ?? groups[0];
  return (
    <div style={{ margin: "0 0 18px" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {groups.map((x, i) => { const on = i === active; return (
          <button key={x.id} onClick={() => setActive(i)} style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, padding: "6px 12px", cursor: "pointer", border: `2px solid ${on ? forest : "var(--ink-soft)"}`, borderBottom: `2px solid ${on ? forest : "var(--ink-soft)"}`, background: on ? forest : paper, color: on ? paper : margin, marginBottom: -2, position: "relative", zIndex: on ? 2 : 1 }}>
            {x.id === picked ? "● " : ""}{x.name}
          </button> ); })}
      </div>
      <OneScrubber g={{ ...g, picked: g.id === picked }} scenes={scenes} />
      <WorldBuilderRead groups={groups} richest={richest} picked={picked} note={note} />
    </div>
  );
}
