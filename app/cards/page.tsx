// /cards — prototype of THE CARD: the one shareable-moment frame, per-campaign
// skinned, that every viral motif renders to (docs/design/viral-moments.md). Real
// data from the parity export. Prototype-on-web-first; the app port is a ShareCard
// widget the existing share infra renders to PNG. Dev view.

import { FandomShell } from "../_components/FandomShell";
import {
  mainlineDays,
  wingmanDays,
  achievementById,
  campaignMeta,
  relTiers,
  wingmanItems,
  wingmanCoachById,
  characterById,
  humanizeLexicon,
  type MainlineDay,
} from "../wiki/wiki-data";

export const metadata = {
  title: "Cards — shareable moments (dev) · My Life is an RPG",
  description: "The Card: one per-campaign shareable frame every viral moment renders to.",
  robots: { index: false, follow: false },
};

type Skin = "lifeops" | "wingman";
type CardSpec = { kind: string; hero: string; support?: string; tag?: string };

const clip = (s: string, n: number) => {
  const t = humanizeLexicon(s).trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
};

// Pull the first callback (scenario/reaction variant) in a campaign's days.
function firstCallback(days: MainlineDay[]): { text: string; flag: string; day: number } | null {
  for (const d of days) {
    for (const ev of d.events) {
      if (ev.scenarioVariants?.length) return { text: ev.scenarioVariants[0].scenario, flag: ev.scenarioVariants[0].unlockIf[0], day: d.globalDayIndex };
      for (const c of ev.choices) {
        if (c.reactionVariants?.length) return { text: c.reactionVariants[0].reactionText, flag: c.reactionVariants[0].unlockIf[0], day: d.globalDayIndex };
      }
    }
  }
  return null;
}

// A short, standalone-reading memory write (the Case File quote).
function pickCaseFile(days: MainlineDay[]): { text: string; who: string | null; day: number } | null {
  let best: { text: string; who: string | null; day: number } | null = null;
  for (const d of days) {
    for (const ev of d.events) {
      for (const m of ev.memoryWrites) {
        const t = humanizeLexicon(m.text);
        if (t.length >= 40 && t.length <= 180 && (!best || t.length < best.text.length)) {
          best = { text: m.text, who: d.characterId, day: d.globalDayIndex };
        }
      }
    }
  }
  return best;
}

function gather(campaignId: "main-line" | "wingman"): { cards: CardSpec[]; nameOf: (id: string) => string | undefined } {
  const isWing = campaignId === "wingman";
  const days = isWing ? wingmanDays() : mainlineDays();
  const nameOf = (id: string) => (isWing ? wingmanCoachById(id)?.name : characterById(id)?.name);
  const ladder = isWing ? campaignMeta("wingman")?.relTierNames ?? [] : relTiers().names;
  const cards: CardSpec[] = [];

  // 1 · Trophy
  const trophyId = isWing ? "mask-off" : "the-drawer-witness";
  const t = achievementById(trophyId);
  if (t) cards.push({ kind: "ACHIEVEMENT", hero: t.title ?? "", support: t.blurb ?? "", tag: isWing ? "the moment, named" : "The One…" });

  // 2 · REL rung
  const rung = ladder[7] ?? ladder[ladder.length - 2];
  const coach = (isWing ? wingmanDays()[0]?.characterId : "kenji") ?? "";
  if (rung) cards.push({ kind: "RELATIONSHIP", hero: rung, support: `with ${nameOf(coach) ?? "your crew"}`, tag: isWing ? "the Corner ladder" : "found-family ladder" });

  // 3 · Case File
  const cf = pickCaseFile(days);
  if (cf) cards.push({ kind: "CASE FILE", hero: clip(cf.text, 150), support: `${nameOf(cf.who ?? "") ?? "—"} · Day ${cf.day}`, tag: "what they wrote about you" });

  // 4 · It Remembered (callback)
  const cb = firstCallback(days);
  if (cb) cards.push({ kind: "↩ IT REMEMBERED", hero: clip(cb.text, 150), support: `Day ${cb.day}`, tag: `because of "${achievementById(cb.flag)?.title ?? cb.flag}"` });

  // 5 · Keepsake (Wingman has authored legendaries)
  if (isWing) {
    const leg = wingmanItems().find((i) => i.rarity === "legendary");
    if (leg) cards.push({ kind: "KEEPSAKE", hero: leg.name, support: clip(leg.description, 130), tag: "legendary · worked toward" });
  }

  // 6 · Graduation (last day's closing hook)
  const last = days[days.length - 1];
  if (last?.closingHook) cards.push({ kind: "GRADUATION", hero: clip(last.closingHook, 170), support: `${nameOf(last.characterId ?? "") ?? ""} · the destination`, tag: "the coach made themselves un-needed" });

  return { cards, nameOf };
}

