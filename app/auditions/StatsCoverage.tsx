// THE STATS COVERAGE — the campaign's mathematical substrate, as matrices. Stats are the math achievements are
// built around + the reward function that makes choices matter. TWO families: the RELATIONSHIP axes (L/P-
// driven, deterministic → the chatbot's coherent curve) and the CHAOS axis (CHAOTIC/COMPOSE → the gamble:
// crit · legendary · multiplayer). The split is what lets CHAOTIC be wild self-expression without breaking the
// chatbot math. From stats-coverage.mjs. Lives on the door (outline) page. NOT canon.

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", amber = "#c08a2e", violet = "#7a5b9a", red = "var(--spot-red)", blue = "#4a6b8a", paper = "var(--paper)", shade = "var(--paper-shade)";

export type StatsCoverageT = {
  whyTheseStats?: string;
  axes?: { name?: string; thematic?: string; measures?: string; family?: string; up?: string; down?: string }[];
  deltaArchetype?: { option?: string; tradeOff?: string; axesMoved?: string; role?: string }[];
  achievementThresholds?: { achievement?: string; condition?: string; family?: string; gates?: string }[];
  chaos?: {
    axis?: string; mechanics?: string; multiplayer?: string; containment?: string;
    critTable?: { nerve?: string; critPct?: string; onCrit?: string }[];
    legendary?: { definition?: string; floor?: string; examples?: { name?: string; equipChanges?: string }[] };
  };
  floors?: string[];
};
export type EconomyCheckT = { rows?: { check?: string; status?: string; note?: string }[]; ok?: number; warn?: number; fail?: number };
const famColor: Record<string, string> = { relationship: forest, chaos: red, shadow: violet };
const stIcon: Record<string, string> = { ok: "✓", warn: "⚠", FAIL: "✗" };
const stColor: Record<string, string> = { ok: forest, warn: amber, FAIL: red };

