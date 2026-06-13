"use client";

// VOICE-MOTION — the shared per-character dialogue animation engine
// (docs/design/voice-motion.md). Used by /animations (the prototype gallery)
// and /auditions (the character audits render their voice lines LIVE).
// Styles: the vm-* classes in globals.css.
import React, { useState } from "react";

export type VMSpec = {
  unit: "word" | "pair" | "phrase" | "sentence";
  pace: number;          // ms between units
  entry: string;         // arrival class (vm-pop / vm-drift / vm-ignite / …)
  holds?: number;        // punctuation-hold multiplier (the pen-lift beats)
  burst?: number;        // front-burst: first N units at 1/3 pace (COUNT-IN)
  paired?: boolean;      // units arrive in twos (TWO CUPS)
  caps?: boolean;        // ALL-CAPS words get the caps-snap emphasis
  weights?: boolean;     // numbers land with a weight-settle (LEDGER family)
};

export function vmUnits(text: string, unit: VMSpec["unit"]): string[] {
  if (unit === "sentence") return text.split(/(?<=[.!?])\s+/);
  if (unit === "phrase") return text.split(/(?<=[,.;!?—])\s+/);
  const w = text.split(" ");
  if (unit === "word") return w;
  const out: string[] = [];
  for (let i = 0; i < w.length; i += 2) out.push(w.slice(i, i + 2).join(" "));
  return out;
}

export function VMLine({ text, spec }: { text: string; spec: VMSpec }) {
  const units = vmUnits(text, spec.unit);
  let t = 120;
  return (
    <span className="vm-stage">
      {units.map((u, i) => {
        const d = t;
        let step = spec.pace;
        if (spec.burst && i < spec.burst) step = spec.pace / 3;
        if (spec.paired) step = i % 2 === 0 ? 70 : spec.pace;
        t += step;
        if (spec.holds && /[.!?—]$/.test(u)) t += spec.pace * spec.holds;
        const cls =
          "vm-unit " + spec.entry +
          (spec.caps && /\b[A-Z]{2,}\b/.test(u) ? " vm-snap" : "") +
          (spec.weights && /\d|\b(one|two|three|five|ten|eleven)\b/i.test(u) ? " vm-weight" : "");
        return (
          <span key={i} className={cls} style={{ animationDelay: `${d}ms` }}>
            {u}{" "}
          </span>
        );
      })}
    </span>
  );
}

// RED PEN (Wes) — one word mid-line struck and replaced: the draft, visible in the voice.
export function RedPenLine({ before, from, to, after }: { before: string; from: string; to: string; after: string }) {
  const b = before.split(" "), a = after.split(" ");
  const pace = 110, start = 120;
  const fromD = start + b.length * pace;
  const toD = fromD + 1050;
  const afterD = toD + 380;
  return (
    <span className="vm-stage">
      {b.map((w, i) => <span key={"b" + i} className="vm-unit vm-pop" style={{ animationDelay: `${start + i * pace}ms` }}>{w} </span>)}
      <span className="vm-unit vm-strike" style={{ animationDelay: `${fromD}ms` }}>{from} </span>
      <span className="vm-unit vm-pop vm-fix" style={{ animationDelay: `${toD}ms` }}>{to} </span>
      {a.map((w, i) => <span key={"a" + i} className="vm-unit vm-pop" style={{ animationDelay: `${afterD + i * pace}ms` }}>{w} </span>)}
    </span>
  );
}

// STRAIGHT READ (Sloane) — flat even delivery, then the verdict lands whole.
export function StraightRead({ read, verdict }: { read: string; verdict: string }) {
  const words = read.split(" ");
  const pace = 105, start = 120;
  const vD = start + words.length * pace + 700;
  return (
    <span className="vm-stage">
      {words.map((w, i) => <span key={i} className="vm-unit vm-flat" style={{ animationDelay: `${start + i * pace}ms` }}>{w} </span>)}
      <span className="vm-unit vm-verdict" style={{ animationDelay: `${vD}ms` }}>{verdict}</span>
    </span>
  );
}

