// THE CHATBOTS — what each cast member IS in chat mode (the DESTINATION: "the chat is the destination").
// Each is an RPG-themed FUNCTIONAL AGENT — the VALUE it provides · the BRING→HANDS-BACK contract · how it
// represents the character's whole story · how the help grows the MC's autonomy · how it deepens with the
// notes. The arc is the path TO this; defining it shapes the character's story. Lives in THE ARC section
// (the cast block) on the scene branch; the door's focal coach is highlighted. NOT canon.

export type ChatbotT = {
  name: string; color?: string; value?: string; bring?: string; handsBack?: string;
  represents?: string; growsYou?: string; deepens?: string;
};

const forest = "var(--forest)", ink = "var(--ink)", soft = "var(--ink-soft)", margin = "var(--margin-ink)", amber = "#c08a2e", violet = "#7a5b9a", paper = "var(--paper)", shade = "var(--paper-shade)";
const norm = (s: string) => (s || "").toLowerCase().replace(/^the\s+/, "").trim();

export function ChatbotMap({ bots, focal, range }: { bots: ChatbotT[]; focal?: string; range?: string }) {
  if (!bots?.length) return null;
  const fn = norm(focal || "");
  return (
    <section style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 15, color: ink, margin: "0 0 2px" }}>💬 THE CHATBOTS — what each character IS when you talk to them <span style={{ fontSize: 10.5, color: margin, fontWeight: 400 }}>(the destination)</span></h2>
      <p style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, margin: "0 0 10px" }}>each is a <b>functional agent</b> — valuable the first time you open it; the notes personalize it, never replace it. {range && <span style={{ color: margin, fontStyle: "italic" }}>{range}</span>}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bots.map((b) => {
          const isFocal = fn && norm(b.name) === fn;
          return (
            <div key={b.name} style={{ border: `2px solid ${isFocal ? (b.color || forest) : "var(--ink-soft)"}`, background: isFocal ? shade : paper, padding: "9px 12px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: ink }}><span style={{ display: "inline-block", width: 9, height: 9, background: b.color || soft, borderRadius: 2, marginRight: 5, verticalAlign: "middle" }} />{b.name}</span>
                {isFocal && <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".08em", color: b.color || forest, border: `1px solid ${b.color || forest}`, padding: "0 4px" }}>THIS DOOR&rsquo;S FOCAL</span>}
              </div>
              <div style={{ fontSize: 11.5, color: ink, fontWeight: 700, margin: "3px 0 4px", lineHeight: 1.45 }}>{b.value}</div>
              {(b.bring || b.handsBack) && (
                <div style={{ fontSize: 10.5, color: soft, lineHeight: 1.5, marginBottom: 3 }}>
                  <b style={{ color: margin }}>bring:</b> {b.bring} <span style={{ color: amber }}>→</span> <b style={{ color: margin }}>hands back:</b> {b.handsBack}
                </div>
              )}
              {b.represents && <div style={{ fontSize: 10, color: margin, lineHeight: 1.45, fontStyle: "italic" }}>▸ {b.represents}</div>}
              {b.growsYou && <div style={{ fontSize: 10, color: forest, lineHeight: 1.45, marginTop: 2 }}>↑ grows you: {b.growsYou}</div>}
              {b.deepens && <div style={{ fontSize: 10, color: violet, lineHeight: 1.45, marginTop: 2 }}>◷ deepens: {b.deepens}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
