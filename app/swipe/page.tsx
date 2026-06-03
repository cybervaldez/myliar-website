// /swipe — RUN SIMULATOR + PICKER (desktop-first, unlinked dev tool). The whole run as
// ONE continuous flow you read top→bottom like the game plays — dialogue, item drops, and
// character vibes inline where they happen (NO deck grouping). Pick inline: which arc, which
// content version per day, which vibe at a character's intro. Server composes the run from
// the storyboard layers; RunSimulator (client) renders + tracks picks. Pre-canon, one-way.

import board from "../lib/storyboard.json";
import { FandomShell } from "../_components/FandomShell";
import { RunSimulator, type Run, type SimStep } from "./RunSimulator";

export const metadata = {
  title: "Run Simulator — game sim + picker (dev) · My Life is an RPG",
  description: "Read the whole run top to bottom like the game plays — dialogue, items, and vibes inline — and pick the best option at each beat.",
  robots: { index: false, follow: false },
};

function buildRuns(): Run[] {
  const b = board as unknown as {
    candidates: { id: string; author?: string; title: string; pitch: string; note?: string; arc: { day: number; focal: string; type: string; beat: string; teaches: string; brings: string; tier: string }[] }[];
    dayContent: { day: number; versions: { author: string; events: { n: number; scenario: string; logical: string; passive: string; chaotic: string; note: string; drop: string }[]; inventory: string[] }[] }[];
    vibePicks: { character: string; candidates: { author: string; name: string; status: string; oneLineFeel: string; voiceSample: string }[] }[];
  };
  const byDay = Object.fromEntries((b.dayContent ?? []).map((d) => [d.day, d]));
  const vibe = b.vibePicks?.[0];

  return (b.candidates ?? []).map((arc) => ({
    id: arc.id, author: arc.author ?? arc.title, title: arc.title, pitch: arc.pitch, note: arc.note,
    steps: (arc.arc ?? []).map((d): SimStep => {
      const dc = byDay[d.day];
      const isIntro = /intro|onboarding/i.test(d.type);
      const attachVibe = isIntro && vibe && vibe.candidates.some((c) => c.name.startsWith(d.focal));
      return {
        day: d.day, focal: d.focal, type: d.type, beat: d.beat, teaches: d.teaches, brings: d.brings, tier: d.tier,
        contentVersions: (dc?.versions ?? []).map((v) => ({ author: v.author, events: v.events, inventory: v.inventory })),
        vibe: attachVibe ? { character: vibe.character, candidates: vibe.candidates.filter((c) => c.status !== "pending").map((c) => ({ author: c.author, name: c.name, oneLineFeel: c.oneLineFeel, voiceSample: c.voiceSample })) } : null,
      };
    }),
  }));
}

export default function SimulatorPage() {
  const runs = buildRuns();
  return (
    <FandomShell active="/swipe">
        <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Run simulator + picker</div>
        <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">Play the run</h1>
        <p className="text-[14px] text-ink-soft mb-6 leading-[1.5] max-w-[640px]">
          Read top → bottom like it plays (step 4). At each beat, cycle the content version or vibe — whatever&apos;s shown is your pick.
          Drafting the content itself? That&apos;s the <a href="/storyboard" className="text-spot-red">→ Storyboard</a>.
        </p>
        {runs.length ? <RunSimulator runs={runs} /> : <p className="text-[13px] text-margin-ink">No run to simulate yet.</p>}
    </FandomShell>
  );
}
