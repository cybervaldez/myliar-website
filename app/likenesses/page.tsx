// /likenesses — the dev-tooling home for character IMAGE INTERPRETATIONS. The
// game ships characters NAME-ONLY on purpose; the owner curates the images here
// (upload → a captioned gallery in the in-app character sheet). Moved off the wiki
// keeper's desk to the tooling suite. Owner-gated (the upload island checks auth).
// Spec: docs/design/companion-wiki.md §7-8.

import { FandomShell } from "../_components/FandomShell";
import { OwnerImageUpload } from "../_components/OwnerImageUpload";

export const metadata = {
  title: "Likenesses — character interpretations (dev) · My Life is an RPG",
  description: "Owner-curated image interpretations for the name-only cast.",
  robots: { index: false, follow: false },
};

export default function LikenessesPage() {
  return (
    <FandomShell active="/likenesses">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Likenesses · interpretations</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">Likenesses</h1>
      <p className="text-[14px] text-ink-soft mb-2 leading-[1.5] max-w-[700px]">
        The cast is <strong>name-only on purpose</strong> — the descriptions are the brief; players picture
        them. Here you curate the <strong>interpretations</strong>: pick a character, add an optional caption
        (&ldquo;noir take&rdquo;, &ldquo;cozy&rdquo;), upload. They publish live as a captioned gallery in the
        in-app character sheet — <em>interpretations, not canon</em>.
      </p>
      <p className="text-[12px] text-margin-ink mb-6 leading-[1.5] max-w-[700px]">
        Owner-only (RLS-gated). Community fan-art submission is dormant; these are your takes. Spec:
        <code>docs/design/companion-wiki.md</code> §7-8.
      </p>

      <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-3">
        Upload an interpretation
      </div>
      <OwnerImageUpload />
    </FandomShell>
  );
}
