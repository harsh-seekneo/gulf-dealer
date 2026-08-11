const PlateSummary = ({ vehicleInfo }) => {
  if (!vehicleInfo) return null;

  const summaryRows = [
    { label: "Country", value: vehicleInfo.registrationCountry },
    { label: "Type", value: vehicleInfo.plateType },
    { label: "Category", value: vehicleInfo.plateCategory },
    { label: "Pattern", value: vehicleInfo.numberPattern },
    { label: "Digits", value: vehicleInfo.numberOfDigits },
  ];

  const hasAnyValue = summaryRows.some((row) => row.value);

  if (!hasAnyValue) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-blue-50/50 p-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Plate Summary</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {summaryRows.map((row) => (
          <div key={row.label}>
            <p className="text-xs text-slate-400">{row.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{row.value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlateSummary;