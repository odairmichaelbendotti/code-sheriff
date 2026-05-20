import { useEffect, useState } from "react";
import { LuArrowRight, LuGitPullRequest, LuFileCode, LuBan, LuShieldCheck } from "react-icons/lu";
import { useNavigate } from "react-router";
import PrInput from "./PrInput";
import AnalysisHistory from "./AnalysisHistory";
import Stepper from "@/components/Stepper";
import { usePullsStore, type Pull } from "@/store/pulls.store";
import { usePrPreviewStore, type ChangedFiles } from "@/store/prPreview.store";
import { defaultFetch } from "@/utils/defaultFetch";

const PR_URL_REGEX = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/;

const CODE_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|swift|c|cpp|h|cs|php|rb|vue|svelte|sql|sh|yaml|yml|json|toml)$/i;
const ENV_FILES = /^\.env(\..+)?$/i;
const BLOCKED_FILES = new Set(["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Cargo.lock", "composer.lock", "Gemfile.lock"]);
const BLOCKED_EXTENSIONS = /\.(md|mdx|txt|png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|woff|woff2|ttf|eot)$/i;
const BLOCKED_PATHS = /(\b|\/)(node_modules|\.git|dist|build|\.next|\.nuxt|coverage|\.cache)(\/|$)/i;

function isAnalyzable(filename: string, status: string) {
  if (status === "removed") return false;
  if (BLOCKED_PATHS.test(filename)) return false;
  const basename = filename.split("/").pop() ?? filename;
  if (BLOCKED_FILES.has(basename)) return false;
  if (BLOCKED_EXTENSIONS.test(filename)) return false;
  return CODE_EXTENSIONS.test(filename) || ENV_FILES.test(basename);
}

function PrPreviewCard({ preview, onContinue }: { preview: ChangedFiles; onContinue: () => void }) {
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(1200);
  const analyzable = preview.files.filter((f) => isAnalyzable(f.filename, f.status));
  const excluded = preview.files.length - analyzable.length;
  const totalAdditions = preview.files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = preview.files.reduce((sum, f) => sum + f.deletions, 0);

  function handleContinue() {
    const delay = 1000 + Math.random() * 500;
    setDuration(delay);
    setLoading(true);
    setTimeout(onContinue, delay);
  }

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-border-subtle bg-bg-secondary">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center shrink-0">
          <LuGitPullRequest size={14} className="text-text-secondary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-text-tertiary">Pull Request</p>
          <h2 className="text-sm font-semibold text-text-primary truncate">
            {preview.owner}/{preview.repo}
            <span className="font-normal text-text-tertiary ml-1">#{preview.prNumber}</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-bg-primary border border-border-subtle">
          <span className="text-xs text-text-tertiary">Files changed</span>
          <span className="text-base font-semibold text-text-primary">{preview.files.length}</span>
        </div>
        <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-bg-primary border border-border-subtle">
          <span className="text-xs text-text-tertiary flex items-center gap-1"><LuShieldCheck size={10} className="text-emerald-500" />To analyze</span>
          <span className="text-base font-semibold text-emerald-600">{analyzable.length}</span>
        </div>
        <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-bg-primary border border-border-subtle">
          <span className="text-xs text-text-tertiary flex items-center gap-1"><LuBan size={10} className="text-amber-500" />Excluded</span>
          <span className="text-base font-semibold text-amber-600">{excluded}</span>
        </div>
        <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-bg-primary border border-border-subtle">
          <span className="text-xs text-text-tertiary flex items-center gap-1"><LuFileCode size={10} />Changes</span>
          <span className="text-sm font-semibold">
            <span className="text-emerald-600">+{totalAdditions}</span>
            <span className="text-text-tertiary mx-1">/</span>
            <span className="text-red-500">-{totalDeletions}</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={loading}
        className="relative flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-accent text-white text-sm font-medium overflow-hidden transition-colors disabled:cursor-default cursor-pointer"
      >
        {loading && (
          <span
            className="absolute left-0 top-0 h-full bg-accent-hover"
            style={{
              width: "100%",
              transformOrigin: "left",
              animation: `progress-fill ${duration}ms ease-in-out forwards`,
            }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {loading ? "Preparing review..." : "Continue to Review"}
          {!loading && <LuArrowRight size={14} />}
        </span>
      </button>
    </div>
  );
}

export default function Analyze() {
  const navigate = useNavigate();
  const { setPulls, setIsFetching } = usePullsStore();
  const {
    url,
    setUrl,
    prPreview,
    setPrPreview,
    setIsPrPreviewLoading,
    isPrPreviewLoading,
  } = usePrPreviewStore();

  const isValidUrl = PR_URL_REGEX.test(url?.trim() ?? "");

  useEffect(() => {
    document.title = "Analyze — CodeSheriff";
  }, []);

  function fetchPulls() {
    setIsFetching(true);
    defaultFetch({
      endpoint: "/api/pulls",
      method: "GET",
      credentials: "include",
    })
      .then((response) => setPulls(response as Pull[]))
      .catch((error) => console.log(error))
      .finally(() => setIsFetching(false));
  }

  useEffect(() => {
    fetchPulls();
  }, []);

  async function fetchPreview(currentUrl: string) {
    setIsPrPreviewLoading(true);
    try {
      const response = await defaultFetch({
        endpoint: "/api/analyze/preview",
        method: "POST",
        credentials: "include",
        body: { url: currentUrl },
      });
      setPrPreview(response as ChangedFiles);
    } catch (err) {
      console.log(err);
    } finally {
      setIsPrPreviewLoading(false);
    }
  }

  function handleChangePr(newUrl: string) {
    setUrl(newUrl);
    setPrPreview(null);
    if (PR_URL_REGEX.test(newUrl.trim())) {
      fetchPreview(newUrl.trim());
    }
  }

  function handleContinue() {
    navigate("/app/view");
  }

  return (
    <main className="h-full bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-4 flex flex-col gap-4">
        <div className="flex flex-col gap-6 p-5 bg-bg-primary rounded-xl border border-border-subtle shadow-sm">
          <div className="flex justify-center">
            <Stepper current={0} size="sm" />
          </div>

          <hr className="border-border-subtle" />

          <PrInput url={url} handleChangePr={handleChangePr} onRefresh={fetchPulls} />

          {isPrPreviewLoading && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border-subtle bg-bg-secondary">
              <div className="relative size-8 shrink-0">
                <span className="absolute inset-0 rounded-full border-2 border-border-subtle" />
                <span className="absolute inset-0 rounded-full border-2 border-t-accent border-l-transparent border-r-transparent border-b-transparent animate-spin" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text-primary">Fetching PR details</span>
                <span className="text-xs text-text-tertiary">Retrieving changed files from GitHub...</span>
              </div>
            </div>
          )}

          {!isPrPreviewLoading && prPreview && (
            <PrPreviewCard preview={prPreview} onContinue={handleContinue} />
          )}

          {!isPrPreviewLoading && !prPreview && (
            <button
              type="button"
              onClick={() => isValidUrl && fetchPreview(url!.trim())}
              disabled={!isValidUrl}
              className="flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Analyze
              <LuArrowRight size={14} />
            </button>
          )}
        </div>

        <AnalysisHistory />
      </div>
    </main>
  );
}
