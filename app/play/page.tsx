// /play — the LIST BROWSER (macro view of the slate: campaigns + concepts, one
// card each, scored on the campaign-metrics rubric). The Front Door (/play/[slug])
// is the deep micro-pitch; this is the slate at a glance. Reads storyboard.json.

import board from "../lib/storyboard.json";
import { FandomShell } from "../_components/FandomShell";
import { PlayBrowser, type PlayTitle } from "./PlayBrowser";

export const metadata = {
  title: "Play — the slate (dev) · My Life is an RPG",
  description: "Browse every campaign + concept, scored on one card.",
  robots: { index: false, follow: false },
};

export default function PlayIndex() {
  const all = (board.concept.candidates ?? []) as unknown as PlayTitle[];
  const campaigns = all.filter((t) => t.kind === "campaign");
  const concepts = all.filter((t) => t.kind === "concept");
  return (
    <FandomShell active="/play">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Play · the slate</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">Browse the worlds</h1>
      <p className="text-[14px] text-ink-soft mb-5 leading-[1.5] max-w-[720px]">
        The macro view of every campaign + concept, scored on one card — the slate at a glance (the{" "}
        <strong>Front Door</strong> is the deep micro-pitch). The three columns that drive the click:{" "}
        <strong>Cozy Level</strong> (the flavor — even our intense worlds keep a cozy floor),{" "}
        the <strong>characters</strong> (tap a name for a glimpse + the romance/relationship aspect),
        and the <strong>agents you unlock</strong> (what you keep). Scoring rubric:{" "}
        <code className="text-[12px]">docs/design/campaign-metrics.md</code>.
      </p>
      <PlayBrowser campaigns={campaigns} concepts={concepts} />
    </FandomShell>
  );
}
