/**
 * URL Validator helper for ClipFlow video submissions
 */
export function validateVideoUrl(rawUrl: string): { valid: boolean; message?: string } {
  if (!rawUrl || !rawUrl.trim()) {
    return { valid: false, message: "กรุณากรอกลิงก์วิดีโอ (Google Drive หรือ URL วิดีโอ)" };
  }

  const trimmed = rawUrl.trim();

  // Try parsing URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return {
      valid: false,
      message: "รูปแบบลิงก์ไม่ถูกต้อง กรุณาตรวจสอบลิงก์อีกครั้ง (เช่น https://drive.google.com/file/d/...)",
    };
  }

  // Ensure protocol is http or https
  if (!parsedUrl.protocol.startsWith("http")) {
    return { valid: false, message: "ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://" };
  }

  // Prevent users from accidentally pasting ClipFlow internal page URLs (e.g. /clips/... or /dashboard)
  if (
    parsedUrl.pathname.includes("/clips/") ||
    parsedUrl.pathname.includes("/dashboard") ||
    parsedUrl.pathname.includes("/tasks")
  ) {
    return {
      valid: false,
      message: "คุณกำลังนำลิงก์หน้าเว็บระบบมาวาง กรุณานำลิงก์ไฟล์วิดีโอจาก Google Drive หรือไฟล์วิดีโอจริงๆ มาวางครับ",
    };
  }

  return { valid: true };
}
