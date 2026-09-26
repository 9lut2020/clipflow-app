"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAssets, useDeleteAsset, Asset } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Download, Image as ImageIcon, Music, Type, FileBox, FolderArchive, Search, Trash2, ExternalLink } from "lucide-react";
import { AssetForm } from "./asset-form";

const ASSET_ICONS = {
  LOGO: ImageIcon,
  BGM: Music,
  FONT: Type,
  TEMPLATE: FileBox,
  OTHER: FolderArchive,
};

const ASSET_LABELS: Record<string, string> = {
  LOGO: "โลโก้",
  BGM: "เพลง/เสียงประกอบ",
  FONT: "ฟอนต์",
  TEMPLATE: "เทมเพลต",
  OTHER: "อื่นๆ",
};

export default function AssetsClient() {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: assets = [], isLoading, refetch } = useAssets(filterCategory);
  const { mutateAsync } = useDeleteAsset();
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  const filteredAssets = assets.filter((asset: Asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
    await mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ค้นหาชื่อไฟล์..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="หมวดหมู่ทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทุกหมวดหมู่</SelectItem>
              <SelectItem value="LOGO">โลโก้</SelectItem>
              <SelectItem value="BGM">เพลง/เสียงประกอบ</SelectItem>
              <SelectItem value="FONT">ฟอนต์</SelectItem>
              <SelectItem value="TEMPLATE">เทมเพลต</SelectItem>
              <SelectItem value="OTHER">อื่นๆ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มไฟล์ส่วนกลาง
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>เพิ่มไฟล์ส่วนกลางใหม่</DialogTitle>
                <DialogDescription>
                  อัปโหลดไฟล์ไปที่ Google Drive แล้วนำลิงก์มาวางที่นี่
                </DialogDescription>
              </DialogHeader>
              <AssetForm onSuccess={() => { setIsCreateOpen(false); refetch(); }} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Asset Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <FolderArchive className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">ไม่พบทรัพยากร</h3>
          <p className="text-slate-500 mt-1">
            {searchQuery ? "ไม่พบไฟล์ที่ตรงกับการค้นหา" : "ยังไม่มีไฟล์ในระบบ"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset: Asset) => {
            const Icon = (ASSET_ICONS as any)[asset.category] || FolderArchive;
            return (
              <Card key={asset.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200/60 hover:border-blue-200 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(asset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1" title={asset.name}>
                    {asset.name}
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {ASSET_LABELS[asset.category]}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-slate-600 line-clamp-2 h-10">
                    {asset.description || "ไม่มีรายละเอียด"}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="secondary"
                    className="w-full bg-slate-100 hover:bg-blue-600 hover:text-white transition-colors"
                    onClick={() => window.open(asset.fileUrl, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    โหลดไฟล์
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
