// /auditions — RESTARTED FROM CONCEPT (2026-06-14). The old blind-audition snapshot is archived
// (docs/flavors/auditions_deprecated/); this URL is now the CLEAN audition slate for the new
// method: the same audience (anxiety · ADHD · low self-worth + a thrill repel-control) judges
// every step via the blind fleet. First up: the CONCEPT AUDITION. NOT canon.
import concepts from "./concepts.json";
import pilot from "./pilot.json";

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
// the SCORING SYSTEM (§8.17): panel mean + AGREEMENT (the spread), demand ⟂ supply, traceable
const spread = (i: number, key: "relate" | "feelsSafe") => { const vs = TARGET.map((p) => get(p, i)?.[key] ?? 0); return Math.max(...vs) - Math.min(...vs); };
const agree = (s: number) => (s <= 1 ? "agreed" : s <= 2 ? "mixed" : "split");
const agreeCol = (s: number) => (s <= 1 ? "var(--forest)" : s <= 2 ? "#c08a2e" : "var(--spot-red)");
const LEGV: Record<string, number> = { "load-bearing": 2, hairline: 1, hollow: 0 };
const legMean = (i: number) => { const vs = LEG_EXPERTS.map((e) => LEGV[getLeg(e, i)?.canBuild ?? "hollow"]); return vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 0; };
// ── PHASE 2 · the PILOT audition (its own data, same scoring) ──
type AudReadP = { index: number; relate: number; feelsSafe: number; wouldPlay: boolean; why: string; feeling: string };
type PilotData = { pilots: { id: string; title: string; tone: string; scene: string }[]; results: Record<string, AudReadP[]>; legs: Record<string, Leg[]> };
const P = pilot as PilotData;
const getP = (p: string, i: number) => (P.results[p] || []).find((r) => r.index === i);
const avgP = (i: number, k: "relate" | "feelsSafe") => TARGET.reduce((s, p) => s + (getP(p, i)?.[k] ?? 0), 0) / TARGET.length;
const spreadP = (i: number, k: "relate" | "feelsSafe") => { const v = TARGET.map((p) => getP(p, i)?.[k] ?? 0); return Math.max(...v) - Math.min(...v); };
const PLEGS = Object.keys(P.legs || {});
const getLegP = (e: string, i: number) => (P.legs[e] || []).find((r) => r.index === i);
const legMeanP = (i: number) => { const v = PLEGS.map((e) => LEGV[getLegP(e, i)?.canBuild ?? "hollow"]); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
const labelize = (s: string) => s.replace(/_/g, " ");
// ⭐ BUILD-VALUE star — the scores weighted by importance to OUR MECHANICS: the coach (destination),
// the struggle loop, and the anxiety floor (safe) weigh heaviest; flavor (motif) least. §8.17.
const SW: Record<string, number> = { feelsSafe: 3, destination: 3, struggle: 3, relate: 2, mechanics: 2, cast: 1.5, cast_voice: 1.5, sustain: 1.5, motif_title: 1 };
const LEGV01: Record<string, number> = { "load-bearing": 1, hairline: 0.5, hollow: 0 };
const starScore = (relate: number, safe: number, legs: { key: string; cb: string }[]) => {
  let num = SW.relate * (relate / 5) + SW.feelsSafe * (safe / 5), den = SW.relate + SW.feelsSafe;
  for (const { key, cb } of legs) { const w = SW[key] ?? 1; num += w * (LEGV01[cb] ?? 0); den += w; }
  return Math.round((num / den) * 10) / 2;
};
const starStr = (n: number) => "★".repeat(Math.floor(n)) + (n % 1 ? "½" : "") + "☆".repeat(Math.max(0, 5 - Math.ceil(n)));
const StarLine = ({ s }: { s: number }) => (<div style={{ fontSize: 15, color: "#c08a2e", letterSpacing: 1, marginTop: 1 }}>{starStr(s)} <span style={{ fontSize: 10.5, color: margin, letterSpacing: 0 }}>{s.toFixed(1)} build-value</span></div>);

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)", red = "var(--spot-red)";

