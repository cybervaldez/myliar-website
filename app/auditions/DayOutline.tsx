// THE DAY OUTLINE — the per-day MICRO-ARC SPEC (the overhead of what the day's micro-arc NEEDS), from
// day-outline.mjs. A day = one real-life day = a micro-arc of multiple beats (dialogues/choices/minigames).
// This shows WHAT'S NEEDED; the honing (DayHoning) is the expansion. Lives on the day subpage. NOT canon.

export type DayOutlineT = {
  n?: number; title?: string; premise?: string; featuring?: string[];
  beats?: { slot?: string; kind?: string; who?: string; gist?: string; bpm?: number }[];
  choice?: { at?: string; options?: string; gist?: string; stats?: { logical?: string; passive?: string; chaotic?: string; composed?: string }; outcomes?: { logical?: string; passive?: string; chaotic?: string; composed?: string }; leadsTo?: string | null };
  minigame?: { engine?: string; trigger?: string } | null;
  cg?: { at?: string; taxon?: string } | null;
  note?: { category?: string; gist?: string };
  rewards?: { at?: string; kind?: string; name?: string; rarity?: string; trigger?: string; pathGate?: string | null; unlocks?: string | null }[];
  statFocus?: string;
  props?: string[];
  flashback?: { to?: string | number; oldYou?: string; newYou?: string };
  ngPlus?: boolean;
  social?: { wake?: string; community?: string };
  hook?: string;
};

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", red = "var(--spot-red)", amber = "#c08a2e", violet = "#7a5b9a", paper = "var(--paper)", shade = "var(--paper-shade)";
const KIND: Record<string, { c: string; i: string }> = {
  dialogue: { c: forest, i: "💬" }, choice: { c: amber, i: "⎇" }, observation: { c: "#4a6b8a", i: "👁" },
  minigame: { c: red, i: "🎮" }, reveal: { c: violet, i: "✦" }, cg: { c: red, i: "🖼" },
};

export function DayOutline({ o }: { o: DayOutlineT }) {
  if (!o?.beats?.length && !o?.premise) return null;
  return (
    <section style={{ border: `2px solid ${forest}`, background: shade, padding: "11px 13px", marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 14, color: ink, margin: 0 }}>🗒 THE MICRO-ARC OUTLINE <span style={{ fontSize: 10, color: margin, fontWeight: 400 }}>— what this day needs (the honing expands it)</span></h2>
        {o.featuring?.length ? <span style={{ fontSize: 9.5, color: soft }}>👤 {Array.isArray(o.featuring) ? o.featuring.join(" · ") : o.featuring}</span> : null}
      </div>
      {o.premise && <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "3px 0 8px" }}>{o.premise}</p>}
      {o.flashback && (o.flashback.oldYou || o.flashback.newYou) && (
        <div style={{ fontSize: 10, color: soft, lineHeight: 1.5, margin: "0 0 8px", border: `1px solid var(--ink-soft)`, padding: "4px 9px", background: "rgba(122,91,154,.06)" }}>
          ⏮ <b style={{ color: violet }}>flashback{o.flashback.to ? ` → D${o.flashback.to}` : ""}:</b> <span style={{ color: margin }}>the OLD you</span> {o.flashback.oldYou} <b style={{ color: violet }}>→ the NEW you</b> {o.flashback.newYou}
        </div>
      )}

      {/* THE BEAT SEQUENCE */}
      {!!o.beats?.length && (
        <div style={{ borderLeft: `2px solid var(--ink-soft)`, paddingLeft: 10, marginBottom: 8 }}>
          {o.beats.map((b, i) => { const k = KIND[b.kind || "dialogue"] || KIND.dialogue; return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 3, fontSize: 10.5, lineHeight: 1.45 }}>
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".05em", color: margin, minWidth: 56, textTransform: "uppercase" }}>{b.slot}</span>
              <span title={b.kind} style={{ color: k.c, fontWeight: 700, fontSize: 10 }}>{k.i} {b.kind}</span>
              <span style={{ color: soft }}>{b.who ? <b style={{ color: ink }}>{b.who}: </b> : null}{b.gist}{b.bpm ? <span style={{ color: margin }}> · bpm~{b.bpm}</span> : null}</span>
            </div>
          ); })}
        </div>
      )}

      {/* INTERACTION (with the per-path stat trade-offs) + PAYOFF + SOCIAL */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", fontSize: 10, color: soft, lineHeight: 1.5 }}>
        {o.choice && <span><b style={{ color: amber }}>⎇ choice</b> ({o.choice.options}) — {o.choice.gist}</span>}
        {o.statFocus && <span><b style={{ color: "#4a6b8a" }}>📊 {o.statFocus}</b></span>}
        {o.minigame && <span><b style={{ color: red }}>🎮 {o.minigame.engine}</b> — {o.minigame.trigger}</span>}
        {o.cg && <span><b style={{ color: red }}>🖼 CG</b> {o.cg.taxon} @ {o.cg.at}</span>}
        {o.note && <span><b style={{ color: forest }}>♥ note</b> ({o.note.category}) — {o.note.gist}</span>}
      </div>
      {(o.choice?.stats || o.choice?.outcomes) && (
        <div style={{ fontSize: 9.5, color: margin, lineHeight: 1.55, marginTop: 3 }}>
          {(["logical", "passive", "chaotic", "composed"] as const).map((k) => (o.choice!.stats?.[k] || o.choice!.outcomes?.[k]) ? (
            <div key={k}><b style={{ color: ({ logical: forest, passive: "#4a6b8a", chaotic: amber, composed: violet } as const)[k] }}>{({ logical: "L", passive: "P", chaotic: "C", composed: "Co" } as const)[k]}</b> {o.choice!.outcomes?.[k]}{o.choice!.stats?.[k] ? <span style={{ color: "#4a6b8a" }}> [{o.choice!.stats![k]}]</span> : null}</div>
          ) : null)}
        </div>
      )}
      {!!o.props?.length && <div style={{ fontSize: 9.5, color: margin, marginTop: 3 }}>🎒 props: {o.props.join(" · ")}</div>}
      {!!o.rewards?.length && (
        <div style={{ fontSize: 10, color: soft, lineHeight: 1.6, marginTop: 4, borderTop: `1px dashed var(--ink-soft)`, paddingTop: 4 }}>
          {o.rewards.map((r, i) => (
            <span key={i} style={{ marginRight: 12 }}>{r.kind === "achievement" ? "🏆" : "🎒"} <b style={{ color: r.kind === "achievement" ? amber : ink }}>«{r.name}»</b>{r.rarity ? <span style={{ color: margin }}> ({r.rarity})</span> : null}{r.trigger ? <span style={{ color: margin }}> · {r.trigger}</span> : null}{r.pathGate ? <span style={{ color: red }}> · 🔒 {r.pathGate}</span> : null}{r.unlocks ? <span style={{ color: violet }}> → 🔓 {r.unlocks}</span> : null}</span>
          ))}
        </div>
      )}
      {o.social && (o.social.wake || o.social.community) && (
        <div style={{ fontSize: 9.5, color: margin, lineHeight: 1.5, marginTop: 4 }}>{o.social.wake && <span>〜 wake: {o.social.wake} </span>}{o.social.community && <span>· 💬 path: {o.social.community}</span>}</div>
      )}
      {o.hook && <div style={{ fontSize: 10.5, color: forest, lineHeight: 1.5, marginTop: 6, borderTop: `1px dashed var(--ink-soft)`, paddingTop: 5 }}>↪ <b>tomorrow&rsquo;s hook:</b> {o.hook}</div>}
    </section>
  );
}
