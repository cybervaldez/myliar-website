// Image-generation brief block. The wiki has no uploaded art (yet), so
// each entity shows a paste-ready prompt instead. Primary natural-language
// prompt works across Gemini/nanobanana 2, Midjourney v6, and SD; the
// Midjourney param string and the SD negative prompt are offered as
// disclosures so each tool gets what it wants.

import type { PromptBundle } from "../art-direction";
import { CopyButton } from "./CopyButton";

// A framed placeholder that occupies the "image" slot at the top of the
// infobox column — where a portrait will eventually live.
export function PortraitPlaceholder({ caption }: { caption: string }) {
  return (
    <div className="border-2 border-ink bg-paper mb-4">
      <div className="aspect-[3/4] flex items-center justify-center bg-paper-shade border-b-2 border-ink relative overflow-hidden">
        {/* corner-notch flourish to echo the chunky-frame language */}
        <div className="absolute inset-2 border border-dashed border-margin-ink/50" />
        <div className="text-center px-4">
          <div className="font-display tracking-[0.16em] text-[11px] text-margin-ink">
            PORTRAIT
          </div>
          <div className="font-body italic text-[11px] text-margin-ink mt-1">
            generate from the brief ↓
          </div>
        </div>
      </div>
      <div className="px-3 py-2 font-display tracking-[0.12em] text-[9px] text-margin-ink text-center">
        {caption}
      </div>
    </div>
  );
}

export function ImagePrompt({
  bundle,
  kind = "portrait",
}: {
  bundle: PromptBundle;
  kind?: "portrait" | "scene";
}) {
  return (
    <div className="border-2 border-ink bg-paper-shade">
      <div className="flex items-center justify-between gap-3 bg-ink px-4 py-2">
        <span className="font-display tracking-[0.14em] text-[11px] text-paper">
          🎨 GENERATION BRIEF · {kind === "scene" ? "KEY ART" : "PORTRAIT"}
        </span>
        <CopyButton text={bundle.natural} label="COPY PROMPT" />
      </div>

      {/* Primary natural-language prompt */}
      <div className="px-4 py-3">
        <div className="font-display tracking-[0.14em] text-[9px] text-forest mb-1.5">
          PROMPT · Gemini / nanobanana 2 · Midjourney · SD
        </div>
        <pre className="font-mono text-[12px] leading-[1.5] text-ink whitespace-pre-wrap break-words m-0">
          {bundle.natural}
        </pre>
      </div>

      {/* Tool-specific adjuncts */}
      <details className="border-t border-ink/25 px-4 py-2">
        <summary className="cursor-pointer font-display tracking-[0.12em] text-[10px] text-margin-ink list-none">
          ▸ MIDJOURNEY PARAMS &amp; SD NEGATIVE
        </summary>
        <div className="mt-2 space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-display tracking-[0.12em] text-[9px] text-margin-ink">
                MIDJOURNEY (full line)
              </span>
              <CopyButton text={bundle.midjourney} />
            </div>
            <pre className="font-mono text-[11px] leading-[1.45] text-ink-soft whitespace-pre-wrap break-words m-0">
              {bundle.midjourney}
            </pre>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-display tracking-[0.12em] text-[9px] text-margin-ink">
                STABLE DIFFUSION — negative prompt
              </span>
              <CopyButton text={bundle.negative} />
            </div>
            <pre className="font-mono text-[11px] leading-[1.45] text-ink-soft whitespace-pre-wrap break-words m-0">
              {bundle.negative}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
