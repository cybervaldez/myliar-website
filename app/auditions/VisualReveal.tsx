// THE CAST TRAITS coverage — the visual reveal ladder (OPEN vitals + CONCEALABLE traits, each HIDDEN-BUT-
// PROMPTABLE: always in the portrait, concealed → unveiled) + the UI-only QUIRKS + the ENSEMBLE HARMONY. From
// visual-reveal.mjs. The full ladder for the designer; in-game the player sees only what they've revealed. NOT canon.

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", violet = "#7a5b9a", red = "var(--spot-red)", blue = "#4a6b8a", paper = "var(--paper)", shade = "var(--paper-shade)";

type Concealable = { band?: string; type?: string; slot?: string; trait?: string; anchorsStruggle?: string; howNoticed?: string; concealment?: string; concealedPrompt?: string; revealedPrompt?: string };
type Quirks = { speechStyle?: string; textReveal?: string; rhythm?: string; verbalTic?: string; bubble?: string };
export type VisualCastT = { name?: string; personalName?: string; color?: string; vitals?: { dimension?: string; open?: { trait?: string; prompt?: string }[]; concealable?: Concealable[]; firstMet?: { trait?: string }[]; reveals?: Concealable[] }; quirks?: Quirks };
export type VisualAnchorT = { anchor?: string; ruleset?: string[] };
export type EnsembleHarmonyT = { metaphorMap?: { character?: string; dimension?: string; why?: string; expressedIn?: string }[]; balance?: string; harmony?: string; interactions?: { pair?: string; plays?: string }[] };
import { SpeechAnimation } from "./SpeechAnimation";
const concIcon: Record<string, string> = { silhouette: "🌑", clothing: "🧥", hair: "💇" };
const sampleLine = (q?: Quirks) => (q?.speechStyle || "").match(/[‘'"“]([^’'"”]{4,}?)[’'"”]/)?.[1] || q?.verbalTic?.replace(/^.*?[:—-]\s*/, "").replace(/['"“”‘’]/g, "") || "The sea is calm tonight.";

export function VisualReveal({ cast, anchor, harmony }: { cast?: VisualCastT[]; anchor?: VisualAnchorT; harmony?: EnsembleHarmonyT }) {
  const withV = (cast || []).filter((c) => c.vitals?.open?.length || c.vitals?.concealable?.length);
  if (!withV.length) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 16, color: ink, margin: "0 0 2px" }}>👁 THE CAST TRAITS <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— visual reveal (observe as you grow close) · UI quirks · ensemble harmony</span></h2>
      <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 8px" }}>{anchor?.anchor || "Each character has open vitals + concealable traits revealed one at a time as you grow close."} <b>THE HARD RULE:</b> every concealable trait is <b>hidden-but-promptable</b> — always in the portrait, but <b style={{ color: violet }}>concealed</b> (silhouette · clothing · hair) until revealed, so the portrait stays consistent and the reveal <b>unveils</b> (never adds). Each anchors a struggle.</p>

      {/* THE METAPHOR MAP — the ENSEMBLE-FIRST coverage (each owns a distinct dimension; together a whole person) */}
      {(harmony?.metaphorMap?.length || harmony?.harmony) && (
        <div style={{ border: `2px solid ${forest}`, background: shade, padding: "8px 11px", marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ink }}>🗺 the metaphor map <span style={{ fontWeight: 400, color: margin }}>— ensemble-first: each owns a DISTINCT dimension; not forced per character</span></div>
          {!!harmony?.metaphorMap?.length && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px", margin: "3px 0 4px" }}>
              {harmony.metaphorMap.map((m, i) => <span key={i} style={{ fontSize: 10, color: soft }} title={m.why}><b style={{ color: forest }}>{m.character}</b> ⟶ {m.dimension}</span>)}
            </div>
          )}
          {harmony?.balance && <p style={{ fontSize: 9.5, color: margin, lineHeight: 1.5, margin: "0 0 4px", fontStyle: "italic" }}>⚖ {harmony.balance}</p>}
          {harmony?.harmony && <p style={{ fontSize: 9.5, color: soft, lineHeight: 1.5, margin: "2px 0" }}>{harmony.harmony}</p>}
          {(harmony?.interactions || []).map((it, i) => <div key={i} style={{ fontSize: 9.5, color: margin, lineHeight: 1.45 }}>↔ <b style={{ color: forest }}>{it.pair}</b> — {it.plays}</div>)}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 9 }}>
        {withV.map((c, i) => {
          const col = c.color || forest;
          const open = c.vitals?.open || c.vitals?.firstMet || [];
          const conc = c.vitals?.concealable || c.vitals?.reveals || [];
          return (
            <div key={i} style={{ border: `1px solid ${col}`, borderLeft: `4px solid ${col}`, background: paper, padding: "8px 11px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ink }}><span style={{ color: col }}>{c.personalName}</span> <span style={{ fontSize: 9, color: margin, fontWeight: 400 }}>· {c.name}</span>{c.vitals?.dimension ? <span style={{ fontSize: 8.5, color: violet, fontWeight: 400, display: "block" }}>⟶ {c.vitals.dimension}</span> : null}</div>
              {!!open.length && <div style={{ fontSize: 9.5, color: soft, lineHeight: 1.45, margin: "3px 0 4px" }}><span style={{ fontSize: 8, fontWeight: 700, color: margin }}>OPEN · </span>{open.map((f) => f.trait).join(" · ")}</div>}
              {conc.map((r, j) => (
                <div key={j} style={{ borderTop: `1px dashed var(--ink-soft)`, paddingTop: 4, marginTop: 4 }}>
                  <div style={{ fontSize: 9.5, lineHeight: 1.4 }}><span style={{ color: violet, fontWeight: 700 }}>◌ ??? {r.slot}</span> <span style={{ fontSize: 8, color: margin }}>{concIcon[r.concealment || ""] || ""}{r.type} · {r.band}</span></div>
                  <div style={{ fontSize: 9.5, color: ink, lineHeight: 1.4, paddingLeft: 8 }}>↳ {r.trait}</div>
                  {r.anchorsStruggle && <div style={{ fontSize: 8.5, color: red, lineHeight: 1.35, paddingLeft: 8 }}>⚓ {r.anchorsStruggle}</div>}
                  {(r.concealedPrompt || r.revealedPrompt) && <div style={{ fontSize: 8.5, color: margin, lineHeight: 1.4, paddingLeft: 8, fontFamily: "monospace" }}>🎭 <b>hidden:</b> {r.concealedPrompt} <b style={{ color: forest }}>→ shown:</b> {r.revealedPrompt}</div>}
                </div>
              ))}
              {c.quirks?.speechStyle && (
                <div style={{ borderTop: `1px solid var(--ink-soft)`, paddingTop: 4, marginTop: 5, fontSize: 9, color: soft, lineHeight: 1.45 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: blue }}>UI QUIRKS (presentation only) </span>🗣 {c.quirks.speechStyle}{c.quirks.verbalTic ? <> · tic: {c.quirks.verbalTic}</> : null}
                  {c.quirks.textReveal && <div style={{ marginTop: 2 }}>✨ <i>{c.quirks.textReveal}</i> → <SpeechAnimation text={sampleLine(c.quirks)} style={c.quirks.textReveal} color={col} /></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!!anchor?.ruleset?.length && <div style={{ fontSize: 9, color: margin, lineHeight: 1.5, marginTop: 7 }}><b style={{ color: ink }}>floors:</b> {anchor.ruleset.join(" · ")}</div>}
    </section>
  );
}
