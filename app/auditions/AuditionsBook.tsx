"use client";

// /auditions — the book UI. Each round is a "book": entries are TABS you flip
// between (page-turn animation), single column. Reading order is STORY-FIRST: the
// work + its inline AUDIENCE reactions come first; the author's declared AUDITION
// NOTES sit in a collapsed disclosure at the BOTTOM (below the audience), so they
// don't anchor the read — expand to compare experienced-vs-declared. The review
// PANEL (if any) is the full-width board below that.
//
// Font rule (owner, 2026-06-13): theme-display is reserved for SHORT titles only
// (the page h1 + the round title). All headings/labels/body use theme-body.

import { useState } from "react";
import Link from "next/link";
import { VNDialog } from "../lib/voice-motion";

// pull a display name from a "## THE DECKHAND — "Silas"" heading: the proposed
// name (in quotes) if present, else the role text.
function charName(heading: string): string {
  const q = heading.match(/[""]([^""]+)[""]/) || heading.match(/"([^"]+)"/);
  if (q) return q[1];
  return heading.replace(/^##\s*/, "").replace(/—.*$/, "").trim();
}

export type PanelArea = { area: string; team: string; persona: string; pros: string[]; cons: string[] };
export type Review = { author: string; role: string; polarity: "pos" | "neg"; note: string; why?: string; act?: string };
export type Moment = { anchor: string; moment?: string; reviews: Review[]; n?: number };
export type CarrySpan = { expert: string; verdict: "carried" | "partial" | "strayed" | "error"; note: string };
export type Entry = { id: string; markdown: string; panel: PanelArea[] | null; moments: Moment[] | null; carryover?: CarrySpan[] | null };
export type Round = { id: string; closed: boolean; what: string; outcome: string; entries: Entry[]; prompt: string | null };

// ── inline marks ──────────────────────────────────────────────────────────────
function em(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b>
    : p.startsWith("*") && p.length > 2 ? <i key={i}>{p.slice(1, -1)}</i>
    : p);
}

// ── AUDIENCE span-anchored notes — a numbered badge after a verbatim anchor, green
// (lands for me) / red (pushes me away); each carries a TARGET-AUDIENCE persona's
// reaction (the concept's WHO-THIS-IS-FOR reads the pilot, since the reader judges tone).
type NoteCtx = { moments: Moment[]; consumed: Set<number>; onBadge: (n: number | null) => void; selected: number | null } | null;

// the consensus across a moment's blind reviews — all-warm (green), all-cool (red), or split (amber).
const consensus = (rs: Review[]): "pos" | "neg" | "split" => {
  const p = rs.filter((r) => r.polarity === "pos").length;
  return p === rs.length ? "pos" : p === 0 ? "neg" : "split";
};
const consClass = (c: string) => (c === "neg" ? "wr-badge-neg" : c === "split" ? "wr-badge-split" : "wr-badge-pos");
const readerShort = (author: string) => author.replace(/^the one who\s+/i, "").trim();

// One numbered badge per MOMENT, coloured by the readers' CONSENSUS (green all-warm / red
// all-cool / amber split) — so a split moment reads as contested at a glance, before you open it.
function NoteBadge({ m, active, onClick }: { m: Moment; active: boolean; onClick: () => void }) {
  const c = consensus(m.reviews);
  const warm = m.reviews.filter((r) => r.polarity === "pos").length;
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`wr-badge ${consClass(c)}${active ? " wr-badge-on" : ""}`}
      title={`${m.moment ?? m.anchor} — ${warm}/${m.reviews.length} readers warm`}>{m.n}</button>
  );
}

