"use client";
// THE SCRUBBER — the player-facing scrub of the SETTING's surrounding environment, in the bench's
// style (a live <input type="range"> + procedural ASCII). For the Ferry the environment is sun · sky ·
// sea · waves, arcing cozy→intense with the dial; the ferry [boat] is the INVARIANT (§8.15 — the
// setting persists, only the weather arcs). The dial scrubs the SUBRANGE (coziness); the picked
// subrange supplies the two-part title at each stop. Each stop is its own cozy→intense→cozy story.
import { useState } from "react";

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)";
const mono: React.CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", whiteSpace: "pre", lineHeight: 1.04, letterSpacing: 0 };

const COLS = 36, ROWS = 12, WATER = 7;
const SEA = [" ", "·", "~", "~", "≈", "▒", "▓", "█"]; // calm → stormy

function noise(x: number, y: number, s: number) {
  let h = (x * 73856093) ^ (y * 19349663) ^ (s * 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return ((h >>> 0) % 1000) / 1000;
}

// the surrounding environment at intensity dr (0 = deeply cozy / sunny-calm, 1 = intense / storm)
function ferryArt(dr: number): string[] {
  const g: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
  // SUN (top-right) — fades out as dr rises
  if (dr < 0.62) {
    const sx = 27, sy = 1, sun = ["\\ | /", "- O -", "/ | \\"];
    sun.forEach((ln, j) => [...ln].forEach((ch, i) => {
      const x = sx + i, y = sy + j;
      if (ch !== " " && y >= 0 && y < WATER - 1 && x >= 0 && x < COLS && noise(x, y, 1) > dr * 0.95) g[y][x] = ch;
    }));
  }
  // CLOUDS (top) + RAIN — grow with dr
  if (dr > 0.38) {
    for (let y = 0; y < 2; y++) for (let x = 0; x < COLS; x++) if (noise(x, y, 3) < (dr - 0.38) * 1.7) g[y][x] = noise(x, y, 5) < dr ? "▓" : "▒";
    if (dr > 0.6) for (let y = 2; y < WATER - 1; y++) for (let x = 0; x < COLS; x++) if (noise(x, y, 9) < (dr - 0.6) * 1.25) g[y][x] = (x + 2 * y) % 3 ? "/" : " ";
  }
  // SEA (below the waterline) — density + crests by dr
  for (let y = WATER; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const depth = (y - WATER + 1) / (ROWS - WATER);
    const t = dr * 1.45 + depth * 0.35 - noise(x, y, 7) * 0.7;
    g[y][x] = SEA[Math.max(1, Math.min(SEA.length - 1, Math.round(t * (SEA.length - 1))))];
  }
  // THE FERRY — the invariant, sitting on the waterline, centered
  const boat = ["    ___", "   /▫▫▫\\", " _/_____\\_"];
  const bx = Math.floor((COLS - 9) / 2), by = WATER - 2;
  boat.forEach((ln, j) => [...ln].forEach((ch, i) => {
    const x = bx + i, y = by + j;
    if (ch !== " " && y >= 0 && y < ROWS && x >= 0 && x < COLS) g[y][x] = ch;
  }));
  return g.map((r) => r.join(""));
}

export default function Scrubber({ settingTitle, coziness, storyTitles }: { settingTitle: string; coziness: string[]; storyTitles: string[] }) {
  const [dr, setDr] = useState(0.18);
  const n = coziness.length;
  const stop = Math.min(n - 1, Math.max(0, Math.round(dr * (n - 1))));
  return (
    <div style={{ border: `2px solid ${forest}`, background: shade, padding: "14px 14px 16px", margin: "0 0 18px" }}>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", color: forest, marginBottom: 8 }}>▶ THE SCRUBBER — drag the dial; the surrounding arcs, the crossing holds</div>
      <pre style={{ ...mono, fontSize: 14, color: ink, background: paper, border: `1.5px solid ${ink}`, padding: "10px 6px", margin: 0, textAlign: "center", overflow: "hidden" }}>{ferryArt(dr).join("\n")}</pre>
      <div style={{ textAlign: "center", margin: "12px 8px 14px", minHeight: 46 }}>
        <div style={{ fontFamily: "var(--theme-display)", fontSize: 18, color: ink }}>{settingTitle}</div>
        <div style={{ fontSize: 15, fontStyle: "italic", color: soft }}>{storyTitles[stop]}</div>
        <div style={{ fontSize: 10, color: margin, marginTop: 2, letterSpacing: ".06em" }}>— {coziness[stop]} —</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 480, margin: "0 auto" }}>
        <span style={{ fontSize: 11, color: margin, width: 64, textAlign: "right" }}>deeply cozy</span>
        <input type="range" min={0} max={1} step={0.01} value={dr} onChange={(e) => setDr(+e.target.value)} aria-label="coziness" style={{ flex: 1, accentColor: forest }} />
        <span style={{ fontSize: 11, color: margin, width: 44 }}>intense</span>
      </div>
      <div style={{ textAlign: "center", fontSize: 10, color: margin, marginTop: 6, fontStyle: "italic" }}>the sun · sky · sea arc with the dial; the ferry holds (§8.15). each stop is its own cozy→intense→cozy story.</div>
    </div>
  );
}
