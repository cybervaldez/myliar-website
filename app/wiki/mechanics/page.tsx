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
      kicker="▸ THE DAILY LOOP"
      title="Mechanics"
      breadcrumb={[{ label: "Wiki", href: "/wiki" }]}
    >
      <p className="text-ink-soft leading-[1.6] mb-2">
        Every day is a short run of events. Each event offers three ways to
        answer; your choices move four stats and your relationship with whoever
        you&apos;re talking to.
      </p>

      <SectionHead id="trichotomy">The trichotomy</SectionHead>
      <p className="text-[15px] leading-[1.6]">
        Every event gives you exactly three choices, one of each kind:
      </p>
      <ul className="list-none p-0 mt-3 space-y-2">
        <li className="border-l-[3px] border-forest pl-3">
          <strong className="text-forest">Logical</strong> — the move the
          character endorses. Steady stat gains, no roll.
        </li>
        <li className="border-l-[3px] border-ink pl-3">
          <strong>Passive</strong> — observe, wait, say nothing. Low cost, low
          gain; sometimes the sleeper choice.
        </li>
        <li className="border-l-[3px] border-spot-red pl-3">
          <strong className="text-spot-red">Chaotic</strong> — always rolls{" "}
          <WikiLink to="dice">dice</WikiLink>. Crit-success doubles the reward
          (and can drop a <WikiLink to="items">relic</WikiLink>); crit-fail
          flips it against you.
        </li>
      </ul>

      <SectionHead id="dice">Dice &amp; crits</SectionHead>
      <p className="text-[15px] leading-[1.6]">
        Only the chaotic choice rolls. The roll resolves to either a
        crit-success (the stated reward, multiplied) or a crit-fail (the reward
        inverted, plus a sharper reaction). There is no bland middle — taking
        the chaotic line is taking the swing.
      </p>

      <SectionHead id="stats">The four stats</SectionHead>
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

      <SectionHead id="rel">The relationship ladder (REL)</SectionHead>
      <p className="text-[15px] leading-[1.6] mb-3">
        Each character tracks a private REL score with you. It climbs through{" "}
        {names.length} named tiers — the higher you go, the more they trust you
        with, and the deeper the reveals.
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

      <SectionHead id="items">Item rarities</SectionHead>
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

      <SectionHead id="ap">Action credits (AP)</SectionHead>
      <p className="text-[15px] leading-[1.6]">
        Talking to the squad outside the main line costs an action credit. You
        get a baseline of one a day; spend it on a chat, a trip to an{" "}
        <WikiLink to="golden-age-fantasy">Elseworld</WikiLink>, or save it. They
        remember the conversation tomorrow.
      </p>

      <p className="mt-9 text-[12.5px] text-margin-ink italic">
        The REL ladder and item rarities are generated from the game; the stat
        and loop descriptions are hand-authored game facts.
      </p>

      <NotesThread anchor={anchors.mechanics()} anchorLabel="Mechanics" />
    </WikiPage>
  );
}
