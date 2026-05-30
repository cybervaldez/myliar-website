// Dramatis Personae — index of the canonical squad.

import Link from "next/link";
import { WikiPage } from "../_components/WikiChrome";
import { squad } from "../wiki-data";

export const metadata = {
  title: "Dramatis Personae — The Codex",
  description: "The canonical squad of My Life is an RPG.",
};

export default function CharactersIndex() {
  return (
    <WikiPage
      kicker="▸ THE LOCKED CANON"
      title="Dramatis Personae"
      breadcrumb={[{ label: "The Codex", href: "/wiki" }]}
    >
      <p className="text-ink-soft leading-[1.6] mb-6">
        Four characters live inside the phone. They are{" "}
        <strong>locked canonical sheets</strong> — you talk with them, toggle
        which memories they hold, but you don&apos;t edit who they are. You meet
        them in order across the first week.
      </p>
      <div className="space-y-3">
        {squad()
          .slice()
          .sort((a, b) => (a.joinsDay ?? 0) - (b.joinsDay ?? 0))
          .map((c) => (
            <Link
              key={c.id}
              href={`/wiki/characters/${c.id}`}
              className="block border-[1.5px] border-ink bg-paper-shade p-4 hover:bg-paper transition !border-b-[1.5px] group"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-[24px] leading-none group-hover:text-spot-red transition">
                  {c.name}
                  <span className="text-forest font-body italic text-base ml-2">
                    {c.gender === "female" ? "♀" : "♂"}
                  </span>
                </div>
                <div className="font-display tracking-[0.12em] text-[10px] text-margin-ink shrink-0">
                  {c.joinsDay === 0 ? "DAY 0 · TUTORIAL" : `JOINS DAY ${c.joinsDay}`}
                </div>
              </div>
              <div className="font-display tracking-[0.14em] text-[11px] text-spot-red mt-1">
                {c.classLabel.toUpperCase()} · {c.specialty}
              </div>
              {c.archetype && (
                <p className="text-[14px] text-ink-soft italic mt-2 leading-[1.45]">
                  {c.archetype}
                </p>
              )}
            </Link>
          ))}
      </div>
    </WikiPage>
  );
}
