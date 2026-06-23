// THE PRELUDE — BROWSE COPY (the book cover). What a player reads while deciding what to play: it SELLS the
// experience (mood/ambience/environment + a crew tease + the promise). NOT a Day, and NOT the front door —
// there is NO character pick here (that's the separate FRONT-DOOR stage). The three stages are: PRELUDE (sell)
// → FRONT DOOR (pick) → DAYS (play). Auditioned (a range of selling angles → coverage → winner). NOT canon.

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", violet = "#7a5b9a", paper = "var(--paper)", shade = "var(--paper-shade)";

export type PreludeT = {
  tagline?: string; blurb?: string; angle?: string; graft?: string | null; panelFix?: string;
  crew?: { name?: string; tease?: string; carries?: string; reciprocity?: string }[];
  reviews?: { voice?: string; quote?: string; helped?: string; outgrew?: string | null }[];
};
export type PreludePanelT = {
  rubric?: { rule?: string; score?: number; note?: string }[];
  targetDemo?: { voices?: { who?: string; take?: string; feltSeen?: boolean; concern?: string }[]; verdict?: string };
  general?: { voices?: { who?: string; take?: string; wouldTap?: boolean }[]; verdict?: string };
  experts?: { voices?: { who?: string; take?: string; fix?: string }[]; verdict?: string };
  synthesis?: { verdict?: string; strength?: string; fixes?: string[] };
};
export type PreludeCandidateT = { id?: string; angle?: string; tagline?: string; blurb?: string; covers?: string };
export type PreludeAuditionT = {
  brief?: string; candidates?: PreludeCandidateT[];
  coverage?: { scores?: { id?: string; sells?: number; truth?: number; castTease?: number; cozy?: number; coverCraft?: number; total?: number; note?: string }[]; winner?: string; whyWon?: string; rangeNote?: string; graft?: string | null };
};

