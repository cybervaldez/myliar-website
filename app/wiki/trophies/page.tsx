// Trophies — the achievement catalog. The ONE unlock currency: everything
// that gates / reveals / buffs reads an achievement (docs/design/
// achievements-and-unlocks.md). The hub every other page links to.
// Data: parity (game → website). Reference surface — comments belong here.

import Link from "next/link";
import { achievements, items, itemSlug, type Achievement } from "../wiki-data";
import { anchors } from "../../lib/codex";
import { WikiPage, RarityChip, type RarityTone } from "../_components/WikiChrome";
import { DiscussionThread } from "../_components/DiscussionThread";

export const metadata = {
  title: "Trophies — My Life is an RPG Wiki",
  description: "Achievements are the one unlock currency in My Life is an RPG — what every gate, reveal, and buff reads.",
};

const RANK: Record<string, number> = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
const TONE: Record<string, RarityTone> = {
  legendary: "legendary", epic: "high", rare: "mid", uncommon: "low", common: "muted",
};

export default function TrophiesPage() {
  const list = [...achievements()].sort(
    (a, b) => (RANK[b.rarity] ?? 0) - (RANK[a.rarity] ?? 0) || (a.title ?? "").localeCompare(b.title ?? ""),
  );
  // reciprocal link: which items grant each trophy
  const grantedBy = (id: string) => items().filter((it) => it.grantsAchievement === id);

  return (
    <WikiPage
      title="Achievements"
      breadcrumb={[{ label: "Wiki", href: "/wiki" }]}
      discussHref="#talk"
    >
      <p className="text-ink-soft leading-[1.6] mb-2">
        Trophies are the game&apos;s one currency. Everything that unlocks — a hidden
        choice, a mystery character, an item worked toward, a sharper roll — reads a
        trophy. There is no second currency; collecting, showing up, and finishing all
        fold into these.
      </p>
      <p className="text-[12.5px] text-margin-ink mb-6">
        {list.length} trophies. Some are <em>hidden</em> until earned — those show only as
        a sealed slot, the way the game holds them back. Tap 💬 on any trophy to discuss it.
      </p>

      <div className="space-y-3">
        {list.map((a: Achievement) => {
          const sealed = a.hidden;
          const gb = grantedBy(a.id);
          return (
            <div key={a.id} id={a.id} className="border border-ink bg-paper-shade p-4 scroll-mt-6">
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <h2 className="font-display text-[17px] text-ink !m-0">
                  {sealed ? "??? — a sealed trophy" : a.title}
                </h2>
                <RarityChip label={a.rarity} tone={TONE[a.rarity] ?? "muted"} />
              </div>
              <p className="text-[14px] leading-[1.5] text-ink-soft mb-2">
                {sealed ? "You haven't earned this one yet. Keep playing." : a.blurb}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-display tracking-[0.1em] text-[9.5px] text-margin-ink">
                {a.category && <span>CATEGORY · {a.category.toUpperCase()}</span>}
                {a.critBonusPct > 0 && <span className="text-spot-red">+{a.critBonusPct}% CHAOTIC CRIT</span>}
                {gb.length > 0 && !sealed && (
                  <span>
                    GRANTED BY ·{" "}
                    {gb.map((it, i) => (
                      <span key={itemSlug(it)}>
                        <Link href={`/wiki/codex#${itemSlug(it)}`} className="text-forest">
                          {it.name}
                        </Link>
                        {i < gb.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                )}
              </div>
              {!sealed && (
                <div className="mt-2">
                  <DiscussionThread anchor={anchors.trophy(a.id)} anchorLabel={a.title ?? a.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </WikiPage>
  );
}
