/* Meta Pixel helper — chama window.fbq de forma segura no client */
export function fbq(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (typeof w.fbq !== "function") return;
  if (params) {
    w.fbq("track", event, params);
  } else {
    w.fbq("track", event);
  }
}
