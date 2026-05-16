import { useState } from "react";
import { useParams, NavLink } from "react-router";
import {
  LuGitPullRequest,
  LuArrowLeft,
  LuExternalLink,
  LuShieldAlert,
  LuZap,
  LuSparkles,
  LuCircleCheck,
  LuCircleAlert,
  LuOctagon,
} from "react-icons/lu";
import FindingCard, { type Finding } from "./FindingCard";
import Stepper from "@/components/Stepper";

// TODO: replace with real data from backend
const MOCK_FINDINGS: Finding[] = [
  {
    id: "1",
    agent: "security",
    severity: "critical",
    file: "src/api/users.ts",
    line: 42,
    message:
      "Raw user input interpolated directly into SQL query without sanitization.",
    suggestion:
      "Use parameterized queries or a query builder. Replace `db.query('SELECT * FROM users WHERE id = ' + userId)` with `db.query('SELECT * FROM users WHERE id = ?', [userId])`.",
  },
  {
    id: "2",
    agent: "security",
    severity: "warning",
    file: ".env.example",
    line: 3,
    message:
      "A real secret key appears to be committed in the example env file.",
    suggestion:
      "Replace the actual value with a placeholder like `YOUR_SECRET_HERE`. Rotate the exposed secret immediately.",
  },
  {
    id: "3",
    agent: "performance",
    severity: "warning",
    file: "src/services/posts.ts",
    line: 18,
    message: "N+1 query detected: fetching author for each post inside a loop.",
    suggestion:
      "Batch the author lookups with a single `WHERE id IN (...)` query or use a DataLoader pattern to coalesce requests.",
  },
  {
    id: "4",
    agent: "performance",
    severity: "warning",
    file: "src/utils/transform.ts",
    line: 77,
    message:
      "Array spread inside a hot loop creates unnecessary allocations on every iteration.",
    suggestion:
      "Pre-allocate the result array with `new Array(input.length)` and assign by index instead of spreading.",
  },
  {
    id: "5",
    agent: "quality",
    severity: "suggestion",
    file: "src/components/UserCard.tsx",
    line: 12,
    message:
      "Component receives 8 props — consider grouping related ones into a single object.",
    suggestion:
      "Extract a `UserCardProps` interface that groups `firstName`, `lastName`, `avatarUrl` into a `user` object to reduce prop drilling.",
  },
  {
    id: "6",
    agent: "quality",
    severity: "suggestion",
    file: "src/hooks/useAuth.ts",
    line: 34,
    message: "Duplicated token refresh logic also present in `useSession.ts`.",
    suggestion:
      "Extract the refresh logic into a shared `refreshToken()` utility and import it from both hooks.",
  },
];

type AgentFilter = "all" | "security" | "performance" | "quality";

const AGENT_CONFIG = {
  security: {
    label: "Security",
    icon: LuShieldAlert,
    color: "text-red-500",
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    activeBorder: "border-red-500/50",
    activeBg: "bg-red-500/12",
  },
  performance: {
    label: "Performance",
    icon: LuZap,
    color: "text-blue-500",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    activeBorder: "border-blue-500/50",
    activeBg: "bg-blue-500/12",
  },
  quality: {
    label: "Quality",
    icon: LuSparkles,
    color: "text-emerald-500",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
    activeBorder: "border-emerald-500/50",
    activeBg: "bg-emerald-500/12",
  },
} as const;

function getVerdict(critical: number, warning: number) {
  if (critical > 0)
    return {
      label: "Blocked",
      description:
        critical === 1
          ? "1 critical issue must be resolved before merging."
          : `${critical} critical issues must be resolved before merging.`,
      icon: LuOctagon,
      color: "text-red-500",
      bg: "bg-red-500/8",
      border: "border-red-500/20",
    };
  if (warning > 0)
    return {
      label: "Review needed",
      description:
        warning === 1
          ? "1 warning found. Review before merging."
          : `${warning} warnings found. Review before merging.`,
      icon: LuCircleAlert,
      color: "text-amber-500",
      bg: "bg-amber-500/8",
      border: "border-amber-500/20",
    };
  return {
    label: "Looks good",
    description: "No critical issues or warnings. Safe to merge.",
    icon: LuCircleCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
  };
}

