import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen text-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Title & Message */}
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300 min-h-[400px]">
          <img
            src="/Image/Clipflow-404.png"
            alt="No tasks"
            className="w-56 h-56 object-contain opacity-90"
          />
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              ไม่พบหน้าที่คุณต้องการ
            </h1>
            <h3 className="text-lg text-slate-800 tracking-tight">
              หน้าที่คุณกำลังค้นหาอาจถูกลบ ย้ายที่ หรือคุณอาจพิมพ์ที่อยู่ URL
              ไม่ถูกต้อง
            </h3>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-xs border-0">
              <Home size={16} className="mr-2" />
              กลับสู่หน้าหลัก
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
