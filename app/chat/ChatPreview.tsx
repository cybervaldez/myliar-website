"use client";

// The chat DESTINATION + LIVE SIM. Pick a character + a REL-tier game-state +
// which notes are in context → the assembled prompt context (editable) → a live
// Gemini chat (via /api/chat-sim, server-side key). Change REL/notes → the
// context regenerates → responses shift. This is the loop for tightening the
// prompt context. Reward-stack build-status stays visible (the endgame gap).

import { useState, useEffect, useMemo, useRef } from "react";
import { buildContext, GATE } from "./sim-context.mjs";

export type ChatChar = {
  id: string; name: string; campaign: "main-line" | "wingman"; campaignTitle: string;
  helpSummary: string; statLane: string; titles: string[]; intimateTitle: string;
  tierNames: string[]; notes: { day: number; text: string; emotion: string | null }[];
};

const STATUS: Record<string, { c: string; l: string }> = {
  wired: { c: "#15803d", l: "WIRED" }, partial: { c: "#b8860b", l: "PARTIAL" },
  authored: { c: "#0645ad", l: "AUTHORED ONLY" }, unwired: { c: "#b81f1c", l: "SPEC'D · NOT WIRED" },
};
function stack(intimate: string): { k: string; s: keyof typeof STATUS }[] {
  return [
    { k: `Intimate title — "${intimate || "—"}"`, s: "wired" },
    { k: "Keepsake (legendary)", s: "wired" },
    { k: "Passive — cross-game buff", s: "partial" },
    { k: "Inversion / peer beat", s: "authored" },
    { k: "Mutual mode — “they reach out”", s: "unwired" },
  ];
}

