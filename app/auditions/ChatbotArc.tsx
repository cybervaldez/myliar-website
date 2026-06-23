// THE CHATBOT ARC — the campaign ANCHOR (the chat is the destination). Consolidates the cast's PERSONALITIES +
// their inter-character DYNAMICS (the living-world substrate carried to the prelude + day-to-day) with the
// FOCAL's CHATBOT MICRO-ARC across the REL ladder, the COHERENCE rules (the off-axis guardrails), and the
// ACHIEVEMENT-gated context (the sparse personalization). From chatbot-arc.mjs; simulated by chatbot-sim.mjs.
// Lives on the door (outline) page. NOT canon.

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", amber = "#c08a2e", violet = "#7a5b9a", red = "var(--spot-red)", blue = "#4a6b8a", paper = "var(--paper)", shade = "var(--paper-shade)";

type Str = string | Record<string, string> | undefined;
const flat = (v: Str): string => (v && typeof v === "object" ? Object.values(v).filter(Boolean).join(" · ") : (v as string) || "");
export type ChatbotArcT = {
  cast?: { name?: string; personality?: { voice?: Str; manner?: Str; quirks?: string[] }; dynamics?: { with?: string; dynamic?: string; history?: string; tell?: string }[] }[];
  focal?: {
    name?: string;
    microArc?: { tier?: string; struggleState?: string; register?: string; reveals?: string; canSay?: string; wontSay?: string }[];
    coherenceRules?: { axis?: string; rule?: string }[];
    contextUnlocks?: { achievement?: string; unlocks?: string; fromTier?: string }[];
  };
  anchor?: string;
};
const AXIS: Record<string, string> = { REL: "⬍ REL", CHARACTER: "◆ CHARACTER", CONTEXT: "🔓 CONTEXT" };

export function ChatbotArc({ arc }: { arc?: ChatbotArcT }) {
  if (!arc?.focal?.microArc?.length && !arc?.cast?.length) return null;
  const f = arc.focal;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 16, color: ink, margin: "0 0 2px" }}>💬 THE CHATBOT ARC <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— the destination (the campaign anchor)</span></h2>
      <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 8px" }}>The chat IS the destination. This consolidates the cast&rsquo;s <b>personalities + dynamics</b> (carried to the prelude + the day-to-day) with the focal&rsquo;s <b>chatbot micro-arc</b> — how the agent changes across the REL ladder, the <b>coherence</b> bounds that keep it on-axis, and the <b>achievement-gated</b> context. Simulated by <code style={{ fontSize: 9 }}>chatbot-sim</code>.</p>
      {arc.anchor && <p style={{ fontSize: 11, color: ink, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 10px", borderLeft: `3px solid ${forest}`, paddingLeft: 10 }}>⚓ {arc.anchor}</p>}

      {/* THE CAST — personalities + the dynamics web */}
      {!!arc.cast?.length && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(255px, 1fr))", gap: 8, marginBottom: 12 }}>
          {arc.cast.map((c, i) => (
            <div key={i} style={{ border: `1px solid var(--ink-soft)`, background: paper, padding: "8px 11px" }}>
              <div style={{ fontSize: 11.5, color: ink, fontWeight: 700 }}>{c.name}{c.name === f?.name ? <span style={{ fontSize: 8.5, color: forest, fontWeight: 400 }}> · focal</span> : null}</div>
              {c.personality?.voice && <div style={{ fontSize: 9.5, color: soft, lineHeight: 1.45, marginTop: 2 }}>🗣 <b style={{ color: blue }}>voice:</b> {flat(c.personality.voice)}</div>}
              {!!c.personality?.quirks?.length && <div style={{ fontSize: 9, color: margin, marginTop: 1 }}>· {c.personality.quirks.join(" · ")}</div>}
              {!!c.dynamics?.length && (
                <div style={{ marginTop: 4, borderTop: `1px dashed var(--ink-soft)`, paddingTop: 3 }}>
                  {c.dynamics.map((dy, j) => <div key={j} style={{ fontSize: 9, color: margin, lineHeight: 1.4 }}>↔ <b style={{ color: violet }}>{dy.with}</b> <span style={{ color: soft }}>({dy.dynamic})</span> — {dy.tell}</div>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* THE FOCAL MICRO-ARC — the chatbot's evolution across the ladder */}
      {!!f?.microArc?.length && (
        <div style={{ border: `2px solid ${forest}`, background: shade, padding: "9px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: ink, marginBottom: 5 }}>{f.name} — the chatbot across the ladder <span style={{ color: margin, fontWeight: 400 }}>(register · what unlocks · the bound)</span></div>
          {f.microArc.map((m, i) => {
            const last = i === f.microArc!.length - 1;
            return (
              <div key={i} style={{ marginBottom: 5, paddingBottom: 4, borderBottom: !last ? `1px dashed var(--ink-soft)` : "none" }}>
                <div style={{ fontSize: 10.5 }}><b style={{ fontFamily: "monospace", color: last ? red : forest }}>{m.tier}</b> <span style={{ color: soft }}>— {m.register}</span></div>
                {m.reveals && <div style={{ fontSize: 9.5, color: margin, lineHeight: 1.45, paddingLeft: 8 }}>✦ reveals: {m.reveals}</div>}
                {m.wontSay && <div style={{ fontSize: 9.5, color: red, lineHeight: 1.45, paddingLeft: 8 }}>⊘ won&rsquo;t say yet: {m.wontSay}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* THE COHERENCE RULES (the off-axis guardrails) + THE CONTEXT UNLOCKS (achievement-gated) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 9 }}>
        {!!f?.coherenceRules?.length && (
          <div style={{ border: `1px solid ${red}`, background: paper, padding: "7px 10px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: ink, marginBottom: 3 }}>🛡 coherence — the off-axis bounds</div>
            {f.coherenceRules.map((r, i) => <div key={i} style={{ fontSize: 9, color: soft, lineHeight: 1.5, marginBottom: 2 }}><b style={{ color: red }}>{AXIS[r.axis || ""] || r.axis}</b> {r.rule}</div>)}
          </div>
        )}
        {!!f?.contextUnlocks?.length && (
          <div style={{ border: `1px solid ${amber}`, background: paper, padding: "7px 10px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: ink, marginBottom: 3 }}>🏆 context unlocks <span style={{ fontWeight: 400, color: margin }}>(sparse — achievements personalize)</span></div>
            {f.contextUnlocks.map((u, i) => <div key={i} style={{ fontSize: 9, color: soft, lineHeight: 1.5, marginBottom: 2 }}><b style={{ color: amber }}>«{u.achievement}»</b> <span style={{ color: margin }}>[{u.fromTier}]</span> → {u.unlocks}</div>)}
          </div>
        )}
      </div>
    </section>
  );
}
