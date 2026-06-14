"use client";

// THE LANTERN — a PLAYABLE slice that obeys §8.15 (THE SETTING IS NOT AN ARC).
// The setting is PERSISTENT (chosen once, held every day); the arc is the KEEPER, not the sky.
// v4 — the scrub is the COZY LEVEL (the story tone), shown as the spectrum BELOW. The ASCII
// weather above is a SYMBOLIC visual that tracks the cozy level BY DEFAULT (heavier weather ~
// harder story — easy to read), but can be DECOUPLED for creative liberty: "deeply cozy + a
// gale" = Snug Against the Gale; "a harder grace + still fog" = The Long Silence. Weather-
// intensity ≠ coziness; the authored TITLE per combination is the honest glance.

import { useState } from "react";

// ── the surrounding weather (PERSISTENT — a symbolic visual, never animated over days) ──
const COLS = 34, ROWS = 8, RAMP = [" ", "·", "░", "▒", "▓", "█"];
function noise(x: number, y: number, s: number) { let h = (x * 73856093) ^ (y * 19349663) ^ (s * 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h = h ^ (h >>> 16); return ((h >>> 0) % 1000) / 1000; }
const LIGHT = ["   .", "  /^\\", "  |=|", "  |=|", " _|_|_"];
function sky(dr: number, seed = 7): string {
  const g: string[][] = [];
  for (let y = 0; y < ROWS; y++) { const r: string[] = []; for (let x = 0; x < COLS; x++) { const t = dr * 1.6 - noise(x, y, seed); r.push(t > 0 ? RAMP[Math.max(1, Math.min(5, 1 + Math.floor(t * 5)))] : " "); } g.push(r); }
  LIGHT.forEach((line, j) => { const yy = 2 + j; for (let i = 0; i < line.length; i++) { const xx = 13 + i; if (yy < ROWS && line[i] !== " ") g[yy][xx] = line[i]; } });
  return g.map((r) => r.join("")).join("\n");
}

// ── the two axes ────────────────────────────────────────────────────────────────────────
// COZY TONE (the SCRUBBED axis — the story; index 0 = deepest warmth … 4 = a harder grace)
const TONES = ["deeply cozy", "cozy", "warm", "bittersweet", "a harder grace"];
const ACCENTS = ["#b8862e", "#7d8a6a", "#5f8a86", "#5a7a9a", "#7a5a8a"]; // warm amber → cool violet (tracks the TONE, not the sky)
const PALETTES = ["amber & lamp-gold", "warm sage", "soft green-grey", "slate & cool lamp", "storm-grey & one flame"];
// WEATHER (the symbolic visual; default-coupled to tone, decoupleable)
const WEATHERS = ["still fog", "drifting fog", "steady rain", "gale", "wild storm"];
const DRS = [0.12, 0.32, 0.52, 0.74, 0.92];
const MOTIFS = ["the unbroken quiet", "things half-seen, a gull’s call", "rain on the glass, the kept kettle", "the warm room, the wild dark outside", "the one flame against the dark"];
// authored TITLE per [tone][weather] — the diagonal is the default; the corners are the proof
// The TWO-PART TITLE ladder (§8.16, cozy-titles.md) — one per cozy tier, fleet-AUDITIONED
// (tools/title-test/run4.mjs). A fixed warm-anchor SETTING line (reasserts "still holds" as it
// darkens = the floor-clip) + a varying STORY line. Replaces the old single-line grid (whose
// "What the Fog Keeps" / "The Long Silence" the audience fleet flagged as ruleset violations).
const LADDER = [
  { setting: "The light holds.",       story: "Tending it, slow and quiet." },          // deeply cozy — 5.0/5.0
  { setting: "The light holds.",       story: "Minding the lamp till light." },          // cozy — 3.8/4.5
  { setting: "The light holds.",       story: "A still night, the watch easy." },        // warm — 3.8/4.5
  { setting: "The light still holds.", story: "Holding steady till light." },            // bittersweet
  { setting: "The light still holds.", story: "Reading the water, steady and hushed." }, // a harder grace — held, floor-clipped
];
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const toneIdx = (cozy: number) => clamp(Math.floor((100 - cozy) / 20.001), 0, 4); // cozy 100 → 0 (deeply cozy)

type Stat = "STR" | "INT" | "GLD" | "CHR";
type Choice = { role: "CAUTIOUS" | "BOLD" | "CHAOTIC"; label: string; stats: Partial<Record<Stat, number>>; keeper: string };
type Day = { phase: string; title: string; scene: string; choices: Choice[]; final?: boolean };
type Chosen = { setting: string; story: string; weather: string; dr: number; accent: string };

const STATS0: Record<Stat, number> = { STR: 8, INT: 8, GLD: 5, CHR: 8 };

// {C} = the persistent weather (bare noun) — prose always writes "the {C}", so it stays grammatical
const DAYS: Day[] = [
  { phase: "COZY", title: "The Arrival",
    scene: "You step onto the pier into the {C} — the weather you chose to keep the light in, and it won’t let up the whole season. That’s the point of it. The lighthouse stands over you, grey-white, repainted a dozen times the same colour. A figure waits with a lantern: the Keeper. “Tide’s turning,” they say — not quite a smile. “So’s the gangway.” They show you the light: the lens, the wick, the log.",
    choices: [
      { role: "CAUTIOUS", label: "Watch first. Learn the rhythm before I touch anything.", stats: { INT: 2 }, keeper: "“Good. The light’s been here longer than either of us. No rush.”" },
      { role: "BOLD", label: "Show me the lens. I’ll take the first watch tonight.", stats: { STR: 2 }, keeper: "“Eager.” A pause. “Mind the third stair — it’s loose.”" },
      { role: "CHAOTIC", label: "Ask whether the gulls ever get used to the weather.", stats: { CHR: 2 }, keeper: "The Keeper huffs a laugh. “They complain about it daily. Good company, though.”" },
    ] },
  { phase: "COZY", title: "The Rhythm",
    scene: "The {C} hasn’t changed — it isn’t supposed to. The kettle’s on against it, the room warm. The little table is laid for four, and a fifth place at the end, its bowl turned down. The Keeper shows you the trim of the wick, the weight of the log’s first line: ‘Stood the watch. Logged at full weight, as is only proper.’",
    choices: [
      { role: "CAUTIOUS", label: "Keep the log exactly as shown.", stats: { INT: 2 }, keeper: "“The log doesn’t need flourishes. Just the truth, kept.”" },
      { role: "BOLD", label: "Add a line of my own — what the watch felt like.", stats: { CHR: 1, STR: 1 }, keeper: "A long look. “…The keeper before me did that too.”" },
      { role: "CHAOTIC", label: "Set a place at the fifth bowl. Just in case.", stats: { CHR: 2 }, keeper: "The Keeper goes very still. Then, quiet: “…Leave it. But thank you.”" },
    ] },
  { phase: "HEIGHTENED", title: "The Boat is Late",
    scene: "The supply boat should have come at noon. It hasn’t. The Keeper checks the horn, checks the glass, checks the empty water, and doesn’t say what they’re thinking. Their hand rests a moment on the fifth chair. The weather is the same as it ever was — the {C}, steady. The worry isn’t.",
    choices: [
      { role: "CAUTIOUS", label: "Keep the light steady and even. Let it do its work.", stats: { INT: 2 }, keeper: "“That’s the job. The light doesn’t panic. Neither do we.”" },
      { role: "BOLD", label: "Ring the foghorn long, past the schedule. Reach for them.", stats: { STR: 2 }, keeper: "“…Aye. A little longer. Can’t hurt.” Their voice catches, just slightly." },
      { role: "CHAOTIC", label: "Tell the Keeper a bad joke to break the quiet.", stats: { CHR: 2 }, keeper: "It’s a terrible joke. The Keeper laughs anyway, like they needed to." },
    ] },
  { phase: "INTENSE", title: "What the Light Couldn’t Bring Back",
    scene: "It comes out late, the way these things do — not because of any change in the sky (it’s the {C}, unchanged since you arrived), but because the night is long and you’re both still awake with it. The Keeper says it to the glass, not to you: “There was one the light didn’t bring back. A long time ago.” A breath. “But the light still holds. So do we.” The room doesn’t get darker. They just let you see them.",
    choices: [
      { role: "CAUTIOUS", label: "Keep the watch beside them. Don’t fill the silence.", stats: { INT: 2 }, keeper: "“…Good hands. The before-keeper would’ve liked you.”" },
      { role: "BOLD", label: "Ask them — gently — about the one who didn’t come back.", stats: { STR: 2, CHR: 1 }, keeper: "They tell you. All of it. By the end the telling has stopped weighing quite so much." },
      { role: "CHAOTIC", label: "Set the fifth place at the table. Now. Tonight.", stats: { CHR: 3 }, keeper: "The Keeper looks at the bowl a long moment. Then sits. “…Five, then.”" },
    ] },
  { phase: "AFTERMATH", title: "The Morning After",
    scene: "A horn, faint, then closer: the supply boat, late and whole, the Pilot waving like nothing happened. The Keeper lets out a breath they’d held all night. The kettle goes back on. The {C} hasn’t lifted — it won’t — but something between the two of you has.",
    choices: [
      { role: "CAUTIOUS", label: "Tend the small repairs from the long night. Set it all right.", stats: { INT: 2, STR: 1 }, keeper: "“You’ll do. You’ll more than do.”" },
      { role: "BOLD", label: "Row out to meet the boat yourself.", stats: { STR: 2 }, keeper: "“Look at you. A week ago you were asking gulls about the weather.”" },
      { role: "CHAOTIC", label: "Leave the fifth bowl right-side up. Set the table for five, every day now.", stats: { CHR: 3 }, keeper: "“…Five, then,” the Keeper says again. And this time it sounds like a habit, not a wound." },
    ] },
  { phase: "RENEWAL", title: "Weeks On", final: true,
    scene: "Weeks on. The {C} you chose, unchanged, still keeping you company; the light easy in your hands now. You trim the wick without thinking; the log’s first line is yours. The Keeper watches you work from the doorway, settled in a way they weren’t the day you came. “You’ve got the light,” they say. “You don’t need me at your shoulder.” It isn’t a goodbye. It’s a door, left open.",
    choices: [
      { role: "CAUTIOUS", label: "Keep it exactly as you taught me.", stats: { INT: 2 }, keeper: "“That’s enough. That was always enough.”" },
      { role: "BOLD", label: "Make it mine. Add my own line to the log every night.", stats: { CHR: 2, STR: 1 }, keeper: "“…Now you sound like a keeper.”" },
      { role: "CHAOTIC", label: "Tell the Keeper the fifth place is theirs whenever they want it.", stats: { CHR: 3 }, keeper: "They don’t answer right away. Then: “I’ll hold you to that.” And they mean it." },
    ] },
];

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)";
const rcol = (r: string) => (r === "BOLD" ? "var(--spot-red)" : r === "CHAOTIC" ? "#8a5cc0" : forest);
const STATS: Stat[] = ["STR", "INT", "GLD", "CHR"];
const weave = (s: string, c: string) => s.replace(/\{C\}/g, c);

