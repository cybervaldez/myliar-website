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
  return <AuditionsBook rounds={(data as { rounds: Round[] }).rounds} />;
}
