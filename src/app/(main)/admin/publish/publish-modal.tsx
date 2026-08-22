"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle2, ExternalLink, Globe, LayoutTemplate, History, Loader2, FileText } from "lucide-react";
import { usePublishRecords, usePublishClip } from "@/features/clips/hooks/use-publish";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface PublishModalProps {
  clip: any;
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORMS = [
  { id: "TIKTOK", label: "TikTok" },
  { id: "YOUTUBE_SHORTS", label: "YouTube Shorts" },
  { id: "FACEBOOK_REELS", label: "Facebook Reels" },
  { id: "INSTAGRAM_REELS", label: "Instagram Reels" },
  { id: "OTHER", label: "อื่นๆ" },
];

export function PublishModal({ clip, isOpen, onClose }: PublishModalProps) {
  const [activeTab, setActiveTab] = useState("caption");
  const [copied, setCopied] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [url, setUrl] = useState("");

  const { data: publishedPosts, isLoading: isLoadingRecords } = usePublishRecords(clip.id);
  const { publishClip, isPublishing } = usePublishClip();

  // Generate caption
  const generatedCaption = `${clip.name}
.
ส่วนหนึ่งจากคลิปเต็ม รายการ ${clip.project?.name || "อัลมะดาริจญ์"} ตอนที่ ${clip.episode?.episodeNo || ""}
["${clip.episode?.name || ""}"]
.
ข้อคิดหนึ่งจากอัลกุรอาน เพื่อการทบทวนและพัฒนาตนเอง
.
#${clip.project?.name || "อัลมะดาริจญ์"} #แนวคิดการพัฒนาตนเองจากอัลกุรอาน #อิสลาม #มุสลิม #ข้อคิดอิสลาม #พัฒนาตนเอง #เตือนใจ #tmyda`;

  const [caption, setCaption] = useState(generatedCaption);

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    if (platforms.length === 0) return;
    try {
      await Promise.all(platforms.map(platform => 
        publishClip({
          clipId: clip.id,
          platform,
          caption,
          url,
        })
      ));
      setUrl("");
      setPlatforms([]);
      setActiveTab("history"); // Switch to history tab after success
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlatform = (id: string) => {
    setPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl rounded-2xl overflow-hidden p-0 gap-0">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-slate-100 rotate-12 scale-150 pointer-events-none opacity-50">
            <LayoutTemplate size={120} />
          </div>
          <div className="relative">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              จัดการการเผยแพร่
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-1.5 line-clamp-1">
              {clip.name}
            </DialogDescription>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4 border-b border-slate-100 bg-white">
            <TabsList className="bg-slate-100/50 p-1 rounded-xl h-auto w-full grid grid-cols-2">
              <TabsTrigger 
                value="caption"
                className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-bold text-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> แคปชั่น & โพสต์
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-bold text-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" /> ประวัติการโพสต์
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar bg-white">
            <TabsContent value="caption" className="mt-0 outline-none space-y-6">
              <div className="space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">แคปชั่น (Caption)</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopy}
                    className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                      copied 
                        ? "bg-green-50 text-green-700 hover:bg-green-100" 
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {copied ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> คัดลอกแล้ว</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5 mr-1.5" /> คัดลอกข้อความ</>
                    )}
                  </Button>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full min-h-[160px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">บันทึกประวัติการเผยแพร่</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">แพลตฟอร์ม (เลือกได้หลายช่องทาง) *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PLATFORMS.map(p => (
                        <label 
                          key={p.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            platforms.includes(p.id) 
                              ? "bg-blue-50 border-blue-200" 
                              : "bg-white border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            platforms.includes(p.id) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                          }`}>
                            {platforms.includes(p.id) && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={platforms.includes(p.id)}
                            onChange={() => togglePlatform(p.id)}
                          />
                          <span className={`text-sm font-medium ${platforms.includes(p.id) ? "text-blue-900" : "text-slate-700"}`}>
                            {p.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">ลิงก์โพสต์ (ถ้ามี, ใช้ลิงก์เดียวกันได้)</label>
                    <Input 
                      placeholder="https://tiktok.com/..." 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-white border-slate-200 h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handlePublish} 
                    disabled={platforms.length === 0 || isPublishing}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6 font-bold"
                  >
                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    บันทึกการโพสต์
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {isLoadingRecords ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : publishedPosts?.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">ยังไม่มีประวัติการโพสต์สำหรับคลิปนี้</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {publishedPosts?.map((post: any) => (
                    <div key={post.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800">
                            {PLATFORMS.find(p => p.id === post.platform)?.label || post.platform}
                          </span>
                          <span className="text-xs text-slate-500">• โดย {post.publishedBy || "ระบบ"}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {format(new Date(post.publishedAt), "d MMM yyyy, HH:mm", { locale: th })}
                        </span>
                      </div>
                      
                      {post.url && (
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2"
                        >
                          <ExternalLink className="w-3 h-3" /> เปิดดูโพสต์
                        </a>
                      )}
                      
                      {post.caption && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg whitespace-pre-wrap line-clamp-3">
                          {post.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
