import { LuGitPullRequest, LuClock, LuChevronRight } from "react-icons/lu";

interface Analysis {
  id: string;
  repo: string;
  pr: number;
  findings: { critical: number; warning: number; suggestion: number };
  date: string;
}

// TODO: replace with real data from backend
const MOCK_ANALYSES: Analysis[] = [
  {
    id: "1",
    repo: "vercel/next.js",
    pr: 71234,
    findings: { critical: 1, warning: 4, suggestion: 7 },
    date: "2026-05-14",
  },
  {
    id: "2",
    repo: "facebook/react",
    pr: 30891,
    findings: { critical: 0, warning: 2, suggestion: 5 },
    date: "2026-05-12",
  },
  {
    id: "3",
    repo: "user/my-project",
    pr: 15,
    findings: { critical: 3, warning: 1, suggestion: 2 },
    date: "2026-05-10",
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function totalFindings(f: Analysis["findings"]) {
  return f.critical + f.warning + f.suggestion;
}

export default function AnalysisHistory() {
  const analyses = MOCK_ANALYSES;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">Recent analyses</span>
        {analyses.length > 0 && (
          <span className="text-xs text-text-tertiary">{analyses.length} runs</span>
        )}
      </div>

      {analyses.length === 0 ? (
        <div className="py-12 text-center text-sm text-text-tertiary border border-dashed border-border-subtle rounded-xl">
          No analyses yet — run your first one above.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {analyses.map((a) => (
            <li key={a.id}>
              <button className="group w-full flex items-center gap-3 p-3.5 rounded-xl bg-bg-primary border border-border-subtle hover:border-border-default hover:shadow-sm transition-all text-left cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center shrink-0">
                  <LuGitPullRequest className="text-text-secondary" size={14} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-primary truncate">{a.repo}</span>
                    <span className="text-xs text-text-tertiary shrink-0">#{a.pr}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                    {a.findings.critical > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        {a.findings.critical} critical
                      </span>
                    )}
                    {a.findings.warning > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        {a.findings.warning} {a.findings.warning === 1 ? "warning" : "warnings"}
                      </span>
                    )}
                    {a.findings.suggestion > 0 && (
                      <span className="flex items-center gap-1 text-xs text-text-tertiary">
                        <span className="w-1.5 h-1.5 rounded-full bg-border-default shrink-0" />
                        {a.findings.suggestion} suggestions
                      </span>
                    )}
                    {totalFindings(a.findings) === 0 && (
                      <span className="text-xs text-emerald-500 font-medium">No issues found</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:flex items-center gap-1 text-xs text-text-tertiary">
                    <LuClock size={11} />
                    {formatDate(a.date)}
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
    </div>
  );
}
