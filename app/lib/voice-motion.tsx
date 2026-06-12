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



// ── the auditions surface: a VOICE block rendered LIVE in its declared preset ──
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
        {lines.map((l, i) => (
          <p key={i} style={{ fontSize: 14.5, lineHeight: 1.7, margin: "0 0 7px", color: "var(--ink)" }}>
            <VMLine text={l} spec={spec} />
          </p>
        ))}
      </div>
    </div>
  );
}
