// THE MECHANICS COVERAGE — a deterministic gate (mechanics-check.mjs) shown on the OUTLINE page: is every
// game mechanic INTACT in each day (per-day) or PLACED somewhere in the arc (milestone) — or deliberately
// absent (the lane)? Any GAP is a mechanic the micro-arcs must adapt to include. NOT canon.

export type MechCheckT = { rows?: { mechanic: string; scope: string; status: string; where: string }[]; gaps?: number; ok?: number; na?: number };

const ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", forest = "var(--forest)", red = "var(--spot-red)", paper = "var(--paper)", shade = "var(--paper-shade)";

export function MechanicsCoverage({ check }: { check: MechCheckT }) {
  if (!check?.rows?.length) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 16, color: ink, margin: "0 0 2px" }}>🔧 MECHANICS COVERAGE <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— every mechanic intact-per-day or placed-in-arc</span></h2>
      <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 8px" }}>
        <b style={{ color: forest }}>{check.ok ?? 0} ok</b> · <b style={{ color: (check.gaps ?? 0) ? red : margin }}>{check.gaps ?? 0} gap</b> · <span style={{ color: margin }}>{check.na ?? 0} deliberately absent</span> — the micro-arcs adapt to carry the mechanics (a gap = a mechanic to place).
      </p>
      <div style={{ border: `1px solid var(--ink-soft)`, background: paper }}>
        {check.rows.map((r) => (
          <div key={r.mechanic} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "3px 11px", fontSize: 10.5, borderTop: `1px solid rgba(0,0,0,.05)`, background: r.status === "GAP" ? "rgba(184,31,28,.05)" : undefined }}>
            <span style={{ width: 12, color: r.status === "GAP" ? red : r.status === "n/a" ? margin : forest, fontWeight: 700 }}>{r.status === "GAP" ? "⚠" : r.status === "n/a" ? "·" : "✓"}</span>
            <span style={{ flex: "0 0 220px", color: r.status === "n/a" ? margin : ink, fontWeight: r.status === "GAP" ? 700 : 400 }}>{r.mechanic}</span>
            <span style={{ fontSize: 8.5, color: margin, letterSpacing: ".04em", flex: "0 0 70px" }}>[{r.scope}]</span>
            <span style={{ color: soft, fontStyle: r.status === "n/a" ? "italic" : "normal" }}>{r.where}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
