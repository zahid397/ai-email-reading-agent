export type LogLevel = "info" | "success" | "error" | "warn";

export interface ClientLog {
    id: string;
    time: string;
    level: LogLevel;
    message: string;
}

const STORAGE_KEY = "ai_agent_client_logs";
const MAX_LOGS = 150;

export function addClientLog(level: LogLevel, message: string): void {
    if (typeof window === "undefined") return;
    const log: ClientLog = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        time: new Date().toISOString(),
        level,
        message,
    };
    const existing = getClientLogs();
    const updated = [log, ...existing].slice(0, MAX_LOGS);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
        // localStorage quota exceeded — clear and retry once
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([log]));
        } catch { /* ignore */ }
    }
}

export function getClientLogs(): ClientLog[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as ClientLog[];
    } catch {
        return [];
    }
}

export function clearClientLogs(): void {
    if (typeof window === "undefined") return;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}