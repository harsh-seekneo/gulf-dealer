export default function PlanCard({ plan, isCurrent, isPremium, onSelect }) {
  return (
    <div
      className={`flex flex-col rounded-2xl p-6 ${
        isPremium
          ? "bg-slate-950 text-white"
          : "border border-slate-200 bg-white"
      }`}
    >
      <span
        className={`mb-4 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${
          isPremium ? "bg-amber-500 text-white" : "border border-slate-300"
        }`}
      >
        {plan.name}
      </span>

      <p className={`text-3xl font-bold ${isPremium ? "text-amber-400" : "text-blue-600"}`}>
        BHD {plan.price}
      </p>

      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {plan.features.map((f) => (
          <li key={f} className={isPremium ? "text-slate-300" : "text-slate-600"}>
            • {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrent}
        className={`mt-6 w-full rounded-lg py-2.5 text-sm font-semibold ${
          isCurrent
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : isPremium
            ? "bg-white text-slate-950 hover:bg-slate-100"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
        }`}
      >
        {isCurrent ? "Current Plan" : isPremium ? "Upgrade" : "Choose Plan"}
      </button>
    </div>
  );
}