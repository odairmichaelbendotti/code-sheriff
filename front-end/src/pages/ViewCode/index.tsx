import { usePrPreviewStore } from "@/store/prPreview.store";
import { useState, useEffect } from "react";
import { LuArrowLeft, LuGitPullRequest, LuPlay, LuTriangleAlert, LuX, LuBan, LuChevronDown } from "react-icons/lu";
import { useNavigate } from "react-router";
import FileDiff from "./FileDiff";
import Stepper from "@/components/Stepper";

const REASON_DESCRIPTIONS: Record<string, { label: string; description: string }> = {
  "file removed": {
    label: "File removed",
    description: "This file was deleted in the PR. Removed files no longer exist in the branch and cannot be fetched for analysis.",
  },
  "dependency or build artifact": {
    label: "Dependency / build artifact",
    description: "Files inside node_modules, dist, build, .next and similar directories are auto-generated and not your source code. Analyzing them would only generate noise.",
  },
  "lockfile": {
    label: "Lockfile",
    description: "Lockfiles like package-lock.json and yarn.lock are auto-generated dependency snapshots. They contain no logic to review for bugs or vulnerabilities.",
  },
  "not a code file": {
    label: "Not a code file",
    description: "Images, fonts, PDFs, markdown and other non-code assets contain no executable logic and are out of scope for security or quality analysis.",
  },
  "unsupported file type": {
    label: "Unsupported file type",
    description: "This file extension (.css, .scss, .html, etc.) is not in the supported language list. Only files with real executable logic are sent to the AI.",
  },
};

const CODE_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|swift|c|cpp|h|cs|php|rb|vue|svelte|sql|sh|yaml|yml|json|toml)$/i;
const ENV_FILES = /^\.env(\..+)?$/i;
const BLOCKED_FILES = new Set(["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Cargo.lock", "composer.lock", "Gemfile.lock"]);
const BLOCKED_EXTENSIONS = /\.(md|mdx|txt|png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|woff|woff2|ttf|eot)$/i;
const BLOCKED_PATHS = /(\b|\/)(node_modules|\.git|dist|build|\.next|\.nuxt|coverage|\.cache)(\/|$)/i;

function getAnalysisStatus(filename: string, status: string): { analyzable: boolean; reason?: string } {
  if (status === "removed") return { analyzable: false, reason: "file removed" };
  if (BLOCKED_PATHS.test(filename)) return { analyzable: false, reason: "dependency or build artifact" };
  const basename = filename.split("/").pop() ?? filename;
  if (BLOCKED_FILES.has(basename)) return { analyzable: false, reason: "lockfile" };
  if (BLOCKED_EXTENSIONS.test(filename)) return { analyzable: false, reason: "not a code file" };
  if (CODE_EXTENSIONS.test(filename) || ENV_FILES.test(basename)) return { analyzable: true };
  return { analyzable: false, reason: "unsupported file type" };
}

function isAnalyzable(filename: string, status: string) {
  return getAnalysisStatus(filename, status).analyzable;
}