export function StatsCoverage({ cov, check }: { cov?: StatsCoverageT; check?: EconomyCheckT }) {
  if (!cov?.axes?.length) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 16, color: ink, margin: "0 0 2px" }}>📊 THE STATS COVERAGE <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— the math choices are built on</span></h2>

      {/* THE ECONOMY CHECK — the deterministic gate */}
      {!!check?.rows?.length && (
        <details style={{ border: `2px solid ${check.fail ? red : forest}`, background: shade, padding: "6px 11px", margin: "6px 0 10px" }} open={!!check.fail}>
          <summary style={{ cursor: "pointer", fontSize: 11.5, color: ink, fontWeight: 700, listStyle: "none" }}>
            🧮 the economy check <span style={{ fontWeight: 400 }}>— <b style={{ color: forest }}>{check.ok} ok</b>{check.warn ? <> · <b style={{ color: amber }}>{check.warn} warn</b></> : null}{check.fail ? <> · <b style={{ color: red }}>{check.fail} FAIL</b></> : null}</span> <span style={{ fontSize: 9, color: margin, fontWeight: 400 }}>(reachability · containment · no golden path · sparsity)</span>
          </summary>
          <div style={{ marginTop: 5 }}>
            {check.rows.map((r, i) => (
              <div key={i} style={{ fontSize: 9.5, color: soft, lineHeight: 1.5, display: "flex", gap: 6 }}>
                <span style={{ color: stColor[r.status || "ok"], fontWeight: 700, minWidth: 10 }}>{stIcon[r.status || "ok"]}</span>
                <span style={{ minWidth: 150, color: ink }}>{r.check}</span>
                <span style={{ color: margin }}>{r.note}</span>
              </div>
            ))}
          </div>
        </details>
      )}
      <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 8px" }}>Stats are the math achievements are built around + the reward function that makes <b>choices matter</b>. <b>Two families</b>: the <b style={{ color: forest }}>relationship</b> axes (L/P-driven, deterministic → the chatbot&rsquo;s coherent curve) and the <b style={{ color: red }}>chaos</b> axis (CHAOTIC/COMPOSE → the gamble). The split is what lets CHAOTIC be wild self-expression without breaking the chatbot math.</p>
      {cov.whyTheseStats && <p style={{ fontSize: 10.5, color: soft, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 10px", borderLeft: `3px solid ${forest}`, paddingLeft: 10 }}>{cov.whyTheseStats}</p>}

      {/* THE AXES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 7, marginBottom: 10 }}>
        {cov.axes.map((a, i) => (
          <div key={i} style={{ border: `1px solid ${famColor[a.family || ""] || "var(--ink-soft)"}`, borderLeft: `4px solid ${famColor[a.family || ""] || forest}`, background: paper, padding: "6px 9px" }}>
            <div style={{ fontSize: 10.5, color: ink, fontWeight: 700 }}>{a.name} <span style={{ fontSize: 8, color: famColor[a.family || ""] || margin }}>· {a.family}</span></div>
            <div style={{ fontSize: 9, color: soft, lineHeight: 1.4 }}>{a.thematic}</div>
            {a.measures && <div style={{ fontSize: 8.5, color: margin, marginTop: 1 }}>tracks: {a.measures}</div>}
          </div>
        ))}
      </div>

      {/* THE DELTA ARCHETYPE — no golden path */}
      {!!cov.deltaArchetype?.length && (
        <div style={{ border: `2px solid ${forest}`, background: shade, padding: "8px 11px", marginBottom: 9 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: ink, marginBottom: 4 }}>the delta archetype <span style={{ fontWeight: 400, color: margin }}>— every path trades a gain for a cost (no golden path)</span></div>
          {cov.deltaArchetype.map((dl, i) => (
            <div key={i} style={{ fontSize: 10, color: soft, lineHeight: 1.5, marginBottom: 3 }}>
              <b style={{ fontFamily: "monospace", color: dl.option?.startsWith("C") ? red : forest }}>{dl.option}</b> — <b style={{ color: blue }}>{dl.axesMoved}</b> · <span style={{ color: margin }}>{dl.tradeOff}</span>
            </div>
          ))}
        </div>
      )}

      {/* THE ACHIEVEMENT THRESHOLDS — stats → achievements */}
      {!!cov.achievementThresholds?.length && (
        <div style={{ marginBottom: 9 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: margin, textTransform: "uppercase", marginBottom: 4 }}>stats → achievements (the reward function)</div>
          {cov.achievementThresholds.map((t, i) => (
            <div key={i} style={{ fontSize: 10, color: soft, lineHeight: 1.55, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "baseline", borderBottom: `1px dashed var(--ink-soft)`, padding: "2px 0" }}>
              <code style={{ fontSize: 9.5, color: blue, background: shade, padding: "0 4px" }}>{t.condition}</code>
              <span style={{ color: margin }}>→</span>
              <b style={{ color: famColor[t.family || ""] || ink }}>«{t.achievement}»</b>
              <span style={{ fontSize: 8, color: famColor[t.family || ""] || margin, textTransform: "uppercase" }}>{t.family}</span>
              {t.gates && <span style={{ fontSize: 9, color: margin, flex: 1, minWidth: 120 }}>{t.gates}</span>}
            </div>
          ))}
        </div>
      )}

      {/* THE CHAOS ECONOMY */}
      {cov.chaos?.axis && (
        <div style={{ border: `2px solid ${red}`, background: paper, padding: "9px 12px" }}>
          <div style={{ fontSize: 12.5, color: ink, fontWeight: 700 }}>🎲 THE CHAOS LANE <span style={{ fontSize: 10, color: margin, fontWeight: 400 }}>— «{cov.chaos.axis}» (CHAOTIC/COMPOSE): the fun, self-expression, ice-breaker path</span></div>
          {cov.chaos.mechanics && <p style={{ fontSize: 10, color: soft, lineHeight: 1.5, margin: "3px 0 6px" }}>{cov.chaos.mechanics}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 14px" }}>
            {!!cov.chaos.critTable?.length && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: margin, marginBottom: 2 }}>CRIT % (scales with «{cov.chaos.axis}»)</div>
                {cov.chaos.critTable.map((c, i) => <div key={i} style={{ fontSize: 9.5, color: soft, lineHeight: 1.5 }}><code style={{ color: blue }}>{c.nerve}</code> → <b style={{ color: red }}>{c.critPct}</b> → {c.onCrit}</div>)}
              </div>
            )}
            {cov.chaos.legendary && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: margin, marginBottom: 2 }}>🏅 LEGENDARY <span style={{ fontWeight: 400 }}>— an equippable, toggleable chatbot-personality overlay</span></div>
                {(cov.chaos.legendary.examples || []).map((l, i) => <div key={i} style={{ fontSize: 9.5, color: soft, lineHeight: 1.45 }}><b style={{ color: amber }}>«{l.name}»</b> — {l.equipChanges}</div>)}
                {cov.chaos.legendary.floor && <div style={{ fontSize: 8.5, color: margin, fontStyle: "italic", marginTop: 3 }}>floor: {cov.chaos.legendary.floor}</div>}
              </div>
            )}
          </div>
          {cov.chaos.multiplayer && <div style={{ fontSize: 9.5, color: soft, lineHeight: 1.5, marginTop: 6 }}>👥 <b style={{ color: violet }}>multiplayer:</b> {cov.chaos.multiplayer}</div>}
          {cov.chaos.containment && <div style={{ fontSize: 9.5, color: ink, lineHeight: 1.5, marginTop: 4, background: shade, padding: "4px 8px", border: `1px solid ${forest}` }}>🛡 <b style={{ color: forest }}>containment (the keystone):</b> {cov.chaos.containment}</div>}
        </div>
      )}

      {/* THE FLOORS — the ruleset */}
      {!!cov.floors?.length && (
        <div style={{ fontSize: 9.5, color: margin, lineHeight: 1.55, marginTop: 8 }}>
          <b style={{ color: ink }}>the ruleset — what makes good stats:</b> {cov.floors.join(" · ")}
        </div>
      )}
    </section>
  );
}
