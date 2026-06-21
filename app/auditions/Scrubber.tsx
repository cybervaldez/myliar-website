"use client";
// THE SCRUBBER — the player-facing scrub of the SETTING's surrounding environment, in the bench's
// style (a live <input type="range"> + procedural ASCII). The dial IS the DYNAMIC RANGE (§8.13): the
// WEATHER arcs across the five phases — COZY (0-20) · HEIGHTENED (20-40) · INTENSE/peak (40-60) ·
// AFTERMATH/rebuild (60-80) · RENEWAL (80-100) — calm, builds to the storm-peak, then RESOLVES to a
// renewed dawn. The WORLD holds through all of it (§8.15 — the ferry never becomes a lighthouse);
// only the weather arcs. EACH candidate gets its OWN environment, distinct by structure: the STRAIT
// (two headlands framing a channel), the CROSSING (a far shore on the horizon), the DARK WATER (a
// vast high-horizon deep). Authored in the ASCII-art commission's demoscene/ANSI tradition.
import { useState, useRef, Fragment } from "react";

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

      {/* the ambient-palette AUDITION moved to the SCENES step (2026-06-16) — auditioned per weather-moment
          there. This page keeps the SETTING build (UI · asset colours · prose recipe) from the base ambient. */}
      {A && (
        <div style={{ border: `1.5px dashed ${forest}`, background: shade, padding: "9px 12px", marginTop: 14, fontSize: 11, color: ink, lineHeight: 1.55 }}>
          <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: forest }}>🎨 AMBIENT PALETTE + its UI → MOVED to the SCENES step</span> — the palette is auditioned <b>per weather-moment</b> at the Scenes hub (the matrix), and the ambient-derived UI — the <b>UI-from-palette</b> (dialogue box), the <b>prompt-friendly colours</b>, and the <b>palette→prose</b> recipe — now lives on <b>each scene page</b>, each using its own palette. The Story step keeps the world-moments scrubber + the setting.
        </div>
      )}

      {/* the ambient-derived UI (UI-from-palette · prompt colours · palette→prose) moved to each SCENE page
          (2026-06-17) — each weather-moment derives them from its OWN palette. */}
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
type ToneContent = { focal: string; coachVoice: string; sampleLines: string[]; beats: string[]; narrowedBy: string; vet?: { perExpert: { name: string; honored: string; note: string }[]; safe: string; fixes: string[]; oneLine: string } };
type ToneSupport = { focal: string; supporting: { who: string; presence: string }[]; honorsFloor: string; note: string };
export type ToneT = { audience: string; experts: Expert[]; framework: Framework; vet: ExpertVet; characters: Character[]; charPrompts: string[]; audit: SubAudit; ambientName: string; ambientBase: string; castAudition?: CastAudition; mirror?: MirrorT; content?: { [tone: string]: ToneContent }; support?: { [tone: string]: ToneSupport } };
const TONE_C: Record<string, string> = { cozy: "#c0795c", warm: "#6b8ba6", intense: "#c98a3e" };
const auditGood = (v: string) => ["cohesive", "distinct", "safe", "yes"].includes(v);

// ④ THE SCENES — the branched matrix: the 5 world-moments × the 3 tones, each cell its own ambient
// palette + cast. Tone and time are orthogonal — warm-calm-water ≠ warm-storm. Audited for cohesion
// (one world) + distinctness (each cell its own) + safe (intense floor-clipped).
type SceneCell = { tone: string; base: string; ink: string; accent: string; label: string };
export type ScenesT = { tones: string[]; cast: { [tone: string]: string[] }; matrix: { scene: string; spark: string; cells: SceneCell[] }[]; audit: { coheres: string; distinct: string; safe: string; note: string } };
export function ScenesBuild({ d }: { d: ScenesT }) {
  const red = "var(--spot-red)";
  const ok = (v: string) => v === "yes";
  const cols = `92px repeat(${d.tones.length}, 1fr)`;
  return (
    <div>
      <div style={{ border: `2px dashed ${forest}`, background: shade, padding: "10px 14px", margin: "0 0 14px", fontSize: 11.5, color: ink, lineHeight: 1.5 }}>
        <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 4 }}>↩ CARRIED FROM THE STORY STEP — the ambient vocabulary + the weather arc</div>
        <div>the 5 world-moments (the §8.13 weather arc) are the <b>rows</b>; the mood-colour range (The Deep · Iyashikei Mist · Carried to Dawn) is the vocabulary every cell stays inside — so the whole matrix reads as <b>one ferry</b>.</div>
      </div>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: 3 }}>▸ THE BRANCH — {d.matrix.length} world-moments × {d.tones.length} tones</div>
      <div style={{ fontSize: 11.5, color: soft, lineHeight: 1.5, marginBottom: 10 }}>each cell its own <b>ambient palette + cast</b>. A tone isn&rsquo;t a time: <b>warm</b> at calm water reads nothing like <b>warm</b> in the storm. In-game the dial scrubs the TONE; the SCENE is set by where you are in the crossing — the two compose.</div>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 3, marginBottom: 12 }}>
        <div />
        {d.tones.map((t) => (
          <div key={t} style={{ textAlign: "center", padding: "1px 0 3px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TONE_C[t] ?? forest, textTransform: "capitalize" }}>{t}</div>
            <div style={{ fontSize: 8.5, color: margin, lineHeight: 1.2 }}>{(d.cast[t] ?? []).map((n) => n.replace(/^the /i, "")).join(" · ")}</div>
          </div>
        ))}
        {d.matrix.map((row) => (
          <Fragment key={row.scene}>
            <div style={{ fontSize: 9.5, color: ink, display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: 4 }}>
              <span style={{ fontWeight: 700, lineHeight: 1.15 }}>{row.scene}</span>
              <span style={{ fontFamily: "monospace", fontSize: 8, color: margin }}>{row.spark}</span>
            </div>
            {row.cells.map((c) => (
              <div key={c.tone} style={{ background: c.base, color: c.ink, padding: "6px 8px", borderRadius: 3, minHeight: 42, display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: `3px solid ${c.accent}` }}>
                <span style={{ fontSize: 9.5, lineHeight: 1.25 }}>{c.label}</span>
                <code style={{ fontSize: 7.5, opacity: 0.6 }}>{c.base}</code>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
      <div style={{ border: `1px solid ${soft}`, background: paper, padding: "8px 12px", fontSize: 10.5, color: ink }}>
        <b style={{ color: forest }}>matrix audit</b> — coheres <b style={{ color: ok(d.audit.coheres) ? forest : red }}>{d.audit.coheres}</b> · distinct <b style={{ color: ok(d.audit.distinct) ? forest : red }}>{d.audit.distinct}</b> · safe <b style={{ color: ok(d.audit.safe) ? forest : red }}>{d.audit.safe}</b>
        <div style={{ color: soft, marginTop: 3, fontStyle: "italic" }}>{d.audit.note}</div>
      </div>
      <div style={{ fontSize: 10, color: margin, marginTop: 11, fontStyle: "italic", lineHeight: 1.5 }}>→ the audience EXPERTS frame the makeup brief next (⑤ the Tone), worn over these cells — cozy-first.</div>
    </div>
  );
}

// THE AUDITION PEEK — the autopick stays the headline; this opens the AUDITION PROCESS (the alternatives
// that weren't picked + why the winner won) in a MODAL, so the other choices are inspectable WITHOUT
// polluting the main view. Reusable across every step.
export type AuditionCand = { name: string; fit?: string; note?: string; detail?: string; mono?: boolean; picked?: boolean };
export function AuditionPeek({ label, candidates, why, gatedBy }: { label: string; candidates: AuditionCand[]; why?: string; gatedBy?: string }) {
  const [open, setOpen] = useState(false);
  const fitCol = (f?: string) => (f === "strong" ? forest : f === "off" || f === "weak" ? "var(--spot-red)" : amber);
  if (!candidates?.length) return null;
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".04em", color: forest, background: "none", border: `1.5px solid ${forest}`, borderRadius: 3, padding: "3px 9px", cursor: "pointer" }}>▸ see the audition <span style={{ color: margin, fontWeight: 400 }}>({candidates.length} tried)</span></button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,22,15,.55)", zIndex: 60, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 16px", overflowY: "auto", cursor: "zoom-out" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "auto", maxWidth: 560, width: "100%", background: paper, border: `2px solid ${ink}`, boxShadow: "6px 6px 0 rgba(0,0,0,.25)", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 12.5, fontWeight: 700, color: forest }}>{label} — the audition</div>
              <button onClick={() => setOpen(false)} style={{ border: "none", background: "none", fontSize: 21, lineHeight: 1, cursor: "pointer", color: margin }}>×</button>
            </div>
            {gatedBy && <div style={{ fontSize: 9.5, color: margin, marginBottom: 9, borderLeft: `2px solid ${forest}`, paddingLeft: 7 }}>⌖ composed under {gatedBy}</div>}
            <div style={{ display: "grid", gap: 6 }}>
              {candidates.map((c, i) => (
                <div key={i} style={{ border: `${c.picked ? 2 : 1}px solid ${c.picked ? forest : soft}`, background: c.picked ? shade : paper, padding: "7px 10px", fontSize: 11.5, color: ink, lineHeight: 1.45 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span><b>{c.name}</b> {c.fit && <span style={{ fontSize: 9.5, color: fitCol(c.fit), fontWeight: 700 }}>· {c.fit}</span>}</span>
                    {c.picked && <span style={{ fontSize: 9.5, color: forest, fontWeight: 700, whiteSpace: "nowrap" }}>✓ AUTOPICKED</span>}
                  </div>
                  {c.note && <div style={{ color: soft, fontSize: 11, marginTop: 1 }}>{c.note}</div>}
                  {c.detail && <div style={{ color: ink, fontSize: c.mono ? 9.5 : 11, marginTop: 4, lineHeight: c.mono ? 1.35 : 1.5, whiteSpace: c.mono ? "pre" : "pre-line", fontFamily: c.mono ? "ui-monospace, Menlo, monospace" : undefined, overflowX: c.mono ? "auto" : undefined, borderTop: `1px solid ${soft}`, paddingTop: 4 }}>{c.detail}</div>}
                </div>
              ))}
            </div>
            {why && <div style={{ fontSize: 10.5, color: ink, marginTop: 9, borderTop: `1px solid ${soft}`, paddingTop: 7, lineHeight: 1.5 }}><b style={{ color: forest }}>why the pick won:</b> {why}</div>}
          </div>
        </div>
      )}
    </>
  );
}

