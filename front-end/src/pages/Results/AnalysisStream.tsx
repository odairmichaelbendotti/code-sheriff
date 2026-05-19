import { useEffect, useRef, useState } from "react";
import {
  LuShieldAlert,
  LuZap,
  LuSparkles,
  LuCircleCheck,
  LuLoader,
  LuTerminal,
  LuScanLine,
  LuOctagon,
  LuCircleAlert,
  LuArrowRight,
} from "react-icons/lu";
import type { Finding } from "./FindingCard";

interface AnalysisStreamProps {
  isStreaming: boolean;
  isDone: boolean;
  findings: Finding[];
  agentCounts: { security: number; performance: number; quality: number };
  stats: { critical: number; warning: number; suggestion: number };
}

const MESSAGES: { text: string; category: "security" | "performance" | "quality" }[] = [
  { text: "Reading all changed files…", category: "security" },
  { text: "Scanning for SQL injection patterns…", category: "security" },
  { text: "Checking for exposed API keys and secrets…", category: "security" },
  { text: "Analyzing authentication and authorization flows…", category: "security" },
  { text: "Inspecting input validation logic…", category: "security" },
  { text: "Checking for hardcoded credentials…", category: "security" },
  { text: "Inspecting authorization checks…", category: "security" },
  { text: "Scanning for N+1 query patterns…", category: "performance" },
  { text: "Checking loop efficiency and memory allocation…", category: "performance" },
  { text: "Looking for synchronous blocking calls…", category: "performance" },
  { text: "Analyzing async/await usage patterns…", category: "performance" },
  { text: "Checking for memory leaks in event listeners…", category: "performance" },
  { text: "Checking naming conventions and code structure…", category: "quality" },
  { text: "Scanning for DRY violations…", category: "quality" },
  { text: "Analyzing function complexity…", category: "quality" },
  { text: "Checking TypeScript type coverage…", category: "quality" },
  { text: "Looking for unhandled promise rejections…", category: "quality" },
  { text: "Looking for dead code and unused exports…", category: "quality" },
  { text: "Reviewing error handling patterns…", category: "quality" },
  { text: "Finalizing analysis report…", category: "quality" },
];

const CATEGORY_CONFIG = {
  security: {
    label: "Security",
    icon: LuShieldAlert,
    color: "text-red-400",
    dot: "bg-red-400",
    cardColor: "text-red-500",
    cardBg: "bg-red-500/8",
    cardBorder: "border-red-500/20",
  },
  performance: {
    label: "Performance",
    icon: LuZap,
    color: "text-blue-400",
    dot: "bg-blue-400",
    cardColor: "text-blue-500",
    cardBg: "bg-blue-500/8",
    cardBorder: "border-blue-500/20",
  },
  quality: {
    label: "Quality",
    icon: LuSparkles,
    color: "text-emerald-400",
    dot: "bg-emerald-400",
    cardColor: "text-emerald-500",
    cardBg: "bg-emerald-500/8",
    cardBorder: "border-emerald-500/20",
  },
};

