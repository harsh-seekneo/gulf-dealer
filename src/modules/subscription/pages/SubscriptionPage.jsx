import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CurrentPlanBanner from "../components/CurrentPlanBanner";
import PlanCard from "../components/PlanCard";
import ComparePlansTable from "../components/ComparePlansTable";
import { subscriptionApi } from "../api/subscriptionApi";
import { getDealerStatusApi } from "../../dealer/api/dealerApi";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import {
  redirectToPaymentUrl,
} from "../../payment/paymentPopup";
import { useToast } from "../../../context/ToastContext";
import { getRenewalAvailability } from "../utils/renewalWindow";

const getPlanListingLimit = (plan) => Number(plan?.activeListingCount || 0);

const getPlanActionLabel = ({ plan, currentPlan }) => {
  const currentPlanId =
    currentPlan?.plan?._id ||
    currentPlan?.planId ||
    currentPlan?.plan ||
    "";

  if (String(currentPlanId) === String(plan?._id)) {
    return "Renew Plan";
  }

  const currentLimit = Number(
    currentPlan?.activeListingCount ||
      currentPlan?.plan?.activeListingCount ||
      currentPlan?.plan?.listingLimit ||
      0
  );
  const nextLimit = getPlanListingLimit(plan);

  if (nextLimit > currentLimit) return "Upgrade Plan";
  if (currentLimit && nextLimit < currentLimit) return "Downgrade Plan";
  return "Choose Plan";
};

const getSelectedActionLabel = (selectedPlan) => {
  if (!selectedPlan?.renewalMode) return "Continue to Payment";
  return selectedPlan.actionLabel || "Renew Plan";
};




const PAGE_SIZE = 50;

const getPlanPrice = (plan) => {
  const tier = plan?.pricingTiers?.[0] || {};
  return Number(plan?.basePrice ?? tier.basePrice ?? tier.finalPrice ?? tier.price ?? 0);
};

const formatReviewDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB");
};

const getListingPreviewImage = (listing) =>
  listing?.media?.featuredImage?.url ||
  listing?.media?.featuredImage ||
  "";

const getAdvertisementPreviewImage = (ad) =>
  ad?.creatives?.desktop?.url ||
  ad?.creatives?.tablet?.url ||
  ad?.creatives?.mobile?.url ||
  "";

const getItemPreviewMeta = (item, type, fallbackTitle) => {
  if (type === "listing") {
    return {
      title: item?.vehicleInfo?.title || item?.listingId || fallbackTitle,
      imageUrl: getListingPreviewImage(item),
      badge: item?.status || "Listing",
      rows: [
        ["Listing ID", item?.listingId || "N/A"],
        ["Expires", formatReviewDate(item?.expiresAt)],
      ],
    };
  }

  const details = item?.details || {};

  return {
    title: item?.name || item?.advertisementId || fallbackTitle,
    imageUrl: getAdvertisementPreviewImage(item),
    badge: item?.status || "Advertisement",
    rows: [
      ["Ad ID", item?.advertisementId || "N/A"],
      ["Business", details.businessName || "N/A"],
      ["Category", details.businessCategoryLabelSnapshot || item?.category || "N/A"],
      ["Ends", formatReviewDate(item?.endsAt)],
    ],
    description: details.tagline || "",
  };
};

