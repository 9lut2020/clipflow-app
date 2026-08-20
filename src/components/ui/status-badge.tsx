export function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        ผ่านอนุมัติ
      </span>
    );
  }
  if (status === "NEEDS_REVISION") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        สั่งแก้ไข
      </span>
    );
  }
  if (status === "IN_REVIEW") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
        กำลังตรวจ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      รอตรวจทาน
    </span>
  );
}
