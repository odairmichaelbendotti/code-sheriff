import { usePullsStore } from "@/store/pulls.store";
import { useState } from "react";
import { LuGitPullRequest, LuChevronDown, LuX } from "react-icons/lu";

interface PendingPR {
  id: string;
  repo: string;
  number: number;
  title: string;
  url: string;
  updatedAt: string;
}

// TODO: replace with real data from GitHub API
const MOCK_PENDING_PRS: PendingPR[] = [
  {
    id: "1",
    repo: "vercel/next.js",
    number: 71234,
    title: "feat: add app router middleware support for edge functions",
    url: "https://github.com/vercel/next.js/pull/71234",
    updatedAt: "2026-05-14",
  },
  {
    id: "2",
    repo: "user/my-project",
    number: 15,
    title: "fix: resolve auth token expiration on refresh",
    url: "https://github.com/user/my-project/pull/15",
    updatedAt: "2026-05-13",
  },
  {
    id: "3",
    repo: "company/api-service",
    number: 88,
    title: "refactor: migrate user service to new repository pattern",
    url: "https://github.com/company/api-service/pull/88",
    updatedAt: "2026-05-12",
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface PrInputProps {
  url: string;
  onChange: (url: string) => void;
}

export default function PrInput({ url, onChange }: PrInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function selectPR(pr: PendingPR) {
    onChange(pr.url);
    setDropdownOpen(false);
  }

  const { isFetching } = usePullsStore();

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
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://github.com/owner/repo/pull/42"
        className="w-full h-10 px-3.5 rounded-lg border border-border-default bg-bg-secondary text-text-primary text-sm placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
      />

      <p className="text-xs text-text-tertiary">
        Requires access to the repository. Private repos use your GitHub token.
      </p>

      {/* Dropdown — absolute, cobre o input */}
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
          <ul className="flex flex-col divide-y divide-border-subtle">
            {MOCK_PENDING_PRS.map((pr) => (
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
                        {pr.repo}
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
                    {formatDate(pr.updatedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
