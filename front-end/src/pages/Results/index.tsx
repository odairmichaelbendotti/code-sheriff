import { useState, useEffect, useRef } from "react";
import { useParams, NavLink, useLocation } from "react-router";
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
  LuActivity,
  LuList,
  LuFileCode,
} from "react-icons/lu";
import FindingCard, { type Finding } from "./FindingCard";
import AnalysisStream from "./AnalysisStream";
import Stepper from "@/components/Stepper";

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

type View = "stream" | "results";

export default function Results() {
  const { owner, repo, prNumber } = useParams();
  const { state } = useLocation();
  const [activeAgent, setActiveAgent] = useState<AgentFilter>("all");
  const [view, setView] = useState<View>("stream");
  const [streamFindings, setStreamFindings] = useState<Finding[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const findingsBuffer = useRef<Finding[]>([]);
  const fetchStarted = useRef(false);

  useEffect(() => {
    if (!state || fetchStarted.current) return;
    fetchStarted.current = true;

    const { files, agents } = state as { files: unknown[]; agents: string[] };

    fetch(`${import.meta.env.VITE_SERVER_URL}/api/analyze/run`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, repo, prNumber, files, agents }),
    }).then((res) => {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            setIsStreaming(false);
            return;
          }

          const text = decoder.decode(value);
          const lines = text.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.replace("data: ", "").trim();
            const event = JSON.parse(data) as { type: string; agent?: string; data?: object };

            if (event.type === "finding") {
              const finding = event.data as Omit<Finding, "id">;
              findingsBuffer.current.push({ ...finding, id: crypto.randomUUID() });
            } else if (event.type === "done") {
              setStreamFindings(findingsBuffer.current);
              setIsStreaming(false);
              setIsDone(true);
              setTimeout(() => setView("results"), 4500);
            }
          }

          read();
        });
      }

      read();
    });
  }, []);

  const findings = streamFindings;

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

  const groupedByFile = filtered.reduce<Record<string, typeof filtered>>((acc, f) => {
    if (!acc[f.file]) acc[f.file] = [];
    acc[f.file].push(f);
    return acc;
  }, {});

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

        {/* View toggle */}
        <div className="flex items-center gap-2 p-1 rounded-lg bg-bg-tertiary self-start">
          <button
            type="button"
            onClick={() => setView("stream")}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
              view === "stream"
                ? "bg-bg-primary text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-secondary",
            ].join(" ")}
          >
            <LuActivity size={12} />
            Agent stream
          </button>
          <button
            type="button"
            onClick={() => setView("results")}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
              view === "results"
                ? "bg-bg-primary text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-secondary",
            ].join(" ")}
          >
            <LuList size={12} />
            Results
          </button>
        </div>

        {view === "stream" && (
          <AnalysisStream
            isStreaming={isStreaming}
            isDone={isDone}
            findings={streamFindings}
            agentCounts={agentCounts}
            stats={stats}
          />
        )}

        {view === "results" && <>
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
                  {owner}/{repo}
                  <span className="ml-1.5 font-normal text-text-tertiary">
                    #{prNumber}
                  </span>
                </h1>
              </div>
            </div>
            <a
              href={`https://github.com/${owner}/${repo}/pull/${prNumber}`}
              target="_blank"
              rel="noopener noreferrer"
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
              {filtered.length} total · {Object.keys(groupedByFile).length} {Object.keys(groupedByFile).length === 1 ? "file" : "files"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-tertiary border border-dashed border-border-subtle rounded-xl">
              No findings for this agent.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(groupedByFile).map(([file, fileFindings]) => (
                <div key={file} className="flex flex-col gap-0 rounded-xl border border-border-subtle overflow-hidden">
                  {/* File header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-bg-tertiary border-b border-border-subtle">
                    <div className="flex items-center gap-2 min-w-0">
                      <LuFileCode size={13} className="text-text-tertiary shrink-0" />
                      <span className="text-xs font-mono text-text-secondary truncate">{file}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      {fileFindings.some((f) => f.severity === "critical") && (
                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {fileFindings.filter((f) => f.severity === "critical").length}
                        </span>
                      )}
                      {fileFindings.some((f) => f.severity === "warning") && (
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {fileFindings.filter((f) => f.severity === "warning").length}
                        </span>
                      )}
                      {fileFindings.some((f) => f.severity === "suggestion") && (
                        <span className="flex items-center gap-1 text-xs text-text-tertiary">
                          <span className="w-1.5 h-1.5 rounded-full bg-border-default" />
                          {fileFindings.filter((f) => f.severity === "suggestion").length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Findings dentro do arquivo */}
                  <div className="flex flex-col divide-y divide-border-subtle">
                    {fileFindings.map((f) => (
                      <FindingCard key={f.id} finding={f} grouped />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>}
      </div>
    </main>
  );
}
