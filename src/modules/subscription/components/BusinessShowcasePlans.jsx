"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Crown,
  ExternalLink,
  Gem,
  Gift,
  Globe,
  Image as ImageIcon,
  Images,
  Layers,
  Link2,
  MapPin,
  Megaphone,
  Share2,
  Star,
  Store,
  Tag,
  Target,
  Trophy,
  Video,
  X,
} from "lucide-react";
import { getDealerPlanFeatures } from "../../dealer/utils/dealerPlanFeatures";
import PlanPriceText from "./PlanPriceText";
import {
  planBodyTextClass,
  planCardTitleClass,
  planChipTextClass,
  planLabelTextClass,
} from "./PlanTypography";

const PLAN_THEMES = [
  {
    key: "pro",
    color: "#3c5068",
    light: "#f1f4f8",
    soft: "#e4e9f0",
    headerIcon: Star,
    title: "PRO PAGE",
    tagline: "Perfect for businesses starting their online journey.",
    insight: "Great start to build your brand presence and get discovered by more buyers.",
    InsightIcon: Target,
  },
  {
    key: "prestige",
    color: "#0d5ef8",
    light: "#eff5ff",
    soft: "#dce9ff",
    headerIcon: Trophy,
    title: "PRESTIGE PAGE",
    tagline: "Grow your brand and attract more customers.",
    insight: "More visibility. More exposure. More enquiries for your business.",
    InsightIcon: Megaphone,
  },
  {
    key: "premium",
    color: "#f98b0e",
    light: "#fff6ea",
    soft: "#ffe9cc",
    headerIcon: Crown,
    title: "PREMIUM PAGE",
    tagline: "Maximum exposure for established businesses and serious sellers.",
    insight: "Maximum visibility. Premium branding. More trust. More sales.",
    InsightIcon: Gem,
  },
];

const FALLBACKS = [
  {
    activeListingCount: 50,
    homepageBanner: 0,
    listingBanner: 0,
    smallAdsSpace: 1,
    websiteLink: false,
    socialMediaLinks: false,
  },
  {
    activeListingCount: 100,
    homepageBanner: 1,
    listingBanner: 1,
    smallAdsSpace: 2,
    websiteLink: true,
    socialMediaLinks: false,
  },
  {
    activeListingCount: 200,
    homepageBanner: 2,
    listingBanner: 1,
    smallAdsSpace: 3,
    websiteLink: true,
    socialMediaLinks: true,
  },
];

const CORE_FEATURES = [
  ["dedicatedBusinessPage", "Dedicated Dealer Page", Store],
  ["logoCoverBusinessDetails", "Company Logo & Cover Banner", ImageIcon],
  ["addressMapBusinessHours", "Business Address, Map & Hours", MapPin],
  ["dealerIdentityBadge", "Dealer Identity Badge", BadgeCheck],
  ["clickableCompanyName", "Clickable Company Name on Every Listing", Link2],
  ["websiteLink", "Website Link", Globe],
  ["socialMediaLinks", "Social Media Links", Share2],
];

const getTier = (plan) => plan?.pricingTiers?.[0] || {};

const getPrice = (plan) =>
  plan?.basePrice ?? getTier(plan).basePrice ?? getTier(plan).price ?? null;

const getFeatureValue = (plan, index, key) => {
  const fallback = FALLBACKS[index] || FALLBACKS.at(-1);
  if (key === "websiteLink" || key === "socialMediaLinks") {
    if (
      plan?.businessFeatures &&
      Object.prototype.hasOwnProperty.call(plan.businessFeatures, key)
    ) {
      return getDealerPlanFeatures(plan)[key];
    }

    if (plan?.features && Object.prototype.hasOwnProperty.call(plan.features, key)) {
      return getDealerPlanFeatures(plan)[key];
    }

    if (Object.prototype.hasOwnProperty.call(plan || {}, key)) {
      return getDealerPlanFeatures(plan)[key];
    }

    return fallback?.[key];
  }

  if (Object.prototype.hasOwnProperty.call(plan || {}, key)) {
    return plan?.[key];
  }

  return plan?.features?.[key] ?? fallback?.[key] ?? 0;
};

const getBusinessFeatureValue = (plan, key) => {
  if (
    plan?.businessFeatures &&
    Object.prototype.hasOwnProperty.call(plan.businessFeatures, key)
  ) {
    return Boolean(plan.businessFeatures[key]);
  }

  if (key === "websiteLink" || key === "socialMediaLinks") {
    return getDealerPlanFeatures(plan)[key];
  }

  return Boolean(plan?.features?.[key] ?? plan?.[key]);
};

