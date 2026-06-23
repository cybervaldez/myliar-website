// /auditions/<campaign>/prequel — THE PREQUEL: a short OPTIONAL companion story about the crew BEFORE the MC
// joins (a "textbook", not a campaign; not a prerequisite). Campaign-level; linked BEFORE the prelude. NOT canon.
import { Prequel, type PrequelT } from "../../Prequel";
import { CAMPAIGNS, campaignKeys } from "../../registry";

function prequelFor(campaign: string): PrequelT | undefined {
  const p = CAMPAIGNS[campaign]?.steps?.scenes as unknown as { picked?: string; scrubGroups?: { id: string; scenes?: { prequel?: PrequelT } }[] } | undefined;
  return p?.scrubGroups?.find((x) => x.id === p?.picked)?.scenes?.prequel;
}

export function generateStaticParams() {
  return campaignKeys().filter((c) => prequelFor(c)?.chapters?.length).map((campaign) => ({ campaign }));
}
export async function generateMetadata({ params }: { params: Promise<{ campaign: string }> }) {
  const { campaign } = await params;
  return { title: `${prequelFor(campaign)?.title ?? "The Prequel"} — ${CAMPAIGNS[campaign]?.label ?? campaign}` };
}

const link = { color: "var(--forest)", fontWeight: 700, textDecoration: "none" } as const;

export default async function PrequelPage({ params }: { params: Promise<{ campaign: string }> }) {
  const { campaign } = await params;
  const c = CAMPAIGNS[campaign];
  const pq = prequelFor(campaign);
  if (!c || !pq?.chapters?.length) return <main className="aud-main" style={{ padding: 40 }}><p style={{ color: "var(--margin-ink)" }}>No prequel for {campaign}. <a href={`/auditions/${campaign}`} style={link}>↑ the campaign</a></p></main>;

  return (
    <main className="aud-main" style={{ padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 12 }}>
        <a href={`/auditions/${campaign}/scenes`} style={{ color: "var(--margin-ink)", textDecoration: "none" }}>↑ {c.label} — the scenes hub</a>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <Prequel prequel={pq} />
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ink-soft)", paddingTop: 12, marginTop: 24, fontSize: 13, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
        <a href={`/auditions/${campaign}/scenes`} style={link}>← the scenes</a>
        <span style={{ color: "var(--margin-ink)", fontStyle: "italic", fontSize: 11 }}>an optional companion — read it any time, or not at all (never a prerequisite)</span>
      </div>
    </main>
  );
}
