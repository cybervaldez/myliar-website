// THE WORLD CLOCK — the world's off-cam state across one crossing: the ENVIRONMENT each phase (the frozen
// world-moment dialed to the night) + where the whole crew ARE, GROUNDED in that environment. The day-author
// consults it to place characters organically, ground cross-talk in real co-presence, and ground the prose's
// mood in the weather. The world-moment is FROZEN per door; the HORIZON lite-references the neighbouring
// moments at the edges (early days = from, final days = toward), never entered. Anchored to the outline's
// day-grid. Lives on the day pages (+ a door overview on the outline). From character-grid.mjs. NOT canon.

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", amber = "#c08a2e", violet = "#7a5b9a", red = "var(--spot-red)", paper = "var(--paper)", shade = "var(--paper-shade)";

type World = { sea?: string; light?: string; air?: string; motion?: string; sound?: string } | string;
export type WorldClockT = {
  crossing?: { phase?: string; world?: World; where?: { who?: string; at?: string; doing?: string; with?: string[]; preoccupied?: string }[] }[];
  threads?: { who?: string; offCam?: string; arcStage?: string }[];
  interlocks?: { phase?: string; who?: string[]; what?: string }[];
  onScreenCues?: { who?: string; naturalEntrance?: string }[];
  horizon?: { from?: string; toward?: string };
};
export type DayAnchorT = { n?: number; phase?: string; bpm?: number; relTier?: string; premise?: string };

const ENVICON: Record<string, string> = { sea: "🌊", light: "☀", air: "🌬", motion: "⛵", sound: "🔊" };
function envLine(w?: World) {
  if (!w) return null;
  if (typeof w === "string") return <span>{w}</span>;
  return <>{(["sea", "light", "air", "motion", "sound"] as const).map((k) => w[k] ? <span key={k} style={{ marginRight: 9 }}><span title={k} style={{ opacity: 0.7 }}>{ENVICON[k]}</span> {w[k]}</span> : null)}</>;
}

export function WorldClock({ clock, dayAnchor, horizonSide }: { clock?: WorldClockT; dayAnchor?: DayAnchorT; horizonSide?: "from" | "toward" }) {
  if (!clock?.crossing?.length) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 16, color: ink, margin: "0 0 2px" }}>🕯 THE WORLD CLOCK <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— the off-cam state of the world across the crossing</span></h2>
      <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 10px" }}>The <b>environment</b> each phase (the frozen world-moment dialed to the night) and where the whole crew <b>are</b>, grounded in it. The day-author grounds the prose&rsquo;s mood + the crew&rsquo;s behaviour in this; most never reaches the page. The world-moment stays <b>frozen</b> — the horizon only hints at the neighbours.</p>

      {/* the day anchor (from the outline) */}
      {dayAnchor?.n != null && (
        <div style={{ fontSize: 10, color: soft, border: `1px solid var(--ink-soft)`, background: paper, padding: "5px 10px", marginBottom: 8 }}>
          ⚓ <b style={{ color: forest }}>anchored to the outline</b> — Day {dayAnchor.n}{dayAnchor.phase ? ` · ${dayAnchor.phase}` : ""}{dayAnchor.relTier ? ` · ${dayAnchor.relTier}` : ""}{dayAnchor.bpm ? ` · bpm ~${dayAnchor.bpm}` : ""}{dayAnchor.premise ? <span style={{ color: margin }}> — {dayAnchor.premise}</span> : null}
        </div>
      )}

      {/* the crossing — environment + crew */}
      <div style={{ border: `2px solid ${forest}`, background: shade, padding: "9px 12px" }}>
        {clock.crossing.map((ph, i) => (
          <div key={i} style={{ marginBottom: i < clock.crossing!.length - 1 ? 9 : 0, paddingBottom: i < clock.crossing!.length - 1 ? 8 : 0, borderBottom: i < clock.crossing!.length - 1 ? `1px dashed var(--ink-soft)` : "none" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: amber, textTransform: "uppercase", marginBottom: 3 }}>🌙 {ph.phase}</div>
            {ph.world && <div style={{ fontSize: 9.5, color: "#4a6b8a", lineHeight: 1.5, marginBottom: 4, paddingLeft: 4 }}>{envLine(ph.world)}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "2px 12px" }}>
              {(ph.where || []).map((w, j) => (
                <div key={j} style={{ fontSize: 10, color: soft, lineHeight: 1.5 }}>
                  <b style={{ color: ink }}>{w.who}</b> <span style={{ color: margin }}>@ {w.at}</span> — {w.doing}
                  {w.with?.length ? <span style={{ color: violet }}> (with {w.with.join(", ")})</span> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* the horizon — the surrounding range shifting (lite, never entered) */}
      {(clock.horizon?.from || clock.horizon?.toward) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 9 }}>
          {(["from", "toward"] as const).map((side) => clock.horizon?.[side] ? (
            <div key={side} style={{ fontSize: 9.5, color: margin, lineHeight: 1.5, border: `1px ${horizonSide === side ? "solid" : "dashed"} var(--ink-soft)`, padding: "5px 9px", background: horizonSide === side ? shade : "transparent", opacity: horizonSide && horizonSide !== side ? 0.5 : 1 }}>
              <b style={{ color: violet }}>{side === "from" ? "◂ the moment behind" : "the moment ahead ▸"}</b>{horizonSide === side ? <span style={{ color: forest }}> (this day)</span> : null}<br />{clock.horizon[side]}
            </div>
          ) : <div key={side} />)}
        </div>
      )}

      {/* interlocks (cross-talk seeds) + threads */}
      {!!clock.interlocks?.length && (
        <div style={{ marginTop: 9 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: margin, textTransform: "uppercase", marginBottom: 4 }}>the interlocks <span style={{ fontWeight: 400, textTransform: "none" }}>— co-presence (the cross-talk seeds)</span></div>
          {clock.interlocks.map((it, i) => (
            <div key={i} style={{ fontSize: 10, color: soft, lineHeight: 1.55, borderLeft: `2px solid ${red}`, paddingLeft: 9, marginBottom: 3 }}>
              <b style={{ color: ink }}>{(it.who || []).join(" ↔ ")}</b> <span style={{ color: margin }}>[{it.phase}]</span> — {it.what}
            </div>
          ))}
        </div>
      )}
      {!!clock.threads?.length && (
        <div style={{ marginTop: 9, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 7 }}>
          {clock.threads.map((t, i) => (
            <div key={i} style={{ border: `1px solid var(--ink-soft)`, background: paper, padding: "7px 10px" }}>
              <div style={{ fontSize: 10.5, color: ink, fontWeight: 700 }}>{t.who} <span style={{ fontSize: 9, color: violet, fontWeight: 400 }}>· off-cam thread</span></div>
              {t.offCam && <p style={{ fontSize: 9.5, color: soft, lineHeight: 1.45, margin: "2px 0 0" }}>{t.offCam}</p>}
            </div>
          ))}
        </div>
      )}
      {!!clock.onScreenCues?.length && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: "pointer", fontSize: 10, color: forest, fontWeight: 700, listStyle: "none" }}>▸ on-screen cues (organic entrances)</summary>
          <div style={{ marginTop: 4 }}>{clock.onScreenCues.map((c, i) => <div key={i} style={{ fontSize: 9.5, color: soft, lineHeight: 1.5 }}><b style={{ color: ink }}>{c.who}:</b> {c.naturalEntrance}</div>)}</div>
        </details>
      )}
    </section>
  );
}
