// 1:1 port of lib/bpm.dart — the scene's felt "heartbeat", DERIVED from state.
// BPM is INTERNAL (never a player-facing number); it drives the threshold-gated
// pulse animation + conducts the dialogue reveal pace. In the /play sim it's a
// dev-playground visualization of exactly those animation elements. Keep this in
// sync with lib/bpm.dart (constants + deriveBpm + the cadence getters).

export const kBpmResting = 68;
export const kBpmCalmEdge = 55;
export const kBpmAlertEdge = 90;
export const kBpmFloor = 40;
export const kBpmCeil = 120;

export type BpmShift = "none" | "slower" | "faster";
export const bpmShiftFromString = (s?: string): BpmShift =>
  s === "slower" ? "slower" : s === "faster" ? "faster" : "none";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export type Bpm = ReturnType<typeof makeBpm>;

function makeBpm(character: number, player: number) {
  const sceneTempo = character > player ? character : player;
  const characterPulses = character < kBpmCalmEdge || character > kBpmAlertEdge;
  const playerPulses = player < kBpmCalmEdge || player > kBpmAlertEdge;
  // sceneTempo-driven lerp (matches Bpm._lerpByTempo): a calm/heavy heart is slow
  // + weighty, a racing heart is fast + urgent.
  const lerp = (slow: number, fast: number) => {
    const t = clamp((sceneTempo - kBpmFloor) / (kBpmCeil - kBpmFloor), 0, 1);
    return Math.round(slow + (fast - slow) * t);
  };
  return {
    character, player, sceneTempo,
    characterPulses, playerPulses, anyPulse: characterPulses || playerPulses,
    revealMsPerChar: () => lerp(60, 16),
    revealMsPerWord: () => lerp(90, 28),
    dwellMs: () => lerp(1300, 360),
  };
}

// deriveBpm — the player carries the scene's nerves; the coach stays calmer
// (composure is the gift) UNLESS this is the character's own exposed beat.
export function deriveBpm({
  stakes = 0, valenceTilt = 0, relFriction = 0, characterExposed = false, shift = "none" as BpmShift,
}: { stakes?: number; valenceTilt?: number; relFriction?: number; characterExposed?: boolean; shift?: BpmShift }): Bpm {
  const nudge = shift === "slower" ? -12 : shift === "faster" ? 14 : 0;
  const player = kBpmResting + stakes * 12 + (valenceTilt < 0 ? 14 : 0) - (valenceTilt > 0 ? 8 : 0) + relFriction * 5 + nudge;
  const character = kBpmResting + (characterExposed ? stakes * 12 + 16 : stakes * 4) + nudge;
  return makeBpm(clamp(character, kBpmFloor, kBpmCeil), clamp(player, kBpmFloor, kBpmCeil));
}

// REL tier index from a REL score against the parity thresholds — mirrors
// GameState.relTierIndex (first i where score < thresholds[i], else length).
export const relTierIndex = (score: number, thresholds: number[]): number => {
  for (let i = 0; i < thresholds.length; i++) if (score < thresholds[i]) return i;
  return thresholds.length;
};

// REL friction (0 deep-trust … 3 new/low-trust) from the tier index — mirrors
// _bpmFor: friction = round(((9 - tier).clamp(0,9)) * 3 / 9).
export const relFrictionFromTier = (tier: number): number =>
  Math.round((clamp(9 - tier, 0, 9) * 3) / 9);
