// /minigames — the minigame-engine showcase + sandbox (sibling of /animations).
// The plan, made tangible: the framework, the 5-engine roster, the hosted battle.
// Spec: docs/design/minigame-engines.md (+ battle-minigame.md for the DUEL engine).
import Link from "next/link";

export const metadata = {
  title: "Minigames — My Life is an RPG",
  description: "The minigame engine framework: one engine, many scenarios. Duel, Scramble, Flow, Ensemble, Tend — each a real-life skill, each anti-dependency by design.",
};

type Engine = {
  key: string; name: string; reference: string; family: "CONTEST" | "LIVING"; status: "BUILT" | "PLANNED";
  loop: string; skill: string; skins: string; adapt: string; accent: string;
};

const ENGINES: Engine[] = [
  {
    key: "duel", name: "DUEL", reference: "Swords & Sandals", family: "CONTEST", status: "BUILT",
    loop: "Turn-based skill-shifted bout — POWER / STEADY / RISKY drain the obstacle's HP, composure is the clock, a final roll feeds the chaotic crit.",
    skill: "Facing a thing that might beat you — the fight, the freeze, the last set.",
    skins: "The Wingman (the bout · the standoff) · Elseworlds (the gauntlet) · The Bench (the match) · The Sect (the spar)",
    adapt: "Gets easier as your stat rises; a brave loss is growth, never docked; the coach stops staging it at graduation.",
    accent: "#b81f1c",
  },
  {
    key: "scramble", name: "SCRAMBLE", reference: "WarioWare", family: "CONTEST", status: "PLANNED",
    loop: "ONE quick input under a short clock — “get ready… NOW.” Light the wick before it dies; say the first word before the moment passes. 3–5 seconds.",
    skill: "STARTING — the anxiety/ADHD initiation problem. “Don't think, just DO it, fast” = act before you overthink. The skill the battle can't be.",
    skins: "The Night Market (open the shutter) · The Wingman (the opener before the freeze) · Life Ops (up before the snooze) · The Workshop · The Greenroom",
    adapt: "The clock loosens as you grow; the day the wick lights itself, the micro-game retires. A miss is secure (“you reached — try the next one”).",
    accent: "#c2691f",
  },
  {
    key: "flow", name: "FLOW", reference: "Rhythm Heaven", family: "CONTEST", status: "PLANNED",
    loop: "Hit on the beat — a short rhythm pattern where TIMING, not force, is the skill. Reuses the BPM scene-heartbeat as the beat you hit.",
    skill: "The PRACTICE / flow — the rep that stops being a fight and becomes a rhythm you sink into (the runner's flow, the rower's stroke).",
    skins: "Life Ops (Hana's drill) · The Last Ferry (the oar stroke) · The Long Hunt (rope-work) · The Bench · The Greenroom · The Backbone",
    adapt: "Graduation = the rhythm goes automatic; the metronome fades, you keep time without it. A missed beat is secure.",
    accent: "#a8841f",
  },
  {
    key: "ensemble", name: "ENSEMBLE", reference: "Tomodachi Life", family: "LIVING", status: "PLANNED",
    loop: "A witnessed surface where the cast INTERACT — banter, a cross-character note, a small event. You witness; you don't manage.",
    skill: "“The game remembers you AND they know each other” made visible — the note-factory living between characters.",
    skins: "Life Ops (the squad's cross-notes) · The Night Market (the row's banter) · The Long Hunt (the lodge) · The Table · The Hearth",
    adapt: "PUSH-NOT-PULL (Gemini fix): scenes are pushed at the moment you EARN them — a cutscene / a one-time letter — never a place to check (no Animal-Crossing FOMO). The world is whole without you.",
    accent: "#5a8a3a",
  },
  {
    key: "tend", name: "TEND", reference: "Tamagotchi, INVERTED", family: "LIVING", status: "PLANNED",
    loop: "You tend a real-life PRACTICE made visible (a fire to keep lit, a stall to open, a plant that roots) — it responds to care, but grows toward NOT needing you.",
    skill: "Grows-with-you itself, made visible: you watch the thing need you less. Self-sustaining is the win-state — the opposite of dying-from-neglect.",
    skins: "The cozy band — The Hearth (tend the fire) · The Night Market (the stall that learns to run) · The Wayhouse · The Far Shore · Life Ops (Mei's meal-prep)",
    adapt: "STASIS-ON-AWAY (Gemini fix, the #1 rule): state is 100% static during absence — no decay, no “saved for you” guilt. Leave a month, return to exactly what you left. It GRADUATES (the care surface retires); never a streak.",
    accent: "#2d6a4a",
  },
];

function Badge({ status }: { status: Engine["status"] }) {
  const built = status === "BUILT";
  return (
    <span style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", padding: "2px 9px", border: `1.5px solid ${built ? "var(--forest)" : "var(--margin-ink)"}`, color: built ? "var(--forest)" : "var(--margin-ink)", whiteSpace: "nowrap" }}>
      {built ? "▶ BUILT" : "◷ PLANNED"}
    </span>
  );
}

