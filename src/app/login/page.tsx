"use client";

import { signIn } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  claimLoginCode,
  clearLoginCode,
  getOrCreateLoginCode,
  getPendingLoginCode,
  isStandalonePwa,
} from "@/lib/pwa-login";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForBrowser, setWaitingForBrowser] = useState(false);
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/menu";
  const error = searchParams.get("error");
  // Set when this page was opened in the browser on behalf of the PWA.
  const handoffCode = searchParams.get("handoff");

  const finishPwaLogin = useCallback(async () => {
    const code = getPendingLoginCode();
    if (!code) return false;
    const result = await claimLoginCode(code);
    if (result === "ok") {
      clearLoginCode();
      window.location.replace(callbackUrl);
      return true;
    }
    if (result === "failed") {
      clearLoginCode();
      setWaitingForBrowser(false);
      setIsLoading(false);
    }
    return false;
  }, [callbackUrl]);

  // In the PWA: keep checking whether the browser finished LINE login,
  // immediately when the user switches back to the app and every 2 seconds.
  useEffect(() => {
    // The login window itself (handoff param) never claims; only the app does.
    if (handoffCode || !isStandalonePwa() || !getPendingLoginCode()) return;
    setWaitingForBrowser(true);
    finishPwaLogin();
    const interval = window.setInterval(finishPwaLogin, 2000);
    const onVisible = () => document.visibilityState === "visible" && finishPwaLogin();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [finishPwaLogin, waitingForBrowser, handoffCode]);

  // The login window posts this when LINE login is done, then closes itself.
  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "clipflow:login-done") return;
      const ok = await finishPwaLogin();
      // Desktop popups share cookies with the app, so the session may already be here.
      if (!ok) window.location.replace(callbackUrl);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [finishPwaLogin, callbackUrl]);

  const handleLineLogin = async () => {
    setIsLoading(true);
    try {
      if (isStandalonePwa()) {
        // Like "Sign in with Google": LINE login runs in a popup window (a
        // browser sheet on phones), which hands the session back to the app
        // with a one-time code and closes. Opened synchronously in the click
        // so it is not blocked.
        const code = getOrCreateLoginCode();
        const target = `${window.location.origin}/login?handoff=${encodeURIComponent(code)}`;
        setHandoffUrl(target);
        const width = Math.min(480, window.screen.availWidth);
        const height = Math.min(760, window.screen.availHeight);
        const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
        const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
        const popup = window.open(target, "clipflow-line-login", `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
        if (!popup) {
          // Popup blocked: log in in this window instead; /auth/handoff
          // brings the app back to the dashboard afterwards.
          window.location.assign(target);
          return;
        }
        popup.focus();
        setWaitingForBrowser(true);
        // Allow tapping again (same code) if the other window was closed.
        setIsLoading(false);
        return;
      }
      await signIn("line", {
        callbackUrl: handoffCode ? `/auth/handoff?code=${encodeURIComponent(handoffCode)}` : callbackUrl,
      });
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  // Opened for a PWA login: start LINE login right away. This page may itself
  // be running inside the installed app (phones keep same-site links in the
  // app), so it must not skip the login when standalone.
  useEffect(() => {
    if (handoffCode) {
      setIsLoading(true);
      signIn("line", { callbackUrl: `/auth/handoff?code=${encodeURIComponent(handoffCode)}` }).catch(() => setIsLoading(false));
    }
  }, [handoffCode]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 selection:bg-slate-100 selection:text-slate-900">
      <div className="w-full max-w-sm flex flex-col items-center space-y-8 animate-in fade-in duration-700">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-40 h-40">
            <Image
              src="/Image/Clipflow.png"
              alt="Clip Flow Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-slate-500 text-sm">Please log in to continue</p>
        </div>

        {error === "AccessDenied" && (
          <div className="w-full p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
            Access denied. You might not have permission.
          </div>
        )}

        {waitingForBrowser && (
          <div className="w-full rounded-lg border border-blue-100 bg-blue-50 p-4 text-center text-sm leading-6 text-blue-800">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
            กำลังเข้าสู่ระบบด้วย LINE ในหน้าต่างใหม่
            <br />
            ยืนยันให้เรียบร้อย แอปจะเข้าสู่ระบบให้อัตโนมัติ
            {handoffUrl && (
              <a href={handoffUrl} className="mt-3 block font-semibold text-blue-700 underline">
                ถ้าหน้าต่าง LINE ไม่ขึ้นมา กดที่นี่
              </a>
            )}
          </div>
        )}

        {/* Login Button */}
        <div className="w-full space-y-4 bg-white">
          <button
            onClick={handleLineLogin}
            disabled={isLoading}
            className="cursor-pointer w-full flex items-center justify-center gap-3 bg-[#06C755] hover:bg-[#05b34c] text-white px-6 py-3.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>ดำเนินการต่อด้วย LINE</span>
              </>
            )}
          </button>
        </div>
        <Link href="/docs" className="block text-center text-sm text-slate-500 hover:text-blue-700">
          อ่านคู่มือการใช้งาน
        </Link>
        {process.env.NODE_ENV === "development" && (
          <div className="text-center">
            <a
              href="/bypass"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Developer Bypass
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
