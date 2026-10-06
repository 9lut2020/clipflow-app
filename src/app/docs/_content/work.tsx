import { StatusBadge } from "@/components/ui/status-badge";
import {
  Callout, Code, DocLink, Figure, Focus, H2, Mark, MockButton, MockCard, MockInput, MockLines, P, Step, Steps, Table, UI, UL,
} from "../_components/docs-ui";

function TaskRow({ name, status, focus }: { name: string; status: string; focus?: boolean }) {
  const row = (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-[12px] font-bold text-slate-900">{name}</div>
        <div className="text-[11px] text-slate-500">บทเรียนจากอัลกุรอาน • EP7</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={status} />
        {focus && <MockButton>ส่งงาน</MockButton>}
      </div>
    </div>
  );
  return focus ? <Focus>{row}</Focus> : row;
}

export function EditorTasks() {
  return (
    <>
      <P>หน้า <UI>งานของฉัน</UI> รวมทุกคลิปที่แอดมินมอบหมายให้คุณ เรียงตามโปรเจกต์และตอน</P>
      <Figure caption="หน้างานของฉัน: งานที่ต้องทำมีปุ่มส่งงานอยู่ท้ายแถว" url="/tasks">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700"><Mark n={1} /> งานของฉัน (3)</div>
          <div className="flex items-start gap-2">
            <Mark n={2} className="mt-2" />
            <div className="flex-1"><TaskRow name="EP7 คลิป 1 — ทำไมคนทำดีถึงหมดไฟ?" status="DRAFT" focus /></div>
          </div>
          <div className="pl-7"><TaskRow name="EP7 คลิป 2 — คน Toxic มีทุกยุค" status="NEEDS_REVISION" /></div>
          <div className="pl-7"><TaskRow name="EP6 คลิป 4 — มุมกลับ" status="PENDING_REVIEW" /></div>
        </div>
      </Figure>
      <Steps>
        <Step title="เปิดเมนู “งานของฉัน”">บนมือถือกดปุ่ม ② ในเมนู LINE หรือแถบเมนูด้านล่าง</Step>
        <Step title="ดูสถานะแต่ละงาน">
          งาน <StatusBadge status="DRAFT" /> คืองานใหม่ที่ยังไม่ส่ง งาน <StatusBadge status="NEEDS_REVISION" /> คืองานที่ต้องแก้
        </Step>
      </Steps>
      <Callout type="tip">กดชื่องานเพื่อดูรายละเอียด เช่น ช่วงเวลาที่ต้องตัด หรือคำอธิบายจากแอดมิน</Callout>
      <P>เมื่อพร้อมส่ง ไปที่ <DocLink href="/docs/submit-clip">ส่งคลิปให้ตรวจ</DocLink></P>
    </>
  );
}

