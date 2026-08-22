"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronDown, Filter, X, FolderX } from "lucide-react";
import PlatformBadge from "@/components/ui/platform-badge";

interface ProjectClipsListProps {
  project: { id: string; name: string; description?: string };
  episodes: { id: string; episodeNo: number; name?: string }[];
  clips: any[];
  currentUser: any;
  isUser: boolean;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  APPROVED: {
    label: "ผ่าน",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  NEEDS_REVISION: {
    label: "ต้องแก้",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  PENDING_REVIEW: {
    label: "รอตรวจ",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  IN_REVIEW: {
    label: "กำลังตรวจ",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  DRAFT: {
    label: "ร่าง",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
  CANCELLED: {
    label: "ยกเลิก",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

export default function ProjectClipsList({
  project,
  episodes,
  clips,
  currentUser,
  isUser,
}: ProjectClipsListProps) {
  const [view, setView] = useState<"active" | "history">("active");
  const [selectedEps, setSelectedEps] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter clips by user ownership if needed
  const baseClips = useMemo(
    () => (isUser ? clips.filter((c) => c.ownerId === currentUser.id) : clips),
    [clips, isUser, currentUser.id],
  );

  // Unique owners for filter
  const uniqueOwners = useMemo(() => {
    const map = new Map();
    baseClips.forEach((c) => {
      if (c.owner && !map.has(c.owner.id)) map.set(c.owner.id, c.owner);
    });
    return Array.from(map.values());
  }, [baseClips]);

  const uniqueStatuses = useMemo(() => {
    const set = new Set<string>();
    baseClips.forEach((c) => set.add(c.status));
    return Array.from(set);
  }, [baseClips]);

  const toggle = (list: string[], setList: any, val: string) => {
    setList(
      list.includes(val) ? list.filter((x) => x !== val) : [...list, val],
    );
  };

  const clearFilters = () => {
    setSelectedEps([]);
    setSelectedOwners([]);
    setSelectedStatuses([]);
  };

  const activeFilterCount =
    selectedEps.length + selectedOwners.length + selectedStatuses.length;

  // Apply all filters and group by episode
  const episodeGroups = useMemo(() => {
    return episodes
      .map((ep) => {
        let epClips = baseClips.filter(
          (c) => c.episode?.id === ep.id || c.episodeId === ep.id,
        );

        // View tab
        if (view === "active") {
          epClips = epClips.filter(
            (c) => c.status !== "APPROVED" && c.status !== "CANCELLED",
          );
        } else {
          epClips = epClips.filter(
            (c) => c.status === "APPROVED" || c.status === "CANCELLED",
          );
        }

        // Filters
        if (selectedOwners.length > 0) {
          epClips = epClips.filter((c) =>
            selectedOwners.includes(c.owner?.id || c.ownerId),
          );
        }
        if (selectedStatuses.length > 0) {
          epClips = epClips.filter((c) => selectedStatuses.includes(c.status));
        }

        return { episode: ep, clips: epClips };
      })
      .filter((g) => {
        // Skip episodes filtered out
        if (selectedEps.length > 0 && !selectedEps.includes(g.episode.id))
          return false;
        return g.clips.length > 0;
      });
  }, [
    baseClips,
    episodes,
    view,
    selectedEps,
    selectedOwners,
    selectedStatuses,
  ]);

  return (
    <div className="space-y-4">
      {/* Tab + Filter Controls */}
      <div className="flex flex-col gap-3 max-w-full">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setView("active")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === "active" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            รอตรวจ / กำลังทำ
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === "history" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            ประวัติ (ผ่านแล้ว)
          </button>
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border w-full sm:w-fit ${isFilterOpen || activeFilterCount > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
        >
          <Filter size={16} /> ตัวกรอง
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">กรองข้อมูล</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
              >
                <X size={14} /> ล้างทั้งหมด
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Episode */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                ตอน
              </h4>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                {episodes.map((ep) => (
                  <label
                    key={ep.id}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      onClick={() => toggle(selectedEps, setSelectedEps, ep.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedEps.includes(ep.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}
                    >
                      {selectedEps.includes(ep.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      onClick={() => toggle(selectedEps, setSelectedEps, ep.id)}
                      className="text-sm text-slate-700 line-clamp-1 select-none"
                    >
                      EP{ep.episodeNo}: {ep.name || "Untitled"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Owner */}
            {!isUser && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  คนรับผิดชอบ
                </h4>
                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                  {uniqueOwners.map((owner: any) => (
                    <label
                      key={owner.id}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div
                        onClick={() =>
                          toggle(selectedOwners, setSelectedOwners, owner.id)
                        }
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedOwners.includes(owner.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}
                      >
                        {selectedOwners.includes(owner.id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div
                        onClick={() =>
                          toggle(selectedOwners, setSelectedOwners, owner.id)
                        }
                        className="flex items-center gap-1.5 select-none min-w-0"
                      >
                        {owner.pictureUrl ? (
                          <img
                            src={owner.pictureUrl}
                            alt=""
                            className="w-5 h-5 rounded-full ring-1 ring-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500 ring-1 ring-slate-200 shrink-0">
                            {owner.displayName?.[0] || "?"}
                          </div>
                        )}
                        <span className="text-sm text-slate-700 truncate">
                          {owner.displayName}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                สถานะ
              </h4>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                {uniqueStatuses.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      onClick={() =>
                        toggle(selectedStatuses, setSelectedStatuses, status)
                      }
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedStatuses.includes(status) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}
                    >
                      {selectedStatuses.includes(status) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      onClick={() =>
                        toggle(selectedStatuses, setSelectedStatuses, status)
                      }
                      className="text-sm text-slate-700 select-none"
                    >
                      {STATUS_MAP[status]?.label || status}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Episode Groups */}
      <div className="space-y-4 pb-24">
        {episodeGroups.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FolderX size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold text-base">ไม่พบคลิปที่ตรงกับเงื่อนไข</p>
            <p className="text-slate-400 text-sm mt-1">ลองเปลี่ยนตัวกรอง หรือค้นหาด้วยคำอื่น</p>
          </div>
        ) : (
          episodeGroups.map(({ episode, clips: epClips }) => (
            <details
              key={episode.id}
              className="group bg-slate-50 sm:bg-white border border-slate-200 rounded-2xl shadow-sm"
              open={
                selectedEps.length > 0 || activeFilterCount > 0
                  ? true
                  : undefined
              }
            >
              <summary className="flex items-center justify-between p-4 bg-white rounded-t-2xl group-open:border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors select-none">
                <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-800">
                  EP{episode.episodeNo}: {episode.name || "Untitled"}
                  <span className="text-slate-400 font-medium ml-1.5 text-[13px] sm:text-sm">
                    ({epClips.length})
                  </span>
                </h2>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform shrink-0">
                  <ChevronDown size={18} />
                </div>
              </summary>

              <div className="p-3 sm:p-4 grid gap-3 bg-slate-50/50 rounded-b-2xl">
                {epClips.map((clip) => {
                  const statusInfo = STATUS_MAP[clip.status] || {
                    label: clip.status,
                    className: "bg-slate-50 text-slate-600 border-slate-200",
                  };
                  return (
                    <Link
                      href={`/clips/${clip.id}`}
                      key={clip.id}
                      className="min-w-0 block"
                    >
                      <Card className="hover:border-blue-300 hover:shadow-md transition-all group/card bg-white border-slate-200 overflow-hidden min-w-0">
                        <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                              <span className="font-bold text-slate-500 text-sm sm:text-base">
                                🎬
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <h3 className="font-bold text-slate-800 text-[13px] sm:text-base group-hover/card:text-blue-600 transition-colors truncate">
                                {clip.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 sm:mt-1">
                                <PlatformBadge platform={clip.platform} compact className="shrink-0" />
                                {clip.description && (
                                  <span className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
                                    {clip.description}
                                  </span>
                                )}
                                {!isUser && clip.owner && (
                                  <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                                    {clip.owner.pictureUrl ? (
                                      <img
                                        src={clip.owner.pictureUrl}
                                        alt=""
                                        className="w-4 h-4 rounded-full ring-1 ring-slate-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 ring-1 ring-slate-200 shrink-0">
                                        {clip.owner.displayName?.[0] || "?"}
                                      </div>
                                    )}
                                    <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 truncate max-w-[80px] sm:max-w-[100px]">
                                      {clip.owner.displayName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <Badge
                              variant="outline"
                              className={`px-2.5 py-1 text-[10px] sm:px-3 sm:py-1 sm:text-xs font-bold whitespace-nowrap shadow-2xs ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
