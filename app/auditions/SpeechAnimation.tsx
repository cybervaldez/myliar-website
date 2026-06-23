"use client";
// THE SPEECH ANIMATION — the UI-only quirk made live. Animates a sample line per the character's `textReveal`
// style (slow gentle fade · instant · word-by-word · a hesitation), with a replay. This is presentation only —
// it never touches gameplay or the portrait. Used in the cast-traits coverage to demo each character's quirk.
import { useState, useEffect } from "react";

const classify = (s: string) => /instant|immediate/i.test(s) ? "instant" : /word.?by.?word|each word/i.test(s) ? "word" : /hesitat|pause|stutter/i.test(s) ? "hesitate" : "fade";

export function SpeechAnimation({ text, style, color }: { text?: string; style?: string; color?: string }) {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const mode = classify(style || "");
  const [n, setN] = useState(mode === "instant" ? words.length : 0);
  const [hes, setHes] = useState(false);
  const [k, setK] = useState(0);
  const col = color || "var(--ink)";

  useEffect(() => {
    if (mode === "instant") { setN(words.length); setHes(false); return; }
    setN(0); setHes(mode === "hesitate");
    const step = mode === "word" ? 105 : 165;
    const start = mode === "hesitate" ? 850 : 0;
    let i = 0; let iv: ReturnType<typeof setInterval>;
    const t = setTimeout(() => { setHes(false); iv = setInterval(() => { i += 1; setN(i); if (i >= words.length) clearInterval(iv); }, step); }, start);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [k, text, mode, words.length]);

  if (!words.length) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontStyle: "italic", color: "var(--ink-soft)", minHeight: "1.3em" }}>
        &ldquo;{hes ? <span style={{ opacity: 0.45, color: col }}>…</span> : words.map((w, i) => <span key={i} style={{ opacity: i < n ? 1 : 0, transition: mode === "word" ? "none" : "opacity .45s ease", color: i < n ? "var(--ink-soft)" : "transparent" }}>{w} </span>)}&rdquo;
      </span>
      <button onClick={() => setK((x) => x + 1)} title="replay" style={{ fontSize: 9, color: col, background: "none", border: `1px solid ${col}`, borderRadius: 8, cursor: "pointer", padding: "0 4px", lineHeight: 1.4 }}>↻</button>
    </span>
  );
}
