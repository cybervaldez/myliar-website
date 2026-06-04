// POST /api/chat-sim — the Gemini call for the /chat simulator. Runs server-side
// so the key (process.env.GEMINI_API_KEY) NEVER reaches the browser and is never
// committed. Dev tooling: a light same-origin guard keeps the (rate-limited) key
// from being driven by random external callers. Returns errors as 200 {error} so
// the client renders them inline instead of throwing.

export const dynamic = "force-dynamic";

type Msg = { role: "user" | "model"; text: string };

export async function POST(req: Request) {
  // same-origin guard (dev tool — don't let external sites drive the key)
  const origin = req.headers.get("origin") ?? "";
  const host = req.headers.get("host") ?? "";
  if (origin && host && !origin.includes(host) && !origin.includes("localhost")) {
    return Response.json({ error: "blocked: cross-origin" }, { status: 403 });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json({ error: "GEMINI_API_KEY is not set in the server environment. Set it (Vercel project env, or a local .env) to enable the live chat sim. The assembled context above still works for copy-paste." });
  }

  let body: { context?: string; messages?: Msg[]; temperature?: number };
  try { body = await req.json(); } catch { return Response.json({ error: "bad request" }, { status: 400 }); }
  const context = (body.context ?? "").slice(0, 24000);
  const messages = (body.messages ?? []).slice(-20);
  if (!context.trim() || messages.length === 0) return Response.json({ error: "empty context or messages" }, { status: 400 });

  const contents = messages.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }));
  const payload = {
    systemInstruction: { parts: [{ text: context }] },
    contents,
    generationConfig: { temperature: typeof body.temperature === "number" ? body.temperature : 0.85, maxOutputTokens: 280, thinkingConfig: { thinkingBudget: 0 } },
  };

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!r.ok) {
      const t = await r.text();
      return Response.json({ error: `Gemini ${r.status}${r.status === 429 ? " — free-tier quota exceeded (the key needs quota)" : ""}: ${t.slice(0, 180)}` });
    }
    const j = await r.json();
    const reply = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(no reply — possibly blocked by safety filters)";
    return Response.json({ reply });
  } catch (e) {
    return Response.json({ error: `request failed: ${String(e).slice(0, 160)}` });
  }
}
