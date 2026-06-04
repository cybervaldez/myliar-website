// FandomShell — the wiki-look (A) chrome for the tooling pages: a light page, a left
// sidebar of tool links, and a WIDE white content panel (these pages are text-heavy).
// Wraps page content; replaces the old top ToolNav + cream container. The `.fandom`
// class (globals.css) restyles the parchment Tailwind tokens inside into the wiki look.

import Link from "next/link";
import board from "../lib/storyboard.json";
import parity from "../lib/parity.generated.json";

const TOOLS = [
  { href: "/the-engine", label: "The Engine", desc: "how it works (essay)" },
  { href: "/concepts", label: "Concepts", desc: "theme slate — pick what to build" },
  { href: "/campaigns", label: "Campaigns", desc: "daily events, by campaign" },
  { href: "/lab", label: "Engine Lab", desc: "run history — what worked" },
  { href: "/storyboard", label: "Storyboard", desc: "draft & compare content" },
  { href: "/swipe", label: "Run Simulator", desc: "play the run, pick inline" },
];

// Concept sub-links (shown nested under "Concepts" in the sidebar).
const CONCEPTS = ((board.concept?.candidates ?? []) as { slug: string; name: string; status: string }[])
  .map((c) => ({ slug: c.slug, name: c.name, status: c.status }));
function statusDot(s: string): string {
  const t = s.toLowerCase();
  return t.includes("building") ? "●" : t.includes("committed") ? "◐" : t.includes("flagged") ? "⚠" : "○";
}

// Campaign sub-links (shown nested under "Campaigns"). The shipped campaigns
// with an authored daily story — sourced from the parity export (game→website).
const CAMPAIGNS = [
  { id: "main-line", name: "Life Ops", days: parity.mainline?.days?.length ?? 0 },
  { id: "wingman", name: "The Wingman", days: parity.wingman?.days?.length ?? 0 },
].filter((c) => c.days > 0);

export function FandomShell({
  active,
  children,
}: {
  active: "/the-engine" | "/lab" | "/storyboard" | "/swipe" | "/concepts" | "/campaigns";
  children: React.ReactNode;
}) {
  return (
    <main className="fandom min-h-screen">
      <div className="mx-auto max-w-[1360px] flex">
        {/* left sidebar */}
        <aside className="hidden md:block w-[176px] shrink-0 border-r border-[#dee1e6] bg-[#f6f7f9] py-6 px-4 text-[13px]">
          <div className="font-display text-[15px] text-[#0645ad] mb-1" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>The Codex</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[#72777d] mb-3">dev tooling</div>
          <nav className="space-y-2">
            {TOOLS.map((t) => (
              <div key={t.href}>
                <Link href={t.href} className="block group">
                  <span className={`block ${t.href === active ? "font-bold text-[#202122]" : "text-[#0645ad] group-hover:underline"}`}>
                    {t.href === active ? "▸ " : ""}{t.label}
                  </span>
                  <span className="block text-[10.5px] leading-tight text-[#72777d]">{t.desc}</span>
                </Link>
                {t.href === "/concepts" && CONCEPTS.length > 0 && (
                  <div className="ml-2 mt-1 mb-1 space-y-0.5 border-l border-[#dee1e6] pl-2">
                    {CONCEPTS.map((c) => (
                      <Link key={c.slug} href={`/concepts/${c.slug}`} className="block text-[11px] leading-tight text-[#0645ad] hover:underline">
                        {statusDot(c.status)} {c.name}
                      </Link>
                    ))}
                  </div>
                )}
                {t.href === "/campaigns" && CAMPAIGNS.length > 0 && (
                  <div className="ml-2 mt-1 mb-1 space-y-0.5 border-l border-[#dee1e6] pl-2">
                    {CAMPAIGNS.map((c) => (
                      <Link key={c.id} href={`/campaigns/${c.id}`} className="block text-[11px] leading-tight text-[#0645ad] hover:underline">
                        {c.name} <span className="text-[#72777d]">· {c.days}d</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-6 pt-3 border-t border-[#dee1e6] text-[11px] text-[#72777d]">Tools</div>
          <Link href="/" className="block py-1 text-[#0645ad] hover:underline">← Main site</Link>
          <Link href="/wiki" className="block py-1 text-[#0645ad] hover:underline">The Codex (wiki)</Link>
        </aside>

        {/* wide content — a defined "page" on the gray, with a Fandom breadcrumb */}
        <div className="flex-1 min-w-0 bg-white border border-[#a2b1c2] px-6 md:px-9 py-6">
          <div className="text-[11px] text-[#54595d] mb-4 pb-2 border-b border-[#eaecf0]">
            <Link href="/" className="text-[#0645ad] hover:underline">The Codex</Link>
            <span className="px-1.5">›</span>
            <span>Tools</span>
            <span className="px-1.5">›</span>
            <span>{TOOLS.find((t) => t.href === active)?.label ?? ""}</span>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