// THE PALETTE PEEK — the palette's audition (mirror of AuditionPeek, but the candidates ARE palettes). Each
// is a full cozy/warm/intense cell set, judged cohesion · distinct · safe; the alternatives stay inspectable.
export type PaletteCand = { id: string; name: string; cells: { tone: string; base: string; ink: string; accent: string; label: string }[]; cohesion?: string; distinct?: string; safe?: string; note?: string; picked?: boolean };
export function PalettePeek({ candidates, why, runnerUpGem, gatedBy }: { candidates: PaletteCand[]; why?: string; runnerUpGem?: string; gatedBy?: string }) {
  const [open, setOpen] = useState(false);
  const vCol = (v?: string) => (["cohesive", "distinct", "safe"].includes(v ?? "") ? forest : ["drifts", "blurs", "risky"].includes(v ?? "") ? "var(--spot-red)" : amber);
  if (!candidates?.length) return null;
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".04em", color: forest, background: "none", border: `1.5px solid ${forest}`, borderRadius: 3, padding: "3px 9px", cursor: "pointer" }}>▸ see the audition <span style={{ color: margin, fontWeight: 400 }}>({candidates.length} tried)</span></button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,22,15,.55)", zIndex: 60, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 16px", overflowY: "auto", cursor: "zoom-out" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ cursor: "auto", maxWidth: 600, width: "100%", background: paper, border: `2px solid ${ink}`, boxShadow: "6px 6px 0 rgba(0,0,0,.25)", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 12.5, fontWeight: 700, color: forest }}>the palette — the audition</div>
              <button onClick={() => setOpen(false)} style={{ border: "none", background: "none", fontSize: 21, lineHeight: 1, cursor: "pointer", color: margin }}>×</button>
            </div>
            {gatedBy && <div style={{ fontSize: 9.5, color: margin, marginBottom: 9, borderLeft: `2px solid ${forest}`, paddingLeft: 7 }}>⌖ composed under {gatedBy} — intense pole deepens, never alarms</div>}
            <div style={{ display: "grid", gap: 8 }}>
              {candidates.map((c) => (
                <div key={c.id} style={{ border: `${c.picked ? 2 : 1}px solid ${c.picked ? forest : soft}`, background: c.picked ? shade : paper, padding: "8px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: ink }}><b>{c.name}</b></span>
                    {c.picked && <span style={{ fontSize: 9.5, color: forest, fontWeight: 700, whiteSpace: "nowrap" }}>✓ AUTOPICKED</span>}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {c.cells.map((cell) => (
                      <div key={cell.tone} style={{ flex: 1, border: `1px solid ${ink}` }} title={`base ${cell.base} · accent ${cell.accent}`}>
                        <div style={{ background: cell.accent, height: 12 }} />
                        <div style={{ background: cell.base, padding: "5px 6px 6px" }}>
                          <div style={{ color: cell.ink, fontSize: 8.5, fontWeight: 700, textTransform: "capitalize", opacity: 0.9 }}>{cell.tone}</div>
                          <div style={{ color: cell.ink, fontSize: 9.5, lineHeight: 1.25, marginTop: 1 }}>{cell.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", marginTop: 5, fontSize: 9.5, color: margin }}>
                    {([["cohesion", c.cohesion], ["distinct", c.distinct], ["safe", c.safe]] as const).map(([k, v]) => v ? <span key={k}>{k} <b style={{ color: vCol(v) }}>{v}</b></span> : null)}
                  </div>
                  {c.note && <div style={{ color: soft, fontSize: 10.5, marginTop: 3, lineHeight: 1.45 }}>{c.note}</div>}
                </div>
              ))}
            </div>
            {why && <div style={{ fontSize: 10.5, color: ink, marginTop: 9, borderTop: `1px solid ${soft}`, paddingTop: 7, lineHeight: 1.5 }}><b style={{ color: forest }}>why the pick won:</b> {why}</div>}
            {runnerUpGem && <div style={{ fontSize: 10, color: margin, marginTop: 4, lineHeight: 1.5 }}><b style={{ color: amber }}>↳ runner-up gem:</b> {runnerUpGem}</div>}
          </div>
        </div>
      )}
    </>
  );
}

// ④ THE SCENES HUB — the RANGE / top-down PORTFOLIO view. We audition a LOT here on purpose: it's about
// COVERING RANGE — across the 5 branches, is the variety healthy + the balance right? The PREMISE is
// auditioned here; the CAST + premise HONING happen INSIDE each scene. Carries the prior experts (gating)
// + draws a future-step review.
type CoverageT = { map: { scene: string; cast: string; role: string; structure: string }[]; claims: { cast: string[]; role: string[]; structure: string[] }; conflicts: { scenes: (string | number)[]; dimension: string; issue: string; resolution: string }[]; note: string };
export type RangeT = {
  premises: { scene: string; premise: string }[];
  range: { variety: string; overlap: string; balance: string; skew: string; coverage: string; gaps: string; variety_add: string; note: string };
  coverage?: CoverageT;
  gatedBy?: string;
  rangeReview?: { verdict: string; flag: string };
  expertsGate?: { name: string; role: string }[];
  branches: { key: string; label: string; spark: string; cells: { tone: string; base: string; accent?: string; ink?: string; label?: string }[] }[];
  honing?: { [key: string]: { castPick?: string; paletteAudition?: { candidates: PaletteCand[]; whyWon?: string; runnerUpGem?: string } } };
  narrative?: { scene: string; arcs: { arc: string; note?: string }[] }[];
  narrativeSpread?: string;
  ensemble?: { crew: { name: string; energy?: string; quirk?: string; foil?: string }[]; pairs?: { a: string; b: string; dynamic: string }[]; verdict?: string };
};
export function SceneRange({ d, campaign }: { d: RangeT; campaign: string }) {
  const red = "var(--spot-red)";
  const ok = (v: string) => ["strong", "balanced", "complete", "yes"].includes(v);
  const premiseOf = (label: string) => d.premises.find((p) => p.scene.toLowerCase() === label.toLowerCase())?.premise;
  const arcsOf = (label: string) => d.narrative?.find((n) => n.scene.toLowerCase() === label.toLowerCase())?.arcs ?? [];
  return (
    <div>
      <div className="aud-digest" style={{ border: `2px solid ${forest}`, background: shade, padding: "8px 13px", marginBottom: 14, fontSize: 11, color: ink, lineHeight: 1.5 }}>
        <span style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: forest }}>▣ BUILD-CONTEXT</span> <b>THE RANGE HUB</b> — top-down portfolio of the 5 weather-moments · variety <b style={{ color: ok(d.range.variety) ? forest : red }}>{d.range.variety}</b> · balance <b style={{ color: ok(d.range.balance) ? forest : red }}>{d.range.balance}</b> · coverage <b style={{ color: ok(d.range.coverage) ? forest : red }}>{d.range.coverage}</b>{d.gatedBy ? ` · ${d.gatedBy}` : ""}{d.rangeReview ? " · ↪ reviewed downstream" : ""}
      </div>
      <div className="aud-body">
        <div className="aud-meat">
      {/* PORTFOLIO-FIRST (UI pass, option A): the 5 weather-moments are the hero, right under the digest. */}
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12.5, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: d.narrativeSpread ? 4 : 7 }}>▸ THE 5 WEATHER-MOMENTS — the portfolio · hone the cast inside each →</div>
      {d.narrativeSpread && <div style={{ fontSize: 9.5, color: margin, fontStyle: "italic", marginBottom: 8, paddingLeft: 2, lineHeight: 1.5 }}>↳ <b style={{ color: forest, fontStyle: "normal" }}>arc spread:</b> {d.narrativeSpread} <span style={{ color: soft }}>— each card lists candidate story-arcs (spread for range, not finalized; chosen at the branch).</span></div>}
      <div className="aud-grid2 aud-grid3" style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        {d.branches.map((b) => {
          const cast = d.honing?.[b.key]?.castPick;
          return (
            <a key={b.key} className="aud-scene" href={`/auditions/${campaign}/scenes/${b.key}`} style={{ display: "block", textDecoration: "none", border: `2px solid var(--ink-soft)`, background: paper, color: ink }}>
              {/* palette bar: per tone cell, its ACCENT over its ambient GROUND (accent on top so it leads —
                  the dark base is the lower band, not a top-border). Consistent with the hub audition rows. */}
              <div style={{ display: "flex", height: 18 }}>{b.cells.map((c) => <span key={c.tone} title={`${c.label} · ${c.accent}`} style={{ flex: 1, background: c.accent ? `linear-gradient(${c.accent} 0 55%, ${c.base} 55%)` : c.base }} />)}</div>
              <div style={{ padding: "11px 13px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--theme-display)", fontSize: 18, color: ink, textTransform: "uppercase", letterSpacing: ".02em", lineHeight: 1.1 }}>{b.label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 9.5, color: margin, whiteSpace: "nowrap" }}>{b.spark}</span>
                </div>
                {premiseOf(b.label) && <div style={{ fontSize: 12, color: ink, lineHeight: 1.45, marginTop: 5 }}>{premiseOf(b.label)}</div>}
                {arcsOf(b.label).length > 0 && (
                  <div style={{ marginTop: 7, borderTop: `1px solid var(--ink-soft)`, paddingTop: 6 }}>
                    <div style={{ fontFamily: "var(--theme-body)", fontSize: 8, fontWeight: 700, letterSpacing: ".06em", color: margin }}>↳ POSSIBLE ARCS <span style={{ fontWeight: 400, fontStyle: "italic" }}>· spread for range · chosen at the branch</span></div>
                    <ul style={{ margin: "3px 0 0", paddingLeft: 14, fontSize: 10.5, color: ink, lineHeight: 1.5 }}>
                      {arcsOf(b.label).map((a, i) => <li key={i} style={{ marginBottom: 1 }}><b style={{ color: forest }}>{a.arc}</b>{a.note ? <span style={{ color: margin }}> — {a.note}</span> : null}</li>)}
                    </ul>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 7 }}>
                  {cast ? <span style={{ fontSize: 10, color: margin, fontStyle: "italic" }}>cast · {cast.split("—")[0].trim()}</span> : <span />}
                  <span style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, color: forest }}>hone →</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* the audit, demoted to a one-line health strip (the digest carries the headline verdict) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", alignItems: "center", border: `1.5px solid var(--ink-soft)`, background: shade, padding: "7px 12px", marginBottom: 6, fontSize: 11 }}>
        <span style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".05em", color: forest }}>⓪ RANGE HEALTH</span>
        {([["variety", d.range.variety], ["balance", d.range.balance], ["coverage", d.range.coverage]] as const).map(([k, v]) => (
          <span key={k} style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".02em", border: `1.5px solid ${ok(v) ? forest : red}`, color: ok(v) ? forest : red, borderRadius: 11, padding: "1px 9px" }}>{k} {ok(v) ? "✓" : "⚠"} {v}</span>
        ))}
        <span style={{ color: soft, fontStyle: "italic" }}>— <b style={{ color: forest, fontStyle: "normal" }}>+ add:</b> {d.range.variety_add}</span>
      </div>
      <div style={{ fontSize: 10, color: soft, fontStyle: "italic", marginBottom: 14, paddingLeft: 2 }}>{d.range.note}</div>

      {/* the coverage map, demoted to a click-to-open reference (it's carried into each scene, not acted on here) */}
      {d.coverage && (
        <details className="aud-cov" style={{ border: `2px solid var(--ink-soft)`, marginBottom: 12 }}>
          <summary style={{ cursor: "pointer", listStyle: "none", fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: forest, padding: "9px 13px", display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span>▣ THE COVERAGE MAP — the allocation (cast · role · structure, carried into each scene)</span>
            <span style={{ color: margin, whiteSpace: "nowrap" }}>⌄ open</span>
          </summary>
          <div style={{ padding: "2px 13px 12px", fontSize: 11, color: ink, lineHeight: 1.5 }}>
            <div style={{ fontSize: 10.5, color: soft, marginBottom: 6 }}>each scene auditions on its OWN page, blind to its siblings — so the hub ALLOCATES distinct territory here so they don&rsquo;t collide. Carried into every scene as its constraint.</div>
            {d.gatedBy && <div style={{ fontSize: 9.5, color: margin, marginBottom: 8, borderLeft: `2px solid ${forest}`, paddingLeft: 7 }}>⌖ every slot composed under {d.gatedBy} — the age · genre · culture gate runs through the whole allocation.</div>}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(74px,auto) 1fr 1fr 1.2fr", gap: "3px 10px", fontSize: 10.5, marginBottom: 8 }}>
              {["SCENE", "CAST", "ROLE", "STRUCTURE"].map((h) => <div key={h} style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".05em", color: margin }}>{h}</div>)}
              {d.coverage.map.map((m) => (
                <Fragment key={m.scene}>
                  <div style={{ fontWeight: 700, color: forest, textTransform: "capitalize" }}>{m.scene}</div>
                  <div>{m.cast}</div>
                  <div>{m.role}</div>
                  <div>{m.structure}</div>
                </Fragment>
              ))}
            </div>
            <div style={{ fontSize: 9.5, color: margin, lineHeight: 1.5 }}>↳ <b style={{ color: forest }}>coverage spread:</b> roles [{d.coverage.claims.role.join(" · ")}] · structures [{d.coverage.claims.structure.join(" · ")}]</div>
            {d.coverage.conflicts?.map((cf, i) => (
              <div key={i} style={{ fontSize: 9.5, color: amber, marginTop: 4, borderLeft: `2px solid ${amber}`, paddingLeft: 7, lineHeight: 1.45 }}>⚑ <b>{cf.dimension} overlap</b> (scenes {Array.isArray(cf.scenes) ? cf.scenes.join(" & ") : cf.scenes}): {cf.issue} <span style={{ color: forest }}>→ resolved: {cf.resolution}</span></div>
            ))}
            {d.coverage.note && <div style={{ fontSize: 9.5, color: soft, fontStyle: "italic", marginTop: 4 }}>{d.coverage.note}</div>}
          </div>
        </details>
      )}
      {/* THE PALETTE AUDITION lives HERE (top-down) — like the coverage map, palette DISTINCTNESS can only be
          judged across all 5 at once. Each scene carries its picked palette DOWN as its ground. */}
      {d.honing && d.branches.some((b) => d.honing?.[b.key]?.paletteAudition) && (
        <details className="aud-cov" style={{ border: `2px solid var(--ink-soft)`, marginBottom: 12 }}>
          <summary style={{ cursor: "pointer", listStyle: "none", fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: forest, padding: "9px 13px", display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span>🎨 THE PALETTE AUDITION — each scene&rsquo;s look, auditioned top-down for distinctness (carried into each scene)</span>
            <span style={{ color: margin, whiteSpace: "nowrap" }}>⌄ open</span>
          </summary>
          <div style={{ padding: "2px 13px 12px", fontSize: 11, color: ink, lineHeight: 1.5 }}>
            <div style={{ fontSize: 10.5, color: soft, marginBottom: 9 }}>like the coverage map, the palette is allocated from the TOP-DOWN view — the one place all 5 are seen at once — so no two weather-moments blur. Each scene carries its picked palette DOWN as its ambient ground (the tone dials within).</div>
            <div style={{ border: `1px dashed var(--ink-soft)`, background: paper, padding: "8px 11px", marginBottom: 10, fontSize: 10.5, color: ink, lineHeight: 1.55 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 3 }}>◐ USING THE TWO COLOURS — ground + pop (how each plays, in content AND visually)</div>
              <div><b>base = the GROUND</b> (the lower, dominant band). <i>Visually</i> — the screen fill · the dialogue-box background · the dominant asset/lighting colour: what the eye rests in. <i>In content</i> — the scene&rsquo;s emotional WEATHER, the backdrop the prose breathes in; it steers diction + pace (the cool words, the slow rhythm) without being named.</div>
              <div style={{ marginTop: 4 }}><b style={{ color: forest }}>accent = the POP</b> (the bright upper band). <i>Visually</i> — highlights · the active button · a rim-light · the one saturated object: it guides attention. <i>In content</i> — the focal SYMBOL the writing lingers on (the brass lamp, the one warm light), the note of hope/tension struck against the ground.</div>
              <div style={{ marginTop: 4, color: soft, fontStyle: "italic" }}>↳ their CONTRAST is the subtext: dark ground + warm accent = solitude-with-hope · cold ground + cold accent = exposure. The RATIO is the dial — more pop as the tone warms, the accent receding into the ground as it deepens.</div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {d.branches.map((b) => {
                const pa = d.honing?.[b.key]?.paletteAudition;
                if (!pa) return null;
                const win = pa.candidates?.find((c) => c.picked);
                return (
                  <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", gap: 1, flex: "0 0 auto" }}>{b.cells.map((c) => <span key={c.tone} title={`${c.label} · ${c.accent}`} style={{ width: 24, height: 18, border: `1px solid ${ink}`, background: c.accent ? `linear-gradient(${c.accent} 0 48%, ${c.base} 48%)` : c.base }} />)}</span>
                    <a href={`/auditions/${campaign}/scenes/${b.key}`} style={{ fontWeight: 700, color: forest, textTransform: "capitalize", flex: "0 0 auto", textDecoration: "none" }}>{b.label}</a>
                    {win && <span style={{ fontSize: 10, color: margin, fontStyle: "italic" }}>&ldquo;{win.name}&rdquo;</span>}
                    <span style={{ marginLeft: "auto" }}><PalettePeek candidates={pa.candidates} why={pa.whyWon} runnerUpGem={pa.runnerUpGem} gatedBy={d.gatedBy} /></span>
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      )}
      {/* THE ENSEMBLE — the film-expert's top-down read of the supporting cast (Stage 2). The per-scene
          supporting pick is honed on each branch; this is the campaign-wide dynamics map. */}
      {d.ensemble && (d.ensemble.crew?.length || d.ensemble.verdict) && (
        <details className="aud-cov" style={{ border: `2px solid var(--ink-soft)`, marginBottom: 12 }}>
          <summary style={{ cursor: "pointer", listStyle: "none", fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: forest, padding: "9px 13px", display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span>🎬 THE ENSEMBLE — the supporting cast&rsquo;s dynamics (film-expert pass)</span>
            <span style={{ color: margin, whiteSpace: "nowrap" }}>⌄ open</span>
          </summary>
          <div style={{ padding: "2px 13px 12px", fontSize: 11, color: ink, lineHeight: 1.5 }}>
            <div style={{ fontSize: 10.5, color: soft, marginBottom: 9 }}>a FILM EXPERT reviews the supporting cast for DYNAMICS — each crew member&rsquo;s ensemble energy · quirk · foil, the chemistry pairs, and whether the whole stays distinct + non-redundant. The per-scene supporting presence is auditioned + honed on each branch.</div>
            {d.ensemble.crew && d.ensemble.crew.length > 0 && (
              <div style={{ display: "grid", gap: 6, marginBottom: 9 }}>
                {d.ensemble.crew.map((c) => (
                  <div key={c.name} style={{ borderLeft: `2px solid ${forest}`, paddingLeft: 9, lineHeight: 1.45 }}>
                    <b style={{ color: forest }}>{c.name}</b>{c.energy ? <span style={{ color: margin }}> · {c.energy}</span> : null}
                    {c.quirk && <div style={{ fontSize: 10.5, color: ink }}><span style={{ color: margin }}>quirk:</span> {c.quirk}</div>}
                    {c.foil && <div style={{ fontSize: 10, color: soft, fontStyle: "italic" }}>↔ foils {c.foil}</div>}
                  </div>
                ))}
              </div>
            )}
            {d.ensemble.pairs && d.ensemble.pairs.length > 0 && (
              <div style={{ fontSize: 10.5, color: ink, marginBottom: 7 }}>
                <span style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: margin }}>CHEMISTRY PAIRS</span>
                {d.ensemble.pairs.map((p, i) => <div key={i} style={{ marginTop: 2 }}><b style={{ color: forest }}>{p.a} ↔ {p.b}</b> — {p.dynamic}</div>)}
              </div>
            )}
            {d.ensemble.verdict && <div style={{ fontSize: 10, color: soft, fontStyle: "italic", borderTop: `1px solid var(--ink-soft)`, paddingTop: 6 }}>↳ film-expert verdict: {d.ensemble.verdict}</div>}
          </div>
        </details>
      )}
        </div>
        <aside className="aud-context">
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 8 }}>▣ BUILD-CONTEXT <span style={{ color: margin, fontWeight: 400, fontStyle: "italic" }}>— for the AI building this</span></div>
          <div style={{ fontSize: 10, color: margin, borderLeft: `2px solid ${forest}`, paddingLeft: 9, marginBottom: 9, lineHeight: 1.5 }}>
            <b style={{ fontFamily: "var(--theme-body)", color: forest }}>▸ WHY AUDITION A LOT HERE</b> — Scenes is the ONE top-down view: every branch at once. The job is the PORTFOLIO — across the 5 weather-moments, is the variety healthy + the balance right (not five versions of one beat)? Premises are auditioned here; the cast + honing happen INSIDE each scene.
          </div>
          {d.expertsGate && d.expertsGate.length > 0 && (
            <div style={{ fontSize: 10, color: margin, borderLeft: `2px solid ${forest}`, paddingLeft: 9, marginBottom: 9, lineHeight: 1.5 }}>
              <b style={{ fontFamily: "var(--theme-body)", color: forest }}>⌖ GATED BY</b> the prior step&rsquo;s experts: {d.expertsGate.map((e) => e.name).join(" · ")} — their floor holds across the whole range.
            </div>
          )}
          {d.rangeReview && (
            <div style={{ fontSize: 10, color: margin, borderLeft: `2px solid ${d.rangeReview.verdict === "yes" ? forest : red}`, paddingLeft: 9, lineHeight: 1.5 }}>
              <b style={{ fontFamily: "var(--theme-body)", color: d.rangeReview.verdict === "yes" ? forest : red }}>↪ FUTURE-STEP REVIEW</b> (a downstream content-writer on this range): <b>{d.rangeReview.verdict}</b> — {d.rangeReview.flag}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// THE BRANCH LINKS — the 5 weather-moment sub-pages the Scenes hub forks into.
type BranchLite = { key: string; label: string; spark: string; cells: { tone: string; base: string }[] };
export function BranchLinks({ campaign, branches, active }: { campaign: string; branches: BranchLite[]; active?: string }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: 6 }}>▸ THE BRANCHES — the 5 weather-moments (hone each →)</div>
      <div className="aud-grid2 aud-grid3" style={{ display: "grid", gap: 7 }}>
        {branches.map((b) => {
          const on = b.key === active;
          return (
            <a key={b.key} href={`/auditions/${campaign}/scenes/${b.key}`} style={{ display: "block", textDecoration: "none", border: `2px solid ${on ? forest : "var(--ink-soft)"}`, background: on ? shade : paper, padding: "8px 11px", color: ink }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, textTransform: "capitalize" }}>{b.label}</span>
                <span style={{ display: "flex", gap: 2 }}>{b.cells.map((c) => <span key={c.tone} style={{ width: 14, height: 14, background: c.base, borderRadius: 2, border: `1px solid ${ink}` }} />)}</span>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 9.5, color: margin }}>{b.spark}</div>
              <div style={{ fontSize: 10.5, color: forest, marginTop: 2 }}>hone the cast + characters →</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// THE WEATHER-MOMENT BRANCH — one scene honed: its palette (dialed cozy→intense), the tone dial, the cast.
export type SceneBranchView = { key: string; label: string; spark: string; cells: { tone: string; base: string; ink: string; accent: string; label: string }[]; characters: Character[]; toneText: { label: string; text: string }[]; premise?: string; honing?: { castPick?: string; supporting?: string; premiseHoned?: string; review?: string }; expertsGate?: { name: string; role: string }[]; slot?: { cast: string; role: string; structure: string }; siblingClaims?: { cast: string[]; role: string[]; structure: string[] }; conflict?: { dimension: string; resolution: string }; castAudition?: AuditionCand[]; whyWon?: string; arc?: { winner: string; whyWon?: string; candidates: { arc: string; floor?: string; floor_note?: string; yield?: string; picked?: boolean }[]; variance?: string[] }; checkpoints?: { begin: { text: string; open?: string; rigidity?: string; rigidityWhy?: string; alts?: string[] }; middle: { type: string; turn: string; open?: string; rigidity?: string; rigidityWhy?: string; alts?: { type?: string; turn: string }[] }; end: { text: string; open?: string; rigidity?: string; rigidityWhy?: string; alts?: string[] } }; between?: { span: string; grows?: string; relationship?: string }[]; supportingCast?: { winner: string; whyWon?: string; dynamic?: string; quirk?: string; candidates: { name: string; dynamic?: string; quirk?: string; fit?: string; picked?: boolean }[] }; content?: { beats: { at: string; text: string; grows?: string; bond?: string }[]; review?: { verdict?: string; flag?: string } }; gatedBy?: string; paletteUI?: { prompts?: { objects?: string[]; characters?: string[]; items?: string[] }; prose?: { objectSeeds?: { dominant?: string[]; accent?: string[] }; diction?: { cool?: string[]; warm?: string[] }; rule?: string } } };
export function SceneBranch({ b, campaign }: { b: SceneBranchView; campaign: string }) {
  const h = b.honing;
  const cp = b.checkpoints;
  // each checkpoint is a CORRIDOR (the picked direction + open-question + rigidity + the alternates / width)
  const cpList = cp ? [
    { k: "BEGIN", text: cp.begin?.text, open: cp.begin?.open, rigidity: cp.begin?.rigidity, alts: cp.begin?.alts ?? [] },
    { k: "MIDDLE", text: cp.middle?.turn, type: cp.middle?.type, open: cp.middle?.open, rigidity: cp.middle?.rigidity, alts: (cp.middle?.alts ?? []).map((a) => `(${a.type}) ${a.turn}`) },
    { k: "END", text: cp.end?.text, open: cp.end?.open, rigidity: cp.end?.rigidity, alts: cp.end?.alts ?? [] },
  ] as { k: string; text?: string; type?: string; open?: string; rigidity?: string; alts: string[] }[] : [];
  return (
    <div>
      <div className="aud-digest" style={{ border: `2px solid ${forest}`, background: shade, padding: "8px 13px", marginBottom: 14, fontSize: 11, color: ink, lineHeight: 1.5 }}>
        <span style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: forest }}>▣ BUILD-CONTEXT</span> <b style={{ textTransform: "capitalize" }}>{b.label}</b> <span style={{ fontFamily: "monospace", color: margin }}>{b.spark}</span>{b.gatedBy ? ` · ${b.gatedBy}` : ""}{b.slot ? ` · slot ${b.slot.cast} / ${b.slot.role} / ${b.slot.structure}` : ""} · carried from the <a href={`/auditions/${campaign}/scenes`}>hub</a>{h?.review ? " · ↪ reviewed downstream" : ""}
      </div>
      <div className="aud-body">
        <div className="aud-meat">
      {(b.premise || h?.premiseHoned) && (
        <div style={{ border: `2px solid ${forest}`, background: paper, padding: "10px 13px", marginBottom: 16, fontSize: 12.5, color: ink, lineHeight: 1.55 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: 4 }}>▸ THE PREMISE — honed for this moment</div>
          {h?.premiseHoned ? <div>{h.premiseHoned}</div> : <div>{b.premise}</div>}
          {b.premise && h?.premiseHoned && <div style={{ fontSize: 10, color: margin, fontStyle: "italic", marginTop: 5, borderTop: `1px solid ${soft}`, paddingTop: 5 }}>↩ from the hub (the range pick): {b.premise}</div>}
        </div>
      )}
      {b.arc && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest }}>▸ THE STORY SKELETON — the arc + its checkpoints <span style={{ color: margin, fontWeight: 400, fontSize: 10 }}>(picked HERE via the winner rule)</span></div>
            <AuditionPeek label="the arc" candidates={(b.arc.candidates ?? []).map((c) => ({ name: c.arc, fit: c.floor === "clear" ? "floor clear" : "soft-flag", note: c.yield, detail: c.floor_note, picked: c.picked }))} why={b.arc.whyWon} gatedBy={b.gatedBy} />
          </div>
          <div style={{ border: `2px solid ${forest}`, background: shade, padding: "9px 12px", marginBottom: 8, fontSize: 12.5, color: ink, lineHeight: 1.5 }}>
            <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", color: forest }}>ARC</span> <b style={{ textTransform: "capitalize" }}>{b.arc.winner}</b>
            {b.arc.whyWon && <div style={{ fontSize: 10.5, color: soft, marginTop: 3, lineHeight: 1.5 }}>↳ why it won: {b.arc.whyWon}</div>}
            {b.arc.variance && b.arc.variance.length > 0 && <div style={{ fontSize: 9.5, color: amber, marginTop: 4, borderLeft: `2px solid ${amber}`, paddingLeft: 7, lineHeight: 1.45 }}>⚑ variance (soft-constraint appeal): {b.arc.variance.join(" · ")}</div>}
          </div>
          {cpList.length > 0 && (
            <div className="aud-grid3" style={{ display: "grid", gap: 8, marginBottom: 8 }}>
              {cpList.map(({ k, text, type, open, rigidity, alts }) => (
                <div key={k} style={{ border: `1.5px solid var(--ink-soft)`, background: paper, padding: "8px 11px" }}>
                  <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".07em", color: forest, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                    <span>{k}</span>
                    <span style={{ display: "flex", gap: 4 }}>
                      {rigidity && <span title={rigidity === "locked" ? "pinned by the carried / a north star" : "free to play — the corridor's width"} style={{ fontSize: 8, fontWeight: 700, color: rigidity === "loose" ? forest : margin, border: `1px solid ${rigidity === "loose" ? forest : "var(--ink-soft)"}`, borderRadius: 3, padding: "0 4px", letterSpacing: ".02em", whiteSpace: "nowrap" }}>{rigidity === "loose" ? "↔ loose" : "🔒 locked"}</span>}
                      {type && <span style={{ fontSize: 8, fontWeight: 700, color: type === "environmental" ? forest : amber, border: `1px solid ${type === "environmental" ? forest : amber}`, borderRadius: 3, padding: "0 4px", letterSpacing: ".02em", whiteSpace: "nowrap" }}>{type === "environmental" ? "🌦 weather" : "◐ internal"}</span>}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: ink, marginTop: 3, lineHeight: 1.45 }}>{text}</div>
                  {open && <div style={{ fontSize: 9.5, color: margin, marginTop: 4, lineHeight: 1.4 }}><span style={{ color: soft }}>? open:</span> {open}</div>}
                  {alts.length > 0 && <div style={{ fontSize: 9.5, color: margin, marginTop: 4, borderTop: `1px solid var(--ink-soft)`, paddingTop: 4, lineHeight: 1.45 }}><span style={{ color: soft }}>↳ corridor:</span> {alts.map((a, i) => <span key={i}>{i ? <span style={{ color: "var(--ink-soft)" }}> · </span> : null}{a}</span>)}</div>}
                </div>
              ))}
            </div>
          )}
          {b.between && b.between.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: 3 }}>↔ THE BETWEEN — the grows-with-you gaps <span style={{ color: margin, fontWeight: 400, fontStyle: "italic" }}>(what the content step fills)</span></div>
              {b.between.map((sp, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${forest}`, paddingLeft: 9, marginTop: 5, fontSize: 11, color: ink, lineHeight: 1.5 }}>
                  <b style={{ color: forest }}>{sp.span}</b>{sp.grows ? <> — <span style={{ color: margin }}>grows:</span> {sp.grows}</> : null}{sp.relationship ? <> <span style={{ color: margin }}>· bond:</span> {sp.relationship}</> : null}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {h?.castPick && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest }}>▸ THE CAST AUDITION — who carries this moment <span style={{ color: margin, fontWeight: 400, fontSize: 10 }}>(autopicked HERE)</span></div>
            <AuditionPeek label="the cast" candidates={b.castAudition ?? []} why={b.whyWon} gatedBy={b.gatedBy} />
          </div>
          <div style={{ border: `2px solid ${forest}`, background: shade, padding: "9px 12px", marginBottom: 6, fontSize: 12, color: ink, lineHeight: 1.5 }}>
            <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", color: forest }}>FOCAL</span> {h.castPick}
            {h.supporting && h.supporting !== "none" && <div style={{ marginTop: 4, fontSize: 11, color: soft }}><span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, color: forest }}>+ SUPPORTING</span> {h.supporting}</div>}
          </div>
          <div style={{ fontSize: 9.5, color: margin, marginBottom: 16, fontStyle: "italic" }}>from the crew pool: {b.characters.map((c) => c.name.replace(/^the /i, "")).join(" · ")} — the §8.13 floor allows ONE focal, never a crowd.</div>
        </>
      )}
      {b.supportingCast && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest }}>▸ THE SUPPORTING CAST — the dynamic <span style={{ color: margin, fontWeight: 400, fontSize: 10 }}>(film-expert pass · ≤1 light presence)</span></div>
            <AuditionPeek label="the supporting cast" candidates={(b.supportingCast.candidates ?? []).map((c) => ({ name: c.name, fit: c.fit, note: c.dynamic, detail: c.quirk, picked: c.picked }))} why={b.supportingCast.whyWon} gatedBy={b.gatedBy} />
          </div>
          <div style={{ border: `2px solid ${forest}`, background: shade, padding: "9px 12px", marginBottom: 16, fontSize: 12, color: ink, lineHeight: 1.5 }}>
            <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", color: forest }}>SUPPORTING</span> <b>{b.supportingCast.winner}</b>
            {b.supportingCast.dynamic && <div style={{ fontSize: 11, color: soft, marginTop: 3 }}><span style={{ color: margin }}>dynamic with the focal:</span> {b.supportingCast.dynamic}</div>}
            {b.supportingCast.quirk && <div style={{ fontSize: 10.5, color: soft, marginTop: 2, fontStyle: "italic" }}>↳ quirk: {b.supportingCast.quirk}</div>}
          </div>
        </>
      )}
      {b.content && b.content.beats && b.content.beats.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest }}>▸ THE CONTENT — the beats that fill the skeleton <span style={{ color: margin, fontWeight: 400, fontSize: 10 }}>(the grows-with-you, written in)</span></div>
            {b.content.review?.verdict && <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, color: b.content.review.verdict === "yes" ? forest : "var(--spot-red)", border: `1px solid ${b.content.review.verdict === "yes" ? forest : "var(--spot-red)"}`, borderRadius: 3, padding: "1px 7px" }}>↪ review: {b.content.review.verdict}</span>}
          </div>
          <div style={{ display: "grid", gap: 7, marginBottom: 6 }}>
            {b.content.beats.map((bt, i) => {
              const gap = bt.at.includes("→") || bt.at.includes("&rarr;");
              return (
                <div key={i} style={{ borderLeft: `2px solid ${gap ? forest : "var(--ink-soft)"}`, paddingLeft: 10 }}>
                  <span style={{ fontFamily: "var(--theme-body)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: gap ? forest : margin, textTransform: "uppercase" }}>{bt.at}</span>
                  <div style={{ fontSize: 12, color: ink, lineHeight: 1.5, marginTop: 2 }}>{bt.text}</div>
                  {gap && (bt.grows || bt.bond) && (
                    <div style={{ fontSize: 9.5, color: margin, marginTop: 3, lineHeight: 1.5 }}>
                      {bt.grows ? <span>↑ <span style={{ color: soft }}>grows:</span> {bt.grows}</span> : null}{bt.grows && bt.bond ? <br /> : null}{bt.bond ? <span>♥ <span style={{ color: soft }}>bond:</span> {bt.bond}</span> : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {b.content.review?.flag && <div style={{ fontSize: 9.5, color: soft, fontStyle: "italic", marginBottom: 16 }}>↳ {b.content.review.flag}</div>}
        </>
      )}
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: 3 }}>▸ THE PALETTE — {b.label}, dialed cozy → intense</div>
      <div style={{ fontSize: 9.5, color: margin, marginBottom: 6, fontStyle: "italic" }}>↩ carried from the hub — the palette is auditioned top-down (for distinctness across the range) at the <a href={`/auditions/${campaign}/scenes`} style={{ color: forest, fontStyle: "normal", fontWeight: 700 }}>scenes hub → see the audition</a>; here it&rsquo;s the ground the tone dials within.</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${b.cells.length}, 1fr)`, gap: 6, marginBottom: 16 }}>
        {b.cells.map((c) => (
          <div key={c.tone} style={{ border: `1px solid ${c.accent}`, borderRadius: 3, overflow: "hidden", minHeight: 64 }} title={`base ${c.base} · accent ${c.accent}`}>
            <div style={{ background: c.accent, height: 16 }} />
            <div style={{ background: c.base, color: c.ink, padding: "8px 11px 10px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "capitalize", opacity: 0.85 }}>{c.tone}</div>
              <div style={{ fontSize: 12, marginTop: 3 }}>{c.label}</div>
              <code style={{ fontSize: 8.5, opacity: 0.6 }}>{c.base} · {c.accent}</code>
            </div>
          </div>
        ))}
      </div>
      {b.toneText?.length > 0 && (
        <>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: 6 }}>▸ THE TONE DIAL — {b.label} at each tone</div>
          <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            {b.toneText.map((t) => (
              <div key={t.label} style={{ borderLeft: `3px solid ${TONE_C[t.label.toLowerCase()] ?? forest}`, paddingLeft: 10, fontSize: 12.5, color: ink, lineHeight: 1.55 }}>
                <b style={{ color: TONE_C[t.label.toLowerCase()] ?? forest, textTransform: "capitalize" }}>{t.label}</b> — {t.text}
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: 6 }}>▸ UI FROM THE PALETTE — the dialogue box in this moment</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${b.cells.length}, 1fr)`, gap: 8, marginBottom: 16 }}>
        {b.cells.map((c) => (
          <div key={c.tone}>
            <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "capitalize", color: TONE_C[c.tone] ?? forest, marginBottom: 3 }}>{c.tone}</div>
            <div style={{ background: c.base, border: `2px solid ${c.accent}`, padding: "9px 10px 10px", boxShadow: "2px 2px 0 rgba(0,0,0,.2)" }}>
              <div style={{ color: c.ink, fontSize: 11, lineHeight: 1.5 }}>{(b.toneText?.find((t) => t.label.toLowerCase() === c.tone)?.text ?? "…").slice(0, 58)}… <span style={{ color: c.accent }}>▾</span></div>
              <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
                <span style={{ background: c.accent, color: c.base, fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 9, padding: "3px 7px", border: `1px solid ${c.ink}` }}>▸ stay</span>
                <span style={{ background: c.base, color: c.ink, fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 9, padding: "3px 7px", border: `1px solid ${c.accent}` }}>let go</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {b.paletteUI?.prompts && (
        <>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: 5 }}>▸ PROMPT-FRIENDLY COLOURS — assets from this scene&rsquo;s palette</div>
          <div style={{ fontSize: 11, color: ink, lineHeight: 1.6, marginBottom: 16 }}>
            {([["objects", b.paletteUI.prompts.objects], ["characters", b.paletteUI.prompts.characters], ["items", b.paletteUI.prompts.items]] as const).map(([k, list]) => (list && list.length ? <div key={k}><span style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".07em", color: margin }}>{k.toUpperCase()}</span> {list.join(" · ")}</div> : null))}
          </div>
        </>
      )}
      {b.paletteUI?.prose && (
        <>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: forest, marginBottom: 5 }}>▸ PALETTE → PROSE — the writing this palette steers <span style={{ color: margin, fontWeight: 400, fontSize: 10 }}>(the hue never named)</span></div>
          <div style={{ fontSize: 11, color: ink, lineHeight: 1.6, marginBottom: 16 }}>
            {b.paletteUI.prose.objectSeeds && <div><span style={{ color: margin }}>seeds:</span> {(b.paletteUI.prose.objectSeeds.dominant ?? []).join(" · ")} <span style={{ color: "var(--spot-red)" }}>▸</span> {(b.paletteUI.prose.objectSeeds.accent ?? []).join(" · ")}</div>}
            {b.paletteUI.prose.diction && <div><span style={{ color: margin }}>diction:</span> <b>cool</b> {(b.paletteUI.prose.diction.cool ?? []).join(", ")} · <b>warm</b> {(b.paletteUI.prose.diction.warm ?? []).join(", ")}</div>}
            {b.paletteUI.prose.rule && <div style={{ fontStyle: "italic", color: soft, marginTop: 2 }}>↳ {b.paletteUI.prose.rule}</div>}
          </div>
        </>
      )}
        </div>
        <aside className="aud-context">
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 9, paddingBottom: 4, borderBottom: `1px solid ${soft}` }}>▣ BUILD-CONTEXT <span style={{ fontWeight: 400, color: margin, fontSize: 8.5 }}>— for the AI building this</span></div>
          <div style={{ borderLeft: `2px solid ${soft}`, paddingLeft: 9, marginBottom: 11, fontSize: 10.5, color: margin, lineHeight: 1.5 }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 2 }}>↩ CARRIED FROM THE HUB</div>
            the premise was auditioned for RANGE at the <a href={`/auditions/${campaign}/scenes`} style={{ color: forest, fontWeight: 700 }}>scenes hub</a>; honed here for <b style={{ textTransform: "capitalize", color: ink }}>{b.label}</b>, the tone dialed within.
          </div>
          {b.slot && (
            <div style={{ borderLeft: `2px solid ${soft}`, paddingLeft: 9, marginBottom: 11, fontSize: 10.5, color: margin, lineHeight: 1.5 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 2 }}>▣ COVERAGE SLOT</div>
              cast <b style={{ color: ink }}>{b.slot.cast}</b> · role <b style={{ color: ink }}>{b.slot.role}</b> · structure <b style={{ color: ink }}>{b.slot.structure}</b>
              {b.siblingClaims && <div style={{ marginTop: 3 }}>siblings own: roles [{b.siblingClaims.role.filter((r) => r !== b.slot!.role).join(" · ")}] · structures [{b.siblingClaims.structure.filter((s) => s !== b.slot!.structure).join(" · ")}]</div>}
              {b.conflict && <div style={{ color: "#c08a2e", marginTop: 3 }}>⚑ shares its {b.conflict.dimension} → kept distinct: {b.conflict.resolution}</div>}
            </div>
          )}
          {b.expertsGate && b.expertsGate.length > 0 && (
            <div style={{ borderLeft: `2px solid ${soft}`, paddingLeft: 9, marginBottom: 11, fontSize: 10.5, color: margin, lineHeight: 1.5 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 2 }}>⌖ GATED BY</div>
              the hub&rsquo;s experts: {b.expertsGate.map((e) => e.name).join(" · ")} — their floor holds here.
            </div>
          )}
          {h?.review && (
            <div style={{ borderLeft: `2px solid ${soft}`, paddingLeft: 9, marginBottom: 11, fontSize: 10.5, color: margin, lineHeight: 1.5 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 2 }}>↪ DOWNSTREAM REVIEW</div>
              a content-writer on buildability: {h.review}
            </div>
          )}
        </aside>
      </div>
      <div style={{ fontSize: 10.5, color: margin, marginTop: 10, fontStyle: "italic", lineHeight: 1.5 }}>↳ the honing bench for <b style={{ textTransform: "capitalize" }}>{b.label}</b> — the cast voice, the characters, and the per-moment content get polished here (cozy-first; the storm deepens presence, never threat).</div>
    </div>
  );
}

export function ToneBuild({ d, inHub }: { d: ToneT; inHub?: boolean }) {
  const red = "var(--spot-red)";
  const ca = d.castAudition;
  const mir = d.mirror;
  const noThe = (n: string) => n.replace(/^the /i, "");
  const mirrorAt = (t: string) => mir?.perTone.find((m) => m.tone.toLowerCase() === t.toLowerCase());
  const charsAt = (t: string) => d.characters.filter((c) => c.joinsAt.toLowerCase() === t.toLowerCase());
  return (
    <div>
      {!inHub && (
        <div style={{ border: `2px dashed ${forest}`, background: shade, padding: "10px 14px", margin: "0 0 16px", fontSize: 11.5, color: ink, lineHeight: 1.5 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 6 }}>↩ CARRIED FROM THE SCENES STEP — the branched matrix the makeup is worn over</div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 26, height: 26, background: d.ambientBase, border: `1px solid ${ink}`, display: "inline-block", borderRadius: 3, flexShrink: 0 }} />
            <span>the ambient now varies <b>per scene×tone</b> (the matrix); <b>{d.ambientName}</b> <code style={{ fontSize: 10, color: margin }}>{d.ambientBase}</code> is the anchor. The makeup below is worn over those CELLS — cozy-first.</span>
          </div>
        </div>
      )}

      {/* ⓪ EXPERTS FIRST */}
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 3 }}>⓪ EXPERTS FIRST — frame the audience, then build the makeup</div>
      <div style={{ fontSize: 11.5, color: soft, lineHeight: 1.5, marginBottom: 9 }}>experts <b>matched to the audience</b> ({d.audience}) framed the state of mind; their synthesis is the MAKEUP BRIEF the audition judges against.</div>
      <div className="aud-grid2" style={{ display: "grid", gap: 8, marginBottom: 14 }}>
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
          {ct.vet && (
            <div style={{ marginTop: 5, fontSize: 9.5, color: margin }}>
              <span style={{ fontFamily: "var(--theme-body)", fontWeight: 700, letterSpacing: ".05em", color: forest }}>✓ THE EXPERTS WEIGH IN</span> {ct.vet.perExpert.filter((p) => p.honored === "yes").length}/{ct.vet.perExpert.length} honored · <b style={{ color: ct.vet.safe === "safe" ? forest : red }}>{ct.vet.safe}</b> · {ct.vet.fixes.length ? `fixes: ${ct.vet.fixes.join("; ")}` : "no fixes"} <span style={{ fontStyle: "italic" }}>— {ct.vet.oneLine}</span>
            </div>
          )}
          {d.support?.[tone] && (
            <div style={{ marginTop: 6, paddingTop: 5, borderTop: `1px solid ${soft}` }}>
              <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", color: forest }}>+ SUPPORTING CAST</span> <span style={{ fontSize: 9.5, color: d.support[tone].honorsFloor === "yes" ? forest : red }}>· floor (one-focal · low-load): {d.support[tone].honorsFloor}</span>
              {d.support[tone].supporting.map((s, i) => <div key={i} style={{ fontSize: 10, color: soft, marginLeft: 8, marginTop: 2, lineHeight: 1.4 }}><b style={{ color: ink }}>{s.who}</b> — {s.presence}</div>)}
              <div style={{ fontSize: 9.5, color: margin, fontStyle: "italic", marginTop: 2 }}>↳ {d.support[tone].note}</div>
            </div>
          )}
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
