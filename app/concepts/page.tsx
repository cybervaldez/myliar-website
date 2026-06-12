// /concepts — the theme-concept slate as a dedicated page (per request), with a layout
// toggle (kanban / table / cards / list). Reads the slate from storyboard.json's concept
// block (single source). Fandom-basic tooling look. Unlinked dev view.

import board from "../lib/storyboard.json";
import { FandomShell } from "../_components/FandomShell";
import { CopyForLLM } from "../_components/CopyForLLM";
import { ConceptsView, type Concept } from "./ConceptsView";

type Spec = { sourceAnchor: string; steps: string[]; gate: string[]; hardCaps: string[] };

// The tight, copyable brief external LLMs get so their concepts hit our target — the
// HARD CAPS are exactly where Gemini drifted (therapy/existential). Same brief we use.
function buildBrief(spec: Spec, existing: string): string {
  return `You are generating ORIGINAL theme-concept candidates for "My Life is an RPG" — a mobile life-RPG where AI companions COACH you in your real life (each gives you a real CAPABILITY), wrapped in game-feel. Match our target EXACTLY.

STEPS:
${spec.steps.map((s) => "- " + s).join("\n")}

THE GATE — every concept must pass ALL of:
${spec.gate.map((s) => "- " + s).join("\n")}

HARD CAPS — NEVER violate (this is where external models drift):
${spec.hardCaps.map((s) => "- " + s).join("\n")}

SOURCE CATEGORY — every concept DECLARES its conception driver (ONE of three; what was LOAD-BEARING at conception):
- "original": from OUR product thesis (a life domain + the coach-graduation engine); no external media shaped it. The slate must stay >=30% original.
- "inspiration": ANCHORED to a PROVEN existing story-shape (anime/manga/manhwa/show/fan-fic) — not invented from vibes: ${spec.sourceAnchor}
- "audience": from a hungry media taste-cluster + its canon (e.g. a book-genre wave); the campaign is a SEMI-ADVERT toward that CATEGORY's concept (never one title) and ships with a curated real-media shelf; it still passes every gate below — the market seed is never an excuse.

ANSWER THE TWO LOAD-BEARING QUESTIONS for each concept: (1) LEGS = what the STORY brings to the table (the front-door marketing hook); (2) KEEP = what the CHARACTERS give the player when the campaign is DONE (the outward gift they walk out holding). A concept that can't answer both is not a concept yet.

COLLECTIONS — name where the concept BELONGS: an existing/future shelf of campaigns it's designed to work beside (shared audience/fantasy, ZERO connecting tissue) — or explicitly standalone (a forced shelf is worse than none).

DO NOT repeat our existing concepts: ${existing}.

When you later detail a cast, every member gets MULTIPLE titles (ordered evocative→plain — different angles on the same gift so any two disambiguate) plus a "Just Name" opt-out; never a single cryptic epithet.

OUTPUT: ONLY a JSON array; each = {"name":str, "sourceCategory":"original"|"inspiration"|"audience", "sourceCategoryWhy":str (one line — what was load-bearing at conception, per the tie-breaker), "source":str (PRIVATE, never ships — for inspiration: the proven story-shape + WHY it fits the mentor→obsolescence + transferable-gift engine; for audience: the taste-cluster + canon + referral economics; for original: "no anchor at conception" + the domain + validation path), "legs":str (the front-door hook), "keep":str (the outward gift the player keeps), "gift":str (the concrete capability you DO), "cast":str (the cast-shape — complementary across domains × temperaments), "collection":str|null (the shelf it belongs to, or null = standalone), "note":str (the cap/caution — what it must NOT become, including the IP-strip)}.`;
}

export const metadata = {
  title: "Concepts — theme slate (dev) · My Life is an RPG",
  description: "The theme-concept candidates and where each sits in the pipeline.",
  robots: { index: false, follow: false },
};

export default function ConceptsPage() {
  const concepts = (board.concept.candidates ?? []) as unknown as Concept[];
  const genreNote = (board.concept as { genreNote?: string }).genreNote ?? "";
  const geminiNote = (board.concept as { geminiNote?: string }).geminiNote ?? "";
  const spec = (board.concept as { spec?: Spec }).spec;
  const brief = spec ? buildBrief(spec, concepts.map((c) => c.name).join(", ")) : "";
  return (
    <FandomShell active="/concepts">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Concepts · three lanes · shelved</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">Theme slate</h1>
      <p className="text-[14px] text-ink-soft mb-4 leading-[1.5] max-w-[680px]">
        Each concept = a <strong>theme → its cast</strong>, conceived in one of <strong>three lanes</strong> (the
        SOURCE TAXONOMY): <strong className="text-forest">original</strong> (our product thesis — the IP seeds;
        ≥30% of the slate), <strong style={{ color: "#0645ad" }}>⚓ inspiration</strong> (anchored to a proven
        story-shape, adapted IP-stripped — the gated spec below), <strong className="text-spot-red">audience</strong>
        (a hungry media taste-cluster; the campaign is a <em>semi-advert toward the category</em>, monetized via its
        kindred real-media shelf). Every concept answers two questions — what the <strong>STORY</strong> brings (legs)
        · what the <strong>characters give</strong> when it&apos;s done (keep) — and names where it <strong>belongs</strong>
        (a collection shelf, or standalone). Flip to the <strong>Shelves</strong> layout for the collections view.
      </p>

      {spec && (
        <>
          <details className="mb-4 border border-ink/20 bg-paper-shade/30">
            <summary className="cursor-pointer font-sans text-[12px] uppercase tracking-[0.16em] text-forest px-4 py-2 select-none">
              ⓘ How we build concepts — source-anchored, gated
            </summary>
            <div className="px-4 pb-3 pt-1 text-[12px] leading-[1.5] space-y-3">
              <p className="text-ink-soft"><strong className="text-ink">Source anchor:</strong> {spec.sourceAnchor}</p>
              <div><strong className="text-spot-red text-[10px] uppercase tracking-[0.1em]">Steps</strong><ul className="list-disc pl-5 mt-1">{spec.steps.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
              <div><strong className="text-spot-red text-[10px] uppercase tracking-[0.1em]">The gate (all must pass)</strong><ul className="list-disc pl-5 mt-1">{spec.gate.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
              <div><strong className="text-spot-red text-[10px] uppercase tracking-[0.1em]">Hard caps (never violate — where LLMs drift)</strong><ul className="list-disc pl-5 mt-1">{spec.hardCaps.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            </div>
          </details>
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <CopyForLLM payload={brief} label="Copy concept brief for LLM" title="The tight spec to hand an external LLM (Gemini/etc) so its concepts hit our target — gate + hard caps + trend basis + existing-to-avoid + output schema." />
            <span className="font-sans text-[11px] text-margin-ink">paste to Gemini/etc → parity concepts (the hard caps are exactly where models drift).</span>
          </div>
        </>
      )}

      <ConceptsView concepts={concepts} genreNote={genreNote} geminiNote={geminiNote} />
    </FandomShell>
  );
}
