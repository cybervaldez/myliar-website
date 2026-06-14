// /auditions/<campaign>/<step> — one campaign's audition for one step. Campaign-primary: the clean
// per-story thread. Each page also carries this story's prior experts (look-back) AND the cross-story
// reference (how other stories solved this step — the idea bank). Concept resolves to the shared
// SLATE. Next 16: params async. NOT canon.
import StepBoard from "../../StepBoard";
import Scrubber from "../../Scrubber";
import { star } from "../../score";
import { CAMPAIGNS, STEP_DEFS, INTRO, PRIMERS, SLATE_STATUS, stepLabel, stepNo, hasStep, stepDataFor, crossRef, allParams } from "../../registry";

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
  const sd = c ? stepDataFor(campaign, step) : null;
  if (!c || !sd) return <main style={{ maxWidth: 760, margin: "0 auto", padding: 40 }}><p style={{ color: "var(--margin-ink)" }}>No audition for {campaign} · {step}. <a href="/auditions" style={{ color: "var(--forest)" }}>↑ the board</a></p></main>;

  // this campaign's ordered, auditioned steps → prev / next within the thread
  const order = STEP_DEFS.filter((s) => hasStep(campaign, s.key));
  const at = order.findIndex((s) => s.key === step);
  const prev = at > 0 ? { href: `/auditions/${campaign}/${order[at - 1].key}`, label: `${stepNo(order[at - 1].key)} ${order[at - 1].label.replace(/^The /, "")}` } : { href: `/auditions/${campaign}/`, label: c.label };
  const next = at < order.length - 1 ? { href: `/auditions/${campaign}/${order[at + 1].key}`, label: `${stepNo(order[at + 1].key)} ${order[at + 1].label.replace(/^The /, "")}` } : null;

  const conceptIntro = `The room THE ${c.label.replace(/^The /, "").toUpperCase()} won. ${INTRO.concept} This is also the LEDGER — the pick and the unselected stay side by side, so a future story never re-picks a taken setting×destination.`;

  // the PILOT (the range) gets the interactive SCRUBBER of the picked (most cohesive) subrange
  let prepend = null;
  if (step === "pilot") {
    const raw = c.steps.pilot as unknown as { coziness: string[]; scrubGroups: { id: string; name: string; settingTitle: string; storyTitles: string[] }[] };
    const top = sd.items.slice().sort((a, b) => star(sd.data, b.idx) - star(sd.data, a.idx))[0];
    const g = raw.scrubGroups.find((x) => x.id === top?.key) ?? raw.scrubGroups[0];
    if (g) prepend = <Scrubber settingTitle={g.settingTitle} coziness={raw.coziness} storyTitles={g.storyTitles} />;
  }

  return (
    <StepBoard
      stepLabel={`${stepNo(step)} ${stepLabel(step)} · ${c.label}`}
      intro={sd.isSlate ? conceptIntro : (INTRO[step] ?? "")}
      primer={PRIMERS[step]}
      prepend={prepend}
      sourceStudy={c.sourceStudy?.[step]}
      data={sd.data}
      items={sd.items}
      status={sd.isSlate ? SLATE_STATUS : undefined}
      carried={c.carried[step]}
      reference={crossRef(campaign, step)}
      prev={prev}
      next={next}
    />
  );
}
