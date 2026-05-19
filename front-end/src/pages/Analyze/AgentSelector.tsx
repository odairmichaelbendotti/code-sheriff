import { GoShieldCheck } from "react-icons/go";
import { LuZap, LuSparkles, LuCheck } from "react-icons/lu";
import type { Agent } from "./index";

interface AgentSelectorProps {
  selected: Agent;
  onChange: (agent: Agent) => void;
}

const AGENTS: {
  id: Agent;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconColor: string;
  iconBg: string;
  activeBorder: string;
  checkBg: string;
}[] = [
  {
    id: "security",
    label: "Security",
    description: "OWASP, injections, leaked secrets",
    icon: GoShieldCheck,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    activeBorder: "border-red-500/30",
    checkBg: "bg-red-500",
  },
  {
    id: "performance",
    label: "Performance",
    description: "N+1 queries, memory, loops",
    icon: LuZap,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    activeBorder: "border-blue-500/30",
    checkBg: "bg-blue-500",
  },
  {
    id: "quality",
    label: "Quality",
    description: "DRY, naming, best practices",
    icon: LuSparkles,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    activeBorder: "border-emerald-500/30",
    checkBg: "bg-emerald-500",
  },
];

export default function AgentSelector({ selected, onChange }: AgentSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {AGENTS.map(({ id, label, description, icon: Icon, iconColor, iconBg, activeBorder, checkBg }) => {
        const isActive = selected === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={[
              "relative flex flex-col gap-2.5 p-4 rounded-lg border text-left cursor-pointer select-none",
              "transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              isActive
                ? `bg-bg-secondary ${activeBorder}`
                : "bg-bg-secondary border-border-subtle opacity-40 hover:opacity-60",
            ].join(" ")}
          >
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${iconBg}`}>
              <Icon className={`text-sm ${iconColor}`} />
            </div>

            <div>
              <span className="text-sm font-medium text-text-primary">{label}</span>
              <p className="text-xs text-text-tertiary mt-0.5 leading-snug">{description}</p>
            </div>

            <div className={[
              "absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-150",
              isActive ? `${checkBg}` : "border border-border-default bg-transparent",
            ].join(" ")}>
              {isActive && <LuCheck size={10} className="text-white" strokeWidth={3} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
