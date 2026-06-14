// /auditions — the BLIND AUDITION rounds, public + mobile-first. Each round is a
// "book": entries are TABS you flip between (a page-turn), shown as a two-page
// spread (notes | work) with the review panel below. The interactive UI lives in
// AuditionsBook (client); this server shell just loads the synced data.
// Entries ship anonymized — the authorship keys never sync (sync_auditions.mjs).
import data from "../lib/auditions.generated.json";
import AuditionsBook, { type Round } from "./AuditionsBook";

export const metadata = {
  title: "Auditions — My Life is an RPG",
  description: "The blind audition rounds: concepts, pilots, character audits. Flip the book and judge for yourself.",
};

export default function AuditionsPage() {
  return (
    <div>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 20px 0" }}>
        <div style={{ border: "2px solid var(--spot-red)", background: "var(--paper-shade)", padding: "10px 14px", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)" }}>
          <b style={{ color: "var(--spot-red)", letterSpacing: ".08em" }}>DEPRECATED · FROZEN SNAPSHOT.</b> The campaign model changed — a campaign is now a <b>script + a range of stories</b>, not one pilot-tone. These point-auditions are archived (<code>docs/flavors/_deprecated/</code>). The live, automated run is at <a href="/auditions-auto" style={{ color: "var(--forest)" }}>/auditions-auto</a>; the authoring bench at <a href="/bench" style={{ color: "var(--forest)" }}>/bench</a>.
        </div>
      </div>
      <AuditionsBook rounds={(data as { rounds: Round[] }).rounds} />
    </div>
  );
}
