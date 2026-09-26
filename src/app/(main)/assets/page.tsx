import { Metadata } from "next";
import AssetsClient from "./assets-client";

export const metadata: Metadata = {
  title: "คลังทรัพยากรส่วนกลาง (Assets Library) | ClipFlow",
  description: "จัดการและดาวน์โหลดไฟล์ส่วนกลาง โลโก้ เพลงประกอบ ฟอนต์ต่างๆ",
};

export default function AssetsPage() {
  return (
    <div className="max-w-[1200px] mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            คลังทรัพยากรส่วนกลาง <span className="text-blue-600">Assets</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            ดาวน์โหลดและจัดการไฟล์ส่วนกลาง เช่น โลโก้, BGM, ฟอนต์
          </p>
        </div>
      </div>
      <AssetsClient />
    </div>
  );
}
