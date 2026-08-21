"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, MessageCircle } from "lucide-react";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { UserAvatar } from "@/components/ui/user-avatar";

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto w-full pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">โปรไฟล์ส่วนตัว</h1>
        <p className="text-sm text-slate-500 mt-1">
          ข้อมูลส่วนตัวและสถานะบัญชีของคุณ
        </p>
      </div>

      <div className="space-y-6">
        {/* LINE Connection Card */}
        <Card className="border-green-100 shadow-sm overflow-hidden bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#06C755]/10 flex items-center justify-center shrink-0 text-[#06C755]">
                <MessageCircle size={20} className="fill-current" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-800">
                  เชื่อมต่อ LINE แล้ว
                </p>
                <p className="text-[12px] text-slate-500 font-mono mt-0.5">
                  ID: {profile.lineUserId || "ไม่ระบุ"}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              เชื่อมต่อแล้ว
            </span>
          </CardContent>
        </Card>

        {/* Profile Info Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลทั่วไป</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="shrink-0 relative">
                <UserAvatar
                  name={profile.displayName}
                  pictureUrl={profile.pictureUrl}
                  size="w-20 h-20 text-2xl"
                />
              </div>
              <div className="flex flex-col space-y-3">
                <div>
                  <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    สิทธิ์การใช้งาน
                  </Label>
                  <div className="mt-1">
                    {profile.role === "ADMIN" && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                        👑 Admin
                      </span>
                    )}
                    {profile.role === "REVIEWER" && (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                        🔍 Reviewer
                      </span>
                    )}
                    {profile.role === "USER" && (
                      <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
                        🎬 Editor
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    สถานะบัญชี
                  </Label>
                  <div className="mt-1">
                    {profile.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ใช้งานปกติ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        ระงับการใช้งาน
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-6">
              <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                ชื่อที่แสดง
              </Label>
              <p className="text-lg font-medium text-slate-900 bg-slate-50 px-4 py-2.5 rounded-md border border-slate-200">
                {profile.displayName}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
