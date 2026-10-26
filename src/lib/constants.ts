import {
  LucideIcon,
  LayoutDashboard,
  FileVideo,
  Settings,
  ClipboardList,
  BarChart3,
  Bell,
  Plus,
  FolderOpen,
  BookOpen,
  Share2,
} from "lucide-react";

export interface SidebarMenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: {
    title: string;
    href: string;
    badge?: string;
  }[];
}

export function getSidebarMenu(
  role: string,
): { section: string; items: SidebarMenuItem[] }[] {
  const isUser = role === "USER";
  const isReviewer = role === "REVIEWER";
  const isAdmin = role === "ADMIN";

  const menus: { section: string; items: SidebarMenuItem[] }[] = [];

  if (isUser) {
    menus.push({
      section: "Main",
      items: [
        { title: "หน้าแรก", href: "/dashboard", icon: LayoutDashboard },
        { title: "งานของฉัน", href: "/tasks", icon: ClipboardList },
        { title: "ส่งงานด่วน", href: "/submit", icon: Plus },
        { title: "โปรเจกต์ทั้งหมด", href: "/projects", icon: FileVideo },
        { title: "สถิติของฉัน", href: "/analytics", icon: BarChart3 },
        { title: "คลังทรัพยากรส่วนกลาง", href: "/assets", icon: FolderOpen },
      ],
    });
  }

  if (isReviewer) {
    menus.push(
      {
        section: "Main",
        items: [
          { title: "หน้าแรก", href: "/dashboard", icon: LayoutDashboard },
          { title: "งานของฉัน", href: "/tasks", icon: ClipboardList },
          { title: "ส่งงานด่วน", href: "/submit", icon: Plus },
          { title: "โปรเจกต์ทั้งหมด", href: "/projects", icon: FileVideo },
          { title: "รายงานวิเคราะห์", href: "/analytics", icon: BarChart3 },
          { title: "คลังทรัพยากรส่วนกลาง", href: "/assets", icon: FolderOpen },
        ],
      },
      {
        section: "System",
        items: [
          { title: "ศูนย์แจ้งเตือน", href: "/notifications", icon: Bell },
        ],
      },
    );
  }

  if (isAdmin) {
    menus.push(
      {
        section: "หลัก",
        items: [
          { title: "หน้าแรก", href: "/dashboard", icon: LayoutDashboard },
          { title: "งานทั้งหมด", href: "/tasks", icon: ClipboardList },
          { title: "เผยแพร่คลิป", href: "/admin/publish", icon: Share2 },
          {
            title: "การจัดการโปรเจกต์",
            href: "/projects",
            icon: FileVideo,
            children: [
              { title: "รายการโปรเจกต์ทั้งหมด", href: "/projects" },
              { title: "สร้างโปรเจกต์ใหม่", href: "/admin/projects/create" },
            ],
          },
          { title: "รายงานวิเคราะห์", href: "/analytics", icon: BarChart3 },
          { title: "คลังทรัพยากรส่วนกลาง", href: "/assets", icon: FolderOpen },
          { title: "ส่งงานแทนคนตัดต่อ", href: "/submit", icon: Plus },
        ],
      },
      {
        section: "ระบบ",
        items: [
          { title: "ศูนย์แจ้งเตือน", href: "/notifications", icon: Bell },
          {
            title: "ตั้งค่าและผู้ใช้งาน",
            href: "/settings",
            icon: Settings,
            children: [
              { title: "ตั้งค่าระบบทั่วไป", href: "/settings" },
              { title: "จัดการผู้ใช้งาน", href: "/users" },
              { title: "ประวัติการทำงานระบบ", href: "/admin/audit-logs" },
            ],
          },
        ],
      },
    );
  }

  // User guide for every role, at the end of the System section.
  const guide: SidebarMenuItem = {
    title: "คู่มือการใช้งาน",
    href: "/docs",
    icon: BookOpen,
  };
  const system = menus.find((menu) => menu.section === "System" || menu.section === "ระบบ");
  if (system) system.items.push(guide);
  else menus.push({ section: "System", items: [guide] });

  return menus;
}
