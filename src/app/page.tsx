import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }: { searchParams: Promise<{ path?: string; page?: string }> }) {
  const session = await getServerSession(authOptions);
  
  // Resolve search params for Next.js 15
  const resolvedParams = await searchParams;
  let path = resolvedParams?.path;
  const page = resolvedParams?.page;

  if (page) {
    path = page.startsWith("/") ? page : `/${page}`;
  }

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
