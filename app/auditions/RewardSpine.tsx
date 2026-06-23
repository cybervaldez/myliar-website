// THE UNLOCK SPINE — per door, the achievements (the ONE currency / steering wheel) + items that influence
// the cast and the directions, at OUTLINE level (per-day grants are the honing stage). Two flows: EARN (what
// the arc grants) and GATE (the achievement NEEDED before the MC/a character can grow), plus the items
// (object · keepsake/KEEP · KEY · memento). Lives in THE ARC section on the scene branch. NOT canon.

export type RewardsT = {
  earn?: { name: string; earnedBy?: string; opens?: string }[];
  gate?: { grows: string; needs?: string; why?: string }[];
  items?: { name: string; kind?: string; role?: string }[];
  spine?: string;
};

const ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", amber = "#c08a2e", forest = "var(--forest)", violet = "#7a5b9a", paper = "var(--paper)", shade = "var(--paper-shade)";
const KIND: Record<string, string> = { object: "🪡", keepsake: "💝", key: "🔑", memento: "🐚" };

export function RewardSpine({ rewards }: { rewards: RewardsT }) {
  if (!rewards?.earn?.length && !rewards?.gate?.length && !rewards?.items?.length) return null;
  return (
    <section style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 15, color: ink, margin: "0 0 2px" }}>🏆 THE UNLOCK SPINE <span style={{ fontSize: 10.5, color: margin, fontWeight: 400 }}>— achievements &amp; items (outline; per-day grants are the honing stage)</span></h2>
      {rewards.spine && <p style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, margin: "0 0 10px", fontStyle: "italic" }}>{rewards.spine}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {/* EARN — what the arc grants */}
        {!!rewards.earn?.length && (
          <div style={{ flex: "1 1 280px", border: `2px solid var(--ink-soft)`, background: paper, padding: "8px 11px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: forest, marginBottom: 4 }}>↑ EARN — what you unlock</div>
            {rewards.earn.map((e) => (
              <div key={e.name} style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, marginBottom: 3 }}>
                <b style={{ color: amber }}>«{e.name}»</b> <span style={{ color: margin }}>— {e.earnedBy}</span>{e.opens && <span style={{ color: forest }}> → {e.opens}</span>}
              </div>
            ))}
          </div>
        )}

        {/* GATE — what's needed for growth */}
        {!!rewards.gate?.length && (
          <div style={{ flex: "1 1 280px", border: `2px solid var(--ink-soft)`, background: shade, padding: "8px 11px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: violet, marginBottom: 4 }}>🔑 NEEDED FOR GROWTH — the gates</div>
            {rewards.gate.map((x, i) => (
              <div key={i} style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, marginBottom: 3 }}>
                <b style={{ color: ink }}>{x.grows}</b> <span style={{ color: margin }}>←</span> <b style={{ color: amber }}>«{x.needs}»</b>{x.why && <span style={{ color: margin }}> ({x.why})</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ITEMS */}
      {!!rewards.items?.length && (
        <div style={{ border: `2px solid var(--ink-soft)`, background: paper, padding: "8px 11px", marginTop: 8 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: margin, marginBottom: 4 }}>🎒 THE ITEMS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px" }}>
            {rewards.items.map((it) => (
              <span key={it.name} style={{ fontSize: 10.5, color: soft, lineHeight: 1.5 }}>{KIND[it.kind || ""] || "•"} <b style={{ color: ink }}>{it.name}</b>{it.role && <span style={{ color: margin }}> — {it.role}</span>}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
