import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Edit } from "lucide-react";
import SpreadsheetManager from "@/components/admin/spreadsheet-manager";

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

  // Fetch all users for the assignee dropdown, but we only want to show Editors (role === USER)
  const { data: usersData } = await apiServer.get(`/users`);
  const allUsers: any[] = (usersData as any) || [];
  const editorUsers = allUsers.filter((u) => u.role === "USER");

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
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">แผนตรวจคลิปสั้น</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-slate-500 text-sm">{project.name}</p>
            <Link
              href={`/admin/projects/${project.id}/edit`}
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs font-medium"
            >
              <Edit size={12} /> แก้ไขข้อมูลโปรเจกต์
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-base shadow-sm border border-slate-200 overflow-hidden">
        <SpreadsheetManager
          projectId={project.id}
          initialClips={initialClips}
          users={editorUsers || []}
        />
      </div>
    </div>
  );
}
