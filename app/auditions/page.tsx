// /auditions — THE BOARD. Campaign-primary: the master SLATE (the idea bank) on top, then a thread
// per story (its steps as chips). Two readings from one source: read a row = one story's pipeline;
// open the slate or a step's cross-story reference = the idea bank across stories. NOT canon.
import { CAMPAIGNS, STEP_DEFS, SLATE, SLATE_STATUS, campaignKeys, hasStep, stepDataFor, stepNo, isSeed } from "./registry";
import { star, starStr, topOf } from "./score";

export const metadata = { title: "Auditions — the board", description: "The audition board: the concept slate + a thread per story, experts carried forward." };

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)", red = "var(--spot-red)", amber = "#c08a2e";

const statusCounts = Object.values(SLATE_STATUS).reduce((m: Record<string, number>, s) => ((m[s] = (m[s] ?? 0) + 1), m), {});

function chips(campaign: string) {
  const seed = isSeed(campaign);
  return STEP_DEFS.map((s) => {
    // SEEDS (age-prior demos): only the TONE step is live; the rest fold into it (shown as · seed)
    if (seed) {
      if (s.key === "tone") { const p = CAMPAIGNS[campaign].steps.tone as unknown as { picked?: string }; return { key: s.key, done: !!p?.picked, star: -1, seed: false }; }
      return { key: s.key, done: false, star: 0, seed: true };
    }
    if (!hasStep(campaign, s.key)) return { key: s.key, done: false, star: 0, seed: false };
    // the STORY + TONE steps are the picked range being built (not scored) — done if a range is picked
    if (s.key === "story" || s.key === "tone") {
      const p = CAMPAIGNS[campaign].steps.pilot as unknown as { picked?: string };
      return { key: s.key, done: !!p?.picked, star: s.key === "story" ? -2 : -1, seed: false };
    }
    const sd = stepDataFor(campaign, s.key)!;
    const st = s.key === "concept"
      ? star(sd.data, SLATE.settings.findIndex((x) => x.id === CAMPAIGNS[campaign].pick) + 1)
      : topOf(sd.data, sd.items.map((i) => i.title)).star;
    return { key: s.key, done: true, star: st, seed: false };
  });
}

export default function Board() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 10, letterSpacing: ".14em", color: forest, fontFamily: "var(--theme-body)", fontWeight: 700 }}>RESTARTED FROM CONCEPT · 2026-06-14</span>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: red, fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 30, margin: "4px 0 2px", color: ink }}>The Auditions</h1>
      <p style={{ fontSize: 13, color: soft, lineHeight: 1.55, margin: "0 0 20px" }}>A <b style={{ color: ink }}>SETTING</b> is the shared world — a hook-engine. Its <b style={{ color: ink }}>MOMENTS</b> are the doors its stories spawn from. We audition the setting, then its moments, for the same demo audience (anxiety · ADHD · low self-worth).</p>

      <div style={{ border: `2px solid ${forest}`, background: shade, padding: "14px 16px", marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: forest, marginBottom: 7 }}>ELI5 — HOW TO READ THE BOARD</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: ink, lineHeight: 1.62 }}>
          <li><b>The slate</b> = every SETTING (the worlds), the idea bank. Picks are <span style={{ color: forest }}>building</span>; the rest sit <span style={{ color: margin }}>in the bank</span>, revivable — never re-pick a taken setting.</li>
          <li>A setting is a <b>HOOK-ENGINE</b>: build the world + its safety floor once, then spawn many tonal <b>MOMENTS</b> — each a door a *different* reader walks through. Wide tonal range = wide net.</li>
          <li>The moments are kept as a <b>RANGE</b> (no pick — the scrub’s tone). Each moment spawns its own story (own cast/coach, §8.14) — built on demand.</li>
          <li>The <b style={{ color: amber }}>★ build-value</b> star folds audience + hook-capacity, weighted by what matters to our mechanics.</li>
        </ul>
      </div>

      {/* THE SLATE — master ledger */}
      <a href="/auditions/concept" style={{ display: "block", textDecoration: "none", border: `2px solid var(--ink-soft)`, background: paper, padding: "13px 16px", marginBottom: 22, color: ink }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--theme-display)", fontSize: 19 }}>The Slate</span>
          <span style={{ fontSize: 11, color: margin }}>{SLATE.settings.length} settings · <b style={{ color: forest }}>{statusCounts.building ?? 0} building</b> · {statusCounts.available ?? 0} in the bank</span>
        </div>
        <div style={{ fontSize: 11.5, color: soft, marginTop: 3 }}>the master concept ledger — the idea bank every story is born from. open →</div>
      </a>

      <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: ink, margin: "0 0 10px" }}>THE STORIES — each row is a pipeline (↓ experts carried forward)</div>
      {campaignKeys().map((campaign) => {
        const c = CAMPAIGNS[campaign];
        return (
          <div key={campaign} style={{ border: `2px solid var(--ink-soft)`, background: paper, padding: "13px 16px", marginBottom: 14 }}>
            <a href={`/auditions/${campaign}`} style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: "var(--theme-display)", fontSize: 19, color: ink }}>{c.label}</span>
              <span style={{ fontSize: 11, color: forest, marginLeft: 8 }}>spine →</span>
            </a>
            <div style={{ fontSize: 11.5, color: soft, lineHeight: 1.5, margin: "2px 0 9px" }}>{c.blurb}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {chips(campaign).map((ch, k) => (
                <span key={ch.key} style={{ display: "flex", alignItems: "center" }}>
                  {ch.done ? (
                    <a href={`/auditions/${campaign}/${ch.key}`} style={{ textDecoration: "none", border: `1.5px solid ${forest}`, color: ink, fontSize: 11, padding: "3px 8px", lineHeight: 1.3, display: "inline-block" }}>
                      <b style={{ color: forest }}>{stepNo(ch.key)} {STEP_DEFS[k].label.replace(/^The /, "")}</b> <span style={{ color: ch.star < 0 ? forest : amber }}>{ch.star === -2 ? "✓" : ch.star === -1 ? "●" : starStr(ch.star)}</span>
                    </a>
                  ) : (
                    <span style={{ border: `1.5px dashed var(--ink-soft)`, color: margin, fontSize: 11, padding: "3px 8px", display: "inline-block" }}>{stepNo(ch.key)} {STEP_DEFS[k].label.replace(/^The /, "")} · {ch.seed ? "seed" : "next"}</span>
                  )}
                  <span style={{ color: margin, margin: "0 1px", fontSize: 11 }}>→</span>
                </span>
              ))}
              <span style={{ border: `1.5px dashed var(--ink-soft)`, color: margin, fontSize: 10.5, padding: "3px 8px", fontStyle: "italic" }}>each moment spawns its own story (destination · struggle · cast · motif) — built on demand</span>
            </div>
          </div>
        );
      })}

      <div style={{ borderTop: `1px solid var(--ink-soft)`, marginTop: 18, paddingTop: 12, fontSize: 11, color: margin }}>
        ↩ earlier iterations (pre-hook-engine) archived for reference at <a href="/auditions-v1" style={{ color: forest }}>/auditions-v1</a>.
      </div>
    </main>
  );
}
