// THE CARD — the shareable-moment frame, theme-skinnable + genre-lens-able.
// Shared by /cards (the showcase) and /campaigns/[id] (per-campaign). The face is
// FUNNY (coach roast / player tweet), never stats; a skin is a Rule-C re-skin, a
// GENRE LENS is a clearly-badged NON-CANON remix (no new art — text only). Spec:
// docs/design/viral-moments.md.

import { achievementById, campaignMeta, relTiers, wingmanItems } from "../wiki/wiki-data";

export type CardSpec = { kind: string; shape: "title" | "quote"; hero: string; support?: string; tag?: string };
export type SkinDef = { bg: string; ink: string; sub: string; accent: string; border: string; mono: boolean; round: string; label: string };

// Display Themes (faithful to lib/theme_pack.dart) + the Wingman's Corner default
// + the Elseworld GENRE-VIBE skins (color-tint only, no new art).
export const SKINS: Record<string, SkinDef> = {
  parchment: { bg: "#f2ebdd", ink: "#1a1a1a", sub: "#5a6650", accent: "#b81f1c", border: "#2d4a2b", mono: false, round: "rounded-[2px]", label: "Parchment & Ink" },
  vibrant: { bg: "#f6e9c9", ink: "#4a3a22", sub: "#6f5a38", accent: "#e0531f", border: "#e0531f", mono: false, round: "rounded-[14px]", label: "Vibrant Realm" },
  dos: { bg: "#00140a", ink: "#43ff8d", sub: "#2aa860", accent: "#43ff8d", border: "#43ff8d", mono: true, round: "rounded-none", label: "DOS-era" },
  corner: { bg: "#241f1b", ink: "#f5ede0", sub: "#bfae97", accent: "#e0a44e", border: "#b8860b", mono: true, round: "rounded-none", label: "the Corner" },
  // genre vibes (the spin-off lens)
  anime: { bg: "#fdeef3", ink: "#2a1620", sub: "#9a5e72", accent: "#e0357a", border: "#e0357a", mono: false, round: "rounded-[10px]", label: "90s anime" },
  cottagecore: { bg: "#eef1e3", ink: "#38422a", sub: "#6f7a55", accent: "#7a8c3a", border: "#97a35a", mono: false, round: "rounded-[16px]", label: "cottagecore" },
  cyber: { bg: "#120a1f", ink: "#ede0ff", sub: "#9a78c8", accent: "#2ee6ff", border: "#ff3df0", mono: false, round: "rounded-[2px]", label: "80s cyber" },
  isekai: { bg: "#161f33", ink: "#e8eefc", sub: "#8fa0c8", accent: "#d9a441", border: "#d9a441", mono: false, round: "rounded-[6px]", label: "mcu / isekai" },
  fantasy: { bg: "#f0e6cf", ink: "#2a1d12", sub: "#6a553a", accent: "#8a2a1f", border: "#8a2a1f", mono: false, round: "rounded-[2px]", label: "golden-age fantasy" },
};

function kindFor(skin: SkinDef, kind: string): string {
  if (skin.mono) return `> ${kind.replace(/^↩ /, "")} GET`;
  if (skin.label === "Vibrant Realm") return `${kind} ✦`;
  return kind;
}

export function ShareCard({ skin, campaign, c }: { skin: keyof typeof SKINS; campaign: string; c: CardSpec }) {
  const s = SKINS[skin];
  const heroText = s.mono ? c.hero.toUpperCase() : c.hero;
  const heroSize = c.shape === "quote" || heroText.length > 22 ? (s.mono ? "text-[14px]" : "text-[17px]") : "text-[24px]";
  const fam = s.mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "Georgia, serif";
  return (
    <div className={`w-[290px] shrink-0 border-[3px] ${s.round} p-4 flex flex-col`} style={{ background: s.bg, color: s.ink, borderColor: s.border, aspectRatio: "4 / 5" }}>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] tracking-[0.16em]" style={{ color: s.accent, fontFamily: fam, fontWeight: 700 }}>{s.mono ? "MY_LIFE_IS_AN_RPG" : "MY LIFE IS AN RPG"}</span>
        <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: s.sub }}>{campaign}</span>
      </div>
      <div className="mt-3 inline-block self-start text-[9px] uppercase tracking-[0.12em] border px-1.5 py-0.5" style={{ color: s.accent, borderColor: s.border }}>{kindFor(s, c.kind)}</div>
      <div className="flex-1 flex flex-col justify-center py-3">
        {c.shape === "quote" && !s.mono && <span className="text-[22px] leading-none" style={{ color: s.accent, fontFamily: "Georgia, serif" }}>&ldquo;</span>}
        <div className={`${heroSize} leading-[1.2]`} style={{ fontFamily: fam, fontWeight: 700 }}>{s.mono && c.shape === "quote" ? `> ${heroText}` : heroText}{s.mono ? " ▒" : ""}</div>
        {c.support && <div className={`text-[12px] mt-2 leading-[1.4] ${c.shape === "quote" && !s.mono ? "italic" : ""}`} style={{ color: s.sub, fontFamily: fam }}>{c.support}</div>}
      </div>
      <div className="flex items-baseline justify-between border-t pt-2 mt-1" style={{ borderColor: s.border }}>
        <span className="text-[9px] italic" style={{ color: s.sub, fontFamily: fam }}>{c.tag}</span>
        <span className="text-[10px]" style={{ color: s.accent, fontFamily: fam }}>{s.mono ? "[SHARE]" : "share ↗"}</span>
      </div>
    </div>
  );
}

const titleOf = (id: string, fallback: string) => achievementById(id)?.title ?? fallback;

export function lifeOpsCards(): CardSpec[] {
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

export function wingmanCards(): CardSpec[] {
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

export function campaignCards(id: string): CardSpec[] {
  return id === "wingman" ? wingmanCards() : lifeOpsCards();
}
export function campaignDefaultSkin(id: string): keyof typeof SKINS {
  return id === "wingman" ? "corner" : "parchment";
}

// THE GENRE LENS — the same canonical moment (Sloane's roast) retold in a genre
// vibe, badged NON-CANON remix (framing A; Gemini-approved, golden-age punched up).
export function genreLensCards(): { skin: keyof typeof SKINS; c: CardSpec }[] {
  const mk = (skin: keyof typeof SKINS, vibe: string, hero: string): { skin: keyof typeof SKINS; c: CardSpec } => ({
    skin,
    c: { kind: `GENRE LENS · ${vibe} · REMIX`, shape: "quote", hero, support: "the Reader's read, in another life · non-canon", tag: "spin-off lens · text remix, no new art" },
  });
  return [
    mk("isekai", "mcu / isekai", "So in this world you spent three hours interpreting a single 👍. Truly, your power is… patience. The guild does not rank that."),
    mk("anime", "90s anime", "Three hours… THREE HOURS you channeled into a single 👍?! Even a half-dead swordsman reads the ancient scrolls faster than this."),
    mk("cottagecore", "cottagecore", "Oh sweet thing — three whole hours on one little 👍? Bless. I've watched sourdough rise with more conviction."),
    mk("cyber", "80s cyber", "THREE HOURS. One 👍. You're decrypting slower than a 2400-baud modem, choom. Jack out."),
    mk("fantasy", "golden-age fantasy", "Thou hast toiled three hours upon a lone rune of approval. I have seen ancient prophecies deciphered with greater haste."),
  ];
}
