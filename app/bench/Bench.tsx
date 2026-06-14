"use client";

// THE BENCH — a prototype of the dynamic-range concept-space browser (the proposed
// homepage). THREE versions to pick from (SCRUB · LATTICE · BOARD). ALL DATA IS FAKE:
// the ASCII is generated deterministically from the DR value (density · ░ ▒ ▓ █ = the
// dynamic range), and the prose lines are evocative placeholders to be authored once a
// direction is picked. Nothing here is canon yet.

import { useState } from "react";

type Concept = {
  id: string; name: string; weather: string;
  structure: string[]; sx: number; sy: number; seed: number;
  stops: string[];           // 5 placeholder prose lines, gentle → aching
  opens: string; forecloses: string;
};

const COLS = 32, ROWS = 9;
const RAMP = [" ", "·", "░", "▒", "▓", "█"]; // sparse → dense = low DR → high DR

// deterministic value noise in [0,1)
function noise(x: number, y: number, seed: number) {
  let h = (x * 73856093) ^ (y * 19349663) ^ (seed * 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 1000) / 1000;
}

// the SAME negative at dynamic-range `dr` (0..1): the structure is the invariant, the
// surrounding density IS the dynamic range. Higher dr → the world fills in, darker.
function renderEnv(c: Concept, dr: number): string[] {
  const grid: string[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row: string[] = [];
    for (let x = 0; x < COLS; x++) {
      const t = dr * 1.6 - noise(x, y, c.seed);
      let ch = " ";
      if (t > 0) ch = RAMP[Math.max(1, Math.min(RAMP.length - 1, 1 + Math.floor(t * (RAMP.length - 1))))];
      row.push(ch);
    }
    grid.push(row);
  }
  c.structure.forEach((line, j) => {
    const yy = c.sy + j; if (yy < 0 || yy >= ROWS) return;
    for (let i = 0; i < line.length; i++) {
      const xx = c.sx + i; const ch = line[i];
      if (xx >= 0 && xx < COLS && ch !== " ") grid[yy][xx] = ch;
    }
  });
  return grid.map((r) => r.join(""));
}

const STOP = (dr: number) => Math.min(4, Math.max(0, Math.round(dr * 4)));

// ── the fake concept set (the six surrounding-world negatives) ──────────────────
const C: Concept[] = [
  { id: "lantern", name: "THE LANTERN", weather: "fog", seed: 7, sx: 13, sy: 2,
    structure: ["  .", " /^\\", " |=|", " |=|", "_|_|_"],
    stops: ["the light holds. the fog is only weather.",
            "the light holds. the fog leans in tonight.",
            "the light holds — the fog keeps its own counsel.",
            "the light still holds. the shore is gone.",
            "the light still holds. someone didn't come back."],
    opens: "TEND · FLOW", forecloses: "combat" },
  { id: "rain", name: "THE LONG RAIN", weather: "rain", seed: 19, sx: 12, sy: 3,
    structure: [".------.", "|  __  |", "| |  | |", "'------'"],
    stops: ["the kettle's on. it's only rain.",
            "the kettle's on. the rain settles in to stay.",
            "the kettle's on — and nobody's leaving soon.",
            "the kettle's on. the road's a river now.",
            "the kettle's on. you came in from more than rain."],
    opens: "TEND · ENSEMBLE", forecloses: "—" },
  { id: "pass", name: "THE PASS", weather: "snow", seed: 31, sx: 13, sy: 3,
    structure: [" _A_", "/   \\", "| [] |", "'---'"],
    stops: ["the fire's lit. the pass will clear.",
            "the fire's lit. the snow doesn't mean to stop.",
            "the fire's lit — and the radio's gone quiet.",
            "the fire's lit. the pass is closed for days.",
            "the fire's lit. not everyone made the station."],
    opens: "TEND · SCRAMBLE", forecloses: "fast travel" },
  { id: "flats", name: "THE FLATS", weather: "tide", seed: 47, sx: 13, sy: 3,
    structure: ["  /\\", " /  \\", " |..|"],
    stops: ["the tide's out. cross while it's low.",
            "the tide's out. it always comes back.",
            "the tide turns — it keeps its own hours.",
            "the tide's in. the path is under water.",
            "the tide's in. the sea kept what you left."],
    opens: "FLOW · scrapbook", forecloses: "—" },
  { id: "glass", name: "THE NIGHT GLASS", weather: "stars", seed: 59, sx: 12, sy: 3,
    structure: ["  .-.", " / o \\", "|/___\\|"],
    stops: ["the sky's clear. look up.",
            "the sky's clear. it doesn't need you to.",
            "the sky turns — slow, and without asking.",
            "the sky's vast. you feel how small.",
            "the sky's vast. and someone's chair is empty."],
    opens: "LIVING MAP · TEND", forecloses: "combat" },
  { id: "glasshouse", name: "THE CONSERVATORY", weather: "winter", seed: 71, sx: 12, sy: 2,
    structure: [" /###\\", "/#####\\", "|#####|", "|__M__|"],
    stops: ["warm glass. the green holds against the cold.",
            "warm glass. the frost climbs the panes.",
            "warm glass — and one pot you forgot to water.",
            "warm glass. the cold's found a crack.",
            "warm glass. the old vine didn't make the winter."],
    opens: "TEND · scrapbook", forecloses: "—" },
];

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)";
const mono: React.CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", whiteSpace: "pre", lineHeight: 1.05, letterSpacing: 0 };

