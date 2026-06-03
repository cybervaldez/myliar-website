// The Squad — index of the locked canonical cast + the mystery (???) slots.

import Link from "next/link";
import { WikiPage } from "../_components/WikiChrome";
import { squad, mysteryRoster } from "../wiki-data";

export const metadata = {
  title: "Characters — My Life is an RPG Wiki",
  description: "The locked canonical cast of My Life is an RPG — and the strangers you haven't earned yet.",
};

const GLYPH: Record<string, string> = { female: "♀", male: "♂", unknown: "⚲" };

export default function SquadIndex() {
  const cast = squad()
    .slice()
    .sort((a, b) => (a.joinsDay ?? 0) - (b.joinsDay ?? 0));
  const mysteries = mysteryRoster();

  return (
    <WikiPage title="Characters" breadcrumb={[{ label: "Wiki", href: "/wiki" }]}>
      <p className="text-ink-soft leading-[1.6] mb-6">
        Four of them live inside the phone. They are <strong>locked canonical sheets</strong> —
        you talk with them and toggle what they remember, but you don&apos;t edit who they are.
        You meet them in order across the first week. We don&apos;t draw them — the community
        does, from the Field Notes on each page.
      </p>

      <div className="space-y-3">
        {cast.map((c) => (
          <Link
            key={c.id}
            href={`/wiki/characters/${c.id}`}
            className="block border-[1.5px] border-ink bg-paper-shade p-4 hover:bg-paper transition !border-b-[1.5px] group"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-display text-[24px] leading-none group-hover:text-spot-red transition">
                {c.name}
                <span className="text-forest font-body italic text-base ml-2">
                  {GLYPH[c.gender ?? "unknown"] ?? "⚲"}
                </span>
              </div>
              <div className="font-display tracking-[0.12em] text-[10px] text-margin-ink shrink-0">
                {c.joinsDay === 0 ? "DAY 0 · ONBOARDING" : `JOINS DAY ${c.joinsDay}`}
              </div>
            </div>
            <div className="font-display tracking-[0.14em] text-[11px] text-spot-red mt-1">
              {(c.classLabel ?? "").toUpperCase()} · {c.specialty}
            </div>
            {c.archetype && (
              <p className="text-[14px] text-ink-soft italic mt-2 leading-[1.45]">{c.archetype}</p>
            )}
          </Link>
        ))}

        {/* Mystery slots — sealed ??? tiles (companion-wiki §6) */}
        {mysteries.map((m) => (
          <Link
            key={m.id}
            href={`/wiki/characters/${m.id}`}
            className="block border-[1.5px] border-margin-ink/50 bg-paper-shade/60 p-4 hover:bg-paper transition !border-b-[1.5px] group"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-display text-[24px] leading-none text-margin-ink">
                ???
                <span className="text-margin-ink font-body italic text-base ml-2">
                  {GLYPH[m.gender ?? "unknown"] ?? "⚲"}
                </span>
              </div>
              <div className="font-display tracking-[0.12em] text-[10px] text-margin-ink shrink-0">
                SEALED · {m.gateCount}
              </div>
            </div>
            <div className="font-display tracking-[0.14em] text-[11px] text-margin-ink mt-1">
              A STRANGER YOU&apos;VE MET
            </div>
            <p className="text-[14px] text-margin-ink italic mt-2 leading-[1.45]">
              Keep playing — their name fills in when you&apos;ve earned it.
            </p>
          </Link>
        ))}
      </div>
    </WikiPage>
  );
}
