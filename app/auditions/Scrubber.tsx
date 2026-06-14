"use client";
// THE SCRUBBER — the player-facing scrub of the SETTING's surrounding environment, in the bench's
// style (a live <input type="range"> + procedural ASCII). For the Ferry the environment is sun · sky ·
// sea · waves, arcing cozy→intense with the dial; the ferry [boat] is the INVARIANT (§8.15 — the
// setting persists, only the weather arcs). The dial scrubs the SUBRANGE (coziness); the picked
// subrange supplies the two-part title at each stop. Each stop is its own cozy→intense→cozy story.
import { useState } from "react";

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)";
const mono: React.CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", whiteSpace: "pre", lineHeight: 1.04, letterSpacing: 0 };

// THE FERRY ENVIRONMENT — authored by the ASCII-art commission (demoscene/ANSI tradition): bands
// (sky · horizon · sea) + a per-column surf[] height-field + the ferry sprite drawn LAST as one rigid
// pitching body (so the hull never cracks). dr 0 = clear moon + glassy calm; dr 1 = storm + rain +
// heavy swell, the ferry HOLDING with its warm window. Every layer is a smooth function of dr (no
// keyframe special-casing) so the scrub is continuous. The NEGATIVE (the boat) is the invariant (§8.15).
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

function ferryArt(dr: number): string[] {
  dr = clamp(dr, 0, 1);
  const grid: string[][] = [];
  for (let r = 0; r < ROWS; r++) grid.push(new Array(COLS).fill(" "));
  const put = (x: number, y: number, ch: string | null | undefined) => {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS && ch != null) grid[y][x] = ch;
  };
  const SEA_Y = 7;
  // SKY — moon (fades), stars (clear sky), clouds (grow), rain (rough end)
  const moonX = 29, moonY = 1;
  if (dr < 0.62) { put(moonX, moonY, "("); put(moonX + 1, moonY, ")"); if (dr < 0.30) { put(moonX - 1, moonY, "."); put(moonX + 2, moonY, "."); } }
  const starDensity = clamp(1 - dr / 0.5, 0, 1);
  for (let y = 0; y < SEA_Y - 1; y++) for (let x = 0; x < COLS; x++) {
    if (Math.abs(x - moonX) < 3 && y <= moonY + 1) continue;
    const h = hash(x, y, 7);
    if (h > 0.985 && h < 0.985 + starDensity * 0.012) put(x, y, h > 0.991 ? "*" : ".");
  }
  const cloud = clamp((dr - 0.28) / 0.72, 0, 1);
  if (cloud > 0) {
    const maxDepth = SEA_Y - 1;
    for (let y = 0; y < SEA_Y - 1; y++) for (let x = 0; x < COLS; x++) {
      const n = snoise(x * 0.30 + 11, 21) * 0.6 + snoise(x * 0.13 + y * 0.5 + 3, 31) * 0.4;
      const rowBias = 1 - y / maxDepth;
      const thresh = 1 - cloud * (0.45 + 0.55 * rowBias);
      if (n > thresh) {
        const over = (n - thresh) / (1 - thresh + 1e-6);
        let ch = "░";
        if (dr > 0.8 && over > 0.55) ch = "▓"; else if (over > 0.5) ch = "▒";
        put(x, y, ch);
      }
    }
  }
  if (dr > 0.55) {
    const rainAmt = clamp((dr - 0.55) / 0.45, 0, 1);
    for (let y = 1; y < SEA_Y; y++) for (let x = 0; x < COLS; x++) {
      const h = hash((x + y * 2) % 997, y, 55);
      if (h < rainAmt * 0.09 && (grid[y][x] === " " || grid[y][x] === "░")) put(x, y, "'");
    }
  }
  // SEA — per-column surf[] height-field; calm end kept SPARSE, darkens/fills with dr
  const swellAmp = lerp(0.20, 2.4, dr), chop = dr;
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
        const fill = depth + dr * 2.4 - (1 - dr) * 2.2;
        if (fill < 0.6) ch = chop < 0.3 ? " " : "≈";
        else if (fill < 1.6) ch = "≈"; else if (fill < 2.6) ch = "▃";
        else if (fill < 3.6) ch = "▅"; else if (fill < 4.6) ch = "▆"; else ch = "▇";
      }
      if (ch !== " ") put(x, y, ch);
    }
  }
  if (dr < 0.26) {
    const glade = clamp(1 - dr / 0.26, 0, 1);
    for (let y = SEA_Y; y < SEA_Y + 2; y++) for (let dx = -1; dx <= 1; dx++) {
      const x = moonX + dx;
      if (hash(x, y, 12) < 0.45 * glade) put(x, y, dx === 0 ? ":" : ".");
    }
  }
  // THE FERRY — the invariant, drawn last; one rigid hull that pitches without cracking
  const fcx = 13;
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
  const windLean = dr > 0.4 ? 1 : 0;
  let sx = stackX, sy = stackTop - 1;
  for (let i = 0; i < 2; i++) { if (sy < 0) break; sx += windLean; const g = dr < 0.35 ? (i === 0 ? "." : null) : (i === 0 ? "~" : "'"); if (g) put(sx, sy, g); sy -= 1; }
  put(hullR, deckY(hullR), "/");
  return grid.map((row) => { let s = row.join(""); if (s.length < COLS) s += " ".repeat(COLS - s.length); else if (s.length > COLS) s = s.slice(0, COLS); return s; });
}

