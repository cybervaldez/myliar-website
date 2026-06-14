// StepBoard — the shared renderer for ONE audition step (one step = one page). It shows the
// CARRIED-FORWARD experts from prior steps (the look-back), then this step's candidates — each with
// its ⭐ build-value, scorecard (mean + agreement), the audience WHY, and the legs' forward notes —
// then prev/next nav. §8.10/§8.17: no pick — strengths reinforce, gems fix.

type Read = { index: number; relate: number; feelsSafe: number; wouldPlay: boolean; why?: string; feeling?: string; expectExperience?: string };
type Leg = { index: number; canBuild: "load-bearing" | "hairline" | "hollow"; explanation: string; opens: string; forecloses: string; seed: string };
export type Item = { key: string; idx: number; title: string; sub: string; body: string };
type Nav = { href: string; label: string } | null;

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)", red = "var(--spot-red)", amber = "#c08a2e";
const TARGET = ["anxious", "low_worth", "adhd", "iyashikei_fan"];
const PLABEL: Record<string, string> = { anxious: "anxious", low_worth: "low self-worth", adhd: "ADHD", iyashikei_fan: "iyashikei fan" };
const LEGV: Record<string, number> = { "load-bearing": 1, hairline: 0.5, hollow: 0 };
const SW: Record<string, number> = { feelsSafe: 3, destination: 3, struggle: 3, relate: 2, mechanics: 2, cast: 1.5, cast_voice: 1.5, sustain: 1.5, motif_title: 1 };
const agree = (s: number) => (s <= 1 ? "agreed" : s <= 2 ? "mixed" : "split");
const agreeCol = (s: number) => (s <= 1 ? forest : s <= 2 ? amber : red);
const legColor = (v: string) => (v === "load-bearing" ? forest : v === "hairline" ? amber : red);
const starStr = (n: number) => "★".repeat(Math.floor(n)) + (n % 1 ? "½" : "") + "☆".repeat(Math.max(0, 5 - Math.ceil(n)));
const reason = (r: Read) => r.why || r.expectExperience || r.feeling || "";

const STATUS: Record<string, { txt: string; col: string }> = {
  building: { txt: "● PICKED — building", col: forest }, shipped: { txt: "● shipped", col: forest },
  available: { txt: "○ in the bank — revivable", col: margin }, retired: { txt: "✕ retired", col: red },
};

