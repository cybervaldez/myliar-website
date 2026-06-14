// /auditions-auto — the AUTOMATED flow run rendered step-by-step (the RENDER CONTRACT in
// practice). A full pre-campaign pipeline authored fully automatically (run_flow.mjs), so the
// owner can see every step's DR-bracket, the blind carry-over verdicts, and the auto-pick —
// a stress-test of the new flow + gate stickiness. NOT canon; the seed is bench fake data.
import flow from "./flow-auto.json";

export const metadata = { title: "Auto Flow — automated audition run", description: "A fully-automated pre-campaign pipeline run; DR-brackets + blind gates + auto-picks." };

type Exec = { dr: string; label: string; render: string; prose: string; opens: string; forecloses: string; verdict: string; gateNote: string; scriptVerdict?: string; scriptNote?: string; score: number };
type Step = { key: string; phase?: string; axis: string; lo: string; hi: string; executions: Exec[]; pickedDr: string; flag: string | null };
type Phase = { phase: string; beat: string };
type Script = { environment: string; amplitude: string; phases: Phase[] };
type Flow = { _doc: string; seed: string; scripts?: Script[]; steps: Step[] };

const F = flow as Flow;
const vcol = (v: string) => (v === "carried" || v === "follows" ? "#3f8f3f" : v === "partial" || v === "drifts" ? "#c08a2e" : "var(--spot-red)");
const vico = (v: string) => (v === "carried" ? "✓" : v === "partial" ? "◐" : v === "strayed" ? "✗" : v === "follows" ? "✓" : v === "drifts" ? "◐" : "✗");
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
        The NEW model (flavors §8.14): <b>concept → SCRIPTS (multiple, one per surrounding environment) → the flow</b>, each step gated by <b>carry-over</b> (look-back) + the <b>SCRIPT EXPERT</b> (does it follow the script&apos;s DR arc at its phase?). Every step emits the render contract: a DR-bracket (−1 / 0 / +1), the blind gates, and an auto-pick. Seed: <b>THE KEEPER</b> (the coach all stories converge to).
      </p>
      {steps.length > 0 && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", border: "2px solid var(--ink)", background: "var(--paper-shade)", padding: "10px 14px", marginBottom: 20, fontSize: 12.5 }}>
          <span><b>{(F.scripts ?? []).length}</b> scripts (stories)</span>
          <span><b>{steps.length}</b> steps run</span>
          <span style={{ color: vcol("strayed") }}><b>{strays}</b> carry-over strays</span>
          <span style={{ color: vcol("strays") }}><b>{steps.reduce((n, s) => n + s.executions.filter((e) => e.scriptVerdict === "strays").length, 0)}</b> script strays</span>
          <span style={{ color: flags ? "var(--spot-red)" : "#3f8f3f" }}><b>{flags}</b> weak-flow flags</span>
        </div>
      )}

      <details style={{ border: "1px dashed var(--ink-soft)", background: "var(--paper)", marginBottom: 18 }}>
        <summary style={{ cursor: "pointer", padding: "10px 13px", fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: "var(--ink-soft)", listStyle: "none" }}>▸ THE SEED (the starting negative)</summary>
        <p style={{ padding: "0 14px 13px", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-soft)", margin: 0 }}>{F.seed}</p>
      </details>

      {(F.scripts ?? []).length > 0 && (
        <section style={{ border: "2px solid var(--forest)", background: "var(--paper-shade)", marginBottom: 18, padding: "12px 14px" }}>
          <div style={{ fontFamily: "var(--theme-display)", fontSize: 16, color: "var(--forest)", marginBottom: 2 }}>THE SCRIPTS — {(F.scripts ?? []).length} stories (one per surrounding environment)</div>
          <div style={{ fontSize: 11.5, color: "var(--margin-ink)", marginBottom: 10 }}>the same 5-phase DR arc realized in each environment — the player picks one by feeling; all converge to the Keeper.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {(F.scripts ?? []).map((sc) => (
              <div key={sc.environment} style={{ border: "1px solid var(--ink-soft)", background: "var(--paper)", padding: "9px 11px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>{sc.environment} <span style={{ fontSize: 10, color: "var(--margin-ink)", fontWeight: 400 }}>· amplitude {sc.amplitude}</span></div>
                {sc.phases.map((p) => (
                  <div key={p.phase} style={{ fontSize: 10.5, lineHeight: 1.45, color: "var(--ink-soft)", marginTop: 3 }}>
                    <b style={{ color: "var(--forest)", letterSpacing: ".04em" }}>{p.phase}</b> {p.beat}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {steps.length === 0 && <p style={{ color: "var(--margin-ink)", fontStyle: "italic" }}>The run is in progress — this fills in when it lands.</p>}

      {steps.map((s, i) => (
        <section key={s.key} style={{ border: "2px solid var(--ink)", background: "var(--paper)", marginBottom: 16 }}>
          <div style={{ padding: "11px 14px", borderBottom: "1px solid var(--ink-soft)", background: "var(--paper-shade)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontFamily: "var(--theme-display)", fontSize: 16, color: "var(--ink)" }}>{i + 1}. {s.key}{s.phase && <span style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "var(--forest)", border: "1px solid var(--forest)", borderRadius: 4, padding: "1px 6px", marginLeft: 8, verticalAlign: "middle" }}>phase {s.phase}</span>}</span>
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
                    <span style={{ display: "flex", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: ".04em" }}>
                      <span style={{ color: vcol(e.verdict) }} title="carry-over">{vico(e.verdict)} {e.verdict}</span>
                      {e.scriptVerdict && <span style={{ color: vcol(e.scriptVerdict) }} title="script expert (DR-arc fidelity)">◇ {e.scriptVerdict}</span>}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: "4px 0 3px" }}>{e.label}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)", fontStyle: "italic", marginBottom: 6 }}>{e.prose}</div>
                  {e.render && e.render !== e.prose && <div style={{ fontSize: 11, color: "var(--ink-soft)", fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "pre-wrap", marginBottom: 6 }}>{e.render}</div>}
                  <div style={{ fontSize: 11, lineHeight: 1.45, color: "var(--ink-soft)" }}>
                    <b style={{ color: "var(--forest)" }}>opens</b> {e.opens}<br /><b style={{ color: "var(--spot-red)" }}>forecloses</b> {e.forecloses}
                  </div>
                  {e.gateNote && <div style={{ fontSize: 10.5, lineHeight: 1.4, color: vcol(e.verdict), marginTop: 5, fontStyle: "italic" }}>carry: {e.gateNote}</div>}
                  {e.scriptNote && <div style={{ fontSize: 10.5, lineHeight: 1.4, color: vcol(e.scriptVerdict ?? "follows"), marginTop: 3, fontStyle: "italic" }}>script: {e.scriptNote}</div>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
