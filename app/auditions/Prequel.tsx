// THE PREQUEL — a short OPTIONAL companion book (a "textbook", like Tales of Beedle the Bard) about the crew
// BEFORE the MC joins. A BOOK to read, NOT a campaign (no mechanics) and NOT a prerequisite (the campaign stands
// alone). Its TONE is AUDITIONED — the companion is a PALETTE CLEANSER (lighter than the main's quiet-poignant
// register), so we range four lighter registers (fable · almanac · cozy-adventure · folk-legend) and pick the
// best one. Shows the audition (the range + the pick) atop the readable winning book. From prequel-audition.mjs.

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", violet = "#7a5b9a", red = "var(--spot-red)", paper = "var(--paper)", shade = "var(--paper-shade)";

type TakeT = { id?: string; register?: string; title?: string; pitch?: string; palette?: string; sampleTitle?: string; sample?: string };
type CovScoreT = { id?: string; register?: string; paletteCleanse?: number; flatBaseline?: number; anchorDensity?: number; sameWorld?: number; gaCharming?: number; seedsLightly?: number; distinctGift?: number; note?: string };
type AuditionT = { takes?: TakeT[]; coverage?: { scores?: CovScoreT[]; winner?: string; whyWon?: string; rangeNote?: string; mainToneContrast?: string } };
export type PrequelT = {
  title?: string; framing?: string; register?: string; palette?: string; audition?: AuditionT;
  chapters?: { title?: string; body?: string; section?: string }[];
  collection?: { sections?: string[]; total?: number; grownBy?: number };
  seeds?: { character?: string; struggle?: string; plantedHow?: string; campaignContinues?: string }[];
};

const SCOREKEYS: [keyof CovScoreT, string][] = [["paletteCleanse", "cleanse"], ["flatBaseline", "flat"], ["anchorDensity", "anchor"], ["gaCharming", "charm"], ["seedsLightly", "seeds"], ["distinctGift", "gift"]];

