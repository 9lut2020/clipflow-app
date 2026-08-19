"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Smartphone,
  FolderArchive,
  Bell,
  Save,
  Shield,
  HardDrive,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState<
    "general" | "line" | "drive" | "rules"
  >("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [systemName, setSystemName] = useState(
    "ClipFlow - Video Review System",
  );
  const [timezone, setTimezone] = useState("Asia/Bangkok (GMT+7)");
  const [autoArchiveDays, setAutoArchiveDays] = useState("30");

  const [lineChannelId, setLineChannelId] = useState("2011142842");
  const [lineChannelSecret, setLineChannelSecret] = useState(
    "••••••••••••••••••••••••••••••••",
  );
  const [lineLiffId, setLineLiffId] = useState("2011142842-AbCdEfGh");

  const [driveFolderId, setDriveFolderId] = useState(
    "1A2b3C4d5E6F7g8H9i0J_ClipFlow_Root",
  );
  const [maxUploadMb, setMaxUploadMb] = useState("500");

  const [deadlineAlertHours, setDeadlineAlertHours] = useState("24");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-24 lg:pb-8 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              ตั้งค่าระบบ (System Settings)
            </h1>
            <span className="bg-amber-100 text-amber-800 text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              Admin Access
            </span>
          </div>
          <p className="text-slate-600 text-xs md:text-sm mt-1">
            กำหนดค่าระบบ การเชื่อมต่อ LINE Official Account, Google Drive
            และเงื่อนไขการทำงานของ ClipFlow
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl animate-in fade-in">
              <CheckCircle2 size={15} /> บันทึกเรียบร้อย
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs"
          >
            <Save size={15} className="mr-1.5" />
            {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-1 bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "general"
                ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Settings size={16} />
            <span>ตั้งค่าทั่วไป (General)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("line")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "line"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Smartphone size={16} />
            <span>เชื่อมต่อ LINE (LINE Integration)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("drive")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "drive"
                ? "bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <HardDrive size={16} />
            <span>คลัง Google Drive (Storage)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "rules"
                ? "bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Bell size={16} />
            <span>การแจ้งเตือน & เงื่อนไข (Rules)</span>
          </button>
        </div>

        {/* Form Content Area (lg:col-span-9) */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === "general" && (
            <Card className="bg-white border-slate-200/80 shadow-xs">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="text-blue-600" size={18} />
                  <span>ตั้งค่าระบบทั่วไป (General System Configuration)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  กำหนดชื่อระบบ เขตเวลา และการบริหารจัดการประวัติข้อมูล
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ชื่อระบบ (System Title)
                  </label>
                  <input
                    type="text"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      เขตเวลา (Timezone)
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Asia/Bangkok (GMT+7)">
                        Asia/Bangkok (GMT+7)
                      </option>
                      <option value="UTC">
                        UTC (Coordinated Universal Time)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      พับเก็บคลิปที่ผ่านอนุมัติอัตโนมัติ (Auto-Archive Days)
                    </label>
                    <input
                      type="number"
                      value={autoArchiveDays}
                      onChange={(e) => setAutoArchiveDays(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: LINE INTEGRATION */}
          {activeTab === "line" && (
            <Card className="bg-white border-slate-200/80 shadow-xs">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Smartphone className="text-emerald-600" size={18} />
                  <span>ตั้งค่าการเชื่อมต่อ LINE Official Account & LIFF</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  กำหนด LINE Messaging API Credentials
                  สำหรับส่งแจ้งเตือนและล็อกอินเข้าใช้งาน
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    LINE Channel ID (Messaging API)
                  </label>
                  <input
                    type="text"
                    value={lineChannelId}
                    onChange={(e) => setLineChannelId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    LINE Channel Secret
                  </label>
                  <input
                    type="password"
                    value={lineChannelSecret}
                    onChange={(e) => setLineChannelSecret(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    LIFF ID (LINE Front-end Framework)
                  </label>
                  <input
                    type="text"
                    value={lineLiffId}
                    onChange={(e) => setLineLiffId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: GOOGLE DRIVE */}
          {activeTab === "drive" && (
            <Card className="bg-white border-slate-200/80 shadow-xs">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <HardDrive className="text-purple-600" size={18} />
                  <span>ตั้งค่าคลังเก็บไฟล์ Google Drive</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  กำหนด Root Folder ID และการจัดการพื้นที่อัปโหลดไฟล์วิดีโอ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Google Drive Root Folder ID
                  </label>
                  <input
                    type="text"
                    value={driveFolderId}
                    onChange={(e) => setDriveFolderId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ขนาดไฟล์วิดีโอสูงสุดที่อนุญาตให้อัปโหลดต่อคลิป (MB)
                  </label>
                  <input
                    type="number"
                    value={maxUploadMb}
                    onChange={(e) => setMaxUploadMb(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: RULES */}
          {activeTab === "rules" && (
            <Card className="bg-white border-slate-200/80 shadow-xs">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Bell className="text-amber-600" size={18} />
                  <span>เงื่อนไขการแจ้งเตือนและกำหนดเวลา (Deadline Rules)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  กำหนดระยะเวลาแจ้งเตือนล่วงหน้าเมื่อใกล้ถึงกำหนดส่งงาน
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    แจ้งเตือนเมื่อใกล้ถึง Deadline ล่วงหน้า (ชั่วโมง)
                  </label>
                  <input
                    type="number"
                    value={deadlineAlertHours}
                    onChange={(e) => setDeadlineAlertHours(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
