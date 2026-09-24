import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Monitor,
  Pencil,
  Plus,
  Search,
  Shield,
  Smartphone,
  Tablet,
  Wallet,
  X,
} from "lucide-react";

import StatCard from "../../../components/ui/StatCard";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import useAuth from "../../auth/hooks/useAuth";
import { getDealerProfileMasterOptionsApi } from "../../listings/api/catalogApi";
import {
  clearPendingPaymentRedirect,
  getPendingPaymentRedirect,
  redirectToPaymentUrl,
} from "../../payment/paymentPopup";
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

const fallbackBusinessCategoryOptions = [
  { code: "CAR_DEALERS_SHOWROOMS", label: "Car Dealers / Showrooms" },
  { code: "MOTORCYCLE_DEALERS", label: "Motorcycle Dealers" },
  { code: "COMMERCIAL_VEHICLE_DEALERS", label: "Commercial Vehicle Dealers" },
  { code: "HEAVY_EQUIPMENT_DEALERS", label: "Heavy Equipment Dealers" },
  { code: "BUGGY_ATV_DEALERS", label: "Buggy / ATV Dealers" },
  { code: "CARAVAN_MOTORHOME_DEALERS", label: "Caravan / Motorhome Dealers" },
  { code: "VEHICLE_RENTAL_COMPANIES", label: "Vehicle Rental Companies" },
  { code: "HEAVY_EQUIPMENT_RENTAL_COMPANIES", label: "Heavy Equipment Rental Companies" },
  { code: "SPARE_PARTS_ACCESSORIES", label: "Spare Parts & Accessories" },
  { code: "TYRE_SHOPS", label: "Tyre Shops" },
  { code: "BATTERY_SHOPS", label: "Battery Shops" },
  { code: "GARAGES_AUTO_REPAIR", label: "Garages / Auto Repair" },
  { code: "VEHICLE_SERVICE_CENTRES", label: "Vehicle Service Centres" },
  { code: "CAR_WASH_DETAILING", label: "Car Wash & Detailing" },
  { code: "CAR_CARE_POLISHING_CERAMIC", label: "Car Care / Polishing / Ceramic Coating" },
  { code: "AUTO_ELECTRICAL_SERVICES", label: "Auto Electrical Services" },
  { code: "VEHICLE_AC_SERVICES", label: "Vehicle AC Services" },
  { code: "VEHICLE_INSURANCE", label: "Vehicle Insurance" },
  { code: "VEHICLE_FINANCE_AUTO_LOANS", label: "Vehicle Finance / Auto Loans" },
  { code: "TOWING_ROADSIDE_ASSISTANCE", label: "Towing & Roadside Assistance" },
  { code: "VEHICLE_RECOVERY_TRANSPORT", label: "Vehicle Recovery / Transport Services" },
  { code: "CAR_MODIFICATION_ACCESSORIES", label: "Car Modification & Accessories" },
  { code: "OTHER_AUTOMOTIVE_BUSINESS", label: "Other Automotive Business" },
];

const gccCountries = [
  { iso2: "BH", name: "Bahrain", dial: "+973" },
  { iso2: "SA", name: "Saudi Arabia", dial: "+966" },
  { iso2: "AE", name: "United Arab Emirates", dial: "+971" },
  { iso2: "QA", name: "Qatar", dial: "+974" },
  { iso2: "KW", name: "Kuwait", dial: "+965" },
  { iso2: "OM", name: "Oman", dial: "+968" },
];

const mobileNationalMaxLengths = {
  AE: 9,
  BH: 8,
  KW: 8,
  OM: 8,
  QA: 8,
  SA: 9,
};

const getCountryPhoneMeta = (countryIso = "BH") =>
  gccCountries.find((country) => country.iso2 === countryIso) || gccCountries[0];

const getCallingCode = (countryIso) => getCountryPhoneMeta(countryIso).dial;

const getMobileMaxLength = (countryIso) =>
  mobileNationalMaxLengths[countryIso] || 15;

const normalizePhoneInput = (phone, countryIso) =>
  String(phone || "")
    .replace(/\D/g, "")
    .slice(0, getMobileMaxLength(countryIso));

const getLocalPhoneDigits = (value, countryIso) => {
  const dialDigits = getCallingCode(countryIso).replace(/\D/g, "");
  const digits = String(value || "").replace(/\D/g, "");
  const localDigits = digits.startsWith(dialDigits)
    ? digits.slice(dialDigits.length)
    : digits;

  return normalizePhoneInput(localDigits, countryIso);
};

const buildPhoneContact = (countryIso, phone) =>
  `${getCallingCode(countryIso)} ${normalizePhoneInput(phone, countryIso)}`.trim();

const validateCountryPhone = (value, countryIso, label) => {
  const localDigits = getLocalPhoneDigits(value, countryIso);
  const expectedLength = getMobileMaxLength(countryIso);

  if (!localDigits) return `${label} is required`;
  if (localDigits.length !== expectedLength) {
    return `${label} must be ${expectedLength} digits for ${getCallingCode(countryIso)}`;
  }

  return "";
};

const formatCurrency = (value, currency = "BHD") => `${currency} ${(Number(value) || 0).toFixed(3)}`;

const formatCtr = (clicks, views) => {
  const numericViews = Number(views || 0);
  if (numericViews <= 0) return "0.00%";
  return `${((Number(clicks || 0) / numericViews) * 100).toFixed(2)}%`;
};

const normalizeWizardStep = (step) => {
  const numericStep = Number(step || 1);

  if (numericStep <= 3) return numericStep;
  if (numericStep === 4) return 4;
  if (numericStep === 5) return 4;
  if (numericStep === 6) return 6;
  return 6;
};

const wizardSteps = [
  "Package",
  "Creative",
  "Settings",
  "Review",
  "Payment",
  "Done",
];

const placementMeta = [
  {
    category: "HOME_PAGE_BANNER",
    title: "Homepage Banner",
    label: "Highest Visibility",
    labelClass: "bg-blue-50 text-blue-600",
    description:
      "Prime visibility at the very top of the GulfInCart homepage. Seen by every visitor the moment they land on the site.",
    dimensions: "1440 x 200 px",
    previewImageUrl:
      "https://gulfincart-dev.s3.ap-south-1.amazonaws.com/ui/ads-form/homepage-banner-preview.png",
  },
  {
    category: "LISTING_BANNER",
    title: "Listing Page Banner",
    label: "High Intent",
    labelClass: "bg-emerald-50 text-emerald-600",
    description:
      "Displayed inside active vehicle listing pages. Reaches buyers who are already browsing and ready to purchase.",
    dimensions: "728 x 90 px",
    previewImageUrl:
      "https://gulfincart-dev.s3.ap-south-1.amazonaws.com/ui/ads-form/listingpage-banner-preview.png",
  },
  {
    category: "LARGE_CATEGORY_BANNER",
    title: "Large Category Ad",
    label: "Broad Reach",
    labelClass: "bg-purple-50 text-purple-600",
    description:
      "Featured prominently in category and search results pages. Captures high-volume browse traffic across all categories.",
    dimensions: "300 x 250 px",
    previewImageUrl:
      "https://gulfincart-dev.s3.ap-south-1.amazonaws.com/ui/ads-form/large-category-ads-preview.png",
  },
  {
    category: "SMALL_ADVERTISEMENT_SPACE",
    title: "Small Ad Space",
    label: "Cost Effective",
    labelClass: "bg-orange-50 text-orange-600",
    description:
      "Sidebar and inline card slots across the platform. Ideal for sustained brand presence at an accessible price point.",
    dimensions: "160 x 600 px",
    previewImageUrl:
      "https://gulfincart-dev.s3.ap-south-1.amazonaws.com/ui/ads-form/small-ad-sapace-preview.png",
  },
];

const formatDate = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getTitle = (ad) =>
  ad?.name ||
  ad?.bundleSlotLabel ||
  ad?.bundleNameSnapshot ||
  categories[ad?.category] ||
  "Advertisement";