function Audition({ audition }: { audition: AuditionT }) {
  const takes = audition.takes || [];
  const cov = audition.coverage || {};
  const winner = cov.winner;
  const scoreOf = (id?: string) => (cov.scores || []).find((s) => s.id === id);
  return (
    <details style={{ border: `2px solid ${violet}`, background: shade, marginBottom: 18 }} open>
      <summary style={{ cursor: "pointer", padding: "8px 12px", fontSize: 12, fontWeight: 700, color: violet }}>🎚 the tone audition <span style={{ fontWeight: 400, color: margin }}>— the companion is a PALETTE CLEANSER (lighter than the main); we ranged 4 registers + picked the best</span></summary>
      <div style={{ padding: "0 12px 12px" }}>
        {cov.mainToneContrast && <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "2px 0 8px", fontStyle: "italic" }}>vs the main: {cov.mainToneContrast}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
          {takes.map((t) => {
            const s = scoreOf(t.id); const won = t.id === winner;
            return (
              <div key={t.id} style={{ border: won ? `2px solid ${forest}` : `1px solid var(--ink-soft)`, background: won ? paper : "transparent", padding: "7px 9px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ink }}>{won && <span style={{ color: forest }}>★ </span>}{t.register} <span style={{ fontSize: 9, color: margin, fontWeight: 400 }}>· {t.palette}</span></div>
                <div style={{ fontSize: 11, color: won ? forest : soft, fontStyle: "italic" }}>«{t.title}»</div>
                {t.pitch && <div style={{ fontSize: 9, color: margin, lineHeight: 1.45, marginTop: 2 }}>{t.pitch}</div>}
                {s && <div style={{ display: "flex", flexWrap: "wrap", gap: "0 7px", marginTop: 3 }}>{SCOREKEYS.filter(([k]) => s[k] != null).map(([k, lbl]) => <span key={lbl} style={{ fontSize: 8.5, color: (s[k] as number) >= 5 ? forest : (s[k] as number) <= 3 ? red : margin }}>{lbl} {s[k]}</span>)}</div>}
                {t.sample && <details style={{ marginTop: 4 }}><summary style={{ cursor: "pointer", fontSize: 8.5, color: violet }}>sample ▸ {t.sampleTitle}</summary><p style={{ fontSize: 9, color: soft, lineHeight: 1.5, fontStyle: "italic", margin: "3px 0 0" }}>{t.sample}</p></details>}
              </div>
            );
          })}
        </div>
        {cov.whyWon && <p style={{ fontSize: 10, color: ink, lineHeight: 1.5, margin: "8px 0 0" }}><b style={{ color: forest }}>why «{(takes.find((t) => t.id === winner) || {}).title}» won:</b> {cov.whyWon}</p>}
        {cov.rangeNote && <p style={{ fontSize: 9.5, color: margin, lineHeight: 1.5, margin: "3px 0 0", fontStyle: "italic" }}>the range: {cov.rangeNote}</p>}
      </div>
    </details>
  );
}

export function Prequel({ prequel }: { prequel?: PrequelT }) {
  if (!prequel?.chapters?.length) return null;
  return (
    <section>
      {prequel.audition && <Audition audition={prequel.audition} />}

      <div style={{ textAlign: "center", marginBottom: 18, borderBottom: `2px solid ${forest}`, paddingBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".14em", color: violet, textTransform: "uppercase" }}>an optional companion · not a prerequisite{prequel.register ? ` · a ${prequel.register.toLowerCase()}` : ""}</div>
        <h1 style={{ fontSize: 26, color: ink, margin: "5px 0 6px", fontStyle: "italic" }}>{prequel.title}</h1>
        {prequel.framing && <p style={{ fontSize: 12, color: soft, lineHeight: 1.55, maxWidth: 480, margin: "0 auto", fontStyle: "italic" }}>{prequel.framing}</p>}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {prequel.chapters.map((c, i) => (
          <div key={i} style={{ marginBottom: 22 }}>
            {c.section && c.section !== prequel.chapters![i - 1]?.section && (
              <div style={{ textAlign: "center", margin: "8px 0 18px" }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".16em", color: violet, textTransform: "uppercase", borderTop: `1px solid ${violet}`, borderBottom: `1px solid ${violet}`, padding: "4px 14px", display: "inline-block" }}>{c.section}</span>
              </div>
            )}
            <h2 style={{ fontSize: 15, color: forest, margin: "0 0 8px", textAlign: "center", letterSpacing: ".02em" }}>{c.title}</h2>
            {(c.body || "").split(/\n+/).map((p, j) => {
              const t = p.replace(/^\*+\s*/, "").replace(/\s*\*+$/, "").trim();
              const mn = t.match(/^Margin Note,?\s*(.+?):\s*([\s\S]+)$/i); // an annotated-artifact margin note (almanac register)
              if (mn) return <p key={j} style={{ fontSize: 12, color: soft, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 9px", paddingLeft: 14, borderLeft: `2px solid var(--ink-soft)` }}>✍ <b style={{ color: margin, fontStyle: "normal" }}>{mn[1]}</b> — {mn[2]}</p>;
              return <p key={j} style={{ fontSize: 14, color: ink, lineHeight: 1.75, margin: "0 0 12px" }}>{t}</p>;
            })}
            {i < prequel.chapters!.length - 1 && <div style={{ textAlign: "center", color: margin, fontSize: 14, marginTop: 6 }}>❦</div>}
          </div>
        ))}
      </div>

      {/* THE SEEDS — the designer note (what the campaign continues) */}
      {!!prequel.seeds?.length && (
        <details style={{ maxWidth: 600, margin: "10px auto 0", border: `1px solid var(--ink-soft)`, background: paper }}>
          <summary style={{ cursor: "pointer", padding: "7px 12px", fontSize: 11, color: ink, fontWeight: 700, listStyle: "none" }}>🌱 the seeds <span style={{ fontWeight: 400, color: margin }}>— what this plants for the campaign to continue (designer note, not in the book)</span></summary>
          <div style={{ padding: "0 12px 10px" }}>
            {prequel.seeds.map((s, i) => (
              <div key={i} style={{ fontSize: 10, color: soft, lineHeight: 1.5, borderTop: `1px dashed var(--ink-soft)`, paddingTop: 5, marginTop: 5 }}>
                <b style={{ color: forest }}>{s.character}</b> — {s.struggle}
                {s.plantedHow && <div style={{ fontSize: 9, color: margin, paddingLeft: 8 }}>planted: {s.plantedHow}</div>}
                {s.campaignContinues && <div style={{ fontSize: 9, color: violet, paddingLeft: 8 }}>→ continues: {s.campaignContinues}</div>}
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
