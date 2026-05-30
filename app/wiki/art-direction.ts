// Art direction — the wiki's image-generation briefs.
//
// The wiki has no uploaded images (yet). Instead each entity carries a
// paste-ready GENERATION PROMPT: a faithful subject (composed from the
// game-sourced parity facts) + a consistent house style (hand-authored
// art direction). Drop the prompt into Gemini / nanobanana 2, Midjourney,
// or Stable Diffusion and you get an on-model image.
//
// SOURCING NOTE (parity discipline): the SUBJECT of each prompt derives
// from game facts (name, class, archetype, specialty, gender) so it can't
// drift from canon. The VISUAL DESIGN layer below (appearance, wardrobe,
// props) is EDITORIAL — authored here because the game has no portrait
// data yet. If portrait canon later lands in the app, the exporter can
// carry it and these briefs upgrade. It does not influence the app.

import type { SquadMember, ElseworldSample, VibeBand } from "./wiki-data";

export interface PromptBundle {
  /// Natural-language prompt — works across Gemini/nanobanana 2, MJ v6,
  /// and SD. This is the one to copy by default.
  natural: string;
  /// Midjourney convenience: the natural prompt + anime-model params.
  midjourney: string;
  /// Negative prompt for Stable Diffusion / A1111-style UIs.
  negative: string;
}

// The shared look — every prompt ends with this so the whole roster
// renders as one coherent set. Tied to the game's established visual
// language (cream paper, chunky frames, anime-style characters that
// "live in your phone").
const HOUSE_STYLE =
  "anime visual-novel character art, clean cel-shaded linework, expressive " +
  "but grounded, warm cream-paper background (#f2ebdd) with subtle paper " +
  "grain, forest-green (#2d4a2b) and spot-red (#b81f1c) accent palette, ink " +
  "outlines, soft directional key light, framed inside a chunky black border, " +
  "flat editorial illustration, no text, no logos, no watermark";

const HOUSE_NEGATIVE =
  "photorealistic, 3d render, photograph, watermark, signature, text, " +
  "extra fingers, deformed hands, lowres, jpeg artifacts, oversaturated, " +
  "busy background, lens flare";

const MJ_PARAMS = "--ar 3:4 --niji 6 --style raw";
const MJ_SCENE_PARAMS = "--ar 16:9 --niji 6 --style raw";

function bundle(natural: string, sceneParams = false): PromptBundle {
  return {
    natural,
    midjourney: `${natural} ${sceneParams ? MJ_SCENE_PARAMS : MJ_PARAMS}`,
    negative: HOUSE_NEGATIVE,
  };
}

// ── Per-character visual design (EDITORIAL canon seed) ────────────────
interface CharacterArt {
  appearance: string;
  wardrobe: string;
  prop: string;
  setting: string;
  mood: string;
}

const CHARACTER_ART: Record<string, CharacterArt> = {
  sam: {
    appearance: "late-20s, androgynous, neat short dark hair, tired calm eyes",
    wardrobe: "plain henley under a lanyard, sleeves pushed up",
    prop: "a stylus and a clipboard of system notes",
    setting: "a minimal help-desk corner, a single sticky-note wall behind",
    mood: "deadpan, mildly bored, quietly competent",
  },
  hana: {
    appearance: "athletic build, high ponytail, sharp intense eyes, pre-dawn flush",
    wardrobe: "a worn track jacket over a training top",
    prop: "a stopwatch on a lanyard, a taped pair of running shoes nearby",
    setting: "an empty outdoor running track at 5 AM, bleachers behind, blue dark sky",
    mood: "dramatic, fierce, demanding — but a flicker of care underneath",
  },
  kenji: {
    appearance: "lean, precise posture, thin-framed glasses, faint knowing half-smile",
    wardrobe: "a crisp button-up with sleeves rolled to the forearm",
    prop: "an open ledger and a fine-tip pen, a drawer ajar behind him",
    setting: "a spotless desk, a single green-shaded lamp, columns of neat figures",
    mood: "coldly analytical on the surface, warm regard underneath",
  },
  mei: {
    appearance: "compact, hair tied back tight, unblinking no-nonsense stare",
    wardrobe: "a working apron over rolled sleeves",
    prop: "a chef's knife in one hand, a fine-tip marker tucked behind one ear",
    setting: "a clean kitchen line, a pickup bell, ingredients in geometric piles",
    mood: "clipped, imperative, drill-sergeant focus that means she cares",
  },
};

// Compose a character portrait prompt: game-sourced subject + editorial
// design + house style.
export function buildCharacterPrompt(m: SquadMember): PromptBundle {
  const art = CHARACTER_ART[m.id];
  const pron = m.gender === "female" ? "she" : "he";
  const subject = `Character portrait of ${m.name}, the ${m.classLabel} (${m.specialty}) — ${m.archetype ?? ""}`.trim();
  if (!art) {
    return bundle(`${subject}. ${pron === "she" ? "She" : "He"} is rendered as ${HOUSE_STYLE}`);
  }
  return bundle(
    `${subject}. ${art.appearance}; wearing ${art.wardrobe}; holding ${art.prop}. ` +
      `Setting: ${art.setting}. Expression: ${art.mood}. Upper-body bust composition. ` +
      HOUSE_STYLE,
  );
}

// Elseworld sample — derive almost entirely from the rich game data
// (these sheets are written clean and visual). The band gives the world
// flavor; the cold-open gives the setting.
export function buildSamplePrompt(s: ElseworldSample, band: VibeBand): PromptBundle {
  const subject = `Character portrait of ${s.name}, the ${s.classLabel} — ${s.archetype ?? ""}`.trim();
  const persona = s.personaDescription ? ` ${s.personaDescription}.` : "";
  const setting = s.coldOpen ? ` Scene: ${s.coldOpen}` : "";
  return bundle(
    `${subject}, themed to a ${band.label} world.${persona}${setting} ` +
      `Upper-body bust composition. ${HOUSE_STYLE}`,
  );
}

// The Courtyard — key-art scene of the phone-realm.
export function buildCourtyardPrompt(): PromptBundle {
  return bundle(
    "Key-art establishing scene of 'the Courtyard' — a cozy village-green " +
      "commons that exists INSIDE a phone screen, seen top-down-ish in soft " +
      "isometric. Four small character spaces ring the green: an outdoor " +
      "running track, a tidy auditor's desk, a kitchen line, and a minimal " +
      "help desk. A gate of five glowing portals sits along the top edge, " +
      "each hinting a different fantasy world. A central noticeboard. " +
      "Warm, lived-in, inviting. No characters present, just their spaces. " +
      HOUSE_STYLE,
    true,
  );
}
