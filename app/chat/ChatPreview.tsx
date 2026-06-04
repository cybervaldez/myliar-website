"use client";

// The chat-DESTINATION preview: pick a character + a REL-tier game-state and see
// the DOSSIER the arc builds toward — the thing the player talks to at the end.
// (story-engine: "the arc is a note-factory; the chat is the destination.") Shows
// the gate/floor, the identity + title-at-tier, the case-file notes the digest
// surfaces, and the Unspoken reward stack WITH honest build-status — so the
// endgame gap is visible, not hidden.

import { useState } from "react";

export type ChatChar = {
  id: string; name: string; campaign: "main-line" | "wingman"; campaignTitle: string;
  helpSummary: string; statLane: string; titles: string[]; intimateTitle: string;
  tierNames: string[]; notes: { day: number; text: string; emotion: string | null }[];
};

const GATE: Record<string, { label: string; text: string }> = {
  "main-line": {
    label: "phone-realm SQUAD floor",
    text: "You're one of the four who live in the player's phone — an RPG-themed functional agent, not generic AI roleplay. STR/INT/GLD/CHR party. Banned: medical/finance/wellness words. In-world lexicon (Sigil · Margin · Roster · Audit · Drill · Mise). No flirting — the relationship floor.",
  },
  wingman: {
    label: "the Corner DATING floor",
    text: "You're a COACH in the player's corner, NEVER the date. NEVER roleplay, simulate, or voice the match/date — they're offscreen, in the player's real life. No PUA/manosphere, no therapy/clinical register. The sandbox-substitution guard: make yourself UNNEEDED — the win is real-life action.",
  },
};

const STATUS: Record<string, { c: string; l: string }> = {
  wired: { c: "#15803d", l: "WIRED" },
  partial: { c: "#b8860b", l: "PARTIAL" },
  authored: { c: "#0645ad", l: "AUTHORED ONLY" },
  unwired: { c: "#b81f1c", l: "SPEC'D · NOT WIRED" },
};

function STACK(intimate: string): { k: string; status: keyof typeof STATUS; note: string }[] {
  return [
    { k: `Intimate title — "${intimate || "—"}"`, status: "wired", note: "a display field on the character, revealed at Unspoken." },
    { k: "Keepsake (always-mystery legendary)", status: "wired", note: "the legendary item, unlocked by the Unspoken achievement (mysteryLocked)." },
    { k: "Passive — “what they taught you” (cross-game buff)", status: "partial", note: "the Unspoken achievement carries a crit-% buff; the anti-cascade / lane buffs are NOT wired yet." },
    { k: "Inversion / peer beat (the gift turns around)", status: "authored", note: "written into the B5 payloads (you audit Kenji / read the Reader) — narrative only, no mechanic." },
    { k: "Mutual mode — “they reach out” unprompted", status: "unwired", note: "spec'd in story-engine §2; no code path exists yet." },
  ];
}