const SEVERITY_ORDER = { critical: 0, warning: 1, suggestion: 2 };

export default function Results() {
  const { id: _id } = useParams();
  const [activeAgent, setActiveAgent] = useState<AgentFilter>("all");

  const findings = MOCK_FINDINGS;

  const stats = {
    critical: findings.filter((f) => f.severity === "critical").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    suggestion: findings.filter((f) => f.severity === "suggestion").length,
  };

  const verdict = getVerdict(stats.critical, stats.warning);
  const VerdictIcon = verdict.icon;

  const agentCounts = {
    security: findings.filter((f) => f.agent === "security").length,
    performance: findings.filter((f) => f.agent === "performance").length,
    quality: findings.filter((f) => f.agent === "quality").length,
  };

  const filtered = findings
    .filter((f) => activeAgent === "all" || f.agent === activeAgent)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return (
    <main className="h-full bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-8 flex flex-col gap-8">
        {/* Back + Stepper */}
        <div className="flex items-center justify-between gap-4">
          <NavLink
            to="/app/analyze"
            className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors shrink-0"
          >
            <LuArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </NavLink>
          <Stepper current={2} />
          <div className="w-16 shrink-0 hidden sm:block" />
        </div>

        {/* Hero */}
        <div
          className={`rounded-2xl border ${verdict.border} ${verdict.bg} p-6 flex flex-col gap-5`}
        >
          {/* PR identity */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center shrink-0">
                <LuGitPullRequest size={16} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Pull Request</p>
                <h1 className="text-base font-semibold text-text-primary tracking-tight leading-snug">
                  vercel/next.js
                  <span className="ml-1.5 font-normal text-text-tertiary">
                    #71234
                  </span>
                </h1>
              </div>
            </div>
            <a
              href="#"
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors shrink-0 mt-1"
            >
              GitHub
              <LuExternalLink size={11} />
            </a>
          </div>

          {/* Verdict */}
          <div className="flex items-center gap-3">
            <VerdictIcon
              size={32}
              className={verdict.color}
              strokeWidth={1.5}
            />
            <div>
              <p className={`text-xl font-bold ${verdict.color} leading-none`}>
                {verdict.label}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {verdict.description}
              </p>
            </div>
          </div>

          {/* Counts */}
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

        {/* Agent filter cards */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-text-primary">Agents</span>
          <div className="grid grid-cols-3 gap-2">
            {(["security", "performance", "quality"] as const).map((agent) => {
              const cfg = AGENT_CONFIG[agent];
              const AgentIcon = cfg.icon;
              const isActive = activeAgent === agent;
              const count = agentCounts[agent];
              return (
                <button
                  key={agent}
                  type="button"
                  onClick={() => setActiveAgent(isActive ? "all" : agent)}
                  className={[
                    "flex flex-col gap-2 p-4 rounded-xl border text-left cursor-pointer transition-all duration-150",
                    "outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                    isActive
                      ? `${cfg.activeBg} ${cfg.activeBorder}`
                      : `bg-bg-primary ${cfg.border} hover:${cfg.bg}`,
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <AgentIcon size={16} className={cfg.color} />
                    <span
                      className={`text-lg font-bold leading-none ${cfg.color}`}
                    >
                      {count}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {cfg.label}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {count === 1 ? "1 finding" : `${count} findings`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Findings list */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">
              {activeAgent === "all"
                ? "All findings"
                : `${AGENT_CONFIG[activeAgent].label} findings`}
            </span>
            <span className="text-xs text-text-tertiary">
              {filtered.length} total
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-tertiary border border-dashed border-border-subtle rounded-xl">
              No findings for this agent.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
