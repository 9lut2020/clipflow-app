/** Platforms every approved clip is posted to. */
export const PUBLISH_PLATFORMS = [
  { id: "TIKTOK", label: "TikTok", short: "TikTok" },
  { id: "YOUTUBE_SHORTS", label: "YouTube Shorts", short: "YouTube" },
  { id: "FACEBOOK_REELS", label: "Facebook Reels", short: "Facebook" },
  { id: "INSTAGRAM_REELS", label: "Instagram Reels", short: "Instagram" },
] as const;

export function buildClipTitle(clip: any) {
  return `${clip.name} | รายการ ${clip.project?.name || "อัลมะดาริจญ์"} ตอนที่ ${clip.episode?.episodeNo || ""}`;
}

export function buildClipCaption(clip: any) {
  const project = clip.project?.name || "อัลมะดาริจญ์";
  return `${clip.name}
.
ส่วนหนึ่งจากคลิปเต็ม รายการ ${project} ตอนที่ ${clip.episode?.episodeNo || ""}
["${clip.episode?.name || ""}"]
.
ข้อคิดหนึ่งจากอัลกุรอาน เพื่อการทบทวนและพัฒนาตนเอง
.
#${project} #แนวคิดการพัฒนาตนเองจากอัลกุรอาน #อิสลาม #มุสลิม #ข้อคิดอิสลาม #พัฒนาตนเอง #เตือนใจ #tmyda`;
}

export function driveDownloadUrl(url: string) {
  const id = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}
