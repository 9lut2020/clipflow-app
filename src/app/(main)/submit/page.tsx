"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  UploadCloud,
  Link as LinkIcon,
  Loader2,
  ArrowLeft,
  ClipboardList,
  AlertCircle,
  Folder,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateVideoUrl } from "@/utils/url-validator";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Clip } from "@/types/api";
import { useProjects, useEpisodes } from "@/features/projects/hooks/use-projects";

const fetcher = async (url: string) => {
  const res = await apiClient.get<any>(url);
  if (res.status !== "success") throw new Error(res.message);
  return res.data;
};

function AssignedSubmitForm({
  availableClips,
  isLoading,
}: {
  currentUser: any;
  availableClips: Clip[];
  isLoading: boolean;
}) {
  const router = useRouter();

  const [selectedClip, setSelectedClip] = useState<string>("");
  const [driveUrl, setDriveUrl] = useState<string>("");
  const [submitNote, setSubmitNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = selectedClip && driveUrl.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const validation = validateVideoUrl(driveUrl);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/clips/${selectedClip}/revisions`, {
        driveUrl,
        submitNote,
      });
      toast.success("ส่งงานเรียบร้อยแล้ว! 🚀");
      router.push("/tasks");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "ไม่สามารถส่งงานได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Step 1: Info */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <ClipboardList size={14} className="text-blue-500" />
          เลือกงานที่ได้รับมอบหมาย
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              คลิปวิดีโอ *
            </label>
            <Combobox
              options={availableClips.map((c) => ({
                value: c.id,
                label: `[${c.project?.name || "ไม่ระบุซีรีส์"} EP.${c.episode?.episodeNo || "?"}] ${c.name}`,
              }))}
              value={selectedClip}
              onChange={setSelectedClip}
              placeholder={
                isLoading ? "กำลังโหลด..." : "เลือกงานที่ต้องการส่ง..."
              }
              searchPlaceholder="ค้นหางาน..."
              disabled={isLoading || availableClips.length === 0}
            />
          </div>

          {selectedClip &&
            availableClips.find((c) => c.id === selectedClip)?.status ===
              "NEEDS_REVISION" &&
            availableClips.find((c) => c.id === selectedClip)?.currentRevision
              ?.reviews?.[0]?.comment && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertCircle size={14} className="text-red-600" />
                  <span className="text-[11px] font-bold text-red-700">
                    คำแนะนำให้แก้ไขจากผู้ตรวจ:
                  </span>
                  <span className="text-[10px] text-red-500 ml-auto bg-red-100 px-2 py-0.5 rounded-full font-medium">
                    {availableClips.find((c) => c.id === selectedClip)
                      ?.currentRevision?.reviews?.[0]?.reviewer?.displayName ||
                      "ผู้ตรวจ"}
                  </span>
                </div>
                <p className="text-xs text-red-600 leading-relaxed font-medium">
                  {
                    availableClips.find((c) => c.id === selectedClip)
                      ?.currentRevision?.reviews?.[0]?.comment
                  }
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Step 2: Drive URL */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <LinkIcon size={14} className="text-blue-500" />
          ลิงก์วิดีโอ
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Google Drive URL *
          </label>
          <input
            type="text"
            required
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            ตั้งค่าการแชร์เป็น "ทุกคนที่มีลิงก์สามารถดูได้"
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            หมายเหตุ (ถ้ามี)
          </label>
          <textarea
            rows={2}
            value={submitNote}
            onChange={(e) => setSubmitNote(e.target.value)}
            placeholder="เช่น ปรับแก้เสียงดนตรีเรียบร้อยแล้ว"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isValid || !driveUrl.trim()}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            กำลังส่งงาน...
          </>
        ) : (
          <>
            <UploadCloud size={18} />
            ส่งงาน
          </>
        )}
      </button>
    </form>
  );
}

function FastSubmitForm({ currentUser }: { currentUser: any }) {
  const router = useRouter();

  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("");
  const [selectedClip, setSelectedClip] = useState<string>("");
  const [driveUrl, setDriveUrl] = useState<string>("");
  const [submitNote, setSubmitNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const { data: episodes, isLoading: isEpisodesLoading } =
    useEpisodes(selectedProject);

  const { data: episodeClipsRes, isLoading: isClipsLoading } = useSWR<any>(
    selectedEpisode ? `/episodes/${selectedEpisode}/clips` : null,
    fetcher,
  );
  const clips = episodeClipsRes?.clips || [];

  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    setSelectedEpisode("");
    setSelectedClip("");
  };

  const handleEpisodeChange = (val: string) => {
    setSelectedEpisode(val);
    setSelectedClip("");
  };

  const isValid = selectedClip && driveUrl.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.id) {
      toast.error("กรุณาเข้าสู่ระบบก่อนส่งงาน");
      return;
    }
    if (!isValid) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const validation = validateVideoUrl(driveUrl);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/clips/${selectedClip}/revisions`, {
        driveUrl,
        submitNote,
      });
      toast.success("ส่งงานเรียบร้อยแล้ว! 🚀");
      router.push("/tasks");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "ไม่สามารถส่งงานได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Step 1: Info */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Folder size={14} className="text-blue-500" />
          รายละเอียดงานด่วน
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ซีรีส์ (Project) *
            </label>
            <Combobox
              options={
                projects?.map((p) => ({ value: p.id, label: p.name })) || []
              }
              value={selectedProject}
              onChange={handleProjectChange}
              placeholder={isProjectsLoading ? "กำลังโหลด..." : "เลือกซีรีส์"}
              searchPlaceholder="ค้นหา..."
              disabled={isProjectsLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ตอน (Episode) *
            </label>
            <Combobox
              options={
                episodes?.map((ep) => ({
                  value: ep.id,
                  label: `EP.${ep.episodeNo}${ep.name ? `: ${ep.name}` : ""}`,
                })) || []
              }
              value={selectedEpisode}
              onChange={handleEpisodeChange}
              placeholder={
                !selectedProject
                  ? "เลือกซีรีส์ก่อน"
                  : isEpisodesLoading
                    ? "กำลังโหลด..."
                    : "เลือกตอน"
              }
              searchPlaceholder="ค้นหาตอน..."
              disabled={!selectedProject || isEpisodesLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ชื่องานด่วน / ชื่อคลิป *
            </label>
            <Combobox
              options={
                clips?.map((c: any) => ({
                  value: c.id,
                  label: c.name,
                })) || []
              }
              value={selectedClip}
              onChange={setSelectedClip}
              placeholder={
                !selectedEpisode
                  ? "เลือกตอนก่อน"
                  : isClipsLoading
                    ? "กำลังโหลด..."
                    : "เลือกคลิป"
              }
              searchPlaceholder="ค้นหาคลิป..."
              disabled={
                !selectedEpisode || isClipsLoading || clips.length === 0
              }
            />
            {clips.length === 0 && selectedEpisode && !isClipsLoading && (
              <p className="text-xs text-red-500 mt-1">
                ไม่พบคลิปในตอนนี้ โปรดติดต่อแอดมินให้สร้างคลิปก่อน
              </p>
            )}

            {selectedClip &&
              clips.find((c: any) => c.id === selectedClip)?.status ===
                "NEEDS_REVISION" &&
              clips.find((c: any) => c.id === selectedClip)?.currentRevision
                ?.reviews?.[0]?.comment && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertCircle size={14} className="text-red-600" />
                    <span className="text-[11px] font-bold text-red-700">
                      คำแนะนำให้แก้ไขจากผู้ตรวจ:
                    </span>
                    <span className="text-[10px] text-red-500 ml-auto bg-red-100 px-2 py-0.5 rounded-full font-medium">
                      {clips.find((c: any) => c.id === selectedClip)
                        ?.currentRevision?.reviews?.[0]?.reviewer
                        ?.displayName || "ผู้ตรวจ"}
                    </span>
                  </div>
                  <p className="text-xs text-red-600 leading-relaxed font-medium">
                    {
                      clips.find((c: any) => c.id === selectedClip)
                        ?.currentRevision?.reviews?.[0]?.comment
                    }
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Step 2: Drive URL */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <LinkIcon size={14} className="text-blue-500" />
          ลิงก์วิดีโอ
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Google Drive URL *
          </label>
          <input
            type="text"
            required
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            ตั้งค่าการแชร์เป็น "ทุกคนที่มีลิงก์สามารถดูได้"
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            หมายเหตุ (ถ้ามี)
          </label>
          <textarea
            rows={2}
            value={submitNote}
            onChange={(e) => setSubmitNote(e.target.value)}
            placeholder="เช่น ปรับแก้เสียงดนตรีเรียบร้อยแล้ว"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isValid || !driveUrl.trim()}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            กำลังส่งงาน...
          </>
        ) : (
          <>
            <UploadCloud size={18} />
            ส่งงานด่วน 🚀
          </>
        )}
      </button>
    </form>
  );
}

