import {
  Callout, Code, DocLink, Figure, Focus, H2, H3, Mark, MockButton, MockCard, MockInput, P, Step, Steps, Table, UI, UL,
} from "../_components/docs-ui";

export function Projects() {
  return (
    <>
      <P>โปรเจกต์ (ซีรีส์/รายการ) คือกล่องรวมตอนและคลิปทั้งหมด นักตัดต่อเห็นเฉพาะโปรเจกต์ที่เป็นสมาชิกอยู่</P>

      <H2 id="create">สร้างโปรเจกต์ใหม่</H2>
      <Figure caption="ฟอร์มสร้างโปรเจกต์" url="/admin/projects/create">
        <MockCard className="mx-auto max-w-md space-y-3">
          <div className="text-[13px] font-bold text-slate-900">สร้างโปรเจกต์ใหม่</div>
          <div className="flex items-start gap-2">
            <Mark n={1} className="mt-5" />
            <div className="flex-1"><MockInput label="ชื่อโปรเจกต์ (รายการ)" value="ซีรีส์บทเรียนจากอัลกุรอาน" /></div>
          </div>
          <MockInput label="รายละเอียด (ตัวเลือก)" placeholder="คำอธิบายสั้นๆ เกี่ยวกับโปรเจกต์นี้..." />
          <MockInput label="URL รูปภาพหน้าปก (ตัวเลือก)" placeholder="https://..." />
          <div className="flex items-center justify-end gap-2">
            <MockButton tone="outline">ยกเลิก</MockButton>
            <Focus className="inline-block"><MockButton>สร้างโปรเจกต์</MockButton></Focus>
            <Mark n={2} />
          </div>
        </MockCard>
      </Figure>
      <Steps>
        <Step title="เมนู การจัดการโปรเจกต์ → สร้างโปรเจกต์ใหม่ แล้วกรอกชื่อ">รายละเอียดและรูปปกใส่หรือไม่ใส่ก็ได้</Step>
        <Step title="กด “สร้างโปรเจกต์”">ระบบพาไปหน้าโปรเจกต์ใหม่ทันที</Step>
      </Steps>

      <H2 id="members">เพิ่มสมาชิกเข้าโปรเจกต์</H2>
      <P>
        เปิดโปรเจกต์ แล้วกด <UI>จัดการ</UI> ไปหน้าจัดการโปรเจกต์ ส่วนบนสุดคือ <b>เพิ่มสมาชิกเข้าโปรเจกต์</b>
      </P>
      <Figure caption="เลือกผู้ใช้ได้หลายคนแล้วกดเพิ่มครั้งเดียว" url="/admin/projects/…/manage">
        <MockCard className="space-y-3">
          <div className="text-[13px] font-bold text-slate-900">เพิ่มสมาชิกเข้าโปรเจกต์</div>
          <div className="flex flex-wrap items-center gap-2">
            <Mark n={1} />
            <div className="flex flex-1 flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1.5">
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">สมชาย ✕</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">มานี ✕</span>
            </div>
            <Focus className="inline-block"><MockButton>เพิ่มลงโปรเจกต์</MockButton></Focus>
            <Mark n={2} />
          </div>
        </MockCard>
      </Figure>
      <Steps>
        <Step title="ค้นหาและเลือกผู้ใช้ (เลือกได้หลายคน)" />
        <Step title="กด “เพิ่มลงโปรเจกต์”">สมาชิกเห็นโปรเจกต์นี้ทันที</Step>
      </Steps>
      <Callout type="warn">
        มอบหมายงานได้เฉพาะสมาชิกของโปรเจกต์ (และแอดมิน) ถ้าเลือกคนที่ไม่ใช่สมาชิก ระบบจะไม่บันทึกและแจ้งชื่อคลิปที่มีปัญหา
        ให้เพิ่มคนนั้นเป็นสมาชิกก่อน
      </Callout>
    </>
  );
}

function SheetRow({ no, name, owner, focus }: { no: number; name: string; owner: string; focus?: boolean }) {
  return (
    <div className={`grid grid-cols-[28px_40px_1fr_120px] items-center gap-2 px-2 py-1.5 text-[11px] ${focus ? "bg-blue-50" : "bg-white"}`}>
      <span className="text-center font-bold text-slate-400">{no}</span>
      <span className="rounded border border-slate-200 bg-white px-1 py-0.5 text-center">EP7</span>
      <span className="truncate rounded border border-slate-200 bg-white px-1.5 py-0.5 text-slate-800">{name}</span>
      <span className={`truncate rounded border px-1.5 py-0.5 ${owner ? "border-slate-200 bg-white text-slate-800" : "border-dashed border-slate-300 text-slate-400"}`}>
        {owner || "เลือกคนตัดต่อ..."}
      </span>
    </div>
  );
}

