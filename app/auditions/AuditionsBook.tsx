"use client";

// /auditions — the book UI. Each round is a "book": entries are TABS you flip
// between (page-turn animation), shown as a two-page spread — the AUDITION NOTES
// on the left page, the work on the right — with the review PANEL as a full-width
// board below. Far less vertical than the old stacked accordions.
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
export type NoteSpan = { anchor: string; polarity: "pos" | "neg"; author: string; role: string; note: string; n?: number };
export type Entry = { id: string; markdown: string; panel: PanelArea[] | null; notes: NoteSpan[] | null };
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
type NoteCtx = { notes: NoteSpan[]; consumed: Set<number>; onBadge: (n: number) => void } | null;

function NoteBadge({ note, onClick }: { note: NoteSpan; onClick: () => void }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`wr-badge ${note.polarity === "neg" ? "wr-badge-neg" : "wr-badge-pos"}`}
      title={`${note.author} (${note.role}): ${note.note}`}>{note.n}</button>
  );
}

// em() + inline note badges: split the text at each note's anchor-end and drop a
// numbered badge there (anchors are verbatim substrings; consumed once per entry).
function inlineEm(text: string, ctx: NoteCtx): React.ReactNode {
  if (!ctx || ctx.notes.length === 0) return em(text);
  const hits: { note: NoteSpan; end: number }[] = [];
  for (const note of ctx.notes) {
    if (note.n == null || ctx.consumed.has(note.n)) continue;
    const i = text.indexOf(note.anchor);
    if (i >= 0) hits.push({ note, end: i + note.anchor.length });
  }
  if (hits.length === 0) return em(text);
  hits.sort((a, b) => a.end - b.end);
  hits.forEach((h) => ctx.consumed.add(h.note.n!));
  const out: React.ReactNode[] = [];
  let cursor = 0;
  hits.forEach((h, k) => {
    out.push(<span key={"s" + k}>{em(text.slice(cursor, h.end))}</span>);
    out.push(<NoteBadge key={"b" + k} note={h.note} onClick={() => ctx.onBadge(h.note.n!)} />);
    cursor = h.end;
  });
  out.push(<span key="sEnd">{em(text.slice(cursor))}</span>);
  return out;
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
      out.push(<h4 key={k} style={{ fontFamily: "var(--theme-body)", fontSize: 18, fontWeight: 700, lineHeight: 1.25, margin: "24px 0 8px", color: "var(--forest)", borderBottom: "1px solid var(--ink-soft)", paddingBottom: 5 }}>{inlineEm(b.slice(3), ctx)}</h4>);
    } else if (b.startsWith("# ")) {
      out.push(<h3 key={k} style={{ fontFamily: "var(--theme-body)", fontSize: 20, fontWeight: 700, lineHeight: 1.2, margin: "16px 0 10px", color: "var(--ink)" }}>{inlineEm(b.slice(2), ctx)}</h3>);
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
      out.push(<p key={k} className="aud-narr">{inlineEm(b.slice(1, -1), ctx)}</p>);
    } else {
      out.push(<p key={k} style={{ fontSize: 15, lineHeight: 1.75, margin: "0 0 13px", color: "var(--ink)" }}>{inlineEm(b, ctx)}</p>);
    }
  }
  return out;
}

// AnnotatedWork — renders the pilot WORK with inline AUDIENCE note badges and
// a numbered notes list below it (badge → highlights + scrolls to its note).
function AnnotatedWork({ work, notes }: { work: string; notes: NoteSpan[] | null }) {
  const [selected, setSelected] = useState<number | null>(null);
  const numbered: NoteSpan[] = (notes ?? [])
    .map((nt) => ({ nt, pos: work.indexOf(nt.anchor) }))
    .filter((x) => x.pos >= 0)
    .sort((a, b) => a.pos - b.pos)
    .map((x, i) => ({ ...x.nt, n: i + 1 }));
  const onBadge = (n: number) => {
    setSelected(n);
    const el = typeof document !== "undefined" ? document.getElementById(`wr-note-${n}`) : null;
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  const ctx: NoteCtx = numbered.length ? { notes: numbered, consumed: new Set<number>(), onBadge } : null;
  return (
    <>
      {renderBlocks(work, ctx)}
      {numbered.length > 0 && (
        <div className="wr-notes">
          <div className="wr-notes-hd">▸ THE AUDIENCE — {numbered.length} reactions (who this is for · tap a badge)</div>
          {numbered.map((nt) => (
            <div key={nt.n} id={`wr-note-${nt.n}`}
              className={`wr-note ${nt.polarity === "neg" ? "wr-note-neg" : "wr-note-pos"} ${selected === nt.n ? "wr-note-on" : ""}`}
              onClick={() => setSelected(nt.n ?? null)}>
              <span className="wr-note-n">{nt.n}</span>
              <span className="wr-note-tx"><b>{nt.author}</b> <span style={{ color: "var(--margin-ink)" }}>· {nt.role}</span> — {nt.note}</span>
            </div>
          ))}
        </div>
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

const tabLabel = (id: string) => {
  const m = id.match(/-([A-Z])$/i);
  return m ? m[1].toUpperCase() : id.replace(/-/g, " ").toUpperCase();
};

// ── one round = a book (entry tabs + page-flip spread) ──────────────────────────
function RoundBook({ round, nested }: { round: Round; nested?: boolean }) {
  const PROMPT = -1;
  const [active, setActive] = useState(0);
  const go = (i: number) => setActive(i);

  const e = active >= 0 ? round.entries[active] : null;
  const split = e ? splitEntry(e.markdown) : null;
  const tabs: { i: number; label: string }[] = round.entries.map((en, i) => ({ i, label: tabLabel(en.id) }));
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
              {/* single column, full width (no spread → no left dead space). Notes
                  read as the pitch; the work is the audition itself. */}
              {split!.notes && (
                <div style={{ marginBottom: 18, padding: "12px 15px", background: "var(--paper-shade)", border: "1px solid var(--ink-soft)" }}>
                  <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: "var(--spot-red)", marginBottom: 8 }}>THE AUDITION NOTES</div>
                  {renderBlocks(split!.notes)}
                </div>
              )}
              {/^##\s/m.test(split!.work) && (
                <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: "var(--forest)", margin: "4px 0 2px" }}>
                  ★ THE AUDITION — tap a dialogue box to hear the next line
                </div>
              )}
              <AnnotatedWork work={split!.work} notes={e.notes} />
              {e.panel && e.panel.length > 0 && <PanelReview panel={e.panel} />}
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
