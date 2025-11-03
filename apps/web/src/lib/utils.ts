import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(
  isoLike: string | number | Date,
  options?: Intl.DateTimeFormatOptions & { timeZone?: string }
) {
  const tz = options?.timeZone || (import.meta.env.VITE_DEFAULT_TIMEZONE as string) || "Asia/Kuala_Lumpur";
  const dtf = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
    ...options,
  });
  const d = typeof isoLike === "string" || typeof isoLike === "number" ? new Date(isoLike) : isoLike;
  return dtf.format(d);
}