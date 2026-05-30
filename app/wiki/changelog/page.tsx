// The changelog — the canon's decision history. Every resolved community /
// LLM / in-app note: APPLIED (became canon) or SUPERSEDED (the canon moved
// past it). The current snapshot is shown for reference; the full
// payload-level history lives in git.

import { WikiPage } from "../_components/WikiChrome";
import { ChangelogList } from "../_components/ChangelogList";
import { snapshotLabel } from "../wiki-data";

export const metadata = {
  title: "Changelog — Wiki",
  description: "The decision history of My Life is an RPG's canon — resolved suggestions over time.",
};

export default function ChangelogPage() {
  return (
    <WikiPage
      kicker="▸ DECISION HISTORY"
      title="Changelog"
      breadcrumb={[{ label: "Wiki", href: "/wiki" }]}
    >
      <p className="text-ink-soft leading-[1.55] mb-3">
        Every suggestion that reached a verdict, newest first.{" "}
        <span className="font-display tracking-[0.06em] text-[12px] text-forest">
          APPLIED
        </span>{" "}
        means it became canon;{" "}
        <span className="font-display tracking-[0.06em] text-[12px] text-margin-ink">
          SUPERSEDED
        </span>{" "}
        means it was valid but the canon had already moved past it (kept here as
        history, struck through). Owner-made changes live in git, not here — this
        is the log of <em>suggestion</em> decisions.
      </p>
      <p className="font-display tracking-[0.16em] text-[11px] text-margin-ink mb-6">
        CURRENT SNAPSHOT · {snapshotLabel().toUpperCase()}
      </p>

      <ChangelogList />
    </WikiPage>
  );
}