export default function AuditionsPage() {
  // rank by relate+safe; the winner gets the crown
  const ranked = D.concepts.map((c, k) => ({ c, i: k + 1, score: +avg(k + 1, "relate") + +avg(k + 1, "feelsSafe") })).sort((a, b) => b.score - a.score);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "26px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ fontSize: 25, margin: 0, color: ink }}>Auditions</h1>
        <span style={{ fontSize: 10.5, letterSpacing: ".12em", color: red, fontFamily: "var(--theme-body)", fontWeight: 700 }}>RESTARTED FROM CONCEPT · NOT CANON</span>
      </div>
      <div style={{ border: `2px solid ${forest}`, background: paper, padding: "13px 16px", margin: "14px 0 18px" }}>
        <div style={{ fontFamily: "var(--theme-body)", fontSize: 12.5, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 6 }}>ELI5 — the short version</div>
        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: ink, margin: "0 0 8px" }}>
          We&apos;re choosing what cozy game to build, judged two ways: the <b>players who need it</b> (anxious · ADHD · low self-worth) and the <b>team who&apos;d build it</b>. Every idea is genuinely good — so instead of crowning one, we list what each does <span style={{ color: forest, fontWeight: 700 }}>great (↑ reinforce later)</span> and what it&apos;ll <span style={{ color: "#c08a2e", fontWeight: 700 }}>need fixed later (◆ the gem)</span>. The <b style={{ color: "#c08a2e" }}>⭐ build-value</b> is the one-glance score, weighted by what matters most to the actual game: the <b>coach</b>, the <b>struggle loop</b>, and the <b>safety floor</b> weigh heaviest.
        </p>
        <ul style={{ fontSize: 12, lineHeight: 1.55, color: ink, margin: "0 0 6px", paddingLeft: 18 }}>
          <li style={{ marginBottom: 3 }}><b>Cloudhouse ★★★★½</b> &amp; <b>Lighthouse ★★★★½</b> — both excellent and easy to build. Cloudhouse = the <i>safest, gentlest</i> (fix: make the coach an <i>active partner</i>, not a passive fortune-teller). Lighthouse = the <i>most buildable</i> (fix: &ldquo;tending a light&rdquo; reads as a <i>duty</i> to ADHD players — frame it as <i>permission</i>).</li>
          <li style={{ marginBottom: 3 }}><b>Ferry ★★★★</b> — the <i>crowd favorite</i> (everyone feels &ldquo;finally, permission to rest&rdquo;), but the <i>hardest to build</i> (its whole point is &ldquo;letting go,&rdquo; tricky to make into gameplay). The fix is already found: the <i>&ldquo;logged at full weight&rdquo;</i> ritual.</li>
          <li><b>The Ferry&apos;s tone:</b> the wry <i>manifest-keeper who logs your day at full weight</i> <b>★★★★★</b> won — it validates you without asking anything back. (The over-warm &ldquo;sit, here&apos;s your bowl&rdquo; version <b>★★★½</b> felt like social pressure.)</li>
        </ul>
        <p style={{ fontSize: 11, color: margin, fontStyle: "italic", margin: 0 }}>The full scores, agreement, and reviewer notes are below — this is just the gist.</p>
      </div>
      <div style={{ border: `2px solid ${ink}`, background: shade, padding: "10px 14px", fontSize: 12.5, lineHeight: 1.55, color: ink, margin: "12px 0 22px" }}>
        The old per-step blind auditions are <b>archived</b> (<code>docs/flavors/auditions_deprecated/</code>) — the model changed too much. We <b>restarted from concept</b> with the <b>blind audience fleet</b>: the SAME audience (anxiety · ADHD · low self-worth) judges every step — <i>relate · feels-safe · expectation-fit · the repel-gate</i>. Harness: <code>tools/title-test/</code>.
      </div>

      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", color: forest, marginBottom: 4 }}>① THE CONCEPT AUDITION — Phase 0c</div>
      <p style={{ fontSize: 12.5, color: soft, margin: "0 0 12px" }}>Three candidates, read <b>both ways</b> (§8.10): the <b>AUDIENCE</b> (does it resonate? — demand) <i>and</i> the <b>LOOK-AHEAD experts</b> from every succeeding step (could they build on it? — supply). The legs are <b>forward NOTES</b> — suggestions the upcoming steps refer back to, <i>never a veto</i>; the real discovery happens when each step is actually built.</p>
      <div style={{ border: `1px dashed var(--ink-soft)`, background: paper, padding: "9px 12px", fontSize: 11, color: soft, lineHeight: 1.55, margin: "0 0 16px" }}>
        <b style={{ color: forest }}>HOW IT&apos;S SCORED (§8.17 — not &ldquo;trust me bro&rdquo;)</b> — anchored rubric (relate/safe <b>0–5</b>: 0 not-for-me/ambush · 4 safe-and-for-me · 5 deeply). A <b>panel</b> of 4 audience reviewers + the legs, each with a <b>why</b>. The score is the panel <b>mean</b>; <b>agreement</b> = the spread (<span style={{ color: forest }}>agreed</span> ≤1 · <span style={{ color: "#c08a2e" }}>mixed</span> ≤2 · <span style={{ color: red }}>split</span> &gt;2). Demand (audience) and supply (legs) stay separate. <b>No pick</b> — every candidate is good; each is profiled by its <span style={{ color: forest }}>strengths</span> (<b>↑ reinforce</b>: load-bearing legs + high agreed audience, amplified by a later step) and its <span style={{ color: "#c08a2e" }}>gems</span> (<b>◆ fix</b>: hairline/hollow legs + audience flags/splits — the weaknesses a later step gets to fix, the seed pointing the way). <b>The weakness is the gem.</b> Every number traces to the reviewers below.
      </div>

      {ranked.map(({ c, i }) => {
        const thr = get("thrill_seeker", i);
        return (
          <section key={c.id} style={{ border: `2px solid var(--ink-soft)`, background: paper, marginBottom: 16, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "var(--theme-body)", fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", color: soft }}>{c.t1}</div>
                <div style={{ fontFamily: "var(--theme-display)", fontSize: 22, color: ink }}>{c.t2}</div>
                <StarLine s={starScore(+avg(i, "relate"), +avg(i, "feelsSafe"), LEG_EXPERTS.map((e) => ({ key: e, cb: getLeg(e, i)?.canBuild ?? "hollow" })))} />
              </div>
              <div style={{ textAlign: "right", fontSize: 11.5, minWidth: 158 }}>
                {(() => {
                  const sr = spread(i, "relate"), ss = spread(i, "feelsSafe"), lm = legMean(i), repelHeld = !thr?.wouldPlay;
                  const nLB = LEG_EXPERTS.filter((e) => getLeg(e, i)?.canBuild === "load-bearing").length;
                  const nGem = (LEG_EXPERTS.length - nLB) + TARGET.filter((p) => (get(p, i)?.feelsSafe ?? 5) < 4 || (get(p, i)?.relate ?? 5) < 3).length + (repelHeld ? 0 : 1);
                  return (<>
                    <div>relate <b style={{ color: ink }}>{avg(i, "relate")}</b> <span style={{ color: agreeCol(sr), fontSize: 10 }}>· {agree(sr)}</span></div>
                    <div>safe <b style={{ color: ink }}>{avg(i, "feelsSafe")}</b> <span style={{ color: agreeCol(ss), fontSize: 10 }}>· {agree(ss)}</span></div>
                    <div style={{ fontSize: 10.5, color: margin }}>legs <b style={{ color: ink }}>{lm.toFixed(1)}</b>/2 · repel {repelHeld ? <span style={{ color: forest }}>held</span> : <span style={{ color: red }}>tapped</span>}</div>
                    <div style={{ fontWeight: 700, marginTop: 2, fontSize: 10.5 }}><span style={{ color: forest }}>↑{nLB} reinforce</span> · <span style={{ color: "#c08a2e" }}>◆{nGem} gems</span></div>
                  </>);
                })()}
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: ink, margin: "8px 0 4px", lineHeight: 1.5 }}>{c.world}</p>
            <p style={{ fontSize: 11.5, color: soft, margin: "0 0 10px", lineHeight: 1.5 }}><b style={{ color: forest }}>gift</b> — {c.gift}</p>
            <div style={{ borderTop: `1px solid var(--ink-soft)`, paddingTop: 8, fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, fontFamily: "var(--theme-body)" }}>↘ THE AUDIENCE · WHY THEY SCORED IT</div>
            <div style={{ marginTop: 5, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "7px 14px" }}>
              {TARGET.map((p) => { const r = get(p, i); if (!r) return null; return (
                <div key={p} style={{ fontSize: 11, color: soft, lineHeight: 1.45, borderLeft: `2px solid var(--ink-soft)`, paddingLeft: 8 }}>
                  <div><b style={{ color: margin }}>{PLABEL[p]}</b> <span style={{ color: ink, fontWeight: 700 }}>r{r.relate}/s{r.feelsSafe}</span> <span style={{ color: margin, fontStyle: "italic" }}>· {r.feeling}</span></div>
                  <div style={{ color: ink }}>{r.expectExperience}</div>
                </div> ); })}
            </div>
            {LEG_EXPERTS.length > 0 && (
              <div style={{ borderTop: `1px solid var(--ink-soft)`, marginTop: 8, paddingTop: 8 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, fontFamily: "var(--theme-body)", marginBottom: 6 }}>↗ THE LEGS · FORWARD NOTES FROM THE SUCCEEDING STEPS <span style={{ fontWeight: 400, fontStyle: "italic" }}>(advisory · suggestions, never a veto)</span></div>
                <div style={{ display: "grid", gap: 7 }}>
                  {LEG_EXPERTS.map((e) => { const r = getLeg(e, i); if (!r) return null; const col = legColor(r.canBuild); return (
                    <div key={e} style={{ fontSize: 11, lineHeight: 1.5, borderLeft: `2px solid ${col}`, paddingLeft: 8 }}>
                      <span style={{ fontFamily: "var(--theme-body)", fontWeight: 700, color: col }}>{LEG_LABEL[e]}</span>
                      <span style={{ fontSize: 9, color: col, border: `1px solid ${col}`, borderRadius: 3, padding: "0 5px", marginLeft: 6 }}>{r.canBuild}</span>
                      <div style={{ color: ink, marginTop: 1 }}>{r.explanation}</div>
                      <div style={{ color: margin, fontStyle: "italic", fontSize: 10.5 }}>opens {r.opens} · forecloses {r.forecloses} · <b style={{ color: forest, fontStyle: "normal" }}>seed</b> {r.seed}</div>
                    </div> ); })}
                </div>
              </div>
            )}
          </section>
        );
      })}

      <div style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", color: forest, margin: "28px 0 4px" }}>② THE PILOT AUDITION — the tone gate · concept: <span style={{ color: ink }}>THE FERRY</span></div>
      <p style={{ fontSize: 12.5, color: soft, margin: "0 0 16px" }}>One first crossing, three tones. Same scoring (§8.17): the audience (demand) + the legs that build on the tone (destination · struggle · cast-voice · sustain).</p>
      {P.pilots.map((pl, k) => {
        const i = k + 1, sr = spreadP(i, "relate"), ss = spreadP(i, "feelsSafe"), lm = legMeanP(i);
        const thr = getP("thrill_seeker", i), repelHeld = !thr?.wouldPlay;
        const nLB = PLEGS.filter((e) => getLegP(e, i)?.canBuild === "load-bearing").length;
        const nGem = (PLEGS.length - nLB) + TARGET.filter((p) => (getP(p, i)?.feelsSafe ?? 5) < 4 || (getP(p, i)?.relate ?? 5) < 3).length + (repelHeld ? 0 : 1);
        return (
          <section key={pl.id} style={{ border: `2px solid var(--ink-soft)`, background: paper, marginBottom: 16, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div><div style={{ fontFamily: "var(--theme-display)", fontSize: 20, color: ink }}>{pl.title}</div><div style={{ fontSize: 11, color: margin, fontStyle: "italic" }}>tone: {pl.tone}</div><StarLine s={starScore(avgP(i, "relate"), avgP(i, "feelsSafe"), PLEGS.map((e) => ({ key: e, cb: getLegP(e, i)?.canBuild ?? "hollow" })))} /></div>
              <div style={{ textAlign: "right", fontSize: 11.5, minWidth: 150 }}>
                <div>relate <b style={{ color: ink }}>{avgP(i, "relate").toFixed(1)}</b> <span style={{ color: agreeCol(sr), fontSize: 10 }}>· {agree(sr)}</span></div>
                <div>safe <b style={{ color: ink }}>{avgP(i, "feelsSafe").toFixed(1)}</b> <span style={{ color: agreeCol(ss), fontSize: 10 }}>· {agree(ss)}</span></div>
                <div style={{ fontSize: 10.5, color: margin }}>legs <b style={{ color: ink }}>{lm.toFixed(1)}</b>/2 · repel {repelHeld ? <span style={{ color: forest }}>held</span> : <span style={{ color: red }}>tapped</span>}</div>
                <div style={{ fontWeight: 700, marginTop: 2, fontSize: 10.5 }}><span style={{ color: forest }}>↑{nLB} reinforce</span> · <span style={{ color: "#c08a2e" }}>◆{nGem} gems</span></div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: ink, margin: "8px 0", lineHeight: 1.55, fontStyle: "italic" }}>{pl.scene}</p>
            <div style={{ borderTop: `1px solid var(--ink-soft)`, paddingTop: 8, fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, fontFamily: "var(--theme-body)" }}>↘ THE AUDIENCE · WHY</div>
            <div style={{ marginTop: 5, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "7px 14px" }}>
              {TARGET.map((p) => { const r = getP(p, i); if (!r) return null; return (
                <div key={p} style={{ fontSize: 11, color: soft, lineHeight: 1.45, borderLeft: `2px solid var(--ink-soft)`, paddingLeft: 8 }}>
                  <div><b style={{ color: margin }}>{PLABEL[p]}</b> <span style={{ color: ink, fontWeight: 700 }}>r{r.relate}/s{r.feelsSafe}</span></div>
                  <div style={{ color: ink }}>{r.why}</div>
                </div> ); })}
            </div>
            <div style={{ borderTop: `1px solid var(--ink-soft)`, marginTop: 8, paddingTop: 8, fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, fontFamily: "var(--theme-body)" }}>↗ THE LEGS · FORWARD NOTES</div>
            <div style={{ marginTop: 6, display: "grid", gap: 7 }}>
              {PLEGS.map((e) => { const r = getLegP(e, i); if (!r) return null; const col = legColor(r.canBuild); return (
                <div key={e} style={{ fontSize: 11, lineHeight: 1.5, borderLeft: `2px solid ${col}`, paddingLeft: 8 }}>
                  <span style={{ fontFamily: "var(--theme-body)", fontWeight: 700, color: col }}>{labelize(e)}</span> <span style={{ fontSize: 9, color: col, border: `1px solid ${col}`, borderRadius: 3, padding: "0 5px", marginLeft: 6 }}>{r.canBuild}</span>
                  <div style={{ color: ink, marginTop: 1 }}>{r.explanation}</div>
                  <div style={{ color: margin, fontStyle: "italic", fontSize: 10.5 }}>↳ seed: {r.seed}</div>
                </div> ); })}
            </div>
          </section>
        );
      })}
      <div style={{ border: `1px dashed var(--ink-soft)`, background: shade, padding: "11px 14px", fontSize: 12, color: margin, marginTop: 8 }}>
        <b style={{ color: forest }}>NEXT</b> — no tone is &ldquo;picked&rdquo;; their profiles carry forward. The wry-affirming <i>witness</i> strength (all legs load-bearing) feeds the <b>DESTINATION</b> + the <b>STRUGGLE</b> (the internal letting-go, logged at full weight); the warm tone&apos;s gem (belonging read as a social demand) is the fix to mine when those beats are authored. The next step&apos;s audition fills in here.
      </div>
    </main>
  );
}
