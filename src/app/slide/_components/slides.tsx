/* eslint-disable @next/next/no-img-element -- slides are a fixed 1920×1080 canvas */
import type { CSSProperties, ReactNode } from "react";

/* ─── Building blocks ─────────────────────────────────────────────────── */

const HEAD = "var(--font-slide-head), Tahoma, sans-serif";

/** Animated wrapper: kind = sl-in | sl-left | sl-pop, d = delay in seconds. */
function A({ children, d = 0, kind = "sl-in", className = "", style }: { children?: ReactNode; d?: number; kind?: string; className?: string; style?: CSSProperties }) {
  return <div className={`${kind} ${className}`} style={{ animationDelay: `${d}s`, ...style }}>{children}</div>;
}

function Shell({ eyebrow, title, num, children, dark = false }: { eyebrow: string; title: string; num: number; children: ReactNode; dark?: boolean }) {
  return (
    <div className={`absolute inset-0 flex flex-col gap-12 px-[128px] pt-[112px] pb-[150px] ${dark ? "bg-[#10213F] text-[#F6F7FB]" : "bg-[#F6F7FB] text-[#10213F]"}`}>
      <div className="flex flex-col gap-3">
        <A d={0}><p className={`text-[26px] font-bold tracking-[2px] ${dark ? "text-[#7FB0FF]" : "text-[#2563EB]"}`}>{eyebrow}</p></A>
        <A d={0.1}><h2 className="text-[68px] font-bold leading-[1.12]" style={{ fontFamily: HEAD }}>{title}</h2></A>
      </div>
      <div className="relative flex-1">{children}</div>
      <p className={`absolute bottom-[56px] left-[128px] text-[24px] ${dark ? "text-[#8FA3C7]" : "text-[#8A94A6]"}`}>ClipFlow · {String(num).padStart(2, "0")}</p>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[28px] border border-[#E2E6EE] bg-white p-10 shadow-[0_10px_30px_rgba(16,33,63,0.06)] ${className}`}>{children}</div>;
}

function Pill({ children, tone }: { children: ReactNode; tone: string }) {
  return <span className={`inline-flex items-center rounded-full px-5 py-1.5 text-[26px] font-bold ${tone}`}>{children}</span>;
}

function Btn({ children, tone = "bg-[#2563EB] text-white", className = "" }: { children: ReactNode; tone?: string; className?: string }) {
  return <span className={`inline-flex items-center justify-center rounded-2xl px-7 py-4 text-[26px] font-bold ${tone} ${className}`}>{children}</span>;
}

function Field({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[22px] font-bold text-[#64748B]">{label}</span>
      <span className={`rounded-2xl border-2 border-[#DCE3EE] bg-white px-5 py-3.5 text-[26px] ${value ? "text-[#10213F]" : "text-[#94A3B8]"}`}>{value || placeholder}</span>
    </div>
  );
}

function Step({ n, title, text, d }: { n: number; title: string; text: string; d: number }) {
  return (
    <A d={d} kind="sl-left" className="flex gap-6">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[30px] font-bold text-white">{n}</span>
      <div>
        <p className="text-[34px] font-bold leading-tight">{title}</p>
        <p className="mt-1 text-[27px] leading-snug text-[#475569]">{text}</p>
      </div>
    </A>
  );
}

const STATUS: Record<string, { label: string; tone: string }> = {
  DRAFT: { label: "รอส่งงาน", tone: "bg-slate-100 text-slate-700" },
  PENDING_REVIEW: { label: "รอตรวจ", tone: "bg-amber-100 text-amber-800" },
  IN_REVIEW: { label: "กำลังตรวจ", tone: "bg-sky-100 text-sky-800" },
  NEEDS_REVISION: { label: "สั่งแก้ไข", tone: "bg-rose-100 text-rose-800" },
  APPROVED: { label: "ผ่านอนุมัติ", tone: "bg-emerald-100 text-emerald-800" },
  PUBLISHED: { label: "เผยแพร่แล้ว", tone: "bg-violet-100 text-violet-800" },
};

/* ─── Slides ──────────────────────────────────────────────────────────── */

function Cover() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-10 bg-[linear-gradient(135deg,#10213F_0%,#17346B_100%)] px-[128px] text-[#F6F7FB]">
      <div className="absolute right-[120px] top-[150px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.45)_0%,rgba(37,99,235,0)_70%)]" />
      <A d={0.3} kind="sl-pop" className="absolute right-[200px] top-[250px]">
        <img src="/Image/Clipflow.png" alt="โลโก้ ClipFlow" className="sl-float h-[460px] w-[460px] object-contain" />
      </A>
      <A d={0}><p className="text-[32px] font-bold tracking-[4px] text-[#7FB0FF]">คู่มือการใช้งานระบบ</p></A>
      <A d={0.15}><h1 className="text-[150px] font-bold leading-none" style={{ fontFamily: HEAD }}>ClipFlow</h1></A>
      <A d={0.3}><p className="w-[1000px] text-[44px] leading-snug text-[#C9D6EE]">ระบบติดตามงานตัดต่อคลิป ตั้งแต่มอบหมาย ส่งงาน ตรวจ จนถึงเผยแพร่ ในที่เดียว</p></A>
      <A d={0.5} className="flex gap-4">
        <Pill tone="bg-[#2563EB] text-white">🎬 นักตัดต่อ</Pill>
        <Pill tone="bg-white/10 text-white">🔍 ผู้ตรวจ</Pill>
        <Pill tone="bg-white/10 text-white">👑 แอดมิน</Pill>
      </A>
      <A d={0.8}><p className="text-[26px] text-[#8FA3C7]">กด → หรือแตะด้านขวาเพื่อไปต่อ</p></A>
    </div>
  );
}

function Problem() {
  const before = ["ส่งลิงก์คลิปกระจายอยู่หลายแชท", "ไม่รู้ว่าคลิปไหนตรวจแล้ว คลิปไหนรอแก้", "คอมเมนต์ “แก้ช่วงไหน” หายง่าย", "งานกองที่บางคน บางคนว่าง"];
  const after = ["ทุกคลิปมีสถานะชัด ตั้งแต่มอบหมายถึงเผยแพร่", "คอมเมนต์ปักหมุดเวลา เช่น [01:15]", "แจ้งเตือนผ่าน LINE ทุกขั้นตอน", "จัดสรรงานให้ทุกคนเท่าๆ กันอัตโนมัติ"];
  return (
    <Shell eyebrow="ทำไมต้อง ClipFlow" title="จากแชทที่ตามงานยาก สู่ระบบที่เห็นทุกขั้นตอน" num={2}>
      <div className="grid h-full grid-cols-2 gap-10">
        <A d={0.3} kind="sl-left"><Card className="h-full">
          <p className="text-[30px] font-bold text-[#B4532A]">ก่อนใช้ระบบ</p>
          <ul className="mt-6 space-y-5">{before.map((t, i) => <A key={t} d={0.5 + i * 0.15}><li className="flex gap-4 text-[32px] text-[#475569]"><span className="text-[#E8742A]">✕</span>{t}</li></A>)}</ul>
        </Card></A>
        <A d={0.6}><div className="h-full rounded-[28px] bg-[#10213F] p-10">
          <p className="text-[30px] font-bold text-[#7FB0FF]">เมื่อใช้ ClipFlow</p>
          <ul className="mt-6 space-y-5">{after.map((t, i) => <A key={t} d={0.9 + i * 0.15}><li className="flex gap-4 text-[32px] text-[#DCE6F7]"><span className="text-[#4ADE80]">✓</span>{t}</li></A>)}</ul>
        </div></A>
      </div>
    </Shell>
  );
}

function Flow() {
  const nodes = [
    ["📋", "มอบหมายงาน", "แอดมิน", "bg-violet-100"],
    ["🎬", "ตัดต่อ & ส่งคลิป", "นักตัดต่อ", "bg-blue-100"],
    ["🔍", "ตรวจงาน", "ผู้ตรวจ", "bg-sky-100"],
    ["✅", "ผ่านอนุมัติ", "ผู้ตรวจ", "bg-emerald-100"],
    ["📣", "เผยแพร่", "แอดมิน", "bg-amber-100"],
  ];
  return (
    <Shell eyebrow="ภาพรวมการทำงาน" title="คลิปหนึ่งคลิปเดินทางอย่างไร" num={3}>
      {/* Absolute positions are relative to the slide body below the title. */}
      <div className="absolute left-[150px] top-[150px] h-[6px] w-[1410px] rounded bg-[#DCE3EE]" />
      {nodes.map(([icon, title, who, tone], i) => (
        <A key={title} d={0.2 + i * 0.15} kind="sl-pop" className="absolute top-[40px]" style={{ left: i * 352 }}>
          <div className="sl-node flex h-[230px] w-[300px] flex-col items-center justify-center gap-3 rounded-[28px] border-[3px] border-[#DCE3EE] bg-white" style={{ animationDelay: `${i * 2}s` }}>
            <span className={`flex h-20 w-20 items-center justify-center rounded-full text-[42px] ${tone}`}>{icon}</span>
            <span className="text-[32px] font-bold">{title}</span>
            <span className="text-[24px] text-[#64748B]">{who}</span>
          </div>
        </A>
      ))}
      <div className="sl-dot absolute top-[138px] h-8 w-8 rounded-full bg-[#2563EB] shadow-[0_0_0_10px_rgba(37,99,235,0.18)]" />
      {/* Revision loop */}
      <A d={1.2} className="absolute left-[500px] top-[300px] h-[150px] w-[700px] rounded-b-[70px] border-[4px] border-t-0 border-dashed border-[#E8742A]" />
      <div className="sl-back absolute h-6 w-6 rounded-full bg-[#E8742A]" style={{ marginTop: -260 }} />
      <A d={1.4} className="absolute left-[560px] top-[470px] w-[580px] text-center">
        <p className="text-[30px] font-bold text-[#B4532A]">ถ้าผู้ตรวจสั่งแก้ไข → กลับไปส่งใหม่</p>
        <p className="mt-1 text-[24px] text-[#64748B]">ระบบเก็บทุกเวอร์ชันและคอมเมนต์ไว้ย้อนดูได้</p>
      </A>
    </Shell>
  );
}

function Roles() {
  const roles = [
    { icon: "🎬", name: "นักตัดต่อ", tone: "bg-blue-50 text-blue-700", items: ["ดูงานที่ได้รับมอบหมาย", "ส่งคลิป (Drive / YouTube)", "แก้ไขตามคอมเมนต์"] },
    { icon: "🔍", name: "ผู้ตรวจ", tone: "bg-sky-50 text-sky-700", items: ["ดูคิวคลิปรอตรวจ", "ปักหมุดเวลาที่ต้องแก้", "อนุมัติ / ส่งกลับแก้ไข"] },
    { icon: "👑", name: "แอดมิน", tone: "bg-amber-50 text-amber-800", items: ["สร้างโปรเจกต์ & สมาชิก", "มอบหมายและจัดสรรงาน", "วางคิวเผยแพร่ & ดูรายงาน"] },
  ];
  return (
    <Shell eyebrow="บทบาทผู้ใช้งาน" title="ใครทำอะไรในระบบ" num={4}>
      <div className="grid h-full grid-cols-3 gap-10">
        {roles.map((r, i) => (
          <A key={r.name} d={0.3 + i * 0.2} kind="sl-pop"><Card className="flex h-full flex-col gap-6">
            <span className={`flex h-24 w-24 items-center justify-center rounded-3xl text-[52px] ${r.tone}`}>{r.icon}</span>
            <p className="text-[44px] font-bold" style={{ fontFamily: HEAD }}>{r.name}</p>
            <ul className="space-y-4">{r.items.map((t) => <li key={t} className="flex gap-3 text-[30px] text-[#475569]"><span className="text-[#2563EB]">•</span>{t}</li>)}</ul>
          </Card></A>
        ))}
      </div>
    </Shell>
  );
}

function Statuses() {
  const rows: [string, string, string][] = [
    ["DRAFT", "แอดมินสร้างงานแล้ว ยังไม่ได้ส่งคลิป", "นักตัดต่อ"],
    ["PENDING_REVIEW", "ส่งคลิปแล้ว รอผู้ตรวจ", "ผู้ตรวจ"],
    ["IN_REVIEW", "ผู้ตรวจกำลังตรวจ", "ผู้ตรวจ"],
    ["NEEDS_REVISION", "ถูกสั่งแก้ ดูคอมเมนต์แล้วส่งใหม่", "นักตัดต่อ"],
    ["APPROVED", "ผ่านอนุมัติ พร้อมเผยแพร่", "แอดมิน"],
    ["PUBLISHED", "โพสต์ลงแพลตฟอร์มแล้ว", "—"],
  ];
  return (
    <Shell eyebrow="สถานะของคลิป" title="ดูสถานะแล้วรู้ทันทีว่าใครต้องทำอะไรต่อ" num={5}>
      <div className="overflow-hidden rounded-[28px] border border-[#E2E6EE] bg-white">
        <div className="grid grid-cols-[300px_1fr_260px] bg-[#EEF2F8] px-10 py-5 text-[26px] font-bold text-[#475569]"><span>สถานะ</span><span>ความหมาย</span><span>ใครทำต่อ</span></div>
        {rows.map(([key, meaning, who], i) => (
          <A key={key} d={0.3 + i * 0.12} kind="sl-left" className="grid grid-cols-[300px_1fr_260px] items-center border-t border-[#EEF2F8] px-10 py-[18px]">
            <span><Pill tone={STATUS[key].tone}>{STATUS[key].label}</Pill></span>
            <span className="text-[30px]">{meaning}</span>
            <span className="text-[30px] font-bold text-[#2563EB]">{who}</span>
          </A>
        ))}
      </div>
    </Shell>
  );
}

function Login() {
  return (
    <Shell eyebrow="เริ่มต้นใช้งาน" title="เข้าสู่ระบบด้วย LINE และตั้งค่าโปรไฟล์" num={6}>
      <div className="grid h-full grid-cols-[1fr_640px] gap-16">
        <div className="flex flex-col justify-center gap-10">
          <Step n={1} title="กด “ดำเนินการต่อด้วย LINE”" text="ไม่ต้องสมัครหรือจำรหัสผ่าน ใช้บัญชี LINE ที่มีอยู่" d={0.3} />
          <Step n={2} title="ยืนยันใน LINE" text="บนแอปที่ติดตั้งในมือถือ ระบบพาไปยืนยันแล้วพากลับเข้าแอปเอง" d={0.6} />
          <Step n={3} title="ตั้งชื่อที่แสดง + เบอร์ + อีเมล" text="ถามเฉพาะครั้งแรก กด “ไว้ทีหลัง” ได้ แอดมินยังเห็นชื่อใน LINE แยกไว้" d={0.9} />
        </div>
        <A d={0.5} kind="sl-pop"><div className="rounded-[56px] border-[14px] border-[#1E293B] bg-white p-8 shadow-2xl">
          <p className="text-[30px] font-bold">ยินดีต้อนรับสู่ ClipFlow 👋</p>
          <div className="mt-6 space-y-5">
            <Field label="ชื่อที่แสดงในระบบ *" value="สมชาย ตัดต่อ" />
            <Field label="ชื่อใน LINE" value="Somchai 🎬" />
            <Field label="เบอร์โทรศัพท์" value="081-234-5678" />
            <Field label="อีเมล" placeholder="name@example.com" />
          </div>
          <div className="mt-7 flex justify-end gap-3"><Btn tone="text-[#64748B]">ไว้ทีหลัง</Btn><Btn className="sl-pulse">บันทึกข้อมูล</Btn></div>
        </div></A>
      </div>
    </Shell>
  );
}

function Mobile() {
  return (
    <Shell eyebrow="ใช้งานบนมือถือ" title="ใช้ผ่านเมนู LINE หรือติดตั้งเป็นแอป" num={7}>
      <div className="grid h-full grid-cols-[980px_1fr] gap-12">
        <A d={0.3} kind="sl-pop"><img src="/Image/RichMenu_Menu.png" alt="เมนู LINE ของ ClipFlow" className="w-full rounded-[28px] border border-[#E2E6EE] shadow-xl" /></A>
        <div className="flex flex-col justify-center gap-8">
          <A d={0.6}><Card className="p-8"><p className="text-[32px] font-bold">💬 เมนูใน LINE</p><p className="mt-2 text-[27px] text-[#475569]">เพิ่มเพื่อน ClipFlow แล้วกดเมนู: งานของฉัน · ส่งคลิปใหม่ · ดูสถานะ</p></Card></A>
          <A d={0.8}><Card className="p-8"><p className="text-[32px] font-bold">📲 ติดตั้งเป็นแอป</p><p className="mt-2 text-[27px] text-[#475569]">Android: ติดตั้งแอป · iPhone: แชร์ → เพิ่มไปยังหน้าจอโฮม</p></Card></A>
          <A d={1.0}><Card className="p-8"><p className="text-[32px] font-bold">🔔 แจ้งเตือนบนเครื่อง</p><p className="mt-2 text-[27px] text-[#475569]">กด “เปิดการแจ้งเตือนบนอุปกรณ์” ไม่พลาดงานใหม่</p></Card></A>
        </div>
      </div>
    </Shell>
  );
}

function Projects() {
  return (
    <Shell eyebrow="แอดมิน · ขั้นที่ 1" title="สร้างโปรเจกต์และเพิ่มสมาชิก" num={8}>
      <div className="grid h-full grid-cols-2 gap-12">
        <A d={0.3} kind="sl-left"><Card className="flex h-full flex-col gap-6">
          <p className="text-[34px] font-bold">สร้างโปรเจกต์ใหม่</p>
          <Field label="ชื่อโปรเจกต์ (รายการ)" value="รายการ ALMADARIJ" />
          <Field label="รายละเอียด (ตัวเลือก)" placeholder="คำอธิบายสั้นๆ..." />
          <div className="mt-auto flex justify-end"><Btn>สร้างโปรเจกต์</Btn></div>
        </Card></A>
        <A d={0.7}><Card className="flex h-full flex-col gap-6">
          <p className="text-[34px] font-bold">เพิ่มสมาชิกเข้าโปรเจกต์</p>
          <div className="flex flex-wrap gap-3 rounded-2xl border-2 border-[#DCE3EE] p-4">
            {["สมชาย", "มานี", "ปิติ"].map((n, i) => <A key={n} d={1 + i * 0.25} kind="sl-pop"><span className="rounded-xl bg-blue-50 px-4 py-2 text-[26px] font-bold text-blue-700">{n} ✕</span></A>)}
          </div>
          <Btn className="self-start">เพิ่มลงโปรเจกต์</Btn>
          <p className="mt-auto rounded-2xl bg-amber-50 p-5 text-[26px] text-amber-900">มอบหมายงานได้เฉพาะสมาชิกของโปรเจกต์ — นักตัดต่อเห็นเฉพาะโปรเจกต์ที่เป็นสมาชิก</p>
        </Card></A>
      </div>
    </Shell>
  );
}

function Sheet() {
  const rows = [["1", "ทำไมคนทำดีถึงหมดไฟ?", "สมชาย"], ["2", "คน Toxic มีทุกยุค", "มานี"], ["3", "มุมกลับ การตำหนิคนทำดี", ""]];
  return (
    <Shell eyebrow="แอดมิน · ขั้นที่ 2" title="สร้างคลิปทีละหลายรายการด้วยตารางงาน" num={9}>
      <div className="grid h-full grid-cols-[1fr_700px] gap-12">
        <A d={0.3}><Card className="h-full p-8">
          <div className="flex flex-wrap gap-3"><Btn tone="border-2 border-[#DCE3EE] bg-white text-[#10213F]">+ เพิ่มแถว</Btn><Btn tone="bg-indigo-50 text-indigo-700">วางข้อความอัตโนมัติ</Btn><Btn tone="bg-amber-50 text-amber-800">⚖️ จัดสรรงาน</Btn></div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#E2E6EE]">
            <div className="grid grid-cols-[80px_110px_1fr_220px] bg-[#EEF2F8] px-5 py-3 text-[22px] font-bold text-[#64748B]"><span>ลำดับ</span><span>ตอน</span><span>ชื่อคลิป</span><span>ผู้รับผิดชอบ</span></div>
            {rows.map(([n, name, owner], i) => (
              <A key={n} d={0.8 + i * 0.3} kind="sl-left" className="grid grid-cols-[80px_110px_1fr_220px] items-center border-t border-[#EEF2F8] px-5 py-4 text-[26px]">
                <span className="font-bold text-[#94A3B8]">{n}</span><span>EP7</span><span className="truncate pr-3">{name}</span>
                <span className={owner ? "font-bold" : "text-[#94A3B8]"}>{owner || "เลือกคนตัดต่อ…"}</span>
              </A>
            ))}
          </div>
          <div className="mt-6 flex justify-end"><Btn tone="bg-emerald-600 text-white">บันทึกทั้งหมด</Btn></div>
        </Card></A>
        <A d={0.6}><div className="h-full rounded-[28px] bg-[#0F172A] p-8 text-[26px] leading-[1.6] text-[#E2E8F0]" style={{ fontFamily: "ui-monospace, Consolas, monospace" }}>
          <p className="mb-4 text-[24px] font-bold text-[#7FB0FF]" style={{ fontFamily: "inherit" }}>วางข้อความอัตโนมัติ (Import)</p>
          <p className="sl-type" style={{ animationDelay: "1s" }}>ไฮไลท์อีพี 7 คลิป 1</p>
          <p className="sl-type" style={{ animationDelay: "2.4s" }}>&quot;ทำไมคนทำดีถึงหมดไฟ?&quot;</p>
          <p className="sl-type" style={{ animationDelay: "3.8s" }}>🕣 เวลา 05:20 - 06:45</p>
          <p className="mt-6 text-[24px] text-[#94A3B8]">ระบบแยกเป็นแถวให้อัตโนมัติ: เลขตอน · ชื่อคลิป · ช่วงเวลา และลำดับคลิปไม่สลับ</p>
        </div></A>
      </div>
    </Shell>
  );
}

function Balance() {
  const people = [
    { name: "สมชาย", before: 4, add: 1 },
    { name: "มานี", before: 1, add: 3 },
    { name: "ปิติ", before: 0, add: 4 },
    { name: "ชูใจ", before: 2, add: 2 },
  ];
  const max = 6;
  return (
    <Shell eyebrow="แอดมิน · ขั้นที่ 3" title="จัดสรรงานให้ทุกคนเท่าๆ กัน" num={10}>
      <div className="grid h-full grid-cols-[1fr_620px] gap-12">
        <A d={0.3}><Card className="h-full">
          <div className="flex items-center justify-between"><p className="text-[32px] font-bold">ภาระงานค้าง (เดิม → หลังจัด)</p><Pill tone="bg-blue-50 text-blue-700">เกลี่ยตามภาระงาน</Pill></div>
          <div className="mt-8 space-y-7">
            {people.map((p, i) => (
              <div key={p.name} className="grid grid-cols-[160px_1fr_150px] items-center gap-6">
                <span className="text-[30px] font-bold">{p.name}</span>
                <div className="relative h-8 overflow-hidden rounded-full bg-[#EEF2F8]">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-[#94A3B8]" style={{ width: `${(p.before / max) * 100}%` }} />
                  <div className="sl-grow absolute inset-y-0 rounded-r-full bg-[#2563EB]" style={{ left: `${(p.before / max) * 100}%`, width: `${(p.add / max) * 100}%`, animationDelay: `${0.8 + i * 0.25}s` }} />
                </div>
                <span className="text-right text-[28px] tabular-nums"><span className="text-[#94A3B8]">{p.before}</span> → <b>{p.before + p.add}</b> <span className="text-[#2563EB]">(+{p.add})</span></span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[26px] text-[#475569]">10 คลิปใหม่ถูกแจกให้คนที่ว่างกว่าก่อน → ทุกคนมีงานค้าง 4–5 คลิป</p>
        </Card></A>
        <div className="flex flex-col gap-6">
          <A d={0.5}><Card className="p-8"><p className="text-[30px] font-bold">⚖️ เกลี่ยตามภาระงาน</p><p className="mt-1 text-[25px] text-[#475569]">ให้คนที่งานค้างน้อยก่อน (แนะนำ)</p></Card></A>
          <A d={0.7}><Card className="p-8"><p className="text-[30px] font-bold">➗ แบ่งเท่ากัน</p><p className="mt-1 text-[25px] text-[#475569]">แจกจำนวนเท่ากัน ไม่สนงานเดิม</p></Card></A>
          <A d={0.9}><Card className="p-8"><p className="text-[30px] font-bold">🎲 สุ่มจับคู่</p><p className="mt-1 text-[25px] text-[#475569]">สุ่มแต่จำนวนเท่ากัน กดสุ่มใหม่ได้</p></Card></A>
          <A d={1.1}><p className="text-[25px] text-[#475569]">แก้คนรับรายคลิปได้เอง แล้วกด <b>บันทึกทั้งหมด</b> ระบบจึงแจ้งเตือนผู้รับงาน</p></A>
        </div>
      </div>
    </Shell>
  );
}

function Submit() {
  return (
    <Shell eyebrow="นักตัดต่อ" title="ส่งคลิปให้ตรวจ ด้วยลิงก์ Google Drive หรือ YouTube" num={11}>
      <div className="grid h-full grid-cols-[1fr_760px] gap-14">
        <div className="flex flex-col justify-center gap-10">
          <Step n={1} title="เปิด “งานของฉัน”" text="เห็นงานที่ได้รับมอบหมาย พร้อมสถานะ รอส่งงาน / สั่งแก้ไข" d={0.3} />
          <Step n={2} title="อัปโหลดแล้วตั้งค่าการแชร์" text="Drive: ทุกคนที่มีลิงก์ · YouTube: ไม่เป็นสาธารณะ (Unlisted)" d={0.6} />
          <Step n={3} title="วางลิงก์แล้วกดส่ง" text="สถานะเป็น “รอตรวจ” และผู้ตรวจได้รับแจ้งเตือนทันที" d={0.9} />
        </div>
        <A d={0.5} kind="sl-pop"><Card className="flex flex-col gap-6">
          <p className="text-[32px] font-bold">ส่งคลิปตรวจงาน</p>
          <div className="flex flex-col gap-2">
            <span className="text-[22px] font-bold text-[#64748B]">ลิงก์วิดีโอ (Google Drive หรือ YouTube) *</span>
            <span className="rounded-2xl border-2 border-[#2563EB] bg-white px-5 py-3.5 text-[24px]"><span className="sl-type inline-block max-w-full align-bottom" style={{ animationDelay: "1s" }}>https://youtu.be/abc123XYZ</span></span>
          </div>
          <Field label="หมายเหตุ (ถ้ามี)" value="ใช้ดนตรีชุดใหม่" />
          <div className="flex gap-3"><Pill tone="bg-[#E8F0FE] text-[#1A56DB]">▶ Google Drive</Pill><Pill tone="bg-rose-50 text-rose-700">▶ YouTube</Pill></div>
          <Btn className="sl-pulse self-end">ส่งคลิปตรวจงาน 🚀</Btn>
        </Card></A>
      </div>
    </Shell>
  );
}

function Review() {
  return (
    <Shell eyebrow="ผู้ตรวจ" title="ตรวจคลิป ปักหมุดเวลา แล้วตัดสินใจ" num={12}>
      <div className="grid h-full grid-cols-[1fr_620px] gap-10">
        <A d={0.3}><div className="relative flex h-full items-center justify-center overflow-hidden rounded-[28px] bg-[#0F172A]">
          <span className="sl-pulse flex h-32 w-32 items-center justify-center rounded-full bg-white/15 text-[64px] text-white">▶</span>
          <div className="absolute inset-x-8 bottom-8 h-2 rounded-full bg-white/20"><div className="sl-grow h-full w-[38%] rounded-full bg-[#2563EB]" style={{ animationDelay: "0.6s" }} /></div>
          <span className="absolute bottom-14 left-[38%] -translate-x-1/2 rounded-lg bg-[#E8742A] px-3 py-1 text-[22px] font-bold text-white">📌 01:15</span>
        </div></A>
        <A d={0.6} kind="sl-pop"><Card className="flex h-full flex-col gap-6">
          <div className="flex items-center justify-between"><p className="text-[30px] font-bold">ดำเนินการตรวจ</p><Pill tone="bg-sky-50 text-sky-700">ติดขอบจอเสมอ</Pill></div>
          <Btn tone="border-2 border-[#DCE3EE] bg-white text-[#10213F]" className="self-start">📌 ปักหมุดเวลา</Btn>
          <div className="rounded-2xl border-2 border-[#DCE3EE] p-5 text-[26px] leading-relaxed">
            <A d={1.2}><p><b className="text-[#C2410C]">[01:15]</b> เสียงดนตรีดังกลบเสียงพูด</p></A>
            <A d={1.6}><p><b className="text-[#C2410C]">[02:40]</b> ตัดช่วงเงียบออก</p></A>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-4"><Btn tone="bg-rose-600 text-white">✕ ส่งกลับแก้ไข</Btn><Btn tone="bg-emerald-600 text-white">✓ ผ่านอนุมัติ</Btn></div>
          <p className="text-[23px] text-[#64748B]">บนมือถือ: แถบ “✍️ ตรวจงาน” ลอยเหนือเมนู แตะแล้วเปิดแผงตรวจจากด้านล่าง</p>
        </Card></A>
      </div>
    </Shell>
  );
}

function Revise() {
  const steps = [
    { tag: "ส่งรอบที่ 1", text: "นักตัดต่อส่งคลิป", tone: "bg-amber-100 text-amber-800", s: "รอตรวจ" },
    { tag: "ผลตรวจ", text: "[01:15] ลดเสียงดนตรี", tone: "bg-rose-100 text-rose-800", s: "สั่งแก้ไข" },
    { tag: "ส่งรอบที่ 2", text: "แก้ช่วง 01:15 เรียบร้อย", tone: "bg-amber-100 text-amber-800", s: "รอตรวจ" },
    { tag: "ผลตรวจ", text: "เยี่ยมมาก พร้อมเผยแพร่", tone: "bg-emerald-100 text-emerald-800", s: "ผ่านอนุมัติ" },
  ];
  return (
    <Shell eyebrow="รอบแก้ไข" title="ทุกเวอร์ชันและคอมเมนต์ถูกเก็บไว้ครบ" num={13}>
      <div className="relative flex h-full items-center">
        <div className="absolute left-0 right-0 top-1/2 h-[6px] -translate-y-1/2 rounded bg-[#DCE3EE]"><div className="sl-grow h-full rounded bg-[#2563EB]" style={{ animationDelay: "0.4s", animationDuration: "3s" }} /></div>
        <div className="relative grid w-full grid-cols-4 gap-8">
          {steps.map((st, i) => (
            <A key={i} d={0.5 + i * 0.6} kind="sl-pop"><Card className={`flex flex-col gap-4 p-8 ${i % 2 ? "translate-y-[150px]" : "-translate-y-[150px]"}`}>
              <p className="text-[24px] font-bold text-[#64748B]">{st.tag}</p>
              <p className="text-[30px] font-bold leading-snug">{st.text}</p>
              <Pill tone={st.tone}>{st.s}</Pill>
            </Card></A>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Notify() {
  const bubbles = [
    { head: "📋 งานใหม่ได้รับมอบหมาย", color: "#7C3AED", body: "EP7 คลิป 1 · ทำไมคนทำดีถึงหมดไฟ?" },
    { head: "🔍 มีคลิปรอตรวจ", color: "#2563EB", body: "สมชาย ส่งงานรอบที่ 1" },
    { head: "✕ คลิปถูกสั่งแก้ไข", color: "#E11D48", body: "[01:15] ลดเสียงดนตรี" },
    { head: "✅ คลิปผ่านอนุมัติ", color: "#059669", body: "พร้อมเผยแพร่แล้ว 🎉" },
  ];
  return (
    <Shell eyebrow="การแจ้งเตือน" title="ทุกขั้นตอนแจ้งเตือนผ่าน LINE และในแอป" num={14} dark>
      <div className="grid h-full grid-cols-[1fr_640px] gap-14">
        <div className="flex flex-col gap-6 rounded-[36px] bg-[#8CABD9]/25 p-10">
          {bubbles.map((b, i) => (
            <A key={b.head} d={0.4 + i * 0.7} kind="sl-pop" className={i % 2 ? "self-end" : "self-start"}>
              <div className="w-[620px] overflow-hidden rounded-3xl bg-white shadow-xl">
                <p className="px-6 py-3 text-[26px] font-bold text-white" style={{ background: b.color }}>{b.head}</p>
                <p className="px-6 py-4 text-[26px] text-[#334155]">{b.body}</p>
              </div>
            </A>
          ))}
        </div>
        <div className="flex flex-col justify-center gap-6">
          {["💬 LINE ส่วนตัว และกลุ่มทีมตรวจ", "🔔 ศูนย์แจ้งเตือนในแอป", "📲 แจ้งเตือนบนเครื่อง (PWA)", "🔁 เปลี่ยนบทบาท ก็แจ้งเตือน"].map((t, i) => (
            <A key={t} d={0.6 + i * 0.25} kind="sl-left"><p className="rounded-2xl bg-white/10 px-7 py-5 text-[30px] font-bold">{t}</p></A>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Publish() {
  const tabs = [["ทั้งหมด", ""], ["ยังไม่จัดคิว", "3"], ["ถึงกำหนดแล้ว", "1"], ["จัดคิวแล้ว", "5"], ["โพสต์ครบ", "12"]];
  return (
    <Shell eyebrow="หลังอนุมัติ" title="จัดคิวเผยแพร่และบันทึกการโพสต์" num={15}>
      <div className="flex h-full flex-col gap-6">
        <A d={0.3} className="flex gap-3">{tabs.map(([t, n], i) => <span key={t} className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-[26px] font-bold ${i === 1 ? "bg-[#10213F] text-white" : "border-2 border-[#DCE3EE] bg-white text-[#475569]"}`}>{t}{n && <span className={`rounded-lg px-2 text-[22px] ${i === 1 ? "bg-white/20" : i === 2 ? "bg-rose-100 text-rose-700" : "bg-[#EEF2F8]"}`}>{n}</span>}</span>)}</A>
        {[
          { badge: ["ยังไม่จัดคิว", "bg-amber-100 text-amber-800"], name: "เขาพลาด…พูดยังไงให้เขาไม่หมดไฟ?", posted: 0, action: "จัดคิวโพสต์", tone: "bg-[#2563EB] text-white" },
          { badge: ["ถึงกำหนดแล้ว", "bg-rose-100 text-rose-800"], name: "คน Toxic มีทุกยุค", posted: 2, action: "บันทึกการโพสต์", tone: "bg-rose-600 text-white" },
        ].map((row, i) => (
          <A key={row.name} d={0.6 + i * 0.35} kind="sl-left"><Card className="flex items-center justify-between gap-8 p-8">
            <div>
              <Pill tone={row.badge[1]}>{row.badge[0]}</Pill>
              <p className="mt-3 text-[34px] font-bold">{row.name}</p>
              <div className="mt-3 flex items-center gap-3">{[0, 1, 2, 3].map((k) => <span key={k} className={`h-3 w-14 rounded-full ${k < row.posted ? "bg-emerald-500" : "bg-[#DCE3EE]"}`} />)}<span className="text-[24px] text-[#64748B]">โพสต์แล้ว {row.posted}/4 แพลตฟอร์ม</span></div>
            </div>
            <Btn tone={row.tone}>{row.action}</Btn>
          </Card></A>
        ))}
        <A d={1.4}><p className="text-[26px] text-[#475569]">ในหน้าต่างเผยแพร่: ดาวน์โหลดคลิป · คัดลอกไตเติ้ลและแคปชั่น · ติ๊กแพลตฟอร์มที่โพสต์แล้ว (TikTok, YouTube Shorts, Facebook Reels, Instagram Reels)</p></A>
      </div>
    </Shell>
  );
}

function Insights() {
  const kpis = [["งานที่ส่งเข้ามา", "48"], ["ผ่านอนุมัติ", "36"], ["ผ่านรอบแรก", "72%"], ["เวลาตรวจเฉลี่ย", "5.2 ชม."]];
  return (
    <Shell eyebrow="ติดตามผล" title="แดชบอร์ดและรายงานวิเคราะห์ ทุกบทบาทเปิดดูได้" num={16}>
      <div className="flex h-full flex-col gap-8">
        <div className="grid grid-cols-4 gap-6">{kpis.map(([k, v], i) => <A key={k} d={0.3 + i * 0.15} kind="sl-pop"><Card className="p-8"><p className="text-[24px] font-bold text-[#64748B]">{k}</p><p className="mt-2 text-[64px] font-bold" style={{ fontFamily: HEAD }}>{v}</p></Card></A>)}</div>
        <A d={0.9} className="flex-1"><Card className="h-full p-8">
          <div className="flex items-center gap-8 text-[24px] text-[#475569]"><span className="flex items-center gap-2"><span className="h-1 w-8 rounded bg-[#2563EB]" />ส่งงาน</span><span className="flex items-center gap-2"><span className="h-1 w-8 rounded bg-[#1BAF7A]" />อนุมัติ</span></div>
          <svg viewBox="0 0 1600 260" className="mt-4 h-[230px] w-full" aria-label="กราฟการส่งงานและการอนุมัติรายวัน">
            {[0, 1, 2, 3].map((g) => <line key={g} x1="0" x2="1600" y1={20 + g * 70} y2={20 + g * 70} stroke="#E4E4E7" strokeWidth="2" />)}
            <polyline className="sl-draw" style={{ animationDelay: "1.1s" }} fill="none" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" points="0,200 230,150 460,170 690,90 920,120 1150,60 1380,80 1600,30" />
            <polyline className="sl-draw" style={{ animationDelay: "1.5s" }} fill="none" stroke="#1BAF7A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" points="0,230 230,200 460,190 690,150 920,140 1150,110 1380,100 1600,70" />
          </svg>
        </Card></A>
        <A d={1.6}><p className="text-[26px] text-[#475569]">นักตัดต่อเห็น “สถิติของฉัน” · ผู้ตรวจและแอดมินเห็นภาพรวมทีม พร้อมตารางนักตัดต่อและผู้ตรวจ (ตัวเลขในภาพเป็นตัวอย่าง)</p></A>
      </div>
    </Shell>
  );
}

function Help() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 bg-[linear-gradient(135deg,#10213F_0%,#17346B_100%)] text-center text-[#F6F7FB]">
      <A d={0} kind="sl-pop"><img src="/Image/Clipflow.png" alt="" className="sl-float h-[220px] w-[220px] object-contain" /></A>
      <A d={0.2}><h2 className="text-[92px] font-bold" style={{ fontFamily: HEAD }}>พร้อมเริ่มใช้งานแล้ว</h2></A>
      <A d={0.4}><p className="text-[40px] text-[#C9D6EE]">อ่านคู่มือทีละขั้นตอนพร้อมภาพประกอบได้ทุกเมื่อ</p></A>
      <A d={0.6} className="flex gap-6">
        <span className="rounded-3xl bg-white px-10 py-6 text-[40px] font-bold text-[#10213F]">📖 /docs</span>
        <span className="rounded-3xl bg-white/10 px-10 py-6 text-[40px] font-bold">❓ เมนู “คู่มือการใช้งาน”</span>
      </A>
      <A d={0.9}><p className="text-[28px] text-[#8FA3C7]">clipflow-tmyda.vercel.app</p></A>
    </div>
  );
}

export const SLIDES: { title: string; Component: () => ReactNode }[] = [
  { title: "ClipFlow", Component: Cover },
  { title: "ทำไมต้อง ClipFlow", Component: Problem },
  { title: "ภาพรวมการทำงาน", Component: Flow },
  { title: "บทบาทผู้ใช้งาน", Component: Roles },
  { title: "สถานะของคลิป", Component: Statuses },
  { title: "เข้าสู่ระบบ", Component: Login },
  { title: "ใช้งานบนมือถือ", Component: Mobile },
  { title: "สร้างโปรเจกต์", Component: Projects },
  { title: "ตารางงาน", Component: Sheet },
  { title: "จัดสรรงาน", Component: Balance },
  { title: "ส่งคลิป", Component: Submit },
  { title: "ตรวจคลิป", Component: Review },
  { title: "รอบแก้ไข", Component: Revise },
  { title: "การแจ้งเตือน", Component: Notify },
  { title: "เผยแพร่", Component: Publish },
  { title: "ติดตามผล", Component: Insights },
  { title: "เริ่มใช้งาน", Component: Help },
];
