"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { ShieldAlert, UserCog, UserCheck, Play, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getCsrfToken } from "next-auth/react";

export default function BypassPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = async (role: string) => {
    setIsLoading(role);
    try {
      const csrfToken = await getCsrfToken();
      
      // Submit a standard HTML form to completely bypass next-auth client caching issues
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/callback/credentials";
      
      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "csrfToken";
      tokenInput.value = csrfToken || "";
      form.appendChild(tokenInput);
      
      const roleInput = document.createElement("input");
      roleInput.type = "hidden";
      roleInput.name = "bypassRole";
      roleInput.value = role;
      form.appendChild(roleInput);
      
      const callbackInput = document.createElement("input");
      callbackInput.type = "hidden";
      callbackInput.name = "callbackUrl";
      callbackInput.value = `${window.location.origin}/dashboard`;
      form.appendChild(callbackInput);
      
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Bypass login failed:", error);
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Developer Bypass
            </h1>
            <p className="text-sm text-slate-500">
              Mock UI Authentication. This page is only accessible in development mode.
            </p>
          </div>

          <div className="w-full space-y-3 mt-4">
            <Button
              variant="outline"
              className="w-full justify-between h-14 px-4 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all group border-slate-200"
              onClick={() => handleLogin("ADMIN")}
              disabled={!!isLoading}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <UserCog className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-slate-700 group-hover:text-indigo-700">Admin</span>
                  <span className="text-xs text-slate-400">Full system access</span>
                </div>
              </div>
              {isLoading === "ADMIN" ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-14 px-4 hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-600 transition-all group border-slate-200"
              onClick={() => handleLogin("REVIEWER")}
              disabled={!!isLoading}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Reviewer</span>
                  <span className="text-xs text-slate-400">Review clips & episodes</span>
                </div>
              </div>
              {isLoading === "REVIEWER" ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-14 px-4 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all group border-slate-200"
              onClick={() => handleLogin("USER")}
              disabled={!!isLoading}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Play className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-slate-700 group-hover:text-blue-700">Editor (User)</span>
                  <span className="text-xs text-slate-400">Submit and edit clips</span>
                </div>
              </div>
              {isLoading === "USER" ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
