"use client";

// /play — the LIST BROWSER (the macro view of the slate). The Front Door is the
// micro pitch (one campaign, deep); this is every campaign + concept scored on one
// card, comparable at a glance. Hero columns = Cozy Level · Characters · Unlocks.
// Scoring rubric: docs/design/campaign-metrics.md. Pure render-from-storyboard.json.

import { useState } from "react";
import Link from "next/link";

export type PlayChar = { who: string; gift: string; romance: string };
export type PlayMetrics = {
  cozy: number; cozyLabel: string; type: string; genre: string;
  length: string; age: string; trophies: string; unlocks: string; characters: PlayChar[];
};
export type PlayRec = { id: string; why: string };
export type PlayShelfItem = { title: string | null; medium: string; coverageBrief: string; status: string; monetized?: boolean };
export type PlayTitle = {
  name: string; slug: string; kind?: "campaign" | "concept";
  legs?: string; gift?: string; status?: string; theme?: string; metrics?: PlayMetrics;
  collection?: string; recommendedReads?: PlayRec[]; realShelf?: PlayShelfItem[];
};

const shelfTitle = (id: string) => id.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

const COZY: Record<number, { glyph: string; label: string; color: string }> = {
  1: { glyph: "🔥", label: "Bracing", color: "#b81f1c" },
  2: { glyph: "⚡", label: "Charged", color: "#c2691f" },
  3: { glyph: "☕", label: "Warm", color: "#a8841f" },
  4: { glyph: "🛋", label: "Cozy", color: "#5a8a3a" },
  5: { glyph: "🕯", label: "Cocoon", color: "#2d6a4a" },
};

function CozyBadge({ n, label }: { n: number; label: string }) {
  const b = COZY[n] ?? COZY[3];
  return (
    <span className="inline-flex items-center gap-1 font-sans text-[11px] px-2 py-0.5 border whitespace-nowrap"
      style={{ borderColor: b.color, color: b.color }} title="Cozy Level — flavor (safety · abundance · softness)">
      <span>{b.glyph}</span><b>{label || b.label}</b><span className="opacity-60">{n}/5</span>
    </span>
  );
}

function Spec({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <span className="whitespace-nowrap">
      <span className="font-sans text-[9px] uppercase tracking-[0.08em] text-margin-ink mr-1">{label}</span>{value}
    </span>
  );
}