import { CastName, type CastNameT } from "./CastName";
// split prose on the cast names → interleave the (client) <CastName>; a server-safe helper rendering a client component
function withCastNames(text: string, cast: CastNameT[]) {
  const named = (cast || []).filter((c) => c.personalName);
  if (!named.length || !text) return text;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b(${named.map((c) => esc(c.personalName!)).join("|")})\\b`, "g");
  const out: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const c = named.find((x) => x.personalName === m![1]);
    out.push(c ? <CastName key={m.index} c={c} /> : m[1]);
    last = m.index + m[1].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
const scoreColor = (n?: number) => (n ?? 0) >= 5 ? forest : (n ?? 0) >= 4 ? "#4a6b8a" : (n ?? 0) >= 3 ? "#c08a2e" : "var(--spot-red)";

export function Prelude({ prelude, audition, panel, frontDoorHref, cast }: { prelude?: PreludeT; audition?: PreludeAuditionT; panel?: PreludePanelT; frontDoorHref?: string; cast?: CastNameT[] }) {
  if (!prelude?.blurb) return null;
  const win = audition?.coverage?.winner;
  const rubricAvg = panel?.rubric?.length ? (panel.rubric.reduce((s, x) => s + (x.score || 0), 0) / panel.rubric.length) : null;
  return (
    <section>
      <div style={{ fontSize: 10.5, color: margin, fontStyle: "italic", marginBottom: 10, lineHeight: 1.5 }}>
        The book cover — what you read while <b>browsing what to play</b>. It sells the experience; it is not the game. No choices, no character pick (that&rsquo;s the <b>front door</b>, a separate step).{prelude.angle ? <> Winning angle: <b style={{ color: violet }}>{prelude.angle}</b>.</> : null}
      </div>

      {/* THE COVER — tagline (front) + blurb (back) */}
      <div style={{ border: `2px solid ${forest}`, background: shade, padding: "20px 22px", textAlign: "center" }}>
        {prelude.tagline && <p style={{ fontSize: 17, color: forest, fontWeight: 700, fontStyle: "italic", margin: "0 0 16px", lineHeight: 1.35 }}>&ldquo;{prelude.tagline}&rdquo;</p>}
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "left" }}>
          {prelude.blurb.split(/\n+/).map((p, i) => <p key={i} style={{ fontSize: 13.5, color: ink, lineHeight: 1.7, margin: "0 0 11px" }}>{cast?.length ? withCastNames(p, cast) : p}</p>)}
        </div>
      </div>

      {/* THE REVIEWS — spoiler-free testimonials (the advert, kept OUT of the cover prose) */}
      {!!prelude.reviews?.length && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: margin, textTransform: "uppercase", marginBottom: 6 }}>what it gave them <span style={{ fontWeight: 400, textTransform: "none" }}>— spoiler-free, from people it was for</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
            {prelude.reviews.map((rv, i) => (
              <div key={i} style={{ border: `1px solid var(--ink-soft)`, background: paper, borderLeft: `3px solid ${forest}`, padding: "8px 11px" }}>
                <p style={{ fontSize: 11.5, color: ink, fontStyle: "italic", lineHeight: 1.55, margin: "0 0 5px" }}>&ldquo;{rv.quote}&rdquo;</p>
                <div style={{ fontSize: 9.5, color: margin }}>— {rv.voice}</div>
                {rv.outgrew && <div style={{ fontSize: 9.5, color: forest, lineHeight: 1.45, marginTop: 4, borderTop: `1px dashed var(--ink-soft)`, paddingTop: 4 }}>🚪 <i>{rv.outgrew}</i></div>}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 8.5, color: margin, fontStyle: "italic", marginTop: 4 }}>representative voices (the intended review register) — grows-with-you, never dependency; vetted SHIP</div>
        </div>
      )}

      {/* THE CREW is now woven INTO the cover prose (organic-living-world, owner note 2026-06-23) — no separate
          "who you'll meet" card. The crew DATA (struggles + reciprocity) still seeds the front door + Day 1. */}

      {frontDoorHref && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <a href={frontDoorHref} style={{ fontSize: 12, color: forest, fontWeight: 700, textDecoration: "none", border: `1.5px solid ${forest}`, padding: "7px 16px", display: "inline-block" }}>step aboard — the front door →</a>
          <div style={{ fontSize: 9, color: margin, marginTop: 4, fontStyle: "italic" }}>(where you choose who you meet first)</div>
        </div>
      )}

      {/* THE COVER PANEL — the standing review (target demo · general · publishing experts) */}
      {panel?.synthesis?.verdict && (
        <div style={{ border: `2px solid ${panel.synthesis.verdict === "SHIP" ? forest : "var(--spot-red)"}`, background: shade, padding: "11px 13px", marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <h3 style={{ fontSize: 13.5, color: ink, margin: 0 }}>🎟 THE COVER PANEL</h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: panel.synthesis.verdict === "SHIP" ? forest : "var(--spot-red)" }}>{panel.synthesis.verdict}</span>
            {rubricAvg != null && <span style={{ fontSize: 10, color: margin }}>rubric {rubricAvg.toFixed(1)}/5</span>}
            <span style={{ fontSize: 9.5, color: margin }}>target demo · general · publishing experts</span>
          </div>
          {/* the rubric */}
          {!!panel.rubric?.length && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginBottom: 7 }}>
              {panel.rubric.map((x, i) => (
                <span key={i} title={x.note} style={{ fontSize: 9.5, color: soft }}>{x.rule} <b style={{ color: scoreColor(x.score) }}>{x.score}</b></span>
              ))}
            </div>
          )}
          {panel.synthesis.strength && <p style={{ fontSize: 10.5, color: soft, lineHeight: 1.55, margin: "0 0 5px" }}>🛡 <b style={{ color: forest }}>protect:</b> {panel.synthesis.strength}</p>}
          {prelude.panelFix && <p style={{ fontSize: 9.5, color: margin, lineHeight: 1.5, margin: "0 0 5px", fontStyle: "italic" }}>✓ folded: {prelude.panelFix}</p>}
          {!!panel.synthesis.fixes?.length && <ul style={{ fontSize: 9.5, color: margin, lineHeight: 1.5, margin: "0 0 6px", paddingLeft: 16 }}>{panel.synthesis.fixes.map((f, i) => <li key={i}>{f}</li>)}</ul>}
          {/* the three lenses */}
          <details style={{ marginTop: 4 }}>
            <summary style={{ cursor: "pointer", fontSize: 10.5, color: forest, fontWeight: 700, listStyle: "none" }}>▸ the three lenses</summary>
            <div style={{ marginTop: 6 }}>
              {([
                { key: "targetDemo", label: "🫂 target demo", v: panel.targetDemo },
                { key: "general", label: "📖 general storytelling-lovers", v: panel.general },
                { key: "experts", label: "✒️ publishing / storytelling experts", v: panel.experts },
              ] as const).map((lens) => lens.v?.voices?.length ? (
                <div key={lens.key} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: ink }}>{lens.label} <span style={{ color: margin, fontWeight: 400 }}>— {lens.v.verdict}</span></div>
                  {lens.v.voices!.map((vo, i) => (
                    <div key={i} style={{ fontSize: 9.5, color: soft, lineHeight: 1.5, paddingLeft: 8 }}>
                      <b style={{ color: ink }}>{vo.who}:</b> {vo.take}
                      {"concern" in vo && vo.concern ? <span style={{ color: "var(--spot-red)" }}> (concern: {vo.concern})</span> : null}
                      {"fix" in vo && vo.fix ? <span style={{ color: violet }}> → fix: {vo.fix}</span> : null}
                    </div>
                  ))}
                </div>
              ) : null)}
            </div>
          </details>
        </div>
      )}

      {/* THE AUDITION — the range of selling angles that was vetted (pipeline transparency) */}
      {!!audition?.candidates?.length && (
        <details style={{ marginTop: 14, border: `1px solid var(--ink-soft)`, background: paper }}>
          <summary style={{ cursor: "pointer", padding: "7px 12px", fontSize: 11.5, color: ink, fontWeight: 700, listStyle: "none" }}>
            🎭 the prelude audition <span style={{ fontWeight: 400, color: margin }}>— {audition.candidates.length} selling angles, vetted as a coverage → winner [{win}]</span>
          </summary>
          <div style={{ padding: "0 12px 11px" }}>
            {audition.coverage?.rangeNote && <p style={{ fontSize: 10.5, color: soft, lineHeight: 1.55, margin: "2px 0 8px", borderLeft: `2px solid ${violet}`, paddingLeft: 9 }}><b style={{ color: violet }}>what the range revealed:</b> {audition.coverage.rangeNote}</p>}
            {audition.candidates.map((cand) => {
              const sc = audition.coverage?.scores?.find((s) => s.id === cand.id);
              const isWin = cand.id === win;
              return (
                <div key={cand.id} style={{ border: `1px solid ${isWin ? forest : "var(--ink-soft)"}`, background: isWin ? shade : paper, padding: "7px 10px", marginBottom: 6 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 7, fontSize: 11 }}>
                    <b style={{ fontFamily: "monospace", color: isWin ? forest : margin }}>{isWin ? "★" : "·"} [{cand.id}]</b>
                    <b style={{ color: ink }}>{cand.angle}</b>
                    {sc?.total ? <span style={{ fontSize: 9.5, color: margin }}>total {sc.total} (sells {sc.sells}/truth {sc.truth}/cast {sc.castTease}/cozy {sc.cozy}/craft {sc.coverCraft})</span> : null}
                  </div>
                  {cand.tagline && <div style={{ fontSize: 10, color: forest, fontStyle: "italic", marginTop: 2 }}>&ldquo;{cand.tagline}&rdquo;</div>}
                  {cand.covers && <div style={{ fontSize: 9.5, color: violet, marginTop: 1 }}>wins: {cand.covers}</div>}
                  {sc?.note && <div style={{ fontSize: 9.5, color: soft, marginTop: 1 }}>{sc.note}</div>}
                </div>
              );
            })}
            {audition.coverage?.whyWon && <p style={{ fontSize: 10.5, color: soft, lineHeight: 1.55, margin: "4px 0 0" }}><b style={{ color: forest }}>why [{win}] won:</b> {audition.coverage.whyWon}</p>}
            {prelude.graft && <p style={{ fontSize: 10, color: margin, lineHeight: 1.5, margin: "5px 0 0", fontStyle: "italic" }}>⊕ graft to fold from a runner-up: {prelude.graft}</p>}
          </div>
        </details>
      )}
    </section>
  );
}