// ── V1 · THE SCRUB — story-first; one negative, one dynamic-range scrub ──────────
function Scrub({ c, dr, setDr, pick }: { c: Concept; dr: number; setDr: (n: number) => void; pick: (id: string) => void }) {
  return (
    <div>
      <pre style={{ ...mono, fontSize: 17, color: ink, background: shade, border: `2px solid ${ink}`, padding: "14px 12px", margin: 0, textAlign: "center", overflow: "hidden" }}>
        {renderEnv(c, dr).join("\n")}
      </pre>
      <p style={{ fontSize: 17, fontStyle: "italic", color: ink, textAlign: "center", margin: "16px 8px 18px", minHeight: 48 }}>
        &ldquo;{c.stops[STOP(dr)]}&rdquo;
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 460, margin: "0 auto" }}>
        <span style={{ fontSize: 11, color: margin, width: 48, textAlign: "right" }}>gentle</span>
        <input type="range" min={0} max={1} step={0.01} value={dr} onChange={(e) => setDr(+e.target.value)}
          aria-label="dynamic range" style={{ flex: 1, accentColor: forest }} />
        <span style={{ fontSize: 11, color: margin, width: 48 }}>aching</span>
      </div>
      <div style={{ textAlign: "center", fontSize: 10, letterSpacing: ".12em", color: margin, marginTop: 4 }}>▁▂▃▄▅▆▇ DYNAMIC RANGE</div>
      <div style={{ textAlign: "center", fontSize: 11.5, color: soft, marginTop: 14 }}>
        <b style={{ color: forest }}>opens</b> {c.opens} · <b style={{ color: "var(--spot-red)" }}>forecloses</b> {c.forecloses}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 22 }}>
        {C.map((x) => (
          <button key={x.id} onClick={() => pick(x.id)}
            style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", padding: "4px 9px", cursor: "pointer", borderRadius: 5, border: `1px solid ${x.id === c.id ? forest : "var(--ink-soft)"}`, background: x.id === c.id ? paper : "transparent", color: x.id === c.id ? forest : margin }}>
            {x.name} · {x.weather}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── V2 · THE LATTICE — the neighborhood; environment × dynamic-range, ghost cells invite ──
function Lattice({ onCell }: { onCell: (id: string, dr: number) => void }) {
  const cols = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 8, paddingLeft: 92, marginBottom: 4, fontSize: 10, letterSpacing: ".1em", color: margin }}>
        <span>gentle&nbsp;◀───────── DYNAMIC RANGE ─────────▶&nbsp;aching</span>
      </div>
      {C.map((c) => (
        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 84, flex: "0 0 auto", textAlign: "right", fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 10, color: forest }}>{c.name}<br /><span style={{ color: margin, fontWeight: 400 }}>{c.weather}</span></div>
          {cols.map((dr, i) => (
            <button key={i} onClick={() => onCell(c.id, dr)}
              title={`${c.name} · DR ${i - 2 >= 0 ? "+" : ""}${i - 2}`}
              style={{ flex: "0 0 auto", padding: 3, cursor: "pointer", border: `1px solid var(--ink-soft)`, background: shade }}>
              <pre style={{ ...mono, fontSize: 4.5, color: ink, margin: 0 }}>{renderEnv(c, dr).join("\n")}</pre>
            </button>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: 0.5 }}>
        <div style={{ width: 84, flex: "0 0 auto", textAlign: "right", fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 10, color: margin }}>＋ compose<br /><span style={{ fontWeight: 400 }}>untried</span></div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: "0 0 auto", width: 76, height: 50, border: `1px dashed var(--ink-soft)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: margin }}>⌁</div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: margin, marginTop: 6 }}>● filled = an execution that exists · ⌁ ghost = an untried exposure (compose it). No X/N count — the empties just invite.</p>
    </div>
  );
}

// ── V3 · THE MIXING BOARD — the owner's tune drawer; the full element-dial rack ──
const DIALS = [
  { k: "struggle", lo: "ache", hi: "world-shatter", live: true },
  { k: "setting", lo: "backdrop", hi: "symbolic", live: false },
  { k: "genre", lo: "grounded", hi: "full-cozy", live: false },
  { k: "reveal", lo: "shown", hi: "???", live: false },
  { k: "romance", lo: "warm", hi: "charged", live: false },
  { k: "pace", lo: "still", hi: "kinetic", live: false },
];
function Board({ c, dr, setDr, pick }: { c: Concept; dr: number; setDr: (n: number) => void; pick: (id: string) => void }) {
  return (
    <div>
      <pre style={{ ...mono, fontSize: 14, color: ink, background: shade, border: `2px solid ${ink}`, padding: "11px 10px", margin: 0, textAlign: "center", overflow: "hidden" }}>
        {renderEnv(c, dr).join("\n")}
      </pre>
      <p style={{ fontSize: 14, fontStyle: "italic", color: ink, textAlign: "center", margin: "11px 8px 14px", minHeight: 38 }}>&ldquo;{c.stops[STOP(dr)]}&rdquo;</p>
      <div style={{ border: `1px solid var(--ink-soft)`, background: paper, padding: "12px 14px" }}>
        <div style={{ fontSize: 10, letterSpacing: ".14em", color: forest, fontFamily: "var(--theme-body)", fontWeight: 700, marginBottom: 10 }}>✦ TUNE — the negative is pinned; scrub its dials</div>
        {DIALS.map((d) => (
          <div key={d.k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9, opacity: d.live ? 1 : 0.5 }}>
            <span style={{ width: 70, flex: "0 0 auto", fontSize: 11, fontWeight: 700, color: d.live ? ink : margin }}>{d.k}</span>
            <span style={{ fontSize: 9.5, color: margin, width: 56, textAlign: "right" }}>{d.lo}</span>
            <input type="range" min={0} max={1} step={0.01}
              value={d.live ? dr : 0.4}
              onChange={(e) => d.live && setDr(+e.target.value)}
              disabled={!d.live} style={{ flex: 1, accentColor: d.live ? forest : margin }} />
            <span style={{ fontSize: 9.5, color: margin, width: 56 }}>{d.hi}</span>
          </div>
        ))}
        <p style={{ fontSize: 10, color: margin, fontStyle: "italic", margin: "4px 0 0" }}>only <b>struggle</b> (= the dynamic range) is wired in this prototype; the rest are illustrative.</p>
      </div>
      <div style={{ textAlign: "center", fontSize: 11.5, color: soft, marginTop: 12 }}>
        <b style={{ color: forest }}>opens</b> {c.opens} · <b style={{ color: "var(--spot-red)" }}>forecloses</b> {c.forecloses}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 16 }}>
        {C.map((x) => (
          <button key={x.id} onClick={() => pick(x.id)}
            style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, padding: "3px 8px", cursor: "pointer", borderRadius: 5, border: `1px solid ${x.id === c.id ? forest : "var(--ink-soft)"}`, background: x.id === c.id ? paper : "transparent", color: x.id === c.id ? forest : margin }}>{x.name}</button>
        ))}
      </div>
    </div>
  );
}

const VERSIONS = [
  { k: "scrub", label: "① SCRUB", sub: "the landing — one story, one scrub" },
  { k: "lattice", label: "② LATTICE", sub: "the neighborhood — the whole space" },
  { k: "board", label: "③ BOARD", sub: "the tune drawer — all dials (owner)" },
] as const;

export default function Bench() {
  const [ver, setVer] = useState<"scrub" | "lattice" | "board">("scrub");
  const [cid, setCid] = useState("lantern");
  const [dr, setDr] = useState(0.5);
  const c = C.find((x) => x.id === cid) ?? C[0];
  const pick = (id: string) => setCid(id);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "26px 18px 80px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ fontSize: 24, margin: 0, color: ink }}>The Bench</h1>
        <span style={{ fontSize: 10.5, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>PROTOTYPE · FAKE DATA</span>
      </div>
      <p style={{ color: soft, fontSize: 13, lineHeight: 1.55, margin: "6px 0 16px", maxWidth: 560 }}>
        The dynamic-range concept-space browser — candidate to replace the homepage. The ASCII density (<span style={mono}>· ░ ▒ ▓ █</span>) <b>is</b> the dynamic range; the prose snaps to five stops. Three versions — pick the one that feels right; we author real content after.
      </p>

      {/* version switcher — the thing to pick */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {VERSIONS.map((v) => (
          <button key={v.k} onClick={() => setVer(v.k)}
            style={{ textAlign: "left", padding: "8px 12px", cursor: "pointer", borderRadius: 7, border: `1.5px solid ${ver === v.k ? forest : "var(--ink-soft)"}`, background: ver === v.k ? paper : "transparent" }}>
            <div style={{ fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 12.5, color: ver === v.k ? forest : ink }}>{v.label}</div>
            <div style={{ fontSize: 10, color: margin }}>{v.sub}</div>
          </button>
        ))}
      </div>

      {ver === "scrub" && <Scrub c={c} dr={dr} setDr={setDr} pick={pick} />}
      {ver === "lattice" && <Lattice onCell={(id, d) => { setCid(id); setDr(d); setVer("scrub"); }} />}
      {ver === "board" && <Board c={c} dr={dr} setDr={setDr} pick={pick} />}
    </main>
  );
}
