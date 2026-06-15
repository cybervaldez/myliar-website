// /auditions/<campaign>/<step> — one campaign's audition for one step. Campaign-primary: the clean
// per-story thread. Each page also carries this story's prior experts (look-back) AND the cross-story
// reference (how other stories solved this step — the idea bank). Concept resolves to the shared
// SLATE. Next 16: params async. NOT canon.
import StepBoard from "../../StepBoard";
import Scrubber, { StoryBuild, SubrangeBuild, type SubrangeT } from "../../Scrubber";
import { star, avg } from "../../score";
import { CAMPAIGNS, STEP_DEFS, INTRO, PRIMERS, SLATE_STATUS, stepLabel, stepNo, hasStep, stepDataFor, crossRef, allParams, whyPicked } from "../../registry";

export async function generateStaticParams() {
  return allParams();
}

export async function generateMetadata({ params }: { params: Promise<{ campaign: string; step: string }> }) {
  const { campaign, step } = await params;
  const c = CAMPAIGNS[campaign];
  return { title: `${stepNo(step)} ${stepLabel(step)} — ${c ? c.label : "Auditions"}` };
}

export default async function CampaignStepPage({ params }: { params: Promise<{ campaign: string; step: string }> }) {
  const { campaign, step } = await params;
  const c = CAMPAIGNS[campaign];

  // THE STORY — the picked range, now being built (not an audition): one story, the crossing scrubber,
  // and the SUBRANGE shows the BEATS that can live at each world-moment.
  if (step === "story") {
    const link = { color: "var(--forest)", fontWeight: 700, textDecoration: "none" } as const;
    if (!c) return <main style={{ maxWidth: 760, margin: "0 auto", padding: 40 }}><p style={{ color: "var(--margin-ink)" }}>No story for {campaign}. <a href="/auditions" style={link}>↑ the board</a></p></main>;
    const p = c.steps.pilot as unknown as { scenes: string[]; picked?: string; scrubGroups: { id: string; name: string; settingTitle: string; throughline: string; env: string[]; buildingBlock: string; metaphor?: string; audienceServe?: string; subrange?: { label: string; text: string }[][]; mood?: { ambients: { id: string; name: string; base: string; ink: string; accent: string; why: string }[]; characters: { name: string; color: string; is: string; joinsAt: string }[]; eli5: string; vet?: { best: string; ambients: { id: string; conveys_metaphor: string; safe_floor: string; arc_fit: string; note: string }[]; characterHarmony: string; contrastFlags: string[]; oneLine: string }; prompts?: { characters: string[]; objects: string[]; trophy: string[]; items: string[]; achievementIcons: string[] }; prose?: { objectSeeds: { dominant: string[]; accent: string[] }; diction: { cool: string[]; warm: string[] }; rules: string[]; example: string } } }[] };
    const story = p.scrubGroups.find((g) => g.id === p.picked);
    return (
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
          <a href="/auditions" style={{ color: "var(--margin-ink)", textDecoration: "none" }}>↑ the board</a>
          <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
        </div>
        <h1 style={{ fontSize: 24, margin: "0 0 2px", color: "var(--ink)" }}>{stepNo("story")} The Story · {c.label}</h1>
        {!story ? (
          <p style={{ fontSize: 13, color: "var(--margin-ink)" }}>No range picked yet. <a href={`/auditions/${campaign}/pilot`} style={link}>Pick a range →</a></p>
        ) : (
          <>
            <div style={{ fontFamily: "var(--theme-display)", fontSize: 22, color: "var(--ink)", marginTop: 2 }}>{story.name}{story.metaphor && <span style={{ color: "var(--forest)", fontSize: 16 }}> «{story.metaphor}»</span>}</div>
            <div style={{ border: "2px dashed var(--forest)", background: "var(--paper-shade)", padding: "10px 14px", margin: "10px 0 14px", fontSize: 11.5, color: "var(--ink)", lineHeight: 1.5 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "var(--forest)", marginBottom: 4 }}>↩ CARRIED FROM THE RANGE — the locked spine</div>
              <div><b>struggle:</b> {story.buildingBlock}</div>
              {story.audienceServe && <div style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>↳ serves: {story.audienceServe}</div>}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.55, margin: "0 0 14px" }}>{INTRO.story}</p>
            <StoryBuild story={{ id: story.id, env: story.env, subrange: story.subrange, mood: story.mood }} scenes={p.scenes} />
            <div style={{ border: "2px dashed var(--forest)", background: "var(--paper-shade)", padding: "10px 14px", margin: "16px 0 0", fontSize: 11, color: "var(--ink)", lineHeight: 1.5 }}>
              <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "var(--forest)", marginBottom: 4 }}>→ HANDS THE NEXT STEPS</div>
              the <b>ambient palette</b> · the <b>UI theme</b> (the dialogue box) · the <b>world asset-prompt colours</b> · the <b>palette→prose recipe</b> — the ambient ground every story wears. The <b>SUBRANGE step</b> auditions the <b>cast-set makeup</b> (the crew’s own palettes + prompts); the real beats are authored against the prose recipe.
            </div>
          </>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ink-soft)", paddingTop: 12, marginTop: 18, fontSize: 13 }}>
          <a href={`/auditions/${campaign}/pilot`} style={link}>← ② Range</a>
          <a href={`/auditions/${campaign}/subrange`} style={link}>next: ④ The Subrange →</a>
        </div>
      </main>
    );
  }

  // THE SUBRANGE — the picked story's MAKEUP, auditioned: experts-first → the makeup brief → the cast-
  // set audition (the crew tone-mapped, judged for cohesion · contrast · safe). Worn over the story
  // step's ambient ground. (Multi-candidate rival sets are the next tool; this audits the assembled set.)
  if (step === "subrange") {
    const link = { color: "var(--forest)", fontWeight: 700, textDecoration: "none" } as const;
    if (!c) return <main style={{ maxWidth: 760, margin: "0 auto", padding: 40 }}><p style={{ color: "var(--margin-ink)" }}>No story for {campaign}. <a href="/auditions" style={link}>↑ the board</a></p></main>;
    const p = c.steps.pilot as unknown as { picked?: string; scrubGroups: { id: string; name: string; metaphor?: string; mood?: { ambients?: { name: string; base: string }[]; characters: { name: string; color: string; is: string; joinsAt: string }[]; vet?: { best: string }; prompts?: { characters: string[] } }; subrangeAudit?: SubrangeT["audit"]; expertPanel?: { audience: string; experts: SubrangeT["experts"]; framework: SubrangeT["framework"]; vet: SubrangeT["vet"] } }[] };
    const g = p.scrubGroups.find((x) => x.id === p.picked);
    const ep = g?.expertPanel, au = g?.subrangeAudit;
    const amb = g?.mood?.ambients?.find((a) => a.name === g?.mood?.vet?.best) ?? g?.mood?.ambients?.[0];
    const d: SubrangeT | null = g && ep && au ? { audience: ep.audience, experts: ep.experts, framework: ep.framework, vet: ep.vet, characters: g.mood!.characters, charPrompts: g.mood?.prompts?.characters ?? [], audit: au, ambientName: amb?.name ?? "the ambient", ambientBase: amb?.base ?? "#0e1822" } : null;
    return (
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
          <a href="/auditions" style={{ color: "var(--margin-ink)", textDecoration: "none" }}>↑ the board</a>
          <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
        </div>
        <h1 style={{ fontSize: 24, margin: "0 0 2px", color: "var(--ink)" }}>{stepNo("subrange")} The Subrange · {c.label}</h1>
        {g?.metaphor && <div style={{ fontFamily: "var(--theme-display)", fontSize: 18, color: "var(--forest)", marginBottom: 4 }}>{g.name} «{g.metaphor}»</div>}
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.55, margin: "0 0 16px" }}>{INTRO.subrange}</p>
        {!d ? (
          <p style={{ fontSize: 13, color: "var(--margin-ink)" }}>The makeup isn&rsquo;t auditioned yet. Build it on <a href={`/auditions/${campaign}/story`} style={link}>the story step →</a></p>
        ) : <SubrangeBuild d={d} />}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ink-soft)", paddingTop: 12, marginTop: 20, fontSize: 13 }}>
          <a href={`/auditions/${campaign}/story`} style={link}>← ③ The Story</a>
          <span style={{ color: "var(--margin-ink)" }}>next: the per-tone content (chat → beats), cozy-first →</span>
        </div>
      </main>
    );
  }

  const sd = c ? stepDataFor(campaign, step) : null;
  if (!c || !sd) return <main style={{ maxWidth: 760, margin: "0 auto", padding: 40 }}><p style={{ color: "var(--margin-ink)" }}>No audition for {campaign} · {step}. <a href="/auditions" style={{ color: "var(--forest)" }}>↑ the board</a></p></main>;

  // this campaign's ordered, auditioned steps → prev / next within the thread
  const order = STEP_DEFS.filter((s) => hasStep(campaign, s.key));
  const at = order.findIndex((s) => s.key === step);
  const prev = at > 0 ? { href: `/auditions/${campaign}/${order[at - 1].key}`, label: `${stepNo(order[at - 1].key)} ${order[at - 1].label.replace(/^The /, "")}` } : { href: `/auditions/${campaign}/`, label: c.label };
  const next = at < order.length - 1 ? { href: `/auditions/${campaign}/${order[at + 1].key}`, label: `${stepNo(order[at + 1].key)} ${order[at + 1].label.replace(/^The /, "")}` } : null;

  const conceptIntro = `The room THE ${c.label.replace(/^The /, "").toUpperCase()} won. ${INTRO.concept} This is also the LEDGER — the pick and the unselected stay side by side, so a future story never re-picks a taken setting×destination.`;

  // the PILOT (the range) gets the interactive SCRUBBER for EVERY candidate (we're still picking) —
  // sorted by cohesion so the most cohesive (★) is the default
  let prepend = null;
  if (step === "pilot") {
    const raw = c.steps.pilot as unknown as { scenes: string[]; picked?: string; scrubGroups: { id: string; name: string; settingTitle: string; storyTitles: string[]; throughline: string; env: string[]; buildingBlock: string; verdict?: string; metaphor?: string; audienceServe?: string; subrange?: { cozy: string; intense: string }[] }[]; worldbuild?: { richest: string; note: string } };
    const rich = raw.worldbuild?.richest, pick = raw.picked;
    const groups = raw.scrubGroups
      .map((gp, k) => ({ id: gp.id, name: gp.name, settingTitle: gp.settingTitle, storyTitles: gp.storyTitles, throughline: gp.throughline, env: gp.env, buildingBlock: gp.buildingBlock, verdict: gp.verdict, metaphor: gp.metaphor, audienceServe: gp.audienceServe, relate: avg(sd.data, k + 1, "relate"), safe: avg(sd.data, k + 1, "feelsSafe"), _s: star(sd.data, k + 1) }))
      .sort((a, b) => (b.id === pick ? 1 : 0) - (a.id === pick ? 1 : 0) || (b.id === rich ? 1 : 0) - (a.id === rich ? 1 : 0) || b._s - a._s);
    prepend = <Scrubber scenes={raw.scenes} groups={groups} richest={rich} picked={pick} note={raw.worldbuild?.note} />;
  }

  return (
    <StepBoard
      stepLabel={`${stepNo(step)} ${stepLabel(step)} · ${c.label}`}
      intro={sd.isSlate ? conceptIntro : (INTRO[step] ?? "")}
      whyPicked={whyPicked(campaign, step)}
      primer={PRIMERS[step]}
      prepend={prepend}
      sourceStudy={c.sourceStudy?.[step]}
      data={sd.data}
      items={step === "pilot" ? [] : sd.items}
      status={sd.isSlate ? SLATE_STATUS : undefined}
      carried={c.carried[step]}
      reference={crossRef(campaign, step)}
      prev={prev}
      next={next}
    />
  );
}
