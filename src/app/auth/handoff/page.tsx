import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/api-server";
import { ContinueInApp } from "./continue-in-app";

export const dynamic = "force-dynamic";

/**
 * Landing page in the system browser after LINE login started from the PWA.
 * Registers the PWA's one-time code for this user, then asks the user to go
 * back to the app, which finishes signing in by itself.
 */
export default async function LoginHandoffPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const validCode = typeof code === "string" && /^[A-Za-z0-9_-]{32,128}$/.test(code) ? code : null;
  if (!validCode) redirect("/login");

  const session = await getSession();
  if (!session?.user?.id) redirect(`/login?handoff=${encodeURIComponent(validCode)}`);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787/api";
  const res = await fetch(`${apiUrl}/internal/auth-handoffs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
    },
    body: JSON.stringify({ code: validCode, userId: session.user.id }),
    cache: "no-store",
  }).catch(() => null);
  const ok = Boolean(res?.ok);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
        <Image src="/Image/Clipflow.png" alt="" width={72} height={72} className="mx-auto" />
        {ok ? (
          <>
            <h1 className="mt-4 text-lg font-bold text-slate-900">เข้าสู่ระบบสำเร็จ ✅</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              กลับไปที่แอป <b>ClipFlow</b> บนหน้าจอโฮมได้เลย แอปจะเข้าสู่ระบบให้อัตโนมัติ
            </p>
            <p className="mt-4 text-xs text-slate-400">หรือใช้งานต่อในหน้านี้ได้เลย</p>
            <ContinueInApp />
          </>
        ) : (
          <>
            <h1 className="mt-4 text-lg font-bold text-slate-900">เชื่อมต่อแอปไม่สำเร็จ</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              กลับไปที่แอป ClipFlow แล้วกดเข้าสู่ระบบอีกครั้ง
            </p>
          </>
        )}
      </div>
    </div>
  );
}
