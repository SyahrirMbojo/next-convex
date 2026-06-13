import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const defaultRowPage = 10;
export const listRowPagination = [10, 25, 50, 100];

export function getShortText(name: string) {
  let newtext = "";
  if (name !== undefined) {
    const convertArr = name.split(" ");
    newtext =
      convertArr.length > 1
        ? `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`
        : `${name.split(" ")[0][0]}`;
  }

  return newtext.toUpperCase();
}

const AVATAR_COLORS = [
  "0.55 0.22 285", // Blue
  "0.40 0.15 150", // Green
  "0.55 0.18 35", // Orange
  "0.35 0.08 80", // Olive
  "0.40 0.12 175", // Teal
  "0.55 0.20 320", // Pink
  "0.50 0.18 250", // Purple
  "0.55 0.15 200", // Cyan
];

export function getColorFromName(name: string): string {
  if (!name) {
    return AVATAR_COLORS[0];
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
