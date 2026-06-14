// Shared §8.17 scoring — used by StepBoard, the board, the registry. One source for the build-value
// star so every surface agrees. Demand (audience) ⟂ supply (legs); the star folds both, weighted by
// importance to OUR MECHANICS (feels-safe · destination · struggle weigh heaviest).
export type Read = { index: number; relate: number; feelsSafe: number; wouldPlay: boolean; why?: string; feeling?: string; expectExperience?: string };
export type Leg = { index: number; canBuild: "load-bearing" | "hairline" | "hollow"; explanation: string; opens: string; forecloses: string; seed: string };
export type StepData = { results: Record<string, Read[]>; legs: Record<string, Leg[]> };
export type Item = { key: string; idx: number; title: string; sub: string; body: string; mono?: boolean };
// the SOURCE STUDY (§8.18) — the third lens (PRECEDENT), studied BEFORE the ELI5 is written
export type SourceStudy = { vein: string; works: { title: string; what: string }[]; borrow: string[]; avoid: string[]; preliminary?: boolean; method?: "ultrathink" | "deep-research" };

export const TARGET = ["anxious", "low_worth", "adhd", "iyashikei_fan"];
export const PLABEL: Record<string, string> = { anxious: "anxious", low_worth: "low self-worth", adhd: "ADHD", iyashikei_fan: "iyashikei fan" };
export const LEGV: Record<string, number> = { "load-bearing": 1, hairline: 0.5, hollow: 0 };
export const SW: Record<string, number> = { feelsSafe: 3, destination: 3, struggle: 3, relate: 2, mechanics: 2, cast: 1.5, cast_voice: 1.5, sustain: 1.5, motif_title: 1, rel_ladder: 1.5, reward: 1.5, grows_with_you: 2,
  // hook-engine legs (settings) + pilot-moment legs
  tone_breadth: 3, safety_floor: 3, story_spawn: 2.5, persistence: 1.5, cohesiveness: 2 };

export const starStr = (n: number) => "★".repeat(Math.floor(n)) + (n % 1 ? "½" : "") + "☆".repeat(Math.max(0, 5 - Math.ceil(n)));
export const reason = (r: Read) => r.why || r.expectExperience || r.feeling || "";

const get = (d: StepData, p: string, i: number) => (d.results[p] || []).find((r) => r.index === i);
export const avg = (d: StepData, i: number, k: "relate" | "feelsSafe") => TARGET.reduce((s, p) => s + (get(d, p, i)?.[k] ?? 0), 0) / TARGET.length;
export const spread = (d: StepData, i: number, k: "relate" | "feelsSafe") => { const v = TARGET.map((p) => get(d, p, i)?.[k] ?? 0); return Math.max(...v) - Math.min(...v); };
export const legKeys = (d: StepData) => Object.keys(d.legs || {});
export const getLeg = (d: StepData, e: string, i: number) => (d.legs[e] || []).find((r) => r.index === i);
export const legMean = (d: StepData, i: number) => { const v = legKeys(d).map((e) => LEGV[getLeg(d, e, i)?.canBuild ?? "hollow"]); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };

export function star(d: StepData, i: number) {
  let num = SW.relate * (avg(d, i, "relate") / 5) + SW.feelsSafe * (avg(d, i, "feelsSafe") / 5), den = SW.relate + SW.feelsSafe;
  for (const e of legKeys(d)) { num += (SW[e] ?? 1) * LEGV[getLeg(d, e, i)?.canBuild ?? "hollow"]; den += SW[e] ?? 1; }
  return Math.round((num / den) * 10) / 2;
}
// the top candidate of a step (for the board cells + the cross-story reference)
export function topOf(d: StepData, titles: string[]) {
  return titles.map((title, k) => ({ title, idx: k + 1, star: star(d, k + 1) })).sort((a, b) => b.star - a.star)[0];
}
