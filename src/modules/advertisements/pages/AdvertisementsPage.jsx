import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  FileText,
  Megaphone,
  Monitor,
  Plus,
  Search,
  Smartphone,
  Tablet,
  Wallet,
  X,
} from "lucide-react";

import StatCard from "../../../components/ui/StatCard";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { advertisementsApi } from "../api/advertisementsApi";

const categories = {
  HOME_PAGE_BANNER: "Homepage Banner",
  LISTING_BANNER: "Listing Page Banner",
  LARGE_CATEGORY_BANNER: "Large Category Ad",
  SMALL_ADVERTISEMENT_SPACE: "Small Ad Space",
};

const devices = [
  { key: "desktop", label: "Desktop", icon: Monitor },
  { key: "tablet", label: "Tablet", icon: Tablet },
  { key: "mobile", label: "Mobile", icon: Smartphone },
];

const durationOptions = [7, 15, 30, 60, 90];

const formatCurrency = (value) => `BHD ${(Number(value) || 0).toFixed(3)}`;

const formatDate = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getTitle = (ad) => ad?.name || categories[ad?.category] || "Advertisement";

const getStatusClass = (status) => {
  if (status === "ACTIVE") return "bg-emerald-100 text-emerald-700";
  if (status === "PENDING") return "bg-amber-100 text-amber-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  if (status === "DRAFT") return "bg-slate-100 text-slate-600";
  return "bg-slate-100 text-slate-500";
};

const getTierPrice = (plan, durationDays) =>
  Number(
    plan?.pricingTiers?.find((tier) => tier.durationDays === Number(durationDays))?.price ||
      0,
  );

const FileUpload = ({ file, label, onChange }) => (
  <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center hover:border-blue-400 hover:bg-blue-50">
    <span className="text-sm font-bold text-slate-900">{label}</span>
    <span className="mt-1 text-xs text-slate-500">
      JPG, PNG, WEBP up to 5MB
    </span>
    <span className="mt-3 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-blue-600">
      {file?.name || "Choose file"}
    </span>
    <input
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      className="sr-only"
      onChange={(event) => onChange(event.target.files?.[0] || null)}
    />
  </label>
);

