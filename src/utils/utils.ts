import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatImageUrl(url?: string | null): string {
  if (!url) return "";
  
  // Google Drive format 1: https://drive.google.com/file/d/1BXlGa25pURVk_pa69iXH_9b144-kKhv3/view
  const fileDMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }
  
  // Google Drive format 2: https://drive.google.com/uc\?.*id=([a-zA-Z0-9_-]+)
  const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+).*drive\.google\.com\/uc/);
  if (ucMatch && ucMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  }
  
  return url;
}
