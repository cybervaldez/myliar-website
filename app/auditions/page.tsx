// /auditions — the BLIND AUDITION rounds, public + mobile-first, so outside readers
// can audit alongside the owner. Entries ship anonymized (the authorship keys never
// sync — tools/auditions/sync_auditions.mjs); each round shows its entries, the
// audition notes, and the exact PROMPT used, so anyone can generate their own entry.
import Link from "next/link";
import data from "../lib/auditions.generated.json";

export const metadata = {
  title: "Auditions — My Life is an RPG",
  description: "The blind audition rounds: concepts, pilots, character audits. Read the entries anonymized and judge for yourself.",
};

type Entry = { id: string; markdown: string };
type Round = { id: string; closed: boolean; what: string; outcome: string; entries: Entry[]; prompt: string | null };

// Tiny purpose-built renderer (the site's dependency-free pattern): h1/h2, ---,
// LABEL: paragraphs, "- " bullets, **bold** / *italic*. Unknown blocks fall back
// to plain paragraphs.
function em(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b>
    : p.startsWith("*") && p.length > 2 ? <i key={i}>{p.slice(1, -1)}</i>
    : p);
}

function renderEntry(md: string) {
  const blocks = md.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const out: React.ReactNode[] = [];
  let k = 0;
  for (const b of blocks) {
    k++;
    if (b.startsWith("# ")) {
      out.push(<h3 key={k} style={{ fontFamily: "var(--theme-display)", fontSize: 21, lineHeight: 1.15, margin: "18px 0 10px", color: "var(--ink)" }}>{b.slice(2)}</h3>);
    } else if (b.startsWith("## ")) {
      out.push(<h4 key={k} style={{ fontFamily: "var(--theme-display)", fontSize: 16, letterSpacing: ".04em", margin: "20px 0 8px", color: "var(--forest)", borderBottom: "1px solid var(--ink-soft)", paddingBottom: 4 }}>{b.slice(3)}</h4>);
    } else if (b === "---") {
      out.push(<hr key={k} style={{ border: "none", borderTop: "1px solid var(--ink-soft)", margin: "18px 0" }} />);
    } else if (/^[A-Z][A-Z '&-]+:/.test(b)) {
      const lines = b.split("\n");
      out.push(
        <div key={k} style={{ margin: "0 0 12px", borderLeft: "2px solid var(--forest)", paddingLeft: 10 }}>
          {lines.map((l, i) => {
            const m = l.match(/^([A-Z][A-Z '&-]+):\s*([\s\S]*)$/);
            if (m) return (
              <p key={i} style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 6px" }}>
                <span style={{ fontFamily: "var(--theme-body)", fontSize: 10, letterSpacing: ".16em", color: "var(--forest)", display: "block" }}>{m[1]}</span>
                <span style={{ color: "var(--ink)" }}>{em(m[2])}</span>
              </p>
            );
            return <p key={i} style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 4px", color: "var(--ink-soft)" }}>{em(l.replace(/^[-•]\s*/, "· "))}</p>;
          })}
        </div>
      );
    } else if (/^(\d+\.|-)\s/.test(b)) {
      out.push(
        <div key={k} style={{ margin: "0 0 12px" }}>
          {b.split("\n").map((l, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 4px", paddingLeft: 14, textIndent: -10, color: "var(--ink)" }}>{em(l.replace(/^(-|\d+\.)\s*/, "· "))}</p>
          ))}
        </div>
      );
    } else {
      out.push(<p key={k} style={{ fontSize: 15, lineHeight: 1.75, margin: "0 0 14px", color: "var(--ink)" }}>{em(b)}</p>);
    }
  }
  return out;
}

export default function AuditionsPage() {
  const rounds = (data as { rounds: Round[] }).rounds;
  const active = rounds.filter((r) => !r.closed);
  const closed = rounds.filter((r) => r.closed);
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 80px" }}>
      <div style={{ fontFamily: "var(--theme-body)", fontSize: 11, letterSpacing: ".3em", color: "var(--spot-red)" }}>BLIND AUDITIONS</div>
      <h1 style={{ fontFamily: "var(--theme-display)", fontSize: 32, lineHeight: 1.05, margin: "4px 0 10px" }}>The audition rounds</h1>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 8px" }}>
        Concepts, pilots, and character audits compete here <b>anonymized</b> — multiple authors,
        one prompt, no names attached (the authorship keys never reach this page). Read the
        entries, pick your favorite, and judge for yourself. Every round carries the exact
        PROMPT it was generated from, so you can write or generate your own entry too.
      </p>
      <p style={{ fontSize: 12.5, color: "var(--margin-ink)", fontStyle: "italic", margin: "0 0 26px" }}>
        Audition notes lead each entry — the treatment argued before the work. Read story-first
        if you prefer your taste untainted. <Link href="/" style={{ color: "var(--forest)" }}>← home</Link>
      </p>

      {[{ label: "OPEN ROUNDS — your pick is welcome", list: active }, { label: "DECIDED ROUNDS — the record", list: closed }].map((g) => g.list.length > 0 && (
        <section key={g.label} style={{ marginBottom: 34 }}>
          <h2 style={{ fontFamily: "var(--theme-body)", fontSize: 12, letterSpacing: ".22em", color: "var(--spot-red)", borderBottom: "2px solid var(--ink)", paddingBottom: 6, margin: "0 0 14px" }}>{g.label}</h2>
          {g.list.map((r) => (
            <details key={r.id} style={{ border: "2px solid var(--ink-soft)", background: "var(--paper-shade)", marginBottom: 14 }}>
              <summary style={{ cursor: "pointer", padding: "12px 14px", listStyle: "none" }}>
                <span style={{ fontFamily: "var(--theme-display)", fontSize: 16, color: "var(--ink)", display: "block" }}>{r.id.replace(/-/g, " ").toUpperCase()}</span>
                <span style={{ fontSize: 13, color: "var(--ink-soft)", display: "block", marginTop: 3, lineHeight: 1.5 }}>{r.what}</span>
                {r.outcome && <span style={{ fontSize: 12, color: r.closed ? "var(--margin-ink)" : "var(--forest)", fontStyle: "italic", display: "block", marginTop: 3 }}>{r.outcome}</span>}
              </summary>
              <div style={{ padding: "0 14px 14px" }}>
                {r.entries.map((e) => (
                  <details key={e.id} style={{ border: "1px solid var(--ink-soft)", background: "var(--paper)", margin: "0 0 10px" }}>
                    <summary style={{ cursor: "pointer", padding: "10px 12px", fontFamily: "var(--theme-display)", fontSize: 14, color: "var(--forest)", listStyle: "none" }}>
                      ▸ {e.id.replace(/-/g, " ").toUpperCase()}
                    </summary>
                    <div style={{ padding: "2px 14px 14px" }}>{renderEntry(e.markdown)}</div>
                  </details>
                ))}
                {r.prompt && (
                  <details style={{ border: "1px dashed var(--ink-soft)", background: "var(--paper)", margin: "0 0 4px" }}>
                    <summary style={{ cursor: "pointer", padding: "10px 12px", fontFamily: "var(--theme-body)", fontSize: 12, letterSpacing: ".12em", color: "var(--margin-ink)", listStyle: "none" }}>
                      ▸ THE PROMPT (generate your own entry)
                    </summary>
                    <pre style={{ padding: "2px 14px 14px", fontSize: 11.5, lineHeight: 1.55, whiteSpace: "pre-wrap", color: "var(--ink-soft)", fontFamily: "var(--font-geist-mono, monospace)" }}>{r.prompt}</pre>
                  </details>
                )}
              </div>
            </details>
          ))}
        </section>
      ))}
    </main>
  );
}
