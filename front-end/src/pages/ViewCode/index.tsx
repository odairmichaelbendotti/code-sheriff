import { usePrPreviewStore } from "@/store/prPreview.store";
import { useState } from "react";
import { LuArrowLeft, LuGitPullRequest, LuPlay } from "react-icons/lu";
import { useNavigate } from "react-router";
import FileDiff from "./FileDiff";
import Stepper from "@/components/Stepper";

export default function ViewCode() {
  const navigate = useNavigate();
  const { prPreview } = usePrPreviewStore();
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
          {prPreview.files.map((file) => (
            <FileDiff
              key={file.sha}
              file={file}
              defaultOpen={false}
              forceOpen={allOpen}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
