import { useEffect, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { useNavigate } from "react-router";
import PrInput from "./PrInput";
import AgentSelector from "./AgentSelector";
import AnalysisHistory from "./AnalysisHistory";
import Stepper from "@/components/Stepper";
import { usePullsStore, type Pull } from "@/store/pulls.store";
import { usePrPreviewStore, type ChangedFiles } from "@/store/prPreview.store";
import { defaultFetch } from "@/utils/defaultFetch";

const PR_URL_REGEX = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/;

export type Agent = "security" | "performance" | "quality";

export default function Analyze() {
  const navigate = useNavigate();
  const { setPulls, setIsFetching } = usePullsStore();
  const { url, setUrl, setPrPreview, setIsPrPreviewLoading, isPrPreviewLoading } =
    usePrPreviewStore();

  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([
    "security",
    "performance",
    "quality",
  ]);

  const isValidUrl = PR_URL_REGEX.test(url.trim());

  useEffect(() => {
    setIsFetching(true);
    defaultFetch({
      endpoint: "/api/pulls",
      method: "GET",
      credentials: "include",
    })
      .then((response) => setPulls(response as Pull[]))
      .catch((error) => console.log(error))
      .finally(() => setIsFetching(false));
  }, []);

  function handleChangePr(newUrl: string) {
    setUrl(newUrl);
    setPrPreview(null);
  }

  async function handleAnalyze() {
    if (!isValidUrl) return;

    setIsPrPreviewLoading(true);
    try {
      const response = await defaultFetch({
        endpoint: "/api/analyze/preview",
        method: "POST",
        credentials: "include",
        body: { url },
      });
      setPrPreview(response as ChangedFiles);
      navigate("/app/view");
    } catch (err) {
      console.log(err);
    } finally {
      setIsPrPreviewLoading(false);
    }
  }

  return (
    <main className="h-full bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-6 p-5 bg-bg-primary rounded-xl border border-border-subtle shadow-sm">
          <div className="flex justify-center">
            <Stepper current={0} size="sm" />
          </div>

          <hr className="border-border-subtle" />

          <PrInput
            url={url}
            handleChangePr={handleChangePr}
          />

          <hr className="border-border-subtle" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">
                Active agents
              </span>
              <span className="text-xs text-text-tertiary">
                {selectedAgents.length} of 3 selected
              </span>
            </div>
            <AgentSelector
              selected={selectedAgents}
              onChange={setSelectedAgents}
            />
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!isValidUrl || isPrPreviewLoading}
            className="flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPrPreviewLoading ? (
              <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                Analyze
                <LuArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        <AnalysisHistory />
      </div>
    </main>
  );
}
