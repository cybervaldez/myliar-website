// /auditions — THE OVERVIEW (restarted from concept, 2026-06-14). The single page got too long, so
// each audition step now has its OWN page (concept · pilot · destination …) and carries the previous
// steps' experts forward. This index is the SPINE: the ELI5, the method (§8.17, no-pick), and the
// pipeline of steps — each card links to its page and shows the gem it carries to the next. NOT canon.
import concepts from "./concepts.json";
import pilot from "./pilot.json";
import destination from "./destination.json";

export const metadata = { title: "Auditions — the pipeline", description: "The audition pipeline, restarted from concept: one page per step, experts carried forward." };

const TARGET = ["anxious", "low_worth", "adhd", "iyashikei_fan"];
const LEGV: Record<string, number> = { "load-bearing": 1, hairline: 0.5, hollow: 0 };
const SW: Record<string, number> = { feelsSafe: 3, destination: 3, struggle: 3, relate: 2, mechanics: 2, cast: 1.5, cast_voice: 1.5, sustain: 1.5, motif_title: 1 };
const starStr = (n: number) => "★".repeat(Math.floor(n)) + (n % 1 ? "½" : "") + "☆".repeat(Math.max(0, 5 - Math.ceil(n)));
type Any = { results: Record<string, { index: number; relate: number; feelsSafe: number }[]>; legs: Record<string, { index: number; canBuild: string }[]> };
function topOf(D: Any, items: { title: string }[]) {
  const LEGK = Object.keys(D.legs || {});
  const star = (i: number) => {
    const get = (p: string) => (D.results[p] || []).find((r) => r.index === i);
    const avg = (k: "relate" | "feelsSafe") => TARGET.reduce((s, p) => s + (get(p)?.[k] ?? 0), 0) / TARGET.length;
    let num = SW.relate * (avg("relate") / 5) + SW.feelsSafe * (avg("feelsSafe") / 5), den = SW.relate + SW.feelsSafe;
    for (const e of LEGK) { num += (SW[e] ?? 1) * LEGV[(D.legs[e] || []).find((r) => r.index === i)?.canBuild ?? "hollow"]; den += SW[e] ?? 1; }
    return Math.round((num / den) * 10) / 2;
  };
  return items.map((it, k) => ({ title: it.title, star: star(k + 1) })).sort((a, b) => b.star - a.star)[0];
}

const cTop = topOf(concepts as Any, (concepts as { concepts: { t2: string }[] }).concepts.map((c) => ({ title: c.t2 })));
const pTop = topOf(pilot as Any, (pilot as { pilots: { title: string }[] }).pilots);
const dTop = topOf(destination as Any, (destination as { destinations: { title: string }[] }).destinations);

const ink = "var(--ink)", soft = "var(--ink-soft)", paper = "var(--paper)", shade = "var(--paper-shade)", forest = "var(--forest)", margin = "var(--margin-ink)", red = "var(--spot-red)", amber = "#c08a2e";

const STEPS = [
  { n: "①", href: "/auditions/concept", label: "The Concept", done: true, head: `“${cTop.title}” — THE FERRY`, star: cTop.star, carries: "◆ the calm risks a passive struggle (struggle + mechanics hairline) → an internal letting-go" },
  { n: "②", href: "/auditions/pilot", label: "The Pilot", done: true, head: `“${pTop.title}”`, star: pTop.star, carries: "the “logged at full weight” WITNESS tone turned the struggle load-bearing → a coach who witnesses without grading" },
  { n: "③", href: "/auditions/destination", label: "The Destination", done: true, head: `“${dTop.title}”`, star: dTop.star, carries: "the witness becomes an EQUAL (he shows what HE carried) → the rel-ladder + reward build toward that turn" },
  { n: "④", href: null, label: "The Struggle", done: false, head: "the internal letting-go — next", star: 0, carries: "" },
];

export default function AuditionsOverview() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 10, letterSpacing: ".14em", color: forest, fontFamily: "var(--theme-body)", fontWeight: 700 }}>RESTARTED FROM CONCEPT · 2026-06-14</span>
        <span style={{ fontSize: 10, letterSpacing: ".12em", color: red, fontFamily: "var(--theme-body)", fontWeight: 700 }}>NOT CANON</span>
      </div>
      <h1 style={{ fontSize: 30, margin: "4px 0 2px", color: ink }}>The Auditions</h1>
      <p style={{ fontSize: 13, color: soft, lineHeight: 1.55, margin: "0 0 20px" }}>Building one cozy story — <b style={{ color: ink }}>THE FERRY</b> — one step at a time. Each step auditions a few options, then carries its experts to the next page.</p>

      <div style={{ border: `2px solid ${forest}`, background: shade, padding: "14px 16px", marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: forest, marginBottom: 7 }}>ELI5 — HOW TO READ THIS</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: ink, lineHeight: 1.62 }}>
          <li>Every option is shown to the same <b>blind audience</b> — people with anxiety · ADHD · low self-worth · cozy fans (plus one thrill-seeker as a “this should bore them” control).</li>
          <li>It’s also shown to the <b>future build-steps</b> (destination, struggle, cast…), who each leave a note: <i>“can I build on this?”</i> — <span style={{ color: forest }}>load-bearing</span> · <span style={{ color: amber }}>hairline</span> · <span style={{ color: red }}>hollow</span>.</li>
          <li><b>Nobody gets crowned.</b> Each option’s strengths get <span style={{ color: forest }}>↑ reinforced</span>; its weakness is the <span style={{ color: amber }}>◆ gem</span> we fix on the next page. The weakness is the point.</li>
          <li>The <b style={{ color: amber }}>★ build-value</b> star is one number weighted by what matters most to our mechanics (feels-safe, the destination, the struggle weigh heaviest).</li>
        </ul>
      </div>

      <div style={{ fontSize: 11, color: margin, lineHeight: 1.5, marginBottom: 16 }}>
        <b style={{ fontFamily: "var(--theme-body)", letterSpacing: ".08em" }}>THE METHOD (§8.17)</b> — every score is a panel <b>mean</b> with an <b>agreement</b> read (the spread). Demand (audience) and supply (legs) never collapse into one composite. No “trust me” — open any step to see each reviewer’s reasoning.
      </div>

      <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: ink, margin: "0 0 10px" }}>THE PIPELINE — ↓ each step carries its experts forward</div>
      {STEPS.map((s, k) => (
        <div key={s.label}>
          {s.done ? (
            <a href={s.href!} style={{ display: "block", textDecoration: "none", border: `2px solid var(--ink-soft)`, background: paper, padding: "12px 15px", color: ink }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 14 }}><b style={{ color: forest }}>{s.n} {s.label}</b> <span style={{ color: margin, fontSize: 12 }}>— {s.head}</span></span>
                <span style={{ color: amber, fontSize: 13, whiteSpace: "nowrap" }}>{starStr(s.star)}</span>
              </div>
              <div style={{ fontSize: 11.5, color: soft, marginTop: 3 }}>open →</div>
            </a>
          ) : (
            <div style={{ border: `2px dashed var(--ink-soft)`, padding: "12px 15px", color: margin, fontSize: 14 }}><b>{s.n} {s.label}</b> <span style={{ fontSize: 12 }}>— {s.head}</span></div>
          )}
          {s.carries && k < STEPS.length - 1 && (
            <div style={{ borderLeft: `2px dashed ${forest}`, margin: "0 0 0 16px", padding: "6px 0 6px 12px", fontSize: 11, color: forest, lineHeight: 1.45 }}>↓ carries: <span style={{ color: ink }}>{s.carries}</span></div>
          )}
        </div>
      ))}
    </main>
  );
}