function ShareCard({ skin, campaign, c }: { skin: Skin; campaign: string; c: CardSpec }) {
  const wing = skin === "wingman";
  const frame = wing
    ? "bg-[#241f1b] border-[#b8860b] text-[#f5ede0]"
    : "bg-[#f2ebdd] border-[#2d4a2b] text-[#1a1a1a]";
  const accent = wing ? "text-[#e0a44e]" : "text-[#b81f1c]";
  const sub = wing ? "text-[#bfae97]" : "text-[#5a6650]";
  const rounding = wing ? "rounded-none" : "rounded-[2px]";
  return (
    <div className={`w-[300px] shrink-0 border-[3px] ${frame} ${rounding} p-4 flex flex-col`} style={{ aspectRatio: "4 / 5" }}>
      <div className="flex items-baseline justify-between">
        <span className={`font-display text-[10px] tracking-[0.16em] ${accent}`} style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>MY LIFE IS AN RPG</span>
        <span className={`text-[9px] uppercase tracking-[0.1em] ${sub}`}>{campaign}</span>
      </div>
      <div className={`mt-3 inline-block self-start text-[9px] uppercase tracking-[0.12em] border px-1.5 py-0.5 ${wing ? "border-[#b8860b]" : "border-[#2d4a2b]"} ${accent}`}>{c.kind}</div>
      <div className="flex-1 flex flex-col justify-center py-3">
        <div className="font-display text-[20px] leading-[1.15]" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>{c.hero}</div>
        {c.support && <div className={`text-[12px] mt-2 leading-[1.4] ${sub}`}>{c.support}</div>}
      </div>
      <div className="flex items-baseline justify-between border-t pt-2 mt-1" style={{ borderColor: wing ? "#3a3128" : "#cabfa6" }}>
        <span className={`text-[9px] italic ${sub}`}>{c.tag}</span>
        <span className={`text-[10px] ${accent}`}>share ↗</span>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const campaigns: { id: "main-line" | "wingman"; title: string; skin: Skin }[] = [
    { id: "main-line", title: "Life Ops", skin: "lifeops" },
    { id: "wingman", title: "The Wingman", skin: "wingman" },
  ];

  return (
    <FandomShell active="/cards">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Cards · shareable moments</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">The Card</h1>
      <p className="text-[14px] text-ink-soft mb-2 leading-[1.5] max-w-[680px]">
        One shareable frame, <strong>per-campaign skin</strong>, that every viral moment renders to —
        the title motif is the naming form, the Card is the <strong>screenshot form</strong>. Same
        anatomy + wordmark across both (brand identity); the skin + voice differ per world. Real data
        from the parity export.
      </p>
      <p className="text-[12px] text-margin-ink mb-6 leading-[1.5] max-w-[680px]">
        Prototype-on-web-first. The app port = a <code>ShareCard</code> widget the existing share infra
        renders to PNG → the OS share sheet, skin chosen by the active campaign. Spec:
        <code>docs/design/viral-moments.md</code> &ldquo;THE CARD.&rdquo;
      </p>

      {campaigns.map((cam) => {
        const { cards } = gather(cam.id);
        return (
          <div key={cam.id} className="mb-8">
            <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-3">
              {cam.title} <span className="text-margin-ink">· {cam.skin === "wingman" ? "the Corner skin (warm-dark, snap)" : "case-file skin (cream, found-family)"}</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              {cards.map((c, i) => (
                <ShareCard key={i} skin={cam.skin} campaign={cam.title} c={c} />
              ))}
            </div>
          </div>
        );
      })}
    </FandomShell>
  );
}
