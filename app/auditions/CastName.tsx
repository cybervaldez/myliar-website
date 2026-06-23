"use client";
// A cast NAME in the prelude — coloured by the character's palette, tappable → a popover with their SHEET
// (the first-met description + the ??? visual-reveal slots, the progress-with-you tease). The deeper traits stay
// ??? here (they reveal as you grow close in-game); the struggle-anchor is never shown (it's the payoff). NOT canon.
import { useState } from "react";

type Vital = { trait?: string; prompt?: string };
type Reveal = { band?: string; slot?: string; trait?: string; type?: string };
export type CastVitals = { open?: Vital[]; concealable?: Reveal[]; firstMet?: Vital[]; reveals?: Reveal[] };
export type CastNameT = { personalName?: string; name?: string; color?: string; vitals?: CastVitals; quirks?: { speechStyle?: string } };

export function CastName({ c }: { c: CastNameT }) {
  const [open, setOpen] = useState(false);
  const color = c.color || "var(--forest)";
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{ color, fontWeight: 700, background: "none", border: "none", borderBottom: `1px dotted ${color}`, cursor: "pointer", font: "inherit", padding: 0, lineHeight: "inherit" }}>{c.personalName}</button>
      {open && (
        <>
          <span onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
          <span style={{ position: "absolute", zIndex: 20, left: 0, top: "1.5em", width: 290, maxWidth: "80vw", textAlign: "left", background: "var(--paper)", border: `2px solid ${color}`, boxShadow: "2px 3px 0 rgba(0,0,0,.18)", padding: "9px 11px", fontStyle: "normal", display: "block" }}>
            <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 700 }}>{c.personalName} <span style={{ fontSize: 9, color, fontWeight: 400 }}>· {c.name}</span></div>
            {(() => { const open = c.vitals?.open || c.vitals?.firstMet || []; return open.length ? (
              <div style={{ fontSize: 10, color: "var(--ink-soft)", lineHeight: 1.5, margin: "4px 0" }}>
                {open.map((f, i) => <span key={i}>{f.trait} </span>)}
              </div>
            ) : null; })()}
            {(() => { const conc = c.vitals?.concealable || c.vitals?.reveals || []; return conc.length ? (
              <div style={{ borderTop: "1px dashed var(--ink-soft)", paddingTop: 4, marginTop: 2 }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".06em", color: "var(--margin-ink)", textTransform: "uppercase", marginBottom: 2 }}>the more you know them, the more you see</div>
                {conc.map((r, i) => (
                  <div key={i} style={{ fontSize: 9.5, color: "var(--margin-ink)", lineHeight: 1.45 }}>
                    <span style={{ color }}>◌ ???</span> <span style={{ fontStyle: "italic" }}>{r.slot}</span> <span style={{ opacity: 0.6 }}>· {r.band}</span>
                  </div>
                ))}
              </div>
            ) : null; })()}
            {c.quirks?.speechStyle && <div style={{ fontSize: 8.5, color: "var(--margin-ink)", marginTop: 4, fontStyle: "italic" }}>speaks: {c.quirks.speechStyle}</div>}
          </span>
        </>
      )}
    </span>
  );
}
