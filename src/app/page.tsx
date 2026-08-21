import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  const session = await getServerSession(authOptions);
  
  // Resolve search params for Next.js 15
  const resolvedParams = await searchParams;
  const path = resolvedParams?.path;

  if (session) {
    redirect(path || "/menu");
  } else {
    if (path) {
      redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(path)}`);
    } else {
      redirect("/api/auth/signin");
    }
  }
}