export default function Lantern() {
  const [screen, setScreen] = useState<"scrub" | "play" | "end">("scrub");
  const [cozy, setCozy] = useState(86);              // the SCRUBBED axis (0..100, right = deeply cozy)
  const [weatherRaw, setWeatherRaw] = useState<number | null>(null); // null = matched to tone (default); else decoupled
  const [chosen, setChosen] = useState<Chosen>({ setting: LADDER[0].setting, story: LADDER[0].story, weather: WEATHERS[0], dr: DRS[0], accent: ACCENTS[0] });
  const [day, setDay] = useState(0);
  const [stats, setStats] = useState<Record<Stat, number>>({ ...STATS0 });
  const [picked, setPicked] = useState<number | null>(null);

  const tone = toneIdx(cozy);
  const weather01 = weatherRaw !== null ? weatherRaw / 100 : (1 - cozy / 100); // matched: cozier ⇒ calmer
  const wIdx = clamp(Math.round(weather01 * 4), 0, 4);
  const decoupled = weatherRaw !== null && wIdx !== tone;
  const accent = ACCENTS[tone];
  const lad = LADDER[tone];
  const warmth = 5 - tone;

  const d = DAYS[day];
  const reset = () => { setScreen("scrub"); setDay(0); setStats({ ...STATS0 }); setPicked(null); };
  const begin = () => { setChosen({ setting: lad.setting, story: lad.story, weather: WEATHERS[wIdx], dr: DRS[wIdx], accent }); setScreen("play"); };
  const pick = (i: number) => { if (picked != null) return; const c = d.choices[i]; setStats((st) => { const n = { ...st }; for (const k in c.stats) n[k as Stat] += c.stats[k as Stat]!; return n; }); setPicked(i); };
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
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>PLAYABLE SLICE · §8.15 · NOT CANON</span>
      </div>
      <p style={{ color: soft, fontSize: 12.5, lineHeight: 1.55, margin: "5px 0 16px" }}>
        You scrub the <b>cozy level</b> — the kind of story. The weather above is a <b>symbolic visual</b> that follows it by default, but you can <b>decouple</b> it: <b>a storm can be the coziest story.</b> Whatever you pick <b>holds all the way through</b>; the arc is the <b>Keeper</b>.
      </p>

      {screen === "scrub" && (
        <div>
          {/* the SETTING shown visually (above) */}
          <pre style={{ fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "pre", fontSize: 14, color: ink, background: shade, border: `2px solid ${accent}`, padding: "12px", textAlign: "center", margin: "0 0 6px", transition: "border-color .2s" }}>{sky(DRS[wIdx])}</pre>
          <div style={{ textAlign: "center", marginBottom: 2 }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".09em", color: soft }}>{lad.setting}</div>
            <div style={{ fontFamily: "var(--theme-display)", fontSize: 21, color: accent }}>{lad.story}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: margin, marginBottom: 14, fontStyle: "italic" }}>{TONES[tone]} · the {WEATHERS[wIdx]}{decoupled && <span style={{ color: accent }}> · weather decoupled — a {TONES[tone]} storm? your call</span>}</div>

          {/* the COZY LEVEL spectrum — the axis ACTUALLY being scrubbed */}
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: forest, marginBottom: 4 }}>① THE COZY LEVEL — the kind of story you want</div>
          <input type="range" min={0} max={100} value={cozy} onChange={(e) => setCozy(Number(e.target.value))} style={{ width: "100%", accentColor: accent }} aria-label="cozy level" />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: margin, marginBottom: 14, fontFamily: "var(--theme-body)", letterSpacing: ".04em" }}>
            <span>a harder grace</span><span style={{ color: accent, fontWeight: 700 }}>{TONES[tone]}</span><span>deeply cozy</span>
          </div>

          {/* the WEATHER — symbolic, matched by default, decoupleable for creative liberty */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: soft }}>② THE WEATHER — symbolic <span style={{ fontWeight: 400, fontStyle: "italic", color: margin }}>{decoupled ? "(decoupled)" : "(matched to cozy — the default)"}</span></span>
            {decoupled && <button onClick={() => setWeatherRaw(null)} style={{ fontSize: 10, color: forest, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>↺ re-match</button>}
          </div>
          <input type="range" min={0} max={100} value={Math.round(weather01 * 100)} onChange={(e) => setWeatherRaw(Number(e.target.value))} style={{ width: "100%", accentColor: soft }} aria-label="weather (symbolic)" />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: margin, marginBottom: 14, fontFamily: "var(--theme-body)" }}>
            <span>░ calm</span><span>heavy █</span>
          </div>

          {/* what this setting SETS — the presets the scrub is changing */}
          <div style={{ border: `1px solid ${accent}`, background: paper, borderRadius: 7, padding: "9px 12px", fontSize: 12, lineHeight: 1.7, marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".12em", color: margin, marginBottom: 3 }}>THIS SETTING SETS</div>
            <div><span style={{ color: margin, display: "inline-block", width: 64 }}>warmth</span><span style={{ color: accent, letterSpacing: 1.5 }}>{"●".repeat(warmth)}<span style={{ color: "var(--ink-soft)" }}>{"○".repeat(5 - warmth)}</span></span>{warmth === 5 && wIdx >= 3 && <span style={{ color: accent, fontStyle: "italic", marginLeft: 8 }}>— yes, a storm, and the coziest of all</span>}{warmth === 1 && wIdx <= 1 && <span style={{ color: accent, fontStyle: "italic", marginLeft: 8 }}>— calm sky, hardest story</span>}</div>
            <div><span style={{ color: margin, display: "inline-block", width: 64 }}>palette</span><span style={{ display: "inline-block", width: 10, height: 10, background: accent, borderRadius: 2, marginRight: 6, verticalAlign: "middle" }} /><span style={{ color: ink }}>{PALETTES[tone]}</span></div>
            <div><span style={{ color: margin, display: "inline-block", width: 64 }}>motif</span><span style={{ color: ink, fontStyle: "italic" }}>{MOTIFS[wIdx]}</span></div>
          </div>
          <button onClick={begin} style={{ padding: "9px 20px", cursor: "pointer", border: `2px solid ${ink}`, background: paper, borderRadius: 7, fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 13.5, color: ink }}>begin — {lad.story} ▸</button>
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
          <pre style={{ fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "pre", fontSize: 14, color: ink, background: shade, border: `2px solid ${chosen.accent}`, padding: "10px", textAlign: "center", margin: "0 0 3px", overflow: "hidden" }}>{sky(chosen.dr)}</pre>
          <div style={{ fontSize: 10, color: margin, fontStyle: "italic", textAlign: "right", margin: "0 0 12px" }}><b style={{ color: chosen.accent }}>{chosen.setting}</b> {chosen.story} · the {chosen.weather} holds — unchanged since day 1</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: ink, margin: "0 0 14px" }}>{weave(d.scene, chosen.weather)}</p>

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
          <pre style={{ fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "pre", fontSize: 14, color: ink, background: shade, border: `2px solid ${chosen.accent}`, padding: "12px", textAlign: "center", margin: "0 0 6px" }}>{sky(chosen.dr)}</pre>
          <div style={{ fontSize: 10, color: margin, fontStyle: "italic", textAlign: "right", margin: "0 0 14px" }}>same <b style={{ color: chosen.accent }}>{chosen.story}</b> as day 1 — the sky never moved. The Keeper did.</div>
          <div style={{ fontFamily: "var(--theme-display)", fontSize: 19, color: forest, marginBottom: 8 }}>The light still holds.</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: ink, margin: "0 0 10px" }}>
            You kept the watch — in the weather you chose, the whole way through. The Keeper steps back, not gone, just no longer needed at your shoulder. The door stays open.
          </p>
          <div style={{ border: `1.5px dashed ${forest}`, background: paper, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", color: forest, marginBottom: 4 }}>▸ THE DESTINATION</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: soft, margin: 0 }}>The Keeper is <b>yours</b> now — the real game opens the chat here: a coach who remembers your whole watch, and talks to you like it. <i>(That chat is the product; these days were the note-factory that earned it.)</i></p>
          </div>
          <div style={{ marginBottom: 14 }}><Bars /></div>
          <button onClick={reset} style={{ padding: "8px 18px", cursor: "pointer", border: `2px solid ${ink}`, background: paper, borderRadius: 7, fontFamily: "var(--theme-body)", fontWeight: 700, fontSize: 13, color: ink }}>↺ a different watch (replay)</button>
          <p style={{ fontSize: 11.5, color: margin, fontStyle: "italic", marginTop: 10 }}>Replay = a different setting (and, in the full game, a different story in the same world — different cast, same coach-at-Unspoken promise).</p>
        </div>
      )}
    </main>
  );
}
