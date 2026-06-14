// /auditions-auto — the AUTOMATED flow run rendered step-by-step (the RENDER CONTRACT in
// practice). A full pre-campaign pipeline authored fully automatically (run_flow.mjs), so the
// owner can see every step's DR-bracket, the blind carry-over verdicts, and the auto-pick —
// a stress-test of the new flow + gate stickiness. NOT canon; the seed is bench fake data.
import flow from "./flow-auto.json";

export const metadata = { title: "Auto Flow — automated audition run", description: "A fully-automated pre-campaign pipeline run; DR-brackets + blind gates + auto-picks." };

type Exec = { dr: string; label: string; render: string; prose: string; opens: string; forecloses: string; verdict: string; gateNote: string; score: number };
type Step = { key: string; axis: string; lo: string; hi: string; executions: Exec[]; pickedDr: string; flag: string | null };
type Flow = { _doc: string; seed: string; steps: Step[] };

const F = flow as Flow;
const vcol = (v: string) => (v === "carried" ? "#3f8f3f" : v === "partial" ? "#c08a2e" : "var(--spot-red)");
const vico = (v: string) => (v === "carried" ? "✓" : v === "partial" ? "◐" : "✗");
const DRS = ["-1", "0", "+1"];

export default function AutoFlowPage() {
  const steps = F.steps ?? [];
  const strays = steps.reduce((n, s) => n + s.executions.filter((e) => e.verdict === "strayed").length, 0);
  const flags = steps.filter((s) => s.flag).length;
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 18px 80px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ fontSize: 25, margin: 0, color: "var(--ink)" }}>Auto Flow</h1>
        <span style={{ fontSize: 10.5, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>AUTOMATED · FAKE-SEEDED · NOT CANON</span>
      </div>
      <p style={{ color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.55, margin: "6px 0 14px", maxWidth: 640 }}>
        A full pre-campaign pipeline (concept → prelude) authored <b>fully automatically</b> to stress-test the new flow. Every step emits the <b>render contract</b>: a DR-bracket (−1 / 0 / +1), a <b>separate blind carry-over gate</b> on each execution, and an auto-pick (best carry-over; ties → the middle). Seed: <b>THE LANTERN</b> (bench fake data).
      </p>
      {steps.length > 0 && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", border: "2px solid var(--ink)", background: "var(--paper-shade)", padding: "10px 14px", marginBottom: 20, fontSize: 12.5 }}>
          <span><b>{steps.length}</b> steps run</span>
          <span style={{ color: vcol("strayed") }}><b>{strays}</b> strays caught by the gate</span>
          <span style={{ color: flags ? "var(--spot-red)" : "#3f8f3f" }}><b>{flags}</b> weak-flow flags</span>
          <span style={{ color: "var(--margin-ink)" }}>gate stickiness = the strays/flags it caught</span>
        </div>
      )}

      <details style={{ border: "1px dashed var(--ink-soft)", background: "var(--paper)", marginBottom: 18 }}>
        <summary style={{ cursor: "pointer", padding: "10px 13px", fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: "var(--ink-soft)", listStyle: "none" }}>▸ THE SEED (the starting negative)</summary>
        <p style={{ padding: "0 14px 13px", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-soft)", margin: 0 }}>{F.seed}</p>
      </details>

      {steps.length === 0 && <p style={{ color: "var(--margin-ink)", fontStyle: "italic" }}>The run is in progress — this fills in when it lands.</p>}

      {steps.map((s, i) => (
        <section key={s.key} style={{ border: "2px solid var(--ink)", background: "var(--paper)", marginBottom: 16 }}>
          <div style={{ padding: "11px 14px", borderBottom: "1px solid var(--ink-soft)", background: "var(--paper-shade)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontFamily: "var(--theme-display)", fontSize: 16, color: "var(--ink)" }}>{i + 1}. {s.key}</span>
              <span style={{ fontSize: 11, color: "var(--forest)" }}>picked <b>dr {s.pickedDr}</b></span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--margin-ink)", marginTop: 2 }}>scrub: <b>{s.axis}</b> · <i>{s.lo}</i> ◀──▶ <i>{s.hi}</i></div>
            {s.flag && <div style={{ fontSize: 11.5, color: "var(--spot-red)", fontWeight: 700, marginTop: 4 }}>⚑ {s.flag}</div>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0 }}>
            {DRS.map((dr) => {
              const e = s.executions.find((x) => x.dr === dr);
              if (!e) return <div key={dr} />;
              const picked = dr === s.pickedDr;
              return (
                <div key={dr} style={{ padding: "11px 13px", borderRight: "1px solid var(--ink-soft)", borderBottom: "1px solid var(--ink-soft)", background: picked ? "rgba(63,143,63,.07)" : "transparent", outline: picked ? "2px solid var(--forest)" : "none", outlineOffset: -2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "var(--margin-ink)" }}>DR {dr}{picked ? " · PICKED" : ""}</span>
                    <span style={{ color: vcol(e.verdict), fontSize: 10, fontWeight: 700, letterSpacing: ".06em" }}>{vico(e.verdict)} {e.verdict}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: "4px 0 3px" }}>{e.label}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)", fontStyle: "italic", marginBottom: 6 }}>{e.prose}</div>
                  {e.render && e.render !== e.prose && <div style={{ fontSize: 11, color: "var(--ink-soft)", fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "pre-wrap", marginBottom: 6 }}>{e.render}</div>}
                  <div style={{ fontSize: 11, lineHeight: 1.45, color: "var(--ink-soft)" }}>
                    <b style={{ color: "var(--forest)" }}>opens</b> {e.opens}<br /><b style={{ color: "var(--spot-red)" }}>forecloses</b> {e.forecloses}
                  </div>
                  {e.gateNote && <div style={{ fontSize: 10.5, lineHeight: 1.4, color: vcol(e.verdict), marginTop: 5, fontStyle: "italic" }}>gate: {e.gateNote}</div>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
