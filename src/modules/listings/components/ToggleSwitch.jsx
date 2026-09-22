"use client";
 
const ToggleSwitch = ({ checked, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        {label && (
          <p className="text-sm font-medium text-slate-800">{label}</p>
        )}
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
 
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full
          transition-all duration-300 ease-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          ${
            checked
              ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-inner"
              : "bg-slate-200 shadow-inner hover:bg-slate-300"
          }`}
      >
        <span
          className={`pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-white
            shadow-md ring-0
            transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
};
 

export default ToggleSwitch;