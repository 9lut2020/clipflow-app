"use client";

import { useState } from "react";
import { Clip, Project, User } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  User as UserIcon,
  Users,
  BarChart3,
  ChevronRight,
  Search,
  SearchX,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";

interface MainDashboardProps {
  clips: Clip[];
  projects: Project[];
  users?: User[];
  isUser: boolean;
  role: string;
  currentUser: any;
}

export function MainDashboard({
  clips,
  projects,
  users = [],
  isUser,
  role,
  currentUser,
}: MainDashboardProps) {
  const [localClips, setLocalClips] = useState<Clip[]>(clips);
  const [offset, setOffset] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(clips.length === 20); // If initial load had 20, there might be more

  // Filters State
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const { apiClient } = await import("@/lib/api-client");
      const res = await apiClient.get<Clip[]>("/clips", {
        limit: "20",
        offset: offset.toString()
      });
      if (res.data) {
        setLocalClips((prev) => [...prev, ...(res.data || [])]);
        setOffset((prev) => prev + 20);
        if (res.data.length < 20) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to load more clips", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Filter clips logic
  const now = new Date();
  const filteredClips = localClips.filter((c) => {
    // Time filter
    const clipDate = new Date(c.createdAt || c.updatedAt);
    if (timeFilter === "7d") {
      const diffDays =
        (now.getTime() - clipDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) return false;
    } else if (timeFilter === "30d") {
      const diffDays =
        (now.getTime() - clipDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 30) return false;
    }

    // Status filter
    if (statusFilter !== "ALL" && c.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const pName = (c.project?.name || "").toLowerCase();
      const cName = (c.name || c.episode?.name || "").toLowerCase();
      const uName = (c.owner?.displayName || "").toLowerCase();
      if (!pName.includes(q) && !cName.includes(q) && !uName.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Key Statistics
  const pendingClips = filteredClips.filter(
    (c) => c.status === "PENDING_REVIEW",
  );
  const inReviewClips = filteredClips.filter((c) => c.status === "IN_REVIEW");
  const needsRevisionClips = filteredClips.filter(
    (c) => c.status === "NEEDS_REVISION",
  );
  const approvedClips = filteredClips.filter((c) => c.status === "APPROVED");

  const totalCount = filteredClips.length;
  const approvalRate =
    totalCount > 0 ? Math.round((approvedClips.length / totalCount) * 100) : 0;

  // Trend Data for SVG Line Chart (7 data points)
  const trendPointsCount = 7;
  const trendDataPoints: {
    label: string;
    submitted: number;
    approved: number;
  }[] = [];
  for (let i = trendPointsCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * (timeFilter === "30d" ? 4 : 1));
    const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;

    const submitted = filteredClips.filter((c) => {
      const cd = new Date(c.createdAt);
      return cd.getDate() === d.getDate() && cd.getMonth() === d.getMonth();
    }).length;

    const approved = filteredClips.filter((c) => {
      const cd = new Date(c.updatedAt || c.createdAt);
      return (
        c.status === "APPROVED" &&
        cd.getDate() === d.getDate() &&
        cd.getMonth() === d.getMonth()
      );
    }).length;

    trendDataPoints.push({ label: dayLabel, submitted, approved });
  }

  // SVG Line Calculations
  const svgWidth = 550;
  const svgHeight = 150;
  const maxVal = Math.max(
    ...trendDataPoints.map((dp) => Math.max(dp.submitted, dp.approved)),
    4,
  );

  const subLinePoints = trendDataPoints
    .map((dp, idx) => {
      const x = (idx / (trendDataPoints.length - 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - (dp.submitted / maxVal) * (svgHeight - 40) - 20;
      return `${x},${y}`;
    })
    .join(" ");

  const appLinePoints = trendDataPoints
    .map((dp, idx) => {
      const x = (idx / (trendDataPoints.length - 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - (dp.approved / maxVal) * (svgHeight - 40) - 20;
      return `${x},${y}`;
    })
    .join(" ");

  // Creator Leaderboard
  const creatorStatsMap = new Map<
    string,
    {
      id: string;
      name: string;
      pictureUrl?: string | null;
      total: number;
      approved: number;
    }
  >();

  clips.forEach((c) => {
    const ownerId = c.owner?.id || c.ownerId || "unassigned";
    const name = c.owner?.displayName || "ไม่ระบุชื่อ";
    const pictureUrl = c.owner?.pictureUrl;

    if (!creatorStatsMap.has(ownerId)) {
      creatorStatsMap.set(ownerId, {
        id: ownerId,
        name,
        pictureUrl,
        total: 0,
        approved: 0,
      });
    }

    const stat = creatorStatsMap.get(ownerId)!;
    stat.total += 1;
    if (c.status === "APPROVED") stat.approved += 1;
  });

  const creatorLeaderboard = Array.from(creatorStatsMap.values()).sort(
    (a, b) => b.approved - a.approved,
  );



  return (
    <div className="space-y-4 md:space-y-6 max-w-full mx-auto pb-20 md:pb-16">
      {/* ─── 1. EXECUTIVE MOBILE-OPTIMIZED WELCOME HEADER ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={currentUser?.name || "ผู้ใช้งาน"}
            pictureUrl={currentUser?.image || currentUser?.pictureUrl}
            size="w-10 h-10 md:w-12 md:h-12"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
                สวัสดีคุณ {currentUser?.name || "ผู้ใช้งาน"}
              </h1>
              <span className="bg-blue-50 text-blue-700 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200/80 shrink-0">
                {role === "ADMIN"
                  ? "👑 ผู้ดูแลระบบ"
                  : role === "REVIEWER"
                    ? "🔍 ผู้ตรวจงาน"
                    : "🎬 นักตัดต่อ"}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] md:text-sm mt-0.5">
              ติดตามสถานะงานวิดีโอ การตรวจทาน และผลงานการผลิตสื่อ
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          {isUser ? (
            <Link href="/submit" className="block w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-xs border-0">
                <Plus size={15} className="mr-1" /> ส่งคลิปใหม่
              </Button>
            </Link>
          ) : (
            <Link href="/analytics" className="block w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                <BarChart3 size={15} className="mr-1.5 text-blue-600" />{" "}
                สถิติเชิงลึก
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ─── 2. 4 MOBILE-FRIENDLY KPI STAT CARDS (2x2 GRID ON MOBILE) ───────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
        {/* Pending Review Card */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">
                รอตรวจ (Pending)
              </span>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-xl md:text-3xl font-black text-amber-600 tracking-tight">
              {pendingClips.length}{" "}
              <span className="text-[10px] md:text-xs font-normal text-slate-500">
                รายการ
              </span>
            </div>
          </CardContent>
        </Card>

        {/* In Review Card */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">
                กำลังตรวจ (In Review)
              </span>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Video size={16} />
              </div>
            </div>
            <div className="text-xl md:text-3xl font-black text-sky-600 tracking-tight">
              {inReviewClips.length}{" "}
              <span className="text-[10px] md:text-xs font-normal text-slate-500">
                รายการ
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Needs Revision Card */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">
                สั่งแก้ไข (Needs Rev)
              </span>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-xl md:text-3xl font-black text-rose-600 tracking-tight">
              {needsRevisionClips.length}{" "}
              <span className="text-[10px] md:text-xs font-normal text-slate-500">
                รายการ
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Approved Card */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">
                ผ่านอนุมัติ (Approved)
              </span>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-xl md:text-3xl font-black text-emerald-600 tracking-tight">
              {approvedClips.length}{" "}
              <span className="text-[10px] md:text-xs font-normal text-slate-500">
                ({approvalRate}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 3. DUAL ANALYTICS GRID (TREND LINE CHART & TEAM LEADERBOARD) ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
        {/* Trend Line Chart (lg:col-span-7) */}
        <Card className="lg:col-span-7 bg-white border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="p-3.5 md:p-5 border-b border-slate-100 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              <span>แนวโน้มการผลิตและอนุมัติสื่อ</span>
            </CardTitle>

            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              {[
                { id: "7d", label: "7 วัน" },
                { id: "30d", label: "30 วัน" },
                { id: "all", label: "ทั้งหมด" },
              ].map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setTimeFilter(tf.id as any)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    timeFilter === tf.id
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-3 md:p-6">
            <div className="flex items-center gap-3 text-[11px] font-bold mb-3 justify-end">
              <div className="flex items-center gap-1 text-blue-600">
                <span className="w-2.5 h-1 bg-blue-500 rounded-full" />
                <span>ส่งคลิป</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-1 bg-emerald-500 rounded-full" />
                <span>อนุมัติ</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-40 md:h-52 min-w-[320px] overflow-visible"
              >
                {/* Grid Lines */}
                {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                  const y = svgHeight - ratio * (svgHeight - 40) - 20;
                  return (
                    <line
                      key={idx}
                      x1="20"
                      y1={y}
                      x2={svgWidth - 20}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Submitted Line */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={subLinePoints}
                />

                {/* Approved Line */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={appLinePoints}
                />

                {/* Nodes */}
                {trendDataPoints.map((dp, idx) => {
                  const x =
                    (idx / (trendDataPoints.length - 1)) * (svgWidth - 40) + 20;
                  const ySub =
                    svgHeight - (dp.submitted / maxVal) * (svgHeight - 40) - 20;
                  const yApp =
                    svgHeight - (dp.approved / maxVal) * (svgHeight - 40) - 20;

                  return (
                    <g key={idx}>
                      <circle
                        cx={x}
                        cy={ySub}
                        r="3.5"
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={x}
                        cy={yApp}
                        r="3.5"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={x}
                        y={svgHeight - 4}
                        textAnchor="middle"
                        className="text-[9px] fill-slate-400 font-bold"
                      >
                        {dp.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Team Leaderboard (lg:col-span-5) */}
        <Card className="lg:col-span-5 bg-white border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="p-3.5 md:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-purple-600" />
              <span>ผลงานทีมตัดต่อ</span>
            </CardTitle>
            <span className="text-xs font-bold text-slate-500">
              {creatorLeaderboard.length} คน
            </span>
          </CardHeader>
          <CardContent className="p-3 md:p-5 space-y-2.5">
            {creatorLeaderboard.length === 0 ? (
              <div className="py-6 text-center text-slate-400 font-medium text-xs">
                ไม่พบข้อมูลทีมตัดต่อ
              </div>
            ) : (
              creatorLeaderboard.slice(0, 5).map((cr) => {
                const userPct =
                  cr.total > 0 ? Math.round((cr.approved / cr.total) * 100) : 0;

                return (
                  <div
                    key={cr.id}
                    className="p-2 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={cr.name}
                          pictureUrl={cr.pictureUrl}
                          size="w-6 h-6"
                        />
                        <span className="font-bold text-slate-800 text-xs truncate max-w-[120px]">
                          {cr.name}
                        </span>
                      </div>
                      <span className="font-black text-emerald-600 text-xs">
                        {cr.approved}/{cr.total} คลิป ({userPct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${userPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── 4. HIGH-END CLIPS LIST & TABLE (TABLE ON DESKTOP, LIST ON MOBILE) ─── */}
      <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Bar with Search & Status Filter Pills */}
        <CardHeader className="p-3.5 md:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm md:text-base font-bold text-slate-900">
                รายการคลิปทั้งหมด
              </CardTitle>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
                {filteredClips.length} คลิป
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Status Filter Pills (Touch Swipeable) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "ALL", label: "ทั้งหมด" },
                { id: "PENDING_REVIEW", label: "รอตรวจ" },
                { id: "NEEDS_REVISION", label: "สั่งแก้" },
                { id: "APPROVED", label: "อนุมัติ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === tab.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-48 shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="ค้นหาชื่องาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredClips.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <SearchX size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-bold text-sm">
                ไม่พบรายการคลิปที่ตรงตามเงื่อนไข
              </p>
              <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
                ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะด้านบน
              </p>
            </div>
          ) : (
            <>
              {/* 💻 DESKTOP VIEW: CLEAN HIGH-DENSITY DATA TABLE (hidden md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                    <tr>
                      <th className="px-5 py-3.5">ซีรีส์ & ชื่องานคลิป</th>
                      {!isUser && <th className="px-5 py-3.5">ผู้รับผิดชอบ</th>}
                      <th className="px-5 py-3.5">เวลาอัปเดต</th>
                      <th className="px-5 py-3.5 text-center">สถานะ</th>
                      <th className="px-5 py-3.5 text-right pr-6">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs md:text-sm divide-y divide-slate-100">
                    {filteredClips.map((clip) => {
                      const project = clip.project;
                      const episode = clip.episode;
                      const owner = clip.owner;

                      const dateFormatted = clip.updatedAt || clip.createdAt;
                      const dateDisplay = dateFormatted
                        ? format(new Date(dateFormatted), "dd/MM/yyyy HH:mm น.")
                        : "-";

                      return (
                        <tr
                          key={clip.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                                {project?.name || "โปรเจกต์ทั่วไป"}
                              </span>
                              <span className="text-slate-600 text-xs font-semibold">
                                EP.{episode?.episodeNo || 1}
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {clip.name || episode?.name || "คลิปไม่มีชื่อ"}
                            </div>
                          </td>

                          {!isUser && (
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  name={owner?.displayName || "ผู้ใช้"}
                                  pictureUrl={owner?.pictureUrl}
                                />
                                <span className="text-xs font-bold text-slate-800">
                                  {owner?.displayName || "ไม่ระบุชื่อ"}
                                </span>
                              </div>
                            </td>
                          )}

                          <td className="px-5 py-3.5 text-xs font-medium text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock
                                size={13}
                                className="text-slate-400 shrink-0"
                              />
                              <span>{dateDisplay}</span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            <StatusBadge status={clip.status} />
                          </td>

                          <td className="px-5 py-3.5 text-right pr-6">
                            <Link
                              href={`/clips/${clip.id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              ดูรายละเอียด <ChevronRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 📱 MOBILE VIEW: COMPACT SMARTPHONE LIST VIEW (block md:hidden) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredClips.map((clip) => {
                  const project = clip.project;
                  const episode = clip.episode;
                  const owner = clip.owner;

                  const dateFormatted = clip.updatedAt || clip.createdAt;
                  const dateDisplay = dateFormatted
                    ? format(new Date(dateFormatted), "dd/MM/yyyy HH:mm")
                    : "-";

                  return (
                    <div key={clip.id} className="p-3.5 space-y-2.5 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                              {project?.name || "โปรเจกต์ทั่วไป"}
                            </span>
                            <span className="text-slate-600 text-xs font-bold">
                              EP.{episode?.episodeNo || 1}
                            </span>
                          </div>
                          <h3 className="font-bold text-xs md:text-sm text-slate-900 leading-snug">
                            {clip.name || episode?.name || "คลิปไม่มีชื่อ"}
                          </h3>
                        </div>
                        <StatusBadge status={clip.status} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                        {!isUser && (
                          <div className="flex items-center gap-1.5">
                            <UserAvatar
                              name={owner?.displayName || "ผู้ใช้"}
                              pictureUrl={owner?.pictureUrl}
                              size="w-5 h-5"
                            />
                            <span className="font-semibold text-slate-800 text-[11px]">
                              {owner?.displayName || "ไม่ระบุ"}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                          <Clock size={11} />
                          <span>{dateDisplay}</span>
                        </div>
                      </div>

                      <Link href={`/clips/${clip.id}`} className="block pt-0.5">
                        <Button className="w-full bg-blue-50/70 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs py-2 rounded-xl transition-all border border-blue-200/80 cursor-pointer shadow-2xs">
                          ดูรายละเอียด{" "}
                          <ChevronRight size={13} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
              
              {/* Load More Button */}
              {hasMore && filteredClips.length > 0 && (
                <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/50">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full md:w-auto min-w-[200px] border-slate-200 shadow-xs bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
                  >
                    {isLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่มเติม (Load More)"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
