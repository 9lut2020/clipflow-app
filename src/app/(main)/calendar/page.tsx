import { redirect } from "next/navigation";

export default async function CalendarPage() {
  redirect("/admin/publish#calendar");
}