export function ChatPreview({ chars }: { chars: ChatChar[] }) {
  const [id, setId] = useState(chars[0]?.id ?? "");
  const c = useMemo(() => chars.find((x) => x.id === id) ?? chars[0], [chars, id]);
  const maxTier = (c?.tierNames.length ?? 10) - 1;
  const [tier, setTier] = useState(maxTier);
  // default in-context notes = the ~3 most recent (matching the digest)
  const defaultNotes = useMemo(() => new Set(c ? c.notes.map((_, i) => i).slice(-3) : []), [c]);
  const [sel, setSel] = useState<Set<number>>(defaultNotes);
  const [ctx, setCtx] = useState("");
  const [dirty, setDirty] = useState(false);
  const [msgs, setMsgs] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  // character change → reset
  useEffect(() => { setTier(maxTier); setSel(defaultNotes); setMsgs([]); setErr(""); setDirty(false); /* eslint-disable-next-line */ }, [id]);
  // regenerate context from state unless the user has edited it
  const selNotes = useMemo(() => (c ? c.notes.filter((_, i) => sel.has(i)) : []), [c, sel]);
  useEffect(() => { if (!dirty && c) setCtx(buildContext(c, tier, selNotes)); }, [c, tier, selNotes, dirty]);
  useEffect(() => { scroller.current?.scrollTo(0, scroller.current.scrollHeight); }, [msgs, loading]);

  if (!c) return null;
  const atUnspoken = tier >= maxTier;

  async function send() {
    const t = input.trim(); if (!t || loading) return;
    const next = [...msgs, { role: "user" as const, text: t }];
    setMsgs(next); setInput(""); setLoading(true); setErr("");
    try {
      const r = await fetch("/api/chat-sim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context: ctx, messages: next }) });
      const j = await r.json();
      if (j.error) setErr(j.error); else setMsgs([...next, { role: "model", text: j.reply }]);
    } catch (e) { setErr(String(e)); } finally { setLoading(false); }
  }

  return (
    <div>
      {/* picker */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["main-line", "wingman"].map((cam) => (
          <div key={cam} className="flex gap-1.5 flex-wrap items-center">
            <span className="text-[10px] uppercase tracking-[0.1em] text-margin-ink mr-1">{cam === "wingman" ? "The Wingman" : "Life Ops"}</span>
            {chars.filter((x) => x.campaign === cam).map((x) => (
              <button key={x.id} onClick={() => setId(x.id)} className={`text-[12px] px-2.5 py-1 border ${x.id === id ? "bg-[#0645ad] text-white border-[#0645ad]" : "border-[#a2b1c2] text-[#0645ad]"}`}>{x.name}</button>
            ))}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* LEFT — game-state that feeds the context */}
        <div className="space-y-4">
          <div className="border border-[#a2b1c2] bg-[#f6f7f9] p-3">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[11px] uppercase tracking-[0.1em] text-[#54595d]">REL tier</span>
              <span className="font-display text-[18px]" style={{ fontFamily: "Georgia, serif" }}>{c.tierNames[tier]}{atUnspoken ? " ★" : ""}</span>
            </div>
            <input type="range" min={0} max={maxTier} value={tier} onChange={(e) => setTier(Number(e.target.value))} className="w-full" />
            <div className="text-[10px] text-margin-ink mt-1">{GATE[c.campaign].label} · {c.helpSummary.slice(0, 90)}…</div>
          </div>

          <div className="border border-[#a2b1c2] bg-white p-3">
            <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#15803d] mb-1">notes in context · {sel.size}/{c.notes.length} (the digest surfaces ~3)</div>
            <div className="space-y-1 max-h-[200px] overflow-auto">
              {c.notes.length === 0 ? <p className="text-[12px] text-margin-ink italic">No notes — chat works but the note-factory hasn&apos;t run.</p> :
                c.notes.map((n, i) => (
                  <label key={i} className="flex gap-1.5 text-[11.5px] text-ink-soft leading-[1.4] cursor-pointer">
                    <input type="checkbox" checked={sel.has(i)} onChange={() => { const s = new Set(sel); s.has(i) ? s.delete(i) : s.add(i); setSel(s); setDirty(false); }} className="mt-0.5 shrink-0" />
                    <span><span className="text-[9px] text-margin-ink uppercase">D{n.day}</span> {n.text.slice(0, 120)}{n.text.length > 120 ? "…" : ""}</span>
                  </label>
                ))}
            </div>
          </div>

          <div className="border border-[#eef0f2] p-3">
            <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#8a6d0b] mb-1">Unspoken reward stack · build-status</div>
            {stack(c.intimateTitle).map((s) => (
              <div key={s.k} className="flex items-baseline justify-between gap-2 text-[11.5px] py-0.5">
                <span className="text-ink">{s.k}</span>
                <span className="text-[8.5px] uppercase tracking-[0.05em] px-1 border shrink-0" style={{ color: STATUS[s.s].c, borderColor: STATUS[s.s].c }}>{STATUS[s.s].l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — the assembled context + live chat */}
        <div className="space-y-3">
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-spot-red">the context fed to the LLM {dirty ? "(edited)" : "(auto from REL + notes)"}</span>
              {dirty && <button onClick={() => { setDirty(false); setCtx(buildContext(c, tier, selNotes)); }} className="text-[10px] text-[#0645ad] underline">regenerate</button>}
            </div>
            <textarea value={ctx} onChange={(e) => { setCtx(e.target.value); setDirty(true); }} spellCheck={false}
              className="w-full h-[200px] text-[11.5px] font-mono leading-[1.45] border border-[#a2b1c2] p-2 bg-[#fbfbfb]" />
          </div>

          <div className="border-[1.5px] border-ink bg-white flex flex-col" style={{ height: 320 }}>
            <div className="bg-[#202122] text-white px-3 py-1.5 text-[12px] flex justify-between items-baseline">
              <span>{c.name} · {c.tierNames[tier]}</span>
              <button onClick={() => { setMsgs([]); setErr(""); }} className="text-[10px] text-[#bbb] underline">clear</button>
            </div>
            <div ref={scroller} className="flex-1 overflow-auto p-3 space-y-2">
              {msgs.length === 0 && <p className="text-[12px] text-margin-ink italic">Say something to {c.name}. Change the REL tier or notes, then chat again to feel the context shift.</p>}
              {msgs.map((m, i) => (
                <div key={i} className={`text-[13px] leading-[1.45] ${m.role === "user" ? "text-right" : ""}`}>
                  <span className={`inline-block px-2.5 py-1.5 max-w-[85%] ${m.role === "user" ? "bg-[#0645ad] text-white" : "bg-[#f0f1f3] text-ink"}`}>{m.text}</span>
                </div>
              ))}
              {loading && <p className="text-[12px] text-margin-ink italic">{c.name} is typing…</p>}
              {err && <p className="text-[12px] text-spot-red">⚠ {err}</p>}
            </div>
            <div className="border-t border-[#dee1e6] p-2 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder={`message ${c.name}…`} className="flex-1 text-[13px] border border-[#a2b1c2] px-2 py-1" />
              <button onClick={send} disabled={loading} className="text-[12px] uppercase tracking-[0.06em] px-3 bg-[#0645ad] text-white disabled:opacity-50">send</button>
            </div>
          </div>
          <p className="text-[10.5px] text-margin-ink leading-[1.5]">Live chat needs <code>GEMINI_API_KEY</code> in the server env (Vercel project env, or a local <code>.env</code>). The key stays server-side (never the browser). Edit the context above to test/tighten the prompt; change REL/notes to watch the voice shift.</p>
        </div>
      </div>
    </div>
  );
}
