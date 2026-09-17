"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAllClips } from "@/features/clips/hooks/use-clips";
import {
  Loader2,
  Share,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Download,
  CheckCircle2,
  CalendarClock,
  LayoutList,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublishModal } from "./publish-modal";
import { SiTiktok, SiYoutube, SiFacebook, SiInstagram } from "react-icons/si";
import { Skeleton } from "@/components/ui/skeleton";
import { PublishPlanner } from "@/components/publish/publish-planner";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "TIKTOK", name: "TikTok", icon: SiTiktok, color: "text-zinc-900", bg: "bg-zinc-100" },
  { id: "YOUTUBE_SHORTS", name: "YT Shorts", icon: SiYoutube, color: "text-red-600", bg: "bg-red-50" },
  { id: "FACEBOOK_REELS", name: "FB Reels", icon: SiFacebook, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "INSTAGRAM_REELS", name: "IG Reels", icon: SiInstagram, color: "text-pink-600", bg: "bg-pink-50" },
];

const ITEMS_PER_PAGE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "manage" | "calendar";
type QueueFilter = "all" | "scheduled" | "unscheduled" | "overdue" | "partial" | "completed";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const bangkokDateKey = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

// ─── Sub-components ──────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "manage", label: "จัดการการเผยแพร่", icon: LayoutList },
    { id: "calendar", label: "ปฏิทินคิวเผยแพร่", icon: CalendarDays },
  ];

  return (
    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          id={`tab-${id}`}
          type="button"
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            active === id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

function PlatformBadges({ clip, align = "left" }: { clip: any; align?: "left" | "right" }) {
  const publishedList = clip.publishedPosts?.map((p: any) => p.platform) || [];
  const publishedCount = publishedList.length;
  const isCompleted = publishedCount >= PLATFORMS.length;

  return (
    <div className={`flex flex-col gap-1 ${align === "right" ? "items-end" : "items-start"}`}>
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
      <div className={`flex gap-1 flex-wrap ${align === "right" ? "justify-end" : "justify-start"}`}>
        {PLATFORMS.map((plat) => {
          const isPublished = publishedList.includes(plat.id);
          const Icon = plat.icon;
          return (
            <div
              key={plat.id}
              title={isPublished ? `โพสต์แล้ว: ${plat.name}` : `ยังไม่ได้โพสต์: ${plat.name}`}
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
}

function ClipCard({ clip, onClick }: { clip: any; onClick: () => void }) {
  const isFullyPublished = (clip.publishedPosts?.length || 0) >= PLATFORMS.length;
  const approvedClipUrl = clip.currentRevision?.driveUrl || clip.driveUrl || "";
  const driveId = approvedClipUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || approvedClipUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];
  const downloadUrl = driveId ? `https://drive.google.com/uc?export=download&id=${driveId}` : approvedClipUrl;

  return (
    <div
      onClick={onClick}
      className="hover:border-blue-300 hover:shadow-md transition-all group bg-white border border-slate-200 overflow-hidden min-w-0 rounded-2xl cursor-pointer"
    >
      <div className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            <span className="font-bold text-slate-500 text-sm sm:text-base">🎬</span>
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-slate-800 text-[13px] sm:text-base group-hover:text-blue-600 transition-colors truncate">
              {clip.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 sm:mt-1">
              {clip.project?.name && (
                <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 px-1.5 py-0 h-4 rounded-sm font-medium shrink-0 truncate max-w-[120px]" title={clip.project.name}>
                  {clip.project.name}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] bg-white text-slate-600 border-slate-200 px-1.5 py-0 h-4 rounded-sm font-medium shrink-0 truncate max-w-[150px]">
                EP{clip.episode?.episodeNo}
                {clip.episode?.name && <span className="ml-0.5 text-slate-400 font-normal">: {clip.episode.name}</span>}
              </Badge>
              <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                <img
                  src={clip.owner?.pictureUrl || `https://ui-avatars.com/api/?name=${clip.owner?.displayName}&background=random`}
                  alt={clip.owner?.displayName}
                  className="w-4 h-4 rounded-full ring-1 ring-slate-200 shrink-0"
                />
                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[100px]">{clip.owner?.displayName}</span>
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold ${clip.scheduledPublishAt ? "text-violet-700" : "text-amber-600"}`}>
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                {clip.scheduledPublishAt
                  ? new Date(clip.scheduledPublishAt).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                  : "ยังไม่กำหนดวันโพสต์"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end pt-1">
            <PlatformBadges clip={clip} align="right" />
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">คลิปผ่านการตรวจแล้ว</span>
        </div>
        {approvedClipUrl ? (
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={approvedClipUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              เปิดคลิป
            </a>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              download
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
            >
              <Download className="h-3.5 w-3.5" />
              ดาวน์โหลด
            </a>
          </div>
        ) : (
          <span className="text-[11px] font-medium text-rose-500">ยังไม่มีลิงก์คลิป</span>
        )}
      </div>
    </div>
  );
}

// ─── Manage Tab ───────────────────────────────────────────────────────────────

function ManageTab({ clips, isLoading, onSelectClip }: { clips: any[]; isLoading: boolean; onSelectClip: (c: any) => void }) {
  const [scheduleFilter, setScheduleFilter] = useState<QueueFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggle = useCallback((list: string[], setList: any, val: string) => {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedProjects([]);
    setSelectedOwners([]);
    setDateFrom("");
    setDateTo("");
  }, []);

  const activeFilterCount = selectedProjects.length + selectedOwners.length + Number(Boolean(dateFrom)) + Number(Boolean(dateTo));

  // Extract unique filter values
  const uniqueProjects = useMemo(() => {
    const map = new Map();
    clips.forEach((c) => { if (c.project && !map.has(c.project.id)) map.set(c.project.id, c.project); });
    return Array.from(map.values());
  }, [clips]);

  const uniqueOwners = useMemo(() => {
    const map = new Map();
    clips.forEach((c) => { if (c.owner && !map.has(c.owner.id)) map.set(c.owner.id, c.owner); });
    return Array.from(map.values());
  }, [clips]);

  // Summary counts
  const scheduleCounts = useMemo(() => {
    const now = Date.now();
    const scheduled = clips.filter((c) => c.scheduledPublishAt).length;
    const overdue = clips.filter((c) => c.scheduledPublishAt && new Date(c.scheduledPublishAt).getTime() < now && (c.publishedPosts?.length || 0) === 0).length;
    const partial = clips.filter((c) => { const count = c.publishedPosts?.length || 0; return count > 0 && count < PLATFORMS.length; }).length;
    const published = clips.filter((c) => (c.publishedPosts?.length || 0) >= PLATFORMS.length).length;
    return { total: clips.length, scheduled, unscheduled: clips.length - scheduled, overdue, partial, published };
  }, [clips]);

  // Filtered clips
  const filteredClips = useMemo(() => {
    return clips.filter((c) => {
      const matchProject = selectedProjects.length === 0 || (c.project?.id && selectedProjects.includes(c.project.id));
      const matchOwner = selectedOwners.length === 0 || (c.owner?.id && selectedOwners.includes(c.owner.id));
      const publishedCount = c.publishedPosts?.length || 0;
      const scheduledTime = c.scheduledPublishAt ? new Date(c.scheduledPublishAt).getTime() : null;
      const scheduledDate = c.scheduledPublishAt ? bangkokDateKey(c.scheduledPublishAt) : null;
      const matchDate = (!dateFrom || (!!scheduledDate && scheduledDate >= dateFrom)) && (!dateTo || (!!scheduledDate && scheduledDate <= dateTo));
      const matchSchedule =
        scheduleFilter === "all" ||
        (scheduleFilter === "scheduled" && !!scheduledTime) ||
        (scheduleFilter === "unscheduled" && !scheduledTime) ||
        (scheduleFilter === "overdue" && !!scheduledTime && scheduledTime < Date.now() && publishedCount === 0) ||
        (scheduleFilter === "partial" && publishedCount > 0 && publishedCount < PLATFORMS.length) ||
        (scheduleFilter === "completed" && publishedCount >= PLATFORMS.length);
      return matchProject && matchOwner && matchSchedule && matchDate;
    });
  }, [clips, selectedProjects, selectedOwners, scheduleFilter, dateFrom, dateTo]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [selectedProjects, selectedOwners, scheduleFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredClips.length / ITEMS_PER_PAGE) || 1;
  const paginatedClips = filteredClips.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
        {[
          { key: "unscheduled" as const, label: "ยังไม่กำหนดเวลา", value: scheduleCounts.unscheduled, tone: "text-amber-700 bg-amber-50 border-amber-100" },
          { key: "scheduled" as const, label: "กำหนดเวลาแล้ว", value: scheduleCounts.scheduled, tone: "text-violet-700 bg-violet-50 border-violet-100" },
          { key: "overdue" as const, label: "เลยกำหนดยังไม่โพสต์", value: scheduleCounts.overdue, tone: "text-rose-700 bg-rose-50 border-rose-100" },
          { key: "partial" as const, label: "โพสต์บางส่วน", value: scheduleCounts.partial, tone: "text-orange-700 bg-orange-50 border-orange-100" },
          { key: "completed" as const, label: "โพสต์ครบแล้ว", value: scheduleCounts.published, tone: "text-emerald-700 bg-emerald-50 border-emerald-100" },
        ].map((item, idx) => (
          <button
            key={`${item.key}-${idx}`}
            type="button"
            onClick={() => setScheduleFilter(item.key)}
            className={`rounded-2xl border px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${item.tone} ${item.key === scheduleFilter ? "ring-2 ring-current/20" : ""}`}
          >
            <p className="text-[10px] font-bold opacity-75">{item.label}</p>
            <p className="mt-1 text-xl font-black">{item.value}</p>
          </button>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "unscheduled", "scheduled", "overdue", "partial", "completed"] as const).map((key) => {
            const labels: Record<QueueFilter, string> = { all: "ทั้งหมด", unscheduled: "ยังไม่กำหนดวัน", scheduled: "กำหนดวันแล้ว", overdue: "เลยกำหนด", partial: "โพสต์บางส่วน", completed: "โพสต์ครบ" };
            return (
              <button
                key={key}
                type="button"
                onClick={() => setScheduleFilter(key)}
                className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${scheduleFilter === key ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border w-full sm:w-fit ${isFilterOpen || activeFilterCount > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
        >
          <Filter size={16} /> ตัวกรอง
          {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">กรองข้อมูล</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1">
                <X size={14} /> ล้างทั้งหมด
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Project filter */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">โปรเจกต์</h4>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2">
                {uniqueProjects.map((proj: any) => (
                  <label key={proj.id} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => toggle(selectedProjects, setSelectedProjects, proj.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedProjects.includes(proj.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}
                    >
                      {selectedProjects.includes(proj.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span onClick={() => toggle(selectedProjects, setSelectedProjects, proj.id)} className="text-sm text-slate-700 line-clamp-1 select-none">{proj.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Owner filter */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">คนตัดต่อ</h4>
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2">
                {uniqueOwners.map((owner: any) => (
                  <label key={owner.id} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => toggle(selectedOwners, setSelectedOwners, owner.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedOwners.includes(owner.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}
                    >
                      {selectedOwners.includes(owner.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span onClick={() => toggle(selectedOwners, setSelectedOwners, owner.id)} className="text-sm text-slate-700 line-clamp-1 select-none">{owner.displayName}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Date filter */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">วันที่ลงโพสต์</h4>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">ตั้งแต่</span>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700" />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500">ถึง</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div>
        <h2 className="text-base font-black text-slate-900">รายการคิวและสถานะการเผยแพร่</h2>
        <p className="mt-1 text-xs text-slate-500">เปิดคลิปเพื่อแก้คิว คัดลอกข้อมูล และบันทึกแพลตฟอร์มที่โพสต์แล้ว</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="w-12 h-12 rounded-lg bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="flex gap-2"><Skeleton className="h-4 w-16 rounded bg-slate-100" /><Skeleton className="h-4 w-20 rounded bg-slate-100" /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredClips.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Share className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-800 font-bold mb-1">ไม่มีคลิปที่ตรงตามเงื่อนไข</h3>
          <p className="text-sm text-slate-500">ลองปรับตัวกรองใหม่ หรืออาจจะยังไม่มีคลิปในหน้านี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedClips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} onClick={() => onSelectClip(clip)} />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">หน้า {currentPage} จาก {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-lg">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-lg">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────

function CalendarTab({ clips, isLoading, onSelectClip }: { clips: any[]; isLoading: boolean; onSelectClip: (c: any) => void }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <Skeleton className="h-5 w-32 rounded bg-slate-200" />
            <Skeleton className="h-16 w-full rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-black text-slate-900">ปฏิทินคิวเผยแพร่</h2>
        <p className="mt-1 text-xs text-slate-500">คลิปที่กำหนดวันเผยแพร่แล้ว จัดกลุ่มตามวัน</p>
      </div>
      <PublishPlanner clips={clips} onSelectClip={onSelectClip} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PublishClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: TabId = rawTab === "calendar" ? "calendar" : "manage";

  const handleTabChange = (tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const { data: clips, isLoading } = useAllClips("APPROVED,PUBLISHED", false);
  const [selectedClip, setSelectedClip] = useState<any | null>(null);

  const baseClips = useMemo(
    () => clips?.filter((c) => c.status === "APPROVED" || c.status === "PUBLISHED") || [],
    [clips],
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Share className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
              จัดการการเผยแพร่คลิป
            </h1>
            <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">
              คลิปที่ผ่านการอนุมัติและพร้อมนำไปเผยแพร่
            </p>
          </div>
        </div>
        <TabBar active={activeTab} onChange={handleTabChange} />
      </div>

      {/* Tab Content */}
      {activeTab === "manage" ? (
        <ManageTab clips={baseClips} isLoading={isLoading} onSelectClip={setSelectedClip} />
      ) : (
        <CalendarTab clips={baseClips} isLoading={isLoading} onSelectClip={setSelectedClip} />
      )}

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
