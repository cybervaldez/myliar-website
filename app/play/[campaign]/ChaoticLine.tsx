"use client";

// The Chaotic Line — UGC multiplayer on chaotic choices. Flow is canonical:
//   chaotic select -> ChaoticInput (gate) -> lock in -> outcome shows your line
//                  -> ChaoticOthers ("see what others wrote" -> react / report).
// docs/design/community-discussion.md § "The Chaotic Line" (Gemini-vetted).

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../wiki/supabaseClient";
import { currentUserId } from "../../wiki/supabaseClient";
import { humanizeLexicon } from "../../wiki/wiki-data";
import { visitorToken, REACTIONS, isBlockedContent, chaoticMotif } from "./ugc";

type DV = { runId?: string; contentHash?: string };
const HIDE_BELOW = -5; // a line shows while score > HIDE_BELOW (matches the SQL view)

// ── The input GATE (shown after a chaotic pick, BEFORE the outcome resolves) ─────────
// The textbox is pre-filled with ONE of a POOL of candidate lines (a 🎲 rerolls another),
// so there's a sense of choice even if you don't type — and the SHARED pool stays varied
// (no single default dominates the discussion). Only a TYPED line (not any house candidate)
// is shared. The initial pick is deterministic from the run seed (SSR-safe, varied per run).
export function ChaoticInput({ anchor, campaign, campaignKey, version, defaultLine, options, seed, onLockIn }: {
  anchor: string; campaign: string; campaignKey: string; version?: DV;
  defaultLine: string; options?: string[]; seed?: string; onLockIn: (line: string) => void;
}) {
  const m = chaoticMotif(campaignKey);
  const pool = (options && options.length ? options : [defaultLine]).filter((s) => s && s.trim());
  const start = (() => {
    if (pool.length <= 1) return 0;
    const s = `${seed ?? ""}:${anchor}`;
    let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h % pool.length;
  })();
  const [text, setText] = useState(pool[start] ?? "");
  const [idx, setIdx] = useState(start);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reroll = () => {
    if (pool.length < 2) return;
    let n = idx;
    while (n === idx) n = Math.floor(Math.random() * pool.length);
    setIdx(n); setText(pool[n]); setErr(null);
  };

  const lockIn = async () => {
    const body = text.trim();
    if (!body) { setErr("Say something."); return; }
    if (isBlockedContent(body)) { setErr("Let's keep it out of the gutter."); return; }
    setBusy(true);
    // Share ONLY a TYPED line — not any house candidate (so the scripted pool never floods
    // the shared discussion; only real player words go in). Best-effort.
    const isHouse = pool.some((o) => o.trim() === body);
    if (!isHouse) {
      const c = supabase();
      if (c) {
        const author_id = await currentUserId().catch(() => null);
        await c.from("play_chaotic_lines").insert({
          anchor, campaign, data_version: version?.contentHash ?? null,
          body, author_token: visitorToken(), author_id,
        }).then(() => {}, () => {});
      }
    }
    setBusy(false);
    onLockIn(body);
  };

  return (
    <div style={{ marginTop: 8, border: "2px solid var(--spot-red)", padding: "8px 10px", background: "color-mix(in srgb, var(--spot-red) 7%, transparent)" }}>
      <div style={{ fontFamily: "var(--theme-display)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--spot-red)", marginBottom: 6 }}>
        🎲 your move — what do you actually say?
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={280}
          placeholder={campaignKey === "corner" ? "say it — your line…" : "what do you actually say?"}
          style={{ flex: 1, fontFamily: "var(--theme-body)", fontSize: 14, padding: 7, border: "1.5px solid var(--ink-soft)", background: "var(--paper)", color: "var(--ink)", boxSizing: "border-box" }} />
        {pool.length > 1 && (
          <button type="button" disabled={busy} onClick={reroll} title="reroll a different opener" style={diceBtn}>🎲</button>
        )}
      </div>
      <div style={{ fontSize: 10, color: "var(--margin-ink)", marginTop: 4, fontStyle: "italic" }}>{m.inputHint}</div>
      {err && <div style={{ color: "var(--spot-red)", fontSize: 11, marginTop: 2 }}>{err}</div>}
      <button disabled={busy} onClick={lockIn} style={{ ...primaryBtn, marginTop: 6 }}>{busy ? "…" : m.lockIn}</button>
    </div>
  );
}

