// Shared campaign config for the /play simulation. (A plain module, not a route.)
// Keeps the slug → parity-key + skin + stat-reskin mapping in one place so the
// redirect page, the [day] page, and PlayRunner agree.

export type PlayMeta = {
  campaign: string; // the URL slug
  campaignKey: string; // the /animations CampaignKey (skin copy)
  pack: string; mode: string; // the data-pack / data-mode applied while playing
  title: string; dayUnit: string; // "Day" | "Round"
  statLabels?: Record<string, string>; // engine stat → campaign reskin (CHR→NERVE…)
  battlesEnabled?: boolean; // theme gate: a chaotic battle plays out vs resolving instantly
};

export const CAMPAIGN_MAP: Record<string, { parityKey: "mainline" | "wingman" | "longHunt" | "nightMarket" } & Omit<PlayMeta, "campaign">> = {
  "main-line": {
    parityKey: "mainline", campaignKey: "lifeops", pack: "parchment", mode: "light",
    title: "Life Ops", dayUnit: "Day",
    battlesEnabled: false, // Parchment & Ink has battles OFF (theme_pack.dart kParchmentLight)
  },
  "wingman": {
    parityKey: "wingman", campaignKey: "corner", pack: "corner", mode: "light",
    title: "The Wingman", dayUnit: "Round",
    statLabels: { CHR: "NERVE", INT: "VOICE", GLD: "READ", STR: "PRESENCE" },
    battlesEnabled: true, // the Corner pack (vibrant dialect) has battles ON
  },
  "long-hunt": {
    parityKey: "longHunt", campaignKey: "longhunt", pack: "parchment", mode: "light",
    title: "The Long Hunt", dayUnit: "Night",
    statLabels: { STR: "GRIP", INT: "READ", GLD: "KIT", CHR: "NERVE" },
    battlesEnabled: false, // Parchment register (dark-fantasy lodge) — battles OFF
  },
  "night-market": {
    parityKey: "nightMarket", campaignKey: "nightmarket", pack: "parchment", mode: "light",
    title: "The Night Market", dayUnit: "Lantern",
    statLabels: { STR: "STOCK", INT: "THREAD", GLD: "WORTH", CHR: "OPEN" },
    battlesEnabled: false, // the slate's gentlest world — the quiet roll everywhere
  },
};

export const CAMPAIGN_SLUGS = Object.keys(CAMPAIGN_MAP);
