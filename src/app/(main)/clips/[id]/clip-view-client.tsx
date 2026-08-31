"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import VideoEmbed from "@/components/clips/video-embed";
import ReviewActionCard from "@/components/clips/review-action-card";
import RevisionTimeline from "@/components/clips/revision-timeline";
import PlatformBadge from "@/components/ui/platform-badge";
import { toast } from "sonner";
import { History, ArrowLeft } from "lucide-react";
import { cn } from "@/utils/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ClipStepper from "@/components/clips/clip-stepper";

interface ClipViewClientProps {
  clip: any;
  allRevisions: any[];
  currentUser: any;
  isUser: boolean;
}

export default function ClipViewClient({
  clip,
  allRevisions,
  currentUser,
  isUser,
}: ClipViewClientProps) {
  const latestRevision = allRevisions.length > 0 ? allRevisions[0] : null;
  const [activeTab, setActiveTab] = useState<"review" | "history">("review");
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<
    string | null
  >(null);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState<number | null>(
    null,
  );
  const [optimisticStatus, setOptimisticStatus] = useState(clip.status);

  const videoUrl = clip.driveUrl || latestRevision?.driveUrl || "";
  const actionClip = { ...clip, status: optimisticStatus };
  const project = clip.project;
  const episode = clip.episode;

  const handleTimeUpdate = (seconds: number, formatted: string) => {
    setCurrentTimeSeconds(seconds);
    setCurrentTimeFormatted(formatted);
  };

  const handleSeek = (seconds: number) => {
    if (
      videoUrl.includes("drive.google.com") ||
      videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
    ) {
      toast.error(
        "วิดีโอจาก Google Drive ไม่รองรับการกระโดดข้ามเวลาอัตโนมัติ (กรุณาเลื่อนวิดีโอด้วยตนเอง)",
      );
      return;
    }
    setSeekTime(seconds);
  };

  return (
    <div className="flex flex-col w-full pb-16">
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
        <ClipStepper status={optimisticStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8 items-start">
        {/* Left Column (2/3 width): Video -> Info -> Action Card */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Video Embed Player */}
          {videoUrl ? (
            <VideoEmbed
              key={videoUrl}
              url={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              seekTime={seekTime}
            />
          ) : (
            <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
              ไม่มีวิดีโอตัวอย่างในระบบ
            </div>
          )}

          {/* Clip Details Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs sm:text-base font-bold text-slate-900">
                รายละเอียดข้อมูลคลิป
              </h2>

              <div className="flex items-center gap-2">
                <PlatformBadge platform={clip.platform} />
                {optimisticStatus === "APPROVED" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ ผ่านอนุมัติ
                  </span>
                )}
                {optimisticStatus === "NEEDS_REVISION" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    ✕ ต้องแก้ไข
                  </span>
                )}
                {optimisticStatus === "PENDING_REVIEW" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    ⏳ รอตรวจ
                  </span>
                )}
                {optimisticStatus === "IN_REVIEW" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    🔵 กำลังตรวจ
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  โปรเจกต์
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {clip.project?.name}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  ตอน (Episode)
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  EP.{clip.episode?.episodeNo || 1}: {clip.episode?.name}
                </p>
              </div>

              {clip.description && (
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    รายละเอียดเพิ่มเติม
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {clip.description}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 sm:col-span-2 flex justify-between items-center">
                <span className="text-slate-500 text-xs font-medium">
                  ผู้รับผิดชอบงานตัดต่อ
                </span>
                <div className="flex items-center gap-2">
                  {clip.owner?.pictureUrl ? (
                    <img
                      src={clip.owner.pictureUrl}
                      alt=""
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-600 border border-slate-300">
                      {clip.owner?.displayName?.[0] || "?"}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800">
                    {clip.owner?.displayName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-Only Tabbed proofing Workspace (lg:hidden) */}
          <div className="lg:hidden space-y-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("review")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                  activeTab === "review"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                ✍️ ตรวจงาน
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                💬 ประวัติการส่ง ({allRevisions.length})
              </button>
            </div>

            <div className="animate-in fade-in duration-200">
              {activeTab === "review" && (
                <ReviewActionCard
                  key={`mobile-action-${clip.id}-${optimisticStatus}`}
                  clip={actionClip}
                  isUser={isUser}
                  reviewerId={currentUser?.id || ""}
                  currentTimeFormatted={currentTimeFormatted}
                  onOptimisticUpdate={setOptimisticStatus}
                />
              )}
              {activeTab === "history" && (
                <RevisionTimeline
                  revisions={allRevisions}
                  className="shadow-xs"
                  onSeekTime={handleSeek}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width): Review Action Card -> Revision Timeline (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-1 flex-col gap-4 sm:gap-6">
          {/* Review Action Card */}
          <ReviewActionCard
            key={`desktop-action-${clip.id}-${optimisticStatus}`}
            clip={actionClip}
            isUser={isUser}
            reviewerId={currentUser?.id || ""}
            currentTimeFormatted={currentTimeFormatted}
            onOptimisticUpdate={setOptimisticStatus}
          />
          <RevisionTimeline
            revisions={allRevisions}
            className="sticky top-24"
            onSeekTime={handleSeek}
          />
        </div>
      </div>
    </div>
  );
}
