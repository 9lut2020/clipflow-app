import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { Clip, Project, User } from "@/types/api";
import { MainDashboard } from "@/components/dashboard/main-dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const currentUser = session.user;
  const role = currentUser.role || "USER";
  const isUser = role === "USER";

  // Fetch clips, projects & users from API
  const [clipsRes, projectsRes, usersRes] = await Promise.all([
    apiServer.get<Clip[]>("/clips?limit=20"),
    apiServer.get<Project[]>("/projects").catch(() => ({ data: [] })),
    apiServer.get<User[]>("/users").catch(() => ({ data: [] })),
  ]);

  const allClips = clipsRes.data || [];
  const allProjects = projectsRes.data || [];
  const allUsers = usersRes.data || [];

  // Filter clips based on role
  const displayedClips = isUser
    ? allClips.filter(
        (c) => c.ownerId === currentUser.id || c.owner?.id === currentUser.id
      )
    : allClips;

  return (
    <MainDashboard
      clips={displayedClips}
      projects={allProjects}
      users={allUsers}
      isUser={isUser}
      role={role}
      currentUser={currentUser}
    />
  );
}
