"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSidebarMenu } from "@/lib/constants";
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  User,
  LogOut,
  Loader2,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useAnalytics } from "@/hooks/use-analytics";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const currentUser = {
    name: session?.user?.name || "Loading...",
    role: session?.user?.role || "USER",
    image: session?.user?.image || null,
  };

  const [menuExpanded, setMenuExpanded] = useState<Record<string, boolean>>({
    Main: true,
  });
  const [bottomMenuOpen, setBottomMenuOpen] = useState(false);
  const [isLiffClient, setIsLiffClient] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      setIsLiffClient(ua.indexOf("Line") > -1);
    }
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    trackEvent({ eventName: "user_logout" });
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
    }
  };

  const isCollapsedState = isCollapsed && !isOpen;
  const sidebarMenu = getSidebarMenu(currentUser.role as any);
  const closeSidebarOnMobile = () => {
    if (onClose && typeof window !== "undefined" && window.innerWidth < 768) {
      onClose();
    }
  };

  const toggleMenu = (key: string) => {
    if (isCollapsed && onToggleCollapse) {
      onToggleCollapse();
      setMenuExpanded((prev) => ({ ...prev, [key]: true }));
      return;
    }
    setMenuExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        data-collapsed={isCollapsed}
        className={`group fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 shrink-0 transition-all duration-300 ease-in-out md:relative ${isOpen ? "translate-x-0 w-[260px] shadow-[10px_0_40px_rgba(0,0,0,0.08)] md:shadow-none" : "-translate-x-full md:translate-x-0"} ${isCollapsedState ? "md:w-[64px]" : "md:w-[260px]"}`}
      >
        <div className="flex flex-col h-full bg-white">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-6 custom-scrollbar">
            {/* 1. Top Profile Header */}
            <div className="hidden md:block">
              <div
                className={`w-full flex items-center py-1 transition-all duration-200 overflow-hidden ${isCollapsedState ? "justify-center px-0" : "px-1"}`}
              >
                {currentUser.image ? (
                  <img
                    src={currentUser.image}
                    alt="Profile"
                    className="w-10 h-10 rounded-full shrink-0 object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full shrink-0 bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 font-bold">
                    {currentUser.name?.[0] || "?"}
                  </div>
                )}
                <div
                  className={`flex items-center justify-between flex-1 overflow-hidden transition-all duration-300 ${isCollapsedState ? "max-w-0 opacity-0" : "max-w-[400px] opacity-100"}`}
                >
                  <div className="font-bold text-[13px] ml-3 text-slate-700 truncate max-w-full">
                    {status === "loading"
                      ? "Loading..."
                      : session?.user?.name || "User"}
                    <div className="text-xs font-medium text-slate-500 mt-0.5 tracking-wide">
                      {currentUser.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Menu Sections */}
            {sidebarMenu.map((section, idx) => (
              <div key={idx} className="px-1">
                <h3
                  className={`text-xs font-medium text-slate-500 px-2 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsedState ? "max-h-0 opacity-0 mb-0" : "max-h-[20px] opacity-100 mb-2"}`}
                >
                  {section.section}
                </h3>
                <div className="space-y-1.5">
                  {section.items.map((item, itemIdx) => {
                    const active = pathname === item.href;
                    const hasChildren =
                      item.children && item.children.length > 0;

                    if (hasChildren) {
                      return (
                        <div key={itemIdx}>
                          <button
                            onClick={() => toggleMenu(item.title)}
                            className={`w-full flex items-center py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all duration-200 overflow-hidden ${isCollapsedState ? "justify-center px-0" : "px-2"}`}
                          >
                            <div
                              className={`flex items-center justify-center shrink-0 transition-all duration-300 ${isCollapsedState ? "w-8 h-8" : "w-6 h-6"}`}
                            >
                              <item.icon
                                size={18}
                                className={
                                  active ? "text-slate-800" : "text-slate-500"
                                }
                              />
                            </div>
                            <div
                              className={`flex items-center justify-between flex-1 overflow-hidden transition-all duration-300 ${isCollapsedState ? "max-w-0 opacity-0 ml-0" : "max-w-[400px] opacity-100 ml-2"}`}
                            >
                              <span className="whitespace-nowrap">
                                {item.title}
                              </span>
                              <div className="shrink-0 transition-transform duration-200">
                                {menuExpanded[item.title] ? (
                                  <ChevronDown
                                    size={16}
                                    className="text-slate-500"
                                  />
                                ) : (
                                  <ChevronRight
                                    size={16}
                                    className="text-slate-500"
                                  />
                                )}
                              </div>
                            </div>
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${!isCollapsedState && menuExpanded[item.title] ? "max-h-[300px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                          >
                            <div className="flex flex-col py-1 space-y-1">
                              {item.children?.map((child, childIdx) => (
                                <Link
                                  key={childIdx}
                                  href={child.href}
                                  onClick={closeSidebarOnMobile}
                                  className="flex items-center justify-between pl-10 pr-2 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all duration-200"
                                >
                                  <span className="whitespace-nowrap">
                                    {child.title}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // No children
                    return (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        onClick={closeSidebarOnMobile}
                        className={`group w-full flex items-center py-2 text-[14px] font-medium rounded-md transition-all duration-200 overflow-hidden ${isCollapsedState ? "justify-center px-0" : "px-2"} ${active ? "text-slate-800 bg-slate-50" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}
                      >
                        <div
                          className={`flex items-center justify-center shrink-0 transition-all duration-300 ${isCollapsedState ? "w-8 h-8" : "w-6 h-6"}`}
                        >
                          <item.icon
                            size={18}
                            className={`${active ? "text-slate-700" : "text-slate-500 group-hover:text-slate-700 transition-colors"}`}
                          />
                        </div>
                        <div
                          className={`flex items-center justify-between flex-1 overflow-hidden transition-all duration-300 ${isCollapsedState ? "max-w-0 opacity-0 ml-0" : "max-w-[400px] opacity-100 ml-2"}`}
                        >
                          <span className="whitespace-nowrap">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-bold shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div>
            {/* Bottom Fixed User Profile */}
            {!isLiffClient && (
              <div className="p-2 border-t border-slate-100 relative bg-white mt-auto">
                {bottomMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => !isLoggingOut && setBottomMenuOpen(false)}
                    ></div>
                    <div
                      className={`bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                        isCollapsedState
                          ? "absolute bottom-2 left-[calc(100%+12px)] w-[260px]"
                          : "absolute bottom-[calc(100%+8px)] left-2 right-2"
                      }`}
                    >
                      {isCollapsedState && (
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
                          <div className="w-8 h-8 bg-slate-200 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                            {currentUser.image ? (
                              <img
                                src={currentUser.image}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                {currentUser.name?.[0] || "?"}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-slate-800 truncate">
                              {currentUser.name}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md w-fit mt-0.5 tracking-wide">
                              {currentUser.role}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="py-2">
                        <Link
                          href="/settings/profile"
                          onClick={() => setBottomMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User size={16} /> โปรไฟล์
                        </Link>
                        <div className="h-px bg-slate-50 my-1 mx-4"></div>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />{" "}
                              กำลังออกจากระบบ...
                            </>
                          ) : (
                            <>
                              <LogOut size={16} /> ออกจากระบบ
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                <button
                  onClick={() => setBottomMenuOpen(!bottomMenuOpen)}
                  className="w-full flex items-center p-1 hover:bg-slate-50 rounded-xl transition-colors bg-slate-50/50 overflow-hidden"
                >
                  <div className="w-10 h-10 bg-slate-200 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                    {currentUser.image ? (
                      <img
                        src={currentUser.image}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                        {currentUser.name?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex items-center justify-between flex-1 overflow-hidden transition-all duration-300 ${isCollapsedState ? "max-w-0 opacity-0 ml-0" : "max-w-[400px] opacity-100 ml-3"}`}
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-[14px] font-bold text-slate-800 truncate w-full text-left">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md mt-0.5 tracking-wide">
                        {currentUser.role}
                      </span>
                    </div>
                    <ChevronsUpDown
                      size={16}
                      className="text-slate-500 shrink-0 ml-2"
                    />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