export function SubmitClip() {
  return (
    <>
      <P>คลิปส่งเป็นลิงก์ Google Drive ระบบจะเล่นวิดีโอให้ผู้ตรวจดูได้ทันทีโดยไม่ต้องดาวน์โหลด</P>

      <H2 id="share-drive">1. ตั้งค่าการแชร์ไฟล์ใน Google Drive</H2>
      <Steps>
        <Step title="อัปโหลดวิดีโอขึ้น Google Drive" />
        <Step title="คลิกขวาที่ไฟล์ → แชร์ → การเข้าถึงทั่วไป">
          เลือก <UI>ทุกคนที่มีลิงก์</UI> และสิทธิ์ <UI>ผู้มีสิทธิ์อ่าน</UI>
        </Step>
        <Step title="กด “คัดลอกลิงก์”">ลิงก์จะมีรูปแบบ <Code>https://drive.google.com/file/d/…/view</Code></Step>
      </Steps>
      <Callout type="warn" title="ลิงก์ต้องเปิดได้โดยไม่ต้องขอสิทธิ์">
        ถ้าตั้งเป็น “จำกัด” ผู้ตรวจจะเปิดวิดีโอไม่ได้ และต้องรอให้คุณเปลี่ยนสิทธิ์ก่อน
      </Callout>

      <H2 id="submit">2. ส่งงานจากหน้างานของฉัน</H2>
      <Figure caption="ฟอร์มส่งคลิปตรวจงาน" url="/tasks">
        <MockCard className="mx-auto max-w-md space-y-3">
          <div className="text-[13px] font-bold text-slate-900">ส่งคลิปตรวจงาน</div>
          <div className="flex items-start gap-2">
            <Mark n={1} className="mt-5" />
            <div className="flex-1"><MockInput label="ลิงก์ Google Drive วิดีโอ *" value="https://drive.google.com/file/d/1AbC…/view" /></div>
          </div>
          <div className="flex items-start gap-2">
            <Mark n={2} className="mt-5" />
            <div className="flex-1"><MockInput label="หมายเหตุ (ถ้ามี)" placeholder="หมายเหตุเพิ่มเติม..." /></div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Focus className="inline-block"><MockButton>ส่งคลิปตรวจงาน 🚀</MockButton></Focus>
            <Mark n={3} />
          </div>
        </MockCard>
      </Figure>
      <Steps>
        <Step title="กด “ส่งงาน” ที่งานที่ต้องการ แล้ววางลิงก์ Google Drive" />
        <Step title="ใส่หมายเหตุถ้ามี">เช่น “ใช้ดนตรีชุดใหม่” เพื่อให้ผู้ตรวจรู้บริบท</Step>
        <Step title="กด “ส่งคลิปตรวจงาน 🚀”">
          สถานะเปลี่ยนเป็น <StatusBadge status="PENDING_REVIEW" /> และผู้ตรวจได้รับแจ้งเตือนทันที
        </Step>
      </Steps>

      <H2 id="quick-submit">ส่งงานด่วน</H2>
      <P>
        เมนู <UI>ส่งงานด่วน</UI> ใช้ส่งได้เร็วโดยไม่ต้องหางานในรายการ: เลือก <b>ซีรีส์ (Project)</b> → <b>ตอน (Episode)</b> →{" "}
        <b>คลิป</b> แล้ววางลิงก์และกด <UI>ส่งงาน</UI>
      </P>
      <Callout type="info">ถ้าไม่พบคลิปในตอนที่เลือก แปลว่าแอดมินยังไม่ได้สร้างงานนั้น ให้ติดต่อแอดมิน</Callout>
    </>
  );
}

export function Revisions() {
  return (
    <>
      <P>
        เมื่อผู้ตรวจสั่งแก้ คลิปจะเป็นสถานะ <StatusBadge status="NEEDS_REVISION" /> และคุณได้รับแจ้งเตือนทาง LINE พร้อมคอมเมนต์
      </P>
      <H2 id="read-comments">อ่านคอมเมนต์จากผู้ตรวจ</H2>
      <Figure caption="หน้าคลิป: คอมเมนต์ที่มีเวลา [01:15] บอกตำแหน่งที่ต้องแก้" url="/clips/…">
        <div className="grid gap-3 sm:grid-cols-5">
          <div className="sm:col-span-3">
            <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-800 text-3xl text-white/70">▶</div>
          </div>
          <MockCard className="space-y-2 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900"><Mark n={1} /> 💬 ประวัติการส่ง</div>
            <Focus>
              <div className="rounded-lg bg-rose-50 p-2 text-[11px] leading-5 text-slate-700">
                <span className="font-mono font-bold text-rose-700">[01:15]</span> เสียงดนตรีดังกลบเสียงพูด
                <br /><span className="font-mono font-bold text-rose-700">[02:40]</span> ตัดช่วงเงียบออก
              </div>
            </Focus>
            <MockLines rows={2} />
          </MockCard>
        </div>
      </Figure>

      <H2 id="resubmit">ส่งงานแก้ไข</H2>
      <Steps>
        <Step title="แก้คลิปตามคอมเมนต์ แล้วอัปโหลดไฟล์ใหม่ขึ้น Google Drive">ตั้งสิทธิ์ “ทุกคนที่มีลิงก์” เหมือนเดิม</Step>
        <Step title="เปิดงานนั้นแล้วกด “ส่งงานแก้ไข”" />
        <Step title="วางลิงก์ใหม่และเขียนหมายเหตุว่าแก้อะไร">
          เช่น <i>“แก้ไขช่วง 01:15 ตามคำแนะนำเรียบร้อยแล้วครับ”</i> แล้วกด <UI>ส่งงานตรวจอีกครั้ง 🚀</UI>
        </Step>
      </Steps>
      <Callout type="tip">ระบบเก็บทุกเวอร์ชันไว้ ผู้ตรวจเทียบกับเวอร์ชันก่อนหน้าได้ ไม่ต้องลบไฟล์เดิมใน Drive</Callout>
    </>
  );
}

