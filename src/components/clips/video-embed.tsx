"use client";

import { useState, useRef, useEffect } from "react";
import { Maximize2, X, ExternalLink, Play, Film, AlertCircle, Video } from "lucide-react";
import { cn } from "@/utils/utils";

interface VideoEmbedProps {
  url: string;
  onTimeUpdate?: (seconds: number, formatted: string) => void;
  seekTime?: number | null;
}

export default function VideoEmbed({ url, onTimeUpdate, seekTime }: VideoEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (seekTime !== undefined && seekTime !== null && videoRef.current) {
      videoRef.current.currentTime = seekTime;
      videoRef.current.play().catch(() => {});
    }
  }, [seekTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      const seconds = Math.floor(videoRef.current.currentTime);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      onTimeUpdate(seconds, formatted);
    }
  };

  // Helper to extract Google Drive File ID
  const getDriveFileId = (rawUrl: string): string | null => {
    if (!rawUrl) return null;
    const matchD = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) return matchD[1];

    const matchId = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) return matchId[1];

    return null;
  };

  const fileId = getDriveFileId(url);
  const isGoogleDrive = url.includes("drive.google.com") || !!fileId;
  const isDirectVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);

  // Construct iframe embed URL safely
  let embedUrl: string | null = null;
  if (fileId) {
    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  } else if (isGoogleDrive) {
    embedUrl = url.replace(/\/view.*$/, "/preview").replace(/\/edit.*$/, "/preview");
  } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
  }

  // Prevent loading internal app routes inside iframe (which causes 404 inside iframe)
  const isInternalAppUrl = !url.startsWith("http://") && !url.startsWith("https://");

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="space-y-2">
      {/* Main Player Container */}
      <div
        className={cn(
          "bg-slate-950 border border-slate-200/80 shadow-md overflow-hidden relative group transition-all duration-300",
          isFullscreen
            ? "fixed inset-0 z-[100] w-full h-full rounded-none flex flex-col justify-center bg-black"
            : "aspect-video rounded-2xl"
        )}
      >
        {isDirectVideo ? (
          /* HTML5 Video Player for Direct Video Files */
          <video
            ref={videoRef}
            src={url}
            controls
            autoPlay={false}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain"
          />
        ) : embedUrl && !isInternalAppUrl ? (
          /* Embedded Iframe Player for Drive / YouTube */
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          /* Fallback Cinematic Card when embed is unavailable or internal URL */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white relative">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 transition-transform">
              <Film size={26} className="text-blue-400" />
            </div>

            <h3 className="font-bold text-sm sm:text-base text-slate-100 mb-1">
              วิดีโอต้นฉบับใน Google Drive / ลิงก์ภายนอก
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
              คลิกปุ่มด้านล่างเพื่อเปิดรับชมวิดีโอความคมชัดสูงในแอปพลิเคชัน หรือแท็บใหม่ได้ทันที
            </p>

            <a
              href={url.startsWith("http") ? url : `https://${url}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <ExternalLink size={15} /> เปิดเล่นวิดีโอในแท็บใหม่ / แอป Drive
            </a>
          </div>
        )}

        {/* Top Action Overlay Button */}
        {embedUrl && (
          <div
            className={cn(
              "absolute top-3 right-3 flex items-center gap-2 z-10",
              isFullscreen
                ? "opacity-100"
                : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
            )}
          >
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white font-bold text-xs backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title={isFullscreen ? "ออกจากโหมดเต็มจอ" : "ดูแบบเต็มจอ"}
            >
              {isFullscreen ? (
                <>
                  <X size={16} /> ย่อจอ
                </>
              ) : (
                <>
                  <Maximize2 size={15} /> ขยายเต็มจอ
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Control & Link Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 truncate">
          <Video size={15} className="text-blue-600 shrink-0" />
          <span className="text-slate-500 font-medium text-[11px] sm:text-xs truncate">
            {url.startsWith("http") ? url : `https://${url}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          {embedUrl && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3 py-1.5 text-xs font-bold bg-white text-slate-800 hover:bg-slate-200 rounded-lg border border-slate-300 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Maximize2 size={13} className="text-blue-600" />
              <span>{isFullscreen ? "ย่อจอ" : "เต็มจอ"}</span>
            </button>
          )}

          <a
            href={url.startsWith("http") ? url : `https://${url}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <ExternalLink size={13} />
            <span>เปิดลิงก์ต้นฉบับ</span>
          </a>
        </div>
      </div>
    </div>
  );
}
