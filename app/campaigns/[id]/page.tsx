// /campaigns/[id] — the tooling codex daily-events view for one campaign, with
// an INFLUENCE map: which selections set a flag (a hidden/earned achievement)
// and which FUTURE days that flag changes (the scenario/reaction callbacks). So
// you can see, per choice, both the stat deltas AND the future-dialogue ripple.
// Read from the parity export. Spoilers visible (dev surface).

import { notFound } from "next/navigation";
import Link from "next/link";
import { FandomShell } from "../../_components/FandomShell";
import { ShareCard, SKINS, campaignCards, campaignDefaultSkin, genreLensCards } from "../../cards/share-card";
import { CampaignTabs, type ViewRow, type ViewCoach, type ViewMetrics } from "./CampaignTabs";
import { DayDiagram } from "./DayDiagram";
import { CopyForLLM } from "../../_components/CopyForLLM";

// per-day STRUCTURE diagram (the trichotomy tree) — built server-side as a
// mermaid string, rendered lazily by <DayDiagram>.
function dayMermaid(d: MainlineDay): string {
  let s = "flowchart LR\n";
  s += "classDef log fill:#eaf6ee,stroke:#2e7d4f,color:#222;\nclassDef pas fill:#f0f1f3,stroke:#54595d,color:#222;\nclassDef cha fill:#fdecec,stroke:#c0392b,color:#222;\n";
  d.events.forEach((ev, i) => {
    const en = `E${i + 1}`;
    const cb = (ev.scenarioVariants?.length ?? 0) > 0 ? " ⤷" : "";
    s += `${en}["Event ${i + 1}${cb}"]\n`;
    ev.choices.forEach((ch) => {
      const cls = ch.role === "logical" ? "log" : ch.role === "chaotic" ? "cha" : "pas";
      const deltas = Object.entries(ch.delta).filter(([, v]) => v !== 0).map(([k, v]) => `${k}${v > 0 ? "+" : ""}${v}`).join(" ");
      const marks = `${ch.grantsAchievement ? " ⚑" : ""}${ch.itemDrop ? " ★" : ""}${ch.diceRoll ? " 🎲" : ""}${(ch.reactionVariants?.length ?? 0) > 0 ? " ↩" : ""}`;
      const label = `${ch.id.toUpperCase()} ${ch.role}${deltas ? " " + deltas : ""}${marks}`.replace(/["[\]]/g, "");
      s += `${en} --> ${en}${ch.id}["${label}"]:::${cls}\n`;
    });
  });
  return s;
}

const PALETTE = [
  { fill: "#fdecec", stroke: "#c0392b" }, { fill: "#eaf1fb", stroke: "#2c5fa8" },
  { fill: "#eaf6ee", stroke: "#2e7d4f" }, { fill: "#f1ecfb", stroke: "#6a3fb5" },
  { fill: "#fdf0e6", stroke: "#cc6a1f" }, { fill: "#fbf5e3", stroke: "#b8860b" },
];
import {
  mainline,
  wingman,
  characterById,
  wingmanCoachById,
  achievementById,
  campaignMeta,
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
    title: `${c.title} — daily events + influence (dev) · My Life is an RPG`,
    description: `Day-by-day events of ${c.title} (${c.runId}), with the selection→future-dialogue influence map.`,
    robots: { index: false, follow: false },
  };
}

// ── Influence model ─────────────────────────────────────────────────────
// A flag is an achievement id that a SELECTION sets (choice.grantsAchievement
// or its itemDrop.grantsAchievement) and that a LATER day READS (an event
// scenarioVariant / a choice reactionVariant gated on it). We surface only
// flags that are actually consumed (they create a visible ripple).
type FlagSource = { day: number; eventId: string; choiceId: string; role: string; label: string; via: "choice" | "item" };
type FlagTarget = { day: number; eventId: string; choiceId?: string; kind: "scenario" | "reaction"; text: string };
type Ripple = { flag: string; sources: FlagSource[]; targets: FlagTarget[] };

function buildRipples(days: MainlineDay[]): Map<string, Ripple> {
  const m = new Map<string, Ripple>();
  const get = (flag: string): Ripple => {
    let r = m.get(flag);
    if (!r) { r = { flag, sources: [], targets: [] }; m.set(flag, r); }
    return r;
  };
  for (const d of days) {
    for (const ev of d.events) {
      // sources
      for (const c of ev.choices) {
        if (c.grantsAchievement) get(c.grantsAchievement).sources.push({ day: d.globalDayIndex, eventId: ev.id, choiceId: c.id, role: c.role, label: c.label, via: "choice" });
        const itemFlag = (c.itemDrop as { grantsAchievement?: string } | null)?.grantsAchievement;
        if (itemFlag) get(itemFlag).sources.push({ day: d.globalDayIndex, eventId: ev.id, choiceId: c.id, role: c.role, label: c.label, via: "item" });
      }
      // targets (consumers)
      for (const sv of ev.scenarioVariants ?? []) {
        for (const f of sv.unlockIf) get(f).targets.push({ day: d.globalDayIndex, eventId: ev.id, kind: "scenario", text: sv.scenario });
      }
      for (const c of ev.choices) {
        for (const rv of c.reactionVariants ?? []) {
          for (const f of rv.unlockIf) get(f).targets.push({ day: d.globalDayIndex, eventId: ev.id, choiceId: c.id, kind: "reaction", text: rv.reactionText });
        }
      }
    }
  }
  // keep only consumed flags (ripples that actually change a future day)
  for (const [k, r] of m) if (r.targets.length === 0) m.delete(k);
  return m;
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
        <span key={stat} className={`font-sans text-[9px] tracking-[0.06em] px-1 border ${v > 0 ? "border-[#15803d] text-[#15803d]" : "border-spot-red text-spot-red"}`}>
          {stat}{v > 0 ? "+" : ""}{v}
        </span>
      ))}
    </span>
  );
}

