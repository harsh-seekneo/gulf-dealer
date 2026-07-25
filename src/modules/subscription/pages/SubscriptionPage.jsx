import { useEffect, useState } from "react";
import CurrentPlanBanner from "../components/CurrentPlanBanner";
import PlanCard from "../components/PlanCard";
import ComparePlansTable from "../components/ComparePlansTable";
import { subscriptionApi } from "../api/subscriptionApi";

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [compareRows, setCompareRows] = useState([]);
  const [compareColumns, setCompareColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [current, available] = await Promise.all([
          subscriptionApi.getCurrentPlan(),
          subscriptionApi.getAvailablePlans(),
        ]);
        setCurrentPlan(current.plan || null);
        setPlans(available.plans || []);
        setCompareRows(available.compareRows || []);
        setCompareColumns(available.compareColumns || []);
      } catch (err) {
        console.error("Failed to load subscription data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectPlan = async (plan) => {
    if (!window.confirm(`Switch to ${plan.name}?`)) return;
    await subscriptionApi.choosePlan(plan._id);
    const current = await subscriptionApi.getCurrentPlan();
    setCurrentPlan(current.plan);
  };

  if (loading) return <p className="text-sm text-slate-400">Loading subscription...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-sm text-slate-500">Manage your dealer plan and billing</p>
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:underline">
          View Billing History
        </button>
      </div>

      <CurrentPlanBanner plan={currentPlan} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            isCurrent={currentPlan?._id === plan._id}
            isPremium={plan.tier === "premium"}
            onSelect={handleSelectPlan}
          />
        ))}
      </div>

      {compareRows.length > 0 && (
        <ComparePlansTable rows={compareRows} columns={compareColumns} />
      )}
    </div>
  );
}