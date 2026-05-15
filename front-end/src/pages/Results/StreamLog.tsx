import { useEffect, useRef } from "react";
import { LuShieldAlert, LuZap, LuSparkles, LuLoader } from "react-icons/lu";
import type { AgentType } from "./FindingCard";

export interface LogEntry {
  agent: AgentType;
  message: string;
  done: boolean;
}

interface StreamLogProps {
  entries: LogEntry[];
  isStreaming: boolean;
}

const AGENT_CONFIG: Record<AgentType, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  security: { label: "Security", icon: LuShieldAlert, color: "text-red-500" },
  performance: { label: "Performance", icon: LuZap, color: "text-blue-500" },
  quality: { label: "Quality", icon: LuSparkles, color: "text-emerald-500" },
};

export default function StreamLog({ entries, isStreaming }: StreamLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  if (entries.length === 0 && !isStreaming) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-primary overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <span className="text-xs font-medium text-text-secondary">Agent reasoning</span>
        {isStreaming && (
          <span className="flex items-center gap-1.5 text-xs text-accent">
            <LuLoader size={11} className="animate-spin" />
            Analyzing…
          </span>
        )}
      </div>

      <div className="max-h-52 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
        {entries.map((entry, i) => {
          const agent = AGENT_CONFIG[entry.agent];
          const AgentIcon = agent.icon;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`mt-0.5 shrink-0 ${agent.color}`}>
                <AgentIcon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-medium ${agent.color}`}>{agent.label}</span>
                <p className="text-xs text-text-secondary leading-relaxed mt-0.5">{entry.message}</p>
              </div>
              {entry.done && (
                <span className="shrink-0 text-xs text-text-tertiary mt-0.5">✓</span>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
