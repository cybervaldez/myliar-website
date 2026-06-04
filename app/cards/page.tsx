// /cards — prototype of THE CARD: the one shareable-moment frame, now THEME-
// SKINNABLE (docs/design/viral-moments.md). The grounded campaigns borrow the
// spin-offs' viral superpower — "see your moment reimagined in a theme." Same
// canonical funny moment, rendered in any Display Theme (Parchment / Vibrant /
// DOS); the player picks a skin to share. DOS terminal = the standout screenshot.
// Rule-C: a theme is a re-skin, never a canon change. (Writers-room + Gemini:
// display-themes is the right axis — safe, low-effort, leverages the DOS aesthetic.)

import { FandomShell } from "../_components/FandomShell";
import { achievementById, campaignMeta, relTiers, wingmanItems } from "../wiki/wiki-data";

export const metadata = {
  title: "Cards — shareable moments (dev) · My Life is an RPG",
  description: "The Card: one shareable frame, theme-skinnable, every viral moment renders to it.",
  robots: { index: false, follow: false },
};

type Theme = "parchment" | "vibrant" | "dos" | "corner";
type CardSpec = { kind: string; shape: "title" | "quote"; hero: string; support?: string; tag?: string };

const titleOf = (id: string, fallback: string) => achievementById(id)?.title ?? fallback;

function lifeOpsCards(): CardSpec[] {
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

function wingmanCards(): CardSpec[] {
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

// faithful to lib/theme_pack.dart palettes; corner = the Wingman's warm-dark default
const SKIN: Record<Theme, { bg: string; ink: string; sub: string; accent: string; border: string; mono: boolean; round: string; label: string }> = {
  parchment: { bg: "#f2ebdd", ink: "#1a1a1a", sub: "#5a6650", accent: "#b81f1c", border: "#2d4a2b", mono: false, round: "rounded-[2px]", label: "Parchment & Ink" },
  vibrant:   { bg: "#f6e9c9", ink: "#4a3a22", sub: "#6f5a38", accent: "#e0531f", border: "#e0531f", mono: false, round: "rounded-[14px]", label: "Vibrant Realm" },
  dos:       { bg: "#00140a", ink: "#43ff8d", sub: "#2aa860", accent: "#43ff8d", border: "#43ff8d", mono: true,  round: "rounded-none", label: "DOS-era" },
  corner:    { bg: "#241f1b", ink: "#f5ede0", sub: "#bfae97", accent: "#e0a44e", border: "#b8860b", mono: true,  round: "rounded-none", label: "the Corner" },
};

// register transforms per theme (theme-guidelines.md)
function kindFor(theme: Theme, kind: string): string {
  if (theme === "dos") return `> ${kind.replace(/^↩ /, "")} GET`;
  if (theme === "vibrant") return `${kind} ✦`;
  return kind;
}

function ShareCard({ theme, campaign, c }: { theme: Theme; campaign: string; c: CardSpec }) {
  const s = SKIN[theme];
  const heroText = theme === "dos" ? c.hero.toUpperCase() : c.hero;
  const heroSize = c.shape === "quote" || heroText.length > 22 ? (theme === "dos" ? "text-[14px]" : "text-[17px]") : "text-[24px]";
  const fam = s.mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "Georgia, serif";
  return (
    <div className={`w-[300px] shrink-0 border-[3px] ${s.round} p-4 flex flex-col`} style={{ background: s.bg, color: s.ink, borderColor: s.border, aspectRatio: "4 / 5" }}>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] tracking-[0.16em]" style={{ color: s.accent, fontFamily: fam, fontWeight: 700 }}>{s.mono ? "MY_LIFE_IS_AN_RPG" : "MY LIFE IS AN RPG"}</span>
        <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: s.sub }}>{campaign}</span>
      </div>
      <div className="mt-3 inline-block self-start text-[9px] uppercase tracking-[0.12em] border px-1.5 py-0.5" style={{ color: s.accent, borderColor: s.border }}>{kindFor(theme, c.kind)}</div>
      <div className="flex-1 flex flex-col justify-center py-3">
        {c.shape === "quote" && !s.mono && <span className="text-[22px] leading-none" style={{ color: s.accent, fontFamily: "Georgia, serif" }}>&ldquo;</span>}
        <div className={`${heroSize} leading-[1.2]`} style={{ fontFamily: fam, fontWeight: 700 }}>{s.mono && c.shape === "quote" ? `> ${heroText}` : heroText}{theme === "dos" ? " ▒" : ""}</div>
        {c.support && <div className={`text-[12px] mt-2 leading-[1.4] ${c.shape === "quote" && !s.mono ? "italic" : ""}`} style={{ color: s.sub, fontFamily: fam }}>{c.support}</div>}
      </div>
      <div className="flex items-baseline justify-between border-t pt-2 mt-1" style={{ borderColor: s.border }}>
        <span className="text-[9px] italic" style={{ color: s.sub, fontFamily: fam }}>{c.tag}</span>
        <span className="text-[10px]" style={{ color: s.accent, fontFamily: fam }}>{s.mono ? "[SHARE]" : "share ↗"}</span>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const flagship = wingmanCards()[1]; // Sloane's "read a will faster" roast — most-viral
  const showcaseThemes: Theme[] = ["parchment", "vibrant", "dos"];

  return (
    <FandomShell active="/cards">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Cards · shareable moments</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">The Card</h1>
      <p className="text-[14px] text-ink-soft mb-2 leading-[1.5] max-w-[700px]">
        One shareable frame every viral moment renders to — the face is <strong>funny</strong> (a coach&apos;s
        roast or your own wry &ldquo;tweet&rdquo;), never a stat readout. And now it&apos;s
        <strong> theme-skinnable</strong>: the grounded campaigns borrow the spin-offs&apos; viral superpower —
        the <em>same</em> moment, reimagined in any Display Theme. A re-skin, never a canon change (Rule C).
      </p>
      <p className="text-[12px] text-margin-ink mb-6 leading-[1.5] max-w-[700px]">
        Prototype-on-web-first. App port = a <code>ShareCard</code> widget the share infra renders to PNG → the
        OS share sheet, with a theme picker. Spec: <code>docs/design/viral-moments.md</code>.
      </p>

      {/* ── One moment, three themes — the new viral lever ── */}
      <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-1">
        One moment, three themes <span className="text-margin-ink normal-case">· same canonical roast — pick a skin to share (DOS = the standout)</span>
      </div>
      <div className="flex gap-4 flex-wrap mb-8 mt-3">
        {showcaseThemes.map((t) => (
          <div key={t}>
            <ShareCard theme={t} campaign="The Wingman" c={flagship} />
            <div className="text-center text-[10px] uppercase tracking-[0.12em] text-margin-ink mt-1">{SKIN[t].label}</div>
          </div>
        ))}
      </div>

      {/* ── The campaign sets in their default skins ── */}
      {[
        { title: "Life Ops", theme: "parchment" as Theme, cards: lifeOpsCards(), note: "Parchment skin (default) · tabletop self-improvement" },
        { title: "The Wingman", theme: "corner" as Theme, cards: wingmanCards(), note: "the Corner skin (default) · warm-dark, snap" },
      ].map((cam) => (
        <div key={cam.title} className="mb-8">
          <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-3">
            {cam.title} <span className="text-margin-ink">· {cam.note}</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            {cam.cards.map((c, i) => (
              <ShareCard key={i} theme={cam.theme} campaign={cam.title} c={c} />
            ))}
          </div>
        </div>
      ))}
    </FandomShell>
  );
}
