// THE FRONT DOOR — the campaign entry (before Day 1): the PRELUDE (the opening narrative) + the SCENE BOARD
// (the convergent-origins pick — which lead you find FIRST). The pick is the ONLY real divergence (bounded
// Act-0): each lead has their own Day-1 opening, all converge by the dark middle, REL parity. The board is
// assembled from the Day-1 openings + the chatbot gifts. From front-door.mjs (prelude) + honed[1].openings.
// Lives on the door (outline) page, at the top. NOT canon.

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", red = "var(--spot-red)", paper = "var(--paper)", shade = "var(--paper-shade)";

export type OpeningT = { lead?: string; title?: string; meeting?: string; lines?: string[] };
export type ChatbotT = { name?: string; color?: string; value?: string; growsYou?: string };
export type FoundingGiftT = { lead?: string; item?: string; kind?: string; effect?: string; persists?: boolean };
export type FrontDoorT = { boardIntro?: string; predecessorSeed?: string; foundingGifts?: FoundingGiftT[]; blueprint?: boolean };

export function FrontDoor({ fd, openings, chatbots, campaign, door, preludeHref }: {
  fd?: FrontDoorT; openings?: OpeningT[]; chatbots?: ChatbotT[]; campaign: string; door: string; preludeHref?: string;
}) {
  if (!openings?.length && !fd?.boardIntro) return null;
  const giftFor = (lead?: string) => chatbots?.find((c) => c.name && lead && c.name.toLowerCase() === lead.toLowerCase());
  const foundFor = (lead?: string) => fd?.foundingGifts?.find((f) => f.lead && lead && f.lead.toLowerCase() === lead.toLowerCase());
  return (
    <section style={{ border: `2px solid ${forest}`, background: shade, padding: "13px 15px", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
        <h2 style={{ fontSize: 16, color: ink, margin: 0 }}>⛩ THE FRONT DOOR <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— choose who you meet first</span></h2>
        {preludeHref && <a href={preludeHref} style={{ fontSize: 9.5, color: forest, fontWeight: 700, textDecoration: "none" }}>◂ the prelude (the cover)</a>}
      </div>
      <p style={{ fontSize: 10, color: soft, lineHeight: 1.5, margin: "0 0 8px" }}>A separate stage from the prelude (the sell) and the days (the play): here you <b>pick your starting character</b>. The pick forks Day 1, then converges.</p>

      {/* THE SCENE BOARD — the convergent-origins pick */}
      {fd?.boardIntro && <p style={{ fontSize: 12, color: forest, fontWeight: 700, margin: "0 0 4px" }}>{fd.boardIntro}</p>}
      <p style={{ fontSize: 10, color: soft, lineHeight: 1.5, margin: "0 0 9px" }}>
        Each lead has their <b>own Day-1 opening</b> — the only place the story forks. They all <b>converge by the dark middle</b> of the crossing; the spine never branches again. <b style={{ color: forest }}>REL parity</b> — no lead is the &ldquo;right&rdquo; one; whoever you pick is just who you meet <i>first</i>.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 8 }}>
        {(openings || []).map((o, i) => {
          const g = giftFor(o.lead);
          const fg = foundFor(o.lead);
          const c = g?.color || forest;
          return (
            <a key={i} href={`/auditions/${campaign}/scenes/${door}/day/1`}
              style={{ display: "block", border: `1.5px solid ${c}`, background: paper, padding: "9px 11px", textDecoration: "none", borderLeft: `4px solid ${c}` }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".08em", color: c, textTransform: "uppercase" }}>find {o.lead} first</div>
              <div style={{ fontSize: 12.5, color: ink, fontWeight: 700, margin: "1px 0 4px" }}>&laquo;{o.title}&raquo;</div>
              {o.meeting && <p style={{ fontSize: 10, color: soft, lineHeight: 1.5, margin: "0 0 5px" }}>{o.meeting}</p>}
              {!!o.lines?.length && <div style={{ fontSize: 10, color: ink, fontStyle: "italic", lineHeight: 1.5, marginBottom: 5 }}>{o.lines.slice(0, 3).map((l, j) => <span key={j}>&ldquo;{l}&rdquo; </span>)}</div>}
              {g?.value && <div style={{ fontSize: 9, color: margin, lineHeight: 1.45, borderTop: `1px dashed var(--ink-soft)`, paddingTop: 4 }}>🎁 <b style={{ color: c }}>the gift:</b> {g.value}</div>}
              {fg?.item && <div style={{ fontSize: 9, color: ink, lineHeight: 1.45, marginTop: 4, background: "rgba(45,74,43,.05)", padding: "3px 5px", border: `1px solid ${c}` }}>🎒 <b style={{ color: c }}>you keep &laquo;{fg.item}&raquo;</b>{fg.kind ? <span style={{ color: margin }}> ({fg.kind})</span> : null} — {fg.effect}</div>}
              <div style={{ fontSize: 9.5, color: forest, fontWeight: 700, marginTop: 5 }}>open Day 1 →</div>
            </a>
          );
        })}
      </div>

      {/* THE CONVERGENCE — how a linear story makes the pick matter */}
      <details style={{ marginTop: 11, border: `1px solid var(--ink-soft)`, background: paper }}>
        <summary style={{ cursor: "pointer", padding: "6px 11px", fontSize: 11, color: ink, fontWeight: 700, listStyle: "none" }}>⧖ how the pick converges <span style={{ fontWeight: 400, color: margin }}>— linear spine, achievement-driven divergence</span></summary>
        <div style={{ padding: "0 11px 9px", fontSize: 10.5, color: soft, lineHeight: 1.6 }}>
          <p style={{ margin: "4px 0" }}><b style={{ color: forest }}>Day 1 — the only real fork (~100% different).</b> You pick a lead → their own opening (a different scene, character, first beat). Your pick sets a <b>flag</b>.</p>
          <p style={{ margin: "4px 0" }}><b style={{ color: forest }}>Day 2 — convergence.</b> From here the days/beats are <b>identical for everyone</b> (the focal arc + the ensemble bump-ins). The four picks become one road.</p>
          <p style={{ margin: "4px 0" }}><b style={{ color: forest }}>The founding gift — the most tangible remembering.</b> The lead you pick hands you a <b>persistent item in the core loop</b> (a recipe you keep cooking, a heading on your chart, a ledger-line you can release). Not flavor text — a real mechanic that rides the whole run, so the pick is felt in the loop, not just the dialogue. <i>This is the systems fix: the origin is mechanized without branching the spine.</i></p>
          <p style={{ margin: "4px 0" }}><b style={{ color: forest }}>After — small + surgical (~5–15% of dialogue, never structure).</b> The flag drives <b>dialogue variants</b> — the &ldquo;world remembers&rdquo;: the lead you picked nods at you, a few warmer beats, the bump-in skips whoever you already met. The structure is the same; only the variant lines differ.</p>
          <p style={{ margin: "4px 0" }}><b style={{ color: red }}>D8+ — the payoff.</b> Your Day-1 pick + your path/stat choices are exactly what gate the experienced arc (the flashbacks, &laquo;KEEP&raquo; needs the D5 mug, &laquo;MUTUAL&raquo; needs COMPOSED). The pick is <b>remembered and pays off</b>.</p>
          <p style={{ margin: "4px 0", color: margin, fontStyle: "italic" }}>Achievements are the steering wheel: they diverge <i>how</i> you experience the shared spine, while the spine itself stays linear and authorable. Branching content would be unauthorable; flags give the feel of branching for the cost of a few variant lines.</p>
        </div>
      </details>

      {fd?.predecessorSeed && (
        <div style={{ fontSize: 9.5, color: margin, fontStyle: "italic", marginTop: 9, borderTop: `1px dashed var(--ink-soft)`, paddingTop: 6 }}>
          ⟳ <b>the predecessor seed</b> (the ending rhymes with this): {fd.predecessorSeed}
        </div>
      )}
    </section>
  );
}
