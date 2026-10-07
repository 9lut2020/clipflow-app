"use client";

import { useEffect } from "react";
import { clearLoginCode, isStandalonePwa } from "@/lib/pwa-login";

/**
 * When the LINE login finished inside the installed app itself (phones often
 * keep same-site links in the app), the session already lives here: go
 * straight to the app instead of asking the user to switch back.
 */
export function ContinueInApp() {
  useEffect(() => {
    // Opened as the app's login popup: tell the app, then close this window.
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({ type: "clipflow:login-done" }, window.location.origin);
      } catch {
        // opener from another origin — fall through to the buttons below
      }
      window.close();
      return;
    }
    if (isStandalonePwa()) {
      clearLoginCode();
      window.location.replace("/dashboard");
    }
  }, []);
  return (
    <a href="/dashboard" className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
      เข้าใช้งาน ClipFlow
    </a>
  );
}
