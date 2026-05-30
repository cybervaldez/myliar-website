// The Main Line — the curated 7-day arc. Day skeleton derives from the
// parity export (who joins when); the per-day beats are hand-authored and
// still being filled in. Full-spoiler walkthrough lives at /walkthrough.

import Link from "next/link";
import { WikiPage, SectionHead, SpoilerTag } from "../_components/WikiChrome";
import { squad } from "../wiki-data";

export const metadata = {
  title: "The Main Line — The Codex",
  description: "The curated seven-day arc of My Life is an RPG (work in progress).",
};

// Days with a known introduction, derived from the squad join days.
function joinNotes(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const c of squad()) {
    if (c.joinsDay == null) continue;
    out[c.joinsDay] =
      c.joinsDay === 0
        ? `${c.name} runs the tutorial.`
        : `${c.name} joins (${c.classLabel}).`;
  }
  return out;
}

export default function ArcPage() {
  const notes = joinNotes();
  const days = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <WikiPage
      kicker="▸ THE CURATED CAMPAIGN · WIP"
      title="The Main Line"
      breadcrumb={[{ label: "The Codex", href: "/wiki" }]}
    >
      <div className="border-l-[3px] border-spot-red bg-paper-shade p-4 mb-6">
        <SpoilerTag>
          <span className="text-[14px]">
            This namespace covers tier-up reveals. It is written for the
            writers&apos; room — nothing is hidden.
          </span>
        </SpoilerTag>
      </div>

      <p className="text-ink-soft leading-[1.6] mb-2">
        The first seven days are a hand-tuned, bundled campaign — the spine the
        live systems hang off. The day skeleton below (who arrives when) is
        generated from the game; the beat-by-beat narrative is being authored
        here from the campaign binder.
      </p>

      <SectionHead>Day skeleton</SectionHead>
      <div className="border-2 border-ink bg-paper-shade overflow-hidden">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="bg-forest text-white font-display tracking-[0.1em] text-[10px]">
              <th className="text-left px-3 py-2 w-16">DAY</th>
              <th className="text-left px-3 py-2">WHAT HAPPENS</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d} className="border-t border-margin-ink/25">
                <td className="px-3 py-2 font-display text-forest text-[12px]">
                  {d === 0 ? "DAY 0" : `DAY ${d}`}
                </td>
                <td className="px-3 py-2 text-ink">
                  {notes[d] ?? (
                    <span className="text-margin-ink italic">
                      daily beat — narrative pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[14px] leading-[1.6] mt-6">
        For the complete, fully-spoiled play-by-play right now, see the{" "}
        <Link href="/walkthrough" className="text-forest hover:text-spot-red">
          player walkthrough
        </Link>{" "}
        — the per-day beat pages here are still being written.
      </p>
    </WikiPage>
  );
}
