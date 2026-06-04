"use client";

// Client tab shell for /campaigns/[id] (Option A: Events · Flow · Sheet · Kanban
// · Metrics). The rich Events + Influence views are passed in as server-rendered
// slots; Sheet/Kanban/Metrics render from serializable data; the Flow tab
// lazy-loads mermaid from CDN at runtime ONLY when opened (ux-planner + Gemini:
// the right call — keeps the static page light). Generic across campaigns.

import { useState, useEffect, useRef, type ReactNode } from "react";

export type ViewRow = { day: number; coachId: string; coach: string; color: string; type: string; tier: string; unspoken: boolean; sets: string[]; reads: string[]; events: number };
export type ViewCoach = { id: string; name: string; color: string };
export type ViewMetrics = { days: number; coaches: number; tierUps: number; callbacks: number; unspoken: number; achievements: number };

type Tab = "events" | "flow" | "sheet" | "kanban" | "metrics";
const TABS: { id: Tab; label: string }[] = [
  { id: "events", label: "Events" },
  { id: "flow", label: "Flow ◆" },
  { id: "sheet", label: "Sheet" },
  { id: "kanban", label: "Kanban" },
  { id: "metrics", label: "Metrics" },
];

function MermaidFlow({ web, arc, uid }: { web: string; arc: string; uid: string }) {
  const [mode, setMode] = useState<"web" | "arc">(web ? "web" : "arc");
  const holderRef = useRef<HTMLDivElement>(null);  // gets the <svg>
  const innerRef = useRef<HTMLDivElement>(null);   // sized box (zoom)
  const viewportRef = useRef<HTMLDivElement>(null); // scroll/pan window
  const pan = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);
  const [vb, setVb] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [err, setErr] = useState("");

  useEffect(() => {
    const src = mode === "web" ? web : arc;
    setErr("");
    if (!src.trim()) { if (holderRef.current) holderRef.current.innerHTML = ""; setVb({ w: 0, h: 0 }); return; }
    let cancelled = false;
    (async () => {
      try {
        type MermaidLike = { initialize: (o: Record<string, unknown>) => void; render: (id: string, src: string) => Promise<{ svg: string }> };
        const load = new Function("u", "return import(u)") as (u: string) => Promise<{ default: MermaidLike }>;
        const mermaid = (await load("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs")).default;
        mermaid.initialize({ startOnLoad: false, theme: "neutral", flowchart: { curve: "basis", htmlLabels: true } });
        const { svg } = await mermaid.render(`mer-${uid}-${mode}-${Date.now()}`, src);
        if (cancelled || !holderRef.current) return;
        holderRef.current.innerHTML = svg;
        const el = holderRef.current.querySelector("svg");
        if (el) {
          const vbAttr = (el.getAttribute("viewBox") || "0 0 800 400").split(/\s+/).map(Number);
          el.removeAttribute("style"); el.style.width = "100%"; el.style.height = "100%"; el.style.display = "block";
          setVb({ w: vbAttr[2] || 800, h: vbAttr[3] || 400 });
          // fit-to-width on (re)render
          const vpW = viewportRef.current?.clientWidth ?? 800;
          setZoom(Math.min(2, Math.max(0.5, vpW / (vbAttr[2] || 800))));
          if (viewportRef.current) { viewportRef.current.scrollLeft = 0; viewportRef.current.scrollTop = 0; }
        }
      } catch (e) { if (!cancelled) setErr(String(e)); }
    })();
    return () => { cancelled = true; };
  }, [mode, web, arc, uid]);

  const onDown = (e: React.PointerEvent) => {
    const vp = viewportRef.current; if (!vp) return;
    pan.current = { x: e.clientX, y: e.clientY, sl: vp.scrollLeft, st: vp.scrollTop };
    vp.setPointerCapture(e.pointerId); vp.style.cursor = "grabbing";
  };
  const onMove = (e: React.PointerEvent) => {
    const vp = viewportRef.current; if (!vp || !pan.current) return;
    vp.scrollLeft = pan.current.sl - (e.clientX - pan.current.x);
    vp.scrollTop = pan.current.st - (e.clientY - pan.current.y);
  };
  const onUp = () => { pan.current = null; if (viewportRef.current) viewportRef.current.style.cursor = "grab"; };
  const bump = (f: number) => setZoom((z) => Math.min(4, Math.max(0.25, z * f)));
  const fit = () => { const vpW = viewportRef.current?.clientWidth ?? 800; if (vb.w) setZoom(Math.min(2, Math.max(0.25, vpW / vb.w))); };

  const showEmpty = mode === "web" && !web.trim();

  return (
    <div>
      <div className="flex gap-1.5 mb-3 flex-wrap items-center">
        <button onClick={() => setMode("web")} disabled={!web}
          className={`text-[11px] uppercase tracking-[0.08em] px-3 py-1 border ${mode === "web" ? "bg-[#0645ad] text-white border-[#0645ad]" : "border-[#a2b1c2] text-[#0645ad]"} ${!web ? "opacity-40" : ""}`}>Callback web ◆</button>
        <button onClick={() => setMode("arc")}
          className={`text-[11px] uppercase tracking-[0.08em] px-3 py-1 border ${mode === "arc" ? "bg-[#0645ad] text-white border-[#0645ad]" : "border-[#a2b1c2] text-[#0645ad]"}`}>Arc interleave</button>
        {!showEmpty && (
          <span className="ml-auto flex gap-1 items-center text-[12px]">
            <button onClick={() => bump(1 / 1.25)} className="border border-[#a2b1c2] text-[#0645ad] w-7 h-7 leading-none">−</button>
            <span className="text-margin-ink w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => bump(1.25)} className="border border-[#a2b1c2] text-[#0645ad] w-7 h-7 leading-none">+</button>
            <button onClick={fit} className="border border-[#a2b1c2] text-[#0645ad] px-2 h-7 text-[11px] uppercase tracking-[0.06em]">Fit</button>
          </span>
        )}
      </div>
      <p className="text-[12px] text-margin-ink mb-3 leading-[1.5]">
        Whole-campaign. <b>Callback web</b> = the selection→future-dialogue graph — the Influence map made
        visual. <b>Arc interleave</b> = the full coach weave (★ = Unspoken, dashed = a callback, colors = coach).
        <b> Drag to pan, ± to zoom.</b>
      </p>
      {showEmpty ? (
        <p className="text-[13px] text-ink-soft italic border border-[#dee1e6] bg-[#f6f7f9] p-3">No callbacks authored in this campaign yet — selections don&apos;t change a future day. (The Arc interleave still works.)</p>
      ) : (
        <div
          ref={viewportRef}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          className="border border-[#dee1e6] bg-[#fbfbfb] overflow-auto"
          style={{ height: 480, cursor: "grab", touchAction: "none" }}
        >
          <div ref={innerRef} style={{ width: vb.w ? vb.w * zoom : "100%", height: vb.h ? vb.h * zoom : "100%" }}>
            <div ref={holderRef} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}
      {err && <p className="text-[12px] text-spot-red mt-2">mermaid error: {err}</p>}
    </div>
  );
}

export function CampaignTabs({ events, influence, flowWeb, flowArc, rows, coaches, metrics, uid }: {
  events: ReactNode; influence: ReactNode; flowWeb: string; flowArc: string;
  rows: ViewRow[]; coaches: ViewCoach[]; metrics: ViewMetrics; uid: string;
}) {
  const [tab, setTab] = useState<Tab>("events");
  const [sortK, setSortK] = useState<keyof ViewRow>("day");
  const [asc, setAsc] = useState(true);

  const sorted = [...rows].sort((a, b) => {
    const x = a[sortK], y = b[sortK];
    if (typeof x === "number" && typeof y === "number") return asc ? x - y : y - x;
    return asc ? String(x).localeCompare(String(y)) : String(y).localeCompare(String(x));
  });
  const sortBy = (k: keyof ViewRow) => { if (k === sortK) setAsc(!asc); else { setSortK(k); setAsc(true); } };

  return (
    <div>
      <div className="flex gap-0.5 border-b-2 border-[#a2b1c2] flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-[13px] uppercase tracking-[0.04em] px-4 py-2 border border-b-0 border-[#a2b1c2] ${tab === t.id ? "bg-white text-[#202122] font-bold relative top-[2px]" : "bg-[#f6f7f9] text-[#0645ad]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="border border-t-0 border-[#a2b1c2] bg-white p-4">
        {tab === "events" && <div>{events}</div>}

        {tab === "flow" && (
          <div>
            <MermaidFlow web={flowWeb} arc={flowArc} uid={uid} />
            <div className="mt-5 pt-3 border-t border-[#dee1e6]">{influence}</div>
          </div>
        )}

        {tab === "sheet" && (
          <div>
            <p className="text-[12px] text-margin-ink mb-2">Audit the whole arc — click a header to sort. ⚑ sets a callback flag · ↩ reads one.</p>
            <table className="w-full text-[13px] border-collapse">
              <thead><tr>
                {([["day", "Day"], ["coach", "Coach"], ["type", "Type"], ["tier", "Tier-up"], ["sets", "⚑ sets"], ["reads", "↩ reads"]] as [keyof ViewRow, string][]).map(([k, l]) => (
                  <th key={k} onClick={() => sortBy(k)} className="border border-[#dee1e6] bg-[#f6f7f9] px-2 py-1 text-left text-[11px] uppercase tracking-[0.05em] cursor-pointer select-none">
                    {l}{sortK === k ? (asc ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.day}>
                    <td className="border border-[#dee1e6] px-2 py-1">{r.day}</td>
                    <td className="border border-[#dee1e6] px-2 py-1"><span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: r.color }} />{r.coach}</td>
                    <td className="border border-[#dee1e6] px-2 py-1">{r.type}{r.unspoken ? " ★" : ""}</td>
                    <td className="border border-[#dee1e6] px-2 py-1 text-spot-red">{r.tier}</td>
                    <td className="border border-[#dee1e6] px-2 py-1 text-[#8a6d0b] font-bold">{r.sets.join(", ")}</td>
                    <td className="border border-[#dee1e6] px-2 py-1 text-[#8a6d0b] font-bold">{r.reads.length ? "↩ " + r.reads.join(", ") : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "kanban" && (
          <div>
            <p className="text-[12px] text-margin-ink mb-3">By {coaches[0]?.id === "sam" ? "character" : "coach"} — interleave balance + each arc at a glance (★ = Unspoken, ⚑ sets a flag, ↩ reads one).</p>
            <div className="flex gap-3 overflow-x-auto">
              {coaches.map((co) => (
                <div key={co.id} className="flex-1 min-w-[150px]">
                  <div className="text-[11px] uppercase tracking-[0.08em] px-2 py-1.5 text-white font-bold" style={{ background: co.color }}>{co.name}</div>
                  {rows.filter((r) => r.coachId === co.id).map((r) => (
                    <div key={r.day} className="border border-[#dee1e6] border-l-[4px] bg-white px-2 py-1.5 mt-2 text-[12.5px]" style={{ borderLeftColor: co.color }}>
                      D{r.day} · {r.type}{r.unspoken ? " ★" : ""}
                      {r.tier && <span className="inline-block text-[9px] uppercase border border-spot-red text-spot-red px-1 ml-1">{r.tier}</span>}
                      {r.sets.length > 0 && <span className="inline-block text-[9px] border border-[#b8860b] text-[#8a6d0b] px-1 ml-1">⚑</span>}
                      {r.reads.length > 0 && <span className="inline-block text-[9px] border border-[#b8860b] text-[#8a6d0b] px-1 ml-1">↩</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "metrics" && (
          <div>
            <p className="text-[12px] text-margin-ink mb-3">The campaign at a glance.</p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
              {([[metrics.days, "days"], [metrics.coaches, coaches[0]?.id === "sam" ? "characters" : "coaches"], [metrics.tierUps, "tier-up reveals"], [metrics.callbacks, "callbacks"], [metrics.unspoken, "Unspoken destinations"], [metrics.achievements, "achievements granted"]] as [number, string][]).map(([n, l]) => (
                <div key={l} className="border border-[#dee1e6] p-3">
                  <div className="font-display text-[30px] font-bold" style={{ fontFamily: "Georgia, serif" }}>{n}</div>
                  <div className="text-[11px] uppercase tracking-[0.06em] text-margin-ink">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-[0.06em] text-margin-ink mb-1">days per {coaches[0]?.id === "sam" ? "character" : "coach"}</div>
              {coaches.map((co) => {
                const n = rows.filter((r) => r.coachId === co.id).length;
                return (
                  <div key={co.id} className="flex items-center gap-2 text-[12px] my-1">
                    <span className="w-[60px]">{co.name}</span>
                    <span className="h-[14px]" style={{ width: `${n * 30}px`, background: co.color }} />
                    <span>{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