function flagLabel(flag: string): string {
  return achievementById(flag)?.title ?? flag;
}

function Choice({ c, flagTargets }: { c: MainlineChoice; flagTargets: Map<string, number[]> }) {
  const sets = c.grantsAchievement ?? (c.itemDrop as { grantsAchievement?: string } | null)?.grantsAchievement ?? null;
  const ripplesTo = sets ? flagTargets.get(sets) ?? [] : [];
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
        {sets && ripplesTo.length > 0 && (
          <span className="font-sans text-[9px] tracking-[0.05em] px-1 border border-[#b8860b] text-[#8a6d0b] bg-[#fdf6e3]" title={`sets flag ${flagLabel(sets)}`}>
            ⚑ influences {ripplesTo.map((d) => `D${d}`).join(", ")}
          </span>
        )}
      </div>
      {c.reactionText && <p className="text-[11.5px] italic text-ink-soft leading-[1.4] mt-0.5">{c.reactionText}</p>}
      {c.reactionTextOnCritFail && <p className="text-[11px] italic text-spot-red leading-[1.4] mt-0.5">crit-fail: {c.reactionTextOnCritFail}</p>}
      {c.itemDrop && (
        <p className="text-[11px] text-[#15803d] leading-[1.4] mt-0.5">★ <strong>{c.itemDrop.name}</strong>{c.itemDrop.description && <span className="text-ink-soft italic"> — {c.itemDrop.description}</span>}</p>
      )}
      {(c.reactionVariants ?? []).map((rv, i) => (
        <div key={i} className="mt-1 border-l-2 border-[#b8860b] bg-[#fdf6e3]/60 pl-2 py-0.5">
          <div className="font-sans text-[9px] tracking-[0.05em] text-[#8a6d0b]">⤷ CALLBACK if {rv.unlockIf.map(flagLabel).join(" + ")}</div>
          <p className="text-[11.5px] italic text-ink leading-[1.4]">{rv.reactionText}</p>
        </div>
      ))}
    </div>
  );
}

