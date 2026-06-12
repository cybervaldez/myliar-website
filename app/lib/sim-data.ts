// Canned demo scenario for the landing-page simulator.
//
// This is a SIMPLIFIED, self-contained version of the curated onboarding
// day — light edits keep it cold-visitor-friendly (no map-glyph brackets,
// no cross-character references that would need unseen context, no PDF
// artifacts). The full canonical payload it tracks lives in
// parity.generated.json (field `simScenario`, pulled by the parity
// exporter from assets/payloads/run-005/onboarding_hana_d1.json). When
// that payload regens, run `npm run parity` and re-simplify against the
// updated source. The REL tier names below are NOT hand-maintained —
// see relTierName(), which reads the live tier ladder from parity.
//
// The simulator runs entirely client-side. No LLM call, no API key, no
// cost per visitor. The visitor experiences the trichotomy (logical /
// passive / chaotic), the dice roll on chaotic, the stats + REL moving,
// and Hana's voice — the actual feel of the daily loop.

import parity from "./parity.generated.json";

export type ChoiceRole = "logical" | "passive" | "chaotic";

export interface Choice {
  id: "a" | "b" | "c";
  role: ChoiceRole;
  label: string;
  delta: Partial<Record<"STR" | "INT" | "GLD" | "CHR" | "REL", number>>;
  reactionText: string;
  reactionTextOnCritFail?: string;
  // Chaotic-only: visitor sees a die roll. critChance is the prob of
  // failure; we resolve only crit-success or crit-fail (engine convention).
  diceRoll?: {
    critChance: number;
    critSuccessMultiplier: number;
    critFailMultiplier: number;
  };
  itemDrop?: {
    name: string;
    description: string;
  };
}

export interface SimEvent {
  id: string;
  scenarioLine1: string; // 1-2 sentences of place + character entry
  scenarioLine2?: string; // optional follow-up sentence
  characterId: "hana" | "sam";
  characterName: string;
  characterEmoji: string;
  choices: Choice[];
}

