interface SeverityStatsProps {
  critical: number;
  warning: number;
  suggestion: number;
}

export default function SeverityStats({ critical, warning, suggestion }: SeverityStatsProps) {
  const total = critical + warning + suggestion;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col gap-1 p-4 rounded-xl bg-bg-primary border border-red-500/20">
        <span className="text-2xl font-bold text-red-500 leading-none">{critical}</span>
        <span className="text-xs text-text-tertiary mt-1">Critical</span>
        {total > 0 && (
          <div className="mt-2 h-1 rounded-full bg-bg-tertiary overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-500"
              style={{ width: `${Math.round((critical / total) * 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-4 rounded-xl bg-bg-primary border border-amber-500/20">
        <span className="text-2xl font-bold text-amber-500 leading-none">{warning}</span>
        <span className="text-xs text-text-tertiary mt-1">Warnings</span>
        {total > 0 && (
          <div className="mt-2 h-1 rounded-full bg-bg-tertiary overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.round((warning / total) * 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-4 rounded-xl bg-bg-primary border border-border-subtle">
        <span className="text-2xl font-bold text-text-secondary leading-none">{suggestion}</span>
        <span className="text-xs text-text-tertiary mt-1">Suggestions</span>
        {total > 0 && (
          <div className="mt-2 h-1 rounded-full bg-bg-tertiary overflow-hidden">
            <div
              className="h-full rounded-full bg-text-tertiary transition-all duration-500"
              style={{ width: `${Math.round((suggestion / total) * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
