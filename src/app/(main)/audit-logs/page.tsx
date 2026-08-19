import { apiServer } from "@/lib/api-server";
import {
  History,
  CheckCircle2,
  XCircle,
  UserCheck,
  UploadCloud,
  RefreshCw,
  Users,
} from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  meta: Record<string, any>;
  createdAt: string;
  actor: { name: string; pictureUrl?: string } | null;
}

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  CLIP_SUBMITTED: {
    label: "ส่งคลิปเข้าตรวจ",
    icon: UploadCloud,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  CLIP_RESUBMITTED: {
    label: "ส่งซ้ำหลังแก้ไข",
    icon: RefreshCw,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  CLIP_APPROVED: {
    label: "อนุมัติผ่านแล้ว",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  CLIP_REJECTED: {
    label: "ตีกลับให้แก้ไข",
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
  },
  ROLE_CHANGED: {
    label: "เปลี่ยนบทบาทผู้ใช้",
    icon: UserCheck,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
  },
  TASK_ASSIGNED: {
    label: "มอบหมายงาน",
    icon: Users,
    color: "text-sky-600",
    bg: "bg-sky-50 border-sky-200",
  },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("th-TH")} ${d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default async function AuditLogsPage() {
  let logs: ActivityLog[] = [];
  try {
    const res = await apiServer.get<ActivityLog[]>("/activity-logs");
    if (res.status === "success" && Array.isArray(res.data)) {
      logs = res.data;
    }
  } catch (err) {
    console.error("Failed to load activity logs:", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <History className="text-sky-500" size={26} />
            ประวัติการทำงาน
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            บันทึกการกระทำจริงทุกครั้งในระบบ (Audit Log)
          </p>
        </div>
        <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {logs.length} รายการล่าสุด
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-3.5 w-44">วัน-เวลา</th>
                <th className="px-6 py-3.5 w-52">ผู้ดำเนินการ</th>
                <th className="px-6 py-3.5 w-48">ประเภทการกระทำ</th>
                <th className="px-6 py-3.5">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-slate-400 bg-white"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History size={36} className="text-slate-300 stroke-1" />
                      <p className="font-medium text-slate-500 text-sm">
                        ยังไม่มีประวัติการทำงานในระบบ
                      </p>
                      <p className="text-xs text-slate-400">
                        เมื่อมีการอัปเดตสถานะคลิปหรือส่งตรวจ ข้อมูลจะปรากฏที่นี่โดยอัตโนมัติ
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => {
                  const cfg = ACTION_CONFIG[log.action];
                  const Icon = cfg?.icon || History;
                  const actorName = log.actor?.name || "ระบบอัตโนมัติ";
                  const actorAvatar =
                    log.actor?.pictureUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(actorName)}`;

                  // Build readable detail line from meta
                  let detail = "";
                  if (log.meta?.clipName) {
                    detail = `คลิป: ${log.meta.clipName}`;
                    if (log.meta.projectName) detail += ` (${log.meta.projectName})`;
                  } else if (log.meta?.targetName) {
                    detail = `ผู้ใช้: ${log.meta.targetName}`;
                    if (log.meta.newRole) detail += ` → ${log.meta.newRole}`;
                  }

                  return (
                    <tr
                      key={log.id}
                      className={`group transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      } hover:bg-sky-50/50`}
                    >
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-medium text-xs">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={actorAvatar}
                            alt=""
                            className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                          />
                          <span className="font-bold text-slate-700">
                            {actorName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                            cfg?.bg || "bg-slate-100 border-slate-200"
                          } ${cfg?.color || "text-slate-700"}`}
                        >
                          <Icon size={12} />
                          {cfg?.label || log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {detail || (
                          <span className="text-slate-400 italic">ไม่มีรายละเอียดเพิ่มเติม</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
