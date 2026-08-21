"use client";

import { useState } from "react";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { Notification } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";

interface TopbarProps {
  onMenuClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Topbar({
  onMenuClick,
  isCollapsed,
  onToggleCollapse,
}: TopbarProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  // Poll unread count every 60 seconds to save Cloudflare Worker limits
  const { data: unreadData, mutate: mutateUnread } = useSWR<{ status: string; data: number }>(
    session?.user?.id ? "/notifications/unread-count" : null,
    async (url: string) => {
      const res = await apiClient.get<number>(url);
      return { status: res.status, data: res.data || 0 };
    },
    { refreshInterval: 60000 }
  );

  // Fetch notifications only when the dropdown is open
  const { data: notifData, mutate: mutateNotifs } = useSWR<{ status: string; data: Notification[] }>(
    open && session?.user?.id ? "/notifications" : null,
    async (url: string) => {
      const res = await apiClient.get<Notification[]>(url);
      return { status: res.status, data: res.data || [] };
    }
  );

  const unreadCount = unreadData?.data || 0;
  const notifications = notifData?.data || [];

  const handleMarkAsRead = async (id: string, linkUrl: string | null) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`, {});
      mutateUnread();
      mutateNotifs();
      setOpen(false);
      // Let Link handle the navigation if linkUrl exists
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch(`/notifications/read-all`, {});
      mutateUnread();
      mutateNotifs();
      toast.success("ทำเครื่องหมายอ่านแล้วทั้งหมด");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl z-40 sticky top-0 shrink-0 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500 md:hidden transition-colors"
          title="เปิดเมนู"
        >
          <Menu size={20} />
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex p-2 -ml-2 rounded-xl hover:bg-slate-100/80 text-slate-500 transition-colors"
          title="ย่อ/ขยายเมนู"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-black text-slate-800 tracking-tight">
            ClipFlow
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition relative"
          title="แจ้งเตือน"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-[9px] text-white font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile in Topbar */}
        <div className="flex md:hidden items-center ml-2 border-l border-slate-200 pl-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-sm shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-300 shrink-0">
              {session?.user?.name?.[0] || "?"}
            </div>
          )}
          <div className="flex flex-col text-left min-w-0">
            <div className="font-bold text-[13px] ml-2 text-slate-700 truncate max-w-[100px]">
              {status === "loading" ? "Loading..." : session?.user?.name || "User"}
            </div>
            <span className="font-medium text-[10px] ml-2 text-slate-500 uppercase">
              {session?.user?.role || "USER"}
            </span>
          </div>
        </div>

        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              aria-label="ปิด"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-[-1rem] sm:right-0 top-full mt-3 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5">
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-800">
                    การแจ้งเตือน
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                      {unreadCount} ใหม่
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 size={12} /> อ่านทั้งหมด
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Bell className="text-gray-400 opacity-50" size={20} />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      ยังไม่มีการแจ้งเตือนใหม่
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const content = (
                      <div
                        onClick={() => {
                          if (!notif.isRead) handleMarkAsRead(notif.id, notif.linkUrl);
                          else setOpen(false);
                        }}
                        className={`flex gap-3 p-3 rounded-xl transition-colors cursor-pointer border ${
                          notif.isRead
                            ? "bg-transparent border-transparent hover:bg-gray-50"
                            : "bg-blue-50/50 border-blue-100/50 hover:bg-blue-50"
                        }`}
                      >
                        <div className="shrink-0 mt-0.5 relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              notif.isRead ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <Bell size={18} />
                          </div>
                          {!notif.isRead && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm mb-0.5 ${notif.isRead ? "text-gray-700 font-medium" : "text-gray-900 font-bold"}`}>
                            {notif.title}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-medium">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: th })}
                          </div>
                        </div>
                      </div>
                    );

                    if (notif.linkUrl) {
                      return (
                        <Link key={notif.id} href={notif.linkUrl}>
                          {content}
                        </Link>
                      );
                    }
                    return <div key={notif.id}>{content}</div>;
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
