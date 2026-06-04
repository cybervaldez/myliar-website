// /cards — the shareable-moment Card showcase: funny faces, theme-skinnable, and
// the GENRE LENS (spin-off remix). Components + data live in ./share-card (shared
// with /campaigns/[id]). Spec: docs/design/viral-moments.md.

import { FandomShell } from "../_components/FandomShell";
import { ShareCard, SKINS, lifeOpsCards, wingmanCards, genreLensGroups, type CardSpec } from "./share-card";

export const metadata = {
  title: "Cards — shareable moments (dev) · My Life is an RPG",
  description: "The Card: one shareable frame — funny, theme-skinnable, genre-lens-able.",
  robots: { index: false, follow: false },
};

export default function CardsPage() {
  const flagship: CardSpec = wingmanCards()[1]; // Sloane's "read a will faster" roast
  const themeShowcase: (keyof typeof SKINS)[] = ["parchment", "vibrant", "dos"];
  const genreGroups = genreLensGroups();

  return (
    <FandomShell active="/cards">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Cards · shareable moments</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">The Card</h1>
      <p className="text-[14px] text-ink-soft mb-2 leading-[1.5] max-w-[700px]">
        One shareable frame every viral moment renders to — the face is <strong>funny</strong> (a coach&apos;s
        roast or your wry &ldquo;tweet&rdquo;), never stats. <strong>Theme-skinnable</strong> (the same moment
        in any Display Theme) and <strong>genre-lens-able</strong> (retold in an Elseworld vibe, a clearly
        non-canon remix — the spin-offs&apos; viral superpower, brought to the grounded campaigns).
      </p>
      <p className="text-[12px] text-margin-ink mb-6 leading-[1.5] max-w-[700px]">
        Prototype-on-web-first. App port = a <code>ShareCard</code> widget the share infra renders to PNG → the
        OS share sheet. Also embedded per campaign at <code>/campaigns/[id]</code>. Spec:
        <code>docs/design/viral-moments.md</code>.
      </p>

      <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-1">
        One moment, three themes <span className="text-margin-ink normal-case">· same roast, any Display Theme (DOS = the standout)</span>
      </div>
      <div className="flex gap-4 flex-wrap mb-8 mt-3">
        {themeShowcase.map((t) => (
          <div key={t}>
            <ShareCard skin={t} campaign="The Wingman" c={flagship} />
            <div className="text-center text-[10px] uppercase tracking-[0.12em] text-margin-ink mt-1">{SKINS[t].label}</div>
          </div>
        ))}
      </div>

      <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-1">
        The Genre Lens <span className="text-margin-ink normal-case">· a moment retold in an Elseworld vibe — a non-canon remix (text only, no new art). Gemini-generated, frame-checked.</span>
      </div>
      {genreGroups.map((grp) => (
        <div key={grp.title} className="mt-3 mb-6">
          <div className="font-sans text-[11px] tracking-[0.04em] text-[#8a6d0b] mb-2">{grp.title} <span className="text-margin-ink">· {grp.campaign === "wingman" ? "The Wingman" : "Life Ops"}</span></div>
          <div className="flex gap-4 flex-wrap">
            {grp.cards.map((g, i) => (
              <div key={i}>
                <ShareCard skin={g.skin} campaign={grp.campaign === "wingman" ? "The Wingman" : "Life Ops"} c={g.c} />
                <div className="text-center text-[10px] uppercase tracking-[0.12em] text-margin-ink mt-1">{SKINS[g.skin].label}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {[
        { title: "Life Ops", skin: "parchment" as keyof typeof SKINS, cards: lifeOpsCards(), note: "Parchment skin (default)" },
        { title: "The Wingman", skin: "corner" as keyof typeof SKINS, cards: wingmanCards(), note: "the Corner skin (default)" },
      ].map((cam) => (
        <div key={cam.title} className="mb-8">
          <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-3">
            {cam.title} <span className="text-margin-ink">· {cam.note}</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            {cam.cards.map((c, i) => (
              <ShareCard key={i} skin={cam.skin} campaign={cam.title} c={c} />
            ))}
          </div>
        </div>
      ))}
    </FandomShell>
  );
}
