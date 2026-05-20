import { useState, useEffect } from "react";
import { LuGitPullRequest, LuClock, LuChevronRight } from "react-icons/lu";
import { defaultFetch } from "@/utils/defaultFetch";

interface Analysis {
  id: string;
  owner: string;
  repo: string;
  prNumber: number;
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function totalFindings(a: Analysis) {
  return a.criticalCount + a.warningCount + a.suggestionCount;
}

const INITIAL_VISIBLE = 3;
const LOAD_MORE_COUNT = 5;

export default function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    defaultFetch<Analysis[]>({
      endpoint: "/api/analyze/history",
      method: "GET",
      credentials: "include",
    })
      .then(setAnalyses)
      .catch(() => {});
  }, []);

  const visible = analyses.slice(0, visibleCount);
  const hasMore = visibleCount < analyses.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">
          Recent analyses
        </span>
        {analyses.length > 0 && (
          <span className="text-xs text-text-tertiary">
            {analyses.length} runs
          </span>
        )}
      </div>

      {analyses.length === 0 ? (
        <div className="py-12 text-center text-sm text-text-tertiary border border-dashed border-border-subtle rounded-xl">
          No analyses yet — run your first one above.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visible.map((a) => (
            <li key={a.id}>
              <button className="group w-full flex items-center gap-3 p-3 rounded-lg bg-bg-primary border border-border-subtle hover:border-border-default hover:shadow-sm transition-all text-left cursor-pointer">
                <div className="w-7 h-7 rounded-md bg-bg-tertiary flex items-center justify-center shrink-0">
                  <LuGitPullRequest className="text-text-secondary" size={13} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {a.owner}/{a.repo}
                    </span>
                    <span className="text-xs text-text-tertiary shrink-0">
                      #{a.prNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {a.criticalCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        {a.criticalCount} critical
                      </span>
                    )}
                    {a.warningCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        {a.warningCount}{" "}
                        {a.warningCount === 1 ? "warning" : "warnings"}
                      </span>
                    )}
                    {a.suggestionCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-text-tertiary">
                        <span className="w-1.5 h-1.5 rounded-full bg-border-default shrink-0" />
                        {a.suggestionCount} suggestions
                      </span>
                    )}
                    {totalFindings(a) === 0 && (
                      <span className="text-xs text-emerald-500 font-medium">
                        No issues found
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:flex items-center gap-1 text-xs text-text-tertiary">
                    <LuClock size={11} />
                    {formatDate(a.createdAt)}
                  </span>
                  <LuChevronRight
                    size={14}
                    className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors text-center cursor-pointer"
        >
          View more ({analyses.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