// The in-place popover — a card BELOW the referenced content, TABBED by reader: every
// WHO-THIS-IS-FOR band reviewed this exact moment BLIND (never seeing the others), so the tabs
// are independent perspectives. Tab title = the reader + their 🟢/🔴 verdict; the page dims around it.
function MomentPopover({ m, onClose }: { m: Moment; onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const r = m.reviews[tab] ?? m.reviews[0];
  if (!r) return null;
  return (
    <div className="aud-pop aud-pop-tabbed" onClick={(e) => e.stopPropagation()}>
      <div className="aud-pop-hd">
        <span className="wr-note-n">{m.n}</span>
        <span className="aud-pop-by"><b>{m.moment ?? "this moment"}</b></span>
        <button className="aud-pop-x" onClick={onClose} aria-label="close">×</button>
      </div>
      <div className="aud-pop-tabs">
        {m.reviews.map((rv, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`aud-tab ${rv.polarity === "neg" ? "aud-tab-neg" : "aud-tab-pos"}${i === tab ? " aud-tab-on" : ""}`}
            title={`${readerShort(rv.author)} · ${rv.role}`}>
            {readerShort(rv.author)} {rv.polarity === "neg" ? "🔴" : "🟢"}
          </button>
        ))}
      </div>
      <div className={`aud-pop-body ${r.polarity === "neg" ? "aud-pop-neg" : "aud-pop-pos"}`}>
        <div className="aud-pop-tx"><b>{readerShort(r.author)}</b> <span style={{ color: "var(--margin-ink)" }}>· {r.role}</span> — {r.note}</div>
        {r.why && (
          <div className="aud-pop-read">
            <span className="aud-read-lbl">▸ THE WHY</span> {r.why}
          </div>
        )}
        {r.act && (
          <div className="aud-pop-read">
            <span className={`aud-read-lbl ${r.polarity === "neg" ? "aud-lbl-fix" : "aud-lbl-keep"}`}>▸ {r.polarity === "neg" ? "THE FIX" : "THE KEEP"}</span> {r.act.replace(/^THE (?:FIX|KEEP)\s*[—–-]\s*/, "")}
          </div>
        )}
      </div>
    </div>
  );
}

// em() + inline note badges: split the text at each note's anchor-end and drop a numbered
// badge there. Returns the nodes AND the SELECTED note iff its anchor is in this block (so
// the caller can light the block + render the popover below it).
function inlineEm(text: string, ctx: NoteCtx): { nodes: React.ReactNode; sel: Moment | null } {
  if (!ctx || ctx.moments.length === 0) return { nodes: em(text), sel: null };
  const hits: { m: Moment; end: number }[] = [];
  for (const m of ctx.moments) {
    if (m.n == null || ctx.consumed.has(m.n)) continue;
    const i = text.indexOf(m.anchor);
    if (i >= 0) hits.push({ m, end: i + m.anchor.length });
  }
  if (hits.length === 0) return { nodes: em(text), sel: null };
  hits.sort((a, b) => a.end - b.end);
  let sel: Moment | null = null;
  hits.forEach((h) => { ctx.consumed.add(h.m.n!); if (h.m.n === ctx.selected) sel = h.m; });
  const out: React.ReactNode[] = [];
  let cursor = 0;
  hits.forEach((h, k) => {
    out.push(<span key={"s" + k}>{em(text.slice(cursor, h.end))}</span>);
    out.push(<NoteBadge key={"b" + k} m={h.m} active={h.m.n === ctx.selected}
      onClick={() => ctx.onBadge(h.m.n === ctx.selected ? null : h.m.n!)} />);
    cursor = h.end;
  });
  out.push(<span key="sEnd">{em(text.slice(cursor))}</span>);
  return { nodes: out, sel };
}

const VM_PRESET_RE = /\b(DRILL|LEDGER|SERVICE|NARRATOR|COUNT-IN|RED PEN|STRAIGHT READ|MIRROR|ANCHOR|ROPE|KINDLE|CHALK|TWO CUPS|FULL PRICE|COIL|SURFACE|LADLE|RULED INK)\b/;

