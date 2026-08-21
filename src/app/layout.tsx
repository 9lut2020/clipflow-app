import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/nextauth-provider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClipFlow",
  description: "ระบบติดตามและจัดการกระบวนการตรวจสอบคลิป",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#3b82f6" height={3} showSpinner={false} />
        <NextAuthProvider session={session}>{children}</NextAuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
