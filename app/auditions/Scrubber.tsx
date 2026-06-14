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

type Group = { id: string; name: string; settingTitle: string; storyTitles: string[]; relate: number; safe: number };

// We're still PICKING — so the scrubber is a candidate switcher (the bench pattern): scrub EACH
// candidate subrange to compare, then pick the most cohesive. The ferry environment art is shared
// (it's the setting); the candidates differ in their titles (the surrounding anchor + the subrange).
export default function Scrubber({ coziness, groups }: { coziness: string[]; groups: Group[] }) {
  const [gi, setGi] = useState(0); // default = the highest-cohesion candidate (groups are pre-sorted)
  const [dr, setDr] = useState(0.18);
  const g = groups[gi] ?? groups[0];
  const n = coziness.length;
  const stop = Math.min(n - 1, Math.max(0, Math.round(dr * (n - 1))));
  const safeCol = (s: number) => (s >= 4 ? forest : s >= 3 ? "#c08a2e" : "var(--spot-red)");
  return (
    <div style={{ border: `2px solid ${forest}`, background: shade, padding: "14px 14px 16px", margin: "0 0 18px" }}>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", color: forest, marginBottom: 8 }}>▶ THE SCRUBBER — scrub each candidate, then pick the most cohesive range</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {groups.map((x, i) => (
          <button key={x.id} onClick={() => setGi(i)} style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, padding: "4px 9px", cursor: "pointer", borderRadius: 5, border: `1.5px solid ${i === gi ? forest : "var(--ink-soft)"}`, background: i === gi ? paper : "transparent", color: i === gi ? forest : margin }}>
            {x.name} <span style={{ fontWeight: 400, color: safeCol(x.safe) }}>· cohesion {x.relate.toFixed(1)}/{x.safe.toFixed(1)}</span>{i === 0 ? " ★" : ""}
          </button>
        ))}
      </div>
      <pre style={{ ...mono, fontSize: 14, color: ink, background: paper, border: `1.5px solid ${ink}`, padding: "10px 6px", margin: 0, textAlign: "center", overflow: "hidden" }}>{ferryArt(dr).join("\n")}</pre>
      <div style={{ textAlign: "center", margin: "12px 8px 14px", minHeight: 46 }}>
        <div style={{ fontFamily: "var(--theme-display)", fontSize: 18, color: ink }}>{g.settingTitle}</div>
        <div style={{ fontSize: 15, fontStyle: "italic", color: soft }}>{g.storyTitles[stop]}</div>
        <div style={{ fontSize: 10, color: margin, marginTop: 2, letterSpacing: ".06em" }}>— {coziness[stop]} —</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 480, margin: "0 auto" }}>
        <span style={{ fontSize: 11, color: margin, width: 64, textAlign: "right" }}>deeply cozy</span>
        <input type="range" min={0} max={1} step={0.01} value={dr} onChange={(e) => setDr(+e.target.value)} aria-label="coziness" style={{ flex: 1, accentColor: forest }} />
        <span style={{ fontSize: 11, color: margin, width: 44 }}>intense</span>
      </div>
      <div style={{ textAlign: "center", fontSize: 10, color: margin, marginTop: 6, fontStyle: "italic" }}>the surrounding dials calm → storm (just cozy→intense); the ferry holds (§8.15). switch candidates to compare — ★ = the audition’s most cohesive.</div>
    </div>
  );
}
