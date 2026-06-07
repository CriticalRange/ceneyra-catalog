"use client";

import { useEffect, useRef } from "react";

let cachedToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await fetch("/api/auth/csrf");
  if (!res.ok) throw new Error("Failed to fetch CSRF token");
  const { token } = await res.json();
  cachedToken = token;
  return token;
}

export function csrfHeaders(extra?: Record<string, string>): Record<string, string> {
  return { "Content-Type": "application/json", ...extra };
}

export async function csrfFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getCsrfToken();
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> ?? {}),
      "x-csrf-token": token,
    },
  });
}
