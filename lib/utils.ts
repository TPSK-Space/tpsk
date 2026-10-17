// lib/utils.ts - Shared Utility Functions (port dari src/lib/utils.ts)

/**
 * Generate unique codes for trip slugs, barcodes, and IDs
 */
export function generateUniqueCode(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${randomPart}`;
}

/**
 * Format currency to Indonesian Rupiah format
 */
export function formatRupiah(amount: number | string): string {
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/['";]/g, "")
    .trim();
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Show toast notification instead of alert()
 */
type ToastType = "success" | "error" | "warning" | "info";

export function showToast(message: string, type: ToastType = "info", duration = 3000) {
  const existingToast = document.getElementById("toast-notification");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "toast-notification";
  toast.className =
    "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-bold uppercase tracking-widest text-xs max-w-xs text-center animate-fade-in border";

  const colors: Record<ToastType, string> = {
    success: "bg-emerald-500/90 border-emerald-500/50 text-emerald-50",
    error: "bg-red-500/90 border-red-500/50 text-red-50",
    warning: "bg-yellow-500/90 border-yellow-500/50 text-yellow-50",
    info: "bg-blue-500/90 border-blue-500/50 text-blue-50",
  };

  toast.classList.add(colors[type]);
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}
