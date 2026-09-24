import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CurrentPlanBanner from "../components/CurrentPlanBanner";
import PlanCard from "../components/PlanCard";
import ComparePlansTable from "../components/ComparePlansTable";
import { subscriptionApi } from "../api/subscriptionApi";
import { getDealerStatusApi } from "../../dealer/api/dealerApi";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import {
  handleTapReturnInPaymentWindow,
  closePreparedPaymentWindow,
  openPaymentWindow,
  preparePaymentWindow,
  subscribeTapPaymentReturn,
} from "../../payment/paymentPopup";
import { useToast } from "../../../context/ToastContext";

const wait = (ms) => new Promise((resolve) => {
  window.setTimeout(resolve, ms);
});

export default function SubscriptionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [dealerId, setDealerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);
  const [renewalPlan, setRenewalPlan] = useState(null);
  const [renewalReview, setRenewalReview] = useState(null);
  const [renewalSelection, setRenewalSelection] = useState({
    selectedListingIds: [],
    selectedAdvertisementIdsByType: {},
  });
  const [isLoadingRenewalReview, setIsLoadingRenewalReview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const verifyPayment = async (tapId) => {
      try {
        const payment = await subscriptionApi.verifyTapPayment(tapId);

        if (payment.status !== "CAPTURED") {
          showToast(payment.failureReason || "Payment was not completed.", "error");
          return;
        }

        showToast("Subscription payment completed.", "success");
        await loadData();
      } catch (error) {
        showToast(
          error.response?.data?.message || "Unable to verify payment",
          "error"
        );
      }
    };

    const tapId = searchParams.get("tap_id");

    if (tapId && handleTapReturnInPaymentWindow(tapId)) {
      return;
    }

    const unsubscribe = subscribeTapPaymentReturn((returnedTapId) => {
      void verifyPayment(returnedTapId);
    });

    if (tapId) {
      void verifyPayment(tapId).finally(() => {
        setSearchParams({});
      });
    }

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams, showToast]);

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

  const handleSelectPlan = async (plan) => {
    const hasActiveSubscription =
      currentPlan?.status === "ACTIVE" &&
      currentPlan?.endDate &&
      new Date(currentPlan.endDate) > new Date();

    if (!hasActiveSubscription) {
      setSelectedPlan({ plan, renewalMode: false });
      return;
    }

    try {
      setIsLoadingRenewalReview(true);
      const review = await subscriptionApi.getRenewalReview(plan._id);
      setRenewalPlan(plan);
      setRenewalReview(review);
      setRenewalSelection({
        selectedListingIds: [],
        selectedAdvertisementIdsByType: Object.fromEntries(
          Object.keys(review?.advertisementsByType || {}).map((category) => [
            category,
            [],
          ])
        ),
      });
    } catch (error) {
      showToast(
        error.response?.data?.message || "Unable to load renewal review",
        "error"
      );
    } finally {
      setIsLoadingRenewalReview(false);
    }
  };

  const renewalSummary = useMemo(() => {
    if (!renewalReview || !renewalPlan) return null;

    const listingAllowance = Number(renewalReview.newPackage?.activeListingCount || 0);
    const listingsContinuing = renewalSelection.selectedListingIds.length;
    const ads = Object.entries(renewalReview.advertisementsByType || {}).map(
      ([category, group]) => {
        const continuing =
          renewalSelection.selectedAdvertisementIdsByType?.[category]?.length || 0;

        return {
          category,
          label: group.label,
          included: Number(group.included || 0),
          continuing,
          available: Math.max(Number(group.included || 0) - continuing, 0),
          ending: Math.max((group.items?.length || 0) - continuing, 0),
        };
      }
    );

    return {
      newPackage: renewalPlan.planName,
      listingAllowance,
      listingsContinuing,
      newListingSpacesAvailable: Math.max(listingAllowance - listingsContinuing, 0),
      listingsEnding: Math.max((renewalReview.listings?.length || 0) - listingsContinuing, 0),
      ads,
    };
  }, [renewalPlan, renewalReview, renewalSelection]);

  const toggleListingRenewal = (listingId) => {
    const id = String(listingId);
    const limit = Number(renewalReview?.newPackage?.activeListingCount || 0);

    setRenewalSelection((current) => {
      const selected = current.selectedListingIds || [];
      const isSelected = selected.includes(id);

      if (!isSelected && selected.length >= limit) {
        showToast(`You can continue up to ${limit} listings with this package.`, "error");
        return current;
      }

      return {
        ...current,
        selectedListingIds: isSelected
          ? selected.filter((item) => item !== id)
          : [...selected, id],
      };
    });
  };

  const toggleAdvertisementRenewal = (category, advertisementId) => {
    const id = String(advertisementId);
    const limit = Number(renewalReview?.advertisementsByType?.[category]?.included || 0);

    setRenewalSelection((current) => {
      const byType = current.selectedAdvertisementIdsByType || {};
      const selected = byType[category] || [];
      const isSelected = selected.includes(id);

      if (!isSelected && selected.length >= limit) {
        showToast(`You can continue up to ${limit} ${renewalReview.advertisementsByType[category].label}.`, "error");
        return current;
      }

      return {
        ...current,
        selectedAdvertisementIdsByType: {
          ...byType,
          [category]: isSelected
            ? selected.filter((item) => item !== id)
            : [...selected, id],
        },
      };
    });
  };

  const waitForPaymentCompletion = async (paymentId) => {
    if (!paymentId) {
      return null;
    }

    const maxAttempts = 45;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const payment = await subscriptionApi.getPaymentStatus(paymentId);

      if (["CAPTURED", "FAILED", "CANCELLED", "EXPIRED"].includes(payment.status)) {
        return payment;
      }

      // Poll a little faster so successful Tap returns surface promptly without
      // changing the existing retry count or terminal status handling.
      await wait(1000);
    }

    return null;
  };

  const confirmSelectPlan = async () => {
    if (!selectedPlan?.plan) return;

    if (!dealerId) {
      console.error("Dealer ID not found.");
      return;
    }

    const durationDays = selectedPlan.plan.pricingTiers?.[0]?.durationDays;

    if (!durationDays) {
      console.error("No pricing tier found.");
      return;
    }

    const paymentWindow = preparePaymentWindow();

    try {
      setIsSwitchingPlan(true);
      await subscriptionApi.choosePlan({
        dealerId,
        planId: selectedPlan.plan._id,
        durationDays,
        renewalMode: selectedPlan.renewalMode,
        selectedListingIds: selectedPlan.selectedListingIds,
        selectedAdvertisementIdsByType: selectedPlan.selectedAdvertisementIdsByType,
      });

      const payment = await subscriptionApi.pay({
        dealerId,
        paymentMethod: "CARD",
      });

      if (payment?.payment?.redirectUrl) {
        openPaymentWindow(payment.payment.redirectUrl, paymentWindow);
        setSelectedPlan(null);
        const completedPayment = await waitForPaymentCompletion(payment.payment.id);

        if (completedPayment?.status === "CAPTURED") {
          showToast("Subscription payment completed.", "success");
          closePreparedPaymentWindow(paymentWindow);
          await loadData();
        } else if (completedPayment) {
          showToast(
            completedPayment.failureReason || "Payment was not completed.",
            "error"
          );
        } else {
          showToast("Payment is still pending. Please refresh after completion.", "info");
        }

        return;
      }

      closePreparedPaymentWindow(paymentWindow);
      setSelectedPlan(null);
      await loadData();
    } catch (err) {
      closePreparedPaymentWindow(paymentWindow);
      console.error(err);
    } finally {
      setIsSwitchingPlan(false);
    }
  };

  const continueToRenewalPayment = () => {
    if (!renewalPlan) return;

    setSelectedPlan({
      plan: renewalPlan,
      renewalMode: true,
      selectedListingIds: renewalSelection.selectedListingIds,
      selectedAdvertisementIdsByType:
        renewalSelection.selectedAdvertisementIdsByType,
    });
  };

  const closeRenewalReview = () => {
    setRenewalPlan(null);
    setRenewalReview(null);
    setRenewalSelection({
      selectedListingIds: [],
      selectedAdvertisementIdsByType: {},
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-base text-slate-500">Loading subscription...</p>
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

          return (
            <PlanCard
              key={plan._id}
              plan={plan}
              isCurrent={isCurrent}
              onSelect={handleSelectPlan}
            />
          );
        })}
      </div>

      {isLoadingRenewalReview && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600">
          Loading renewal review...
        </div>
      )}

      {renewalReview && renewalSummary && (
        <div
          data-renewal-review
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Renewal Review
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                You are changing from {renewalReview.currentPackage} to {renewalSummary.newPackage}.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Your new package includes up to {renewalSummary.listingAllowance} vehicle listings.
                Please select the listings and advertisements you want to continue into the new period.
                Items not selected will expire at the end of your current subscription period.
              </p>
            </div>
            <button
              type="button"
              onClick={closeRenewalReview}
              className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase text-blue-700">Listings Continuing</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {renewalSummary.listingsContinuing}
              </p>
              <p className="text-sm text-slate-600">
                {renewalSummary.newListingSpacesAvailable} new listing spaces available
              </p>
            </div>
            {renewalSummary.ads.map((item) => (
              <div key={item.category} className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {item.continuing}
                </p>
                <p className="text-sm text-slate-600">
                  {item.available} spaces available
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <section>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Vehicle Listing Entitlements</h3>
                <span className="text-sm font-semibold text-slate-500">
                  {renewalSummary.listingsContinuing}/{renewalSummary.listingAllowance} selected
                </span>
              </div>
              <div className="mt-3 max-h-96 overflow-auto rounded-lg border border-slate-200">
                {renewalReview.listings?.length ? (
                  renewalReview.listings.map((listing) => {
                    const checked = renewalSelection.selectedListingIds.includes(String(listing._id));
                    return (
                      <label
                        key={listing._id}
                        className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {listing.vehicleInfo?.title || listing.listingId || "Vehicle listing"}
                          </p>
                          <p className="text-xs text-slate-500">{listing.status}</p>
                        </div>
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          {checked ? "Continue/Renew" : "Delete/Do Not Renew"}
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleListingRenewal(listing._id)}
                            className="h-4 w-4"
                          />
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="px-4 py-6 text-sm text-slate-500">No current dealer listings found for renewal.</p>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900">Advertisement Entitlements</h3>
              <div className="mt-3 flex max-h-96 flex-col gap-4 overflow-auto">
                {Object.entries(renewalReview.advertisementsByType || {}).map(([category, group]) => {
                  const selected = renewalSelection.selectedAdvertisementIdsByType?.[category] || [];
                  return (
                    <div key={category} className="rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <p className="font-semibold text-slate-900">{group.label}</p>
                        <span className="text-xs font-semibold text-slate-500">
                          {selected.length}/{group.included} selected
                        </span>
                      </div>
                      {group.items?.length ? (
                        group.items.map((ad) => {
                          const checked = selected.includes(String(ad._id));
                          return (
                            <label
                              key={ad._id}
                              className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                            >
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {ad.name || ad.advertisementId || group.label}
                                </p>
                                <p className="text-xs text-slate-500">{ad.status}</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAdvertisementRenewal(category, ad._id)}
                                className="h-4 w-4"
                              />
                            </label>
                          );
                        })
                      ) : (
                        <p className="px-4 py-4 text-sm text-slate-500">No current ads of this type.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="mt-6 rounded-lg bg-slate-950 p-4 text-white">
            <p className="text-sm font-semibold">Renewal Summary</p>
            <p className="mt-2 text-sm text-slate-200">
              {renewalSummary.newPackage} | {renewalSummary.listingsContinuing} listings continuing |
              {" "}{renewalSummary.newListingSpacesAvailable} new listing spaces available |
              {" "}{renewalSummary.ads.map((item) => `${item.continuing} ${item.label} continuing | ${item.available} spaces available`).join(" | ")} |
              {" "}{renewalSummary.listingsEnding + renewalSummary.ads.reduce((sum, item) => sum + item.ending, 0)} listings/ads ending
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  document.querySelector("[data-renewal-review]")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Review Listings & Ads
              </button>
              <button
                type="button"
                onClick={continueToRenewalPayment}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
              >
                Continue to Renewal
              </button>
            </div>
          </div>
        </div>
      )}

      {plans.length > 0 && <ComparePlansTable plans={plans} />}

      <ConfirmModal
        isOpen={Boolean(selectedPlan)}
        title={selectedPlan?.renewalMode ? "Continue to Renewal" : "Switch subscription plan"}
        message={
          selectedPlan?.renewalMode
            ? `Renew ${selectedPlan?.plan?.planName || "this package"} with ${selectedPlan?.selectedListingIds?.length || 0} listings continuing? The new package becomes effective after your current subscription ends.`
            : `Switch to ${selectedPlan?.plan?.planName || "this plan"}? Your dealer subscription will be updated.`
        }
        confirmText={selectedPlan?.renewalMode ? "Continue to Payment" : "Switch Plan"}
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
