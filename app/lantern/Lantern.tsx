"use client";

// THE LANTERN — a lightweight PLAYABLE slice of one fog-world story (Phase B de-risk):
// the convergent-origins entry → 6 days mapped to the 5-phase DR arc (cozy → heightened →
// INTENSE held-ache peak → aftermath → renewal) → the coach-chat tease. The fog ASCII density
// tracks each day's phase-DR, so the arc is VISIBLE in the environment as you play it. The
// trichotomy choice → outcome → stat loop is the real (minimal) gameplay. Content is authored,
// not canon — a test of whether the new authoring makes days that play.

import { useState } from "react";

// ── the fog ASCII (density = the day's DR = the arc, made visible) ──────────────
const COLS = 34, ROWS = 8, RAMP = [" ", "·", "░", "▒", "▓", "█"];
function noise(x: number, y: number, s: number) { let h = (x * 73856093) ^ (y * 19349663) ^ (s * 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h = h ^ (h >>> 16); return ((h >>> 0) % 1000) / 1000; }
const LIGHT = ["   .", "  /^\\", "  |=|", "  |=|", " _|_|_"];
function fog(dr: number, seed = 7): string {
  const g: string[][] = [];
  for (let y = 0; y < ROWS; y++) { const r: string[] = []; for (let x = 0; x < COLS; x++) { const t = dr * 1.6 - noise(x, y, seed); r.push(t > 0 ? RAMP[Math.max(1, Math.min(5, 1 + Math.floor(t * 5)))] : " "); } g.push(r); }
  LIGHT.forEach((line, j) => { const yy = 2 + j; for (let i = 0; i < line.length; i++) { const xx = 13 + i; if (yy < ROWS && line[i] !== " ") g[yy][xx] = line[i]; } });
  return g.map((r) => r.join("")).join("\n");
}

type Stat = "STR" | "INT" | "GLD" | "CHR";
type Choice = { role: "CAUTIOUS" | "BOLD" | "CHAOTIC"; label: string; stats: Partial<Record<Stat, number>>; keeper: string };
type Day = { phase: string; dr: number; title: string; scene: string; choices: Choice[]; final?: boolean };

const ORIGINS = [
  { id: "keeper", who: "The Keeper", line: "a figure with a lantern, unhurried, watching the boat come in." },
  { id: "horn", who: "The Foghorn-tender", line: "a shape by the horn, polishing brass it has polished a thousand times." },
  { id: "pilot", who: "The Pilot", line: "the one who brought you, lingering at the rope as if reluctant to leave." },
  { id: "recorder", who: "The Recorder", line: "someone with a ledger, counting gulls under their breath." },
];

const STATS0: Record<Stat, number> = { STR: 8, INT: 8, GLD: 5, CHR: 8 };

const DAYS: Day[] = [
  { phase: "COZY", dr: 0.14, title: "The Arrival",
    scene: "The fog is thin as breath. You step onto the pier and the lighthouse stands over you, repainted a dozen times the same grey-white. {ORIGIN} “Tide’s turning,” the Keeper says — not quite a smile, not quite a frown. “So’s the gangway.” You’re shown to the light: the lens, the wick, the log.",
    choices: [
      { role: "CAUTIOUS", label: "Watch first. Learn the rhythm before I touch anything.", stats: { INT: 2 }, keeper: "“Good. The light’s been here longer than either of us. No rush.”" },
      { role: "BOLD", label: "Show me the lens. I’ll take the first watch tonight.", stats: { STR: 2 }, keeper: "“Eager.” A pause. “Mind the third stair — it’s loose.”" },
      { role: "CHAOTIC", label: "Ask the gulls which way the shore is.", stats: { CHR: 2 }, keeper: "The Keeper actually huffs a laugh. “They lie. But they’re good company.”" },
    ] },
  { phase: "COZY", dr: 0.22, title: "The Rhythm",
    scene: "Morning, or what passes for it in the fog. The kettle’s on. The little table is laid for four, and a fifth place at the end, its bowl turned down. The Keeper shows you the trim of the wick, the weight of the log’s first line: ‘Stood the watch. Logged at full weight, as is only proper.’",
    choices: [
      { role: "CAUTIOUS", label: "Keep the log exactly as shown.", stats: { INT: 2 }, keeper: "“The log doesn’t need flourishes. Just the truth, kept.”" },
      { role: "BOLD", label: "Add a line of my own — what the fog felt like.", stats: { CHR: 1, STR: 1 }, keeper: "A long look. “…The keeper before me did that too.”" },
      { role: "CHAOTIC", label: "Set a place at the fifth bowl. Just in case.", stats: { CHR: 2 }, keeper: "The Keeper goes very still. Then, quiet: “…Leave it. But thank you.”" },
    ] },
  { phase: "HEIGHTENED", dr: 0.5, title: "The Boat is Late",
    scene: "The fog’s heavier today — a wet grey wall that swallows the rail six feet out. The supply boat should have come at noon. It hasn’t. The Keeper checks the horn, checks the glass, checks the empty water, and doesn’t say what they’re thinking. Their hand rests a moment on the fifth chair.",
    choices: [
      { role: "CAUTIOUS", label: "Keep the light steady and even. Let it do its work.", stats: { INT: 2 }, keeper: "“That’s the job. The light doesn’t panic. Neither do we.”" },
      { role: "BOLD", label: "Ring the foghorn long, past the schedule. Reach for them.", stats: { STR: 2 }, keeper: "“…Aye. A little longer. Can’t hurt.” Their voice catches, just slightly." },
      { role: "CHAOTIC", label: "Tell the Keeper a bad joke to break the quiet.", stats: { CHR: 2 }, keeper: "It’s a terrible joke. The Keeper laughs anyway, like they needed to." },
    ] },
  { phase: "INTENSE", dr: 0.96, title: "The Long Night",
    scene: "The storm comes in fast — the kind the fog was hiding. The lens stutters; the flame gutters low; the whole tower hums with wind. You and the Keeper work the light through the dark, hand to wick, eyes to the black water. Somewhere in the worst of it the Keeper says it — to the glass, not to you: “There was one the light didn’t bring back. A long time ago.” A breath. “But the light still holds. So do we.”",
    choices: [
      { role: "CAUTIOUS", label: "Nurse the flame. Steady, steady. Don’t let it go out.", stats: { INT: 2 }, keeper: "“Good hands. The before-keeper would’ve liked you.”" },
      { role: "BOLD", label: "Climb to the lens in the wind and clear it by hand.", stats: { STR: 3 }, keeper: "“Careful — careful, damn it—” and then, when you don’t fall: “…Well done.”" },
      { role: "CHAOTIC", label: "Stay at their shoulder and just don’t leave.", stats: { CHR: 3 }, keeper: "They don’t say anything. But they don’t move away, either. The light holds." },
    ] },
  { phase: "AFTERMATH", dr: 0.44, title: "The Morning After",
    scene: "The storm wears itself out by dawn. The fog comes back gentle, almost apologetic. And there — a horn, faint, then closer: the supply boat, late and whole, the Pilot waving like nothing happened. The Keeper lets out a breath they’d held all night. The kettle goes back on.",
    choices: [
      { role: "CAUTIOUS", label: "Tend the small repairs from the night. Set it all right.", stats: { INT: 2, STR: 1 }, keeper: "“You’ll do. You’ll more than do.”" },
      { role: "BOLD", label: "Row out to meet the boat yourself.", stats: { STR: 2 }, keeper: "“Look at you. A week ago you asked gulls for directions.”" },
      { role: "CHAOTIC", label: "Turn the fifth bowl right-side up. Set the table for five.", stats: { CHR: 3 }, keeper: "The Keeper looks at the bowl a long moment. Then sits. “…Five, then.”" },
    ] },
  { phase: "RENEWAL", dr: 0.14, title: "Weeks On", final: true,
    scene: "The fog is thin again, the light easy in your hands now. You trim the wick without thinking; the log’s first line is yours. The Keeper watches you work from the doorway, and there’s something settled in them that wasn’t there the night you arrived. “You’ve got the light,” they say. “You don’t need me at your shoulder.” It isn’t a goodbye. It’s a door, left open.",
    choices: [
      { role: "CAUTIOUS", label: "Keep it exactly as you taught me.", stats: { INT: 2 }, keeper: "“That’s enough. That was always enough.”" },
      { role: "BOLD", label: "Make it mine. Add my own line to the log every night.", stats: { CHR: 2, STR: 1 }, keeper: "“…Now you sound like a keeper.”" },
      { role: "CHAOTIC", label: "Tell the Keeper the fifth place is theirs whenever they want it.", stats: { CHR: 3 }, keeper: "They don’t answer right away. Then: “I’ll hold you to that.” And they mean it." },
    ] },
];

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)";
const rcol = (r: string) => (r === "BOLD" ? "var(--spot-red)" : r === "CHAOTIC" ? "#8a5cc0" : forest);
const STATS: Stat[] = ["STR", "INT", "GLD", "CHR"];