export const VM: Record<string, VMSpec> = {
  "DRILL":      { unit: "word", pace: 70, entry: "vm-pop", caps: true },
  "LEDGER":     { unit: "word", pace: 125, entry: "vm-pop", holds: 2.4, weights: true },
  "SERVICE":    { unit: "phrase", pace: 260, entry: "vm-drift" },
  "NARRATOR":   { unit: "sentence", pace: 620, entry: "vm-drift" },
  "COUNT-IN":   { unit: "word", pace: 150, entry: "vm-pop", burst: 4, caps: true },
  "ANCHOR":     { unit: "phrase", pace: 430, entry: "vm-drift" },
  "ROPE":       { unit: "pair", pace: 95, entry: "vm-pop", holds: 3.2 },
  "KINDLE":     { unit: "word", pace: 230, entry: "vm-ignite" },
  "CHALK":      { unit: "word", pace: 150, entry: "vm-stamp" },
  "TWO CUPS":   { unit: "phrase", pace: 520, entry: "vm-drift", paired: true },
  "FULL PRICE": { unit: "phrase", pace: 430, entry: "vm-flatline" },
  "COIL":       { unit: "pair", pace: 165, entry: "vm-pop" },
  "SURFACE":    { unit: "sentence", pace: 950, entry: "vm-surface" },
  "LADLE":      { unit: "phrase", pace: 210, entry: "vm-tick" },
  "RULED INK":  { unit: "word", pace: 130, entry: "vm-pop", holds: 2.6, weights: true },
};

export function VoiceRow({ who, preset, text }: { who: string; preset: string; text: string }) {
  return (
    <div className="vm-row">
      <span className="vm-who">{who} · {preset}</span>
      <span className="vm-text"><VMLine text={text} spec={VM[preset]} /></span>
    </div>
  );
}

// ── EMOTION layer (voice-motion.md §emotion) — the MOOD of a line, overlaid on
// the character's baseline. The per-character preset is HOW they habitually move;
// the emotion is how they FEEL saying THIS line. Emotion drives the visible motion;
// the preset still sets the unit/pace (its rhythm). A line carries an emotion tag
// (`[shout]`, `[laugh]`, …); untagged = "say", which keeps the preset's own entry. ──
export type Emotion =
  | "say" | "shout" | "laugh" | "smile" | "whisper" | "excited"
  | "nervous" | "sad" | "angry" | "sigh" | "wry" | "deadpan";

export const EMO: Record<Emotion, { label: string; glyph: string; entry: string; paceMul: number; bold?: boolean; accent?: boolean; note: string }> = {
  say:     { label: "Say",     glyph: "•",  entry: "em-say",     paceMul: 1,    note: "neutral — an even pop, no flourish" },
  shout:   { label: "Shout",   glyph: "❗", entry: "em-shout",   paceMul: 0.6,  bold: true, accent: true, note: "words burst in big and snap down — loud, fast, red" },
  laugh:   { label: "Laugh",   glyph: "↑↓", entry: "em-laugh",   paceMul: 0.8,  note: "each word bobs + wobbles — the line ripples like a chuckle" },
  smile:   { label: "Smile",   glyph: "◡",  entry: "em-smile",   paceMul: 1.1,  note: "a gentle warm rise — soft, unhurried, fond" },
  whisper: { label: "Whisper", glyph: "…",  entry: "em-whisper", paceMul: 1.4,  note: "slow, faded, italic — said under the breath" },
  excited: { label: "Excited", glyph: "✦",  entry: "em-excited", paceMul: 0.7,  note: "springy overshoot — can barely hold it in" },
  nervous: { label: "Nervous", glyph: "≈",  entry: "em-nervous", paceMul: 1.15, note: "a small tremble that steadies — hesitant" },
  sad:     { label: "Sad",     glyph: "↓",  entry: "em-sad",     paceMul: 1.5,  note: "words sink and fade — heavy, low" },
  angry:   { label: "Angry",   glyph: "✖",  entry: "em-angry",   paceMul: 0.55, bold: true, accent: true, note: "hard sharp shake — clipped, bold, red" },
  sigh:    { label: "Sigh",    glyph: "~",  entry: "em-sigh",     paceMul: 1.5,  note: "a long exhale — rises then settles, trailing" },
  wry:     { label: "Wry",     glyph: "◞",  entry: "em-wry",      paceMul: 1.05, note: "a tilt-and-right — the smirk in the voice" },
  deadpan: { label: "Deadpan", glyph: "—",  entry: "em-deadpan",  paceMul: 0.9,  note: "instant, flat, zero motion — the comedic null" },
};

const EMO_KEYS = Object.keys(EMO) as Emotion[];

