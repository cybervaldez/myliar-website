"use client";

// Concepts page — the theme-concept slate, with a LAYOUT TOGGLE so you can preview
// table / kanban / cards / list on the real data and pick the one that fits. Default =
// kanban (answers "where does each sit / what do I develop next"). Pure render-from-data.

import { useState } from "react";
import Link from "next/link";

export type Concept = { name: string; slug: string; status: string; gift: string; cast: string; trend: string; note: string; author?: string; parity?: string };
type Layout = "kanban" | "list";

const LAYOUTS: { key: Layout; label: string }[] = [
  { key: "kanban", label: "Kanban" },
  { key: "list", label: "List" },
];

// status string → pipeline column + a glyph
type Col = "Building" | "Committed" | "Exploring" | "Flagged";
function col(status: string): Col {
  const s = status.toLowerCase();
  if (s.includes("building")) return "Building";
  if (s.includes("committed")) return "Committed";
  if (s.includes("flagged")) return "Flagged";
  return "Exploring";
}
function dot(status: string): string {
  return { Building: "●", Committed: "◐", Exploring: "○", Flagged: "⚠" }[col(status)];
}
const COLS: Col[] = ["Building", "Committed", "Exploring", "Flagged"];

export function ConceptsView({ concepts, genreNote, geminiNote }: { concepts: Concept[]; genreNote: string; geminiNote?: string }) {
  const [layout, setLayout] = useState<Layout>("kanban");

  return (
    <div>
      {/* layout toggle */}
      <div className="flex gap-2 flex-wrap mb-5">
        {LAYOUTS.map((l) => (
          <button
            key={l.key}
            onClick={() => setLayout(l.key)}
            className={`font-sans text-[12px] uppercase tracking-[0.08em] px-3 py-1.5 border transition ${layout === l.key ? "bg-[#0645ad] text-white border-[#0645ad]" : "border-[#a2b1c2] text-[#0645ad] hover:bg-[#f1f4f8]"}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {layout === "kanban" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COLS.map((c) => {
            const items = concepts.filter((x) => col(x.status) === c);
            return (
              <div key={c} className="min-w-0">
                <div className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-2">{c} <span className="opacity-60">({items.length})</span></div>
                <div className="space-y-3">
                  {items.map((x) => (
                    <div key={x.name} className="border border-ink/40 bg-paper-shade/40 p-3">
                      <div className="font-display text-[15px]">{dot(x.status)} <Link href={`/concepts/${x.slug}`} className="hover:underline">{x.name}</Link> <span className="font-sans text-[10px] text-margin-ink">peek →</span></div>
                      <div className="font-sans text-[9px] uppercase tracking-[0.08em] text-margin-ink">{x.author}{x.parity && <span className="font-bold ml-1" style={{ color: "#15803d" }}>· parity {x.parity}</span>}</div>
                      <div className="text-[12px] mt-1 leading-[1.4]">{x.gift}</div>
                      <div className="text-[11px] text-ink-soft mt-1 leading-[1.4]">{x.cast}</div>
                      <div className="text-[10px] text-margin-ink mt-1 leading-[1.4]">↑ {x.trend}</div>
                      <div className="text-[10px] text-margin-ink mt-1 italic leading-[1.4]">{x.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {layout === "list" && (
        <ul className="space-y-1">
          {concepts.map((x) => (
            <li key={x.name} className="flex items-baseline gap-2 border-b border-ink/10 py-2 text-[14px]">
              <span className="w-4 shrink-0">{dot(x.status)}</span>
              <Link href={`/concepts/${x.slug}`} className="font-bold whitespace-nowrap hover:underline">{x.name}</Link>
              {x.author && <span className="font-sans text-[9px] uppercase tracking-[0.08em] text-margin-ink whitespace-nowrap">{x.author.split(" ")[0]}</span>}
              <span className="text-ink-soft">— {x.gift}</span>
              <span className="ml-auto font-sans text-[10px] uppercase tracking-[0.08em] text-margin-ink whitespace-nowrap pl-3">{x.status}</span>
            </li>
          ))}
        </ul>
      )}

      {geminiNote && <p className="text-[11px] text-ink-soft mt-8 pt-3 border-t border-ink/15 leading-[1.5] border-l-[3px] border-spot-red pl-3">{geminiNote}</p>}
      <p className="text-[11px] text-margin-ink mt-4 leading-[1.5]">{genreNote}</p>
    </div>
  );
}
