// /campaigns — the tooling codex view of every shipped CAMPAIGN and its daily
// events. A campaign = a theme-concept with an authored daily story (Life Ops
// run-005, The Wingman run-wingman). Reads the parity export (game→website,
// one-way) via the wiki data layer. Fandom-basic tooling look. Dev view.

import Link from "next/link";
import { FandomShell } from "../_components/FandomShell";
import { mainline, wingman, squad, wingmanCast } from "../wiki/wiki-data";

export const metadata = {
  title: "Campaigns — daily events (dev) · My Life is an RPG",
  description: "Every shipped campaign and its day-by-day events, from the parity export.",
  robots: { index: false, follow: false },
};

type Card = {
  id: string;
  title: string;
  tagline: string;
  runId: string;
  dayCount: number;
  cast: string[];
};

export default function CampaignsPage() {
  const ml = mainline();
  const wm = wingman();
  const cards: Card[] = [
    {
      id: "main-line",
      title: "Life Ops",
      tagline: "the flagship — coaches who run your real life like a party (STR/INT/GLD/CHR).",
      runId: ml.runId,
      dayCount: ml.days.length,
      cast: squad().map((c) => c.name),
    },
    {
      id: "wingman",
      title: "The Wingman",
      tagline: "the dating expansion — coaches who ready you for real people, then make themselves un-needed (NERVE/VOICE/READ/PRESENCE/the FLOOR).",
      runId: wm.runId,
      dayCount: wm.days.length,
      cast: wingmanCast().map((c) => c.name),
    },
  ].filter((c) => c.dayCount > 0);

  return (
    <FandomShell active="/campaigns">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Campaigns · daily events</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">Campaigns</h1>
      <p className="text-[14px] text-ink-soft mb-6 leading-[1.5] max-w-[680px]">
        A <strong>campaign</strong> is a theme-concept with an authored daily story — the same
        engine, different world. Each card opens its <strong>day-by-day events</strong> (every
        scenario, choice, delta, reaction, memory write, and reveal), read straight from the
        game&apos;s shipped payloads via parity.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.id}
            href={`/campaigns/${c.id}`}
            className="block border border-[#a2b1c2] bg-paper-shade/30 p-4 hover:bg-[#f1f4f8] transition group"
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-display text-[22px] leading-none group-hover:text-[#0645ad] transition">{c.title}</div>
              <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-margin-ink shrink-0">{c.dayCount} days</span>
            </div>
            <div className="font-sans text-[9.5px] uppercase tracking-[0.1em] text-margin-ink mt-1">{c.runId}</div>
            <p className="text-[12.5px] text-ink-soft mt-2 leading-[1.4]">{c.tagline}</p>
            <div className="text-[11px] text-margin-ink mt-2 leading-[1.4]">{c.cast.join(" · ")}</div>
            <div className="font-sans text-[10px] text-[#0645ad] mt-2 group-hover:underline">daily events →</div>
          </Link>
        ))}
      </div>

      <p className="text-[11px] text-margin-ink mt-8 leading-[1.5]">
        Generated read-only from the game&apos;s run payloads (parity export). The app remains
        the source of truth — this is a dev gateway, not a second canon. Public-facing equivalents
        live in the wiki (<Link href="/wiki/arc" className="text-[#0645ad] hover:underline">the Main Line</Link>,{" "}
        <Link href="/wiki/wingman" className="text-[#0645ad] hover:underline">the Wingman</Link>).
      </p>
    </FandomShell>
  );
}
