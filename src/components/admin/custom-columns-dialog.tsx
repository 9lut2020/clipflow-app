"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api-client";

export type CustomColumn = { key: string; label: string; type: "text" | "link" | "select"; options?: string[] };

const TYPE_LABEL: Record<CustomColumn["type"], string> = { text: "ข้อความ", link: "ลิงก์", select: "ตัวเลือก" };

/** Stable machine key for a new column; labels can be renamed freely later. */
const newKey = () => `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/**
 * The project's own extra columns on the assignment sheet (e.g. "ลิงก์เพลง",
 * "ฟอนต์"). Editors see the values on the clip page.
 */
export function CustomColumnsDialog({
  projectId,
  open,
  onOpenChange,
  columns,
  onSaved,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: CustomColumn[];
  onSaved: (columns: CustomColumn[]) => void;
}) {
  const [draft, setDraft] = useState<(CustomColumn & { optionsText: string })[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(columns.map((column) => ({ ...column, optionsText: (column.options || []).join(", ") })));
  }, [open, columns]);

  const update = (index: number, patch: Partial<CustomColumn & { optionsText: string }>) =>
    setDraft((prev) => prev.map((column, i) => (i === index ? { ...column, ...patch } : column)));

  const save = async () => {
    const cleaned: CustomColumn[] = draft
      .filter((column) => column.label.trim())
      .map((column) => ({
        key: column.key,
        label: column.label.trim(),
        type: column.type,
        ...(column.type === "select" && { options: column.optionsText.split(",").map((o) => o.trim()).filter(Boolean) }),
      }));
    if (cleaned.some((column) => column.type === "select" && !column.options?.length)) {
      toast.error("คอลัมน์แบบตัวเลือก ต้องใส่ตัวเลือกอย่างน้อย 1 อย่าง");
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch<any>(`/projects/${projectId}`, { customColumns: cleaned });
      if (res.status !== "success") throw new Error(res.message);
      onSaved(cleaned);
      toast.success("บันทึกคอลัมน์แล้ว");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "บันทึกคอลัมน์ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>คอลัมน์เพิ่มเติม</DialogTitle>
          <DialogDescription>เพิ่มคอลัมน์ของโปรเจกต์นี้เอง เช่น ลิงก์เพลง ฟอนต์ หมายเหตุ — คนตัดต่อจะเห็นในหน้าคลิป</DialogDescription>
        </DialogHeader>
        <div className="flex-1 space-y-2 overflow-y-auto py-2">
          {draft.length === 0 && <p className="rounded-lg bg-slate-50 py-6 text-center text-sm text-slate-500">ยังไม่มีคอลัมน์เพิ่มเติม</p>}
          {draft.map((column, index) => (
            <div key={column.key} className="space-y-2 rounded-xl border border-slate-200 p-3">
              <div className="flex gap-2">
                <Input value={column.label} onChange={(e) => update(index, { label: e.target.value })} placeholder="ชื่อคอลัมน์" className="h-9 flex-1" />
                <select value={column.type} onChange={(e) => update(index, { type: e.target.value as CustomColumn["type"] })} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm">
                  {(Object.keys(TYPE_LABEL) as CustomColumn["type"][]).map((type) => <option key={type} value={type}>{TYPE_LABEL[type]}</option>)}
                </select>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-rose-500 hover:bg-rose-50" onClick={() => setDraft((prev) => prev.filter((_, i) => i !== index))} title="ลบคอลัมน์">
                  <Trash2 size={15} />
                </Button>
              </div>
              {column.type === "select" && (
                <Input value={column.optionsText} onChange={(e) => update(index, { optionsText: e.target.value })} placeholder="ตัวเลือก คั่นด้วยจุลภาค เช่น ด่วน, ปกติ" className="h-9" />
              )}
            </div>
          ))}
          <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => setDraft((prev) => [...prev, { key: newKey(), label: "", type: "text", optionsText: "" }])} disabled={draft.length >= 20}>
            <Plus size={15} className="mr-1.5" /> เพิ่มคอลัมน์
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button type="button" onClick={save} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