export function ReviewClip() {
  return (
    <>
      <P>
        เมื่อมีคลิปส่งเข้ามา ผู้ตรวจและแอดมินได้รับแจ้งเตือนทาง LINE หาคลิปที่รอตรวจได้ที่ <UI>งานของฉัน</UI> /{" "}
        <UI>ตารางงานทั้งหมด</UI> โดยดูสถานะ <StatusBadge status="PENDING_REVIEW" />
      </P>

      <H2 id="open">เปิดคลิปเพื่อตรวจ</H2>
      <Figure caption="หน้าตรวจคลิป: ดูวิดีโอด้านซ้าย ใส่ผลตรวจด้านขวา" url="/clips/…">
        <div className="grid gap-3 sm:grid-cols-5">
          <div className="space-y-2 sm:col-span-3">
            <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-800 text-3xl text-white/70">▶</div>
            <MockLines rows={2} />
          </div>
          <MockCard className="space-y-2 sm:col-span-2">
            <div className="text-[12px] font-bold text-slate-900">ดำเนินการตรวจ</div>
            <div className="flex items-center gap-1.5">
              <Mark n={1} />
              <Focus className="inline-block"><MockButton tone="outline">📌 ปักหมุดเวลา</MockButton></Focus>
            </div>
            <div className="flex items-start gap-1.5">
              <Mark n={2} className="mt-1" />
              <div className="flex-1 rounded-lg border border-slate-200 bg-white p-2 text-[11px] text-slate-700">
                <span className="font-mono font-bold text-rose-700">[01:15]</span> เสียงดนตรีดังกลบเสียงพูด
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Mark n={3} />
              <MockButton tone="danger" className="flex-1">✕ ส่งกลับแก้ไข</MockButton>
              <MockButton tone="success" className="flex-1">✓ ผ่านอนุมัติ</MockButton>
            </div>
          </MockCard>
        </div>
      </Figure>
      <Steps>
        <Step title="ดูวิดีโอ แล้วหยุดตรงจุดที่ต้องแก้ กด “📌 ปักหมุดเวลา”">
          ระบบใส่เวลาเช่น <Code>[01:15]</Code> ในช่องคอมเมนต์ให้ หรือพิมพ์เวลาเองในรูปแบบเดียวกัน
        </Step>
        <Step title="พิมพ์สิ่งที่ต้องแก้ให้ชัดเจน">เขียนหนึ่งบรรทัดต่อหนึ่งจุด นักตัดต่อจะแก้ได้ครบ</Step>
        <Step title="เลือกผลการตรวจ">
          <UL>
            <li><UI>✕ ส่งกลับแก้ไข</UI> ต้องมีคอมเมนต์ระบุสิ่งที่ต้องแก้</li>
            <li><UI>✓ ผ่านอนุมัติ</UI> คลิปพร้อมเผยแพร่</li>
          </UL>
        </Step>
      </Steps>
      <Callout type="info" title="หลังกดยืนยัน">
        เจ้าของคลิปได้รับแจ้งเตือนทันทีทั้งทาง LINE และในแอป
        คลิปที่ผ่านอนุมัติจะไปอยู่ในคิวเผยแพร่ของแอดมิน (<DocLink href="/docs/publish">ดูการเผยแพร่</DocLink>)
      </Callout>
      <Callout type="warn" title="วิดีโอไม่กระโดดไปตามเวลา?">
        วิดีโอจาก Google Drive ไม่รองรับการกระโดดไปยังเวลาที่ปักหมุดอัตโนมัติ ให้เลื่อนแถบวิดีโอเอง
      </Callout>

      <H2 id="line-group">คำสั่งในกลุ่ม LINE ทีมตรวจ</H2>
      <Table
        head={["พิมพ์ในกลุ่ม", "ผลลัพธ์"]}
        rows={[
          [<Code key="1">สรุปงานวันนี้</Code>, "สรุปจำนวนคลิปรอตรวจ ต้องแก้ และผ่านอนุมัติ"],
          [<Code key="2">งานที่ต้องตรวจ</Code>, "จำนวนคลิปที่รอตรวจตอนนี้ พร้อมปุ่มเปิดระบบ"],
        ]}
      />
    </>
  );
}
