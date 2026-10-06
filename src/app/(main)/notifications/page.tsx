import { redirect } from "next/navigation";
import { apiServer, getSession } from "@/lib/api-server";
import { Notification, PaginatedData } from "@/types/api";
import { NotificationsClient } from "./notifications-client";

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <NotificationsClient role={session.user.role} />;
}
