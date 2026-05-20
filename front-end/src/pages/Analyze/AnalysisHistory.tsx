import { useState, useEffect } from "react";
import {
  LuGitPullRequest,
  LuClock,
  LuChevronRight,
  LuX,
  LuTrash2,
  LuOctagon,
  LuCircleAlert,
  LuCircleCheck,
  LuShieldAlert,
  LuZap,
  LuSparkles,
  LuFileCode,
  LuExternalLink,
} from "react-icons/lu";
import { defaultFetch } from "@/utils/defaultFetch";
import FindingCard, { type Finding } from "../Results/FindingCard";

interface Analysis {
  id: string;
  owner: string;
  repo: string;
  prNumber: number;
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
  findings: Finding[];
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function totalFindings(a: Analysis) {
  return a.criticalCount + a.warningCount + a.suggestionCount;
}

function getVerdict(critical: number, warning: number) {
  if (critical > 0) return { label: "Blocked", icon: LuOctagon, color: "text-red-500", bg: "bg-red-500/8", border: "border-red-500/20", desc: `${critical} critical issue${critical > 1 ? "s" : ""} must be resolved.` };
  if (warning > 0) return { label: "Review needed", icon: LuCircleAlert, color: "text-amber-500", bg: "bg-amber-500/8", border: "border-amber-500/20", desc: `${warning} warning${warning > 1 ? "s" : ""} found.` };
  return { label: "Looks good", icon: LuCircleCheck, color: "text-emerald-500", bg: "bg-emerald-500/8", border: "border-emerald-500/20", desc: "No critical issues or warnings." };
}

const AGENT_CONFIG = {
  security: { label: "Security", icon: LuShieldAlert, color: "text-red-500" },
  performance: { label: "Performance", icon: LuZap, color: "text-blue-500" },
  quality: { label: "Quality", icon: LuSparkles, color: "text-emerald-500" },
} as const;

type AgentFilter = "all" | "security" | "performance" | "quality";
const SEVERITY_ORDER = { critical: 0, warning: 1, suggestion: 2 };

function AnalysisModal({ analysis, onClose, onDelete }: { analysis: Analysis; onClose: () => void; onDelete: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentFilter>("all");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    defaultFetch({ endpoint: `/api/analyze/history/${analysis.id}`, method: "DELETE", credentials: "include" })
      .then(() => { onDelete(analysis.id); close(); })
      .catch(() => {});
  }

  const verdict = getVerdict(analysis.criticalCount, analysis.warningCount);
  const VerdictIcon = verdict.icon;

  const findings: Finding[] = Array.isArray(analysis.findings) ? analysis.findings.map((f: Finding) => ({ ...f, id: f.id ?? crypto.randomUUID() })) : [];

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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={close}
      />
      <div
        className="relative w-full max-w-2xl bg-bg-primary shadow-xl flex flex-col h-full transition-transform duration-300 ease-in-out"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-center shrink-0">
              <LuGitPullRequest size={14} className="text-text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{analysis.owner}/{analysis.repo} <span className="font-normal text-text-tertiary">#{analysis.prNumber}</span></p>
              <p className="text-xs text-text-tertiary">{formatDate(analysis.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://github.com/${analysis.owner}/${analysis.repo}/pull/${analysis.prNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            >
              GitHub <LuExternalLink size={11} />
            </a>
            <button
              type="button"
              onClick={handleDelete}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${confirmDelete ? "text-red-500 border-red-500/30 bg-red-500/8 hover:bg-red-500/15" : "text-text-tertiary border-border-subtle hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/8"}`}
            >
              <LuTrash2 size={12} />
              {confirmDelete ? "Confirm?" : "Delete"}
            </button>
            <button type="button" onClick={close} className="text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer">
              <LuX size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-5">
          {/* Verdict */}
          <div className={`rounded-xl border ${verdict.border} ${verdict.bg} p-4 flex items-center gap-3`}>
            <VerdictIcon size={24} className={verdict.color} strokeWidth={1.5} />
            <div>
              <p className={`text-base font-bold ${verdict.color} leading-none`}>{verdict.label}</p>
              <p className="text-xs text-text-secondary mt-1">{verdict.desc}</p>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-red-500 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{analysis.criticalCount} critical</span>
              <span className="flex items-center gap-1 text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{analysis.warningCount} warnings</span>
              <span className="flex items-center gap-1 text-text-tertiary"><span className="w-1.5 h-1.5 rounded-full bg-border-default" />{analysis.suggestionCount} suggestions</span>
            </div>
          </div>

          {/* Agent filter */}
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setActiveAgent("all")}
              className={`flex flex-col gap-1 p-3 rounded-lg border text-left cursor-pointer transition-colors ${activeAgent === "all" ? "bg-bg-tertiary border-border-default" : "bg-bg-primary border-border-subtle hover:bg-bg-secondary"}`}
            >
              <span className="text-xs font-medium text-text-primary">All</span>
              <span className="text-sm font-bold text-text-primary">{findings.length}</span>
            </button>
            {(["security", "performance", "quality"] as const).map((agent) => {
              const cfg = AGENT_CONFIG[agent];
              const Icon = cfg.icon;
              return (
                <button
                  key={agent}
                  type="button"
                  onClick={() => setActiveAgent(activeAgent === agent ? "all" : agent)}
                  className={`flex flex-col gap-1 p-3 rounded-lg border text-left cursor-pointer transition-colors ${activeAgent === agent ? "bg-bg-tertiary border-border-default" : "bg-bg-primary border-border-subtle hover:bg-bg-secondary"}`}
                >
                  <span className={`text-xs font-medium flex items-center gap-1 ${cfg.color}`}><Icon size={10} />{cfg.label}</span>
                  <span className={`text-sm font-bold ${cfg.color}`}>{agentCounts[agent]}</span>
                </button>
              );
            })}
          </div>

          {/* Findings */}
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-text-tertiary border border-dashed border-border-subtle rounded-xl">
              No findings for this filter.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(groupedByFile).map(([file, fileFindings]) => (
                <div key={file} className="rounded-xl border border-border-subtle overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-tertiary border-b border-border-subtle">
                    <LuFileCode size={12} className="text-text-tertiary shrink-0" />
                    <span className="text-xs font-mono text-text-secondary truncate">{file}</span>
                  </div>
                  <div className="flex flex-col divide-y divide-border-subtle">
                    {fileFindings.map((f) => <FindingCard key={f.id} finding={f} grouped />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const INITIAL_VISIBLE = 3;
const LOAD_MORE_COUNT = 5;

export default function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Analysis | null>(null);

  useEffect(() => {
    defaultFetch<Analysis[]>({
      endpoint: "/api/analyze/history",
      method: "GET",
      credentials: "include",
    })
      .then(setAnalyses)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const visible = analyses.slice(0, visibleCount);
  const hasMore = visibleCount < analyses.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">Recent analyses</span>
        {analyses.length > 0 && <span className="text-xs text-text-tertiary">{analyses.length} runs</span>}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <div className="py-12 text-center text-sm text-text-tertiary border border-dashed border-border-subtle rounded-xl">
          No analyses yet — run your first one above.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visible.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setSelected(a)}
                className="group w-full flex items-center gap-3 p-3 rounded-lg bg-bg-primary border border-border-subtle hover:border-border-default hover:shadow-sm transition-all text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-bg-tertiary flex items-center justify-center shrink-0">
                  <LuGitPullRequest className="text-text-secondary" size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-primary truncate">{a.owner}/{a.repo}</span>
                    <span className="text-xs text-text-tertiary shrink-0">#{a.prNumber}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {a.criticalCount > 0 && <span className="flex items-center gap-1 text-xs text-red-500 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{a.criticalCount} critical</span>}
                    {a.warningCount > 0 && <span className="flex items-center gap-1 text-xs text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />{a.warningCount} {a.warningCount === 1 ? "warning" : "warnings"}</span>}
                    {a.suggestionCount > 0 && <span className="flex items-center gap-1 text-xs text-text-tertiary"><span className="w-1.5 h-1.5 rounded-full bg-border-default shrink-0" />{a.suggestionCount} suggestions</span>}
                    {totalFindings(a) === 0 && <span className="text-xs text-emerald-500 font-medium">No issues found</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:flex items-center gap-1 text-xs text-text-tertiary"><LuClock size={11} />{formatDate(a.createdAt)}</span>
                  <LuChevronRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {(hasMore || visibleCount > INITIAL_VISIBLE) && (
        <div className="flex items-center justify-center gap-2">
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
            >
              View more ({analyses.length - visibleCount} remaining)
            </button>
          )}
          {hasMore && visibleCount > INITIAL_VISIBLE && (
            <span className="text-text-tertiary text-xs">·</span>
          )}
          {visibleCount > INITIAL_VISIBLE && (
            <button
              type="button"
              onClick={() => setVisibleCount(INITIAL_VISIBLE)}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
            >
              Show less
            </button>
          )}
        </div>
      )}

      {selected && (
        <AnalysisModal
          analysis={selected}
          onClose={() => setSelected(null)}
          onDelete={(id) => setAnalyses((prev) => prev.filter((a) => a.id !== id))}
        />
      )}
    </div>
  );
}
