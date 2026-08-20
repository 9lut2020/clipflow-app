"use client";

import { useState } from "react";
import { Clip } from "@/types/api";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

interface NotificationsClientProps {
  clips: Clip[];
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "REVISION" | "APPROVAL" | "NEW_TASK" | "SYSTEM";
  createdAt: string;
  isRead: boolean;
}

export function NotificationsClient({ clips }: NotificationsClientProps) {
  // Generate REAL notifications dynamically from database clips
  const realNotifications: NotificationItem[] = clips.map((clip) => {
    const ownerName = clip.owner?.displayName || "นักตัดต่อ";
    const dateFormatted = clip.updatedAt || clip.createdAt;
    const timeAgo = dateFormatted
      ? new Date(dateFormatted).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "เร็วๆ นี้";

    if (clip.status === "APPROVED") {
      return {
        id: clip.id,
        title: `อนุมัติแล้ว: ${clip.name}`,
        message: `คลิป '${clip.name}' (รับผิดชอบโดย ${ownerName}) ได้รับการตรวจอนุมัติพร้อมใช้งานแล้ว`,
        type: "APPROVAL",
        createdAt: timeAgo,
        isRead: false,
      };
    }

    if (clip.status === "NEEDS_REVISION") {
      return {
        id: clip.id,
        title: `สั่งแก้ไข: ${clip.name}`,
        message: `คลิป '${clip.name}' ถูกส่งกลับไปยัง ${ownerName} เพื่อแก้ไขเพิ่มเติม`,
        type: "REVISION",
        createdAt: timeAgo,
        isRead: false,
      };
    }

    return {
      id: clip.id,
      title: `สถานะงานใหม่: ${clip.name}`,
      message: `คลิป '${clip.name}' (รับผิดชอบโดย ${ownerName}) มีความเคลื่อนไหวล่าสุด (${clip.status})`,
      type: "NEW_TASK",
      createdAt: timeAgo,
      isRead: false,
    };
  });

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(realNotifications);

  // LINE Notification settings state
  const [notifyOnRevision, setNotifyOnRevision] = useState(true);
  const [notifyOnApproval, setNotifyOnApproval] = useState(true);
  const [notifyOnNewTask, setNotifyOnNewTask] = useState(true);
  const [isTestingLine, setIsTestingLine] = useState(false);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

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
        alert(
          "✅ ยิงคำสั่งส่งข้อความเข้า LINE เรียบร้อยแล้ว!\n\n💡 หมายเหตุ: เพื่อให้ข้อความเด้งบนมือถือของคุณ โปรดตรวจสอบว่าคุณได้กด 'เพิ่มเพื่อน (Add Friend)' กับ LINE Official Account ของระบบไว้แล้วเรียบร้อย",
        );
      } else {
        alert(`❌ ไม่สามารถส่งข้อความได้: ${res.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งข้อความ LINE");
    } finally {
      setIsTestingLine(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-24 lg:pb-8 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              ศูนย์การแจ้งเตือน LINE Notification Center
            </h1>
          </div>
          <p className="text-slate-600 text-xs md:text-sm mt-1">
            รายการความเคลื่อนไหวของคลิปจริงในระบบ และระบบส่งการแจ้งเตือนเข้า
            LINE รายบุคคล
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
        >
          ทำเป็นอ่านแล้วทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* NOTIFICATION FEED (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 md:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                <span>รายการความเคลื่อนไหว</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 md:p-5 divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-medium">
                  ไม่พบรายการความเคลื่อนไหวในขณะนี้
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 transition-colors ${
                      !item.isRead ? "bg-blue-50/30 -mx-4 px-4 rounded-xl" : ""
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === "REVISION" ? (
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                          <AlertTriangle size={16} />
                        </div>
                      ) : item.type === "APPROVAL" ? (
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
                        <h4 className="font-bold text-slate-900 text-xs md:text-sm truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-600 font-medium shrink-0">
                          {item.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* LINE NOTIFY & SETTINGS SIDEBAR (lg:col-span-5) */}
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
      </div>
    </div>
  );
}
