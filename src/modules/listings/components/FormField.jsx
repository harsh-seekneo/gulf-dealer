const FormField = ({ label, required, error, children }) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className={error ? "rounded-lg ring-2 ring-red-400 ring-offset-1" : ""}>
        {children}
      </div>

      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;