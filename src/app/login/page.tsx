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
    if (!isStandalonePwa() || !getPendingLoginCode()) return;
    setWaitingForBrowser(true);
    finishPwaLogin();
    const interval = window.setInterval(finishPwaLogin, 2000);
    const onVisible = () => document.visibilityState === "visible" && finishPwaLogin();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [finishPwaLogin, waitingForBrowser]);

  const handleLineLogin = async () => {
    setIsLoading(true);
    try {
      if (isStandalonePwa()) {
        // LINE approval happens outside the app, so log in through the browser
        // and hand the session back with a one-time code.
        const code = getOrCreateLoginCode();
        const url = `${window.location.origin}/login?handoff=${encodeURIComponent(code)}`;
        window.open(url, "_blank", "noopener");
        setWaitingForBrowser(true);
        // Allow tapping again (same code) if the browser tab was closed.
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

  // Opened from the PWA: start LINE login right away.
  useEffect(() => {
    if (handoffCode && !isStandalonePwa()) {
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
            ยืนยันการเข้าสู่ระบบใน LINE ให้เรียบร้อย แล้วกลับมาที่แอปนี้
            <br />
            ระบบจะเข้าสู่ระบบให้อัตโนมัติ
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
