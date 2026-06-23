// THE DAY-PLAN GRAPH — per STORY-DOOR (REFRAMED 2026-06-22). Each weather-moment is an isolated arc:
// D1–7 = the FUNDAMENTAL (learning/training, a complete autonomous bond), then D8+ = the EXPERIENCED
// CONTINUATION (NG+ folded into the arc — shorter, a new story, climbing the REL the fundamental misses to
// Unspoken). The Day-1 LOCKED DOOR (the MC's weakness → the KEY → the flag → CHAOTIC→COMPOSED) gates D8+;
// the big reward is additional CONTEXT fed to the chatbot (the chat is the destination). Lives on the scene
// branch (honing[<door>].dayPlan). NOT canon.

export type DayPlanT = {
  reframed?: string; door: string; tone: string; focal: string;
  fundamental: { length: number; split: { begin: number; middle: number; end: number }; wall: number; midpoint: number; graduation: number; restBpm: number; peakBpm: number; completeBond: string;
    days: { n: number; phase: string; bpm: number; relTier: string; relTierNo: number; tierUp: boolean; beat: string; noteOwed: boolean; noteCat: string }[] };
  lockedDoor: { is: string; weakness: string; unlock: string; onSelect: string };
  ngPlus: { label: string; length: number; opensVia: string; tieToDay1: string; reward: string; relCompletes: string; composed: string;
    days: { n: number; phase: string; bpm: number; relTier: string; relTierNo: number; tierUp: boolean; beat: string; experienced?: boolean; noteOwed: boolean; noteCat: string }[] };
  micros: { floor: number; optionalBudget: number; ngPlus: number; note: string };
  wake: { shared: string; floors: string };
  inherits?: Record<string, string>;
};

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", red = "var(--spot-red)", amber = "#c08a2e", violet = "#7a5b9a", paper = "var(--paper)", shade = "var(--paper-shade)";
const PHASE = {
  begin: { c: forest, bg: "rgba(45,74,43,.07)" }, middle: { c: amber, bg: "rgba(192,138,46,.09)" },
  end: { c: "#4a6b8a", bg: "rgba(74,107,138,.09)" }, "ng+": { c: violet, bg: "rgba(122,91,154,.10)" },
} as const;