const getPlanName = (plan, index) => {
  const rawName = String(plan?.planName || "").trim();
  if (rawName) return rawName.toUpperCase();
  return PLAN_THEMES[index]?.title || "BUSINESS PAGE";
};

const formatPrice = (value, currency = "BHD") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return { currency, amount: "Coming Soon" };
  }

  return {
    currency,
    amount: Number(value || 0).toFixed(3),
  };
};

const FeatureItem = ({ children, enabled = true, icon: Icon }) => (
  <li className={`flex items-start gap-2.5 sm:items-center ${planBodyTextClass}`}>
    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center sm:mt-0">
      {enabled ? (
        <Icon size={14} strokeWidth={2} className="text-slate-800" />
      ) : (
        <X size={11} strokeWidth={3} className="text-red-500" />
      )}
    </span>
    <span>{children}</span>
  </li>
);

const AdBanner = ({ label, size, color = "#0b1549" }) => (
  <div
    className="relative h-[50px] overflow-hidden rounded-[4px] border border-white/40 px-4 py-2.5 text-white shadow-sm"
    style={{
      background:
        `linear-gradient(90deg, ${color} 0%, ${color}dd 45%, ${color}88 100%), url('/images/largead.png') center/cover`,
    }}
  >
    <p className="relative z-10 text-[10px] font-black uppercase leading-none">{label}</p>
    <p className="relative z-10 mt-1.5 text-[8px] font-bold">{size}</p>
  </div>
);

const SmallAd = ({ color }) => (
  <div className="flex min-h-[38px] items-center gap-2 rounded-[4px] border border-slate-200 bg-white px-2 py-1.5">
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-white"
      style={{ backgroundColor: color }}
    >
      <ImageIcon size={12} />
    </span>
    <span className="min-w-0 flex-1 space-y-1">
      <span className="block h-1.5 w-14 max-w-full rounded-full bg-slate-200" />
      <span className="block h-1.5 w-20 max-w-full rounded-full bg-slate-100" />
    </span>
    <span
      className="flex h-7 w-[48px] items-center justify-center rounded-[3px] border border-dashed bg-white text-center text-[7px] font-black leading-[8px]"
      style={{ borderColor: color, color }}
    >
      YOUR
      <br />
      AD HERE
    </span>
  </div>
);

const SectionBox = ({ children, title, color, icon: Icon }) => (
  <div className="rounded-xl bg-[#eef0f3] p-2.5">
    {title ? (
      <p
        className={`mb-2 flex items-center justify-center gap-2 text-center uppercase ${planChipTextClass}`}
        style={{ color: "#475569" }}
      >
        {Icon ? <Icon size={14} className="shrink-0" style={{ color }} /> : null}
        <span>{title}</span>
      </p>
    ) : null}
    {children}
  </div>
);

