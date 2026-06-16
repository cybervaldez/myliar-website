// /auditions/<campaign> — one story's SPINE: its pipeline, step by step, born from the shared slate.
// Each step card links into its audition and shows the pick + ★ + what it carried in. Next 16: params
// async. NOT canon.
import { CAMPAIGNS, STEP_DEFS, SLATE, campaignKeys, hasStep, stepDataFor, stepNo, stepLabel, isSeed, sceneBranchesFor } from "../registry";
import { star, starStr, topOf } from "../score";

export async function generateStaticParams() {
  return campaignKeys().map((campaign) => ({ campaign }));
}
export async function generateMetadata({ params }: { params: Promise<{ campaign: string }> }) {
  const { campaign } = await params;
  return { title: `${CAMPAIGNS[campaign]?.label ?? "Story"} — the audition spine` };
}

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", forest = "var(--forest)", margin = "var(--margin-ink)", red = "var(--spot-red)", amber = "#c08a2e";

export default async function CampaignSpine({ params }: { params: Promise<{ campaign: string }> }) {
  const { campaign } = await params;
  const c = CAMPAIGNS[campaign];
  if (!c) return <main style={{ maxWidth: 760, margin: "0 auto", padding: 40 }}><p style={{ color: margin }}>Unknown story. <a href="/auditions" style={{ color: forest }}>↑ the board</a></p></main>;

  const seed = isSeed(campaign);
  const order = STEP_DEFS.map((s) => {
    const has = hasStep(campaign, s.key);
    // SEEDS (age-prior demos): only the TONE step is live; the rest are folded in (shown as · seed)
    if (seed) {
      if (s.key === "tone") {
        const p = c.steps.tone as unknown as { picked?: string; scrubGroups: { id: string; name: string }[] };
        const picked = p?.scrubGroups?.find((g) => g.id === p.picked);
        return { ...s, done: !!picked, pick: "the makeup", star: -1, seed: false };
      }
      return { ...s, done: false, pick: "", star: 0, seed: true };
    }
    if (!has) return { ...s, done: false, pick: "", star: 0, seed: false };
    // THE STORY + SCENES are the picked range being BUILT (not scored auditions) — read, don't score
    if (s.key === "story" || s.key === "scenes") {
      const p = c.steps.pilot as unknown as { picked?: string; scrubGroups: { id: string; name: string; scenes?: unknown }[] };
      const picked = p?.scrubGroups?.find((g) => g.id === p.picked);
      const pick = s.key === "story" ? (picked?.name ?? "") : "the audition hub → 5 branches";
      const done = s.key === "scenes" ? !!picked?.scenes : !!picked;
      return { ...s, done, pick, star: -2, seed: false };
    }
    const sd = stepDataFor(campaign, s.key)!;
    const top = s.key === "concept"
      ? { title: (SLATE.settings.find((x) => x.id === c.pick)?.title ?? c.label), star: star(sd.data, SLATE.settings.findIndex((x) => x.id === c.pick) + 1) }
      : topOf(sd.data, sd.items.map((i) => i.title));
    return { ...s, done: true, pick: top.title, star: top.star, seed: false };
  });

  // after the shared TRUNK (setting · range · story), the SCENES audition BRANCHES into the 5
  // weather-moments — each its own page where the cast is honed (the tone is a dial inside each).
  const branches = sceneBranchesFor(campaign);
  // THE FACTOR PROFILE — the orthogonal dials set at the concept, injected into every audition (composable-factors.md)
  const tonePilot = (c.steps.tone ?? c.steps.pilot) as unknown as { targetAge?: { range: number[]; center: number; band: string; lifeContext: string; register: string; note: string }; genre?: { name: string }; culture?: { name: string } } | undefined;
  const targetAge = tonePilot?.targetAge;
  const genre = tonePilot?.genre;
  const culture = tonePilot?.culture;

  return (
    <main className="aud-spine" style={{ padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
        <a href="/auditions" style={{ color: margin, textDecoration: "none" }}>↑ the board</a>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: red, fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 28, margin: "0 0 2px", color: ink }}>{c.label}</h1>
      <p className="aud-prose" style={{ fontSize: 12.5, color: soft, lineHeight: 1.55, margin: "0 0 6px" }}>{c.blurb}</p>
      <p className="aud-prose" style={{ fontSize: 11, color: margin, margin: "0 0 12px" }}>born from <a href="/auditions/concept" style={{ color: forest }}>the slate</a> · a shared TRUNK (setting · range · mood), then it BRANCHES at the SCENES step (the 5 world-moments × the tones) — each cell its own palette + cast, then the tone wears its makeup. Each step carries the last&rsquo;s experts forward.</p>

      {(targetAge || genre || culture) && (
        <div style={{ border: `2px solid ${forest}`, background: "var(--paper-shade)", padding: "10px 13px", margin: "0 0 20px" }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".07em", color: forest, marginBottom: 4 }}>🎛 THE FACTOR PROFILE — the orthogonal dials every audition injects (set at the concept)</div>
          {targetAge && (
            <div style={{ fontSize: 11.5, color: ink, lineHeight: 1.5, marginBottom: 3 }}><b style={{ color: forest }}>AGE</b> {targetAge.range[0]}–{targetAge.range[1]} ({targetAge.band}) · {targetAge.lifeContext} <span style={{ color: margin, fontStyle: "italic" }}>— the register + content ceiling · STRUCTURAL (the dialed tone overrides it)</span></div>
          )}
          {genre && (
            <div style={{ fontSize: 11.5, color: ink, lineHeight: 1.5, marginBottom: 3 }}><b style={{ color: forest }}>GENRE</b> {genre.name} <span style={{ color: margin, fontStyle: "italic" }}>— the world&rsquo;s conventions + traps · CRAFT (carried by the genre experts)</span></div>
          )}
          {culture && (
            <div style={{ fontSize: 11.5, color: ink, lineHeight: 1.5, marginBottom: 3 }}><b style={{ color: forest }}>CULTURE</b> {culture.name} <span style={{ color: margin, fontStyle: "italic" }}>— the register&rsquo;s arousal tint · FINE moderator (composes, never overrides)</span></div>
          )}
          <div style={{ fontSize: 10, color: margin, marginTop: 4, fontStyle: "italic" }}>each injects only what it predicts, at its own strength; none derived from another; the floor always wins. <span style={{ color: soft }}>(model: composable-factors.md)</span></div>
        </div>
      )}

      {order.map((s, k) => (
        <div key={s.key}>
          {s.done ? (
            <a href={`/auditions/${campaign}/${s.key}`} style={{ display: "block", textDecoration: "none", border: `2px solid var(--ink-soft)`, background: paper, padding: "12px 15px", color: ink }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 14 }}><b style={{ color: forest }}>{stepNo(s.key)} {s.label}</b> <span style={{ color: margin, fontSize: 12 }}>— “{s.pick}”</span></span>
                <span style={{ color: s.star < 0 ? forest : amber, fontSize: s.star < 0 ? 11 : 13, whiteSpace: "nowrap", fontWeight: s.star < 0 ? 700 : 400 }}>{s.star === -2 ? "✓ set" : s.star === -1 ? "● building" : starStr(s.star)}</span>
              </div>
              {c.carried[s.key] && (
                <div style={{ fontSize: 10.5, color: margin, marginTop: 4, lineHeight: 1.45 }}>↩ carried in: {c.carried[s.key].map((x) => x.step.replace(/ —.*/, "")).join(" · ")}</div>
              )}
              <div style={{ fontSize: 11.5, color: soft, marginTop: 3 }}>open →</div>
            </a>
          ) : (
            <div style={{ border: `2px dashed var(--ink-soft)`, padding: "12px 15px", color: margin, fontSize: 14 }}><b>{stepNo(s.key)} {s.label}</b> <span style={{ fontSize: 12 }}>— {s.seed ? "seed · folded into the tone step" : "next"}</span></div>
          )}
          {k < order.length - 1 && <div style={{ borderLeft: `2px dashed ${forest}`, height: 12, margin: "0 0 0 16px" }} />}
        </div>
      ))}

      {branches.length > 0 && (
        <>
          <div style={{ borderLeft: `2px dashed ${forest}`, height: 14, margin: "0 0 0 16px" }} />
          <div style={{ fontSize: 10, color: margin, margin: "0 0 6px 24px", fontStyle: "italic", lineHeight: 1.5 }}>↓ the <a href={`/auditions/${campaign}/scenes`} style={{ color: forest, fontWeight: 700 }}>④ scenes audition</a> branches into the 5 weather-moments — each honed individually (the tone dialed within):</div>
          {branches.map((b) => (
            <div key={b.key} style={{ marginLeft: 24, borderLeft: `2px solid ${forest}`, paddingLeft: 14, marginBottom: 7 }}>
              <a href={`/auditions/${campaign}/scenes/${b.key}`} style={{ display: "block", textDecoration: "none", border: `2px solid var(--ink-soft)`, background: paper, padding: "9px 13px", color: ink }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13.5 }}><b style={{ color: forest, textTransform: "capitalize" }}>{b.label}</b> <span style={{ fontFamily: "monospace", fontSize: 9.5, color: margin }}>{b.spark}</span></span>
                  <span style={{ display: "flex", gap: 2 }}>{b.cells.map((cc) => <span key={cc.tone} style={{ width: 13, height: 13, background: cc.base, borderRadius: 2, border: `1px solid ${ink}` }} />)}</span>
                </div>
                <div style={{ fontSize: 10.5, color: forest, marginTop: 3 }}>hone the cast + characters →</div>
              </a>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
