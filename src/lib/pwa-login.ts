/**
 * Installed PWAs keep their own cookies, separate from the system browser
 * where LINE login completes. The PWA therefore logs in via a one-time
 * "handoff" code: the browser registers the code after login, and the PWA
 * exchanges it for its own session (see /auth/handoff and /api/pwa-login/claim).
 */

const STORAGE_KEY = "clipflow:pwa-login-code";
const CODE_TTL_MS = 10 * 60 * 1000;

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari home-screen apps
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function randomCode() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Returns the pending code, creating a new one when none is active. */
export function getOrCreateLoginCode() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.code && Date.now() - saved.createdAt < CODE_TTL_MS) return saved.code as string;
  } catch {
    // ignore unreadable storage
  }
  const code = randomCode();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, createdAt: Date.now() }));
  } catch {
    // Storage unavailable: the code still works while this page stays open.
  }
  return code;
}

export function getPendingLoginCode() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.code && Date.now() - saved.createdAt < CODE_TTL_MS) return saved.code as string;
  } catch {
    // ignore
  }
  return null;
}

export function clearLoginCode() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Ask the server to exchange the code for a session cookie. */
export async function claimLoginCode(code: string): Promise<"ok" | "pending" | "failed"> {
  try {
    const res = await fetch("/api/pwa-login/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });
    if (res.status === 200) return "ok";
    if (res.status === 202) return "pending";
    return "failed";
  } catch {
    return "pending";
  }
}
