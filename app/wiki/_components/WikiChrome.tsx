// Shared wiki chrome — "old-wiki" hybrid: encyclopedic structure (page
// header + rule, table of contents, right-rail infobox, ruled section
// headings, spot-red links) on the game's cream palette. Props are kept
// stable so every page restyles at once; per-page copy is converted to
// neutral encyclopedic prose separately.

import Link from "next/link";
import type { ReactNode } from "react";
import { resolveWikiLink } from "../wiki-data";

// ── WikiPage — article shell: title + rule + "from the wiki" line, an
// optional table of contents, the body, and a right-rail infobox. ──────
export function WikiPage({
  title,
  kicker,
  breadcrumb,
  infobox,
  toc,
  discussHref,
  children,
  navbox,
}: {
  title: string;
  kicker?: string; // legacy category line; rendered small until pages drop it
  breadcrumb?: { label: string; href: string }[];
  infobox?: ReactNode;
  toc?: { id: string; label: string }[];
  discussHref?: string;
  children: ReactNode;
  navbox?: ReactNode;
}) {
  return (
    <div className="wiki-prose">
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="text-[11px] text-margin-ink mb-2">
          {breadcrumb.map((b, i) => (
            <span key={b.href}>
              <Link href={b.href}>{b.label}</Link>
              {i < breadcrumb.length - 1 && <span className="px-1.5">›</span>}
            </span>
          ))}
        </div>
      )}

      {/* Page title + rule + "from the wiki" line, with a [discuss] link. */}
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-1">
        <h1 className="font-display text-[28px] sm:text-[34px] leading-tight text-ink !m-0">
          {title}
        </h1>
        <Link
          href={discussHref ?? "#community-notes"}
          className="text-[12px] shrink-0 whitespace-nowrap"
        >
          [talk]
        </Link>
      </div>
      <p className="italic text-[12px] text-margin-ink mt-1 mb-4">
        From the <em>My Life is an RPG</em> wiki.
      </p>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-7 items-start">
        {infobox && (
          <aside className="lg:order-2 lg:col-start-2">{infobox}</aside>
        )}
        <article className="lg:order-1 lg:col-start-1 min-w-0">
          {toc && toc.length > 0 && <TableOfContents items={toc} />}
          {children}
          {navbox && <div className="mt-8">{navbox}</div>}
        </article>
      </div>
    </div>
  );
}

// ── Table of Contents — boxed, numbered, like a classic wiki. ──────────
export function TableOfContents({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  return (
    <nav className="border border-ink bg-paper-shade inline-block px-4 py-3 mb-5 max-w-full">
      <div className="font-display tracking-[0.12em] text-[10px] text-margin-ink mb-1.5">
        CONTENTS
      </div>
      <ol className="list-decimal list-inside m-0 p-0 space-y-0.5">
        {items.map((it) => (
          <li key={it.id} className="text-[13px] text-ink">
            <a href={`#${it.id}`}>{it.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ── Infobox — old-wiki right-rail box: title bar + label/value table. ──
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
    <div className="border border-ink bg-paper-shade text-[13px]">
      <div className="bg-ink text-paper text-center font-display tracking-[0.08em] text-[14px] py-1.5 px-2">
        {title}
      </div>
      {subtitle && (
        <div className="text-center italic text-[11px] text-margin-ink px-2 py-1 border-b border-ink/25">
          {subtitle}
        </div>
      )}
      <table className="w-full border-collapse">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-ink/15 align-top">
              <th className="text-left font-display tracking-[0.04em] text-[9.5px] text-margin-ink bg-paper px-2 py-1.5 w-[38%] align-top">
                {r.label}
              </th>
              <td className="px-2 py-1.5 text-ink leading-[1.4]">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {footer && (
        <div className="px-2 py-1.5 border-t border-ink/25 italic text-[11px] text-margin-ink leading-[1.4]">
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
      <div className="font-display tracking-[0.12em] text-[10px] text-margin-ink px-3 py-1.5 border-b border-ink/25 text-center bg-paper">
        {title}
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-3 py-2.5">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-[13px]">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── WikiLink — cross-link; "stub" (red, dotted) if unknown ───────────
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
      <span
        className="text-spot-red/70 underline decoration-dotted"
        title="stub — page not written yet"
      >
        {children ?? to}
      </span>
    );
  }
  return <Link href={resolved.href}>{children ?? resolved.label}</Link>;
}

// ── SpoilerTag — visible reveal marker (writers-room audience) ────────
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
      className="font-display tracking-[0.03em] text-[18px] sm:text-[20px] text-ink mt-7 mb-2.5 pb-1 border-b border-ink/40 scroll-mt-6"
    >
      {children}
    </h2>
  );
}

export function VoiceQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-[3px] border-margin-ink/50 pl-4 my-3 italic text-[14.5px] text-ink-soft leading-[1.55]">
      {children}
    </blockquote>
  );
}
