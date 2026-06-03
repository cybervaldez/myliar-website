// /lab — Engine Lab (UNLINKED dev view; not in nav/sitemap). The browseable home
// for run summaries: each generation is an experiment + a story candidate, recorded
// so we can pick the best-working story later and see which engine tightenings help
// vs work backwards. Source of truth = app/lib/engine-lab.json (add a run = add one
// object). Method/rationale narrative: docs/design/run-ledger.md. NOT game canon,
// NOT parity-synced. To make public, link it from /the-engine.

import lab from "../lib/engine-lab.json";
import { CopyForLLM } from "../_components/CopyForLLM";
import { FandomShell } from "../_components/FandomShell";

export const metadata = {
  title: "Engine Lab — run ledger (dev)",
  description: "Runs as engine-polishing experiments + story candidates.",
  robots: { index: false, follow: false },
};

type Run = (typeof lab.runs)[number];

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const map: Record<string, string> = {
    good: "bg-forest text-paper",
    warn: "bg-spot-red text-paper",
    neutral: "border border-ink/30 text-ink-soft",
  };
  return (
    <span className={`inline-block font-sans text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded ${map[tone] ?? map.neutral}`}>
      {children}
    </span>
  );
}

// Y → good, drift/N/warn/regress → warn, else neutral.
function toneFor(v: string): string {
  const s = v.toLowerCase();
  if (s === "y" || s === "validated" || s === "caught" || s === "better") return "good";
  if (s === "drift" || s === "n" || s === "regress" || s.includes("pulled") || s === "worse") return "warn";
  return "neutral";
}

function RunCard({ r }: { r: Run }) {
  return (
    <section className="border-2 border-ink bg-paper-shade/40 p-5 mb-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="font-display text-[24px] text-forest">
          Run {r.id} <span className="text-ink-soft text-[16px]">· {r.scope}</span>
        </h2>
        <span className="font-sans text-[11px] text-margin-ink tabular-nums">{r.date}</span>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <Badge tone={toneFor(r.verdict.engineDelta)}>engine: {r.verdict.engineDelta}</Badge>
        <Badge tone={toneFor(r.verdict.keepStory)}>keep story: {r.verdict.keepStory}</Badge>
      </div>

      <p className="mt-4 text-[15px] leading-[1.6]">
        <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-spot-red mr-2">Story</span>
        {r.story}
      </p>

      <div className="mt-4">
        <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-spot-red mb-1">Unlocks</div>
        <ul className="list-disc pl-5 text-[14px] text-ink-soft space-y-0.5">
          {r.unlocks.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
      </div>

      <div className="mt-4">
        <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-spot-red mb-2">Chat-effect (the LLM)</div>
        {r.chatEffect.map((c, i) => (
          <div key={i} className="border-l-[3px] border-forest pl-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="text-[15px]">{c.character}</strong>
              <Badge tone={toneFor(c.destination)}>destination: {c.destination}</Badge>
              <Badge tone={toneFor(c.voice)}>voice: {c.voice}</Badge>
            </div>
            <p className="text-[13px] text-ink-soft mt-1 leading-[1.55]">{c.notes}</p>
            <p className="text-[14px] italic mt-1 leading-[1.55]">“{c.reply}”</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-4">
        <div>
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-spot-red mb-1">Engine findings</div>
          <ul className="list-disc pl-5 text-[13px] text-ink-soft space-y-0.5">
            {r.findings.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
        <div>
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-spot-red mb-1">Rule changes</div>
          <ul className="list-disc pl-5 text-[13px] text-ink-soft space-y-0.5">
            {r.ruleChanges.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-[14px] leading-[1.6] border-t border-ink/15 pt-3">
        <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-spot-red mr-2">Verdict</span>
        {r.verdict.why}
      </p>
    </section>
  );
}

export default function EngineLabPage() {
  return (
    <FandomShell active="/lab">

        <div className="mt-8 font-sans text-[11px] uppercase tracking-[0.22em] text-spot-red">
          Engine Lab · dev view (unlinked)
        </div>
        <h1 className="font-display text-[40px] leading-[1.0] mt-2 mb-3">Run Ledger</h1>
        <p className="text-[15px] leading-[1.5] text-ink-soft mb-4 max-w-[680px]">
          Each story run, recorded: what it does, what it unlocks, how it played, and what worked vs. regressed.
        </p>

        <div className="mb-6">
          <CopyForLLM payload={JSON.stringify(lab, null, 2)} />
        </div>

        <details className="mb-8 border border-ink/20 bg-paper-shade/30">
          <summary className="cursor-pointer font-sans text-[12px] uppercase tracking-[0.16em] text-forest px-4 py-2 select-none">
            ⓘ glossary
          </summary>
          <dl className="px-4 pb-3 pt-1 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            {Object.entries(lab._legend).map(([term, def]) => (
              <div key={term} className="leading-[1.45]">
                <dt className="font-sans font-bold text-ink">{term}</dt>
                <dd className="text-ink-soft m-0">{def}</dd>
              </div>
            ))}
          </dl>
        </details>

        <hr className="border-0 border-t border-ink/15 mb-8" />

        {/* RUN CARDS */}
        {lab.runs.map((r) => <RunCard key={r.id} r={r} />)}

        {/* RULE LEDGER */}
        <h2 className="font-display text-[26px] text-forest mt-12 mb-1">Engine rule-ledger</h2>
        <p className="text-[13px] text-ink-soft mb-3">
          The pull-back mechanism: if a rule&apos;s probe scores drop vs baseline, status → <Badge tone="warn">pulled back</Badge> and we revert it.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-left font-sans uppercase text-[10px] tracking-[0.1em] text-margin-ink">
                <th className="py-1 pr-3">id</th><th className="py-1 pr-3">rule</th><th className="py-1 pr-3">since</th><th className="py-1 pr-3">effect</th><th className="py-1">status</th>
              </tr>
            </thead>
            <tbody>
              {lab.rules.map((r) => (
                <tr key={r.id} className="border-t border-ink/10 align-top">
                  <td className="py-2 pr-3 font-sans tabular-nums text-margin-ink">{r.id}</td>
                  <td className="py-2 pr-3">{r.rule}</td>
                  <td className="py-2 pr-3 text-ink-soft whitespace-nowrap">{r.since}</td>
                  <td className="py-2 pr-3 text-ink-soft">{r.effect}</td>
                  <td className="py-2"><Badge tone={toneFor(r.status)}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GOTCHA REGISTRY */}
        <h2 className="font-display text-[26px] text-forest mt-12 mb-1">Gotcha registry</h2>
        <p className="text-[13px] text-ink-soft mb-3">Living — converge, don&apos;t &quot;finish.&quot; Each caught one should end up pinned by a test.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-left font-sans uppercase text-[10px] tracking-[0.1em] text-margin-ink">
                <th className="py-1 pr-3">id</th><th className="py-1 pr-3">gotcha</th><th className="py-1 pr-3">surfaced</th><th className="py-1 pr-3">guard</th><th className="py-1">status</th>
              </tr>
            </thead>
            <tbody>
              {lab.gotchas.map((g) => (
                <tr key={g.id} className="border-t border-ink/10 align-top">
                  <td className="py-2 pr-3 font-sans tabular-nums text-margin-ink">{g.id}</td>
                  <td className="py-2 pr-3">{g.gotcha}</td>
                  <td className="py-2 pr-3 text-ink-soft whitespace-nowrap">{g.run}</td>
                  <td className="py-2 pr-3 text-ink-soft">{g.guard}</td>
                  <td className="py-2"><Badge tone={toneFor(g.status)}>{g.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </FandomShell>
  );
}