export default function ViewCode() {
  const navigate = useNavigate();
  const { prPreview } = usePrPreviewStore();

  useEffect(() => {
    const title = prPreview
      ? `${prPreview.owner}/${prPreview.repo} #${prPreview.prNumber} — CodeSheriff`
      : "Review Changes — CodeSheriff";
    document.title = title;
  }, [prPreview]);
  const [allOpen, setAllOpen] = useState<boolean | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  function openDrawer() {
    setDrawerOpen(true);
    requestAnimationFrame(() => setDrawerVisible(true));
  }

  function closeDrawer() {
    setDrawerVisible(false);
    setTimeout(() => setDrawerOpen(false), 300);
  }

  function toggleGroup(reason: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(reason) ? next.delete(reason) : next.add(reason);
      return next;
    });
  }

  function handleRunAnalysis() {
    if (!prPreview) return;
    const link = `${prPreview.owner}/${prPreview.repo}/pull/${prPreview.prNumber}`;
    navigate(`/app/results/${link}`, {
      state: {
        files: prPreview.files,
        agents: ["unified"],
      },
    });
  }

  if (!prPreview) {
    return (
      <main className="min-h-full bg-bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <LuGitPullRequest size={32} className="text-text-tertiary" />
          <p className="text-sm text-text-secondary font-medium">No PR selected</p>
          <p className="text-xs text-text-tertiary">
            Go back and paste a valid PR URL first.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 mt-1 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
          >
            <LuArrowLeft size={14} />
            Back to Analyze
          </button>
        </div>
      </main>
    );
  }

  const totalAdditions = prPreview.files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = prPreview.files.reduce((sum, f) => sum + f.deletions, 0);
  const excludedFiles = prPreview.files.filter((f) => !isAnalyzable(f.filename, f.status));
  const analyzableCount = prPreview.files.length - excludedFiles.length;

  return (
    <main className="min-h-full bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer shrink-0"
          >
            <LuArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <Stepper current={1} />

          <button
            type="button"
            disabled={analyzableCount === 0}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleRunAnalysis}
            title={analyzableCount === 0 ? "No analyzable files in this PR" : undefined}
          >
            <LuPlay size={13} />
            <span className="hidden sm:inline">Run AI Analysis</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5 bg-bg-primary rounded-xl border border-border-subtle shadow-sm">
          <div className="flex items-center gap-2">
            <LuGitPullRequest size={16} className="text-text-tertiary shrink-0" />
            <h1 className="text-base font-semibold text-text-primary tracking-tight truncate">
              {prPreview.owner}/{prPreview.repo}
              <span className="text-text-tertiary font-normal"> #{prPreview.prNumber}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-tertiary">
            <span>{prPreview.files.length} file{prPreview.files.length !== 1 ? "s" : ""} changed</span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500/60" />
              {totalAdditions} additions
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-red-500/60" />
              {totalDeletions} deletions
            </span>
          </div>
        </div>

        {excludedFiles.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
            <div className="flex items-center gap-2.5 min-w-0">
              <LuTriangleAlert size={14} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-600 leading-relaxed">
                <span className="font-medium">{excludedFiles.length} file{excludedFiles.length !== 1 ? "s" : ""} excluded from analysis</span>
                {analyzableCount === 0 ? " — no analyzable code files in this PR." : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={openDrawer}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium shrink-0 cursor-pointer transition-colors"
            >
              View details
            </button>
          </div>
        )}

        {/* Drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="absolute inset-0 bg-black/30 transition-opacity duration-300"
              style={{ opacity: drawerVisible ? 1 : 0 }}
              onClick={closeDrawer}
            />
            <div
              className="relative w-full max-w-md bg-bg-primary shadow-xl flex flex-col h-full transition-transform duration-300 ease-in-out"
              style={{ transform: drawerVisible ? "translateX(0)" : "translateX(100%)" }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Excluded files</h2>
                  <p className="text-xs text-text-tertiary mt-0.5">{excludedFiles.length} file{excludedFiles.length !== 1 ? "s" : ""} will not be sent to the AI</p>
                </div>
                <button type="button" onClick={closeDrawer} className="text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer">
                  <LuX size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col">

                {/* Agrupado por motivo */}
                <div className="p-4 flex flex-col gap-2">
                  <span className="text-xs font-medium text-text-secondary">Files excluded in this PR</span>
                  {(() => {
                    const groups = new Map<string, typeof excludedFiles>();
                    excludedFiles.forEach((file) => {
                      const { reason = "unsupported file type" } = getAnalysisStatus(file.filename, file.status);
                      if (!groups.has(reason)) groups.set(reason, []);
                      groups.get(reason)!.push(file);
                    });
                    return Array.from(groups.entries()).map(([reason, files]) => {
                      const info = REASON_DESCRIPTIONS[reason];
                      const isExpanded = expandedGroups.has(reason);
                      return (
                        <div key={reason} className="rounded-lg border border-border-subtle overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleGroup(reason)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-bg-secondary hover:bg-bg-tertiary transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <LuBan size={12} className="text-amber-500 shrink-0" />
                              <span className="text-xs font-medium text-text-primary truncate">{info?.label ?? reason}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-text-tertiary">{files.length} file{files.length !== 1 ? "s" : ""}</span>
                              <LuChevronDown size={12} className={`text-text-tertiary transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="flex flex-col border-t border-border-subtle">
                              {info?.description && (
                                <p className="px-3 py-2.5 text-[11px] text-text-tertiary leading-relaxed bg-bg-primary border-b border-border-subtle">
                                  {info.description}
                                </p>
                              )}
                              <div className="flex flex-col divide-y divide-border-subtle">
                                {files.map((file) => (
                                  <div key={file.sha} className="px-3 py-2 bg-bg-primary">
                                    <span className="text-[11px] font-mono text-text-tertiary truncate block">{file.filename}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="border-t border-border-subtle px-4 py-3">
                  <p className="text-[11px] text-text-tertiary leading-relaxed">
                    Only real source code files are sent to the AI. Auto-generated, asset, and non-code files are filtered out automatically.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between -mb-1">
          <p className="text-xs text-text-tertiary">
            {prPreview.files.length} file{prPreview.files.length !== 1 ? "s" : ""} changed — click on a file to view its diff.
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAllOpen(true)}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer px-2 py-1"
            >
              Expand all
            </button>
            <span className="text-text-tertiary text-xs">·</span>
            <button
              type="button"
              onClick={() => setAllOpen(false)}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer px-2 py-1"
            >
              Collapse all
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {prPreview.files.map((file) => {
            const { analyzable, reason } = getAnalysisStatus(file.filename, file.status);
            return (
              <FileDiff
                key={file.sha}
                file={file}
                defaultOpen={false}
                forceOpen={allOpen}
                analyzable={analyzable}
                excludeReason={reason}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
