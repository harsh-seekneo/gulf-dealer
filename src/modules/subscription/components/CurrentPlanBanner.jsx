import { Award } from "lucide-react";

export default function CurrentPlanBanner({ plan }) {
  if (!plan) return null;

  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);
  const today = new Date();

  const totalDays = Math.max(
    1,
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  );

  const remainingDays = Math.max(
    0,
    Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
  );

  const usedDays = Math.max(totalDays - remainingDays, 0);

  // Progress bar shows remaining percentage
  const progress = Math.round((remainingDays / totalDays) * 100);

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
      {/* Left */}
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-amber-100">
          <Award size={16} />
          Current Plan
        </p>

        <h2 className="mt-1 text-2xl font-bold">
          {plan.plan?.planName || plan.planNameSnapshot}
        </h2>

        <p className="text-sm text-amber-100">
          Expires on{" "}
          {endDate.toLocaleDateString("en-GB")} · BHD {plan.amount}
        </p>

        <p className="mt-1 text-sm text-amber-100">
          Status: {plan.status}
        </p>
      </div>

      {/* Right */}
      <div className="w-full sm:w-56">
        <p className="text-right text-xs text-amber-100">
          {remainingDays} Days Remaining
        </p>

        <p className="text-right text-xl font-bold">
          {remainingDays}/{totalDays}
        </p>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-2 text-right text-xs text-amber-100">
          {usedDays} days used
        </p>
      </div>
    </div>
  );
}