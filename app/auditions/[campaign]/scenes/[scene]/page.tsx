// /auditions/<campaign>/scenes/<weather-moment> — ONE scene branch: the weather-moment honed (its palette
// dialed cozy→intense, the tone dial, the cast to polish). A "scene" is a weather-moment (§8.13); the
// TONE is the dial WITHIN it. Branched from the Scenes audition hub. Next 16: params async. NOT canon.
import { SceneBranch, type SceneBranchView } from "../../../Scrubber";
import { CAMPAIGNS, campaignsWithScenes, sceneBranchesFor, sceneBranch, stepNo } from "../../../registry";

export function generateStaticParams() {
  const out: { campaign: string; scene: string }[] = [];
  for (const campaign of campaignsWithScenes()) for (const b of sceneBranchesFor(campaign)) out.push({ campaign, scene: b.key });
  return out;
}
export async function generateMetadata({ params }: { params: Promise<{ campaign: string; scene: string }> }) {
  const { campaign, scene } = await params;
  const b = sceneBranch(campaign, scene);
  return { title: `${b?.label ?? scene} — ${CAMPAIGNS[campaign]?.label ?? "Scenes"}` };
}

const link = { color: "var(--forest)", fontWeight: 700, textDecoration: "none" } as const;

export default async function SceneBranchPage({ params }: { params: Promise<{ campaign: string; scene: string }> }) {
  const { campaign, scene } = await params;
  const c = CAMPAIGNS[campaign];
  const branches = sceneBranchesFor(campaign);
  const idx = branches.findIndex((x) => x.key === scene);
  const b = idx >= 0 ? branches[idx] : null;
  if (!c || !b) return <main className="aud-main" style={{ padding: 40 }}><p style={{ color: "var(--margin-ink)" }}>No scene “{scene}” for {campaign}. <a href={`/auditions/${campaign}/scenes`} style={link}>↑ the scenes hub</a></p></main>;

  const p = c.steps.scenes as unknown as { picked?: string; scrubGroups: { id: string; mood?: { characters: { name: string; color: string; is: string; joinsAt: string }[] }; subrange?: { label: string; text: string }[][]; scenes?: { gatedBy?: { age?: string; genre?: string; culture?: string }; premises?: { scene: string; premise: string }[]; honing?: { [k: string]: { castPick?: string; supporting?: string; premiseHoned?: string; review?: string; slot?: { cast: string; role: string; structure: string }; castAudition?: { name: string; fit?: string; note?: string }[]; whyWon?: string; arc?: { winner: string; whyWon?: string; candidates: { arc: string; floor?: string; floor_note?: string; yield?: string; picked?: boolean }[]; variance?: string[] }; checkpoints?: { begin: { text: string; open?: string; rigidity?: string; rigidityWhy?: string; alts?: string[] }; middle: { type: string; turn: string; open?: string; rigidity?: string; rigidityWhy?: string; alts?: { type?: string; turn: string }[] }; end: { text: string; open?: string; rigidity?: string; rigidityWhy?: string; alts?: string[] } }; between?: { span: string; grows?: string; relationship?: string }[]; supportingCast?: { winner: string; whyWon?: string; dynamic?: string; quirk?: string; candidates: { name: string; dynamic?: string; quirk?: string; fit?: string; picked?: boolean }[] }; content?: { beats: { at: string; text: string; grows?: string; bond?: string }[]; review?: { verdict?: string; flag?: string } }; interaction?: { engine?: string; gesture?: string; cg?: string; motion?: string }; rel?: { relTier?: { band?: string; tier?: string; why?: string }; note?: { text?: string; category?: string; weight?: number; path?: string }; cgTaxon?: string; rewardRung?: string } } }; expertsGate?: { name: string; role: string }[]; coverage?: { map?: { scene: string; cast: string; role: string; structure: string }[]; claims?: { cast: string[]; role: string[]; structure: string[] }; conflicts?: { scenes: (string | number)[]; dimension: string; issue: string; resolution: string }[] } } }[] };
  const g = p.scrubGroups.find((x) => x.id === p.picked);
  const characters = g?.mood?.characters ?? [];
  const toneText = g?.subrange?.[idx] ?? [];
  const premise = g?.scenes?.premises?.find((x) => x.scene.toLowerCase() === b.label.toLowerCase())?.premise;
  const honing = g?.scenes?.honing?.[b.key];
  const expertsGate = g?.scenes?.expertsGate;
  const cov = g?.scenes?.coverage;
  const slot = honing?.slot ?? cov?.map?.find((m) => m.scene.toLowerCase() === b.label.toLowerCase());
  const cf = cov?.conflicts?.find((x) => (x.scenes || []).map(String).includes(String(idx + 1)));
  const norm = (s: string) => (s || "").toLowerCase().replace(/^the\s+/, "").trim();
  const pickName = norm((honing?.castPick || "").split("—")[0]);
  const castAudition = (honing?.castAudition || []).map((cc) => ({ name: cc.name, fit: cc.fit, note: cc.note, picked: norm(cc.name) === pickName }));
  const gb = g?.scenes?.gatedBy;
  const gatedBy = gb ? [gb.age && `🎯 ${gb.age}`, gb.genre && `📐 ${gb.genre}`, gb.culture && `🎨 ${gb.culture}`].filter(Boolean).join(" · ") : undefined;
  const paletteUI = (g?.scenes as { paletteUI?: { [k: string]: SceneBranchView["paletteUI"] } } | undefined)?.paletteUI?.[b.key];
  const view: SceneBranchView = { key: b.key, label: b.label, spark: b.spark, cells: b.cells, characters, toneText, premise, honing, expertsGate, slot, siblingClaims: cov?.claims, conflict: cf ? { dimension: cf.dimension, resolution: cf.resolution } : undefined, castAudition, whyWon: honing?.whyWon, arc: honing?.arc, checkpoints: honing?.checkpoints, between: honing?.between, supportingCast: honing?.supportingCast, content: honing?.content, interaction: honing?.interaction, rel: honing?.rel, gatedBy, paletteUI };
  const prev = idx > 0 ? branches[idx - 1] : null;
  const next = idx < branches.length - 1 ? branches[idx + 1] : null;

  return (
    <main className="aud-main" style={{ padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
        <a href={`/auditions/${campaign}/scenes`} style={{ color: "var(--margin-ink)", textDecoration: "none" }}>↑ {stepNo("scenes")} the scenes hub</a>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 24, margin: "0 0 2px", color: "var(--ink)", textTransform: "capitalize" }}>{b.label} <span style={{ fontFamily: "monospace", fontSize: 14, color: "var(--margin-ink)" }}>{b.spark}</span></h1>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 16 }}>a weather-moment of <a href={`/auditions/${campaign}/scenes`} style={link}>{c.label}</a> — honed individually, the tone dialed within.</div>
      <SceneBranch b={view} campaign={campaign} />
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ink-soft)", paddingTop: 12, marginTop: 20, fontSize: 13 }}>
        {prev ? <a href={`/auditions/${campaign}/scenes/${prev.key}`} style={link}>← {prev.label}</a> : <a href={`/auditions/${campaign}/scenes`} style={link}>← the hub</a>}
        {next ? <a href={`/auditions/${campaign}/scenes/${next.key}`} style={link}>{next.label} →</a> : <span style={{ color: "var(--margin-ink)" }}>last moment</span>}
      </div>
    </main>
  );
}