function randomDelay(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SHUFFLED = [...MESSAGES].sort(() => Math.random() - 0.5);

export default function AnalysisStream({ isStreaming, isDone, findings, agentCounts, stats }: AnalysisStreamProps) {
  const [log, setLog] = useState<typeof MESSAGES>([]);
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming || isDone) return;
    let i = 0;
    const t = setInterval(() => {
      if (i < SHUFFLED.length) {
        setLog((prev) => [...prev, SHUFFLED[i]]);
        i++;
      }
    }, 3000);
    return () => clearInterval(t);
  }, [isStreaming, isDone]);

  useEffect(() => {
    if (!isStreaming || isDone) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isStreaming, isDone]);

  useEffect(() => {
    if (!isDone) return;
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [isDone]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const verdict =
    stats.critical > 0
      ? { label: "Blocked", icon: LuOctagon, color: "text-red-500", bg: "bg-red-500/8", border: "border-red-500/20", desc: `${stats.critical} critical issue${stats.critical > 1 ? "s" : ""} must be resolved before merging.` }
      : stats.warning > 0
      ? { label: "Review needed", icon: LuCircleAlert, color: "text-amber-500", bg: "bg-amber-500/8", border: "border-amber-500/20", desc: `${stats.warning} warning${stats.warning > 1 ? "s" : ""} found. Review before merging.` }
      : { label: "Looks good", icon: LuCircleCheck, color: "text-emerald-500", bg: "bg-emerald-500/8", border: "border-emerald-500/20", desc: "No critical issues or warnings. Safe to merge." };

  const VerdictIcon = verdict.icon;

  /* ── DONE STATE ── */
  if (isDone) {
    return (
      <div className="flex flex-col gap-4">
        {/* Verdict hero */}
        <div className={`rounded-2xl border ${verdict.border} ${verdict.bg} p-6 flex flex-col gap-5`}>
          <div className="flex items-center gap-3">
            <VerdictIcon size={32} className={verdict.color} strokeWidth={1.5} />
            <div>
              <p className={`text-xl font-bold ${verdict.color} leading-none`}>{verdict.label}</p>
              <p className="text-sm text-text-secondary mt-1">{verdict.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1 border-t border-black/6">
            <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {stats.critical} critical
            </span>
            <span className="flex items-center gap-1.5 text-sm text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {stats.warning} warnings
            </span>
            <span className="flex items-center gap-1.5 text-sm text-text-tertiary">
              <span className="w-2 h-2 rounded-full bg-border-default" />
              {stats.suggestion} suggestions
            </span>
          </div>
        </div>

        {/* Agent breakdown */}
        <div className="grid grid-cols-3 gap-2">
          {(["security", "performance", "quality"] as const).map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const Icon = cfg.icon;
            const count = agentCounts[cat];
            return (
              <div
                key={cat}
                className={`flex flex-col gap-2 p-4 rounded-xl border ${cfg.cardBorder} ${cfg.cardBg}`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={15} className={cfg.cardColor} />
                  <span className={`text-lg font-bold leading-none ${cfg.cardColor}`}>{count}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{cfg.label}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {count === 1 ? "1 finding" : `${count} findings`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Redirect notice */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border-subtle bg-bg-primary">
          <div className="flex items-center gap-2">
            <LuCircleCheck size={13} className="text-emerald-500" />
            <span className="text-xs text-text-secondary">
              Redirecting to full results in <span className="font-semibold text-text-primary">{countdown}s</span>…
            </span>
          </div>
          <LuArrowRight size={13} className="text-text-tertiary" />
        </div>
      </div>
    );
  }

  /* ── STREAMING STATE ── */
  return (
    <div className="flex flex-col gap-4">
      {/* Terminal card */}
      <div className="rounded-2xl border border-accent/30 bg-bg-primary overflow-hidden shadow-sm">
        {/* macOS-style top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-tertiary">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5">
            <LuScanLine size={12} className="text-accent" />
            <span className="text-xs text-text-secondary font-medium">CodeSheriff — AI Analysis</span>
          </div>
          <span className="text-xs font-mono text-text-tertiary tabular-nums">
            {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
          </span>
        </div>

        {/* Log output */}
        <div
          ref={logRef}
          className="p-4 min-h-52 max-h-72 overflow-y-auto flex flex-col gap-1.5 font-mono text-xs"
        >
          <div className="flex items-center gap-2 text-text-tertiary mb-1">
            <span className="text-accent">$</span>
            <span>sheriff analyze --pr</span>
          </div>

          {log.map((entry, i) => {
            const cfg = CATEGORY_CONFIG[entry.category];
            const Icon = cfg.icon;
            const isLast = i === log.length - 1;
            return (
              <div key={i} className={`flex items-start gap-2 transition-opacity duration-300 ${isLast ? "text-accent" : "text-text-secondary"}`}>
                <span className="text-text-tertiary select-none mt-px">›</span>
                <Icon size={11} className={`${cfg.color} shrink-0 mt-0.5`} />
                <span>{entry.text}</span>
                {isLast && <LuLoader size={10} className="animate-spin shrink-0 mt-0.5 ml-1" />}
              </div>
            );
          })}

          {log.length === 0 && isStreaming && (
            <div className="flex items-center gap-2 text-text-tertiary">
              <LuLoader size={11} className="animate-spin shrink-0" />
              <span>Starting analysis…</span>
            </div>
          )}
        </div>

        {/* Progress bar — pulses indefinitely while streaming */}
        <div className="h-0.5 bg-bg-tertiary overflow-hidden">
          <div className="h-full w-1/3 bg-accent animate-[slide_1.8s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Dimension badges */}
      <div className="grid grid-cols-3 gap-2">
        {(["security", "performance", "quality"] as const).map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const Icon = cfg.icon;
          return (
            <div key={cat} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border-subtle bg-bg-primary">
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
              <Icon size={12} className={cfg.color} />
              <span className="text-xs text-text-secondary capitalize">{cat}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