function HoverPreviewCard({ item, type, fallbackTitle }) {
  const preview = getItemPreviewMeta(item, type, fallbackTitle);

  return (
    <div className="pointer-events-none absolute left-12 top-full z-20 hidden w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl group-hover:block">
      <div className="overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
        {preview.imageUrl ? (
          <img
            src={preview.imageUrl}
            alt=""
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="flex h-32 items-center justify-center text-xs font-semibold text-slate-400">
            No image available
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-2 text-sm font-bold text-slate-950">
            {preview.title}
          </p>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
            {preview.badge}
          </span>
        </div>
        {preview.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {preview.description}
          </p>
        ) : null}
        <div className="mt-2 space-y-1">
          {preview.rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 text-xs">
              <span className="text-slate-400">{label}</span>
              <span className="max-w-[9rem] truncate text-right font-semibold text-slate-700">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Ek tab ke andar ki list (search + filter + bulk + load more) ---------- */
function ItemList({
  items,
  getId,
  getTitle,
  selectedIds,
  limit,
  onToggle,
  onSetMany,
  emptyText,
  previewType,
  previewFallbackTitle,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | keep | drop
  const [visible, setVisible] = useState(PAGE_SIZE);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const limitReached = selectedIds.length >= limit;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const id = String(getId(it));
      if (filter === "keep" && !selectedSet.has(id)) return false;
      if (filter === "drop" && selectedSet.has(id)) return false;
      if (q && !`${getTitle(it)} ${it.status || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, filter, selectedSet, getId, getTitle]);

  if (!items.length) {
    return <p className="px-4 py-10 text-center text-sm text-slate-500">{emptyText}</p>;
  }

  const filters = [
    ["all", `All (${items.length})`],
    ["keep", `Continuing (${selectedIds.length})`],
    ["drop", `Not continuing (${items.length - selectedIds.length})`],
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 border-b border-slate-200 p-3 md:flex-row md:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search by name or status"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 md:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {filters.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key);
                setVisible(PAGE_SIZE);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filter === key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 md:ml-auto">
          <button
            type="button"
            onClick={() => onSetMany(filtered.slice(0, limit).map((it) => String(getId(it))))}
            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            Select first {Math.min(limit, filtered.length)}
          </button>
          <button
            type="button"
            onClick={() => onSetMany([])}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear all
          </button>
        </div>
      </div>

      {limitReached && (
        <p className="bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
          Limit reached ({limit}). Naya item select karne ke liye pehle kisi ko uncheck karo.
        </p>
      )}

      {/* Rows */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">Koi result nahi mila.</p>
        ) : (
          <>
            {filtered.slice(0, visible).map((it) => {
              const id = String(getId(it));
              const checked = selectedSet.has(id);
              const disabled = !checked && limitReached;
              return (
                <label
                  key={id}
                  className={`group relative flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 ${
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-slate-50"
                  }`}
                >
                  <HoverPreviewCard
                    item={it}
                    type={previewType}
                    fallbackTitle={previewFallbackTitle || getTitle(it)}
                  />
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onToggle(it._id)}
                    className="h-4 w-4 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{getTitle(it)}</p>
                    <p className="text-xs text-slate-500">{it.status}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      checked ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {checked ? "Continue" : "Will expire"}
                  </span>
                </label>
              );
            })}
            {visible < filtered.length && (
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="w-full py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Show more ({filtered.length - visible} baaki)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Main modal ---------- */
function RenewalReviewModal({
  renewalReview,
  renewalSummary,
  renewalSelection,
  renewalActionLabel,
  closeRenewalReview,
  continueToRenewalPayment,
  toggleListingRenewal,
  toggleAdvertisementRenewal,
  setListingRenewalIds, // (ids: string[]) => void
  setAdvertisementRenewalIds, // (category: string, ids: string[]) => void
  addOnPlans = [],
  selectedAddOnPlanIds = [],
  toggleAddOnPlan,
}) {
  const [summaryOpen, setSummaryOpen] = useState(false); // default collapsed
  const [activeTab, setActiveTab] = useState("listings");

  const listingIds = renewalSelection.selectedListingIds || [];
  const adGroups = Object.entries(renewalReview.advertisementsByType || {});

  const tabs = [
    {
      key: "listings",
      label: "Vehicle Listings",
      selected: listingIds.length,
      limit: renewalSummary.listingAllowance,
      total: renewalReview.listings?.length || 0,
    },
    ...adGroups.map(([category, group]) => ({
      key: category,
      label: group.label,
      selected: (renewalSelection.selectedAdvertisementIdsByType?.[category] || []).length,
      limit: group.included,
      total: group.items?.length || 0,
    })),
  ];

  const active = tabs.find((t) => t.key === activeTab) || tabs[0];
  const activeGroup = renewalReview.advertisementsByType?.[active.key];
  const activeAdIds = renewalSelection.selectedAdvertisementIdsByType?.[active.key] || [];

  const totalContinuing =
    renewalSummary.listingsContinuing + renewalSummary.ads.reduce((s, i) => s + i.continuing, 0);
  const totalNewSpaces =
    renewalSummary.newListingSpacesAvailable + renewalSummary.ads.reduce((s, i) => s + i.available, 0);
  const totalEnding =
    renewalSummary.listingsEnding + renewalSummary.ads.reduce((s, i) => s + i.ending, 0);

  return (
    <div
      data-renewal-review
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-0 sm:p-4"
    >
      <div className="flex h-full max-h-[100vh] w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[90vh] sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              1. Current/available Dealer Page package
            </p>
            <h2 className="text-lg font-bold text-slate-900">
              {renewalReview.currentPackage} → {renewalSummary.newPackage}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Select which items you want to continue in the new package. Items not selected will expire after your current package ends.
            </p>
          </div>
          <button
            type="button"
            onClick={closeRenewalReview}
            aria-label="Cancel"
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>

        {/* Collapsible summary */}
        <div className="border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setSummaryOpen((o) => !o)}
            aria-expanded={summaryOpen}
            className="flex w-full items-center justify-between gap-3 px-5 py-2.5 text-left"
          >
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-slate-900">Summary</span>
              <span className="text-emerald-700">{totalContinuing} continuing</span>
              <span className="text-blue-700">{totalNewSpaces} new spaces</span>
              <span className="text-red-600">{totalEnding} ending</span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-slate-500">
              {summaryOpen ? "Hide details" : "Show details"}
            </span>
          </button>

          {summaryOpen && (
            <div className="grid gap-2 px-5 pb-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  key: "listings",
                  label: "Vehicle Listings",
                  continuing: renewalSummary.listingsContinuing,
                  available: renewalSummary.newListingSpacesAvailable,
                  ending: renewalSummary.listingsEnding,
                },
                ...renewalSummary.ads.map((i) => ({ ...i, key: i.category })),
              ].map((i) => (
                <div key={i.key} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">{i.label}</p>
                  <p className="text-xs text-slate-600">
                    {i.continuing} continue · {i.available} spaces left ·{" "}
                    <span className="text-red-600">{i.ending} ending</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body: tabs + list */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Tabs: mobile par horizontal scroll, desktop par left sidebar */}
          <nav
            aria-label="Renewal categories"
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-white p-2 md:w-60 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r"
          >
            {tabs.map((t) => {
              const isActive = t.key === active.key;
              const pct = t.limit ? Math.min(100, (t.selected / t.limit) * 100) : 0;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`min-w-[9.5rem] rounded-lg px-3 py-2 text-left md:min-w-0 ${
                    isActive ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isActive ? "text-blue-800" : "text-slate-800"
                      }`}
                    >
                      {t.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {t.selected}/{t.limit}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-slate-200">
                    <span
                      className={`block h-full rounded-full ${
                        t.selected >= t.limit ? "bg-amber-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">{t.total} current</span>
                </button>
              );
            })}
          </nav>

          {/* Active panel */}
          <section className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-bold text-slate-900">{active.label}</h3>
              <span className="text-sm font-semibold text-slate-600">
                {active.selected} of {active.limit} selected
              </span>
            </div>

            {active.key === "listings" ? (
              <ItemList
                key="listings"
                items={renewalReview.listings || []}
                getId={(l) => l._id}
                getTitle={(l) => l.vehicleInfo?.title || l.listingId || "Vehicle listing"}
                selectedIds={listingIds.map(String)}
                limit={renewalSummary.listingAllowance}
                onToggle={toggleListingRenewal}
                onSetMany={setListingRenewalIds}
                emptyText="No current listings were found for renewal."
                previewType="listing"
                previewFallbackTitle="Vehicle listing"
              />
            ) : (
              <ItemList
                key={active.key}
                items={activeGroup?.items || []}
                getId={(a) => a._id}
                getTitle={(a) => a.name || a.advertisementId || activeGroup?.label}
                selectedIds={activeAdIds.map(String)}
                limit={activeGroup?.included || 0}
                onToggle={(id) => toggleAdvertisementRenewal(active.key, id)}
                onSetMany={(ids) => setAdvertisementRenewalIds(active.key, ids)}
                emptyText="Is type ki koi current ad nahi hai."
                previewType="advertisement"
                previewFallbackTitle={activeGroup?.label || "Advertisement"}
              />
            )}
          </section>
        </div>

        {addOnPlans.length > 0 && (
          <div className="border-t border-slate-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-bold text-slate-900">
              2. Featured Dealer - Optional Add-on
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {addOnPlans.map((addOn) => {
                const checked = selectedAddOnPlanIds.includes(String(addOn._id));
                const price = getPlanPrice(addOn);
                const tier = addOn.pricingTiers?.[0] || {};

                return (
                  <label
                    key={addOn._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white px-4 py-3 ${
                      checked ? "border-amber-400 ring-2 ring-amber-100" : "border-amber-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAddOnPlan(addOn._id)}
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold text-slate-950">
                        {addOn.planName || "Featured Dealer"}
                      </span>
                      <span className="mt-1 block text-sm text-slate-600">
                        Promote your dealer profile in the Featured Dealers section.
                      </span>
                      <span className="mt-2 block text-sm font-bold text-amber-700">
                        {addOn.currency || "BHD"} {price.toFixed(3)}
                        {tier.durationDays ? ` / ${tier.durationDays} days` : ""}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-emerald-700">{totalContinuing} continue</span> ·{" "}
            <span className="font-semibold text-red-600">{totalEnding} expire</span>. Selected items will continue in the new plan after payment.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeRenewalReview}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={continueToRenewalPayment}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {renewalActionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function SubscriptionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [addOnPlans, setAddOnPlans] = useState([]);
  const [dealerId, setDealerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);
  const [renewalBlocked, setRenewalBlocked] = useState(null);
  const [renewalPlan, setRenewalPlan] = useState(null);
  const [renewalActionLabel, setRenewalActionLabel] = useState("Renew Plan");
  const [renewalReview, setRenewalReview] = useState(null);
  const [renewalSelection, setRenewalSelection] = useState({
    selectedListingIds: [],
    selectedAdvertisementIdsByType: {},
  });
  const [selectedAddOnPlanIds, setSelectedAddOnPlanIds] = useState([]);
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
        navigate("/dashboard", { replace: true });
      } catch (error) {
        showToast(
          error.response?.data?.message || "Unable to verify payment",
          "error"
        );
      }
    };

    const tapId = searchParams.get("tap_id");

    if (tapId) {
      void verifyPayment(tapId).finally(() => {
        setSearchParams({});
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, searchParams, setSearchParams, showToast]);

  const loadData = async () => {
    try {
      const [current, available, status, addOns] = await Promise.all([
        subscriptionApi.getCurrentPlan(),
        subscriptionApi.getAvailablePlans(),
        getDealerStatusApi(),
        subscriptionApi.getAddOnPlans().catch(() => []),
      ]);

      setCurrentPlan(current || null);
      setPlans(available?.plans || []);
      setAddOnPlans(Array.isArray(addOns) ? addOns : []);
      setDealerId(status?.dealer?._id || null);
    } catch (err) {
      console.error("Failed to load subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    const actionLabel = getPlanActionLabel({ plan, currentPlan });
    const hasRenewableSubscription =
      ["ACTIVE", "EXPIRED"].includes(currentPlan?.status) &&
      currentPlan?.endDate;
    const renewalAvailability = getRenewalAvailability(currentPlan);

    if (hasRenewableSubscription && !renewalAvailability.canRenew) {
      setRenewalBlocked(renewalAvailability);
      return;
    }

    if (!hasRenewableSubscription) {
      setSelectedPlan({ plan, renewalMode: false, actionLabel });
      return;
    }

    try {
      setIsLoadingRenewalReview(true);
      const review = await subscriptionApi.getRenewalReview(plan._id);
      setRenewalPlan(plan);
      setRenewalActionLabel(actionLabel);
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
      setSelectedAddOnPlanIds([]);
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

  const setListingRenewalIds = (ids) => {
    const limit = Number(renewalReview?.newPackage?.activeListingCount || 0);
    setRenewalSelection((current) => ({
      ...current,
      selectedListingIds: ids.map(String).slice(0, limit),
    }));
  };

  const setAdvertisementRenewalIds = (category, ids) => {
    const limit = Number(renewalReview?.advertisementsByType?.[category]?.included || 0);
    setRenewalSelection((current) => ({
      ...current,
      selectedAdvertisementIdsByType: {
        ...(current.selectedAdvertisementIdsByType || {}),
        [category]: ids.map(String).slice(0, limit),
      },
    }));
  };

  const toggleAddOnPlan = (planId) => {
    const id = String(planId);
    setSelectedAddOnPlanIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
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

    try {
      setIsSwitchingPlan(true);
      await subscriptionApi.choosePlan({
        dealerId,
        planId: selectedPlan.plan._id,
        durationDays,
        renewalMode: selectedPlan.renewalMode,
        selectedListingIds: selectedPlan.selectedListingIds,
        selectedAdvertisementIdsByType: selectedPlan.selectedAdvertisementIdsByType,
        addOnPlanIds: selectedPlan.addOnPlanIds,
      });

      const payment = await subscriptionApi.pay({
        dealerId,
        paymentMethod: "CARD",
      });

      if (payment?.payment?.redirectUrl) {
        setSelectedPlan(null);
        redirectToPaymentUrl(payment.payment, {
          returnTo: "/dashboard",
          source: "dealer-subscription",
        });
        return;
      }

      setSelectedPlan(null);
      await loadData();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || "Unable to start dealer subscription payment.",
        "error"
      );
    } finally {
      setIsSwitchingPlan(false);
    }
  };

  const continueToRenewalPayment = () => {
    if (!renewalPlan) return;

    setSelectedPlan({
      plan: renewalPlan,
      renewalMode: true,
      actionLabel: renewalActionLabel,
      selectedListingIds: renewalSelection.selectedListingIds,
      selectedAdvertisementIdsByType:
        renewalSelection.selectedAdvertisementIdsByType,
      addOnPlanIds: selectedAddOnPlanIds,
    });
  };

  const closeRenewalReview = () => {
    setRenewalPlan(null);
    setRenewalActionLabel("Renew Plan");
    setRenewalReview(null);
    setRenewalSelection({
      selectedListingIds: [],
      selectedAdvertisementIdsByType: {},
    });
    setSelectedAddOnPlanIds([]);
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

        <Link
          to="/subscription/billing"
          className="text-lg font-semibold text-slate-900 hover:text-blue-600"
        >
          View Billing History
        </Link>
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

          const actionLabel = getPlanActionLabel({ plan, currentPlan });

          return (
            <PlanCard
              key={plan._id}
              plan={plan}
              isCurrent={isCurrent}
              actionLabel={actionLabel}
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
        // <div
        //   data-renewal-review
        //   className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        // >
        //   <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        //   <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
        //     <div>
        //       <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
        //         {renewalActionLabel} Review
        //       </p>
        //       <h2 className="mt-1 text-xl font-bold text-slate-900">
        //         You are changing from {renewalReview.currentPackage} to {renewalSummary.newPackage}.
        //       </h2>
        //       <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-600">
        //         Your new package includes up to {renewalSummary.listingAllowance} vehicle listings.
        //         Please select the listings and advertisements you want to continue into the new period.
        //         Items not selected will expire at the end of your current subscription period.
        //       </p>
        //     </div>
        //     <button
        //       type="button"
        //       onClick={closeRenewalReview}
        //       className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        //     >
        //       Cancel
        //     </button>
        //   </div>

        //   <div className="grid gap-3 px-5 py-4 md:grid-cols-2 xl:grid-cols-4">
        //     <div className="rounded-lg bg-blue-50 p-3">
        //       <p className="text-xs font-semibold uppercase text-blue-700">Listings Continuing</p>
        //       <p className="mt-1 text-xl font-bold text-slate-900">
        //         {renewalSummary.listingsContinuing}
        //       </p>
        //       <p className="text-sm text-slate-600">
        //         {renewalSummary.newListingSpacesAvailable} new listing spaces available
        //       </p>
        //     </div>
        //     {renewalSummary.ads.map((item) => (
        //       <div key={item.category} className="rounded-lg bg-slate-50 p-3">
        //         <p className="text-xs font-semibold uppercase text-slate-500">{item.label}</p>
        //         <p className="mt-1 text-xl font-bold text-slate-900">
        //           {item.continuing}
        //         </p>
        //         <p className="text-sm text-slate-600">
        //           {item.available} spaces available
        //         </p>
        //       </div>
        //     ))}
        //   </div>

        //   <div className="grid gap-4 px-5 pb-4 xl:grid-cols-[1.1fr_0.9fr]">
        //     <section>
        //       <div className="flex items-center justify-between">
        //         <h3 className="text-base font-bold text-slate-900">Vehicle Listing Entitlements</h3>
        //         <span className="text-sm font-semibold text-slate-500">
        //           {renewalSummary.listingsContinuing}/{renewalSummary.listingAllowance} selected
        //         </span>
        //       </div>
        //       <div className="mt-2 max-h-[34vh] overflow-auto rounded-lg border border-slate-200">
        //         {renewalReview.listings?.length ? (
        //           renewalReview.listings.map((listing) => {
        //             const checked = renewalSelection.selectedListingIds.includes(String(listing._id));
        //             return (
        //               <label
        //                 key={listing._id}
        //                 className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50"
        //               >
        //                 <div>
        //                   <p className="font-semibold text-slate-900">
        //                     {listing.vehicleInfo?.title || listing.listingId || "Vehicle listing"}
        //                   </p>
        //                   <p className="text-xs text-slate-500">{listing.status}</p>
        //                 </div>
        //                 <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        //                   {checked ? "Continue/Renew" : "Delete/Do Not Renew"}
        //                   <input
        //                     type="checkbox"
        //                     checked={checked}
        //                     onChange={() => toggleListingRenewal(listing._id)}
        //                     className="h-4 w-4"
        //                   />
        //                 </span>
        //               </label>
        //             );
        //           })
        //         ) : (
        //           <p className="px-4 py-6 text-sm text-slate-500">No current dealer listings found for renewal.</p>
        //         )}
        //       </div>
        //     </section>

        //     <section>
        //       <h3 className="text-base font-bold text-slate-900">Advertisement Entitlements</h3>
        //       <div className="mt-2 flex max-h-[34vh] flex-col gap-3 overflow-auto">
        //         {Object.entries(renewalReview.advertisementsByType || {}).map(([category, group]) => {
        //           const selected = renewalSelection.selectedAdvertisementIdsByType?.[category] || [];
        //           return (
        //             <div key={category} className="rounded-lg border border-slate-200">
        //               <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
        //                 <p className="font-semibold text-slate-900">{group.label}</p>
        //                 <span className="text-xs font-semibold text-slate-500">
        //                   {selected.length}/{group.included} selected
        //                 </span>
        //               </div>
        //               {group.items?.length ? (
        //                 group.items.map((ad) => {
        //                   const checked = selected.includes(String(ad._id));
        //                   return (
        //                     <label
        //                       key={ad._id}
        //                       className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50"
        //                     >
        //                       <div>
        //                         <p className="font-semibold text-slate-900">
        //                           {ad.name || ad.advertisementId || group.label}
        //                         </p>
        //                         <p className="text-xs text-slate-500">{ad.status}</p>
        //                       </div>
        //                       <input
        //                         type="checkbox"
        //                         checked={checked}
        //                         onChange={() => toggleAdvertisementRenewal(category, ad._id)}
        //                         className="h-4 w-4"
        //                       />
        //                     </label>
        //                   );
        //                 })
        //               ) : (
        //                 <p className="px-4 py-4 text-sm text-slate-500">No current ads of this type.</p>
        //               )}
        //             </div>
        //           );
        //         })}
        //       </div>
        //     </section>
        //   </div>

        //   <div className="sticky bottom-0 border-t border-slate-200 bg-white px-5 py-4">
        //     <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        //       <div>
        //         <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
        //           {renewalActionLabel} Summary
        //         </p>
        //         <h3 className="mt-1 text-base font-black text-slate-950">
        //           {renewalSummary.newPackage}
        //         </h3>
        //         <p className="mt-1 text-sm leading-5 text-slate-600">
        //           Selected items will continue under the new plan after payment.
        //           Anything not selected remains expired and will not be visible.
        //         </p>
        //       </div>
        //       <div className="grid gap-3 sm:grid-cols-3">
        //         <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
        //           <p className="text-xs font-bold uppercase text-slate-400">Continuing</p>
        //           <p className="mt-1 text-2xl font-black text-slate-950">
        //             {renewalSummary.listingsContinuing +
        //               renewalSummary.ads.reduce((sum, item) => sum + item.continuing, 0)}
        //           </p>
        //         </div>
        //         <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
        //           <p className="text-xs font-bold uppercase text-slate-400">New Spaces</p>
        //           <p className="mt-1 text-2xl font-black text-slate-950">
        //             {renewalSummary.newListingSpacesAvailable +
        //               renewalSummary.ads.reduce((sum, item) => sum + item.available, 0)}
        //           </p>
        //         </div>
        //         <div className="rounded-lg border border-slate-100 bg-red-50 px-4 py-3">
        //           <p className="text-xs font-bold uppercase text-slate-400">Ending</p>
        //           <p className="mt-1 text-2xl font-black text-red-600">
        //             {renewalSummary.listingsEnding +
        //               renewalSummary.ads.reduce((sum, item) => sum + item.ending, 0)}
        //           </p>
        //         </div>
        //       </div>
        //     </div>

        //     <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        //       <div className="rounded-lg border border-slate-200 bg-white p-3">
        //         <p className="text-xs font-bold uppercase text-slate-400">Vehicle Listings</p>
        //         <p className="mt-1 text-sm font-bold text-slate-900">
        //           {renewalSummary.listingsContinuing} continue, {renewalSummary.newListingSpacesAvailable} spaces left
        //         </p>
        //         <p className="mt-1 text-xs text-red-600">{renewalSummary.listingsEnding} ending</p>
        //       </div>
        //       {renewalSummary.ads.map((item) => (
        //         <div key={item.category} className="rounded-lg border border-slate-200 bg-white p-3">
        //           <p className="text-xs font-bold uppercase text-slate-400">{item.label}</p>
        //           <p className="mt-1 text-sm font-bold text-slate-900">
        //             {item.continuing} continue, {item.available} spaces left
        //           </p>
        //           <p className="mt-1 text-xs text-red-600">{item.ending} ending</p>
        //         </div>
        //       ))}
        //     </div>

        //     <div className="mt-4 flex flex-wrap gap-3">
        //       <button
        //         type="button"
        //         onClick={() => {
        //           document.querySelector("[data-renewal-review]")?.scrollIntoView({ behavior: "smooth" });
        //         }}
        //         className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
        //       >
        //         Review Listings & Ads
        //       </button>
        //       <button
        //         type="button"
        //         onClick={continueToRenewalPayment}
        //         className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        //       >
        //         {renewalActionLabel}
        //       </button>
        //     </div>
        //   </div>
        //   </div>
        // </div>
        <RenewalReviewModal
          renewalActionLabel={renewalActionLabel}
          renewalReview={renewalReview}
          renewalSummary={renewalSummary}
          renewalSelection={renewalSelection}
          closeRenewalReview={closeRenewalReview}
          continueToRenewalPayment={continueToRenewalPayment}
          toggleListingRenewal={toggleListingRenewal}
          toggleAdvertisementRenewal={toggleAdvertisementRenewal}
          setListingRenewalIds={setListingRenewalIds}
          setAdvertisementRenewalIds={setAdvertisementRenewalIds}
          addOnPlans={addOnPlans}
          selectedAddOnPlanIds={selectedAddOnPlanIds}
          toggleAddOnPlan={toggleAddOnPlan}
        />
      )}

      {plans.length > 0 && <ComparePlansTable plans={plans} />}

      <ConfirmModal
        isOpen={Boolean(selectedPlan)}
        title={selectedPlan?.renewalMode ? getSelectedActionLabel(selectedPlan) : "Confirm subscription plan"}
        message={
          selectedPlan?.renewalMode
            ? `${getSelectedActionLabel(selectedPlan)} for ${selectedPlan?.plan?.planName || "this package"} with ${selectedPlan?.selectedListingIds?.length || 0} listings continuing?`
            : `Switch to ${selectedPlan?.plan?.planName || "this plan"}? Your dealer subscription will be updated.`
        }
        confirmText={selectedPlan?.renewalMode ? getSelectedActionLabel(selectedPlan) : "Continue to Payment"}
        variant="primary"
        isLoading={isSwitchingPlan}
        onClose={() => {
          if (!isSwitchingPlan) setSelectedPlan(null);
        }}
        onConfirm={confirmSelectPlan}
      />

      <ConfirmModal
        isOpen={Boolean(renewalBlocked)}
        title="Renewal Not Available Yet"
        message={`Your current plan is active until ${
          renewalBlocked?.expiryLabel || "your current expiry date"
        }. You will be able to renew your subscription closer to the expiry date.`}
        confirmText="OK"
        variant="primary"
        hideCancel
        onClose={() => setRenewalBlocked(null)}
        onConfirm={() => setRenewalBlocked(null)}
      />
    </div>
  );
}
