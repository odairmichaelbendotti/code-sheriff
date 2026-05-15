import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import PrInput from "./PrInput";
import AgentSelector from "./AgentSelector";
import AnalysisHistory from "./AnalysisHistory";

export type Agent = "security" | "performance" | "quality";

export default function Analyze() {
  const [url, setUrl] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([
    "security",
    "performance",
    "quality",
  ]);

  function handleAnalyze() {
    // TODO: trigger analysis
  }

  return (
    <main className="h-full bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Analyze a Pull Request
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Paste a GitHub PR URL below. Three specialized agents will review it
            in parallel and post inline comments directly on the PR.
          </p>
        </div>

        <div className="flex flex-col gap-6 p-5 bg-bg-primary rounded-xl border border-border-subtle shadow-sm">
          <PrInput url={url} onChange={setUrl} />

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
            disabled={!url.trim()}
            className="flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Analyze
            <LuArrowRight size={14} />
          </button>
        </div>

        <AnalysisHistory />
      </div>
    </main>
  );
}
