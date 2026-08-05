const ToggleGroupField = ({ value, onChange, options, error }) => {
  return (
    <div className={`flex overflow-hidden rounded-lg border ${error ? "border-red-400 ring-2 ring-red-400 ring-offset-1" : "border-slate-300"}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 py-2 text-sm font-medium transition-colors duration-150 ${
            value === option.value ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ToggleGroupField;