/** Strip a leading `[emotion]` tag from a line → { emotion, text }. */
export function parseEmotion(line: string): { emotion: Emotion; text: string } {
  const m = line.match(/^\s*\[([a-z]+)\]\s*([\s\S]*)$/i);
  if (m && (EMO_KEYS as string[]).includes(m[1].toLowerCase())) {
    return { emotion: m[1].toLowerCase() as Emotion, text: m[2] };
  }
  return { emotion: "say", text: line };
}

/** A line rendered in an EMOTION, on a base rhythm (unit + pace from the character
 *  preset, or the defaults). Emotion is the visible motion; the rhythm is the beat. */
export function EmoLine({ text, emotion, unit = "word", basePace = 120 }: {
  text: string; emotion: Emotion; unit?: VMSpec["unit"]; basePace?: number;
}) {
  const e = EMO[emotion] ?? EMO.say;
  const units = vmUnits(text, unit);
  let t = 100;
  return (
    <span className="vm-stage">
      {units.map((u, i) => {
        const d = t;
        t += basePace * e.paceMul;
        const cls = `vm-unit ${e.entry}${e.bold ? " vm-emo-bold" : ""}${e.accent ? " vm-emo-accent" : ""}`;
        return <span key={i} className={cls} style={{ animationDelay: `${d}ms` }}>{u} </span>;
      })}
    </span>
  );
}

/** The EMOTION RANGE gallery — one sample line played in every emotion, side by
 *  side, with a replay-all. Directly answers "show the emotional range." */
export function EmotionGallery({ sample = "I told you it would work.", preset }: { sample?: string; preset?: string }) {
  const [k, setK] = useState(0);
  const base = (preset && VM[preset]) || undefined;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button onClick={() => setK((x) => x + 1)} style={{ fontSize: 11, cursor: "pointer", border: "1px solid var(--ink-soft)", background: "var(--paper)", padding: "3px 10px", color: "var(--ink)" }}>▶ replay all</button>
      </div>
      <div key={k} style={{ display: "grid", gap: 8 }}>
        {EMO_KEYS.map((em) => (
          <div key={em} style={{ display: "grid", gridTemplateColumns: "92px 1fr", alignItems: "baseline", gap: 10, borderBottom: "1px solid var(--ink-soft)", paddingBottom: 6 }}>
            <span style={{ fontFamily: "var(--theme-display)", fontSize: 11, letterSpacing: ".1em", color: "var(--spot-red)" }}>
              {EMO[em].glyph} {EMO[em].label.toUpperCase()}
            </span>
            <span style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--ink)" }}>
              <EmoLine text={sample} emotion={em} unit={base?.unit ?? "word"} basePace={base?.pace ?? 120} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── the auditions surface: a VOICE block rendered LIVE — each line in its tagged
// EMOTION over the character's preset rhythm. Untagged lines keep the preset's
// own signature entry (so the character's habitual motion still reads). ──────────
export function AuditionVoice({ lines, preset }: { lines: string[]; preset: string }) {
  const [k, setK] = useState(0);
  const spec = VM[preset] ?? VM["COIL"] ?? { unit: "word" as const, pace: 110, entry: "vm-pop" };
  return (
    <div style={{ border: "1px solid var(--ink-soft)", background: "var(--paper-shade)", padding: "10px 12px", margin: "6px 0 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: "var(--theme-body)", fontSize: 10, letterSpacing: ".16em", color: "var(--spot-red)" }}>
          VOICE · {VM[preset] ? preset : `${preset} (preview in COIL)`}
        </span>
        <button onClick={() => setK((x) => x + 1)} style={{ fontSize: 11, cursor: "pointer", border: "1px solid var(--ink-soft)", background: "var(--paper)", padding: "2px 8px", color: "var(--ink)" }}>▶ replay</button>
      </div>
      <div key={k}>
        {lines.map((raw, i) => {
          const { emotion, text } = parseEmotion(raw);
          return (
            <p key={i} style={{ fontSize: 14.5, lineHeight: 1.7, margin: "0 0 7px", color: "var(--ink)" }}>
              {emotion !== "say" && (
                <span style={{ fontFamily: "var(--theme-body)", fontSize: 9, letterSpacing: ".12em", color: "var(--margin-ink)", marginRight: 6 }}>
                  {EMO[emotion].glyph}{EMO[emotion].label.toUpperCase()}
                </span>
              )}
              {emotion === "say"
                ? <VMLine text={text} spec={spec} />
                : <EmoLine text={text} emotion={emotion} unit={spec.unit} basePace={spec.pace} />}
            </p>
          );
        })}
      </div>
    </div>
  );
}
