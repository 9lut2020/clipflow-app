# ClipFlow - Frontend Web Application

> ส่วนหน้าเว็บของระบบ **ClipFlow** — แพลตฟอร์มบริหารจัดการและติดตามกระบวนการตรวจสอบคลิปวิดีโอ (Submit → Review → Revise → Approve) พัฒนาด้วย Next.js (App Router), React 19 และ Tailwind CSS รองรับการใช้งานทั้งบน Desktop, Mobile (PWA) และ LINE LIFF

---

## สารบัญ

- [ภาพรวมของระบบ (Overview)](#ภาพรวมของระบบ-overview)
- [เทคโนโลยีที่ใช้ (Tech Stack)](#เทคโนโลยีที่ใช้-tech-stack)
- [สถาปัตยกรรมและการเชื่อมต่อ (Architecture & Communication)](#สถาปัตยกรรมและการเชื่อมต่อ-architecture--communication)
- [โครงสร้างโฟลเดอร์ (Directory Structure)](#โครงสร้างโฟลเดอร์-directory-structure)
- [แผนผังหน้าเว็บและเส้นทาง (Routing & Pages)](#แผนผังหน้าเว็บและเส้นทาง-routing--pages)
- [การตั้งค่า Environment Variables](#การตั้งค่า-environment-variables)
- [การติดตั้งและเริ่มใช้งาน (Getting Started)](#การติดตั้งและเริ่มใช้งาน-getting-started)
- [สคริปต์คำสั่งที่ใช้งานได้ (Available Scripts)](#สคริปต์คำสั่งที่ใช้งานได้-available-scripts)
- [ฟีเจอร์เด่นของระบบ (Key Features)](#ฟีเจอร์เด่นของระบบ-key-features)
- [การทดสอบใน Local (Bypass Mode)](#การทดสอบใน-local-bypass-mode)
- [การ Deploy ขึ้น Vercel](#การ-deploy-ขึ้น-vercel)
- [แนวทางการแก้ไขปัญหา (Troubleshooting & FAQ)](#แนวทางการแก้ไขปัญหา-troubleshooting--faq)

---

## ภาพรวมของระบบ (Overview)

Frontend ของ ClipFlow ออกแบบมาเพื่อเป็นศูนย์กลางการทำงานของทีมตัดต่อ (Editor), ผู้ตรวจคลิป (Reviewer) และผู้ดูแลระบบ (Admin):
1. **Editor**: ส่งงานคลิปพร้อมระบุโปรเจกต์ ตอน ลิงก์ไฟล์ (Google Drive) และรายละเอียด ติดตามสถานะงานและแก้パートที่ได้รับคำแนะนำ
2. **Reviewer**: ตรวจสอบคลิปตามเกณฑ์ Checklist ให้ Feedback ระบุจุดที่ต้องแก้ไข (Revision Request) หรือกดอนุมัติ (Approve)
3. **Admin**: จัดการผู้ใช้งาน กำหนดสิทธิ์ ดูแลโปรเจกต์ ดู Audit Log และตารางปล่อยคลิป (Publish Schedule)

---

## เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนประกอบ | รายละเอียด |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router) |
| **Core Library** | [React](https://react.dev/) 19 & TypeScript 5 |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/) v4, [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Vaul](https://vaul.emilkowal.ski/) (Drawer) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) (Toast notifications) |
| **Data Fetching** | [SWR](https://swr.vercel.app/) & [Axios](https://axios-http.com/) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) v4 (LINE Login Provider) + LIFF SDK |
| **Form & Validation** | [Zod](https://zod.dev/) |
| **Mobile & PWA** | Web App Manifest, Service Worker (`sw.js`), Web Push Notifications |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## สถาปัตยกรรมและการเชื่อมต่อ (Architecture & Communication)

```
[ Browser / LINE LIFF / PWA ]
               │
               ▼
   Next.js App Router (Frontend)
   ├── Client / Server Components
   └── API Reverse Proxy: /api/proxy/[...path]
               │
               │  1. ตรวจสอบ NextAuth JWT Session (getToken)
               │  2. แนบ Headers:
               │     - x-user-id
               │     - x-user-role
               │     - x-request-id
               │     - x-internal-secret
               ▼
[ Cloudflare Workers API ] (Backend)
```

### กลไกความปลอดภัยผ่าน Reverse Proxy
- Browser จะไม่ยิง API ตรงไปยัง Backend Worker สำหรับคำขอส่วนใหญ่ แต่จะส่งผ่าน `/api/proxy/[...path]` ของ Next.js
- Next.js ทำการถอดรหัส session cookie ในฝั่ง Server เพื่อดึง `userId` และ `role` แล้วแนบเป็น HTTP Headers พิเศษ พร้อมกับ `INTERNAL_API_SECRET`
- ป้องกันไม่ให้ Browser ทราบค่า Secret และป้องกันการปลอมแปลงสิทธิ์จากภายนอก

---

## โครงสร้างโฟลเดอร์ (Directory Structure)

```bash
frontend/
├── public/                 # Static assets, รูปภาพไอคอน, Service Worker (sw.js)
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts & API Routes)
│   │   ├── (bypass)/       # หน้าสำหรับ Dev Bypass ข้าม LINE Login เพื่อทดสอบบทบาทต่างๆ
│   │   ├── (main)/         # หน้าหลักของระบบ (ต้องการ Auth)
│   │   │   ├── admin/      # หน้าจัดการของผู้ดูแลระบบ (Audit logs, Projects manage, Publish)
│   │   │   ├── analytics/  # กราฟและสถิติภาพรวม
│   │   │   ├── assets/     # แหล่งรวบรวมไฟล์ Asset ของโปรเจกต์
│   │   │   ├── calendar/   # ปฏิทินกำหนดการงานและปล่อยคลิป
│   │   │   ├── clips/[id]/ # หน้ารายละเอียดคลิป ตรวจสอบงาน และประวัติการแก้
│   │   │   ├── dashboard/  # แดชบอร์ดสรุปงานที่ค้างและสถานะคลิป
│   │   │   ├── notifications/ # ศูนย์แจ้งเตือนในระบบ
│   │   │   ├── projects/   # หน้ารายการและรายละเอียดโปรเจกต์
│   │   │   ├── settings/   # หน้าตั้งค่าโปรไฟล์และระบบ
│   │   │   ├── submit/     # หน้าฟอร์มส่งคลิปใหม่
│   │   │   ├── tasks/      # หน้ารายการงาน (Task Board สำหรับ Editor / Reviewer)
│   │   │   └── users/      # หน้าจัดการผู้ใช้งาน
│   │   ├── api/            # Server Route Handlers
│   │   │   ├── auth/       # NextAuth API route ([...nextauth])
│   │   │   ├── proxy/      # Reverse Proxy สำหรับ Forward ไปยัง Worker API
│   │   │   └── pwa-login/  # Endpoint สำหรับ Claim Token ในกระบวนการ PWA Auth
│   │   ├── auth/handoff/   # หน้า Handoff ส่งผ่าน Token ระหว่าง LIFF และ Web App
│   │   ├── docs/           # หน้าระบบคู่มือและเอกสารการใช้งาน
│   │   ├── login/          # หน้าเข้าสู่ระบบผ่าน LINE
│   │   ├── menu/           # หน้า Quick Menu สำหรับเปิดใช้งานใน LIFF
│   │   ├── slide/          # สไลด์แนะนำระบบ
│   │   ├── webhook/        # Webhook handler (LINE Webhook relay)
│   │   ├── layout.tsx      # Root Layout
│   │   └── page.tsx        # Landing Page (Redirect ตาม Session)
│   ├── components/         # Reusable UI Components
│   │   ├── admin/          # Component สำหรับหน้า Admin
│   │   ├── app-layout/     # Header, Sidebar, Bottom Navigation
│   │   ├── clips/          # Components จัดการคลิป (Player, StatusBadge, Checklist)
│   │   ├── dashboard/      # วิดเจ็ตสรุปข้อมูล
│   │   ├── liff/           # Wrapper และ Utility สำหรับ LINE LIFF
│   │   ├── projects/       # การ์ดและตารางแสดงโปรเจกต์
│   │   ├── publish/        # Components จัดการตารางปล่อยคลิป
│   │   ├── pwa/            # ติดตั้ง PWA & Push Notification modal
│   │   └── ui/             # Core UI components (Buttons, Inputs, Dialogs, ฯลฯ)
│   ├── features/           # Feature-driven Modules (Logic แยกตามหมวดหมู่)
│   ├── hooks/              # Custom React Hooks (use-admin, use-analytics, ฯลฯ)
│   ├── lib/                # Library Configuration & Utilities
│   │   ├── api-client.ts   # Axios/Fetch instance สำหรับ Client Component
│   │   ├── api-server.ts   # Helper เรียก API จาก Server Component
│   │   ├── auth.ts         # การตั้งค่า NextAuth options & LINE provider
│   │   └── constants.ts    # ค่าคงที่ต่างๆ ของระบบ
│   ├── types/              # TypeScript Types & Interfaces
│   └── utils/              # Helper functions (Formatters, Drive parser, ฯลฯ)
├── .env.example            # ตัวอย่างค่า Environment Variables
├── next.config.ts          # การตั้งค่า Next.js
├── package.json            # รายการ Dependencies และ Scripts
└── tsconfig.json           # การตั้งค่า TypeScript
```

---

## แผนผังหน้าเว็บและเส้นทาง (Routing & Pages)

| เส้นทาง (Route) | สิทธิ์ที่เข้าถึงได้ | รายละเอียดหน้าที่ |
| :--- | :--- | :--- |
| `/login` | ทุกคน | หน้า Login ด้วยบัญชี LINE |
| `/dashboard` | Authenticated | ภาพรวมคลิปที่รอดำเนินการ, กำลังตรวจ, และสถิติส่วนตัว |
| `/submit` | Editor, Admin | ฟอร์มสำหรับส่งงานคลิปใหม่ แนบ Google Drive URL |
| `/tasks` | Authenticated | กระดานงาน (แบ่งตามแท็บ: งานของฉัน, งานรอตรวจ, งานต้องแก้) |
| `/clips/[id]` | Authenticated | รายละเอียดคลิป, ไทม์ไลน์การตรวจ, ฟีดแบ็ก, ระบบขอแก้ไข |
| `/projects` | Authenticated | รายการโปรเจกต์ทั้งหมด และคลิปภายในแต่ละโปรเจกต์ |
| `/calendar` | Authenticated | ปฏิทินแสดงกำหนดการส่งงานและวันปล่อยคลิป |
| `/analytics` | Reviewer, Admin | กราฟสถิติจำนวนคลิป, รอบการแก้ไข, ความเร็วในการทำงาน |
| `/admin/*` | Admin | จัดการโปรเจกต์, Audit Logs, สิทธิ์ผู้ใช้งาน |
| `/menu` | Mobile / LIFF | เมนูลัดสำหรับผู้ใช้ที่เปิดผ่านแอปพลิเคชัน LINE |
| `/bypass` | Development Only | สลับสิทธิ์เป็น Admin/Reviewer/Editor สำหรับทดสอบใน Local |

---

## การตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ภายในโฟลเดอร์ `frontend/` โดยอ้างอิงจาก `.env.example`:

```bash
# ==============================================================================
# 1. NextAuth Authentication Configuration
# ==============================================================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL_INTERNAL=http://localhost:3000
AUTH_TRUST_HOST=true

# Secret สำหรับ Encrypt Session & Cookie (สุ่มรหัสความยาว 32+ ตัวอักษร)
# เช่น ใช้คำสั่ง: openssl rand -base64 32
NEXTAUTH_SECRET=your_super_secret_nextauth_key

# ==============================================================================
# 2. Backend API Endpoint
# ==============================================================================
# Local: http://127.0.0.1:8787/api
# Production: https://your-backend-worker.workers.dev/api
NEXT_PUBLIC_API_URL=http://127.0.0.1:8787/api

# ==============================================================================
# 3. LINE Login Configuration (ได้จาก LINE Developers Console)
# ==============================================================================
LINE_CLIENT_ID=YOUR_LINE_CHANNEL_ID
LINE_CLIENT_SECRET=YOUR_LINE_CHANNEL_SECRET

# Token สำหรับส่งข้อความ Push/Reply ผ่าน LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=YOUR_LINE_CHANNEL_ACCESS_TOKEN

# ==============================================================================
# 4. Security & Internal Integration
# ==============================================================================
# ต้องตรงกับ INTERNAL_API_SECRET บน Cloudflare Worker เพื่อให้ Proxy คุยกันได้
INTERNAL_API_SECRET=your_shared_internal_secret_key

# (ทางเลือก) WebSocket URL สำหรับ Real-time
NEXT_PUBLIC_WS_URL=wss://your-backend-worker.workers.dev
```

---

## การติดตั้งและเริ่มใช้งาน (Getting Started)

### สิ่งที่จำเป็นต้องมีก่อนติดตั้ง (Prerequisites)
- [Node.js](https://nodejs.org/) version 20 ขึ้นไป
- [pnpm](https://pnpm.io/) version 9 หรือ 10 (`npm install -g pnpm`)

### ขั้นตอนการรันระบบใน Local

1. **ติดตั้ง Dependencies**:
   ```bash
   # หากอยู่ที่ root ของโปรเจกต์
   pnpm install

   # หรือเข้ามาในโฟลเดอร์ frontend โดยตรง
   cd frontend
   pnpm install
   ```

2. **คัดลอกไฟล์ Environment**:
   ```bash
   cp .env.example .env.local
   ```
   *(แก้ไขค่าต่างๆ ใน `.env.local` ให้ครบถ้วนตามขั้นตอนด้านบน)*

3. **รัน Development Server**:
   ```bash
   pnpm dev
   ```

4. **เปิดใช้งาน**:
   - เปิดบราวเซอร์ไปที่: `http://localhost:3000`
   - สำหรับทดสอบระบบแบบไม่ผ่าน LINE Login ให้ไปที่: `http://localhost:3000/bypass`

---

## สคริปต์คำสั่งที่ใช้งานได้ (Available Scripts)

| คำสั่ง | คำอธิบาย |
| :--- | :--- |
| `pnpm dev` | รัน Next.js ในโหมด Development (Hot-reload ที่ port 3000) |
| `pnpm build` | ทำการ Compile และ Build แอปพลิเคชันสำหรับการขึ้น Production |
| `pnpm start` | รันเซิร์ฟเวอร์แบบ Production หลังจากการ Build |
| `pnpm lint` | ตรวจสอบคุณภาพโค้ดด้วย ESLint |
| `pnpm type-check` | ตรวจสอบความถูกต้องของ Type ด้วย TypeScript (`tsc --noEmit`) |

---

## ฟีเจอร์เด่นของระบบ (Key Features)

1. **Google Drive Integration & Validation**:
   - ระบบตรวจสอบ URL ของ Google Drive อัตโนมัติ แปลงลิงก์แชร์เป็นลิงก์พรีวิวหรือดึง File ID ได้อย่างแม่นยำ
2. **Review & Revision Workflow**:
   - ผู้ตรวจสามารถติ๊ก Checklist และเขียน Feedback ระบุสิ่งที่ต้องแก้
   - ระบบแจ้งเตือนไปยังผู้รับผิดชอบทันทีผ่าน LINE Flex Message
3. **PWA & Offline Capability**:
   - ติดตั้งลงบนหน้าจอโฮมของสมาร์ตโฟนได้เสมือนแอป Native
   - รองรับ Web Push Notifications เพื่อแจ้งเตือนงานด่วน
4. **Adaptive UI**:
   - แสดงผลแบบ Responsive รองรับทั้งจอคอมพิวเตอร์ แท็บเล็ต และจอมือถือ (ทั้ง Standalone และผ่านเบราว์เซอร์ของ LINE)

---

## การทดสอบใน Local (Bypass Mode)

เมื่อรันในสภาพแวดล้อม Development (`NODE_ENV !== "production"`):
- เข้าใช้งานผ่าน URL: `http://localhost:3000/bypass`
- สามารถเลือกสลับบทบาทจำลองได้ทันที:
  - **Admin**: ทดสอบการตั้งค่าและจัดการระบบ
  - **Reviewer**: ทดสอบการตรวจงานคลิปและการอนุมัติ
  - **Editor**: ทดสอบการส่งงานคลิปและแก้ไขงาน

---

## การ Deploy ขึ้น Vercel

1. เชื่อมต่อ Git Repository เข้ากับ **Vercel**
2. ตั้งค่า **Root Directory** เป็น `frontend` (หากแยกโปรเจกต์)
3. กำหนด **Build Command**: `pnpm build` หรือ `next build`
4. เพิ่ม **Environment Variables** บน Vercel Project Settings:
   - `NEXTAUTH_URL`: Domain เว็บจริง (เช่น `https://clipflow.example.com`)
   - `NEXTAUTH_SECRET`: Secret key ที่ปลอดภัย
   - `NEXT_PUBLIC_API_URL`: URL ของ Cloudflare Worker API (เช่น `https://api.clipflow.example.com/api`)
   - `INTERNAL_API_SECRET`: รหัส Secret ภายใน (ต้องตรงกับ Cloudflare Worker)
   - `LINE_CLIENT_ID` และ `LINE_CLIENT_SECRET`: ค่าจาก LINE Console
   - `LINE_CHANNEL_ACCESS_TOKEN`: Token ส่งข้อความ LINE

---

## แนวทางการแก้ไขปัญหา (Troubleshooting & FAQ)

### 1. เข้าสู่ระบบแล้วขึ้นข้อความ "Session Invalid" หรือ Error 401 ใน Network
- **สาเหตุ**: `INTERNAL_API_SECRET` ใน `.env.local` ของ Frontend ไม่ตรงกับที่กำหนดไว้ใน Backend Worker
- **วิธีแก้**: ตรวจสอบค่า `INTERNAL_API_SECRET` ให้ตรงกันทั้งสองฝั่ง

### 2. LINE Login แจ้งเตือน Error "Invalid Callback URL"
- **สาเหตุ**: Callback URL ใน LINE Developers Console ไม่ตรงกับโดเมนที่ใช้งาน
- **วิธีแก้**: เพิ่ม `http://localhost:3000/api/auth/callback/line` (สำหรับ Dev) หรือ `https://your-domain.com/api/auth/callback/line` (สำหรับ Prod) ในเมนู LINE Login → Callback URL

### 3. เรียก API แล้วเกิด CORS Error
- **สาเหตุ**: Worker ปฏิเสธคำขอจาก Origin ของ Frontend
- **วิธีแก้**: ตรวจสอบตัวแปร `CORS_ORIGINS` ใน Cloudflare Worker ว่ามีโดเมนของ Frontend รวมอยู่ด้วยหรือไม่
