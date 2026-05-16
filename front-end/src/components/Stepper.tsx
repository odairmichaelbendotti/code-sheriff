import { LuLink, LuSearch, LuSparkles } from "react-icons/lu";

const STEPS = [
  { icon: LuLink, label: "Select Pull Request", optional: false },
  { icon: LuSearch, label: "Review changes", optional: true },
  { icon: LuSparkles, label: "AI Analysis", optional: false },
];

interface StepperProps {
  current: number;
  size?: "sm" | "md";
}

export default function Stepper({ current, size = "md" }: StepperProps) {
  const isSm = size === "sm";

  return (
    <div className="flex items-center">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isDone = index < current;
        const isActive = index === current;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  "flex items-center justify-center rounded-full border-2 transition-colors",
                  isSm ? "size-5" : "size-7",
                  isDone ? "bg-accent border-accent text-white" : "",
                  isActive ? "bg-bg-primary border-accent text-accent" : "",
                  !isDone && !isActive ? "bg-bg-primary border-border-default text-text-tertiary" : "",
                ].join(" ")}
              >
                <Icon size={isSm ? 9 : 13} />
              </div>
              {!isSm && (
                <div className="hidden sm:flex flex-col items-center gap-0.5">
                  <span
                    className={[
                      "text-xs font-medium",
                      isActive ? "text-text-primary" : "text-text-tertiary",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                  {step.optional && (
                    <span className="text-[10px] text-text-tertiary leading-none">(optional)</span>
                  )}
                </div>
              )}
              {isSm && (
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={[
                      "text-[11px] font-medium",
                      isActive ? "text-text-secondary" : "text-text-tertiary",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                  {step.optional && (
                    <span className="text-[9px] text-text-tertiary leading-none">(optional)</span>
                  )}
                </div>
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={[
                  "h-px",
                  isSm ? "w-4 mx-1.5" : "w-8 md:w-16 mx-2 md:mx-3",
                  index < current ? "bg-accent" : "bg-border-default",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
