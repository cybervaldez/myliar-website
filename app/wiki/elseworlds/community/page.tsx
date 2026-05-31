// Community Elseworld gallery — player-shared worlds, browseable + importable +
// discussable. The UGC→buzz→canon surface (docs/design/community-elseworld-gallery.md).

import { WikiPage } from "../../_components/WikiChrome";
import { WorldGallery } from "./WorldGallery";

export const metadata = {
  title: "Community Worlds — Wiki",
  description: "Player-shared Elseworld characters — meet them, discuss them, import them.",
};

export default function CommunityWorldsPage() {
  return (
    <WikiPage
      kicker="▸ PLAYER-MADE"
      title="Community Worlds"
      breadcrumb={[
        { label: "Wiki", href: "/wiki" },
        { label: "Elseworlds", href: "/wiki/elseworlds" },
      ]}
    >
      <p className="text-ink-soft leading-[1.55] mb-5">
        Elseworld characters players generated and shared. Every one carries an{" "}
        <span className="font-display tracking-[0.06em] text-[12px] text-forest">IMPORT CODE</span>{" "}
        — paste it in the app to meet them in your own Elseworld. Discuss any of them
        below; the ones the community loves rise, and the best get{" "}
        <span className="font-display tracking-[0.06em] text-[12px] text-spot-red">★ FEATURED</span>.
        These are player-made and bounded by the world rules — not canon.
      </p>
      <WorldGallery />
    </WikiPage>
  );
}
