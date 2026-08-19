import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClipStepper from "@/components/clips/clip-stepper";
import ClipViewClient from "./clip-view-client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { notFound } from "next/navigation";

export default async function ClipDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  // Get current user from actual session
  const currentUser = session?.user;
  const isUser = currentUser?.role === "USER";

  let clip: any = null;
  let allRevisions: any[] = [];

  try {
    const clipsRes = await apiServer.get<any>(`/clips/${params.id}`);
    clip = clipsRes.data;

    const revsRes = await apiServer
      .get<any>(`/clips/${params.id}/revisions`)
      .catch(() => ({ data: [] }));
    allRevisions = Array.isArray(revsRes.data) ? revsRes.data : [];
  } catch (err) {
    clip = null;
  }

  // If clip is not found or error occurred, trigger 404 page cleanly
  if (!clip) {
    notFound();
  }

  const latestRevision = allRevisions.length > 0 ? allRevisions[0] : null;
  const project = clip.project;
  const episode = clip.episode;
  const owner = clip.owner;

  return (
    <div className="max-w-full mx-auto pb-24 lg:pb-12 px-1 sm:px-0">
      {/* Top Full-Width Header Title Bar - Compact Sleek Typography */}
      <div className="w-full mb-4 sm:mb-5">
        <div className="flex items-center gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <Link href={project?.id ? `/projects/${project.id}` : "/dashboard"}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
              {clip.name}
            </h1>
            <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
              {project?.name} • EP.{episode?.episodeNo || 1}: {episode?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Status Bar */}
      <div className="mb-5 sm:mb-6">
        <ClipStepper status={clip.status} />
      </div>

      {/* Interactive Client View (Video, Details, Actions & Timecoded Timeline) */}
      <ClipViewClient
        clip={clip}
        allRevisions={allRevisions}
        currentUser={currentUser}
        isUser={!!isUser}
      />
    </div>
  );
}
