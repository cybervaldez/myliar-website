"use client";

// Left-rail category navigation for the wiki. Client component so it can
// highlight the active route via usePathname. Collapses to a <details>
// dropdown on mobile; persistent rail on lg+.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavEntry } from "../wiki-data";

function NavList({ tree, pathname }: { tree: NavEntry[]; pathname: string }) {
  return (
    <ul className="list-none p-0 m-0 space-y-1">
      {tree.map((entry) => {
        const active = pathname === entry.href;
        const childActive = entry.children?.some((c) => pathname === c.href);
        return (
          <li key={entry.href}>
            <Link
              href={entry.href}
              className={`block font-display tracking-[0.1em] text-[12px] py-1 !border-b-0 ${
                active ? "text-spot-red" : "text-ink hover:text-forest"
              }`}
            >
              {entry.label}
              {entry.editorial && (
                <span className="ml-2 text-[9px] tracking-[0.12em] text-margin-ink align-middle">
                  WIP
                </span>
              )}
            </Link>
            {entry.children && (active || childActive) && (
              <ul className="list-none pl-3 mt-1 mb-2 space-y-0.5 border-l border-margin-ink/40">
                {entry.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className={`block font-body text-[13.5px] py-0.5 !border-b-0 ${
                        pathname === child.href
                          ? "text-spot-red"
                          : "text-ink-soft hover:text-forest"
                      }`}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function WikiNav({ tree }: { tree: NavEntry[] }) {
  const pathname = usePathname();
  return (
    <>
      {/* Mobile: collapsible */}
      <details className="lg:hidden border-2 border-ink bg-paper-shade mb-6">
        <summary className="cursor-pointer font-display tracking-[0.14em] text-[12px] text-forest px-4 py-3 list-none">
          ▸ THE CODEX · BROWSE
        </summary>
        <nav className="px-4 pb-4">
          <NavList tree={tree} pathname={pathname} />
        </nav>
      </details>

      {/* Desktop: persistent rail */}
      <nav className="hidden lg:block sticky top-6 self-start">
        <div className="font-display tracking-[0.16em] text-[11px] text-margin-ink mb-3 border-b border-ink/30 pb-2">
          THE CODEX
        </div>
        <NavList tree={tree} pathname={pathname} />
      </nav>
    </>
  );
}
