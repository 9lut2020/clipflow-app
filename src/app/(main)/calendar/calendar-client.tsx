"use client";

import { useState, useMemo } from "react";
import { useAllClips, useScheduleClip } from "@/features/clips/hooks/use-clips";
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  X,
  Layers,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Sparkles,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { SiTiktok, SiYoutube, SiFacebook, SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";

// Platform Icon mapping
const PLATFORM_ICONS: Record<string, { icon: any; color: string; bg: string }> =
  {
    TIKTOK: { icon: SiTiktok, color: "text-slate-900", bg: "bg-slate-100" },
    YOUTUBE: { icon: SiYoutube, color: "text-red-600", bg: "bg-red-50" },
    FB_REEL: { icon: SiFacebook, color: "text-blue-600", bg: "bg-blue-50" },
    IG_SQUARE: { icon: SiInstagram, color: "text-pink-600", bg: "bg-pink-50" },
  };

// Status Design Config
const STATUS_CONFIGS: Record<
  string,
  { bg: string; text: string; dot: string; label: string; border: string }
> = {
  DRAFT: {
    bg: "bg-slate-50/70",
    text: "text-slate-655",
    dot: "bg-slate-400",
    label: "ร่าง",
    border: "border-slate-200/60",
  },
  PENDING_REVIEW: {
    bg: "bg-amber-50/70",
    text: "text-amber-755",
    dot: "bg-amber-500",
    label: "รอตรวจ",
    border: "border-amber-200/60",
  },
  IN_REVIEW: {
    bg: "bg-indigo-50/70",
    text: "text-indigo-755",
    dot: "bg-indigo-500",
    label: "กำลังตรวจ",
    border: "border-indigo-200/60",
  },
  NEEDS_REVISION: {
    bg: "bg-rose-50/70",
    text: "text-rose-755",
    dot: "bg-rose-500",
    label: "สั่งแก้",
    border: "border-rose-200/60",
  },
  APPROVED: {
    bg: "bg-emerald-50/75",
    text: "text-emerald-755",
    dot: "bg-emerald-500",
    label: "อนุมัติ",
    border: "border-emerald-200/60",
  },
  PUBLISHED: {
    bg: "bg-blue-50/75",
    text: "text-blue-755",
    dot: "bg-blue-500",
    label: "เผยแพร่",
    border: "border-blue-200/60",
  },
};

const DAYS_OF_WEEK = [
  { label: "อา.", value: 0 },
  { label: "จ.", value: 1 },
  { label: "อ.", value: 2 },
  { label: "พ.", value: 3 },
  { label: "พฤ.", value: 4 },
  { label: "ศ.", value: 5 },
  { label: "ส.", value: 6 },
];

export function CalendarClient() {
  const { data: clips, isLoading } = useAllClips("APPROVED,PUBLISHED", false);
  const { scheduleClip, isUpdating } = useScheduleClip();

  // Tab View Selection: "table" (ตารางจัดการ) or "calendar" (ตารางปฏิทินรายเดือน)
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Search & Filters (for Table view)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");
  const [filterTab, setFilterTab] = useState<
    "all" | "unscheduled" | "scheduled"
  >("all");

  // Interactivity States
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [selectedClip, setSelectedClip] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [customDateClipId, setCustomDateClipId] = useState<string | null>(null);
  const [customDateValue, setCustomDateValue] = useState("");

  // Custom Auto-Schedule Modal States
  const [isAutoScheduleConfirmOpen, setIsAutoScheduleConfirmOpen] =
    useState(false);
  const [selectedAutoDays, setSelectedAutoDays] = useState<number[]>([3, 5]); // Default: Wed & Fri
  const [autoScheduleTime, setAutoScheduleTime] = useState("14:00");
  const [autoScheduleStartDate, setAutoScheduleStartDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate calendar days (for Calendar view)
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const totalSlots = 42;
    const nextDaysCount = totalSlots - days.length;
    for (let i = 1; i <= nextDaysCount; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Calculate quick dates (Wednesday & Friday of this and next week)
  const quickDates = useMemo(() => {
    const today = new Date();
    today.setHours(14, 0, 0, 0); // 2:00 PM

    const getNextDayOfWeek = (
      startDate: Date,
      dayOfWeek: number,
      weeksAhead = 0,
    ) => {
      const resultDate = new Date(startDate);
      const currentDay = resultDate.getDay();
      let distance = dayOfWeek - currentDay;
      if (distance <= 0) distance += 7;
      resultDate.setDate(resultDate.getDate() + distance + weeksAhead * 7);
      return resultDate;
    };

    return {
      thisWed: getNextDayOfWeek(today, 3, 0),
      thisFri: getNextDayOfWeek(today, 5, 0),
      nextWed: getNextDayOfWeek(today, 3, 1),
      nextFri: getNextDayOfWeek(today, 5, 1),
    };
  }, []);

  // Calculate quick scheduling options (Wed/Fri for this/next week)
  const quickScheduleOptions = useMemo(() => {
    const options: { label: string; date: Date }[] = [];
    const today = new Date();
    today.setHours(14, 0, 0, 0);

    const getNextDayOfWeek = (
      startDate: Date,
      dayOfWeek: number,
      weeksAhead = 0,
    ) => {
      const resultDate = new Date(startDate);
      const currentDay = resultDate.getDay();
      let distance = dayOfWeek - currentDay;
      if (distance <= 0) distance += 7; // Get upcoming day
      resultDate.setDate(resultDate.getDate() + distance + weeksAhead * 7);
      return resultDate;
    };

    const thisWed = getNextDayOfWeek(today, 3, 0);
    const thisFri = getNextDayOfWeek(today, 5, 0);
    const nextWed = getNextDayOfWeek(today, 3, 1);
    const nextFri = getNextDayOfWeek(today, 5, 1);

    options.push({
      label: `วันพุธนี้ (${thisWed.toLocaleDateString("th-TH", { day: "numeric", month: "short" })})`,
      date: thisWed,
    });
    options.push({
      label: `วันศุกร์นี้ (${thisFri.toLocaleDateString("th-TH", { day: "numeric", month: "short" })})`,
      date: thisFri,
    });
    options.push({
      label: `วันพุธหน้า (${nextWed.toLocaleDateString("th-TH", { day: "numeric", month: "short" })})`,
      date: nextWed,
    });
    options.push({
      label: `วันศุกร์หน้า (${nextFri.toLocaleDateString("th-TH", { day: "numeric", month: "short" })})`,
      date: nextFri,
    });

    return options;
  }, []);

  // Filter project options dynamically based on clips data
  const projectOptions = useMemo(() => {
    if (!clips) return [];
    const map = new Map<string, string>();
    clips.forEach((c) => {
      if (c.project) {
        map.set(c.project.id, c.project.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [clips]);

  // Map clips to dates for calendar overview
  const scheduledClipsMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (!clips) return map;

    clips.forEach((clip) => {
      if (clip.scheduledPublishAt) {
        const dateKey = new Date(clip.scheduledPublishAt).toDateString();
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(clip);
      }
    });

    return map;
  }, [clips]);

  const unscheduledClips = useMemo(() => {
    if (!clips) return [];
    return clips.filter((clip) => !clip.scheduledPublishAt);
  }, [clips]);

  // Handle scheduling
  const handleSchedule = async (clipId: string, date: Date | null) => {
    try {
      const targetClip = clips?.find((c) => c.id === clipId);
      if (!targetClip) return;

      if (!date) {
        toast.promise(scheduleClip(clipId, null), {
          loading: "กำลังถอนวิดีโอออกจากตาราง...",
          success: `ถอน "${targetClip.name}" ออกจากตารางแล้ว`,
          error: "ไม่สามารถยกเลิกตารางได้",
        });
        return;
      }

      toast.promise(scheduleClip(clipId, date.toISOString()), {
        loading: "กำลังจัดตารางปล่อยคลิป...",
        success: `จัดตาราง "${targetClip.name}" ลงวันที่ ${date.toLocaleDateString("th-TH", { day: "numeric", month: "short" })} สำเร็จ`,
        error: "ไม่สามารถจัดตารางได้",
      });
      setOpenPopoverId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomDateSubmit = async (clipId: string) => {
    if (!customDateValue) {
      toast.error("กรุณาเลือกวันที่ต้องการจัดตาราง");
      return;
    }
    const targetDate = new Date(customDateValue);
    targetDate.setHours(14, 0, 0, 0); // 2:00 PM
    await handleSchedule(clipId, targetDate);
    setCustomDateClipId(null);
    setCustomDateValue("");
  };

  const handleSelectClip = (clip: any) => {
    setSelectedClip(clip);
    setIsDetailOpen(true);
  };

  const handleRemoveFromSchedule = async (clipId: string) => {
    try {
      const targetClip = clips?.find((c) => c.id === clipId);
      if (!targetClip) return;

      toast.promise(scheduleClip(clipId, null), {
        loading: "กำลังถอนวิดีโอออกจากตาราง...",
        success: `ถอน "${targetClip.name}" ออกจากตารางแล้ว`,
        error: "มีข้อผิดพลาดในการบันทึก",
      });
      setIsDetailOpen(false);
      setSelectedClip(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle days selected for Auto-Schedule
  const toggleAutoDay = (dayVal: number) => {
    setSelectedAutoDays((prev) =>
      prev.includes(dayVal)
        ? prev.filter((d) => d !== dayVal)
        : [...prev, dayVal].sort(),
    );
  };

  // Auto-schedule trigger click handler
  const handleAutoSchedule = () => {
    const unscheduled = clips?.filter((c) => !c.scheduledPublishAt) || [];
    if (unscheduled.length === 0) {
      toast.info("ไม่มีคลิปที่ต้องจัดตารางปล่อย");
      return;
    }
    setIsAutoScheduleConfirmOpen(true);
  };

  // Auto-schedule confirmation execution
  const confirmAutoSchedule = async () => {
    if (selectedAutoDays.length === 0) {
      toast.error("กรุณาเลือกวันปล่อยคลิปในสัปดาห์อย่างน้อย 1 วัน");
      return;
    }
    setIsAutoScheduleConfirmOpen(false);

    const unscheduled = clips?.filter((c) => !c.scheduledPublishAt) || [];
    const tId = toast.loading(
      "กำลังวิเคราะห์หาคิวปล่อยว่างและจัดตารางอัตโนมัติ...",
    );

    try {
      const startBase = autoScheduleStartDate
        ? new Date(autoScheduleStartDate)
        : new Date();
      const [hours, minutes] = autoScheduleTime.split(":").map(Number);

      const findNextEmptySlot = (startDate: Date, usedDates: Set<string>) => {
        let current = new Date(startDate);
        current.setDate(current.getDate() - 1);
        while (true) {
          current.setDate(current.getDate() + 1);
          const day = current.getDay();

          if (selectedAutoDays.includes(day)) {
            const slotTime = new Date(current);
            slotTime.setHours(hours, minutes, 0, 0);

            const dateStr = slotTime.toDateString();
            if (!usedDates.has(dateStr)) {
              usedDates.add(dateStr);
              return slotTime;
            }
          }
        }
      };

      const usedDates = new Set<string>();
      clips?.forEach((c) => {
        if (c.scheduledPublishAt) {
          usedDates.add(new Date(c.scheduledPublishAt).toDateString());
        }
      });

      for (const clip of unscheduled) {
        const nextSlot = findNextEmptySlot(startBase, usedDates);
        await scheduleClip(clip.id, nextSlot.toISOString());
      }

      toast.dismiss(tId);
      toast.success("จัดคิวปล่อยคลิปอัตโนมัติสำเร็จเรียบร้อย!");
    } catch (err) {
      toast.dismiss(tId);
      toast.error("เกิดข้อผิดพลาดขณะจัดตารางอัตโนมัติ");
    }
  };

  // Filtered and searched clips (for Table view)
  const filteredClips = useMemo(() => {
    if (!clips) return [];
    return clips
      .filter((clip) => {
        if (filterTab === "unscheduled" && clip.scheduledPublishAt)
          return false;
        if (filterTab === "scheduled" && !clip.scheduledPublishAt) return false;
        if (
          selectedProjectId !== "ALL" &&
          clip.project?.id !== selectedProjectId
        )
          return false;

        if (searchTerm.trim() !== "") {
          const term = searchTerm.toLowerCase();
          const matchTitle = clip.name.toLowerCase().includes(term);
          const matchProject =
            clip.project?.name?.toLowerCase().includes(term) || false;
          return matchTitle || matchProject;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.scheduledPublishAt && b.scheduledPublishAt) {
          return (
            new Date(a.scheduledPublishAt).getTime() -
            new Date(b.scheduledPublishAt).getTime()
          );
        }
        if (a.scheduledPublishAt) return -1;
        if (b.scheduledPublishAt) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [clips, filterTab, selectedProjectId, searchTerm]);

  const unscheduledCount =
    clips?.filter((c) => !c.scheduledPublishAt).length || 0;
  const scheduledCount = clips?.filter((c) => c.scheduledPublishAt).length || 0;

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 font-sans">
      {/* 1. Header Bar with Tabs Switcher */}
      <div className="w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-slate-50/50 px-4 py-4 sm:px-5 md:px-6 md:py-5 rounded-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl border border-slate-200/60 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-2xs transition-all shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </Button>
            </Link>
            <div className="min-w-0 space-y-0.5">
              <h1 className="text-sm sm:text-base md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs shrink-0">
                  <CalendarDays className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                วางแผนคิวปล่อยคลิปวิดีโอ
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-medium truncate">
                กำหนดตารางปล่อยงานจริงตามวันปล่อยที่ผู้ใช้เลือกอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Premium Layout View Toggle */}
          <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/40 w-auto md:w-auto self-stretch md:self-auto justify-center shadow-3xs">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`h-8 sm:h-9 text-[10px] sm:text-xs font-bold rounded-xl px-3 sm:px-4 cursor-pointer flex items-center gap-1.5 transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-950 shadow-xs hover:bg-white border border-slate-200/20"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListTodo size={13} /> จัดการคลิป
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={`h-8 sm:h-9 text-[10px] sm:text-xs font-bold rounded-xl px-3 sm:px-4 cursor-pointer flex items-center gap-1.5 transition-all ${
                viewMode === "calendar"
                  ? "bg-white text-slate-950 shadow-xs hover:bg-white border border-slate-200/20"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CalendarIcon size={13} /> ปฏิทินรายเดือน
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Content switcher based on View Mode */}
      {viewMode === "table" ? (
        /* ━━━━━━━━━━━━━━━━━━━━━ TAB A: TABLE SCHEDULER VIEW ━━━━━━━━━━━━━━━━━━━━━ */
        <>
          {/* Controls Card */}
          <Card className="border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-xl overflow-hidden">
            <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
              {/* Search */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อคลิป หรือชื่อโครงการ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-slate-50 border border-slate-200/80 focus:border-blue-400 focus:bg-white transition-all rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-655 shrink-0">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-550" />{" "}
                    โครงการ:
                  </span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer max-w-[120px] sm:max-w-none text-right sm:text-left"
                  >
                    <option value="ALL">ทุกโครงการ</option>
                    {projectOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleAutoSchedule}
                  className="text-xs font-black rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm transition-all h-9.5 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Sparkles size={13} className="animate-bounce" />{" "}
                  จัดตารางคิวปล่อยอัตโนมัติ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-200/70 pb-0.5 gap-4 sm:gap-6 text-xs sm:text-sm font-black text-slate-455 px-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterTab("all")}
              className={`pb-3 transition-all relative shrink-0 ${
                filterTab === "all"
                  ? "text-slate-900 border-b-2 border-slate-900"
                  : "hover:text-slate-700"
              }`}
            >
              ทั้งหมด ({clips?.length || 0})
            </button>
            <button
              onClick={() => setFilterTab("unscheduled")}
              className={`pb-3 transition-all relative flex items-center gap-1.5 shrink-0 ${
                filterTab === "unscheduled"
                  ? "text-slate-900 border-b-2 border-slate-900"
                  : "hover:text-slate-700"
              }`}
            >
              ยังไม่ได้จัดคิว
              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9.5px] font-bold">
                {unscheduledCount}
              </span>
            </button>
            <button
              onClick={() => setFilterTab("scheduled")}
              className={`pb-3 transition-all relative flex items-center gap-1.5 shrink-0 ${
                filterTab === "scheduled"
                  ? "text-slate-900 border-b-2 border-slate-900"
                  : "hover:text-slate-700"
              }`}
            >
              จัดคิวเรียบร้อย
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9.5px] font-bold">
                {scheduledCount}
              </span>
            </button>
          </div>

          {/* Table / List representation container */}
          <Card className="border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-xl overflow-hidden">
            {/* A. Mobile Card List (visible only on mobile) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 space-y-3 animate-pulse">
                    <Skeleton className="h-4 w-3/4 bg-slate-100 rounded" />
                    <Skeleton className="h-8 w-full bg-slate-50 rounded-xl" />
                  </div>
                ))
              ) : filteredClips.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold text-xs">
                  ไม่พบรายการวิดีโอ
                </div>
              ) : (
                filteredClips.map((clip) => {
                  const colors =
                    STATUS_CONFIGS[clip.status] || STATUS_CONFIGS.DRAFT;
                  const PlatIcon =
                    clip.platform && PLATFORM_ICONS[clip.platform]?.icon;
                  const isScheduled = !!clip.scheduledPublishAt;
                  const dateInputValue = clip.scheduledPublishAt
                    ? new Date(clip.scheduledPublishAt)
                        .toISOString()
                        .split("T")[0]
                    : "";

                  return (
                    <div key={clip.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <Link
                            href={`/clips/${clip.id}`}
                            className="font-bold text-slate-900 text-xs sm:text-sm hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                          >
                            {clip.name}
                          </Link>
                          <div className="flex items-center gap-1.5 text-[9.5px] text-slate-455 font-bold">
                            {PlatIcon && (
                              <span
                                className={`w-4 h-4 rounded flex items-center justify-center ${PLATFORM_ICONS[clip.platform!].bg} ${PLATFORM_ICONS[clip.platform!].color}`}
                              >
                                <PlatIcon size={8} />
                              </span>
                            )}
                            <span className="truncate">
                              📂 {clip.project?.name || "ไม่มีโครงการ"}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black border shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {colors.label}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={dateInputValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleSchedule(
                                clip.id,
                                val ? new Date(val + "T14:00:00") : null,
                              );
                            }}
                            className="bg-white border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs font-bold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                          />
                          {isScheduled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSchedule(clip.id, null)}
                              className="h-8.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl gap-1 shrink-0 border border-rose-100/50 bg-rose-50/20 px-2.5"
                            >
                              <RotateCcw size={12} /> ถอนคิว
                            </Button>
                          )}
                        </div>

                        {!isScheduled && (
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                            <button
                              onClick={() =>
                                handleSchedule(clip.id, quickDates.thisWed)
                              }
                              className="px-2 py-1 rounded-lg text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 shrink-0 cursor-pointer"
                            >
                              พุธนี้ ({quickDates.thisWed.getDate()})
                            </button>
                            <button
                              onClick={() =>
                                handleSchedule(clip.id, quickDates.thisFri)
                              }
                              className="px-2 py-1 rounded-lg text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 shrink-0 cursor-pointer"
                            >
                              ศุกร์นี้ ({quickDates.thisFri.getDate()})
                            </button>
                            <button
                              onClick={() =>
                                handleSchedule(clip.id, quickDates.nextWed)
                              }
                              className="px-2 py-1 rounded-lg text-[9px] font-black bg-slate-150 text-slate-700 border border-slate-200 hover:bg-slate-200 shrink-0 cursor-pointer"
                            >
                              พุธหน้า ({quickDates.nextWed.getDate()})
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* B. Desktop Table View (hidden on mobile, visible on desktop) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/60 text-[11px] font-black text-slate-455 uppercase tracking-widest">
                    <th className="py-4 px-6">ชื่อวิดีโอ / โครงการ</th>
                    <th className="py-4 px-4 text-center">สถานะ</th>
                    <th className="py-4 px-4">กำหนดวันปล่อยคลิปจริง</th>
                    <th className="py-4 px-6 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-6">
                          <Skeleton className="h-4 w-48 bg-slate-100" />
                        </td>
                        <td className="py-4 px-4">
                          <Skeleton className="h-4 w-12 mx-auto bg-slate-100" />
                        </td>
                        <td className="py-4 px-4">
                          <Skeleton className="h-8 w-40 bg-slate-100" />
                        </td>
                        <td className="py-4 px-6">
                          <Skeleton className="h-8 w-16 ml-auto bg-slate-100" />
                        </td>
                      </tr>
                    ))
                  ) : filteredClips.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-16 text-center text-slate-405 font-bold"
                      >
                        ไม่พบรายการวิดีโอที่ตรงกับเงื่อนไขค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredClips.map((clip) => {
                      const colors =
                        STATUS_CONFIGS[clip.status] || STATUS_CONFIGS.DRAFT;
                      const PlatIcon =
                        clip.platform && PLATFORM_ICONS[clip.platform]?.icon;
                      const isScheduled = !!clip.scheduledPublishAt;

                      const dateInputValue = clip.scheduledPublishAt
                        ? new Date(clip.scheduledPublishAt)
                            .toISOString()
                            .split("T")[0]
                        : "";

                      return (
                        <tr
                          key={clip.id}
                          className="hover:bg-slate-50/40 transition-colors"
                        >
                          <td className="py-4.5 px-6 max-w-[280px]">
                            <div className="space-y-1">
                              <Link
                                href={`/clips/${clip.id}`}
                                className="font-bold text-slate-900 hover:text-blue-600 transition-all text-xs sm:text-sm line-clamp-2 leading-snug"
                              >
                                {clip.name}
                              </Link>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-455 font-bold">
                                {PlatIcon && (
                                  <span
                                    className={`w-4.5 h-4.5 rounded flex items-center justify-center ${PLATFORM_ICONS[clip.platform!].bg} ${PLATFORM_ICONS[clip.platform!].color}`}
                                  >
                                    <PlatIcon size={9} />
                                  </span>
                                )}
                                <span>
                                  📂 {clip.project?.name || "ไม่มีโครงการ"}
                                </span>
                                <span>•</span>
                                <span>
                                  🎬 ตอนที่ {clip.episode?.episodeNo || "-"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black border ${colors.bg} ${colors.text} ${colors.border}`}
                            >
                              {colors.label}
                            </span>
                          </td>
                          <td className="py-4.5 px-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <input
                                type="date"
                                value={dateInputValue}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleSchedule(
                                    clip.id,
                                    val ? new Date(val + "T14:00:00") : null,
                                  );
                                }}
                                className="bg-white border border-slate-200/80 hover:border-slate-350 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/25 w-40 cursor-pointer shadow-3xs transition-all text-slate-700"
                              />
                              {!isScheduled && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleSchedule(
                                        clip.id,
                                        quickDates.thisWed,
                                      )
                                    }
                                    className="px-2 py-1 rounded-lg text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
                                  >
                                    วันพุธนี้ ({quickDates.thisWed.getDate()})
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleSchedule(
                                        clip.id,
                                        quickDates.thisFri,
                                      )
                                    }
                                    className="px-2 py-1 rounded-lg text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 transition-colors cursor-pointer"
                                  >
                                    วันศุกร์นี้ ({quickDates.thisFri.getDate()})
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleSchedule(
                                        clip.id,
                                        quickDates.nextWed,
                                      )
                                    }
                                    className="px-2 py-1 rounded-lg text-[9px] font-black bg-slate-150 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                                  >
                                    พุธหน้า ({quickDates.nextWed.getDate()})
                                  </button>
                                </div>
                              )}
                              {isScheduled && (
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-50 text-emerald-700 border-emerald-100 font-extrabold text-[10px] gap-1 px-2 py-0.5 rounded-lg"
                                >
                                  <Check size={11} className="stroke-[3px]" />{" "}
                                  ลงคิวเรียบร้อย
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4.5 px-6 text-right">
                            {isScheduled ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSchedule(clip.id, null)}
                                className="h-8.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl gap-1 cursor-pointer transition-colors shadow-3xs border border-rose-100/50 bg-rose-50/20"
                              >
                                <RotateCcw size={12} /> ถอนคิว
                              </Button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold italic pr-3">
                                รอคิว...
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* ━━━━━━━━━━━━━━━━━━━━━ TAB B: MONTHLY CALENDAR GRID VIEW ━━━━━━━━━━━━━━━━━━━━━ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid (Right Column on desktop, FIRST order on mobile) */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            <Card className="border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-xl overflow-hidden">
              <div className="p-4 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl bg-white border-slate-200/60 shadow-3xs text-slate-700 hover:bg-slate-50"
                    onClick={prevMonth}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 min-w-[110px] sm:min-w-[130px] text-center tracking-tight">
                    {monthNames[month]} {year + 543}
                  </h2>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl bg-white border-slate-200/60 shadow-3xs text-slate-700 hover:bg-slate-50"
                    onClick={nextMonth}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-xl bg-white border-slate-200/60 text-xs font-black text-slate-800 hover:bg-slate-50 shadow-3xs"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    วันนี้
                  </Button>
                </div>
                <div className="text-slate-450 text-xs font-bold hidden sm:block">
                  ตารางภาพรวมการเผยแพร่วิดีโอรายเดือน
                </div>
              </div>

              {/* Grid Calendar Layout */}
              <div className="p-2 sm:p-5">
                {/* Day of week labels */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center font-black text-slate-400 text-[10px] sm:text-xs mb-3 tracking-wider">
                  <div className="text-rose-500/80">อา.</div>
                  <div>จ.</div>
                  <div>อ.</div>
                  <div>พ.</div>
                  <div>พฤ.</div>
                  <div>ศ.</div>
                  <div className="text-blue-500/80">ส.</div>
                </div>

                {/* Day Grid cells */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                    const dateKey = date.toDateString();
                    const dayClips = scheduledClipsMap[dateKey] || [];
                    const isToday = new Date().toDateString() === dateKey;
                    const isWedOrFri =
                      date.getDay() === 3 || date.getDay() === 5;
                    const isPopOpen = openPopoverId === `date-${dateKey}`;

                    return (
                      <Popover
                        key={idx}
                        open={isPopOpen}
                        onOpenChange={(isOpen) =>
                          setOpenPopoverId(isOpen ? `date-${dateKey}` : null)
                        }
                      >
                        {/* The entire cell serves as the Popover Trigger */}
                        <PopoverTrigger asChild>
                          <div
                            className={`aspect-square sm:aspect-auto sm:min-h-[125px] md:min-h-[145px] lg:min-h-[160px] xl:min-h-[185px] p-1.5 sm:p-2.5 border rounded-xl sm:rounded-2xl flex flex-col justify-between transition-all duration-300 relative group/cell z-10 cursor-pointer ${
                              isCurrentMonth
                                ? isWedOrFri
                                  ? "bg-blue-50/30 sm:bg-blue-50/15 border border-blue-100 sm:border-blue-200/50 hover:border-blue-300 hover:shadow-xs"
                                  : "bg-white border border-slate-100 sm:border-slate-200/60 hover:border-slate-350 hover:shadow-2xs"
                                : "bg-slate-50/10 border border-slate-50/30 text-slate-300 pointer-events-none"
                            } ${isToday ? "ring-2 ring-blue-500 ring-offset-1 border-blue-500 bg-blue-50/5" : ""} ${
                              dayClips.length > 0 && isCurrentMonth
                                ? "bg-blue-50/40 border-blue-200/70 shadow-3xs"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] sm:text-xs font-black ${
                                  isToday
                                    ? "text-white bg-blue-600 w-5.5 h-5.5 rounded-xl flex items-center justify-center shadow-xs"
                                    : isCurrentMonth
                                      ? date.getDay() === 0
                                        ? "text-rose-500"
                                        : date.getDay() === 6
                                          ? "text-blue-500"
                                          : "text-slate-655"
                                      : "text-slate-300"
                                }`}
                              >
                                {date.getDate()}
                              </span>

                              {/* Desktop-only indicator: soft pill badge count */}
                              {dayClips.length > 0 && isCurrentMonth && (
                                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-blue-150 text-blue-800 text-[9px] font-black tracking-tighter">
                                  {dayClips.length} คลิป
                                </span>
                              )}
                            </div>

                            {/* Clips representation inside day cell */}
                            <div className="flex-1 mt-1 sm:mt-2.5 space-y-1 overflow-y-auto pr-0.5 custom-scrollbar">
                              {/* Desktop: Render full list of clips */}
                              <div className="hidden sm:block space-y-1.5 max-h-[55px] sm:max-h-[85px] md:max-h-[105px] lg:max-h-[120px] xl:max-h-[140px]">
                                {dayClips.map((clip) => {
                                  const colors =
                                    STATUS_CONFIGS[clip.status] ||
                                    STATUS_CONFIGS.DRAFT;
                                  const PlatIcon =
                                    clip.platform &&
                                    PLATFORM_ICONS[clip.platform]?.icon;

                                  return (
                                    <div
                                      key={clip.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectClip(clip);
                                      }}
                                      className={`p-1.5 rounded-xl border cursor-pointer hover:shadow-2xs transition-all duration-200 flex items-center gap-1 select-none leading-none ${colors.bg} ${colors.text} ${colors.border}`}
                                    >
                                      {PlatIcon && (
                                        <PlatIcon
                                          size={9}
                                          className="shrink-0 opacity-85"
                                        />
                                      )}
                                      <span className="font-extrabold text-[9px] truncate tracking-tight">
                                        {clip.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Mobile: Render simple dot markers for clean look */}
                              <div className="flex sm:hidden justify-center items-center gap-1 mt-1 flex-wrap">
                                {dayClips.slice(0, 3).map((clip) => (
                                  <span
                                    key={clip.id}
                                    className="w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-blue-100"
                                  />
                                ))}
                                {dayClips.length > 3 && (
                                  <span className="text-[7.5px] font-black text-slate-500 bg-slate-100 rounded px-1 scale-90">
                                    +{dayClips.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </PopoverTrigger>

                        <PopoverContent
                          side="bottom"
                          align="center"
                          className="w-64 p-3.5 max-h-[250px] overflow-y-auto custom-scrollbar z-50 rounded-2xl border border-slate-200 bg-white shadow-xl"
                        >
                          <div className="text-[10px] font-black text-slate-450 pb-2 border-b border-slate-100 flex items-center justify-between">
                            <span>
                              จัดการวันที่ {date.getDate()}{" "}
                              {monthNames[date.getMonth()]}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenPopoverId(null);
                              }}
                              className="text-slate-400 hover:text-slate-655 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>

                          {/* List of currently scheduled clips for this day (Mobile support) */}
                          {dayClips.length > 0 && (
                            <div className="space-y-1.5 py-2 border-b border-slate-100">
                              <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block mb-1">
                                คิวปล่อยปัจจุบัน:
                              </span>
                              <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar pr-0.5">
                                {dayClips.map((clip) => (
                                  <div
                                    key={clip.id}
                                    className="flex items-center justify-between gap-2 p-1.5 bg-slate-50 border border-slate-105 rounded-lg"
                                  >
                                    <span className="text-[10px] font-bold text-slate-705 truncate flex-1">
                                      {clip.name}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSchedule(clip.id, null);
                                      }}
                                      className="text-rose-500 hover:text-rose-700 p-0.5 rounded transition-colors shrink-0 cursor-pointer"
                                      title="ถอนคิว"
                                    >
                                      <Trash2
                                        size={11}
                                        className="stroke-[2.5px]"
                                      />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add clip section */}
                          <div className="pt-2">
                            <span className="text-[9px] font-black text-slate-455 uppercase tracking-widest block mb-1">
                              เพิ่มคลิปใหม่ลงคิว:
                            </span>
                            {unscheduledClips.length === 0 ? (
                              <p className="text-[9.5px] text-center py-2 text-slate-400 font-semibold">
                                ไม่มีวิดีโอว่าง
                              </p>
                            ) : (
                              <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar pr-0.5">
                                {unscheduledClips.map((clip) => (
                                  <button
                                    key={clip.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSchedule(clip.id, date);
                                    }}
                                    className="w-full text-left px-2 py-1.5 hover:bg-blue-50/50 hover:text-blue-750 text-[9.5px] font-extrabold text-slate-700 rounded-lg transition-colors truncate block border border-transparent cursor-pointer"
                                  >
                                    {clip.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Left Column: Clips Sidebar (1/4 width on desktop, SECOND order on mobile) */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <Card className="border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white rounded-xl overflow-hidden">
              <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/60 flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                  คลิปที่พร้อมจัดตารางปล่อย ({unscheduledClips.length})
                </h2>
              </div>
              <CardContent className="p-4 max-h-[400px] lg:max-h-[660px] overflow-y-auto custom-scrollbar space-y-3.5 bg-slate-50/20">
                {unscheduledClips.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-xl">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800">
                      จัดคิวปล่อยครบเรียบร้อย
                    </p>
                  </div>
                ) : (
                  unscheduledClips.map((clip) => {
                    const colors =
                      STATUS_CONFIGS[clip.status] || STATUS_CONFIGS.DRAFT;
                    const PlatIcon =
                      clip.platform && PLATFORM_ICONS[clip.platform]?.icon;
                    const isPopOpen = openPopoverId === clip.id;

                    return (
                      <div
                        key={clip.id}
                        className="p-4 bg-white border border-slate-200/80 hover:border-slate-350 hover:shadow-xs transition-all duration-300 rounded-2xl space-y-3 z-10 relative"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            onClick={() => handleSelectClip(clip)}
                            className="font-bold text-slate-800 text-xs sm:text-sm cursor-pointer hover:text-blue-600 line-clamp-2 pr-2"
                          >
                            {clip.name}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black border shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {colors.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-450 font-medium">
                          <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                            {PlatIcon && (
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center ${PLATFORM_ICONS[clip.platform!].bg} ${PLATFORM_ICONS[clip.platform!].color}`}
                              >
                                <PlatIcon size={10} />
                              </span>
                            )}
                            <span className="font-semibold text-slate-500 truncate">
                              {clip.project?.name}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex gap-2">
                          <Popover
                            open={isPopOpen}
                            onOpenChange={(isOpen) =>
                              setOpenPopoverId(isOpen ? clip.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs font-bold rounded-xl h-9 gap-1.5 cursor-pointer bg-blue-50/60 text-blue-700 border-blue-100 hover:bg-blue-100/80"
                              >
                                เลือกวันคิวปล่อย <ChevronDown size={14} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="bottom"
                              align="center"
                              className="w-56 p-2 space-y-1 z-50 rounded-2xl border border-slate-200 bg-white shadow-xl"
                            >
                              {quickScheduleOptions.map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() =>
                                    handleSchedule(clip.id, opt.date)
                                  }
                                  className="w-full text-left px-2.5 py-2 hover:bg-blue-50/40 hover:text-blue-600 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 3. Detail Dialog / Modal */}
      {isDetailOpen && selectedClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-xl w-full max-w-md border border-slate-105/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex items-start justify-between">
              <div className="space-y-1">
                <Badge
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-500 font-bold px-2 py-0.5 text-[9px] rounded-lg"
                >
                  รายละเอียดคิวงาน
                </Badge>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {selectedClip.name}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDetailOpen(false)}
                className="h-9 w-9 rounded-xl text-slate-455 hover:bg-slate-200/50 hover:text-slate-655 cursor-pointer transition-all"
              >
                <X size={18} className="stroke-[2.5px]" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4.5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    โปรเจกต์
                  </span>
                  <p className="font-bold text-slate-800 text-xs truncate">
                    📂 {selectedClip.project?.name || "ไม่มีข้อมูล"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    สถานะงาน
                  </span>
                  <div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black border ${STATUS_CONFIGS[selectedClip.status]?.bg || STATUS_CONFIGS.DRAFT.bg} ${STATUS_CONFIGS[selectedClip.status]?.text || STATUS_CONFIGS.DRAFT.text} ${STATUS_CONFIGS[selectedClip.status]?.border || STATUS_CONFIGS.DRAFT.border}`}
                    >
                      {STATUS_CONFIGS[selectedClip.status]?.label ||
                        STATUS_CONFIGS.DRAFT.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    วันปล่อยคลิปจริง
                  </span>
                  <p className="font-black text-blue-600 text-xs flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {selectedClip.scheduledPublishAt
                      ? new Date(
                          selectedClip.scheduledPublishAt,
                        ).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "ไม่ได้ระบุคิวลงตาราง"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    เดดไลน์ของคนตัดต่อ
                  </span>
                  <p className="font-bold text-slate-800 text-xs">
                    {selectedClip.deadline
                      ? new Date(selectedClip.deadline).toLocaleDateString(
                          "th-TH",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "ไม่ได้ระบุ"}
                  </p>
                </div>
              </div>

              {selectedClip.description && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    รายละเอียดเพิ่มเติม
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-105/40 leading-relaxed text-[11.5px]">
                    {selectedClip.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link href={`/clips/${selectedClip.id}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-black rounded-2xl h-10.5 gap-1.5 cursor-pointer border-slate-200 hover:bg-slate-50 transition-all shadow-3xs"
                  >
                    <ExternalLink size={14} className="stroke-[2.5px]" />{" "}
                    ไปหน้าคอมเมนต์แก้คลิป
                  </Button>
                </Link>

                {selectedClip.scheduledPublishAt && (
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveFromSchedule(selectedClip.id)}
                    className="rounded-2xl h-10.5 px-3.5 cursor-pointer shadow-xs transition-all hover:bg-red-700"
                    title="ถอนออกจากปฏิทิน"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Auto-Schedule Configuration Dialog */}
      <Dialog
        open={isAutoScheduleConfirmOpen}
        onOpenChange={setIsAutoScheduleConfirmOpen}
      >
        <DialogContent className="max-w-md rounded-xl p-6 bg-white border border-slate-200/80 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-3xs mb-2">
              <Sparkles className="w-5.5 h-5.5 animate-pulse text-blue-555" />
            </div>
            <DialogTitle className="text-base font-black text-slate-900 leading-snug">
              ตั้งค่าจัดตารางคิวปล่อยอัตโนมัติ
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed font-bold">
              ระบุวันปล่อย เวลาปล่อย และวันเริ่มต้นที่ต้องการ
              เพื่อจัดคิวงานจำนวน{" "}
              <span className="text-blue-650 font-black text-sm px-1.5 py-0.5 bg-blue-50 rounded-md">
                {unscheduledClips.length}
              </span>{" "}
              คลิป ลงในระบบ
            </DialogDescription>
          </DialogHeader>

          {/* Form Settings */}
          <div className="space-y-4 py-3 text-xs">
            {/* Days Selection */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                วันปล่อยคลิปในแต่ละสัปดาห์ (เลือกได้อิสระ):
              </span>
              <div className="flex justify-between gap-1">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = selectedAutoDays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleAutoDay(d.value)}
                      className={`w-9 h-9 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-3xs"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Date & Time input */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  เริ่มปล่อยตั้งแต่วันที่:
                </span>
                <input
                  type="date"
                  value={autoScheduleStartDate}
                  onChange={(e) => setAutoScheduleStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  เวลาปล่อย (น.):
                </span>
                <input
                  type="time"
                  value={autoScheduleTime}
                  onChange={(e) => setAutoScheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-5 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAutoScheduleConfirmOpen(false)}
              className="flex-1 rounded-2xl h-11 text-xs font-black border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-3xs"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={confirmAutoSchedule}
              className="flex-1 rounded-2xl h-11 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-xs"
            >
              เริ่มจัดตารางอัตโนมัติ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
