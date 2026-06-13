import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack workspace root to this directory — without it Next
  // walks up looking for the nearest lockfile and lands on the user's
  // home dir, polluting the build.
  turbopack: {
    root: path.join(__dirname),
  },

  // Localhost server list — additional LAN origins allowed to hit the dev server
  // (Next blocks cross-origin dev requests by default). `mac-mini` is the hostname;
  // it covers http://mac-mini:3001 (the dev server's port). Add hostnames here as
  // new local machines need to reach the dev server.
  allowedDevOrigins: ["mac-mini"],

  // Booklet routes — each serves a self-contained HTML artifact from
  // public/ via clean URL. All three were authored as stand-alone
  // HTML (cream-paper aesthetic, no React deps) and copied from the
  // parent myliar repo at sync time.
  async rewrites() {
    return [
      { source: "/manual", destination: "/manual.html" },
      { source: "/walkthrough", destination: "/walkthrough.txt" },
      { source: "/campaign-editor", destination: "/campaign-editor.html" },
    ];
  },
};

export default nextConfig;
