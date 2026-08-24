import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clip } from "@/types/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ChevronRight,
  TrendingUp,
  Flame,
  FileVideo,
  ArrowLeft,
} from "lucide-react";
import { TaskAccordionSection } from "./task-accordion";
import { ReviewerTasksView } from "./reviewer-tasks-view";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const currentUser = session.user;
  const isUser = currentUser.role === "USER";

  // Fetch clips (My Tasks for Users, All for Admins/Reviewers)
  const endpoint = isUser ? `/clips?ownerId=${currentUser.id}` : "/clips";
  const { data: clipsData } = await apiServer.get<Clip[]>(endpoint);
  const clips = clipsData || [];

  // Grouping by status
  const draftClips = clips.filter((c) => c.status === "DRAFT");
  const inProgressClips = clips.filter(
    (c) => c.status === "PENDING_REVIEW" || c.status === "IN_REVIEW",
  );
  const revisionClips = clips.filter((c) => c.status === "NEEDS_REVISION");
  const approvedClips = clips.filter((c) => c.status === "APPROVED");

  // Metrics
  const totalClips = clips.length;
  const completionPercentage =
    totalClips > 0 ? Math.round((approvedClips.length / totalClips) * 100) : 0;

  // Grouping workload by assignee for admin/reviewer sidebar
  const assigneeWorkloadMap = new Map<
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

  clips.forEach((clip) => {
    const ownerId = clip.owner?.id || clip.ownerId || "unassigned";
    const name = clip.owner?.displayName || "ไม่ระบุชื่อ";
    const pictureUrl = clip.owner?.pictureUrl;

    if (!assigneeWorkloadMap.has(ownerId)) {
      assigneeWorkloadMap.set(ownerId, {
        id: ownerId,
        name,
        pictureUrl,
        total: 0,
        approved: 0,
        needsRevision: 0,
      });
    }

    const item = assigneeWorkloadMap.get(ownerId)!;
    item.total += 1;
    if (clip.status === "APPROVED") item.approved += 1;
    if (clip.status === "NEEDS_REVISION") item.needsRevision += 1;
  });

  const assigneeWorkloads = Array.from(assigneeWorkloadMap.values()).sort(
    (a, b) => b.total - a.total,
  );

  // User Avatar Component
  const UserAvatar = ({
    name,
    pictureUrl,
    size = "w-6 h-6",
    textSize = "text-[10px]",
  }: {
    name: string;
    pictureUrl?: string | null;
    size?: string;
    textSize?: string;
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
        className={`${size} rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 shadow-xs ${textSize}`}
      >
        {name[0] || "?"}
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-24 lg:pb-8 max-w-full mx-auto">
      {/* Top Full-Width Header Title Bar - Compact Sleek Typography */}
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                {isUser ? "งานของฉัน" : "แผงควบคุมและภาพรวมงาน"}
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                {isUser
                  ? "รายการคลิปที่คุณรับผิดชอบ ติดตามสถานะและส่งงาน"
                  : "ภาพรวมคลิปทั้งหมด สถิติการส่งงาน และภาระงานของทีม"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border-blue-100/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-2xl md:text-3xl font-black text-blue-700 tracking-tight">
                {totalClips}
              </span>
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wide mt-0.5">
                คลิปทั้งหมด
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <FileVideo size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50/80 to-red-50/40 border-rose-100/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-2xl md:text-3xl font-black text-rose-700 tracking-tight">
                {revisionClips.length}
              </span>
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wide mt-0.5">
                ต้องแก้ไขด่วน
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertTriangle size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-50/40 border-amber-100/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-2xl md:text-3xl font-black text-amber-700 tracking-tight">
                {inProgressClips.length}
              </span>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mt-0.5">
                รอตรวจ / ดำเนินการ
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border-emerald-100/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight">
                {approvedClips.length}
              </span>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide mt-0.5">
                อนุมัติแล้ว
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar Overview */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="text-xs font-bold text-slate-700">
              ความคืบหน้าการทำงานรวม
            </span>
          </div>
          <span className="text-xs font-black text-blue-700">
            {approvedClips.length} / {totalClips} คลิปผ่านอนุมัติ (
            {completionPercentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Main 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Pipeline & Drawer Accordions (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {isUser ? (
            <>
              {/* Drawer 1: Needs Revision */}
              <TaskAccordionSection
                title="ต้องแก้ไข"
                iconType="alert"
                clips={revisionClips}
                colorClass="text-rose-500"
                badgeBg="bg-rose-100 text-rose-700"
                emptyText="ไม่มีงานที่ต้องแก้ไข"
                defaultOpen={true}
                isUser={isUser}
              />

              {/* Drawer 2: In Progress / Pending Review */}
              <TaskAccordionSection
                title="กำลังดำเนินการ / รอตรวจ"
                iconType="clock"
                clips={inProgressClips}
                colorClass="text-amber-500"
                badgeBg="bg-amber-100 text-amber-700"
                emptyText="ไม่มีงานที่รอตรวจอยู่ในขณะนี้"
                defaultOpen={true}
                isUser={isUser}
              />

              {/* Drawer 3: Draft / To Do */}
              <TaskAccordionSection
                title="งานใหม่ / รอดำเนินการ"
                iconType="play"
                clips={draftClips}
                colorClass="text-blue-500"
                badgeBg="bg-blue-100 text-blue-700"
                emptyText="ไม่มีงานใหม่ในระบบ"
                defaultOpen={false}
                isUser={isUser}
              />

              {/* Drawer 4: Approved */}
              <TaskAccordionSection
                title="อนุมัติผ่านแล้ว"
                iconType="check"
                clips={approvedClips}
                colorClass="text-emerald-500"
                badgeBg="bg-emerald-100 text-emerald-700"
                emptyText="ยังไม่มีงานที่ได้รับการอนุมัติ"
                defaultOpen={false}
                isUser={isUser}
              />
            </>
          ) : (
            <ReviewerTasksView clips={clips} />
          )}
        </div>

        {/* RIGHT COLUMN: Admin Sidebar & Workload Analytics (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Urgent Revision Alert Widget */}
          {revisionClips.length > 0 && (
            <Card className="border-rose-200 bg-rose-50/40 shadow-xs overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-2">
                  <Flame className="text-rose-500 animate-bounce" size={18} />
                  รายการต้องแก้ไขเร่งด่วน ({revisionClips.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                {revisionClips.slice(0, 4).map((clip) => (
                  <Link
                    key={clip.id}
                    href={`/clips/${clip.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-rose-100 hover:border-rose-300 transition-colors group"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-xs font-bold text-slate-800 truncate group-hover:text-rose-600 transition-colors">
                        {clip.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        โดย {clip.owner?.displayName || "ไม่ระบุ"}
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-rose-400 group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Workload by Assignee Card */}
          <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="text-blue-600" size={18} />
                  <span>สรุปภาระงานรายบุคคล</span>
                </div>
                <span className="text-xs font-normal text-slate-600">
                  {assigneeWorkloads.length} คน
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 divide-y divide-slate-100">
              {assigneeWorkloads.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">
                  ไม่พบข้อมูลผู้รับผิดชอบงาน
                </p>
              ) : (
                assigneeWorkloads.map((user) => {
                  const pct =
                    user.total > 0
                      ? Math.round((user.approved / user.total) * 100)
                      : 0;

                  return (
                    <div key={user.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar
                            name={user.name}
                            pictureUrl={user.pictureUrl}
                            size="w-7 h-7"
                            textSize="text-xs"
                          />
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {user.name}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-600 shrink-0">
                          {user.approved}/{user.total} คลิป ({pct}%)
                        </div>
                      </div>

                      {/* Workload Mini Bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${pct}%` }}
                        />
                        {user.needsRevision > 0 && (
                          <div
                            className="bg-rose-500 h-full"
                            style={{
                              width: `${(user.needsRevision / user.total) * 100}%`,
                            }}
                          />
                        )}
                      </div>

                      {user.needsRevision > 0 && (
                        <div className="mt-1 text-[10px] font-semibold text-rose-600">
                          ⚠️ มี {user.needsRevision} คลิปต้องแก้ไข
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
