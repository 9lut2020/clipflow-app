"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/menu";
  const error = searchParams.get("error");

  const handleLineLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("line", { callbackUrl });
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

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
