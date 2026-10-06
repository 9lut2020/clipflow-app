import { Overview, Login, InstallApp, Notifications } from "./start";
import { EditorTasks, SubmitClip, Revisions, ReviewClip } from "./work";
import { Projects, AssignTasks, Publish, UsersRoles } from "./admin";
import { Faq, faqToc } from "./help";

export type DocPage = {
  slug: string;
  title: string;
  description: string;
  group: string;
  Body: () => React.ReactNode;
  /** Headings shown in "on this page"; ids must match the H2 ids in Body. */
  toc: { id: string; title: string }[];
};

export const docs: DocPage[] = [
  {
    slug: "getting-started", group: "เริ่มต้นใช้งาน", title: "ClipFlow คืออะไร",
    description: "ภาพรวมขั้นตอนการทำงาน บทบาทผู้ใช้ และสถานะของคลิป", Body: Overview,
    toc: [{ id: "workflow", title: "ภาพรวมการทำงาน" }, { id: "roles", title: "บทบาทผู้ใช้งาน" }, { id: "statuses", title: "สถานะของคลิป" }],
  },
  {
    slug: "login", group: "เริ่มต้นใช้งาน", title: "เข้าสู่ระบบและตั้งค่าโปรไฟล์",
    description: "ล็อกอินด้วย LINE ตั้งชื่อที่แสดง และกรอกข้อมูลติดต่อ", Body: Login,
    toc: [{ id: "sign-in", title: "เข้าสู่ระบบด้วย LINE" }, { id: "first-login", title: "ตั้งค่าโปรไฟล์ครั้งแรก" }, { id: "edit-profile", title: "แก้ไขโปรไฟล์ภายหลัง" }],
  },
  {
    slug: "install-app", group: "เริ่มต้นใช้งาน", title: "ใช้งานบนมือถือและ LINE",
    description: "ใช้ผ่านเมนู LINE หรือติดตั้งเป็นแอปบนหน้าจอ", Body: InstallApp,
    toc: [{ id: "line-menu", title: "ใช้งานผ่านเมนู LINE" }, { id: "pwa", title: "ติดตั้งเป็นแอป (PWA)" }],
  },
  {
    slug: "notifications", group: "เริ่มต้นใช้งาน", title: "การแจ้งเตือน",
    description: "แจ้งเตือนผ่าน LINE ในแอป และบนเครื่อง", Body: Notifications,
    toc: [{ id: "events", title: "เหตุการณ์ที่มีแจ้งเตือน" }, { id: "examples", title: "ตัวอย่างข้อความใน LINE" }, { id: "in-app", title: "ศูนย์แจ้งเตือนในแอป" }],
  },
  {
    slug: "editor-tasks", group: "สำหรับนักตัดต่อ", title: "ดูงานของฉัน",
    description: "ดูงานที่ได้รับมอบหมายและสถานะ", Body: EditorTasks, toc: [],
  },
  {
    slug: "submit-clip", group: "สำหรับนักตัดต่อ", title: "ส่งคลิปให้ตรวจ",
    description: "ตั้งค่าลิงก์ Google Drive และส่งงาน", Body: SubmitClip,
    toc: [{ id: "share-drive", title: "ตั้งค่าการแชร์ไฟล์" }, { id: "submit", title: "ส่งงาน" }, { id: "quick-submit", title: "ส่งงานด่วน" }],
  },
  {
    slug: "revisions", group: "สำหรับนักตัดต่อ", title: "แก้ไขงานตามคอมเมนต์",
    description: "อ่านคอมเมนต์ที่ระบุเวลา และส่งงานแก้ไข", Body: Revisions,
    toc: [{ id: "read-comments", title: "อ่านคอมเมนต์" }, { id: "resubmit", title: "ส่งงานแก้ไข" }],
  },
  {
    slug: "review-clip", group: "สำหรับผู้ตรวจ", title: "ตรวจคลิป",
    description: "ปักหมุดเวลา คอมเมนต์ อนุมัติ หรือส่งกลับแก้ไข", Body: ReviewClip,
    toc: [{ id: "open", title: "เปิดคลิปเพื่อตรวจ" }, { id: "line-group", title: "คำสั่งในกลุ่ม LINE" }],
  },
  {
    slug: "projects", group: "สำหรับแอดมิน", title: "โปรเจกต์และสมาชิก",
    description: "สร้างโปรเจกต์และเพิ่มทีมงาน", Body: Projects,
    toc: [{ id: "create", title: "สร้างโปรเจกต์ใหม่" }, { id: "members", title: "เพิ่มสมาชิก" }],
  },
  {
    slug: "assign-tasks", group: "สำหรับแอดมิน", title: "สร้างคลิปและมอบหมายงาน",
    description: "ใช้ตารางงาน วางข้อความอัตโนมัติ และมอบหมายคนตัดต่อ", Body: AssignTasks,
    toc: [{ id: "sheet", title: "ตารางงาน" }, { id: "import", title: "วางข้อความอัตโนมัติ" }],
  },
  {
    slug: "publish", group: "สำหรับแอดมิน", title: "คิวและการเผยแพร่",
    description: "กำหนดวันโพสต์ คัดลอกแคปชั่น และบันทึกการโพสต์", Body: Publish,
    toc: [{ id: "queue", title: "รายการคิวเผยแพร่" }, { id: "record", title: "บันทึกการโพสต์" }],
  },
  {
    slug: "users-roles", group: "สำหรับแอดมิน", title: "ผู้ใช้งานและบทบาท",
    description: "ดูข้อมูลติดต่อ เปลี่ยนบทบาท และระงับบัญชี", Body: UsersRoles,
    toc: [{ id: "change-role", title: "เปลี่ยนบทบาท" }, { id: "suspend", title: "ระงับการใช้งาน" }],
  },
  {
    slug: "faq", group: "ช่วยเหลือ", title: "คำถามที่พบบ่อย",
    description: "ปัญหาที่พบบ่อยและวิธีแก้", Body: Faq, toc: faqToc,
  },
];

export const docGroups = Array.from(new Set(docs.map((doc) => doc.group))).map((group) => ({
  group,
  pages: docs.filter((doc) => doc.group === group),
}));

export const findDoc = (slug: string) => docs.find((doc) => doc.slug === slug);
