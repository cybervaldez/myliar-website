// THE DIRECTIONS — per door, where the MC and every featured character START and END across D1–7, then the
// shared D8+ growth PAYOFF. The MC is the SPINE (their weakness → outgrowing it); the cast climbs around them.
// Complements THE ARC (the day timeline) + the cast overhead (the general becoming): this is THIS door's
// concrete start→end. Lives in THE ARC section on the scene branch. NOT canon.

export type DoorArcT = {
  mc?: { weakness?: string; start?: string; end?: string; payoff?: string };
  cast?: { name: string; role?: string; start?: string; end?: string; payoff?: string }[];
  ensemble?: string;
};

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", red = "var(--spot-red)", violet = "#7a5b9a", paper = "var(--paper)", shade = "var(--paper-shade)";

function Leg({ tag, text, color }: { tag: string; text?: string; color: string }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 118 }}>
      <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".05em", color }}>{tag}</div>
      <div style={{ fontSize: 10, color: soft, lineHeight: 1.4 }}>{(text || "—").replace(/^D\d+\s*[—–-]\s*/, "").replace(/^D8\+\s*[—–-]\s*/, "")}</div>
    </div>
  );
}
const Arrow = () => <span style={{ color: margin, alignSelf: "center", fontSize: 12 }}>→</span>;

export function DirectionMap({ arc, focal }: { arc: DoorArcT; focal?: string }) {
  if (!arc?.mc && !arc?.cast?.length) return null;
  const fn = (focal || "").toLowerCase().replace(/^the\s+/, "").trim();
  return (
    <section style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 15, color: ink, margin: "0 0 2px" }}>🧭 THE DIRECTIONS <span style={{ fontSize: 10.5, color: margin, fontWeight: 400 }}>— where everyone starts &amp; ends (D1 → D7 → the D8+ payoff)</span></h2>
      {arc.ensemble && <p style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, margin: "0 0 10px", fontStyle: "italic" }}>{arc.ensemble}</p>}

      {/* THE MC — the spine */}
      {arc.mc && (
        <div style={{ border: `2px solid ${forest}`, background: shade, padding: "9px 12px", marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: forest }}>YOU — the MC <span style={{ fontWeight: 400, color: margin, fontStyle: "italic", fontSize: 10.5 }}>(the spine)</span></div>
          {arc.mc.weakness && <div style={{ fontSize: 10.5, color: red, lineHeight: 1.45, margin: "3px 0 6px" }}>🔒 <b>the weakness</b> (the Day-1 door): {arc.mc.weakness}</div>}
          <div style={{ display: "flex", gap: 9, alignItems: "stretch" }}>
            <Leg tag="D1 — START" text={arc.mc.start} color={margin} />
            <Arrow />
            <Leg tag="D7 — OUTGROWN" text={arc.mc.end} color={forest} />
            <Arrow />
            <Leg tag="D8+ — EXPERIENCED" text={arc.mc.payoff} color={violet} />
          </div>
        </div>
      )}

      {/* THE CAST — climbing around the MC */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(arc.cast ?? []).map((c) => {
          const isFocal = c.role === "focal" || (fn && c.name.toLowerCase().replace(/^the\s+/, "").trim() === fn);
          return (
            <div key={c.name} style={{ border: `2px solid ${isFocal ? forest : "var(--ink-soft)"}`, background: paper, padding: "8px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ink }}>{c.name} <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".07em", color: isFocal ? forest : margin, border: `1px solid ${isFocal ? forest : "var(--ink-soft)"}`, padding: "0 4px", marginLeft: 4 }}>{(c.role || "").toUpperCase()}</span></div>
              <div style={{ display: "flex", gap: 9, alignItems: "stretch", marginTop: 4 }}>
                <Leg tag="D1" text={c.start} color={margin} />
                <Arrow />
                <Leg tag="D7" text={c.end} color={forest} />
                <Arrow />
                <Leg tag="D8+" text={c.payoff} color={violet} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
