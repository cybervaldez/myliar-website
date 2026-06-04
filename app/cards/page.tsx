// /cards — prototype of THE CARD: the one shareable-moment frame, per-campaign
// skinned, every viral motif renders to (docs/design/viral-moments.md). The card
// FACE is FUNNY + screenshot-worthy — a coach's quotable roast or the player's
// wry "tweet" — never a stat readout (writers-room + Gemini approved). Real
// titles/rungs/items pulled from parity so they stay synced; the captions are
// authored. The app port = a ShareCard widget the share infra renders to PNG.

import { FandomShell } from "../_components/FandomShell";
import { achievementById, campaignMeta, relTiers, wingmanItems } from "../wiki/wiki-data";

export const metadata = {
  title: "Cards — shareable moments (dev) · My Life is an RPG",
  description: "The Card: one per-campaign shareable frame every viral moment renders to.",
  robots: { index: false, follow: false },
};

type Skin = "lifeops" | "wingman";
// shape: "title" = short hero + funny caption below · "quote" = the funny line IS the hero
type CardSpec = { kind: string; shape: "title" | "quote"; hero: string; support?: string; tag?: string };

const titleOf = (id: string, fallback: string) => achievementById(id)?.title ?? fallback;

function gather(campaignId: "main-line" | "wingman"): CardSpec[] {
  if (campaignId === "wingman") {
    const ladder = campaignMeta("wingman")?.relTierNames ?? [];
    const keepsake = wingmanItems().find((i) => i.rarity === "legendary" && i.name === "Beat the Count");
    return [
      { kind: "ACHIEVEMENT", shape: "title", hero: titleOf("mask-off", "She Said Nothing"),
        support: "Showed up to a date as a whole person. My coach was so proud she said literally nothing.", tag: "the moment, named" },
      { kind: "CASE FILE", shape: "quote", hero: "You spent three hours decoding a 👍. I've seen people read a will faster.",
        support: "— Sloane, the Reader", tag: "what they wrote about you" },
      { kind: "↩ IT REMEMBERED", shape: "quote", hero: "Tried to charm a leaving table back on Day 11. The game brought it up on Day 16. My dating apps have never once remembered my name.",
        support: "the game remembered", tag: "your choices echo days later" },
      { kind: "KEEPSAKE", shape: "title", hero: keepsake?.name ?? "Beat the Count",
        support: "A trophy for moving before I could talk myself out of it. Framed it. Right next to the fear.", tag: "legendary · worked toward" },
      { kind: ladder[7] ? ladder[7].toUpperCase() : "RELATIONSHIP", shape: "title", hero: ladder[7] ?? "Cornerman",
        support: "Most stable relationship I have and he isn't even real.", tag: "the Corner ladder" },
      { kind: "GRADUATION", shape: "quote", hero: "My coach fired himself because I don't need him anymore. Healthiest breakup of my life.",
        support: "the coach, obsolete", tag: "the destination" },
    ];
  }
  const names = relTiers().names;
  return [
    { kind: "ACHIEVEMENT", shape: "title", hero: titleOf("the-drawer-witness", "The One Who Witnessed the Audit"),
      support: "Watched a man finish an eleven-year spreadsheet and felt things. This is my life now.", tag: "The One…" },
    { kind: "CASE FILE", shape: "quote", hero: "showed up at six a.m. twice. starting to think they might be a person.",
      support: "— Hana, about you", tag: "what they wrote about you" },
    { kind: "↩ IT REMEMBERED", shape: "quote", hero: "Mentioned my sister once, on Day 9. Hana brought her up on Day 13. My real friends don't listen this well.",
      support: "the game remembered", tag: "your choices echo days later" },
    { kind: (names[8] ?? "RELATIONSHIP").toUpperCase(), shape: "title", hero: names[8] ?? "Named in the will",
      support: "…with my accountability coach. We've known each other eleven days.", tag: "the closeness ladder" },
    { kind: "GRADUATION", shape: "quote", hero: "Finished the week. A man who lives in my phone framed it on a wall. I'm fine. The ledger's crying.",
      support: "the destination", tag: "the coach, obsolete" },
  ];
}

function ShareCard({ skin, campaign, c }: { skin: Skin; campaign: string; c: CardSpec }) {
  const wing = skin === "wingman";
  const frame = wing ? "bg-[#241f1b] border-[#b8860b] text-[#f5ede0]" : "bg-[#f2ebdd] border-[#2d4a2b] text-[#1a1a1a]";
  const accent = wing ? "text-[#e0a44e]" : "text-[#b81f1c]";
  const sub = wing ? "text-[#bfae97]" : "text-[#5a6650]";
  const rounding = wing ? "rounded-none" : "rounded-[2px]";
  // quote cards / long titles get a smaller hero so the funny line fits the face
  const heroSize = c.shape === "quote" || c.hero.length > 22 ? "text-[17px]" : "text-[24px]";
  return (
    <div className={`w-[300px] shrink-0 border-[3px] ${frame} ${rounding} p-4 flex flex-col`} style={{ aspectRatio: "4 / 5" }}>
      <div className="flex items-baseline justify-between">
        <span className={`text-[10px] tracking-[0.16em] ${accent}`} style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>MY LIFE IS AN RPG</span>
        <span className={`text-[9px] uppercase tracking-[0.1em] ${sub}`}>{campaign}</span>
      </div>
      <div className={`mt-3 inline-block self-start text-[9px] uppercase tracking-[0.12em] border px-1.5 py-0.5 ${wing ? "border-[#b8860b]" : "border-[#2d4a2b]"} ${accent}`}>{c.kind}</div>
      <div className="flex-1 flex flex-col justify-center py-3">
        {c.shape === "quote" && <span className={`${accent} text-[22px] leading-none`} style={{ fontFamily: "Georgia, serif" }}>&ldquo;</span>}
        <div className={`${heroSize} leading-[1.2]`} style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>{c.hero}</div>
        {c.support && <div className={`text-[12px] mt-2 leading-[1.4] ${sub} ${c.shape === "quote" ? "italic" : ""}`}>{c.support}</div>}
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
        One shareable frame, <strong>per-campaign skin</strong>, that every viral moment renders to. The
        face is <strong>funny + screenshot-worthy</strong> — a coach&apos;s quotable roast or your own wry
        &ldquo;tweet&rdquo; — <strong>never a stat readout</strong> (the +CRIT / +STR math is the engine,
        not the flex). Writers-room + Gemini approved.
      </p>
      <p className="text-[12px] text-margin-ink mb-6 leading-[1.5] max-w-[680px]">
        Prototype-on-web-first. App port = a <code>ShareCard</code> widget the existing share infra renders
        to PNG → the OS share sheet, skin by the active campaign. Spec: <code>docs/design/viral-moments.md</code>.
      </p>
      {campaigns.map((cam) => (
        <div key={cam.id} className="mb-8">
          <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-3">
            {cam.title} <span className="text-margin-ink">· {cam.skin === "wingman" ? "the Corner skin (warm-dark, snap)" : "case-file skin (cream, found-family)"}</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            {gather(cam.id).map((c, i) => (
              <ShareCard key={i} skin={cam.skin} campaign={cam.title} c={c} />
            ))}
          </div>
        </div>
      ))}
    </FandomShell>
  );
}
