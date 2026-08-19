import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { Project } from "@/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Video, ChevronRight, Plus, Settings, FolderKanban } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }
  const currentUser = session.user;
  const isUser = currentUser?.role === "USER";

  // Fetch projects from API
  const { data: projectsData } = await apiServer.get<Project[]>("/projects");
  const projects = projectsData || [];

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Top Full-Width Header Title Bar - Compact Sleek Typography */}
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                โปรเจกต์ทั้งหมด
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                {isUser ? "โปรเจกต์ที่คุณได้รับมอบหมายในการตัดต่อ" : "รายชื่อโปรเจกต์ทั้งหมดในระบบ ClipFlow"}
              </p>
            </div>
          </div>

          {!isUser && (
            <Link href="/admin/projects/create" className="shrink-0">
              <button type="button" className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5">
                <Plus size={16} />
                <span className="hidden sm:inline">สร้างโปรเจกต์ใหม่</span>
                <span className="sm:hidden text-xs">สร้าง</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {projects.map((project) => (
          <div key={project.id} className="block group relative">
            <Link
              href={`/projects/${project.id}`}
              className="absolute inset-0 z-0"
              aria-label={`View ${project.name}`}
            ></Link>
            <Card className="h-full transition-all duration-200 hover:border-blue-400 hover:shadow-md relative z-10 flex flex-col pointer-events-none rounded-2xl border-slate-200/80">
              <CardHeader className="p-3.5 sm:p-5 pb-2 sm:pb-3 flex-1">
                <div className="flex justify-between items-start">
                  <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-blue-600 transition-colors sm:w-5 sm:h-5"
                  />
                </div>
                <CardTitle className="mt-2.5 sm:mt-3 text-xs sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {project.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-[11px] sm:text-xs mt-1 text-slate-500 font-medium">
                  {project.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-5 pt-0 sm:pt-0 mt-auto pointer-events-auto">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mt-2 pt-2.5 border-t border-slate-100">
                  <span className="font-bold text-blue-600 group-hover:underline">
                    ดูคลิปทั้งหมด →
                  </span>
                  {currentUser.role === "ADMIN" && (
                    <Link
                      href={`/admin/projects/${project.id}/manage`}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors relative z-20"
                    >
                      <Settings size={12} /> จัดการ
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
