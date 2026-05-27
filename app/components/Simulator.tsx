"use client";

// Landing-page gameplay simulator. Client component — manages the
// per-visitor state of the canned 3-event scenario locally. No network
// calls, no LLM, no API key. The visitor experiences the full daily-loop
// trichotomy (logical / passive / chaotic with dice) + stats + REL +
// Hana's voice in about 90 seconds.

import { useMemo, useState } from "react";
import {
  Choice,
  ChoiceRole,
  INITIAL_STATS,
  relTierName,
  RunningStats,
  SIM_EVENTS,
} from "../lib/sim-data";

interface ResolvedChoice {
  eventId: string;
  choice: Choice;
  // Chaotic only — was the roll a crit-success or crit-fail.
  rollResult?: "crit-success" | "crit-fail";
  // Final delta applied (factors in the dice multiplier).
  appliedDelta: Partial<Record<keyof RunningStats, number>>;
  // The reaction text actually shown (varies by crit-fail for chaotic).
  reactionShown: string;
  // Item dropped (only on chaotic crit-success when itemDrop is defined).
  itemDropped?: { name: string; description: string };
}

function applyChoice(
  choice: Choice,
): { result?: "crit-success" | "crit-fail"; applied: ResolvedChoice["appliedDelta"]; reaction: string; itemDrop?: ResolvedChoice["itemDropped"] } {
  // Non-chaotic: apply delta as-is.
  if (!choice.diceRoll) {
    return { applied: choice.delta, reaction: choice.reactionText };
  }
  // Chaotic: roll. critChance is the failure probability per docs/GDD.md.
  const isCritFail = Math.random() < choice.diceRoll.critChance;
  if (isCritFail) {
    const applied: ResolvedChoice["appliedDelta"] = {};
    for (const [k, v] of Object.entries(choice.delta)) {
      applied[k as keyof RunningStats] = Math.round(
        (v ?? 0) * choice.diceRoll.critFailMultiplier,
      );
    }
    return {
      result: "crit-fail",
      applied,
      reaction: choice.reactionTextOnCritFail ?? choice.reactionText,
    };
  }
  // Crit-success: multiply, maybe drop item.
  const applied: ResolvedChoice["appliedDelta"] = {};
  for (const [k, v] of Object.entries(choice.delta)) {
    applied[k as keyof RunningStats] = Math.round(
      (v ?? 0) * choice.diceRoll.critSuccessMultiplier,
    );
  }
  return {
    result: "crit-success",
    applied,
    reaction: choice.reactionText,
    itemDrop: choice.itemDrop,
  };
}

