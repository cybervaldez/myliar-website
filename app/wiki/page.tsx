// Wiki — wiki portal. Category tiles into each namespace. Facts
// (counts) come from the parity export so the portal can't overstate
// coverage.

import Link from "next/link";
import { squad, vibeBands, relTiers, itemRarities } from "./wiki-data";

export const metadata = {
  title: "Wiki — My Life is an RPG Wiki",
  description:
    "The compendium of My Life is an RPG: characters, mechanics, realms, and the main line.",
};

interface Tile {
  href: string;
  title: string;
  blurb: string;
  meta: string;
  editorial?: boolean;
}

export default function WikiPortal() {
  const tiles: Tile[] = [
    {
      href: "/wiki/characters",
      title: "👥 Characters",
      blurb:
        "Meet the four friends who live in your phone — Sam, Hana, Kenji, and Mei.",
      meta: `${squad().length} characters`,
    },
    {
      href: "/wiki/elseworlds",
      title: "✦ Elseworlds",
      blurb:
        "Other worlds you can visit. Each one has a stranger waiting — and you can make them your own.",
      meta: `${vibeBands().length} worlds`,
    },
    {
      href: "/wiki/atlas",
      title: "🗺 Maps",
      blurb:
        "Where everyone hangs out: the Courtyard inside your phone, plus the doors to the other worlds.",
      meta: "phone map",
    },
    {
      href: "/wiki/mechanics",
      title: "🎮 How to Play",
      blurb:
        "The basics — making choices, rolling dice, your four stats, and getting closer to the squad.",
      meta: `${relTiers().names.length} friendship levels · ${itemRarities().length} item types`,
    },
    {
      href: "/wiki/arc",
      title: "📖 Story",
      blurb: "The first week, day by day. Big spoilers ahead!",
      meta: "7 days",
      editorial: true,
    },
    {
      href: "/wiki/lexicon",
      title: "💬 Words",
      blurb:
        "Game words explained — plus the stuff the characters will never say.",
      meta: "glossary",
      editorial: true,
    },
  ];

  return (
    <div>
      <h1 className="text-[40px] sm:text-[60px] leading-[1.0] mb-3">Wiki</h1>
      <p className="text-ink-soft max-w-[680px] leading-[1.55] mb-2">
        Everything about <em>My Life is an RPG</em>, in one place. New here?
        Start with{" "}
        <Link href="/wiki/mechanics" className="text-spot-red">
          How to Play
        </Link>
        .
      </p>
      <p className="text-[13px] text-margin-ink mb-8">
        The fact pages come straight from the game, so they&apos;re always up to
        date.
      </p>

      <div className="grid sm:grid-cols-2 gap-5">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="block border-2 border-ink bg-paper-shade p-5 !border-b-2 hover:bg-paper transition group"
          >
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <h2 className="text-[22px] group-hover:text-spot-red transition">
                {t.title}
              </h2>
              {t.editorial && (
                <span className="font-display tracking-[0.12em] text-[9px] text-margin-ink shrink-0">
                  WIP
                </span>
              )}
            </div>
            <p className="text-[14px] leading-[1.5] text-ink-soft mb-3">
              {t.blurb}
            </p>
            <div className="font-display tracking-[0.14em] text-[10px] text-forest">
              {t.meta}
            </div>
          </Link>
        ))}
      </div>

      <p className="font-sans italic text-margin-ink mt-10 text-[12.5px] leading-[1.55]">
        The fact pages update themselves from the game. Story and Words are
        still being written.
      </p>
    </div>
  );
}
