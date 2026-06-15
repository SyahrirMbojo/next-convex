"use client";

import { JWTPayload, getCookieExpiry } from "./jwt";

const AUTH_COOKIE_NAME = "blog_auth_token";

export function setAuthCookie(token: string): void {
  const expiry = getCookieExpiry();
  document.cookie = `${AUTH_COOKIE_NAME}=${token};expires=${expiry.toUTCString()};path=/;SameSite=Lax;Secure=${window.location.protocol === "https:"}`;
}

export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === AUTH_COOKIE_NAME && value) {
      return value;
    }
  }
  return null;
}

export function removeAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function setUserCookie(user: JWTPayload): void {
  const expiry = getCookieExpiry();
  const userData = JSON.stringify(user);
  document.cookie = `blog_user_data=${encodeURIComponent(userData)};expires=${expiry.toUTCString()};path=/;SameSite=Lax;Secure=${window.location.protocol === "https:"}`;
}

export function getUserCookie(): JWTPayload | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "blog_user_data" && value) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function removeUserCookie(): void {
  document.cookie = `blog_user_data=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}
