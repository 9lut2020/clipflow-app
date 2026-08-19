import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { User } from "@/types/api";
import { UsersClient } from "./users-client";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Strict Admin Role Check — non-admin users get redirected directly to /dashboard
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let allUsers: User[] = [];
  try {
    const res = await apiServer.get<User[]>("/users");
    allUsers = res.data || [];
  } catch (error) {
    // If backend returns Unauthorized or any error, redirect directly to /dashboard
    redirect("/dashboard");
  }

  return <UsersClient initialUsers={allUsers} currentUserId={session.user.id} />;
}