// Split an entry into { title, notes, work }. Notes = THE AUDITION NOTES … up to
// the first `---`; work = the rest. Older entries (concepts) have no notes.
function splitEntry(md: string): { title: string; notes: string; work: string } {
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "";
  const body = md.replace(/^#\s+.+\n?/m, "");
  const ni = body.indexOf("THE AUDITION NOTES");
  if (ni >= 0) {
    const after = body.slice(ni).replace(/^THE AUDITION NOTES:?\s*/, "");
    const di = after.indexOf("\n---");
    if (di >= 0) return { title, notes: after.slice(0, di).trim(), work: after.slice(di + 4).trim() };
  }
  return { title, notes: "", work: body.trim() };
}

// ── block renderer (theme-body everywhere; VOICE blocks animate) ────────────────
// ctx (optional) inserts AUDIENCE note badges into prose + headings.
function renderBlocks(md: string, ctx: NoteCtx = null) {
  const blocks = md.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const out: React.ReactNode[] = [];
  let k = 0;
  let curChar = "the cast"; // tracks the current `## ` character for VN nameplates
  for (let bi = 0; bi < blocks.length; bi++) {
    const b = blocks[bi];
    k++;
    // VOICE block → a VN dialog box, the character performing their lines.
    if (/^\*{0,2}VOICE:?\*{0,2}\s*$/m.test(b.split("\n")[0]) && b.includes("\n")) {
      const lines = b.split("\n").slice(1)
        .map((l) => l.replace(/^[-*•]\s*/, "").replace(/^"|"$/g, "").replace(/\*\*/g, "").trim())
        .filter(Boolean);
      let preset = "";
      for (let j = bi + 1; j < Math.min(bi + 3, blocks.length); j++) {
        if (/VOICE-MOTION/.test(blocks[j])) { preset = blocks[j].match(VM_PRESET_RE)?.[1] ?? ""; break; }
      }
      if (lines.length > 0) { out.push(<VNDialog key={k} name={curChar} lines={lines} preset={preset || "COIL"} />); continue; }
    }
    if (b.startsWith("## ")) {
      curChar = charName(b);
      out.push(<h4 key={k} style={{ fontFamily: "var(--theme-body)", fontSize: 18, fontWeight: 700, lineHeight: 1.25, margin: "24px 0 8px", color: "var(--forest)", borderBottom: "1px solid var(--ink-soft)", paddingBottom: 5 }}>{inlineEm(b.slice(3), ctx).nodes}</h4>);
    } else if (b.startsWith("# ")) {
      out.push(<h3 key={k} style={{ fontFamily: "var(--theme-body)", fontSize: 20, fontWeight: 700, lineHeight: 1.2, margin: "16px 0 10px", color: "var(--ink)" }}>{inlineEm(b.slice(2), ctx).nodes}</h3>);
    } else if (b === "---") {
      out.push(<hr key={k} style={{ border: "none", borderTop: "1px solid var(--ink-soft)", margin: "16px 0" }} />);
    } else if (/^[A-Z][A-Z '&-]+:/.test(b)) {
      const lines = b.split("\n");
      out.push(
        <div key={k} style={{ margin: "0 0 11px" }}>
          {lines.map((l, i) => {
            const m = l.match(/^([A-Z][A-Z '&-]+):\s*([\s\S]*)$/);
            if (m) return (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 5px" }}>
                <span style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", color: "var(--forest)", display: "block" }}>{m[1]}</span>
                <span style={{ color: "var(--ink)" }}>{em(m[2])}</span>
              </p>
            );
            return <p key={i} style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 3px", color: "var(--ink-soft)" }}>{em(l.replace(/^[-•]\s*/, "· "))}</p>;
          })}
        </div>
      );
    } else if (/^(\d+\.|-)\s/.test(b)) {
      out.push(
        <div key={k} style={{ margin: "0 0 11px" }}>
          {b.split("\n").map((l, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 4px", paddingLeft: 14, textIndent: -10, color: "var(--ink)" }}>{em(l.replace(/^(-|\d+\.)\s*/, "· "))}</p>
          ))}
        </div>
      );
    } else if (b.length > 2 && b.startsWith("*") && b.endsWith("*") && !b.slice(1, -1).includes("*")) {
      // a fully-italic standalone paragraph = a NARRATOR beat (the log / aside voice,
      // narrator.md) — styled distinct from the prose + the "you" perception; badges
      // still insert (the * is stripped, so inlineEm runs on plain text).
      const rn = inlineEm(b.slice(1, -1), ctx);
      out.push(<p key={k} className={"aud-narr" + (rn.sel ? " aud-lit" : "")}>{rn.nodes}</p>);
      if (rn.sel && ctx) out.push(<MomentPopover key={k + "p"} m={rn.sel} onClose={() => ctx.onBadge(null)} />);
    } else {
      const rp = inlineEm(b, ctx);
      out.push(<p key={k} className={rp.sel ? "aud-lit" : undefined} style={{ fontSize: 15, lineHeight: 1.75, margin: "0 0 13px", color: "var(--ink)" }}>{rp.nodes}</p>);
      if (rp.sel && ctx) out.push(<MomentPopover key={k + "p"} m={rp.sel} onClose={() => ctx.onBadge(null)} />);
    }
  }
  return out;
}

// ── THE SCOREBOARD — the pilot scored on the aspects that matter, with a weighted TOTAL and a
// summary of what drove it. Computed (reproducible) from the AUDIENCE reviews (fit) + the
// CARRY-OVER panel (continuity with the concept's picks). The expanded headline; the detail lives
// in the collapsed sections beneath. Weights per `campaign-master-checklist.md` Phase 0d. ──
const grade = (s: number) => (s >= 85 ? "#3f8f3f" : s >= 70 ? "#c08a2e" : "var(--spot-red)");
function Scoreboard({ moments, carryover }: { moments: Moment[]; carryover: CarrySpan[] | null }) {
  const reviews = moments.flatMap((m) => m.reviews);
  const pos = reviews.filter((r) => r.polarity === "pos").length;
  const audN = reviews.length;
  const readers = moments[0]?.reviews.length ?? 0;
  const co = carryover ?? [];
  const aspects: { key: string; weight: number; score: number; detail: string }[] = [];
  if (audN) aspects.push({ key: "AUDIENCE FIT", weight: 0.6, score: Math.round((pos / audN) * 100), detail: `${pos}/${audN} reads warm · ${moments.length} moments × ${readers} readers` });
  if (co.length) aspects.push({ key: "CARRY-OVER", weight: 0.4, score: Math.round((co.reduce((s, c) => s + (c.verdict === "carried" ? 1 : c.verdict === "partial" ? 0.5 : 0), 0) / co.length) * 100), detail: `${co.filter((c) => c.verdict === "carried").length}/${co.length} concept picks carried` });
  if (!aspects.length) return null;
  const tw = aspects.reduce((s, a) => s + a.weight, 0);
  const total = Math.round(aspects.reduce((s, a) => s + a.weight * a.score, 0) / tw);
  const drags = [
    ...co.filter((c) => c.verdict !== "carried").map((c) => `${c.expert.toLowerCase()} ${c.verdict}`),
    ...moments.filter((m) => m.reviews.some((r) => r.polarity === "neg")).map((m) => {
      const cool = m.reviews.filter((r) => r.polarity === "neg").length;
      return `"${m.moment ?? m.anchor}" cooled ${cool}/${m.reviews.length}`;
    }),
  ];
  const tone = total >= 85 ? "Strong" : total >= 70 ? "Solid" : "Mixed";
  return (
    <div style={{ border: "2px solid var(--ink)", background: "var(--paper-shade)", margin: "4px 0 16px", padding: "12px 15px 13px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 11 }}>
        <span style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".14em", color: "var(--ink)" }}>THE SCOREBOARD</span>
        <span><b style={{ fontFamily: "var(--theme-display)", fontSize: 27, lineHeight: 1, color: grade(total) }}>{total}</b><span style={{ fontSize: 12, color: "var(--margin-ink)" }}>/100</span></span>
      </div>
      {aspects.map((a) => (
        <div key={a.key} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3, lineHeight: 1.4 }}>
            <span><b>{a.key}</b> <span style={{ color: "var(--margin-ink)" }}>· {Math.round(a.weight * 100)}% · {a.detail}</span></span>
            <b style={{ color: grade(a.score) }}>{a.score}</b>
          </div>
          <div style={{ height: 6, background: "var(--ink-soft)", borderRadius: 3 }}>
            <div style={{ height: 6, width: `${a.score}%`, background: grade(a.score), borderRadius: 3 }} />
          </div>
        </div>
      ))}
      <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: "9px 0 0", lineHeight: 1.5 }}>
        <b style={{ color: "var(--ink)" }}>{tone} pilot.</b> {drags.length ? `Drag on the score: ${drags.join("; ")}.` : "No flags — every reader warm and every concept pick carried."} <span style={{ color: "var(--margin-ink)" }}>(Detail in the sections below.)</span>
      </p>
    </div>
  );
}

// AnnotatedWork — renders the pilot WORK with inline AUDIENCE note badges. Tapping a badge
// opens a POPOVER below the referenced content and DIMS the rest of the page (distraction-
// free read; no scroll jump). The numbered list below is the read-all alternative view.
function AnnotatedWork({ work, moments, carryover }: { work: string; moments: Moment[] | null; carryover?: CarrySpan[] | null }) {
  const [selected, setSelected] = useState<number | null>(null);
  const numbered: Moment[] = (moments ?? [])
    .map((mt) => ({ mt, pos: work.indexOf(mt.anchor) }))
    .filter((x) => x.pos >= 0)
    .sort((a, b) => a.pos - b.pos)
    .map((x, i) => ({ ...x.mt, n: i + 1 }));
  const ctx: NoteCtx = numbered.length ? { moments: numbered, consumed: new Set<number>(), onBadge: setSelected, selected } : null;
  const readers = numbered[0]?.reviews.length ?? 0;
  return (
    <>
      {/* dim backdrop — fade the rest of the page; the lit content + popover sit above it */}
      {selected != null && <div className="aud-dim" onClick={() => setSelected(null)} />}
      {renderBlocks(work, ctx)}
      {(numbered.length > 0 || (carryover && carryover.length > 0)) && <Scoreboard moments={numbered} carryover={carryover ?? null} />}
      {numbered.length > 0 && (
        <details className="wr-notes">
          <summary className="wr-notes-hd" style={{ cursor: "pointer", listStyle: "none" }}>▸ THE AUDIENCE — {numbered.length} moments × {readers} blind reader perspectives (tap a badge to spotlight, or expand to read them all)</summary>
          {numbered.map((mt) => {
            const c = consensus(mt.reviews);
            const warm = mt.reviews.filter((r) => r.polarity === "pos").length;
            return (
              <div key={mt.n}
                className={`wr-note ${c === "neg" ? "wr-note-neg" : c === "split" ? "wr-note-split" : "wr-note-pos"} ${selected === mt.n ? "wr-note-on" : ""}`}
                onClick={() => setSelected(selected === mt.n ? null : (mt.n ?? null))}>
                <span className="wr-note-n">{mt.n}</span>
                <span className="wr-note-tx">
                  <b>{mt.moment ?? mt.anchor}</b> <span style={{ color: "var(--margin-ink)" }}>· {warm}/{mt.reviews.length} readers warm</span>
                  {mt.reviews.map((r, ri) => (
                    <span key={ri} className="wr-note-read">
                      <span className={`aud-read-lbl ${r.polarity === "neg" ? "aud-lbl-fix" : "aud-lbl-keep"}`}>{r.polarity === "neg" ? "🔴" : "🟢"} {readerShort(r.author)}</span> {r.note}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </details>
      )}
    </>
  );
}

// ── the review panel — pros/cons by area, full-width board below the spread ─────
function PanelReview({ panel }: { panel: PanelArea[] }) {
  return (
    <details style={{ border: "1px dashed var(--forest)", background: "var(--paper)", marginTop: 16 }}>
      <summary style={{ cursor: "pointer", padding: "11px 13px", fontFamily: "var(--theme-body)", fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em", color: "var(--forest)", listStyle: "none" }}>
        ▸ THE PANEL — game designers + storywriters weigh in ({panel.length} areas)
      </summary>
      <div style={{ padding: "0 14px 14px" }}>
        <p style={{ fontSize: 12, color: "var(--margin-ink)", fontStyle: "italic", margin: "0 0 12px" }}>
          Advisory pros &amp; cons by area — the panel never ranks or picks; it surfaces, you decide.
        </p>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
          {panel.map((a) => (
            <div key={a.area}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 13.5, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{a.area}</div>
              <div style={{ fontSize: 9.5, letterSpacing: ".08em", color: "var(--margin-ink)", textTransform: "uppercase", marginBottom: 5 }}>{a.persona} · {a.team}</div>
              {a.pros.map((p, i) => <p key={`p${i}`} style={{ fontSize: 12.5, lineHeight: 1.5, margin: "0 0 3px", color: "var(--ink)" }}><span style={{ color: "#5a8a3a", fontWeight: 700 }}>+ </span>{p}</p>)}
              {a.cons.map((c, i) => <p key={`c${i}`} style={{ fontSize: 12.5, lineHeight: 1.5, margin: "0 0 3px", color: "var(--ink-soft)" }}><span style={{ color: "var(--spot-red)", fontWeight: 700 }}>− </span>{c}</p>)}
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

// ── the carry-over panel — the concept's PICKS as experts, each judging whether the pilot
// CARRIES its locked element (carried/partial/strayed). Blind + cross-model; a flag = weak flow. ──
function CarryOverPanel({ carryover }: { carryover: CarrySpan[] }) {
  const ico = (v: string) => (v === "carried" ? "✓" : v === "partial" ? "◐" : "✗");
  const col = (v: string) => (v === "carried" ? "#3f8f3f" : v === "partial" ? "#c08a2e" : "var(--spot-red)");
  const flags = carryover.filter((c) => c.verdict !== "carried").length;
  return (
    <details style={{ border: "1px dashed var(--ink-soft)", background: "var(--paper)", marginTop: 12 }}>
      <summary style={{ cursor: "pointer", padding: "11px 13px", fontFamily: "var(--theme-body)", fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em", color: "var(--ink-soft)", listStyle: "none" }}>
        ▸ CARRY-OVER GATE — the concept&apos;s picks check this pilot ({flags ? `${flags} flag${flags > 1 ? "s" : ""}` : "all carried"})
      </summary>
      <div style={{ padding: "0 14px 14px" }}>
        <p style={{ fontSize: 12, color: "var(--margin-ink)", fontStyle: "italic", margin: "0 0 10px" }}>
          Each concept pick is an expert — does the pilot carry it, or stray? Generated blind + cross-model.
        </p>
        {carryover.map((c) => (
          <div key={c.expert} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
            <span style={{ color: col(c.verdict), fontWeight: 700, fontSize: 13, minWidth: 14 }}>{ico(c.verdict)}</span>
            <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              <b style={{ letterSpacing: ".06em" }}>{c.expert}</b>
              <span style={{ color: col(c.verdict), textTransform: "uppercase", fontSize: 9.5, letterSpacing: ".08em", margin: "0 6px" }}>{c.verdict}</span>
              <span style={{ color: "var(--ink-soft)" }}>{c.note}</span>
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}

const tabLabel = (id: string) => {
  const m = id.match(/-([A-Z])$/i);
  return m ? m[1].toUpperCase() : id.replace(/-/g, " ").toUpperCase();
};
// Prefer a tab label that says what the entry IS — the leading phrase of "THE TONE — …"
// (e.g. "Brisk-tender", "Lyrical-hush") — falling back to the A/B/C/D letter.
const toneLabel = (md: string): string | null => {
  const m = md.match(/THE TONE\s*[—-]\s*([^.—\n]+)/i);
  return m ? m[1].trim().toUpperCase() : null;
};

// ── one round = a book (entry tabs + page-flip spread) ──────────────────────────
function RoundBook({ round, nested }: { round: Round; nested?: boolean }) {
  const PROMPT = -1;
  const [active, setActive] = useState(0);
  const go = (i: number) => setActive(i);

  const e = active >= 0 ? round.entries[active] : null;
  const split = e ? splitEntry(e.markdown) : null;
  const tabs: { i: number; label: string }[] = round.entries.map((en, i) => ({ i, label: toneLabel(en.markdown) ?? tabLabel(en.id) }));
  if (round.prompt) tabs.push({ i: PROMPT, label: "PROMPT" });

  return (
    <div style={{ border: nested ? "none" : "2px solid var(--ink)", background: "var(--paper-shade)" }}>
      {/* book header (skipped when nested — the closed-round summary shows it) */}
      {!nested && (
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ fontFamily: "var(--theme-display)", fontSize: 18, lineHeight: 1.1, color: "var(--ink)" }}>{round.id.replace(/-/g, " ").toUpperCase()}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.45, marginTop: 3 }}>{round.what}</div>
          {round.outcome && <div style={{ fontSize: 11.5, color: round.closed ? "var(--margin-ink)" : "var(--forest)", fontStyle: "italic", marginTop: 3 }}>{round.outcome}</div>}
        </div>
      )}

      {/* entry tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "10px 14px 0" }}>
        {tabs.map((t) => (
          <button key={t.i} onClick={() => go(t.i)}
            style={{
              fontFamily: "var(--theme-body)", fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em",
              padding: "6px 14px", cursor: "pointer", borderRadius: "6px 6px 0 0",
              border: "1.5px solid var(--ink)", borderBottom: active === t.i ? "1.5px solid var(--paper)" : "1.5px solid var(--ink)",
              marginBottom: -1.5, position: "relative", zIndex: active === t.i ? 2 : 1,
              background: active === t.i ? "var(--paper)" : "transparent",
              color: active === t.i ? (t.i === PROMPT ? "var(--margin-ink)" : "var(--forest)") : "var(--ink-soft)",
            }}>
            {t.i === PROMPT ? "✎ PROMPT" : t.label}
          </button>
        ))}
      </div>

      {/* the page */}
      <div style={{ borderTop: "1.5px solid var(--ink)", background: "var(--paper)", padding: "16px 16px 18px" }}>
        <div key={`${round.id}-${active}`}>
          {e ? (
            <>
              {split!.title && <div style={{ fontFamily: "var(--theme-body)", fontSize: 13, fontWeight: 700, letterSpacing: ".04em", color: "var(--margin-ink)", marginBottom: 12 }}>{split!.title}</div>}
              {/* single column, full width. The WORK is the audition — taste it (and the
                  AUDIENCE reactions) FIRST; the author's declared notes sit collapsed at the
                  bottom (below the audience) so they don't anchor the read. */}
              {/^##\s/m.test(split!.work) && (
                <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: "var(--forest)", margin: "4px 0 2px" }}>
                  ★ THE AUDITION — tap a dialogue box to hear the next line
                </div>
              )}
              <AnnotatedWork work={split!.work} moments={e.moments} carryover={e.carryover} />
              {/* THE AUDITION NOTES — moved BELOW the audience, collapsed by default, so the
                  owner tastes the story + audience reactions first, then expands the author's
                  declared pitch to compare (the experienced-vs-declared gate). */}
              {split!.notes && (
                <details style={{ border: "1px solid var(--ink-soft)", background: "var(--paper-shade)", marginTop: 16 }}>
                  <summary style={{ cursor: "pointer", padding: "11px 13px", fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: "var(--spot-red)", listStyle: "none" }}>
                    ▸ THE AUDITION NOTES — the author&apos;s declared pitch (tone · why · choices · primer touchpoints)
                  </summary>
                  <div style={{ padding: "0 15px 14px" }}>{renderBlocks(split!.notes)}</div>
                </details>
              )}
              {e.panel && e.panel.length > 0 && <PanelReview panel={e.panel} />}
              {e.carryover && e.carryover.length > 0 && <CarryOverPanel carryover={e.carryover} />}
              {/* page-flip arrows */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, borderTop: "1px solid var(--ink-soft)", paddingTop: 10 }}>
                <button disabled={active <= 0} onClick={() => go(active - 1)} style={flipBtn(active <= 0)}>◀ prev</button>
                <span style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--margin-ink)" }}>{active + 1} / {round.entries.length}</span>
                <button disabled={active >= round.entries.length - 1} onClick={() => go(active + 1)} style={flipBtn(active >= round.entries.length - 1)}>next ▶</button>
              </div>
            </>
          ) : (
            <pre style={{ fontSize: 11.5, lineHeight: 1.55, whiteSpace: "pre-wrap", color: "var(--ink-soft)", fontFamily: "var(--font-geist-mono, monospace)", margin: 0 }}>{round.prompt}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

const flipBtn = (disabled: boolean): React.CSSProperties => ({
  fontFamily: "var(--theme-body)", fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em",
  padding: "5px 14px", cursor: disabled ? "default" : "pointer",
  border: "1.5px solid var(--ink)", background: disabled ? "transparent" : "var(--paper-shade)",
  color: disabled ? "var(--ink-soft)" : "var(--ink)", opacity: disabled ? 0.4 : 1,
});

export default function AuditionsBook({ rounds }: { rounds: Round[] }) {
  const active = rounds.filter((r) => !r.closed);
  const closed = rounds.filter((r) => r.closed);
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 80px" }}>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".3em", color: "var(--spot-red)" }}>BLIND AUDITIONS</div>
      <h1 style={{ fontFamily: "var(--theme-display)", fontSize: 32, lineHeight: 1.05, margin: "4px 0 10px" }}>The audition rounds</h1>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 6px", maxWidth: 660 }}>
        Concepts, pilots, and character audits compete here <b>anonymized</b> — multiple authors,
        one prompt, no names attached. Flip between the entries, read the notes and the work
        side by side, weigh the panel&apos;s pros &amp; cons, and judge for yourself.
      </p>
      <p style={{ fontSize: 12.5, color: "var(--margin-ink)", fontStyle: "italic", margin: "0 0 24px" }}>
        Every round carries the exact PROMPT it was generated from (the ✎ tab).{" "}
        <Link href="/" style={{ color: "var(--forest)" }}>← home</Link>
      </p>

      {active.length > 0 && (
        <section style={{ marginBottom: 30 }}>
          <h2 style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".22em", color: "var(--spot-red)", borderBottom: "2px solid var(--ink)", paddingBottom: 6, margin: "0 0 14px" }}>OPEN ROUNDS — your pick is welcome</h2>
          <div style={{ display: "grid", gap: 18 }}>
            {active.map((r) => <RoundBook key={r.id} round={r} />)}
          </div>
        </section>
      )}

      {closed.length > 0 && (
        <section>
          <h2 style={{ fontFamily: "var(--theme-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".22em", color: "var(--spot-red)", borderBottom: "2px solid var(--ink)", paddingBottom: 6, margin: "0 0 14px" }}>DECIDED ROUNDS — the record</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {closed.map((r) => (
              <details key={r.id} style={{ border: "1.5px solid var(--ink-soft)", background: "var(--paper-shade)" }}>
                <summary style={{ cursor: "pointer", padding: "11px 14px", listStyle: "none" }}>
                  <span style={{ fontFamily: "var(--theme-display)", fontSize: 15, color: "var(--ink)" }}>{r.id.replace(/-/g, " ").toUpperCase()}</span>
                  <span style={{ fontSize: 12.5, color: "var(--ink-soft)", display: "block", marginTop: 2 }}>{r.what}</span>
                  {r.outcome && <span style={{ fontSize: 11.5, color: "var(--margin-ink)", fontStyle: "italic", display: "block", marginTop: 2 }}>{r.outcome}</span>}
                </summary>
                <div style={{ padding: "0 10px 10px" }}><RoundBook round={r} nested /></div>
              </details>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
