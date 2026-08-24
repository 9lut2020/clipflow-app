"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  ListTodo,
  BarChart3,
  Bell,
  Users,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { Clip } from "@/types/api";
import Image from "next/image";
export default function MenuPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLiffClient, setIsLiffClient] = useState(false);

  // แรนเดอร์เวลาที่หน้าเว็บโหลดเสร็จครั้งแรกครั้งเดียว พอไม่ต้องยิงเช็ค API แล้ว
  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );

    if (typeof window !== "undefined") {
      const ua =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      setIsLiffClient(ua.indexOf("Line") > -1);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/api/auth/signin" });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Fetch tasks for progress bar
  const { data: clipsData } = useSWR<{ data: Clip[] }>(
    user?.id
      ? user.role === "USER"
        ? `/clips?ownerId=${user.id}`
        : "/clips"
      : null,
    async (url: string) => {
      const res = await apiClient.get<Clip[]>(url);
      return { data: res.data || [] };
    },
    { refreshInterval: 60000 },
  );

  const clips = clipsData?.data || [];
  const approvedClips = clips.filter((c) => c.status === "APPROVED");
  const totalClips = clips.length;
  const completionPercentage =
    totalClips > 0 ? Math.round((approvedClips.length / totalClips) * 100) : 0;

  const menuItems = [
    {
      id: "01",
      icon: FolderKanban,
      title: "โปรเจกต์ทั้งหมด",
      desc: "จัดการรายการโปรเจกต์และซีรีส์ทั้งหมดในระบบ",
      href: "/projects",
      color: "group-hover:text-blue-500 dark:group-hover:text-blue-400",
      iconBg:
        "group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-sky-500",
    },
    {
      id: "02",
      icon: ListTodo,
      title: "งานของฉัน",
      desc: "ตรวจสอบสถานะคลิปและสิ่งที่ต้องแก้ไข",
      href: "/tasks",
      color: "group-hover:text-sky-500 dark:group-hover:text-sky-400",
      iconBg:
        "group-hover:bg-gradient-to-br group-hover:from-sky-500 group-hover:to-blue-500",
    },
    {
      id: "03",
      icon: BarChart3,
      title: "ศูนย์สถิติ (Analytics)",
      desc: "ดูภาพรวมและประสิทธิภาพการทำงานของทีม",
      href: "/analytics",
      color: "group-hover:text-indigo-500 dark:group-hover:text-indigo-400",
      iconBg:
        "group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-blue-500",
    },
    {
      id: "04",
      icon: Bell,
      title: "การแจ้งเตือน",
      desc: "ดูประวัติความเคลื่อนไหวของคลิปในระบบ",
      href: "/notifications",
      color: "group-hover:text-cyan-500 dark:group-hover:text-cyan-400",
      iconBg:
        "group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-sky-500",
      roles: ["ADMIN", "REVIEWER"],
    },
    {
      id: "05",
      icon: Users,
      title: "จัดการผู้ใช้งาน",
      desc: "ตั้งค่าสิทธิ์และการเข้าถึงสำหรับแอดมิน",
      href: "/admin/users",
      color: "group-hover:text-blue-500 dark:group-hover:text-blue-400",
      iconBg:
        "group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-500",
      roles: ["ADMIN"],
    },
    {
      id: "06",
      icon: Settings,
      title: "โปรไฟล์ของฉัน",
      desc: "ตั้งค่าบัญชีและการแจ้งเตือนผ่าน LINE",
      href: "/settings/profile",
      color: "group-hover:text-indigo-500 dark:group-hover:text-indigo-400",
      iconBg:
        "group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-slate-500",
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-hidden">
      {/* Glow Ambient Lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-blue-500/10 to-sky-500/0 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-sky-500/5 to-blue-500/0 rounded-full blur-[130px] pointer-events-none" />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-16 relative z-10">
        {/* Header Section */}
        <header className="mb-5 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 sm:px-6">
          {/* ฝั่งซ้าย: ข้อความต้อนรับ */}
          <div className="text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold tracking-wider uppercase mb-3 border border-blue-500/10">
              <Flame size={12} className="fill-current animate-pulse" />
              <span>ClipFlow Workspace</span>
            </div>

            <h1 className="text-3xl sm:text-[2.5rem] font-extrabold tracking-tight leading-tight">
              ยินดีต้อนรับสู่{" "}
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                ClipFlow
              </span>
            </h1>
            <p className="mt-2 text-slate-500 dark:text-zinc-400 text-xs sm:text-sm max-w-md leading-relaxed">
              ระบบตรวจสอบคลิป เลือกเมนูที่คุณต้องการเพื่อเริ่มต้น
            </p>
          </div>

          {/* ฝั่งขวา: User Status Card */}
          <div className="flex items-center justify-between md:justify-start gap-4 p-3 w-full sm:w-auto md:max-w-md bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-500 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0 uppercase">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  "U"
                )}
              </div>

              <div className="flex flex-col min-w-0 pr-4">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 truncate leading-tight">
                  {user?.name || "พนักงาน"}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                    {user?.role || "USER"}
                  </span>
                </div>
              </div>
            </div>

            {!isLiffClient && (
              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-zinc-800 pl-3 shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-500 transition-all active:scale-90"
                  title="ออกจากระบบ"
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Progress Bar (My Tasks) */}
        <div className="max-w-6xl mx-auto px-2 sm:px-6 mb-8">
          <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full">
            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white flex items-center justify-center shadow-md">
                <ListTodo size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-100">
                  โปรเซสงานของคุณ
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  ความคืบหน้าการทำงานทั้งหมด
                </p>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-semibold">
                <span className="text-slate-600 dark:text-zinc-300">
                  ความสำเร็จ (เสร็จสิ้น {approvedClips.length} จาก {totalClips})
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {completionPercentage}%
                </span>
              </div>
              <div className="h-2.5 sm:h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner w-full relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-500 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${completionPercentage}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento/Portal Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto px-2 sm:px-6">
          {filteredMenuItems.map((item, index) => (
            <Link href={item.href} key={index} className="group">
              <div className="relative h-full flex flex-col justify-between items-center md:items-start rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-4 sm:p-6 transition-all duration-300 hover:scale-[1.03] hover:border-blue-500/20 dark:hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5">
                <div className="flex flex-col items-center md:items-start w-full">
                  <div
                    className={`inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border border-slate-100 dark:border-zinc-800/60 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:border-transparent ${item.iconBg}`}
                  >
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:rotate-3" />
                  </div>

                  <h3
                    className={`mt-3 sm:mt-5 text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-100 transition-colors text-center md:text-left w-full break-words ${item.color}`}
                  >
                    {item.title}
                  </h3>

                  <p className="hidden sm:block mt-1.5 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium text-center md:text-left w-full">
                    {item.desc}
                  </p>
                </div>
                <div className="absolute left-0 top-1/4 bottom-1/4 w-0.75 rounded-r-md transition-all duration-300 group-hover:h-1/2 bg-gradient-to-b from-blue-500 to-sky-500 opacity-0 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Minimalist */}
        <footer className="mt-20 border-t border-slate-200 dark:border-zinc-900 pt-8 text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            ClipFlow HQ Workspace{" "}
            {lastUpdated && `• เข้าใช้งานล่าสุดเมื่อ ${lastUpdated} น.`}
          </p>
        </footer>
      </div>
    </main>
  );
}
