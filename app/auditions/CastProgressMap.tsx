// THE CAST PROGRESS MAP — the overhead view of the ENSEMBLE and each character's PROGRESS-WITH-YOU arc
// (CONCEPT 1 / the relationship-ladder "becoming"). Complements THE ARC (the day-timeline of one focal coach):
// this maps WHO each character becomes as the bond deepens — early → mid → deep — plus the grows-with-you
// line (how deepening grows YOUR autonomy) and the reward stack (KNOW/DO/KEEP/MUTUAL). Lives in THE ARC
// section on the scene branch; the door's focal coach is highlighted. NOT canon.

export type CastArcT = {
  name: string; color?: string; essence?: string; early?: string; mid?: string; deep?: string;
  growsWithYou?: string; reward?: { know?: string; do?: string; keep?: string; mutual?: string };
};

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", amber = "#c08a2e", paper = "var(--paper)", shade = "var(--paper-shade)";
const norm = (s: string) => (s || "").toLowerCase().replace(/^the\s+/, "").trim();

function Rung({ band, text }: { band: string; text?: string }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 130 }}>
      <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".06em", color: margin, textTransform: "uppercase" }}>{band}</div>
      <div style={{ fontSize: 10.5, color: soft, lineHeight: 1.4 }}>{text || "—"}</div>
    </div>
  );
}

export function CastProgressMap({ arcs, focal, range }: { arcs: CastArcT[]; focal?: string; range?: string }) {
  if (!arcs?.length) return null;
  const fn = norm(focal || "");
  return (
    <section style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 15, color: ink, margin: "0 0 2px" }}>👥 THE CAST — their progress-with-you arcs <span style={{ fontSize: 10.5, color: margin, fontWeight: 400 }}>(the overhead)</span></h2>
      <p style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, margin: "0 0 10px" }}>who each character <b>becomes</b> as the bond deepens (revelation, not repair) — and how that deepening grows <i>your</i> autonomy. {range && <span style={{ color: margin, fontStyle: "italic" }}>{range}</span>}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {arcs.map((a) => {
          const isFocal = fn && norm(a.name) === fn;
          return (
            <div key={a.name} style={{ border: `2px solid ${isFocal ? (a.color || forest) : "var(--ink-soft)"}`, background: isFocal ? shade : paper, padding: "9px 12px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: ink }}><span style={{ display: "inline-block", width: 9, height: 9, background: a.color || soft, borderRadius: 2, marginRight: 5, verticalAlign: "middle" }} />{a.name}</span>
                {isFocal && <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".08em", color: a.color || forest, border: `1px solid ${a.color || forest}`, padding: "0 4px" }}>THIS DOOR&rsquo;S FOCAL</span>}
                <span style={{ fontSize: 10.5, color: margin, fontStyle: "italic" }}>{a.essence}</span>
              </div>
              {/* the becoming: early → mid → deep */}
              <div style={{ display: "flex", gap: 10, alignItems: "stretch", margin: "7px 0 0" }}>
                <Rung band="Circling" text={a.early} />
                <span style={{ color: margin, alignSelf: "center", fontSize: 13 }}>→</span>
                <Rung band="In your corner" text={a.mid} />
                <span style={{ color: margin, alignSelf: "center", fontSize: 13 }}>→</span>
                <Rung band="Unspoken — the note" text={a.deep} />
              </div>
              {a.growsWithYou && <div style={{ fontSize: 10, color: forest, marginTop: 6, lineHeight: 1.45 }}>↑ <b>grows you:</b> {a.growsWithYou}</div>}
              {a.reward && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 8px", marginTop: 5, fontSize: 9.5, color: soft }}>
                  {([["KNOW", a.reward.know], ["DO", a.reward.do], ["KEEP", a.reward.keep], ["MUTUAL", a.reward.mutual]] as const).map(([k, v]) => v ? <span key={k}><b style={{ color: amber }}>{k}</b> {v}</span> : null)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
