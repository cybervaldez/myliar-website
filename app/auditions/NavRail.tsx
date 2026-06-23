"use client";
// THE NAV RAIL — the persistent left navigation for the SHELL layout (hidden in column/dashboard via CSS).
// Reads the route, lists every campaign + the current campaign's pipeline steps + its scene branches, so
// you can jump anywhere without scrolling back to the top.
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { campaignKeys, CAMPAIGNS, STEP_DEFS, stepNo, hasStep, isSeed, sceneBranchesFor, daysFor, hasPrelude, hasFrontDoor, hasPrequel, audienceKeyFor, AUDIENCE_GROUPS } from "./registry";

export default function NavRail() {
  const path = usePathname() || "";
  const [open, setOpen] = useState(false);                 // mobile drawer (no-op ≥1024px where the rail is fixed)
  useEffect(() => { setOpen(false); }, [path]);            // navigating closes the drawer
  const parts = path.split("/").filter(Boolean); // ["auditions", <campaign>, <step>, <scene>?, "day", <n>?]
  const campaign = parts[1] && CAMPAIGNS[parts[1]] ? parts[1] : null;
  const step = parts[2];
  const scene = parts[2] === "scenes" ? parts[3] : undefined;
  const day = parts[2] === "scenes" && parts[4] === "day" ? parts[5] : undefined;
  const onPrelude = parts[2] === "scenes" && parts[4] === "prelude"; // scene === b.key holds in the chip block
  const onFrontDoor = parts[2] === "scenes" && parts[4] === "front-door";

  // jumping campaigns PRESERVES the current step — clicking "Night Ferry" while on room/scenes opens
  // ferry/scenes (not the spine). Falls back to the spine if that campaign doesn't have the step.
  const jumpTo = (ck: string) => {
    if (step && STEP_DEFS.some((s) => s.key === step) && (hasStep(ck, step) || (isSeed(ck) && step === "scenes"))) return `/auditions/${ck}/${step}`;
    return `/auditions/${ck}`;
  };

  const Link = ({ href, label, on, indent = 0, dim = false }: { href: string; label: string; on: boolean; indent?: number; dim?: boolean }) => (
    <a href={href} style={{ display: "block", textDecoration: "none", padding: "3px 7px", paddingLeft: 7 + indent * 12, fontSize: indent ? 11 : 11.5, lineHeight: 1.35, color: on ? "var(--forest)" : dim ? "var(--margin-ink)" : "var(--ink)", fontWeight: on ? 700 : 400, background: on ? "var(--paper)" : "transparent", borderLeft: `2px solid ${on ? "var(--forest)" : "transparent"}` }}>{label}</a>
  );

  return (
    <>
    <button className="aud-hamburger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "✕" : "☰"}</button>
    {open && <div className="aud-rail-backdrop" onClick={() => setOpen(false)} />}
    <nav className={`aud-nav-rail${open ? " open" : ""}`}>
      <a href="/auditions" style={{ display: "block", fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", color: "var(--spot-red)", textDecoration: "none", padding: "0 7px 10px", borderBottom: "1px solid var(--ink-soft)", marginBottom: 8 }}>↑ THE AUDITIONS</a>
      {[...campaignKeys()].sort((a, b) => Object.keys(AUDIENCE_GROUPS).indexOf(audienceKeyFor(a)) - Object.keys(AUDIENCE_GROUPS).indexOf(audienceKeyFor(b))).map((ck, i, arr) => {
        const c = CAMPAIGNS[ck];
        const onC = ck === campaign;
        const seed = isSeed(ck);
        const ak = audienceKeyFor(ck);
        const firstOfGroup = !arr.slice(0, i).some((k) => audienceKeyFor(k) === ak);
        const grp = AUDIENCE_GROUPS[ak] ?? AUDIENCE_GROUPS["worn-down"];
        return (
          <div key={ck}>
          {firstOfGroup && (
            <div style={{ fontFamily: "var(--theme-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", color: "var(--forest)", padding: i ? "8px 7px 0" : "0 7px", marginTop: i ? 10 : 2, marginBottom: 4, borderTop: i ? "1px solid var(--ink-soft)" : "none", lineHeight: 1.3 }}>{grp.title}</div>
          )}
          <div style={{ marginBottom: onC ? 9 : 1 }}>
            <Link href={jumpTo(ck)} label={c.label} on={onC && !step} />
            {onC && hasPrequel(ck) && (
              <a href={`/auditions/${ck}/prequel`} title="The Prequel — the optional cast companion (read before the prelude)" style={{ display: "block", textDecoration: "none", padding: "2px 7px", paddingLeft: 19, fontSize: 10.5, lineHeight: 1.35, color: step === "prequel" ? "var(--paper)" : "#7a5b9a", background: step === "prequel" ? "#7a5b9a" : "transparent", borderLeft: `2px solid ${step === "prequel" ? "#7a5b9a" : "transparent"}`, fontWeight: step === "prequel" ? 700 : 400 }}>📖 Prequel <span style={{ fontStyle: "italic", opacity: .75 }}>· the cast, before you</span></a>
            )}
            {onC && STEP_DEFS.map((s) => {
              if (!hasStep(ck, s.key) && !seed) return null;
              const folded = seed && s.key !== "scenes";
              const onS = s.key === step;
              return (
                <div key={s.key}>
                  {folded
                    ? <span style={{ display: "block", padding: "2px 7px", paddingLeft: 19, fontSize: 10.5, color: "var(--margin-ink)", opacity: 0.6 }}>{stepNo(s.key)} {s.label.replace(/^The /, "")} · seed</span>
                    : <Link href={`/auditions/${ck}/${s.key}`} label={`${stepNo(s.key)} ${s.label.replace(/^The /, "")}`} on={onS} indent={1} />}
                  {s.key === "scenes" && onS && sceneBranchesFor(ck).map((b) => {
                    const nDays = scene === b.key ? daysFor(ck, b.key) : 0;
                    return (
                      <div key={b.key}>
                        <Link href={`/auditions/${ck}/scenes/${b.key}`} label={`↳ ${b.label}`} on={scene === b.key && !day && !onPrelude} indent={2} dim />
                        {scene === b.key && nDays > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "1px 2px", padding: "1px 7px 2px 43px" }}>
                            {hasPrelude(ck, b.key) && (
                              <a href={`/auditions/${ck}/scenes/${b.key}/prelude`} title="The Prelude — the book cover (browse / sell)"
                                style={{ fontSize: 9, lineHeight: 1.3, padding: "1px 5px", textDecoration: "none", borderRadius: 3, letterSpacing: ".03em",
                                  color: onPrelude ? "var(--paper)" : "#7a5b9a", background: onPrelude ? "#7a5b9a" : "transparent",
                                  border: `1px solid ${onPrelude ? "#7a5b9a" : "var(--ink-soft)"}`, fontWeight: onPrelude ? 700 : 400 }}>PRELUDE</a>
                            )}
                            {hasFrontDoor(ck, b.key) && (
                              <a href={`/auditions/${ck}/scenes/${b.key}/front-door`} title="The Front Door — choose who you meet first"
                                style={{ fontSize: 9, lineHeight: 1.3, padding: "1px 5px", textDecoration: "none", borderRadius: 3, letterSpacing: ".03em",
                                  color: onFrontDoor ? "var(--paper)" : "var(--forest)", background: onFrontDoor ? "var(--forest)" : "transparent",
                                  border: `1px solid ${onFrontDoor ? "var(--forest)" : "var(--ink-soft)"}`, fontWeight: onFrontDoor ? 700 : 400 }}>⛩ DOOR</a>
                            )}
                            {Array.from({ length: nDays }, (_, i) => i + 1).map((n) => (
                              <a key={n} href={`/auditions/${ck}/scenes/${b.key}/day/${n}`} title={`Day ${n}`}
                                style={{ fontSize: 9.5, lineHeight: 1.3, padding: "1px 5px", textDecoration: "none", borderRadius: 3,
                                  color: day === String(n) ? "var(--paper)" : "var(--margin-ink)", background: day === String(n) ? "var(--forest)" : "transparent",
                                  border: `1px solid ${day === String(n) ? "var(--forest)" : "var(--ink-soft)"}`, fontWeight: day === String(n) ? 700 : 400 }}>D{n}</a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          </div>
        );
      })}
    </nav>
    </>
  );
}
