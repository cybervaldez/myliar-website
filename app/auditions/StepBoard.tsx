// StepBoard — the shared renderer for ONE campaign's audition step. Top to bottom: the CARRIED
// FORWARD experts (the look-back within this story), the cross-story REFERENCE (how other stories
// solved this same step — the idea bank), then this step's candidates (⭐ build-value · scorecard ·
// the audience WHY · the legs' forward notes), then prev/next nav. §8.10/§8.17: no pick — strengths
// reinforce, gems fix.
import { type Item, type StepData, type Read, type SourceStudy, starStr, reason, avg, spread, legKeys, getLeg, legMean, star, targetOf, labelsOf, controlOf } from "./score";
import { AuditionPeek } from "./Scrubber";

type Nav = { href: string; label: string } | null;

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)", red = "var(--spot-red)", amber = "#c08a2e";
const agree = (s: number) => (s <= 1 ? "agreed" : s <= 2 ? "mixed" : "split");
const agreeCol = (s: number) => (s <= 1 ? forest : s <= 2 ? amber : red);
const legColor = (v: string) => (v === "load-bearing" ? forest : v === "hairline" ? amber : red);
const STATUS: Record<string, { txt: string; col: string }> = {
  building: { txt: "● PICKED — building", col: forest }, shipped: { txt: "● shipped", col: forest },
  available: { txt: "○ in the bank — revivable", col: margin }, retired: { txt: "✕ retired", col: red },
};

export type Primer = { tldr: string; whatFor: string; impact: string; howToChoose: string; mechanic?: string; craft?: string };

