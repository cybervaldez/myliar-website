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

// THE STORY BUILD — the picked story's own page (carried over from the audition scrubber). One story,
// no tabs, no picking: scrub the crossing (the world-moments) and the SUBRANGE shows the BEATS that can
// live at each — the cozy ↔ intense content (a tender beat inside the storm, a charged one in the calm).
type StoryT = { id: string; env: string[]; subrange?: { cozy: string; intense: string }[] };
export function StoryBuild({ story, scenes }: { story: StoryT; scenes: string[] }) {
  const [dr, setDr] = useState(0.0);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; dr: number } | null>(null);
  const ph = phaseOf(dr);
  const variant = VARIANT_OF(story.id);
  const beat = story.subrange?.[ph];
  const down = (e: React.PointerEvent) => { box.current?.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, dr }; };
  const move = (e: React.PointerEvent) => { if (!drag.current || !box.current) return; const w = box.current.offsetWidth || 1; setDr(clamp(drag.current.dr + (e.clientX - drag.current.x) / w, 0, 1)); };
  const up = (e: React.PointerEvent) => { drag.current = null; try { box.current?.releasePointerCapture(e.pointerId); } catch {} };
  const key = (e: React.KeyboardEvent) => { if (e.key === "ArrowRight" || e.key === "ArrowUp") { setDr((d) => clamp(d + 0.05, 0, 1)); e.preventDefault(); } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setDr((d) => clamp(d - 0.05, 0, 1)); e.preventDefault(); } };
  return (
    <div>
      {/* the world-moment — art + scrub (the surrounding at this point in the crossing) */}
      <div ref={box} role="slider" aria-label="the crossing — drag to scrub" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(dr * 100)} tabIndex={0}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
        style={{ border: `2px solid ${forest}`, background: paper, padding: "10px 12px 12px", touchAction: "pan-y", cursor: "ew-resize", userSelect: "none", WebkitUserSelect: "none" }}>
        <pre style={{ ...mono, fontSize: 12.5, color: ink, background: paper, border: `1.5px solid ${ink}`, padding: "8px 6px", margin: 0, textAlign: "center", overflow: "hidden" }}>{art(variant, dr).join("\n")}</pre>
        <div style={{ position: "relative", height: 9, background: shade, border: `1.5px solid ${ink}`, margin: "10px 0 0" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${dr * 100}%`, background: forest }} />
          {[0.2, 0.4, 0.6, 0.8].map((t) => <div key={t} style={{ position: "absolute", left: `${t * 100}%`, top: -1, bottom: -1, width: 1, background: "var(--ink-soft)" }} />)}
          <div style={{ position: "absolute", left: `${dr * 100}%`, top: -4, width: 5, height: 15, background: ink, transform: "translateX(-50%)", boxShadow: "1px 1px 0 rgba(0,0,0,.2)" }} />
        </div>
        <div style={{ textAlign: "center", fontSize: 9, color: margin, marginTop: 3, letterSpacing: ".03em" }}>↔ drag to move through the crossing</div>
      </div>
      {/* the surrounding at this moment */}
      <div style={{ fontSize: 11, color: soft, fontStyle: "italic", margin: "9px 2px 0", paddingLeft: 4 }}><span style={{ color: forest, fontStyle: "normal", fontWeight: 700, letterSpacing: ".04em" }}>{scenes[ph]}</span> — {story.env[ph]}</div>
      {/* THE BEATS — the main event: what content can live at this moment, cozy ↔ intense */}
      {beat && (
        <div style={{ border: `2px solid ${forest}`, background: shade, padding: "11px 13px", marginTop: 11 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 8 }}>↕ WHAT CONTENT CAN LIVE HERE — the subrange (a beat can run with or against the surrounding)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, marginBottom: 9 }}>
            <span style={{ color: forest, fontWeight: 700 }}>cozy</span>
            <div style={{ flex: 1, height: 4, background: `linear-gradient(90deg, ${forest}, var(--spot-red))`, opacity: 0.55 }} />
            <span style={{ color: "var(--spot-red)", fontWeight: 700 }}>intense</span>
          </div>
          <div style={{ display: "grid", gap: 10, minHeight: 88 }}>
            <div style={{ borderLeft: `3px solid ${forest}`, paddingLeft: 10 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, color: forest, letterSpacing: ".08em" }}>◂ COZY BEAT</div>
              <div style={{ fontSize: 13.5, color: ink, lineHeight: 1.5 }}>{beat.cozy}</div>
            </div>
            <div style={{ borderLeft: `3px solid var(--spot-red)`, paddingLeft: 10 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, color: "var(--spot-red)", letterSpacing: ".08em" }}>INTENSE BEAT ▸</div>
              <div style={{ fontSize: 13.5, color: ink, lineHeight: 1.5 }}>{beat.intense}</div>
            </div>
          </div>
        </div>
      )}
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
