// THE DAY-BY-DAY MICRO-ARC OUTLINE — top-down coverage of ALL the days, on the OUTLINE (door) page. This is
// the cross-day view (the same top-down formula as the scene coverage): it checks the hooks CHAIN, the days
// stay DISTINCT (no redundancy), and the cadence is right. Each day expands to its full micro-arc spec; the
// day SUBPAGE is the honing (the expansion). NOT canon.
import { DayOutline, type DayOutlineT } from "./DayOutline";

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", paper = "var(--paper)";

export function DayCoverage({ outline, campaign, door, honedDays }: { outline: Record<string, DayOutlineT>; campaign: string; door: string; honedDays?: string[] }) {
  const days = Object.keys(outline).map(Number).sort((a, b) => a - b);
  if (!days.length) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 16, color: ink, margin: "0 0 2px" }}>🗒 THE DAY-BY-DAY MICRO-ARC OUTLINE <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— top-down coverage</span></h2>
      <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 10px" }}>all days at once — so the hooks <b>chain</b>, the days stay <b>distinct</b> (no redundancy), and the reward cadence stays <b>sparse</b>. Each row expands to the day&rsquo;s micro-arc spec; the <b>day subpage</b> is the honing (the expansion).</p>
      {days.map((n) => {
        const o = outline[String(n)];
        const honed = honedDays?.includes(String(n));
        return (
          <details key={n} style={{ border: `1px solid var(--ink-soft)`, background: paper, marginBottom: 5 }}>
            <summary style={{ cursor: "pointer", padding: "6px 11px", fontSize: 11.5, color: ink, listStyle: "none", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
              <b style={{ fontFamily: "monospace", color: forest }}>D{n}</b>
              <b>{o?.title}</b>
              {o?.featuring?.length ? <span style={{ fontSize: 9.5, color: margin }}>👤 {Array.isArray(o.featuring) ? o.featuring.join("/") : o.featuring}</span> : null}
              {o?.statFocus && <span style={{ fontSize: 9, color: "#4a6b8a" }}>📊 {o.statFocus}</span>}
              {o?.cg && <span style={{ fontSize: 9, color: "var(--spot-red)" }}>🖼 {o.cg.taxon}</span>}
              {!!o?.rewards?.length && <span style={{ fontSize: 9.5, letterSpacing: ".5px" }}>{o.rewards.map((r, i) => <span key={i} title={`${r.name}${r.unlocks ? ` → ${r.unlocks}` : ""}`} style={{ color: r.kind === "achievement" ? "#c08a2e" : "var(--ink)" }}>{r.kind === "achievement" ? "🏆" : "🎒"}{r.unlocks ? "🔓" : ""}</span>)}</span>}
              <span style={{ fontSize: 9.5, color: soft, fontStyle: "italic", flex: 1, minWidth: 120 }}>↪ {String(o?.hook).slice(0, 64)}</span>
              <a href={`/auditions/${campaign}/scenes/${door}/day/${n}`} style={{ fontSize: 9.5, color: forest, fontWeight: 700, textDecoration: "none" }}>{honed ? "honed ✓" : "open day"} →</a>
            </summary>
            <div style={{ padding: "0 11px 8px" }}>{o && <DayOutline o={o} />}</div>
          </details>
        );
      })}
    </section>
  );
}