export const SIM_EVENTS: SimEvent[] = [
  {
    id: "evt-1",
    characterId: "hana",
    characterName: "HANA",
    characterEmoji: "♀",
    scenarioLine1:
      "You wake up to a massive text block from an unknown number demanding to know your resting heart rate and the exact volume of water you drank before bed.",
    scenarioLine2: "It is 5:14 AM.",
    choices: [
      {
        id: "a",
        role: "logical",
        label: "Reply with your estimated metrics to establish a baseline.",
        delta: { INT: 1, REL: 2 },
        reactionText:
          "She instantly sends a PDF: a color-coded chart where the 5 AM block is highlighted in aggressive red. 'BASELINE LOGGED. Tomorrow you do better.'",
        itemDrop: {
          name: "Hana's Baseline Diagnostic Chart",
          description: "Highly detailed. 5 AM is in red. You feel watched.",
        },
      },
      {
        id: "b",
        role: "passive",
        label: "Ignore the text and stare blankly at the ceiling.",
        delta: { REL: -1 },
        reactionText:
          "A single word flashes on your lock screen: 'UNACCEPTABLE.' The typing indicator stays active for three minutes.",
      },
      {
        id: "c",
        role: "chaotic",
        label: "Send a blurry photo of a lukewarm gas station hotdog.",
        delta: { CHR: 1, REL: -2 },
        reactionText:
          "She logs this under 'Emergency Fueling Failure Level 4' and demands the brand of mustard. You don't know if she's joking.",
        reactionTextOnCritFail:
          "She blocks you for twenty minutes. You can hear her voice in your head anyway.",
        diceRoll: {
          critChance: 0.4,
          critSuccessMultiplier: 2,
          critFailMultiplier: -1,
        },
      },
    ],
  },
  {
    id: "evt-2",
    characterId: "hana",
    characterName: "HANA",
    characterEmoji: "♀",
    scenarioLine1:
      "Hana video-calls you while running on a treadmill at what sounds like Mach 2. Her breathing is perfectly regulated.",
    scenarioLine2:
      "She demands an immediate physical assessment to calibrate your baseline STR.",
    choices: [
      {
        id: "a",
        role: "logical",
        label: "Drop and perform ten awkward pushups in front of your camera.",
        delta: { STR: 1, REL: 2 },
        reactionText:
          "She critiques your scapular alignment but logs the baseline strength points anyway. Her face stays expressionless for approximately one second too long.",
      },
      {
        id: "b",
        role: "passive",
        label: "Keep your camera off and listen to her run.",
        delta: { REL: -1 },
        reactionText:
          "She lets the silence stretch. You hear the treadmill belt. You also hear, faintly, the moment she switches to incline.",
      },
      {
        id: "c",
        role: "chaotic",
        label: "Claim your floor is lava and do pushups on the kitchen counter.",
        delta: { CHR: 1, STR: 1, REL: 1 },
        reactionText:
          "She screenshots your form. 'Your kitchen counter is now a JURISDICTION. I am noting this.' She does not break stride on the treadmill.",
        reactionTextOnCritFail:
          "You knock a glass into the sink mid-pushup. The shatter is the loudest sound in the call.",
        diceRoll: {
          critChance: 0.4,
          critSuccessMultiplier: 2,
          critFailMultiplier: -1,
        },
        itemDrop: {
          name: "Counter-Form Critique Screenshot",
          description: "Filed under JURISDICTION. Hana keeps this one.",
        },
      },
    ],
  },
  {
    id: "evt-3",
    characterId: "hana",
    characterName: "HANA",
    characterEmoji: "♀",
    scenarioLine1:
      "Hana's tone softens slightly as the sun sets. She texts you a photo of a worn, heavily taped pair of running shoes sitting on a clean wooden floor.",
    scenarioLine2:
      "'They aren't mine,' she writes. 'They belonged to my brother. He was the coach. I run at 5 AM for him now.'",
    choices: [
      {
        id: "a",
        role: "logical",
        label: "Ask one gentle follow-up about her brother.",
        delta: { INT: 1, REL: 3 },
        reactionText:
          "She types for a long time. Then sends one sentence: 'He'd have liked you. He liked the chaotic ones.' She doesn't say more. She doesn't need to.",
      },
      {
        id: "b",
        role: "passive",
        label: "Say nothing. Just stay in the chat.",
        delta: { REL: 1 },
        reactionText:
          "She watches the typing indicator come and go on your end. She knows you saw the photo. She knows you stayed. That counts.",
      },
      {
        id: "c",
        role: "chaotic",
        label: "Ask if she can sell you the shoes on eBay.",
        delta: { CHR: 2, REL: -3 },
        reactionText:
          "She sends a voice note. It is half a second of her laughing, then silence. The voice note is 47 seconds long. The other 46 are her breathing.",
        reactionTextOnCritFail:
          "She does not respond for the rest of the day. You'll catch up tomorrow.",
        diceRoll: {
          critChance: 0.4,
          critSuccessMultiplier: 2,
          critFailMultiplier: -1,
        },
      },
    ],
  },
];

export interface RunningStats {
  STR: number;
  INT: number;
  GLD: number;
  CHR: number;
  REL: number; // REL with Hana specifically
}

export const INITIAL_STATS: RunningStats = {
  STR: 0,
  INT: 0,
  GLD: 0,
  CHR: 0,
  REL: 0,
};

// REL tier resolution — driven by the parity export, NOT hand-maintained.
// parity.relTiers mirrors lib/game_state.dart kRelTierThresholds/Names.
// names.length === thresholds.length + 1; the last name is the top rung
// (REL >= last threshold). Run `npm run parity` if the game's ladder
// changes and this updates automatically.
export function relTierName(rel: number): string {
  const { thresholds, names } = parity.relTiers;
  for (let i = 0; i < thresholds.length; i++) {
    if (rel < thresholds[i]) return names[i];
  }
  return names[names.length - 1];
}
