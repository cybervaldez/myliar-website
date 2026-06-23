// THE HONED DAY — the real authored payload for one day (the HONING stage output, from day-author.mjs,
// reviewed by /writers-room + a visual concept artist). Day 1 is CONVERGENT-ORIGINS: multiple openings (one
// per lead picked at the front door) that converge by the middle. Shows: the title (log-entry motif) · the
// per-lead openings · the converge · the choices (L/P/C + the locked NG+ door) · the CG (prompt/you-see/
// framing) · the items · the achievement · the note. Lives atop THE ARC section. NOT canon.

export type HonedDayT = {
  title?: string; frame?: string;
  openings?: { lead: string; title?: string; meeting?: string; lines?: string[] }[];
  converge?: string;
  choices?: { logical?: C; passive?: C; chaotic?: C; locked?: C };
  cg?: { prompt?: string; youSee?: string; meta?: string };
  items?: { name: string; introducedAs?: string }[];
  achievement?: { name?: string; earnedOn?: string };
  note?: { lead?: string; text?: string; category?: string };
  wake?: { sees?: string; surfaces?: string; leaves?: string };
  community?: { path?: string; seed?: string; options?: string[]; display?: string; safe?: string };
};
type C = { text?: string; outcome?: string; coachRef?: string };

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", red = "var(--spot-red)", amber = "#c08a2e", violet = "#7a5b9a", paper = "var(--paper)", shade = "var(--paper-shade)";
const CH: { k: keyof NonNullable<HonedDayT["choices"]>; label: string; c: string }[] = [
  { k: "logical", label: "LOGICAL", c: forest }, { k: "passive", label: "PASSIVE", c: "#4a6b8a" }, { k: "chaotic", label: "CHAOTIC", c: amber },
];

