"use client";

import { useState } from "react";
import { Clip, Project, User } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Video,
  User as UserIcon,
  Filter,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface DashboardChartsProps {
  clips: Clip[];
  projects: Project[];
  users?: User[];
}

export function DashboardCharts({ clips, projects, users = [] }: DashboardChartsProps) {
  // Advanced Filter states
  const [dateRange, setDateRange] = useState<"7d" | "this_month" | "30d" | "all">("30d");
  const [selectedUserId, setSelectedUserId] = useState<string>("ALL");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");

  // Filter clips by Date Range, Creator, and Project
  const now = new Date();
  const filteredClips = clips.filter((c) => {
    // 1. Date Range Filter
    const clipDate = new Date(c.createdAt || c.updatedAt);
    if (dateRange === "7d") {
      const diffDays = (now.getTime() - clipDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) return false;
    } else if (dateRange === "this_month") {
      if (
        clipDate.getMonth() !== now.getMonth() ||
        clipDate.getFullYear() !== now.getFullYear()
      ) {
        return false;
      }
    } else if (dateRange === "30d") {
      const diffDays = (now.getTime() - clipDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 30) return false;
    }

    // 2. Creator Filter
    if (selectedUserId !== "ALL") {
      if (c.owner?.id !== selectedUserId && c.ownerId !== selectedUserId) {
        return false;
      }
    }

    // 3. Project Filter
    if (selectedProjectId !== "ALL") {
      if (c.project?.id !== selectedProjectId) {
        return false;
      }
    }

    return true;
  });

  const total = filteredClips.length;
  const approvedCount = filteredClips.filter((c) => c.status === "APPROVED").length;
  const revisionCount = filteredClips.filter((c) => c.status === "NEEDS_REVISION").length;
  const pendingCount = filteredClips.filter((c) => c.status === "PENDING_REVIEW").length;
  const inReviewCount = filteredClips.filter((c) => c.status === "IN_REVIEW").length;

  const approvedPct = total > 0 ? Math.round((approvedCount / total) * 100) : 0;
  const revisionPct = total > 0 ? Math.round((revisionCount / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pendingCount / total) * 100) : 0;
  const inReviewPct = total > 0 ? Math.round((inReviewCount / total) * 100) : 0;

  // Generate Trend Line Data (Last 7 Points)
  const trendDaysCount = dateRange === "7d" ? 7 : dateRange === "30d" ? 10 : 7;
  const trendDataPoints: { label: string; submitted: number; approved: number }[] = [];

  for (let i = trendDaysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - (dateRange === "30d" ? i * 3 : i));
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

  // Calculate SVG line path points
  const svgWidth = 500;
  const svgHeight = 160;
  const maxVal = Math.max(
    ...trendDataPoints.map((dp) => Math.max(dp.submitted, dp.approved)),
    5
  );

  const subPoints = trendDataPoints
    .map((dp, idx) => {
      const x = (idx / (trendDataPoints.length - 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - (dp.submitted / maxVal) * (svgHeight - 40) - 20;
      return `${x},${y}`;
    })
    .join(" ");

  const appPoints = trendDataPoints
    .map((dp, idx) => {
      const x = (idx / (trendDataPoints.length - 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - (dp.approved / maxVal) * (svgHeight - 40) - 20;
      return `${x},${y}`;
    })
    .join(" ");

  // Individual creator calculation
  const creatorStatsMap = new Map<
    string,
    {
      id: string;
      name: string;
      pictureUrl?: string | null;
      total: number;
      approved: number;
      revision: number;
      pending: number;
    }
  >();

  clips.forEach((c) => {
    const ownerId = c.owner?.id || c.ownerId || "unassigned";
    const name = c.owner?.displayName || "ไม่ระบุผู้ตัดต่อ";
    const pictureUrl = c.owner?.pictureUrl;

    if (!creatorStatsMap.has(ownerId)) {
      creatorStatsMap.set(ownerId, {
        id: ownerId,
        name,
        pictureUrl,
        total: 0,
        approved: 0,
        revision: 0,
        pending: 0,
      });
    }

    const stat = creatorStatsMap.get(ownerId)!;
    stat.total += 1;
    if (c.status === "APPROVED") stat.approved += 1;
    if (c.status === "NEEDS_REVISION") stat.revision += 1;
    if (c.status === "PENDING_REVIEW" || c.status === "IN_REVIEW") stat.pending += 1;
  });

  const creatorList = Array.from(creatorStatsMap.values()).sort(
    (a, b) => b.approved - a.approved
  );

  const selectedUserObj =
    selectedUserId !== "ALL"
      ? creatorStatsMap.get(selectedUserId) || users.find((u) => u.id === selectedUserId)
      : null;

  const selectedUserName = selectedUserObj
    ? "displayName" in selectedUserObj
      ? selectedUserObj.displayName
      : selectedUserObj.name
    : "ทุกคน";

  const UserAvatar = ({
    name,
    pictureUrl,
    size = "w-7 h-7",
  }: {
    name: string;
    pictureUrl?: string | null;
    size?: string;
  }) => {
    if (pictureUrl) {
      return (
        <img
          src={pictureUrl}
          alt={name}
          className={`${size} rounded-full object-cover border border-slate-200 shrink-0 shadow-xs`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 shadow-xs text-[10px]`}
      >
        {name[0] || "?"}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ─── ADVANCED FILTER CONTROL BAR (DATE RANGE + CREATOR + PROJECT) ───── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Date Range Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Calendar size={16} className="text-blue-600 shrink-0 mr-1" />
          {[
            { id: "7d", label: "7 วันล่าสุด" },
            { id: "this_month", label: "เดือนนี้" },
            { id: "30d", label: "30 วันล่าสุด" },
            { id: "all", label: "ทั้งหมด" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDateRange(item.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateRange === item.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Creator & Project Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Creator Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <UserIcon size={14} className="text-slate-400" />
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">👤 ผู้ตัดต่อ: ทุกคน</option>
              {creatorList.map((cr) => (
                <option key={cr.id} value={cr.id}>
                  👤 {cr.name} ({cr.approved}/{cr.total} คลิป)
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <BarChart3 size={14} className="text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">📁 ซีรีส์: ทุกโปรเจกต์</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── 1. PRODUCTION TREND LINE CHART (SVG LINE GRAPH) ───────────────── */}
      <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              <span>กราฟแนวโน้มการผลิตและอนุมัติสื่อ (Production Trend Line Chart)</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              เปรียบเทียบจำนวนคลิปที่ส่งเข้ามากับคลิปที่ผ่านอนุมัติจริงตามเวลา ({dateRange === "7d" ? "7 วันล่าสุด" : dateRange === "this_month" ? "เดือนนี้" : dateRange === "30d" ? "30 วันล่าสุด" : "ข้อมูลทั้งหมด"})
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-bold shrink-0">
            <div className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-1 bg-blue-500 rounded-full" />
              <span>ส่งคลิปเข้ามา</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-1 bg-emerald-500 rounded-full" />
              <span>ผ่านอนุมัติ</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 sm:h-52 overflow-visible"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = svgHeight - ratio * (svgHeight - 40) - 20;
                return (
                  <line
                    key={idx}
                    x1="20"
                    y1={y}
                    x2={svgWidth - 20}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Line 1: Submitted Clips (Blue) */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={subPoints}
              />

              {/* Line 2: Approved Clips (Green) */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={appPoints}
              />

              {/* Data Nodes & Labels */}
              {trendDataPoints.map((dp, idx) => {
                const x = (idx / (trendDataPoints.length - 1)) * (svgWidth - 40) + 20;
                const ySub = svgHeight - (dp.submitted / maxVal) * (svgHeight - 40) - 20;
                const yApp = svgHeight - (dp.approved / maxVal) * (svgHeight - 40) - 20;

                return (
                  <g key={idx}>
                    {/* Submitted Node */}
                    <circle cx={x} cy={ySub} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                    {/* Approved Node */}
                    <circle cx={x} cy={yApp} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    {/* Date Label */}
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

      {/* ─── 2. STATUS DISTRIBUTION & CREATOR BREAKDOWN ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* CHART: Status Distribution Bar (lg:col-span-6) */}
        <Card className="lg:col-span-6 bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="p-4 md:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart size={18} className="text-blue-600" />
              <span>
                {selectedUserId !== "ALL"
                  ? `สัดส่วนผลงานของ: ${selectedUserName}`
                  : "สัดส่วนสถานะงานตัดต่อตามช่วงเวลา"}
              </span>
            </CardTitle>
            <span className="text-xs font-bold text-slate-500">
              รวม {total} คลิป
            </span>
          </CardHeader>
          <CardContent className="p-4 md:p-5 space-y-4">
            {/* Multi-segmented Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-4 rounded-xl overflow-hidden flex shadow-2xs">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${approvedPct}%` }}
                  title={`ผ่านอนุมัติ ${approvedPct}%`}
                />
                <div
                  className="bg-sky-500 h-full transition-all duration-500"
                  style={{ width: `${inReviewPct}%` }}
                  title={`กำลังตรวจ ${inReviewPct}%`}
                />
                <div
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{ width: `${pendingPct}%` }}
                  title={`รอตรวจ ${pendingPct}%`}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${revisionPct}%` }}
                  title={`สั่งแก้ไข ${revisionPct}%`}
                />
              </div>
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  ผ่านอนุมัติ
                </div>
                <div className="text-lg font-black text-emerald-700 mt-1">
                  {approvedPct}% <span className="text-xs font-normal text-slate-500">({approvedCount})</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                  <Video size={14} className="text-sky-600 shrink-0" />
                  กำลังตรวจ
                </div>
                <div className="text-lg font-black text-sky-700 mt-1">
                  {inReviewPct}% <span className="text-xs font-normal text-slate-500">({inReviewCount})</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Clock size={14} className="text-amber-600 shrink-0" />
                  รอตรวจ
                </div>
                <div className="text-lg font-black text-amber-700 mt-1">
                  {pendingPct}% <span className="text-xs font-normal text-slate-500">({pendingCount})</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <AlertCircle size={14} className="text-rose-600 shrink-0" />
                  สั่งแก้ไข
                </div>
                <div className="text-lg font-black text-rose-700 mt-1">
                  {revisionPct}% <span className="text-xs font-normal text-slate-500">({revisionCount})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CHART: Creator Comparative Breakdown (lg:col-span-6) */}
        <Card className="lg:col-span-6 bg-white border-slate-200/80 shadow-xs">
          <CardHeader className="p-4 md:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-purple-600" />
              <span>สถิติเปรียบเทียบนักตัดต่อแต่ละคน (Individual Breakdown)</span>
            </CardTitle>
            <span className="text-xs font-bold text-slate-500">
              {creatorList.length} คน
            </span>
          </CardHeader>
          <CardContent className="p-4 md:p-5 space-y-3">
            {creatorList.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                ไม่พบข้อมูลนักตัดต่อ
              </div>
            ) : (
              creatorList.slice(0, 5).map((cr) => {
                const userPct =
                  cr.total > 0 ? Math.round((cr.approved / cr.total) * 100) : 0;
                const isSelected = selectedUserId === cr.id;

                return (
                  <div
                    key={cr.id}
                    onClick={() => setSelectedUserId(cr.id)}
                    className={`space-y-1 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-purple-50/80 border-purple-300 ring-1 ring-purple-200"
                        : "bg-slate-50/70 border-slate-200/60 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserAvatar name={cr.name} pictureUrl={cr.pictureUrl} />
                        <span className="font-bold text-slate-800 truncate max-w-[150px]">
                          {cr.name}
                        </span>
                      </div>
                      <span className="font-black text-emerald-600">
                        ผ่านอนุมัติ {cr.approved}/{cr.total} คลิป ({userPct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
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
    </div>
  );
}
