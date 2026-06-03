"use client";

// ARCHITECTURE layer — author tabs for candidate ARC SKELETONS (Claude vs Gemini vs …):
// which day, focal, what it teaches / brings. Per-day CONTENT (dialogue/choices/
// inventory) is a separate layer — see DayContent.tsx. Same brief → many drafts →
// compare → cherry-pick.

import { useState } from "react";

export type ArcRow = { day: number; focal: string; type: string; beat: string; teaches: string; brings: string; tier: string; status: string };
export type Candidate = { id: string; author?: string; title: string; status: string; pitch: string; note?: string; arc: ArcRow[] };

export function StatusChip({ s }: { s: string }) {
  const done = s.includes("✓") || s.toLowerCase().includes("calibrated");
  return (
    <span className={`inline-block font-sans text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded ${done ? "bg-forest text-paper" : "border border-ink/30 text-margin-ink"}`}>
      {s}
    </span>
  );
}

function ArcTable({ c }: { c: Candidate }) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="text-left font-sans uppercase text-[10px] tracking-[0.1em] text-margin-ink">
            <th className="py-1 pr-2">Day</th><th className="py-1 pr-2">Focal</th><th className="py-1 pr-2">Beat (surface)</th>
            <th className="py-1 pr-2">Teaches (fundamental)</th><th className="py-1 pr-2">Note → brings</th><th className="py-1 pr-2">Tier</th><th className="py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {c.arc.map((d, i) => (
            <tr key={`${d.day}-${i}`} className="border-t border-ink/10 align-top">
              <td className="py-2 pr-2 font-sans tabular-nums text-forest">{d.day}</td>
              <td className="py-2 pr-2 whitespace-nowrap"><strong>{d.focal}</strong><br /><span className="text-[11px] text-margin-ink">{d.type}</span></td>
              <td className="py-2 pr-2 leading-[1.45] min-w-[160px]">{d.beat}</td>
              <td className="py-2 pr-2 leading-[1.4] min-w-[150px] text-forest-dim">{d.teaches}</td>
              <td className="py-2 pr-2 leading-[1.4] min-w-[150px] text-ink-soft">{d.brings}</td>
              <td className="py-2 pr-2 text-spot-red whitespace-nowrap">{d.tier}</td>
              <td className="py-2"><StatusChip s={d.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CandidateTabs({ candidates }: { candidates: Candidate[] }) {
  const [sel, setSel] = useState(0);
  const c = candidates[sel];
  if (!c) return null;
  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b-2 border-ink/15 mb-1">
        {candidates.map((cand, i) => (
          <button
            key={cand.id}
            onClick={() => setSel(i)}
            className={`font-sans text-[12px] uppercase tracking-[0.1em] px-3 py-2 -mb-[2px] border-b-2 transition ${
              i === sel ? "border-spot-red text-spot-red" : "border-transparent text-margin-ink hover:text-ink"
            }`}
          >
            {cand.author ?? cand.title}
          </button>
        ))}
      </div>

      <div className="flex items-baseline gap-3 flex-wrap mt-4">
        <h2 className="font-display text-[26px] text-forest">{c.title}</h2>
        <StatusChip s={c.status} />
      </div>
      <p className="mt-2 text-[15px] leading-[1.6]">{c.pitch}</p>
      {c.note && (
        <p className="mt-2 text-[13px] leading-[1.55] text-ink-soft border-l-[3px] border-spot-red pl-3">{c.note}</p>
      )}

      <h3 className="font-display text-[18px] text-ink mt-6 mb-1">Arc overview (skeleton)</h3>
      <ArcTable c={c} />
    </div>
  );
}
