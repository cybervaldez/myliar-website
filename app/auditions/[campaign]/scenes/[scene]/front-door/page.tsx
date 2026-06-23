// /auditions/<campaign>/scenes/<door>/front-door — THE FRONT DOOR (the character pick). A SEPARATE stage from
// the prelude (the sell) and the days (the play): here the player CHOOSES who they meet first — the Scene Board
// (per-lead openings + founding gifts), which forks Day 1, then converges. NOT canon.
import { FrontDoor, type FrontDoorT, type OpeningT, type ChatbotT } from "../../../../FrontDoor";
import { CAMPAIGNS, campaignsWithScenes, sceneBranchesFor, sceneBranch, hasFrontDoor, hasPrelude } from "../../../../registry";

type Honing = { frontDoor?: FrontDoorT; honed?: Record<string, { openings?: OpeningT[] }> };
function groupFor(campaign: string) {
  const p = CAMPAIGNS[campaign]?.steps?.scenes as unknown as { picked?: string; scrubGroups: { id: string; scenes?: { honing?: Record<string, Honing>; chatbots?: { map?: ChatbotT[] } } }[] } | undefined;
  return p?.scrubGroups?.find((x) => x.id === p.picked);
}

export function generateStaticParams() {
  const out: { campaign: string; scene: string }[] = [];
  for (const campaign of campaignsWithScenes())
    for (const b of sceneBranchesFor(campaign)) if (hasFrontDoor(campaign, b.key)) out.push({ campaign, scene: b.key });
  return out;
}
export async function generateMetadata({ params }: { params: Promise<{ campaign: string; scene: string }> }) {
  const { campaign, scene } = await params;
  const b = sceneBranch(campaign, scene);
  return { title: `The Front Door — ${b?.label ?? scene}` };
}

const link = { color: "var(--forest)", fontWeight: 700, textDecoration: "none" } as const;

export default async function FrontDoorPage({ params }: { params: Promise<{ campaign: string; scene: string }> }) {
  const { campaign, scene } = await params;
  const c = CAMPAIGNS[campaign];
  const b = sceneBranch(campaign, scene);
  const g = groupFor(campaign);
  const h = g?.scenes?.honing?.[scene];
  const openings = h?.honed?.["1"]?.openings ?? [];
  if (!c || !b || !openings.length) return <main className="aud-main" style={{ padding: 40 }}><p style={{ color: "var(--margin-ink)" }}>No front door for {scene}. <a href={`/auditions/${campaign}/scenes/${scene}`} style={link}>↑ the scene outline</a></p></main>;
  const cb = g?.scenes?.chatbots?.map ?? [];

  return (
    <main className="aud-main" style={{ padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
        <a href={`/auditions/${campaign}/scenes/${scene}`} style={{ color: "var(--margin-ink)", textDecoration: "none" }}>↑ {b.label} — the scene outline</a>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 26, margin: "0 0 2px", color: "var(--ink)" }}>⛩ The Front Door <span style={{ fontSize: 13, color: "var(--margin-ink)", fontWeight: 400 }}>· <span style={{ textTransform: "capitalize" }}>{b.label}</span> — choose who you meet first</span></h1>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 16 }}>the stage between the <b>prelude</b> (the sell) and the <b>days</b> (the play): the pick forks Day 1, then converges.</div>
      <FrontDoor fd={h?.frontDoor} openings={openings} chatbots={cb} campaign={campaign} door={scene} preludeHref={hasPrelude(campaign, scene) ? `/auditions/${campaign}/scenes/${scene}/prelude` : undefined} />
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ink-soft)", paddingTop: 12, marginTop: 22, fontSize: 13 }}>
        {hasPrelude(campaign, scene) ? <a href={`/auditions/${campaign}/scenes/${scene}/prelude`} style={link}>← the prelude</a> : <a href={`/auditions/${campaign}/scenes/${scene}`} style={link}>← the outline</a>}
        <a href={`/auditions/${campaign}/scenes/${scene}/day/1`} style={link}>Day 1 →</a>
      </div>
    </main>
  );
}
