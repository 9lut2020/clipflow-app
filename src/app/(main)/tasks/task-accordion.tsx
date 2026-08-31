"use client";

import { useState, useRef } from "react";
import {
  ChevronDown,
  AlertTriangle,
  Clock,
  PlayCircle,
  CheckCircle2,
  Film,
  UploadCloud,
  Loader2,
  X,
  MessageSquare,
  Send,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { Clip } from "@/types/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import PlatformBadge from "@/components/ui/platform-badge";
import { extractThumbnailUrl } from "@/utils/thumbnail-helper";
import { useSubmitRevision } from "@/features/reviews/hooks/use-reviews";
import { validateVideoUrl } from "@/utils/url-validator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ─── Inline Submit Modal ──────────────────────────────────────────────────────

interface InlineSubmitModalProps {
  clip: Clip;
  userId: string;
  onClose: () => void;
  mode: "submit" | "resubmit";
}

function InlineSubmitModal({ clip, userId, onClose, mode }: InlineSubmitModalProps) {
  const [driveUrl, setDriveUrl] = useState(clip.driveUrl || "");
  const [note, setNote] = useState("");
  const router = useRouter();
  const { submitRevision, isSubmitting } = useSubmitRevision();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateVideoUrl(driveUrl);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    try {
      await submitRevision(clip.id, {
        driveUrl,
        submitNote: note,
        submittedBy: userId,
      });
      toast.success(mode === "resubmit" ? "ส่งงานแก้ไขสำเร็จ! 🎉" : "ส่งคลิปตรวจงานสำเร็จ! 🚀");
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "ไม่สามารถส่งงานได้");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b border-slate-100 ${mode === "resubmit" ? "bg-rose-50/60" : "bg-blue-50/60"}`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl ${mode === "resubmit" ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"}`}>
                {mode === "resubmit" ? <RefreshCcw size={18} /> : <UploadCloud size={18} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {mode === "resubmit" ? "ส่งงานแก้ไข" : "ส่งคลิปตรวจงาน"}
                </h3>
                <p className="text-[11px] text-slate-500 truncate max-w-[220px]">{clip.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                ลิงก์ Google Drive วิดีโอ *
              </label>
              <input
                type="text"
                autoFocus
                required
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">ตั้งค่าการแชร์เป็น "ทุกคนที่มีลิงก์สามารถดูได้"</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={12} /> หมายเหตุ (ถ้ามี)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={mode === "resubmit" ? "อธิบายสิ่งที่แก้ไขเพิ่มเติม..." : "หมายเหตุเพิ่มเติม..."}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !driveUrl.trim()}
              className={`w-full py-3 font-bold rounded-xl text-white text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                mode === "resubmit"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Send size={16} />
                  {mode === "resubmit" ? "ส่งงานแก้ไข 🚀" : "ส่งคลิปตรวจงาน 🚀"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Task Accordion ───────────────────────────────────────────────────────────

interface TaskAccordionSectionProps {
  title: string;
  iconType: "alert" | "clock" | "play" | "check";
  clips: Clip[];
  colorClass: string;
  badgeBg: string;
  emptyText: string;
  defaultOpen?: boolean;
  isUser?: boolean;
  userId?: string;
}

const ICON_MAP = {
  alert: AlertTriangle,
  clock: Clock,
  play: PlayCircle,
  check: CheckCircle2,
};

export function TaskAccordionSection({
  title,
  iconType,
  clips,
  colorClass,
  badgeBg,
  emptyText,
  defaultOpen = true,
  isUser = false,
  userId = "",
}: TaskAccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeModal, setActiveModal] = useState<{ clip: Clip; mode: "submit" | "resubmit" } | null>(null);
  const Icon = ICON_MAP[iconType] || PlayCircle;

  if (!clips || clips.length === 0) {
    if (!isUser) return null;
    return (
      <div className="mb-4 border border-slate-200/60 rounded-2xl overflow-hidden bg-slate-50/50">
        <div className="flex items-center gap-2 p-4 font-bold text-slate-700">
          <Icon className={`w-5 h-5 ${colorClass}`} />
          <span className="text-base">{title}</span>
          <span className="bg-slate-200/80 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
            0
          </span>
        </div>
        <div className="p-6 pt-0 text-center">
          <p className="text-slate-400 text-sm font-medium">{emptyText}</p>
        </div>
      </div>
    );
  }

  // User Avatar Helper
  const UserAvatar = ({
    name,
    pictureUrl,
  }: {
    name: string;
    pictureUrl?: string | null;
  }) => {
    if (pictureUrl) {
      return (
        <img
          src={pictureUrl}
          alt={name}
          className="w-4 h-4 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
        />
      );
    }
    return (
      <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 shadow-xs text-[8px]">
        {name[0] || "?"}
      </div>
    );
  };

  const canSubmit = (status: string) => ["DRAFT", "NEEDS_REVISION"].includes(status);
  const isResubmit = (status: string) => status === "NEEDS_REVISION";

  return (
    <>
      {/* Inline Submit Modal (Portal-like, rendered at the bottom of body) */}
      {activeModal && (
        <InlineSubmitModal
          clip={activeModal.clip}
          userId={userId}
          onClose={() => setActiveModal(null)}
          mode={activeModal.mode}
        />
      )}

      <div className="mb-4 border border-slate-200/80 bg-white rounded-2xl shadow-xs overflow-hidden transition-all">
        {/* Drawer Accordion Header Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer select-none text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white shadow-xs border border-slate-200/60">
              <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
            <span className="text-base font-bold text-slate-800 tracking-tight">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeBg}`}
            >
              {clips.length} รายการ
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </div>
        </button>

        {/* Accordion Content Body (Drawer) */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-[3000px] opacity-100 p-3 pt-2 border-t border-slate-100 bg-slate-50/50"
              : "max-h-0 opacity-0 overflow-hidden p-0"
          }`}
        >
          <div className="flex flex-col gap-2">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200 group"
              >
                {/* Auto-Thumbnail / Icon (Left) */}
                <Link href={`/clips/${clip.id}`} className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/50 relative">
                  {(() => {
                    const thumb = extractThumbnailUrl(clip.driveUrl);
                    return thumb.url ? (
                      <img
                        src={thumb.url}
                        alt={clip.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <Film size={20} className="text-slate-300" />
                    );
                  })()}
                </Link>

                {/* Content (Middle) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      {clip.project?.name || "Project"} • EP.
                      {clip.episode?.episodeNo || "?"}
                    </span>
                  </div>
                  <Link href={`/clips/${clip.id}`}>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800 hover:text-blue-600 transition-colors truncate">
                      {clip.name}
                    </h3>
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-500 font-medium flex-wrap">
                    <span className="shrink-0">
                      {new Date(clip.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {clip.owner && (
                      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 sm:pl-3 shrink-0">
                        <UserAvatar
                          name={clip.owner.displayName}
                          pictureUrl={clip.owner.pictureUrl}
                        />
                        <span className="truncate max-w-[80px] sm:max-w-[120px]">
                          {clip.owner.displayName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Show latest reviewer comment for NEEDS_REVISION clips */}
                  {clip.status === "NEEDS_REVISION" && (() => {
                    const latestReview = (clip as any).currentRevision?.reviews?.[0];
                    if (!latestReview?.comment) return null;
                    return (
                      <div className="mt-1.5 flex items-start gap-1.5 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1.5 animate-in fade-in duration-300">
                        <span className="text-rose-400 shrink-0 mt-0.5">💬</span>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-[11px] text-rose-700 font-medium line-clamp-2 leading-relaxed">
                            {latestReview.comment}
                          </p>
                          {latestReview.reviewer?.displayName && (
                            <span className="text-[9px] text-rose-400 font-medium">
                              โดย {latestReview.reviewer.displayName}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Right: Action Button */}
                <div className="shrink-0 flex items-center gap-1.5">
                  {/* View detail link */}
                  <Link
                    href={`/clips/${clip.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="ดูรายละเอียด"
                  >
                    <ExternalLink size={15} />
                  </Link>

                  {/* Submit / Resubmit button (only for USER and eligible statuses) */}
                  {isUser && canSubmit(clip.status) && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveModal({
                          clip,
                          mode: isResubmit(clip.status) ? "resubmit" : "submit",
                        })
                      }
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        isResubmit(clip.status)
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isResubmit(clip.status) ? (
                        <>
                          <RefreshCcw size={13} />
                          <span className="hidden sm:inline">ส่งกลับ</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={13} />
                          <span className="hidden sm:inline">ส่งงาน</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
