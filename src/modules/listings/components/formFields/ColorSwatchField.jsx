const ColorSwatchField = ({ value, onChange, swatches, error }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${error ? "rounded-lg p-1 ring-2 ring-red-400 ring-offset-1" : ""}`}>
      {swatches.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          style={{ backgroundColor: color }}
          className={`h-7 w-7 rounded-full border transition-all duration-150 ${
            value === color ? "ring-2 ring-blue-500 ring-offset-2" : "border-slate-200"
          }`}
          aria-label={color}
        />
      ))}
    </div>
  );
};

export default ColorSwatchField;