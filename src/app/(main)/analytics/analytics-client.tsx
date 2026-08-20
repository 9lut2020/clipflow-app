"use client";

import { useState } from "react";
import { Clip, Project, User } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  BarChart3,
  Users,
  Filter,
  Layers,
  Zap,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  UserX,
  FolderX,
  ServerCrash,
} from "lucide-react";

interface AnalyticsClientProps {
  clips: Clip[];
  projects: Project[];
  users: User[];
  dailyMetrics?: any[];
}

export function AnalyticsClient({
  clips,
  projects,
  users,
  dailyMetrics = [],
}: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState<
    "7d" | "30d" | "this_month" | "all"
  >("all");
  const [activeTab, setActiveTab] = useState<"overview" | "system">("overview");

  // Filter clips based on selected time range
  const now = new Date();
  const filteredClips = clips.filter((c) => {
    if (timeRange === "all") return true;
    const clipDate = new Date(c.createdAt || c.updatedAt);
    const diffDays =
      (now.getTime() - clipDate.getTime()) / (1000 * 60 * 60 * 24);

    if (timeRange === "7d") return diffDays <= 7;
    if (timeRange === "30d") return diffDays <= 30;
    if (timeRange === "this_month") {
      return (
        clipDate.getMonth() === now.getMonth() &&
        clipDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  const totalClips = filteredClips.length;
  const approvedClips = filteredClips.filter((c) => c.status === "APPROVED");
  const revisionClips = filteredClips.filter(
    (c) => c.status === "NEEDS_REVISION",
  );
  const pendingClips = filteredClips.filter(
    (c) => c.status === "PENDING_REVIEW",
  );

  // REAL First-Pass Rate: % of clips approved
  const firstPassRate =
    totalClips > 0 ? Math.round((approvedClips.length / totalClips) * 100) : 0;
  const revisionRate =
    totalClips > 0 ? Math.round((revisionClips.length / totalClips) * 100) : 0;

  // REAL Average Turnaround Days computed from actual DB timestamps
  const approvedWithDates = approvedClips.filter(
    (c) => c.createdAt && c.updatedAt,
  );
  let totalDaysSum = 0;
  approvedWithDates.forEach((c) => {
    const start = new Date(c.createdAt).getTime();
    const end = new Date(c.updatedAt).getTime();
    const diffDays = Math.max(0.1, (end - start) / (1000 * 60 * 60 * 24));
    totalDaysSum += diffDays;
  });
  const avgTurnaroundDays =
    approvedWithDates.length > 0
      ? (totalDaysSum / approvedWithDates.length).toFixed(1)
      : "0.0";

  // Production Trend Graph Points (8 intervals)
  const trendPointsCount = 8;
  const trendDataPoints: {
    label: string;
    submitted: number;
    approved: number;
  }[] = [];
  for (let i = trendPointsCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * (timeRange === "30d" ? 4 : 2));
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
  const svgWidth = 600;
  const svgHeight = 180;
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

  // REAL Creator Leaderboard from actual Database Users & Clips
  const creatorStatsMap = new Map<
    string,
    {
      id: string;
      name: string;
      pictureUrl?: string | null;
      total: number;
      approved: number;
      needsRevision: number;
    }
  >();

  // Initialize map with active users
  users.forEach((u) => {
    creatorStatsMap.set(u.id, {
      id: u.id,
      name: u.displayName,
      pictureUrl: u.pictureUrl,
      total: 0,
      approved: 0,
      needsRevision: 0,
    });
  });

  // Calculate stats from actual clips
  filteredClips.forEach((clip) => {
    const ownerId = clip.owner?.id || clip.ownerId;
    if (!ownerId) return;

    if (!creatorStatsMap.has(ownerId)) {
      creatorStatsMap.set(ownerId, {
        id: ownerId,
        name: clip.owner?.displayName || "ผู้ใช้ระบบ",
        pictureUrl: clip.owner?.pictureUrl,
        total: 0,
        approved: 0,
        needsRevision: 0,
      });
    }

    const stat = creatorStatsMap.get(ownerId)!;
    stat.total += 1;
    if (clip.status === "APPROVED") stat.approved += 1;
    if (clip.status === "NEEDS_REVISION") stat.needsRevision += 1;
  });

  const creatorLeaderboard = Array.from(creatorStatsMap.values())
    .filter((c) => c.total > 0)
    .sort((a, b) => b.approved - a.approved);

  const UserAvatar = ({
    name,
    pictureUrl,
    size = "w-8 h-8",
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
        className={`${size} rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 shadow-xs text-xs`}
      >
        {name[0] || "?"}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-full mx-auto pb-16">
      {/* ─── 1. EXECUTIVE HEADER & TIME SLICER ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 flex items-center gap-2">
              <BarChart3 className="text-blue-600 shrink-0 w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span>ศูนย์วิเคราะห์สถิติการผลิตสื่อ</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
            วิเคราะห์ดัชนีชี้วัดหลัก (KPI) ประสิทธิภาพทีมตัดต่อและความคืบหน้ารายซีรีส์
          </p>
        </div>

        {/* Time Slicers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
          {[
            { id: "7d", label: "7 วันล่าสุด" },
            { id: "this_month", label: "เดือนนี้" },
            { id: "30d", label: "30 วันล่าสุด" },
            { id: "all", label: "ข้อมูลทั้งหมด" },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeRange(tf.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                timeRange === tf.id
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* ─── TABS ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2 text-sm font-bold transition-all ${
            activeTab === "overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Executive Overview
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`pb-2 text-sm font-bold transition-all ${
            activeTab === "system"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Funnel & System Health
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* ─── 2. 4 EXECUTIVE KPI GAUGE CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* KPI 1: First-Pass Approval Rate */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                First-Pass Approval Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700 tracking-tight">
                {firstPassRate}%
              </span>
              <span className="text-xs font-bold text-emerald-600">
                ({approvedClips.length} คลิปผ่าน)
              </span>
            </div>
            {/* Visual Gauge Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${firstPassRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Avg. Turnaround Time */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Avg. Turnaround Time
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-sky-700 tracking-tight">
                {avgTurnaroundDays}
              </span>
              <span className="text-xs font-bold text-sky-600">วัน / คลิป</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              เวลาเฉลี่ยตั้งแต่ส่งจนอนุมัติ
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Total Production Output */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                ปริมาณการผลิตสื่อรวม
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {totalClips}
              </span>
              <span className="text-xs font-bold text-blue-600">คลิปในคิว</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              คำนวณตามช่วงเวลาที่เลือก
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Revision Bottleneck Alert */}
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                อัตราการสั่งแก้ไข (Revision)
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-700 tracking-tight">
                {revisionClips.length}
              </span>
              <span className="text-xs font-bold text-rose-600">
                ({revisionRate}% สั่งแก้)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              รายการที่ต้องการปรับปรุงคุณภาพ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── 3. PRODUCTION THROUGHPUT TREND GRAPH ────────────────────────────── */}
      <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              <span>
                แนวโน้มปริมาณการผลิตและการอนุมัติวิดีโอ (Production Throughput
                Trend)
              </span>
            </CardTitle>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-1 bg-blue-500 rounded-full" />
              <span>ยอดส่งคลิป</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-1 bg-emerald-500 rounded-full" />
              <span>ยอดผ่านอนุมัติ</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 md:h-56 min-w-[320px] overflow-visible"
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
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Submitted Polyline */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={subLinePoints}
              />

              {/* Approved Polyline */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={appLinePoints}
              />

              {/* Data Nodes & Labels */}
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
                      r="4"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <circle
                      cx={x}
                      cy={yApp}
                      r="4"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
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

      {/* ─── 4. DUAL SECTION: TEAM MATRIX & SERIES PROGRESS ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* TEAM LEADERBOARD & QUALITY MATRIX (lg:col-span-7) */}
        <Card className="lg:col-span-7 bg-white border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="p-4 md:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-purple-600" />
              <span>
                อันดับและประสิทธิภาพทีมตัดต่อ (Team Productivity Matrix)
              </span>
            </CardTitle>
            <span className="text-xs font-bold text-slate-500">
              {creatorLeaderboard.length} คน
            </span>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {creatorLeaderboard.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <UserX size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-bold text-sm">ไม่พบข้อมูลนักตัดต่อ</p>
                <p className="text-slate-400 text-xs mt-1">ยังไม่มีผู้ใช้ใดที่เคยส่งคลิปในระบบ</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">นักตัดต่อ</th>
                    <th className="px-5 py-3.5 text-center">คลิปที่ส่ง</th>
                    <th className="px-5 py-3.5 text-center">ผ่านอนุมัติ</th>
                    <th className="px-5 py-3.5 text-center">อัตราสำเร็จ (%)</th>
                    <th className="px-5 py-3.5 text-right pr-6">
                      รางวัลเกียรติยศ
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm divide-y divide-slate-100">
                  {creatorLeaderboard.map((cr, idx) => {
                    const passRate =
                      cr.total > 0
                        ? Math.round((cr.approved / cr.total) * 100)
                        : 0;

                    return (
                      <tr
                        key={cr.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar
                              name={cr.name}
                              pictureUrl={cr.pictureUrl}
                            />
                            <span className="font-bold text-slate-800">
                              {cr.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center font-bold text-slate-700">
                          {cr.total}
                        </td>
                        <td className="px-5 py-3.5 text-center font-bold text-emerald-600">
                          {cr.approved}
                        </td>
                        <td className="px-5 py-3.5 text-center font-black text-slate-900">
                          {passRate}%
                        </td>
                        <td className="px-5 py-3.5 text-right pr-6">
                          {idx === 0 && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                              🏆 Top Performer
                            </span>
                          )}
                          {idx === 1 && (
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-200">
                              ⚡ Speed Master
                            </span>
                          )}
                          {idx >= 2 && passRate >= 80 && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                              🎯 Quality Master
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* SERIES COMPLETION & PROGRESS PREDICTOR (lg:col-span-5) */}
        <Card className="lg:col-span-5 bg-white border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="p-4 md:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <span>ความคืบหน้ารายซีรีส์ (Series Completion)</span>
            </CardTitle>
            <span className="text-xs font-bold text-slate-500">
              {projects.length} โปรเจกต์
            </span>
          </CardHeader>

          <CardContent className="p-4 md:p-5 space-y-4">
            {projects.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <FolderX size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-bold text-sm">ไม่พบซีรีส์ในระบบ</p>
                <p className="text-slate-400 text-xs mt-1">รอการสร้างโปรเจกต์ใหม่จากผู้ดูแล</p>
              </div>
            ) : (
              projects.slice(0, 5).map((proj) => {
                const projClips = filteredClips.filter(
                  (c) => c.project?.id === proj.id,
                );
                const approvedCount = projClips.filter(
                  (c) => c.status === "APPROVED",
                ).length;
                const pct =
                  projClips.length > 0
                    ? Math.round((approvedCount / projClips.length) * 100)
                    : 0;

                return (
                  <div
                    key={proj.id}
                    className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">
                        {proj.name}
                      </span>
                      <span className="font-black text-blue-600">
                        {approvedCount}/{projClips.length} คลิป ({pct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* FUNNEL CHART */}
          <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target size={18} className="text-blue-600" />
                <span>Production Funnel (คลิปในระบบ)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { label: "ร่าง (DRAFT)", count: filteredClips.filter(c => c.status === "DRAFT").length, color: "bg-slate-300" },
                  { label: "รอตรวจ (PENDING_REVIEW)", count: pendingClips.length, color: "bg-blue-400" },
                  { label: "ตรวจแล้วแก้ไข (NEEDS_REVISION)", count: revisionClips.length, color: "bg-rose-400" },
                  { label: "ผ่านอนุมัติ (APPROVED)", count: approvedClips.length, color: "bg-emerald-500" },
                ].map((step, idx, arr) => {
                  const max = arr[0].count || 1;
                  const pct = Math.round((step.count / max) * 100) || 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{step.label}</span>
                        <span>{step.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className={`h-full ${step.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* SYSTEM HEALTH */}
          <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>System Health & Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-sm">
              <p className="text-slate-500 mb-4">ข้อมูลเหตุการณ์จาก Analytics Backend</p>
              {dailyMetrics.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <ServerCrash size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-bold text-sm">ยังไม่มีข้อมูล Metrics</p>
                  <p className="text-slate-400 text-xs mt-1">สถิติระบบจะถูกคำนวณและสรุปในเวลาเที่ยงคืน</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {dailyMetrics.map((m, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-700">{m.metricName}</span>
                        <span className="text-xs text-slate-500 ml-2">({m.dimension})</span>
                      </div>
                      <span className="font-black text-blue-600">{m.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
