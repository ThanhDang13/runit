import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeMultiline(value: string | null | undefined): string {
  if (!value) return "";

  return value.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}
