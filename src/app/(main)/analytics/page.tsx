import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { redirect } from "next/navigation";
import { Clip, Project, User } from "@/types/api";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Fetch clips, projects, users
  const [clipsRes, projectsRes, usersRes] = await Promise.all([
    apiServer.get<Clip[]>("/clips"),
    apiServer.get<Project[]>("/projects"),
    apiServer.get<User[]>("/users").catch(() => ({ data: [] })),
  ]);

  const clips = clipsRes.data || [];
  const projects = projectsRes.data || [];
  const users = usersRes.data || [];

  return <AnalyticsClient clips={clips} projects={projects} users={users} />;
}