const AdPreviewGroup = ({ plan, index, color }) => {
  const homepageBanner = Number(getFeatureValue(plan, index, "homepageBanner") || 0);
  const listingBanner = Number(getFeatureValue(plan, index, "listingBanner") || 0);
  const smallAdsSpace = Number(getFeatureValue(plan, index, "smallAdsSpace") || 0);

  return (
    <div className="space-y-2">
      {homepageBanner > 0 ? (
        <SectionBox title={`${homepageBanner} Home PageBanners`} color={color} icon={Layers}>
          <div className="space-y-1.5">
            {Array.from({ length: Math.min(homepageBanner, 2) }).map((_, itemIndex) => (
              <AdBanner
                key={itemIndex}
                label={`Your Home Page Banner ${itemIndex + 1}`}
                size="1400px x 350px"
                color="#431184"
              />
            ))}
          </div>
        </SectionBox>
      ) : null}
      {listingBanner > 0 ? (
        <SectionBox title={`${listingBanner} Listing Page Banner (Top of Listing Page)`} color={color} icon={Layers}>
          <AdBanner label="Your Listing Page Banner" size="1200px x 200px" color="#075766" />
        </SectionBox>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-[1fr_1.15fr]">
        {smallAdsSpace > 0 ? (
          <SectionBox title={`${smallAdsSpace} Small Advertisement Spaces`} color={color} icon={Tag}>
            <div className="space-y-1.5">
              {Array.from({ length: Math.min(smallAdsSpace, 3) }).map((_, itemIndex) => (
                <SmallAd key={itemIndex} color={color} />
              ))}
            </div>
          </SectionBox>
        ) : null}
      </div>
      {homepageBanner + listingBanner + smallAdsSpace <= 0 ? (
        <SectionBox title="No advertisement spaces included" color={color} icon={Layers}>
          <p className={`text-center ${planBodyTextClass}`}>Advertisement spaces are not included in this plan.</p>
        </SectionBox>
      ) : null}
    </div>
  );
};

const AdvantageStrip = () => (
  <div className="mt-4 grid gap-3 rounded-[8px] border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[1.1fr_1.15fr_.85fr_1.25fr]">
    <div className="flex gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#081b83] text-white">
        <Store size={22} />
      </span>
      <div>
        <h3 className={planCardTitleClass}>The Biggest Advantage</h3>
        <p className={`mt-1 ${planBodyTextClass}`}>
          Your listings appear together with individual sellers in search and category pages with your Dealer Identity Badge.
        </p>
      </div>
    </div>

    <div className="rounded-[6px] border border-slate-200 p-2">
      <h3 className={planCardTitleClass}>In Search & Category Pages</h3>
      <div className="mt-2 flex gap-2">
        <img
          src="/images/car1.png"
          alt=""
          className="h-[66px] w-[88px] rounded-[5px] object-cover"
        />
        <div className="flex-1">
          <p className="text-[10px] font-black text-slate-900">Toyota Land Cruiser 2023</p>
          <p className="mt-0.5 text-[10px] font-black text-emerald-600">BHD 18,500</p>
          <p className="mt-1 text-[8px] font-bold text-slate-500">2023 &nbsp; 45,000 km</p>
          <p className="mt-1 text-[9px] font-black text-[#551bd3]">ABC Motors Bahrain</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <div>
        <h3 className={planCardTitleClass}>Click On Company Name</h3>
        <p className={`mt-1 ${planBodyTextClass}`}>
          Takes buyers to your dedicated business page to view all listings and details.
        </p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6b28df] text-white">
        <ExternalLink size={16} />
      </span>
    </div>

    <div className="flex items-center">
      <img
        src="/images/business-page-preview-reference.png"
        alt="Your dedicated business page preview"
        className="h-auto w-full rounded-[5px] object-contain"
      />
    </div>
  </div>
);

const getPlanData = (plan, index) => {
  const theme = PLAN_THEMES[index % PLAN_THEMES.length];
  const activeListings = getFeatureValue(plan, index, "activeListingCount");
  const showroomImages = Number(getFeatureValue(plan, index, "maxPhotos") || 0);
  const tourVideoCount = Number(getFeatureValue(plan, index, "maxVideos") || 0);
  const tourVideo = tourVideoCount > 0;
  const price = formatPrice(getPrice(plan), plan.currency || "BHD");
  return { theme, activeListings, showroomImages, tourVideoCount, tourVideo, price };
};

/* Right side: selectable plan row */
const BusinessPlanRow = ({ plan, index, isViewed, onView }) => {
  const { theme, price } = getPlanData(plan, index);
  const HeaderIcon = theme.headerIcon;
  const darkEnd = `color-mix(in srgb, ${theme.color} 55%, #000)`;

  return (
    <button
      type="button"
      onClick={() => onView(plan._id)}
      aria-pressed={isViewed}
      className="flex w-full flex-1 flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-4 py-4 text-left transition hover:shadow-md sm:flex-nowrap sm:gap-4 sm:px-5 sm:py-5"
      style={
        isViewed
          ? {
              background: `linear-gradient(100deg, ${theme.color} 0%, ${darkEnd} 100%)`,
              borderColor: theme.color,
              boxShadow: `0 8px 20px ${theme.color}40`,
              color: "#fff",
            }
          : {
              background: "#fff",
              borderColor: "#e4eaf2",
              boxShadow: "0 4px 14px rgba(15,23,42,0.07)",
              color: theme.color,
            }
      }
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
        style={
          isViewed
            ? { backgroundColor: "#fff", borderColor: "#fff", color: "#0f172a" }
            : { borderColor: "#475569" }
        }
        aria-hidden="true"
      >
        {isViewed ? (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <HeaderIcon size={20} fill="currentColor" strokeWidth={1.8} className="shrink-0" />
          <span className="min-w-0 break-words text-[18px] font-extrabold uppercase leading-6 tracking-wide sm:truncate sm:text-[24px] sm:leading-7">
            {getPlanName(plan, index)}
          </span>
        </span>
        <span
          className="mt-1 block text-[13px] font-medium leading-5 sm:max-w-[260px]"
          style={{ color: isViewed ? "rgba(255,255,255,0.92)" : "#475569" }}
        >
          {plan.description || plan.tagline || theme.tagline}
        </span>
      </span>

      <span className="w-full shrink-0 pl-9 text-left text-[18px] font-extrabold leading-none sm:w-auto sm:pl-0 sm:text-right sm:text-[22px]">
        {price.amount === "Coming Soon" ? (
          "Coming Soon"
        ) : (
          <>
            {price.currency} {price.amount}
            <span className="text-[13px] font-bold sm:text-[15px]"> /month</span>
          </>
        )}
      </span>
    </button>
  );
};

/* Left side: details of the plan chosen on the right */
const BusinessPlanCard = ({
  plan,
  index,
  isActive,
  isSelected,
  isSelectionLocked,
  isPurchasing,
  onSelect,
  selectedLabel = "Selected",
  lockedLabel = "Unavailable",
}) => {
  const { theme, activeListings, showroomImages, tourVideoCount, tourVideo } =
    getPlanData(plan, index);
  const InsightIcon = theme.InsightIcon;
  const costPerListing =
    Number(activeListings) > 0 && getPrice(plan) !== null && getPrice(plan) !== undefined
      ? Number(getPrice(plan) / Number(activeListings)).toFixed(3)
      : null;
  const disabled = isSelectionLocked || isPurchasing || plan?.isSelectable === false;

  const featureItems = [
    ...CORE_FEATURES.map(([key, feature, icon]) => ({
      key,
      icon,
      text: feature,
      enabled: getBusinessFeatureValue(plan, key),
    })),
    {
      key: "showroomImages",
      icon: Images,
      text:
        showroomImages > 0
          ? `Showroom Images: ${showroomImages}`
          : "Showroom Images: Not included",
      enabled: showroomImages > 0,
    },
    {
      key: "tourVideo",
      icon: Video,
      text: tourVideo ? `Tour Video: ${tourVideoCount}` : "Tour Video: Not included",
      enabled: tourVideo,
    },
  ];
  const enabledItems = featureItems.filter((item) => item.enabled);
  const disabledItems = featureItems.filter((item) => !item.enabled);

  return (
    <article
      className="flex flex-col overflow-hidden rounded-xl bg-white p-4 sm:p-5"
      style={{
        boxShadow: isSelected
          ? `0 0 0 2px ${theme.color}, 0 8px 22px rgba(15,23,42,0.10)`
          : "0 8px 22px rgba(15,23,42,0.10)",
      }}
    >
      <p
        className={`inline-flex w-fit items-center justify-center rounded-full border px-3 py-0.5 ${planChipTextClass}`}
        style={{ borderColor: `${theme.color}30`, color: theme.color, backgroundColor: theme.light }}
      >
        {activeListings || 0} Active Listings
      </p>

      <h4 className={`mt-4 uppercase ${planChipTextClass}`} style={{ color: theme.color }}>
        What You Get
      </h4>
      <ul className="mt-2.5 space-y-3 px-1">
        {enabledItems.map((item) => (
          <FeatureItem key={item.key} icon={item.icon} enabled>
            {item.text}
          </FeatureItem>
        ))}
      </ul>
      {enabledItems.length && disabledItems.length ? (
        <div className="my-3 h-px w-full bg-[#e4eaf2]" />
      ) : null}
      {disabledItems.length ? (
        <ul className={`space-y-3 px-1 ${enabledItems.length ? "" : "mt-2.5"}`}>
          {disabledItems.map((item) => (
            <FeatureItem key={item.key} icon={item.icon} enabled={false}>
              {item.text}
            </FeatureItem>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 h-px w-full bg-[#e4eaf2]" />

      <h4 className={`mb-2.5 mt-3 uppercase ${planChipTextClass}`} style={{ color: theme.color }}>
        Advertising & Promotions
      </h4>
      <AdPreviewGroup plan={plan} index={index} color={theme.color} />

      <div
        className="mt-3 flex min-h-[40px] items-center gap-2 rounded-xl px-3 py-2"
        style={{ backgroundColor: theme.soft }}
      >
        <InsightIcon size={21} className="shrink-0" style={{ color: theme.color }} />
        <p className={planBodyTextClass}>{theme.insight}</p>
      </div>

      <div
        className={`mt-3 rounded-lg border-2 border-slate-400/70 bg-slate-50 py-2 text-center font-bold ${planLabelTextClass}`}
        style={{ borderColor: `${theme.color}99` }}
      >
        Cost per Listing:{" "}
        <PlanPriceText as="span" size="xs" style={{ color: theme.color }}>
          {costPerListing ? `${plan.currency || "BHD"} ${costPerListing}` : "Coming Soon"}
        </PlanPriceText>
      </div>

      <button
        type="button"
        onClick={() => !disabled && onSelect(plan)}
        disabled={disabled}
        className="mt-3 h-10 w-full rounded-lg text-[13px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        style={{ backgroundColor: isActive ? "#059669" : theme.color }}
      >
        {isSelected
          ? selectedLabel
          : isActive
          ? "Active"
          : plan?.isSelectable === false
          ? "Coming Soon"
          : isPurchasing
          ? "Processing..."
          : isSelectionLocked
          ? lockedLabel
          : `Choose ${plan.planName || theme.title}`}
      </button>
    </article>
  );
};

const BusinessShowcasePlans = ({
  plans,
  activePlanIds = [],
  selectedPlanId,
  isSelectionLocked = false,
  purchasingPlanId,
  onSelectPlan,
  selectedLabel,
  lockedLabel,
}) => {
  const launchOfferPlan = plans.find(
    (plan) => plan.launchOfferEnabled && Number(plan.launchOfferFreeMonths || 0) > 0
  );
  const launchOfferLabel = launchOfferPlan?.launchOfferLabel || "Launch Offer";
  const freeMonths = Number(launchOfferPlan?.launchOfferFreeMonths || 0);

  const [viewedPlanId, setViewedPlanId] = useState(
    String(selectedPlanId || plans[0]?._id || "")
  );

  useEffect(() => {
    if (selectedPlanId) setViewedPlanId(String(selectedPlanId));
  }, [selectedPlanId]);

  const foundIndex = plans.findIndex((plan) => String(plan._id) === String(viewedPlanId));
  const viewedIndex = foundIndex >= 0 ? foundIndex : 0;
  const viewedPlan = plans[viewedIndex];

  const planDetails = viewedPlan ? (
    <BusinessPlanCard
      key={viewedPlan._id}
      plan={viewedPlan}
      index={viewedIndex}
      isActive={activePlanIds.map(String).includes(String(viewedPlan._id))}
      isSelected={String(selectedPlanId || "") === String(viewedPlan._id || "")}
      isSelectionLocked={isSelectionLocked}
      isPurchasing={purchasingPlanId === viewedPlan._id}
      onSelect={onSelectPlan}
      selectedLabel={selectedLabel}
      lockedLabel={lockedLabel}
    />
  ) : null;

  return (
    <div>
      <div className="relative mb-6 text-center">
        {launchOfferPlan ? (
          <div className="flex w-full items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3.5 text-left sm:gap-4 sm:px-5 sm:py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:h-10 sm:w-10">
              <Gift size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-extrabold leading-5 text-slate-900 sm:text-[15px]">
                {launchOfferLabel} — Get {freeMonths} {freeMonths === 1 ? "Month" : "Months"} FREE
              </span>
              <span className="mt-0.5 block text-[12px] font-medium leading-5 text-slate-600 sm:text-[13px]">
                Subscribe to any plan today and enjoy your first {freeMonths}{" "}
                {freeMonths === 1 ? "month" : "months"} absolutely FREE. No setup fee. Limited-time launch offer.
              </span>
            </span>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="hidden lg:block">{planDetails}</div>

        <div className="flex flex-col gap-4">
          {plans.map((plan, index) => {
            const isViewed = index === viewedIndex;
            return (
              <div key={plan._id} className="flex flex-1 flex-col gap-3">
                <BusinessPlanRow
                  plan={plan}
                  index={index}
                  isViewed={isViewed}
                  onView={(planId) => setViewedPlanId(String(planId))}
                />
                {isViewed ? <div className="lg:hidden">{planDetails}</div> : null}
              </div>
            );
          })}
        </div>
      </div>

      <AdvantageStrip />
    </div>
  );
};

export default BusinessShowcasePlans;
