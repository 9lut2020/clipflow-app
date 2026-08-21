"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  MessageCircle,
  ArrowLeft,
  UserCircle,
  Shield,
  Briefcase,
  Activity,
  CalendarDays,
} from "lucide-react";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { UserAvatar } from "@/components/ui/user-avatar";
import Link from "next/link";

export function ProfileClient({ userId }: { userId: string }) {
  const { profile, isLoading } = useProfile(userId);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full flex justify-center mt-10">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
        <Card className="border-red-100 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-red-500 text-center">ไม่พบข้อมูลผู้ใช้งาน</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pb-20 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/30 p-5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button
              type="button"
              className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <UserCircle className="text-blue-500" size={24} />
              โปรไฟล์ส่วนตัว
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Info Sidebar */}
        <div className="space-y-6 md:order-2">
          <Card className="p-6 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <UserAvatar
                name={profile.displayName}
                pictureUrl={profile.pictureUrl}
                size="w-20 h-20 text-2xl"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {profile.displayName}
            </h3>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100">
                <Shield size={16} />
                {profile.role}
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2 space-y-6 md:order-1">
          <Card className="p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <UserCircle size={20} className="text-blue-500" /> ข้อมูลทั่วไป
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    ชื่อที่แสดงในระบบ
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium">
                    <UserCircle size={18} className="text-slate-400" />
                    {profile.displayName}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    บทบาท
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium">
                    <Briefcase size={18} className="text-slate-400" />
                    {profile.role}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    สถานะบัญชี
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium">
                    <Activity
                      size={18}
                      className={
                        profile.isActive !== false
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }
                    />
                    {profile.isActive !== false
                      ? "เปิดใช้งาน"
                      : "ระงับการใช้งาน"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    วันที่เข้าร่วมระบบ
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium">
                    <CalendarDays size={18} className="text-slate-400" />
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "th-TH",
                          { year: "numeric", month: "long", day: "numeric" },
                        )
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* LINE Connection Card */}
          <Card className="border-green-100 shadow-sm overflow-hidden bg-gradient-to-br from-green-50 to-white p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <MessageCircle size={20} className="text-[#06C755]" />{" "}
              การเชื่อมต่อ LINE
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                คุณได้เชื่อมต่อบัญชี LINE เรียบร้อยแล้ว
                ระบบจะส่งการแจ้งเตือนต่างๆ ผ่าน LINE ของคุณ
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                เชื่อมต่อแล้ว
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
