"use client";

import { Check } from "lucide-react";

import { getStepPosition, getWizardSteps } from "../config/wizardSteps.config";

const WizardStepper = ({ currentStep, formType, onStepClick }) => {
  const steps = getWizardSteps(formType);
  const currentPosition = getStepPosition(currentStep, formType);
  const progressPercent = Math.round((currentPosition / steps.length) * 100);

  return (
    <>
    <div className="sm:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-slate-500">
          {progressPercent}%
        </span>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {steps.map((item) => {
          const itemPosition = getStepPosition(item.step, formType);
          const isCompleted = itemPosition < currentPosition;
          const isActive = item.step === currentStep;

          return (
            <button
              key={item.step}
              type="button"
              disabled={!isCompleted}
              onClick={() => {
                if (isCompleted) onStepClick?.(item.step);
              }}
              aria-label={item.label}
              className={`h-2 rounded-full transition-all duration-300 ${
                isActive
                  ? "w-6 bg-blue-600"
                  : isCompleted
                  ? "w-2 bg-emerald-500"
                  : "w-2 bg-slate-200"
              }`}
            />
          );
        })}
      </div>
    </div>

    <div className="hidden items-center gap-1 overflow-x-auto pb-1 sm:flex">
      {steps.map((item, index) => {
        const itemPosition = getStepPosition(item.step, formType);
        const isCompleted = itemPosition < currentPosition;
        const isActive = item.step === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={item.step} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={!isCompleted}
                onClick={() => {
                  if (isCompleted) onStepClick?.(item.step);
                }}
                title={isCompleted ? `Go back to ${item.label}` : "Complete previous steps first"}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : isActive
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check size={13} strokeWidth={3} /> : itemPosition}
              </button>

              <span
                className={`mt-1 hidden whitespace-nowrap text-[10px] font-medium sm:block ${
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                    ? "text-slate-600"
                    : "text-slate-400"
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
    </>
  );
};

export default WizardStepper;
