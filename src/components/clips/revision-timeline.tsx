import { useState } from "react";
import { format } from "date-fns";
import { MessageSquare, CheckCircle, History, Clock, ExternalLink, Play, Sparkles } from "lucide-react";
import { cn } from "@/utils/utils";

interface Review {
  id?: string;
  status: string;
  comment?: string;
  timecodeSeconds?: number;
  timecodeStr?: string;
  createdAt?: string;
  reviewer?: {
    displayName?: string;
    pictureUrl?: string;
  };
}

interface Revision {
  id: string;
  revisionNo: number;
  submittedAt?: string;
  createdAt?: string;
  notes?: string;
  submitNote?: string;
  driveUrl?: string;
  reviews?: Review[];
}

interface RevisionTimelineProps {
  revisions: Revision[];
  className?: string;
  onSeekTime?: (seconds: number) => void;
  onSelectRevisionUrl?: (url: string) => void;
}

export default function RevisionTimeline({
  revisions,
  className,
  onSeekTime,
  onSelectRevisionUrl,
}: RevisionTimelineProps) {
  const [selectedRevUrl, setSelectedRevUrl] = useState<string | null>(null);

  // Helper to parse timecodes inside comment strings (e.g. "[01:15] fix music volume")
  const renderCommentWithTimecodePills = (text: string) => {
    if (!text) return null;

    // Match patterns like [01:15], 01:15, or [1:15]
    const regex = /(?:\[?(\d{1,2}:\d{2})\]?)/g;
    const parts = text.split(regex);
    const matches = text.match(regex) || [];

    if (matches.length === 0) {
      return <span>{text}</span>;
    }

    return (
      <span className="leading-relaxed">
        {parts.map((part, idx) => {
          if (/^\d{1,2}:\d{2}$/.test(part)) {
            const [m, s] = part.split(":").map(Number);
            const totalSecs = m * 60 + s;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSeekTime && onSeekTime(totalSecs)}
                className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 shadow-2xs transition-all cursor-pointer"
                title={`คลิกเพื่อกระโดดไปวินาทีที่ ${part}`}
              >
                <span>⏱️ {part}</span>
              </button>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden",
        className,
      )}
    >
      <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <History size={18} className="text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            ประวัติการส่งตรวจ ({revisions.length} รอบ)
          </h2>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {revisions.length === 0 ? (
          <div className="text-xs sm:text-sm text-slate-400 text-center py-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            ยังไม่มีประวัติการส่งงานสำหรับคลิปนี้
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 sm:space-y-8 pb-2">
            {revisions.map((rev) => {
              const revReview =
                rev.reviews && rev.reviews.length > 0 ? rev.reviews[0] : null;
              const revReviewer = revReview?.reviewer;

              const dateVal = rev.createdAt || rev.submittedAt;
              const dateDisplay = dateVal
                ? format(new Date(dateVal), "dd/MM/yyyy HH:mm น.")
                : "-";

              const noteText = rev.notes || rev.submitNote;

              return (
                <div key={rev.id} className="relative pl-5 sm:pl-6">
                  {/* Timeline Dot */}
                  <div className="absolute w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full -left-[7.5px] top-1 shadow-2xs ring-4 ring-white" />

                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          ส่งงานรอบที่ {rev.revisionNo}
                        </span>
                        {rev.driveUrl && onSelectRevisionUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRevUrl(rev.driveUrl || null);
                              onSelectRevisionUrl(rev.driveUrl!);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 transition-all cursor-pointer"
                            title="สลับหน้าจอไปดูเวอร์ชันนี้"
                          >
                            <Play size={10} />
                            <span>ดูเวอร์ชันนี้</span>
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {dateDisplay}
                      </span>
                    </div>

                    {/* Submit Note */}
                    {noteText && (
                      <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                        <span className="font-bold text-slate-500 block mb-1 text-[10px] uppercase tracking-wide">
                          Note จากนักตัดต่อ:
                        </span>
                        {renderCommentWithTimecodePills(noteText)}
                      </div>
                    )}

                    {/* Review Result */}
                    {revReview ? (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          {revReview.status === "NEEDS_REVISION" ? (
                            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                              <MessageSquare size={13} /> สั่งแก้ไข
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle size={13} /> ผ่านอนุมัติ
                            </span>
                          )}

                          {revReviewer && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              {revReviewer.pictureUrl ? (
                                <img
                                  src={revReviewer.pictureUrl}
                                  alt=""
                                  className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                                  {revReviewer.displayName?.[0] || "R"}
                                </div>
                              )}
                              <span className="text-[11px]">{revReviewer.displayName}</span>
                            </div>
                          )}
                        </div>

                        {revReview.comment && (
                          <div className="text-xs text-slate-800 bg-amber-50/60 p-3 rounded-xl border border-amber-200/70 font-medium">
                            <span className="font-bold text-amber-800 block mb-1 text-[10px] uppercase tracking-wide">
                              ข้อเสนอแนะจากผู้ตรวจ:
                            </span>
                            {renderCommentWithTimecodePills(revReview.comment)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-flex items-center gap-1">
                        <Clock size={12} /> รอผู้ตรวจประเมินงาน
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
