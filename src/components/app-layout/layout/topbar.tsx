"use client";

import { useState } from "react";
import {
  Bell,
  Menu,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

import { useSession } from "next-auth/react";

export default function Topbar({
  onMenuClick,
  isCollapsed,
  onToggleCollapse,
}: TopbarProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const unreadCount = 0;

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
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Bell className="text-gray-400 opacity-50" size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    ยังไม่มีการแจ้งเตือนใหม่
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
