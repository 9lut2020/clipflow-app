/**
 * thumbnail-helper.ts
 * Extracts a public thumbnail URL from various video/file hosting services.
 * Supports: YouTube, Google Drive, TikTok (fallback)
 */

export type ThumbnailSource = "youtube" | "drive" | "tiktok" | "unknown";

export interface ThumbnailResult {
  url: string | null;
  source: ThumbnailSource;
}

/**
 * Extract YouTube video ID from various YouTube URL formats.
 */
function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    // youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("?")[0] || null;
    }
    // youtube.com/watch?v=VIDEO_ID
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.searchParams.get("v")
    ) {
      return parsed.searchParams.get("v");
    }
    // youtube.com/embed/VIDEO_ID or youtube.com/shorts/VIDEO_ID
    const match = parsed.pathname.match(/\/(embed|shorts|v)\/([^/?]+)/);
    if (match) return match[2];
  } catch {}
  return null;
}

/**
 * Extract Google Drive file ID from various Drive URL formats.
 */
function extractDriveFileId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("google.com")) return null;

    // drive.google.com/file/d/FILE_ID/...
    const fileMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];

    // drive.google.com/open?id=FILE_ID
    const idParam = parsed.searchParams.get("id");
    if (idParam) return idParam;
  } catch {}
  return null;
}

/**
 * Main function: extract thumbnail URL from any supported video URL.
 */
export function extractThumbnailUrl(rawUrl: string | null | undefined): ThumbnailResult {
  if (!rawUrl) return { url: null, source: "unknown" };

  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith("http")) return { url: null, source: "unknown" };

  // 1. YouTube
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      url: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`,
      source: "youtube",
    };
  }

  // 2. Google Drive
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    return {
      url: `https://drive.google.com/thumbnail?id=${driveId}&sz=w400`,
      source: "drive",
    };
  }

  // 3. TikTok / others - no public thumbnail
  if (trimmed.includes("tiktok.com")) {
    return { url: null, source: "tiktok" };
  }

  return { url: null, source: "unknown" };
}
