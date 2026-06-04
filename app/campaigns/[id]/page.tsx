// /campaigns/[id] — the tooling codex daily-events view for one campaign. All
// days on one scrollable page (collapsible per day): every event, choice, stat
// delta, reaction, memory write, item, and tier-up reveal. Read from the parity
// export. Spoilers visible (dev surface). Fandom-basic tooling look.

import { notFound } from "next/navigation";
import { FandomShell } from "../../_components/FandomShell";
import {
  mainline,
  wingman,
  characterById,
  wingmanCoachById,
  type MainlineDay,
  type MainlineChoice,
} from "../../wiki/wiki-data";

type CampaignDef = {
  title: string;
  runId: string;
  days: MainlineDay[];
  nameOf: (id: string) => string | undefined;
};

function campaign(id: string): CampaignDef | null {
  if (id === "main-line") {
    const ml = mainline();
    return { title: "Life Ops", runId: ml.runId, days: ml.days, nameOf: (cid) => characterById(cid)?.name };
  }
  if (id === "wingman") {
    const wm = wingman();
    return { title: "The Wingman", runId: wm.runId, days: wm.days, nameOf: (cid) => wingmanCoachById(cid)?.name };
  }
  return null;
}

export function generateStaticParams() {
  return [{ id: "main-line" }, { id: "wingman" }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = campaign(id);
  if (!c) return { title: "Unknown Campaign — dev" };
  return {
    title: `${c.title} — daily events (dev) · My Life is an RPG`,
    description: `Day-by-day events of ${c.title} (${c.runId}).`,
    robots: { index: false, follow: false },
  };
}

const ROLE_COLOR: Record<string, string> = {
  logical: "border-[#15803d] text-[#15803d]",
  passive: "border-[#54595d] text-[#54595d]",
  chaotic: "border-spot-red text-spot-red",
};

function DeltaPills({ delta }: { delta: Record<string, number> }) {
  const entries = Object.entries(delta).filter(([, v]) => v !== 0);
  if (entries.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap gap-1 ml-1 align-middle">
      {entries.map(([stat, v]) => (
        <span
          key={stat}
          className={`font-sans text-[9px] tracking-[0.06em] px-1 border ${v > 0 ? "border-[#15803d] text-[#15803d]" : "border-spot-red text-spot-red"}`}
        >
          {stat}
          {v > 0 ? "+" : ""}
          {v}
        </span>
      ))}
    </span>
  );
}

function Choice({ c }: { c: MainlineChoice }) {
  return (
    <div className="border-l-2 border-[#dee1e6] pl-2 py-1">
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`font-sans text-[9px] tracking-[0.08em] px-1 border ${ROLE_COLOR[c.role] ?? "border-[#54595d] text-[#54595d]"}`}>
          {c.id.toUpperCase()} · {c.role.toUpperCase()}
        </span>
        {c.diceRoll && <span className="font-sans text-[9px] text-spot-red">🎲 {Math.round(c.diceRoll.critChance * 100)}%</span>}
        {c.itemDrop && <span className="font-sans text-[9px] text-[#15803d]">★ {c.itemDrop.kind}</span>}
        <span className="text-[12.5px] text-ink">{c.label}</span>
        <DeltaPills delta={c.delta} />
      </div>
      {c.reactionText && <p className="text-[11.5px] italic text-ink-soft leading-[1.4] mt-0.5">{c.reactionText}</p>}
      {c.reactionTextOnCritFail && (
        <p className="text-[11px] italic text-spot-red leading-[1.4] mt-0.5">crit-fail: {c.reactionTextOnCritFail}</p>
      )}
      {c.itemDrop && (
        <p className="text-[11px] text-[#15803d] leading-[1.4] mt-0.5">
          ★ <strong>{c.itemDrop.name}</strong>
          {c.itemDrop.description && <span className="text-ink-soft italic"> — {c.itemDrop.description}</span>}
        </p>
      )}
    </div>
  );
}

export default async function CampaignDaysPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = campaign(id);
  if (!c) notFound();

  const eventCount = c.days.reduce((n, d) => n + d.events.length, 0);

  return (
    <FandomShell active="/campaigns">
      <div className="text-[11px] text-[#54595d] mb-2">
        <a href="/campaigns" className="text-[#0645ad] hover:underline">Campaigns</a>
        <span className="px-1.5">›</span>
        <span>{c.title}</span>
      </div>
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">{c.runId} · daily events</div>
      <h1 className="font-display text-[36px] leading-[1.0] mt-1 mb-2">{c.title}</h1>
      <p className="text-[13px] text-ink-soft mb-5 leading-[1.5]">
        {c.days.length} days · {eventCount} events. Every scenario, choice, delta, reaction, memory
        write, and reveal — straight from the {c.runId} payloads. <strong>Spoilers visible.</strong>
      </p>

      <div className="space-y-2">
        {c.days.map((d, i) => {
          const focal = d.characterId ? c.nameOf(d.characterId) : null;
          const introduces = d.introducesCharacterId ? c.nameOf(d.introducesCharacterId) : null;
          return (
            <details key={d.globalDayIndex} open={i === 0} className="border border-[#a2b1c2] bg-white">
              <summary className="cursor-pointer select-none px-3 py-2 bg-[#f6f7f9] hover:bg-[#eaecf0] flex items-baseline gap-2 flex-wrap">
                <span className="font-display text-[16px]">Day {d.globalDayIndex}</span>
                {focal && <span className="font-body italic text-[13px] text-[#15803d]">{focal}</span>}
                <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-margin-ink">{d.narrativeType}</span>
                {introduces && <span className="font-sans text-[10px] text-[#15803d]">+ {introduces}</span>}
                {d.tierUpReveal && <span className="font-sans text-[10px] text-spot-red">tier-up: {d.tierUpReveal.category}</span>}
                {d.frameFlags.length > 0 && <span className="font-sans text-[10px] text-spot-red border border-spot-red px-1">⚠ {d.frameFlags.length}</span>}
                <span className="ml-auto font-sans text-[10px] text-margin-ink">{d.events.length} ev</span>
              </summary>
              <div className="px-3 py-2 space-y-3">
                {d.events.map((ev, idx) => (
                  <div key={ev.id}>
                    <div className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#54595d] mb-1">Event {idx + 1}</div>
                    <p className="text-[13px] text-ink leading-[1.45] mb-1.5">{ev.scenario}</p>
                    <div className="space-y-1">
                      {ev.choices.map((ch) => (
                        <Choice key={ch.id} c={ch} />
                      ))}
                    </div>
                    {ev.memoryWrites.length > 0 && (
                      <div className="mt-1.5 border-l-2 border-[#15803d] pl-2">
                        {ev.memoryWrites.map((m, mi) => (
                          <p key={mi} className="text-[11px] italic text-ink-soft leading-[1.4]">
                            ✎ {m.text}
                            {m.emotion && <span className="not-italic text-margin-ink"> · {m.emotion}</span>}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {d.closingHook && (
                  <p className="border-l-[3px] border-spot-red pl-2 font-body italic text-[12.5px] text-ink leading-[1.45]">
                    → {d.closingHook}
                  </p>
                )}
              </div>
            </details>
          );
        })}
      </div>

      <p className="text-[11px] text-margin-ink mt-6 leading-[1.5]">
        Read-only from the {c.runId} payloads (parity export). The app is the source of truth.
      </p>
    </FandomShell>
  );
}
