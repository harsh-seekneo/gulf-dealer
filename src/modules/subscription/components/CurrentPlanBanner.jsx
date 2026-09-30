import { useEffect, useState } from "react";
import { Award } from "lucide-react";

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const isSameLocalDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const formatExpiryLabel = (value, nowValue = Date.now()) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  const now = new Date(nowValue);
  const diff = date.getTime() - now.getTime();

  if (diff <= 0) return "Expired";
  if (diff < MINUTE_MS) return `${Math.ceil(diff / 1000)} seconds remaining`;
  if (diff < HOUR_MS) return `${Math.ceil(diff / MINUTE_MS)} minutes remaining`;
  if (diff < 6 * HOUR_MS) return `${Math.ceil(diff / HOUR_MS)} hours remaining`;
  if (isSameLocalDay(date, now)) return "Today";

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameLocalDay(date, tomorrow)) return "Tomorrow";

  return date.toLocaleDateString("en-GB");
};

export default function CurrentPlanBanner({ plan }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!plan) return null;

  const isPendingActivation = plan.status === "PENDING_ACTIVATION" || !plan.startDate || !plan.endDate;
  const adSlots = [
    { label: "Homepage", value: plan.homepageBanner ?? plan.plan?.homepageBanner },
    { label: "Listing banner", value: plan.listingBanner ?? plan.plan?.listingBanner },
    { label: "Large ads", value: plan.largeAdsSpace ?? plan.plan?.largeAdsSpace },
    { label: "Small ads", value: plan.smallAdsSpace ?? plan.plan?.smallAdsSpace },
  ].filter((item) => item.value !== null && item.value !== undefined);

  if (isPendingActivation) {
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-amber-100">
            <Award size={16} />
            Current Plan
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {plan.plan?.planName || plan.planNameSnapshot}
          </h2>

          <p className="text-sm text-amber-100">
            Starts after admin approval · BHD {plan.amount}
          </p>

          {plan.launchOfferFreeMonths > 0 && (
            <p className="mt-1 text-sm text-amber-100">
              {plan.offerReason ||
                `Launch offer eligible: ${plan.launchOfferFreeMonths} free months`}
            </p>
          )}

          {adSlots.length > 0 && (
            <p className="mt-1 text-sm text-amber-100">
              Ads included: {adSlots.map((slot) => `${slot.value} ${slot.label}`).join(" · ")}
            </p>
          )}
        </div>

        <div className="w-full text-right sm:w-56">
          <p className="text-xs text-amber-100">Status</p>
          <p className="text-xl font-bold">Pending Approval</p>
        </div>
      </div>
    );
  }

  const endDate = new Date(plan.endDate);
  const totalDays = Number(plan.daysTotal || plan.durationDaysSnapshot || 0);
  const remainingDays = Number(plan.daysRemaining ?? totalDays);
  const usedDays = Number(plan.daysUsed ?? Math.max(totalDays - remainingDays, 0));
  const expiryLabel = formatExpiryLabel(endDate, now);

  // Progress bar shows remaining percentage
  const progress = totalDays > 0 ? Math.round((remainingDays / totalDays) * 100) : 0;

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
          {expiryLabel === "Expired" ? "Expired" : `Expires ${expiryLabel}`} · BHD {plan.amount}
        </p>

        <p className="mt-1 text-sm text-amber-100">
          Status: {plan.status}
        </p>

        {plan.launchOfferApplied && (
          <p className="mt-1 text-sm text-amber-100">
            {plan.offerReason ||
              `Launch offer applied: ${plan.launchOfferFreeMonths} free months`}
          </p>
        )}

        {adSlots.length > 0 && (
          <p className="mt-1 text-sm text-amber-100">
            Ads included: {adSlots.map((slot) => `${slot.value} ${slot.label}`).join(" · ")}
          </p>
        )}
      </div>

      {/* Right */}
      <div className="w-full sm:w-56">
        <p className="text-right text-xs text-amber-100">
          {plan.daysLabel || `${remainingDays} Days Remaining`}
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