// A tiny static HP-bar sketch so the DUEL card shows the battle shape inline.
function BattleSketch() {
  return (
    <div style={{ border: "2px solid var(--ink)", background: "var(--paper)", padding: "10px 12px", margin: "10px 0 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "var(--ink-soft)", marginBottom: 5 }}>
        <span>REPS · HP 6</span><span>A PUSHUP</span>
      </div>
      <div style={{ height: 12, border: "1.5px solid var(--ink)", background: "var(--paper-shade)", marginBottom: 9 }}>
        <div style={{ width: "62%", height: "100%", background: "var(--spot-red)" }} />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["DIG IN", "PACE IT", "MAX-OUT \u{1F3B2}"].map((m) => (
          <span key={m} style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, border: "1.5px solid var(--ink)", padding: "3px 10px", color: "var(--ink)" }}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export default function MinigamesPage() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 80px" }}>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".3em", color: "var(--spot-red)" }}>MINIGAME ENGINES</div>
      <h1 style={{ fontFamily: "var(--theme-display)", fontSize: 32, lineHeight: 1.05, margin: "4px 0 10px" }}>One engine, many scenarios.</h1>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 8px", maxWidth: 680 }}>
        A small framework of reusable minigame engines, each parameterized to fit many campaign
        beats. Every engine embodies a real-life <b>skill</b> the others can&apos;t — and every one is
        <b> anti-dependency by design</b>: it gets easier as you grow, then graduates. Plan:{" "}
        <code style={{ fontSize: 12.5 }}>docs/design/minigame-engines.md</code> (Gemini-vetted).
      </p>
      <p style={{ fontSize: 12.5, color: "var(--margin-ink)", fontStyle: "italic", margin: "0 0 8px", maxWidth: 680 }}>
        Two families: <b>CONTEST</b> engines resolve a chaotic gamble (chaotic-pick only, opt-in by
        construction); <b>LIVING</b> engines reflect your growth (witness · care) under an even
        stricter no-obligation-to-return bar — because the life-sim / care shape is the
        engagement-max category&apos;s signature loop, and our moat&apos;s named villain.
      </p>
      <p style={{ fontSize: 12.5, color: "var(--margin-ink)", margin: "0 0 26px" }}>
        <Link href="/animations" style={{ color: "var(--forest)" }}>▸ the live battle clip lives on /animations</Link>
        <span style={{ margin: "0 8px" }}>·</span>
        <Link href="/" style={{ color: "var(--forest)" }}>← home</Link>
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {ENGINES.map((e) => (
          <div key={e.key} style={{ border: "2px solid var(--ink)", background: "var(--paper-shade)", padding: "14px 16px 16px", borderLeft: `6px solid ${e.accent}` }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <span style={{ fontFamily: "var(--theme-display)", fontSize: 23, color: "var(--ink)" }}>{e.name}</span>
                <span style={{ fontFamily: "var(--theme-body)", fontSize: 12, color: "var(--ink-soft)", marginLeft: 10 }}>after {e.reference}</span>
              </div>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".12em", color: e.family === "CONTEST" ? "var(--spot-red)" : "var(--forest)" }}>{e.family}</span>
                <Badge status={e.status} />
              </span>
            </div>

            {e.key === "duel" && <BattleSketch />}

            <Field label="THE LOOP" value={e.loop} />
            <Field label="THE SKILL IT EMBODIES" value={e.skill} />
            <Field label="SKINS ONTO" value={e.skins} />
            <Field label="ANTI-DEPENDENCY" value={e.adapt} accent />
          </div>
        ))}
      </div>

      <div style={{ border: "1px dashed var(--ink-soft)", background: "var(--paper)", padding: "14px 16px", marginTop: 22 }}>
        <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: "var(--spot-red)", marginBottom: 8 }}>THE HARD FLOORS — every engine passes ALL</div>
        {[
          "Skill / timing / care — never gambling (no bet-and-RNG, no jackpot, no second currency, no real money).",
          "Resolves or reflects an authored beat — never a free-standing “play for rewards” loop.",
          "No obligation to return — no daily, no streak, no decay-as-guilt; STASIS-ON-AWAY + PUSH-NOT-PULL codified.",
          "It graduates — gets easier, then retires/inverts at the top. Still firing at Unspoken = the coach failed to become un-needed.",
          "Length scales with stakes · theme-gated · game-shaped · secure failure · cozy floor · reduced-motion.",
        ].map((f, i) => (
          <p key={i} style={{ fontSize: 13, lineHeight: 1.55, margin: "0 0 5px", color: "var(--ink)", paddingLeft: 16, textIndent: -11 }}>
            <span style={{ color: "var(--forest)", fontWeight: 700 }}>✓ </span>{f}
          </p>
        ))}
      </div>
    </main>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".14em", color: accent ? "var(--spot-red)" : "var(--margin-ink)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}
