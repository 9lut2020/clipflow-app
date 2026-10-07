import type { Metadata } from "next";
import { Prompt, Sarabun } from "next/font/google";
import { SlideDeck } from "./_components/deck";

const head = Prompt({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-slide-head",
});
const body = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-slide-body",
});

export const metadata: Metadata = {
  title: "สไลด์นำเสนอการใช้งาน | ClipFlow",
  description:
    "สไลด์นำเสนอการใช้งานระบบ ClipFlow ทีละขั้นตอนพร้อมภาพเคลื่อนไหว",
};

/** Public, chrome-free presentation of how ClipFlow is used. */
export default function SlidePage() {
  return (
    <div className={`${head.variable} ${body.variable}`}>
      <SlideDeck />
    </div>
  );
}
