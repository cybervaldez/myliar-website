"use client";

// A per-day STRUCTURE drill-down (the deferred per-day mermaid): a small lazy
// client island inside each day in the Events view. Renders the day's
// event→choice trichotomy tree on demand (role-colored; ⚑ sets a flag, ↩ reads
// one, ★ item, 🎲 dice, ⤷ callback scenario). Mermaid loads from CDN at runtime
// only when a day's diagram is opened — keeps the static page light.

import { useState, useRef } from "react";

type MermaidLike = { initialize: (o: Record<string, unknown>) => void; render: (id: string, src: string) => Promise<{ svg: string }> };

export function DayDiagram({ src, uid }: { src: string; uid: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const render = async () => {
    if (loaded || !ref.current) return;
    try {
      const load = new Function("u", "return import(u)") as (u: string) => Promise<{ default: MermaidLike }>;
      const mermaid = (await load("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs")).default;
      mermaid.initialize({ startOnLoad: false, theme: "neutral", flowchart: { htmlLabels: true, curve: "basis" } });
      const { svg } = await mermaid.render(`dd-${uid}`, src);
      if (ref.current) ref.current.innerHTML = svg;
      setLoaded(true);
    } catch (e) {
      if (ref.current) ref.current.textContent = `mermaid error: ${String(e)}`;
    }
  };

  return (
    <div className="mb-2">
      <button
        onClick={() => { const next = !open; setOpen(next); if (next) render(); }}
        className="text-[10px] uppercase tracking-[0.08em] border border-[#a2b1c2] text-[#0645ad] px-2 py-0.5 hover:bg-[#f1f4f8]"
      >
        ◆ {open ? "hide structure" : "structure"}
      </button>
      <div ref={ref} className={`mt-2 overflow-auto border border-[#dee1e6] bg-[#fbfbfb] p-2 ${open ? "" : "hidden"}`} />
    </div>
  );
}
