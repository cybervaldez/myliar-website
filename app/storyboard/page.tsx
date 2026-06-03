// /storyboard — STORYBOARD (UNLINKED dev view). Candidate stories drafted + read
// as tables BEFORE porting to the app. The FORWARD half of the loop (the backward
// half is /lab). Source of truth = app/lib/storyboard.json (add a candidate / day =
// add data). PRE-CANON drafting — NOT parity, NOT read by the app. Porting is human
// authoring (beat.md → pregenerate), so the one-way app←✗←website rule holds.
//
// Candidate arcs are tabbed by AUTHOR (Claude / Gemini / …) — different models draft
// a version from the same brief (via the "Copy JSON for LLM" button) and we compare.

import board from "../lib/storyboard.json";
import { CopyForLLM } from "../_components/CopyForLLM";
import { CandidateTabs, type Candidate } from "./CandidateTabs";
import { DayContent, type DayEntry } from "./DayContent";
import { FandomShell } from "../_components/FandomShell";
import { VibePicks, type VibePick } from "./VibePicks";

export const metadata = {
  title: "Storyboard — candidate stories (dev) · My Life is an RPG",
  description:
    "Writers' storyboard for My Life is an RPG (a life-sim / dating-sim mobile game where AI characters get to know you through your daily choices). Candidate story arcs drafted as scannable tables — beats, choices, and the relationship 'notes' each produces — to read and compare before they're built into the app. Pre-canon; not the live game.",
  robots: { index: false, follow: false },
};

