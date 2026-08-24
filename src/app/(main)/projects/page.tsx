import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { Project } from "@/types/api";

import { Button } from "@/components/ui/button";
import { Video, ChevronRight, Plus, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatImageUrl } from "@/utils/utils";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }
  const currentUser = session.user;
  const isUser = currentUser?.role === "USER";

  // Fetch projects from API
  const { data: projectsData } = await apiServer.get<Project[]>("/projects").catch(() => ({ data: [] }));
  const projects = projectsData || [];

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Top Full-Width Header Title Bar - Compact Sleek Typography */}
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
                โปรเจกต์ทั้งหมด
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                {isUser
                  ? "โปรเจกต์ที่คุณได้รับมอบหมายในการตัดต่อ"
                  : "รายชื่อโปรเจกต์ทั้งหมดในระบบ ClipFlow"}
              </p>
            </div>
          </div>

          {!isUser && (
            <Link href="/admin/projects/create" className="shrink-0">
              <button
                type="button"
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">สร้างโปรเจกต์ใหม่</span>
                <span className="sm:hidden text-xs">สร้าง</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Projects Grid - Clean White Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {projects.map((project) => (
          <div key={project.id} className="block group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col h-full">
            <Link
              href={`/projects/${project.id}`}
              className="absolute inset-0 z-10"
              aria-label={`View ${project.name}`}
            ></Link>
            
            {/* Top Image / Gradient Area */}
            <div className="relative aspect-square w-full bg-slate-100 overflow-hidden border-b border-slate-100 shrink-0">
              {project.pictureUrl ? (
                (() => {
                  const formattedUrl = formatImageUrl(project.pictureUrl);
                  const isOptimized = formattedUrl.includes("lh3.googleusercontent.com");
                  
                  if (isOptimized) {
                    return (
                      <Image 
                        src={formattedUrl} 
                        alt={project.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    );
                  }
                  
                  return (
                    <img 
                      src={formattedUrl} 
                      alt={project.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  );
                })()
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                  <Video className="w-8 h-8 text-blue-200" />
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-3 sm:p-4 flex flex-col flex-1 relative z-20 pointer-events-none bg-white">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h2 className="text-slate-900 font-bold text-[13px] sm:text-[15px] leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                  {project.name}
                </h2>
                
                {/* Admin Setting Button */}
                {currentUser.role === "ADMIN" && (
                  <Link
                    href={`/admin/projects/${project.id}/manage`}
                    className="shrink-0 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors pointer-events-auto"
                    title="จัดการโปรเจกต์"
                  >
                    <Settings size={14} />
                  </Link>
                )}
              </div>
              <p className="text-slate-500 text-[10px] sm:text-[11px] leading-relaxed line-clamp-2 mt-auto">
                {project.description || "ไม่มีรายละเอียด"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
