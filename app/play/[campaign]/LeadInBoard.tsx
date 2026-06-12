"use client";

// The FRONT DOOR — the sketch (website/public/frontdoor-ux-variations.html) built real
// (docs/design/front-door-interaction.md). EVERY pref is collected IN-GAME, no settings gate:
//  · NAME — the top-bar badge ("You are ___ ✎" → a popover input), set any time.
//  · PRONOUN — the diegetic identity beat (§3): the default lead reads you ("There {pron}—",
//    cut off; saved-pref-or-random); interrupt to correct (owned miss + ice-breaker) or let it
//    stand. Five safety rules by construction.
//  · NAMES-SHOW — the titleAsk micro-beat (§3.5): the lead introduces themselves (name + earned
//    title); your reply ("Nico." / "the Opener." / "Both work.") silently sets the display pref.
//  · PATH — who you walk toward (§4): the woven cast; the default lead owns the MAIN button;
//    tapping another name → a floating popover framed through the default's eyes (read + move).
// JUICE (§6): mechanic bottom-sheets (got-it continues seamlessly), achievements AT THE FOOT,
// 🏆/🎒 collectors. "?" → the portrait sheet (§6.5). DE-META: no UI instructions in-fiction.
// Graceful: campaigns missing identityRead/titleAsk/read simply skip those layers.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type LeadInHelper = { id: string; gift: string; look: string; glimpse: string; metaKind: string; metaText: string; firstImpression?: string; read?: string };
export type LeadInAction = { helperId: string; monologue: string; post: string };
export type LeadInCluster = { label: string; members: string[] };
// the "what are you here for?" hook (prefs-as-hooks): the gate-intake micro-beat at the
// bridge — the player's spoken reply grants `flag` (a hidden achievement the run's
// register variants read). Optional by design: the board always offers a quiet skip.
export type LeadInHereFor = { key: string; line: string; sub: string; post: string; flag: string };
export type LeadInData = {
  problem: string; motif: string; type: string; lean: string; environment: string;
  helpers: LeadInHelper[]; actions: LeadInAction[]; clusters: LeadInCluster[];
  defaultHelperId?: string; identityRead?: string; identityOwn?: string; titleAsk?: string;
  identityPattern?: string; // 'cutoff' (P1, default) | 'complete' (P2) | 'selfcatch' (P6) — diegetic-microbeat-patterns.md
  identityNameAsk?: string; // re-run R11: the P2 in-voice ask before the diegetic name field ("Then the name.")
  castInvite?: string; // the host's invitation on the woven board (playtest fix #12) — graceful skip
  welcomeMech?: { title: string; text: string }; // re-run R4: the campaign-flavored bridge welcome (empty → generic)
  welcomeAchBlurb?: string; // re-run R3: the per-campaign "On the Board" blurb (empty → generic)
  hereForAsk?: string; // the gate-intake ask at the bridge — empty → the beat is skipped
  hereForOptions?: LeadInHereFor[];
};
export type CastLite = { id?: string; name?: string; titles?: string[]; title?: string; appearance?: string };

// ── the onboarding juice (generic v1; campaign-flavored copy = the app port) ──
type Mech = { id: string; title: string; text: string };
type Ach = { id: string; title: string; blurb: string };
// re-run R4: the welcome fires ONCE at the BRIDGE (the lead-in→run seam), never mid-beat,
// so "This is your first move" (false there) is gone; campaigns may flavor it via leadIn.welcomeMech.
const MECH_WELCOME: Mech = { id: "how-it-works", title: "You're the main character", text: "Welcome — this is My Life is an RPG. It turns what you're actually working on in life into a story you play, with you as the lead. The people here are coaches for what you walked in with; what you say and who you step toward shapes the story and how they treat you. The bond grows as you outgrow needing it — short scenes, no streaks, no guilt." };
const ACH_WELCOME: Ach = { id: "first-call", title: "On the Board", blurb: "Your first call — the story's steering off you now." };
const ACH_OOPS: Ach = { id: "no-harm", title: "No Harm Done", blurb: "Set the lead straight inside ten seconds. They'll live — might even respect it." };
const ACKS: Record<string, string> = { he: "He it is.", she: "She it is.", they: "They it is.", name: "Just your name, then — which is?" };
const PRONS = ["he", "she", "they"] as const;
const PRON_LABELS: [string, string][] = [["he", "“He.”"], ["she", "“She.”"], ["they", "“They.”"], ["name", "“Just my name's fine.”"]];

