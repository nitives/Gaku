import { toast } from "react-hot-toast";

// 1. Overload signatures:
export function showToast(type: "success" | "error", message: string): void;
export function showToast(
  type: "warning",
  message: string,
  warningIcon?: string
): void;
export function showToast(type: "loading" | "info", message: string): void;

// 2. Single implementation that covers both:
export function showToast(
  type: "success" | "error" | "warning" | "loading" | "info",
  message: string,
  warningIcon?: string
): void {
  const duration = 3500;
  switch (type) {
    case "success":
      toast.success(message, { duration });
      break;
    case "error":
      toast.error(message, { duration });
      break;
    case "loading":
      toast.loading(message, { duration });
      break;
    case "info":
      toast(message, { duration });
      break;
    case "warning":
      toast(message, { icon: warningIcon || "⚠️", duration });
      break;
  }
}
