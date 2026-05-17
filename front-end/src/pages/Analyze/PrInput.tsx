import { usePullsStore, type Pull } from "@/store/pulls.store";
import { useState } from "react";
import { LuGitPullRequest, LuChevronDown, LuX } from "react-icons/lu";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function repoFromUrl(repositoryUrl: string) {
  return repositoryUrl.replace("https://api.github.com/repos/", "");
}

interface PrInputProps {
  url: string | null;
  handleChangePr: (url: string) => void;
}

export default function PrInput({ url, handleChangePr }: PrInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { pulls, isFetching } = usePullsStore();

  function selectPR(pr: Pull) {
    handleChangePr(pr.html_url);
    setDropdownOpen(false);
  }

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">
          Pull Request URL
        </label>

        {isFetching ? (
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <span className="size-3 rounded-full border-2 border-text-tertiary border-t-transparent animate-spin" />
            Loading PRs...
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          >
            <LuGitPullRequest size={13} />
            My open PRs
            {pulls && pulls.length > 0 && (
              <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-accent text-white text-[10px] font-medium leading-none">
                {pulls.length}
              </span>
            )}
            <LuChevronDown
              size={12}
              className={[
                "transition-transform duration-200",
                dropdownOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>
        )}
      </div>

      <input
        type="text"
        value={url ?? ""}
        onChange={(e) => handleChangePr(e.target.value)}
        placeholder="https://github.com/owner/repo/pull/42"
        className="h-10 px-3.5 rounded-lg border border-border-default bg-bg-secondary text-text-primary text-sm placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
      />

      <p className="text-xs text-text-tertiary">
        Requires access to the repository. Private repos use your GitHub token.
      </p>

      {dropdownOpen && (
        <div className="absolute top-7 left-0 right-0 z-50 rounded-xl border border-border-default bg-bg-primary shadow-lg shadow-black/8 overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border-subtle">
            <span className="text-xs font-medium text-text-secondary">
              Open pull requests
            </span>
            <button
              type="button"
              onClick={() => setDropdownOpen(false)}
              className="text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
            >
              <LuX size={13} />
            </button>
          </div>

          {!pulls || pulls.length === 0 ? (
            <p className="px-3.5 py-4 text-xs text-text-tertiary text-center">
              No open pull requests found.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border-subtle">
              {pulls.map((pr) => (
                <li key={pr.id}>
                  <button
                    type="button"
                    onClick={() => selectPR(pr)}
                    className="w-full flex items-start gap-3 px-3.5 py-3 text-left hover:bg-bg-secondary transition-colors cursor-pointer group"
                  >
                    <LuGitPullRequest
                      size={14}
                      className="text-text-tertiary shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-text-tertiary truncate">
                          {repoFromUrl(pr.repository_url)}
                        </span>
                        <span className="text-xs text-text-tertiary shrink-0">
                          #{pr.number}
                        </span>
                      </div>
                      <p className="text-sm text-text-primary truncate mt-0.5 leading-snug group-hover:text-accent transition-colors">
                        {pr.title}
                      </p>
                    </div>
                    <span className="text-xs text-text-tertiary shrink-0 mt-0.5">
                      {formatDate(pr.updated_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
