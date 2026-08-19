import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("==========================================");
    console.log(
      "[LINE WEBHOOK RECEIVED IN NEXT.JS]:",
      JSON.stringify(body, null, 2),
    );
    console.log("==========================================");

    const token =
      process.env.LINE_CHANNEL_ACCESS_TOKEN ||
      "YOUR_LINE_CHANNEL_ACCESS_TOKEN"; // Replace with your
    const events = body?.events || [];

    for (const event of events) {
      const source = event?.source;
      const groupId = source?.groupId;
      const replyToken = event?.replyToken;
      const userMsg = event?.message?.text?.trim() || "";

      if (groupId) {
        console.log(`🎉🎉🎉 [CAPTURED LINE GROUP ID]: ${groupId}`);

        // Save to captured_group_id.txt in workspace root
        try {
          const logPath = path.join(
            process.cwd(),
            "..",
            "captured_group_id.txt",
          );
          const logContent = `Timestamp: ${new Date().toISOString()}\nGroupId: ${groupId}\nUserMsg: ${userMsg}\nLineUserId: ${source?.userId || "N/A"}\n\n`;
          fs.appendFileSync(logPath, logContent);
        } catch (e) {
          console.error("Failed to write to captured_group_id.txt", e);
        }

        // Auto-reply to group message if replyToken exists
        if (replyToken) {
          let replyText = `🤖 [ClipFlow Bot]\n📍 Group ID กลุ่มนี้คือ:\n${groupId}`;
          if (userMsg === "ขอไอดีกลุ่ม") {
            replyText = `🆔 ID กลุ่มนี้คือ:\n${groupId}`;
          }

          fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: "text",
                  text: replyText,
                },
              ],
            }),
          }).catch((err) => console.error("[LINE REPLY ERROR]", err));
        }
      }
    }

    // Forward to backend worker
    fetch("http://127.0.0.1:8787/webhook/line", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch((e) => console.error("[FORWARD TO BACKEND FAILED]", e));

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("[NEXT.JS LINE WEBHOOK ERROR]", err);
    return new Response("OK", { status: 200 });
  }
}

export async function GET() {
  return new Response("LINE Webhook Endpoint Active", { status: 200 });
}