export function DayHoning({ day, n }: { day: HonedDayT; n?: number }) {
  if (!day?.title) return null;
  return (
    <section style={{ marginTop: 22, border: `2px solid ${forest}`, background: shade, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 16, color: ink, margin: 0 }}>✍ DAY {n ?? 1} — HONED</h2>
        <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".08em", color: forest, border: `1px solid ${forest}`, padding: "0 5px" }}>writers-room + visual ✓</span>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 12.5, color: amber, fontWeight: 700, margin: "3px 0 2px" }}>{day.title}</div>
      {day.frame && <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 10px" }}>{day.frame}</p>}

      {/* CONVERGENT OPENINGS */}
      {!!day.openings?.length && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: margin, marginBottom: 4 }}>⛩ PICK YOUR LEAD (front door) — {day.openings.length} openings, converging</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {day.openings.map((o) => (
              <div key={o.lead} style={{ flex: "1 1 200px", border: `1px solid var(--ink-soft)`, background: paper, padding: "6px 9px" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: ink }}>{o.lead}</div>
                {o.title && <div style={{ fontFamily: "monospace", fontSize: 9, color: margin }}>«{o.title}»</div>}
                {!!o.lines?.length && <div style={{ fontSize: 10, color: soft, lineHeight: 1.5, marginTop: 3, fontStyle: "italic" }}>{o.lines.map((l, i) => <span key={i}>“{l}”{i < o.lines!.length - 1 ? " " : ""}</span>)}</div>}
              </div>
            ))}
          </div>
          {day.converge && <div style={{ fontSize: 10, color: forest, marginTop: 5 }}>↡ converge: {day.converge}</div>}
        </div>
      )}

      {/* CHOICES */}
      {day.choices && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: margin, marginBottom: 4 }}>THE CHOICES</div>
          {CH.map(({ k, label, c }) => { const ch = day.choices?.[k]; if (!ch) return null; return (
            <div key={k} style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, marginBottom: 2 }}>
              <b style={{ color: c }}>{label}</b> {ch.text}{ch.outcome && <span style={{ color: margin }}> → {ch.outcome}</span>}
            </div>
          ); })}
          {day.choices.locked && (
            <div style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, marginTop: 2, borderTop: `1px dashed var(--ink-soft)`, paddingTop: 3 }}>
              <b style={{ color: red }}>🔒 LOCKED</b> <span style={{ color: violet }}>(NG+)</span> {day.choices.locked.text}{day.choices.locked.coachRef && <span style={{ color: margin, fontStyle: "italic" }}> — coach: “{day.choices.locked.coachRef}”</span>}
            </div>
          )}
        </div>
      )}

      {/* CG + items/achievement */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {day.cg && (
          <div style={{ flex: "1 1 300px", border: `1px solid var(--ink-soft)`, background: paper, padding: "7px 10px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: margin }}>🖼 THE CG (the meeting)</div>
            {day.cg.prompt && <div style={{ fontSize: 10, color: soft, lineHeight: 1.45, marginTop: 3 }}>{day.cg.prompt}</div>}
            {day.cg.youSee && <div style={{ fontSize: 10, color: ink, lineHeight: 1.5, marginTop: 4, fontStyle: "italic" }}>{day.cg.youSee}</div>}
            {day.cg.meta && <div style={{ fontSize: 9, color: margin, marginTop: 3 }}>{day.cg.meta}</div>}
          </div>
        )}
        <div style={{ flex: "1 1 200px" }}>
          {!!day.items?.length && <div style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, marginBottom: 5 }}>🎒 <b style={{ color: ink }}>{day.items.map((i) => i.name).join(", ")}</b>{day.items[0]?.introducedAs && <span style={{ color: margin }}> — {day.items[0].introducedAs}</span>}</div>}
          {day.achievement?.name && <div style={{ fontSize: 10.5, color: soft, lineHeight: 1.5 }}>🏆 <b style={{ color: amber }}>{day.achievement.name}</b>{day.achievement.earnedOn && <span style={{ color: margin }}> — {day.achievement.earnedOn}</span>}</div>}
        </div>
      </div>

      {/* THE NOTE */}
      {day.note?.text && (
        <div style={{ borderLeft: `3px solid ${forest}`, background: paper, padding: "7px 11px", marginTop: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: forest }}>♥ THE NOTE — {day.note.lead} <span style={{ color: margin, fontWeight: 400 }}>({day.note.category})</span></div>
          <div style={{ fontSize: 11, color: ink, lineHeight: 1.55, marginTop: 2, fontStyle: "italic" }}>{day.note.text}</div>
        </div>
      )}

      {/* THE SOCIAL LAYER — the wake + the path community (community-manager reviewed) */}
      {(day.wake || day.community) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {day.wake && (
            <div style={{ flex: "1 1 260px", border: `1px solid var(--ink-soft)`, background: paper, padding: "7px 11px" }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: forest }}>〜 THE WAKE <span style={{ fontWeight: 400, color: margin, fontStyle: "italic" }}>— ghost notes (historical · atmospheric · safe)</span></div>
              {day.wake.sees && <div style={{ fontSize: 10, color: soft, lineHeight: 1.5, marginTop: 3 }}><b style={{ color: margin }}>you see:</b> {day.wake.sees}</div>}
              {day.wake.leaves && <div style={{ fontSize: 10, color: soft, lineHeight: 1.5, marginTop: 2 }}><b style={{ color: margin }}>you leave:</b> {day.wake.leaves}</div>}
              {day.wake.surfaces && <div style={{ fontSize: 9, color: margin, lineHeight: 1.4, marginTop: 2, fontStyle: "italic" }}>{day.wake.surfaces}</div>}
            </div>
          )}
          {day.community && (
            <div style={{ flex: "1 1 260px", border: `1px solid var(--ink-soft)`, background: paper, padding: "7px 11px" }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".06em", color: violet }}>💬 THE PATH COMMUNITY <span style={{ fontWeight: 400, color: margin, fontStyle: "italic" }}>— {day.community.path} (opt-in · structured)</span></div>
              {day.community.seed && <div style={{ fontSize: 10, color: ink, lineHeight: 1.5, marginTop: 3 }}>{day.community.seed}</div>}
              {!!day.community.options?.length && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                  {day.community.options.map((o) => <span key={o} style={{ fontSize: 9.5, color: soft, border: `1px solid var(--ink-soft)`, borderRadius: 10, padding: "1px 7px" }}>{o}</span>)}
                </div>
              )}
              {day.community.display && <div style={{ fontSize: 9, color: margin, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{day.community.display}</div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
