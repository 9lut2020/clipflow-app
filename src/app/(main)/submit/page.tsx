"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useProjects, useEpisodes } from "@/features/projects/hooks/use-projects";
import {
  UploadCloud,
  Folder,
  Link as LinkIcon,
  Loader2,
  ArrowLeft,
  Type,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateVideoUrl } from "@/utils/url-validator";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

function FastSubmitForm() {
  const router = useRouter();

  const { data: session } = useSession();
  const currentUser = session?.user || {
    id: "",
    name: "Guest",
    role: "USER",
    image: null,
  };

  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("");
  const [clipName, setClipName] = useState<string>("");
  const [driveUrl, setDriveUrl] = useState<string>("");
  const [submitNote, setSubmitNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const { data: episodes, isLoading: isEpisodesLoading } = useEpisodes(selectedProject);

  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    setSelectedEpisode("");
  };

  const isValid = selectedProject && selectedEpisode && clipName.trim();

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
      await apiClient.post("/clips/fast-submit", {
        projectId: selectedProject,
        episodeId: selectedEpisode,
        name: clipName.trim(),
        driveUrl,
        submitNote,
      });
      toast.success("สร้างงานและส่งตรวจสำเร็จ! 🚀");
      router.push("/tasks");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "ไม่สามารถส่งงานได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg pb-24 fade-in duration-300">
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
              สร้างงานใหม่ ✨
            </h1>
            <p className="text-slate-500 text-[11px] mt-0.5">
              กรอก 3 ช่อง + แปะลิงก์ Drive แล้วส่งได้เลย
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Info */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Folder size={14} className="text-blue-500" />
              ข้อมูลงาน
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ซีรีส์ (Project) *
                </label>
                <Combobox
                  options={projects?.map((p) => ({ value: p.id, label: p.name })) || []}
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
                  onChange={(val) => setSelectedEpisode(val)}
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
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Type size={12} className="text-slate-400" />
                  ชื่องาน *
                </label>
                <input
                  type="text"
                  required
                  value={clipName}
                  onChange={(e) => setClipName(e.target.value)}
                  placeholder="เช่น ไฮไลท์ตอน 1 (TikTok)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
                />
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
                สร้างงานและส่งตรวจ 🚀
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg pb-24 space-y-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      }
    >
      <FastSubmitForm />
    </Suspense>
  );
}
