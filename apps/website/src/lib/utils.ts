import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Small utility to merge classNames.
 * @param {ClassValue[]} inputs - An array of class names or objects to be combined.
 * @returns {string} A combined class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
