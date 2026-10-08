import Image from "next/image";
import {
  CheckCircle2,
  Clapperboard,
  Eye,
  Megaphone,
  Pencil,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Callout,
  DocLink,
  Figure,
  Focus,
  H2,
  LineBubble,
  Mark,
  MockButton,
  MockCard,
  MockInput,
  P,
  Step,
  Steps,
  Table,
  UI,
  UL,
} from "../_components/docs-ui";

export function Overview() {
  const flow = [
    {
      icon: Pencil,
      title: "มอบหมายงาน",
      who: "แอดมิน",
      color: "bg-violet-100 text-violet-700",
    },
    {
      icon: Clapperboard,
      title: "ตัดต่อ & ส่งคลิป",
      who: "นักตัดต่อ",
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: Eye,
      title: "ตรวจงาน",
      who: "ผู้ตรวจ",
      color: "bg-sky-100 text-sky-700",
    },
    {
      icon: CheckCircle2,
      title: "อนุมัติ",
      who: "ผู้ตรวจ",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: Megaphone,
      title: "เผยแพร่",
      who: "แอดมิน",
      color: "bg-amber-100 text-amber-700",
    },
  ];
  return (
    <>
      <P>
        ClipFlow คือระบบติดตามงานตัดต่อคลิป ตั้งแต่แอดมินมอบหมายงาน
        นักตัดต่อส่งคลิป ผู้ตรวจตรวจและคอมเมนต์ จนคลิปผ่านอนุมัติและนำไปเผยแพร่
        ทุกขั้นตอนมีแจ้งเตือนผ่าน LINE ทำให้ไม่ต้องไล่ถามในแชท
      </P>

      <H2 id="workflow">ภาพรวมการทำงาน</H2>
      <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {flow.map((item, index) => (
          <div
            key={item.title}
            className="relative rounded-xl border border-slate-200 bg-white p-3 text-center"
          >
            <div
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${item.color}`}
            >
              <item.icon size={20} />
            </div>
            <div className="mt-2 text-[13px] font-bold text-slate-900">
              {index + 1}. {item.title}
            </div>
            <div className="text-[12px] text-slate-500">{item.who}</div>
          </div>
        ))}
      </div>
      <P>
        ถ้าผู้ตรวจสั่งแก้ไข งานจะวนกลับไปที่นักตัดต่อเพื่อส่งเวอร์ชันใหม่
        ระบบเก็บทุกเวอร์ชัน (Revision) พร้อมคอมเมนต์ไว้ให้ย้อนดูได้เสมอ
      </P>

      <H2 id="roles">บทบาทผู้ใช้งาน</H2>
      <Table
        head={["บทบาท", "ทำอะไรได้บ้าง", "อ่านต่อ"]}
        rows={[
          [
            "🎬 นักตัดต่อ (USER)",
            "ดูงานที่ได้รับมอบหมาย ส่งคลิป แก้ไขตามคอมเมนต์",
            <DocLink key="u" href="/docs/editor-tasks">
              สำหรับนักตัดต่อ
            </DocLink>,
          ],
          [
            "🔍 ผู้ตรวจ (REVIEWER)",
            "ตรวจคลิป ปักหมุดเวลาที่ต้องแก้ อนุมัติหรือส่งกลับแก้ไข",
            <DocLink key="r" href="/docs/review-clip">
              สำหรับผู้ตรวจ
            </DocLink>,
          ],
          [
            "👑 แอดมิน (ADMIN)",
            "ทุกอย่างของผู้ตรวจ + สร้างโปรเจกต์ มอบหมายงาน จัดการผู้ใช้ วางคิวเผยแพร่",
            <DocLink key="a" href="/docs/projects">
              สำหรับแอดมิน
            </DocLink>,
          ],
        ]}
      />
      <P>
        บทบาทเริ่มต้นของผู้ใช้ใหม่คือนักตัดต่อ แอดมินเปลี่ยนบทบาทให้ได้
        และระบบจะแจ้งเตือนผู้ใช้ทาง LINE ทันที
      </P>

      <H2 id="statuses">สถานะของคลิป</H2>
      <Table
        head={["สถานะ", "ความหมาย", "ใครทำต่อ"]}
        rows={[
          [
            <StatusBadge key="d" status="DRAFT" />,
            "แอดมินสร้างงานแล้ว ยังไม่ได้ส่งคลิป",
            "นักตัดต่อ",
          ],
          [
            <StatusBadge key="p" status="PENDING_REVIEW" />,
            "ส่งคลิปแล้ว รอผู้ตรวจ",
            "ผู้ตรวจ",
          ],
          [
            <StatusBadge key="i" status="IN_REVIEW" />,
            "ผู้ตรวจกำลังตรวจ",
            "ผู้ตรวจ",
          ],
          [
            <StatusBadge key="n" status="NEEDS_REVISION" />,
            "ผู้ตรวจสั่งแก้ไข ดูคอมเมนต์แล้วส่งใหม่",
            "นักตัดต่อ",
          ],
          [
            <StatusBadge key="a" status="APPROVED" />,
            "ผ่านอนุมัติ พร้อมเผยแพร่",
            "แอดมิน",
          ],
          [
            <StatusBadge key="u" status="PUBLISHED" />,
            "โพสต์ลงแพลตฟอร์มแล้ว",
            "-",
          ],
        ]}
      />
      <Callout type="tip" title="เริ่มจากตรงไหนดี?">
        ผู้ใช้ใหม่ทุกคนเริ่มที่{" "}
        <DocLink href="/docs/login">เข้าสู่ระบบและตั้งค่าโปรไฟล์</DocLink>{" "}
        แล้วไปที่ <DocLink href="/docs/install-app">ติดตั้งแอปบนมือถือ</DocLink>{" "}
        เพื่อรับแจ้งเตือนได้ครบ
      </Callout>
    </>
  );
}

export function Login() {
  return (
    <>
      <P>
        ClipFlow ใช้บัญชี LINE ในการเข้าสู่ระบบ ไม่ต้องสมัครหรือจำรหัสผ่านเพิ่ม
      </P>

      <H2 id="sign-in">เข้าสู่ระบบด้วย LINE</H2>
      <Figure
        caption="หน้าเข้าสู่ระบบ: กดปุ่มสีเขียวเพื่อล็อกอินด้วย LINE"
        url="/login"
      >
        <div className="mx-auto max-w-[260px] space-y-3 py-4 text-center">
          <Image
            src="/Image/Clipflow.png"
            alt=""
            width={56}
            height={56}
            className="mx-auto rounded-xl"
          />
          <div className="text-sm font-bold text-slate-900">ClipFlow</div>
          <Focus className="inline-block">
            <MockButton tone="line" className="w-56 py-2">
              ดำเนินการต่อด้วย LINE
            </MockButton>
          </Focus>
          <div className="flex justify-center">
            <Mark n={1} />
          </div>
        </div>
      </Figure>
      <Steps>
        <Step title="เปิด ClipFlow แล้วกด “ดำเนินการต่อด้วย LINE”">
          ถ้าเปิดจากเมนูใน LINE ระบบจะพาเข้าสู่ระบบให้อัตโนมัติ
        </Step>
        <Step title="อนุญาตการเข้าถึงโปรไฟล์ LINE">
          LINE จะขอสิทธิ์ใช้ชื่อและรูปโปรไฟล์ กด <UI>อนุญาต</UI>
        </Step>
        <Step title="เข้าสู่หน้าแดชบอร์ด">
          ล็อกอินครั้งแรกจะมีหน้าต่างให้ตั้งค่าโปรไฟล์ (ดูหัวข้อถัดไป)
        </Step>
      </Steps>

      <H2 id="first-login">ตั้งค่าโปรไฟล์ครั้งแรก</H2>
      <P>
        ล็อกอินครั้งแรกระบบจะถามชื่อที่ต้องการให้ทีมเห็น
        และเบอร์โทร/อีเมลสำหรับติดต่อ ถ้ายังไม่สะดวกกด <UI>ไว้ทีหลัง</UI> ได้
        ระบบจะถามอีกครั้งในวันถัดไปจนกว่าจะกรอกเบอร์และอีเมล
      </P>
      <Figure
        caption="หน้าต่างตั้งค่าโปรไฟล์ที่ขึ้นตอนล็อกอินครั้งแรก"
        url="/dashboard"
      >
        <MockCard className="mx-auto max-w-md space-y-3">
          <div className="text-sm font-bold text-slate-900">
            ยินดีต้อนรับสู่ ClipFlow 👋
          </div>
          <div className="flex items-start gap-2">
            <Mark n={1} className="mt-5" />
            <div className="flex-1">
              <MockInput label="ชื่อที่แสดงในระบบ *" value="สมชาย ตัดต่อ" />
            </div>
          </div>
          <MockInput label="ชื่อใน LINE" value="Somchai 🎬" />
          <div className="flex items-start gap-2">
            <Mark n={2} className="mt-5" />
            <div className="grid flex-1 grid-cols-2 gap-2">
              <MockInput label="เบอร์โทรศัพท์" value="081-234-5678" />
              <MockInput label="อีเมล" value="somchai@email.com" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <MockButton tone="ghost">ไว้ทีหลัง</MockButton>
            <Focus className="inline-block">
              <MockButton>บันทึกข้อมูล</MockButton>
            </Focus>
            <Mark n={3} />
          </div>
        </MockCard>
      </Figure>
      <Steps>
        <Step title="ตั้งชื่อที่แสดงในระบบ">
          ชื่อนี้คือชื่อที่ทีมเห็นในงาน คอมเมนต์ และแจ้งเตือน
        </Step>
        <Step title="กรอกเบอร์โทรและอีเมล">
          ใช้สำหรับให้แอดมินติดต่อเท่านั้น ไม่แสดงให้ผู้ใช้อื่นเห็น
        </Step>
        <Step title="กด “บันทึกข้อมูล”" />
      </Steps>
      <Callout type="info" title="ชื่อใน LINE กับชื่อที่แสดงต่างกันอย่างไร">
        <b>ชื่อที่แสดง</b> คุณตั้งเองได้ ส่วน <b>ชื่อใน LINE</b>{" "}
        อัปเดตอัตโนมัติจากบัญชี LINE ทุกครั้งที่ล็อกอิน แอดมินใช้ชื่อ LINE
        เพื่อหาคุณในแชทกลุ่มได้ถูกคน
      </Callout>

      <H2 id="edit-profile">แก้ไขโปรไฟล์ภายหลัง</H2>
      <Steps>
        <Step title="กดรูปโปรไฟล์มุมล่างซ้าย (หรือเมนูบนมือถือ) แล้วเลือก “โปรไฟล์”">
          หรือเปิด <DocLink href="/settings/profile">/settings/profile</DocLink>{" "}
          โดยตรง
        </Step>
        <Step title="แก้ชื่อ เบอร์ หรืออีเมล แล้วกด “บันทึก”">
          ชื่อใหม่แสดงผลทันทีโดยไม่ต้องล็อกอินใหม่
        </Step>
      </Steps>
    </>
  );
}

export function InstallApp() {
  return (
    <>
      <P>ใช้ ClipFlow ได้ 3 แบบ เลือกแบบที่สะดวก ทุกแบบใช้บัญชีเดียวกัน</P>
      <Table
        head={["แบบ", "เหมาะกับ", "วิธีเปิด"]}
        rows={[
          [
            "ผ่านเมนูใน LINE (LIFF)",
            "ใช้บนมือถือบ่อย ๆ",
            "กดเมนูด้านล่างห้องแชท ClipFlow",
          ],
          [
            "แอปบนหน้าจอ (PWA)",
            "อยากได้ไอคอนแอปและแจ้งเตือนบนเครื่อง",
            "ติดตั้งจากเบราว์เซอร์ (ดูด้านล่าง)",
          ],
          [
            "เว็บเบราว์เซอร์",
            "ทำงานบนคอมพิวเตอร์",
            "เปิด clipflow.fityatulhaq.org",
          ],
        ]}
      />

      <H2 id="line-menu">ใช้งานผ่านเมนู LINE</H2>
      <Steps>
        <Step title="เพิ่มเพื่อนกับ LINE Official Account ของ ClipFlow">
          ต้องเพิ่มเพื่อนก่อน ระบบจึงส่งแจ้งเตือนเข้า LINE ได้
        </Step>
        <Step title="เปิดห้องแชท ClipFlow แล้วกดเมนูด้านล่าง">
          เมนูหลักมี 4 ปุ่มตามภาพ
        </Step>
      </Steps>
      <figure className="my-6">
        <Image
          src="/Image/RichMenu_Menu.png"
          alt="เมนู LINE ของ ClipFlow: เมนูหลัก งานของฉัน ส่งคลิปใหม่ ดูสถานะคลิป"
          width={885}
          height={537}
          className="mx-auto w-full max-w-xl rounded-xl border border-slate-200"
        />
        <figcaption className="mt-2 text-center text-[13px] text-slate-500">
          เมนูใน LINE สำหรับผู้ใช้ที่ล็อกอินแล้ว
        </figcaption>
      </figure>
      <Table
        head={["ปุ่ม", "ทำอะไร"]}
        rows={[
          ["① เมนูหลัก", "กลับไปหน้าเมนูของระบบ"],
          ["② งานของฉัน", "ดูงานที่ได้รับมอบหมายและสถานะ"],
          ["③ ส่งคลิปใหม่", "ส่งลิงก์คลิปให้ผู้ตรวจ"],
          ["④ ดูสถานะคลิป", "ติดตามผลการตรวจ"],
        ]}
      />
      <Callout type="tip">
        พิมพ์ <b>งานของฉัน</b> ในแชทส่วนตัวกับ ClipFlow
        เพื่อดูรายการงานที่ยังไม่เสร็จได้ทันที
      </Callout>

      <H2 id="pwa">ติดตั้งเป็นแอปบนมือถือ (PWA)</H2>
      <div className="grid gap-4 sm:grid-cols-2">
        <MockCard>
          <div className="text-sm font-bold text-slate-900">
            Android (Chrome)
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[14px] text-slate-700">
            <li>เปิด ClipFlow ใน Chrome</li>
            <li>
              กดปุ่ม <UI>ติดตั้งแอป ClipFlow</UI> ที่ระบบแสดง หรือเมนู ⋮ →{" "}
              <UI>ติดตั้งแอป</UI>
            </li>
            <li>เปิดจากไอคอนบนหน้าจอ</li>
          </ol>
        </MockCard>
        <MockCard>
          <div className="text-sm font-bold text-slate-900">
            iPhone (Safari)
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[14px] text-slate-700">
            <li>เปิด ClipFlow ใน Safari</li>
            <li>
              กดปุ่มแชร์ <UI>⬆︎</UI> → <UI>เพิ่มไปยังหน้าจอโฮม</UI>
            </li>
            <li>เปิดจากไอคอนบนหน้าจอ</li>
          </ol>
        </MockCard>
      </div>
      <Callout type="info" title="เปิดแจ้งเตือนบนเครื่อง">
        ในแอปให้กด <UI>เปิดการแจ้งเตือนบนอุปกรณ์</UI> แล้วอนุญาต
        จะได้รับแจ้งเตือนแม้ไม่ได้เปิด LINE (iPhone
        ต้องติดตั้งเป็นแอปบนหน้าจอโฮมก่อน)
      </Callout>
    </>
  );
}

export function Notifications() {
  return (
    <>
      <P>
        ระบบแจ้งเตือน 3 ช่องทางพร้อมกัน: <b>LINE</b>, <b>ศูนย์แจ้งเตือนในแอป</b>{" "}
        และ <b>แจ้งเตือนบนเครื่อง</b> (ถ้าเปิดไว้)
      </P>

      <H2 id="events">เหตุการณ์ที่มีแจ้งเตือน</H2>
      <Table
        head={["เหตุการณ์", "ใครได้รับ"]}
        rows={[
          ["ได้รับมอบหมายงานใหม่", "นักตัดต่อที่ได้รับงาน"],
          ["มีคลิปส่งเข้ามารอตรวจ", "ผู้ตรวจและแอดมิน (และกลุ่ม LINE ทีมตรวจ)"],
          ["คลิปถูกสั่งแก้ไข", "เจ้าของคลิป"],
          ["คลิปผ่านอนุมัติ", "เจ้าของคลิป"],
          ["บทบาทถูกเปลี่ยน", "ผู้ใช้คนนั้น"],
        ]}
      />

      <H2 id="examples">ตัวอย่างข้อความใน LINE</H2>
      <div className="my-6 flex flex-wrap justify-center gap-4 rounded-xl bg-[#8CABD9]/30 p-5">
        <LineBubble title="📋 งานใหม่ได้รับมอบหมาย" color="#7C3AED">
          <div className="font-bold">EP7 คลิป 1</div>
          <div className="text-slate-500">โปรเจกต์: บทเรียนจากอัลกุรอาน</div>
          <MockButton className="mt-1 w-full">ดูรายละเอียดงาน</MockButton>
        </LineBubble>
        <LineBubble title="✕ คลิปถูกสั่งแก้ไข" color="#E11D48">
          <div className="font-bold">EP7 คลิป 1</div>
          <div className="text-slate-500">[01:15] เสียงดนตรีดังเกินไป</div>
          <MockButton tone="danger" className="mt-1 w-full">
            เปิดดูคอมเมนต์
          </MockButton>
        </LineBubble>
        <LineBubble title="🔔 ROLE UPDATED" color="#2563EB">
          <div>บทบาทของคุณเปลี่ยนเป็น</div>
          <div className="font-bold text-blue-700">REVIEWER (ผู้ตรวจงาน)</div>
        </LineBubble>
      </div>

      <H2 id="in-app">ศูนย์แจ้งเตือนในแอป</H2>
      <P>
        กดไอคอนกระดิ่งที่แถบด้านบน หรือเมนู <UI>ศูนย์แจ้งเตือน</UI>{" "}
        เพื่อดูรายการทั้งหมด กดรายการเพื่อเปิดคลิปที่เกี่ยวข้อง และกด{" "}
        <UI>อ่านทั้งหมด</UI> เพื่อเคลียร์
      </P>
      <Callout type="warn" title="ไม่ได้รับแจ้งเตือนทาง LINE?">
        ตรวจสอบว่าเพิ่มเพื่อนกับ LINE Official Account ของ ClipFlow แล้ว
        และไม่ได้บล็อก ในหน้า <UI>ศูนย์แจ้งเตือน</UI> มีปุ่ม{" "}
        <UI>ทดสอบส่งแจ้งเตือนเข้า LINE บัญชีของคุณ</UI> ให้ลองกดดู
      </Callout>
    </>
  );
}
