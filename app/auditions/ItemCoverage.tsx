// THE ITEM COVERAGE + THE UNIFIED ECONOMY MATRIX. Items are the tangible OBJECT form of flags (held /
// equippable / counted) — coupled to achievements, never a separate currency. The MATRIX is the whole economy
// in one table: path → stat → achievement → item → unlock → chatbot-context. From item-coverage.mjs. Lives on
// the door (outline) page. NOT canon.

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", amber = "#c08a2e", violet = "#7a5b9a", red = "var(--spot-red)", blue = "#4a6b8a", paper = "var(--paper)", shade = "var(--paper-shade)";

export type ItemCoverageT = {
  ruleset?: string[];
  tiers?: { tier?: string; rarity?: string; role?: string }[];
  items?: { name?: string; tier?: string; role?: string; earnedBy?: string; does?: string; persistence?: string; connectsTo?: string }[];
  matrix?: { source?: string; stat?: string; achievement?: string; family?: string; item?: string; unlock?: string; chatbotContext?: string }[];
  floors?: string[];
};
const tierColor: Record<string, string> = { object: forest, keepsake: blue, key: amber, legendary: red, counter: violet };
const famColor: Record<string, string> = { relationship: forest, shadow: violet, chaos: red };
const dash = (s?: string) => (!s || s === "—" ? <span style={{ color: "var(--ink-soft)", opacity: 0.5 }}>—</span> : s);

export function ItemCoverage({ cov }: { cov?: ItemCoverageT }) {
  if (!cov?.items?.length && !cov?.matrix?.length) return null;
  const td = { padding: "3px 6px", verticalAlign: "top" as const, borderBottom: "1px solid var(--ink-soft)", lineHeight: 1.4 };
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 16, color: ink, margin: "0 0 2px" }}>🎒 THE ITEM COVERAGE <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— the tangible layer + the whole economy in one matrix</span></h2>
      <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 9px" }}>An item is the <b>object form of a flag</b> (held · equippable · counted) — coupled to achievements, never a separate currency. The <b>tiers</b> carry the role; the <b>matrix</b> below ties the whole loop together.</p>

      {/* THE TIERS */}
      {!!cov.tiers?.length && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 9 }}>
          {cov.tiers.map((t, i) => (
            <span key={i} style={{ fontSize: 9, color: soft, border: `1px solid ${tierColor[t.tier || ""] || "var(--ink-soft)"}`, borderLeft: `4px solid ${tierColor[t.tier || ""] || forest}`, background: paper, padding: "3px 7px" }}>
              <b style={{ color: tierColor[t.tier || ""] || ink }}>{t.tier}</b> <span style={{ color: margin }}>({t.rarity})</span> — {t.role}
            </span>
          ))}
        </div>
      )}

      {/* THE ITEMS */}
      {!!cov.items?.length && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 6, marginBottom: 11 }}>
          {cov.items.map((it, i) => (
            <div key={i} style={{ border: `1px solid ${tierColor[it.tier || ""] || "var(--ink-soft)"}`, borderLeft: `4px solid ${tierColor[it.tier || ""] || forest}`, background: paper, padding: "5px 9px" }}>
              <div style={{ fontSize: 10, color: ink, fontWeight: 700 }}>«{it.name}» <span style={{ fontSize: 8, color: tierColor[it.tier || ""] || margin, fontWeight: 400 }}>· {it.tier}/{it.role}</span></div>
              <div style={{ fontSize: 9, color: soft, lineHeight: 1.4 }}>{it.does} <span style={{ color: margin }}>({it.persistence}; from {it.earnedBy})</span></div>
            </div>
          ))}
        </div>
      )}

      {/* THE UNIFIED ECONOMY MATRIX — the centerpiece */}
      {!!cov.matrix?.length && (
        <div style={{ border: `2px solid ${forest}`, background: shade, padding: "8px 10px", overflowX: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: ink, marginBottom: 5 }}>⛓ THE ECONOMY MATRIX <span style={{ fontWeight: 400, color: margin }}>— path → stat → achievement → item → unlock → chatbot, all in one place</span></div>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 9.5, color: soft, minWidth: 640 }}>
            <thead>
              <tr style={{ color: margin, fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".04em" }}>
                <th style={{ ...td, textAlign: "left" }}>source</th><th style={{ ...td, textAlign: "left" }}>stat</th><th style={{ ...td, textAlign: "left" }}>→ achievement</th><th style={{ ...td, textAlign: "left" }}>→ item</th><th style={{ ...td, textAlign: "left" }}>→ unlock</th><th style={{ ...td, textAlign: "left" }}>→ chatbot</th>
              </tr>
            </thead>
            <tbody>
              {cov.matrix.map((m, i) => (
                <tr key={i}>
                  <td style={{ ...td }}><b style={{ fontFamily: "monospace", color: m.source?.startsWith("C") ? red : m.source?.startsWith("avoid") ? violet : forest }}>{m.source}</b></td>
                  <td style={{ ...td }}><code style={{ color: blue }}>{dash(m.stat)}</code></td>
                  <td style={{ ...td }}>{m.achievement && m.achievement !== "—" ? <b style={{ color: famColor[m.family || ""] || ink }}>«{m.achievement}»</b> : dash(m.achievement)}</td>
                  <td style={{ ...td }}>{m.item && m.item !== "—" ? <span style={{ color: ink }}>{m.item}</span> : dash(m.item)}</td>
                  <td style={{ ...td, color: margin }}>{dash(m.unlock)}</td>
                  <td style={{ ...td, color: violet }}>{dash(m.chatbotContext)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!!cov.floors?.length && <div style={{ fontSize: 9.5, color: margin, lineHeight: 1.55, marginTop: 8 }}><b style={{ color: ink }}>item floors:</b> {cov.floors.join(" · ")}</div>}
    </section>
  );
}
