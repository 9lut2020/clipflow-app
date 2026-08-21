import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiServer } from "@/lib/api-server";
import { Clip } from "@/types/api";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Prevent regular users (USER) from accessing notifications page
  if (session.user.role === "USER") {
    redirect("/");
  }

  const { data } = await apiServer.get<Clip[]>("/clips");
  const clips = data || [];

  return <NotificationsClient clips={clips} />;
}
