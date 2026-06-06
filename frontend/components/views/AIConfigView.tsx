import {
  ArrowRight,
  Brain,
  Cpu,
  Lock,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AI_OUTPUT = `{
  "important": true,
  "priority": "HIGH",
  "category": "PAYMENT_ISSUE",
  "reason": "Payment failure requires immediate action."
}`;

export function AIConfigView() {
  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ConfigCard
          icon={Zap}
          title="Hybrid AI Method"
          value="Groq + Rule Fallback"
          description="Uses Groq LLM when API key is set; falls back to keyword rules for reliability."
          tint="text-violet-300 bg-violet-500/15"
        />
        <ConfigCard
          icon={Cpu}
          title="Model"
          value="Groq / Llama3-8b"
          description="llama3-8b-8192 via Groq API. Configured via GROQ_MODEL env variable."
          tint="text-sky-300 bg-sky-500/15"
        />
        <ConfigCard
          icon={Shield}
          title="Fallback Status"
          value="Active & Ready"
          description="Keyword-based classifier runs when Groq is unavailable or returns invalid JSON."
          tint="text-emerald-300 bg-emerald-500/15"
          badge="Enabled"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/40 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Classifier Pipeline</h2>
          </div>
          <div className="flex flex-col items-center gap-2 py-4 sm:flex-row sm:justify-center sm:gap-3">
            {["Raw Email", "Groq LLM", "JSON Parse", "Fallback Rules", "DB Save"].map(
              (step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-medium">
                    {step}
                  </span>
                  {i < arr.length - 1 && (
                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
                  )}
                </div>
              )
            )}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Emails flow left-to-right. Invalid Groq responses trigger the fallback path automatically.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">AI JSON Output Schema</h2>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border bg-background/80 p-4 font-mono text-xs leading-relaxed text-emerald-300/90">
            {AI_OUTPUT}
          </pre>
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <li>
              <span className="text-foreground/80">important</span> — boolean flag for dashboard
              surfacing
            </li>
            <li>
              <span className="text-foreground/80">priority</span> — HIGH · MEDIUM · LOW
            </li>
            <li>
              <span className="text-foreground/80">category</span> — PAYMENT_ISSUE, SERVER_DOWN, etc.
            </li>
            <li>
              <span className="text-foreground/80">reason</span> — human-readable AI explanation
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/20 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground">
            Configuration Form (Coming Soon)
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DisabledField label="Groq API Key" placeholder="gsk_••••••••••••" />
          <DisabledField label="Model Name" placeholder="llama3-8b-8192" />
          <DisabledField label="Temperature" placeholder="0.1" />
          <DisabledField label="Max Tokens" placeholder="512" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Settings are managed via environment variables in this iteration. UI controls will be
          enabled in a future release.
        </p>
      </div>
    </div>
  );
}

function ConfigCard({
  icon: Icon,
  title,
  value,
  description,
  tint,
  badge,
}: {
  icon: typeof Zap;
  title: string;
  value: string;
  description: string;
  tint: string;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tint)}>
          <Icon className="h-4 w-4" />
        </span>
        {badge && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            {badge}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-xs text-muted-foreground">{title}</h3>
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function DisabledField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        disabled
        placeholder={placeholder}
        className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm opacity-60"
      />
    </div>
  );
}
