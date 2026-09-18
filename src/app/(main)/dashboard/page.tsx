import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { Clip, Project, User, PaginatedData } from "@/types/api";
import { MainDashboard } from "@/components/dashboard/main-dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const currentUser = session.user;
  const role = currentUser.role || "USER";
  const isUser = role === "USER";

  // Fetch clips, projects & users from API
  // projects/users rarely change → revalidate every 60s instead of no-store
  const [clipsRes, projectsRes, usersRes] = await Promise.all([
    apiServer.get<PaginatedData<Clip>>("/clips?page=1&limit=20").catch(() => ({ data: null })),
    apiServer.get<PaginatedData<Project>>("/projects?page=1&limit=100", undefined, { revalidate: 60 }).catch(() => ({ data: null })),
    !isUser
      ? apiServer.get<PaginatedData<User>>("/users?page=1&limit=100", undefined, { revalidate: 60 }).catch(() => ({ data: null }))
      : Promise.resolve({ data: null }),
  ]);

  const allClips = clipsRes.data?.items || [];
  const allProjects = projectsRes.data?.items || [];
  const allUsers = usersRes.data?.items || [];

  // Filter clips based on role
  const displayedClips = allClips;

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
