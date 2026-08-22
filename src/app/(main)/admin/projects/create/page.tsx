"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function CreateProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { createProject, isCreating: isLoading } = useCreateProject();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Verify Admin role (in real app, this should also be protected via middleware/server)
  if (session?.user?.role === "USER") {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const result = await createProject({
        name: formData.name,
        description: formData.description,
        lineGroupId: "", // mock since the original didn't use it
      });

      if (result.data?.id) {
        toast.success("สร้างโปรเจกต์ใหม่เรียบร้อยแล้ว");
        router.push(`/admin/projects/${result.data.id}/manage`);
      } else {
        toast.error("Failed to create project");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <Link href="/projects">
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
                สร้างโปรเจกต์ใหม่
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                กำหนดชื่อและรายละเอียดของรายการ
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-bold">
                ชื่อโปรเจกต์ (รายการ) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="เช่น ซีรีส์บทเรียนจากอัลกุรอาน"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-bold">
                รายละเอียด (ตัวเลือก)
              </Label>
              <Textarea
                id="description"
                placeholder="คำอธิบายสั้นๆ เกี่ยวกับโปรเจกต์นี้..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500 resize-none"
              />
            </div>
          </CardContent>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/projects">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
              >
                ยกเลิก
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading || !formData.name}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" /> สร้างโปรเจกต์
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
