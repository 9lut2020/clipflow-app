"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LoginButton() {
  return (
    <Button
      onClick={() => signIn("line", { callbackUrl: "/dashboard" })}
      className="w-full gap-2 bg-white hover:bg-gray-50 cursor-pointer text-[#00B900] text-lg h-14 rounded-2xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <Image
        src="/Image/Line_LOGO.png"
        alt="LINE Logo"
        width={30}
        height={30}
        className="object-contain"
      />
      เข้าสู่ระบบด้วย LINE
    </Button>
  );
}
