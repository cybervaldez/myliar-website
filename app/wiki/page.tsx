// The Compendium — the Codex portal. Six fixed tiles into the game's content
// (companion-wiki §4). Counts come from the parity export so the portal can't
// overstate coverage.

import Link from "next/link";
import { squad, items, achievements, vibeBands, relTiers, mainlineDays } from "./wiki-data";

export const metadata = {
  title: "My Life is an RPG Wiki",
  description:
    "The community wiki for My Life is an RPG — characters, items, achievements, the worlds, and the story.",
};

interface Tile {
  href: string;
  title: string;
  blurb: string;
  meta: string;
  editorial?: boolean;
}

export default function Compendium() {
  const tiles: Tile[] = [
    {
      href: "/wiki/characters",
      title: "Characters",
      blurb: "The four who live in your phone — and the strangers you haven't earned yet.",
      meta: `${squad().length} canon · ??? mystery`,
    },
    {
      href: "/wiki/codex",
      title: "Items",
      blurb: "Everything you can carry — kept, earned, and worked toward.",
      meta: `${items().length} things`,
    },
    {
      href: "/wiki/trophies",
      title: "Achievements",
      blurb: "What unlocks everything. The one currency the whole game runs on.",
      meta: `${achievements().length} trophies`,
    },
    {
      href: "/wiki/atlas",
      title: "Worlds",
      blurb: "Your phone's courtyard, and the doors that open onto other worlds.",
      meta: `1 map · ${vibeBands().length} worlds`,
    },
    {
      href: "/wiki/arc",
      title: "Story",
      blurb: "The first weeks, day by day. Big spoilers past this door.",
      meta: `${mainlineDays().length} days`,
      editorial: true,
    },
    {
      href: "/wiki/mechanics",
      title: "How to Play",
      blurb: "How any of this works — choices, dice, your four stats, getting closer.",
      meta: `${relTiers().names.length} REL tiers`,
    },
  ];

  return (
    <div>
      <h1 className="text-[34px] sm:text-[46px] leading-[1.05] mb-3">My Life is an RPG Wiki</h1>
      <p className="text-ink-soft max-w-[680px] leading-[1.55] mb-2">
        The community wiki for <em>My Life is an RPG</em> — the four characters who live in
        your phone, everything you can carry, the achievements, the worlds, and the story.
        New here? Start with{" "}
        <Link href="/wiki/mechanics" className="text-spot-red">
          How to Play
        </Link>
        .
      </p>
      <p className="text-[13px] text-margin-ink mb-8">
        The fact pages come straight from the game — they&apos;re always up to date. The
        faces are drawn by the community.
      </p>

      <div className="grid sm:grid-cols-2 gap-5">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="block border-2 border-ink bg-paper-shade p-5 !border-b-2 hover:bg-paper transition group"
          >
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <h2 className="text-[22px] group-hover:text-spot-red transition">{t.title}</h2>
              {t.editorial && (
                <span className="font-display tracking-[0.12em] text-[9px] text-margin-ink shrink-0">
                  SPOILERS
                </span>
              )}
            </div>
            <p className="text-[14px] leading-[1.5] text-ink-soft mb-3">{t.blurb}</p>
            <div className="font-display tracking-[0.14em] text-[10px] text-forest">{t.meta}</div>
          </Link>
        ))}
      </div>

      <p className="font-sans italic text-margin-ink mt-10 text-[12.5px] leading-[1.55]">
        We don&apos;t draw the characters on purpose — you picture them yourself, and the
        community gives them faces. The Story and Lexicon are still being written.
      </p>
    </div>
  );
}
