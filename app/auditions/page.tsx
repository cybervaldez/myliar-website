// /auditions — RESTARTED FROM CONCEPT (2026-06-14). The old blind-audition snapshot is archived
// (docs/flavors/auditions_deprecated/); this URL is now the CLEAN audition slate for the new
// method: the same audience (anxiety · ADHD · low self-worth + a thrill repel-control) judges
// every step via the blind fleet. First up: the CONCEPT AUDITION. NOT canon.
import concepts from "./concepts.json";

export const metadata = { title: "Auditions — restarted from concept", description: "The audition pipeline, restarted from concept with the blind audience-fleet method." };

type Read = { index: number; relate: number; feelsSafe: number; wouldPlay: boolean; expectExperience: string; feeling: string };
type Leg = { index: number; canBuild: "load-bearing" | "hairline" | "hollow"; explanation: string; opens: string; forecloses: string; seed: string };
type Data = { concepts: { id: string; t1: string; t2: string; world: string; gift: string }[]; results: Record<string, Read[]>; legs?: Record<string, Leg[]> };
const D = concepts as Data;
const TARGET = ["anxious", "low_worth", "adhd", "iyashikei_fan"];
const PLABEL: Record<string, string> = { anxious: "anxious", low_worth: "low self-worth", adhd: "ADHD", iyashikei_fan: "iyashikei fan", thrill_seeker: "thrill-seeker (control)" };
const get = (p: string, i: number) => (D.results[p] || []).find((r) => r.index === i);
const avg = (i: number, key: "relate" | "feelsSafe") => (TARGET.reduce((s, p) => s + (get(p, i)?.[key] ?? 0), 0) / TARGET.length).toFixed(1);
const LEG_EXPERTS = Object.keys(D.legs || {});
const LEG_LABEL: Record<string, string> = { destination: "destination", struggle: "struggle", cast: "cast", motif_title: "motif/title", mechanics: "mechanics" };
const getLeg = (e: string, i: number) => (D.legs?.[e] || []).find((r) => r.index === i);
const legColor = (v: string) => (v === "load-bearing" ? "var(--forest)" : v === "hairline" ? "#c08a2e" : "var(--spot-red)");

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)", red = "var(--spot-red)";

