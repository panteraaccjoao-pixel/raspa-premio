"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      reset: (id?: number) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function Recaptcha({ onChange }: { onChange: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;

    function render() {
      if (!ref.current || widgetId.current !== null || !window.grecaptcha?.render) return;
      widgetId.current = window.grecaptcha.render(ref.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (token: string) => onChange(token),
        "expired-callback": () => onChange(null),
        "error-callback": () => onChange(null),
      });
    }

    if (window.grecaptcha?.render) {
      render();
      return;
    }

    const scriptId = "recaptcha-api";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
    const interval = setInterval(() => {
      if (window.grecaptcha?.render) {
        clearInterval(interval);
        render();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [onChange]);

  if (!SITE_KEY) return null;
  return <div ref={ref} style={{ display: "flex", justifyContent: "center" }} />;
}
