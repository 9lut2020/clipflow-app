"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { Project } from "@/types/api";
import { toast } from "sonner";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pictureUrl: "",
    isActive: true,
  });

  useEffect(() => {
    params.then((p) => {
      setProjectId(p.id);
      loadProject(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (session === undefined) return;
    if (!session?.user) {
      router.push("/api/auth/signin");
      return;
    }
    if (session.user.role === "USER") {
      router.push("/projects");
    }
  }, [router, session]);

  const loadProject = async (id: string) => {
    try {
      const res = await api.get<Project>(`/projects/${id}`);
      if (res.status === "success" && res.data) {
        setFormData({
          name: res.data.name,
          description: res.data.description || "",
          pictureUrl: res.data.pictureUrl || "",
          isActive: res.data.isActive,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project");
    }
  };

  if (session === undefined) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (session.user.role === "USER") {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !projectId) return;
    
    setIsLoading(true);
    try {
      const res = await api.patch(`/projects/${projectId}`, formData);
      if (res.status === "success") {
        toast.success("บันทึกการแก้ไขเรียบร้อยแล้ว");
        router.push(`/projects/${projectId}`);
        router.refresh();
      } else {
        toast.error(`Failed to update project: ${res.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!projectId) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/projects/${projectId}`);
      if (res.status === "success") {
        toast.success("ลบโปรเจกต์เรียบร้อยแล้ว");
        router.push(`/projects`);
        router.refresh();
      } else {
        toast.error(`Failed to delete project: ${res.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!projectId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto pb-12">
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <Link href={`/admin/projects/${projectId}/manage`}>
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
                แก้ไขโปรเจกต์
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                แก้ไขข้อมูลรายการ
              </p>
            </div>
          </div>
          <Button 
            type="button" 
            variant="destructive" 
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="rounded-xl font-bold shadow-xs px-3 sm:px-4 h-9 sm:h-10 shrink-0"
          >
            <Trash2 size={16} className="sm:mr-2" /> 
            <span className="hidden sm:inline">ลบโปรเจกต์</span>
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-bold">ชื่อโปรเจกต์ (รายการ) <span className="text-rose-500">*</span></Label>
              <Input 
                id="name" 
                placeholder="เช่น ซีรีส์บทเรียนจากอัลกุรอาน" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-bold">รายละเอียด (ตัวเลือก)</Label>
              <Textarea 
                id="description" 
                placeholder="คำอธิบายสั้นๆ เกี่ยวกับโปรเจกต์นี้..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pictureUrl" className="text-slate-700 font-bold">URL รูปภาพหน้าปก (ตัวเลือก)</Label>
              <Input 
                id="pictureUrl" 
                type="url"
                placeholder="https://example.com/image.jpg" 
                value={formData.pictureUrl}
                onChange={(e) => setFormData({...formData, pictureUrl: e.target.value})}
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500"
              />
              <p className="text-[11px] sm:text-xs text-slate-500">
                ใส่ลิงก์รูปภาพเพื่อแสดงผลสวยงามในหน้าโปรเจกต์
              </p>
            </div>
          </CardContent>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Link href={`/projects/${projectId}`}>
              <Button type="button" variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-100">
                ยกเลิก
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm px-6"
            >
              {isLoading ? "กำลังบันทึก..." : (
                <>
                  <Save size={16} className="mr-2" /> บันทึก
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !open && !isDeleting && setShowDeleteConfirm(false)}
      >
        <DialogContent className="max-w-[400px] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบโปรเจกต์</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์นี้? ข้อมูลจะไม่สามารถกู้คืนได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              ลบโปรเจกต์
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
