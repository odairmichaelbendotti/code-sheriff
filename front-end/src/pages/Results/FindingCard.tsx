import { useState } from "react";
import {
  LuChevronDown,
  LuFileCode,
  LuShieldAlert,
  LuZap,
  LuSparkles,
} from "react-icons/lu";

export type Severity = "critical" | "warning" | "suggestion";
export type AgentType = "security" | "performance" | "quality";

export interface Finding {
  id: string;
  agent: AgentType;
  severity: Severity;
  file: string;
  line: number;
  message: string;
  suggestion: string;
}

interface FindingCardProps {
  finding: Finding;
}

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  critical: {
    label: "Critical",
    dot: "bg-red-500",
    text: "text-red-500",
    bg: "bg-red-500/6",
    border: "border-red-500/20",
  },
  warning: {
    label: "Warning",
    dot: "bg-amber-500",
    text: "text-amber-500",
    bg: "bg-amber-500/6",
    border: "border-amber-500/20",
  },
  suggestion: {
    label: "Suggestion",
    dot: "bg-text-tertiary",
    text: "text-text-tertiary",
    bg: "bg-bg-tertiary",
    border: "border-border-subtle",
  },
};

const AGENT_CONFIG: Record<
  AgentType,
  {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  security: { label: "Security", icon: LuShieldAlert },
  performance: { label: "Performance", icon: LuZap },
  quality: { label: "Quality", icon: LuSparkles },
};

export default function FindingCard({ finding }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[finding.severity];
  const agent = AGENT_CONFIG[finding.agent];
  const AgentIcon = agent.icon;

  return (
    <div
      className={`rounded-xl border ${sev.border} bg-bg-primary overflow-hidden`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer hover:bg-bg-secondary/50 transition-colors duration-150"
      >
        <div
          className={`mt-0.5 w-1.5 h-1.5 rounded-full ${sev.dot} shrink-0 mt-2`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold ${sev.text}`}>
              {sev.label}
            </span>
            <span className="text-xs text-text-tertiary">·</span>
            <span className="flex items-center gap-1 text-xs text-text-tertiary">
              <AgentIcon size={11} />
              {agent.label}
            </span>
          </div>
          <p className="text-sm text-text-primary mt-1 leading-snug">
            {finding.message}
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            <LuFileCode size={11} className="text-text-tertiary shrink-0" />
            <span className="text-xs text-text-tertiary font-mono truncate">
              {finding.file}:{finding.line}
            </span>
          </div>
        </div>

        <LuChevronDown
          size={14}
          className={[
            "text-text-tertiary shrink-0 mt-1 transition-transform duration-200",
            expanded ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {expanded && (
        <div className={`px-4 pb-4 pt-0 border-t ${sev.border}`}>
          <div className={`mt-3 rounded-lg ${sev.bg} px-3.5 py-3`}>
            <p className="text-xs font-medium text-text-secondary mb-1">
              Suggestion
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              {finding.suggestion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
