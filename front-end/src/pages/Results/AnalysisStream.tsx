import { useEffect, useState } from "react";
import { LuShieldAlert, LuZap, LuSparkles, LuCircleCheck, LuLoader } from "react-icons/lu";
import type { Finding } from "./FindingCard";

interface StreamEntry {
  agent: "security" | "performance" | "quality";
  text: string;
  done?: boolean;
}

interface AnalysisStreamProps {
  isStreaming: boolean;
  findings: Finding[];
}

const MOCK_STREAM: StreamEntry[] = [
  { agent: "security", text: "Reading changed files…" },
  { agent: "performance", text: "Reading changed files…" },
  { agent: "quality", text: "Reading changed files…" },
  { agent: "security", text: "Scanning for injection vectors and leaked secrets…" },
  { agent: "performance", text: "Checking for N+1 queries and loop inefficiencies…" },
  { agent: "quality", text: "Evaluating naming conventions and code structure…" },
  { agent: "security", text: "Found raw SQL interpolation on src/api/users.ts:42 — flagging as critical." },
  { agent: "security", text: "Found exposed secret in .env.example:3 — flagging as warning." },
  { agent: "security", text: "Analysis complete.", done: true },
  { agent: "performance", text: "Found N+1 query pattern in src/services/posts.ts:18 — flagging as warning." },
  { agent: "performance", text: "Found unnecessary array spread in src/utils/transform.ts:77 — flagging as warning." },
  { agent: "performance", text: "Analysis complete.", done: true },
  { agent: "quality", text: "Found excessive prop count in src/components/UserCard.tsx:12 — flagging as suggestion." },
  { agent: "quality", text: "Found duplicated token refresh logic in src/hooks/useAuth.ts:34 — flagging as suggestion." },
  { agent: "quality", text: "Analysis complete.", done: true },
];

const AGENT_CONFIG = {
  security: { label: "Security", icon: LuShieldAlert, color: "text-red-500", bg: "bg-red-500/8", border: "border-red-500/20" },
  performance: { label: "Performance", icon: LuZap, color: "text-blue-500", bg: "bg-blue-500/8", border: "border-blue-500/20" },
  quality: { label: "Quality", icon: LuSparkles, color: "text-emerald-500", bg: "bg-emerald-500/8", border: "border-emerald-500/20" },
} as const;

export default function AnalysisStream({ isStreaming, findings }: AnalysisStreamProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const done = !isStreaming;

  const agentsDone = {
    security: !isStreaming || MOCK_STREAM.slice(0, visibleCount).some((e) => e.agent === "security" && e.done),
    performance: !isStreaming || MOCK_STREAM.slice(0, visibleCount).some((e) => e.agent === "performance" && e.done),
    quality: !isStreaming || MOCK_STREAM.slice(0, visibleCount).some((e) => e.agent === "quality" && e.done),
  };

  useEffect(() => {
    if (visibleCount >= MOCK_STREAM.length) {
      return;
    }
    const delay = MOCK_STREAM[visibleCount]?.done ? 600 : 400;
    const timer = setTimeout(() => setVisibleCount((n) => n + 1), delay);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="flex flex-col gap-4">
      {/* Agent status cards */}
      <div className="grid grid-cols-3 gap-2">
        {(["security", "performance", "quality"] as const).map((agent) => {
          const cfg = AGENT_CONFIG[agent];
          const Icon = cfg.icon;
          const isDone = agentsDone[agent];
          const isRunning = !isDone && visibleCount > 0;
          return (
            <div
              key={agent}
              className={[
                "flex flex-col gap-2 p-4 rounded-xl border transition-colors",
                isDone ? `${cfg.bg} ${cfg.border}` : "bg-bg-primary border-border-subtle",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <Icon size={16} className={cfg.color} />
                {isDone ? (
                  <LuCircleCheck size={14} className={cfg.color} />
                ) : isRunning ? (
                  <LuLoader size={13} className="text-text-tertiary animate-spin" />
                ) : null}
              </div>
              <p className="text-sm font-medium text-text-primary">{cfg.label}</p>
              <p className="text-xs text-text-tertiary">{isDone ? "Done" : isRunning ? "Analyzing…" : "Waiting"}</p>
            </div>
          );
        })}
      </div>

      {/* Log */}
      <div className="rounded-xl border border-border-subtle bg-bg-primary overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <span className="text-xs font-medium text-text-secondary">Agent reasoning</span>
          {!done && (
            <span className="flex items-center gap-1.5 text-xs text-accent">
              <LuLoader size={11} className="animate-spin" />
              Analyzing…
            </span>
          )}
          {done && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500">
              <LuCircleCheck size={11} />
              Complete
            </span>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
          {done
            ? findings.map((finding, i) => {
                const cfg = AGENT_CONFIG[finding.agent];
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <Icon size={13} className={`${cfg.color} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                        {finding.file}:{finding.line} — {finding.message}
                      </p>
                    </div>
                    <LuCircleCheck size={12} className={`${cfg.color} shrink-0 mt-0.5`} />
                  </div>
                );
              })
            : MOCK_STREAM.slice(0, visibleCount).map((entry, i) => {
                const cfg = AGENT_CONFIG[entry.agent];
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <Icon size={13} className={`${cfg.color} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      <p className="text-xs text-text-secondary leading-relaxed mt-0.5">{entry.text}</p>
                    </div>
                    {entry.done && <LuCircleCheck size={12} className={`${cfg.color} shrink-0 mt-0.5`} />}
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
