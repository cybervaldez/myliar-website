"use client";

// Concept drill-down — Step 1 (nameless cast, vibe-first) for ONE concept. Same simple
// kanban/list toggle as the slate. Cast members have a working ROLE (not a name — names
// come last) + vibe + domain + temperament POLE. Kanban groups by pole (the dynamic-range
// axis); list is the fast scan.

import { useState, Fragment } from "react";

export type CastMember = {
  role: string; vibe: string; domain: string; pole: string; titles?: string[]; name?: string;
  // scannable design columns (the Sheet view — the spreadsheet companion)
  stat?: string; gift?: string; climb?: string; legendary?: string; intimateTitle?: string; passive?: string;
  // EARNS popup detail (the full-REL unlock)
  legendaryId?: string; earnedOn?: string; keepsake?: string; keepsakeTease?: string; mutual?: string; inversion?: string;
  // canon-lock bible (the Bible view — the website as the campaign's record)
  introLine?: string; gender?: string; race?: string; whoTheyAre?: string; voiceSamples?: string[]; neverSays?: string; alwaysNotices?: string;
  // the arc — the teaching ladder + tier-up reveals
  curriculum?: string[]; milestones?: string[];
  // mystery character (locked / obscured until earned)
  mystery?: boolean; unlockIf?: string[]; mysteryAppearance?: string;
};

const REL_TIERS = ["Inside-orbit", "In-your-corner", "Folded-in", "Unspoken"];

const VIEW_LABEL: Record<string, string> = { kanban: "Kanban", list: "List", sheet: "Sheet", bible: "Bible" };
const genderGlyph = (g?: string) => (g === "male" ? "♂" : g === "female" ? "♀" : g ? "⚲" : "");
// name display (handles mystery → 🔒 ??? · role)
function nameLabel(m: CastMember) {
  if (m.mystery) return <>🔒 ??? <span className="text-[11px] text-margin-ink font-normal">· {m.role}</span></>;
  if (m.name) return <>{m.name} <span className="text-[11px] text-margin-ink font-normal">· {m.role}</span></>;
  return <>{m.role}</>;
}

// Sheet column headers + their hover-help (so the dense grid explains itself).
const SHEET_COLS: { label: string; help: string }[] = [
  { label: "Coach", help: "The cast role + its alternate titles. In-app the player picks which title to show, or 'Just <Name>'. Names are locked; titles are earned." },
  { label: "Pole", help: "Temperament band: Field (loud / forward) · Between (analyst / observer) · Hearth (warm / grounding). The cast spans the range." },
  { label: "Stat", help: "The RPG stat lane this coach holds — CHR / INT / GLD / STR / meta — so the world isn't five of the same coach (the blend gate)." },
  { label: "Gift (what they give)", help: "The real capability they GIVE you, valuable at relationship-zero. The value prop — it never turns into a different service." },
  { label: "Climbs to (full REL)", help: "The Unspoken-tier destination — the feeling at max relationship. Every one ends with the coach becoming optional (the anti-dependency thesis)." },
  { label: "Earns (legendary)", help: "The legendary achievement at full REL. Click it for everything maxing this coach unlocks — keepsake, passive, intimate title, mutual mode." },
  { label: "Full-REL reward", help: "Quick summary: the intimate title + the permanent cross-game Passive ('what they taught you'). Click EARNS for the full unlock detail." },
];

// the alternate titles (everything past the primary role) — multiple angles so the gift
// reads at a glance; in-app these become a player choice (pick one, or "Just <Name>").
function alts(m: CastMember): string {
  const xs = (m.titles ?? []).filter((t) => t !== m.role);
  return xs.length ? `also: ${xs.join(" · ")}  ·  or no title (Just <Name> once named)` : "";
}
type Layout = "kanban" | "list" | "sheet" | "bible";

const POLES = ["Field", "Between", "Hearth"];
const POLE_DESC: Record<string, string> = {
  Field: "intense / outgoing",
  Between: "in the middle",
  Hearth: "cozy / laid-back",
};

