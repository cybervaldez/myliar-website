"use client";

// RUN SIMULATOR + PICKER. One continuous flow = the run, read top→bottom like the game
// plays. Dialogue / item drops / character vibes appear INLINE at the beat they belong to
// (no deck grouping). Inline picking: arc tabs (top), per-day content-version cycle, vibe
// cycle at a character's intro. Whatever's shown is the pick. localStorage + Copy-my-picks.

import { useEffect, useState } from "react";

export type SimEvent = { n: number; scenario: string; logical: string; passive: string; chaotic: string; note: string; drop: string };
export type ContentVersion = { author: string; events: SimEvent[]; inventory: string[] };
export type VibeCand = { author: string; name: string; oneLineFeel: string; voiceSample: string };
export type SimStep = { day: number; focal: string; type: string; beat: string; teaches: string; brings: string; tier: string; contentVersions: ContentVersion[]; vibe: { character: string; candidates: VibeCand[] } | null };
export type Run = { id: string; author: string; title: string; pitch: string; note?: string; steps: SimStep[] };

const LS_KEY = "myliar-sim-picks-v4";

export function RunSimulator({ runs }: { runs: Run[] }) {
  const [runIdx, setRunIdx] = useState(0);
  const [contentSel, setContentSel] = useState<Record<string, number>>({}); // `${runId}:${day}` -> version idx
  const [vibeSel, setVibeSel] = useState<Record<string, number>>({}); // character -> cand idx
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  function flashSaved() { setSaved(true); setTimeout(() => setSaved(false), 1400); }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) { const s = JSON.parse(raw); setContentSel(s.content ?? {}); setVibeSel(s.vibe ?? {}); setRunIdx(s.runIdx ?? 0); }
    } catch { /* noop */ }
    setLoaded(true);
  }, []);
  function save(content: Record<string, number>, vibe: Record<string, number>, rIdx: number) {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ content, vibe, runIdx: rIdx })); } catch { /* noop */ }
  }

  const run = runs[Math.min(runIdx, runs.length - 1)];

  function cycleContent(day: number, n: number) {
    const key = `${run.id}:${day}`;
    const next = { ...contentSel, [key]: ((contentSel[key] ?? 0) + 1) % n };
    setContentSel(next); save(next, vibeSel, runIdx); flashSaved();
  }
  function cycleVibe(character: string, n: number) {
    const next = { ...vibeSel, [character]: ((vibeSel[character] ?? 0) + 1) % n };
    setVibeSel(next); save(contentSel, next, runIdx); flashSaved();
  }
  function pickRun(i: number) { setRunIdx(i); save(contentSel, vibeSel, i); }

  function copyPicks() {
    const steps = run.steps.map((s) => {
      const cv = s.contentVersions.length ? s.contentVersions[(contentSel[`${run.id}:${s.day}`] ?? 0) % s.contentVersions.length] : null;
      const vb = s.vibe?.candidates.length ? s.vibe.candidates[(vibeSel[s.vibe.character] ?? 0) % s.vibe.candidates.length] : null;
      return { step: `Day ${s.day} · ${s.focal}`, beat: s.beat, contentVersion: cv?.author ?? "(beat only — not drafted)", vibe: vb ? `${vb.name} (${vb.author})` : undefined };
    });
    navigator.clipboard?.writeText(JSON.stringify({ _what: "My Life is an RPG — run-simulator picks (paste to the desktop workbench / Claude to record + port).", arc: run.author, steps }, null, 2)).catch(() => {});
  }

  if (!loaded || !run) return null;

  return (
    <div>
      {/* arc selector — which run you're simulating */}
      <div className="flex flex-wrap gap-2 border-b-2 border-ink/15 mb-2">
        {runs.map((r, i) => (
          <button key={r.id} onClick={() => pickRun(i)}
            className={`font-sans text-[12px] uppercase tracking-[0.1em] px-3 py-2 -mb-[2px] border-b-2 transition ${i === runIdx ? "border-spot-red text-spot-red" : "border-transparent text-margin-ink hover:text-ink"}`}>
            {r.author}
          </button>
        ))}
      </div>
      <p className="text-[14px] leading-[1.6] mt-3">{run.pitch}</p>
      {run.note && <p className="text-[12px] leading-[1.5] text-ink-soft border-l-[3px] border-spot-red pl-3 mt-2">{run.note}</p>}
      {(() => {
        const drafted = run.steps.filter((s) => s.contentVersions.length).length;
        return (
          <>
          <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-margin-ink mt-3">
            The simulator is how you find each beat&apos;s tone, dialogue &amp; wording — read it in flow.
            {" "}<strong className="text-ink">{drafted} / {run.steps.length} beats written</strong>; the rest are still blank (✎ to draft).
          </p>
          {saved && (
            <div className="fixed bottom-5 right-5 z-50 font-sans text-[12px] px-3 py-2 border" style={{ background: "#eaf6ea", borderColor: "#15803d", color: "#15803d" }}>
              ✓ saved
            </div>
          )}
          </>
        );
      })()}

      {/* the run as a flow */}
      <ol className="relative ml-3 border-l-2 border-ink/20 mt-6 space-y-4 pl-6">
        {run.steps.map((s) => {
          const cIdx = s.contentVersions.length ? (contentSel[`${run.id}:${s.day}`] ?? 0) % s.contentVersions.length : 0;
          const cv = s.contentVersions[cIdx] ?? null;
          const vIdx = s.vibe?.candidates.length ? (vibeSel[s.vibe.character] ?? 0) % s.vibe.candidates.length : 0;
          const vb = s.vibe?.candidates[vIdx] ?? null;
          const tierUp = /tier-up/i.test(s.type);
          return (
            <li key={s.day} className="relative">
              <span className={`absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full border-2 ${tierUp ? "bg-spot-red border-spot-red" : "bg-paper border-forest"}`} />
              <div className="border-2 border-ink bg-paper rounded-lg p-5">
                {/* moment header */}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-sans text-[11px] uppercase tracking-[0.12em] text-margin-ink">Day {s.day}</span>
                  <h3 className="font-display text-[22px] text-forest leading-tight">{s.focal}</h3>
                  <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-ink-soft">{s.type}</span>
                  {s.tier && <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-spot-red ml-auto">{s.tier}</span>}
                </div>
                <p className="text-[15px] leading-[1.5] mt-2 italic">{s.beat}</p>
                <div className="mt-1 text-[12px] leading-[1.5]">
                  <span className="text-forest-dim">teaches: {s.teaches}</span>
                  {s.brings && <span className="text-ink-soft"> · {s.brings}</span>}
                </div>

                {/* INLINE vibe picker (character intro) */}
                {vb && s.vibe && (
                  <div className="mt-3 border-l-[3px] border-forest pl-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-spot-red">vibe</span>
                      <strong className="text-[14px] text-forest">{vb.name}</strong>
                      <span className="font-sans text-[11px] text-margin-ink">({vb.author})</span>
                      <span className="font-sans text-[10px] font-bold" style={{ color: "#15803d" }}>✓ your pick</span>
                      {s.vibe.candidates.length > 1 && (
                        <button onClick={() => cycleVibe(s.vibe!.character, s.vibe!.candidates.length)}
                          className="font-sans text-[11px] px-2.5 py-1 border border-ink/40 hover:border-spot-red hover:text-spot-red">
                          ↻ next vibe ({vIdx + 1}/{s.vibe.candidates.length})
                        </button>
                      )}
                    </div>
                    <p className="text-[13px] leading-[1.5] text-ink-soft mt-1">{vb.oneLineFeel}</p>
                    <p className="text-[13px] leading-[1.5] italic mt-0.5">{vb.voiceSample}</p>
                  </div>
                )}

                {/* INLINE content (the playable moment) + version picker */}
                {cv ? (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-spot-red">content</span>
                      <span className="font-sans text-[11px] text-margin-ink"><strong className="text-ink">{cv.author}</strong></span>
                      <span className="font-sans text-[10px] font-bold" style={{ color: "#15803d" }}>✓ your pick</span>
                      {s.contentVersions.length > 1 && (
                        <button onClick={() => cycleContent(s.day, s.contentVersions.length)}
                          className="font-sans text-[11px] px-2.5 py-1 border border-ink/40 hover:border-spot-red hover:text-spot-red">
                          ↻ next version ({cIdx + 1}/{s.contentVersions.length})
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {cv.events.map((e) => (
                        <div key={e.n} className="border-t border-ink/10 pt-2">
                          <p className="text-[13px] leading-[1.5]"><span className="font-sans text-forest tabular-nums mr-1">{e.n}.</span>{e.scenario}</p>
                          {(e.logical || e.passive || e.chaotic) && (
                            <div className="text-[12px] leading-[1.45] mt-1 ml-4 space-y-0.5">
                              {e.logical && <div><strong className="text-forest">L</strong> {e.logical}</div>}
                              {e.passive && <div><strong>P</strong> {e.passive}</div>}
                              {e.chaotic && <div><strong className="text-spot-red">C</strong> {e.chaotic}</div>}
                            </div>
                          )}
                          {e.note && <p className="text-[12px] italic text-ink-soft mt-1 ml-4">note: {e.note}</p>}
                          {e.drop && e.drop !== "—" && <p className="text-[11px] text-margin-ink mt-0.5 ml-4">drop: {e.drop}</p>}
                        </div>
                      ))}
                    </div>
                    {cv.inventory?.length > 0 && <p className="text-[11px] text-margin-ink mt-2">inventory: {cv.inventory.join(" · ")}</p>}
                  </div>
                ) : (
                  <p className="text-[12px] text-margin-ink mt-3 italic">✎ no dialogue yet — this beat&apos;s wording gets found in the simulator.</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="text-center mt-8">
        <button onClick={copyPicks} className="font-sans text-[12px] uppercase tracking-[0.1em] px-3 py-2 border-2 border-ink text-ink hover:bg-paper-shade">⧉ Copy my picks (JSON)</button>
        <p className="font-sans text-[11px] text-margin-ink mt-2">the arc + your pick per beat.</p>
      </div>
    </div>
  );
}