const isPaidBundleSlotDraft = (ad) =>
  ad?.status === "DRAFT" && ad?.bundleParentAdvertisement && ad?.paymentStatus === "PAID";

const getBundleParentKey = (ad) =>
  String(ad?.bundleParentAdvertisement?._id || ad?.bundleParentAdvertisement || "");

const getBundleSlotLabel = (ad) =>
  ad?.bundleSlotLabel || categories[ad?.category] || ad?.categoryLabel || "Advertisement";

const groupRemainingBundleDrafts = (ads = []) => {
  const groups = new Map();

  ads.filter(isPaidBundleSlotDraft).forEach((ad) => {
    const key = getBundleParentKey(ad) || ad._id;
    const group = groups.get(key) || {
      key,
      name: ad.bundleNameSnapshot || "Promotion Bundle",
      slots: [],
    };

    group.slots.push(ad);
    groups.set(key, group);
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    slots: group.slots.sort(
      (first, second) => Number(first.bundleSlotIndex || 0) - Number(second.bundleSlotIndex || 0),
    ),
  }));
};

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

const getMostPopularDuration = (pricingTiers = []) =>
  pricingTiers.find((tier) => tier.isMostPopular)?.durationDays || 30;

const getBundlePrice = (bundle) => Number(bundle?.bundlePrice || 0);

const getBundleSlotsFromItems = (bundle) => {
  const slots = [];

  (bundle?.items || []).forEach((item) => {
    const quantity = Math.max(1, Number(item.quantity || 1));

    for (let index = 1; index <= quantity; index += 1) {
      slots.push({
        slotIndex: slots.length + 1,
        category: item.category,
        categoryLabel: item.categoryLabel || categories[item.category] || "Advertisement",
        name: "",
        redirectTo: "",
        details: {
          businessName: "",
          businessCategoryCode: "",
          countryIso: "",
          callPhone: "",
          whatsappPhone: "",
        },
        creatives: { desktop: null, tablet: null, mobile: null },
        existingCreatives: {},
        isComplete: false,
      });
    }
  });

  return slots;
};

const hydrateBundleSlots = ({ bundle, draft, fallbackDetails }) => {
  const slots = getBundleSlotsFromItems(bundle);
  const draftSlots = draft?.bundleSlotDrafts || [];

  return slots.map((slot) => {
    const draftSlot = draftSlots.find(
      (item) => Number(item.slotIndex || 0) === Number(slot.slotIndex),
    );

    if (!draftSlot) {
      return {
        ...slot,
        details: { ...fallbackDetails },
      };
    }

    return {
      ...slot,
      name: draftSlot.name || "",
      redirectTo: draftSlot.redirectTo || "",
      details: {
        ...fallbackDetails,
        ...(draftSlot.details || {}),
      },
      creatives: { desktop: null, tablet: null, mobile: null },
      existingCreatives: draftSlot.creatives || {},
      isComplete: Boolean(draftSlot.isComplete),
    };
  });
};

const hasBundleSlotCreative = (slot, deviceKey) =>
  Boolean(slot.creatives?.[deviceKey] || slot.existingCreatives?.[deviceKey]?.url);

const getBundleSlotMissingFields = (slot, accountCountryIso) => {
  const missing = [];
  if (!slot.name?.trim()) missing.push("name");
  if (!slot.details?.businessName?.trim()) missing.push("business name");
  if (!slot.details?.businessCategoryCode) missing.push("business category");
  if (validateCountryPhone(slot.details?.callPhone, accountCountryIso, "Call phone number")) {
    missing.push("call number");
  }
  if (validateCountryPhone(slot.details?.whatsappPhone, accountCountryIso, "WhatsApp number")) {
    missing.push("WhatsApp number");
  }
  devices.forEach((device) => {
    if (!hasBundleSlotCreative(slot, device.key)) {
      missing.push(`${device.label.toLowerCase()} creative`);
    }
  });

  return missing;
};

const isBundleSlotComplete = (slot, accountCountryIso) =>
  getBundleSlotMissingFields(slot, accountCountryIso).length === 0;

const isLaunchOfferActiveForDuration = (launchOffer, durationDays) => {
  if (!launchOffer?.enabled) return false;
  if (Number(launchOffer.triggerDurationDays || 30) !== Number(durationDays)) return false;

  const now = Date.now();
  if (launchOffer.validFrom && new Date(launchOffer.validFrom).getTime() > now) return false;
  if (launchOffer.validUntil && new Date(launchOffer.validUntil).getTime() < now) return false;

  return Number(launchOffer.freeAdditionalDays || 0) > 0;
};

const getTaxMeta = (plan) => {
  const taxName = plan?.taxName || "VAT";
  const percentage = plan?.vatEnabled ? Number(plan.vatPercentage || 0) : 0;

  return {
    taxName,
    percentage,
    label: plan?.vatEnabled ? `${taxName} (${percentage}%)` : taxName,
  };
};

const getPlacementMeta = (category) =>
  placementMeta.find((placement) => placement.category === category) ||
  placementMeta[0];

