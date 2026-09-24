import { redirect } from "next/navigation";

// Keep the admin navigation URL stable while the canonical user-management
// screen remains at /users.
export default function AdminUsersPage() {
  redirect("/users");
}
