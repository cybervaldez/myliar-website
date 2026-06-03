// The Wingman — the dating expansion, sourced LIVE from the game's
// run-wingman payloads via the parity export (read-only gateway). The cast
// (five coaches) + the curated 25-day arc, day by day. Same one-way rule as
// the Main Line: truth flows game → website, never back.

import Link from "next/link";
import { WikiPage, SectionHead, SpoilerTag } from "../_components/WikiChrome";
import { DiscussionThread } from "../_components/DiscussionThread";
import { wingman, wingmanCoachById, wingmanFlagCount } from "../wiki-data";
import { contentHash } from "../../lib/codex";

export const metadata = {
  title: "The Wingman — Wiki",
  description:
    "The dating expansion of My Life is an RPG: five coaches and the curated 25-day arc, day by day.",
};

const TYPE_LABEL: Record<string, string> = {
  onboarding: "ONBOARDING",
  introduction: "INTRODUCTION",
  daily: "DAILY",
};

export default function WingmanPage() {
  const { runId, cast, days } = wingman();
  const flagTotal = wingmanFlagCount();

  return (
    <WikiPage title="The Wingman" breadcrumb={[{ label: "Wiki", href: "/wiki" }]}>
      <div className="border-l-[3px] border-spot-red bg-paper-shade p-4 mb-6">
        <SpoilerTag>
          <span className="text-[14px]">
            Full canon, spoilers visible — written for the writers&apos; room.
            Tier-up reveals and earned titles are marked but not hidden.
          </span>
        </SpoilerTag>
      </div>

      <p className="text-ink-soft leading-[1.6] mb-2">
        The dating expansion — a parallel campaign with its own cast and its own
        register, <strong>the Corner</strong>. Five coaches ready you for real
        people, then make themselves un-needed. The whole arc, told day by day —
        every coach, every choice, every reaction. <strong>Big spoilers
        ahead!</strong> (Pulled straight from the game, so it&apos;s always
        exactly what you&apos;ll play.)
      </p>

      {flagTotal > 0 && (
        <div className="border-2 border-spot-red bg-paper p-4 my-5">
          <div className="font-display tracking-[0.14em] text-[11px] text-spot-red mb-1">
            ⚠ {flagTotal} FRAME FLAG{flagTotal === 1 ? "" : "S"} IN SHIPPED CANON
          </div>
          <p className="text-[13.5px] leading-[1.5] text-ink">
            Banned real-world words appear in shipped payload text — flagged
            per-day below, a to-do for the writers&apos; room to fix in the
            payloads.
          </p>
        </div>
      )}

      <SectionHead>The crew — your corner</SectionHead>
      <div className="grid gap-3 sm:grid-cols-2">
        {cast.map((c) => (
          <div
            key={c.id}
            id={c.id}
            className="border-[1.5px] border-ink bg-paper-shade p-4 scroll-mt-24"
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-display text-[20px] leading-none">{c.name}</div>
              {c.statLane && (
                <span className="font-display tracking-[0.12em] text-[10px] text-spot-red border border-spot-red px-1.5 py-0.5">
                  {c.statLane}
                </span>
              )}
            </div>
            <div className="font-display tracking-[0.12em] text-[10px] text-margin-ink mt-1">
              {c.classLabel}
              {c.joinsDay != null && ` · joins Day ${c.joinsDay}`}
            </div>
            {c.titles.length > 0 && (
              <div className="text-[12.5px] text-forest mt-1.5 leading-[1.4]">
                {c.titles.join(" · ")}
              </div>
            )}
            {c.helpSummary && (
              <p className="text-[13.5px] text-ink-soft mt-2 leading-[1.45]">
                {c.helpSummary}
              </p>
            )}
            {c.introLine && (
              <p className="text-[13px] italic text-margin-ink mt-2 leading-[1.45] border-l-2 border-margin-ink/40 pl-2">
                &ldquo;{c.introLine}&rdquo;
              </p>
            )}
            {c.intimateTitle && (
              <div className="mt-2">
                <SpoilerTag>
                  <span className="text-[12px]">
                    Unspoken (full REL): <strong>{c.intimateTitle}</strong>
                  </span>
                </SpoilerTag>
              </div>
            )}
          </div>
        ))}
      </div>

      <SectionHead>The 25 days</SectionHead>
      <div className="space-y-3">
        {days.map((d) => {
          const focal = d.characterId ? wingmanCoachById(d.characterId) : null;
          const introduces = d.introducesCharacterId
            ? wingmanCoachById(d.introducesCharacterId)
            : null;
          return (
            <Link
              key={d.globalDayIndex}
              href={`/wiki/wingman/${d.globalDayIndex}`}
              className="block border-[1.5px] border-ink bg-paper-shade p-4 hover:bg-paper transition !border-b-[1.5px] group"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-[22px] leading-none group-hover:text-spot-red transition">
                  Day {d.globalDayIndex}
                  {focal && (
                    <span className="text-forest font-body italic text-base ml-2">
                      {focal.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.frameFlags.length > 0 && (
                    <span className="font-display tracking-[0.1em] text-[9px] text-spot-red border border-spot-red px-1.5 py-0.5">
                      ⚠ {d.frameFlags.length}
                    </span>
                  )}
                  <span className="font-display tracking-[0.12em] text-[10px] text-margin-ink">
                    {TYPE_LABEL[d.narrativeType] ?? d.narrativeType.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-[13.5px] text-ink-soft mt-2 leading-[1.45]">
                {d.events.length} events
                {introduces && (
                  <>
                    {" · "}
                    <span className="text-forest">introduces {introduces.name}</span>
                  </>
                )}
                {d.tierUpReveal && (
                  <>
                    {" · "}
                    <span className="text-spot-red">
                      tier-up reveal ({d.tierUpReveal.category})
                    </span>
                  </>
                )}
              </div>
              {d.closingHook && (
                <p className="text-[13px] italic text-margin-ink mt-2 leading-[1.4]">
                  → {d.closingHook}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-[12.5px] text-margin-ink italic">
        Generated read-only from the game&apos;s {runId} payloads. The app
        remains the source of truth — this is a browsable gateway, not a second
        canon.
      </p>

      <DiscussionThread
        defaultOpen
        anchor="wingman:index"
        anchorLabel="The Wingman (arc overview)"
        currentHash={contentHash(days.map((d) => d.payloadId).join(","))}
      />
    </WikiPage>
  );
}
