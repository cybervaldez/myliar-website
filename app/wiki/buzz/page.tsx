// The buzz view — where the community discussion has heat. Most-liked /
// most-discussed comments across the wiki, each linking back to its area, with
// a freshness mark when the line has changed since. Also the owner sign-in.

import { WikiPage } from "../_components/WikiChrome";
import { BuzzList } from "./BuzzList";
import { snapshotLabel } from "../wiki-data";

export const metadata = {
  title: "Buzz — Wiki",
  description: "Where the community discussion has heat — the most-liked comments across the wiki.",
};

export default function BuzzPage() {
  return (
    <WikiPage
      kicker="▸ COMMUNITY BUZZ"
      title="Buzz"
      breadcrumb={[{ label: "Wiki", href: "/wiki" }]}
    >
      <p className="text-ink-soft leading-[1.55] mb-3">
        The most-liked, most-discussed comments across the wiki — so the lines
        the community actually argues about surface on their own. Comments tied
        to an area that has since changed wear a <span className="text-margin-ink">↺</span>{" "}
        mark, so old buzz stays visible without being mistaken for current.
      </p>
      <p className="font-display tracking-[0.16em] text-[11px] text-margin-ink mb-6">
        CURRENT SNAPSHOT · {snapshotLabel().toUpperCase()}
      </p>
      <BuzzList />
    </WikiPage>
  );
}
