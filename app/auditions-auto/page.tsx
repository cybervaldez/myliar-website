// /auditions-auto — DEPRECATED. The old single-tone automated flow is archived
// (tools/_deprecated/auditions-auto/). The audition pipeline restarted from concept with the
// blind audience-fleet method; the live slate is /auditions.
export const metadata = { title: "Auto Flow — deprecated", description: "The old automated audition flow is archived; the pipeline restarted from concept." };

export default function AutoFlowDeprecated() {
  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "60px 22px", textAlign: "center" }}>
      <div style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700, marginBottom: 12 }}>DEPRECATED</div>
      <h1 style={{ fontSize: 22, color: "var(--ink)", margin: "0 0 12px" }}>The automated flow is archived.</h1>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-soft)" }}>
        It ran the old single-tone model. The pipeline <b>restarted from concept</b> with the blind audience-fleet method —
        the live slate is now <a href="/auditions" style={{ color: "var(--forest)", fontWeight: 700 }}>/auditions</a>.
      </p>
    </main>
  );
}
