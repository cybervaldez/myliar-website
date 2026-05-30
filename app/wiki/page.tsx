// The Codex — wiki portal. Category tiles into each namespace. Facts
// (counts) come from the parity export so the portal can't overstate
// coverage.

import Link from "next/link";
import { squad, vibeBands, relTiers, itemRarities } from "./wiki-data";

export const metadata = {
  title: "The Codex — My Life is an RPG Wiki",
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
      title: "Dramatis Personae",
      blurb:
        "The locked canonical squad. Voice, archetype, what they'd never say, what they always notice.",
      meta: `${squad().length} characters`,
    },
    {
      href: "/wiki/elseworlds",
      title: "Elseworlds",
      blurb:
        "The six vibe bands and the stranger waiting at the door of each. Player-customizable side realms.",
      meta: `${vibeBands().length} bands`,
    },
    {
      href: "/wiki/atlas",
      title: "Atlas",
      blurb:
        "The Courtyard — where the squad lives inside your phone. Five portals to the Elseworlds.",
      meta: "phone-realm map",
    },
    {
      href: "/wiki/mechanics",
      title: "Mechanics",
      blurb:
        "The daily loop: the trichotomy, dice and crits, the four stats, the relationship ladder, item rarities.",
      meta: `${relTiers().names.length} REL tiers · ${itemRarities().length} rarities`,
    },
    {
      href: "/wiki/arc",
      title: "The Main Line",
      blurb:
        "The curated seven-day arc, day by day. Tier-up reveals tagged. Heavy spoilers.",
      meta: "7-day campaign",
      editorial: true,
    },
    {
      href: "/wiki/lexicon",
      title: "Lexicon",
      blurb:
        "The in-world vocabulary — Sigil, Margin, Roster, Audit, Drill, Mise — and the words the game refuses to say.",
      meta: "glossary",
      editorial: true,
    },
  ];

  return (
    <div>
      <div className="font-display tracking-[0.2em] text-[11px] text-spot-red mb-2">
        ▸ THE COMPENDIUM
      </div>
      <h1 className="text-[40px] sm:text-[60px] leading-[1.0] mb-3">
        The Codex
      </h1>
      <p className="text-ink-soft max-w-[680px] leading-[1.55] mb-8">
        Everything known about <em>My Life is an RPG</em> — the canonical
        squad, the realms, the rules of the daily loop. The factual pages are
        generated from the game itself, so what you read here is what the game
        actually ships.
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
        — the factual pages mirror the game via the parity export; the main
        line and lexicon are hand-authored and still being filled in.
      </p>
    </div>
  );
}
