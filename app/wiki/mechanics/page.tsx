// Mechanics — the daily loop. REL ladder + item rarities render from the
// parity export; the four stats and the trichotomy are stable game facts
// described here in prose (with cross-links to the characters who own
// each stat lane).

import { WikiPage, SectionHead, WikiLink } from "../_components/WikiChrome";
import { NotesThread } from "../_components/NotesThread";
import { relTiers, itemRarities, relRange } from "../wiki-data";
import { anchors } from "../notes";

export const metadata = {
  title: "Mechanics — Wiki",
  description:
    "The daily loop of My Life is an RPG: the trichotomy, dice, stats, REL tiers, item rarities.",
};

// Stat ownership per the JRPG-party table (docs/design/rpg-framing.md):
// Hana=STR, Kenji=INT+GLD, Mei=GLD-CHR, player=CHR (chaotic crits),
// Sam=INT-adjacent meta. The /writers-room blend gate flags drift here.
const STATS = [
  { key: "STR", name: "Strength", blurb: "Body and follow-through.", owner: "hana", ownerNote: "" },
  { key: "INT", name: "Intellect", blurb: "Systems, attention, knowing the plan.", owner: "kenji", ownerNote: " (Sam meta-adjacent)" },
  { key: "GLD", name: "Gold", blurb: "Resources and what you owe.", owner: "kenji", ownerNote: " and Mei" },
  { key: "CHR", name: "Charisma", blurb: "Nerve, presence, the chaotic swing — earned from chaotic crit-successes.", owner: "mei", ownerNote: " and you" },
];

const RARITY_BLURB: Record<string, string> = {
  memento: "Flavor drop, frequent (3–6/day). Screenshots, charts, small artifacts. Collapsed into a single line at day end.",
  keepsake: "System-relevant (1–2/day). Marks a skill unlock, a context toggle, a milestone. The expected reward of the logical path.",
  relic: "Rare (0–1/day, often 0). Chaotic crit-success drops and tier-up commemorations. The only place a star appears outside achievements.",
};

export default function MechanicsPage() {
  const { names } = relTiers();

  return (
    <WikiPage
      title="How to Play"
      breadcrumb={[{ label: "Wiki", href: "/wiki" }]}
    >
      <p className="text-ink-soft leading-[1.6] mb-2">
        Each day you get a short story — a few moments to react to. Every moment
        gives you three ways to answer, and what you pick nudges your four stats
        and how close you are to whoever you&apos;re talking to.
      </p>

      <SectionHead id="trichotomy">🎯 Your three choices</SectionHead>
      <p className="text-[15px] leading-[1.6]">
        Every moment has exactly three options, one of each type:
      </p>
      <ul className="list-none p-0 mt-3 space-y-2">
        <li className="border-l-[3px] border-forest pl-3">
          <strong className="text-forest">Logical</strong> — the safe, smart
          move the character would back. Steady stat gain, no dice.
        </li>
        <li className="border-l-[3px] border-ink pl-3">
          <strong>Passive</strong> — hang back and watch, say nothing. Low risk,
          low reward — but sometimes it&apos;s secretly the right call.
        </li>
        <li className="border-l-[3px] border-spot-red pl-3">
          <strong className="text-spot-red">Chaotic</strong> — always{" "}
          <WikiLink to="dice">rolls the dice</WikiLink>. Win big (double reward,
          maybe a rare <WikiLink to="items">item</WikiLink>) or whiff and have it
          backfire.
        </li>
      </ul>

      <SectionHead id="dice">🎲 Rolling the dice</SectionHead>
      <p className="text-[15px] leading-[1.6]">
        Only the chaotic choice rolls. It either <strong>crits</strong> (you
        win — reward doubled) or <strong>flops</strong> (it backfires, and the
        character&apos;s reaction stings a little). No boring middle — going
        chaotic means taking the swing.
      </p>

      <SectionHead id="stats">📊 Your four stats</SectionHead>
      <div className="grid sm:grid-cols-2 gap-3 mt-2">
        {STATS.map((s) => (
          <div key={s.key} className="border-[1.5px] border-ink bg-paper-shade p-3">
            <div className="font-display tracking-[0.14em] text-[12px] text-spot-red">
              {s.key} · {s.name}
            </div>
            <p className="text-[13.5px] leading-[1.45] mt-1 text-ink">
              {s.blurb}
              {s.owner && (
                <>
                  {" "}
                  Lane carried by <WikiLink to={s.owner} />
                  {s.ownerNote}.
                </>
              )}
            </p>
          </div>
        ))}
      </div>

      <SectionHead id="rel">❤️ Making friends (REL)</SectionHead>
      <p className="text-[15px] leading-[1.6] mb-3">
        Each character keeps a secret friendship score with you (called REL).
        It climbs through {names.length} levels — the higher it gets, the more
        they trust you, and the bigger the things they&apos;ll tell you.
      </p>
      <div className="border-2 border-ink bg-paper-shade overflow-hidden">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-forest text-white font-display tracking-[0.1em] text-[10px]">
              <th className="text-left px-3 py-2 w-12">#</th>
              <th className="text-left px-3 py-2">TIER</th>
              <th className="text-left px-3 py-2 w-24">REL</th>
            </tr>
          </thead>
          <tbody>
            {names.map((n, i) => (
              <tr key={i} className="border-t border-margin-ink/25">
                <td className="px-3 py-1.5 font-display text-margin-ink text-[11px]">
                  {i + 1}
                </td>
                <td className="px-3 py-1.5 text-ink">{n}</td>
                <td className="px-3 py-1.5 font-display text-[11px] text-forest">
                  {relRange(i)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHead id="items">🎁 Items</SectionHead>
      <div className="space-y-3 mt-2">
        {itemRarities().map((r) => (
          <div key={r} className="border-[1.5px] border-ink bg-paper-shade p-3">
            <div className="font-display tracking-[0.14em] text-[12px] text-spot-red">
              {r === "relic" ? "★ " : "▸ "}
              {r.toUpperCase()}
            </div>
            <p className="text-[13.5px] leading-[1.5] mt-1 text-ink">
              {RARITY_BLURB[r] ?? ""}
            </p>
          </div>
        ))}
      </div>

      <SectionHead id="ap">⚡ Energy (AP)</SectionHead>
      <p className="text-[15px] leading-[1.6]">
        Chatting with the squad outside the daily story costs 1 energy (AP). You
        get one a day — spend it on a chat, a trip to an{" "}
        <WikiLink to="golden-age-fantasy">Elseworld</WikiLink>, or save it for
        later. Whatever you talk about, they remember it tomorrow.
      </p>

      <p className="mt-9 text-[12.5px] text-margin-ink italic">
        The REL ladder and item rarities are generated from the game; the stat
        and loop descriptions are hand-authored game facts.
      </p>

      <NotesThread anchor={anchors.mechanics()} anchorLabel="Mechanics" />
    </WikiPage>
  );
}