export function CastView({ cast }: { cast: CastMember[] }) {
  // a locked (named) cast opens to its Bible — the rich record; a nameless concept opens to Kanban (the shape).
  const [layout, setLayout] = useState<Layout>(() => (cast.some((m) => m.name) ? "bible" : "kanban"));
  const [openRow, setOpenRow] = useState<string | null>(null);

  if (!cast.length) {
    return (
      <p className="text-[13px] text-margin-ink italic">
        No cast conceptualized yet — this concept is a candidate. Say the word and I&apos;ll run the
        theme → nameless-cast pass on it (like The Studio).
      </p>
    );
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-4">
        {(["kanban", "list", "sheet", "bible"] as Layout[]).map((l) => (
          <button
            key={l}
            onClick={() => setLayout(l)}
            className={`font-sans text-[12px] uppercase tracking-[0.08em] px-3 py-1.5 border transition ${layout === l ? "bg-[#0645ad] text-white border-[#0645ad]" : "border-[#a2b1c2] text-[#0645ad] hover:bg-[#f1f4f8]"}`}
          >
            {VIEW_LABEL[l]}
          </button>
        ))}
      </div>

      {layout === "kanban" && (
        <div className="grid sm:grid-cols-3 gap-4">
          {POLES.map((p) => {
            const items = cast.filter((m) => m.pole === p);
            return (
              <div key={p} className="min-w-0">
                <div className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#54595d] border-b border-[#a2b1c2] pb-1 mb-2">
                  {p} <span className="opacity-60">· {POLE_DESC[p]} ({items.length})</span>
                </div>
                <div className="space-y-3">
                  {items.map((m) => (
                    <div key={m.role} className="border border-ink/40 bg-paper-shade/40 p-3">
                      <div className="font-display text-[15px] text-forest">{nameLabel(m)}</div>
                      {alts(m) && <div className="text-[10px] text-margin-ink mt-0.5 italic leading-tight">{alts(m)}</div>}
                      <div className="text-[10px] uppercase tracking-[0.08em] text-margin-ink mt-0.5">{m.domain}</div>
                      <div className="text-[12px] mt-1 leading-[1.45]">{m.vibe}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {layout === "list" && (
        <ul className="space-y-2">
          {cast.map((m) => (
            <li key={m.role} className="border-b border-ink/10 py-2 text-[14px]">
              <div className="flex items-baseline gap-2 flex-wrap">
                <strong className="text-forest">{m.mystery ? `🔒 ??? · ${m.role}` : m.name ? `${m.name} · ${m.role}` : m.role}</strong>
                <span className="text-[10px] uppercase tracking-[0.08em] text-margin-ink">{m.domain}</span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.08em] text-margin-ink whitespace-nowrap">{m.pole}</span>
              </div>
              {alts(m) && <div className="text-[11px] text-margin-ink italic leading-tight">{alts(m)}</div>}
              <div className="text-[13px] text-ink-soft leading-[1.45] mt-0.5">{m.vibe}</div>
            </li>
          ))}
        </ul>
      )}

      {layout === "sheet" && (
        <>
          <p className="text-[11px] text-margin-ink mb-2">Hover a column header for what it means · click <span style={{ color: "#7a5c00" }}>★ EARNS</span> for the full-REL unlock.</p>
          <div className="overflow-x-auto border border-ink/30">
            <table className="w-full text-[12px] border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-paper-shade text-left align-bottom">
                  {SHEET_COLS.map((c) => (
                    <th key={c.label} className="relative group border-b-2 border-ink px-2 py-1.5">
                      <span className="font-sans text-[9px] uppercase tracking-[0.08em] text-margin-ink border-b border-dotted border-margin-ink cursor-help">{c.label}</span>
                      <span className="hidden group-hover:block absolute z-20 left-0 top-full mt-1 w-56 bg-paper border border-ink p-2 text-[10px] leading-[1.4] normal-case tracking-normal text-ink-soft font-sans shadow-md">{c.help}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cast.map((m, i) => (
                  <Fragment key={m.role}>
                    <tr className={`align-top ${i % 2 ? "bg-paper-shade/30" : ""}`}>
                      <td className="px-2 py-2 border-b border-ink/15">
                        <div className="font-display text-[13px] text-forest">{nameLabel(m)}</div>
                        {m.titles && m.titles.length > 1 && (
                          <div className="text-[9px] text-margin-ink italic leading-tight">{m.titles.filter((t) => t !== m.role).join(" · ")}</div>
                        )}
                      </td>
                      <td className="px-2 py-2 border-b border-ink/15 whitespace-nowrap">{m.pole}</td>
                      <td className="px-2 py-2 border-b border-ink/15 whitespace-nowrap font-bold">{m.stat ?? "—"}</td>
                      <td className="px-2 py-2 border-b border-ink/15 leading-[1.35]">{m.gift ?? "—"}</td>
                      <td className="px-2 py-2 border-b border-ink/15 leading-[1.35]">{m.climb ?? "—"}</td>
                      <td className="px-2 py-2 border-b border-ink/15 leading-[1.35]">
                        {m.legendary ? (
                          <button
                            onClick={() => setOpenRow(openRow === m.role ? null : m.role)}
                            className="text-left hover:underline cursor-pointer"
                            style={{ color: "#7a5c00" }}
                          >
                            ★ {m.legendary} <span className="text-margin-ink text-[10px]">{openRow === m.role ? "▾ less" : "▸ more"}</span>
                          </button>
                        ) : "—"}
                      </td>
                      <td className="px-2 py-2 border-b border-ink/15 leading-[1.35]">
                        {m.intimateTitle ? <><span className="font-bold">{m.intimateTitle}</span> · {m.passive}</> : "—"}
                      </td>
                    </tr>
                    {openRow === m.role && m.legendary && (
                      <tr className="bg-[#fbf6e8]">
                        <td colSpan={7} className="px-3 py-3 border-b-2 border-ink/40 text-[11px] leading-[1.5]">
                          <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-spot-red mb-1.5">Full-REL unlock · maxing {m.role}</div>
                          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                            <div><strong style={{ color: "#7a5c00" }}>★ {m.legendary}</strong> <span className="text-margin-ink">— legendary achievement · earned: {m.earnedOn}</span></div>
                            <div><strong>Keepsake:</strong> <i>{m.keepsake}</i> <span className="text-margin-ink">— legendary, mystery until earned ({m.keepsakeTease})</span></div>
                            <div><strong>Intimate title:</strong> {m.intimateTitle} <span className="text-margin-ink">— the deepest, in-voice term (non-romantic)</span></div>
                            <div><strong>Passive:</strong> {m.passive}</div>
                            {m.inversion && <div className="sm:col-span-2"><strong>Inversion (peer beat):</strong> {m.inversion}</div>}
                            <div className="sm:col-span-2"><strong>Mutual mode:</strong> {m.mutual}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {layout === "bible" && (
        <>
          <p className="text-[11px] text-margin-ink mb-3">The locked canonical sheets — the campaign&apos;s record. <span className="italic">Mirror of <code>docs/authored-beats/wingman/cast-bible.md</code>.</span></p>
          <div className="space-y-4">
            {cast.map((m) => m.mystery ? (
              <div key={m.role} className="border-2 border-dashed border-ink/50 bg-paper-shade/20 p-4">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div className="font-display text-[18px] text-margin-ink">??? <span className="text-[13px] font-normal">· {m.role}</span></div>
                  <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-spot-red border border-spot-red px-1.5 py-0.5">🔒 mystery</div>
                </div>
                {m.mysteryAppearance && <p className="text-[12px] text-ink-soft leading-[1.5] mt-2 italic">{m.mysteryAppearance}</p>}
                {m.unlockIf && m.unlockIf.length > 0 && (
                  <div className="text-[10px] text-margin-ink mt-2">Unlocks when earned: {m.unlockIf.map((a) => <code key={a} className="mr-1.5">{a}</code>)}</div>
                )}
                {m.vibe && <p className="text-[11px] text-margin-ink mt-1 leading-[1.5]">{m.vibe}</p>}
              </div>
            ) : (
              <div key={m.role} className="border-2 border-ink bg-paper-shade/30 p-4">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div className="font-display text-[18px] text-forest">{m.name ? <>{m.name} <span className="text-[13px] text-margin-ink font-normal">· {m.role}</span></> : m.role}</div>
                  <div className="font-sans text-[10px] uppercase tracking-[0.08em] text-margin-ink">{[m.stat, genderGlyph(m.gender), m.race && m.race !== "human" ? m.race : null, m.pole].filter(Boolean).join(" · ")}</div>
                </div>
                {m.introLine && <p className="text-[13px] italic text-spot-red leading-[1.5] mt-2 border-l-[3px] border-spot-red pl-3">&ldquo;{m.introLine}&rdquo;<span className="not-italic font-sans text-[9px] uppercase tracking-[0.1em] text-margin-ink ml-2">intro line</span></p>}
                {m.whoTheyAre && <p className="text-[12px] text-ink leading-[1.5] mt-2">{m.whoTheyAre}</p>}
                {m.voiceSamples && m.voiceSamples.length > 0 && (
                  <div className="mt-2">
                    <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-margin-ink">Voice</div>
                    <ul className="text-[12px] text-ink-soft leading-[1.5]">
                      {m.voiceSamples.map((v, i) => <li key={i} className="italic">&ldquo;{v}&rdquo;</li>)}
                    </ul>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2 mt-3 text-[11px] leading-[1.45]">
                  {m.neverSays && <div><div className="font-sans text-[9px] uppercase tracking-[0.1em] text-spot-red">Would never say</div><div className="text-ink-soft">{m.neverSays}</div></div>}
                  {m.alwaysNotices && <div><div className="font-sans text-[9px] uppercase tracking-[0.1em] text-forest">Always notices</div><div className="text-ink-soft">{m.alwaysNotices}</div></div>}
                </div>
                {(m.curriculum?.length || m.milestones?.length) ? (
                  <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2 mt-3 pt-3 border-t border-ink/15 text-[11px] leading-[1.45]">
                    {m.curriculum?.length ? (
                      <div>
                        <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-forest mb-0.5">The curriculum — fundamentals → peer</div>
                        <ol className="text-ink-soft list-decimal pl-4 space-y-0.5">{m.curriculum.map((c, i) => <li key={i}>{c}</li>)}</ol>
                      </div>
                    ) : null}
                    {m.milestones?.length ? (
                      <div>
                        <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-spot-red mb-0.5">Milestone reveals — the climb</div>
                        <ul className="text-ink-soft space-y-0.5">{m.milestones.map((ms, i) => <li key={i}><span className="text-margin-ink">{REL_TIERS[i] ?? `M${i + 1}`}:</span> {ms}</li>)}</ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="text-[10px] text-margin-ink mt-3 pt-2 border-t border-ink/15 leading-[1.6]">
                  <strong>titles:</strong> {(m.titles || []).join(" · ")}
                  {m.intimateTitle && <> · <strong>intimate:</strong> {m.intimateTitle}</>}
                  {m.legendary && <> · <strong>legendary:</strong> <span style={{ color: "#7a5c00" }}>★ {m.legendary}</span></>}
                  {m.keepsake && <> · <strong>keepsake:</strong> <i>{m.keepsake}</i></>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
