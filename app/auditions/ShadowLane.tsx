// THE SHADOW LANE + THE BPM CARRIER — the NEGATIVE direction of the achievement currency (a private,
// compassionate response to an avoidance STREAK) and the emotional carrier wave (the MC's pulse, transmitted
// to the player). Both safety-vetted. Lives on the door (outline) page. From shadow-lane.mjs. NOT canon.

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", violet = "#7a5b9a", red = "var(--spot-red)", paper = "var(--paper)", shade = "var(--paper-shade)";

export type ShadowLaneT = {
  watches?: string; reads?: string; noticer?: string; avoidedDomain?: string; theInvitation?: string;
  ignorable?: string; validRun?: string; relief?: { whenAccepted?: string; bpmDrop?: string; delivery?: string; felt?: string };
};
export type BpmCarrierT = { principle?: string; tensionOut?: string; reliefIn?: string; killed?: string; peaksOnly?: string };

export function ShadowLane({ lane, bpm }: { lane?: ShadowLaneT; bpm?: BpmCarrierT }) {
  if (!lane?.watches && !bpm?.principle) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 16, color: ink, margin: "0 0 2px" }}>🌒 THE SHADOW LANE <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— the negative direction of the currency, made safe</span></h2>
      <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 10px" }}>The stat trajectory <b>models the player</b>. An avoidance <b>streak</b> (observable behavior, not a spread-calc) compiles into a <b>private flag</b> — never a badge — that the narrative reads to offer <b>one compassionate, permanently-ignorable invitation</b>. The struggle this ferry exists to meet, met gently.</p>

      {lane?.watches && (
        <div style={{ border: `2px solid ${violet}`, background: shade, padding: "11px 13px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px", fontSize: 10, color: margin, marginBottom: 7 }}>
            <span>👁 <b style={{ color: violet }}>watches:</b> {lane.watches}</span>
            <span>📈 <b style={{ color: violet }}>reads:</b> {lane.reads}</span>
            {lane.avoidedDomain && <span>📊 <b style={{ color: violet }}>domain left low:</b> {lane.avoidedDomain}</span>}
          </div>
          {lane.noticer && <div style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, marginBottom: 6 }}>🫂 <b style={{ color: forest }}>the noticer:</b> {lane.noticer}</div>}
          {lane.theInvitation && (
            <div style={{ borderLeft: `3px solid ${forest}`, paddingLeft: 10, margin: "0 0 7px", fontSize: 12, color: ink, fontStyle: "italic", lineHeight: 1.55 }}>
              &ldquo;{lane.theInvitation}&rdquo;
              <div style={{ fontSize: 9, color: margin, fontStyle: "normal", marginTop: 2 }}>↳ lower-the-gangway: makes the avoided thing <b>safer to try</b>, never raises the stakes</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 7, fontSize: 9.5, color: soft, lineHeight: 1.5 }}>
            {lane.ignorable && <div style={{ background: paper, border: `1px solid var(--ink-soft)`, padding: "5px 8px" }}>🚪 <b style={{ color: forest }}>declining is honored forever:</b> {lane.ignorable}</div>}
            {lane.validRun && <div style={{ background: paper, border: `1px solid var(--ink-soft)`, padding: "5px 8px" }}>✓ <b style={{ color: forest }}>the over-specialized run is complete:</b> {lane.validRun}</div>}
          </div>
          {lane.relief && (
            <div style={{ fontSize: 9.5, color: margin, lineHeight: 1.5, marginTop: 7, borderTop: `1px dashed var(--ink-soft)`, paddingTop: 6 }}>
              💗 <b style={{ color: red }}>the relief (not the trigger) is what transmits</b> — {lane.relief.whenAccepted ? <span>{lane.relief.whenAccepted} · </span> : null}{lane.relief.felt}{lane.relief.bpmDrop ? <span style={{ color: violet }}> · the pulse settles: {lane.relief.bpmDrop}</span> : null}
            </div>
          )}
          <div style={{ fontSize: 8.5, color: margin, marginTop: 6, letterSpacing: ".02em" }}>FLOORS — private (never a badge) · diegetic not clinical · one-time not a nag · never gates the spine · serves autonomy, never engagement</div>
        </div>
      )}

      {bpm?.principle && (
        <div style={{ border: `1.5px solid ${red}`, background: paper, padding: "10px 13px", marginTop: 10 }}>
          <div style={{ fontSize: 12.5, color: ink, fontWeight: 700, marginBottom: 3 }}>💓 THE BPM CARRIER <span style={{ fontSize: 10, color: margin, fontWeight: 400 }}>— the MC&rsquo;s pulse, brought to the player</span></div>
          <p style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, margin: "0 0 6px" }}>{bpm.principle}</p>
          <div style={{ fontSize: 10, color: soft, lineHeight: 1.55 }}>
            {bpm.tensionOut && <div>🔺 <b style={{ color: red }}>tension out</b> (not through the body): {bpm.tensionOut}</div>}
            {bpm.reliefIn && <div>🫁 <b style={{ color: forest }}>relief in</b>: {bpm.reliefIn}</div>}
            {bpm.killed && <div style={{ color: margin, marginTop: 3 }}>✕ <b>killed:</b> {bpm.killed}</div>}
            {bpm.peaksOnly && <div style={{ color: margin }}>· {bpm.peaksOnly}</div>}
          </div>
        </div>
      )}
    </section>
  );
}
