// CampaignSystems — the campaign-level mechanics dashboard (the systems THIS campaign runs on).
// Most of it is DERIVED from the cast; the engine facts are shared across campaigns. Surfaces the
// forgotten campaign-level concepts (theme · the 10-tier REL ladder · stat coverage · the full-REL
// payoff · items/achievements · the engine) that the per-character views don't show.

import type { CastMember } from "./CastView";

const REL_LADDER = [
  "Circling", "On your radar", "Inside their orbit", "Trading favors", "In your corner",
  "Saved a seat for you", "Knows where you keep things", "Folded in", "Named in the will", "Unspoken",
];

function Cell({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-spot-red mb-1">{label}</div>
      <div className="text-ink-soft leading-[1.5]">{children}</div>
    </div>
  );
}

export function CampaignSystems({ theme, statReskin, cast }: { theme?: string; statReskin?: string; cast: CastMember[] }) {
  const stats = [...new Set(cast.map((m) => m.stat).filter(Boolean))];
  const keepsakes = cast.filter((m) => m.keepsake).map((m) => ({ who: m.name ?? m.role, keepsake: m.keepsake }));
  const legendaries = cast.filter((m) => m.legendary).length;

  return (
    <details className="border border-ink/30 bg-paper-shade/30 mb-6">
      <summary className="cursor-pointer font-sans text-[12px] uppercase tracking-[0.14em] text-forest px-4 py-2.5 select-none">
        ⚙ Systems — what this campaign runs on
      </summary>
      <div className="px-4 pb-4 pt-1 text-[12px] grid sm:grid-cols-2 gap-x-6 gap-y-4">
        <Cell label="Native theme · register">{theme ?? "—"}</Cell>
        <Cell label="Stat coverage (the polygon)">
          {stats.length ? <strong>{stats.join(" · ")}</strong> : "—"} <span className="text-margin-ink">— the cast's complementary STR/INT/GLD/CHR + meta lanes</span>
          {statReskin && <div className="text-[11px] text-forest mt-1">This world's labels: {statReskin}</div>}
        </Cell>

        <Cell label="The climb — 10 REL tiers (the chat is the destination)" wide>
          {REL_LADDER.map((t, i) => (
            <span key={t}>{i > 0 && " → "}<span className={t === "Unspoken" ? "font-bold text-ink" : ""}>{t}</span></span>
          ))}
          <div className="text-[10px] text-margin-ink mt-0.5">Main Line spends to ~Folded-in; a continuation climbs to Unspoken (full REL = the richest chat).</div>
        </Cell>

        <Cell label="Full-REL payoff (Unspoken · per character)" wide>
          <strong>KNOW</strong> intimate title · <strong>DO</strong> the inversion (the gift turns around) · <strong>KEEP</strong> the Passive (a telegraph, not a buff) + a legendary keepsake · <strong>MUTUAL</strong> they reach out
        </Cell>

        <Cell label="What you earn">
          Items: memento → keepsake → relic → <span style={{ color: "#7a5c00" }}>legendary</span> (always-mystery, worked toward). · {legendaries} legendary {legendaries === 1 ? "keepsake" : "keepsakes"} (one per coach at Unspoken).
          {keepsakes.length > 0 && (
            <ul className="text-[11px] text-margin-ink mt-1">
              {keepsakes.map((k) => <li key={String(k.who)}>★ <i>{k.keepsake}</i> — {k.who}</li>)}
            </ul>
          )}
        </Cell>

        <Cell label="The engine">
          <strong>Achievements = the ONE currency</strong> (counters · mystery chars/items · ★ conditional choices · crit buffs). Notes → REL → chat. Battle minigame (theme-gated). NG+ / Memory Theater + post-ending. 1 AP/day.
        </Cell>
      </div>
    </details>
  );
}
