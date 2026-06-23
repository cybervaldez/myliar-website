// /auditions/<campaign>/scenes/<weather-moment> — ONE scene branch: the weather-moment honed (its palette
// dialed cozy→intense, the tone dial, the cast to polish). A "scene" is a weather-moment (§8.13); the
// TONE is the dial WITHIN it. Branched from the Scenes audition hub. Next 16: params async. NOT canon.
import { SceneBranch, type SceneBranchView } from "../../../Scrubber";
import { DayPlanGraph, type DayPlanT } from "../../../DayPlanGraph";
import { CastProgressMap, type CastArcT } from "../../../CastProgressMap";
import { DirectionMap, type DoorArcT } from "../../../DirectionMap";
import { ChatbotMap, type ChatbotT } from "../../../ChatbotMap";
import { ChatbotArc, type ChatbotArcT } from "../../../ChatbotArc";
import { VisualReveal, type VisualCastT, type VisualAnchorT, type EnsembleHarmonyT } from "../../../VisualReveal";
import { ShadowLane, type ShadowLaneT, type BpmCarrierT } from "../../../ShadowLane";
import { WorldClock, type WorldClockT } from "../../../WorldClock";
import { type OpeningT } from "../../../FrontDoor";
import { DayCoverage } from "../../../DayCoverage";
import { MechanicsCoverage } from "../../../MechanicsCoverage";
import { StatsCoverage, type StatsCoverageT, type EconomyCheckT } from "../../../StatsCoverage";
import { ItemCoverage, type ItemCoverageT } from "../../../ItemCoverage";
import { type DayOutlineT } from "../../../DayOutline";
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

  const p = c.steps.scenes as unknown as { picked?: string; scrubGroups: { id: string; mood?: { characters: { name: string; color: string; is: string; joinsAt: string }[] }; subrange?: { label: string; text: string }[][]; scenes?: { gatedBy?: { age?: string; genre?: string; culture?: string }; premises?: { scene: string; premise: string }[]; honing?: { [k: string]: { castPick?: string; supporting?: string; premiseHoned?: string; review?: string; slot?: { cast: string; role: string; structure: string }; castAudition?: { name: string; fit?: string; note?: string }[]; whyWon?: string; arc?: { winner: string; whyWon?: string; candidates: { arc: string; floor?: string; floor_note?: string; yield?: string; picked?: boolean }[]; variance?: string[] }; checkpoints?: { begin: { text: string; open?: string; rigidity?: string; rigidityWhy?: string; alts?: string[] }; middle: { type: string; turn: string; open?: string; rigidity?: string; rigidityWhy?: string; alts?: { type?: string; turn: string }[] }; end: { text: string; open?: string; rigidity?: string; rigidityWhy?: string; alts?: string[] } }; between?: { span: string; grows?: string; relationship?: string }[]; supportingCast?: { winner: string; whyWon?: string; dynamic?: string; quirk?: string; candidates: { name: string; dynamic?: string; quirk?: string; fit?: string; picked?: boolean }[] }; content?: { beats: { at: string; text: string; grows?: string; bond?: string }[]; review?: { verdict?: string; flag?: string } }; interaction?: { engine?: string; family?: string; gate?: string; gesture?: string; graduates?: string; cg?: string; motion?: string }; rel?: { relTier?: { band?: string; tier?: string; why?: string }; note?: { text?: string; category?: string; weight?: number; path?: string }; cgTaxon?: string; rewardRung?: string }; sensory?: { music?: { register?: string; instruments?: string; soundbed?: string }; object?: { prop?: string; role?: string } } } }; expertsGate?: { name: string; role: string }[]; coverage?: { map?: { scene: string; cast: string; role: string; structure: string }[]; claims?: { cast: string[]; role: string[]; structure: string[] }; conflicts?: { scenes: (string | number)[]; dimension: string; issue: string; resolution: string }[] } } }[] };
  const g = p.scrubGroups.find((x) => x.id === p.picked);
  const characters = g?.mood?.characters ?? [];
  const toneText = g?.subrange?.[idx] ?? [];
  const premise = g?.scenes?.premises?.find((x) => x.scene.toLowerCase() === b.label.toLowerCase())?.premise;
  const honing = g?.scenes?.honing?.[b.key];
  const honedKeys = Object.keys((honing as { honed?: Record<string, unknown> } | undefined)?.honed ?? {});
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
  const view: SceneBranchView = { key: b.key, label: b.label, spark: b.spark, cells: b.cells, characters, toneText, premise, honing, expertsGate, slot, siblingClaims: cov?.claims, conflict: cf ? { dimension: cf.dimension, resolution: cf.resolution } : undefined, castAudition, whyWon: honing?.whyWon, arc: honing?.arc, checkpoints: honing?.checkpoints, between: honing?.between, supportingCast: honing?.supportingCast, content: honing?.content, interaction: honing?.interaction, rel: honing?.rel, sensory: honing?.sensory, gatedBy, paletteUI };
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
      {(() => {
        const pre = (honing as { prelude?: { tagline?: string; angle?: string } } | undefined)?.prelude;
        if (!pre?.tagline) return null;
        const href = `/auditions/${campaign}/scenes/${b.key}/prelude`;
        return (
          <a href={href} style={{ display: "block", border: "1.5px solid var(--forest)", background: "var(--paper-shade)", padding: "9px 13px", marginBottom: 10, marginTop: 14, textDecoration: "none" }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".08em", color: "var(--margin-ink)", textTransform: "uppercase" }}>① the prelude — the book cover (browse / sell)</div>
            <div style={{ fontSize: 13.5, color: "var(--forest)", fontWeight: 700, fontStyle: "italic", margin: "2px 0" }}>&ldquo;{pre.tagline}&rdquo;</div>
            <div style={{ fontSize: 9.5, color: "var(--forest)", fontWeight: 700 }}>▶ read the prelude + the audition →</div>
          </a>
        );
      })()}
      {(() => {
        const openings = ((honing as { honed?: Record<string, { openings?: OpeningT[] }> } | undefined)?.honed?.["1"]?.openings) ?? [];
        if (!openings.length) return null;
        const leads = openings.map((o) => o.lead).filter(Boolean).join(" · ");
        return (
          <a href={`/auditions/${campaign}/scenes/${b.key}/front-door`} style={{ display: "block", border: "1.5px solid var(--forest)", background: "var(--paper-shade)", padding: "9px 13px", marginBottom: 14, textDecoration: "none" }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".08em", color: "var(--margin-ink)", textTransform: "uppercase" }}>② the front door — the pick (a separate stage)</div>
            <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 700, margin: "2px 0" }}>choose who you meet first: <span style={{ color: "var(--forest)" }}>{leads}</span></div>
            <div style={{ fontSize: 9.5, color: "var(--forest)", fontWeight: 700 }}>▶ open the front door + the convergence model →</div>
          </a>
        );
      })()}
      {(honing as { dayPlan?: DayPlanT } | undefined)?.dayPlan && <DayPlanGraph plan={(honing as unknown as { dayPlan: DayPlanT }).dayPlan} campaign={campaign} door={b.key} honedDays={honedKeys} hideDayList />}
      {(() => { const ol = (honing as { dayOutline?: Record<string, DayOutlineT> } | undefined)?.dayOutline; return ol && Object.keys(ol).length ? <DayCoverage outline={ol} campaign={campaign} door={b.key} honedDays={honedKeys} /> : null; })()}
      {(() => { const mc = (honing as { mechanicsCheck?: { rows?: { mechanic: string; scope: string; status: string; where: string }[]; gaps?: number; ok?: number; na?: number } } | undefined)?.mechanicsCheck; return mc?.rows?.length ? <MechanicsCoverage check={mc} /> : null; })()}
      {(() => { const sv = (honing as { statsCoverage?: StatsCoverageT; economyCheck?: EconomyCheckT } | undefined); return sv?.statsCoverage?.axes?.length ? <StatsCoverage cov={sv.statsCoverage} check={sv.economyCheck} /> : null; })()}
      {(() => { const ic = (honing as { itemCoverage?: ItemCoverageT } | undefined)?.itemCoverage; return (ic?.items?.length || ic?.matrix?.length) ? <ItemCoverage cov={ic} /> : null; })()}
      {(honing as { doorArc?: DoorArcT } | undefined)?.doorArc && <DirectionMap arc={(honing as unknown as { doorArc: DoorArcT }).doorArc} focal={pickName} />}
      {(() => { const pa = (g?.scenes as { progressArcs?: { map: CastArcT[]; range?: string } } | undefined)?.progressArcs; return pa?.map?.length ? <CastProgressMap arcs={pa.map} focal={pickName} range={pa.range} /> : null; })()}
      {(() => {
        const na = (g?.scenes as { chatbots?: { namingAnchor?: { anchor?: string; rule?: string; names?: { handle?: string; name?: string; ambiguous?: boolean; resonance?: string }[] } } } | undefined)?.chatbots?.namingAnchor;
        if (!na?.names?.length) return null;
        return (
          <div style={{ border: "1px solid var(--ink-soft)", background: "var(--paper-shade)", padding: "8px 12px", marginTop: 18 }}>
            <div style={{ fontSize: 11.5, color: "var(--ink)", fontWeight: 700 }}>🏷 THE CAST NAMES <span style={{ fontSize: 9.5, color: "var(--margin-ink)", fontWeight: 400 }}>— the name humanizes; the handle carries the metaphor</span></div>
            {na.rule && <div style={{ fontSize: 9.5, color: "var(--margin-ink)", fontStyle: "italic", margin: "1px 0 4px" }}>{na.rule}</div>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px", fontSize: 10.5, color: "var(--ink-soft)" }}>
              {na.names.map((n, i) => <span key={i}><b style={{ color: "var(--forest)" }}>{n.name}</b>{n.ambiguous ? <span style={{ fontSize: 8, color: "var(--margin-ink)" }}> ⚥</span> : null} <span style={{ color: "var(--margin-ink)" }}>— {n.handle}{n.resonance && !/^none/i.test(n.resonance) ? ` · ${n.resonance}` : ""}</span></span>)}
            </div>
          </div>
        );
      })()}
      {(() => { const cb = (g?.scenes as { chatbots?: { map: ChatbotT[]; range?: string } } | undefined)?.chatbots; return cb?.map?.length ? <ChatbotMap bots={cb.map} focal={pickName} range={cb.range} /> : null; })()}
      {(() => { const ca = (honing as { chatbotArc?: ChatbotArcT } | undefined)?.chatbotArc; return (ca?.focal?.microArc?.length || ca?.cast?.length) ? <ChatbotArc arc={ca} /> : null; })()}
      {(() => { const cbs = (g?.scenes as { chatbots?: { map?: VisualCastT[]; visualAnchor?: VisualAnchorT; ensembleHarmony?: EnsembleHarmonyT } } | undefined)?.chatbots; return cbs?.map?.some((c) => c.vitals) ? <VisualReveal cast={cbs.map} anchor={cbs.visualAnchor} harmony={cbs.ensembleHarmony} /> : null; })()}
      {(() => { const wc = (honing as { worldClock?: WorldClockT } | undefined)?.worldClock; return wc?.crossing?.length ? <WorldClock clock={wc} /> : null; })()}
      {(() => { const sl = (honing as { shadowLane?: ShadowLaneT; bpmCarrier?: BpmCarrierT } | undefined); return (sl?.shadowLane || sl?.bpmCarrier) ? <ShadowLane lane={sl.shadowLane} bpm={sl.bpmCarrier} /> : null; })()}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ink-soft)", paddingTop: 12, marginTop: 20, fontSize: 13 }}>
        {prev ? <a href={`/auditions/${campaign}/scenes/${prev.key}`} style={link}>← {prev.label}</a> : <a href={`/auditions/${campaign}/scenes`} style={link}>← the hub</a>}
        {(honing as { prelude?: { tagline?: string } } | undefined)?.prelude?.tagline
          ? <a href={`/auditions/${campaign}/scenes/${b.key}/prelude`} style={link}>▶ the prelude →</a>
          : next ? <a href={`/auditions/${campaign}/scenes/${next.key}`} style={link}>{next.label} →</a> : <span style={{ color: "var(--margin-ink)" }}>last moment</span>}
      </div>
    </main>
  );
}
