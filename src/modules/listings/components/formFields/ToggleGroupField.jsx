const ToggleGroupField = ({ value, onChange, options, error }) => {
  return (
    <div className={`flex rounded-xl border bg-slate-100 p-1 ${error ? "border-red-400 ring-2 ring-red-400 ring-offset-1" : "border-slate-200"}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-150 ${
            value === option.value ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ToggleGroupField;
