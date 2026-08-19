import type { Metadata } from "next";
import MainLayoutClient from "@/components/app-layout/layout/main-layout-client";

export const metadata: Metadata = {
  title: {
    template: "%s | ClipFlow",
    default: "ClipFlow Dashboard",
  },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayoutClient>{children}</MainLayoutClient>;
}