export function DayPlanGraph({ plan, campaign, door, honedDays, hideDayList }: { plan: DayPlanT; campaign?: string; door?: string; honedDays?: string[]; hideDayList?: boolean }) {
  const F = plan.fundamental, NG = plan.ngPlus;
  const days = [...F.days, ...(NG.days ?? [])], N = days.length;
  const lo = Math.min(...days.map((d) => d.bpm)) - 6, hi = Math.max(...days.map((d) => d.bpm)) + 4;
  const xOf = (n: number) => ((n - 1) / (N - 1)) * 100;
  const yOf = (bpm: number) => 54 - ((bpm - lo) / (hi - lo)) * 48;
  const curve = days.map((d) => `${xOf(d.n).toFixed(2)},${yOf(d.bpm).toFixed(2)}`).join(" ");
  const ngStart = F.length + 1;                       // D8 — where the experienced continuation begins

  return (
    <section style={{ marginTop: 22, borderTop: `2px solid ${forest}`, paddingTop: 14 }}>
      <h2 style={{ fontSize: 16, color: ink, margin: "0 0 2px" }}>🗺 THE ARC <span style={{ fontSize: 11, color: margin, fontWeight: 400 }}>— an isolated story-door · {plan.tone} · 👤 {plan.focal || "—"}</span></h2>
      <p style={{ fontSize: 11, color: soft, lineHeight: 1.5, margin: "0 0 12px" }}><b>D1–{F.length}</b> = the fundamental (learning/training → a complete autonomous bond) · <b style={{ color: violet }}>D{ngStart}+</b> = the experienced continuation (a new, shorter story; the locked path + the situation carry). <span style={{ color: margin, fontStyle: "italic" }}>The grid is generated; honed day-by-day.</span></p>

      {/* THE BPM CURVE — the fundamental rests-at-tone then spikes at the Wall; D8+ runs calmer (the experienced MC) */}
      <div style={{ border: `2px solid ${soft}`, background: paper, padding: "9px 6px 3px" }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", color: margin, padding: "0 8px 2px" }}>THE FELT HEARTBEAT <span style={{ fontWeight: 400, fontStyle: "italic" }}>— rests at this door&rsquo;s tone (~{F.restBpm}), spikes once at the Wall (~{F.peakBpm}); D{ngStart}+ runs composed</span></div>
        <svg viewBox="0 0 100 56" preserveAspectRatio="none" style={{ width: "100%", height: 60, display: "block" }}>
          {(["begin", "middle", "end", "ng+"] as const).map((ph) => { const ds = days.filter((d) => d.phase === ph); if (!ds.length) return null; return <rect key={ph} x={xOf(ds[0].n)} y="0" width={Math.max(0.1, xOf(ds[ds.length - 1].n) - xOf(ds[0].n))} height="56" fill={PHASE[ph].bg} />; })}
          <line x1={xOf(F.wall)} y1="0" x2={xOf(F.wall)} y2="56" stroke={red} strokeWidth="0.6" strokeDasharray="2 1.5" />
          <line x1={xOf(ngStart) - 0.3} y1="0" x2={xOf(ngStart) - 0.3} y2="56" stroke={violet} strokeWidth="0.6" />
          <polyline points={curve} fill="none" stroke={forest} strokeWidth="1" strokeLinejoin="round" />
          {days.map((d) => <circle key={d.n} cx={xOf(d.n)} cy={yOf(d.bpm)} r={d.n === F.wall ? 1.6 : 0.9} fill={d.n === F.wall ? red : d.phase === "ng+" ? violet : forest} />)}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: margin, padding: "0 8px" }}><span>D1 — the door</span><span style={{ color: red }}>▲ Wall (D{F.wall})</span><span style={{ color: violet }}>D{ngStart}+ experienced → Unspoken</span></div>
      </div>

      {/* THE DAYS — each links to its own gameplay SUBPAGE (1 day = 1 real-life day). Hidden on the outline
          page (the DAY-BY-DAY MICRO-ARC OUTLINE / DayCoverage carries the day-by-day there, no redundancy). */}
      {!hideDayList && (<>
      <div style={{ fontSize: 9, color: margin, padding: "5px 11px 0", fontStyle: "italic" }}>each day is one real-life day → its own page · D1 forks by front-door pick, converging before the middle</div>
      <div style={{ border: `2px solid ${soft}`, borderTop: "none" }}>
        {days.map((d) => { const ph = PHASE[d.phase as keyof typeof PHASE] ?? PHASE.begin; const hot = d.n === F.wall || d.n === F.graduation || d.n === 1 || d.n === ngStart || d.n === N;
          const isHoned = honedDays?.includes(String(d.n));
          const href = campaign && door ? `/auditions/${campaign}/scenes/${door}/day/${d.n}` : undefined;
          const style = { display: "flex", alignItems: "center", gap: 9, padding: "4px 11px", fontSize: 11, borderTop: d.n === ngStart ? `2px solid ${violet}` : `1px solid rgba(0,0,0,.06)`, background: hot ? (d.phase === "ng+" ? "rgba(122,91,154,.08)" : "rgba(184,31,28,.05)") : ph.bg, textDecoration: "none", color: "inherit" } as const;
          const inner = (<>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: ph.c, fontWeight: 700, minWidth: 30 }}>D{d.n}</span>
            <span style={{ minWidth: 150, color: d.tierUp ? (d.phase === "ng+" ? violet : forest) : soft, fontWeight: d.tierUp ? 700 : 400 }}>{d.tierUp ? "↑ " : ""}{d.relTier}</span>
            {d.beat ? <span style={{ color: hot ? (d.phase === "ng+" ? violet : red) : margin, fontWeight: hot ? 700 : 400, fontStyle: hot ? "normal" : "italic", fontSize: 10.5 }}>{d.beat}</span> : <span style={{ color: margin, fontSize: 10, opacity: .6 }}>· a note ({d.noteCat})</span>}
            <span style={{ marginLeft: "auto", fontSize: 9, color: isHoned ? forest : margin, fontWeight: 700 }}>{isHoned ? "honed ✓" : "→"}</span>
          </>);
          return href ? <a key={d.n} href={href} style={style}>{inner}</a> : <div key={d.n} style={style}>{inner}</div>;
        })}
      </div>
      </>)}

      {/* THE LOCKED DOOR — the weakness → the KEY → the flag → D8+ */}
      <div style={{ border: `2px solid ${red}`, borderTop: "none", background: shade, padding: "9px 13px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", color: red }}>🔒 THE DAY-1 LOCKED DOOR <span style={{ fontWeight: 400, color: margin, fontStyle: "italic" }}>— the MC&rsquo;s weakness made a door (storyline, NOT FOMO)</span></div>
        <ol style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 10.5, color: soft, lineHeight: 1.55 }}>
          <li>finish D{F.length} → an achievement grants a <b style={{ color: ink }}>KEY</b> (its description calls back to Day 1)</li>
          <li>the key opens the door → selecting it grants a 2nd achievement = the <b style={{ color: ink }}>universal flag</b></li>
          <li>the flag opens the <b style={{ color: violet }}>experienced continuation (D{ngStart}+)</b> · paths read clearer · <b style={{ color: amber }}>CHAOTIC → COMPOSED</b></li>
        </ol>
      </div>

      {/* THE D8+ PAYOFF + THE WAKE */}
      <div style={{ display: "flex", flexWrap: "wrap", border: `2px solid ${soft}`, borderTop: "none" }}>
        <div style={{ flex: "1 1 260px", padding: "9px 13px", borderRight: `1px solid ${soft}`, background: "rgba(122,91,154,.05)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: violet }}>↻ D{ngStart}+ — the experienced continuation <span style={{ fontWeight: 400, color: margin }}>(+{NG.length} days)</span></div>
          <div style={{ fontSize: 10, color: ink, lineHeight: 1.5, marginTop: 3 }}><b>The big reward:</b> {NG.reward}.</div>
          <div style={{ fontSize: 9.5, color: soft, lineHeight: 1.45, marginTop: 3 }}>{NG.relCompletes}.</div>
          <div style={{ fontSize: 9.5, color: margin, lineHeight: 1.45, marginTop: 3, fontStyle: "italic" }}>{NG.tieToDay1}.</div>
        </div>
        <div style={{ flex: "1 1 220px", padding: "9px 13px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: forest }}>〜 THE WAKE</div>
          <div style={{ fontSize: 10, color: soft, lineHeight: 1.5, marginTop: 3 }}>{plan.wake.shared}.</div>
          <div style={{ fontSize: 9.5, color: margin, lineHeight: 1.45, marginTop: 3, fontStyle: "italic" }}>{plan.wake.floors}.</div>
        </div>
      </div>
    </section>
  );
}
