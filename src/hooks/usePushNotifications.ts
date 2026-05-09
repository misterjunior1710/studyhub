import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const FN_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/web-push`;

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
};

export type PushSupport =
  | "supported"
  | "ios-needs-install" // iOS Safari requires Add to Home Screen first
  | "ios-too-old" // iOS < 16.4
  | "unsupported";

export const detectPushSupport = (): PushSupport => {
  if (typeof window === "undefined") return "unsupported";
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  if (isIOS) {
    const m = ua.match(/OS (\d+)[._](\d+)/);
    const major = m ? parseInt(m[1], 10) : 0;
    const minor = m ? parseInt(m[2], 10) : 0;
    const supportsIOSPush = major > 16 || (major === 16 && minor >= 4);
    if (!supportsIOSPush) return "ios-too-old";
    if (!isStandalone) return "ios-needs-install";
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported";
  }
  return "supported";
};

const authHeader = async (): Promise<HeadersInit> => {
  const { data } = await supabase.auth.getSession();
  return data.session
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : {};
};

export const usePushNotifications = () => {
  const [support, setSupport] = useState<PushSupport>("unsupported");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const s = detectPushSupport();
    setSupport(s);
    if (s !== "supported") return;
    setPermission(Notification.permission);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch {
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const subscribe = useCallback(async () => {
    if (detectPushSupport() !== "supported") return false;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const keyRes = await fetch(`${FN_URL}?action=key`);
      const { publicKey } = await keyRes.json();
      if (!publicKey) throw new Error("No VAPID key");

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const res = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({
          action: "subscribe",
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setIsSubscribed(true);
      return true;
    } catch (e) {
      console.error("[push] subscribe failed", e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(FN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(await authHeader()) },
          body: JSON.stringify({ action: "unsubscribe", endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      return true;
    } catch (e) {
      console.error("[push] unsubscribe failed", e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { support, permission, isSubscribed, loading, subscribe, unsubscribe, refresh };
};

export const sendBroadcast = async (title: string, body: string, url?: string) => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({ action: "broadcast", title, body, url }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