export function ChatPreview({ chars }: { chars: ChatChar[] }) {
  const [id, setId] = useState(chars[0]?.id ?? "");
  const c = chars.find((x) => x.id === id) ?? chars[0];
  const maxTier = (c?.tierNames.length ?? 10) - 1;
  const [tier, setTier] = useState(maxTier);
  if (!c) return null;
  const atUnspoken = tier >= maxTier;
  const earnedTitles = atUnspoken ? c.titles.length : Math.max(1, Math.round(((tier + 1) / (maxTier + 1)) * c.titles.length));
  const gate = GATE[c.campaign];

  return (
    <div>
      {/* character picker */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["main-line", "wingman"].map((cam) => (
          <div key={cam} className="flex gap-1.5 flex-wrap items-center">
            <span className="text-[10px] uppercase tracking-[0.1em] text-margin-ink mr-1">{cam === "wingman" ? "The Wingman" : "Life Ops"}</span>
            {chars.filter((x) => x.campaign === cam).map((x) => (
              <button key={x.id} onClick={() => { setId(x.id); setTier((x.tierNames.length) - 1); }}
                className={`text-[12px] px-2.5 py-1 border ${x.id === id ? "bg-[#0645ad] text-white border-[#0645ad]" : "border-[#a2b1c2] text-[#0645ad]"}`}>
                {x.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* REL-tier game-state slider */}
      <div className="border border-[#a2b1c2] bg-[#f6f7f9] p-3 mb-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#54595d]">game-state · REL tier</span>
          <span className="font-display text-[18px]" style={{ fontFamily: "Georgia, serif" }}>{c.tierNames[tier]}{atUnspoken ? " ★" : ""}</span>
        </div>
        <input type="range" min={0} max={maxTier} value={tier} onChange={(e) => setTier(Number(e.target.value))} className="w-full" />
        <div className="flex justify-between text-[9px] text-margin-ink mt-0.5"><span>{c.tierNames[0]}</span><span>{c.tierNames[maxTier]} (Unspoken)</span></div>
      </div>

      {/* the assembled dossier */}
      <div className="border-[1.5px] border-ink bg-white">
        <div className="bg-[#202122] text-white px-4 py-2 flex items-baseline justify-between">
          <span className="font-display text-[18px]">{c.name}</span>
          <span className="text-[11px] text-[#bbb]">{c.campaignTitle} · the dossier the player talks to</span>
        </div>
        <div className="p-4 space-y-4">
          {/* the gate */}
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-spot-red mb-1">the gate · {gate.label}</div>
            <p className="text-[12.5px] text-ink-soft leading-[1.5]">{gate.text}</p>
          </div>

          {/* identity + title at tier */}
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#54595d] mb-1">who they are · the gift</div>
            <p className="text-[13px] text-ink leading-[1.5]">{c.helpSummary}</p>
            <div className="text-[11px] text-margin-ink mt-1">stat lane: <strong>{c.statLane}</strong></div>
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] uppercase tracking-[0.08em] text-margin-ink">titles earned by this tier:</span>
              {c.titles.map((t, i) => (
                <span key={t} className={`text-[11px] px-1.5 py-0.5 border ${i < earnedTitles ? "border-forest text-forest" : "border-[#cbd2da] text-[#9aa4af]"}`}>{i < earnedTitles ? "" : "🔒 "}{t}</span>
              ))}
              <span className={`text-[11px] px-1.5 py-0.5 border ${atUnspoken ? "border-[#b8860b] text-[#8a6d0b] bg-[#fdf6e3]" : "border-[#cbd2da] text-[#9aa4af]"}`}>{atUnspoken ? "★ " : "🔒 "}{c.intimateTitle || "—"} <span className="text-[9px]">(intimate · Unspoken)</span></span>
            </div>
          </div>

          {/* case file — the notes */}
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#15803d] mb-1">the case file · {c.notes.length} notes the arc wrote about the player</div>
            <p className="text-[11px] text-margin-ink mb-2 italic">The live chat digest surfaces the ~3 most-recent toggled-in notes into the preamble (player_context_digest, Mode A). Below = the full dossier the arc has built so far.</p>
            <div className="space-y-1 max-h-[280px] overflow-auto border border-[#eef0f2] p-2">
              {c.notes.length === 0 ? <p className="text-[12px] text-margin-ink italic">No notes yet — this character has no authored daily story (chat works, but the note-factory hasn't run).</p> :
                c.notes.map((n, i) => (
                  <p key={i} className="text-[12px] text-ink-soft leading-[1.45] border-l-2 border-[#15803d]/40 pl-2">
                    <span className="text-[9px] text-margin-ink uppercase tracking-[0.06em]">D{n.day}{n.emotion ? " · " + n.emotion : ""}</span><br />✎ {n.text}
                  </p>
                ))}
            </div>
          </div>

          {/* Unspoken reward stack — with honest build-status */}
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#8a6d0b] mb-1">the Unspoken payoff · the full-REL reward stack {atUnspoken ? "(unlocked)" : "(locked until Unspoken)"}</div>
            <p className="text-[11px] text-margin-ink mb-2 italic">This is the reason to MAX a character — and the honest state of how much of it is actually built. The arc is the note-factory; THIS is the destination it builds toward.</p>
            <div className={`space-y-1.5 ${atUnspoken ? "" : "opacity-50"}`}>
              {STACK(c.intimateTitle).map((s) => (
                <div key={s.k} className="border border-[#eef0f2] p-2">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="text-[12.5px] text-ink font-medium">{s.k}</span>
                    <span className="text-[9px] uppercase tracking-[0.06em] px-1.5 py-0.5 border shrink-0" style={{ color: STATUS[s.status].c, borderColor: STATUS[s.status].c }}>{STATUS[s.status].l}</span>
                  </div>
                  <p className="text-[11px] text-ink-soft leading-[1.4] mt-0.5">{s.note}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-spot-red mt-2 leading-[1.5]">⚠ Two of five reward-stack rungs are <strong>spec'd-but-not-wired</strong> (the cross-game passive beyond crit-%, and mutual mode). The destination the whole engine builds toward is the most underbuilt part of the loop — the next product step.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
