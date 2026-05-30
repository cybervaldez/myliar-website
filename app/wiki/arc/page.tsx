// The Main Line — the curated 7-day arc, now sourced LIVE from the game's
// run-005 payloads via the parity export (read-only gateway). Each day
// links to a full day page. This is the writers-room reference surface:
// complete, spoilers visible, frame-flags surfaced.

import Link from "next/link";
import { WikiPage, SectionHead, SpoilerTag } from "../_components/WikiChrome";
import { NotesThread } from "../_components/NotesThread";
import { mainline, mainlineFlagCount, characterById } from "../wiki-data";
import { anchors } from "../notes";

export const metadata = {
  title: "The Main Line — Wiki",
  description: "The curated seven-day arc of My Life is an RPG, day by day.",
};

const TYPE_LABEL: Record<string, string> = {
  onboarding: "ONBOARDING",
  introduction: "INTRODUCTION",
  daily: "DAILY",
};

export default function ArcPage() {
  const { runId, days } = mainline();
  const flagTotal = mainlineFlagCount();

  return (
    <WikiPage
      title="Story"
      breadcrumb={[{ label: "Wiki", href: "/wiki" }]}
    >
      <div className="border-l-[3px] border-spot-red bg-paper-shade p-4 mb-6">
        <SpoilerTag>
          <span className="text-[14px]">
            Full canon, spoilers visible — written for the writers&apos; room.
            Tier-up reveals are marked but not hidden.
          </span>
        </SpoilerTag>
      </div>

      <p className="text-ink-soft leading-[1.6] mb-2">
        The first week of the game, told day by day — every moment, every
        choice, every reaction. <strong>Big spoilers ahead!</strong> (Pulled
        straight from the game, so it&apos;s always exactly what you&apos;ll
        play.)
      </p>

      {flagTotal > 0 && (
        <div className="border-2 border-spot-red bg-paper p-4 my-5">
          <div className="font-display tracking-[0.14em] text-[11px] text-spot-red mb-1">
            ⚠ {flagTotal} FRAME FLAG{flagTotal === 1 ? "" : "S"} IN SHIPPED CANON
          </div>
          <p className="text-[13.5px] leading-[1.5] text-ink">
            Banned real-world words appear in shipped payload text (e.g. a
            character saying a clinical term their own sheet forbids). Flagged
            per-day below — these are to-dos for the writers&apos; room to fix
            in the payloads, surfaced here precisely because the gateway makes
            the canon visible.
          </p>
        </div>
      )}

      <SectionHead>The seven days</SectionHead>
      <div className="space-y-3">
        {days.map((d) => {
          const focal = d.characterId ? characterById(d.characterId) : null;
          const introduces = d.introducesCharacterId
            ? characterById(d.introducesCharacterId)
            : null;
          return (
            <Link
              key={d.globalDayIndex}
              href={`/wiki/arc/${d.globalDayIndex}`}
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

      <p className="text-[14px] leading-[1.6] mt-6">
        For the prose-style full-spoiler play-by-play, the{" "}
        <Link href="/walkthrough" className="text-forest hover:text-spot-red">
          player walkthrough
        </Link>{" "}
        reads it as a story; these pages are the structured canon.
      </p>

      <p className="mt-8 text-[12.5px] text-margin-ink italic">
        Generated read-only from the game&apos;s {runId} payloads. The app
        remains the source of truth — this is a browsable gateway, not a
        second canon.
      </p>

      <NotesThread anchor={anchors.arcIndex()} anchorLabel="The Main Line (arc overview)" />
    </WikiPage>
  );
}
