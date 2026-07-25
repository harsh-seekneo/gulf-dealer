import { Award } from "lucide-react";

export default function CurrentPlanBanner({ plan }) {
  if (!plan) return null;

  const pct = plan.daysTotal
    ? Math.round((plan.daysUsed / plan.daysTotal) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-amber-100">
          <Award size={16} /> Current Plan
        </p>
        <h2 className="mt-1 text-2xl font-bold">{plan.name}</h2>
        <p className="text-sm text-amber-100">
          Expires on {plan.expiresOn} · BHD {plan.price}/month
        </p>
      </div>

      <div className="w-full sm:w-48">
        <p className="text-right text-xs text-amber-100">Days Pending</p>
        <p className="text-right text-xl font-bold">
          {plan.daysUsed}/{plan.daysTotal}
        </p>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}