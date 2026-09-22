"use client";

import { ArrowLeft, ArrowRight, FileText, Loader2 } from "lucide-react";

const WizardFooterNav = ({
  onPrevious,
  onSaveDraft,
  onNext,
  isFirstStep = false,
  isSaving = false,
  nextLabel = "Next",
  nextDisabled = false,
}) => {
  return (
    <>
    <div aria-hidden="true" className="h-72 shrink-0 sm:hidden" />
    <div data-wizard-footer className="absolute inset-x-0 bottom-0 z-30 mt-auto border-t border-slate-100 bg-white/95 px-4 py-2 shadow-[0_-10px_24px_rgba(15,23,42,0.06)] backdrop-blur sm:sticky sm:inset-auto sm:bottom-0 sm:-mx-6 sm:px-6 sm:py-4">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || isSaving}
        className="order-2 flex h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:order-none sm:border-0 sm:px-4 sm:justify-start"
      >
        <ArrowLeft size={16} />
        Previous
      </button>

      <button
        type="button"
        onClick={onSaveDraft}
        disabled={isSaving}
        className="order-3 flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:order-none sm:px-4"
      >
        <FileText size={15} />
        Save as Draft
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isSaving || nextDisabled}
        className="order-1 col-span-2 flex h-11 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:order-none sm:col-span-1"
      >
        {isSaving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight size={16} />
          </>
        )}
      </button>
      </div>
    </div>
    </>
  );
};

export default WizardFooterNav;
