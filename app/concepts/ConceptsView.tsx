"use client";

// Concepts page — the theme-concept slate, with a LAYOUT TOGGLE so you can preview
// table / kanban / cards / list on the real data and pick the one that fits. Default =
// kanban (answers "where does each sit / what do I develop next"). Pure render-from-data.

import { useState } from "react";
import Link from "next/link";

export type RecRead = { id: string; why: string };
export type ShelfItem = { title: string | null; creator?: string | null; medium: string; coverageBrief: string; status: string; monetized?: boolean };
export type Concept = {
  name: string; slug: string; status: string; gift: string; cast: string; note: string;
  trend?: string; source?: string; legs?: string; keep?: string; author?: string; parity?: string;
  sourceCategory?: string; sourceCategoryWhy?: string;
  collection?: string; collectionNote?: string; recommendedReads?: RecRead[]; realShelf?: ShelfItem[];
};
type Layout = "kanban" | "shelves" | "list";

const LAYOUTS: { key: Layout; label: string }[] = [
  { key: "kanban", label: "Kanban" },
  { key: "shelves", label: "Shelves" },
  { key: "list", label: "List" },
];

// sourceCategory (the conception driver — source-anchored-concepts §SOURCE TAXONOMY) → a chip
const CAT_STYLE: Record<string, string> = {
  original: "border-forest text-forest",
  inspiration: "border-[#0645ad] text-[#0645ad]",
  audience: "border-spot-red text-spot-red",
};
function CatChip({ cat, why }: { cat?: string; why?: string }) {
  if (!cat) return null;
  return (
    <span title={why} className={`inline-block align-middle font-sans text-[8.5px] uppercase tracking-[0.1em] border px-1 py-[1px] ${CAT_STYLE[cat] ?? "border-ink/40 text-margin-ink"}`}>
      {cat === "inspiration" ? "⚓ inspiration" : cat}
    </span>
  );
}
function shelfTitle(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()); // "the-romance-shelf" → "The Romance Shelf"
}

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

  // the lane mix (the taxonomy's portfolio axis; floor = ≥30% original)
  const mix: Record<string, number> = {};
  for (const c of concepts) mix[c.sourceCategory ?? "?"] = (mix[c.sourceCategory ?? "?"] ?? 0) + 1;
  const origPct = Math.round(100 * (mix.original ?? 0) / Math.max(1, concepts.length));

  return (
    <div>
      {/* the lane mix — original / inspiration / audience (portfolio floor ≥30% original) */}
      <div className="flex items-center gap-3 flex-wrap mb-3 font-sans text-[11px]">
        <span className="uppercase tracking-[0.1em] text-margin-ink">Lanes:</span>
        <span className="text-forest font-bold">original {mix.original ?? 0}</span>
        <span className="text-[#0645ad] font-bold">⚓ inspiration {mix.inspiration ?? 0}</span>
        <span className="text-spot-red font-bold">audience {mix.audience ?? 0}</span>
        <span className={`uppercase tracking-[0.08em] ${origPct >= 30 ? "text-forest" : "text-spot-red font-bold"}`}>
          · original share {origPct}% {origPct >= 30 ? "✓ (floor ≥30%)" : "⚠ BELOW the ≥30% floor"}
        </span>
      </div>

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
                      <div className="mt-0.5 flex items-center gap-1.5 flex-wrap"><CatChip cat={x.sourceCategory} why={x.sourceCategoryWhy} />{x.collection && <span className="font-sans text-[8.5px] uppercase tracking-[0.1em] text-margin-ink border border-ink/25 px-1 py-[1px]">▤ {shelfTitle(x.collection)}</span>}</div>
                      <div className="font-sans text-[9px] uppercase tracking-[0.08em] text-margin-ink mt-0.5">{x.author}{x.parity && <span className="font-bold ml-1" style={{ color: "#15803d" }}>· parity {x.parity}</span>}</div>
                      <div className="text-[12px] mt-1 leading-[1.4]">{x.gift}</div>
                      {x.legs && <div className="text-[11px] mt-1 leading-[1.4]"><span className="font-sans text-[9px] uppercase tracking-[0.08em] text-spot-red mr-1">Legs</span>{x.legs}</div>}
                      {x.keep && <div className="text-[11px] mt-1 leading-[1.4]"><span className="font-sans text-[9px] uppercase tracking-[0.08em] text-spot-red mr-1">Keep</span>{x.keep}</div>}
                      <div className="text-[11px] text-ink-soft mt-1 leading-[1.4]">{x.cast}</div>
                      {x.source && <div className="text-[9px] text-margin-ink mt-1 leading-[1.4]">⚓ {x.source}</div>}
                      {x.trend && <div className="text-[10px] text-margin-ink mt-1 leading-[1.4]">↑ {x.trend}</div>}
                      <div className="text-[10px] text-margin-ink mt-1 italic leading-[1.4]">{x.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {layout === "shelves" && (() => {
        const shelves = new Map<string, Concept[]>();
        const solo: Concept[] = [];
        for (const x of concepts) {
          if (!x.collection) { solo.push(x); continue; }
          if (!shelves.has(x.collection)) shelves.set(x.collection, []);
          shelves.get(x.collection)!.push(x);
        }
        const byId = (id: string) => concepts.find((c) => c.slug === id);
        return (
          <div className="space-y-6">
            <p className="text-[12px] text-ink-soft leading-[1.5] max-w-[680px]">
              <strong>Collections</strong> (campaign-metrics §COLLECTIONS): campaigns designed to work together with <em>zero connecting tissue</em> —
              the shelf knows the books, the books never mention each other. Arrows = the post-graduation <em>&ldquo;your next read&rdquo;</em> nudges
              (curated per direction; a missing arrow is deliberate). <span className="text-spot-red">▦</span> = a kindred real-media shelf (real-shelf.md) to curate.
            </p>
            {[...shelves.entries()].map(([id, items]) => (
              <div key={id} className="border-2 border-ink bg-paper-shade/30 p-4">
                <div className="font-display text-[19px] mb-0.5">▤ {shelfTitle(id)} <span className="font-sans text-[10px] text-margin-ink">· {items.length} volumes</span></div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {items.map((x) => (
                    <div key={x.slug} className="border border-ink/40 bg-paper p-3">
                      <div className="font-display text-[15px]">{dot(x.status)} <Link href={`/concepts/${x.slug}`} className="hover:underline">{x.name}</Link></div>
                      <div className="mt-0.5"><CatChip cat={x.sourceCategory} why={x.sourceCategoryWhy} /></div>
                      <div className="text-[11.5px] mt-1 leading-[1.4] text-ink-soft">{x.gift}</div>
                      {(x.recommendedReads ?? []).map((r) => (
                        <div key={r.id} className="text-[10.5px] mt-1.5 leading-[1.4] border-t border-ink/10 pt-1.5">
                          <span className="font-sans text-[9px] uppercase tracking-[0.08em] text-forest">→ {byId(r.id)?.name ?? r.id}</span>
                          <span className="text-margin-ink italic ml-1">{r.why}</span>
                        </div>
                      ))}
                      {(x.recommendedReads ?? []).length === 0 && <div className="text-[10px] mt-1.5 text-margin-ink italic border-t border-ink/10 pt-1.5">recommends nothing (deliberate)</div>}
                      {(x.realShelf ?? []).length > 0 && (
                        <div className="text-[10px] mt-1.5 leading-[1.4] text-spot-red">▦ kindred media: {(x.realShelf ?? []).map((s) => `${s.medium}${s.status === "to-curate" ? " (to-curate)" : ""}`).join(" · ")}</div>
                      )}
                    </div>
                  ))}
                </div>
                {items.find((x) => x.collectionNote) && (
                  <p className="text-[10.5px] text-margin-ink italic mt-2 leading-[1.45]">{items.find((x) => x.collectionNote)!.collectionNote}</p>
                )}
              </div>
            ))}
            <div>
              <div className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-2">Standalone <span className="opacity-60">({solo.length})</span> — a forced shelf is worse than none</div>
              <ul className="space-y-1">
                {solo.map((x) => (
                  <li key={x.slug} className="flex items-baseline gap-2 border-b border-ink/10 py-1.5 text-[13.5px]">
                    <span className="w-4 shrink-0">{dot(x.status)}</span>
                    <Link href={`/concepts/${x.slug}`} className="font-bold whitespace-nowrap hover:underline">{x.name}</Link>
                    <CatChip cat={x.sourceCategory} why={x.sourceCategoryWhy} />
                    <span className="text-ink-soft text-[12px] truncate">— {x.gift}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })()}

      {layout === "list" && (
        <ul className="space-y-1">
          {concepts.map((x) => (
            <li key={x.name} className="flex items-baseline gap-2 border-b border-ink/10 py-2 text-[14px]">
              <span className="w-4 shrink-0">{dot(x.status)}</span>
              <Link href={`/concepts/${x.slug}`} className="font-bold whitespace-nowrap hover:underline">{x.name}</Link>
              <CatChip cat={x.sourceCategory} why={x.sourceCategoryWhy} />
              {x.collection && <span className="font-sans text-[8.5px] uppercase tracking-[0.1em] text-margin-ink whitespace-nowrap">▤ {shelfTitle(x.collection)}</span>}
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
