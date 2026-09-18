import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { redirect } from "next/navigation";
import { Clip, Project, User, PaginatedData } from "@/types/api";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Fetch clips, projects, users
  const [clipsRes, projectsRes, usersRes, metricsRes] = await Promise.all([
    apiServer.get<PaginatedData<Clip>>("/clips?page=1&limit=100"),
    apiServer.get<PaginatedData<Project>>("/projects?page=1&limit=100"),
    apiServer.get<PaginatedData<User>>("/users?page=1&limit=100").catch(() => ({ data: null })),
    apiServer.get<PaginatedData<any>>("/analytics/metrics?page=1&limit=100").catch(() => ({ data: null })),
  ]);

  const clips = clipsRes.data?.items || [];
  const projects = projectsRes.data?.items || [];
  const users = usersRes.data?.items || [];
  const dailyMetrics = metricsRes.data?.items || [];

  return <AnalyticsClient clips={clips} projects={projects} users={users} dailyMetrics={dailyMetrics} />;
}