export function AssignTasks() {
  return (
    <>
      <P>
        แอดมินสร้างคลิปและมอบหมายคนตัดต่อในหน้า <b>จัดการโปรเจกต์</b> ซึ่งเป็นตารางคล้าย Excel
        แก้หลายแถวแล้วกดบันทึกครั้งเดียว
      </P>

      <H2 id="sheet">ตารางงาน</H2>
      <Figure caption="ตารางจัดการคลิป: แก้ไขในตารางแล้วกด “บันทึกทั้งหมด”" url="/admin/projects/…/manage">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <MockButton tone="outline">จัดการตอน</MockButton>
            <span className="inline-flex items-center gap-1"><Mark n={1} /><MockButton tone="outline">เพิ่มแถว</MockButton></span>
            <span className="inline-flex items-center gap-1"><Mark n={2} /><MockButton tone="outline">วางข้อความอัตโนมัติ</MockButton></span>
            <span className="ml-auto inline-flex items-center gap-1"><Focus className="inline-block"><MockButton>บันทึกทั้งหมด</MockButton></Focus><Mark n={4} /></span>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 divide-y divide-slate-100">
            <div className="grid grid-cols-[28px_40px_1fr_120px] gap-2 bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-500">
              <span>ลำดับ</span><span>ตอน</span><span>ชื่อคลิป</span><span>ผู้รับผิดชอบ</span>
            </div>
            <SheetRow no={1} name="ทำไมคนทำดีถึงหมดไฟ?" owner="สมชาย" />
            <SheetRow no={2} name="คน Toxic มีทุกยุค" owner="สมชาย" focus />
            <SheetRow no={3} name="มุมกลับ การตำหนิคนทำความดี" owner="" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Mark n={3} /> เลือกคนตัดต่อในแต่ละแถว</div>
        </div>
      </Figure>
      <Steps>
        <Step title="เพิ่มแถว">กด <UI>เพิ่มแถว</UI> ระบบตั้งชื่อเริ่มต้นให้ เช่น <Code>EP7_04</Code> แก้ชื่อได้ในช่อง</Step>
        <Step title="หรือวางข้อความจากแชท/เอกสาร">ดู <a href="#import" className="text-blue-700 underline">วางข้อความอัตโนมัติ</a> ด้านล่าง</Step>
        <Step title="เลือกคนตัดต่อ (ผู้รับผิดชอบ)">
          ต้องการให้คนเดียวทำหลายคลิป? เลือกคนในแถวแรก แล้วกด <UI>นำไปใช้กับรายการด้านล่างทั้งหมด</UI>
        </Step>
        <Step title="กด “บันทึกทั้งหมด”">
          ระบบบันทึกเฉพาะแถวที่เปลี่ยน และส่งแจ้งเตือนให้คนที่ได้รับงานใหม่ (หลายงานรวมเป็นข้อความเดียว)
        </Step>
      </Steps>
      <Callout type="info" title="ลำดับคลิปจะไม่สลับ">
        คลิปเรียงตาม <b>ตอน</b> แล้วตาม <b>ลำดับที่เพิ่ม</b> เสมอ เลขลำดับ 1, 2, 3 ในแต่ละตอนจะคงที่หลังบันทึกและรีเฟรช
      </Callout>

      <H2 id="import">วางข้อความอัตโนมัติ (Import)</H2>
      <P>
        ถ้ามีรายการคลิปอยู่ในแชทหรือเอกสารแล้ว กด <UI>วางข้อความอัตโนมัติ</UI> วางข้อความ แล้วกด <UI>นำเข้า</UI>{" "}
        ระบบแยกเป็นแถวให้อัตโนมัติ ตามรูปแบบนี้
      </P>
      <pre className="my-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-[13px] leading-6 text-slate-100">{`ไฮไลท์อีพี 7 คลิป 1
"ทำไมคนทำดีถึงหมดไฟ?"
🕣 เวลา 05:20 - 06:45

ไฮไลท์อีพี 7 คลิป 2
"คน Toxic มีทุกยุค"
🕣 เวลา 12:10 - 13:30`}</pre>
      <Table
        head={["บรรทัด", "ระบบใช้เป็น"]}
        rows={[
          [<span key="1">มีคำว่า <Code>อีพี 7</Code> / <Code>EP 7</Code></span>, "เลขตอนของคลิปถัดไป"],
          [<span key="2">มีคำว่า <Code>คลิป 1</Code> หรือขึ้นต้นด้วย <Code>ไฮไลท์</Code></span>, "จุดเริ่มคลิปใหม่"],
          [<span key="3">ข้อความในเครื่องหมายคำพูด <Code>&quot;...&quot;</Code></span>, "ชื่อคลิป"],
          [<span key="4">มีคำว่า <Code>เวลา</Code> หรือ 🕣</span>, "รายละเอียด (ช่วงเวลา)"],
        ]}
      />
      <Callout type="tip">แถวที่นำเข้าจะเรียงตามลำดับในข้อความ ตรวจและเลือกคนตัดต่อก่อนกด <UI>บันทึกทั้งหมด</UI></Callout>

      <H3>ลบแถว</H3>
      <UL>
        <li>ลบทีละแถวด้วยปุ่มถังขยะท้ายแถว</li>
        <li>เลือกหลายแถวด้วยช่องติ๊กหน้าแถว แล้วกดลบที่เลือก ระบบลบทั้งหมดในครั้งเดียว</li>
      </UL>
      <Callout type="warn">การลบคลิปที่บันทึกแล้วย้อนกลับไม่ได้ ประวัติการส่งงานของคลิปนั้นจะถูกลบไปด้วย</Callout>
    </>
  );
}

