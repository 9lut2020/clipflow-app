"use client";

import { useState } from "react";
import { useCreateAsset } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function AssetForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutateAsync } = useCreateAsset();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"LOGO" | "BGM" | "FONT" | "TEMPLATE" | "OTHER">("OTHER");
  const [fileUrl, setFileUrl] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fileUrl) {
      setError("กรุณากรอกชื่อและลิงก์ไฟล์");
      return;
    }
    
    setIsPending(true);
    setError(null);
    try {
      await mutateAsync({ name, description, category, fileUrl });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-500">{error}</div>}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">ชื่อไฟล์ <span className="text-red-500">*</span></label>
        <Input 
          placeholder="เช่น โลโก้รายการ X" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">หมวดหมู่</label>
        <Select 
          value={category} 
          onValueChange={(val: any) => setCategory(val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกหมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOGO">โลโก้</SelectItem>
            <SelectItem value="BGM">เพลง/เสียงประกอบ</SelectItem>
            <SelectItem value="FONT">ฟอนต์</SelectItem>
            <SelectItem value="TEMPLATE">เทมเพลต</SelectItem>
            <SelectItem value="OTHER">อื่นๆ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">ลิงก์ไฟล์ (URL) <span className="text-red-500">*</span></label>
        <Input 
          type="url"
          placeholder="https://drive.google.com/..." 
          value={fileUrl} 
          onChange={(e) => setFileUrl(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">รายละเอียด (ไม่บังคับ)</label>
        <Textarea
          placeholder="เพิ่มคำอธิบาย..."
          className="resize-none"
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          บันทึก
        </Button>
      </div>
    </form>
  );
}