export default function StepBoard({ stepLabel, intro, items, results, legs, carried, status, prev, next }: {
  stepLabel: string; intro: string; items: Item[]; results: Record<string, Read[]>; legs: Record<string, Leg[]>;
  carried?: { step: string; lines: string[] }[]; status?: Record<string, string>; prev?: Nav; next?: Nav;
}) {
  const get = (p: string, i: number) => (results[p] || []).find((r) => r.index === i);
  const avg = (i: number, k: "relate" | "feelsSafe") => TARGET.reduce((s, p) => s + (get(p, i)?.[k] ?? 0), 0) / TARGET.length;
  const spread = (i: number, k: "relate" | "feelsSafe") => { const v = TARGET.map((p) => get(p, i)?.[k] ?? 0); return Math.max(...v) - Math.min(...v); };
  const LEGK = Object.keys(legs || {});
  const getLeg = (e: string, i: number) => (legs[e] || []).find((r) => r.index === i);
  const legMean = (i: number) => { const v = LEGK.map((e) => LEGV[getLeg(e, i)?.canBuild ?? "hollow"]); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
  const star = (i: number) => { let num = SW.relate * (avg(i, "relate") / 5) + SW.feelsSafe * (avg(i, "feelsSafe") / 5), den = SW.relate + SW.feelsSafe; for (const e of LEGK) { num += (SW[e] ?? 1) * LEGV[getLeg(e, i)?.canBuild ?? "hollow"]; den += SW[e] ?? 1; } return Math.round((num / den) * 10) / 2; };
  const navLink = (n: Nav, dir: string) => n ? <a href={n.href} style={{ color: forest, fontWeight: 700, textDecoration: "none" }}>{dir === "prev" ? "← " : ""}{n.label}{dir === "next" ? " →" : ""}</a> : <span style={{ color: margin }}>{dir === "prev" ? "← start" : "next: tbd →"}</span>;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
        <a href="/auditions" style={{ color: margin, textDecoration: "none" }}>↑ all steps</a>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: red, fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 24, margin: "0 0 4px", color: ink }}>{stepLabel}</h1>
      <p style={{ fontSize: 12.5, color: soft, lineHeight: 1.55, margin: "0 0 16px" }}>{intro}</p>

      {carried && carried.length > 0 && (
        <div style={{ border: `2px dashed ${forest}`, background: shade, padding: "11px 14px", margin: "0 0 20px" }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", color: forest, marginBottom: 5 }}>↩ CARRIED FORWARD — the previous experts (look-back)</div>
          {carried.map((c) => (
            <div key={c.step} style={{ fontSize: 11.5, color: ink, lineHeight: 1.5, marginBottom: 3 }}>
              <b style={{ color: margin }}>{c.step}</b> {c.lines.map((l, j) => <span key={j}>{j ? " · " : " "}{l}</span>)}
            </div>
          ))}
        </div>
      )}

      {items.slice().sort((a, b) => star(b.idx) - star(a.idx)).map((it) => {
        const i = it.idx, sr = spread(i, "relate"), ss = spread(i, "feelsSafe"), lm = legMean(i), thr = get("thrill_seeker", i), repelHeld = !thr?.wouldPlay;
        const nLB = LEGK.filter((e) => getLeg(e, i)?.canBuild === "load-bearing").length;
        const nGem = (LEGK.length - nLB) + TARGET.filter((p) => (get(p, i)?.feelsSafe ?? 5) < 4 || (get(p, i)?.relate ?? 5) < 3).length + (repelHeld ? 0 : 1);
        return (
          <section key={it.key} style={{ border: `2px solid var(--ink-soft)`, background: paper, marginBottom: 16, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                {status?.[it.key] && STATUS[status[it.key]] && (
                  <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", color: STATUS[status[it.key]].col, marginBottom: 1 }}>{STATUS[status[it.key]].txt}</div>
                )}
                <div style={{ fontFamily: "var(--theme-display)", fontSize: 21, color: ink }}>{it.title}</div>
                <div style={{ fontSize: 11, color: margin, fontStyle: "italic" }}>{it.sub}</div>
                <div style={{ fontSize: 15, color: amber, letterSpacing: 1, marginTop: 1 }}>{starStr(star(i))} <span style={{ fontSize: 10.5, color: margin, letterSpacing: 0 }}>{star(i).toFixed(1)} build-value</span></div>
              </div>
              <div style={{ textAlign: "right", fontSize: 11.5, minWidth: 150 }}>
                <div>relate <b style={{ color: ink }}>{avg(i, "relate").toFixed(1)}</b> <span style={{ color: agreeCol(sr), fontSize: 10 }}>· {agree(sr)}</span></div>
                <div>safe <b style={{ color: ink }}>{avg(i, "feelsSafe").toFixed(1)}</b> <span style={{ color: agreeCol(ss), fontSize: 10 }}>· {agree(ss)}</span></div>
                <div style={{ fontSize: 10.5, color: margin }}>legs <b style={{ color: ink }}>{lm.toFixed(1)}</b>/2 · repel {repelHeld ? <span style={{ color: forest }}>held</span> : <span style={{ color: red }}>tapped</span>}</div>
                <div style={{ fontWeight: 700, marginTop: 2, fontSize: 10.5 }}><span style={{ color: forest }}>↑{nLB} reinforce</span> · <span style={{ color: amber }}>◆{nGem} gems</span></div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: ink, margin: "8px 0", lineHeight: 1.6, whiteSpace: "pre-line" }}>{it.body}</p>
            <div style={{ borderTop: `1px solid var(--ink-soft)`, paddingTop: 8, fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, fontFamily: "var(--theme-body)" }}>↘ THE AUDIENCE · WHY</div>
            <div style={{ marginTop: 5, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "7px 14px" }}>
              {TARGET.map((p) => { const r = get(p, i); if (!r) return null; return (
                <div key={p} style={{ fontSize: 11, color: soft, lineHeight: 1.45, borderLeft: `2px solid var(--ink-soft)`, paddingLeft: 8 }}>
                  <div><b style={{ color: margin }}>{PLABEL[p]}</b> <span style={{ color: ink, fontWeight: 700 }}>r{r.relate}/s{r.feelsSafe}</span></div>
                  <div style={{ color: ink }}>{reason(r)}</div>
                </div> ); })}
            </div>
            <div style={{ borderTop: `1px solid var(--ink-soft)`, marginTop: 8, paddingTop: 8, fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, fontFamily: "var(--theme-body)" }}>↗ THE LEGS · FORWARD NOTES</div>
            <div style={{ marginTop: 6, display: "grid", gap: 7 }}>
              {LEGK.map((e) => { const r = getLeg(e, i); if (!r) return null; const col = legColor(r.canBuild); return (
                <div key={e} style={{ fontSize: 11, lineHeight: 1.5, borderLeft: `2px solid ${col}`, paddingLeft: 8 }}>
                  <span style={{ fontFamily: "var(--theme-body)", fontWeight: 700, color: col }}>{e.replace(/_/g, " ")}</span> <span style={{ fontSize: 9, color: col, border: `1px solid ${col}`, borderRadius: 3, padding: "0 5px", marginLeft: 6 }}>{r.canBuild}</span>
                  <div style={{ color: ink, marginTop: 1 }}>{r.explanation}</div>
                  <div style={{ color: margin, fontStyle: "italic", fontSize: 10.5 }}>↳ seed: {r.seed}</div>
                </div> ); })}
            </div>
          </section>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid var(--ink-soft)`, paddingTop: 12, marginTop: 8, fontSize: 13 }}>
        {navLink(prev ?? null, "prev")}{navLink(next ?? null, "next")}
      </div>
    </main>
  );
}