export default function SubmitPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const currentUser = session?.user || { id: "", name: "Guest" };

  const { data: clips, isLoading } = useSWR<Clip[]>(
    currentUser?.id ? `/clips?ownerId=${currentUser.id}` : null,
    fetcher,
  );

  const availableClips = (clips || []).filter(
    (c) => c.status === "DRAFT" || c.status === "NEEDS_REVISION",
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="mx-auto max-w-full pb-24 space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  // Full Page Empty State
  if (availableClips.length === 0) {
    return (
      <div className="mx-auto max-w-full pb-24 fade-in duration-300">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 bg-white px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                ส่งงานใหม่ ✨
              </h1>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-16 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300 min-h-[400px]">
            <img
              src="/Image/Clipflow-none.png"
              alt="No tasks"
              className="w-56 h-56 object-contain opacity-90"
            />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                คุณไม่มีงานที่ต้องส่งในขณะนี้
              </h3>
              <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                เยี่ยมมาก! คุณเคลียร์งานที่ได้รับมอบหมายเรียบร้อยแล้ว
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full pb-24 fade-in duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              ส่งงานใหม่ ✨
            </h1>
          </div>
        </div>

        {/* Form Content - No tabs since users can only submit assigned work */}
        <div className="mt-4">
          <AssignedSubmitForm
            currentUser={currentUser}
            availableClips={availableClips}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
