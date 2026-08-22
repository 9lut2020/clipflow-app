"use client";

import { useState, useMemo } from "react";
import { useAllClips } from "@/features/clips/hooks/use-clips";
import { Loader2, Share, Filter, X, ChevronRight, History, ListTodo, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { th } from "date-fns/locale";
import { PublishModal } from "./publish-modal";
import { SiTiktok, SiYoutube, SiFacebook, SiInstagram } from "react-icons/si";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const PLATFORMS = [
  { id: "TIKTOK", name: "TikTok", icon: SiTiktok, color: "text-zinc-900", bg: "bg-zinc-100" },
  { id: "YOUTUBE_SHORTS", name: "YT Shorts", icon: SiYoutube, color: "text-red-600", bg: "bg-red-50" },
  { id: "FACEBOOK_REELS", name: "FB Reels", icon: SiFacebook, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "INSTAGRAM_REELS", name: "IG Reels", icon: SiInstagram, color: "text-pink-600", bg: "bg-pink-50" },
];

const ITEMS_PER_PAGE = 10;

export function PublishClient() {
  const { data: clips, isLoading } = useAllClips("APPROVED,PUBLISHED", false);

  const [selectedClip, setSelectedClip] = useState<any | null>(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState("pending");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter only APPROVED and PUBLISHED clips first
  const baseClips = useMemo(() => {
    return clips?.filter((c) => c.status === "APPROVED") || [];
  }, [clips]);

  // Extract unique filters
  const uniqueProjects = useMemo(() => {
    const map = new Map();
    baseClips.forEach(c => {
      if (c.project && !map.has(c.project.id)) map.set(c.project.id, c.project);
    });
    return Array.from(map.values());
  }, [baseClips]);

  const uniqueOwners = useMemo(() => {
    const map = new Map();
    baseClips.forEach(c => {
      if (c.owner && !map.has(c.owner.id)) map.set(c.owner.id, c.owner);
    });
    return Array.from(map.values());
  }, [baseClips]);

  const toggle = (list: string[], setList: any, val: string) => {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  };

  const clearFilters = () => {
    setSelectedProjects([]);
    setSelectedOwners([]);
  };

  const activeFilterCount = selectedProjects.length + selectedOwners.length;

  const filteredClips = useMemo(() => {
    return baseClips.filter(c => {
      const matchProject = selectedProjects.length === 0 || (c.project?.id && selectedProjects.includes(c.project.id));
      const matchOwner = selectedOwners.length === 0 || (c.owner?.id && selectedOwners.includes(c.owner.id));
      
      const isFullyPublished = c.publishedPosts && c.publishedPosts.length >= PLATFORMS.length;
      const matchTab = activeTab === "pending" ? !isFullyPublished : isFullyPublished;

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
    currentPage * ITEMS_PER_PAGE
  );

  const renderPlatforms = (clip: any) => {
    const publishedList = clip.publishedPosts?.map((p: any) => p.platform) || [];
    
    return (
      <div className="flex gap-1.5 flex-wrap">
        {PLATFORMS.map(plat => {
          const isPublished = publishedList.includes(plat.id);
          const Icon = plat.icon;
          
          return (
            <div 
              key={plat.id}
              title={plat.name}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isPublished ? plat.color + " " + plat.bg : "bg-slate-100 text-slate-300 grayscale opacity-60"}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          );
        })}
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
          <h3 className="text-slate-800 font-bold mb-1">ไม่มีคลิปที่ตรงตามเงื่อนไข</h3>
          <p className="text-sm text-slate-500">ลองปรับตัวกรองใหม่ หรืออาจจะยังไม่มีคลิปในหน้านี้</p>
        </div>
      ) : (
        <>
          {/* Desktop View: Premium Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider w-[40%]">คลิปวิดีโอ</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">แพลตฟอร์ม</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">คนตัดต่อ</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">แอคชั่น</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {paginatedClips.map((clip) => {
                    const isFullyPublished = (clip.publishedPosts?.length || 0) >= PLATFORMS.length;
                    
                    return (
                      <tr 
                        key={clip.id} 
                        className="group hover:bg-blue-50/30 transition-colors duration-200 cursor-pointer"
                        onClick={() => setSelectedClip(clip)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors">
                              {clip.name}
                            </span>
                            <div className="flex items-center gap-2 text-[12px] text-slate-500">
                              <Badge variant="outline" className="text-[10px] bg-white text-slate-600 border-slate-200 px-1.5 py-0 h-4 rounded-sm font-medium">
                                EP{clip.episode?.episodeNo}
                              </Badge>
                              <span className="truncate max-w-[200px]">{clip.project?.name}</span>
                              <span className="text-slate-300">•</span>
                              <span className="whitespace-nowrap">{format(new Date(clip.updatedAt), "d MMM yyyy", { locale: th })}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {renderPlatforms(clip)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <img
                              src={clip.owner?.pictureUrl || `https://ui-avatars.com/api/?name=${clip.owner?.displayName}&background=random`}
                              alt={clip.owner?.displayName}
                              className="w-7 h-7 rounded-full border border-slate-200"
                            />
                            <span className="text-xs font-medium text-slate-700">
                              {clip.owner?.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button 
                            size="sm" 
                            className={`h-8 text-xs px-4 rounded-lg shadow-none transition-all pointer-events-none ${isFullyPublished ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                          >
                            {isFullyPublished ? "ดูประวัติการโพสต์" : "เผยแพร่คลิป"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View: Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {paginatedClips.map((clip) => {
              const isFullyPublished = (clip.publishedPosts?.length || 0) >= PLATFORMS.length;
              
              return (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClip(clip)}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-tight">
                          {clip.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                          <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600 border-slate-200 px-1.5 py-0 h-4 rounded-sm font-medium">
                            EP{clip.episode?.episodeNo}
                          </Badge>
                          <span className="truncate">{clip.project?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-slate-500 font-medium mb-1.5">ช่องทางเผยแพร่</div>
                      {renderPlatforms(clip)}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={clip.owner?.pictureUrl || `https://ui-avatars.com/api/?name=${clip.owner?.displayName}&background=random`}
                          alt={clip.owner?.displayName}
                          className="w-5 h-5 rounded-full border border-slate-200"
                        />
                        <span className="text-[11px] font-medium text-slate-600">
                          {clip.owner?.displayName}
                        </span>
                      </div>
                      
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${isFullyPublished ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                        {isFullyPublished ? "ดูประวัติ" : "เผยแพร่คลิป"}
                        <ChevronRight className="w-3 h-3" />
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
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
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
          
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border w-full sm:w-fit shrink-0 ${isFilterOpen || activeFilterCount > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
          >
            <Filter size={16} /> ตัวกรอง
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
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
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">โปรเจกต์</h4>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {uniqueProjects.map((proj: any) => (
                  <label key={proj.id} className="flex items-center gap-2 cursor-pointer group">
                    <div onClick={() => toggle(selectedProjects, setSelectedProjects, proj.id)} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedProjects.includes(proj.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}>
                      {selectedProjects.includes(proj.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      )}
                    </div>
                    <span onClick={() => toggle(selectedProjects, setSelectedProjects, proj.id)} className="text-sm text-slate-700 line-clamp-1 select-none">
                      {proj.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">คนตัดต่อ</h4>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {uniqueOwners.map((owner: any) => (
                  <label key={owner.id} className="flex items-center gap-2 cursor-pointer group">
                    <div onClick={() => toggle(selectedOwners, setSelectedOwners, owner.id)} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedOwners.includes(owner.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}>
                      {selectedOwners.includes(owner.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                      )}
                    </div>
                    <span onClick={() => toggle(selectedOwners, setSelectedOwners, owner.id)} className="text-sm text-slate-700 line-clamp-1 select-none">
                      {owner.displayName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <TabsTrigger 
            value="pending" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-bold px-4 py-2 transition-all flex items-center gap-2"
          >
            <ListTodo className="w-4 h-4" /> รอเผยแพร่
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm font-bold px-4 py-2 transition-all flex items-center gap-2"
          >
            <History className="w-4 h-4" /> ประวัติการโพสต์
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0 outline-none space-y-4">
          <ClipsTableOrList />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0 outline-none space-y-4">
          <ClipsTableOrList />
        </TabsContent>
      </Tabs>

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
