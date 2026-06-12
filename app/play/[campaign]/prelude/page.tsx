// /play/[campaign]/prelude — the PRELUDE preview (prelude-stories.md §PLAYER-FACING):
// the picked world-before-you story, rendered as jacket copy + prose. The hook funnel:
// slate card → THIS PAGE → the front door → the campaign. The markdown comes from
// preludes.generated.json (synced by tools/prelude/sync_picked.mjs — never hand-edited).

import { notFound } from "next/navigation";
import Link from "next/link";
import preludes from "../../../lib/preludes.generated.json";
import { CAMPAIGN_MAP } from "../../campaigns";

// The prelude files are deliberately minimal markdown (spec §PLAYER-FACING): one h1,
// plain paragraphs, `---` dividers, and the jacket-header lines (FOR / WHERE THIS
// LEAVES THEM / THE OPEN SEAT / THE DOOR). A tiny purpose-built renderer keeps the
// surface dependency-free; anything unrecognized falls back to a plain paragraph.
function renderPrelude(md: string, campaignTitle: string) {
  const blocks = md.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const out: React.ReactNode[] = [];
  let k = 0;
  const em = (s: string) => {
    // *italic* and **bold** within a paragraph (the only inline marks the spec allows)
    const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b>
      : p.startsWith("*") ? <i key={i}>{p.slice(1, -1)}</i>
      : p);
  };
  for (const b of blocks) {
    k++;
    if (b.startsWith("# ")) {
      out.push(
        <div key={k} style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, letterSpacing: ".3em", color: "var(--spot-red)" }}>PRELUDE</div>
          <h1 style={{ fontFamily: "var(--theme-display)", fontSize: 34, lineHeight: 1.05, margin: "4px 0 0", color: "var(--ink)" }}>{campaignTitle}</h1>
          <div style={{ fontSize: 12, color: "var(--margin-ink)", fontStyle: "italic", marginTop: 4 }}>how it begins — the night before you</div>
        </div>
      );
    } else if (b === "---") {
      out.push(<hr key={k} style={{ border: "none", borderTop: "1px solid var(--ink-soft)", margin: "22px 0" }} />);
    } else if (/^(THE WORLD|THE GIFT|WHO THIS IS FOR|FOR|THE OPEN SEAT|THE DOOR):/.test(b)) {
      const [, label, rest] = b.match(/^([A-Z ]+):\s*([\s\S]*)$/) ?? [];
      out.push(
        <p key={k} style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 12px", borderLeft: "2px solid var(--forest)", paddingLeft: 11 }}>
          <span style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, letterSpacing: ".18em", color: "var(--forest)" }}>{label}</span>
          <br />
          <span style={{ fontStyle: "italic", color: "var(--ink)" }}>{em(rest ?? "")}</span>
        </p>
      );
    } else if (b.startsWith("WHERE THIS LEAVES THEM")) {
      const lines = b.split("\n");
      out.push(
        <div key={k} style={{ margin: "0 0 12px", borderLeft: "2px solid var(--ink-soft)", paddingLeft: 11 }}>
          <div style={{ fontFamily: "var(--theme-body)", fontSize: 10.5, letterSpacing: ".18em", color: "var(--margin-ink)", marginBottom: 4 }}>WHERE THIS LEAVES THEM</div>
          {lines.slice(1).map((l, i) => (
            <p key={i} style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 0 3px", color: "var(--ink-soft)" }}>{em(l.replace(/^- /, ""))}</p>
          ))}
        </div>
      );
    } else {
      out.push(<p key={k} style={{ fontSize: 15.5, lineHeight: 1.75, margin: "0 0 16px", color: "var(--ink)" }}>{em(b)}</p>);
    }
  }
  return out;
}

export default async function PreludePage({ params }: { params: Promise<{ campaign: string }> }) {
  const { campaign } = await params;
  const m = CAMPAIGN_MAP[campaign];
  const entry = (preludes as Record<string, { markdown?: string }>)[campaign];
  if (!m || !entry?.markdown) notFound();
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 64px", fontFamily: "var(--theme-body)" }}>
      <p style={{ fontSize: 12, color: "var(--margin-ink)", marginBottom: 14 }}>
        <Link href="/play" style={{ color: "var(--forest)" }}>← the slate</Link>
      </p>
      {renderPrelude(entry.markdown, m.title)}
      <div style={{ textAlign: "center", borderTop: "2px solid var(--forest)", paddingTop: 22, marginTop: 8 }}>
        <div style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", marginBottom: 12 }}>The next page is yours.</div>
        <Link href={`/play/${campaign}`}
          style={{ display: "inline-block", fontFamily: "var(--theme-display)", fontSize: 16, letterSpacing: ".06em", padding: "10px 26px", background: "var(--forest)", color: "var(--paper)", textDecoration: "none", border: "2px solid var(--forest)" }}>
          STEP THROUGH THE DOOR ›
        </Link>
      </div>
    </main>
  );
}
