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

export interface CodeLine {
  line: number;
  code: string;
  highlight: boolean;
}

export interface CodeFixLine {
  type: "removed" | "added" | "context";
  code: string;
}

export interface Finding {
  id: string;
  agent: AgentType;
  severity: Severity;
  file: string;
  line: number;
  message: string;
  suggestion: string;
  code_snippet: CodeLine[];
  code_fix: CodeFixLine[];
}

interface FindingCardProps {
  finding: Finding;
  grouped?: boolean;
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

export default function FindingCard({ finding, grouped = false }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[finding.severity];
  const agent = AGENT_CONFIG[finding.agent];
  const AgentIcon = agent.icon;

  return (
    <div
      className={`bg-bg-primary overflow-hidden ${grouped ? "" : `rounded-xl border ${sev.border}`}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start text-left cursor-pointer hover:bg-bg-secondary/50 transition-colors duration-150"
      >
        {/* borda colorida à esquerda indicando severidade */}
        <div className={`w-1 self-stretch shrink-0 ${sev.dot}`} />
        <div className="flex items-start gap-3 p-4 flex-1 min-w-0">
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
                {grouped ? `line ${finding.line}` : `${finding.file}:${finding.line}`}
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
        </div>
      </button>

      {expanded && (
        <div className={`border-t ${sev.border}`}>
          {/* Code snippet */}
          {finding.code_snippet?.length > 0 && (
            <div className="overflow-x-auto bg-bg-secondary font-mono text-xs">
              <table className="w-full border-collapse">
                <tbody>
                  {finding.code_snippet.map((l) => (
                    <tr
                      key={l.line}
                      className={l.highlight ? `${sev.bg}` : ""}
                    >
                      <td className={`select-none px-3 py-0.5 text-right w-10 shrink-0 border-r ${sev.border} ${l.highlight ? sev.text : "text-text-tertiary"}`}>
                        {l.line}
                      </td>
                      <td className={`px-3 py-0.5 whitespace-pre ${l.highlight ? "text-text-primary" : "text-text-secondary"}`}>
                        {l.code}
                      </td>
                    </tr>
                  ))}
                  {/* Inline comment row */}
                  <tr className={`${sev.bg} border-t ${sev.border}`}>
                    <td className={`px-3 py-2 border-r ${sev.border}`} />
                    <td className="px-3 py-2">
                      <div className="flex items-start gap-2">
                        <div className={`w-1 shrink-0 self-stretch rounded-full ${sev.dot}`} />
                        <div>
                          <p className={`text-xs font-semibold ${sev.text} mb-0.5`}>
                            {sev.label}
                          </p>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {finding.message}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Suggestion text */}
          <div className="px-4 py-3 border-t border-border-subtle">
            <p className="text-xs font-medium text-text-secondary mb-1">
              Suggestion
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              {finding.suggestion}
            </p>
          </div>

          {/* Diff */}
          {finding.code_fix?.length > 0 && (
            <div className="border-t border-border-subtle overflow-x-auto bg-bg-secondary font-mono text-xs">
              <div className="px-3 py-1.5 border-b border-border-subtle">
                <span className="text-xs text-text-tertiary font-sans">Suggested fix</span>
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {finding.code_fix.map((l, i) => {
                    const isRemoved = l.type === "removed";
                    const isAdded = l.type === "added";
                    return (
                      <tr
                        key={i}
                        className={
                          isRemoved ? "bg-red-500/8" :
                          isAdded ? "bg-emerald-500/8" :
                          ""
                        }
                      >
                        <td className={[
                          "select-none px-3 py-0.5 w-6 text-center border-r border-border-subtle shrink-0",
                          isRemoved ? "text-red-500" :
                          isAdded ? "text-emerald-500" :
                          "text-text-tertiary",
                        ].join(" ")}>
                          {isRemoved ? "-" : isAdded ? "+" : " "}
                        </td>
                        <td className={[
                          "px-3 py-0.5 whitespace-pre",
                          isRemoved ? "text-red-400" :
                          isAdded ? "text-emerald-400" :
                          "text-text-tertiary",
                        ].join(" ")}>
                          {l.code}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
