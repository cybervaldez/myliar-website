// /auditions/<campaign>/scenes/<door>/prelude — THE PRELUDE (browse copy / the book cover). What a player
// reads while deciding what to play — it SELLS the experience. NOT a Day and NOT the front door (no character
// pick here). The three stages: PRELUDE (sell) → FRONT DOOR (pick) → DAYS (play). NOT canon.
import { Prelude, type PreludeT, type PreludeAuditionT, type PreludePanelT } from "../../../../Prelude";
import { type CastNameT } from "../../../../CastName";
import { CAMPAIGNS, campaignsWithScenes, sceneBranchesFor, sceneBranch, hasPrelude } from "../../../../registry";

type Honing = { prelude?: PreludeT; preludeAudition?: PreludeAuditionT; preludePanel?: PreludePanelT };
function groupFor(campaign: string) {
  const p = CAMPAIGNS[campaign]?.steps?.scenes as unknown as { picked?: string; scrubGroups: { id: string; scenes?: { honing?: Record<string, Honing>; chatbots?: { map?: CastNameT[] }; prequel?: { title?: string; chapters?: { title?: string }[] } } }[] } | undefined;
  return p?.scrubGroups?.find((x) => x.id === p.picked);
}
const honingFor = (campaign: string, sceneKey: string): Honing | undefined => groupFor(campaign)?.scenes?.honing?.[sceneKey];
const castFor = (campaign: string): CastNameT[] => groupFor(campaign)?.scenes?.chatbots?.map ?? [];

export function generateStaticParams() {
  const out: { campaign: string; scene: string }[] = [];
  for (const campaign of campaignsWithScenes())
    for (const b of sceneBranchesFor(campaign)) if (hasPrelude(campaign, b.key)) out.push({ campaign, scene: b.key });
  return out;
}
export async function generateMetadata({ params }: { params: Promise<{ campaign: string; scene: string }> }) {
  const { campaign, scene } = await params;
  const b = sceneBranch(campaign, scene);
  return { title: `The Prelude — ${b?.label ?? scene}` };
}

const link = { color: "var(--forest)", fontWeight: 700, textDecoration: "none" } as const;

export default async function PreludePage({ params }: { params: Promise<{ campaign: string; scene: string }> }) {
  const { campaign, scene } = await params;
  const c = CAMPAIGNS[campaign];
  const b = sceneBranch(campaign, scene);
  const h = honingFor(campaign, scene);
  if (!c || !b || !h?.prelude?.blurb) return <main className="aud-main" style={{ padding: 40 }}><p style={{ color: "var(--margin-ink)" }}>No prelude for {scene}. <a href={`/auditions/${campaign}/scenes/${scene}`} style={link}>↑ the scene outline</a></p></main>;

  return (
    <main className="aud-main" style={{ padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
        <a href={`/auditions/${campaign}/scenes/${scene}`} style={{ color: "var(--margin-ink)", textDecoration: "none" }}>↑ {b.label} — the scene outline</a>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 26, margin: "0 0 2px", color: "var(--ink)" }}>⛩ The Prelude <span style={{ fontSize: 13, color: "var(--margin-ink)", fontWeight: 400 }}>· <span style={{ textTransform: "capitalize" }}>{b.label}</span> — the book cover (what you read while browsing)</span></h1>
      {groupFor(campaign)?.scenes?.prequel?.chapters?.length ? (
        <a href={`/auditions/${campaign}/prequel`} style={{ display: "inline-block", fontSize: 11, color: "#7a5b9a", fontWeight: 700, textDecoration: "none", border: "1px solid #7a5b9a", padding: "3px 9px", margin: "4px 0 8px" }}>📖 the prequel — «{groupFor(campaign)!.scenes!.prequel!.title}» <span style={{ fontWeight: 400, fontStyle: "italic" }}>(optional · the cast, before you · in the menu)</span></a>
      ) : null}
      <Prelude prelude={h.prelude} audition={h.preludeAudition} panel={h.preludePanel} cast={castFor(campaign)} frontDoorHref={`/auditions/${campaign}/scenes/${scene}/front-door`} />
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ink-soft)", paddingTop: 12, marginTop: 22, fontSize: 13 }}>
        <a href={`/auditions/${campaign}/scenes/${scene}`} style={link}>← the outline</a>
        <a href={`/auditions/${campaign}/scenes/${scene}`} style={link}>the front door → (on the outline)</a>
      </div>
    </main>
  );
}
