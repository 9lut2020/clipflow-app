"use client";

import { useState } from "react";
import { useAuditLogs, useAuditLogsSummary } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  Search,
  FilterX,
  AlertCircle,
  History,
  Activity,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { AuditLog } from "@/types/api";

// Assuming we have Sheet from Shadcn
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE_CLIP: {
    label: "สร้างคลิป",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  SUBMIT_CLIP: {
    label: "ส่งคลิป",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  START_REVIEW: {
    label: "เริ่มตรวจ",
    color: "bg-sky-100 text-sky-800 border-sky-200",
  },
  REVIEW_CLIP: {
    label: "บันทึกผลตรวจ",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  REQUEST_REVISION: {
    label: "สั่งแก้ไข",
    color: "bg-rose-100 text-rose-800 border-rose-200",
  },
  RESUBMIT_CLIP: {
    label: "ส่งแก้ไข",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  APPROVE_CLIP: {
    label: "อนุมัติ",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  CANCEL_CLIP: {
    label: "ยกเลิก",
    color: "bg-slate-100 text-slate-800 border-slate-300",
  },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "ร่าง", color: "bg-slate-100 text-slate-600" },
  PENDING_REVIEW: { label: "รอตรวจ", color: "bg-amber-100 text-amber-700" },
  IN_REVIEW: { label: "กำลังตรวจ", color: "bg-sky-100 text-sky-700" },
  NEEDS_REVISION: { label: "สั่งแก้ไข", color: "bg-rose-100 text-rose-700" },
  RESUBMITTED: {
    label: "ส่งแก้ไขใหม่",
    color: "bg-orange-100 text-orange-700",
  },
  APPROVED: { label: "ผ่าน", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "ยกเลิก", color: "bg-slate-100 text-slate-600" },
};

export function AuditLogsClient() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: summary, isLoading: isLoadingSummary } = useAuditLogsSummary();
  const {
    data: logs,
    meta,
    isLoading,
    isError,
  } = useAuditLogs({
    page,
    limit: 20,
    action: actionFilter || undefined,
  });

  const handleNextPage = () => {
    if (meta && page < meta.totalPages) setPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">
                เหตุการณ์ทั้งหมด
              </p>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-black text-slate-900">
                  {summary?.totalLogs || 0}
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">
                กิจกรรมวันนี้
              </p>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-black text-emerald-700">
                  {summary?.todayLogs || 0}
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, คลิป..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none"
        >
          <option value="">ทุกการกระทำ (All Actions)</option>
          {Object.entries(ACTION_LABELS).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label} ({key})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Main Data Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {isError ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <AlertCircle size={32} className="text-rose-400 mb-3" />
              <p className="text-slate-700 font-bold">
                ไม่สามารถโหลดข้อมูลประวัติได้
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <FilterX size={32} className="text-slate-400 mb-3" />
              <p className="text-slate-500 font-bold">
                ไม่พบประวัติที่ตรงกับเงื่อนไข
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-slate-400 whitespace-nowrap">
                      เวลา
                    </th>
                    <th className="px-5 py-3 whitespace-nowrap">
                      ผู้ดำเนินการ
                    </th>
                    <th className="px-5 py-3 whitespace-nowrap">การกระทำ</th>
                    <th className="px-5 py-3 whitespace-nowrap">
                      เป้าหมาย (คลิป)
                    </th>
                    <th className="px-5 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const actionInfo = ACTION_LABELS[log.action] || {
                      label: log.action,
                      color: "bg-slate-100",
                    };
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                          {format(new Date(log.createdAt), "d MMM yy, HH:mm", {
                            locale: th,
                          })}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {log.user ? (
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                name={log.user.displayName}
                                pictureUrl={log.user.pictureUrl}
                                size="w-6 h-6"
                              />
                              <span className="font-bold text-slate-700">
                                {log.user.displayName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">
                              Unknown
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${actionInfo.color}`}
                          >
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]">
                            {log.clip?.name || "ไม่ระบุ"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-400">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-200 hover:text-slate-700"
                          >
                            <Eye size={16} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              หน้า {meta.page} จาก {meta.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
                className="h-8 px-2"
              >
                <ChevronLeft size={16} /> กลับ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === meta.totalPages}
                className="h-8 px-2"
              >
                ถัดไป <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 4. Detail Slide-out Sheet */}
      <Sheet
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <ShieldCheck className="text-blue-600" />
              รายละเอียดเหตุการณ์
            </SheetTitle>
            <SheetDescription>
              {selectedLog &&
                format(
                  new Date(selectedLog.createdAt),
                  "dd MMMM yyyy เวลา HH:mm:ss น.",
                  { locale: th },
                )}
            </SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* User Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <UserAvatar
                  name={selectedLog.user?.displayName || "?"}
                  pictureUrl={selectedLog.user?.pictureUrl}
                  size="w-10 h-10"
                />
                <div>
                  <p className="font-bold text-slate-900">
                    {selectedLog.user?.displayName || "Unknown User"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Role: {selectedLog.user?.role || "N/A"}
                  </p>
                </div>
              </div>

              {/* Action Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                  การกระทำ
                </h4>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold border ${ACTION_LABELS[selectedLog.action]?.color || "bg-slate-100"}`}
                  >
                    {ACTION_LABELS[selectedLog.action]?.label ||
                      selectedLog.action}
                  </span>
                  <span className="text-sm text-slate-400 font-mono">
                    ({selectedLog.action})
                  </span>
                </div>
              </div>

              {/* Status Change Flow */}
              {(selectedLog.oldStatus || selectedLog.newStatus) && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                    การเปลี่ยนสถานะ
                  </h4>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    {selectedLog.oldStatus ? (
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${STATUS_LABELS[selectedLog.oldStatus]?.color || "bg-slate-100"}`}
                      >
                        {STATUS_LABELS[selectedLog.oldStatus]?.label ||
                          selectedLog.oldStatus}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        ไม่มีสถานะเดิม
                      </span>
                    )}
                    <ChevronRight className="text-slate-300" size={16} />
                    {selectedLog.newStatus ? (
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${STATUS_LABELS[selectedLog.newStatus]?.color || "bg-slate-100"}`}
                      >
                        {STATUS_LABELS[selectedLog.newStatus]?.label ||
                          selectedLog.newStatus}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        ไม่มีสถานะใหม่
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Target Item */}
              {selectedLog.clip && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                    เป้าหมาย (Clip)
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800 text-sm">
                      {selectedLog.clip.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      ID: {selectedLog.clip.id}
                    </p>
                    {selectedLog.revision && (
                      <p className="text-xs text-slate-500 mt-1">
                        Revision No:{" "}
                        <span className="font-bold">
                          {selectedLog.revision.revisionNo}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Raw Metadata Accordion */}
              {selectedLog.metadata &&
                Object.keys(selectedLog.metadata).length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="metadata"
                      className="border-slate-200"
                    >
                      <AccordionTrigger className="text-sm font-bold text-slate-700 hover:no-underline hover:text-blue-600">
                        Raw Metadata (JSON)
                      </AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto">
                          <code>
                            {JSON.stringify(selectedLog.metadata, null, 2)}
                          </code>
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
