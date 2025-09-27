export function isIPhone(): boolean {
  if (typeof navigator === "undefined") return false; // SSR guard
  const ua = navigator.userAgent || "";
  return /\biPhone\b|\biPod\b/i.test(ua);
}
