import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AuditLogsClient } from "./audit-logs-client";

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-full mx-auto pb-24 lg:pb-12 px-1 sm:px-0">
      {/* Top Full-Width Header Title Bar */}
      <div className="w-full mb-4 sm:mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
              System Audit Logs 🛡️
            </h1>
            <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
              บันทึกประวัติการใช้งานและเหตุการณ์สำคัญในระบบ
            </p>
          </div>
        </div>
      </div>

      <AuditLogsClient />
    </div>
  );
}
