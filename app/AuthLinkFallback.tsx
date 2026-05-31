"use client";

// Anonymous→Google upgrade fallback. When a guest tries to LINK a Google
// account that's ALREADY a user, Supabase redirects back with
// ?error_code=identity_already_exists (the guest's anon data can't merge into an
// existing account). There's nothing to carry over, so we just sign into the
// existing account. Mounted globally (the error lands on the site root, not a
// wiki page). docs/design/auth-model.md.

import { useEffect } from "react";
import { supabase } from "./wiki/supabaseClient";

export default function AuthLinkFallback() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Read the URL BEFORE touching the client (the SDK may clear the hash).
    const url = window.location.hash + window.location.search;
    if (!url.includes("identity_already_exists")) {
      sessionStorage.removeItem("oauth_signin_fallback");
      return;
    }
    // Strip the error so a refresh doesn't re-trigger.
    history.replaceState(null, "", window.location.pathname);
    if (sessionStorage.getItem("oauth_signin_fallback")) return; // already tried — no loop
    sessionStorage.setItem("oauth_signin_fallback", "1");
    const c = supabase();
    if (!c) return;
    (async () => {
      await c.auth.signOut(); // drop the anonymous session
      await c.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/wiki/buzz" },
      });
    })();
  }, []);
  return null;
}
