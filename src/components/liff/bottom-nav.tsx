"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, FileVideo, Menu } from "lucide-react";
import { useSession } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "USER";
  const isUser = role === "USER";

  const leftNavItems: NavItem[] = [
    { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
    { href: "/menu", label: "เมนู", icon: Menu },
  ];

  const centerFloatingItem: NavItem | null = isUser
    ? {
        href: "/submit",
        label: "ส่งคลิป",
        icon: PlusCircle,
      }
    : null;

  const rightNavItems: NavItem[] = [
    {
      href: isUser ? "/tasks" : "/projects",
      label: isUser ? "งานของฉัน" : "โปรเจกต์",
      icon: FileVideo,
    },
  ];

  const visibleNavItems = [...leftNavItems];
  if (centerFloatingItem) visibleNavItems.push(centerFloatingItem);
  visibleNavItems.push(...rightNavItems);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
      {/* Background layer for bottom nav (optional for some blur/styling) */}
      <div className="absolute inset-0"></div>

      <div className="relative mx-4 mb-4 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-2 py-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/20">
        {visibleNavItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 transition-colors ${
                isActive
                  ? "text-sky-500 bg-sky-100 rounded-xl p-2"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? "" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Additional More Menu button for users */}
        {isUser && (
          <button className="flex flex-1 flex-col items-center gap-1 text-slate-400 active:text-sky-500">
            <Menu className="h-6 w-6" />
            <span className="text-[10px] font-medium">เพิ่มเติม</span>
          </button>
        )}
      </div>
    </nav>
  );
}
