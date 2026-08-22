"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-4 sm:space-y-6 pb-12">
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                โปรไฟล์ส่วนตัว
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                ข้อมูลบัญชีผู้ใช้งานและการตั้งค่า
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <h3 className="text-sm sm:text-lg font-bold text-slate-800">
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
            <h2 className="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
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
            <h2 className="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <MessageCircle size={20} className="text-[#06C755]" />{" "}
              การเชื่อมต่อ LINE
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm sm:text-lg text-slate-600">
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