type Group = { id: string; name: string; settingTitle: string; storyTitles: string[]; relate: number; safe: number; top?: boolean };

// THE DYNAMIC RANGE (the surrounding environment), per owner: it PEAKS AND FALLS — calm → intense
// (70-80%) → calm again (80-100%). The dial drives the environment through that arc; the title +
// coziness follow it (cozy at the calm ends, intense at the peak). EACH candidate SET gets its OWN
// art scrubber (we're picking by feel). The ferry is the invariant (§8.15).
function arc(dr: number): number {
  if (dr < 0.7) return dr / 0.7;                       // calm → intense, rising over [0, 0.7]
  if (dr < 0.8) return 1;                              // the intense PEAK, [0.7, 0.8]
  return Math.max(0, 1 - (dr - 0.8) / 0.2);            // intense → calm again, [0.8, 1.0]
}
const safeCol = (s: number) => (s >= 4 ? forest : s >= 3 ? "#c08a2e" : "var(--spot-red)");

function OneScrubber({ g, coziness }: { g: Group; coziness: string[] }) {
  const [dr, setDr] = useState(0.0);
  const intensity = arc(dr);
  const n = coziness.length;
  const stop = Math.min(n - 1, Math.max(0, Math.round(intensity * (n - 1))));
  return (
    <div style={{ border: `2px solid ${g.top ? forest : "var(--ink-soft)"}`, background: g.top ? shade : paper, padding: "12px 12px 14px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--theme-body)", fontSize: 11.5, fontWeight: 700, color: g.top ? forest : ink }}>{g.top ? "★ " : ""}{g.name}</span>
        <span style={{ fontSize: 10, color: safeCol(g.safe) }}>cohesion {g.relate.toFixed(1)}/{g.safe.toFixed(1)}</span>
      </div>
      <pre style={{ ...mono, fontSize: 12.5, color: ink, background: paper, border: `1.5px solid ${ink}`, padding: "9px 6px", margin: 0, textAlign: "center", overflow: "hidden" }}>{ferryArt(intensity).join("\n")}</pre>
      <div style={{ textAlign: "center", margin: "9px 8px 11px", minHeight: 44 }}>
        <div style={{ fontFamily: "var(--theme-display)", fontSize: 17, color: ink }}>{g.settingTitle}</div>
        <div style={{ fontSize: 14, fontStyle: "italic", color: soft }}>{g.storyTitles[stop]}</div>
        <div style={{ fontSize: 10, color: margin, marginTop: 2, letterSpacing: ".06em" }}>— {coziness[stop]} —</div>
      </div>
      <input type="range" min={0} max={1} step={0.01} value={dr} onChange={(e) => setDr(+e.target.value)} aria-label="dynamic range" style={{ width: "100%", accentColor: forest, display: "block" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: margin, marginTop: 2 }}>
        <span>calm</span><span>↑ intense (¾)</span><span>calm again</span>
      </div>
    </div>
  );
}

// Each SET its own art scrubber (groups pre-sorted by cohesion; the first is ★).
export default function Scrubber({ coziness, groups }: { coziness: string[]; groups: Group[] }) {
  return (
    <div style={{ margin: "0 0 18px" }}>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", color: forest, marginBottom: 8 }}>▶ THE SCRUBBERS — drag each candidate’s dial; the surrounding dynamic range PEAKS &amp; FALLS (calm → intense → calm), the ferry holds (§8.15). Scrub each to pick the most cohesive.</div>
      {groups.map((g, i) => <OneScrubber key={g.id} g={{ ...g, top: i === 0 }} coziness={coziness} />)}
    </div>
  );
}