const getBenefitStatus = (planAdBenefits, category) => {
  const benefit = planAdBenefits?.[category];
  const included = Number(benefit?.included || 0);
  const used = Number(benefit?.used || 0);
  const remaining = Number(benefit?.remaining || 0);

  if (remaining > 0) {
    return {
      benefit,
      included,
      used,
      remaining,
      isAvailable: true,
      label: `${remaining} included left`,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (included > 0) {
    return {
      benefit,
      included,
      used,
      remaining,
      isAvailable: false,
      label: `Included used ${used}/${included}`,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    benefit,
    included,
    used,
    remaining,
    isAvailable: false,
    label: "Paid placement",
    className: "border-slate-200 bg-slate-50 text-slate-500",
  };
};

const objectUrlCache = new WeakMap();

const getObjectUrl = (file) => {
  if (!file) return "";
  if (file.url) return file.url;
  if (!objectUrlCache.has(file)) {
    objectUrlCache.set(file, URL.createObjectURL(file));
  }
  return objectUrlCache.get(file);
};

const WizardProgress = ({ step }) => (
  <div className="border-b border-slate-100 px-3 py-2 lg:px-5">
    <div
      className="grid items-start gap-1.5"
      style={{ gridTemplateColumns: `repeat(${wizardSteps.length}, minmax(0, 1fr))` }}
    >
      {wizardSteps.map((item, index) => {
        const stepNumber = index + 1;
        const completed = stepNumber < step;
        const active = stepNumber === step;

        return (
          <div key={item} className="relative flex flex-col items-center">
            {index > 0 ? (
              <span
                className={`absolute right-1/2 top-3 h-0.5 w-full ${
                  completed || active ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            ) : null}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                completed
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-400"
              }`}
            >
              {completed ? <Check size={14} /> : stepNumber}
            </span>
            <span
              className={`mt-1 hidden text-[10px] font-semibold sm:block ${
                completed ? "text-emerald-500" : active ? "text-blue-600" : "text-slate-400"
              }`}
            >
              {item}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

const PlacementSketch = ({ placement }) => (
  <div className="overflow-hidden rounded-xl bg-slate-50 p-2">
    <div className="h-[180px] overflow-hidden rounded-lg bg-white ring-1 ring-slate-100">
      <img
        src={placement.previewImageUrl}
        alt={`${placement.title} preview`}
        className="h-full w-full object-cover"
      />
    </div>
  </div>
);

const CountryFlagMark = ({ countryIso }) => (
  <span
    aria-hidden="true"
    className="h-4 w-6 shrink-0 rounded-sm bg-cover bg-center ring-1 ring-slate-200"
    style={{ backgroundImage: `url(https://flagcdn.com/w40/${String(countryIso || "BH").toLowerCase()}.png)` }}
  />
);

const LockedCountryPhoneField = ({
  countryIso,
  disabled = false,
  error = "",
  onChange,
  value,
}) => {
  const effectiveCountryIso = countryIso || "BH";
  const country = getCountryPhoneMeta(effectiveCountryIso);
  const localPhone = getLocalPhoneDigits(value, effectiveCountryIso);

  return (
    <div className="space-y-1.5">
      <div className="grid gap-2 min-[420px]:grid-cols-[175px_1fr]">
        <button
          type="button"
          disabled
          className={`flex h-10 items-center justify-between gap-2 rounded-xl border bg-slate-50 px-3 text-left text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-80 ${
            error ? "border-red-300" : "border-slate-200"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CountryFlagMark countryIso={country.iso2} />
            <span className="shrink-0">{country.dial}</span>
          </span>
        </button>
        <input
          type="tel"
          inputMode="numeric"
          value={localPhone}
          disabled={disabled}
          onChange={(event) =>
            onChange(buildPhoneContact(effectiveCountryIso, event.target.value))
          }
          maxLength={getMobileMaxLength(effectiveCountryIso)}
          placeholder="77677543"
          className={`h-10 rounded-xl border px-4 text-xs outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-slate-200 focus:ring-slate-100"
          }`}
        />
      </div>
      <p className={`text-xs font-medium ${error ? "text-red-600" : "text-slate-500"}`}>
        {error || `Uses your account country code ${country.dial}.`}
      </p>
    </div>
  );
};

const FileUpload = ({ file, label, onChange, existingUrl = "" }) => {
  const previewUrl = getObjectUrl(file) || existingUrl;

  return (
    <label className="flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center hover:border-blue-300 hover:bg-blue-50/40">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={`${label} preview`}
          className="mb-3 h-16 w-28 rounded-xl object-cover ring-1 ring-slate-200"
        />
      ) : (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
          <ImageIcon size={21} />
        </span>
      )}
      <span className="text-sm font-bold text-slate-950">
        Drag & drop your {label} here
      </span>
      <span className="mt-1 text-xs font-medium text-slate-500">
        or click to browse files
      </span>
      <span className="mt-3 rounded-lg bg-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500">
        JPG - PNG - WEBP - Max 5MB
      </span>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
    </label>
  );
};

const SummaryPanel = ({
  placement,
  durationDays,
  price,
  isIncludedWithPlan,
  currency,
  taxMeta,
  packageType,
  selectedBundle,
  freeAdditionalDays,
}) => {
  const vat = Number(((Number(price || 0) * taxMeta.percentage) / 100).toFixed(3));
  const total = Number((Number(price || 0) + vat).toFixed(3));
  const isBundle = packageType === "BUNDLE";

  return (
    <aside className="hidden w-[250px] shrink-0 border-l border-slate-100 bg-white px-5 py-4 lg:block">
      <h3 className="text-sm font-black text-slate-950">Order Summary</h3>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-400">
        Dealer advertisement
      </div>
      {isIncludedWithPlan ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
          Included with dealer plan
        </div>
      ) : null}
      <div className="mt-5 space-y-3 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">{isBundle ? "Bundle" : "Placement"}</span>
          <span className="text-right font-bold text-slate-950">
            {isBundle ? selectedBundle?.name || "Promotion Bundle" : placement.title}
          </span>
        </div>
        {isBundle ? (
          <div className="space-y-1 rounded-lg bg-white p-2">
            {(selectedBundle?.items || []).map((item) => (
              <div key={item.category} className="flex justify-between gap-2 text-[11px]">
                <span className="text-slate-500">{item.categoryLabel}</span>
                <span className="font-bold text-slate-700">x{item.quantity}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-slate-500">Duration</span>
          <span className="font-bold text-slate-950">
            {isIncludedWithPlan ? "Until plan expiry" : `${durationDays} Days`}
          </span>
        </div>
        {freeAdditionalDays > 0 ? (
          <div className="flex justify-between">
            <span className="text-emerald-600">Launch Offer</span>
            <span className="font-bold text-emerald-700">+ {freeAdditionalDays} Days Free</span>
          </div>
        ) : null}
        {isBundle ? (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500">Original</span>
              <span className="font-bold text-slate-400 line-through">
                {formatCurrency(selectedBundle?.originalPrice, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Savings</span>
              <span className="font-bold text-emerald-700">
                {formatCurrency(selectedBundle?.savings, currency)}
              </span>
            </div>
          </>
        ) : null}
        <div className="flex justify-between">
          <span className="text-slate-500">Ad Fee</span>
          <span className="font-bold text-slate-950">{formatCurrency(price, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">{taxMeta.label}</span>
          <span className="text-slate-400">{formatCurrency(vat, currency)}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
        <span className="font-bold text-blue-600">Total</span>
        <span className="text-lg font-black text-blue-600">{formatCurrency(total, currency)}</span>
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Estimated Reach</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">Daily impressions</span>
          <span className="font-bold text-slate-950">~9,800 / day</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">Avg. CTR</span>
          <span className="font-bold text-blue-600">3.6%</span>
        </div>
      </div>
    </aside>
  );
};

function CreateAdModal({ draft, onClose, onCreated, planAdBenefits = {} }) {
  const isBundleSlot = Boolean(draft?.bundleParentAdvertisement);
  const minimumStep = isBundleSlot ? 2 : 1;
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [promotionSettings, setPromotionSettings] = useState({
    bundles: [],
    launchOffer: null,
    promotionsAvailable: false,
  });
  const [form, setForm] = useState({
    _id: draft?._id || "",
    name: draft?.name || "",
    packageType: draft?.packageType || (draft?.bundleCode ? "BUNDLE" : "INDIVIDUAL"),
    bundleCode: draft?.bundleCode || "",
    category: draft?.category || "",
    redirectTo: draft?.redirectTo || "",
    durationDays: draft?.durationDays || 30,
    paymentMethod: "card",
    details: {
      businessName: draft?.details?.businessName || "",
      businessCategoryCode: draft?.details?.businessCategoryCode || "",
      countryIso: draft?.details?.countryIso || "",
      callPhone: draft?.details?.callPhone || draft?.details?.phones?.[0] || "",
      whatsappPhone: draft?.details?.whatsappPhone || draft?.details?.phones?.[1] || "",
    },
    creatives: { desktop: null, tablet: null, mobile: null },
  });
  const [bundleSlots, setBundleSlots] = useState([]);
  const [activeBundleSlotIndex, setActiveBundleSlotIndex] = useState(0);
  const [businessCategoryOptions, setBusinessCategoryOptions] = useState(
    fallbackBusinessCategoryOptions,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState(null);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState(
    draft?.paymentMethod === "DEALER_PLAN" ? "BENEFIT" : "PAID",
  );
  const [step, setStep] = useState(
    Math.max(
      minimumStep,
      Math.min(normalizeWizardStep(draft?.currentStep || minimumStep), wizardSteps.length),
    ),
  );

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      advertisementsApi.getPlans(),
      advertisementsApi.getPromotions(),
      advertisementsApi.getWallet(),
    ])
      .then(([plansResult, promotionsResult, walletResult]) => {
        if (!active) return;
        if (plansResult.status === "rejected") throw plansResult.reason;

        const data = plansResult.value || [];
        const activePlans = (data || []).filter((plan) => plan.status === "ACTIVE");
        setPlans(activePlans);
        if (promotionsResult.status === "fulfilled") {
          setPromotionSettings(promotionsResult.value || {
            bundles: [],
            launchOffer: null,
            promotionsAvailable: false,
          });
        }
        if (walletResult.status === "fulfilled") {
          setWallet(walletResult.value || null);
        }
        if (!form.category && form.packageType !== "BUNDLE" && activePlans[0]) {
          setForm((current) => ({
            ...current,
            category: activePlans[0].category,
            durationDays: getMostPopularDuration(activePlans[0].pricingTiers),
          }));
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

  useEffect(() => {
    let active = true;

    const loadBusinessCategories = async () => {
      try {
        const options = await getDealerProfileMasterOptionsApi({
          key: "businessCategory",
          isActive: true,
        });

        if (!active || !options?.length) return;

        setBusinessCategoryOptions(
          options.map((option) => ({
            code: option.value,
            label: option.label,
          })),
        );
      } catch {
        if (active) {
          setBusinessCategoryOptions(fallbackBusinessCategoryOptions);
        }
      }
    };

    loadBusinessCategories();

    return () => {
      active = false;
    };
  }, []);

  const selectedPlan = plans.find((plan) => plan.category === form.category);
  const selectedPlacement = getPlacementMeta(form.category);
  const accountCountryIso = user?.countryIso || form.details.countryIso || "BH";
  const selectedBundle = (promotionSettings.bundles || []).find(
    (bundle) => bundle.code === form.bundleCode,
  );
  const isBundlePackage = form.packageType === "BUNDLE";
  const isIncludedBundleSlot = isBundleSlot && !isBundlePackage;
  const selectedCurrency = isBundlePackage
    ? selectedBundle?.currency || "BHD"
    : selectedPlan?.currency || "BHD";
  const taxMeta = isBundlePackage
    ? {
        taxName: selectedBundle?.taxName || "VAT",
        percentage: selectedBundle?.vatEnabled ? Number(selectedBundle.vatPercentage || 0) : 0,
        label: selectedBundle?.vatEnabled
          ? `${selectedBundle?.taxName || "VAT"} (${Number(selectedBundle.vatPercentage || 0)}%)`
          : selectedBundle?.taxName || "VAT",
      }
    : getTaxMeta(selectedPlan);
  const price = isBundlePackage
    ? getBundlePrice(selectedBundle)
    : getTierPrice(selectedPlan, form.durationDays);
  const selectedPlanBenefit = planAdBenefits[form.category];
  const hasSelectedPlanBenefit = Number(selectedPlanBenefit?.remaining || 0) > 0;
  const isIncludedWithPlan =
    purchaseMode === "BENEFIT" &&
    !isBundlePackage &&
    !isIncludedBundleSlot &&
    hasSelectedPlanBenefit;
  const effectivePrice = isIncludedWithPlan || isIncludedBundleSlot ? 0 : price;
  const vat = Number(((effectivePrice * taxMeta.percentage) / 100).toFixed(3));
  const total = Number((effectivePrice + vat).toFixed(3));
  const launchOfferDuration = isBundlePackage
    ? selectedBundle?.baseDurationDays || 30
    : form.durationDays;
  const launchOfferActive =
    !isBundlePackage &&
    !isIncludedWithPlan &&
    isLaunchOfferActiveForDuration(
      promotionSettings.launchOffer,
      launchOfferDuration,
    );
  const freeAdditionalDays = launchOfferActive
    ? Number(promotionSettings.launchOffer?.freeAdditionalDays || 0)
    : 0;
  const progress = Math.round((step / wizardSteps.length) * 100);
  const walletBalance = Number(wallet?.balance || 0);
  const walletAmountUsed = useWalletBalance && !isIncludedWithPlan ? Math.min(walletBalance, total) : 0;
  const onlineAmountDue = Math.max(0, total - walletAmountUsed);
  const callPhoneError = validateCountryPhone(
    form.details.callPhone,
    accountCountryIso,
    "Call phone number",
  );
  const whatsappPhoneError = validateCountryPhone(
    form.details.whatsappPhone,
    accountCountryIso,
    "WhatsApp number",
  );
  const formWithAccountCountry = {
    ...form,
    details: {
      ...form.details,
      countryIso: accountCountryIso,
      callPhone: buildPhoneContact(
        accountCountryIso,
        getLocalPhoneDigits(form.details.callPhone, accountCountryIso),
      ),
      whatsappPhone: buildPhoneContact(
        accountCountryIso,
        getLocalPhoneDigits(form.details.whatsappPhone, accountCountryIso),
      ),
    },
  };
  const activeBundleSlot = bundleSlots[activeBundleSlotIndex] || bundleSlots[0] || null;
  const completedBundleSlots = bundleSlots.filter((slot) =>
    isBundleSlotComplete(slot, accountCountryIso),
  ).length;
  const incompleteBundleSlots = isBundlePackage
    ? bundleSlots.length - completedBundleSlots
    : 0;
  const availableDealerBenefits = placementMeta
    .map((placement) => ({
      placement,
      plan: plans.find((item) => item.category === placement.category),
      status: getBenefitStatus(planAdBenefits, placement.category),
    }))
    .filter(({ status }) => status.isAvailable);

  useEffect(() => {
    if (!selectedBundle) {
      setBundleSlots([]);
      setActiveBundleSlotIndex(0);
      return;
    }

    setBundleSlots((current) => {
      if (
        current.length &&
        current.every((slot) =>
          (selectedBundle.items || []).some((item) => item.category === slot.category),
        )
      ) {
        return current;
      }

      return hydrateBundleSlots({
        bundle: selectedBundle,
        draft,
        fallbackDetails: form.details,
      });
    });
    setActiveBundleSlotIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBundle?.code]);

  const setCreative = (device, file) => {
    setForm((current) => ({
      ...current,
      creatives: { ...current.creatives, [device]: file },
    }));
  };

  const setBundleSlotCreative = (slotIndex, device, file) => {
    setBundleSlots((current) =>
      current.map((slot, index) =>
        index === slotIndex
          ? {
              ...slot,
              creatives: { ...slot.creatives, [device]: file },
            }
          : slot,
      ),
    );
  };

  const setDetailsField = (field, value) => {
    setForm((current) => ({
      ...current,
      details: {
        ...current.details,
        [field]: value,
      },
    }));
  };

  const setBundleSlotField = (slotIndex, field, value) => {
    setBundleSlots((current) =>
      current.map((slot, index) =>
        index === slotIndex ? { ...slot, [field]: value } : slot,
      ),
    );
  };

  const setBundleSlotDetailsField = (slotIndex, field, value) => {
    setBundleSlots((current) =>
      current.map((slot, index) =>
        index === slotIndex
          ? {
              ...slot,
              details: {
                ...slot.details,
                [field]: value,
              },
            }
          : slot,
      ),
    );
  };

  const applyDetailsToAllBundleSlots = () => {
    const sourceDetails = activeBundleSlot?.details || form.details;
    setBundleSlots((current) =>
      current.map((slot) => ({
        ...slot,
        details: {
          ...slot.details,
          businessName: sourceDetails.businessName,
          businessCategoryCode: sourceDetails.businessCategoryCode,
          countryIso: accountCountryIso,
          callPhone: sourceDetails.callPhone,
          whatsappPhone: sourceDetails.whatsappPhone,
        },
      })),
    );
  };

  const selectDealerPlanBenefit = (category) => {
    setUseWalletBalance(false);
    setPurchaseMode("BENEFIT");
    setForm((current) => ({
      ...current,
      packageType: "INDIVIDUAL",
      bundleCode: "",
      category,
      durationDays: 30,
    }));
  };

  const selectIndividualPackage = (category, durationDays) => {
    setPurchaseMode("PAID");
    setForm((current) => ({
      ...current,
      packageType: "INDIVIDUAL",
      bundleCode: "",
      category,
      durationDays,
    }));
  };

  const selectBundlePackage = (bundle) => {
    setUseWalletBalance(false);
    setPurchaseMode("PAID");
    setBundleSlots(hydrateBundleSlots({
      bundle,
      draft,
      fallbackDetails: form.details,
    }));
    setActiveBundleSlotIndex(0);
    setForm((current) => ({
      ...current,
      packageType: "BUNDLE",
      bundleCode: bundle.code,
      category: bundle.items?.[0]?.category || current.category,
      durationDays: bundle.baseDurationDays || 30,
    }));
  };

  const validate = () => {
    if (form.packageType === "BUNDLE") {
      if (!form.bundleCode) return "Choose a promotion bundle.";
      if (!selectedBundle) return "Selected promotion bundle is not available.";
      if (!price) return "Pricing is not configured for this package.";
      return "";
    } else if (!form.category) {
      return "Choose advertisement placement.";
    }
    if (!form.name.trim()) return "Advertisement name is required.";
    if (!form.details.businessName.trim()) return "Business name is required.";
    if (!form.details.businessCategoryCode) return "Business category is required.";
    if (callPhoneError) return callPhoneError;
    if (whatsappPhoneError) return whatsappPhoneError;
    if (!isIncludedWithPlan && !isIncludedBundleSlot && !price) {
      return "Pricing is not configured for this package.";
    }
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
      const bundlePayloadSlots = isBundlePackage
        ? bundleSlots.map((slot) => ({
            slotIndex: slot.slotIndex,
            category: slot.category,
            name: slot.name,
            redirectTo: slot.redirectTo,
            details: {
              ...slot.details,
              countryIso: accountCountryIso,
              callPhone: buildPhoneContact(
                accountCountryIso,
                getLocalPhoneDigits(slot.details.callPhone, accountCountryIso),
              ),
              whatsappPhone: buildPhoneContact(
                accountCountryIso,
                getLocalPhoneDigits(slot.details.whatsappPhone, accountCountryIso),
              ),
            },
            creatives: slot.creatives,
            isComplete: isBundleSlotComplete(slot, accountCountryIso),
          }))
        : [];
      const firstCompleteBundleSlot = bundlePayloadSlots.find((slot) => slot.isComplete);
      const parentBundleSlot = isBundlePackage ? firstCompleteBundleSlot : null;
      const payload = {
        ...(isBundlePackage && !parentBundleSlot
          ? {
              ...formWithAccountCountry,
              name: selectedBundle?.name || "Promotion Bundle",
              category: selectedBundle?.items?.[0]?.category || form.category,
              details: {},
              creatives: {},
            }
          : parentBundleSlot
          ? {
              ...formWithAccountCountry,
              name: parentBundleSlot.name || selectedBundle?.name || form.name,
              category: parentBundleSlot.category,
              redirectTo: parentBundleSlot.redirectTo || form.redirectTo,
              details: parentBundleSlot.details,
              creatives: parentBundleSlot.creatives,
            }
          : formWithAccountCountry),
        paymentMethod: isIncludedWithPlan
          ? "card"
          : isIncludedBundleSlot
          ? "card"
          : useWalletBalance
          ? "wallet"
          : form.paymentMethod,
        useWalletBalance: isIncludedWithPlan || isIncludedBundleSlot ? false : useWalletBalance,
        useDealerPlanBenefit: isIncludedBundleSlot ? false : isIncludedWithPlan,
        currentStep: isDraft ? step : wizardSteps.length,
        bundleSlots: bundlePayloadSlots,
      };
      const result = isDraft
        ? await advertisementsApi.saveDraft(payload)
        : form._id
          ? await advertisementsApi.submitDraft(form._id, payload)
          : await advertisementsApi.create(payload);

      if (result?.payment?.redirectUrl) {
        redirectToPaymentUrl(result.payment, {
          advertisementId:
            result?.advertisement?._id || result?.payment?.targetId || form._id || "",
          resumeStep: wizardSteps.length,
        });
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

  const goNext = async () => {
    setError("");

    if (step === wizardSteps.length) {
      onClose?.();
      return;
    }

    if (
      step === 1 &&
      (form.packageType === "BUNDLE" ? !form.bundleCode : !form.category)
    ) {
      setError("Choose an advertisement package.");
      return;
    }

    if (step === 1 && isBundlePackage) {
      setStep(5);
      return;
    }

    if (step === 2) {
      const missing = isBundlePackage
        ? null
        : devices.find(
            (device) => !form.creatives[device.key] && !draft?.creatives?.[device.key]?.url,
          );
      if (missing) {
        setError(
          isBundlePackage
            ? `${missing.label} creative is required for advertisement ${activeBundleSlotIndex + 1}.`
            : `${missing.label} creative is required.`,
        );
        return;
      }
    }

    if (step === 3) {
      if (isBundlePackage) {
        if (!activeBundleSlot?.name?.trim()) {
          setError(`Advertisement ${activeBundleSlotIndex + 1} name is required.`);
          return;
        }
        if (!activeBundleSlot.details?.businessName?.trim()) {
          setError(`Advertisement ${activeBundleSlotIndex + 1} business name is required.`);
          return;
        }
        if (!activeBundleSlot.details?.businessCategoryCode) {
          setError(`Advertisement ${activeBundleSlotIndex + 1} business category is required.`);
          return;
        }
        const slotCallError = validateCountryPhone(
          activeBundleSlot.details?.callPhone,
          accountCountryIso,
          "Call phone number",
        );
        const slotWhatsappError = validateCountryPhone(
          activeBundleSlot.details?.whatsappPhone,
          accountCountryIso,
          "WhatsApp number",
        );
        if (slotCallError) {
          setError(slotCallError);
          return;
        }
        if (slotWhatsappError) {
          setError(slotWhatsappError);
          return;
        }
      } else {
      if (!form.name.trim()) {
        setError("Advertisement name is required.");
        return;
      }
      if (!form.details.businessName.trim()) {
        setError("Business name is required.");
        return;
      }
      if (!form.details.businessCategoryCode) {
        setError("Business category is required.");
        return;
      }
      if (callPhoneError) {
        setError(callPhoneError);
        return;
      }
      if (whatsappPhoneError) {
        setError(whatsappPhoneError);
        return;
      }
      }
    }

    if (step === 4 && !price && !isIncludedWithPlan && !isIncludedBundleSlot) {
      setError("Pricing is not configured for this package.");
      return;
    }

    if (isIncludedBundleSlot && step === 4) {
      await handleSave(false);
      return;
    }

    if (step === 5) {
      await handleSave(false);
      return;
    }

    setStep((current) => Math.min(current + 1, wizardSteps.length));
  };

  const goPrevious = () => {
    setError("");
    setStep((current) => Math.max(current - 1, minimumStep));
  };

  const renderStep = () => {
    if (loading) {
      return (
        <div className="flex min-h-[520px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Choose Advertisement Package
                </h2>
                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Select the placement and duration together. Pricing, bundles, and offer days are visible before you continue.
                </p>
              </div>
              {isLaunchOfferActiveForDuration(promotionSettings.launchOffer, 30) ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 lg:min-w-[260px]">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
                    Launch Offer
                  </p>
                  <p className="mt-1 text-sm font-black text-emerald-900">
                    {promotionSettings.launchOffer?.description || "30 Days + 15 Days FREE"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    Only paid individual 30-day ads. Dealer plan benefits and bundles are excluded.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {availableDealerBenefits.length ? (
            <div className="rounded-[18px] border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-950">
                    Use Dealer Plan Benefit
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    Included advertisements run until your dealer plan expiry date.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  Launch offer does not apply
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {availableDealerBenefits.map(({ placement, plan, status }) => {
                  const active =
                    isIncludedWithPlan &&
                    form.packageType === "INDIVIDUAL" &&
                    form.category === placement.category;

                  return (
                    <button
                      key={placement.category}
                      type="button"
                      onClick={() => selectDealerPlanBenefit(placement.category)}
                      className={`relative rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                        active
                          ? "border-emerald-500 ring-2 ring-emerald-100"
                          : "border-emerald-100 hover:border-emerald-300"
                      }`}
                    >
                      {active ? (
                        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check size={15} strokeWidth={3} />
                        </span>
                      ) : null}
                      <h4 className="pr-8 text-sm font-black text-slate-950">
                        {placement.title}
                      </h4>
                      <p className="mt-1 text-xs font-bold text-emerald-700">
                        {status.remaining} remaining
                      </p>
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">Valid until</span>
                          <span className="text-right font-bold text-slate-950">
                            {formatDate(status.benefit?.subscriptionEndsAt)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">Cost</span>
                          <span className="font-black text-emerald-700">
                            {formatCurrency(0, plan?.currency || selectedCurrency)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  Purchase Additional Advertisement
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Select a paid placement duration. Dealer plan benefits are not shown in this table.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Launch offer applies only to eligible paid ads
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr>
                    <th className="rounded-tl-xl bg-slate-950 px-4 py-3 text-xs font-black uppercase text-white">
                      Advertising Space
                    </th>
                    {durationOptions.map((days) => (
                      <th
                        key={days}
                        className="bg-slate-100 px-3 py-3 text-center text-xs font-black uppercase text-slate-700"
                      >
                        <span>{days} Days</span>
                        {days === 30 ? (
                          <span className="ml-2 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] text-pink-600">
                            Popular
                          </span>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {placementMeta.map((placement) => {
                    const plan = plans.find((item) => item.category === placement.category);

                    return (
                      <tr key={placement.category} className="border-b border-slate-100">
                        <td className="border-b border-slate-100 px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-slate-950">{placement.title}</span>
                            <span className="text-xs font-semibold text-slate-500">
                              {placement.dimensions}
                            </span>
                          </div>
                        </td>
                        {durationOptions.map((days) => {
                          const active =
                            purchaseMode === "PAID" &&
                            form.packageType === "INDIVIDUAL" &&
                            form.category === placement.category &&
                            Number(form.durationDays) === days;
                          const optionPrice = getTierPrice(plan, days);

                          return (
                            <td key={days} className="border-b border-slate-100 p-2 text-center">
                              <button
                                type="button"
                                onClick={() => selectIndividualPackage(placement.category, days)}
                                className={`w-full rounded-xl border px-3 py-2 text-sm font-black transition ${
                                  active
                                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:text-blue-700"
                                }`}
                              >
                                {formatCurrency(optionPrice, plan?.currency || selectedCurrency)}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {promotionSettings.promotionsAvailable && (promotionSettings.bundles || []).length ? (
            <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-950">
                    Promotion Bundles - Save More
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Bundle prices are based on the 30-day advertising package. Launch offer is not applied to bundles.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {(promotionSettings.bundles || [])
                  .filter((bundle) => bundle.status === "ACTIVE" && bundle.isValidForSale)
                  .map((bundle) => {
                    const active = form.packageType === "BUNDLE" && form.bundleCode === bundle.code;

                    return (
                      <button
                        key={bundle.code}
                        type="button"
                        onClick={() => selectBundlePackage(bundle)}
                        className={`relative rounded-2xl border p-4 text-left shadow-sm transition ${
                          active
                            ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md"
                        }`}
                      >
                        {bundle.isBestValue ? (
                          <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black text-white">
                            Best Value
                          </span>
                        ) : null}
                        <h4 className="pr-20 text-sm font-black uppercase text-slate-950">
                          {bundle.name}
                        </h4>
                        <div className="mt-4 space-y-1">
                          {(bundle.items || []).map((item) => (
                            <div key={item.category} className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-600">{item.categoryLabel}</span>
                              <span className="font-black text-slate-900">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 flex items-end justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-400 line-through">
                              {formatCurrency(bundle.originalPrice, bundle.currency || selectedCurrency)}
                            </p>
                            <p className="text-xl font-black text-blue-600">
                              {formatCurrency(bundle.bundlePrice, bundle.currency || selectedCurrency)}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                            Save {formatCurrency(bundle.savings, bundle.currency || selectedCurrency)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    if (step === 2) {
      if (isBundlePackage) {
        return (
          <div>
            <h2 className="text-xl font-black text-slate-950">Upload Bundle Creatives</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Fill creatives for each advertisement included in {selectedBundle?.name}.
            </p>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {bundleSlots.map((slot, index) => {
                const complete = devices.every((device) => hasBundleSlotCreative(slot, device.key));
                return (
                  <button
                    key={slot.slotIndex}
                    type="button"
                    onClick={() => setActiveBundleSlotIndex(index)}
                    className={`shrink-0 rounded-xl border px-4 py-2 text-left text-xs font-bold ${
                      index === activeBundleSlotIndex
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <span className="block">Ad {index + 1}</span>
                    <span className={complete ? "text-emerald-600" : "text-amber-600"}>
                      {slot.categoryLabel} - {complete ? "Creative ready" : "Needs creative"}
                    </span>
                  </button>
                );
              })}
            </div>
            {activeBundleSlot ? (
              <>
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-black text-slate-950">
                    Advertisement {activeBundleSlotIndex + 1}: {activeBundleSlot.categoryLabel}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Upload desktop, tablet, and mobile creatives for this slot.
                  </p>
                </div>
                <div className="mt-5 grid gap-4 xl:grid-cols-3">
                  {devices.map((device) => (
                    <FileUpload
                      key={device.key}
                      label={`${device.label} creative`}
                      file={activeBundleSlot.creatives?.[device.key]}
                      existingUrl={activeBundleSlot.existingCreatives?.[device.key]?.url}
                      onChange={(file) =>
                        setBundleSlotCreative(activeBundleSlotIndex, device.key, file)
                      }
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        );
      }

      return (
        <div>
          <h2 className="text-xl font-black text-slate-950">Upload Your Creative</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Upload the banner image that will be displayed in your chosen placement.
          </p>
          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {devices.map((device) => (
              <FileUpload
                key={device.key}
                label={`${device.label} creative`}
                file={form.creatives[device.key]}
                onChange={(file) => setCreative(device.key, file)}
              />
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ["Use high-resolution vehicle photos", "Minimum 150 DPI for crisp display"],
              ["Include the asking price clearly", "Buyers decide faster when price is visible"],
              ["Add a clear call-to-action", "\"View Listing\" or \"Contact Seller\" works well"],
              ["Keep text minimal and bold", "Large readable text performs significantly better"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-950">{title}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (step === 3) {
      if (isBundlePackage) {
        return (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">Bundle Advertisement Settings</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Complete every included advertisement now, or leave some slots for later.
                </p>
              </div>
              <button
                type="button"
                onClick={applyDetailsToAllBundleSlots}
                disabled={!activeBundleSlot}
                className="h-10 rounded-xl border border-blue-100 px-4 text-xs font-black text-blue-600 disabled:opacity-40"
              >
                Apply Contact To All
              </button>
            </div>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {bundleSlots.map((slot, index) => {
                const missing = getBundleSlotMissingFields(slot, accountCountryIso);
                return (
                  <button
                    key={slot.slotIndex}
                    type="button"
                    onClick={() => setActiveBundleSlotIndex(index)}
                    className={`shrink-0 rounded-xl border px-4 py-2 text-left text-xs font-bold ${
                      index === activeBundleSlotIndex
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <span className="block">Ad {index + 1}</span>
                    <span className={missing.length ? "text-amber-600" : "text-emerald-600"}>
                      {slot.categoryLabel} - {missing.length ? `${missing.length} missing` : "Complete"}
                    </span>
                  </button>
                );
              })}
            </div>
            {activeBundleSlot ? (
              <div className="mt-5 space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-black text-slate-950">
                    Advertisement {activeBundleSlotIndex + 1}: {activeBundleSlot.categoryLabel}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Category is locked from the selected bundle.
                  </p>
                </div>
                <label className="block">
                  <span className="text-sm font-bold text-slate-950">
                    Advertisement Name <span className="text-red-500">*</span>
                  </span>
                  <input
                    value={activeBundleSlot.name}
                    onChange={(event) =>
                      setBundleSlotField(activeBundleSlotIndex, "name", event.target.value)
                    }
                    placeholder="e.g. ABC Auto Care"
                    className="mt-3 h-14 w-full rounded-2xl border border-slate-200 px-5 text-base font-medium text-slate-950 outline-none focus:border-blue-400"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-950">Redirect URL</span>
                  <input
                    value={activeBundleSlot.redirectTo}
                    onChange={(event) =>
                      setBundleSlotField(activeBundleSlotIndex, "redirectTo", event.target.value)
                    }
                    placeholder="https://example.com"
                    className="mt-3 h-14 w-full rounded-2xl border border-slate-200 px-5 text-base font-medium text-slate-950 outline-none focus:border-blue-400"
                  />
                </label>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-950">
                      Business Name <span className="text-red-500">*</span>
                    </span>
                    <input
                      value={activeBundleSlot.details?.businessName || ""}
                      onChange={(event) =>
                        setBundleSlotDetailsField(activeBundleSlotIndex, "businessName", event.target.value)
                      }
                      placeholder="e.g. ABC Auto Care"
                      className="mt-3 h-14 w-full rounded-2xl border border-slate-200 px-5 text-base font-medium text-slate-950 outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-950">
                      Business Category <span className="text-red-500">*</span>
                    </span>
                    <select
                      value={activeBundleSlot.details?.businessCategoryCode || ""}
                      onChange={(event) =>
                        setBundleSlotDetailsField(activeBundleSlotIndex, "businessCategoryCode", event.target.value)
                      }
                      className="mt-3 h-14 w-full rounded-2xl border border-slate-200 px-5 text-base font-medium text-slate-950 outline-none focus:border-blue-400"
                    >
                      <option value="">Select business category</option>
                      {businessCategoryOptions.map((category) => (
                        <option key={category.code} value={category.code}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-950">
                      Call Number <span className="text-red-500">*</span>
                    </span>
                    <div className="mt-3">
                      <LockedCountryPhoneField
                        countryIso={accountCountryIso}
                        error={
                          activeBundleSlot.details?.callPhone
                            ? validateCountryPhone(
                                activeBundleSlot.details.callPhone,
                                accountCountryIso,
                                "Call phone number",
                              )
                            : ""
                        }
                        value={activeBundleSlot.details?.callPhone || ""}
                        onChange={(value) =>
                          setBundleSlotDetailsField(activeBundleSlotIndex, "callPhone", value)
                        }
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-slate-950">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </span>
                    <div className="mt-3">
                      <LockedCountryPhoneField
                        countryIso={accountCountryIso}
                        error={
                          activeBundleSlot.details?.whatsappPhone
                            ? validateCountryPhone(
                                activeBundleSlot.details.whatsappPhone,
                                accountCountryIso,
                                "WhatsApp number",
                              )
                            : ""
                        }
                        value={activeBundleSlot.details?.whatsappPhone || ""}
                        onChange={(value) =>
                          setBundleSlotDetailsField(activeBundleSlotIndex, "whatsappPhone", value)
                        }
                      />
                    </div>
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        );
      }

      return (
        <div>
          <h2 className="text-xl font-black text-slate-950">Advertisement Settings</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Configure the details for your advertisement campaign.
          </p>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-slate-950">
                Advertisement Name <span className="text-red-500">*</span>
              </span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. ABC Auto Care"
                className="mt-3 h-14 w-full rounded-2xl border border-slate-200 px-5 text-base font-medium text-slate-950 outline-none focus:border-blue-400"
              />
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-950">
                  Business Name <span className="text-red-500">*</span>
                </span>
                <input
                  value={form.details.businessName}
                  onChange={(event) => setDetailsField("businessName", event.target.value)}
                  placeholder="e.g. ABC Auto Care"
                  className="mt-3 h-14 w-full rounded-2xl border border-slate-200 px-5 text-base font-medium text-slate-950 outline-none focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-950">
                  Business Category <span className="text-red-500">*</span>
                </span>
                <select
                  value={form.details.businessCategoryCode}
                  onChange={(event) => setDetailsField("businessCategoryCode", event.target.value)}
                  className="mt-3 h-14 w-full rounded-2xl border border-slate-200 px-5 text-base font-medium text-slate-950 outline-none focus:border-blue-400"
                >
                  <option value="">Select business category</option>
                  {businessCategoryOptions.map((category) => (
                    <option key={category.code} value={category.code}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-950">
                  Call Number <span className="text-red-500">*</span>
                </span>
                <div className="mt-3">
                  <LockedCountryPhoneField
                    countryIso={accountCountryIso}
                    error={form.details.callPhone ? callPhoneError : ""}
                    value={form.details.callPhone}
                    onChange={(value) => setDetailsField("callPhone", value)}
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-950">
                  WhatsApp Number <span className="text-red-500">*</span>
                </span>
                <div className="mt-3">
                  <LockedCountryPhoneField
                    countryIso={accountCountryIso}
                    error={form.details.whatsappPhone ? whatsappPhoneError : ""}
                    value={form.details.whatsappPhone}
                    onChange={(value) => setDetailsField("whatsappPhone", value)}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div>
          <h2 className="text-xl font-black text-slate-950">Review Your Advertisement</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {isIncludedBundleSlot
              ? "This advertisement slot is included in your promotion bundle. Submit it for admin review when the details are ready."
              : "Review all details and see exactly how your ad will appear on GulfInCart."}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              [isBundlePackage ? "Bundle" : "Placement", isBundlePackage ? selectedBundle?.name : selectedPlacement.title],
              [
                "Duration",
                isIncludedWithPlan ? "Until plan expiry" : `${launchOfferDuration} Days`,
              ],
              ...(isIncludedWithPlan
                ? [["Valid Until", formatDate(selectedPlanBenefit?.subscriptionEndsAt)]]
                : []),
              ...(isBundlePackage
                ? [
                    ["Filled Ads", `${completedBundleSlots}/${bundleSlots.length}`],
                    ["Remaining Later", incompleteBundleSlots],
                  ]
                : []),
              ...(freeAdditionalDays > 0 ? [["Launch Offer", `+ ${freeAdditionalDays} Days Free`]] : []),
              ["Total", isIncludedBundleSlot ? "Included in bundle" : formatCurrency(total)],
              ...(isIncludedWithPlan ? [["Plan Benefit", `${selectedPlanBenefit.remaining} remaining`]] : []),
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                <p className={`mt-2 font-black ${label === "Total" ? "text-blue-600" : "text-slate-950"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
          {isBundlePackage ? (
            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <h3 className="text-base font-black text-slate-950">Bundle Advertisements</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {bundleSlots.map((slot, index) => {
                  const missing = getBundleSlotMissingFields(slot, accountCountryIso);
                  return (
                    <div key={slot.slotIndex} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-950">
                          Ad {index + 1}: {slot.categoryLabel}
                        </p>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-black ${
                          missing.length ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {missing.length ? "Later" : "Ready"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {slot.name || "Untitled advertisement"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-black text-slate-950">Live Placement Preview</h3>
            <div className="mt-4">
              <PlacementSketch placement={selectedPlacement} />
            </div>
            <p className="mt-2 text-center text-xs font-medium text-slate-400">
              Showing {isBundlePackage ? selectedBundle?.name : selectedPlacement.title} preview
              {isBundlePackage ? "" : ` - ${selectedPlacement.dimensions}`}
            </p>
          </div>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div>
          <h2 className="text-xl font-black text-slate-950">Payment Summary</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Review your order and submit your advertisement for admin review.
          </p>
          <div className="mt-5 rounded-2xl border border-slate-200 p-6">
            <div className="space-y-4 text-sm">
              {[
                ["Advertisement", form.name || selectedPlacement.title],
                [isBundlePackage ? "Bundle" : "Placement", isBundlePackage ? selectedBundle?.name : selectedPlacement.title],
                ["Duration", isIncludedWithPlan ? "Until plan expiry" : `${launchOfferDuration} Days`],
                ...(isIncludedWithPlan
                  ? [["Valid Until", formatDate(selectedPlanBenefit?.subscriptionEndsAt)]]
                  : []),
                ...(freeAdditionalDays > 0 ? [["Launch Offer", `+ ${freeAdditionalDays} Days Free`]] : []),
                ...(isBundlePackage ? [
                  ["Filled Advertisements", `${completedBundleSlots}/${bundleSlots.length}`],
                  ["Can Fill Later", incompleteBundleSlots],
                  ["Original Price", formatCurrency(selectedBundle?.originalPrice, selectedCurrency)],
                  ["Savings", formatCurrency(selectedBundle?.savings, selectedCurrency)],
                ] : []),
                ["Ad Fee", isIncludedWithPlan ? "Included with dealer plan" : formatCurrency(effectivePrice, selectedCurrency)],
                [taxMeta.label, formatCurrency(vat, selectedCurrency)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-right font-bold text-slate-950">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-blue-50 p-5">
              <span className="font-bold text-blue-600">Total</span>
              <span className="text-2xl font-black text-blue-600">{formatCurrency(total)}</span>
            </div>
            {isBundlePackage && incompleteBundleSlots > 0 ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                {incompleteBundleSlots} advertisement{incompleteBundleSlots === 1 ? "" : "s"} will stay available to fill later from Advertising Manager.
              </div>
            ) : null}
            {isIncludedWithPlan ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                This advertisement will use 1 included {selectedPlacement.title} slot from your dealer plan.
              </div>
            ) : (
            <label className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white px-4 py-3">
              <span>
                <span className="block text-sm font-bold text-slate-900">Use wallet balance</span>
                <span className="mt-0.5 block text-xs font-medium text-slate-500">
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
            )}
            {useWalletBalance && !isIncludedWithPlan ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Wallet used</span>
                  <span className="font-bold text-blue-600">- {formatCurrency(walletAmountUsed)}</span>
                </div>
                <div className="mt-2 flex justify-between text-slate-600">
                  <span>Pay remaining</span>
                  <span className="font-bold text-slate-950">{formatCurrency(onlineAmountDue)}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Shield size={30} />
        </span>
        <h2 className="mt-5 text-2xl font-black text-slate-950">Advertisement Submitted</h2>
        <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
          Your advertisement has been submitted for admin review. You can track its status from Advertising Manager.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-3 py-3 sm:px-4">
      <div className="relative flex h-[92vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-[20px] bg-white text-[13px] shadow-2xl sm:h-[90vh]">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 lg:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Megaphone size={18} />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-950">
                {draft ? "Continue Advertisement" : "Create Advertisement"}
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Step {step} of {wizardSteps.length} - {wizardSteps[step - 1]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-3 sm:flex">
              <span className="h-1.5 w-28 rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-blue-600"
                  style={{ width: `${progress}%` }}
                />
              </span>
              <span className="text-xs font-bold text-slate-500">{progress}%</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="Close advertisement wizard"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <WizardProgress step={step} />

        {error ? (
          <div className="border-b border-red-100 bg-red-50 px-8 py-2 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-3 lg:px-5">
            {renderStep()}
          </main>
          {step < wizardSteps.length ? (
            <SummaryPanel
              placement={selectedPlacement}
              durationDays={launchOfferDuration}
              price={effectivePrice}
              isIncludedWithPlan={isIncludedWithPlan}
              currency={selectedCurrency}
              taxMeta={taxMeta}
              packageType={form.packageType}
              selectedBundle={selectedBundle}
              freeAdditionalDays={freeAdditionalDays}
            />
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 lg:px-5">
          <button
            type="button"
            onClick={goPrevious}
            disabled={step <= minimumStep || saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving || step === wizardSteps.length}
            className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-500 disabled:opacity-40 md:inline-flex"
          >
            <FileText size={16} />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={saving || loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
          >
            {saving
              ? "Submitting..."
              : step === 5
              ? "Submit for Review"
              : step === wizardSteps.length
              ? "Go to My Ads"
              : "Next"}
            <ArrowRight size={17} />
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function AdvertisementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalViews: 0,
    totalSpent: 0,
  });
  const [ads, setAds] = useState([]);
  const [planAdBenefits, setPlanAdBenefits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [modalDraft, setModalDraft] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [endAdId, setEndAdId] = useState("");
  const [reasonAd, setReasonAd] = useState(null);
  const [isEndingAd, setIsEndingAd] = useState(false);

  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await advertisementsApi.getSummary();
      setStats(data.stats || {});
      setAds(data.ads || []);
      setPlanAdBenefits(data.planAdBenefits || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertisements();
  }, []);

  useEffect(() => {
    const tapId = searchParams.get("tap_id");
    if (!tapId) return;

    let active = true;

    const verifyPayment = async () => {
      try {
        const payment = await advertisementsApi.verifyTapPayment(tapId);

        if (!active) return;

        if (payment?.status === "CAPTURED") {
          const pendingPayment = getPendingPaymentRedirect();

          setModalDraft({
            _id:
              payment?.targetId ||
              searchParams.get("advertisementId") ||
              pendingPayment?.advertisementId ||
              "",
            currentStep: 6,
            status: "PENDING",
            paymentStatus: "PAID",
          });
          setShowModal(true);
          clearPendingPaymentRedirect();
          await loadAdvertisements();
        } else {
          setError(payment?.failureReason || "Payment was not completed.");
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to verify advertisement payment",
          );
        }
      } finally {
        if (active) {
          setSearchParams({}, { replace: true });
        }
      }
    };

    verifyPayment();

    return () => {
      active = false;
    };
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !ads.length || showModal) return;

    const ad = ads.find((item) => item._id === editId);
    if (ad?.status === "REJECTED") {
      setModalDraft(ad);
      setShowModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [ads, searchParams, setSearchParams, showModal]);

  const visibleAds = useMemo(
    () => ads.filter((ad) => !isPaidBundleSlotDraft(ad)),
    [ads],
  );

  const filteredAds = useMemo(
    () =>
      visibleAds.filter((ad) => {
        const matchesStatus = status === "ALL" || ad.status === status;
        const haystack = [ad.name, ad.advertisementId, ad.categoryLabel, categories[ad.category]]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesStatus && haystack.includes(query.toLowerCase());
      }),
    [query, status, visibleAds],
  );
  const remainingBundleGroups = useMemo(
    () => groupRemainingBundleDrafts(ads),
    [ads],
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

      {remainingBundleGroups.length ? (
        <div className="space-y-3">
          {remainingBundleGroups.map((group) => (
            <div key={group.key} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-amber-900">
                    {group.name}: {group.slots.length} paid advertisement slot{group.slots.length === 1 ? "" : "s"} remaining
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.slots.map((slot) => (
                      <span
                        key={slot._id}
                        className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-amber-800"
                      >
                        {getBundleSlotLabel(slot)}
                        {slot.bundleSlotIndex && slot.bundleSlotTotal
                          ? ` ${slot.bundleSlotIndex}/${slot.bundleSlotTotal}`
                          : ""}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalDraft(group.slots[0]);
                    setShowModal(true);
                  }}
                  className="h-10 shrink-0 rounded-xl bg-amber-600 px-4 text-sm font-black text-white"
                >
                  Complete It
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

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
                    {ad.bundleParentAdvertisement
                      ? `${ad.bundleNameSnapshot || "Promotion Bundle"} - ${
                          ad.bundleSlotLabel ||
                          categories[ad.category] ||
                          ad.categoryLabel ||
                          "Advertisement"
                        }${
                          ad.bundleSlotIndex && ad.bundleSlotTotal
                            ? ` (${ad.bundleSlotIndex}/${ad.bundleSlotTotal})`
                            : ""
                        }`
                      : ad.packageType === "BUNDLE"
                        ? ad.bundleNameSnapshot || "Promotion Bundle"
                        : categories[ad.category] || ad.categoryLabel || "Advertisement"} - {ad.durationDays || 0} days
                    {ad.freeAdditionalDaysSnapshot ? ` + ${ad.freeAdditionalDaysSnapshot} free` : ""}
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
                  ) : ad.status === "REJECTED" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setReasonAd(ad)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
                      >
                        View Reason
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setModalDraft(ad);
                          setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        <Pencil size={15} />
                        Edit & Resubmit
                      </button>
                    </>
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
                  <span>CTR: {formatCtr(ad.clickCount, ad.viewCount)}</span>
                  <span>Call: {(ad.callClickCount || 0).toLocaleString()}</span>
                  <span>WhatsApp: {(ad.whatsappClickCount || 0).toLocaleString()}</span>
                  <span>Starts: {ad.startsAt ? formatDate(ad.startsAt) : "After approval"}</span>
                  <span>Ends: {ad.endsAt ? formatDate(ad.endsAt) : "After approval"}</span>
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
          planAdBenefits={planAdBenefits}
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
      {reasonAd ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-black text-slate-950">Rejection Reason</h2>
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-red-500">Reason</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-red-800">
                {reasonAd.rejectionReason || "-"}
              </p>
              {reasonAd.rejectionRemark ? (
                <>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-red-500">Admin remark</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-red-800">
                    {reasonAd.rejectionRemark}
                  </p>
                </>
              ) : null}
            </div>
            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setReasonAd(null)}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalDraft(reasonAd);
                  setReasonAd(null);
                  setShowModal(true);
                }}
                className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
              >
                Edit & Resubmit
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
