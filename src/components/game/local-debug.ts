"use client";

export function shouldExposeLocalDebug() {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  return (
    process.env.NODE_ENV !== "production" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}