// ── "See what others wrote" — the link + modal (read pool, react, report) ────────────
type Line = { id: string; body: string; author_token: string; data_version: string | null; score: number };
export function ChaoticOthers({ anchor, campaignKey, version }: { anchor: string; campaignKey: string; version?: DV }) {
  const m = chaoticMotif(campaignKey);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Line[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reactedLocal, setReactedLocal] = useState<Record<string, Set<string>>>({}); // line -> kinds (optimistic)
  const [reportedLocal, setReportedLocal] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    const c = supabase();
    if (!c) { setLoaded(true); return; }
    c.from("play_chaotic_lines_scored").select("id,body,author_token,data_version,score")
      .eq("anchor", anchor).eq("hidden", false).gt("score", HIDE_BELOW)
      .order("created_at", { ascending: false }).limit(40)
      .then(({ data }) => { setRows((data as Line[]) ?? []); setLoaded(true); });
  }, [anchor]);
  useEffect(() => { if (open && !loaded) load(); }, [open, loaded, load]);

  const react = async (lineId: string, kind: string) => {
    setReactedLocal((p) => { const s = new Set(p[lineId] ?? []); s.has(kind) ? s.delete(kind) : s.add(kind); return { ...p, [lineId]: s }; });
    const c = supabase(); if (!c) return;
    const row = { line_id: lineId, reactor_token: visitorToken(), kind };
    const had = reactedLocal[lineId]?.has(kind);
    if (had) await c.from("play_line_reactions").delete().match(row).then(() => {}, () => {});
    else await c.from("play_line_reactions").insert(row).then(() => {}, () => {});
  };

  const report = async (lineId: string) => {
    setReportedLocal((p) => new Set(p).add(lineId)); // instant local hide (UX)
    const c = supabase(); if (!c) return;
    // REAL escalation (not a placebo): record the report reaction (down-score) AND flag
    // the line needs_review. Global hide happens when score crosses; this is the safety path.
    await c.from("play_line_reactions").insert({ line_id: lineId, reactor_token: visitorToken(), kind: "report" }).then(() => {}, () => {});
    await c.from("play_chaotic_lines").update({ needs_review: true }).eq("id", lineId).then(() => {}, () => {});
  };

  return (
    <span style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={linkBtn}>{m.seeOthers}</button>
      {open && (
        <div style={modalCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--theme-display)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--spot-red)" }}>{m.modalTitle}</span>
            <button onClick={() => setOpen(false)} style={{ ...linkBtn, color: "var(--margin-ink)" }}>close ✕</button>
          </div>
          {!loaded ? <div style={dim}>loading…</div>
            : rows.length === 0 ? <div style={{ ...dim, fontStyle: "italic" }}>{m.empty}</div>
            : rows.map((r) => reportedLocal.has(r.id) ? (
              <div key={r.id} style={{ ...dim, fontStyle: "italic", padding: "8px 0", borderBottom: "1px solid var(--ink-soft)" }}>{m.reported}</div>
            ) : (
              <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--ink-soft)" }}>
                <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--ink)" }}>
                  &ldquo;{humanizeLexicon(r.body)}&rdquo;
                  {r.data_version && version?.contentHash && r.data_version !== version.contentHash && (
                    <span style={{ color: "var(--spot-red)", fontSize: 10 }}> · ↺ older version</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 5, alignItems: "center", flexWrap: "wrap" }}>
                  {REACTIONS.map((re) => {
                    const on = reactedLocal[r.id]?.has(re.emoji);
                    return (
                      <button key={re.emoji} onClick={() => react(r.id, re.emoji)} title="react"
                        style={{ ...chip, borderColor: on ? "var(--forest)" : "var(--ink-soft)", background: on ? "color-mix(in srgb, var(--forest) 14%, transparent)" : "transparent" }}>
                        {re.emoji}
                      </button>
                    );
                  })}
                  <button onClick={() => report(r.id)} title="report" style={{ ...chip, marginLeft: "auto", color: "var(--margin-ink)", fontSize: 10 }}>⚑ report</button>
                </div>
              </div>
            ))}
        </div>
      )}
    </span>
  );
}

const primaryBtn: React.CSSProperties = { fontFamily: "var(--theme-body)", fontSize: 13, padding: "6px 14px", cursor: "pointer", border: "2px solid var(--ink-soft)", background: "var(--forest)", color: "var(--paper)" };
const diceBtn: React.CSSProperties = { flex: "0 0 auto", fontSize: 18, lineHeight: 1, padding: "0 10px", cursor: "pointer", border: "1.5px solid var(--ink-soft)", background: "var(--paper)", color: "var(--ink)" };
const linkBtn: React.CSSProperties = { fontFamily: "var(--theme-body)", fontSize: 12, padding: 0, cursor: "pointer", border: "none", background: "none", color: "var(--spot-red)", textDecoration: "underline" };
const chip: React.CSSProperties = { fontFamily: "var(--theme-body)", fontSize: 13, padding: "2px 8px", cursor: "pointer", border: "1.5px solid var(--ink-soft)", background: "transparent", color: "var(--ink)" };
const dim: React.CSSProperties = { fontSize: 12, color: "var(--margin-ink)" };
const modalCard: React.CSSProperties = {
  position: "absolute", left: 0, bottom: "100%", marginBottom: 8, width: 340, maxHeight: 360, overflowY: "auto",
  border: "2px solid var(--ink-soft)", background: "var(--paper)", color: "var(--ink)", padding: 12, zIndex: 30,
  boxShadow: "3px 3px 0 var(--ink-soft)", fontFamily: "var(--theme-body)", textAlign: "left",
};
