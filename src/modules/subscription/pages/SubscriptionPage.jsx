import { useEffect, useState } from "react";
import CurrentPlanBanner from "../components/CurrentPlanBanner";
import PlanCard from "../components/PlanCard";
import ComparePlansTable from "../components/ComparePlansTable";
import { subscriptionApi } from "../api/subscriptionApi";
import { getDealerStatusApi } from "../../dealer/api/dealerApi";
import ConfirmModal from "../../../components/ui/ConfirmModal";

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [dealerId, setDealerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [current, available, status] = await Promise.all([
        subscriptionApi.getCurrentPlan(),
        subscriptionApi.getAvailablePlans(),
        getDealerStatusApi(),
      ]);

      setCurrentPlan(current || null);
      setPlans(available?.plans || []);
      setDealerId(status?.dealer?._id || null);
    } catch (err) {
      console.error("Failed to load subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const confirmSelectPlan = async () => {
    if (!selectedPlan) return;

    if (!dealerId) {
      console.error("Dealer ID not found.");
      return;
    }

    const durationDays = selectedPlan.pricingTiers?.[0]?.durationDays;

    if (!durationDays) {
      console.error("No pricing tier found.");
      return;
    }

    try {
      setIsSwitchingPlan(true);
      await subscriptionApi.choosePlan({
        dealerId,
        planId: selectedPlan._id,
        durationDays,
      });

      setSelectedPlan(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitchingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-base text-slate-500">
          Loading subscription...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-2 pb-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Subscription Management
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Manage your dealer plan and billing
          </p>
        </div>

        <button className="text-lg font-semibold text-slate-900 hover:text-blue-600">
          View Billing History
        </button>
      </div>

      <CurrentPlanBanner plan={currentPlan} />

      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => {
          const currentPlanId =
            currentPlan?.plan?._id ||
            currentPlan?.planId ||
            currentPlan?.plan ||
            "";

          const isCurrent = currentPlanId === plan._id;

          const isPremium =
            plan.planName?.toLowerCase().includes("premium") ||
            plan.planName?.toLowerCase().includes("prestige");

          return (
            <PlanCard
              key={plan._id}
              plan={plan}
              isCurrent={isCurrent}
              isPremium={isPremium}
              onSelect={handleSelectPlan}
            />
          );
        })}
      </div>

      {plans.length > 0 && (
        <ComparePlansTable plans={plans} />
      )}

      <ConfirmModal
        isOpen={Boolean(selectedPlan)}
        title="Switch subscription plan"
        message={`Switch to ${selectedPlan?.planName || "this plan"}? Your dealer subscription will be updated.`}
        confirmText="Switch Plan"
        variant="primary"
        isLoading={isSwitchingPlan}
        onClose={() => {
          if (!isSwitchingPlan) setSelectedPlan(null);
        }}
        onConfirm={confirmSelectPlan}
      />
    </div>
  );
}
