import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";
import SpreadsheetManager from "@/components/admin/spreadsheet-manager";
import MembersClient from "./members-client";
import { Button } from "@/components/ui/button";

export default async function ProjectManagePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const currentUser = session?.user;

  if (!currentUser) {
    redirect("/api/auth/signin");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/projects");
  }

  // Fetch project with full payload (episodes + clips + owners) via /manage endpoint
  const { data: projectData } = await apiServer.get(
    `/projects/${params.id}/manage`,
  );
  const project: any = projectData;

  // Fetch all users for the assignee dropdown (Editors, Reviewers, Admins)
  const { data: usersData } = await apiServer.get(`/users`);
  const allUsers: any[] = (usersData as any) || [];

  // Fetch project members
  const { data: membersData } = await apiServer.get(`/projects/${params.id}/members`);
  const members: any[] = (membersData as any) || [];

  // Allowed users: Members + Admins
  const memberIds = new Set(members.map((m: any) => m.id));
  const allowedUsers = allUsers.filter((u: any) => memberIds.has(u.id) || u.role === "ADMIN");

  if (!project) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        ไม่พบโปรเจกต์
      </div>
    );
  }

  // Flatten episodes into a list of clips
  let initialClips: any[] = [];
  if (project.episodes) {
    project.episodes.forEach((ep: any) => {
      if (ep.clips) {
        ep.clips.forEach((clip: any) => {
          initialClips.push({
            id: clip.id,
            episodeNo: ep.episodeNo,
            name: clip.name,
            description: clip.description || "",
            ownerId: clip.ownerId,
            status: clip.status,
          });
        });
      }
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <Link href={`/projects/${project.id}`}>
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
                จัดการโปรเจกต์
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-slate-500 text-[11px] sm:text-xs truncate">
                  {project.name}
                </p>
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-[11px] sm:text-xs font-medium bg-blue-50 px-2 py-0.5 rounded-full"
                >
                  <Edit size={12} /> แก้ไขข้อมูลโปรเจกต์
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-base shadow-sm border border-slate-200 overflow-hidden mb-6">
        <SpreadsheetManager
          projectId={project.id}
          initialClips={initialClips}
          initialEpisodes={project.episodes || []}
          users={allowedUsers}
        />
      </div>

      <div className="bg-white rounded-base shadow-sm border border-slate-200 overflow-hidden mb-6">
        <MembersClient projectId={project.id} allUsers={allUsers} />
      </div>
    </div>
  );
}
