"use client";

import { useState } from "react";
import {
  ChevronDown,
  AlertTriangle,
  Clock,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  Film,
} from "lucide-react";
import { Clip } from "@/types/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import PlatformBadge from "@/components/ui/platform-badge";
import { extractThumbnailUrl } from "@/utils/thumbnail-helper";

interface TaskAccordionSectionProps {
  title: string;
  iconType: "alert" | "clock" | "play" | "check";
  clips: Clip[];
  colorClass: string;
  badgeBg: string;
  emptyText: string;
  defaultOpen?: boolean;
  isUser?: boolean;
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
}: TaskAccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
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

  return (
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
            <Link
              key={clip.id}
              href={`/clips/${clip.id}`}
              className="block group outline-none"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-200">
                {/* Auto-Thumbnail / Icon (Left) */}
                <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/50 relative">
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
                </div>

                {/* Content (Middle & Right) */}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                        {clip.project?.name || "Project"} • EP.
                        {clip.episode?.episodeNo || "?"}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {clip.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-500 font-medium flex-wrap">
                      <span className="shrink-0">
                        {new Date(clip.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {clip.owner && (
                        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 sm:pl-3 shrink-0">
                          <span>ตัดต่อโดย:</span>
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
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
