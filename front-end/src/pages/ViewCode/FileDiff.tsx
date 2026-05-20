import type { ChangedFiles } from "@/store/prPreview.store";
import { useEffect, useState } from "react";
import { LuChevronDown, LuFileCode, LuBan, LuShieldCheck } from "react-icons/lu";

type File = ChangedFiles["files"][number];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    modified: "bg-yellow-500/10 text-yellow-600",
    added: "bg-emerald-500/10 text-emerald-600",
    removed: "bg-red-500/10 text-red-600",
    renamed: "bg-blue-500/10 text-blue-600",
  };
  return map[status] ?? "bg-bg-tertiary text-text-tertiary";
}

function renderPatch(patch: string) {
  return (
    <div className="min-w-full w-max">
      {patch.split("\n").map((line, i) => {
        const isAdded = line.startsWith("+") && !line.startsWith("+++");
        const isRemoved = line.startsWith("-") && !line.startsWith("---");
        const isHunk = line.startsWith("@@");

        return (
          <div
            key={i}
            className={[
              "px-4 py-px font-mono text-xs whitespace-pre leading-5",
              isAdded ? "bg-emerald-500/10 text-emerald-700" : "",
              isRemoved ? "bg-red-500/10 text-red-600" : "",
              isHunk ? "bg-bg-tertiary text-text-tertiary" : "",
              !isAdded && !isRemoved && !isHunk ? "text-text-secondary" : "",
            ].join(" ")}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
}

interface FileDiffProps {
  file: File;
  defaultOpen?: boolean;
  forceOpen?: boolean | null;
  analyzable?: boolean;
  excludeReason?: string;
}

export default function FileDiff({ file, defaultOpen = false, forceOpen = null, analyzable = true, excludeReason }: FileDiffProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (forceOpen !== null) {
      setOpen(forceOpen);
    }
  }, [forceOpen]);

  return (
    <div className={`rounded-xl border overflow-hidden ${analyzable ? "border-border-subtle bg-bg-primary" : "border-border-subtle bg-bg-primary opacity-50"}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-bg-secondary transition-colors cursor-pointer"
      >
        <LuFileCode size={14} className="text-text-tertiary shrink-0" />
        <span className={`text-sm font-mono truncate flex-1 ${analyzable ? "text-text-primary" : "text-text-tertiary"}`}>
          {file.filename}
        </span>
        <div className="flex items-center gap-2.5 shrink-0">
          {analyzable ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <LuShieldCheck size={10} />
              will be analyzed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <LuBan size={10} />
              excluded{excludeReason ? ` · ${excludeReason}` : ""}
            </span>
          )}
          <span className="text-xs text-emerald-600 font-medium">+{file.additions}</span>
          <span className="text-xs text-red-500 font-medium">-{file.deletions}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge(file.status)}`}>
            {file.status}
          </span>
          <LuChevronDown
            size={13}
            className={[
              "text-text-tertiary transition-transform duration-200",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border-subtle overflow-x-auto">
          {file.patch ? (
            renderPatch(file.patch)
          ) : (
            <p className="px-4 py-3 text-xs text-text-tertiary italic">
              Diff not available for this file.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
