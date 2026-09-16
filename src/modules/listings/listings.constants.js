export const LISTING_TABS = [
  {
    key: "all",
    label: "All",
    status: undefined,
  },
  {
    key: "active",
    label: "Active",
    status: "PUBLISHED",
  },
  {
    key: "pending",
    label: "Pending",
    status: "PENDING_REVIEW",
  },
  {
    key: "rejected",
    label: "Rejected",
    status: "REJECTED",
  },
  {
    key: "sold",
    label: "Sold",
    status: "SOLD",
  },
];

export const formatPrice = (price, currency = "BHD") =>
  `${currency} ${Number(price || 0).toLocaleString()}`;

export const RENTAL_PERIODS = [
  { key: "daily", suffix: "day" },
  { key: "weekly", suffix: "week" },
  { key: "monthly", suffix: "month" },
];

export const formatListingPrice = (listing = {}, currency = "BHD") => {
  if (listing.listingType === "RENT") {
    const labels = RENTAL_PERIODS.map(({ key, suffix }) => {
      const price = Number(listing.pricing?.rentalPrices?.[key]);
      return Number.isFinite(price) && price > 0
        ? `${currency} ${price.toLocaleString()} / ${suffix}`
        : null;
    }).filter(Boolean);

    if (labels.length) return labels.join(", ");
  }

  const suffix = listing.listingType === "RENT" ? " / day" : "";
  return `${formatPrice(listing.pricing?.price, currency)}${suffix}`;
};

export const getDaysColorClass = (daysRemaining) => {
  if (daysRemaining === undefined || daysRemaining === null) return "text-slate-600";
  return daysRemaining < 10 ? "text-red-600" : "text-green-600";
};
