"use client";
// THE NAV RAIL — the persistent left navigation for the SHELL layout (hidden in column/dashboard via CSS).
// Reads the route, lists every campaign + the current campaign's pipeline steps + its scene branches, so
// you can jump anywhere without scrolling back to the top.
import { usePathname } from "next/navigation";
import { campaignKeys, CAMPAIGNS, STEP_DEFS, stepNo, hasStep, isSeed, sceneBranchesFor } from "./registry";

export default function NavRail() {
  const path = usePathname() || "";
  const parts = path.split("/").filter(Boolean); // ["auditions", <campaign>, <step>, <scene>?]
  const campaign = parts[1] && CAMPAIGNS[parts[1]] ? parts[1] : null;
  const step = parts[2];
  const scene = parts[2] === "scenes" ? parts[3] : undefined;

  const Link = ({ href, label, on, indent = 0, dim = false }: { href: string; label: string; on: boolean; indent?: number; dim?: boolean }) => (
    <a href={href} style={{ display: "block", textDecoration: "none", padding: "3px 7px", paddingLeft: 7 + indent * 12, fontSize: indent ? 11 : 11.5, lineHeight: 1.35, color: on ? "var(--forest)" : dim ? "var(--margin-ink)" : "var(--ink)", fontWeight: on ? 700 : 400, background: on ? "var(--paper)" : "transparent", borderLeft: `2px solid ${on ? "var(--forest)" : "transparent"}` }}>{label}</a>
  );

  return (
    <nav className="aud-nav-rail">
      <a href="/auditions" style={{ display: "block", fontFamily: "var(--theme-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", color: "var(--spot-red)", textDecoration: "none", padding: "0 7px 10px", borderBottom: "1px solid var(--ink-soft)", marginBottom: 8 }}>↑ THE AUDITIONS</a>
      {campaignKeys().map((ck) => {
        const c = CAMPAIGNS[ck];
        const onC = ck === campaign;
        const seed = isSeed(ck);
        return (
          <div key={ck} style={{ marginBottom: onC ? 9 : 1 }}>
            <Link href={`/auditions/${ck}`} label={c.label} on={onC && !step} />
            {onC && STEP_DEFS.map((s) => {
              if (!hasStep(ck, s.key) && !seed) return null;
              const folded = seed && s.key !== "scenes";
              const onS = s.key === step;
              return (
                <div key={s.key}>
                  {folded
                    ? <span style={{ display: "block", padding: "2px 7px", paddingLeft: 19, fontSize: 10.5, color: "var(--margin-ink)", opacity: 0.6 }}>{stepNo(s.key)} {s.label.replace(/^The /, "")} · seed</span>
                    : <Link href={`/auditions/${ck}/${s.key}`} label={`${stepNo(s.key)} ${s.label.replace(/^The /, "")}`} on={onS} indent={1} />}
                  {s.key === "scenes" && onS && sceneBranchesFor(ck).map((b) => (
                    <Link key={b.key} href={`/auditions/${ck}/scenes/${b.key}`} label={`↳ ${b.label}`} on={scene === b.key} indent={2} dim />
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
