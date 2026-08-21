import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectClipsList from "@/components/projects/project-clips-list";

export default async function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }
  const currentUser = session.user;
  const isUser = currentUser.role === "USER";

  let data;
  try {
    const response = await apiServer.get<any>(`/projects/${params.id}/clips`);
    data = response.data;
  } catch (error: any) {
    // If it's a 403 Forbidden error (user not assigned to project)
    if (error.message.includes("Forbidden") || error.message.includes("403") || error.message.includes("404")) {
      redirect("/projects");
    }
  }

  if (!data) {
    redirect("/projects");
  }

  const { project, clips } = data;
  const episodes = project?.episodes || [];

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Top Full-Width Header Title Bar - Compact Sleek Typography */}
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <Link href="/projects">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
                {project.name}
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                {project.description ||
                  "รายการตอนและคลิปวิดีโอทั้งหมดในโปรเจกต์นี้"}
              </p>
            </div>
          </div>

          {currentUser.role === "ADMIN" && (
            <Link
              href={`/admin/projects/${project.id}/manage`}
              className="shrink-0"
            >
              <button
                type="button"
                className="px-3 py-2 sm:px-4 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Settings size={15} />
                <span className="hidden sm:inline">จัดการโครงสร้างแผน</span>
                <span className="sm:hidden text-xs">จัดการ</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      <ProjectClipsList
        project={project}
        episodes={episodes}
        clips={clips}
        currentUser={currentUser}
        isUser={isUser}
      />
    </div>
  );
}
