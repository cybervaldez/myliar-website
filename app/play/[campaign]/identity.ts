// Identity-token resolver — the TS mirror of lib/identity_tokens.dart (v0.0.51).
// The web sim is the PRIMARY play surface, so authored payload tokens must resolve
// here exactly as in the app. Token scheme (research-identity-templating §4):
//   [name]                 → the player's chosen name ("you" if unset)
//   [address] / [address:id] → the earned per-character address; the web carries no
//                            earned-address state → ladder baseline = [name] (matches
//                            the engine's fallback for an unearned address)
//   [they] [them] [their] [theirs] [themself|themselves] → the pronoun set
//   [v:singular|plural]    → verb agreement (singular-they fix)
//   [,name]                → the conditional VOCATIVE: ", <name>" when a real name is
//                            set, "" when not ("Sit[,name]." → "Sit, Sky." / "Sit.")
// A Capitalized token resolves Capitalized. Non-identity tokens ([ledger*], [desk])
// pass through untouched for humanizeLexicon. name-only players resolve REFERENCES
// to neutral they (the §4.5 discipline: pronoun tokens for references; [name] is
// reserved for address/vocative spots).

type PronSet = { subject: string; object: string; possessive: string; possessivePronoun: string; reflexive: string; isPlural: boolean };

const SETS: Record<string, PronSet> = {
  he: { subject: "he", object: "him", possessive: "his", possessivePronoun: "his", reflexive: "himself", isPlural: false },
  she: { subject: "she", object: "her", possessive: "her", possessivePronoun: "hers", reflexive: "herself", isPlural: false },
  they: { subject: "they", object: "them", possessive: "their", possessivePronoun: "theirs", reflexive: "themself", isPlural: true },
};
const NEUTRAL = SETS.they;

const TOKEN = /\[([^\[\]]+)\]/g;

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const isCap = (t: string) => t.length > 0 && t[0] === t[0].toUpperCase() && t[0] !== t[0].toLowerCase();

/** Resolve player-identity tokens. `idKey` = the pref key (he/she/they/name/'' → name-only/neutral). */
export function resolveIdentity(raw: string, idKey?: string | null, name?: string | null): string {
  if (!raw) return raw;
  const p = SETS[idKey ?? ""] ?? NEUTRAL;
  const nm = (name ?? "").trim() || "you";

  const rawName = (name ?? "").trim();
  const nameSet = rawName.length > 0 && rawName !== "you";

  return raw.replace(TOKEN, (whole, innerRaw: string) => {
    const inner = innerRaw;
    const low = inner.toLowerCase();
    const wantsCap = isCap(inner);
    if (low === ",name") return nameSet ? `, ${rawName}` : "";
    if (low.startsWith("v:")) {
      const parts = inner.slice(2).split("|");
      return parts.length === 2 ? (p.isPlural ? parts[1] : parts[0]) : whole;
    }
    if (low === "address" || low.startsWith("address:")) {
      return wantsCap ? cap(nm) : nm; // no earned-address state on the web → name baseline
    }
    let v: string | null = null;
    switch (low) {
      case "name": v = nm; break;
      case "they": v = p.subject; break;
      case "them": v = p.object; break;
      case "their": v = p.possessive; break;
      case "theirs": v = p.possessivePronoun; break;
      case "themself":
      case "themselves": v = p.reflexive; break;
    }
    if (v === null) return whole; // not an identity token — leave for humanizeLexicon
    return wantsCap ? cap(v) : v;
  });
}