export default function StepBoard({ stepLabel, intro, whyPicked, primer, prepend, sourceStudy, data, items, carried, status, reference, prev, next, pickedKey, gatedBy }: {
  stepLabel: string; intro: string; whyPicked?: { text?: string; pending?: boolean }; primer?: Primer; prepend?: React.ReactNode; sourceStudy?: SourceStudy; data: StepData; items: Item[];
  carried?: { step: string; lines: string[] }[]; status?: Record<string, string>;
  reference?: { campaign: string; label: string; title: string; star: number }[]; prev?: Nav; next?: Nav; pickedKey?: string; gatedBy?: string;
}) {
  const LEGK = legKeys(data);
  const get = (p: string, i: number) => (data.results[p] || []).find((r) => r.index === i);
  const navLink = (n: Nav, dir: string) => n ? <a href={n.href} style={{ color: forest, fontWeight: 700, textDecoration: "none" }}>{dir === "prev" ? "← " : ""}{n.label}{dir === "next" ? " →" : ""}</a> : <span style={{ color: margin }}>{dir === "prev" ? "← back" : "next: tbd →"}</span>;
  // PICK-FIRST: when the pick is known, only the PICKED candidate gets its full section; the runner-ups
  // collapse into the "see the audition" modal (no context pollution). Otherwise all show (fallback).
  const sorted = items.slice().sort((a, b) => star(data, b.idx) - star(data, a.idx));
  const pickedItem = pickedKey ? sorted.find((it) => it.key === pickedKey) : undefined;
  const shown = pickedItem ? sorted.filter((it) => it.key === pickedKey) : sorted;
  const auditionCands = pickedItem ? sorted.map((it) => ({ name: it.title, fit: `${star(data, it.idx).toFixed(1)}★`, note: it.sub, detail: it.body, mono: it.mono, picked: it.key === pickedKey })) : [];

  return (
    <main className="aud-main" style={{ padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
        <a href="/auditions" style={{ color: margin, textDecoration: "none" }}>↑ the board</a>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: red, fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 24, margin: "0 0 4px", color: ink }}>{stepLabel}</h1>
      <p className="aud-prose" style={{ fontSize: 12.5, color: soft, lineHeight: 1.55, margin: "0 0 12px" }}>{intro}</p>

      <div className="aud-digest" style={{ border: `2px solid ${forest}`, background: shade, padding: "8px 13px", margin: "0 0 14px", fontSize: 11, color: ink, lineHeight: 1.5 }}>
        <span style={{ fontFamily: "var(--theme-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: forest }}>▣ BUILD-CONTEXT</span> <b>{stepLabel.replace(/^[①②③④⑤⑥•]\s*/, "").replace(/ ·.*/, "")}</b>{pickedItem ? <> · pick <b style={{ color: forest }}>“{pickedItem.title}”</b> <span style={{ color: amber }}>{star(data, pickedItem.idx).toFixed(1)}★</span> · {auditionCands.length - 1} runner-up{auditionCands.length - 1 === 1 ? "" : "s"} in the modal</> : ` · ${shown.length} in audition`}{gatedBy ? ` · ${gatedBy}` : ""}
      </div>

      {/* §8.19 — every PICKED step ships an ELI5 "why this won" (distinct from the primer's "what is this step") */}
      {whyPicked?.text && (
        <div style={{ border: `2px solid ${forest}`, background: shade, padding: "10px 14px", margin: "0 0 14px" }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: forest, marginBottom: 4 }}>✓ WHY THIS WAS PICKED · ELI5</div>
          <div style={{ fontSize: 12.5, color: ink, lineHeight: 1.6 }}>{whyPicked.text}</div>
        </div>
      )}
      {whyPicked?.pending && (
        <div style={{ border: `1px dashed var(--ink-soft)`, background: paper, padding: "8px 14px", margin: "0 0 14px", fontSize: 11, color: margin, fontStyle: "italic", lineHeight: 1.5 }}>
          ○ <b style={{ fontStyle: "normal" }}>why-picked — pending:</b> no pick yet (still finding the rhythm). When a candidate is chosen, its ELI5 “why this won” lands here (§8.19, hard rule).
        </div>
      )}

      <div className="aud-body">
        <div className="aud-meat">
      {prepend}

      {pickedItem && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "0 0 10px" }}>
          <span style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", color: forest }}>✓ THE AUTOPICK — full audition below; {auditionCands.length - 1} runner-up{auditionCands.length - 1 === 1 ? "" : "s"} in the modal →</span>
          <AuditionPeek label={stepLabel.replace(/^[①②③④⑤⑥•]\s*/, "").replace(/ ·.*/, "")} candidates={auditionCands} why={whyPicked?.text} gatedBy={gatedBy} />
        </div>
      )}
      {shown.map((it) => {
        const i = it.idx, sr = spread(data, i, "relate"), ss = spread(data, i, "feelsSafe"), lm = legMean(data, i), thr = get(controlOf(data), i), repelHeld = !thr?.wouldPlay;
        const nLB = LEGK.filter((e) => getLeg(data, e, i)?.canBuild === "load-bearing").length;
        const nGem = (LEGK.length - nLB) + targetOf(data).filter((p) => (get(p, i)?.feelsSafe ?? 5) < 4 || (get(p, i)?.relate ?? 5) < 3).length + (repelHeld ? 0 : 1);
        return (
          <section key={it.key} style={{ border: `2px solid var(--ink-soft)`, background: paper, marginBottom: 16, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                {status?.[it.key] && STATUS[status[it.key]] && (
                  <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", color: STATUS[status[it.key]].col, marginBottom: 1 }}>{STATUS[status[it.key]].txt}</div>
                )}
                <div style={{ fontFamily: "var(--theme-display)", fontSize: 21, color: ink }}>{it.title}</div>
                <div style={{ fontSize: 11, color: margin, fontStyle: "italic" }}>{it.sub}</div>
                <div style={{ fontSize: 15, color: amber, letterSpacing: 1, marginTop: 1 }}>{starStr(star(data, i))} <span style={{ fontSize: 10.5, color: margin, letterSpacing: 0 }}>{star(data, i).toFixed(1)} build-value</span></div>
              </div>
              <div style={{ textAlign: "right", fontSize: 11.5, minWidth: 150 }}>
                <div>relate <b style={{ color: ink }}>{avg(data, i, "relate").toFixed(1)}</b> <span style={{ color: agreeCol(sr), fontSize: 10 }}>· {agree(sr)}</span></div>
                <div>safe <b style={{ color: ink }}>{avg(data, i, "feelsSafe").toFixed(1)}</b> <span style={{ color: agreeCol(ss), fontSize: 10 }}>· {agree(ss)}</span></div>
                <div style={{ fontSize: 10.5, color: margin }}>legs <b style={{ color: ink }}>{lm.toFixed(1)}</b>/2 · repel {repelHeld ? <span style={{ color: forest }}>held</span> : <span style={{ color: red }}>tapped</span>}</div>
                <div style={{ fontWeight: 700, marginTop: 2, fontSize: 10.5 }}><span style={{ color: forest }}>↑{nLB} reinforce</span> · <span style={{ color: amber }}>◆{nGem} gems</span></div>
              </div>
            </div>
            <p style={{ fontSize: it.mono ? 11 : 12.5, color: ink, margin: "8px 0", lineHeight: it.mono ? 1.35 : 1.6, whiteSpace: it.mono ? "pre" : "pre-line", fontFamily: it.mono ? "ui-monospace, Menlo, monospace" : undefined, overflowX: it.mono ? "auto" : undefined }}>{it.body}</p>
            <div style={{ borderTop: `1px solid var(--ink-soft)`, paddingTop: 8, fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, fontFamily: "var(--theme-body)" }}>↘ THE AUDIENCE · WHY</div>
            <div style={{ marginTop: 5, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "7px 14px" }}>
              {targetOf(data).map((p) => { const r = get(p, i); if (!r) return null; return (
                <div key={p} style={{ fontSize: 11, color: soft, lineHeight: 1.45, borderLeft: `2px solid var(--ink-soft)`, paddingLeft: 8 }}>
                  <div><b style={{ color: margin }}>{labelsOf(data)[p] ?? p}</b> <span style={{ color: ink, fontWeight: 700 }}>r{r.relate}/s{r.feelsSafe}</span></div>
                  <div style={{ color: ink }}>{reason(r as Read)}</div>
                </div> ); })}
            </div>
            <div style={{ borderTop: `1px solid var(--ink-soft)`, marginTop: 8, paddingTop: 8, fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, fontFamily: "var(--theme-body)" }}>↗ THE LEGS · FORWARD NOTES</div>
            <div style={{ marginTop: 6, display: "grid", gap: 7 }}>
              {LEGK.map((e) => { const r = getLeg(data, e, i); if (!r) return null; const col = legColor(r.canBuild); return (
                <div key={e} style={{ fontSize: 11, lineHeight: 1.5, borderLeft: `2px solid ${col}`, paddingLeft: 8 }}>
                  <span style={{ fontFamily: "var(--theme-body)", fontWeight: 700, color: col }}>{e.replace(/_/g, " ")}</span> <span style={{ fontSize: 9, color: col, border: `1px solid ${col}`, borderRadius: 3, padding: "0 5px", marginLeft: 6 }}>{r.canBuild}</span>
                  <div style={{ color: ink, marginTop: 1 }}>{r.explanation}</div>
                  <div style={{ color: margin, fontStyle: "italic", fontSize: 10.5 }}>↳ seed: {r.seed}</div>
                </div> ); })}
            </div>
          </section>
        );
      })}
        </div>
        <aside className="aud-context">
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 8 }}>▣ BUILD-CONTEXT <span style={{ color: margin, fontWeight: 400, fontStyle: "italic" }}>— for the AI building this</span></div>

      {primer && (
        <details style={{ border: `2px solid ${forest}`, background: shade, margin: "0 0 14px", padding: "0" }}>
          <summary style={{ cursor: "pointer", listStyle: "none", padding: "10px 14px", fontFamily: "var(--theme-body)", fontSize: 11.5, fontWeight: 700, color: forest, letterSpacing: ".02em" }}>
            ▸ What is this step? — ELI5 <span style={{ color: margin, fontWeight: 400, fontStyle: "italic" }}>· {primer.tldr}</span>
          </summary>
          <div style={{ padding: "2px 14px 13px", display: "grid", gap: 8 }}>
            {([["What it’s for", primer.whatFor], ["How it shapes the story", primer.impact], ["How to pick the right one", primer.howToChoose]] as const).map(([h, body]) => (
              <div key={h} style={{ fontSize: 12, color: ink, lineHeight: 1.55 }}>
                <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin }}>{h.toUpperCase()}</div>
                {body}
              </div>
            ))}
            {primer.mechanic && (
              <div style={{ fontSize: 11.5, color: ink, lineHeight: 1.5, borderTop: `1px solid var(--ink-soft)`, paddingTop: 7 }}>
                <span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: forest }}>⚙ PLAYS TO (our mechanics)</span> {primer.mechanic}
              </div>
            )}
            {primer.craft && <div style={{ fontSize: 10.5, color: margin, fontStyle: "italic", lineHeight: 1.5, borderTop: `1px solid var(--ink-soft)`, paddingTop: 7 }}>{primer.craft}</div>}
          </div>
        </details>
      )}

      {sourceStudy && (
        <details style={{ border: `2px solid ${amber}`, background: paper, margin: "0 0 14px" }}>
          <summary style={{ cursor: "pointer", listStyle: "none", padding: "10px 14px", fontFamily: "var(--theme-body)", fontSize: 11.5, fontWeight: 700, color: amber, letterSpacing: ".02em" }}>
            📚 SOURCE STUDY — what made successful stories in this vein work <span style={{ color: margin, fontWeight: 400, fontStyle: "italic" }}>· studied before the summary (§8.18)</span>
            {sourceStudy.method && <span style={{ marginLeft: 6, fontSize: 9, color: sourceStudy.method === "deep-research" ? forest : margin, border: `1px solid ${sourceStudy.method === "deep-research" ? forest : margin}`, borderRadius: 3, padding: "0 5px" }}>{sourceStudy.method === "deep-research" ? "deep-research · verified" : "ultrathink · reasoned"}</span>}
            {sourceStudy.preliminary && <span style={{ marginLeft: 6, fontSize: 9, color: red, border: `1px solid ${red}`, borderRadius: 3, padding: "0 5px" }}>PRELIMINARY · verifying</span>}
          </summary>
          <div style={{ padding: "2px 14px 13px", fontSize: 12, color: ink, lineHeight: 1.55 }}>
            <div style={{ fontSize: 11, color: margin, fontStyle: "italic", marginBottom: 8 }}>the vein: {sourceStudy.vein}</div>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: margin, marginBottom: 4 }}>PRECEDENTS — WHAT MADE EACH WORK</div>
            <div style={{ display: "grid", gap: 5, marginBottom: 9 }}>
              {sourceStudy.works.map((w) => (
                <div key={w.title} style={{ borderLeft: `2px solid ${amber}`, paddingLeft: 8 }}><b>{w.title}</b> — {w.what}</div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, lineHeight: 1.5 }}><span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: forest }}>↳ BORROW</span> {sourceStudy.borrow.join(" · ")}</div>
            <div style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 5 }}><span style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: red }}>⚠ AVOID</span> {sourceStudy.avoid.join(" · ")}</div>
          </div>
        </details>
      )}

      {carried && carried.length > 0 && (
        <div style={{ border: `2px dashed ${forest}`, background: shade, padding: "11px 14px", margin: "0 0 14px" }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", color: forest, marginBottom: 5 }}>↩ CARRIED FORWARD — this story's previous experts (look-back)</div>
          {carried.map((c) => (
            <div key={c.step} style={{ fontSize: 11.5, color: ink, lineHeight: 1.5, marginBottom: 3 }}>
              <b style={{ color: margin }}>{c.step}</b> {c.lines.map((l, j) => <span key={j}>{j ? " · " : " "}{l}</span>)}
            </div>
          ))}
        </div>
      )}

      {reference && reference.length > 0 && (
        <div style={{ border: `2px dotted ${margin}`, background: paper, padding: "10px 14px", margin: "0 0 4px" }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", color: margin, marginBottom: 5 }}>▸ THIS STEP IN OTHER STORIES — the idea bank (reference, not a rule)</div>
          {reference.map((r) => (
            <div key={r.campaign} style={{ fontSize: 11.5, color: ink, lineHeight: 1.5 }}>
              <a href={`/auditions/${r.campaign}/`} style={{ color: forest, fontWeight: 700, textDecoration: "none" }}>{r.label}</a> picked <b>“{r.title}”</b> <span style={{ color: amber }}>{starStr(r.star)}</span>
            </div>
          ))}
        </div>
      )}
        </aside>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid var(--ink-soft)`, paddingTop: 12, marginTop: 8, fontSize: 13 }}>
        {navLink(prev ?? null, "prev")}{navLink(next ?? null, "next")}
      </div>
    </main>
  );
}
