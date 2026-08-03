import { Check } from "lucide-react";

const WizardStepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((item, index) => {
        const isCompleted = item.position < currentStep;
        const isActive = item.position === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={item.position} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check size={13} strokeWidth={3} /> : item.position}
              </div>

              <span
                className={`mt-1 hidden whitespace-nowrap text-[10px] font-medium sm:block ${
                  isActive ? "text-blue-600" : isCompleted ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={`mx-1 h-0.5 w-4 shrink-0 transition-all duration-300 sm:w-8 ${
                  isCompleted ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WizardStepper;