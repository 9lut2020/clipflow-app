"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Download, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaClient() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(async () => {
      if ("Notification" in window && Notification.permission === "granted") {
        await subscribeToPush();
      }
    }).catch((error) => {
      console.error("PWA service worker registration failed", error);
    });

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as InstallPromptEvent;
      setInstallEvent(promptEvent);
      setShowInstall(true);
    };

    const onInstalled = () => {
      setInstallEvent(null);
      setShowInstall(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!showInstall || !installEvent) return null;

  const install = async () => {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setShowInstall(false);
    setInstallEvent(null);
  };

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-xl md:bottom-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Download size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">ติดตั้ง ClipFlow</p>
        <p className="text-[11px] text-slate-500">เปิดงานและแจ้งเตือนได้สะดวกบนมือถือ</p>
      </div>
      <button onClick={install} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">
        ติดตั้ง
      </button>
      <button onClick={() => setShowInstall(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="ปิด">
        <X size={16} />
      </button>
    </div>
  );
}

function base64UrlToBytes(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
}

async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const keyResponse = await apiClient.get<string>("/public/push/vapid-key");
    if (keyResponse.status !== "success" || !keyResponse.data) return false;
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(keyResponse.data),
    });
    const result = await apiClient.post("/notifications/push/subscribe", subscription.toJSON());
    return result.status === "success";
  } catch (error) {
    console.error("Push subscription failed", error);
    return false;
  }
}

export function useBrowserNotifications(unreadCount: number) {
  const previousCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > previousCount.current && "Notification" in window && Notification.permission === "granted") {
      const registration = navigator.serviceWorker?.controller;
      if (registration) {
        registration.postMessage({
          type: "SHOW_NOTIFICATION",
          title: "ClipFlow มีการแจ้งเตือนใหม่",
          body: `มีการแจ้งเตือนใหม่ ${unreadCount - previousCount.current} รายการ`,
          url: "/notifications",
        });
      }
    }
    previousCount.current = unreadCount;
  }, [unreadCount]);
}

export async function requestBrowserNotifications() {
  if (!("Notification" in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    await subscribeToPush();
    return true;
  }
  return false;
}

export function NotificationPermissionButton() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setPermission("Notification" in window ? Notification.permission : "unsupported");
  }, []);

  if (permission === "granted" || permission === "unsupported") return null;

  return (
    <button
      type="button"
      onClick={async () => {
        const granted = await requestBrowserNotifications();
        if (granted) setPermission("granted");
      }}
      className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
      title="เปิดการแจ้งเตือนบนอุปกรณ์"
      aria-label="เปิดการแจ้งเตือนบนอุปกรณ์"
    >
      <Bell size={16} />
    </button>
  );
}
