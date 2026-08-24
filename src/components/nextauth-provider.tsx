"use client";

import { SessionProvider } from "next-auth/react";
import { SessionWatcher } from "./app-layout/session-watcher";

export default function NextAuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <SessionProvider session={session}>
      <SessionWatcher />
      {children}
    </SessionProvider>
  );
}
