/**
 * URL Validator helper for ClipFlow video submissions
 */
export function validateVideoUrl(rawUrl: string): { valid: boolean; message?: string } {
  if (!rawUrl || !rawUrl.trim()) {
    return { valid: false, message: "กรุณากรอกลิงก์วิดีโอ (Google Drive หรือ YouTube)" };
  }

  const trimmed = rawUrl.trim();

  // Try parsing URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return {
      valid: false,
      message: "รูปแบบลิงก์ไม่ถูกต้อง (เช่น https://drive.google.com/file/d/... หรือ https://youtu.be/...)",
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
      message: "คุณกำลังนำลิงก์หน้าเว็บระบบมาวาง กรุณาใช้ลิงก์วิดีโอจาก Google Drive หรือ YouTube",
    };
  }

  return { valid: true };
}