function CreateAdModal({ draft, onClose, onCreated }) {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    _id: draft?._id || "",
    name: draft?.name || "",
    category: draft?.category || "",
    redirectTo: draft?.redirectTo || "",
    durationDays: draft?.durationDays || 30,
    paymentMethod: "card",
    creatives: { desktop: null, tablet: null, mobile: null },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState(null);
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.allSettled([advertisementsApi.getPlans(), advertisementsApi.getWallet()])
      .then(([plansResult, walletResult]) => {
        if (!active) return;
        if (plansResult.status === "rejected") throw plansResult.reason;

        const data = plansResult.value || [];
        const activePlans = (data || []).filter((plan) => plan.status === "ACTIVE");
        setPlans(activePlans);
        if (walletResult.status === "fulfilled") {
          setWallet(walletResult.value || null);
        }
        if (!form.category && activePlans[0]) {
          setForm((current) => ({ ...current, category: activePlans[0].category }));
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || "Unable to load advertisement plans");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPlan = plans.find((plan) => plan.category === form.category);
  const price = getTierPrice(selectedPlan, form.durationDays);
  const vat = Number((price * 0.05).toFixed(3));
  const total = Number((price + vat).toFixed(3));
  const walletBalance = Number(wallet?.balance || 0);
  const walletAmountUsed = useWalletBalance ? Math.min(walletBalance, total) : 0;
  const onlineAmountDue = Math.max(0, total - walletAmountUsed);

  const setCreative = (device, file) => {
    setForm((current) => ({
      ...current,
      creatives: { ...current.creatives, [device]: file },
    }));
  };

  const validate = () => {
    if (!form.category) return "Choose advertisement placement.";
    if (!form.name.trim()) return "Advertisement name is required.";
    if (!form.redirectTo.trim()) return "Redirect URL is required.";
    if (!price) return "Pricing is not configured for this duration.";
    const missing = devices.find((device) => !form.creatives[device.key] && !draft?.creatives?.[device.key]?.url);
    if (missing) return `${missing.label} creative is required.`;
    return "";
  };

  const handleSave = async (isDraft) => {
    const validationError = isDraft ? "" : validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = {
        ...form,
        paymentMethod: useWalletBalance ? "wallet" : form.paymentMethod,
        useWalletBalance,
        currentStep: isDraft ? 3 : 7,
      };
      const result = isDraft
        ? await advertisementsApi.saveDraft(payload)
        : form._id
          ? await advertisementsApi.submitDraft(form._id, payload)
          : await advertisementsApi.create(payload);

      if (result?.payment?.redirectUrl) {
        window.location.assign(result.payment.redirectUrl);
        return;
      }

      onCreated(result?.advertisement || result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save advertisement",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-3 py-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              {draft ? "Continue Advertisement" : "Create Advertisement"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload desktop, tablet, and mobile creatives for review.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
          >
            <X size={18} />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="py-16 text-center text-sm font-semibold text-slate-400">
              Loading advertisement plans...
            </p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="space-y-5">
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {error}
                  </div>
                ) : null}

                <section>
                  <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">
                    Placement
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {plans.map((plan) => {
                      const active = form.category === plan.category;
                      return (
                        <button
                          key={plan._id}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, category: plan.category }))}
                          className={`rounded-xl border p-4 text-left ${
                            active ? "border-blue-600 bg-blue-50" : "border-slate-200"
                          }`}
                        >
                          <p className="font-bold text-slate-950">
                            {categories[plan.category] || plan.category}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {plan.description || "Advertisement placement"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">Ad Name</span>
                    <input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
                      placeholder="Summer showroom offer"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">Redirect URL</span>
                    <input
                      value={form.redirectTo}
                      onChange={(event) => setForm((current) => ({ ...current, redirectTo: event.target.value }))}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
                      placeholder="https://example.com"
                    />
                  </label>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">
                    Creative Assets
                  </h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    {devices.map((device) => (
                      <FileUpload
                        key={device.key}
                        label={`${device.label} creative`}
                        file={form.creatives[device.key]}
                        onChange={(file) => setCreative(device.key, file)}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">
                    Duration
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {durationOptions.map((days) => {
                      const active = Number(form.durationDays) === days;
                      return (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, durationDays: days }))}
                          className={`rounded-xl border px-3 py-3 text-center ${
                            active ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="block font-bold">{days} days</span>
                          <span className="mt-1 block text-xs">
                            {formatCurrency(getTierPrice(selectedPlan, days))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              <aside className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-black text-slate-950">Payment Summary</h3>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Placement</span>
                    <span className="text-right font-bold text-slate-900">
                      {categories[form.category] || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-bold">{form.durationDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ad Fee</span>
                    <span className="font-bold">{formatCurrency(price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">VAT (5%)</span>
                    <span className="font-bold">{formatCurrency(vat)}</span>
                  </div>
                </div>
                <div className="mt-5 rounded-xl bg-blue-600 p-4 text-white">
                  <p className="text-sm font-semibold opacity-80">Total Due</p>
                  <p className="mt-1 text-2xl font-black">{formatCurrency(total)}</p>
                </div>
                <label className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white px-3 py-3">
                  <span>
                    <span className="block text-xs font-bold text-slate-900">
                      Use wallet balance
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                      Available {formatCurrency(walletBalance)}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={useWalletBalance}
                    disabled={walletBalance <= 0}
                    onChange={(event) => setUseWalletBalance(event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600"
                  />
                </label>
                {useWalletBalance ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Wallet used</span>
                      <span className="font-bold text-blue-600">
                        - {formatCurrency(walletAmountUsed)}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-slate-600">
                      <span>Pay remaining</span>
                      <span className="font-bold text-slate-950">
                        {formatCurrency(onlineAmountDue)}
                      </span>
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>
          )}
        </main>

        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? "Submitting..." : "Submit for Review"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function AdvertisementsPage() {
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalViews: 0,
    totalSpent: 0,
  });
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [modalDraft, setModalDraft] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [endAdId, setEndAdId] = useState("");
  const [isEndingAd, setIsEndingAd] = useState(false);

  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await advertisementsApi.getSummary();
      setStats(data.stats || {});
      setAds(data.ads || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertisements();
  }, []);

  const filteredAds = useMemo(
    () =>
      ads.filter((ad) => {
        const matchesStatus = status === "ALL" || ad.status === status;
        const haystack = [ad.name, ad.advertisementId, ad.categoryLabel, categories[ad.category]]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesStatus && haystack.includes(query.toLowerCase());
      }),
    [ads, query, status],
  );

  const handleEnd = async () => {
    if (!endAdId) return;

    try {
      setIsEndingAd(true);
      const updated = await advertisementsApi.endAd(endAdId);
      const ad = updated.ad || updated;
      setAds((prev) => prev.map((item) => (item._id === ad._id ? ad : item)));
      setEndAdId("");
    } finally {
      setIsEndingAd(false);
    }
  };

  const handleCreated = (ad) => {
    setShowModal(false);
    setModalDraft(null);
    setAds((items) => {
      const exists = items.some((item) => item._id === ad._id);
      return exists
        ? items.map((item) => (item._id === ad._id ? ad : item))
        : [ad, ...items];
    });
    loadAdvertisements();
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading advertisements...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Advertising Manager</h1>
          <p className="mt-1 text-sm text-slate-500">Create and track dealer ad campaigns.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setModalDraft(null);
            setShowModal(true);
          }}
          className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Create Ad
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <StatCard icon={Megaphone} value={stats.activeCampaigns || 0} label="Active Campaigns" iconBg="bg-blue-100 text-blue-600" />
        <StatCard icon={FileText} value={stats.pendingCampaigns || 0} label="Pending Review" iconBg="bg-amber-100 text-amber-600" />
        <StatCard icon={Eye} value={(stats.totalViews || 0).toLocaleString()} label="Total Views" iconBg="bg-violet-100 text-violet-600" />
        <StatCard icon={Wallet} value={formatCurrency(stats.totalSpent || 0)} label="Total Spent" iconBg="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-lg font-bold text-slate-950">My Ads</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ads"
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 outline-none"
            >
              {["ALL", "DRAFT", "PENDING", "ACTIVE", "REJECTED", "INACTIVE"].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAds.map((ad) => (
            <div key={ad._id} className="py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (ad.status === "DRAFT") {
                      setModalDraft(ad);
                      setShowModal(true);
                    }
                  }}
                  className="min-w-0 text-left"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {ad.status === "DRAFT" ? (
                      <span className="text-base font-bold text-slate-950">{getTitle(ad)}</span>
                    ) : (
                      <Link
                        to={`/advertisements/${ad._id}`}
                        className="text-base font-bold text-slate-950 hover:text-blue-600"
                      >
                        {getTitle(ad)}
                      </Link>
                    )}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(ad.status)}`}>
                      {ad.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {categories[ad.category] || ad.categoryLabel || "Advertisement"} - {ad.durationDays || 0} days
                  </p>
                  {ad.rejectionReason ? (
                    <p className="mt-2 text-sm font-semibold text-red-600">{ad.rejectionReason}</p>
                  ) : null}
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  {ad.status === "DRAFT" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setModalDraft(ad);
                        setShowModal(true);
                      }}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                    >
                      Continue
                    </button>
                  ) : (
                    <Link
                      to={`/advertisements/${ad._id}`}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:text-blue-600"
                    >
                      Details
                    </Link>
                  )}
                  {["ACTIVE", "PENDING"].includes(ad.status) ? (
                    <button
                      type="button"
                      onClick={() => setEndAdId(ad._id)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600"
                    >
                      End
                    </button>
                  ) : null}
                </div>
              </div>

              {ad.status !== "DRAFT" ? (
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span>Views: {(ad.viewCount || 0).toLocaleString()}</span>
                  <span>Starts: {formatDate(ad.startsAt || ad.createdAt)}</span>
                  <span>Ends: {formatDate(ad.endsAt)}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(ad.totalAmount || ad.price)}</span>
                </div>
              ) : null}
            </div>
          ))}

          {filteredAds.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No advertisements found
            </p>
          ) : null}
        </div>
      </div>

      {showModal ? (
        <CreateAdModal
          draft={modalDraft}
          onClose={() => {
            setShowModal(false);
            setModalDraft(null);
          }}
          onCreated={handleCreated}
        />
      ) : null}

      <ConfirmModal
        isOpen={Boolean(endAdId)}
        title="End ad campaign"
        message="End this ad campaign? It will stop showing in active placements."
        confirmText="End Campaign"
        isLoading={isEndingAd}
        onClose={() => {
          if (!isEndingAd) setEndAdId("");
        }}
        onConfirm={handleEnd}
      />
    </div>
  );
}
