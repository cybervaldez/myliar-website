// Mainline day page — the full structured canon for one day, generated
// from the run-005 payload. Writers-room reference: every event, choice,
// stat delta, reaction, memory write, and reveal, with frame-flags
// surfaced. Spoilers visible (this is the internal review surface).

import { notFound } from "next/navigation";
import {
  WikiPage,
  Infobox,
  Navbox,
  SectionHead,
  SpoilerTag,
} from "../../_components/WikiChrome";
import {
  mainlineDays,
  mainlineDay,
  characterById,
  type MainlineChoice,
} from "../../wiki-data";

export function generateStaticParams() {
  return mainlineDays().map((d) => ({ day: String(d.globalDayIndex) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  const d = mainlineDay(Number(day));
  if (!d) return { title: "Unknown Day — The Codex" };
  const focal = d.characterId ? characterById(d.characterId) : null;
  return {
    title: `Day ${d.globalDayIndex}${focal ? ` · ${focal.name}` : ""} — The Main Line`,
    description: `Day ${d.globalDayIndex} of the curated arc (${d.narrativeType}).`,
  };
}

const ROLE_COLOR: Record<string, string> = {
  logical: "border-forest text-forest",
  passive: "border-ink text-ink",
  chaotic: "border-spot-red text-spot-red",
};

function DeltaPills({ delta }: { delta: Record<string, number> }) {
  const entries = Object.entries(delta).filter(([, v]) => v !== 0);
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {entries.map(([stat, v]) => {
        const pos = v > 0;
        return (
          <span
            key={stat}
            className={`font-display tracking-[0.1em] text-[10px] px-1.5 py-0.5 border ${
              pos ? "border-forest text-forest" : "border-spot-red text-spot-red"
            }`}
          >
            {stat} {pos ? "+" : ""}
            {v}
          </span>
        );
      })}
    </div>
  );
}

function ChoiceBlock({ c }: { c: MainlineChoice }) {
  return (
    <div className="border-[1.5px] border-ink bg-paper p-3">
      <div className="flex items-center gap-2">
        <span
          className={`font-display text-[14px] w-6 h-6 flex items-center justify-center border ${ROLE_COLOR[c.role] ?? "border-ink text-ink"}`}
        >
          {c.id.toUpperCase()}
        </span>
        <span className={`font-display tracking-[0.12em] text-[10px] ${(ROLE_COLOR[c.role] ?? "").split(" ")[1] ?? ""}`}>
          {c.role.toUpperCase()}
          {c.diceRoll && ` · 🎲 ${Math.round(c.diceRoll.critChance * 100)}%`}
          {c.itemDrop && " · ★ ITEM"}
        </span>
      </div>
      <p className="text-[14.5px] text-ink mt-2 leading-[1.4]">{c.label}</p>
      <DeltaPills delta={c.delta} />
      {c.reactionText && (
        <p className="text-[13.5px] italic text-ink-soft mt-2 leading-[1.45] border-l-2 border-margin-ink/40 pl-2">
          {c.reactionText}
        </p>
      )}
      {c.reactionTextOnCritFail && (
        <p className="text-[13px] italic text-spot-red mt-1.5 leading-[1.45] border-l-2 border-spot-red/50 pl-2">
          crit-fail: {c.reactionTextOnCritFail}
        </p>
      )}
      {c.itemDrop && (
        <div className="border border-forest bg-paper-shade p-2 mt-2">
          <span className="font-display tracking-[0.12em] text-[9px] text-spot-red">
            ★ {c.itemDrop.kind.toUpperCase()}
          </span>
          <div className="font-body text-[13px] text-ink mt-0.5">{c.itemDrop.name}</div>
          {c.itemDrop.description && (
            <div className="font-body italic text-[12px] text-ink-soft">{c.itemDrop.description}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  const d = mainlineDay(Number(day));
  if (!d) notFound();

  const focal = d.characterId ? characterById(d.characterId) : null;
  const introduces = d.introducesCharacterId
    ? characterById(d.introducesCharacterId)
    : null;

  const infobox = (
    <Infobox
      title={`Day ${d.globalDayIndex}`}
      subtitle={focal ? `${focal.name} · ${d.narrativeType}` : d.narrativeType}
      rows={[
        { label: "FOCAL", value: focal?.name ?? d.characterId ?? "—" },
        { label: "TYPE", value: d.narrativeType },
        { label: "EVENTS", value: String(d.events.length) },
        ...(introduces ? [{ label: "INTRODUCES", value: introduces.name }] : []),
        ...(d.tierUpReveal
          ? [{ label: "TIER-UP REVEAL", value: `${d.tierUpReveal.category} (${d.tierUpReveal.deliveredInEventId})` }]
          : []),
        ...(d.frameFlags.length
          ? [{ label: "FRAME FLAGS", value: `⚠ ${d.frameFlags.length}` }]
          : []),
      ]}
      footer={d.agentMoodToday ? `Mood: ${d.agentMoodToday}` : undefined}
    />
  );

  const navbox = (
    <Navbox
      title="THE MAIN LINE"
      links={mainlineDays().map((x) => ({
        label: `Day ${x.globalDayIndex}`,
        href: `/wiki/arc/${x.globalDayIndex}`,
      }))}
    />
  );

  return (
    <WikiPage
      kicker={`${d.narrativeType.toUpperCase()} · ${d.payloadId}`}
      title={`Day ${d.globalDayIndex}${focal ? ` — ${focal.name}` : ""}`}
      breadcrumb={[
        { label: "The Codex", href: "/wiki" },
        { label: "The Main Line", href: "/wiki/arc" },
      ]}
      infobox={infobox}
      navbox={navbox}
    >
      {d.frameFlags.length > 0 && (
        <div className="border-2 border-spot-red bg-paper p-4 mb-5">
          <div className="font-display tracking-[0.14em] text-[11px] text-spot-red mb-1.5">
            ⚠ FRAME FLAGS ({d.frameFlags.length})
          </div>
          <ul className="list-none p-0 m-0 space-y-1">
            {d.frameFlags.map((f, i) => (
              <li key={i} className="font-mono text-[12px] text-ink">
                {f}
              </li>
            ))}
          </ul>
          <p className="text-[12px] italic text-margin-ink mt-2">
            Banned real-world words in shipped payload text — to fix in the
            {" "}
            {d.payloadId} payload.
          </p>
        </div>
      )}

      {d.events.map((ev, idx) => {
        const isReveal = d.tierUpReveal?.deliveredInEventId === ev.id;
        return (
          <div key={ev.id} className="mb-7">
            <SectionHead id={ev.id}>
              Event {idx + 1}
              {isReveal && (
                <span className="ml-3 align-middle">
                  <SpoilerTag>
                    <span className="text-[12px]">tier-up: {d.tierUpReveal!.category}</span>
                  </SpoilerTag>
                </span>
              )}
            </SectionHead>
            <p className="text-[15px] leading-[1.6] text-ink mb-3">{ev.scenario}</p>
            <div className="space-y-2">
              {ev.choices.map((c) => (
                <ChoiceBlock key={c.id} c={c} />
              ))}
            </div>
            {ev.memoryWrites.length > 0 && (
              <div className="mt-3 border-l-2 border-forest pl-3">
                <div className="font-display tracking-[0.12em] text-[9px] text-forest mb-1">
                  MEMORY WRITE{ev.memoryWrites.length > 1 ? "S" : ""}
                </div>
                {ev.memoryWrites.map((m, i) => (
                  <p key={i} className="font-body italic text-[13px] text-ink-soft leading-[1.45] mb-1">
                    {m.text}
                    {m.emotion && (
                      <span className="not-italic text-margin-ink"> · {m.emotion}</span>
                    )}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {d.closingHook && (
        <>
          <SectionHead>Closing hook → tomorrow</SectionHead>
          <p className="border-l-[3px] border-spot-red pl-4 font-body italic text-[15px] text-ink leading-[1.5]">
            {d.closingHook}
          </p>
        </>
      )}

      <p className="mt-9 text-[12.5px] text-margin-ink italic">
        Generated read-only from the {d.payloadId} payload — exactly what the
        game ships. The app remains the source of truth.
      </p>
    </WikiPage>
  );
}
