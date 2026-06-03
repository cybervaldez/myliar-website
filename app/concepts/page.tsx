// /concepts — the theme-concept slate as a dedicated page (per request), with a layout
// toggle (kanban / table / cards / list). Reads the slate from storyboard.json's concept
// block (single source). Fandom-basic tooling look. Unlinked dev view.

import board from "../lib/storyboard.json";
import { FandomShell } from "../_components/FandomShell";
import { CopyForLLM } from "../_components/CopyForLLM";
import { ConceptsView, type Concept } from "./ConceptsView";

type Spec = { trendBasis: string; steps: string[]; gate: string[]; hardCaps: string[] };

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

TREND BASIS — ground the "trend" field in THIS, not vibes:
${spec.trendBasis}

DO NOT repeat our existing concepts: ${existing}.

When you later detail a cast, every member gets MULTIPLE titles (ordered evocative→plain — different angles on the same gift so any two disambiguate) plus a "Just Name" opt-out; never a single cryptic epithet.

OUTPUT: ONLY a JSON array; each = {"name":str, "gift":str (a concrete capability you DO), "cast":str (the cast-shape — complementary across domains × temperaments), "trend":str (grounded in the basis), "note":str (the cap/caution — what it must NOT become)}.`;
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
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">Concepts · trend-checked</div>
      <h1 className="font-display text-[38px] leading-[1.0] mt-1 mb-2">Theme slate</h1>
      <p className="text-[14px] text-ink-soft mb-4 leading-[1.5] max-w-[680px]">
        Each concept = a <strong>theme → its cast</strong>, built from a <strong>trend-checked, gated spec</strong> (below).
        &quot;Fitness&quot; isn&apos;t a concept — it&apos;s one lane of <strong>Life Ops</strong>.
      </p>

      {spec && (
        <>
          <details className="mb-4 border border-ink/20 bg-paper-shade/30">
            <summary className="cursor-pointer font-sans text-[12px] uppercase tracking-[0.16em] text-forest px-4 py-2 select-none">
              ⓘ How we build concepts — trend-checked, gated
            </summary>
            <div className="px-4 pb-3 pt-1 text-[12px] leading-[1.5] space-y-3">
              <p className="text-ink-soft"><strong className="text-ink">Trend basis:</strong> {spec.trendBasis}</p>
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
