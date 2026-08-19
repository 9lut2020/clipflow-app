"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import {
  useProjects,
  useEpisodes,
  useClips,
  useSubmitRevision,
} from "@/hooks/use-api";
import {
  UploadCloud,
  Folder,
  Link as LinkIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateVideoUrl } from "@/lib/url-validator";
import { Button } from "@/components/ui/button";

function SubmitForm() {
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
  const [selectedClip, setSelectedClip] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const { data: episodes, isLoading: isEpisodesLoading } =
    useEpisodes(selectedProject);
  const { data: clips, isLoading: isClipsLoading } = useClips(selectedEpisode);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProject(e.target.value);
    setSelectedEpisode("");
    setSelectedClip("");
  };

  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEpisode(e.target.value);
    setSelectedClip("");
  };

  const handleClipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClip(e.target.value);
  };

  const { submitRevision } = useSubmitRevision();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClip || !currentUser.id) return;

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
      await submitRevision(selectedClip, {
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
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
              <Folder size={18} className="text-blue-600 shrink-0" />
              1. เลือกซีรีส์และตอนที่ต้องการส่งงาน
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  เลือกซีรีส์ (Project) *
                </label>
                <select
                  value={selectedProject}
                  onChange={handleProjectChange}
                  required
                  disabled={isProjectsLoading}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                >
                  <option value="">-- เลือกซีรีส์ --</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  เลือกตอน (Episode) *
                </label>
                <select
                  value={selectedEpisode}
                  onChange={handleEpisodeChange}
                  required
                  disabled={!selectedProject || isEpisodesLoading}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium disabled:opacity-50"
                >
                  <option value="">-- เลือกตอน --</option>
                  {episodes?.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      EP.{ep.episodeNo}: {ep.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                เลือกคลิปที่ต้องการส่งงาน *
              </label>
              <select
                value={selectedClip}
                onChange={handleClipChange}
                required
                disabled={!selectedEpisode || isClipsLoading}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium disabled:opacity-50"
              >
                <option value="">-- เลือกคลิปวิดีโอ --</option>
                {clips?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            disabled={isSubmitting || !selectedClip}
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
        </form>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-bold">กำลังโหลด...</div>}>
      <SubmitForm />
    </Suspense>
  );
}
