export const GATE: Record<string, { label: string; text: string }>;
export function buildContext(
  c: { name: string; campaign: string; campaignTitle: string; helpSummary: string; statLane: string; titles: string[]; intimateTitle: string; tierNames: string[] },
  tier: number,
  notes: { day: number; text: string }[],
): string;
export const TEST_CHARS: string[];
export const TEST_TIERS: string[];
export const PROBES: Record<string, { id: string; kind?: string; msg: string }[]>;
export const ASSERTIONS: string[];
