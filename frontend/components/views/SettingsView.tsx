import { BACKEND_URL } from "@/lib/config";
import {
  CheckCircle2,
  Clock,
  Container,
  Database,
  FileJson,
  Server,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ENV_CHECKS = [
  { name: "Backend API", detail: BACKEND_URL, icon: Server },
  { name: "PostgreSQL DB", detail: "postgresql+asyncpg", icon: Database },
  { name: "Mock Source", detail: "mock_data/emails.json", icon: FileJson },
] as const;

export function SettingsView() {
  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-2xl border border-border bg-card/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Project Settings</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SettingItem
            icon={Clock}
            label="Polling Interval"
            value="2 min"
            description="APScheduler runs process_emails every 120 seconds"
          />
          <SettingItem
            icon={Database}
            label="Database"
            value="PostgreSQL"
            description="Async SQLAlchemy with asyncpg driver"
          />
          <SettingItem
            icon={Container}
            label="Docker"
            value="Enabled"
            description="docker-compose: postgres, backend, frontend"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-5">
        <h2 className="mb-4 text-sm font-semibold">Environment Checklist</h2>
        <ul className="space-y-3">
          {ENV_CHECKS.map(({ name, detail, icon: Icon }) => (
            <li
              key={name}
              className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{detail}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/20 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Runtime Variables</h3>
        <div className="mt-3 grid gap-2 font-mono text-xs">
          {[
            ["NEXT_PUBLIC_BACKEND_URL", BACKEND_URL],
            ["GROQ_MODEL", "llama3-8b-8192"],
            ["MOCK_EMAIL_FILE", "mock_data/emails.json"],
            ["BACKEND_CORS_ORIGINS", "http://localhost:3000"],
          ].map(([key, val]) => (
            <div
              key={key}
              className="flex flex-col gap-0.5 rounded-lg border border-border/50 bg-background/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-muted-foreground">{key}</span>
              <span className="text-foreground/80">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingItem({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary")}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
