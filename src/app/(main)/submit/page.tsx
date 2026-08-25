"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useProjects, useEpisodes } from "@/features/projects/hooks/use-projects";
import { useClips } from "@/features/clips/hooks/use-clips";
import { useSubmitRevision } from "@/features/reviews/hooks/use-reviews";
import {
  UploadCloud,
  Folder,
  Link as LinkIcon,
  Loader2,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateVideoUrl } from "@/utils/url-validator";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { Clip, ApiResponse } from "@/types/api";

function SubmitForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = session?.user || {
    id: "",
    name: "Guest",
    role: "USER",
    image: null,
  };

  const [mode, setMode] = useState<"assigned" | "manual">("assigned");
  const [selectedMyClip, setSelectedMyClip] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("");
  const [selectedClip, setSelectedClip] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all user clips that are not approved or published yet (My Assigned Tasks)
  const { data: myClipsData, isLoading: isMyClipsLoading } = useSWR<ApiResponse<Clip[]>>(
    currentUser.id ? `/clips?ownerId=${currentUser.id}&excludeApproved=true` : null,
    async (url: string) => {
      const res = await apiClient.get<Clip[]>(url);
      return res;
    }
  );
  const myClips = myClipsData?.data || [];

  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const { data: episodes, isLoading: isEpisodesLoading } =
    useEpisodes(selectedProject);
  const { data: clips, isLoading: isClipsLoading } = useClips(selectedEpisode);

  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    setSelectedEpisode("");
    setSelectedClip("");
  };

  const handleEpisodeChange = (val: string) => {
    setSelectedEpisode(val);
    setSelectedClip("");
  };

  const handleClipChange = (val: string) => {
    setSelectedClip(val);
  };

  const { submitRevision } = useSubmitRevision();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClipId = mode === "assigned" ? selectedMyClip : selectedClip;

    if (!targetClipId || !currentUser.id) {
      toast.error("โปรดเลือกคลิปที่ต้องการส่งงาน");
      return;
    }

    const driveUrlInput = document.getElementById("driveUrl") as HTMLInputElement;
    const driveUrl = driveUrlInput?.value || "";
    const submitNote = (document.getElementById("note") as HTMLTextAreaElement)?.value || "";

    // Validate video link
    const validation = validateVideoUrl(driveUrl);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitRevision(targetClipId, {
        driveUrl,
        submitNote,
        submittedBy: currentUser.id,
      });
      toast.success("ส่งคลิปสำเร็จเรียบร้อยแล้ว!");
      router.push("/tasks");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "ไม่สามารถส่งคลิปได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClipId = mode === "assigned" ? selectedMyClip : selectedClip;

  return (
    <div className="mx-auto max-w-full pb-24 fade-in duration-300">
      <div className="space-y-4 sm:space-y-6">
        {/* Top Full-Width Header Title Bar - Compact Sleek Typography */}
        <div className="w-full">
          <div className="flex items-center gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                ส่งคลิปใหม่ 🎬
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                กรอกข้อมูลและระบุลิงก์ Google Drive เพื่อให้ผู้ตรวจเริ่มตรวจทาน
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Step 1: Select Project & Episode */}
          <div className="space-y-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <Folder size={18} className="text-blue-600 shrink-0" />
                1. เลือกงานที่ต้องการส่ง
              </h3>
              
              <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setMode("assigned");
                    setSelectedClip("");
                    setSelectedProject("");
                    setSelectedEpisode("");
                  }}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    mode === "assigned"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  💼 งานของฉัน ({myClips.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("manual");
                    setSelectedMyClip("");
                  }}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    mode === "manual"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  🔍 ค้นหาซีรีส์/ตอนเอง
                </button>
              </div>
            </div>

            {mode === "assigned" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    เลือกงานที่ได้รับมอบหมาย *
                  </label>
                  <Combobox
                    options={
                      myClips.map((c) => ({
                        value: c.id,
                        label: `[${c.project?.name || "ไม่ระบุโครงการ"}] EP.${c.episode?.episodeNo ?? "-"}: ${c.name}`,
                      })) || []
                    }
                    value={selectedMyClip}
                    onChange={(val) => setSelectedMyClip(val)}
                    placeholder={
                      isMyClipsLoading
                        ? "กำลังโหลดงานของคุณ..."
                        : myClips.length === 0
                        ? "ไม่มีงานค้างส่งในขณะนี้"
                        : "-- เลือกคลิปงานของคุณที่ค้างอยู่ --"
                    }
                    searchPlaceholder="ค้นหางานของคุณ..."
                    disabled={isMyClipsLoading || myClips.length === 0}
                  />
                  {myClips.length === 0 && !isMyClipsLoading && (
                    <p className="text-[11px] text-amber-600 mt-2 bg-amber-50 border border-amber-100 p-2.5 rounded-xl leading-relaxed">
                      💡 คุณไม่มีงานค้างส่งที่ได้รับมอบหมายไว้ในระบบขณะนี้ หากต้องการส่งคลิปอื่นที่ไม่มีในรายการ โปรดคลิกแท็บ <b>"ค้นหาซีรีส์/ตอนเอง"</b> ด้านบนขวาเพื่อเลือกส่งได้ตามต้องการครับ
                    </p>
                  )}
                </div>

                {selectedMyClip && (() => {
                  const clip = myClips.find((c) => c.id === selectedMyClip);
                  if (!clip) return null;
                  return (
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-2 animate-in fade-in duration-300">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Briefcase size={14} className="text-slate-500 animate-pulse" />
                        รายละเอียดงานที่เลือก:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                        <div><span className="text-slate-400 font-normal">ซีรีส์ (Project):</span> {clip.project?.name}</div>
                        <div><span className="text-slate-400 font-normal">ตอน (Episode):</span> EP.{clip.episode?.episodeNo} {clip.episode?.name && `(${clip.episode.name})`}</div>
                        <div><span className="text-slate-400 font-normal">ชื่องาน (Clip):</span> {clip.name}</div>
                        <div>
                          <span className="text-slate-400 font-normal">สถานะปัจจุบัน:</span>{" "}
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-[10px] uppercase">
                            {clip.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      เลือกซีรีส์ (Project) *
                    </label>
                    <Combobox
                      options={projects?.map(p => ({ value: p.id, label: p.name })) || []}
                      value={selectedProject}
                      onChange={handleProjectChange}
                      placeholder={isProjectsLoading ? "กำลังโหลดซีรีส์..." : "-- เลือกซีรีส์ --"}
                      searchPlaceholder="ค้นหาซีรีส์..."
                      disabled={isProjectsLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      เลือกตอน (Episode) *
                    </label>
                    <Combobox
                      options={episodes?.map(ep => ({ value: ep.id, label: `EP.${ep.episodeNo}: ${ep.name || 'ไม่มีชื่อตอน'}` })) || []}
                      value={selectedEpisode}
                      onChange={handleEpisodeChange}
                      placeholder={isEpisodesLoading ? "กำลังโหลดตอน..." : "-- เลือกตอน --"}
                      searchPlaceholder="ค้นหาตอน..."
                      disabled={!selectedProject || isEpisodesLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    เลือกคลิปที่ต้องการส่งงาน *
                  </label>
                  <Combobox
                    options={clips?.map(c => ({ value: c.id, label: c.name })) || []}
                    value={selectedClip}
                    onChange={handleClipChange}
                    placeholder={isClipsLoading ? "กำลังโหลดคลิป..." : "-- เลือกคลิปวิดีโอ --"}
                    searchPlaceholder="ค้นหาคลิป..."
                    disabled={!selectedEpisode || isClipsLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {selectedClipId && (
            <div className="space-y-4 sm:space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              {/* Step 2: Google Drive URL & Notes */}
              <div className="space-y-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                  <LinkIcon size={18} className="text-blue-600 shrink-0" />
                  2. ระบุลิงก์วิดีโอและหมายเหตุ
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    ลิงก์ Google Drive วิดีโอ *
                  </label>
                  <input
                    id="driveUrl"
                    type="text"
                    required
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    โปรดตั้งค่าการแชร์ไฟล์ใน Google Drive เป็น "ทุกคนที่มีลิงก์สามารถดูได้"
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    หมายเหตุเพิ่มเติม (ถ้ามี)
                  </label>
                  <textarea
                    id="note"
                    rows={3}
                    placeholder="เช่น ปรับแก้เสียงดนตรีประกอบเรียบร้อยแล้ว"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
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
                    ส่งคลิปตรวจงาน 🚀
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function SubmitPage() {
  return (
    <Suspense 
      fallback={
        <div className="mx-auto max-w-full pb-24 space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      }
    >
      <SubmitForm />
    </Suspense>
  );
}
