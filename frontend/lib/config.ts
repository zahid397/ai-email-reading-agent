export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export const POLL_MS = 30_000;
export const POLL_SECONDS = 120;

export type View =
  | "dashboard"
  | "important"
  | "all"
  | "config"
  | "sources"
  | "logs"
  | "settings";