export default async function CampaignDaysPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = campaign(id);
  if (!c) notFound();

  const eventCount = c.days.reduce((n, d) => n + d.events.length, 0);
  const ripples = buildRipples(c.days);
  // flag → the days it changes (for the inline "influences D…" badge on sources)
  const flagTargets = new Map<string, number[]>();
  for (const r of ripples.values()) flagTargets.set(r.flag, [...new Set(r.targets.map((t) => t.day))].sort((a, b) => a - b));

  // ── view-data for the tabs (generic across campaigns) ──
  const coachOrder: string[] = [];
  for (const d of c.days) if (d.characterId && !coachOrder.includes(d.characterId)) coachOrder.push(d.characterId);
  const coachIdx = new Map(coachOrder.map((cid, i) => [cid, i]));
  const palOf = (cid: string) => PALETTE[(coachIdx.get(cid) ?? 0) % PALETTE.length];
  const coaches: ViewCoach[] = coachOrder.map((cid) => ({ id: cid, name: c.nameOf(cid) ?? cid, color: palOf(cid).stroke }));

  const setsByDay = new Map<number, Set<string>>();
  const readsByDay = new Map<number, Set<string>>();
  const add = (m: Map<number, Set<string>>, day: number, flag: string) => { (m.get(day) ?? m.set(day, new Set()).get(day)!).add(flag); };
  for (const r of ripples.values()) {
    for (const s of r.sources) add(setsByDay, s.day, r.flag);
    for (const t of r.targets) add(readsByDay, t.day, r.flag);
  }
  const rows: ViewRow[] = c.days.map((d) => ({
    day: d.globalDayIndex,
    coachId: d.characterId ?? "",
    coach: d.characterId ? c.nameOf(d.characterId) ?? d.characterId : "—",
    color: palOf(d.characterId ?? "").stroke,
    type: d.narrativeType,
    tier: d.tierUpReveal?.category ?? "",
    unspoken: d.tierUpReveal?.category === "question",
    sets: [...(setsByDay.get(d.globalDayIndex) ?? [])],
    reads: [...(readsByDay.get(d.globalDayIndex) ?? [])],
    events: d.events.length,
  }));

  const granted = new Set<string>();
  for (const d of c.days) for (const ev of d.events) for (const ch of ev.choices) {
    if (ch.grantsAchievement) granted.add(ch.grantsAchievement);
    const itf = (ch.itemDrop as { grantsAchievement?: string } | null)?.grantsAchievement;
    if (itf) granted.add(itf);
  }
  const metrics: ViewMetrics = {
    days: c.days.length,
    coaches: coaches.length,
    tierUps: c.days.filter((d) => d.tierUpReveal).length,
    callbacks: ripples.size,
    unspoken: c.days.filter((d) => d.tierUpReveal?.category === "question").length,
    achievements: granted.size,
  };

  // mermaid graph strings (built server-side, rendered client-side on the Flow tab)
  const label = (d: typeof c.days[number]) => `D${d.globalDayIndex} ${(c.nameOf(d.characterId ?? "") ?? "").split(" ")[0]}${d.tierUpReveal?.category === "question" ? " ★" : ""}`;
  const cls = (d: typeof c.days[number]) => `c${coachIdx.get(d.characterId ?? "") ?? 0}`;
  const classDefs = coachOrder.map((cid, i) => `classDef c${i} fill:${PALETTE[i % PALETTE.length].fill},stroke:${PALETTE[i % PALETTE.length].stroke},color:#222;`).join("\n");
  const edges = [...ripples.values()].flatMap((r) => r.sources.flatMap((s) => [...new Set(r.targets.map((t) => t.day))].map((t) => `D${s.day} -. ${r.flag} .-> D${t}`)));
  let flowArc = "flowchart LR\n" + classDefs + "\n";
  c.days.forEach((d, i) => { flowArc += `D${d.globalDayIndex}["${label(d)}"]:::${cls(d)}` + (i < c.days.length - 1 ? " --> " : "\n"); });
  flowArc += edges.join("\n");
  const webDays = new Set<number>();
  for (const r of ripples.values()) { for (const s of r.sources) webDays.add(s.day); for (const t of r.targets) webDays.add(t.day); }
  let flowWeb = "";
  if (webDays.size) {
    flowWeb = "flowchart LR\n" + classDefs + "\n" +
      c.days.filter((d) => webDays.has(d.globalDayIndex)).map((d) => `D${d.globalDayIndex}["${label(d)}"]:::${cls(d)}`).join("\n") + "\n" + edges.join("\n");
  }

  // the rich server-rendered slots passed into the client tab shell
  const eventsSlot = (
    <div className="space-y-2">
      {c.days.map((d, i) => {
        const focal = d.characterId ? c.nameOf(d.characterId) : null;
        const introduces = d.introducesCharacterId ? c.nameOf(d.introducesCharacterId) : null;
        const dayHasCallback = d.events.some((ev) => (ev.scenarioVariants?.length ?? 0) > 0 || ev.choices.some((ch) => (ch.reactionVariants?.length ?? 0) > 0));
        const daySetsFlag = d.events.some((ev) => ev.choices.some((ch) => ch.grantsAchievement && flagTargets.has(ch.grantsAchievement)));
        return (
          <details key={d.globalDayIndex} open={i === 0} className="border border-[#a2b1c2] bg-white">
            <summary className="cursor-pointer select-none px-3 py-2 bg-[#f6f7f9] hover:bg-[#eaecf0] flex items-baseline gap-2 flex-wrap">
              <span className="font-display text-[16px]">Day {d.globalDayIndex}</span>
              {focal && <span className="font-body italic text-[13px] text-[#15803d]">{focal}</span>}
              <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-margin-ink">{d.narrativeType}</span>
              {introduces && <span className="font-sans text-[10px] text-[#15803d]">+ {introduces}</span>}
              {d.tierUpReveal && <span className="font-sans text-[10px] text-spot-red">tier-up: {d.tierUpReveal.category}</span>}
              {daySetsFlag && <span className="font-sans text-[9px] text-[#8a6d0b] border border-[#b8860b] px-1">⚑ sets flag</span>}
              {dayHasCallback && <span className="font-sans text-[9px] text-[#8a6d0b] border border-[#b8860b] px-1 bg-[#fdf6e3]">⤷ callback</span>}
              <span className="ml-auto font-sans text-[10px] text-margin-ink">{d.events.length} ev</span>
            </summary>
            <div className="px-3 py-2 space-y-3">
              <DayDiagram src={dayMermaid(d)} uid={`${id}-d${d.globalDayIndex}`} />
              {d.events.map((ev, idx) => (
                <div key={ev.id}>
                  <div className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#54595d] mb-1">Event {idx + 1}</div>
                  <p className="text-[13px] text-ink leading-[1.45] mb-1.5">{ev.scenario}</p>
                  {(ev.scenarioVariants ?? []).map((sv, si) => (
                    <div key={si} className="mb-1.5 border-l-2 border-[#b8860b] bg-[#fdf6e3]/60 pl-2 py-1">
                      <div className="font-sans text-[9px] tracking-[0.05em] text-[#8a6d0b]">⤷ CALLBACK SCENARIO if {sv.unlockIf.map(flagLabel).join(" + ")}</div>
                      <p className="text-[12.5px] text-ink leading-[1.4]">{sv.scenario}</p>
                    </div>
                  ))}
                  <div className="space-y-1">
                    {ev.choices.map((ch) => (<Choice key={ch.id} c={ch} flagTargets={flagTargets} />))}
                  </div>
                  {ev.memoryWrites.length > 0 && (
                    <div className="mt-1.5 border-l-2 border-[#15803d] pl-2">
                      {ev.memoryWrites.map((m, mi) => (
                        <p key={mi} className="text-[11px] italic text-ink-soft leading-[1.4]">✎ {m.text}{m.emotion && <span className="not-italic text-margin-ink"> · {m.emotion}</span>}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {d.closingHook && (<p className="border-l-[3px] border-spot-red pl-2 font-body italic text-[12.5px] text-ink leading-[1.45]">→ {d.closingHook}</p>)}
            </div>
          </details>
        );
      })}
    </div>
  );

  const influenceSlot = ripples.size > 0 ? (
    <div>
      <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-[#8a6d0b] mb-2">⚑ Influence map — selections that change a future day</div>
      <div className="space-y-2">
        {[...ripples.values()].sort((a, b) => (a.sources[0]?.day ?? 99) - (b.sources[0]?.day ?? 99)).map((r) => (
          <div key={r.flag} className="text-[12px] leading-[1.5] border-l-2 border-[#b8860b] pl-2">
            <div><span className="font-sans text-[9px] uppercase tracking-[0.06em] text-[#8a6d0b]">flag</span> <strong>{flagLabel(r.flag)}</strong>{achievementById(r.flag)?.hidden && <span className="font-sans text-[9px] text-margin-ink ml-1">(hidden)</span>}</div>
            <div className="text-ink-soft">
              {r.sources.length === 0 ? (<span className="text-spot-red">⚠ no source selection in this campaign</span>) : (
                r.sources.map((s, i) => (<span key={i}>{i > 0 && " · "}set by <strong>D{s.day}</strong> {s.choiceId.toUpperCase()}/{s.role}<span className="italic"> “{s.label}”</span>{s.via === "item" && <span className="text-[10px] text-margin-ink"> (reward)</span>}</span>))
              )}
              {" → changes "}
              {[...new Set(r.targets.map((t) => `D${t.day} ${t.kind}`))].map((t, i, arr) => (<span key={t}><strong className="text-[#8a6d0b]">{t}</strong>{i < arr.length - 1 ? ", " : ""}</span>))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : <p className="text-[12px] text-ink-soft italic">No callbacks in this campaign.</p>;

  return (
    <FandomShell active="/campaigns">
      <div className="text-[11px] text-[#54595d] mb-2">
        <a href="/campaigns" className="text-[#0645ad] hover:underline">Campaigns</a>
        <span className="px-1.5">›</span>
        <span>{c.title}</span>
      </div>
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">{c.runId} · daily events + influence</div>
      <h1 className="font-display text-[36px] leading-[1.0] mt-1 mb-2">{c.title}</h1>
      <p className="text-[13px] text-ink-soft mb-5 leading-[1.5]">
        {c.days.length} days · {eventCount} events · {ripples.size} selection ripples. Every scenario, choice,
        delta, reaction, memory write, and reveal — plus which <strong>selections</strong> change a{" "}
        <strong>future day&apos;s dialogue</strong> (routed through achievement flags). <strong>Spoilers visible.</strong>
      </p>

      <div className="mb-5">
        <CopyForLLM
          payload={JSON.stringify({ _what: `My Life is an RPG — ${c.title} (${c.runId}) campaign data: every day's events, choices, deltas, reactions, memory writes, tier-ups, and callback flags. Read/instruct/cross-check (e.g. paste to Gemini).`, campaign: c.title, runId: c.runId, days: c.days }, null, 2)}
          label={`Copy ${c.title} for LLM`}
          title="The whole campaign as self-describing JSON — hand it to Gemini/an LLM for a cross-check (migrated from the retired Storyboard/Lab tooling)."
        />
      </div>

      {/* ── Viral motifs (trophy naming + REL ladder), declared in the engine ── */}
      {(() => {
        const meta = campaignMeta(id);
        const m = meta?.motif;
        const ladder = meta?.relTierNames ?? [];
        return m ? (
          <div className="border border-[#b8860b] bg-[#fdf6e3] p-3 mb-6">
            <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-[#8a6d0b] mb-1">★ Trophy motif — {m.kind}</div>
            <div className="font-display text-[18px] leading-tight mb-1">{m.pattern}</div>
            <p className="text-[12px] text-ink-soft leading-[1.5]">{m.hook}</p>
            {ladder.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[#b8860b]/40">
                <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#8a6d0b] mb-1">REL ladder — this world&apos;s closeness motif</div>
                <div className="text-[12px] text-ink leading-[1.5]">{ladder.join("  ·  ")}</div>
              </div>
            )}
            <p className="text-[10.5px] text-margin-ink mt-2 italic">Declared per campaign on the engine (see docs/design/viral-moments.md) — shareable hooks every trophy + relationship card here holds.</p>
          </div>
        ) : null;
      })()}

      {/* ── Shareable cards (the viral moments, this campaign's skin) ── */}
      <div className="border border-[#a2b1c2] bg-white p-3 mb-6">
        <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-[#54595d] mb-1">
          ★ Shareable cards <span className="text-margin-ink normal-case">· the funny, screenshot-worthy moments — {SKINS[campaignDefaultSkin(id)].label} skin</span>
        </div>
        <p className="text-[12px] text-ink-soft mb-3 leading-[1.5]">
          The viral moments of {c.title} as the one shareable Card (funny face, never stats). Theme-skinnable +
          genre-lens variants on the <Link href="/cards" className="text-[#0645ad] hover:underline">Cards</Link> page.
        </p>
        <div className="flex gap-3 flex-wrap">
          {campaignCards(id).map((card, i) => (
            <ShareCard key={i} skin={campaignDefaultSkin(id)} campaign={c.title} c={card} />
          ))}
        </div>
        {genreLensCards(id).length > 0 && (
          <>
            <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#8a6d0b] mt-4 mb-2">the genre lens · a moment retold in an Elseworld vibe (non-canon remix, text only)</div>
            <div className="flex gap-3 flex-wrap">
              {genreLensCards(id).slice(0, 3).map((g, i) => (
                <ShareCard key={i} skin={g.skin} campaign={c.title} c={g.c} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Views (Events · Flow · Sheet · Kanban · Metrics) ── */}
      <CampaignTabs
        events={eventsSlot}
        influence={influenceSlot}
        flowWeb={flowWeb}
        flowArc={flowArc}
        rows={rows}
        coaches={coaches}
        metrics={metrics}
        uid={id}
      />

      <p className="text-[11px] text-margin-ink mt-6 leading-[1.5]">
        Read-only from the {c.runId} payloads (parity export). The app is the source of truth. ⚑ gold marks
        the selection→future-dialogue mechanic: a choice sets a flag, a later day reads it.
      </p>
    </FandomShell>
  );
}
