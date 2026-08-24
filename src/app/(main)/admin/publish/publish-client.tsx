"use client";

import { useState, useMemo } from "react";
import { useAllClips } from "@/features/clips/hooks/use-clips";
import {
  Loader2,
  Share,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublishModal } from "./publish-modal";
import { SiTiktok, SiYoutube, SiFacebook, SiInstagram } from "react-icons/si";

const PLATFORMS = [
  {
    id: "TIKTOK",
    name: "TikTok",
    icon: SiTiktok,
    color: "text-zinc-900",
    bg: "bg-zinc-100",
  },
  {
    id: "YOUTUBE_SHORTS",
    name: "YT Shorts",
    icon: SiYoutube,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    id: "FACEBOOK_REELS",
    name: "FB Reels",
    icon: SiFacebook,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "INSTAGRAM_REELS",
    name: "IG Reels",
    icon: SiInstagram,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
];

const ITEMS_PER_PAGE = 10;

export function PublishClient() {
  const { data: clips, isLoading } = useAllClips("APPROVED,PUBLISHED", false);

  const [selectedClip, setSelectedClip] = useState<any | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState("todo");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter only APPROVED and PUBLISHED clips first
  const baseClips = useMemo(() => {
    return (
      clips?.filter(
        (c) => c.status === "APPROVED" || c.status === "PUBLISHED",
      ) || []
    );
  }, [clips]);

  // Extract unique filters
  const uniqueProjects = useMemo(() => {
    const map = new Map();
    baseClips.forEach((c) => {
      if (c.project && !map.has(c.project.id)) map.set(c.project.id, c.project);
    });
    return Array.from(map.values());
  }, [baseClips]);

  const uniqueOwners = useMemo(() => {
    const map = new Map();
    baseClips.forEach((c) => {
      if (c.owner && !map.has(c.owner.id)) map.set(c.owner.id, c.owner);
    });
    return Array.from(map.values());
  }, [baseClips]);

  const toggle = (list: string[], setList: any, val: string) => {
    setList(
      list.includes(val) ? list.filter((x) => x !== val) : [...list, val],
    );
  };

  const clearFilters = () => {
    setSelectedProjects([]);
    setSelectedOwners([]);
  };

  const activeFilterCount = selectedProjects.length + selectedOwners.length;

  const filteredClips = useMemo(() => {
    return baseClips.filter((c) => {
      const matchProject =
        selectedProjects.length === 0 ||
        (c.project?.id && selectedProjects.includes(c.project.id));
      const matchOwner =
        selectedOwners.length === 0 ||
        (c.owner?.id && selectedOwners.includes(c.owner.id));

      const publishedCount = c.publishedPosts?.length || 0;

      let matchTab = false;
      if (activeTab === "todo") {
        matchTab = publishedCount === 0;
      } else if (activeTab === "in_progress") {
        matchTab = publishedCount > 0 && publishedCount < PLATFORMS.length;
      } else if (activeTab === "completed") {
        matchTab = publishedCount >= PLATFORMS.length;
      }

      return matchProject && matchOwner && matchTab;
    });
  }, [baseClips, selectedProjects, selectedOwners, activeTab]);

  // Reset page when filters or tabs change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedProjects, selectedOwners, activeTab]);

  const totalPages = Math.ceil(filteredClips.length / ITEMS_PER_PAGE) || 1;
  const paginatedClips = filteredClips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const renderPlatforms = (clip: any, align: "left" | "right" = "left") => {
    const publishedList =
      clip.publishedPosts?.map((p: any) => p.platform) || [];
    const publishedCount = publishedList.length;
    const isCompleted = publishedCount >= PLATFORMS.length;

    return (
      <div
        className={`flex flex-col gap-1 ${align === "right" ? "items-end" : "items-start"}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isCompleted ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${(publishedCount / PLATFORMS.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500">
            {publishedCount}/{PLATFORMS.length}
          </span>
        </div>

        <div
          className={`flex gap-1 flex-wrap ${align === "right" ? "justify-end" : "justify-start"}`}
        >
          {PLATFORMS.map((plat) => {
            const isPublished = publishedList.includes(plat.id);
            const Icon = plat.icon;

            return (
              <div
                key={plat.id}
                title={
                  isPublished
                    ? `โพสต์แล้ว: ${plat.name}`
                    : `ยังไม่ได้โพสต์: ${plat.name}`
                }
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isPublished
                    ? `${plat.bg} ${plat.color}`
                    : "bg-slate-100 text-slate-300 grayscale opacity-60 border border-slate-200/50"
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const ClipsTableOrList = () => (
    <>
      {paginatedClips.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Share className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-800 font-bold mb-1">
            ไม่มีคลิปที่ตรงตามเงื่อนไข
          </h3>
          <p className="text-sm text-slate-500">
            ลองปรับตัวกรองใหม่ หรืออาจจะยังไม่มีคลิปในหน้านี้
          </p>
        </div>
      ) : (
        <>
          {/* Unified Card List */}
          <div className="flex flex-col gap-3">
            {paginatedClips.map((clip) => {
              const isFullyPublished =
                (clip.publishedPosts?.length || 0) >= PLATFORMS.length;

              return (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClip(clip)}
                  className="hover:border-blue-300 hover:shadow-md transition-all group bg-white border border-slate-200 overflow-hidden min-w-0 rounded-2xl cursor-pointer"
                >
                  <div className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 min-w-0">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                        <span className="font-bold text-slate-500 text-sm sm:text-base">
                          🎬
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-slate-800 text-[13px] sm:text-base group-hover:text-blue-600 transition-colors truncate">
                          {clip.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 sm:mt-1">
                          {clip.project?.name && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 px-1.5 py-0 h-4 rounded-sm font-medium shrink-0 truncate max-w-[120px]"
                              title={clip.project.name}
                            >
                              {clip.project.name}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-white text-slate-600 border-slate-200 px-1.5 py-0 h-4 rounded-sm font-medium shrink-0 truncate max-w-[150px]"
                            title={
                              clip.episode?.name
                                ? `EP${clip.episode.episodeNo}: ${clip.episode.name}`
                                : `EP${clip.episode?.episodeNo}`
                            }
                          >
                            EP{clip.episode?.episodeNo}
                            {clip.episode?.name && (
                              <span className="ml-0.5 text-slate-400 font-normal">
                                : {clip.episode.name}
                              </span>
                            )}
                          </Badge>
                          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                            <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 truncate max-w-[80px] sm:max-w-[100px]">
                              ตัดต่อโดย :{" "}
                            </span>
                            <img
                              src={
                                clip.owner?.pictureUrl ||
                                `https://ui-avatars.com/api/?name=${clip.owner?.displayName}&background=random`
                              }
                              alt={clip.owner?.displayName}
                              className="w-4 h-4 rounded-full ring-1 ring-slate-200 shrink-0"
                            />
                            <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 truncate max-w-[80px] sm:max-w-[100px]">
                              {clip.owner?.displayName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex flex-col items-end pt-1">
                        {renderPlatforms(clip, "right")}
                      </div>
                      <div className="hidden sm:block pl-2 sm:pl-4 sm:border-l border-slate-100">
                        <Button
                          size="sm"
                          className={`h-8 text-xs px-4 rounded-lg shadow-none transition-all pointer-events-none ${isFullyPublished ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                        >
                          {isFullyPublished ? "ดูประวัติ" : "เผยแพร่คลิป"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                หน้า {currentPage} จาก {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Share className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                จัดการการเผยแพร่คลิป
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                คลิปที่ผ่านการอนุมัติและพร้อมนำไปเผยแพร่
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab + Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-full">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("todo")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "todo" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            ยังไม่เริ่ม
          </button>
          <button
            onClick={() => setActiveTab("in_progress")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "in_progress" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            กำลังดำเนินการ
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "completed" ? "bg-white text-green-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            เสร็จสิ้น
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                โปรเจกต์
              </h4>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {uniqueProjects.map((proj: any) => (
                  <label
                    key={proj.id}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      onClick={() =>
                        toggle(selectedProjects, setSelectedProjects, proj.id)
                      }
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedProjects.includes(proj.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}
                    >
                      {selectedProjects.includes(proj.id) && (
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
                        toggle(selectedProjects, setSelectedProjects, proj.id)
                      }
                      className="text-sm text-slate-700 line-clamp-1 select-none"
                    >
                      {proj.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                คนตัดต่อ
              </h4>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
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
                    <span
                      onClick={() =>
                        toggle(selectedOwners, setSelectedOwners, owner.id)
                      }
                      className="text-sm text-slate-700 line-clamp-1 select-none"
                    >
                      {owner.displayName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clips Content */}
      <div className="mt-4 outline-none space-y-4">
        <ClipsTableOrList />
      </div>

      {selectedClip && (
        <PublishModal
          clip={selectedClip}
          isOpen={!!selectedClip}
          onClose={() => setSelectedClip(null)}
        />
      )}
    </div>
  );
}
