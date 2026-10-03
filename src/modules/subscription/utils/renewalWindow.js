const RENEWAL_WINDOW_DAYS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export const formatRenewalDate = (value) => {
  if (!value) return "your current expiry date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "your current expiry date";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const getRenewalAvailability = (subscription, nowValue = Date.now()) => {
  const status = String(subscription?.status || "").toUpperCase();

  if (!subscription || !["ACTIVE", "EXPIRED"].includes(status)) {
    return {
      canRenew: true,
      expiryLabel: formatRenewalDate(subscription?.endDate),
    };
  }

  const endDate = new Date(subscription.endDate);

  if (!subscription.endDate || Number.isNaN(endDate.getTime())) {
    return {
      canRenew: true,
      expiryLabel: formatRenewalDate(subscription?.endDate),
    };
  }

  const daysUntilExpiry = Math.ceil((endDate.getTime() - nowValue) / DAY_MS);

  return {
    canRenew: status === "EXPIRED" || daysUntilExpiry <= RENEWAL_WINDOW_DAYS,
    daysUntilExpiry,
    expiryLabel: formatRenewalDate(subscription.endDate),
  };
};