type Sheet =
  | { kind: "mech"; mech: Mech; ach?: Ach }
  | { kind: "ach"; ach: Ach }
  | { kind: "portrait"; name: string; title: string; text: string }
  | { kind: "bag"; which: "mech" | "ach" };
type Pop =
  | { kind: "char"; id: string; x: number; y: number }
  | { kind: "name"; x: number; y: number };

export default function LeadInBoard({ leadIn, cast, startHref, dayUnit, firstDayTitle, pron, onPron, nm, onNm, onTd, onHf, reservedNames }: {
  leadIn: LeadInData; cast: CastLite[]; startHref: string;
  dayUnit?: string; firstDayTitle?: string; // the TRUE Day-1 unit + episode title (§10: the bridge never promises a chapter the run doesn't open)
  pron?: string | null; onPron?: (k: string) => void;
  nm?: string; onNm?: (v: string) => void;
  onTd?: (k: string) => void;
  onHf?: (flag: string) => void; // the "what are you here for?" pick (the flag id rides the run URL)
  reservedNames?: string[]; // cast + story-significant names → the gentle free-name collision note
}) {
  const [chosen, setChosen] = useState<string | null>(null); // helperId of the picked path
  // the identity beat → the titleAsk micro-beat → the board
  const hasBeat = !!(leadIn.identityRead && leadIn.identityOwn && leadIn.defaultHelperId);
  const [start, setStart] = useState<string>(() => (pron && PRONS.includes(pron as typeof PRONS[number]) ? pron : PRONS[Math.floor(Math.random() * 3)]));
  const [idDone, setIdDone] = useState(!hasBeat);
  const [correcting, setCorrecting] = useState(false);
  const [ownAck, setOwnAck] = useState<string | null>(null);
  const [nameAsking, setNameAsking] = useState(false); // re-run R11: the P2 name-ask intermediate state
  const [titleAskDone, setTitleAskDone] = useState(!leadIn.titleAsk);
  // the "what are you here for?" beat: null = unanswered; "" = the quiet skip; else the picked post
  const [hfPost, setHfPost] = useState<string | null>(null);
  // the juice
  const [welcomed, setWelcomed] = useState(false);
  const [mechs, setMechs] = useState<Mech[]>([]);
  const [achs, setAchs] = useState<Ach[]>([]);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [pop, setPop] = useState<Pop | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const byId = (id: string) => cast.find((c) => c.id === id);
  const nameOf = (id: string) => byId(id)?.name ?? id;
  const titleOf = (id: string) => byId(id)?.titles?.[0] ?? byId(id)?.title ?? "your lead";

  const helperIds = new Set(leadIn.helpers.map((h) => h.id));
  const chosenAction = chosen ? leadIn.actions.find((a) => a.helperId === chosen) : null;
  const defaultId = leadIn.defaultHelperId && helperIds.has(leadIn.defaultHelperId) ? leadIn.defaultHelperId : null;
  const defaultAction = defaultId ? leadIn.actions.find((a) => a.helperId === defaultId) : null;
  const actionOf = (id: string) => leadIn.actions.find((a) => a.helperId === id);
  const helperOf = (id: string) => leadIn.helpers.find((h) => h.id === id);

  const grantAch = (a: Ach) => setAchs((xs) => (xs.find((x) => x.id === a.id) ? xs : [...xs, a]));
  const grantMech = (m: Mech) => setMechs((xs) => (xs.find((x) => x.id === m.id) ? xs : [...xs, m]));
  // re-run R4: the welcome sheet fires ONCE on first arrival at the BRIDGE — the seam
  // between the lead-in fiction and the run (already typographic game-chrome), never
  // between a beat's setup and payoff. Campaign-flavored when leadIn carries copy;
  // the transparent catcher keeps the chapter card visible behind it.
  const welcomeMech: Mech = leadIn.welcomeMech?.title && leadIn.welcomeMech?.text
    ? { id: MECH_WELCOME.id, title: leadIn.welcomeMech.title, text: leadIn.welcomeMech.text }
    : MECH_WELCOME;
  const welcomeAch: Ach = leadIn.welcomeAchBlurb ? { ...ACH_WELCOME, blurb: leadIn.welcomeAchBlurb } : ACH_WELCOME;
  const atBridge = !!chosenAction;
  useEffect(() => {
    if (atBridge && !welcomed) {
      setWelcomed(true); grantMech(welcomeMech); grantAch(welcomeAch);
      setSheet({ kind: "mech", mech: welcomeMech, ach: welcomeAch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atBridge, welcomed]);
  const closeSheet = () => setSheet(null);
  // anchor a floating popover under the clicked element, relative to the stage
  const popAt = (e: React.MouseEvent, p: { kind: "char"; id: string } | { kind: "name" }) => {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const s = stageRef.current?.getBoundingClientRect();
    setPop({ ...p, x: Math.max(0, r.left - (s?.left ?? 0)), y: r.bottom - (s?.top ?? 0) + 6 });
  };

  const S = {
    catcher: { position: "fixed" as const, inset: 0, zIndex: 80, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 16px 18px", background: "transparent" },
    card: { position: "relative" as const, maxWidth: 380, width: "100%", background: "var(--paper)", border: "2px solid var(--forest)", boxShadow: "5px 5px 0 rgba(45,74,43,.25)", padding: "16px 16px 14px" },
    close: { position: "absolute" as const, top: 7, right: 9, fontSize: 17, lineHeight: 1, color: "var(--margin-ink)", background: "none", border: "none", cursor: "pointer", padding: 2 },
    lab: { fontFamily: "var(--theme-body)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase" as const, color: "var(--forest)", marginBottom: 7 },
    title: { fontFamily: "var(--theme-display)", fontSize: 22, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.08 },
    text: { fontSize: 14, color: "var(--ink)", margin: "0 0 14px", lineHeight: 1.5 },
    btn: { fontFamily: "var(--theme-display)", fontSize: 14, letterSpacing: ".04em", padding: "8px 22px", background: "var(--forest)", color: "var(--paper)", border: "2px solid var(--forest)", cursor: "pointer" },
    foot: { display: "block", width: "100%", textAlign: "left" as const, marginTop: 13, padding: "11px 0 0", border: "none", borderTop: "1px solid var(--ink-soft)", background: "none", fontSize: 12, color: "var(--gold, #9a7b1f)", cursor: "pointer" },
    ta: { display: "block", width: "100%", textAlign: "left" as const, fontFamily: "var(--theme-body)", fontSize: 15, color: "var(--forest)", background: "transparent", border: "none", padding: "7px 0", cursor: "pointer" },
    taSub: { display: "block", fontSize: 11.5, color: "var(--margin-ink)", fontStyle: "italic" as const, margin: "1px 0 0 14px" },
    gold: { color: "var(--gold, #9a7b1f)", fontWeight: 600 } as React.CSSProperties,
  };

  // A free-typed name that the story also uses (cast or story-significant —
  // e.g. Maya) gets a gentle, non-blocking, non-spoiler note (Gemini-vetted):
  // never a block, never a hint at whose it is, no rename pressure.
  const nameCollides = !!(nm ?? "").trim() &&
    (reservedNames ?? []).some((r) => r.toLowerCase() === (nm ?? "").trim().toLowerCase());
  const collisionNote = nameCollides ? (
    <div style={{ fontSize: 10.5, color: "var(--margin-ink)", fontStyle: "italic", marginTop: 4 }}>
      that name is also part of this story — yours to keep, or change any time
    </div>
  ) : null;

  const achFoot = (a: Ach) => (
    <button onClick={(e) => { e.stopPropagation(); setSheet({ kind: "ach", ach: a }); }} style={S.foot}>
      🏆 achievement unlocked · <b style={{ color: "var(--ink)" }}>{a.title}</b> →
    </button>
  );

  const sheetEl = sheet && (
    <div style={S.catcher} onClick={(e) => { if (e.target === e.currentTarget) closeSheet(); }}>
      <div style={S.card}>
        <button onClick={closeSheet} style={S.close} aria-label="close">✕</button>
        {sheet.kind === "mech" && (<>
          <div style={S.lab}>⚙ mechanic unlocked</div>
          <div style={S.title}>{sheet.mech.title}</div>
          <p style={S.text}>{sheet.mech.text}</p>
          <button onClick={closeSheet} style={S.btn}>got it</button>
          {sheet.ach && achFoot(sheet.ach)}
        </>)}
        {sheet.kind === "ach" && (<>
          <div style={S.lab}>🏆 achievement unlocked</div>
          <div style={S.title}>{sheet.ach.title}</div>
          <p style={S.text}>{sheet.ach.blurb}</p>
          <button onClick={() => setSheet(null)} style={S.btn}>got it</button>
        </>)}
        {sheet.kind === "portrait" && (<>
          <div style={S.lab}>▢ portrait · {sheet.name}, {sheet.title}</div>
          <p style={{ ...S.text, fontStyle: "italic", border: "1.5px solid var(--ink-soft)", padding: "12px 13px", background: "var(--paper-shade)" }}>{sheet.text}</p>
          <p style={{ fontSize: 10.5, color: "var(--margin-ink)", fontStyle: "italic", margin: 0 }}>art-facing impression — the seed of a character gallery</p>
        </>)}
        {sheet.kind === "bag" && (<>
          <div style={S.lab}>{sheet.which === "mech" ? "🎒 mechanics" : "🏆 achievements"}</div>
          {(sheet.which === "mech" ? mechs : achs).map((x) => (
            <div key={x.id} style={{ marginBottom: 10 }}>
              <b style={{ fontSize: 13 }}>{x.title}</b>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{"text" in x ? (x as Mech).text : (x as Ach).blurb}</div>
            </div>
          ))}
        </>)}
      </div>
    </div>
  );

  // the floating popover (char reads / the name field) — anchored in the stage, dark like the sketch
  const popEl = pop && (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 58 }} onClick={() => setPop(null)} />
      <div style={{ position: "absolute", zIndex: 60, left: Math.max(0, Math.min(pop.x, 380)), top: pop.y, width: 300, maxWidth: "92vw", background: "var(--ink)", color: "var(--paper)", padding: "12px 13px", border: "1px solid #000", boxShadow: "4px 4px 0 rgba(0,0,0,.2)", fontSize: 14, lineHeight: 1.45 }}>
        {pop.kind === "char" && (() => {
          const id = pop.id; const c = byId(id); const h = helperOf(id);
          return (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--theme-body)", fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: "#c9b98a", marginBottom: 7 }}>
                <span style={{ flex: 1, lineHeight: 1.3 }}>{nameOf(id)} · {titleOf(id)}</span>
                {c?.appearance && (
                  <button onClick={(e) => { e.stopPropagation(); setSheet({ kind: "portrait", name: nameOf(id), title: titleOf(id), text: c.appearance! }); }}
                    title="what they look like" aria-label="appearance"
                    style={{ flex: "none", width: 17, height: 17, lineHeight: "14px", textAlign: "center", border: "1px solid rgba(201,185,138,.4)", borderRadius: "50%", background: "none", color: "#c9b98a", fontSize: 11, cursor: "pointer", padding: 0 }}>?</button>
                )}
              </div>
              {/* playtest fix #10: the lean-in hooks (glimpse + meta) render — the door's
                  best open loops were dead data. All lines authored + vetted in canon. */}
              {id === defaultId
                ? (<>
                    <p style={{ fontStyle: "italic", fontSize: 13.5, color: "#efe7d4", margin: 0 }}>{h?.firstImpression || h?.look}</p>
                    {h?.glimpse && <p style={{ fontStyle: "italic", fontSize: 12.5, color: "#c9bfa6", margin: "6px 0 0" }}>{h.glimpse}</p>}
                    {/* re-run R11: the default lead's knot/echo hook renders too — on an
                        N=1 door this is the only curiosity loop the board has. */}
                    {h?.metaText && <p style={{ fontSize: 11, color: "#a59c84", margin: "6px 0 0" }}>{h.metaKind === "echo" ? "↩ " : "◈ "}{h.metaText}</p>}
                  </>)
                : (<>
                    {h?.glimpse && <p style={{ fontStyle: "italic", fontSize: 12.5, color: "#c9bfa6", margin: "0 0 6px" }}>{h.glimpse}</p>}
                    {h?.read && <p style={{ fontStyle: "italic", fontSize: 13.5, color: "#efe7d4", margin: "0 0 4px" }}>{h.read}</p>}
                    {h?.metaText && <p style={{ fontSize: 11, color: "#a59c84", margin: "6px 0 0" }}>{h.metaKind === "echo" ? "↩ " : "◈ "}{h.metaText}</p>}
                    {actionOf(id) && (
                      <button onClick={() => { setPop(null); setChosen(id); }}
                        style={{ display: "block", width: "100%", textAlign: "left", font: "inherit", fontSize: 13.5, padding: "9px 11px", background: "var(--spot-red)", color: "#fff", border: "1px solid #000", cursor: "pointer", marginTop: 8 }}>
                        → &ldquo;{actionOf(id)!.monologue}&rdquo;
                        <span style={{ display: "block", fontSize: 10.5, opacity: 0.8, marginTop: 2 }}>walk toward {nameOf(id)}, {titleOf(id)}</span>
                      </button>
                    )}
                  </>)}
            </>
          );
        })()}
        {pop.kind === "name" && (
          <>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 8.5, letterSpacing: ".12em", textTransform: "uppercase", color: "#c9b98a", marginBottom: 7 }}>your name — set once, used everywhere</div>
            <input autoFocus value={nm ?? ""} onChange={(e) => onNm?.(e.target.value)} placeholder="your name (optional)" maxLength={20}
              style={{ font: "inherit", fontSize: 13, padding: "5px 9px", border: "1.5px solid #5a5446", background: "#2a2a26", color: "#e7e0cf", width: "100%" }} />
            <div style={{ fontSize: 11.5, color: "#a59c84", marginTop: 7 }}>blank → the story just says &ldquo;you.&rdquo;</div>
            {nameCollides && (
              <div style={{ fontSize: 11, color: "#a59c84", fontStyle: "italic", marginTop: 5 }}>
                that name is also part of this story — yours to keep, or change any time
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  // ── the top bar: collectors + the name badge (the NAME pref lives here, in-frame) ──
  const pronShown = pron && PRONS.includes(pron as typeof PRONS[number]) ? pron : null;
  const topbar = (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, padding: "0 2px 8px" }}>
      {achs.length > 0 && <button onClick={() => setSheet({ kind: "bag", which: "ach" })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", fontSize: 13 }}>🏆 <b style={{ color: "var(--forest)" }}>{achs.length}</b></button>}
      {mechs.length > 0 && <button onClick={() => setSheet({ kind: "bag", which: "mech" })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", fontSize: 13 }}>🎒 <b style={{ color: "var(--forest)" }}>{mechs.length}</b></button>}
      <button onClick={(e) => popAt(e, { kind: "name" })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--ink-soft)", whiteSpace: "nowrap", padding: "2px 0" }}>
        You are <b style={{ color: "var(--forest)" }}>{(nm ?? "").trim() || "you"}</b>
        {pronShown && <i style={{ color: "var(--gold, #9a7b1f)" }}> ({pronShown})</i>} <span style={{ color: "var(--gold, #9a7b1f)", fontSize: 11 }}>✎</span>
      </button>
    </div>
  );

  const sceneHead = (
    <>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--margin-ink)", borderBottom: "1px dotted var(--ink-soft)", paddingBottom: 6, marginBottom: 12 }}>▦ {leadIn.motif}</div>
      <div style={{ border: "1.5px dashed var(--spot-red)", background: "var(--paper-shade)", padding: "9px 12px", marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--theme-body)", fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--spot-red)", marginBottom: 3 }}>What you walked in with</div>
        <p style={{ margin: 0, fontSize: 14, fontStyle: "italic", color: "var(--ink)" }}>{leadIn.problem}</p>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink)", margin: "0 0 12px" }}>{leadIn.environment}</p>
    </>
  );

  const wrap = (body: React.ReactNode) => (
    <div ref={stageRef} style={{ position: "relative", marginTop: 8 }}>
      {topbar}
      <div style={{ background: "var(--paper)", border: "2px solid var(--ink)", boxShadow: "5px 5px 0 rgba(0,0,0,.08)", padding: "16px 16px 22px", minHeight: 300 }}>
        {body}
      </div>
      {popEl}
      {sheetEl}
    </div>
  );

  // ── the BRIDGE: post-message → the TRUE first-day card → BEGIN (playtest fix #1A:
  // the real dayUnit + the real Day-1 episode title; never a routed-chapter promise
  // until the per-helper prologues are authored — §10 Sunset) ──
  if (chosenAction) {
    const bridgeTitle = firstDayTitle || titleOf(chosenAction.helperId);
    // the "what are you here for?" gate-intake beat (prefs-as-hooks): asked once at
    // the bridge, after the path pick — the reply's flag rides the run URL and the
    // campaign's register variants read it. Skippable in-fiction (no forced pref).
    const hereFor = leadIn.hereForOptions ?? [];
    const hfActive = !!(leadIn.hereForAsk && hereFor.length);
    const hfDone = !hfActive || hfPost !== null;
    return wrap(
      <div>
        <p style={{ fontSize: 15.5, lineHeight: 1.65, fontStyle: "italic", color: "var(--ink)", margin: "0 0 22px" }}>{chosenAction.post}</p>
        {hfActive && !hfDone && (
          <div style={{ borderLeft: "2px solid var(--forest)", paddingLeft: 11, margin: "0 0 22px" }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink)", margin: "0 0 6px" }}>{leadIn.hereForAsk}</p>
            {hereFor.map((o) => (
              <button key={o.key} onClick={() => { onHf?.(o.flag); setHfPost(o.post); }} style={{ ...S.ta, color: "var(--ink)" }}>
                <span style={S.gold}>&gt; </span>&ldquo;{o.line}&rdquo;
                <span style={S.taSub}>{o.sub}</span>
              </button>
            ))}
            <button onClick={() => setHfPost("")}
              style={{ ...S.ta, fontSize: 13, color: "var(--margin-ink)", borderTop: "1px solid var(--ink-soft)", paddingTop: 9, marginTop: 6 }}>
              <span style={S.gold}>&gt; </span>(say nothing — let the nights find their own size)
            </button>
          </div>
        )}
        {hfActive && hfPost ? (
          <div style={{ borderLeft: "2px solid var(--spot-red)", paddingLeft: 11, margin: "0 0 22px" }}>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, fontStyle: "italic", color: "var(--ink)", margin: 0 }}>{hfPost}</p>
          </div>
        ) : null}
        {hfDone && (
          <div style={{ textAlign: "center", borderTop: "1px solid var(--ink-soft)", paddingTop: 16 }}>
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, letterSpacing: ".34em", color: "var(--margin-ink)" }}>{(dayUnit || "DAY").toUpperCase()} 1</div>
            <div style={{ fontFamily: "var(--theme-display)", fontSize: 30, lineHeight: 1.05, color: "var(--spot-red)", margin: "3px 0 2px", textTransform: "capitalize" }}>{bridgeTitle}</div>
            <Link href={`${startHref}&leadIn=${chosenAction.helperId}`}
              style={{ display: "inline-block", marginTop: 18, fontFamily: "var(--theme-display)", fontSize: 16, letterSpacing: ".06em", padding: "10px 26px", background: "var(--forest)", color: "var(--paper)", textDecoration: "none", border: "2px solid var(--forest)" }}>
              BEGIN ›
            </Link>
          </div>
        )}
        <button onClick={() => { setChosen(null); setHfPost(null); onHf?.(""); }} style={{ display: "block", margin: "16px auto 0", fontFamily: "var(--theme-body)", fontSize: 12, background: "transparent", border: "none", color: "var(--margin-ink)", cursor: "pointer", textDecoration: "underline" }}>
          ← step back
        </button>
      </div>
    );
  }

  // The diegetic name-capture row, shared by the P1 ack branch and the P2 name-ask
  // (re-run R11): a spoken-reply field wired to the badge state; blank stays honest.
  const nameFieldRow = (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "8px 0 0" }}>
      <span style={{ ...S.gold, fontFamily: "var(--theme-body)", fontSize: 15 }}>&gt; </span>
      <span style={{ fontSize: 14, color: "var(--ink)", fontStyle: "italic" }}>You give it:</span>
      <input autoFocus value={nm ?? ""} onChange={(ev) => onNm?.(ev.target.value)} placeholder="your name" maxLength={20}
        style={{ font: "inherit", fontSize: 14, padding: "3px 8px", border: "none", borderBottom: "1.5px solid var(--ink-soft)", background: "transparent", color: "var(--ink)", width: 130 }} />
      <span style={{ fontSize: 10.5, color: "var(--margin-ink)", fontStyle: "italic" }}>or don&rsquo;t — the story just says &ldquo;you&rdquo;</span>
    </div>
  );
  const nameFieldWithNote = (
    <div>
      {nameFieldRow}
      {collisionNote}
    </div>
  );

  // ── PHASE 1 · P2 "COMPLETE" / P6 "SELF-CATCH": the MC supplies the word.
  // P2: the lead stops where the word goes (setup = the read up to {pron}).
  // P6: the lead starts the guess and catches THEMSELVES — the {pron} never lands,
  // so the FULL read renders with the token stripped (the catch lives in the prose:
  // "There—— no.") and converts to an ask. Either way nothing is ever voiced wrong,
  // so there's no correction loop and no oops achievement; identityOwn plays as the
  // post (an {ack} token is replaced if present). ──
  if (!idDone && (leadIn.identityPattern === "complete" || leadIn.identityPattern === "selfcatch") && leadIn.identityRead && defaultId) {
    const setup = leadIn.identityPattern === "selfcatch"
      ? (leadIn.identityRead ?? "").split("{pron}").join("")
      : (leadIn.identityRead ?? "").split("{pron}")[0];
    // playtest fix #2: the word lands IMMEDIATELY (never a tutorial sheet between the
    // oath word and Roan's pen); the welcome sheet fires on the beat-RESOLUTION exit.
    // re-run R11: the "name" pick routes through the in-voice ask + the diegetic name
    // field, so identityOwn ("He writes it without comment…") lands TRUE.
    const supply = (k: string) => {
      onPron?.(k);
      if (k === "name" && leadIn.identityNameAsk) { setNameAsking(true); return; }
      setOwnAck(ACKS[k]);
    };
    return wrap(
      <div>
        {sceneHead}
        <div style={{ borderLeft: "2px solid var(--forest)", paddingLeft: 11, margin: "10px 0" }}>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>{setup}</p>
        </div>
        {ownAck ? (
          <div style={{ borderLeft: "2px solid var(--spot-red)", paddingLeft: 11, margin: "10px 0" }}>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, fontStyle: "italic", color: "var(--ink)", margin: 0 }}>
              {(leadIn.identityOwn ?? "").replace("{ack}", ownAck)}
            </p>
            <button onClick={() => setIdDone(true)} style={S.ta}>
              <span style={S.gold}>&gt; </span>go on
            </button>
          </div>
        ) : nameAsking ? (
          <div style={{ borderLeft: "2px solid var(--forest)", paddingLeft: 11, margin: "10px 0" }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>{leadIn.identityNameAsk}</p>
            {nameFieldWithNote}
            <button onClick={() => { setNameAsking(false); setOwnAck(ACKS.name); }} style={S.ta}>
              <span style={S.gold}>&gt; </span>go on
            </button>
          </div>
        ) : (
          <div style={{ margin: "6px 0 0" }}>
            {PRON_LABELS.map(([k, label]) => (
              <button key={k} onClick={() => supply(k)} style={{ ...S.ta, color: "var(--ink)" }}>
                <span style={S.gold}>&gt; </span>{label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── PHASE 1 · P1 "CUT-OFF": the diegetic identity beat (§3) ──
  if (!idDone && hasBeat && defaultId) {
    const [pre, postRead] = (leadIn.identityRead ?? "").split("{pron}");
    const finish = (k: string) => { onPron?.(k); setIdDone(true); setCorrecting(false); };
    return wrap(
      <div>
        {sceneHead}
        <div style={{ borderLeft: "2px solid var(--forest)", paddingLeft: 11, margin: "10px 0" }}>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>
            {pre}<b><i>{start}</i></b><span style={{ color: "var(--margin-ink)" }}>{postRead}</span>
          </p>
        </div>

        {ownAck ? (
          <div style={{ borderLeft: "2px solid var(--spot-red)", paddingLeft: 11, margin: "10px 0" }}>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, fontStyle: "italic", color: "var(--ink)", margin: 0 }}>
              {(leadIn.identityOwn ?? "").replace("{ack}", ownAck)}
            </p>
            {/* playtest fix #4: "Just my name's fine" now COLLECTS the name, diegetically —
                the shared spoken-reply row (re-run R11); blank stays honest ("you"). */}
            {ownAck === ACKS.name && nameFieldWithNote}
            <button onClick={() => setIdDone(true)} style={S.ta}>
              <span style={S.gold}>&gt; </span>go on
            </button>
            {achFoot(ACH_OOPS)}
          </div>
        ) : correcting ? (
          <div style={{ margin: "6px 0 0" }}>
            {PRON_LABELS.filter(([k]) => k !== start).map(([k, label]) => (
              <button key={k} onClick={() => { grantAch(ACH_OOPS); onPron?.(k); setOwnAck(ACKS[k]); }} style={{ ...S.ta, color: "var(--ink)" }}>
                <span style={S.gold}>&gt; </span>{label}
              </button>
            ))}
            <button onClick={() => finish(start)}
              style={{ ...S.ta, fontSize: 13, color: "var(--margin-ink)", borderTop: "1px solid var(--ink-soft)", paddingTop: 9, marginTop: 6 }}>
              <span style={S.gold}>&gt; </span>(just continue…)
            </button>
          </div>
        ) : (
          <div style={{ margin: "6px 0 0" }}>
            {/* playtest fix #2: the interrupt lands instantly — the welcome sheet
                fires when the read RESOLVES, never between setup and payoff. */}
            <button onClick={() => setCorrecting(true)} style={S.ta}>
              <span style={S.gold}>&gt; </span>&ldquo;Actually—&rdquo;
              <span style={S.taSub}>cut them off before they finish</span>
            </button>
            <button onClick={() => finish(start)} style={S.ta}>
              <span style={S.gold}>&gt; </span>Let them continue
              <span style={S.taSub}>let the read stand</span>
            </button>
            {/* playtest fix #8: the demo reroll (dev-speak at the most trust-sensitive beat) is gone. */}
          </div>
        )}
      </div>
    );
  }

  // ── PHASE 1.5: the names-show micro-beat (§3.5 — the lead introduces themselves) ──
  if (!titleAskDone && leadIn.titleAsk && defaultId) {
    const pick = (k: string) => { onTd?.(k); setTitleAskDone(true); };
    return wrap(
      <div>
        {sceneHead}
        <div style={{ borderLeft: "2px solid var(--forest)", paddingLeft: 11, margin: "10px 0" }}>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>{leadIn.titleAsk}</p>
        </div>
        <div style={{ margin: "6px 0 0" }}>
          <button onClick={() => pick("name")} style={{ ...S.ta, color: "var(--ink)" }}>
            <span style={S.gold}>&gt; </span>&ldquo;{nameOf(defaultId)}.&rdquo;
          </button>
          <button onClick={() => pick("title")} style={{ ...S.ta, color: "var(--ink)" }}>
            <span style={S.gold}>&gt; </span>&ldquo;{titleOf(defaultId)}.&rdquo;
          </button>
          <button onClick={() => pick("both")} style={{ ...S.ta, color: "var(--ink)" }}>
            <span style={S.gold}>&gt; </span>&ldquo;Both work.&rdquo;
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE 2: the woven Scene Board (§4 — the sketch shape) ──
  // playtest fix #11: the separator goes BETWEEN helpers (final "."), never dangling.
  const woven = leadIn.helpers.map((h, i) => (
    <span key={h.id}>
      <button onClick={(e) => popAt(e, { kind: "char", id: h.id })}
        style={{ font: "inherit", fontSize: "inherit", fontWeight: 600, color: "var(--forest)", background: "none", border: "none", borderBottom: "1.5px dotted var(--forest)", cursor: "pointer", padding: 0, whiteSpace: "nowrap" }}>
        {nameOf(h.id)}
      </button>
      {", "}{h.look.replace(/\.$/, "")}
      {i < leadIn.helpers.length - 1 ? "; " : "."}
    </span>
  ));
  const soloHelper = leadIn.helpers.length === 1;

  return wrap(
    <div>
      {sceneHead}
      {leadIn.castInvite && (
        <p style={{ fontSize: 13.5, lineHeight: 1.55, fontStyle: "italic", color: "var(--ink)", margin: "0 0 8px" }}>{leadIn.castInvite}</p>
      )}
      <p style={{ fontSize: 14.5, lineHeight: 1.62, color: "var(--ink)", margin: "0 0 6px" }}>
        Around you: {woven}
      </p>
      {/* playtest fix #11: the convergence line only makes sense with company (N>1). */}
      <p style={{ fontSize: 13.5, color: "var(--margin-ink)", fontStyle: "italic", margin: "10px 0 14px" }}>
        {soloHelper
          ? <>{nameOf(leadIn.helpers[0].id)} is the one you walk toward first tonight. Nothing here moves until you do.</>
          : <>One of them is the one you walk toward first tonight. The others don&rsquo;t go anywhere.</>}
      </p>
      {defaultId && defaultAction ? (
        <button onClick={() => setChosen(defaultId)}
          style={{ display: "block", width: "100%", textAlign: "left", background: "var(--paper-shade)", border: "2px solid var(--forest)", padding: "13px 15px", cursor: "pointer", boxShadow: "3px 3px 0 rgba(45,74,43,.15)" }}>
          <span style={{ display: "block", fontSize: 15, fontStyle: "italic", color: "var(--ink)" }}>&ldquo;{defaultAction.monologue}&rdquo;</span>
          <span style={{ display: "block", fontSize: 13, color: "var(--forest)", marginTop: 6, fontWeight: 600 }}>▶ walk toward {nameOf(defaultId)}, {titleOf(defaultId)}</span>
        </button>
      ) : (
        <div>
          {leadIn.actions.map((a) => (
            <button key={a.helperId} onClick={() => setChosen(a.helperId)}
              style={{ display: "block", width: "100%", textAlign: "left", fontFamily: "var(--theme-body)", fontSize: 15, fontStyle: "italic", background: "transparent", border: "1.5px solid var(--ink-soft)", padding: "11px 14px", margin: "0 0 8px", cursor: "pointer", color: "var(--ink)" }}>
              &ldquo;{a.monologue}&rdquo; <span style={{ color: "var(--spot-red)", fontStyle: "normal", fontWeight: 600 }}>›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