export default function AuditionsPage() {
  // rank by relate+safe; the winner gets the crown
  const ranked = D.concepts.map((c, k) => ({ c, i: k + 1, score: +avg(k + 1, "relate") + +avg(k + 1, "feelsSafe") })).sort((a, b) => b.score - a.score);
  const winnerId = ranked[0].c.id;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "26px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ fontSize: 25, margin: 0, color: ink }}>Auditions</h1>
        <span style={{ fontSize: 10.5, letterSpacing: ".12em", color: red, fontFamily: "var(--theme-body)", fontWeight: 700 }}>RESTARTED FROM CONCEPT · NOT CANON</span>
      </div>
      <div style={{ border: `2px solid ${ink}`, background: shade, padding: "10px 14px", fontSize: 12.5, lineHeight: 1.55, color: ink, margin: "12px 0 22px" }}>
        The old per-step blind auditions are <b>archived</b> (<code>docs/flavors/auditions_deprecated/</code>) — the model changed too much. We <b>restarted from concept</b> with the <b>blind audience fleet</b>: the SAME audience (anxiety · ADHD · low self-worth) judges every step — <i>relate · feels-safe · expectation-fit · the repel-gate</i>. Harness: <code>tools/title-test/</code>.
      </div>

      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", color: forest, marginBottom: 4 }}>① THE CONCEPT AUDITION — Phase 0c</div>
      <p style={{ fontSize: 12.5, color: soft, margin: "0 0 16px" }}>Three candidates, read <b>both ways</b> (§8.10): the <b>AUDIENCE</b> (does it resonate? — demand) <i>and</i> the <b>LOOK-AHEAD experts</b> from every succeeding step (could they build on it? — supply). The legs are <b>forward NOTES</b> — suggestions the upcoming steps refer back to, <i>never a veto</i>; the real discovery happens when each step is actually built.</p>

      {ranked.map(({ c, i }) => {
        const won = c.id === winnerId;
        const thr = get("thrill_seeker", i);
        return (
          <section key={c.id} style={{ border: `2px solid ${won ? forest : "var(--ink-soft)"}`, background: paper, marginBottom: 16, padding: "14px 16px", position: "relative" }}>
            {won && <span style={{ position: "absolute", top: -10, left: 14, background: forest, color: paper, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", padding: "2px 8px", fontFamily: "var(--theme-body)" }}>★ THE PICK</span>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "var(--theme-body)", fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", color: soft }}>{c.t1}</div>
                <div style={{ fontFamily: "var(--theme-display)", fontSize: 22, color: won ? forest : ink }}>{c.t2}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12 }}>
                <div>relate <b style={{ color: ink }}>{avg(i, "relate")}</b> · safe <b style={{ color: ink }}>{avg(i, "feelsSafe")}</b></div>
                <div style={{ fontSize: 11, color: margin }}>play {TARGET.filter((p) => get(p, i)?.wouldPlay).length}/4 · thrill repel {thr?.wouldPlay ? <span style={{ color: red }}>tapped ⚠</span> : <span style={{ color: forest }}>held ✓</span>}</div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: ink, margin: "8px 0 4px", lineHeight: 1.5 }}>{c.world}</p>
            <p style={{ fontSize: 11.5, color: soft, margin: "0 0 10px", lineHeight: 1.5 }}><b style={{ color: forest }}>gift</b> — {c.gift}</p>
            <div style={{ borderTop: `1px solid var(--ink-soft)`, paddingTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "4px 14px" }}>
              {TARGET.map((p) => { const r = get(p, i); if (!r) return null; return (
                <div key={p} style={{ fontSize: 11, color: soft, lineHeight: 1.4 }}>
                  <b style={{ color: margin }}>{PLABEL[p]}</b> <span style={{ color: ink }}>r{r.relate}/s{r.feelsSafe}</span> <i>{r.feeling}</i>
                </div> ); })}
            </div>
            {LEG_EXPERTS.length > 0 && (
              <div style={{ borderTop: `1px solid var(--ink-soft)`, marginTop: 8, paddingTop: 8 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, fontFamily: "var(--theme-body)", marginBottom: 5 }}>↗ FORWARD NOTES — could a later step build on it? <span style={{ fontWeight: 400, fontStyle: "italic" }}>(advisory · suggestions only — the real discovery is downstream)</span></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                  {LEG_EXPERTS.map((e) => { const r = getLeg(e, i); if (!r) return null; const col = legColor(r.canBuild); return (
                    <span key={e} style={{ fontSize: 10, border: `1px solid ${col}`, color: col, borderRadius: 4, padding: "1px 7px", fontFamily: "var(--theme-body)" }}>
                      {LEG_LABEL[e]} {r.canBuild === "load-bearing" ? "▰▰" : r.canBuild === "hairline" ? "▰▱" : "▱▱"}
                    </span> ); })}
                </div>
                <details style={{ fontSize: 11, color: soft }}>
                  <summary style={{ cursor: "pointer", color: margin, fontStyle: "italic", listStyle: "none" }}>▸ the notes (why — for the step that builds this)</summary>
                  <div style={{ marginTop: 5, display: "grid", gap: 5 }}>
                    {LEG_EXPERTS.map((e) => { const r = getLeg(e, i); if (!r) return null; return (
                      <div key={e} style={{ lineHeight: 1.45 }}>
                        <b style={{ color: legColor(r.canBuild) }}>{LEG_LABEL[e]}</b> <span style={{ color: ink }}>{r.explanation}</span> <span style={{ color: margin }}>↳ seed: {r.seed}</span>
                      </div> ); })}
                  </div>
                </details>
              </div>
            )}
          </section>
        );
      })}

      <div style={{ border: `1px dashed var(--ink-soft)`, background: shade, padding: "11px 14px", fontSize: 12, color: margin, marginTop: 8 }}>
        <b style={{ color: forest }}>NEXT</b> — Phase B authors one real story from the picked concept (manual), each step run through the same fleet. The script-by-step audition pages fill in here as they're run.
      </div>
    </main>
  );
}
