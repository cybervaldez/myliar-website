// /auditions/<campaign> — one story's SPINE: its pipeline, step by step, born from the shared slate.
// Each step card links into its audition and shows the pick + ★ + what it carried in. Next 16: params
// async. NOT canon.
import { CAMPAIGNS, STEP_DEFS, SLATE, campaignKeys, hasStep, stepDataFor, stepNo, stepLabel } from "../registry";
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

  const order = STEP_DEFS.map((s) => {
    const has = hasStep(campaign, s.key);
    if (!has) return { ...s, done: false, pick: "", star: 0 };
    // THE STORY is the picked range being BUILT (not an audition) — read the pick, don't score it
    if (s.key === "story") {
      const p = c.steps.pilot as unknown as { picked?: string; scrubGroups: { id: string; name: string }[] };
      const picked = p?.scrubGroups?.find((g) => g.id === p.picked);
      return { ...s, done: !!picked, pick: picked?.name ?? "", star: -1 };
    }
    const sd = stepDataFor(campaign, s.key)!;
    const top = s.key === "concept"
      ? { title: (SLATE.settings.find((x) => x.id === c.pick)?.title ?? c.label), star: star(sd.data, SLATE.settings.findIndex((x) => x.id === c.pick) + 1) }
      : topOf(sd.data, sd.items.map((i) => i.title));
    return { ...s, done: true, pick: top.title, star: top.star };
  });

  // after the shared TRUNK (setting · range · mood) the pipeline BRANCHES per SUBRANGE (the tone) —
  // each tone is its own cast + chat + beats (the cast is tone-dependent). Start with the coziest.
  const pilotRaw = c.steps.pilot as unknown as { picked?: string; scrubGroups: { id: string; subrange?: { label: string }[][] }[] } | undefined;
  const pickedStory = pilotRaw?.scrubGroups?.find((g) => g.id === pilotRaw.picked);
  const subranges = (pickedStory?.subrange?.[0] ?? []).map((t) => t.label);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
        <a href="/auditions" style={{ color: margin, textDecoration: "none" }}>↑ the board</a>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: red, fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 28, margin: "0 0 2px", color: ink }}>{c.label}</h1>
      <p style={{ fontSize: 12.5, color: soft, lineHeight: 1.55, margin: "0 0 6px" }}>{c.blurb}</p>
      <p style={{ fontSize: 11, color: margin, margin: "0 0 20px" }}>born from <a href="/auditions/concept" style={{ color: forest }}>the slate</a> · a shared TRUNK (setting · range · mood), then it BRANCHES per subrange — each tone its own cast · chat · beats. Each step carries the last's experts forward.</p>

      {order.map((s, k) => (
        <div key={s.key}>
          {s.done ? (
            <a href={`/auditions/${campaign}/${s.key}`} style={{ display: "block", textDecoration: "none", border: `2px solid var(--ink-soft)`, background: paper, padding: "12px 15px", color: ink }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 14 }}><b style={{ color: forest }}>{stepNo(s.key)} {s.label}</b> <span style={{ color: margin, fontSize: 12 }}>— “{s.pick}”</span></span>
                <span style={{ color: s.star < 0 ? forest : amber, fontSize: s.star < 0 ? 11 : 13, whiteSpace: "nowrap", fontWeight: s.star < 0 ? 700 : 400 }}>{s.star < 0 ? "● building" : starStr(s.star)}</span>
              </div>
              {c.carried[s.key] && (
                <div style={{ fontSize: 10.5, color: margin, marginTop: 4, lineHeight: 1.45 }}>↩ carried in: {c.carried[s.key].map((x) => x.step.replace(/ —.*/, "")).join(" · ")}</div>
              )}
              <div style={{ fontSize: 11.5, color: soft, marginTop: 3 }}>open →</div>
            </a>
          ) : (
            <div style={{ border: `2px dashed var(--ink-soft)`, padding: "12px 15px", color: margin, fontSize: 14 }}><b>{stepNo(s.key)} {s.label}</b> <span style={{ fontSize: 12 }}>— next</span></div>
          )}
          {k < order.length - 1 && <div style={{ borderLeft: `2px dashed ${forest}`, height: 12, margin: "0 0 0 16px" }} />}
        </div>
      ))}

      {subranges.length > 0 && (
        <>
          <div style={{ borderLeft: `2px dashed ${forest}`, height: 14, margin: "0 0 0 16px" }} />
          <div style={{ border: `2px solid ${forest}`, background: "var(--paper-shade)", padding: "11px 15px", marginBottom: 4 }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", color: forest, marginBottom: 3 }}>⑃ THE SUBRANGE BRANCHES — here the pipeline forks</div>
            <div style={{ fontSize: 11.5, color: ink, lineHeight: 1.5 }}>the trunk above (setting · range · mood) is shared; from here each <b>tone</b> is its OWN <b>cast → chat → beats</b> — the cast is tone-dependent (the chatbot lives here). <b>Build the coziest first</b> (the floor — the safest entry); the rest extrapolate up from it.</div>
          </div>
          {subranges.map((tone, i) => {
            const active = i === 0;
            const col = active ? forest : "var(--ink-soft)";
            return (
              <div key={tone} style={{ marginLeft: 24, borderLeft: `2px ${active ? "solid" : "dashed"} ${col}`, paddingLeft: 14, marginBottom: 8 }}>
                <div style={{ border: `2px ${active ? "solid" : "dashed"} ${col}`, background: active ? paper : "transparent", padding: "10px 14px", opacity: active ? 1 : 0.7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontSize: 13.5 }}><b style={{ color: active ? forest : margin, textTransform: "capitalize" }}>{tone}</b> <span style={{ fontSize: 11, color: margin }}>subrange</span></span>
                    <span style={{ fontSize: 10.5, color: active ? forest : margin, fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>{active ? "● START — the floor" : "○ later"}</span>
                  </div>
                  <div style={{ fontSize: 11, color: soft, marginTop: 4 }}>④ Cast <span style={{ color: margin }}>→</span> ⑤ Chat <span style={{ color: margin }}>→</span> the beats{active ? "" : <span style={{ color: margin, fontStyle: "italic" }}> · after the cozy branch ships</span>}</div>
                  {active && <div style={{ fontSize: 11, color: forest, marginTop: 5, fontWeight: 700 }}>→ the cast is next (per this subrange)</div>}
                </div>
              </div>
            );
          })}
        </>
      )}
    </main>
  );
}
