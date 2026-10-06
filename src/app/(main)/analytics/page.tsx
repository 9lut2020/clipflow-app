import { redirect } from "next/navigation";
import { getSession } from "@/lib/api-server";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=%2Fanalytics");

  // Every role can open analytics; the API scopes the numbers to the viewer.
  return <AnalyticsClient role={session.user.role || "USER"} />;
}
