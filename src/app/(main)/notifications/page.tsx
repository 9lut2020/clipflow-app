import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { apiServer } from "@/lib/api-server";
import { Notification, PaginatedData } from "@/types/api";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <NotificationsClient role={session.user.role} />;
}
