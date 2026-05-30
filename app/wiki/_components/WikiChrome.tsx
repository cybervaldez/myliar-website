// Shared wiki presentation chrome: page frame (article + infobox aside),
// infobox, navbox, breadcrumb, cross-link, spoiler tag. Server components
// (no client state) except where noted — keeps these prerenderable.

import Link from "next/link";
import type { ReactNode } from "react";
import { resolveWikiLink } from "../wiki-data";

// ── WikiPage — the 3rd column. Article (center) + Infobox (right). ────
// The left nav lives in layout.tsx; this lays out the remaining two
// columns. Infobox stacks ABOVE the article on mobile (it's the at-a-
// glance summary), beside it on lg.
export function WikiPage({
  title,
  kicker,
  breadcrumb,
  infobox,
  children,
  navbox,
}: {
  title: string;
  kicker?: string;
  breadcrumb?: { label: string; href: string }[];
  infobox?: ReactNode;
  children: ReactNode;
  navbox?: ReactNode;
}) {
  return (
    <div>
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="font-display tracking-[0.14em] text-[10px] text-margin-ink mb-3">
          {breadcrumb.map((b, i) => (
            <span key={b.href}>
              <Link href={b.href} className="!border-b-0 hover:text-forest">
                {b.label}
              </Link>
              {i < breadcrumb.length - 1 && <span className="px-1.5">›</span>}
            </span>
          ))}
        </div>
      )}
      {kicker && (
        <div className="font-display tracking-[0.18em] text-[11px] text-spot-red mb-2">
          {kicker}
        </div>
      )}
      <h1 className="text-[34px] sm:text-[46px] leading-[1.04] mb-5">{title}</h1>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 lg:gap-8 items-start">
        {/* Infobox first in source so it stacks on top on mobile; on lg
            it's placed in the right column via order. */}
        {infobox && (
          <aside className="lg:order-2 lg:col-start-2">{infobox}</aside>
        )}
        <article className="lg:order-1 lg:col-start-1 min-w-0">
          {children}
          {navbox && <div className="mt-10">{navbox}</div>}
        </article>
      </div>
    </div>
  );
}

// ── Infobox — the MMORPG stat sidebar ────────────────────────────────
export function Infobox({
  title,
  subtitle,
  rows,
  footer,
}: {
  title: string;
  subtitle?: string;
  rows: { label: string; value: ReactNode }[];
  footer?: ReactNode;
}) {
  return (
    <div className="border-2 border-ink bg-paper-shade">
      <div className="bg-forest px-4 py-3">
        <div className="font-display tracking-[0.1em] text-[18px] text-white leading-none">
          {title}
        </div>
        {subtitle && (
          <div className="font-body italic text-[12px] text-paper/85 mt-1">
            {subtitle}
          </div>
        )}
      </div>
      <dl className="m-0 divide-y divide-margin-ink/25">
        {rows.map((r, i) => (
          <div key={i} className="px-4 py-2.5">
            <dt className="font-display tracking-[0.14em] text-[9.5px] text-margin-ink mb-0.5">
              {r.label}
            </dt>
            <dd className="m-0 font-body text-[13.5px] text-ink leading-[1.4]">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      {footer && (
        <div className="px-4 py-3 border-t border-ink/30 font-body italic text-[12px] text-margin-ink">
          {footer}
        </div>
      )}
    </div>
  );
}

// ── Navbox — bottom-of-page sibling navigation ───────────────────────
export function Navbox({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="border border-ink bg-paper-shade">
      <div className="font-display tracking-[0.16em] text-[10px] text-forest px-3 py-2 border-b border-ink/30 text-center">
        {title}
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-3 py-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="font-body text-[13px] text-ink-soft hover:text-spot-red !border-b-0"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── WikiLink — resolves a slug to a cross-link; "stub" if unknown ─────
export function WikiLink({
  to,
  children,
}: {
  to: string;
  children?: ReactNode;
}) {
  const resolved = resolveWikiLink(to);
  if (!resolved) {
    return (
      <span className="text-margin-ink underline decoration-dotted" title="stub — not yet written">
        {children ?? to}
      </span>
    );
  }
  return (
    <Link href={resolved.href} className="text-forest hover:text-spot-red">
      {children ?? resolved.label}
    </Link>
  );
}

// ── SpoilerTag — for /writers-room the reveal is VISIBLE, just marked ─
// (Audience is internal review, so we don't hide; we flag what's a
// tier-up moment so the panel can see the reveal structure.)
export function SpoilerTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-2 border-l-2 border-spot-red pl-2">
      <span className="font-display tracking-[0.12em] text-[9px] text-spot-red">
        REVEAL
      </span>
      <span>{children}</span>
    </span>
  );
}

// ── Prose helpers ────────────────────────────────────────────────────
export function SectionHead({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-[22px] sm:text-[26px] mt-9 mb-3 pb-1 border-b border-ink/25 scroll-mt-6"
    >
      {children}
    </h2>
  );
}

export function VoiceQuote({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-[3px] border-forest pl-4 my-3 font-body italic text-[15px] text-ink leading-[1.5]">
      {children}
    </p>
  );
}