export function TitleCard({ t, all }: { t: PlayTitle; all?: PlayTitle[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const m = t.metrics;
  const g = open && m ? m.characters.find((c) => c.who === open) : null;
  const nameOf = (id: string) => all?.find((x) => x.slug === id)?.name ?? id;
  return (
    <div className="border border-ink/40 bg-paper-shade/40 p-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="font-display text-[19px] leading-tight">
          <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-spot-red mr-2">{t.kind}</span>
          {t.kind === "campaign" ? <Link href={`/play/${t.slug}`} className="hover:underline">{t.name}</Link> : t.name}
          {t.collection && <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-margin-ink border border-ink/25 px-1 py-[1px] ml-2 align-middle">▤ {shelfTitle(t.collection)}</span>}
        </div>
        {m && <CozyBadge n={m.cozy} label={m.cozyLabel} />}
      </div>

      {/* Summary */}
      {t.legs && <div className="text-[13px] mt-1.5 leading-[1.45]">{t.legs}</div>}

      {m && (
        <>
          {/* Characters — tap a name for a glimpse (gift + romance/relationship aspect) */}
          <div className="mt-2.5">
            <div className="font-sans text-[9px] uppercase tracking-[0.08em] text-margin-ink mb-1">
              Characters <span className="opacity-60">— tap a name for a glimpse</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.characters.map((c) => (
                <button key={c.who} onClick={() => setOpen(open === c.who ? null : c.who)}
                  className={`font-sans text-[12px] px-2 py-1 border transition text-left ${open === c.who ? "bg-forest text-paper border-forest" : "border-ink/40 hover:bg-paper-shade"}`}>
                  {c.who}{c.romance.toLowerCase().includes("romanceable") ? " ♥" : ""}
                </button>
              ))}
            </div>
            {g && (
              <div className="mt-1.5 border-l-[3px] border-forest pl-3 py-1 text-[12px] leading-[1.5]">
                <div><strong>{g.who}</strong> gives you: {g.gift}</div>
                <div className="text-margin-ink mt-0.5"><strong className="text-ink">Relationship:</strong> {g.romance}</div>
              </div>
            )}
          </div>

          {/* Unlocks — the agents/capabilities you walk away with */}
          <div className="text-[12px] mt-2.5 leading-[1.45]">
            <span className="font-sans text-[9px] uppercase tracking-[0.08em] text-spot-red mr-1">Unlocks</span>{m.unlocks}
          </div>

          {/* The spec row */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[11px] text-ink-soft items-baseline border-t border-ink/15 pt-2">
            <Spec label="Type" value={m.type} />
            <Spec label="Length" value={m.length} />
            <Spec label="Genre" value={m.genre} />
            <Spec label="Theme" value={t.theme} />
            <Spec label="Trophies" value={m.trophies} />
            <Spec label="Age" value={m.age} />
          </div>
        </>
      )}

      {/* Kindred media — the browser kinship signal (real-shelf.md). GATED: until the legal/platform
          pass, no real titles on this surface — category tags only (entries are to-curate anyway). */}
      {(t.realShelf ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-baseline mt-2 text-[11px]">
          <span className="font-sans text-[9px] uppercase tracking-[0.08em] text-margin-ink">At home with</span>
          {(t.realShelf ?? []).map((s, i) => (
            <span key={i} title={s.coverageBrief} className="font-sans text-[10px] border border-ink/30 text-ink-soft px-1.5 py-[1px] cursor-help">
              {s.title ?? `a kindred ${s.medium}`}{s.status === "to-curate" && <span className="text-margin-ink"> · to curate</span>}
            </span>
          ))}
        </div>
      )}

      {/* Shelf-mates — the in-catalog recommended reads (librarian voice, per-direction) */}
      {(t.recommendedReads ?? []).length > 0 && (
        <div className="mt-2 text-[11.5px] leading-[1.45]">
          {(t.recommendedReads ?? []).map((r) => (
            <div key={r.id}>
              <span className="font-sans text-[9px] uppercase tracking-[0.08em] text-forest mr-1">→ {nameOf(r.id)}</span>
              <span className="text-margin-ink italic">{r.why}</span>
            </div>
          ))}
        </div>
      )}

      {t.kind === "campaign" && (
        <span className="inline-flex items-center gap-2 mt-3">
          <Link href={`/play/${t.slug}/prelude`} className="font-sans text-[12px] px-3 py-1 border border-forest text-forest no-underline hover:opacity-80">📖 Prelude</Link>
          <Link href={`/play/${t.slug}`} className="font-sans text-[12px] px-3 py-1 bg-forest text-paper no-underline hover:opacity-90">▶ Play</Link>
        </span>
      )}
    </div>
  );
}

function Section({ title, sub, titles, all }: { title: string; sub: string; titles: PlayTitle[]; all: PlayTitle[] }) {
  return (
    <div>
      <div className="font-display text-[24px] text-forest border-b border-ink/20 pb-1 mb-1">
        {title} <span className="font-sans text-[11px] text-margin-ink">({titles.length})</span>
      </div>
      <div className="font-sans text-[11px] text-margin-ink mb-3">{sub}</div>
      <div className="space-y-3">{titles.map((t) => <TitleCard key={t.slug} t={t} all={all} />)}</div>
    </div>
  );
}

export function PlayBrowser({ campaigns, concepts }: { campaigns: PlayTitle[]; concepts: PlayTitle[] }) {
  // §COLLECTIONS: the browser groups by shelf where one exists — with a prominent ALL view (no
  // second-class shelfless titles). Default = All.
  const [view, setView] = useState<"all" | "shelves">("all");
  const all = [...campaigns, ...concepts];
  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        {([["all", "All"], ["shelves", "By shelf"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setView(k)}
            className={`font-sans text-[12px] uppercase tracking-[0.08em] px-3 py-1.5 border transition ${view === k ? "bg-[#0645ad] text-white border-[#0645ad]" : "border-[#a2b1c2] text-[#0645ad] hover:bg-[#f1f4f8]"}`}>
            {label}
          </button>
        ))}
      </div>

      {view === "all" && (
        <>
          <Section title="Campaigns" sub="playable now — tap a name to open its front door" titles={campaigns} all={all} />
          <Section title="Concepts" sub="in the pipeline (not yet playable) — the slate's coverage map" titles={concepts} all={all} />
        </>
      )}

      {view === "shelves" && (() => {
        const shelves = new Map<string, PlayTitle[]>();
        const solo: PlayTitle[] = [];
        for (const t of all) {
          if (!t.collection) { solo.push(t); continue; }
          if (!shelves.has(t.collection)) shelves.set(t.collection, []);
          shelves.get(t.collection)!.push(t);
        }
        return (
          <div className="space-y-8">
            {[...shelves.entries()].map(([id, titles]) => (
              <Section key={id} title={`▤ ${shelfTitle(id)}`} sub="volumes designed to work together — no connecting tissue; arrows = the post-graduation nudges" titles={titles} all={all} />
            ))}
            <Section title="Standalone" sub="not on a shelf (deliberate — a forced shelf is worse than none)" titles={solo} all={all} />
          </div>
        );
      })()}
    </div>
  );
}
