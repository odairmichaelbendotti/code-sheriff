import { usePrPreviewStore } from "@/store/prPreview.store";
import { useState, useEffect } from "react";
import { LuArrowLeft, LuGitPullRequest, LuPlay, LuTriangleAlert } from "react-icons/lu";
import { useNavigate } from "react-router";
import FileDiff from "./FileDiff";
import Stepper from "@/components/Stepper";

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
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer shrink-0"
            onClick={handleRunAnalysis}
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
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20">
            <LuTriangleAlert size={14} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-500 leading-relaxed">
              <span className="font-medium">{excludedFiles.length} file{excludedFiles.length !== 1 ? "s" : ""} will be excluded from analysis</span>
              {" "}—{" "}
              {analyzableCount === 0
                ? "this PR contains no analyzable code files."
                : `only ${analyzableCount} of ${prPreview.files.length} files will be sent to the AI. Excluded: dependencies, build artifacts, removed files, images, and documentation.`}
            </p>
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