export function Publish() {
  return (
    <>
      <P>
        คลิปที่ <b>ผ่านอนุมัติ</b> จะมาอยู่ที่เมนู <UI>คิวและปฏิทินเผยแพร่</UI> แอดมินกำหนดวันโพสต์ คัดลอกไตเติ้ลกับแคปชั่น
        และบันทึกว่าโพสต์แพลตฟอร์มไหนแล้ว
      </P>
      <H2 id="queue">รายการคิวเผยแพร่</H2>
      <Table
        head={["ตัวกรอง", "ใช้หา"]}
        rows={[
          ["ยังไม่กำหนดวัน", "คลิปที่ยังไม่ได้ลงคิว"],
          ["กำหนดวันแล้ว", "คลิปที่มีวันโพสต์แล้ว"],
          ["เลยกำหนด", "ถึงวันแล้วแต่ยังไม่โพสต์"],
          ["โพสต์บางส่วน / โพสต์ครบ", "โพสต์ไปบางแพลตฟอร์ม / ครบทุกแพลตฟอร์ม"],
        ]}
      />
      <P>กรองเพิ่มตาม <b>โปรเจกต์</b>, <b>คนตัดต่อ</b> และช่วง <b>วันที่ลงโพสต์</b> ได้</P>

      <H2 id="record">เผยแพร่คลิปและบันทึกการโพสต์</H2>
      <Figure caption="หน้าต่างจัดการการเผยแพร่ของคลิป" url="/admin/publish">
        <MockCard className="mx-auto max-w-md space-y-3">
          <div className="text-[13px] font-bold text-slate-900">จัดการการเผยแพร่</div>
          <div className="flex items-center gap-2">
            <Mark n={1} />
            <MockButton tone="outline">เปิดคลิปที่ผ่านการตรวจ</MockButton>
            <MockButton tone="outline">ดาวน์โหลดคลิป</MockButton>
          </div>
          <div className="flex items-end gap-2">
            <Mark n={2} />
            <div className="flex-1"><MockInput label="ไตเติ้ลชื่อคลิป" value="ทำไมคนทำดีถึงหมดไฟ? | ตอนที่ 7" /></div>
            <MockButton tone="outline">คัดลอกไตเติ้ล</MockButton>
          </div>
          <div className="flex items-start gap-2">
            <Mark n={3} className="mt-1" />
            <div className="flex flex-wrap gap-1.5">
              {["TikTok", "YouTube Shorts", "Facebook Reels", "Instagram Reels"].map((p, i) => (
                <span key={p} className={`rounded-lg border px-2 py-1 text-[11px] font-bold ${i < 2 ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500"}`}>
                  {i < 2 ? "☑" : "☐"} {p}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Focus className="inline-block"><MockButton>บันทึกการโพสต์</MockButton></Focus>
            <Mark n={4} />
          </div>
        </MockCard>
      </Figure>
      <Steps>
        <Step title="เปิดหรือดาวน์โหลดคลิปที่ผ่านการตรวจ" />
        <Step title="คัดลอกไตเติ้ลและแคปชั่นไปใช้ตอนโพสต์">ระบบเตรียมข้อความพร้อมแฮชแท็กให้</Step>
        <Step title="ติ๊กแพลตฟอร์มที่โพสต์แล้ว (เลือกได้หลายช่องทาง)" />
        <Step title="กด “บันทึกการโพสต์”">
          เมื่อโพสต์ครบทุกแพลตฟอร์ม คิวของคลิปจะเปลี่ยนเป็นโพสต์ครบ ดูย้อนหลังได้ใน <b>ประวัติการโพสต์</b>
        </Step>
      </Steps>
      <Callout type="info" title="กำหนดวันโพสต์">
        กำหนดวันและเวลาได้ในหน้าคิวเผยแพร่หรือหน้าปฏิทิน ถ้าวันนั้นมีคลิปของโปรเจกต์เดียวกันลงคิวแล้ว ระบบจะเตือนว่าวันชน
      </Callout>
    </>
  );
}

export function UsersRoles() {
  return (
    <>
      <P>เมนู <UI>ตั้งค่าและผู้ใช้งาน</UI> → <UI>จัดการผู้ใช้งาน</UI> แสดงผู้ใช้ทุกคน พร้อมชื่อใน LINE เบอร์โทร และอีเมล</P>
      <Figure caption="รายชื่อผู้ใช้: ใต้ชื่อที่แสดงคือชื่อใน LINE และข้อมูลติดต่อ" url="/users">
        <MockCard className="space-y-2">
          {[
            { name: "สมชาย ตัดต่อ", line: "Somchai 🎬", phone: "081-234-5678", role: "🎬 Editor", focus: true },
            { name: "มานี ผู้ตรวจ", line: "Manee", phone: "", role: "🔍 Reviewer" },
          ].map((u) => {
            const row = (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-slate-900">{u.name}</div>
                  <div className="flex flex-wrap gap-x-2 text-[10px] text-slate-500">
                    <span><b className="text-[#06C755]">LINE</b> {u.line}</span>
                    {u.phone ? <span>📞 {u.phone}</span> : <span className="text-slate-400">ยังไม่ได้กรอกข้อมูลติดต่อ</span>}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">{u.role}</span>
              </div>
            );
            return <div key={u.name}>{u.focus ? <Focus>{row}</Focus> : row}</div>;
          })}
        </MockCard>
      </Figure>
      <Callout type="tip">ค้นหาผู้ใช้ด้วยชื่อที่แสดง ชื่อใน LINE เบอร์โทร หรืออีเมลได้ ช่วยหาคนในแชท LINE ได้ถูกคน</Callout>

      <H2 id="change-role">เปลี่ยนบทบาท</H2>
      <Steps>
        <Step title="กดที่ผู้ใช้ที่ต้องการ" />
        <Step title="เลือกบทบาท 👑 Admin, 🔍 Reviewer หรือ 🎬 Editor แล้วกดบันทึก" />
        <Step title="ผู้ใช้ได้รับแจ้งเตือนทาง LINE ทันที">
          ข้อความบอกบทบาทเดิม บทบาทใหม่ และสิ่งที่ทำได้ ถ้าได้เป็นผู้ตรวจจะมีลิงก์เข้ากลุ่ม LINE ทีมตรวจด้วย
        </Step>
      </Steps>

      <H2 id="suspend">ระงับการใช้งาน</H2>
      <P>
        ปิดสถานะบัญชีเพื่อไม่ให้ผู้ใช้เข้าระบบได้ งานและประวัติเดิมยังอยู่ครบ เปิดกลับได้ทุกเมื่อ
        ดูการกระทำย้อนหลังได้ที่ <UI>ประวัติการทำงานระบบ</UI>
      </P>
      <P>อ่านต่อ: <DocLink href="/docs/notifications">การแจ้งเตือน</DocLink></P>
    </>
  );
}