export default function StoryboardPage() {
  return (
    <FandomShell active="/storyboard">

        <div className="mt-8 font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">
          Storyboard · dev view (unlinked) · v0
        </div>
        <h1 className="font-display text-[40px] leading-[1.0] mt-2 mb-3">Story candidates</h1>
        <p className="text-[15px] leading-[1.5] text-ink-soft mb-2 max-w-[700px]">
          The <strong>workbench</strong> — where you draft &amp; manage content: <strong>steps 0–3</strong>
          (concept → cast → arc → per-day). To read &amp; pick the whole run in flow, that&apos;s
          step 4: <a href="/swipe" className="text-spot-red">→ the Run Simulator</a>. Nothing here is canon yet.
        </p>

        <div className="mb-6">
          <CopyForLLM payload={JSON.stringify(board, null, 2)} />
        </div>

        {/* DECISIONS — the picks of record (T1). Fed by desktop picks + /swipe exports. */}
        {board.decisions?.length > 0 && (
          <div className="mb-8 border-2 border-spot-red/60 bg-paper-shade/30 p-4">
            <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-spot-red mb-1">✓ Decisions — picks of record</div>
            <p className="text-[11px] text-margin-ink mb-2">Recorded picks. Make new ones in the Run Simulator (cycle → Copy my picks).</p>
            <ul className="space-y-2">
              {board.decisions.map((d) => (
                <li key={d.id} className="text-[13px] leading-[1.5]">
                  <strong className="text-forest">{d.artifact}</strong>
                  <span className="text-margin-ink"> · {d.decision} · {d.date}</span>
                  <div className="text-ink-soft">{d.why}</div>
                  <div className="text-margin-ink text-[11px] mt-0.5">lineage: {d.lineage} — next: {d.next}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* glossary — collapsed; the full _legend also rides in the Copy-JSON payload */}
        <details className="mb-8 border border-ink/20 bg-paper-shade/30">
          <summary className="cursor-pointer font-sans text-[12px] uppercase tracking-[0.16em] text-forest px-4 py-2 select-none">
            ⓘ glossary
          </summary>
          <dl className="px-4 pb-3 pt-1 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            {Object.entries(board._legend).map(([term, def]) => (
              <div key={term} className="leading-[1.45]">
                <dt className="font-sans font-bold text-ink">{term}</dt>
                <dd className="text-ink-soft m-0">{def}</dd>
              </div>
            ))}
          </dl>
        </details>

        {/* STEP 0 — CONCEPT: theme → nameless cast (story-engine.md §0) */}
        <h2 className="font-display text-[28px] text-forest">Concept <span className="text-[15px] text-ink-soft">· step 0 — theme → cast</span></h2>
        <div className="border-2 border-ink bg-paper-shade/40 p-4 my-3">
          <div className="font-display text-[18px] text-forest">{board.concept.theme.name}</div>
          <p className="text-[14px] leading-[1.5] mt-1">{board.concept.theme.promise}</p>
          <p className="text-[13px] leading-[1.5] mt-2 border-l-[3px] border-spot-red pl-3"><strong>Principle:</strong> {board.concept.theme.principle}</p>
          <p className="text-[12px] text-ink-soft leading-[1.5] mt-2"><strong>Why this theme:</strong> {board.concept.theme.why}</p>
          <details className="mt-2">
            <summary className="cursor-pointer font-sans text-[10px] uppercase tracking-[0.12em] text-spot-red">ⓘ {board.concept.theme.trendCheck} — findings</summary>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-[12px] text-ink-soft">
              {board.concept.theme.trendFindings.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </details>
          <p className="text-[11px] text-margin-ink mt-2">{board.concept.theme.guard}</p>
        </div>
        <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-spot-red mb-1">The cast, by vibe — names came last</div>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-left font-sans uppercase text-[10px] tracking-[0.1em] text-margin-ink">
                <th className="py-1 pr-3">Vibe</th><th className="py-1 pr-3">Domain</th><th className="py-1 pr-3">Temperament</th><th className="py-1">Became</th>
              </tr>
            </thead>
            <tbody>
              {board.concept.cast.map((c) => (
                <tr key={c.became} className="border-t border-ink/10 align-top">
                  <td className="py-2 pr-3 leading-[1.4]">{c.vibe}</td>
                  <td className="py-2 pr-3 text-ink-soft whitespace-nowrap">{c.domain}</td>
                  <td className="py-2 pr-3 text-ink-soft whitespace-nowrap">{c.temperament}</td>
                  <td className="py-2 font-sans text-forest whitespace-nowrap">{c.became}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] text-margin-ink mb-10 mt-3">
          {board.concept.candidates.length} concept candidates in total (Life Ops is the one shipping) —
          see them all on <a href="/concepts" className="text-spot-red">→ Concepts</a>.
        </p>

        {/* CAST MAP — the 2-axis dynamic-range view */}
        <section className="mb-10 border-2 border-ink bg-paper-shade/40 p-5">
          <h2 className="font-display text-[22px] text-forest">Cast map — domain × temperament</h2>
          <p className="text-[13px] text-ink-soft mt-1 mb-3 leading-[1.5]">
            A character must fill a domain <em>and</em> widen the temperament range, or it&apos;s deadweight. The Hearth column is the gap.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="text-left font-sans uppercase text-[10px] tracking-[0.1em] text-margin-ink">
                  <th className="py-1 pr-3">Domain</th>
                  <th className="py-1 pr-3">Field — intense / outgoing</th>
                  <th className="py-1">Hearth — cozy / laid-back</th>
                </tr>
              </thead>
              <tbody>
                {board.castMap.rows.map((r) => (
                  <tr key={r.domain} className="border-t border-ink/10 align-top">
                    <td className="py-2 pr-3 font-sans text-forest whitespace-nowrap">{r.domain}</td>
                    <td className="py-2 pr-3">{r.field}</td>
                    <td className="py-2 text-ink-soft">{r.hearth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* VIBE picks — the TOP of the maturity ladder (vibe → draft → run → live) */}
        <hr className="border-0 border-t border-ink/15 mb-4" />
        <h2 className="font-display text-[28px] text-forest">Vibe picks <span className="text-[15px] text-ink-soft">· stage 1 of 4 (vibe → draft → run → live)</span></h2>
        <p className="text-[12px] text-margin-ink mt-1 mb-4">Pick a character&apos;s feel — it becomes the draft, then the locked persona.</p>
        <VibePicks picks={board.vibePicks as unknown as VibePick[]} />

        {/* CANDIDATES — tabbed by author (Claude / Gemini / …) for side-by-side comparison */}
        <hr className="border-0 border-t border-ink/15 mt-12 mb-4" />
        <h2 className="font-display text-[28px] text-forest">Architecture <span className="text-[15px] text-ink-soft">· stage 2 — draft the arc</span></h2>
        <p className="text-[12px] text-margin-ink mt-1 mb-3">Each tab = one author&apos;s arc. Compare and cherry-pick.</p>
        <CandidateTabs candidates={board.candidates as unknown as Candidate[]} />

        {/* PER-DAY CONTENT — the second layer of pick-the-best (dialogue / flow / inventory), per day */}
        <hr className="border-0 border-t border-ink/15 mt-12 mb-4" />
        <h2 className="font-display text-[28px] text-forest">Per-day content <span className="text-[15px] text-ink-soft">· stage 3 — run (dialogue / flow)</span></h2>
        <p className="text-[12px] text-margin-ink mt-1 mb-4">Pick the best dialogue/flow per day (day picker → author tabs). Each version has <strong>Copy as beat.md</strong>.</p>
        <DayContent days={board.dayContent as unknown as DayEntry[]} />

        {/* ITEMS / INVENTORY deck — candidate items (descriptions = image-gen briefs) */}
        <hr className="border-0 border-t border-ink/15 mt-12 mb-4" />
        <h2 className="font-display text-[28px] text-forest">Items &amp; inventory <span className="text-[15px] text-ink-soft">· stage 3 — run</span></h2>
        <p className="text-[12px] text-margin-ink mt-1 mb-4">Candidate items; descriptions double as image-gen briefs. Pick in the simulator.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {board.items.candidates.map((it) => (
            <div key={it.id} className="border-2 border-ink/40 bg-paper-shade/30 p-4">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h4 className="font-display text-[16px] text-forest">{it.name}</h4>
                <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-spot-red">{it.rarity}</span>
              </div>
              <div className="font-sans text-[10px] uppercase tracking-[0.1em] text-margin-ink mt-0.5">{it.character}</div>
              <p className="text-[13px] leading-[1.5] text-ink-soft mt-2 italic">{it.description}</p>
            </div>
          ))}
        </div>
    </FandomShell>
  );
}
