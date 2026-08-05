const FeaturesDisplay = ({ config, features }) => {
  if (!config || !features) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Features &amp; Options</h3>

      {config.featureGroups.map((group) => {
        const groupFeatures = features[group.key] || [];
        if (groupFeatures.length === 0) return null;

        return (
          <div key={group.key} className="mb-4 last:mb-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {groupFeatures.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeaturesDisplay;