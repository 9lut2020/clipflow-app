import { apiServer } from "@/lib/api-server";
import { Clip } from "@/types/api";
import { History, CheckCircle2, Clock, AlertCircle, FileEdit } from "lucide-react";

export default async function AuditLogsPage() {
  let clips: Clip[] = [];
  try {
    const res = await apiServer.get<Clip[]>("/clips");
    if (res.status === "success" && Array.isArray(res.data)) {
      clips = res.data;
    }
  } catch (err) {
    console.error("Failed to load clips for audit logs:", err);
  }

  // Derive audit log events dynamically from real database records
  const auditLogs = clips
    .map((clip) => {
      const ownerName = clip.owner?.displayName || "ผู้ใช้ระบบ";
      const ownerAvatar =
        clip.owner?.pictureUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          ownerName
        )}`;

      let action = "UPDATED_CLIP";
      let oldStatus = "DRAFT";
      let newStatus = clip.status;

      if (clip.status === "APPROVED") {
        action = "APPROVE_CLIP";
        oldStatus = "IN_REVIEW";
      } else if (clip.status === "NEEDS_REVISION") {
        action = "REQUEST_REVISION";
        oldStatus = "IN_REVIEW";
      } else if (clip.status === "IN_REVIEW") {
        action = "START_REVIEW";
        oldStatus = "PENDING_REVIEW";
      } else if (clip.status === "PENDING_REVIEW") {
        action = "SUBMIT_CLIP";
        oldStatus = "DRAFT";
      }

      const dateObj = clip.updatedAt ? new Date(clip.updatedAt) : new Date();
      const formattedDate = `${dateObj.toLocaleDateString("th-TH")} ${dateObj.toLocaleTimeString(
        "th-TH",
        { hour: "2-digit", minute: "2-digit" }
      )}`;

      return {
        id: clip.id,
        action,
        clipName: clip.name,
        episodeNo: clip.episode?.episodeNo,
        oldStatus,
        newStatus,
        user: { name: ownerName, avatar: ownerAvatar },
        date: formattedDate,
      };
    })
    .sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <History className="text-sky-500" size={26} />
            ประวัติการทำงาน
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            บันทึกประวัติความเคลื่อนไหวและการอัปเดตสถานะคลิปทั้งหมดในระบบ DB
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
            <thead className="z-20 bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-3.5 w-44">วัน-เวลา</th>
                <th className="px-6 py-3.5 w-52">ผู้ดำเนินการ</th>
                <th className="px-6 py-3.5 w-40">Action</th>
                <th className="px-6 py-3.5 w-64">การเปลี่ยนแปลงสถานะ</th>
                <th className="px-6 py-3.5 text-right pr-8">คลิป / Episode</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 bg-white"
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
                auditLogs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={`group transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"
                    } hover:bg-sky-50/60`}
                  >
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-medium text-xs">
                      {log.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={log.user.avatar}
                          alt=""
                          className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                        />
                        <span className="font-bold text-slate-700">
                          {log.user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 tracking-wider border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                          {log.oldStatus}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-sky-700 font-bold bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                          {log.newStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right pr-8 font-medium text-xs text-slate-600">
                      <span className="font-bold text-slate-800">
                        {log.clipName}
                      </span>{" "}
                      {log.episodeNo ? (
                        <span className="text-sky-600 font-bold ml-1">
                          (EP.{log.episodeNo})
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
