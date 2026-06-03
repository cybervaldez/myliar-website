"use client";

// PER-DAY CONTENT layer — the SECOND level of pick-the-best. Architecture (the arc
// skeleton) is chosen in CandidateTabs; here, FOR A GIVEN DAY, different authors draft
// the actual content — scenario/dialogue, the L/P/C choices, the note produced, and the
// inventory (item drops) — and you pick the best wording/flow per day. Day picker (top)
// × author sub-tabs (within).

import { useState } from "react";
import { StatusChip } from "./CandidateTabs";
import { CopyForLLM } from "../_components/CopyForLLM";

export type EventRow = { n: number; scenario: string; logical: string; passive: string; chaotic: string; note: string; drop: string };
export type DayVersion = { author: string; status: string; inventory: string[]; events: EventRow[] };
export type DayEntry = { day: number; focal: string; tierUp: string; destinationServed: string; versions: DayVersion[] };

// T2 — PORT export: turn a picked per-day content version into a beat.md starter (the
// pregenerate input). Fields not held in the workbench data are emitted as TODO so the
// human completes them at port time. A human carries this to docs/authored-beats/ (one-way).
function toBeatMd(day: DayEntry, ver: DayVersion): string {
  const cat = /fear/i.test(day.tierUp) ? "fear" : /memory/i.test(day.tierUp) ? "memory" : /opinion/i.test(day.tierUp) ? "opinion" : "question";
  const tierUpIdx = ver.events.findIndex((e) => !e.logical && !e.passive && !e.chaotic);
  const head =
`---
day: ${day.day}
narrativeType: ${day.tierUp ? "daily (tier-up)" : "daily"}
characterId: ${day.focal.toLowerCase()}
realmCategory: TODO   # office / gym / kitchen / …
agentMoodToday: "TODO — one line of mood"
introducesCharacter: null
---

> PORT STARTER generated from /storyboard per-day content (author: ${ver.author}). Fill the TODOs,
> then pregenerate. Destination served: ${day.destinationServed || "TODO"}
${day.tierUp ? `\n## TIER-UP\ncategory: ${cat}\ndeliveredInEventIndex: ${tierUpIdx >= 0 ? tierUpIdx + 1 : "TODO"}\n` : ""}`;
  const events = ver.events.map((e) => {
    const stake = (!e.logical && !e.passive && !e.chaotic)
      ? "No choice — tier-up reveal. What lands is what the player does NOT do."
      : [e.logical && `logical — ${e.logical}`, e.passive && `passive — ${e.passive}`, e.chaotic && `chaotic — ${e.chaotic}`].filter(Boolean).join("; ");
    return `## EVENT ${e.n}
summary: ${e.scenario}
stake:   ${stake}
itemDropSlot: ${e.drop && e.drop !== "—" ? e.drop : "none"}
memoryNote: ${e.note || "TODO — a gift-bounded, voice-shaping note"}`;
  }).join("\n\n");
  const ledger = `\n\n## ACHIEVEMENT LEDGER\n- GRANTS: ${ver.inventory?.length ? ver.inventory.join("; ") : "none (sparse by design)"}\n\n## RILEY'S PRE-SHIP CHECK\nTODO — ship/kill + frame check.`;
  return `${head}\n${events}${ledger}\n`;
}

function EventsTable({ events }: { events: EventRow[] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-[12.5px] border-collapse">
        <thead>
          <tr className="text-left font-sans uppercase text-[10px] tracking-[0.08em] text-margin-ink">
            <th className="py-1 pr-2 w-8">#</th><th className="py-1 pr-2">Scenario / dialogue</th>
            <th className="py-1 pr-2">Logical · Passive · Chaotic</th><th className="py-1 pr-2">Note produced</th><th className="py-1">Drop</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.n} className="border-t border-ink/10 align-top">
              <td className="py-2 pr-2 font-sans tabular-nums text-forest">{e.n}</td>
              <td className="py-2 pr-2 leading-[1.5] min-w-[180px]">{e.scenario}</td>
              <td className="py-2 pr-2 leading-[1.45] min-w-[200px]">
                {e.logical && <div className="border-l-2 border-forest pl-2 mb-1"><strong className="text-forest">L</strong> {e.logical}</div>}
                {e.passive && <div className="border-l-2 border-ink pl-2 mb-1"><strong>P</strong> {e.passive}</div>}
                {e.chaotic && <div className="border-l-2 border-spot-red pl-2"><strong className="text-spot-red">C</strong> {e.chaotic}</div>}
              </td>
              <td className="py-2 pr-2 italic leading-[1.45] min-w-[200px] text-ink-soft">{e.note}</td>
              <td className="py-2 text-ink-soft whitespace-nowrap">{e.drop}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DayContent({ days }: { days: DayEntry[] }) {
  const [dayIdx, setDayIdx] = useState(0);
  const [verIdx, setVerIdx] = useState(0);
  if (!days.length) return <p className="text-[13px] text-margin-ink">No per-day content drafted yet.</p>;
  const day = days[Math.min(dayIdx, days.length - 1)];
  const ver = day.versions[Math.min(verIdx, day.versions.length - 1)];

  return (
    <div className="border-2 border-ink bg-paper-shade/40 p-5">
      {/* day picker */}
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-margin-ink mr-1">Day</span>
        {days.map((d, i) => (
          <button
            key={d.day}
            onClick={() => { setDayIdx(i); setVerIdx(0); }}
            className={`font-sans text-[12px] px-2.5 py-1 border-2 transition ${i === dayIdx ? "border-forest bg-forest text-paper" : "border-ink/30 text-ink-soft hover:bg-paper-shade"}`}
          >
            D{d.day} · {d.focal}
          </button>
        ))}
      </div>

      <div className="flex items-baseline gap-3 flex-wrap">
        <h3 className="font-display text-[20px] text-forest">Day {day.day} · {day.focal}</h3>
        <span className="font-sans text-[11px] uppercase tracking-[0.12em] text-spot-red">tier-up: {day.tierUp}</span>
      </div>
      {day.destinationServed && (
        <p className="mt-1 text-[13px] leading-[1.5] text-ink-soft">
          <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-spot-red mr-2">Destination served</span>
          {day.destinationServed}
        </p>
      )}

      {/* author sub-tabs (pick the best content version for this day) */}
      <div className="flex flex-wrap gap-2 border-b-2 border-ink/15 mt-4 mb-1">
        {day.versions.map((v, i) => (
          <button
            key={v.author}
            onClick={() => setVerIdx(i)}
            className={`font-sans text-[12px] uppercase tracking-[0.1em] px-3 py-2 -mb-[2px] border-b-2 transition ${i === verIdx ? "border-spot-red text-spot-red" : "border-transparent text-margin-ink hover:text-ink"}`}
          >
            {v.author}
          </button>
        ))}
      </div>

      {ver ? (
        <>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <StatusChip s={ver.status} />
            {ver.inventory?.length > 0 && (
              <span className="font-sans text-[11px] text-margin-ink">inventory: {ver.inventory.join(" · ")}</span>
            )}
            <CopyForLLM payload={toBeatMd(day, ver)} label="Copy as beat.md (port)" title="A beat.md starter from this version — paste into docs/authored-beats/, fill the TODOs, then pregenerate." />
          </div>
          <EventsTable events={ver.events} />
        </>
      ) : (
        <p className="mt-3 text-[13px] text-margin-ink">This author&apos;s version is pending.</p>
      )}
    </div>
  );
}
