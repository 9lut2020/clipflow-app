"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";
import { Project } from "@/types/api";
import { toast } from "sonner";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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

  const handleDelete = async () => {
    if (!projectId) return;
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์นี้? ข้อมูลจะไม่สามารถกู้คืนได้")) return;
    
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
    }
  };

  if (!projectId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">แก้ไขโปรเจกต์</h1>
            <p className="text-slate-500 text-sm mt-0.5">แก้ไขข้อมูลรายการ</p>
          </div>
        </div>
        <Button 
          type="button" 
          variant="destructive" 
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-xl font-bold shadow-sm px-4"
        >
          <Trash2 size={16} className="mr-2" /> ลบโปรเจกต์
        </Button>
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
    </div>
  );
}
