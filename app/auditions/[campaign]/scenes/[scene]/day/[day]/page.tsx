// /auditions/<campaign>/scenes/<door>/day/<n> — ONE day of the campaign = ONE real-life day of gameplay.
// The SCENE page is the OUTLINE (the spec); THIS is the honed gameplay authored from it. Day 1 is the
// convergent fan (the front-door character pick → multiple openings, converging before the middle); Day 2+
// is the shared spine (you bump into the rest of the crew). NOT canon.
import { DayHoning, type HonedDayT } from "../../../../../DayHoning";
import { type DayOutlineT } from "../../../../../DayOutline";
import { WorldClock, type WorldClockT } from "../../../../../WorldClock";
import { CAMPAIGNS, campaignsWithScenes, sceneBranchesFor, sceneBranch } from "../../../../../registry";

type Honing = { dayPlan?: { door?: string; tone?: string; fundamental?: { length?: number; days?: DayGrid[] }; ngPlus?: { length?: number; days?: DayGrid[] } }; honed?: Record<string, HonedDayT>; dayOutline?: Record<string, DayOutlineT>; worldClock?: WorldClockT };
type DayGrid = { n: number; phase: string; bpm: number; relTier: string; tierUp?: boolean; beat?: string; noteCat?: string };

function honingFor(campaign: string, sceneKey: string): Honing | undefined {
  const p = CAMPAIGNS[campaign]?.steps?.scenes as unknown as { picked?: string; scrubGroups: { id: string; scenes?: { honing?: Record<string, Honing> } }[] } | undefined;
  const g = p?.scrubGroups?.find((x) => x.id === p.picked);
  return g?.scenes?.honing?.[sceneKey];
}
const totalDays = (h?: Honing) => h?.dayPlan ? (h.dayPlan.fundamental?.length ?? 7) + (h.dayPlan.ngPlus?.length ?? 0) : 0;

export function generateStaticParams() {
  const out: { campaign: string; scene: string; day: string }[] = [];
  for (const campaign of campaignsWithScenes())
    for (const b of sceneBranchesFor(campaign)) {
      const n = totalDays(honingFor(campaign, b.key));
      for (let i = 1; i <= n; i++) out.push({ campaign, scene: b.key, day: String(i) });
    }
  return out;
}
export async function generateMetadata({ params }: { params: Promise<{ campaign: string; scene: string; day: string }> }) {
  const { campaign, scene, day } = await params;
  const b = sceneBranch(campaign, scene);
  return { title: `Day ${day} — ${b?.label ?? scene}` };
}

const link = { color: "var(--forest)", fontWeight: 700, textDecoration: "none" } as const;

export default async function DayPage({ params }: { params: Promise<{ campaign: string; scene: string; day: string }> }) {
  const { campaign, scene, day } = await params;
  const c = CAMPAIGNS[campaign];
  const b = sceneBranch(campaign, scene);
  const h = honingFor(campaign, scene);
  const n = Number(day);
  if (!c || !b || !h?.dayPlan) return <main className="aud-main" style={{ padding: 40 }}><p style={{ color: "var(--margin-ink)" }}>No day {day}. <a href={`/auditions/${campaign}/scenes/${scene}`} style={link}>↑ the scene outline</a></p></main>;
  const total = totalDays(h);
  const all = [...(h.dayPlan.fundamental?.days ?? []), ...(h.dayPlan.ngPlus?.days ?? [])];
  const slot = all.find((x) => x.n === n);
  const honed = h.honed?.[day];
  const isNg = slot?.phase === "ng+";
  const isConverge = n === 1;

  return (
    <main className="aud-main" style={{ padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, marginBottom: 4 }}>
        <a href={`/auditions/${campaign}/scenes/${scene}`} style={{ color: "var(--margin-ink)", textDecoration: "none" }}>↑ {b.label} — the scene outline</a>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--spot-red)", fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 26, margin: "0 0 2px", color: "var(--ink)" }}>Day {n} <span style={{ fontSize: 13, color: "var(--margin-ink)", fontWeight: 400 }}>of <span style={{ textTransform: "capitalize" }}>{b.label}</span> {isNg && <b style={{ color: "#7a5b9a" }}>· the experienced continuation</b>}</span></h1>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 4 }}>
        one real-life day of the campaign · {slot ? `${slot.phase} · ${slot.relTier} · bpm ~${slot.bpm}${slot.beat ? ` · ${slot.beat}` : ""}` : "—"}
      </div>
      {isConverge && <div style={{ fontSize: 11, color: "#4a6b8a", marginBottom: 14, lineHeight: 1.5 }}>⛩ the front-door <b>character pick</b> forks Day 1 into per-lead openings (the <i>multiplayer</i> signal — who chose which path) → they <b>converge before the middle</b>; from Day 2 on you bump into the rest of the crew on the shared spine.</div>}

      {honed ? <DayHoning day={honed} n={n} /> : (
        <div style={{ border: "2px dashed var(--ink-soft)", padding: "14px 18px", marginTop: 12, color: "var(--margin-ink)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>not yet honed</div>
          <div style={{ fontSize: 11.5, lineHeight: 1.6, marginTop: 4 }}>{h.dayOutline?.[day] ? <>This day&rsquo;s honing <b style={{ color: "var(--ink)" }}>expands its micro-arc outline</b> (see the <a href={`/auditions/${campaign}/scenes/${scene}`} style={link}>scene outline</a> → the day-by-day coverage) into full dialogues / choices / CG / the note.</> : <>Outline slot (from the grid): <b style={{ color: "var(--ink)" }}>{slot?.phase}</b> · target REL <b style={{ color: "var(--ink)" }}>{slot?.relTier}</b> · felt bpm ~{slot?.bpm} · owes a <b>{slot?.noteCat || "note"}</b>{slot?.beat ? <> · the beat: <i>{slot.beat}</i></> : null}.</>} Author it via the honing pass (`day-author` → writers-room + visual · `day-social` → community-manager).</div>
        </div>
      )}

      {h.worldClock?.crossing?.length ? (
        <WorldClock clock={h.worldClock}
          dayAnchor={{ n, phase: slot?.phase, bpm: slot?.bpm, relTier: slot?.relTier, premise: h.dayOutline?.[day]?.premise }}
          horizonSide={n <= 2 ? "from" : n === (h.dayPlan?.fundamental?.length ?? 7) ? "toward" : undefined} />
      ) : null}

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ink-soft)", paddingTop: 12, marginTop: 22, fontSize: 13 }}>
        {n > 1 ? <a href={`/auditions/${campaign}/scenes/${scene}/day/${n - 1}`} style={link}>← Day {n - 1}</a> : <a href={`/auditions/${campaign}/scenes/${scene}`} style={link}>← the outline</a>}
        {n < total ? <a href={`/auditions/${campaign}/scenes/${scene}/day/${n + 1}`} style={link}>Day {n + 1} →</a> : <span style={{ color: "var(--margin-ink)" }}>graduation</span>}
      </div>
    </main>
  );
}
