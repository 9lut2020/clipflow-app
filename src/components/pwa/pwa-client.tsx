"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Bell, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: InstallPromptEvent | null = null;
const installListeners = new Set<(p: InstallPromptEvent | null) => void>();

export function usePwaInstall() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(deferredPrompt);
  
  useEffect(() => {
    const listener = (p: InstallPromptEvent | null) => setPrompt(p);
    installListeners.add(listener);
    return () => { installListeners.delete(listener); };
  }, []);
  
  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      deferredPrompt = null;
      installListeners.forEach((l) => l(null));
    }
  };
  return { prompt, install };
}

export function PwaInstallButton() {
  const { prompt, install } = usePwaInstall();
  if (!prompt) return null;
  return (
    <button
      onClick={install}
      className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition relative"
      title="ติดตั้งแอป ClipFlow"
      aria-label="ติดตั้งแอป ClipFlow"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
    </button>
  );
}

export function PwaClient() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async () => {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            await subscribeToPush();
          }
        })
        .catch((error) => {
          console.error("PWA service worker registration failed", error);
        });
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(registerServiceWorker, {
        timeout: 3000,
      });
    } else {
      timeoutId = globalThis.setTimeout(registerServiceWorker, 1200);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event as InstallPromptEvent;
      installListeners.forEach((l) => l(deferredPrompt));
    };

    const onInstalled = () => {
      deferredPrompt = null;
      installListeners.forEach((l) => l(null));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if ("cancelIdleCallback" in window && "requestIdleCallback" in window) {
        window.cancelIdleCallback(idleId!);
      } else if (timeoutId !== undefined) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);

  return null;
}

function base64UrlToBytes(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(base64), (character) =>
    character.charCodeAt(0),
  );
}

async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const keyResponse = await apiClient.get<string>(
      "/notifications/push/vapid-key",
    );
    if (keyResponse.status !== "success" || !keyResponse.data) return false;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToBytes(keyResponse.data),
      }));
    const result = await apiClient.post(
      "/notifications/push/subscribe",
      subscription.toJSON(),
    );
    return result.status === "success";
  } catch (error) {
    console.error("Push subscription failed", error);
    return false;
  }
}

export function useBrowserNotifications(unreadCount: number | undefined) {
  const previousCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount === undefined) return;

    if (
      previousCount.current !== undefined &&
      unreadCount > previousCount.current &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
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
  const [requestedPermission, setRequestedPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const browserPermission = useSyncExternalStore(
    () => () => {},
    () => ("Notification" in window ? Notification.permission : "unsupported"),
    () => "default" as NotificationPermission | "unsupported",
  );
  const permission =
    browserPermission === "default" ? requestedPermission : browserPermission;

  if (permission === "granted" || permission === "unsupported") return null;

  return (
    <button
      type="button"
      onClick={async () => {
        const granted = await requestBrowserNotifications();
        if (granted) setRequestedPermission("granted");
      }}
      className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
      title="เปิดการแจ้งเตือนบนอุปกรณ์"
      aria-label="เปิดการแจ้งเตือนบนอุปกรณ์"
    >
      <Bell size={16} />
    </button>
  );
}
