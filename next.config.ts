import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack workspace root to this directory — without it Next
  // walks up looking for the nearest lockfile and lands on the user's
  // home dir, polluting the build.
  turbopack: {
    root: path.join(__dirname),
  },

  // Booklet routes — each serves a self-contained HTML artifact from
  // public/ via clean URL. All three were authored as stand-alone
  // HTML (cream-paper aesthetic, no React deps) and copied from the
  // parent myliar repo at sync time.
  async rewrites() {
    return [
      { source: "/manual", destination: "/manual.html" },
      { source: "/walkthrough", destination: "/walkthrough.html" },
      { source: "/campaign-editor", destination: "/campaign-editor.html" },
    ];
  },
};

export default nextConfig;