export default function Lantern() {
  const [screen, setScreen] = useState<"origins" | "play" | "end">("origins");
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [day, setDay] = useState(0);
  const [stats, setStats] = useState<Record<Stat, number>>({ ...STATS0 });
  const [picked, setPicked] = useState<number | null>(null);

  const d = DAYS[day];
  const reset = () => { setScreen("origins"); setDay(0); setStats({ ...STATS0 }); setPicked(null); };
  const pick = (i: number) => { if (picked != null) return; const c = d.choices[i]; setStats((s) => { const n = { ...s }; for (const k in c.stats) n[k as Stat] += c.stats[k as Stat]!; return n; }); setPicked(i); };
  const next = () => { if (d.final) { setScreen("end"); return; } setDay((x) => x + 1); setPicked(null); };

  const Bars = () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {STATS.map((k) => (
        <div key={k} style={{ fontSize: 11 }}>
          <span style={{ fontFamily: "var(--theme-body)", fontWeight: 700, color: margin, letterSpacing: ".08em" }}>{k}</span>{" "}
          <b style={{ color: ink }}>{stats[k]}</b>
          <div style={{ width: 54, height: 5, background: "var(--ink-soft)", borderRadius: 3, marginTop: 1 }}><div style={{ width: `${Math.min(100, stats[k] * 5)}%`, height: 5, background: forest, borderRadius: 3 }} /></div>
        </div>
      ))}
    </div>
  );

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "26px 18px 80px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ fontSize: 23, margin: 0, color: ink }}>The Lantern</h1>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>PLAYABLE SLICE · PHASE B · NOT CANON</span>
      </div>
      <p style={{ color: soft, fontSize: 12.5, lineHeight: 1.55, margin: "5px 0 16px" }}>
        One fog-world story, 6 days across the arc. The <b>fog density is the arc</b> — it thickens to the storm and clears at renewal. Make the choice; watch the day turn.
      </p>

      {screen === "origins" && (
        <div>
          <pre style={{ fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "pre", fontSize: 14, color: ink, background: shade, border: `2px solid ${ink}`, padding: "12px", textAlign: "center", margin: "0 0 14px" }}>{fog(0.14)}</pre>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: forest, marginBottom: 8 }}>CONVERGENT ORIGINS — who meets you at the dock?</div>
          <p style={{ fontSize: 12, color: margin, fontStyle: "italic", margin: "0 0 12px" }}>(your first day differs; the paths converge after)</p>
          {ORIGINS.map((o) => (
            <button key={o.id} onClick={() => { setOrigin(o); setScreen("play"); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 13px", marginBottom: 8, cursor: "pointer", border: `1.5px solid var(--ink-soft)`, background: paper, borderRadius: 7 }}>
              <b style={{ color: ink, fontSize: 13.5 }}>{o.who}</b>
              <div style={{ fontSize: 12, color: soft, fontStyle: "italic", marginTop: 2 }}>{o.line}</div>
            </button>
          ))}
        </div>
      )}

      {screen === "play" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
            <div>
              <span style={{ fontFamily: "var(--theme-display)", fontSize: 17, color: ink }}>Day {day + 1} · {d.title}</span>
              <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: forest, border: `1px solid ${forest}`, borderRadius: 4, padding: "1px 6px", marginLeft: 8, verticalAlign: "middle" }}>{d.phase}</span>
            </div>
            <Bars />
          </div>
          <pre style={{ fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "pre", fontSize: 14, color: ink, background: shade, border: `2px solid ${ink}`, padding: "10px", textAlign: "center", margin: "0 0 12px", overflow: "hidden" }}>{fog(d.dr)}</pre>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: ink, margin: "0 0 14px" }}>{day === 0 ? d.scene.replace("{ORIGIN}", origin.line.charAt(0).toUpperCase() + origin.line.slice(1)) : d.scene}</p>

          {picked == null ? (
            <div>
              {d.choices.map((c, i) => (
                <button key={i} onClick={() => pick(i)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", marginBottom: 7, cursor: "pointer", border: `1.5px solid ${rcol(c.role)}`, background: paper, borderRadius: 7 }}>
                  <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: rcol(c.role) }}>{c.role}</span>
                  <div style={{ fontSize: 13, color: ink, marginTop: 1 }}>{c.label}</div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ border: `1.5px solid ${rcol(d.choices[picked].role)}`, background: shade, borderRadius: 7, padding: "11px 13px", marginBottom: 12 }}>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: ink, fontStyle: "italic" }}>{d.choices[picked].keeper}</div>
                <div style={{ fontSize: 11, color: forest, fontWeight: 700, marginTop: 7 }}>
                  {Object.entries(d.choices[picked].stats).map(([k, v]) => `+${v} ${k}`).join("  ·  ")}
                </div>
              </div>
              <button onClick={next} style={{ padding: "8px 18px", cursor: "pointer", border: `2px solid ${ink}`, background: paper, borderRadius: 7, fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 13, color: ink }}>
                {d.final ? "the watch is yours ▸" : "next day ▸"}
              </button>
            </div>
          )}
        </div>
      )}

      {screen === "end" && (
        <div>
          <pre style={{ fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "pre", fontSize: 14, color: ink, background: shade, border: `2px solid ${forest}`, padding: "12px", textAlign: "center", margin: "0 0 14px" }}>{fog(0.12)}</pre>
          <div style={{ fontFamily: "var(--theme-display)", fontSize: 19, color: forest, marginBottom: 8 }}>The light still holds.</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: ink, margin: "0 0 10px" }}>
            You kept the watch. The Keeper steps back — not gone, just no longer needed at your shoulder. The door stays open.
          </p>
          <div style={{ border: `1.5px dashed ${forest}`, background: paper, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", color: forest, marginBottom: 4 }}>▸ THE DESTINATION</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: soft, margin: 0 }}>The Keeper is <b>yours</b> now — the real game opens the chat here: a coach who remembers your whole watch, and talks to you like it. <i>(That chat is the product; these days were the note-factory that earned it.)</i></p>
          </div>
          <div style={{ marginBottom: 14 }}><Bars /></div>
          <button onClick={reset} style={{ padding: "8px 18px", cursor: "pointer", border: `2px solid ${ink}`, background: paper, borderRadius: 7, fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 13, color: ink }}>↺ a different watch (replay)</button>
          <p style={{ fontSize: 11.5, color: margin, fontStyle: "italic", marginTop: 10 }}>Replay picks a different origin (and, in the full game, a different surrounding-environment story — different cast, same world).</p>
        </div>
      )}
    </main>
  );
}
