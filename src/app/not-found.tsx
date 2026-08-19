import Link from "next/link";
import { Home, Search, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md animate-in fade-in zoom-in-95 duration-300">
        {/* Title & Message */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            ไม่พบหน้าที่คุณต้องการ
          </h1>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed max-w-sm mx-auto">
            หน้าที่คุณกำลังค้นหาอาจถูกลบ ย้ายที่ หรือคุณอาจพิมพ์ที่อยู่ URL
            ไม่ถูกต้อง
          </p>
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
