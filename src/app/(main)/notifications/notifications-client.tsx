"use client";

import { useState } from "react";
import { Notification } from "@/types/api";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSWR from "swr";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Smartphone,
  Info,
  QrCode,
  ExternalLink,
  Loader2,
  ArrowLeft,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { NotificationPermissionButton } from "@/components/pwa/pwa-client";

interface NotificationsClientProps {
  role: string;
}

export function NotificationsClient({ role }: NotificationsClientProps) {
  const { data: notifData, mutate } = useSWR<{ status: string; data: Notification[] }>(
    "/notifications?page=1&limit=100",
    async (url: string) => {
      const res = await apiClient.get<{ items: Notification[] }>(url);
      return { status: res.status, data: res.data?.items || [] };
    },
    { refreshInterval: 60000 }
  );
  const notifications = notifData?.data || [];

  // LINE Notification settings state
  const [notifyOnRevision, setNotifyOnRevision] = useState(true);
  const [notifyOnApproval, setNotifyOnApproval] = useState(true);
  const [notifyOnNewTask, setNotifyOnNewTask] = useState(true);
  const [isTestingLine, setIsTestingLine] = useState(false);

  const handleTestLineNotify = async () => {
    setIsTestingLine(true);
    try {
      const res = await apiClient.post<{ recipientLineUserId: string }>(
        "/notifications/test-line",
        {
          message:
            "📢 [ClipFlow แจ้งเตือน]\nทดสอบการส่งข้อความแจ้งเตือนความเคลื่อนไหวคลิปผ่าน LINE สำเร็จเรียบร้อยแล้ว!",
        },
      );

      if (res.status === "success") {
        toast.success("ยิงคำสั่งส่งข้อความเข้า LINE เรียบร้อยแล้ว!", {
          duration: 6000,
        });
      } else {
        toast.error(`❌ ไม่สามารถส่งข้อความได้: ${res.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการส่งข้อความ LINE");
    } finally {
      setIsTestingLine(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch("/notifications/read-all", {});
      mutate();
      toast.success("อ่านทั้งหมดแล้ว");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการทำเครื่องหมาย");
    }
  };

  const handleMarkAsRead = async (id: string, linkUrl: string | null) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`, {});
      mutate();
      if (linkUrl) {
        window.location.href = linkUrl;
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเปิดแจ้งเตือน");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-24 lg:pb-8 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button
              type="button"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                ศูนย์การแจ้งเตือน Line
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* NOTIFICATION FEED (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 md:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                <span>รายการความเคลื่อนไหว</span>
                <NotificationPermissionButton />
              </CardTitle>
              {notifications.some(n => !n.isRead) && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <CheckSquare size={14} /> อ่านทั้งหมด
                </button>
              )}
            </CardHeader>

            <CardContent className="p-4 md:p-5 divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-medium">
                  ไม่พบรายการความเคลื่อนไหวในขณะนี้
                </div>
              ) : (
                notifications.map((item) => (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(item.id, item.linkUrl)}
                    key={item.id}
                    className={`w-full py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 transition-colors text-left cursor-pointer hover:bg-slate-50 ${
                      !item.isRead ? "bg-blue-50/30 -mx-4 px-4 rounded-xl" : "px-4 -mx-4 rounded-xl"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type.includes("REVISION") ? (
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                          <AlertTriangle size={16} />
                        </div>
                      ) : item.type.includes("APPROV") ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 size={16} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Clock size={16} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-bold text-xs md:text-sm truncate ${item.isRead ? "text-slate-700" : "text-slate-900"}`}>
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-medium shrink-0">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: th })}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${item.isRead ? "text-slate-500" : "text-slate-700 font-medium"}`}>
                        {item.message}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* LINE NOTIFY & SETTINGS SIDEBAR (lg:col-span-5) */}
        {role === "ADMIN" && (
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
              <CardHeader className="p-4 md:p-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Smartphone size={20} className="text-emerald-600" />
                  <span>การเชื่อมต่อ LINE Push Notification</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 md:p-5 space-y-5">
                {/* LINE Status Box */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                      LINE
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900">
                        LINE Account Connected
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        ผูกกับบัญชี LINE ของคุณสำเร็จ
                      </div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>

                {/* Requirement Alert Banner */}
                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl space-y-1">
                  <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <Info size={14} className="text-amber-600 shrink-0" />
                    ข้อกำหนดสำหรับการรับแจ้งเตือนทาง LINE:
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    เพื่อให้ข้อความเด้งแจ้งเตือนเข้าแอป LINE บนมือถือของคุณ
                    **คุณจำเป็นต้องกดเพิ่มเพื่อน (Add Friend)** กับ LINE Official
                    Account (Bot) ของระบบก่อนครับ
                  </p>
                  <div className="pt-1.5 flex items-center gap-2">
                    <a
                      href="https://line.me"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <QrCode size={13} />
                      กดเพิ่มเพื่อนกับ LINE Bot
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700">
                      แจ้งเตือนเข้า LINE เมื่อคลิปถูกสั่งแก้ไข (Needs Revision)
                    </span>
                    <input
                      type="checkbox"
                      checked={notifyOnRevision}
                      onChange={(e) => setNotifyOnRevision(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700">
                      แจ้งเตือนเข้า LINE เมื่อคลิปอนุมัติผ่าน (Approved)
                    </span>
                    <input
                      type="checkbox"
                      checked={notifyOnApproval}
                      onChange={(e) => setNotifyOnApproval(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700">
                      แจ้งเตือนเข้า LINE เมื่อมีงานใหม่รอตรวจ (New Task Pending)
                    </span>
                    <input
                      type="checkbox"
                      checked={notifyOnNewTask}
                      onChange={(e) => setNotifyOnNewTask(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Test Button */}
                <button
                  type="button"
                  disabled={isTestingLine}
                  onClick={handleTestLineNotify}
                  className="w-full py-2.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 border border-emerald-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  {isTestingLine ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      กำลังส่งเข้า LINE...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      ทดสอบส่งแจ้งเตือนเข้า LINE บัญชีของคุณ
                    </>
                  )}
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
