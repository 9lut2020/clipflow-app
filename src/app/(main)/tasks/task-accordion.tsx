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
import { extractThumbnailUrl } from "@/lib/thumbnail-helper";

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
            ? "max-h-[3000px] opacity-100 p-4 pt-3 border-t border-slate-100"
            : "max-h-0 opacity-0 overflow-hidden p-0"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {clips.map((clip) => (
            <Link
              key={clip.id}
              href={`/clips/${clip.id}`}
              className="block group"
            >
              <Card className="h-full hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white border-slate-200/80 overflow-hidden">
                {/* Auto-Thumbnail */}
                {(() => {
                  const thumb = extractThumbnailUrl(clip.driveUrl);
                  return thumb.url ? (
                    <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-100">
                      <img
                        src={thumb.url}
                        alt={clip.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  ) : (
                    <div className={`w-full h-20 flex items-center justify-center ${
                      clip.platform === "YOUTUBE" ? "bg-red-50" :
                      clip.platform === "FB_REEL" ? "bg-blue-50" :
                      "bg-slate-100"
                    }`}>
                      <Film size={28} className="text-slate-300" />
                    </div>
                  );
                })()}
                <CardContent className="p-3.5 md:p-4">
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <span className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider truncate">
                      {clip.project?.name || "Project"} • EP.
                      {clip.episode?.episodeNo || "?"}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <PlatformBadge platform={clip.platform} />
                      {clip.owner && (
                        <div className="flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded-full shrink-0 border border-slate-200/50">
                          <UserAvatar
                            name={clip.owner.displayName}
                            pictureUrl={clip.owner.pictureUrl}
                          />
                          <span className="text-[10px] font-bold text-slate-700 max-w-[70px] truncate">
                            {clip.owner.displayName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm md:text-base text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {clip.name}
                  </h3>

                  {clip.description && (
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {clip.description}
                    </p>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-medium">
                      {new Date(clip.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="font-bold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      ดูรายละเอียด <ChevronRight size={14} />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
