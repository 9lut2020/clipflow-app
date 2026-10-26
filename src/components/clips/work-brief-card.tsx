import { ExternalLink, FolderOpen, Image as ImageIcon } from "lucide-react";

type CustomColumn = { key: string; label: string; type: "text" | "link" | "select" };

/**
 * What the editor needs to start: the footage link (the clip's own, or the
 * episode's), the poster brief for posters, and the project's extra columns.
 * Renders nothing when there is nothing to show.
 */
export function WorkBriefCard({ clip }: { clip: any }) {
  const isPoster = clip.kind === "POSTER";
  const source: string = clip.sourceUrl || clip.episode?.sourceUrl || "";
  const columns: CustomColumn[] = clip.project?.customColumns || [];
  const fields = columns.filter((column) => clip.customFields?.[column.key]);
  if (!source && !isPoster && fields.length === 0) return null;

  return (
    <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs sm:mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-6">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 sm:text-base">
          {isPoster ? <ImageIcon className="h-4 w-4 text-pink-600" /> : <FolderOpen className="h-4 w-4 text-blue-600" />}
          {isPoster ? "งานโปสเตอร์" : "ข้อมูลสำหรับตัดต่อ"}
        </h2>
        {source && (
          <a href={source} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700">
            <ExternalLink className="h-3.5 w-3.5" /> เปิดไฟล์ต้นฉบับ{!clip.sourceUrl && clip.episode?.sourceUrl ? ` (EP ${clip.episode.episodeNo})` : ""}
          </a>
        )}
      </div>
      <dl className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
        {isPoster && (
          <>
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-[11px]">หัวข้อ</dt>
              <dd className="mt-0.5 text-sm font-bold text-slate-900">{clip.name}</dd>
            </div>
            {clip.question && (
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-[11px]">คำถาม</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm font-medium text-slate-800">{clip.question}</dd>
              </div>
            )}
          </>
        )}
        {fields.map((column) => {
          const value = String(clip.customFields[column.key]);
          return (
            <div key={column.key}>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-[11px]">{column.label}</dt>
              <dd className="mt-0.5 break-words text-sm font-medium text-slate-800">
                {column.type === "link" ? (
                  <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" /> เปิดลิงก์
                  </a>
                ) : value}
              </dd>
            </div>
          );
        })}
        {!isPoster && fields.length === 0 && (
          <p className="text-xs text-slate-500 sm:col-span-2">ดาวน์โหลดไฟล์ต้นฉบับจากปุ่มด้านบน แล้วตัดตามรายละเอียดของคลิป</p>
        )}
      </dl>
    </div>
  );
}