export function Simulator() {
  const [eventIdx, setEventIdx] = useState(0);
  const [picked, setPicked] = useState<ResolvedChoice | null>(null);
  const [history, setHistory] = useState<ResolvedChoice[]>([]);
  const [done, setDone] = useState(false);

  const event = SIM_EVENTS[eventIdx];

  // Stats = INITIAL + sum of all applied deltas across history.
  const stats: RunningStats = useMemo(() => {
    const s = { ...INITIAL_STATS };
    for (const h of history) {
      for (const [k, v] of Object.entries(h.appliedDelta)) {
        s[k as keyof RunningStats] += v ?? 0;
      }
    }
    return s;
  }, [history]);

  function pick(choice: Choice) {
    if (picked) return;
    const resolved = applyChoice(choice);
    const r: ResolvedChoice = {
      eventId: event.id,
      choice,
      rollResult: resolved.result,
      appliedDelta: resolved.applied,
      reactionShown: resolved.reaction,
      itemDropped: resolved.itemDrop,
    };
    setPicked(r);
  }

  function advance() {
    if (!picked) return;
    const nextHistory = [...history, picked];
    if (eventIdx + 1 >= SIM_EVENTS.length) {
      setHistory(nextHistory);
      setPicked(null);
      setDone(true);
      return;
    }
    setHistory(nextHistory);
    setPicked(null);
    setEventIdx(eventIdx + 1);
  }

  function reset() {
    setEventIdx(0);
    setPicked(null);
    setHistory([]);
    setDone(false);
  }

  if (done) {
    const finalRel = stats.REL;
    return (
      <div className="border-2 border-ink bg-paper-shade p-6 sm:p-8">
        <div className="font-display text-spot-red text-xs tracking-[0.16em] mb-2">
          DAY 1 · WRAPPED
        </div>
        <h3 className="text-ink text-2xl sm:text-3xl mb-4">
          Hana is in your roster.
        </h3>
        <p className="mb-5 text-ink-soft italic">
          You played three events. The full game runs five to seven a day, for
          seven days of curated story, then opens onto the rest. Across the
          arc, four characters write about you and start comparing notes.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatBox label="STR" value={stats.STR} />
          <StatBox label="INT" value={stats.INT} />
          <StatBox label="GLD" value={stats.GLD} />
          <StatBox label="CHR" value={stats.CHR} />
          <StatBox label="REL · HANA" value={stats.REL} accent />
        </div>

        <div className="border border-ink bg-paper p-4 mb-5">
          <div className="font-display text-xs tracking-[0.16em] text-forest mb-1">
            HANA · {relTierName(finalRel).toUpperCase()}
          </div>
          <p className="text-ink-soft italic text-[15px] leading-relaxed">
            {finalRel >= 6
              ? "She's noting you. Tomorrow's text arrives at 5:14 AM regardless."
              : finalRel >= 0
              ? "She's circling. The treadmill is still running in the background."
              : "She is reconsidering you. Tomorrow's text will be sharper."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="#download"
            className="flex-1 text-center font-display tracking-[0.14em] text-white bg-forest py-3 px-5 border-2 border-ink !no-underline hover:bg-[#1f3a1d] transition"
          >
            DOWNLOAD THE FULL GAME →
          </a>
          <button
            type="button"
            onClick={reset}
            className="flex-1 text-center font-display tracking-[0.14em] text-ink bg-paper py-3 px-5 border-2 border-ink hover:bg-paper-shade transition cursor-pointer"
          >
            RUN THE DEMO AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-ink bg-paper-shade p-5 sm:p-7">
      {/* Header bar — day + event progress + stats summary */}
      <div className="flex items-center justify-between border-b border-ink/40 pb-3 mb-4">
        <div className="font-display text-xs tracking-[0.16em] text-forest">
          DAY 1 · EVENT {eventIdx + 1} / {SIM_EVENTS.length} · {event.characterName}
        </div>
        <div className="flex gap-2 text-[11px] font-display tracking-[0.12em] text-ink-soft">
          <span>STR {stats.STR}</span>
          <span>INT {stats.INT}</span>
          <span>CHR {stats.CHR}</span>
          <span className="text-spot-red">REL {stats.REL}</span>
        </div>
      </div>

      {/* Scenario prose */}
      <p className="text-ink text-[17px] leading-[1.55] mb-2">
        {event.scenarioLine1}
      </p>
      {event.scenarioLine2 && (
        <p className="text-ink text-[17px] leading-[1.55] italic mb-5">
          {event.scenarioLine2}
        </p>
      )}

      {/* Choice tray OR reaction */}
      {!picked ? (
        <div className="space-y-3">
          {event.choices.map((c) => (
            <ChoiceButton key={c.id} choice={c} onPick={() => pick(c)} />
          ))}
          <p className="text-center text-margin-ink italic text-xs pt-2">
            ✦ choices roll dice — the chaotic one always does. crit-fail is
            on the table. that&apos;s the contract.
          </p>
        </div>
      ) : (
        <ReactionPanel
          resolved={picked}
          isLast={eventIdx + 1 >= SIM_EVENTS.length}
          onAdvance={advance}
        />
      )}
    </div>
  );
}

function ChoiceButton({
  choice,
  onPick,
}: {
  choice: Choice;
  onPick: () => void;
}) {
  const accent: Record<ChoiceRole, string> = {
    logical: "bg-forest text-white",
    passive: "bg-ink text-white",
    chaotic: "bg-spot-red text-white",
  };
  const labels: Record<ChoiceRole, string> = {
    logical: "LOGICAL",
    passive: "PASSIVE",
    chaotic: "CHAOTIC · 🎲",
  };
  return (
    <button
      type="button"
      onClick={onPick}
      className="w-full text-left grid grid-cols-[60px_1fr] gap-3 items-stretch border border-ink bg-paper hover:bg-paper-shade transition cursor-pointer"
    >
      <div
        className={`${accent[choice.role]} font-display text-3xl flex items-center justify-center py-2`}
      >
        {choice.id.toUpperCase()}
      </div>
      <div className="p-3 pr-4">
        <div className="font-display text-[11px] tracking-[0.14em] text-ink-soft mb-1">
          {labels[choice.role]}
          {choice.itemDrop && " · ★ ITEM ON SUCCESS"}
        </div>
        <div className="text-ink text-[15px] leading-[1.4]">{choice.label}</div>
      </div>
    </button>
  );
}

function ReactionPanel({
  resolved,
  isLast,
  onAdvance,
}: {
  resolved: ResolvedChoice;
  isLast: boolean;
  onAdvance: () => void;
}) {
  const roleAccent =
    resolved.rollResult === "crit-fail"
      ? "text-spot-red"
      : resolved.rollResult === "crit-success"
        ? "text-forest"
        : "text-ink";
  const rollTag =
    resolved.rollResult === "crit-fail"
      ? "🎲 CRIT FAIL"
      : resolved.rollResult === "crit-success"
        ? "🎲 CRIT SUCCESS"
        : null;

  const deltaLines = Object.entries(resolved.appliedDelta).filter(
    ([, v]) => v !== 0,
  );

  return (
    <div className="space-y-4">
      {rollTag && (
        <div
          className={`font-display tracking-[0.16em] text-sm ${roleAccent}`}
        >
          {rollTag}
        </div>
      )}
      <div className="border border-ink bg-paper p-4">
        <div className="font-display text-[10px] tracking-[0.18em] text-forest mb-2">
          HANA REACTS
        </div>
        <p className="text-ink text-[16px] leading-[1.5] italic">
          {resolved.reactionShown}
        </p>
      </div>

      {/* Delta chips */}
      {deltaLines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {deltaLines.map(([stat, val]) => {
            const v = val as number;
            const positive = v > 0;
            return (
              <span
                key={stat}
                className={`font-display text-[11px] tracking-[0.14em] px-2 py-1 border ${
                  positive
                    ? "border-forest text-forest"
                    : "border-spot-red text-spot-red"
                }`}
              >
                {stat} {positive ? "+" : ""}
                {v}
              </span>
            );
          })}
        </div>
      )}

      {/* Item drop */}
      {resolved.itemDropped && (
        <div className="border border-forest bg-paper p-3">
          <div className="font-display text-[10px] tracking-[0.16em] text-spot-red mb-1">
            ★ ITEM DROP
          </div>
          <div className="font-display text-ink text-base">
            {resolved.itemDropped.name}
          </div>
          <div className="text-ink-soft italic text-[13px]">
            {resolved.itemDropped.description}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onAdvance}
        className="w-full text-center font-display tracking-[0.14em] text-white bg-forest py-3 px-5 border-2 border-ink hover:bg-[#1f3a1d] transition cursor-pointer"
      >
        {isLast ? "FINISH THE DEMO →" : "NEXT EVENT →"}
      </button>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`border ${accent ? "border-spot-red" : "border-ink"} bg-paper p-2 text-center`}
    >
      <div
        className={`font-display text-[10px] tracking-[0.14em] ${
          accent ? "text-spot-red" : "text-margin-ink"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-display text-3xl ${accent ? "text-spot-red" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}
