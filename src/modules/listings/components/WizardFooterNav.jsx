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
    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || isSaving}
        className="flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowLeft size={16} />
        Previous
      </button>

      <button
        type="button"
        onClick={onSaveDraft}
        disabled={isSaving}
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileText size={15} />
        Save as Draft
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isSaving || nextDisabled}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
  );
};

export default WizardFooterNav;