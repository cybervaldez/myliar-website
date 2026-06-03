// The Codex — the item catalog, grouped by rarity. Each entry's description is
// the in-fiction "Field Notes" that doubles as an image-generation brief
// (companion-wiki §5-6). Data: harvested from the run payloads via parity.
// Reference surface — comments belong here. Legendary items render sealed (???).

import Link from "next/link";
import { items, itemSlug, humanizeLexicon, type Item } from "../wiki-data";
import { anchors } from "../../lib/codex";
import { WikiPage, SectionHead, RarityChip, type RarityTone } from "../_components/WikiChrome";
import { DiscussionThread } from "../_components/DiscussionThread";

export const metadata = {
  title: "Items — My Life is an RPG Wiki",
  description: "Everything you can carry in My Life is an RPG — mementos, keepsakes, relics, and the legendaries worked toward.",
};

// Display order + tone per item rarity (payload `kind`).
const RARITY_ORDER = ["legendary", "relic", "keepsake", "memento"] as const;
const RARITY_TONE: Record<string, RarityTone> = {
  legendary: "legendary", relic: "high", keepsake: "mid", memento: "muted",
};
const RARITY_BLURB: Record<string, string> = {
  legendary: "Aspirational. Always a mystery — worked toward, never dropped.",
  relic: "The earned ★ — pulled from a brave, lucky moment.",
  keepsake: "System-relevant. Worth keeping.",
  memento: "Little things. A hundred of them mean something.",
};

function StatDeltas({ deltas }: { deltas: Record<string, number> }) {
  const entries = Object.entries(deltas);
  if (entries.length === 0) return null;
  return (
    <span>
      {entries.map(([k, v], i) => (
        <span key={k} className={k === "REL" ? "text-spot-red" : "text-forest"}>
          {v >= 0 ? "+" : ""}
          {v} {k}
          {i < entries.length - 1 ? " · " : ""}
        </span>
      ))}
    </span>
  );
}

export default function CodexPage() {
  const all = items();
  const groups = RARITY_ORDER.map((r) => ({ rarity: r, list: all.filter((it) => it.rarity === r) })).filter(
    (g) => g.list.length > 0,
  );

  return (
    <WikiPage
      title="Items"
      breadcrumb={[{ label: "Wiki", href: "/wiki" }]}
      toc={groups.map((g) => ({ id: g.rarity, label: `${g.rarity} (${g.list.length})` }))}
      discussHref="#talk"
    >
      <p className="text-ink-soft leading-[1.6] mb-1">
        Everything you can carry. Each thing&apos;s <em>Field Notes</em> are written to be
        read — and to be drawn from. We ship no art on purpose; the words are the picture.
      </p>
      <p className="text-[12.5px] text-margin-ink mb-6">
        {all.length} things across {groups.length} rarities. Legendaries stay sealed (???)
        until earned. Tap 💬 on any entry to discuss it.
      </p>

      {groups.map((g) => (
        <section key={g.rarity}>
          <SectionHead id={g.rarity}>
            {g.rarity[0].toUpperCase() + g.rarity.slice(1)}
          </SectionHead>
          <p className="text-[12.5px] text-margin-ink italic mb-3">{RARITY_BLURB[g.rarity]}</p>
          <div className="space-y-3">
            {g.list.map((it: Item) => {
              const sealed = it.rarity === "legendary";
              return (
                <div
                  key={itemSlug(it)}
                  id={itemSlug(it)}
                  className="border border-ink bg-paper-shade p-4 scroll-mt-6"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <h3 className="font-display text-[16px] text-ink !m-0">
                      {sealed ? "??? — a sealed legend" : humanizeLexicon(it.name)}
                    </h3>
                    <RarityChip label={it.rarity} tone={RARITY_TONE[it.rarity] ?? "muted"} />
                  </div>
                  {!sealed && (
                    <p className="text-[13.5px] leading-[1.55] text-ink-soft mb-2 wiki-prose">
                      <span className="font-display tracking-[0.1em] text-[9px] text-margin-ink mr-2">
                        FIELD NOTES
                      </span>
                      {humanizeLexicon(it.description)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-display tracking-[0.1em] text-[9.5px] text-margin-ink">
                    {Object.keys(it.statDeltas).length > 0 && !sealed && (
                      <span>
                        STATS · <StatDeltas deltas={it.statDeltas} />
                      </span>
                    )}
                    {it.grantsAchievement && (
                      <span>
                        GRANTS ·{" "}
                        <Link href={`/wiki/trophies#${it.grantsAchievement}`} className="text-spot-red">
                          {it.grantsAchievement}
                        </Link>
                      </span>
                    )}
                    {it.foundDay != null && <span>DAY {it.foundDay}</span>}
                  </div>
                  {!sealed && (
                    <div className="mt-2">
                      <DiscussionThread anchor={anchors.item(itemSlug(it))} anchorLabel={humanizeLexicon(it.name)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

    </WikiPage>
  );
}
